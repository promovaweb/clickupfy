/**
 * Sprints of a Sprint folder (spec 0006).
 *
 * A Sprint is an existing ClickUp list whose `start_date` and `due_date` are
 * both set; lists without the period are regular lists. The status of a
 * Sprint (planned, active, completed) is computed against a reference date,
 * today by default or the `--at YYYY-MM-DD` option. Adding a task to a
 * Sprint uses the "tasks in multiple lists" endpoint, so the main list of
 * the task never changes. Same rules as ClickUpfy 0.9.0 (`legacy/src/sprints.ts`).
 */
import { error } from "../app/errors.ts";
import { ExitCode } from "../app/exit-codes.ts";
import { manifest } from "../app/manifest.ts";
import { renderRows } from "../operations/render.ts";
import type { Operation } from "../operations/types.ts";
import type { ClickUpClient } from "./client.ts";
import { getList, listLists, type HierarchyItem } from "./hierarchy.ts";
import { pinned } from "./scope.ts";

/** Status of a list seen as a Sprint. */
export type SprintStatus = "planned" | "active" | "completed" | "regular";

/** Compact view of a Sprint. */
export interface SprintSummary {
  id: string;
  name: string;
  startDate: string | null;
  dueDate: string | null;
  status: SprintStatus;
  taskCount: number;
  isSprint: boolean;
}

/** Sprint summary plus task and Sprint Points metrics. */
export interface SprintReport extends SprintSummary {
  totalTasks: number;
  completedTasks: number;
  openTasks: number;
  totalPoints: number;
  completedPoints: number;
  unestimatedTasks: number;
  taskCompletionPercent: number;
  pointsCompletionPercent: number | null;
  tasksByStatus: Record<string, number>;
}

/** Minimal task shape used by the Sprint metrics. */
export interface SprintTask {
  id: string;
  name: string;
  custom_id?: string | null;
  status?: { status?: string; type?: string };
  priority?: { priority?: string } | null;
  points?: number | null;
  assignees?: Array<{ id?: number | string; username?: string; email?: string }>;
  start_date?: string | null;
  due_date?: string | null;
  url?: string;
  [key: string]: unknown;
}

function timestamp(value: unknown): number | null {
  if (value === null || value === undefined || value === "") return null;
  const n = Number(value);
  return Number.isFinite(n) ? n : null;
}

/** True when the list has both `start_date` and `due_date`. */
export function isSprint(list: HierarchyItem): boolean {
  return timestamp(list.start_date) !== null && timestamp(list.due_date) !== null;
}

/** Converts a list into a Sprint summary at the reference time (ms). */
export function summarizeSprint(list: HierarchyItem, reference = Date.now()): SprintSummary {
  const start = timestamp(list.start_date);
  const due = timestamp(list.due_date);
  const candidate = start !== null && due !== null;
  let status: SprintStatus = "regular";
  if (candidate) status = reference < start ? "planned" : reference > due ? "completed" : "active";
  return {
    id: String(list.id),
    name: list.name,
    startDate: (list.start_date as string | null | undefined) ?? null,
    dueDate: (list.due_date as string | null | undefined) ?? null,
    status,
    taskCount: Number(list.task_count ?? 0) || 0,
    isSprint: candidate,
  };
}

/**
 * Parses a `YYYY-MM-DD` reference date into a timestamp at noon UTC, the
 * same convention as 0.9.0. Raises USAGE on an invalid date.
 */
export function referenceDate(value: string | undefined): number {
  if (value === undefined) return Date.now();
  if (!/^\d{4}-\d{2}-\d{2}$/.test(value)) throw error.usage(`Invalid date: ${value}. Use YYYY-MM-DD.`);
  const date = new Date(`${value}T12:00:00.000Z`);
  if (Number.isNaN(date.getTime()) || !date.toISOString().startsWith(value)) throw error.usage(`Invalid date: ${value}.`);
  return date.getTime();
}

/** Lists the Sprints of a Sprint folder; regular lists only on request. */
export async function listSprints(
  client: ClickUpClient,
  folderId: string,
  options: { archived?: boolean; includeRegular?: boolean; reference?: number } = {},
): Promise<SprintSummary[]> {
  const lists = await listLists(client, { folderId }, options.archived ?? false);
  const candidates = options.includeRegular ? lists : lists.filter(isSprint);
  return candidates.map((list) => summarizeSprint(list, options.reference ?? Date.now()));
}

/**
 * Finds the only active Sprint of a folder. No active Sprint raises
 * NOT_FOUND; more than one raises USAGE with the candidates in the details.
 */
export async function currentSprint(client: ClickUpClient, folderId: string, reference = Date.now()): Promise<SprintSummary> {
  const active = (await listSprints(client, folderId, { reference })).filter((s) => s.status === "active");
  if (active.length === 0) throw error.notFound(`No active Sprint found in folder ${folderId}.`, { folderId });
  if (active.length > 1) {
    const names = active.map((s) => `${s.name} (${s.id})`).join(", ");
    throw error.usage(`More than one Sprint is active in folder ${folderId}: ${names}. Check \`${manifest.bin} sprint list\`.`, {
      folderId,
      candidates: active.map((s) => ({ id: s.id, name: s.name, startDate: s.startDate, dueDate: s.dueDate })),
    });
  }
  return active[0] as SprintSummary;
}

async function sprintList(client: ClickUpClient, sprintId: string): Promise<HierarchyItem> {
  const list = await getList(client, sprintId);
  if (!isSprint(list)) throw error.usage(`List "${list.name}" has no Sprint start_date and due_date.`, { sprintId });
  return list;
}

/** Reads every task of a list, closed included, up to 100 pages of 100. */
export async function listAllTasks(client: ClickUpClient, listId: string): Promise<SprintTask[]> {
  const tasks: SprintTask[] = [];
  for (let page = 0; page < 100; page += 1) {
    const data = await client.request<{ tasks?: SprintTask[] }>("GET", `/list/${listId}/task`, {
      query: { include_closed: true, page },
    });
    const batch = data.tasks ?? [];
    tasks.push(...batch);
    if (batch.length < 100) break;
  }
  return tasks;
}

/** Compact task row, the same fields the 0.9.0 MCP returned. */
export function summarizeTask(task: SprintTask): Record<string, unknown> {
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

/** Tasks of a Sprint, closed included unless `openOnly`. */
export async function sprintTasks(client: ClickUpClient, sprintId: string, openOnly = false): Promise<SprintTask[]> {
  await sprintList(client, sprintId);
  const tasks = await listAllTasks(client, sprintId);
  return openOnly ? tasks.filter((t) => t.status?.type !== "closed") : tasks;
}

function sumPoints(tasks: SprintTask[]): number {
  return tasks.reduce((total, t) => total + (typeof t.points === "number" ? t.points : 0), 0);
}

function percent(part: number, total: number): number {
  if (total === 0) return 0;
  return Math.round((part / total) * 10_000) / 100;
}

/** Period, progress, status distribution and Sprint Points of a Sprint. */
export async function sprintReport(client: ClickUpClient, sprintId: string, reference = Date.now()): Promise<SprintReport> {
  const list = await sprintList(client, sprintId);
  const tasks = await listAllTasks(client, sprintId);
  const closed = tasks.filter((t) => t.status?.type === "closed");
  const totalPoints = sumPoints(tasks);
  const completedPoints = sumPoints(closed);
  const tasksByStatus: Record<string, number> = {};
  for (const t of tasks) {
    const status = t.status?.status ?? "no status";
    tasksByStatus[status] = (tasksByStatus[status] ?? 0) + 1;
  }
  return {
    ...summarizeSprint(list, reference),
    totalTasks: tasks.length,
    completedTasks: closed.length,
    openTasks: tasks.length - closed.length,
    totalPoints,
    completedPoints,
    unestimatedTasks: tasks.filter((t) => t.points == null).length,
    taskCompletionPercent: percent(closed.length, tasks.length),
    pointsCompletionPercent: totalPoints === 0 ? null : percent(completedPoints, totalPoints),
    tasksByStatus,
  };
}

/** Adds a task to a Sprint without changing its main list. */
export async function addTaskToSprint(client: ClickUpClient, sprintId: string, taskId: string) {
  await sprintList(client, sprintId);
  await client.request("POST", `/list/${sprintId}/task/${taskId}`);
  return { sprintId, taskId, added: true as const };
}

/** Removes only the association between a task and a Sprint. */
export async function removeTaskFromSprint(client: ClickUpClient, sprintId: string, taskId: string) {
  await sprintList(client, sprintId);
  await client.request("DELETE", `/list/${sprintId}/task/${taskId}`);
  return { sprintId, taskId, removed: true as const };
}

/** Sets the Sprint Points of a task. Raises USAGE on a negative value. */
export async function setSprintPoints(client: ClickUpClient, taskId: string, points: number): Promise<SprintTask> {
  if (!Number.isFinite(points) || points < 0) throw error.usage("Sprint Points must be a number greater than or equal to zero.");
  return client.request<SprintTask>("PUT", `/task/${taskId}`, { body: { points } });
}

const bin = manifest.bin;
const SPRINT_COLUMNS = ["id", "name", "status", "startDate", "dueDate", "taskCount"];
const TASK_COLUMNS = ["id", "name", "status", "points", "assignees"];

function folderOf(input: Record<string, unknown>, scope: { sprintFolderId?: string }): string {
  return pinned(scope.sprintFolderId, input.folderId as string | undefined, "Sprint folder", "--folder (folderId in MCP)");
}

const folderParam = {
  key: "folderId",
  option: "folder",
  type: "string",
  description: "Sprint folder id. Required in the CLI; in MCP, defaults to the pinned Sprint folder.",
} as const;
const atParam = { key: "at", type: "string", description: "Reference date (YYYY-MM-DD) used to compute the Sprint status. Defaults to today." } as const;
const sprintIdParam = { key: "sprintId", type: "string", positional: true, required: true, description: "Sprint (list) id." } as const;
const taskIdParam = { key: "taskId", type: "string", positional: true, required: true, description: "Task id." } as const;

export const sprintOperations: Operation[] = [
  {
    path: ["sprint", "list"],
    aliases: ["ls"],
    tool: "clickupfy_sprints_list",
    title: "List Sprints",
    description: "List the Sprints of a Sprint folder, identified by their period.",
    params: [
      folderParam,
      { key: "archived", type: "boolean", description: "Include archived lists." },
      { key: "includeRegular", type: "boolean", description: "Include regular lists of the Sprint folder." },
      atParam,
    ],
    effect: "read",
    exitCodes: [ExitCode.USAGE],
    examples: [`${bin} sprint list --folder 123`, `${bin} sprint ls --folder 123 --at 2026-11-13 --json`],
    text: (data) => renderRows((data as { sprints: Array<Record<string, unknown>> }).sprints, SPRINT_COLUMNS),
    run: async (input, ctx) => ({
      sprints: await listSprints(ctx.client, folderOf(input, ctx.scope), {
        archived: input.archived === true,
        includeRegular: input.includeRegular === true,
        reference: referenceDate(input.at as string | undefined),
      }),
    }),
  },
  {
    path: ["sprint", "current"],
    tool: "clickupfy_sprint_current",
    title: "Get current Sprint",
    description: "Get the only active Sprint of a Sprint folder.",
    longDescription: "No active Sprint exits with 6; more than one active Sprint exits with 2 and lists the candidates.",
    params: [folderParam, { ...atParam, description: "Reference date (YYYY-MM-DD) used to find the Sprint. Defaults to today." }],
    effect: "read",
    exitCodes: [ExitCode.USAGE],
    examples: [`${bin} sprint current --folder 123`, `${bin} sprint current --folder 123 --at 2026-11-13 --json`],
    run: async (input, ctx) => currentSprint(ctx.client, folderOf(input, ctx.scope), referenceDate(input.at as string | undefined)),
  },
  {
    path: ["sprint", "get"],
    tool: "clickupfy_sprint_get",
    title: "Get Sprint report",
    description: "Show the period, progress, status distribution and Sprint Points of a Sprint.",
    params: [sprintIdParam, atParam],
    effect: "read",
    exitCodes: [ExitCode.USAGE],
    examples: [`${bin} sprint get 901328052926`, `${bin} sprint get 901328052926 --json`],
    run: async (input, ctx) => sprintReport(ctx.client, input.sprintId as string, referenceDate(input.at as string | undefined)),
  },
  {
    path: ["sprint", "tasks"],
    tool: "clickupfy_sprint_tasks",
    title: "List Sprint tasks",
    description: "List every task associated with a Sprint, closed tasks included.",
    longDescription: "The CLI returns the full tasks; MCP returns compact rows, as in 0.9.0.",
    params: [sprintIdParam, { key: "openOnly", type: "boolean", description: "Omit closed tasks." }],
    effect: "read",
    exitCodes: [ExitCode.USAGE],
    examples: [`${bin} sprint tasks 901328052926`, `${bin} sprint tasks 901328052926 --open-only --json`],
    text: (data) => renderRows((data as { tasks: SprintTask[] }).tasks.map(summarizeTask), TASK_COLUMNS),
    run: async (input, ctx) => {
      const tasks = await sprintTasks(ctx.client, input.sprintId as string, input.openOnly === true);
      return { tasks: ctx.source === "mcp" ? tasks.map(summarizeTask) : tasks };
    },
  },
  {
    path: ["sprint", "add-task"],
    tool: "clickupfy_sprint_add_task",
    title: "Add task to Sprint",
    description: "Add a task to a Sprint without changing its main list.",
    params: [sprintIdParam, taskIdParam],
    effect: "write",
    exitCodes: [ExitCode.USAGE],
    examples: [`${bin} sprint add-task 901328052926 86abc123`],
    run: async (input, ctx) => addTaskToSprint(ctx.client, input.sprintId as string, input.taskId as string),
  },
  {
    path: ["sprint", "remove-task"],
    tool: "clickupfy_sprint_remove_task",
    title: "Remove task from Sprint",
    description: "Remove the association between a task and a Sprint without deleting the task.",
    params: [sprintIdParam, taskIdParam],
    effect: "write",
    exitCodes: [ExitCode.USAGE],
    examples: [`${bin} sprint remove-task 901328052926 86abc123`],
    run: async (input, ctx) => removeTaskFromSprint(ctx.client, input.sprintId as string, input.taskId as string),
  },
  {
    path: ["sprint", "set-points"],
    tool: "clickupfy_sprint_set_points",
    title: "Set Sprint Points",
    description: "Set the Sprint Points estimate of a task.",
    params: [taskIdParam, { key: "points", type: "number", positional: true, required: true, description: "Sprint Points, zero or more." }],
    effect: "write",
    exitCodes: [ExitCode.USAGE],
    examples: [`${bin} sprint set-points 86abc123 3`],
    text: (data) => renderRows([summarizeTask(data as SprintTask)], TASK_COLUMNS),
    run: async (input, ctx) => setSprintPoints(ctx.client, input.taskId as string, input.points as number),
  },
];
