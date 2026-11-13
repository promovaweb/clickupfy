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
import { taskOperations } from "../clickup/tasks.ts";
import { tagOperations } from "../clickup/tags.ts";
import { checklistOperations } from "../clickup/checklists.ts";
import { commentOperations } from "../clickup/comments.ts";
import { timeOperations } from "../clickup/time.ts";
import { sprintOperations } from "../clickup/sprints.ts";
import { docOperations } from "../clickup/docs.ts";
import type { GroupInfo } from "./cli.ts";
import type { Operation } from "./types.ts";

const bin = manifest.bin;

/** Every operation, in display order. */
export const operations: readonly Operation[] = [...hierarchyOperations, ...taskOperations, ...tagOperations,...checklistOperations, ...commentOperations, ...timeOperations, ...sprintOperations, ...docOperations];

/** Descriptions of the group commands. */
export const groups: Record<string, GroupInfo> = {
  space: { description: "Query ClickUp spaces.", examples: [`${bin} space list`] },
  folder: { description: "Query ClickUp folders.", examples: [`${bin} folder list --space <id>`] },
  list: { description: "Query ClickUp lists.", examples: [`${bin} list list --folder <id>`, `${bin} list get <list-id>`] },
  task: { description: "Manage ClickUp tasks and their tags.", examples: [`${bin} task list --list <id>`, `${bin} task get <task-id>`, `${bin} task create --list <id> --name <name>`] },
  tag: { description: "Manage the tag catalog of a space.", examples: [`${bin} tag list --space <id>`, `${bin} tag create <name> --space <id> --foreground <color> --background <color>`] },
  checklist: { description: "Manage task checklists and their items.", examples: [`${bin} checklist create <task-id> --name <name>`, `${bin} checklist set <task-id> <checklist-id> <item-id> --resolved`] },
  comment: { description: "Read and publish task comments.", examples: [`${bin} comment list --task <id>`, `${bin} comment create --task <id> --text <text>`] },
  time: { description: "Track time on tasks.", examples: [`${bin} time current`, `${bin} time start --task <id>`, `${bin} time stop`] },
  sprint: { description: "Query and plan existing Sprints.", examples: [`${bin} sprint list --folder <id>`, `${bin} sprint current --folder <id>`] },
  doc: { description: "Manage ClickUp Docs.", examples: [`${bin} doc list`, `${bin} doc create --name <name>`] },
  "doc page": { description: "Manage the pages of a Doc.", examples: [`${bin} doc page tree <doc-id>`, `${bin} doc page update <doc-id> <page-id> --file -`] },
};
