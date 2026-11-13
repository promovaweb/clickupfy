/**
 * Tasks of a ClickUp list (spec 0004).
 *
 * Domain functions for listing, searching, reading, creating, updating and
 * deleting tasks, plus the task tag association, and the `taskOperations`
 * that expose them as `task ...` commands and `clickupfy_task*` tools.
 *
 * `task get` returns the API task plus an addressable execution queue: the
 * task, its subtasks and every checklist item, flattened in display order
 * with a stable `key` and the command that completes each item. The
 * checklist commands themselves belong to spec 0005, which reuses
 * `buildTaskReading` to confirm a checklist item state.
 *
 * Dates typed as YYYY-MM-DD are sent as the start of that day in the local
 * time zone of the machine, with `start_date_time`/`due_date_time` set to
 * false. ClickUpfy 0.9.0 sent midnight UTC, which shows up as the previous
 * day in time zones west of UTC (Brasília, for example).
 */
import { error } from "../app/errors.ts";
import { ExitCode } from "../app/exit-codes.ts";
import { manifest } from "../app/manifest.ts";
import { renderRows } from "../operations/render.ts";
import type { Operation, OperationContext } from "../operations/types.ts";
import type { ClickUpClient, ClickUpUser } from "./client.ts";
import { pinned } from "./scope.ts";

/** Checklist item as returned inside a task. */
export interface ClickUpChecklistItem {
  id: string;
  name: string;
  orderindex?: number | string;
  assignee?: ClickUpUser | null;
  resolved?: boolean;
  parent?: string | null;
}

/** Checklist with its items, as returned inside a task. */
export interface ClickUpChecklist {
  id: string;
  task_id?: string;
  name: string;
  orderindex?: number | string;
  resolved?: number;
  unresolved?: number;
  items?: ClickUpChecklistItem[];
}

/** Task payload of the v2 API (only the fields the binary reads). */
export interface ClickUpTask {
  id: string;
  custom_id?: string | null;
  name: string;
  description?: string;
  markdown_description?: string;
  text_content?: string;
  status?: { status?: string; color?: string; type?: string };
  priority?: { priority?: string; id?: string } | null;
  points?: number | null;
  assignees?: ClickUpUser[];
  url?: string;
  start_date?: string | null;
  due_date?: string | null;
  date_updated?: string;
  orderindex?: number | string;
  list?: { id?: string; name?: string };
  parent?: string | null;
  subtasks?: ClickUpTask[];
  checklists?: ClickUpChecklist[];
  [key: string]: unknown;
}

/** Filters of a task listing. */
export interface TaskFilters {
  status?: string[];
  assignees?: string[];
  includeClosed?: boolean;
  page?: number;
}

/** Filters of a task search. `query` is matched locally. */
export interface TaskSearchFilters extends Omit<TaskFilters, "page"> {
  query?: string;
  maxPages?: number;
}

const PAGE_SIZE = 100;
const MAX_PAGES = 100;

/** Lists one page (100 tasks) of a list. */
export async function listTasks(client: ClickUpClient, listId: string, filters: TaskFilters = {}): Promise<ClickUpTask[]> {
  const data = await client.request<{ tasks?: ClickUpTask[] }>("GET", `/list/${listId}/task`, {
    query: {
      include_closed: filters.includeClosed,
      page: filters.page,
      "statuses[]": filters.status,
      "assignees[]": filters.assignees,
    },
  });
  return data.tasks ?? [];
}

function clampPages(maxPages: number | undefined): number {
  return Math.min(Math.max(maxPages ?? MAX_PAGES, 1), MAX_PAGES);
}

function matchQuery(tasks: ClickUpTask[], query: string | undefined): ClickUpTask[] {
  const needle = query?.trim().toLocaleLowerCase();
  if (!needle) return tasks;
  return tasks.filter((t) =>
    [t.id, t.custom_id, t.name, t.description, t.text_content].some((v) => typeof v === "string" && v.toLocaleLowerCase().includes(needle)),
  );
}

/** Walks every page of a list (up to `maxPages`) and filters by text. */
export async function searchListTasks(client: ClickUpClient, listId: string, filters: TaskSearchFilters = {}): Promise<ClickUpTask[]> {
  const tasks: ClickUpTask[] = [];
  const { query, maxPages, ...rest } = filters;
  for (let page = 0; page < clampPages(maxPages); page += 1) {
    const batch = await listTasks(client, listId, { ...rest, page });
    tasks.push(...batch);
    if (batch.length < PAGE_SIZE) break;
  }
  return matchQuery(tasks, query);
}

/**
 * Searches the whole workspace. The API applies the structured filters; the
 * text is matched locally because the endpoint has no `query` parameter.
 */
export async function searchWorkspaceTasks(client: ClickUpClient, workspaceId: string, filters: TaskSearchFilters = {}): Promise<ClickUpTask[]> {
  const tasks: ClickUpTask[] = [];
  for (let page = 0; page < clampPages(filters.maxPages); page += 1) {
    const data = await client.request<{ tasks?: ClickUpTask[] }>("GET", `/team/${workspaceId}/task`, {
      query: {
        page,
        subtasks: true,
        include_closed: filters.includeClosed,
        "statuses[]": filters.status,
        "assignees[]": filters.assignees,
      },
    });
    const batch = data.tasks ?? [];
    tasks.push(...batch);
    if (batch.length < PAGE_SIZE) break;
  }
  return matchQuery(tasks, filters.query);
}

/** Reads a task with its subtasks and the Markdown description. */
export function getTask(client: ClickUpClient, taskId: string): Promise<ClickUpTask> {
  return client.request<ClickUpTask>("GET", `/task/${encodeURIComponent(taskId)}`, {
    query: { include_subtasks: true, include_markdown_description: true },
  });
}

/** Creates a task in a list. `body` uses the API field names. */
export function createTask(client: ClickUpClient, listId: string, body: Record<string, unknown>): Promise<ClickUpTask> {
  return client.request<ClickUpTask>("POST", `/list/${listId}/task`, { body });
}

/** Updates a task. `body` uses the API field names. */
export function updateTask(client: ClickUpClient, taskId: string, body: Record<string, unknown>): Promise<ClickUpTask> {
  return client.request<ClickUpTask>("PUT", `/task/${encodeURIComponent(taskId)}`, { body });
}

/** Deletes a task permanently. */
export async function deleteTask(client: ClickUpClient, taskId: string): Promise<void> {
  await client.request("DELETE", `/task/${encodeURIComponent(taskId)}`);
}

/** Rejects empty names and the `.`/`..` segments that would change the URL path. */
export function assertPathSegment(value: string, label: string): void {
  if (!value.trim() || value === "." || value === "..") throw error.usage(`Provide a valid ${label}.`);
}

/**
 * Adds or removes a tag on a task. `workspaceId` enables custom task ids in
 * that workspace. Removing keeps the tag in the space catalog.
 */
export async function setTaskTag(
  client: ClickUpClient,
  method: "POST" | "DELETE",
  taskId: string,
  tagName: string,
  workspaceId?: string,
): Promise<void> {
  assertPathSegment(taskId, "task id");
  assertPathSegment(tagName, "tag name");
  await client.request(method, `/task/${encodeURIComponent(taskId)}/tag/${encodeURIComponent(tagName)}`, {
    query: workspaceId ? { custom_task_ids: true, team_id: workspaceId } : {},
  });
}

/**
 * Converts YYYY-MM-DD into the timestamp (ms) of the start of that day in the
 * local time zone. Raises USAGE on a malformed or impossible date.
 */
export function localDayStart(value: string, flag = "date"): number {
  const match = /^(\d{4})-(\d{2})-(\d{2})$/.exec(value);
  if (!match) throw error.usage(`Invalid ${flag}: ${value}. Use YYYY-MM-DD.`);
  const [year, month, day] = [Number(match[1]), Number(match[2]), Number(match[3])];
  const date = new Date(year, month - 1, day, 0, 0, 0, 0);
  if (date.getFullYear() !== year || date.getMonth() !== month - 1 || date.getDate() !== day) {
    throw error.usage(`Invalid ${flag}: ${value}.`);
  }
  return date.getTime();
}

/** Compact view of a task used by listings and the MCP tools. */
export function summarizeTask(task: ClickUpTask): Record<string, unknown> {
  return {
    id: task.id,
    custom_id: task.custom_id ?? "",
    name: task.name,
    status: task.status?.status ?? "",
    priority: task.priority?.priority ?? "",
    points: task.points ?? "",
    assignees: (task.assignees ?? []).map((p) => p.username ?? p.email ?? p.id),
    start_date: task.start_date ?? "",
    due_date: task.due_date ?? "",
    url: task.url ?? "",
  };
}

// ---------------------------------------------------------------------------
// Execution queue of `task get`
// ---------------------------------------------------------------------------

/** Kind of an item of the execution queue. */
export type WorkItemType = "task" | "subtask" | "checklist_item";

/** Equivalent command for people (CLI) and agents (MCP). */
export interface WorkItemAction {
  cli: string;
  mcp: { tool: string; arguments: Record<string, unknown> };
}

/** One item of the queue, with hierarchy, state and update actions. */
export interface WorkItem {
  key: string;
  type: WorkItemType;
  id: string;
  taskId: string;
  parentKey?: string;
  depth: number;
  name: string;
  done: boolean;
  state: string;
  checklistId?: string;
  checklistName?: string;
  action: { complete: WorkItemAction; reopen?: WorkItemAction };
}

/** API task plus the flat, addressable queue of work items. */
export interface TaskReading {
  task: ClickUpTask;
  execution: {
    summary: { total: number; done: number; pending: number; tasks: number; subtasks: number; checklistItems: number };
    items: WorkItem[];
  };
}

function collectSubtasks(subtasks: ClickUpTask[]): ClickUpTask[] {
  const result: ClickUpTask[] = [];
  const seen = new Set<string>();
  const queue = [...subtasks];
  while (queue.length > 0) {
    const task = queue.shift();
    if (!task || seen.has(task.id)) continue;
    seen.add(task.id);
    result.push(task);
    queue.push(...(task.subtasks ?? []));
  }
  return result;
}

function byOrder<T extends { orderindex?: number | string }>(items: T[]): T[] {
  const order = (v: number | string | undefined) => {
    const n = v === undefined ? Number.NaN : Number(v);
    return Number.isFinite(n) ? n : Number.MAX_SAFE_INTEGER;
  };
  return [...items].sort((a, b) => order(a.orderindex) - order(b.orderindex));
}

function isClosed(task: ClickUpTask): boolean {
  const type = task.status?.type?.toLowerCase();
  return type === "closed" || type === "done";
}

/**
 * Keeps the full API task and adds a flat queue ordered and addressable by
 * `key` (`task:<id>` or `checklist:<checklist-id>:<item-id>`), so an agent
 * can work on one item at a time.
 */
export function buildTaskReading(root: ClickUpTask): TaskReading {
  const items: WorkItem[] = [];
  const subtasks = collectSubtasks(root.subtasks ?? []);
  const byParent = new Map<string, ClickUpTask[]>();
  for (const sub of subtasks) {
    if (!sub.parent) continue;
    byParent.set(sub.parent, [...(byParent.get(sub.parent) ?? []), sub]);
  }
  const visited = new Set<string>();

  const addChecklist = (taskId: string, checklist: ClickUpChecklist, depth: number, taskKey: string) => {
    const all = checklist.items ?? [];
    const ids = new Set(all.map((i) => i.id));
    const children = new Map<string, ClickUpChecklistItem[]>();
    for (const item of all) {
      const parent = item.parent && ids.has(item.parent) ? item.parent : "";
      children.set(parent, [...(children.get(parent) ?? []), item]);
    }
    const added = new Set<string>();
    const addItem = (item: ClickUpChecklistItem, itemDepth: number, parentKey: string) => {
      if (added.has(item.id)) return;
      added.add(item.id);
      const key = `checklist:${checklist.id}:${item.id}`;
      const resolved = Boolean(item.resolved);
      const args = { taskId, checklistId: checklist.id, itemId: item.id };
      const base = `${manifest.bin} checklist set ${taskId} ${checklist.id} ${item.id}`;
      items.push({
        key,
        type: "checklist_item",
        id: item.id,
        taskId,
        parentKey,
        depth: itemDepth,
        name: item.name,
        done: resolved,
        state: resolved ? "done" : "pending",
        checklistId: checklist.id,
        checklistName: checklist.name,
        action: {
          complete: { cli: `${base} --resolved`, mcp: { tool: "clickupfy_checklist_item_set", arguments: { ...args, resolved: true } } },
          reopen: { cli: `${base} --open`, mcp: { tool: "clickupfy_checklist_item_set", arguments: { ...args, resolved: false } } },
        },
      });
      for (const child of byOrder(children.get(item.id) ?? [])) addItem(child, itemDepth + 1, key);
    };
    for (const item of byOrder(children.get("") ?? [])) addItem(item, depth, taskKey);
    for (const item of byOrder(all)) addItem(item, depth, taskKey);
  };

  const addTask = (current: ClickUpTask, type: "task" | "subtask", depth: number, parentKey: string | undefined) => {
    if (visited.has(current.id)) return;
    visited.add(current.id);
    const key = `task:${current.id}`;
    items.push({
      key,
      type,
      id: current.id,
      taskId: current.id,
      ...(parentKey ? { parentKey } : {}),
      depth,
      name: current.name,
      done: isClosed(current),
      state: current.status?.status ?? "",
      action: {
        complete: {
          cli: `${manifest.bin} task update ${current.id} --status <done-status>`,
          mcp: { tool: "clickupfy_task_update", arguments: { taskId: current.id, status: "<done-status>" } },
        },
      },
    });
    for (const checklist of byOrder(current.checklists ?? [])) addChecklist(current.id, checklist, depth + 1, key);
    for (const child of byOrder(byParent.get(current.id) ?? [])) addTask(child, "subtask", depth + 1, key);
  };

  addTask(root, "task", 0, undefined);
  for (const orphan of subtasks) if (!visited.has(orphan.id)) addTask(orphan, "subtask", 1, `task:${root.id}`);

  const done = items.filter((i) => i.done).length;
  return {
    task: root,
    execution: {
      summary: {
        total: items.length,
        done,
        pending: items.length - done,
        tasks: items.filter((i) => i.type === "task").length,
        subtasks: items.filter((i) => i.type === "subtask").length,
        checklistItems: items.filter((i) => i.type === "checklist_item").length,
      },
      items,
    },
  };
}

function inline(value: string): string {
  return value
    .replaceAll("\\", "\\\\")
    .replaceAll("`", "'")
    .replaceAll("*", "\\*")
    .replaceAll("_", "\\_")
    .replaceAll("[", "\\[")
    .replaceAll("]", "\\]")
    .replace(/\s+/g, " ")
    .trim();
}

function code(value: string): string {
  return value.replaceAll("`", "'").replace(/\s+/g, " ").trim();
}

function descriptionOf(task: ClickUpTask): string | undefined {
  const text = task.markdown_description ?? task.description ?? task.text_content;
  return text?.trim() || undefined;
}

/**
 * Renders the reading as one Markdown document: metadata, description,
 * summary and the queue with checkboxes, stable keys and update commands.
 */
export function renderTaskReadingMarkdown(reading: TaskReading): string {
  const { task, execution } = reading;
  const tasks = new Map([task, ...collectSubtasks(task.subtasks ?? [])].map((t) => [t.id, t]));
  const lines = [`# ${inline(task.name)}`, "", `- **ID:** \`${code(task.id)}\``, `- **Status:** ${inline(task.status?.status ?? "no status")}`];
  if (task.priority?.priority) lines.push(`- **Priority:** ${inline(task.priority.priority)}`);
  if (task.points !== null && task.points !== undefined) lines.push(`- **Sprint Points:** ${task.points}`);
  if (task.assignees?.length) {
    lines.push(`- **Assignees:** ${task.assignees.map((p) => inline(p.username ?? p.email ?? String(p.id))).join(", ")}`);
  }
  if (task.start_date) lines.push(`- **Start date:** ${task.start_date}`);
  if (task.due_date) lines.push(`- **Due date:** ${task.due_date}`);
  if (task.url) lines.push(`- **ClickUp:** [Open task](${task.url})`);
  const description = descriptionOf(task);
  if (description) lines.push("", "## Description", "", description);
  const s = execution.summary;
  lines.push(
    "",
    "## Summary",
    "",
    `- **Total:** ${s.total}`,
    `- **Done:** ${s.done}`,
    `- **Pending:** ${s.pending}`,
    `- **Tasks:** ${s.tasks}`,
    `- **Subtasks:** ${s.subtasks}`,
    `- **Checklist items:** ${s.checklistItems}`,
    "",
    "## Work items",
    "",
  );
  for (const item of execution.items) {
    const indent = "  ".repeat(item.depth);
    const label = item.type === "task" ? "Task" : item.type === "subtask" ? "Subtask" : `Checklist · ${inline(item.checklistName ?? "Untitled")}`;
    lines.push(
      `${indent}- [${item.done ? "x" : " "}] **${label}:** ${inline(item.name)} \`${code(item.key)}\``,
      `${indent}  - **State:** ${inline(item.state || "no status")}`,
    );
    const owner = tasks.get(item.taskId);
    const itemDescription = item.type === "subtask" && owner ? descriptionOf(owner) : undefined;
    if (itemDescription) {
      lines.push(`${indent}  - **Description:**`);
      for (const line of itemDescription.split("\n")) lines.push(`${indent}    > ${line}`);
    }
    lines.push(`${indent}  - **Action:** \`${code(item.action.complete.cli)}\``);
  }
  return `${lines.join("\n").trimEnd()}\n`;
}

// ---------------------------------------------------------------------------
// Operations
// ---------------------------------------------------------------------------

const bin = manifest.bin;

function str(value: unknown): string | undefined {
  return typeof value === "string" ? value : undefined;
}

function priorityOf(value: unknown): number | undefined {
  if (value === undefined) return undefined;
  if (typeof value !== "number" || !Number.isInteger(value) || value < 1 || value > 4) {
    throw error.usage("Priority must be 1 (urgent), 2 (high), 3 (normal) or 4 (low).");
  }
  return value;
}

function pointsOf(value: unknown): number | undefined {
  if (value === undefined) return undefined;
  if (typeof value !== "number" || !Number.isFinite(value) || value < 0) throw error.usage("Points must be a non-negative number.");
  return value;
}

function assigneesOf(value: unknown): number[] | undefined {
  if (!Array.isArray(value)) return undefined;
  return value.map((v) => {
    const n = Number(v);
    if (!Number.isInteger(n)) throw error.usage(`Invalid assignee id: ${String(v)}. Use numeric user ids.`);
    return n;
  });
}

/**
 * Translates a date input into API fields. Text (CLI, YYYY-MM-DD) becomes the
 * local start of the day with `<field>_time: false`; a number (MCP) is a
 * timestamp in ms sent as is.
 */
function dateFields(field: "start_date" | "due_date", value: unknown, flag: string): Record<string, unknown> {
  if (value === undefined) return {};
  if (typeof value === "number") {
    if (!Number.isInteger(value)) throw error.usage(`${flag} must be a timestamp in milliseconds.`);
    return { [field]: value };
  }
  return { [field]: localDayStart(String(value), flag), [`${field}_time`]: false };
}

function compact(record: Record<string, unknown>): Record<string, unknown> {
  return Object.fromEntries(Object.entries(record).filter(([, v]) => v !== undefined));
}

function filtersOf(input: Record<string, unknown>): TaskFilters {
  return compact({
    status: input.status,
    assignees: input.assignees,
    includeClosed: input.includeClosed === true ? true : input.includeClosed === false ? false : undefined,
  }) as TaskFilters;
}

function taskRows(tasks: ReadonlyArray<Record<string, unknown>>): string {
  return renderRows(
    tasks.map((t) => {
      const s = typeof t.status === "string" ? t : summarizeTask(t as ClickUpTask);
      return { ...s, assignees: Array.isArray(s.assignees) ? s.assignees.join(", ") : s.assignees };
    }),
    ["id", "name", "status", "priority", "assignees", "url"],
  );
}

/** Full tasks in the CLI `--json`; compact rows in MCP, as in 0.9.0. */
function listing(tasks: ClickUpTask[], ctx: OperationContext): { tasks: unknown[] } {
  return { tasks: ctx.source === "mcp" ? tasks.map(summarizeTask) : tasks };
}

const statusFilter = { key: "status", type: "strings", description: "Accepted statuses." } as const;
const assigneeFilter = { key: "assignees", option: "assignee", type: "strings", description: "Assignee user ids." } as const;
const includeClosed = { key: "includeClosed", type: "boolean", description: "Include closed tasks." } as const;
const listParam = { key: "listId", option: "list", type: "string", description: "List id. In MCP, defaults to the pinned list." } as const;
const taskIdParam = { key: "taskId", type: "string", positional: true, required: true, description: "Task id." } as const;
const customTaskId = { key: "customTaskId", type: "boolean", description: "Treat the task id as a custom id of the profile workspace." } as const;

export const taskOperations: Operation[] = [
  {
    path: ["task", "list"],
    aliases: ["ls"],
    tool: "clickupfy_tasks_list",
    title: "List tasks",
    description: "List the tasks of a list.",
    longDescription: "Returns one page of up to 100 tasks. The MCP tool returns compact rows.",
    params: [listParam, statusFilter, assigneeFilter, includeClosed, { key: "page", type: "integer", description: "Page number, starting at zero." }],
    effect: "read",
    exitCodes: [ExitCode.USAGE],
    examples: [`${bin} task list --list 901328052926`, `${bin} task ls --list 901328052926 --status "to do,in progress" --json`],
    text: (data) => taskRows((data as { tasks: Array<Record<string, unknown>> }).tasks),
    run: async (input, ctx) => {
      const page = input.page as number | undefined;
      if (page !== undefined && page < 0) throw error.usage("--page must be zero or greater.");
      const listId = pinned(ctx.scope.listId, str(input.listId), "list", "--list");
      return listing(await listTasks(ctx.client, listId, { ...filtersOf(input), ...(page !== undefined ? { page } : {}) }), ctx);
    },
  },
  {
    path: ["task", "get"],
    tool: "clickupfy_task_get",
    title: "Get task",
    description: "Get a task and its addressable queue of subtasks and checklist items.",
    longDescription:
      "The default output is { task, execution } with a stable key and the completing command for each item. --raw returns only the API task; --markdown returns one Markdown document.",
    params: [
      taskIdParam,
      { key: "raw", type: "boolean", description: "Return only the original ClickUp response." },
      { key: "markdown", type: "boolean", description: "Join the task and its items in one Markdown document." },
    ],
    effect: "read",
    exitCodes: [ExitCode.USAGE],
    examples: [`${bin} task get 86abc123`, `${bin} task get 86abc123 --markdown`, `${bin} task get 86abc123 --json`],
    text: (data) => {
      if (typeof data === "string") return data;
      const record = data as Partial<TaskReading> & ClickUpTask;
      if (!record.execution) return JSON.stringify(record, null, 2);
      return renderRows(
        record.execution.items.map((i) => ({
          key: i.key,
          type: i.type,
          done: i.done ? "x" : "",
          state: i.state,
          name: `${"  ".repeat(i.depth)}${i.name}`,
          checklist_id: i.checklistId ?? "",
        })),
        ["key", "type", "done", "state", "name", "checklist_id"],
      );
    },
    run: async (input, ctx) => {
      if (input.raw === true && input.markdown === true) throw error.usage("Use only one of --raw and --markdown.");
      const task = await getTask(ctx.client, input.taskId as string);
      if (input.raw === true) return task;
      const reading = buildTaskReading(task);
      return input.markdown === true ? renderTaskReadingMarkdown(reading) : reading;
    },
  },
  {
    path: ["task", "search"],
    tool: "clickupfy_tasks_search",
    title: "Search tasks",
    description: "Search tasks by text, status and assignee.",
    longDescription:
      "The CLI searches the whole workspace of the profile. The MCP tool searches only the pinned list, walking every page; without a pinned list it searches the workspace. The text matches the id, custom id, name or description.",
    params: [
      { key: "query", type: "string", description: "Text in the name, description or id." },
      statusFilter,
      assigneeFilter,
      includeClosed,
      { key: "maxPages", type: "integer", description: "Maximum pages of 100 tasks to read (1 to 100, default 100)." },
    ],
    effect: "read",
    exitCodes: [ExitCode.USAGE],
    examples: [`${bin} task search --query login`, `${bin} task search --query "checkout" --include-closed --json`],
    text: (data) => taskRows((data as { tasks: Array<Record<string, unknown>> }).tasks),
    run: async (input, ctx) => {
      const maxPages = input.maxPages as number | undefined;
      if (maxPages !== undefined && (maxPages < 1 || maxPages > MAX_PAGES)) throw error.usage("--max-pages must be between 1 and 100.");
      const filters: TaskSearchFilters = { ...filtersOf(input), ...compact({ query: str(input.query), maxPages }) };
      const tasks =
        ctx.source === "mcp" && ctx.scope.listId
          ? await searchListTasks(ctx.client, ctx.scope.listId, filters)
          : await searchWorkspaceTasks(ctx.client, ctx.account.account.workspace.id, filters);
      return listing(tasks, ctx);
    },
  },
  {
    path: ["task", "create"],
    tool: "clickupfy_task_create",
    title: "Create task",
    description: "Create a task in a list.",
    longDescription:
      "Dates in the CLI use YYYY-MM-DD and are saved as the start of that day in the local time zone; MCP dates are timestamps in milliseconds. --markdown-content keeps the description as Markdown.",
    params: [
      listParam,
      { key: "name", type: "string", required: true, description: "Task name." },
      { key: "description", type: "string", description: "Plain text description." },
      { key: "markdownContent", type: "string", description: "Description kept as Markdown." },
      { key: "status", type: "string", description: "Initial status." },
      { key: "priority", type: "integer", description: "Priority: 1 urgent, 2 high, 3 normal, 4 low." },
      { key: "assignees", option: "assignee", type: "strings", description: "Numeric assignee user ids." },
      { key: "parent", type: "string", description: "Parent task id; creates a subtask." },
      { key: "startDate", type: "string", only: "cli", description: "Start date, YYYY-MM-DD (local start of day)." },
      { key: "startDate", type: "integer", only: "mcp", description: "Start date as a timestamp in milliseconds." },
      { key: "dueDate", type: "string", only: "cli", description: "Due date, YYYY-MM-DD (local start of day)." },
      { key: "dueDate", type: "integer", only: "mcp", description: "Due date as a timestamp in milliseconds." },
      { key: "points", type: "number", description: "Sprint Points." },
    ],
    effect: "write",
    exitCodes: [ExitCode.USAGE],
    examples: [
      `${bin} task create --list 901328052926 --name "Fix login" --priority 2`,
      `${bin} task create --list 901328052926 --name "Subtask" --parent 86abc123 --start-date 2026-11-13 --json`,
    ],
    text: (data) => taskRows([data as ClickUpTask]),
    run: async (input, ctx) => {
      const listId = pinned(ctx.scope.listId, str(input.listId), "list", "--list");
      if (!str(input.name)?.trim()) throw error.usage("Provide the task name with --name.");
      const body = compact({
        name: input.name,
        description: input.description,
        markdown_content: input.markdownContent,
        status: input.status,
        priority: priorityOf(input.priority),
        assignees: assigneesOf(input.assignees),
        parent: input.parent,
        ...dateFields("start_date", input.startDate, "--start-date"),
        ...dateFields("due_date", input.dueDate, "--due-date"),
        points: pointsOf(input.points),
      });
      return createTask(ctx.client, listId, body);
    },
  },
  {
    path: ["task", "update"],
    tool: "clickupfy_task_update",
    title: "Update task",
    description: "Update the name, description, status, priority, dates or points of a task.",
    longDescription: "Pass at least one field. --clear-start-date and --clear-due-date remove the dates.",
    params: [
      taskIdParam,
      { key: "name", type: "string", description: "New name." },
      { key: "description", type: "string", description: "New plain text description." },
      { key: "markdownContent", type: "string", description: "New description as Markdown." },
      { key: "status", type: "string", description: "New status." },
      { key: "priority", type: "integer", description: "Priority: 1 urgent, 2 high, 3 normal, 4 low." },
      { key: "startDate", type: "string", only: "cli", description: "New start date, YYYY-MM-DD (local start of day)." },
      { key: "startDate", type: "integer", only: "mcp", description: "New start date as a timestamp in milliseconds." },
      { key: "clearStartDate", type: "boolean", description: "Remove the start date." },
      { key: "dueDate", type: "string", only: "cli", description: "New due date, YYYY-MM-DD (local start of day)." },
      { key: "dueDate", type: "integer", only: "mcp", description: "New due date as a timestamp in milliseconds." },
      { key: "clearDueDate", type: "boolean", description: "Remove the due date." },
      { key: "points", type: "number", description: "Sprint Points." },
    ],
    effect: "write",
    exitCodes: [ExitCode.USAGE],
    examples: [`${bin} task update 86abc123 --status "in progress"`, `${bin} task update 86abc123 --due-date 2026-11-20 --json`],
    text: (data) => taskRows([data as ClickUpTask]),
    run: async (input, ctx) => {
      if (input.clearStartDate === true && input.startDate !== undefined) throw error.usage("Use --start-date or --clear-start-date, not both.");
      if (input.clearDueDate === true && input.dueDate !== undefined) throw error.usage("Use --due-date or --clear-due-date, not both.");
      const body = compact({
        name: input.name,
        description: input.description,
        markdown_content: input.markdownContent,
        status: input.status,
        priority: priorityOf(input.priority),
        ...(input.clearStartDate === true ? { start_date: null } : dateFields("start_date", input.startDate, "--start-date")),
        ...(input.clearDueDate === true ? { due_date: null } : dateFields("due_date", input.dueDate, "--due-date")),
        points: pointsOf(input.points),
      });
      if (Object.keys(body).length === 0) throw error.usage("Provide at least one field to update.");
      return updateTask(ctx.client, input.taskId as string, body);
    },
  },
  {
    path: ["task", "delete"],
    tool: "clickupfy_task_delete",
    title: "Delete task",
    description: "Delete a task permanently.",
    longDescription: "Use only with explicit authorization from the user.",
    params: [taskIdParam],
    effect: "write",
    destructive: true,
    exitCodes: [ExitCode.USAGE],
    examples: [`${bin} task delete 86abc123 --yes`],
    text: (data) => `Task deleted: ${(data as { taskId: string }).taskId}`,
    run: async (input, ctx) => {
      await deleteTask(ctx.client, input.taskId as string);
      return { deleted: true, taskId: input.taskId };
    },
  },
  {
    path: ["task", "add-tag"],
    tool: "clickupfy_task_add_tag",
    title: "Add tag to task",
    description: "Add a tag to a task without replacing its other tags.",
    params: [taskIdParam, { key: "tagName", type: "string", positional: true, required: true, description: "Tag name." }, customTaskId],
    effect: "write",
    exitCodes: [ExitCode.USAGE],
    examples: [`${bin} task add-tag 86abc123 backend`, `${bin} task add-tag DEV-42 backend --custom-task-id`],
    text: (data) => {
      const d = data as { taskId: string; tagName: string };
      return `Tag "${d.tagName}" added to task ${d.taskId}.`;
    },
    run: async (input, ctx) => {
      const taskId = input.taskId as string;
      const tagName = input.tagName as string;
      await setTaskTag(ctx.client, "POST", taskId, tagName, input.customTaskId === true ? ctx.account.account.workspace.id : undefined);
      return { added: true, taskId, tagName };
    },
  },
  {
    path: ["task", "remove-tag"],
    tool: "clickupfy_task_remove_tag",
    title: "Remove tag from task",
    description: "Remove a tag from a task, keeping the tag in the space catalog.",
    params: [taskIdParam, { key: "tagName", type: "string", positional: true, required: true, description: "Tag name." }, customTaskId],
    effect: "write",
    exitCodes: [ExitCode.USAGE],
    examples: [`${bin} task remove-tag 86abc123 backend`],
    text: (data) => {
      const d = data as { taskId: string; tagName: string };
      return `Tag "${d.tagName}" removed from task ${d.taskId}.`;
    },
    run: async (input, ctx) => {
      const taskId = input.taskId as string;
      const tagName = input.tagName as string;
      await setTaskTag(ctx.client, "DELETE", taskId, tagName, input.customTaskId === true ? ctx.account.account.workspace.id : undefined);
      return { removed: true, taskId, tagName };
    },
  },
];
