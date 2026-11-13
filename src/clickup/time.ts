/**
 * Time tracking on the workspace bound to the profile (spec 0007).
 *
 * `time current|start|stop` call `/team/{workspace}/time_entries/...`. The
 * ClickUp payload wraps the entry in `data`; the operations return it as
 * `{ entry }`, with `entry: null` when no timer is running. Before starting,
 * `time start` reads the running timer: ClickUp silently swaps a timer that
 * runs on another task, so the swap is reported as `previous` (and as a
 * warning on stderr in the CLI) without blocking it.
 */
import { manifest } from "../app/manifest.ts";
import { color, table } from "../cli/format.ts";
import { formatTimestamp } from "../operations/render.ts";
import type { Operation } from "../operations/types.ts";
import type { ClickUpClient } from "./client.ts";

/** Time entry as returned by ClickUp. */
export interface TimeEntry {
  id: string;
  task?: { id?: string; name?: string; custom_id?: string | null } | null;
  description?: string;
  start?: string | number;
  duration?: string | number;
  [key: string]: unknown;
}

/** Timer that `time start` replaced on another task. */
export interface PreviousTimer {
  id: string;
  taskId: string | null;
  taskName: string | null;
  description: string;
  start: string | number | null;
}

function workspaceTimePath(workspaceId: string, action: string): string {
  return `/team/${encodeURIComponent(workspaceId)}/time_entries/${action}`;
}

/** Returns the running time entry of the workspace, or null. */
export async function currentTimeEntry(client: ClickUpClient, workspaceId: string): Promise<TimeEntry | null> {
  const data = await client.request<{ data?: TimeEntry | null } | null>("GET", workspaceTimePath(workspaceId, "current"));
  return data?.data ?? null;
}

/** Starts a time entry on a task. */
export async function startTimeEntry(
  client: ClickUpClient,
  workspaceId: string,
  entry: { tid: string; description?: string },
): Promise<TimeEntry | null> {
  const data = await client.request<{ data?: TimeEntry | null } | null>("POST", workspaceTimePath(workspaceId, "start"), { body: entry });
  return data?.data ?? null;
}

/** Stops the running time entry of the workspace. */
export async function stopTimeEntry(client: ClickUpClient, workspaceId: string): Promise<TimeEntry | null> {
  const data = await client.request<{ data?: TimeEntry | null } | null>("POST", workspaceTimePath(workspaceId, "stop"));
  return data?.data ?? null;
}

function describeEntry(entry: TimeEntry | null | undefined): string {
  if (!entry) return color.dim("no timer running");
  return table([
    ["id", String(entry.id)],
    ["task", entry.task ? `${entry.task.name ?? "-"} (${entry.task.id ?? "-"})` : "-"],
    ["description", entry.description || "-"],
    ["start", entry.start === undefined ? "-" : (formatTimestamp(entry.start) ?? String(entry.start))],
    ["duration", entry.duration === undefined ? "-" : Number(entry.duration) < 0 ? "running" : `${Math.round(Number(entry.duration) / 60000)} min`],
  ]);
}

const bin = manifest.bin;

export const timeOperations: Operation[] = [
  {
    path: ["time", "current"],
    tool: "clickupfy_time_current",
    title: "Current timer",
    description: "Show the running time entry of the workspace.",
    longDescription: "Returns `{ entry: null }` with exit 0 when no timer is running.",
    params: [],
    effect: "read",
    examples: [`${bin} time current`, `${bin} time current --json`],
    text: (data) => describeEntry((data as { entry: TimeEntry | null }).entry),
    run: async (_input, ctx) => ({ entry: await currentTimeEntry(ctx.client, ctx.account.account.workspace.id) }),
  },
  {
    path: ["time", "start"],
    tool: "clickupfy_time_start",
    title: "Start timer",
    description: "Start a time entry on a task.",
    longDescription:
      "When a timer runs on another task, ClickUp replaces it: the replaced timer comes back in `previous` and the CLI warns on stderr.",
    params: [
      { key: "taskId", option: "task", type: "string", required: true, description: "Task id." },
      { key: "description", type: "string", description: "Description of the work." },
    ],
    effect: "write",
    examples: [`${bin} time start --task 86abc123`, `${bin} time start --task 86abc123 --description "Implement the parser" --json`],
    text: (data) => {
      const { entry, previous } = data as { entry: TimeEntry | null; previous?: PreviousTimer };
      const head = previous ? `${color.dim(`replaced the timer on ${previous.taskName ?? "-"} (${previous.taskId ?? "-"})`)}\n` : "";
      return `${head}${describeEntry(entry)}`;
    },
    run: async (input, ctx) => {
      const workspaceId = ctx.account.account.workspace.id;
      const taskId = input.taskId as string;
      const running = await currentTimeEntry(ctx.client, workspaceId);
      let previous: PreviousTimer | undefined;
      if (running && running.task?.id !== taskId) {
        previous = {
          id: String(running.id),
          taskId: running.task?.id ?? null,
          taskName: running.task?.name ?? null,
          description: running.description ?? "",
          start: running.start ?? null,
        };
        ctx.warn(
          `Warning: a timer was running on task ${previous.taskId ?? "(none)"}${previous.taskName ? ` "${previous.taskName}"` : ""}; ClickUp stops it and starts the new one.`,
        );
      }
      const entry = await startTimeEntry(ctx.client, workspaceId, {
        tid: taskId,
        ...(input.description !== undefined ? { description: input.description as string } : {}),
      });
      return { entry, ...(previous ? { previous } : {}) };
    },
  },
  {
    path: ["time", "stop"],
    tool: "clickupfy_time_stop",
    title: "Stop timer",
    description: "Stop the running time entry of the workspace.",
    params: [],
    effect: "write",
    examples: [`${bin} time stop`, `${bin} time stop --json`],
    text: (data) => describeEntry((data as { entry: TimeEntry | null }).entry),
    run: async (_input, ctx) => ({ entry: await stopTimeEntry(ctx.client, ctx.account.account.workspace.id) }),
  },
];
