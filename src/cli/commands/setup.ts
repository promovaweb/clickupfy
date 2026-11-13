/**
 * `setup` command (alias `install`): registers a ClickUp API key as a
 * profile bound to one workspace.
 *
 * The key is validated with `GET /user`, the workspaces come from
 * `GET /team`, the metadata goes to `accounts.json` and the key to the vault
 * as `clickup.<profile>.api_key`. On an interactive terminal the missing
 * values are asked (the key without echo); off a TTY, or with
 * `--non-interactive`, `--api-key` is required and `--workspace` too when
 * the key reaches more than one workspace. The key never appears in output.
 */
import { manifest } from "../../app/manifest.ts";
import { ExitCode } from "../../app/exit-codes.ts";
import { error } from "../../app/errors.ts";
import { paths } from "../../config/paths.ts";
import { ClickUpClient, type ClickUpWorkspace } from "../../clickup/client.ts";
import { loadAccounts, normalizeAccountId, saveAccount } from "../../clickup/accounts.ts";
import { readSecret } from "../input.ts";
import { color, table } from "../format.ts";
import type { Command } from "../registry.ts";

function ask(question: string): string {
  const answer = prompt(question);
  if (answer === null) throw error.interrupted();
  return answer.trim();
}

function pickWorkspace(workspaces: ClickUpWorkspace[], wanted: string | undefined, interactive: boolean): ClickUpWorkspace {
  if (wanted) {
    const found = workspaces.find((w) => w.id === wanted);
    if (!found) {
      throw error.notFound(`Workspace ${wanted} is not authorized for this API key.`, {
        workspace: wanted,
        available: workspaces.map((w) => w.id),
      });
    }
    return found;
  }
  if (workspaces.length === 0) throw error.notFound("The API key does not reach any workspace.");
  if (workspaces.length === 1) return workspaces[0] as ClickUpWorkspace;
  if (!interactive) {
    throw error.usage("The API key reaches more than one workspace. Pass --workspace <id>.", {
      available: workspaces.map((w) => ({ id: w.id, name: w.name })),
    });
  }
  process.stderr.write(`${workspaces.map((w, i) => `  ${i + 1}) ${w.name} (${w.id})`).join("\n")}\n`);
  const answer = ask(`Workspace [1-${workspaces.length}]:`);
  const chosen = workspaces[Number(answer) - 1];
  if (!chosen) throw error.usage(`Invalid choice: "${answer}".`);
  return chosen;
}

export const setupCommand: Command = {
  name: "setup",
  aliases: ["install"],
  description: "Configure a ClickUp API key and bind the profile to a workspace.",
  longDescription:
    "Validates the key with the ClickUp API, binds the profile to an authorized workspace and makes it active. " +
    "The key is stored encrypted in the vault as clickup.<profile>.api_key and never printed. Running setup again " +
    "with the same --name replaces that profile.",
  options: [
    { name: "--api-key", argument: { name: "key" }, description: "Personal ClickUp API key (pk_...). Asked without echo on a terminal." },
    { name: "--token", argument: { name: "key" }, description: "Compatible alias for --api-key." },
    { name: "--name", argument: { name: "name" }, description: "Local profile name, normalized to kebab-case. Defaults to the ClickUp username." },
    { name: "--workspace", argument: { name: "id" }, description: "Workspace to bind. Required off a TTY when the key reaches several." },
    { name: "--non-interactive", description: "Never prompt; fail with exit code 2 when a value is missing." },
  ],
  exitCodes: [ExitCode.CREDENTIALS, ExitCode.NETWORK_OR_API, ExitCode.NOT_FOUND, ExitCode.PERMISSION, ExitCode.INTERRUPTED],
  examples: [
    `${manifest.bin} setup`,
    `${manifest.bin} setup --api-key "$CLICKUP_API_KEY" --name work --workspace 9007154145 --non-interactive --json`,
  ],
  run: async (ctx) => {
    const interactive = ctx.interactive && ctx.options["non-interactive"] !== true;
    let apiKey = (ctx.options["api-key"] ?? ctx.options.token) as string | undefined;
    if (!apiKey) {
      if (!interactive) throw error.usage("Pass --api-key <key> when running setup without an interactive terminal.");
      apiKey = await readSecret("ClickUp API key");
    }
    apiKey = apiKey.trim();
    if (!apiKey) throw error.usage("The API key cannot be empty.");

    const client = new ClickUpClient(apiKey);
    const user = await client.getUser();
    const workspaces = await client.listWorkspaces();
    const workspace = pickWorkspace(workspaces, ctx.options.workspace as string | undefined, interactive);

    let name = ctx.options.name as string | undefined;
    if (!name && interactive) name = ask(`Profile name [${user.username ?? user.email ?? "default"}]:`) || undefined;
    name = name ?? user.username ?? user.email ?? String(user.id);
    const id = normalizeAccountId(name);

    const existing = (await loadAccounts()).accounts[id];
    const now = new Date().toISOString();
    const account = {
      name,
      user: { id: user.id, ...(user.username ? { username: user.username } : {}), ...(user.email ? { email: user.email } : {}) },
      workspace: { id: workspace.id, name: workspace.name },
      createdAt: existing?.createdAt ?? now,
      updatedAt: now,
    };
    saveAccount(id, account, apiKey, true);

    return {
      data: { account: id, user: account.user, workspace: account.workspace, path: paths.accounts() },
      text: () =>
        `${color.ok("✓")} profile "${id}" saved and active\n` +
        table([
          ["user", account.user.username ?? account.user.email ?? String(account.user.id)],
          ["workspace", `${workspace.name} (${workspace.id})`],
          ["file", paths.accounts()],
        ]),
    };
  },
};
