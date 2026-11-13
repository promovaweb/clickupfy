/**
 * One-time import of the ClickUpfy 0.9.0 config file into the new layout.
 *
 * The legacy file (`PROMOVAWEB_CLICKUPFY_CONFIG` or `~/clickupfy/config.json`)
 * keeps every profile with its API key in plain text. The import copies the
 * metadata to `~/.clickupfy/accounts.json` and each key to the vault as
 * `clickup.<profile>.api_key`. The legacy file is only read, never changed
 * or removed, so the old binary keeps working during the transition.
 *
 * `loadAccounts()` calls the import automatically when `accounts.json` does
 * not exist yet; the `account import` command runs it on demand.
 */
import { readFileSync } from "node:fs";
import { homedir } from "node:os";
import { join } from "node:path";
import { z } from "zod";
import { error, classifyFsError } from "../app/errors.ts";
import { ExitCode } from "../app/exit-codes.ts";
import { exists } from "../config/paths.ts";
import { setCredential } from "../config/credentials.ts";
import { accountSchema, apiKeyCredential, readAccountsFile, writeAccountsFile } from "./accounts.ts";

/** Environment variable that points to the legacy config file. */
export const LEGACY_CONFIG_VARIABLE = "PROMOVAWEB_CLICKUPFY_CONFIG";

const legacySchema = z.object({
  version: z.literal(1),
  activeAccount: z.string().nullable(),
  accounts: z.record(z.string(), accountSchema.extend({ apiKey: z.string().min(1) })),
});

/** Result of an import. */
export interface MigrationResult {
  source: string;
  found: boolean;
  imported: string[];
  skipped: string[];
  activeAccount: string | null;
}

/** Path of the legacy config file. */
export function legacyConfigPath(): string {
  const override = process.env[LEGACY_CONFIG_VARIABLE];
  return override && override.trim() !== "" ? override : join(homedir(), "clickupfy", "config.json");
}

/**
 * Imports the legacy profiles. With `auto`, runs silently when the legacy
 * file is missing and writes an empty `accounts.json` so the check does not
 * repeat; it prints one notice to stderr when profiles are imported. With
 * `force`, profiles that already exist are replaced; otherwise they are
 * skipped. An invalid legacy file raises CONFIG (3).
 */
export function migrateLegacyConfig(options: { auto?: boolean; force?: boolean } = {}): MigrationResult {
  const source = legacyConfigPath();
  const current = readAccountsFile();
  if (!exists(source)) {
    if (options.auto) writeAccountsFile(current);
    else throw error.notFound(`Legacy config not found at ${source}.`, { source });
    return { source, found: false, imported: [], skipped: [], activeAccount: current.activeAccount };
  }

  let raw: string;
  try {
    raw = readFileSync(source, "utf8");
  } catch (e) {
    throw classifyFsError(e, ExitCode.CONFIG, `Could not read ${source}`);
  }
  let legacy: z.infer<typeof legacySchema>;
  try {
    legacy = legacySchema.parse(JSON.parse(raw.replace(/^﻿/, "")));
  } catch (e) {
    throw error.config(`Legacy config ${source} is invalid: ${e instanceof Error ? e.message : String(e)}`, { source });
  }

  const imported: string[] = [];
  const skipped: string[] = [];
  for (const [id, { apiKey, ...account }] of Object.entries(legacy.accounts)) {
    if (current.accounts[id] && !options.force) {
      skipped.push(id);
      continue;
    }
    setCredential(apiKeyCredential(id), apiKey);
    current.accounts[id] = account;
    imported.push(id);
  }
  if (!current.activeAccount && legacy.activeAccount && current.accounts[legacy.activeAccount]) {
    current.activeAccount = legacy.activeAccount;
  }
  writeAccountsFile(current);

  if (options.auto && imported.length > 0) {
    process.stderr.write(`Imported ${imported.length} profile(s) from ${source} into the vault.\n`);
  }
  return { source, found: true, imported, skipped, activeAccount: current.activeAccount };
}
