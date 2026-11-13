/**
 * Generates `src/api/catalog.json` from the official ClickUp OpenAPI files.
 *
 * Reads `api/v2.json`, `api/v3.json` and `api/overrides.json`, resolves the
 * local `$ref` pointers and writes one entry per operation with its stable
 * CLI name (`v2-get-task`), MCP tool name (`clickupfy_api_v2_get_task`),
 * group, effect, parameters and request body. The catalog is frozen in the
 * repository and embedded in the binary; nothing is fetched at runtime.
 *
 * Usage:
 *
 *   bun run scripts/generate-api.ts           # regenerate the catalog
 *   bun run scripts/generate-api.ts --check   # fail when the catalog is stale
 *   bun run scripts/generate-api.ts --fetch   # download the specs first
 *
 * `--fetch --check` fails when the published specs changed upstream.
 */
import { mkdirSync, readFileSync, writeFileSync } from "node:fs";
import { join, resolve } from "node:path";

const root = resolve(import.meta.dir, "..");
const check = process.argv.includes("--check");
const fetchSpecs = process.argv.includes("--fetch");

const SOURCES = {
  v2: "https://developer.clickup.com/openapi/clickup-api-v2-reference.json",
  v3: "https://developer.clickup.com/openapi/ClickUp_PUBLIC_API_V3.yaml",
} as const;
const METHODS = ["get", "post", "put", "patch", "delete", "head", "options"];

type Json = any;

const overrides = JSON.parse(readFileSync(join(root, "api", "overrides.json"), "utf8")) as {
  queryObjectFilters: string[];
  nullableTaskDates: string[];
};

/** Resolves local references, including JSON Pointers with escaped slashes. */
function dereference(value: Json, spec: Json, chain: string[] = []): Json {
  if (Array.isArray(value)) return value.map((item) => dereference(item, spec, chain));
  if (!value || typeof value !== "object") return value;
  if (typeof value.$ref === "string") {
    const ref = value.$ref as string;
    if (!ref.startsWith("#/")) throw new Error(`External reference: ${ref}`);
    if (chain.includes(ref)) throw new Error(`Circular reference: ${ref}`);
    const target = ref
      .slice(2)
      .split("/")
      .reduce((obj: Json, key) => obj?.[key.replaceAll("~1", "/").replaceAll("~0", "~")], spec);
    if (!target) throw new Error(`Missing reference: ${ref}`);
    const { $ref: _ignored, ...rest } = value;
    return dereference({ ...target, ...rest }, spec, [...chain, ref]);
  }
  return Object.fromEntries(Object.entries(value).map(([key, item]) => [key, dereference(item, spec, chain)]));
}

/** Stable kebab-case name accepted by the CLI and, with underscores, by MCP. */
function slug(value: string): string {
  return value
    .replace(/([a-z0-9])([A-Z])/g, "$1-$2")
    .replace(/[^a-zA-Z0-9]+/g, "-")
    .replace(/^-|-$/g, "")
    .toLowerCase();
}

const operations: Json[] = [];
const provenance: Json[] = [];

for (const [version, url] of Object.entries(SOURCES)) {
  const file = join(root, "api", `${version}.json`);
  if (fetchSpecs) {
    const response = await fetch(url);
    if (!response.ok) throw new Error(`HTTP ${response.status}: ${url}`);
    const next = await response.json();
    if (check) {
      if (JSON.stringify(next) !== JSON.stringify(JSON.parse(readFileSync(file, "utf8")))) {
        throw new Error(`The ${version} specification changed upstream.`);
      }
    } else writeFileSync(file, `${JSON.stringify(next)}\n`);
  }
  const raw = readFileSync(file, "utf8");
  const spec = JSON.parse(raw);
  provenance.push({ version, url, sha256: new Bun.CryptoHasher("sha256").update(raw).digest("hex") });

  for (const [path, item] of Object.entries<Json>(spec.paths)) {
    for (const method of METHODS) {
      const operation = item[method];
      if (!operation) continue;
      if (!operation.operationId) throw new Error(`Missing operationId: ${method} ${path}`);
      const request = dereference(operation.requestBody ?? {}, spec);
      const parameters = new Map<string, Json>();
      for (const rawParam of [...(item.parameters ?? []), ...(operation.parameters ?? [])]) {
        const parameter = dereference(rawParam, spec);
        parameters.set(`${parameter.in}:${parameter.name}`, parameter);
      }
      if (overrides.queryObjectFilters.includes(operation.operationId)) {
        for (const parameter of parameters.values()) {
          if (parameter.in === "query" && ["custom_fields", "custom_field"].includes(parameter.name)) {
            parameter.schema.items = { anyOf: [{ type: "string" }, { type: "object", additionalProperties: true }] };
          }
        }
      }
      if (operation.operationId === "UpdateTask") {
        const properties = request.content["application/json"].schema.properties;
        for (const field of overrides.nullableTaskDates) properties[field] = { anyOf: [properties[field], { type: "null" }] };
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
        readOnly: ["get", "head", "options"].includes(method) || operation.operationId === "queryAuditLog",
        deprecated: operation.deprecated === true,
        authenticated: !(Array.isArray(operation.security) && operation.security.length === 0),
        parameters: [...parameters.values()],
        request,
        documentation: `https://developer.clickup.com/reference/${operation.operationId.toLowerCase()}`,
      });
    }
  }
}

for (const field of ["cli", "tool"]) {
  if (new Set(operations.map((o) => o[field])).size !== operations.length) throw new Error(`Name collision in ${field}.`);
}

const output = `${JSON.stringify({ sources: provenance, operations }, null, 2)}\n`;
const target = join(root, "src", "api", "catalog.json");
if (check) {
  let current = "";
  try {
    current = readFileSync(target, "utf8");
  } catch {
    // A missing catalog counts as stale.
  }
  if (current !== output) {
    console.error("✗ src/api/catalog.json is stale. Run bun run api:generate.");
    process.exit(1);
  }
} else {
  mkdirSync(join(root, "src", "api"), { recursive: true });
  writeFileSync(target, output);
}
const v2 = operations.filter((o) => o.version === "v2").length;
console.log(`${check ? "✓ " : ""}${operations.length} operations: ${v2} v2, ${operations.length - v2} v3.`);
