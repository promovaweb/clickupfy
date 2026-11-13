/**
 * Profile and scope tools (spec 0002).
 *
 * `clickupfy_mcp_context` reports the profile and hierarchy pinned by the
 * server; the others mirror `account list`, `whoami`, `workspace list`,
 * `account use` and `workspace use`. `clickupfy_account_use` only exists
 * when the server does not pin a profile, and `clickupfy_workspace_use` only
 * when it pins neither a profile nor a workspace, as in ClickUpfy 0.9.0. No
 * tool returns an API key.
 */
import { z } from "zod";
import { loadAccounts, readAccountsFile, writeAccountsFile } from "../../clickup/accounts.ts";
import type { Scope } from "../../clickup/scope.ts";
import { error } from "../../app/errors.ts";
import { connectScoped, toolError, toolResult } from "../../operations/mcp.ts";
import type { Registrar } from "../server.ts";

const account = z.string().optional().describe("Profile id. Defaults to the profile pinned by the server or the active one.");

export function registerAccountTools({ server, catalog }: Registrar, scope: Scope): void {
  const add = (name: string, description: string) => catalog.tools.push({ name, description });

  add("clickupfy_mcp_context", "Profile and hierarchy pinned by this MCP server.");
  server.registerTool(
    "clickupfy_mcp_context",
    {
      title: "MCP scope",
      description: "Shows the profile, workspace and the space, folder, list and Sprint folder pinned by this MCP server. Call it first to learn the project defaults.",
      inputSchema: { account },
      annotations: { readOnlyHint: true },
    },
    async (args) => {
      try {
        const ctx = await connectScoped(scope, args.account);
        return toolResult({
          account: ctx.id,
          workspace: ctx.account.workspace,
          readOnly: scope.readOnly === true,
          scope: {
            workspaceId: scope.workspaceId ?? ctx.account.workspace.id,
            spaceId: scope.spaceId ?? null,
            folderId: scope.folderId ?? null,
            listId: scope.listId ?? null,
            sprintFolderId: scope.sprintFolderId ?? null,
          },
        });
      } catch (e) {
        return toolError(e);
      }
    },
  );

  add("clickupfy_accounts_list", "Local profiles, without API keys.");
  server.registerTool(
    "clickupfy_accounts_list",
    {
      title: "List profiles",
      description: "Lists the local ClickUp profiles with user and workspace, without any API key.",
      inputSchema: {},
      annotations: { readOnlyHint: true },
    },
    async () => {
      try {
        const file = await loadAccounts();
        return toolResult({
          accounts: Object.entries(file.accounts).map(([id, a]) => ({
            id,
            active: file.activeAccount === id,
            name: a.name,
            user: a.user.username ?? a.user.email ?? a.user.id,
            workspace: a.workspace,
          })),
        });
      } catch (e) {
        return toolError(e);
      }
    },
  );

  add("clickupfy_whoami", "Validates the profile and returns the ClickUp user.");
  server.registerTool(
    "clickupfy_whoami",
    {
      title: "Authenticated user",
      description: "Validates the profile's API key and returns the authenticated ClickUp user and the bound workspace.",
      inputSchema: { account },
      annotations: { readOnlyHint: true, openWorldHint: true },
    },
    async (args) => {
      try {
        const ctx = await connectScoped(scope, args.account);
        return toolResult({ account: ctx.id, workspace: ctx.account.workspace, user: await ctx.client.getUser() });
      } catch (e) {
        return toolError(e);
      }
    },
  );

  add("clickupfy_workspaces_list", "Workspaces the profile's API key can reach.");
  server.registerTool(
    "clickupfy_workspaces_list",
    {
      title: "List workspaces",
      description: "Lists the workspaces authorized for the profile's API key.",
      inputSchema: { account },
      annotations: { readOnlyHint: true, openWorldHint: true },
    },
    async (args) => {
      try {
        const ctx = await connectScoped(scope, args.account);
        return toolResult({ workspaces: await ctx.client.listWorkspaces() });
      } catch (e) {
        return toolError(e);
      }
    },
  );

  if (scope.readOnly) return;

  if (!scope.accountId) {
    add("clickupfy_account_use", "Sets the default local profile.");
    server.registerTool(
      "clickupfy_account_use",
      {
        title: "Use profile",
        description: "Sets which local profile is used by default.",
        inputSchema: { account: z.string().describe("Profile id from clickupfy_accounts_list.") },
      },
      async (args) => {
        try {
          await loadAccounts();
          const file = readAccountsFile();
          if (!file.accounts[args.account]) throw error.notFound(`Profile "${args.account}" does not exist.`);
          file.activeAccount = args.account;
          writeAccountsFile(file);
          return toolResult({ activeAccount: args.account });
        } catch (e) {
          return toolError(e);
        }
      },
    );
  }

  if (!scope.accountId && !scope.workspaceId) {
    add("clickupfy_workspace_use", "Binds another authorized workspace to a profile.");
    server.registerTool(
      "clickupfy_workspace_use",
      {
        title: "Use workspace",
        description: "Binds another workspace authorized for the API key to a configured profile.",
        inputSchema: { account, workspaceId: z.string().describe("Workspace id from clickupfy_workspaces_list.") },
      },
      async (args) => {
        try {
          const ctx = await connectScoped(scope, args.account);
          const workspace = (await ctx.client.listWorkspaces()).find((w) => w.id === args.workspaceId);
          if (!workspace) throw error.notFound(`Workspace ${args.workspaceId} is not authorized for profile "${ctx.id}".`);
          const file = readAccountsFile();
          const target = file.accounts[ctx.id];
          if (!target) throw error.notFound(`Profile "${ctx.id}" does not exist.`);
          target.workspace = { id: workspace.id, name: workspace.name };
          target.updatedAt = new Date().toISOString();
          writeAccountsFile(file);
          return toolResult({ account: ctx.id, workspace: target.workspace });
        } catch (e) {
          return toolError(e);
        }
      },
    );
  }
}
