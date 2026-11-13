/**
 * `account` command: manages local ClickUp profiles.
 *
 * Subcommands: `list`, `show`, `use`, `remove` and `import`. None of them
 * prints an API key in clear: `show` masks it and `list` omits it.
 * `import` copies the profiles of the ClickUpfy 0.9.0 config file into
 * `accounts.json` and the vault, the same import that runs automatically
 * the first time.
 */
import { manifest } from "../../app/manifest.ts";
import { ExitCode } from "../../app/exit-codes.ts";
import { error } from "../../app/errors.ts";
import { ACCOUNT_VARIABLE, apiKeyFor, deleteAccount, loadAccounts, maskApiKey, readAccountsFile, writeAccountsFile } from "../../clickup/accounts.ts";
import { migrateLegacyConfig } from "../../clickup/migrate.ts";
import { confirm } from "../input.ts";
import { color, grid, table } from "../format.ts";
import type { Command } from "../registry.ts";

const list: Command = {
  name: "list",
  aliases: ["ls"],
  description: "List profiles without API keys.",
  exitCodes: [ExitCode.CONFIG],
  examples: [`${manifest.bin} account list`, `${manifest.bin} account ls --json`],
  run: async () => {
    const file = await loadAccounts();
    const accounts = Object.entries(file.accounts).map(([id, a]) => ({
      id,
      active: file.activeAccount === id,
      name: a.name,
      user: a.user.username ?? a.user.email ?? String(a.user.id),
      workspace: a.workspace.name,
      workspace_id: a.workspace.id,
    }));
    return {
      data: { accounts },
      text: () =>
        grid(
          ["", "ID", "NAME", "USER", "WORKSPACE"],
          accounts.map((a) => [a.active ? "*" : "", a.id, a.name, a.user, `${a.workspace} (${a.workspace_id})`]),
          'no profiles; run "clickupfy setup"',
        ),
    };
  },
};

const show: Command = {
  name: "show",
  description: "Show safe metadata of a profile, with the API key masked.",
  arguments: [{ name: "profile", description: "Profile id. Defaults to the resolved profile." }],
  exitCodes: [ExitCode.CONFIG, ExitCode.CREDENTIALS, ExitCode.NOT_FOUND],
  examples: [`${manifest.bin} account show`, `${manifest.bin} account show work --json`],
  run: async (ctx) => {
    const file = await loadAccounts();
    const id =
      ctx.args[0] || (ctx.options.account as string | undefined) || process.env[ACCOUNT_VARIABLE]?.trim() || file.activeAccount;
    if (!id) throw error.credentials('No active profile. Run "clickupfy setup".');
    const account = file.accounts[id];
    if (!account) throw error.notFound(`Profile "${id}" does not exist.`, { account: id });
    const apiKey = maskApiKey(apiKeyFor(id));
    return {
      data: { account: { id, active: file.activeAccount === id, apiKey, ...account } },
      text: () =>
        table([
          ["id", `${id}${file.activeAccount === id ? " (active)" : ""}`],
          ["name", account.name],
          ["api key", apiKey],
          ["user", account.user.username ?? account.user.email ?? String(account.user.id)],
          ["workspace", `${account.workspace.name} (${account.workspace.id})`],
          ["created", account.createdAt],
          ["updated", account.updatedAt],
        ]),
    };
  },
};

const use: Command = {
  name: "use",
  description: "Set the active profile.",
  arguments: [{ name: "profile", description: "Profile id.", required: true }],
  exitCodes: [ExitCode.CONFIG, ExitCode.NOT_FOUND, ExitCode.PERMISSION],
  examples: [`${manifest.bin} account use work`],
  run: async (ctx) => {
    const id = ctx.args[0] as string;
    await loadAccounts();
    const file = readAccountsFile();
    if (!file.accounts[id]) throw error.notFound(`Profile "${id}" does not exist.`, { account: id });
    file.activeAccount = id;
    writeAccountsFile(file);
    return { data: { activeAccount: id }, text: () => `${color.ok("✓")} active profile: ${id}` };
  },
};

const remove: Command = {
  name: "remove",
  aliases: ["rm"],
  description: "Remove a profile and its API key from the vault.",
  arguments: [{ name: "profile", description: "Profile id.", required: true }],
  options: [{ name: "--yes", description: "Confirm without a prompt. Required off a TTY." }],
  exitCodes: [ExitCode.CONFIG, ExitCode.NOT_FOUND, ExitCode.PERMISSION, ExitCode.INTERRUPTED],
  examples: [`${manifest.bin} account remove old-profile --yes`],
  run: async (ctx) => {
    const id = ctx.args[0] as string;
    const file = await loadAccounts();
    if (!file.accounts[id]) throw error.notFound(`Profile "${id}" does not exist.`, { account: id });
    if (ctx.options.yes !== true) {
      if (!ctx.interactive) throw error.usage("Pass --yes to remove a profile without an interactive terminal.");
      if (!(await confirm(`Remove profile "${id}" and its API key?`))) throw error.interrupted("Removal cancelled.");
    }
    const removed = deleteAccount(id);
    return { data: { account: id, removed }, text: () => `${color.ok("✓")} profile "${id}" removed` };
  },
};

const importCommand: Command = {
  name: "import",
  description: "Import profiles from the ClickUpfy 0.9.0 config file into the vault.",
  longDescription:
    "Reads PROMOVAWEB_CLICKUPFY_CONFIG or ~/clickupfy/config.json without changing it. The same import runs " +
    "automatically the first time a command reads profiles.",
  options: [{ name: "--force", description: "Replace profiles that already exist instead of skipping them." }],
  exitCodes: [ExitCode.CONFIG, ExitCode.NOT_FOUND, ExitCode.PERMISSION],
  examples: [`${manifest.bin} account import`, `${manifest.bin} account import --force --json`],
  run: (ctx) => {
    const result = migrateLegacyConfig({ force: ctx.options.force === true });
    return {
      data: { source: result.source, imported: result.imported, skipped: result.skipped, activeAccount: result.activeAccount },
      text: () =>
        table([
          ["source", result.source],
          ["imported", result.imported.join(", ") || "-"],
          ["skipped", result.skipped.join(", ") || "-"],
          ["active", result.activeAccount ?? "-"],
        ]),
    };
  },
};

export const accountCommand: Command = {
  name: "account",
  description: "Manage local ClickUp profiles.",
  subcommands: [list, show, use, remove, importCommand],
  examples: [`${manifest.bin} account list`, `${manifest.bin} account use work`],
};
