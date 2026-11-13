/**
 * Task checklists and checklist items (spec 0005).
 *
 * Agents publish their plan as a checklist on the task and mark each item as
 * they finish it. `checklist set` (tool `clickupfy_checklist_item_set`)
 * checks that the item belongs to the task before the change and confirms
 * the persisted state in a new read of the task, as ClickUpfy 0.9.0 did, so
 * an agent never reports an item as done when ClickUp did not store it.
 */
import { AppError, error } from "../app/errors.ts";
import { ExitCode } from "../app/exit-codes.ts";
import { manifest } from "../app/manifest.ts";
import { renderRows } from "../operations/render.ts";
import type { Operation } from "../operations/types.ts";
import type { ClickUpClient } from "./client.ts";
import { buildTaskReading, getTask, type ClickUpTask, type WorkItem } from "./tasks.ts";

/** Checklist item as returned inside a task. */
export interface ChecklistItemPayload {
  id: string;
  name: string;
  orderindex?: number | string;
  resolved?: boolean;
  parent?: string | null;
  [key: string]: unknown;
}

/** Checklist as returned inside a task. */
export interface ChecklistPayload {
  id: string;
  name: string;
  items?: ChecklistItemPayload[];
  [key: string]: unknown;
}

const bin = manifest.bin;

/** Creates a checklist on a task. Returns the ClickUp payload (`{ checklist }`). */
export function createChecklist(client: ClickUpClient, taskId: string, name: string): Promise<Record<string, unknown>> {
  return client.request("POST", `/task/${encodeURIComponent(taskId)}/checklist`, { body: { name } });
}

/** Adds an item to an existing checklist. Returns the ClickUp payload (`{ checklist }`). */
export function createChecklistItem(
  client: ClickUpClient,
  checklistId: string,
  item: { name: string; assignee?: number },
): Promise<Record<string, unknown>> {
  return client.request("POST", `/checklist/${encodeURIComponent(checklistId)}/checklist_item`, { body: item });
}

/** Updates one checklist item through its own ClickUp endpoint. */
export function updateChecklistItem(
  client: ClickUpClient,
  checklistId: string,
  itemId: string,
  data: { name?: string; assignee?: string | null; resolved?: boolean; parent?: string | null },
): Promise<Record<string, unknown>> {
  return client.request("PUT", `/checklist/${encodeURIComponent(checklistId)}/checklist_item/${encodeURIComponent(itemId)}`, {
    body: data,
  });
}

/**
 * Finds a checklist item in a task or in any of its subtasks, in the same
 * work item shape as `task get` (built by `buildTaskReading`). Returns
 * `undefined` when the item is not there.
 */
export function locateChecklistItem(task: ClickUpTask, checklistId: string, itemId: string): WorkItem | undefined {
  const key = `checklist:${checklistId}:${itemId}`;
  return buildTaskReading(task).execution.items.find((item) => item.key === key);
}

/**
 * Marks or reopens a checklist item and confirms the state in a new read of
 * the root task. Raises NOT_FOUND when the item is not in the task and
 * NETWORK_OR_API when ClickUp did not persist the requested state.
 */
export async function setChecklistItemState(
  client: ClickUpClient,
  taskId: string,
  checklistId: string,
  itemId: string,
  resolved: boolean,
): Promise<WorkItem> {
  const notInTask = () =>
    error.notFound(`Checklist item ${itemId} does not belong to checklist ${checklistId} of task ${taskId}.`, {
      taskId,
      checklistId,
      itemId,
    });
  if (!locateChecklistItem(await getTask(client, taskId), checklistId, itemId)) throw notInTask();
  await updateChecklistItem(client, checklistId, itemId, { resolved });
  const item = locateChecklistItem(await getTask(client, taskId), checklistId, itemId);
  if (!item) throw notInTask();
  if (item.done !== resolved) {
    throw new AppError(ExitCode.NETWORK_OR_API, `Checklist item ${itemId} did not confirm the requested state.`, {
      itemId,
      requested: resolved,
    });
  }
  return item;
}

function checklistRows(data: unknown): string {
  const checklist = (data as { checklist?: ChecklistPayload }).checklist;
  if (!checklist) return renderRows([]);
  const head = `${checklist.name} (${checklist.id})`;
  const items = checklist.items ?? [];
  return items.length === 0
    ? head
    : `${head}\n${renderRows(
        items.map((i) => ({ id: i.id, name: i.name, resolved: i.resolved ? "x" : "" })),
        ["id", "name", "resolved"],
      )}`;
}

export const checklistOperations: Operation[] = [
  {
    path: ["checklist", "create"],
    tool: "clickupfy_checklist_create",
    title: "Create checklist",
    description: "Create a checklist on a task.",
    params: [
      { key: "taskId", type: "string", positional: true, required: true, description: "Task id." },
      { key: "name", type: "string", required: true, description: "Checklist name." },
    ],
    effect: "write",
    examples: [`${bin} checklist create 86abc123 --name "Plan"`, `${bin} --json checklist create 86abc123 --name "Plugin steps"`],
    text: checklistRows,
    run: (input, ctx) => createChecklist(ctx.client, input.taskId as string, input.name as string),
  },
  {
    path: ["checklist", "item-create"],
    tool: "clickupfy_checklist_item_create",
    title: "Create checklist item",
    description: "Add an item to an existing checklist.",
    params: [
      { key: "checklistId", type: "string", positional: true, required: true, description: "Checklist id." },
      { key: "name", type: "string", required: true, description: "Item name." },
      { key: "assignee", type: "integer", description: "Numeric user id of the assignee." },
    ],
    effect: "write",
    examples: [`${bin} checklist item-create b955c4dc --name "Write tests"`, `${bin} checklist item-create b955c4dc --name "Review" --assignee 183`],
    text: checklistRows,
    run: (input, ctx) =>
      createChecklistItem(ctx.client, input.checklistId as string, {
        name: input.name as string,
        ...(input.assignee !== undefined ? { assignee: input.assignee as number } : {}),
      }),
  },
  {
    path: ["checklist", "set"],
    tool: "clickupfy_checklist_item_set",
    title: "Set checklist item",
    description: "Mark or reopen a checklist item and confirm the state in a new read of the task.",
    longDescription:
      "The task id is the root task returned by `task get`; the item may live in a subtask. Exits with 6 when the item is not in the task and with 5 when ClickUp does not confirm the state.",
    params: [
      { key: "taskId", type: "string", positional: true, required: true, description: "Root task used to validate the item." },
      { key: "checklistId", type: "string", positional: true, required: true, description: "Checklist id." },
      { key: "itemId", type: "string", positional: true, required: true, description: "Checklist item id." },
      { key: "resolved", type: "boolean", only: "cli", description: "Mark the item as done." },
      { key: "open", type: "boolean", only: "cli", description: "Reopen the item." },
      { key: "resolved", type: "boolean", required: true, only: "mcp", description: "true marks the item as done; false reopens it." },
    ],
    effect: "write",
    exitCodes: [ExitCode.USAGE],
    examples: [`${bin} checklist set 86abc123 b955c4dc 21e08dc8 --resolved`, `${bin} checklist set 86abc123 b955c4dc 21e08dc8 --open --json`],
    text: (data) => {
      const item = data as WorkItem;
      return renderRows(
        [{ key: item.key, done: item.done ? "x" : "", state: item.state, name: item.name, task_id: item.taskId, checklist_id: item.checklistId }],
        ["key", "done", "state", "name", "task_id", "checklist_id"],
      );
    },
    run: (input, ctx) => {
      let resolved: boolean;
      if (ctx.source === "cli") {
        if ((input.resolved === true) === (input.open === true)) throw error.usage("Pass exactly one of --resolved or --open.");
        resolved = input.resolved === true;
      } else {
        resolved = input.resolved === true;
      }
      return setChecklistItemState(ctx.client, input.taskId as string, input.checklistId as string, input.itemId as string, resolved);
    },
  },
];
