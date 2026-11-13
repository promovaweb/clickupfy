/**
 * `mcp` command: the Model Context Protocol server over stdio.
 *
 * - `mcp` starts the server; `mcp --list` describes what it registers.
 * - `mcp serve` is the ClickUpfy 0.9.0 entry point kept for existing client
 *   configs: there `--list <id>` pins the project list instead of listing.
 * - `mcp setup` writes pinned server entries to the project's client files.
 *
 * Scope flags (`--account`, `--workspace`, `--space`, `--folder`, `--list`,
 * `--sprint-folder`) pin the profile and hierarchy for every tool, and
 * `--read-only` hides the tools that change ClickUp. While serving, stdout
 * belongs to JSON-RPC; diagnostics go to stderr.
 */
import { manifest } from "../../app/manifest.ts";
import { ExitCode } from "../../app/exit-codes.ts";
import type { Scope } from "../../clickup/scope.ts";
import type { Catalog } from "../../mcp/server.ts";
import type { Command, Context, OptionDefinition } from "../registry.ts";

const scopeOptions: OptionDefinition[] = [
  { name: "--workspace", argument: { name: "id" }, description: "Pin the workspace; the profile must be bound to it." },
  { name: "--space", argument: { name: "id" }, description: "Pin the project space." },
  { name: "--folder", argument: { name: "id" }, description: "Pin the project folder." },
  { name: "--sprint-folder", argument: { name: "id" }, description: "Pin the Sprint folder." },
  { name: "--read-only", description: "Register only the tools that do not change ClickUp or the local profiles." },
];

function scopeFrom(ctx: Context, listId: string | undefined): Scope {
  const o = ctx.options;
  const s = (v: unknown) => (typeof v === "string" && v.trim() ? v.trim() : undefined);
  return {
    ...(s(o.account) ? { accountId: s(o.account) } : {}),
    ...(s(o.workspace) ? { workspaceId: s(o.workspace) } : {}),
    ...(s(o.space) ? { spaceId: s(o.space) } : {}),
    ...(s(o.folder) ? { folderId: s(o.folder) } : {}),
    ...(listId ? { listId } : {}),
    ...(s(o["sprint-folder"]) ? { sprintFolderId: s(o["sprint-folder"]) } : {}),
    ...(o["read-only"] === true ? { readOnly: true } : {}),
  };
}

function describeText(d: Catalog): string {
  return [
    `MCP server ${d.name} v${d.version}`,
    "",
    "Tools:",
    ...d.tools.map((t) => `  ${t.name}  ${t.description}`),
    "",
    "Resources:",
    ...d.resources.map((r) => `  ${r.uri}  ${r.description}`),
    "",
    "Prompts:",
    ...d.prompts.map((p) => `  ${p.name}  ${p.description}`),
  ].join("\n");
}

async function serve(scope: Scope, describe: boolean) {
  const { describeServer, startStdioServer } = await import("../../mcp/server.ts");
  if (describe) {
    const d = describeServer(scope);
    return { data: d, text: () => describeText(d) };
  }
  await startStdioServer(scope);
  return { data: { closed: true }, text: "" };
}

const serveCommand: Command = {
  name: "serve",
  description: "Start the MCP server pinned to a project, as in ClickUpfy 0.9.0 client configs.",
  longDescription:
    `Here --list takes the project list id. Example client entry: { "command": "${manifest.bin}", "args": ["mcp", "serve", ` +
    `"--account", "work", "--list", "901328052926"] }.`,
  options: [{ name: "--list", argument: { name: "id" }, description: "Pin the project list." }, ...scopeOptions, { name: "--describe", description: "List the registered tools for this scope and exit." }],
  exitCodes: [ExitCode.MCP],
  examples: [`${manifest.bin} mcp serve --account work --space 90070363783 --list 901328052926`, `${manifest.bin} mcp serve --list 901328052926 --read-only --describe`],
  run: (ctx) => serve(scopeFrom(ctx, typeof ctx.options.list === "string" ? ctx.options.list : undefined), ctx.options.describe === true),
};

const setupCommand: Command = {
  name: "setup",
  description: "Write a pinned MCP server entry to the project files of Claude Code, Codex, Gemini and OpenCode.",
  longDescription:
    "Picks a profile, a space and a list (asked on a terminal), then writes .mcp.json, .codex/config.toml, " +
    ".gemini/settings.json and opencode.json without touching other entries. Only profile ids are written.",
  options: [
    { name: "--name", argument: { name: "name" }, description: "Unique MCP server name in the project." },
    { name: "--space", argument: { name: "id" }, description: "Space of the profile's workspace." },
    { name: "--list", argument: { name: "id" }, description: "List inside the space (folderless or in a folder)." },
    { name: "--clients", argument: { name: "clients" }, description: "Comma-separated: claude-code, codex, gemini, opencode. Default: all." },
    { name: "--project", argument: { name: "dir" }, description: "Project directory. Default: the current directory." },
    { name: "--read-only", description: "Configure only read tools." },
    { name: "--force", description: "Replace an entry with the same name." },
    { name: "--non-interactive", description: "Never prompt; require --name, --account, --space and --list." },
  ],
  exitCodes: [ExitCode.CONFIG, ExitCode.CREDENTIALS, ExitCode.NETWORK_OR_API, ExitCode.NOT_FOUND, ExitCode.PERMISSION, ExitCode.INTERRUPTED],
  examples: [
    `${manifest.bin} mcp setup`,
    `${manifest.bin} mcp setup --name website --account work --space 90070363783 --list 901328052926 --clients claude-code,codex --non-interactive`,
  ],
  run: async (ctx) => {
    const { runMcpSetup } = await import("../../mcp/setup.ts");
    const o = ctx.options;
    const str = (v: unknown) => (typeof v === "string" ? v : undefined);
    const result = await runMcpSetup({
      name: str(o.name),
      account: str(o.account),
      space: str(o.space),
      list: str(o.list),
      clients: str(o.clients),
      project: str(o.project),
      readOnly: o["read-only"] === true,
      force: o.force === true,
      interactive: ctx.interactive && o["non-interactive"] !== true,
    });
    return {
      data: result,
      text: () => [`MCP server "${result.name}" pinned to list ${result.list}`, ...result.files.map((f) => `  ✓ ${f}`)].join("\n"),
    };
  },
};

export const mcpCommand: Command = {
  name: "mcp",
  description: "Start the MCP server (stdio) with tools, resources and prompts for agents.",
  longDescription:
    `Configure in the MCP client: { "command": "${manifest.bin}", "args": ["mcp"] }, or pin a project with "mcp serve".\n` +
    `Run "${manifest.bin} mcp --list" to see the registered tools, resources and prompts.\n` +
    `No tool returns the value of a credential.`,
  options: [
    { name: "--list", description: "Instead of starting the server, list registered tools, resources and prompts and exit." },
    { name: "--list-id", argument: { name: "id" }, description: "Pin the project list (same as --list <id> in mcp serve)." },
    ...scopeOptions,
  ],
  subcommands: [serveCommand, setupCommand],
  exitCodes: [ExitCode.MCP],
  examples: [`${manifest.bin} mcp`, `${manifest.bin} mcp --list --json`, `${manifest.bin} mcp --list-id 901328052926 --read-only`],
  run: (ctx) => serve(scopeFrom(ctx, typeof ctx.options["list-id"] === "string" ? ctx.options["list-id"] : undefined), ctx.options.list === true),
};
