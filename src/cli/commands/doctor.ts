/**
 * Read-only diagnostics shared by CLI and MCP.
 *
 * `collectDoctorChecks` runs the local checks of the skeleton (Bun, TTY,
 * data directory, settings, master key, vault) plus the ClickUp checks of
 * spec 0010: `accounts.json`, resolved profile, API key in the vault, legacy
 * config file and the pinned servers in the project's `.mcp.json` and
 * `.codex/config.toml`. None of them calls the network, writes files or
 * shows a secret. `collectOnlineChecks` (CLI `doctor --online`) adds the API
 * key validation in `GET /user` and the installed skills reported by
 * `npx skills list`, which may download the manager.
 */
import { statSync, readFileSync } from "node:fs";
import { basename, join } from "node:path";
import { parse as parseToml } from "smol-toml";
import { manifest } from "../../app/manifest.ts";
import { ExitCode } from "../../app/exit-codes.ts";
import { paths } from "../../config/paths.ts";
import { getMasterKey, masterKeySource } from "../../config/crypto.ts";
import { listCredentials, readVault } from "../../config/credentials.ts";
import { ACCOUNT_VARIABLE, accountsFileExists, apiKeyCredential, clientFor, readAccountsFile, type AccountsFile } from "../../clickup/accounts.ts";
import { LEGACY_CONFIG_VARIABLE, legacyConfigPath } from "../../clickup/migrate.ts";
import { listManagedSkills, SKILL_NAMES, type ManagedSkill } from "../../agent/skills.ts";
import type { Command } from "../registry.ts";

export interface DoctorCheck {
  name: string;
  status: "ok" | "warn" | "fail";
  detail: string;
  /** File the check refers to, when there is one. */
  path?: string;
}

/** Options of the ClickUp checks. */
export interface DoctorOptions {
  /** Explicit profile (`--account`); falls back to the variable and the active profile. */
  account?: string;
  /** Project directory with `.mcp.json` and `.codex/config.toml`. */
  cwd?: string;
}

type Add = (name: string, status: DoctorCheck["status"], detail: string, path?: string) => void;

interface ProfileState {
  file?: AccountsFile;
  id?: string;
}

function checkAccounts(add: Add, options: DoctorOptions): ProfileState {
  const path = paths.accounts();
  if (!accountsFileExists()) {
    add("accounts", "warn", 'Not created. Run "clickupfy setup".', path);
    add("profile", "warn", 'No profile configured. Run "clickupfy setup".');
    return {};
  }
  let file: AccountsFile;
  try {
    file = readAccountsFile();
  } catch {
    add("accounts", "fail", "Invalid JSON or schema", path);
    return {};
  }
  const count = Object.keys(file.accounts).length;
  add("accounts", "ok", `${count} profile(s)`, path);
  const id = options.account?.trim() || process.env[ACCOUNT_VARIABLE]?.trim() || file.activeAccount || undefined;
  if (!id) {
    add("profile", "warn", count ? 'No active profile. Run "clickupfy account use <profile>".' : 'No profile configured. Run "clickupfy setup".');
    return { file };
  }
  const account = file.accounts[id];
  if (!account) {
    add("profile", "fail", `Profile "${id}" does not exist. Use "clickupfy account list".`);
    return { file };
  }
  add("profile", "ok", `${id}; workspace ${account.workspace.id} (${account.workspace.name})`);
  try {
    const found = listCredentials().includes(apiKeyCredential(id));
    add("api-key", found ? "ok" : "fail", found ? `${apiKeyCredential(id)} in the vault` : `Missing in the vault. Run "clickupfy setup --name ${id}".`);
    return found ? { file, id } : { file };
  } catch {
    add("api-key", "fail", "Vault unreadable; the API key cannot be checked");
    return { file };
  }
}

function checkLegacy(add: Add, state: ProfileState): void {
  const path = legacyConfigPath();
  const override = Boolean(process.env[LEGACY_CONFIG_VARIABLE]?.trim());
  let found = false;
  try {
    found = statSync(path).isFile();
  } catch {
    found = false;
  }
  if (!found) {
    add("legacy-config", "ok", override ? `${LEGACY_CONFIG_VARIABLE} points to a missing file` : "No ClickUpfy 0.9.0 config file", path);
    return;
  }
  add(
    "legacy-config",
    "warn",
    state.file
      ? "ClickUpfy 0.9.0 config with plain-text API keys still present; remove it once the old binary is gone"
      : 'ClickUpfy 0.9.0 config found; it is imported on the next command or with "clickupfy account import"',
    path,
  );
}

interface ServerEntry {
  name: string;
  command: unknown;
  args: unknown;
}

function clickupfyServers(servers: unknown): ServerEntry[] {
  if (!servers || typeof servers !== "object" || Array.isArray(servers)) return [];
  return Object.entries(servers as Record<string, unknown>)
    .map(([name, entry]) => ({ name, ...((entry ?? {}) as { command?: unknown; args?: unknown }) }) as ServerEntry)
    .filter((e) => typeof e.command === "string" && basename(e.command).replace(/\.exe$/, "") === manifest.bin);
}

function checkProjectFile(add: Add, check: string, path: string, key: string, parse: (text: string) => unknown, state: ProfileState): void {
  let text: string;
  try {
    text = readFileSync(path, "utf8").replace(/^﻿/, "");
  } catch (e) {
    if ((e as NodeJS.ErrnoException).code !== "ENOENT") add(check, "fail", "Cannot read file", path);
    return;
  }
  let config: unknown;
  try {
    config = parse(text);
  } catch {
    add(check, "fail", "Invalid file format", path);
    return;
  }
  const servers = clickupfyServers((config as Record<string, unknown> | null)?.[key]);
  if (servers.length === 0) {
    add(check, "warn", 'No clickupfy MCP server. Run "clickupfy mcp setup" or "clickupfy agent install".', path);
    return;
  }
  const problems: string[] = [];
  for (const server of servers) {
    const args = Array.isArray(server.args) ? server.args.map(String) : [];
    const account = args[args.indexOf("--account") + 1];
    if (args[0] !== "mcp" || !args.includes("--list")) problems.push(`${server.name}: args need "mcp" and "--list"`);
    else if (args.includes("--account") && state.file && account && !state.file.accounts[account]) problems.push(`${server.name}: profile "${account}" does not exist`);
  }
  add(check, problems.length ? "fail" : "ok", problems.length ? problems.join("; ") : `Server(s): ${servers.map((s) => s.name).join(", ")}`, path);
}

/** Collects independent checks without network calls, file writes or secrets. */
export function collectDoctorChecks(
  runtime = { version: Bun.version, stdin: Boolean(process.stdin.isTTY), stdout: Boolean(process.stdout.isTTY) },
  options: DoctorOptions = {},
) {
  const checks: DoctorCheck[] = [];
  const add: Add = (name, status, detail, path) => checks.push({ name, status, detail, ...(path ? { path } : {}) });
  add("bun", Bun.semver.satisfies(runtime.version, ">=1.4.4") ? "ok" : "fail", `${runtime.version}; minimum 1.4.4`);
  for (const stream of ["stdin", "stdout"] as const) add(stream, runtime[stream] ? "ok" : "warn", runtime[stream] ? "TTY available" : "Not a TTY");
  const inspect = (name: string, path: string, check: () => void, detail: string) => {
    try {
      statSync(path);
    } catch (e) {
      add(name, (e as NodeJS.ErrnoException).code === "ENOENT" ? "warn" : "fail", (e as NodeJS.ErrnoException).code === "ENOENT" ? "Not created" : "Cannot access file");
      return;
    }
    try { check(); add(name, "ok", detail); }
    catch { add(name, "fail", "Unreadable, invalid or incorrectly configured"); }
  };
  inspect("directory", paths.base(), () => {
    const stat = statSync(paths.base());
    if (!stat.isDirectory() || (stat.mode & 0o777) !== 0o700) throw new Error("Invalid directory mode");
  }, "Directory exists; mode 0700");
  inspect("settings", paths.settings(), () => {
    const data: unknown = JSON.parse(readFileSync(paths.settings(), "utf8"));
    if (!data || typeof data !== "object" || Array.isArray(data)) throw new Error("Expected object");
  }, "Readable JSON object");
  const source = masterKeySource();
  try {
    if (source !== "none") getMasterKey(false);
    add("master-key", source === "none" ? "warn" : "ok", source);
  } catch { add("master-key", "fail", `${source}; unavailable or invalid`); }
  inspect("credentials", paths.credentials(), () => { readVault(); }, "Vault decrypted successfully");
  const state = checkAccounts(add, options);
  checkLegacy(add, state);
  const cwd = options.cwd ?? process.cwd();
  checkProjectFile(add, "mcp-json", join(cwd, ".mcp.json"), "mcpServers", (t) => JSON.parse(t), state);
  checkProjectFile(add, "codex-config", join(cwd, ".codex", "config.toml"), "mcp_servers", (t) => parseToml(t), state);
  add("binary", "ok", `${manifest.bin} ${manifest.version}`);
  add("platform", "ok", `${process.platform}-${process.arch}`);
  return { checks, ok: checks.every((check) => check.status !== "fail") };
}

/** Small heuristic that flags skills whose text left Brazilian Portuguese. */
export function skillIsPtBr(content: string): boolean {
  const markers = [" de ", " para ", " com ", " que ", " do ", " da ", " e ", " o ", " a ", " uma "];
  const hits = markers.filter((m) => content.toLowerCase().includes(m));
  return hits.length >= 3 && !/^(use the|when you|this skill|install the|manage the)\b/im.test(content);
}

function checkSkillLanguage(add: Add, skill: ManagedSkill): void {
  try {
    const files = [join(skill.path, "SKILL.md"), join(skill.path, "agents", "openai.yaml")].map((f) => readFileSync(f, "utf8"));
    const ok = files.every(skillIsPtBr);
    add(`skill-language-${skill.name}`, ok ? "ok" : "fail", ok ? "Written in Brazilian Portuguese" : "Content outside the Brazilian Portuguese standard", skill.path);
  } catch {
    add(`skill-language-${skill.name}`, "fail", "Missing SKILL.md or agents/openai.yaml", skill.path);
  }
}

/**
 * Network checks of `doctor --online`: validates the API key of the resolved
 * profile in `GET /user` and reads the installed skills with
 * `npx skills list --json` (project and global scopes, plus the language of
 * each ClickUpfy skill).
 */
export async function collectOnlineChecks(options: DoctorOptions = {}): Promise<DoctorCheck[]> {
  const checks: DoctorCheck[] = [];
  const add: Add = (name, status, detail, path) => checks.push({ name, status, detail, ...(path ? { path } : {}) });
  const state = checkAccounts(() => {}, options);
  if (!state.id) add("clickup-api", "warn", "Skipped: no profile with an API key");
  else {
    try {
      const user = await clientFor(state.id).getUser();
      add("clickup-api", "ok", `Authenticated as ${user.username ?? user.email ?? user.id}`);
    } catch (e) {
      add("clickup-api", "fail", e instanceof Error ? e.message : String(e));
    }
  }
  const cwd = options.cwd ?? process.cwd();
  let project: ManagedSkill[];
  let global: ManagedSkill[];
  try {
    [project, global] = await Promise.all([listManagedSkills({ cwd }), listManagedSkills({ global: true, cwd })]);
    add("skills-cli", "ok", '"npx skills" answered in JSON');
  } catch (e) {
    add("skills-cli", "warn", e instanceof Error ? e.message : String(e));
    return checks;
  }
  for (const [scope, skills] of [["project", project], ["global", global]] as const) {
    const missing = SKILL_NAMES.filter((n) => !skills.some((s) => s.name === n));
    add(
      `skills-${scope}`,
      missing.length ? "warn" : "ok",
      missing.length
        ? `Missing: ${missing.join(", ")}. Run "clickupfy agent skill install${scope === "global" ? " --global" : ""}".`
        : `All ${SKILL_NAMES.length} ClickUpfy skills installed`,
    );
    for (const skill of skills.filter((s) => (SKILL_NAMES as string[]).includes(s.name))) checkSkillLanguage(add, skill);
  }
  return checks;
}

export const doctorCommand: Command = {
  name: "doctor",
  description: "Check runtime, settings, vault, ClickUp profile, API key and project MCP files without changing files.",
  options: [
    { name: "--online", description: "Also validate the API key in GET /user and the installed skills with npx skills list." },
  ],
  exitCodes: [ExitCode.CONFIG],
  examples: [`${manifest.bin} doctor`, `${manifest.bin} doctor --online --json`],
  run: async (ctx) => {
    const options: DoctorOptions = typeof ctx?.options?.account === "string" ? { account: ctx.options.account } : {};
    const local = collectDoctorChecks(undefined, options);
    const checks = ctx?.options?.online === true ? [...local.checks, ...(await collectOnlineChecks(options))] : local.checks;
    const data = { checks, ok: checks.every((c) => c.status !== "fail") };
    const marks = { ok: "✓", warn: "!", fail: "✗" };
    return { data, text: data.checks.map((c) => `${marks[c.status]} ${c.name}: ${c.detail}`).join("\n"), code: data.ok ? ExitCode.SUCCESS : ExitCode.CONFIG };
  },
};
