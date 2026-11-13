/**
 * Validation and transport of catalog operations (spec 0009).
 *
 * The same validation runs in `api call --dry-run`, in `api call` and in the
 * catalog MCP tools. A request only reaches the documented path of the
 * operation, on the API version it belongs to, with the profile's API key;
 * URLs, methods and credentials can never be replaced by the input.
 */
import { z } from "zod";
import { AppError, error } from "../app/errors.ts";
import type { ClickUpClient, RequestOptions } from "../clickup/client.ts";
import type { Scope } from "../clickup/scope.ts";
import { normalizeSchema, operationShape, type ApiInput, type ApiOperation, type ApiParameter } from "./catalog.ts";

/** Turns a Zod failure into USAGE (2) with the offending paths. */
function usageFromZod(e: unknown): AppError {
  if (e instanceof z.ZodError) {
    const issues = e.issues.map((i) => `${i.path.join(".") || "input"}: ${i.message}`);
    return error.usage(`Invalid input: ${issues.join("; ")}`, { issues });
  }
  return e instanceof AppError ? e : error.usage(e instanceof Error ? e.message : String(e));
}

/** Pinned id for a path or query parameter, by its name. */
function pinnedValue(param: ApiParameter, scope: Scope): string | undefined {
  if (param.in !== "path" && param.in !== "query") return undefined;
  const key = param.name.toLowerCase();
  if (key === "workspace_id" || key === "team_id") return scope.workspaceId;
  if (key === "space_id") return scope.spaceId;
  if (key === "folder_id") return scope.folderId;
  if (key === "list_id") return scope.listId;
  return undefined;
}

/**
 * Parameters (`path:list_id`) that `applyScope` fills for this scope, so the
 * catalog tools can declare them optional.
 */
export function pinnedParams(operation: ApiOperation, scope: Scope): Set<string> {
  return new Set(operation.parameters.filter((p) => pinnedValue(p, scope)).map((p) => `${p.in}:${p.name}`));
}

/**
 * Applies the ids pinned by an MCP server to the parameters the operation
 * declares (`team_id`/`workspace_id`, `space_id`, `folder_id`, `list_id`).
 * A different id passed by the agent raises USAGE.
 */
export function applyScope(operation: ApiOperation, input: ApiInput, scope: Scope): ApiInput {
  const result: ApiInput = structuredClone(input);
  for (const param of operation.parameters) {
    const fixed = pinnedValue(param, scope);
    if (!fixed) continue;
    const values = (result[param.in as "path" | "query"] ??= {});
    if (values[param.name] !== undefined && String(values[param.name]) !== fixed) {
      throw error.usage(`This MCP server is pinned to ${param.name} ${fixed}.`, { parameter: param.name, pinned: fixed });
    }
    values[param.name] = param.in === "query" && ["number", "integer"].includes(param.schema.type) ? Number(fixed) : fixed;
  }
  return result;
}

/** Serializes query values: v2 arrays as in the official examples, Custom Field filters as JSON. */
export function serializeQuery(operation: ApiOperation, values: Record<string, unknown> = {}): Record<string, string | string[]> {
  const result: Record<string, string | string[]> = {};
  for (const [name, value] of Object.entries(values)) {
    if (value === undefined) continue;
    const param = operation.parameters.find((p) => p.in === "query" && p.name === name);
    if (Array.isArray(value)) {
      if (["custom_fields", "custom_field"].includes(name)) result[name] = JSON.stringify(value);
      else if (operation.id === "GetTasks") result[name.endsWith("[]") ? name : `${name}[]`] = value.map(String);
      else if (param?.explode === false)
        result[name] = value.map(String).join(param.style === "spaceDelimited" ? " " : param.style === "pipeDelimited" ? "|" : ",");
      else result[name] = value.map(String);
    } else result[name] = typeof value === "object" ? JSON.stringify(value) : String(value);
  }
  return result;
}

function contentTypeOf(operation: ApiOperation, input: ApiInput): string | undefined {
  const content = operation.request.content ?? {};
  return input.contentType ?? (content["application/json"] ? "application/json" : Object.keys(content)[0]);
}

/**
 * Validates an input against the operation contract, including relations
 * between fields. Raises USAGE (2) with the list of issues.
 */
export function validateApiInput(operation: ApiOperation, input: ApiInput): void {
  try {
    z.strictObject(operationShape(operation)).parse(input);
    for (const [key, value] of Object.entries(input.path ?? {})) {
      if (value === "." || value === "..") throw error.usage(`Invalid path parameter: ${key}.`);
    }
    if (input.query?.custom_task_ids === true && input.query.team_id === undefined) {
      throw error.usage("Custom task ids require query.team_id.");
    }
    const contentType = contentTypeOf(operation, input);
    const content = operation.request.content ?? {};
    if (contentType && input.body !== undefined) {
      z.fromJSONSchema(normalizeSchema(content[contentType]?.schema ?? {}) as never).parse(input.body);
    }
  } catch (e) {
    throw usageFromZod(e);
  }
}

/**
 * Sends one request for the operation and returns the parsed response.
 * Pagination and retries of writes stay explicit: only HTTP 429 is retried
 * by the client.
 */
export async function executeApiOperation(client: ClickUpClient, operation: ApiOperation, input: ApiInput): Promise<unknown> {
  validateApiInput(operation, input);
  const path = operation.path.replace(/\{([^}]+)\}/g, (_match, key: string) => {
    const value = String(input.path?.[key] ?? "");
    if (!value || value === "." || value === "..") throw error.usage(`Invalid path parameter: ${key}.`);
    return encodeURIComponent(value);
  });
  const contentType = contentTypeOf(operation, input);
  const request: RequestOptions = { query: serializeQuery(operation, input.query), authenticated: operation.authenticated };
  if (contentType) {
    if (contentType === "multipart/form-data") {
      const form = new FormData();
      for (const [name, value] of Object.entries((input.body ?? {}) as Record<string, unknown>)) {
        form.append(name, typeof value === "object" ? JSON.stringify(value) : String(value));
      }
      for (const file of input.files ?? []) {
        form.append(file.field, new Blob([Buffer.from(file.contentBase64, "base64")], { type: file.contentType ?? "application/octet-stream" }), file.filename);
      }
      request.rawBody = form;
    } else if (contentType === "application/x-www-form-urlencoded") {
      request.rawBody = new URLSearchParams(
        Object.fromEntries(Object.entries((input.body ?? {}) as Record<string, unknown>).map(([k, v]) => [k, String(v)])),
      ).toString();
      request.headers = { "Content-Type": contentType };
    } else if (input.body !== undefined) request.body = input.body;
  }
  if (input.headers) {
    request.headers = { ...request.headers, ...Object.fromEntries(Object.entries(input.headers).map(([k, v]) => [k, String(v)])) };
  }
  return operation.version === "v3" ? client.requestV3(operation.method, path, request) : client.request(operation.method, path, request);
}
