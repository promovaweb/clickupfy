/**
 * `api` command: generic access to the public ClickUp API catalog (spec 0009).
 *
 * - `api list` lists the operations of `src/api/catalog.json`, with method,
 *   path, version, group, effect and the MCP tool name.
 * - `api describe <operation>` shows parameters, body formats and the JSON
 *   Schema of the input.
 * - `api call <operation>` validates the input and sends one request to the
 *   documented path of the operation, with the profile's API key.
 *
 * `<operation>` accepts the operationId (`GetTask`), the CLI name
 * (`v2-get-task`) or the tool name (`clickupfy_api_v2_get_task`). The
 * ClickUpfy 0.9.0 form `api v2-get-task ...` keeps working through hidden
 * subcommands that run `api call` with the operation fixed.
 */
import { readFileSync } from "node:fs";
import { basename } from "node:path";
import { classifyFsError, error } from "../../app/errors.ts";
import { ExitCode } from "../../app/exit-codes.ts";
import { manifest } from "../../app/manifest.ts";
import { apiOperations, apiSources, findApiOperation, operationInputSchema, type ApiInput, type ApiOperation } from "../../api/catalog.ts";
import { executeApiOperation, validateApiInput } from "../../api/execute.ts";
import { connect } from "../../clickup/accounts.ts";
import { ClickUpClient } from "../../clickup/client.ts";
import { renderRows } from "../../operations/render.ts";
import { confirm, readStdin } from "../input.ts";
import { repeatedValues, type Command, type Context, type OptionDefinition } from "../registry.ts";

const bin = manifest.bin;

const callOptions: OptionDefinition[] = [
  { name: "--path", argument: { name: "json" }, description: "Path parameters as a JSON object." },
  { name: "--query", argument: { name: "json" }, description: "Query parameters as a JSON object." },
  { name: "--body", argument: { name: "json" }, description: "Request body as JSON." },
  { name: "--body-file", argument: { name: "file" }, description: "JSON file with the request body." },
  { name: "--input", argument: { name: "file" }, description: "JSON envelope with path, query, headers, body, contentType and files; use - to read stdin." },
  { name: "--content-type", argument: { name: "type" }, description: "Documented format of the body, when the operation accepts more than one." },
  { name: "--file", argument: { name: "field=path" }, repeatable: true, description: "Multipart file, read and sent as the given field. Repeatable." },
  { name: "--yes", description: "Confirm a deletion or removal without a prompt. Required off a TTY." },
  { name: "--dry-run", description: "Validate the input without sending the request." },
];

const callExitCodes = [ExitCode.CONFIG, ExitCode.CREDENTIALS, ExitCode.NETWORK_OR_API, ExitCode.NOT_FOUND, ExitCode.INTERRUPTED] as const;

function parseJson(text: string, label: string): unknown {
  try {
    return JSON.parse(text.replace(/^﻿/, ""));
  } catch {
    throw error.usage(`Invalid JSON in ${label}.`, { option: label });
  }
}

function readText(path: string, label: string): string {
  try {
    return readFileSync(path, "utf8");
  } catch (e) {
    throw classifyFsError(e, ExitCode.NOT_FOUND, `Could not read ${label} ${path}`);
  }
}

function summary(o: ApiOperation) {
  const { id, cli, tool, method, path, version, group, readOnly, deprecated } = o;
  return { id, cli, tool, method, path, version, group, readOnly, deprecated };
}

/** Builds the input envelope of `api call` from the options. */
async function buildInput(ctx: Context): Promise<ApiInput> {
  const o = ctx.options;
  const str = (key: string) => (typeof o[key] === "string" ? (o[key] as string) : undefined);
  let data: ApiInput = {};
  const inputPath = str("input");
  if (inputPath) {
    const raw = parseJson(inputPath === "-" ? await readStdin() : readText(inputPath, "--input"), inputPath === "-" ? "stdin" : "--input");
    if (!raw || typeof raw !== "object" || Array.isArray(raw)) throw error.usage("--input requires a JSON object.");
    data = raw as ApiInput;
  }
  if (str("body") !== undefined && str("body-file") !== undefined) throw error.usage("Use --body or --body-file, not both.");
  for (const field of ["path", "query", "body"] as const) {
    const value = str(field);
    if (value === undefined) continue;
    if (data[field] !== undefined) throw error.usage(`Duplicate field: ${field}.`, { field });
    data[field] = parseJson(value, `--${field}`) as never;
  }
  const bodyFile = str("body-file");
  if (bodyFile !== undefined) {
    if (data.body !== undefined) throw error.usage("Duplicate field: body.", { field: "body" });
    data.body = parseJson(readText(bodyFile, "--body-file"), "--body-file");
  }
  const contentType = str("content-type");
  if (contentType) data.contentType = contentType;
  if (o.yes === true) data.confirm = true;
  for (const item of repeatedValues(o.file)) {
    const index = item.indexOf("=");
    if (index < 1 || index === item.length - 1) throw error.usage("Use --file field=path.");
    const path = item.slice(index + 1);
    let content: Buffer;
    try {
      content = readFileSync(path);
    } catch (e) {
      throw classifyFsError(e, ExitCode.NOT_FOUND, `Could not read --file ${path}`);
    }
    (data.files ??= []).push({ field: item.slice(0, index), filename: basename(path), contentBase64: content.toString("base64") });
  }
  return data;
}

/** Runs one catalog operation from the CLI. */
async function call(operation: ApiOperation, ctx: Context) {
  const input = await buildInput(ctx);
  const dryRun = ctx.options["dry-run"] === true;
  if (operation.method === "DELETE" && input.confirm !== true && !dryRun) {
    if (!ctx.interactive) throw error.usage("Pass --yes to confirm without an interactive terminal.");
    if (!(await confirm(`${operation.method} ${operation.path} deletes or removes data. Continue?`))) throw error.interrupted("Cancelled.");
    input.confirm = true;
  }
  validateApiInput(operation, input);
  if (dryRun) {
    const data = { valid: true, operation: operation.id, method: operation.method, path: operation.path };
    return { data, text: `valid: ${operation.method} ${operation.path} (${operation.id})` };
  }
  const client = operation.authenticated ? (await connect(ctx.options.account as string | undefined)).client : new ClickUpClient("");
  const data = await executeApiOperation(client, operation, input);
  return { data, text: () => JSON.stringify(data ?? null, null, 2) };
}

const listCommand: Command = {
  name: "list",
  aliases: ["ls"],
  description: "List the catalog operations with method, path, version, group and MCP tool.",
  options: [
    { name: "--group", argument: { name: "group" }, description: "Only operations of this catalog group (case-insensitive)." },
    { name: "--read-only", description: "Only operations that do not change ClickUp." },
  ],
  examples: [`${bin} api list --group Tasks`, `${bin} api list --read-only --json`],
  run: (ctx) => {
    const group = typeof ctx.options.group === "string" ? ctx.options.group.toLowerCase() : undefined;
    const selected = apiOperations.filter((o) => (!group || o.group.toLowerCase() === group) && (ctx.options["read-only"] !== true || o.readOnly));
    const operations = selected.map(summary);
    return {
      data: { sources: apiSources, total: operations.length, operations },
      text: () =>
        renderRows(
          operations.map((o) => ({ ...o, path: `${o.path}${o.deprecated ? " (deprecated)" : ""}` })),
          ["cli", "method", "path", "group"],
        ),
    };
  },
};

const describeCommand: Command = {
  name: "describe",
  description: "Show parameters, body formats and the input JSON Schema of an operation.",
  arguments: [{ name: "operation", description: "operationId, CLI name (v2-get-task) or tool name.", required: true }],
  exitCodes: [ExitCode.NOT_FOUND],
  examples: [`${bin} api describe GetTask`, `${bin} api describe v2-get-task --json`],
  run: (ctx) => {
    const operation = findApiOperation(ctx.args[0] as string);
    const data = { ...operation, inputSchema: operationInputSchema(operation) };
    return {
      data,
      text: () =>
        [
          `${operation.method} ${operation.path}${operation.deprecated ? " (deprecated)" : ""}`,
          `id: ${operation.id}  version: ${operation.version}  group: ${operation.group}  ${operation.readOnly ? "read" : "write"}`,
          `cli: ${bin} api call ${operation.cli}`,
          `mcp: ${operation.tool}`,
          `docs: ${operation.documentation}`,
          "",
          JSON.stringify(data.inputSchema, null, 2),
        ].join("\n"),
    };
  },
};

const callCommand: Command = {
  name: "call",
  description: "Validate the input and send one request to a catalog operation.",
  longDescription:
    "The input envelope has path, query, headers, body, contentType and files; --path, --query, --body, --body-file, --content-type and --file fill the same fields. DELETE operations ask for confirmation, or --yes.",
  arguments: [{ name: "operation", description: "operationId, CLI name (v2-get-task) or tool name.", required: true }],
  options: callOptions,
  exitCodes: callExitCodes,
  examples: [
    `${bin} api call v2-get-task --path '{"task_id":"abc123"}'`,
    `${bin} api call GetTasks --path '{"list_id":"901"}' --query '{"statuses":["to do"]}' --json`,
    `${bin} api call v2-create-task-attachment --path '{"task_id":"abc123"}' --file attachment[0]=./report.pdf`,
    `${bin} api call v2-delete-task --path '{"task_id":"abc123"}' --yes --dry-run`,
  ],
  run: (ctx) => call(findApiOperation(ctx.args[0] as string), ctx),
};

/** Hidden 0.9.0 aliases: `api v2-get-task ...` runs `api call v2-get-task ...`. */
const legacyCommands: Command[] = apiOperations.map((operation) => ({
  name: operation.cli,
  description: `${operation.method} ${operation.path}${operation.deprecated ? " (deprecated)" : ""}`,
  hidden: true,
  options: callOptions,
  exitCodes: callExitCodes,
  run: (ctx: Context) => call(operation, ctx),
}));

export const apiCommand: Command = {
  name: "api",
  description: "Reach every endpoint of the public ClickUp API v2 and v3 specifications.",
  longDescription:
    "The catalog is generated from the official OpenAPI files and embedded in the binary. Requests only reach the documented path of each operation, with the profile's API key.",
  subcommands: [listCommand, describeCommand, callCommand, ...legacyCommands],
  examples: [`${bin} api list`, `${bin} api describe GetTask`, `${bin} api call v2-get-task --path '{"task_id":"abc123"}'`],
};
