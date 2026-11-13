/** Catálogo oficial congelado: identificadores, contratos de entrada e escopo de cada operação. */
import { z } from "zod";
import generated from "./catalog.json" with { type: "json" };

/** JSON Schema do fornecedor, com campos opcionais conforme a versão OpenAPI. */
export type Schema = Record<string, any>;
export interface Parameter {
  name: string;
  in: string;
  required?: boolean;
  style?: string;
  explode?: boolean;
  schema: Schema;
}
export interface Operation {
  id: string;
  version: "v2" | "v3";
  method: string;
  path: string;
  cli: string;
  tool: string;
  group: string;
  readOnly: boolean;
  deprecated: boolean;
  authenticated: boolean;
  parameters: Parameter[];
  request: {
    required?: boolean;
    content?: Record<string, { schema?: Schema }>;
  };
  documentation: string;
}
export const operations = generated.operations as Operation[];
export const sources = generated.sources;

/** Localiza uma operação sem aceitar URLs ou métodos arbitrários. */
export function findOperation(id: string): Operation {
  const result = operations.find(
    (item) => item.id === id || item.cli === id || item.tool === id,
  );
  if (!result) throw new Error(`Operação desconhecida: ${id}. Use api list.`);
  return result;
}

/** Converte nullable de OpenAPI 3.0 e conserva campos adicionais permitidos pela API. */
export function normalizeSchema(schema: Schema): Schema {
  const result: Schema = { ...schema };
  // A especificação contém descrições em inglês; a interface mantém nomes técnicos
  // e apresenta instruções em pt-BR. O original continua nos arquivos api/v*.json.
  delete result.description;
  delete result.example;
  delete result.examples;
  delete result.default;
  if (result.properties) {
    result.type ??= "object";
    result.properties = Object.fromEntries(
      Object.entries(result.properties).map(([k, v]) => [
        k,
        normalizeSchema(v as Schema),
      ]),
    );
  }
  if (result.items) result.items = normalizeSchema(result.items);
  for (const key of ["anyOf", "oneOf", "allOf"]) {
    if (Array.isArray(result[key]))
      result[key] = result[key].map(normalizeSchema);
  }
  if (
    result.additionalProperties &&
    typeof result.additionalProperties === "object"
  ) {
    result.additionalProperties = normalizeSchema(result.additionalProperties);
  }
  if (result.nullable) {
    delete result.nullable;
    return { anyOf: [result, { type: "null" }] };
  }
  return result;
}

/** Arquivos via MCP são dados explícitos; nenhum caminho local é aberto pelo servidor. */
export const fileSchema = z.object({
  field: z
    .string()
    .min(1)
    .describe("Campo multipart, como attachment ou attachment[0]."),
  filename: z.string().min(1),
  contentBase64: z
    .string()
    .regex(/^(?:[A-Za-z0-9+/]{4})*(?:[A-Za-z0-9+/]{2}==|[A-Za-z0-9+/]{3}=)?$/),
  contentType: z.string().optional(),
});
export interface ApiInput {
  path?: Record<string, unknown>;
  query?: Record<string, unknown>;
  headers?: Record<string, unknown>;
  body?: unknown;
  contentType?: string;
  files?: z.infer<typeof fileSchema>[];
  confirm?: boolean;
}

/** Gera schemas por endpoint; campos de caminho aceitam IDs numéricos como strings. */
export function operationShape(
  operation: Operation,
): Record<string, z.ZodType> {
  const shape: Record<string, z.ZodType> = {};
  for (const location of ["path", "query", "header"]) {
    const fields: Record<string, z.ZodType> = {};
    let required = false;
    for (const param of operation.parameters.filter((p) => p.in === location)) {
      // Content-Type é escolhido pelo transporte a partir dos formatos documentados.
      if (location === "header" && param.name.toLowerCase() === "content-type")
        continue;
      let field: z.ZodType = z.fromJSONSchema(normalizeSchema(param.schema));
      if (location === "path") {
        if (["number", "integer"].includes(param.schema.type))
          field = z.union([field, z.string().regex(/^\d+$/)]);
        if (param.schema.type === "string")
          field = field.refine(
            (value) => typeof value === "string" && value.trim().length > 0,
            "Informe um valor não vazio.",
          );
      }
      fields[param.name] = param.required ? field : field.optional();
      required ||= param.required === true;
    }
    if (Object.keys(fields).length) {
      const object = z.strictObject(fields);
      shape[location === "header" ? "headers" : location] = required
        ? object
        : object.optional();
    }
  }
  const content = operation.request.content ?? {};
  const types = Object.keys(content);
  if (types.length) {
    const schemas = types.map((type) =>
      z.fromJSONSchema(normalizeSchema(content[type]?.schema ?? {})),
    );
    const body =
      schemas.length === 1
        ? schemas[0]!
        : z.union(schemas as [z.ZodType, z.ZodType, ...z.ZodType[]]);
    shape.body =
      operation.request.required && !types.includes("multipart/form-data")
        ? body
        : body.optional();
    shape.contentType = z.enum(types as [string, ...string[]]).optional();
  }
  if (types.includes("multipart/form-data"))
    shape.files = z.array(fileSchema).min(1);
  if (operation.method === "DELETE")
    shape.confirm = z
      .literal(true)
      .describe("Confirma a exclusão ou remoção solicitada.");
  return shape;
}
