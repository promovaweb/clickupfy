/**
 * `workspace` command: lists the workspaces the profile's API key reaches
 * and binds one of them to the profile.
 */
import { manifest } from "../../app/manifest.ts";
import { ExitCode } from "../../app/exit-codes.ts";
import { error } from "../../app/errors.ts";
import { connect, readAccountsFile, writeAccountsFile } from "../../clickup/accounts.ts";
import { color, grid } from "../format.ts";
import type { Command } from "../registry.ts";

const codes = [ExitCode.CONFIG, ExitCode.CREDENTIALS, ExitCode.NETWORK_OR_API, ExitCode.NOT_FOUND] as const;

const list: Command = {
  name: "list",
  aliases: ["ls"],
  description: "List workspaces the API key can reach.",
  exitCodes: codes,
  examples: [`${manifest.bin} workspace list`, `${manifest.bin} workspace ls --json`],
  run: async (ctx) => {
    const { account, client } = await connect(ctx.options.account as string | undefined);
    const workspaces = (await client.listWorkspaces()).map((w) => ({
      id: w.id,
      name: w.name,
      bound: w.id === account.workspace.id,
    }));
    return {
      data: { workspaces },
      text: () => grid(["", "ID", "NAME"], workspaces.map((w) => [w.bound ? "*" : "", w.id, w.name]), "no workspaces"),
    };
  },
};

const use: Command = {
  name: "use",
  description: "Bind an authorized workspace to the profile.",
  arguments: [{ name: "workspace-id", description: "Workspace id from workspace list.", required: true }],
  exitCodes: [...codes, ExitCode.PERMISSION],
  examples: [`${manifest.bin} workspace use 9007154145`],
  run: async (ctx) => {
    const wanted = ctx.args[0] as string;
    const { id, client } = await connect(ctx.options.account as string | undefined);
    const workspace = (await client.listWorkspaces()).find((w) => w.id === wanted);
    if (!workspace) throw error.notFound(`Workspace ${wanted} is not authorized for profile "${id}".`, { workspace: wanted });
    const file = readAccountsFile();
    const account = file.accounts[id];
    if (!account) throw error.notFound(`Profile "${id}" does not exist.`, { account: id });
    account.workspace = { id: workspace.id, name: workspace.name };
    account.updatedAt = new Date().toISOString();
    writeAccountsFile(file);
    return {
      data: { account: id, workspace: account.workspace },
      text: () => `${color.ok("✓")} profile "${id}" bound to ${workspace.name} (${workspace.id})`,
    };
  },
};

export const workspaceCommand: Command = {
  name: "workspace",
  description: "Query and bind ClickUp workspaces.",
  subcommands: [list, use],
  examples: [`${manifest.bin} workspace list`],
};
