/**
 * Tag catalog of a ClickUp space (spec 0004).
 *
 * `tag list|create|update|delete` and the `clickupfy_tag*` tools. The
 * ClickUp API requires the full tag definition to edit or delete a tag, so
 * update and delete read the catalog first and preserve the omitted name or
 * colors. Adding and removing a tag on a task lives in `tasks.ts`.
 */
import { error } from "../app/errors.ts";
import { ExitCode } from "../app/exit-codes.ts";
import { manifest } from "../app/manifest.ts";
import { renderRows } from "../operations/render.ts";
import type { Operation } from "../operations/types.ts";
import type { ClickUpClient } from "./client.ts";
import { pinned } from "./scope.ts";
import { assertPathSegment } from "./tasks.ts";

/** Tag of a space as returned by the API. */
export interface SpaceTag {
  name: string;
  tag_fg: string;
  tag_bg: string;
}

/** Name and colors of a tag, colors as #RRGGBB. */
export interface TagData {
  name: string;
  foreground: string;
  background: string;
}

const COLOR = /^#[0-9a-fA-F]{6}$/;

function assertColor(value: string, flag: string): void {
  if (!COLOR.test(value)) throw error.usage(`${flag} must be a hexadecimal color such as #336699.`);
}

function tagPath(spaceId: string, name: string): string {
  return `/space/${encodeURIComponent(spaceId)}/tag/${encodeURIComponent(name)}`;
}

/** Lists the tag catalog of a space. */
export async function listSpaceTags(client: ClickUpClient, spaceId: string): Promise<SpaceTag[]> {
  const data = await client.request<{ tags?: SpaceTag[] }>("GET", `/space/${encodeURIComponent(spaceId)}/tag`);
  return data.tags ?? [];
}

/** Creates a tag with a name and both colors, as the API requires. */
export async function createSpaceTag(client: ClickUpClient, spaceId: string, tag: TagData): Promise<void> {
  assertPathSegment(tag.name, "tag name");
  assertColor(tag.foreground, "--foreground");
  assertColor(tag.background, "--background");
  await client.request("POST", `/space/${encodeURIComponent(spaceId)}/tag`, {
    body: { tag: { name: tag.name, tag_fg: tag.foreground, tag_bg: tag.background } },
  });
}

/** Finds a tag of the space by exact name, raising NOT_FOUND when absent. */
export async function findSpaceTag(client: ClickUpClient, spaceId: string, name: string): Promise<SpaceTag> {
  assertPathSegment(name, "tag name");
  const tag = (await listSpaceTags(client, spaceId)).find((t) => t.name === name);
  if (!tag) throw error.notFound(`Tag not found in space ${spaceId}: ${name}.`, { spaceId, name });
  return tag;
}

/** Renames a tag or changes its colors, preserving the omitted fields. */
export async function updateSpaceTag(client: ClickUpClient, spaceId: string, name: string, changes: Partial<TagData>): Promise<void> {
  if (changes.name === undefined && changes.foreground === undefined && changes.background === undefined) {
    throw error.usage("Provide --name, --foreground or --background to update.");
  }
  if (changes.name !== undefined) assertPathSegment(changes.name, "new tag name");
  if (changes.foreground !== undefined) assertColor(changes.foreground, "--foreground");
  if (changes.background !== undefined) assertColor(changes.background, "--background");
  const current = await findSpaceTag(client, spaceId, name);
  // The edit endpoint uses fg_color/bg_color; create and delete use tag_fg/tag_bg.
  await client.request("PUT", tagPath(spaceId, name), {
    body: {
      tag: {
        name: changes.name ?? current.name,
        fg_color: changes.foreground ?? current.tag_fg,
        bg_color: changes.background ?? current.tag_bg,
      },
    },
  });
}

/** Deletes a tag from the space, sending the definition read beforehand. */
export async function deleteSpaceTag(client: ClickUpClient, spaceId: string, name: string): Promise<void> {
  const current = await findSpaceTag(client, spaceId, name);
  await client.request("DELETE", tagPath(spaceId, name), {
    body: { tag: { name: current.name, tag_fg: current.tag_fg, tag_bg: current.tag_bg } },
  });
}

const bin = manifest.bin;
const spaceParam = { key: "spaceId", option: "space", type: "string", description: "Space id. In MCP, defaults to the pinned space." } as const;
const tagNameParam = { key: "tagName", type: "string", positional: true, required: true, description: "Current tag name." } as const;
const space = (scope: { spaceId?: string }, input: Record<string, unknown>) =>
  pinned(scope.spaceId, input.spaceId as string | undefined, "space", "--space");

export const tagOperations: Operation[] = [
  {
    path: ["tag", "list"],
    tool: "clickupfy_tags_list",
    title: "List space tags",
    description: "List the names and colors of the tags of a space.",
    params: [spaceParam],
    effect: "read",
    exitCodes: [ExitCode.USAGE],
    examples: [`${bin} tag list --space 90070363783`],
    text: (data) =>
      renderRows(
        (data as { tags: SpaceTag[] }).tags.map((t) => ({ name: t.name, foreground: t.tag_fg, background: t.tag_bg })),
        ["name", "foreground", "background"],
      ),
    run: async (input, ctx) => ({ tags: await listSpaceTags(ctx.client, space(ctx.scope, input)) }),
  },
  {
    path: ["tag", "create"],
    tool: "clickupfy_tag_create",
    title: "Create space tag",
    description: "Create a tag with a name and colors in a space.",
    params: [
      { key: "name", type: "string", positional: true, required: true, description: "Tag name." },
      spaceParam,
      { key: "foreground", type: "string", required: true, description: "Text color as #RRGGBB." },
      { key: "background", type: "string", required: true, description: "Background color as #RRGGBB." },
    ],
    effect: "write",
    exitCodes: [ExitCode.USAGE],
    examples: [`${bin} tag create backend --space 90070363783 --foreground "#ffffff" --background "#336699"`],
    text: (data) => `Tag "${(data as { name: string }).name}" created.`,
    run: async (input, ctx) => {
      const spaceId = space(ctx.scope, input);
      const name = input.name as string;
      await createSpaceTag(ctx.client, spaceId, { name, foreground: input.foreground as string, background: input.background as string });
      return { created: true, spaceId, name };
    },
  },
  {
    path: ["tag", "update"],
    tool: "clickupfy_tag_update",
    title: "Update space tag",
    description: "Rename a tag or change its colors, preserving the omitted fields.",
    params: [
      tagNameParam,
      spaceParam,
      { key: "name", type: "string", description: "New name." },
      { key: "foreground", type: "string", description: "New text color as #RRGGBB." },
      { key: "background", type: "string", description: "New background color as #RRGGBB." },
    ],
    effect: "write",
    exitCodes: [ExitCode.USAGE],
    examples: [`${bin} tag update backend --space 90070363783 --name api`],
    text: (data) => `Tag "${(data as { name: string }).name}" updated.`,
    run: async (input, ctx) => {
      const spaceId = space(ctx.scope, input);
      const tagName = input.tagName as string;
      const changes = Object.fromEntries(
        (["name", "foreground", "background"] as const).filter((k) => input[k] !== undefined).map((k) => [k, input[k] as string]),
      ) as Partial<TagData>;
      await updateSpaceTag(ctx.client, spaceId, tagName, changes);
      return { updated: true, spaceId, name: changes.name ?? tagName };
    },
  },
  {
    path: ["tag", "delete"],
    tool: "clickupfy_tag_delete",
    title: "Delete space tag",
    description: "Delete a tag from a space.",
    longDescription: "The tag also leaves every task that used it.",
    params: [tagNameParam, spaceParam],
    effect: "write",
    destructive: true,
    exitCodes: [ExitCode.USAGE],
    examples: [`${bin} tag delete backend --space 90070363783 --yes`],
    text: (data) => `Tag "${(data as { name: string }).name}" deleted.`,
    run: async (input, ctx) => {
      const spaceId = space(ctx.scope, input);
      const name = input.tagName as string;
      await deleteSpaceTag(ctx.client, spaceId, name);
      return { deleted: true, spaceId, name };
    },
  },
];
