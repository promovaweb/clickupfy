/**
 * `mcp setup`: writes named MCP server entries pinned to a project list.
 *
 * Picks a profile, a space and a list (prompting on a terminal, or from
 * flags), then adds an entry `{ command: "clickupfy", args: ["mcp", "serve",
 * "--account", ..., "--list", ...] }` to the project files of each client:
 *
 * - claude-code: `.mcp.json`, key `mcpServers`;
 * - codex: `.codex/config.toml`, key `mcp_servers`;
 * - gemini: `.gemini/settings.json`, key `mcpServers`;
 * - opencode: `opencode.json` (or an existing `opencode.jsonc`), key `mcp`.
 *
 * Every file is parsed and prepared before any write; other entries are kept
 * and an entry with the same name requires `--force`. Writes are atomic.
 * Only profile ids go to the files, never API keys.
 */
import { mkdirSync, readFileSync, renameSync, writeFileSync } from "node:fs";
import { dirname, join, resolve } from "node:path";
import { applyEdits, modify, parse as parseJsonc, type ParseError } from "jsonc-parser";
import { parse as parseToml, stringify as stringifyToml } from "smol-toml";
import { error, classifyFsError } from "../app/errors.ts";
import { ExitCode } from "../app/exit-codes.ts";
import { manifest } from "../app/manifest.ts";
import { clientFor, loadAccounts } from "../clickup/accounts.ts";
import { listFolders, listLists, listSpaces } from "../clickup/hierarchy.ts";
import { exists } from "../config/paths.ts";

/** Supported MCP clients. */
export const MCP_CLIENTS = ["claude-code", "codex", "gemini", "opencode"] as const;
export type McpClient = (typeof MCP_CLIENTS)[number];

const TARGETS: Record<McpClient, [string, string]> = {
  "claude-code": [".mcp.json", "mcpServers"],
  codex: [".codex/config.toml", "mcp_servers"],
  gemini: [".gemini/settings.json", "mcpServers"],
  opencode: ["opencode.json", "mcp"],
};

/** Options of `mcp setup`. */
export interface McpSetupOptions {
  name?: string;
  account?: string;
  space?: string;
  list?: string;
  clients?: string;
  project?: string;
  readOnly?: boolean;
  force?: boolean;
  interactive: boolean;
}

interface Choice {
  id: string;
  name: string;
  folder?: string;
}

function ask(question: string, fallback?: string): string {
  const answer = prompt(fallback ? `${question} [${fallback}]` : question);
  if (answer === null) throw error.interrupted();
  return answer.trim() || fallback || "";
}

function choose(label: string, choices: Choice[], wanted: string | undefined, interactive: boolean, flag: string): Choice {
  if (choices.length === 0) throw error.notFound(`No options available for ${label}.`);
  if (!wanted && !interactive) throw error.usage(`Pass --${flag} when running without an interactive terminal.`);
  let id = wanted;
  if (!id) {
    process.stderr.write(`${choices.map((c, i) => `  ${i + 1}) ${c.name} (${c.id})`).join("\n")}\n`);
    const answer = ask(`${label} [1-${choices.length}]:`);
    id = choices[Number(answer) - 1]?.id;
    if (!id) throw error.usage(`Invalid choice: "${answer}".`);
  }
  const found = choices.find((c) => c.id === id);
  if (!found) throw error.notFound(`--${flag} ${id} is not part of the available ${label.toLowerCase()} options.`, { [flag]: id });
  return found;
}

function asObject(value: unknown, path: string): Record<string, unknown> {
  if (!value || typeof value !== "object" || Array.isArray(value)) throw error.config(`Invalid configuration in ${path}.`, { path });
  return value as Record<string, unknown>;
}

/** Prepares and writes the entry to each client file. Returns the paths written. */
export function writeClientEntries(options: {
  project: string;
  name: string;
  clients: readonly McpClient[];
  args: string[];
  force: boolean;
}): string[] {
  const prepared: Array<{ path: string; text: string }> = [];
  for (const client of options.clients) {
    const [relative, key] = TARGETS[client];
    let path = resolve(options.project, relative);
    if (client === "opencode" && exists(join(options.project, "opencode.jsonc"))) path = resolve(options.project, "opencode.jsonc");

    let original = "{}\n";
    let config: Record<string, unknown> = {};
    if (exists(path)) {
      try {
        original = readFileSync(path, "utf8").replace(/^﻿/, "");
      } catch (e) {
        throw classifyFsError(e, ExitCode.CONFIG, `Could not read ${path}`);
      }
      const errors: ParseError[] = [];
      let parsed: unknown;
      try {
        parsed =
          client === "codex"
            ? parseToml(original)
            : client === "opencode"
              ? parseJsonc(original, errors, { allowTrailingComma: true })
              : JSON.parse(original);
      } catch (e) {
        throw error.config(`Could not parse ${path}: ${e instanceof Error ? e.message : String(e)}. No file was changed.`, { path });
      }
      if (errors.length) throw error.config(`Invalid JSONC in ${path}. No file was changed.`, { path });
      config = asObject(parsed, path);
    }

    const servers = config[key] === undefined ? {} : asObject(config[key], path);
    if (Object.hasOwn(servers, options.name) && !options.force) {
      throw error.usage(`MCP server "${options.name}" already exists in ${path}. Use another --name or --force.`, { path });
    }
    const entry =
      client === "opencode"
        ? { type: "local", command: [manifest.bin, ...options.args], enabled: true }
        : { command: manifest.bin, args: options.args };
    config[key] = { ...servers, [options.name]: entry };
    const text =
      client === "codex"
        ? `${stringifyToml(config)}\n`
        : client === "opencode"
          ? applyEdits(original, modify(original, [key, options.name], entry, { formattingOptions: { insertSpaces: true, tabSize: 2 } }))
          : `${JSON.stringify(config, null, 2)}\n`;
    prepared.push({ path, text });
  }
  for (const file of prepared) {
    try {
      mkdirSync(dirname(file.path), { recursive: true });
      const temp = `${file.path}.${process.pid}.tmp`;
      writeFileSync(temp, file.text);
      renameSync(temp, file.path);
    } catch (e) {
      throw classifyFsError(e, ExitCode.PERMISSION, `Could not write ${file.path}`);
    }
  }
  return prepared.map((f) => f.path);
}

/** Runs the guided setup and returns what was written. */
export async function runMcpSetup(options: McpSetupOptions) {
  const { interactive } = options;
  const name = options.name ?? (interactive ? ask("Name of this MCP server:", "clickup-project") : "");
  if (!/^[a-zA-Z0-9][a-zA-Z0-9_-]*$/.test(name)) {
    throw error.usage("Pass --name with letters, digits, hyphen or underscore, starting with a letter or digit.");
  }
  const clients = (options.clients ?? MCP_CLIENTS.join(",")).split(",").map((c) => c.trim()).filter(Boolean);
  const invalid = clients.filter((c) => !(MCP_CLIENTS as readonly string[]).includes(c));
  if (clients.length === 0 || invalid.length) throw error.usage(`Valid clients: ${MCP_CLIENTS.join(", ")}.`, { invalid });

  const file = await loadAccounts();
  const profile = choose(
    "Profile",
    Object.entries(file.accounts).map(([id, a]) => ({ id, name: `${a.name} / ${a.workspace.name}` })),
    options.account,
    interactive,
    "account",
  );
  const account = file.accounts[profile.id];
  if (!account) throw error.notFound(`Profile "${profile.id}" does not exist.`);
  const client = clientFor(profile.id);
  const space = choose("Space", await listSpaces(client, account.workspace.id), options.space, interactive, "space");

  const lists: Choice[] = (await listLists(client, { spaceId: space.id })).map((l) => ({ id: l.id, name: l.name }));
  for (const folder of await listFolders(client, space.id)) {
    for (const l of await listLists(client, { folderId: folder.id })) lists.push({ id: l.id, name: `${folder.name} / ${l.name}`, folder: folder.id });
  }
  const list = choose("List", lists, options.list, interactive, "list");

  const args = [
    "mcp",
    "serve",
    "--account",
    profile.id,
    "--workspace",
    account.workspace.id,
    "--space",
    space.id,
    ...(list.folder ? ["--folder", list.folder] : []),
    "--list",
    list.id,
    ...(options.readOnly ? ["--read-only"] : []),
  ];
  const files = writeClientEntries({
    project: options.project ?? process.cwd(),
    name,
    clients: [...new Set(clients)] as McpClient[],
    args,
    force: options.force === true,
  });
  return { name, account: profile.id, workspace: account.workspace.id, space: space.id, list: list.id, args, files };
}
