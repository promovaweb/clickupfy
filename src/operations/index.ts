/**
 * Index of the ClickUp operations and of the group commands they create.
 *
 * Each feature module exports an array of operations; this file joins them
 * in display order. `src/cli/commands.ts` builds the commands from
 * `operations` and `src/mcp/server.ts` registers the tools, so a new
 * operation only needs to be added to its module.
 */
import { manifest } from "../app/manifest.ts";
import { hierarchyOperations } from "../clickup/hierarchy.ts";
import type { GroupInfo } from "./cli.ts";
import type { Operation } from "./types.ts";

const bin = manifest.bin;

/** Every operation, in display order. */
export const operations: readonly Operation[] = [...hierarchyOperations];

/** Descriptions of the group commands. */
export const groups: Record<string, GroupInfo> = {
  space: { description: "Query ClickUp spaces.", examples: [`${bin} space list`] },
  folder: { description: "Query ClickUp folders.", examples: [`${bin} folder list --space <id>`] },
  list: { description: "Query ClickUp lists.", examples: [`${bin} list list --folder <id>`, `${bin} list get <list-id>`] },
};
