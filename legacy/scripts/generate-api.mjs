/** Gera o catálogo executável a partir das especificações oficiais versionadas. */
import { readFile, writeFile, mkdir } from "node:fs/promises";
import { createHash } from "node:crypto";
import { resolve, dirname } from "node:path";
import { fileURLToPath } from "node:url";
const root = resolve(dirname(fileURLToPath(import.meta.url)), "..");
const check = process.argv.includes("--check");
const sources = {
  v2: "https://developer.clickup.com/openapi/clickup-api-v2-reference.json",
  v3: "https://developer.clickup.com/openapi/ClickUp_PUBLIC_API_V3.yaml",
};
const methods = ["get", "post", "put", "patch", "delete", "head", "options"];
const overrides = JSON.parse(
  await readFile(resolve(root, "api/overrides.json"), "utf8"),
);
const operations = [];
const provenance = [];

/** Resolve referências locais, inclusive JSON Pointer com barras escapadas. */
function dereference(value, spec, chain = []) {
  if (Array.isArray(value))
    return value.map((item) => dereference(item, spec, chain));
  if (!value || typeof value !== "object") return value;
  if (value.$ref) {
    if (!value.$ref.startsWith("#/"))
      throw new Error(`Referência externa: ${value.$ref}`);
    if (chain.includes(value.$ref))
      throw new Error(`Referência circular: ${value.$ref}`);
    const target = value.$ref
      .slice(2)
      .split("/")
      .reduce(
        (obj, key) => obj?.[key.replaceAll("~1", "/").replaceAll("~0", "~")],
        spec,
      );
    if (!target) throw new Error(`Referência ausente: ${value.$ref}`);
    const { $ref, ...rest } = value;
    return dereference({ ...target, ...rest }, spec, [...chain, $ref]);
  }
  return Object.fromEntries(
    Object.entries(value).map(([key, item]) => [
      key,
      dereference(item, spec, chain),
    ]),
  );
}

/** Nomes estáveis aceitos por Commander e pelo protocolo MCP. */
function slug(value) {
  return value
    .replace(/([a-z0-9])([A-Z])/g, "$1-$2")
    .replace(/[^a-zA-Z0-9]+/g, "-")
    .replace(/^-|-$/g, "")
    .toLowerCase();
}

for (const [version, url] of Object.entries(sources)) {
  const path = resolve(root, "api", `${version}.json`);
  if (process.argv.includes("--fetch")) {
    const response = await fetch(url);
    if (!response.ok) throw new Error(`HTTP ${response.status}: ${url}`);
    const next = await response.json();
    if (check) {
      if (
        JSON.stringify(next) !==
        JSON.stringify(JSON.parse(await readFile(path, "utf8")))
      )
        throw new Error(`A especificação ${version} mudou na origem.`);
    } else await writeFile(path, JSON.stringify(next) + "\n");
  }
  const raw = await readFile(path, "utf8");
  const spec = JSON.parse(raw);
  provenance.push({
    version,
    url,
    sha256: createHash("sha256").update(raw).digest("hex"),
  });
  for (const [path, item] of Object.entries(spec.paths))
    for (const method of methods) {
      const operation = item[method];
      if (!operation) continue;
      if (!operation.operationId)
        throw new Error(`operationId ausente: ${method} ${path}`);
      const request = dereference(operation.requestBody ?? {}, spec);
      const parameters = new Map();
      for (const rawParam of [
        ...(item.parameters ?? []),
        ...(operation.parameters ?? []),
      ]) {
        const parameter = dereference(rawParam, spec);
        parameters.set(`${parameter.in}:${parameter.name}`, parameter);
      }
      if (overrides.queryObjectFilters.includes(operation.operationId)) {
        for (const parameter of parameters.values()) {
          if (
            parameter.in === "query" &&
            ["custom_fields", "custom_field"].includes(parameter.name)
          ) {
            parameter.schema.items = {
              anyOf: [
                { type: "string" },
                { type: "object", additionalProperties: true },
              ],
            };
          }
        }
      }
      if (operation.operationId === "UpdateTask") {
        for (const field of overrides.nullableTaskDates) {
          const properties =
            request.content["application/json"].schema.properties;
          properties[field] = { anyOf: [properties[field], { type: "null" }] };
        }
      }
      const name = slug(operation.operationId);
      operations.push({
        id: operation.operationId,
        version,
        method: method.toUpperCase(),
        path: path.replace(/^\/(?:api\/)?v[23]/, ""),
        cli: `${version}-${name}`,
        tool: `clickupfy_api_${version}_${name.replaceAll("-", "_")}`,
        group: operation.tags?.[0] ?? "API",
        readOnly:
          ["get", "head", "options"].includes(method) ||
          operation.operationId === "queryAuditLog",
        deprecated: operation.deprecated === true,
        authenticated: !(operation.security?.length === 0),
        parameters: [...parameters.values()],
        request,
        documentation: `https://developer.clickup.com/reference/${operation.operationId.toLowerCase()}`,
      });
    }
}
for (const field of ["cli", "tool"])
  if (new Set(operations.map((o) => o[field])).size !== operations.length)
    throw new Error(`Colisão: ${field}`);
const output =
  JSON.stringify({ sources: provenance, operations }, null, 2) + "\n";
await mkdir(resolve(root, "src/api"), { recursive: true });
const target = resolve(root, "src/api/catalog.json");
if (check) {
  if ((await readFile(target, "utf8")) !== output)
    throw new Error("Catálogo divergente. Execute npm run api:generate.");
} else await writeFile(target, output);
console.log(
  `${operations.length} operações: ${operations.filter((o) => o.version === "v2").length} v2, ${operations.filter((o) => o.version === "v3").length} v3.`,
);
