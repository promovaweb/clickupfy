/** Validação e transporte das operações públicas, sem substituição de URLs ou credenciais. */
import { z } from "zod";
import { ClickUpClient } from "../clickup.js";
import {
  operationShape,
  normalizeSchema,
  type ApiInput,
  type Operation,
} from "./catalog.js";

/** Escopo fixado pelo MCP. IDs fora do caminho/query não garantem pertencimento hierárquico. */
export interface ApiScope {
  workspaceId?: string;
  spaceId?: string;
  folderId?: string;
  listId?: string;
}

/** Aplica somente os IDs declarados pelo endpoint, preservando a grafia do fornecedor. */
export function applyScope(
  operation: Operation,
  input: ApiInput,
  scope: ApiScope,
): ApiInput {
  const result: ApiInput = structuredClone(input);
  for (const param of operation.parameters) {
    if (param.in !== "path" && param.in !== "query") continue;
    const key = param.name.toLowerCase();
    const fixed =
      key === "workspace_id" || key === "team_id"
        ? scope.workspaceId
        : key === "space_id"
          ? scope.spaceId
          : key === "folder_id"
            ? scope.folderId
            : key === "list_id"
              ? scope.listId
              : undefined;
    if (!fixed) continue;
    const values = (result[param.in] ??= {});
    if (
      values[param.name] !== undefined &&
      String(values[param.name]) !== fixed
    ) {
      throw new Error(`Este MCP está fixado em ${param.name} ${fixed}.`);
    }
    // Caminho numérico também aceita string. Query mantém o tipo declarado.
    values[param.name] =
      param.in === "query" && ["number", "integer"].includes(param.schema.type)
        ? Number(fixed)
        : fixed;
  }
  return result;
}

/** Serializa arrays v2 conforme os exemplos oficiais e filtros de Custom Fields como JSON. */
export function serializeQuery(
  operation: Operation,
  values: Record<string, unknown> = {},
): Record<string, string | string[]> {
  const result: Record<string, string | string[]> = {};
  for (const [name, value] of Object.entries(values)) {
    if (value === undefined) continue;
    const param = operation.parameters.find(
      (p) => p.in === "query" && p.name === name,
    );
    if (Array.isArray(value)) {
      if (["custom_fields", "custom_field"].includes(name))
        result[name] = JSON.stringify(value);
      else if (operation.id === "GetTasks")
        result[name.endsWith("[]") ? name : `${name}[]`] = value.map(String);
      else if (param?.explode === false)
        result[name] = value
          .map(String)
          .join(
            param.style === "spaceDelimited"
              ? " "
              : param.style === "pipeDelimited"
                ? "|"
                : ",",
          );
      else result[name] = value.map(String);
    } else
      result[name] =
        typeof value === "object" ? JSON.stringify(value) : String(value);
  }
  return result;
}

/** Usa a mesma validação no dry-run e no envio, inclusive relações entre campos. */
export function validateOperationInput(
  operation: Operation,
  input: ApiInput,
): void {
  z.strictObject(operationShape(operation)).parse(input);
  for (const [key, value] of Object.entries(input.path ?? {})) {
    if (value === "." || value === "..")
      throw new Error(`Parâmetro de caminho inválido: ${key}.`);
  }
  if (
    input.query?.custom_task_ids === true &&
    input.query.team_id === undefined
  )
    throw new Error("IDs personalizados exigem query.team_id.");
  const content = operation.request.content ?? {};
  const contentType =
    input.contentType ??
    (content["application/json"]
      ? "application/json"
      : Object.keys(content)[0]);
  if (contentType && input.body !== undefined)
    z.fromJSONSchema(normalizeSchema(content[contentType]?.schema ?? {})).parse(
      input.body,
    );
}

/** Executa uma única requisição. Paginação e retentativas de escrita permanecem explícitas. */
export async function executeOperation(
  client: ClickUpClient,
  operation: Operation,
  input: ApiInput,
): Promise<unknown> {
  validateOperationInput(operation, input);
  const path = operation.path.replace(/\{([^}]+)\}/g, (_match, key: string) => {
    const value = String(input.path?.[key] ?? "");
    if (!value || value === "." || value === "..")
      throw new Error(`Parâmetro de caminho inválido: ${key}.`);
    return encodeURIComponent(value);
  });
  const content = operation.request.content ?? {};
  const contentType =
    input.contentType ??
    (content["application/json"]
      ? "application/json"
      : Object.keys(content)[0]);
  const request: Parameters<ClickUpClient["request"]>[2] = {
    query: serializeQuery(operation, input.query),
    authenticated: operation.authenticated,
  };
  if (contentType) {
    if (contentType === "multipart/form-data") {
      const form = new FormData();
      for (const [name, value] of Object.entries(
        (input.body ?? {}) as Record<string, unknown>,
      )) {
        form.append(
          name,
          typeof value === "object" ? JSON.stringify(value) : String(value),
        );
      }
      for (const file of input.files ?? []) {
        form.append(
          file.field,
          new Blob([Buffer.from(file.contentBase64, "base64")], {
            type: file.contentType ?? "application/octet-stream",
          }),
          file.filename,
        );
      }
      request.rawBody = form;
    } else if (contentType === "application/x-www-form-urlencoded") {
      request.rawBody = new URLSearchParams(
        Object.fromEntries(
          Object.entries((input.body ?? {}) as Record<string, unknown>).map(
            ([k, v]) => [k, String(v)],
          ),
        ),
      );
      request.headers = { "Content-Type": contentType };
    } else if (input.body !== undefined) request.body = input.body;
  }
  if (input.headers)
    request.headers = {
      ...request.headers,
      ...Object.fromEntries(
        Object.entries(input.headers).map(([k, v]) => [k, String(v)]),
      ),
    };
  return operation.version === "v3"
    ? client.requestV3(operation.method, path, request)
    : client.request(operation.method, path, request);
}
