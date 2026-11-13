/** Exemplos sintéticos de entrada para documentação e testes, sem credenciais reais. */
import {
  normalizeSchema,
  type Operation,
  type Schema,
  type ApiInput,
} from "./catalog.js";

/** Produz um exemplo mínimo usando tipos e restrições declarados pelo fornecedor. */
export function schemaExample(schema: Schema, index = 0): unknown {
  const s = normalizeSchema(schema);
  if (s.const !== undefined) return s.const;
  if (s.enum?.length) return s.enum[index % s.enum.length];
  const branch = s.oneOf ?? s.anyOf;
  if (branch?.length)
    return schemaExample(
      branch.find((item: Schema) => item.type !== "null") ?? branch[0],
      index,
    );
  if (s.allOf)
    return Object.assign(
      {},
      ...s.allOf.map((item: Schema) => schemaExample(item, index)),
    );
  if (Array.isArray(s.type))
    return schemaExample(
      { ...s, type: s.type.find((t: string) => t !== "null") },
      index,
    );
  if (s.type === "object" || s.properties) {
    return Object.fromEntries(
      (s.required ?? []).map((key: string) => [
        key,
        schemaExample(s.properties?.[key] ?? {}, index),
      ]),
    );
  }
  if (s.type === "array")
    return Array.from({ length: Math.max(s.minItems ?? 0, 1) }, () =>
      schemaExample(s.items ?? {}, index),
    );
  if (s.type === "boolean") return index % 2 === 0;
  if (s.type === "number" || s.type === "integer")
    return Math.min(
      s.maximum ?? Infinity,
      Math.max(s.minimum ?? 1, (s.exclusiveMinimum ?? 0) + 1),
    );
  if (s.type === "null") return null;
  if (s.format === "email") return "pessoa@example.com";
  if (s.format === "uuid") return "123e4567-e89b-42d3-a456-426614174000";
  if (s.format === "date-time") return "2026-10-25T12:00:00Z";
  if (s.format === "date") return "2026-10-25";
  if (s.format === "uri" || s.format === "url")
    return "https://example.com/recurso";
  if (s.type === "string")
    return `exemplo-${index + 1}`
      .slice(0, s.maxLength ?? Infinity)
      .padEnd(s.minLength ?? 0, "a");
  return {};
}

/** IDs e nomes são fictícios. O exemplo não afirma existência ou permissão na conta. */
export function operationExample(operation: Operation, index = 0): ApiInput {
  const result: ApiInput = {};
  for (const parameter of operation.parameters) {
    if (!parameter.required || parameter.in === "header") continue;
    if (parameter.in !== "path" && parameter.in !== "query") continue;
    (result[parameter.in] ??= {})[parameter.name] = schemaExample(
      parameter.schema,
      index,
    );
  }
  const content = operation.request.content ?? {};
  const type = content["application/json"]
    ? "application/json"
    : Object.keys(content)[0];
  if (type && operation.request.required)
    result.body = schemaExample(content[type]?.schema ?? {}, index);
  if (type === "multipart/form-data") {
    result.files = [
      {
        field: operation.version === "v2" ? "attachment[0]" : "attachment",
        filename: `exemplo-${index + 1}.txt`,
        contentBase64: "dGVzdGU=",
        contentType: "text/plain",
      },
    ];
  }
  if (operation.method === "DELETE") result.confirm = true;
  return result;
}
