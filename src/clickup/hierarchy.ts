/**
 * Spaces, folders and lists of the bound workspace (spec 0003).
 *
 * Read-only navigation of the ClickUp hierarchy. The functions are used by
 * the operations below (CLI commands and MCP tools) and by `mcp setup`,
 * which walks the same hierarchy to pin a project list.
 */
import { error } from "../app/errors.ts";
import { manifest } from "../app/manifest.ts";
import { renderRows } from "../operations/render.ts";
import type { Operation } from "../operations/types.ts";
import type { ClickUpClient } from "./client.ts";
import { pinned, pinnedOptional } from "./scope.ts";

/** Minimal shape of a hierarchy item. */
export interface HierarchyItem {
  id: string;
  name: string;
  [key: string]: unknown;
}

/** Lists the spaces of a workspace. */
export async function listSpaces(client: ClickUpClient, workspaceId: string, archived = false): Promise<HierarchyItem[]> {
  const data = await client.request<{ spaces?: HierarchyItem[] }>("GET", `/team/${workspaceId}/space`, { query: { archived } });
  return data.spaces ?? [];
}

/** Lists the folders of a space. */
export async function listFolders(client: ClickUpClient, spaceId: string, archived = false): Promise<HierarchyItem[]> {
  const data = await client.request<{ folders?: HierarchyItem[] }>("GET", `/space/${spaceId}/folder`, { query: { archived } });
  return data.folders ?? [];
}

/** Lists the lists of a folder, or the folderless lists of a space. */
export async function listLists(
  client: ClickUpClient,
  where: { folderId?: string; spaceId?: string },
  archived = false,
): Promise<HierarchyItem[]> {
  const path = where.folderId ? `/folder/${where.folderId}/list` : `/space/${where.spaceId}/list`;
  const data = await client.request<{ lists?: HierarchyItem[] }>("GET", path, { query: { archived } });
  return data.lists ?? [];
}

/** Returns a list with its task statuses. */
export function getList(client: ClickUpClient, listId: string): Promise<HierarchyItem> {
  return client.request<HierarchyItem>("GET", `/list/${listId}`);
}

const bin = manifest.bin;

export const hierarchyOperations: Operation[] = [
  {
    path: ["space", "list"],
    aliases: ["ls"],
    tool: "clickupfy_spaces_list",
    title: "List spaces",
    description: "List the spaces of the workspace bound to the profile.",
    params: [{ key: "archived", type: "boolean", description: "Include archived spaces." }],
    effect: "read",
    examples: [`${bin} space list`, `${bin} space ls --archived --json`],
    text: (data) => renderRows((data as { spaces: HierarchyItem[] }).spaces, ["id", "name"]),
    run: async (input, ctx) => ({
      spaces: await listSpaces(ctx.client, ctx.account.account.workspace.id, input.archived === true),
    }),
  },
  {
    path: ["folder", "list"],
    aliases: ["ls"],
    tool: "clickupfy_folders_list",
    title: "List folders",
    description: "List the folders of a space.",
    params: [
      { key: "spaceId", option: "space", type: "string", description: "Space id. In MCP, defaults to the pinned space." },
      { key: "archived", type: "boolean", description: "Include archived folders." },
    ],
    effect: "read",
    exitCodes: [],
    examples: [`${bin} folder list --space 90070363783`],
    text: (data) => renderRows((data as { folders: HierarchyItem[] }).folders, ["id", "name", "task_count"]),
    run: async (input, ctx) => ({
      folders: await listFolders(ctx.client, pinned(ctx.scope.spaceId, input.spaceId as string | undefined, "space", "--space"), input.archived === true),
    }),
  },
  {
    path: ["list", "list"],
    aliases: ["ls"],
    tool: "clickupfy_lists_list",
    title: "List lists",
    description: "List the lists of a folder, or the folderless lists of a space.",
    params: [
      { key: "folderId", option: "folder", type: "string", description: "Folder id. Takes precedence over the space." },
      { key: "spaceId", option: "space", type: "string", description: "Space id, for lists without a folder." },
      { key: "archived", type: "boolean", description: "Include archived lists." },
    ],
    effect: "read",
    examples: [`${bin} list list --folder 123`, `${bin} list ls --space 90070363783 --json`],
    text: (data) => renderRows((data as { lists: HierarchyItem[] }).lists, ["id", "name", "task_count"]),
    run: async (input, ctx) => {
      const folderId = pinnedOptional(ctx.scope.folderId, input.folderId as string | undefined, "folder");
      const spaceId = folderId ? undefined : pinnedOptional(ctx.scope.spaceId, input.spaceId as string | undefined, "space");
      if (!folderId && !spaceId) throw error.usage("Provide --folder <id> or --space <id> (folderId or spaceId in MCP).");
      return {
        lists: await listLists(ctx.client, folderId ? { folderId } : { spaceId: spaceId as string }, input.archived === true),
      };
    },
  },
  {
    path: ["list", "get"],
    tool: "clickupfy_list_get",
    title: "Get list",
    description: "Get a list and the statuses available for its tasks.",
    params: [
      { key: "listId", type: "string", positional: true, required: true, only: "cli", description: "List id." },
      { key: "listId", type: "string", only: "mcp", description: "List id. Defaults to the pinned list." },
    ],
    effect: "read",
    examples: [`${bin} list get 901328052926`],
    run: async (input, ctx) => getList(ctx.client, pinned(ctx.scope.listId, input.listId as string | undefined, "list", "listId")),
    text: (data) => {
      const list = data as { id: string; name: string; statuses?: Array<{ status: string }> };
      return `${list.name} (${list.id})\nstatuses: ${(list.statuses ?? []).map((s) => s.status).join(", ") || "-"}`;
    },
  },
];
