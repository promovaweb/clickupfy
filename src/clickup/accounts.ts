/**
 * ClickUp profiles: metadata in `~/.clickupfy/accounts.json`, API keys in
 * the encrypted vault.
 *
 * A profile binds a personal API key to one workspace. The metadata file
 * keeps the same shape as ClickUpfy 0.9.0 minus the `apiKey` field, which
 * lives in the vault as `clickup.<profile>.api_key`. The profile used by a
 * command is resolved in this order: the `--account` option, the
 * `PROMOVAWEB_CLICKUPFY_ACCOUNT` variable, then the active profile.
 *
 * The first read without `accounts.json` triggers the one-time import of the
 * legacy config file (see `migrate.ts`).
 */
import { renameSync, readFileSync, writeFileSync } from "node:fs";
import { z } from "zod";
import { error, classifyFsError } from "../app/errors.ts";
import { ExitCode } from "../app/exit-codes.ts";
import { getCredential, listCredentials, removeCredential, setCredential } from "../config/credentials.ts";
import { ensureBaseDir, exists, paths } from "../config/paths.ts";
import { ClickUpClient } from "./client.ts";

/** Environment variable that picks the profile when `--account` is absent. */
export const ACCOUNT_VARIABLE = "PROMOVAWEB_CLICKUPFY_ACCOUNT";

const userSchema = z.object({
  id: z.union([z.number(), z.string()]),
  username: z.string().optional(),
  email: z.string().optional(),
});

const workspaceSchema = z.object({ id: z.string(), name: z.string() });

export const accountSchema = z.object({
  name: z.string().min(1),
  user: userSchema,
  workspace: workspaceSchema,
  createdAt: z.string(),
  updatedAt: z.string(),
});

export const accountsFileSchema = z.object({
  version: z.literal(1),
  activeAccount: z.string().nullable(),
  accounts: z.record(z.string(), accountSchema),
});

export type Account = z.infer<typeof accountSchema>;
export type AccountsFile = z.infer<typeof accountsFileSchema>;

/** Profile resolved for a command, with its id. */
export interface ResolvedAccount {
  id: string;
  account: Account;
  active: boolean;
}

/** Vault name of a profile's API key. */
export function apiKeyCredential(id: string): string {
  return `clickup.${id}.api_key`;
}

/** Empty structure used before the first profile. */
export function emptyAccounts(): AccountsFile {
  return { version: 1, activeAccount: null, accounts: {} };
}

/** Normalizes a human name into a stable kebab-case profile id. */
export function normalizeAccountId(value: string): string {
  const id = value
    .normalize("NFD")
    .replace(/\p{Diacritic}/gu, "")
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-|-$/g, "")
    .slice(0, 48)
    .replace(/-$/, "");
  if (!id) throw error.usage("Provide a profile name with letters or digits.", { name: value });
  return id;
}

/** Whether `accounts.json` exists. */
export function accountsFileExists(): boolean {
  return exists(paths.accounts());
}

/**
 * Reads `accounts.json` without triggering the migration. A missing file
 * yields an empty structure; an invalid file raises CONFIG (3).
 */
export function readAccountsFile(): AccountsFile {
  const path = paths.accounts();
  if (!exists(path)) return emptyAccounts();
  let raw: string;
  try {
    raw = readFileSync(path, "utf8");
  } catch (e) {
    throw classifyFsError(e, ExitCode.CONFIG, `Could not read ${path}`);
  }
  try {
    return accountsFileSchema.parse(JSON.parse(raw.replace(/^﻿/, "")));
  } catch (e) {
    throw error.config(`${path} is invalid: ${e instanceof Error ? e.message : String(e)}`, { path });
  }
}

/** Writes `accounts.json` atomically with mode 0600. */
export function writeAccountsFile(file: AccountsFile): void {
  const valid = accountsFileSchema.parse(file);
  ensureBaseDir();
  const path = paths.accounts();
  const temp = `${path}.${process.pid}.tmp`;
  try {
    writeFileSync(temp, `${JSON.stringify(valid, null, 2)}\n`, { mode: 0o600 });
    renameSync(temp, path);
  } catch (e) {
    throw classifyFsError(e, ExitCode.PERMISSION, `Could not write ${path}`);
  }
}

/** Reads the profiles, importing the legacy config on the first run. */
export async function loadAccounts(): Promise<AccountsFile> {
  if (!accountsFileExists()) {
    const { migrateLegacyConfig } = await import("./migrate.ts");
    migrateLegacyConfig({ auto: true });
  }
  return readAccountsFile();
}

/**
 * Resolves the profile for a command: explicit id, then
 * `PROMOVAWEB_CLICKUPFY_ACCOUNT`, then the active profile. Without any
 * profile, raises CREDENTIALS (4) suggesting `clickupfy setup`; an unknown
 * id raises NOT_FOUND (6).
 */
export async function resolveAccount(explicit?: string): Promise<ResolvedAccount> {
  const file = await loadAccounts();
  const fromEnv = process.env[ACCOUNT_VARIABLE]?.trim();
  const id = explicit?.trim() || fromEnv || file.activeAccount;
  if (!id) {
    throw error.credentials('No active profile. Run "clickupfy setup" or "clickupfy account use <profile>".');
  }
  const account = file.accounts[id];
  if (!account) {
    throw error.notFound(`Profile "${id}" does not exist. Use "clickupfy account list".`, { account: id });
  }
  return { id, account, active: file.activeAccount === id };
}

/** Saves or replaces a profile and its API key, optionally making it active. */
export function saveAccount(id: string, account: Account, apiKey: string | undefined, makeActive: boolean): void {
  const file = readAccountsFile();
  file.accounts[id] = account;
  if (makeActive || !file.activeAccount) file.activeAccount = id;
  if (apiKey !== undefined) setCredential(apiKeyCredential(id), apiKey);
  writeAccountsFile(file);
}

/** Removes a profile and its API key. Returns whether the profile existed. */
export function deleteAccount(id: string): boolean {
  const file = readAccountsFile();
  if (!file.accounts[id]) return false;
  delete file.accounts[id];
  if (file.activeAccount === id) file.activeAccount = Object.keys(file.accounts)[0] ?? null;
  writeAccountsFile(file);
  if (listCredentials().includes(apiKeyCredential(id))) removeCredential(apiKeyCredential(id));
  return true;
}

/** Reads the API key of a profile from the vault. */
export function apiKeyFor(id: string): string {
  const name = apiKeyCredential(id);
  if (!listCredentials().includes(name)) {
    throw error.credentials(`API key of profile "${id}" not found in the vault. Run "clickupfy setup --name ${id}".`, {
      account: id,
      credential: name,
    });
  }
  return getCredential(name);
}

/** Builds a client authenticated with the profile's API key. */
export function clientFor(id: string): ClickUpClient {
  return new ClickUpClient(apiKeyFor(id));
}

/** Resolves the profile and returns it with an authenticated client. */
export async function connect(explicit?: string): Promise<ResolvedAccount & { client: ClickUpClient }> {
  const resolved = await resolveAccount(explicit);
  return { ...resolved, client: clientFor(resolved.id) };
}

/** Masks an API key for display, keeping the first and last four characters. */
export function maskApiKey(apiKey: string): string {
  if (apiKey.length <= 8) return "••••••••";
  return `${apiKey.slice(0, 4)}…${apiKey.slice(-4)}`;
}
