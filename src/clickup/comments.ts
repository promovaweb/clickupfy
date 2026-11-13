/**
 * Task comments (spec 0005).
 *
 * Agents read the comment history of a task and publish progress comments.
 * The list walks the ClickUp cursor (25 comments per page, the last comment
 * is the reference for the next page) with a page ceiling, as 0.9.0 did.
 */
import { manifest } from "../app/manifest.ts";
import { renderRows } from "../operations/render.ts";
import type { Operation } from "../operations/types.ts";
import type { ClickUpClient } from "./client.ts";

/** Comment as returned by ClickUp. */
export interface CommentPayload {
  id: number | string;
  comment_text?: string;
  comment?: Array<{ text?: string }>;
  user?: { id?: number | string; username?: string; email?: string };
  date?: string;
  [key: string]: unknown;
}

/** Summary of a comment: author, date and text. */
export interface CommentSummary {
  id: number | string;
  user: string | number;
  date: string;
  text: string;
}

const PAGE_SIZE = 25;
const MAX_PAGES = 100;

/** Lists every comment of a task, following the ClickUp cursor. */
export async function listComments(client: ClickUpClient, taskId: string): Promise<CommentPayload[]> {
  const comments: CommentPayload[] = [];
  let start: string | undefined;
  let startId: string | undefined;
  // The ceiling stops a remote loop if the API keeps returning the same page.
  for (let page = 0; page < MAX_PAGES; page += 1) {
    const data = await client.request<{ comments?: CommentPayload[] }>("GET", `/task/${encodeURIComponent(taskId)}/comment`, {
      query: { start, start_id: startId },
    });
    const batch = data.comments ?? [];
    comments.push(...batch);
    if (batch.length < PAGE_SIZE) break;
    const last = batch.at(-1);
    const nextStart = last?.date;
    const nextStartId = last?.id === undefined ? undefined : String(last.id);
    if (!nextStart || !nextStartId) break;
    if (nextStart === start && nextStartId === startId) break;
    start = nextStart;
    startId = nextStartId;
  }
  return comments;
}

/** Reduces a comment to author, date and text. */
export function summarizeComment(comment: CommentPayload): CommentSummary {
  return {
    id: comment.id,
    user: comment.user?.username ?? comment.user?.email ?? comment.user?.id ?? "",
    date: comment.date ?? "",
    text: comment.comment_text ?? comment.comment?.map((part) => part.text ?? "").join("") ?? "",
  };
}

/** Publishes a comment on a task. Returns `{ id, hist_id, date }` from ClickUp. */
export function createComment(
  client: ClickUpClient,
  taskId: string,
  text: string,
  notifyAll = false,
): Promise<{ id: number | string; hist_id?: string; date?: number }> {
  return client.request("POST", `/task/${encodeURIComponent(taskId)}/comment`, {
    body: { comment_text: text, notify_all: notifyAll },
  });
}

const bin = manifest.bin;

export const commentOperations: Operation[] = [
  {
    path: ["comment", "list"],
    aliases: ["ls"],
    tool: "clickupfy_comments_list",
    title: "List comments",
    description: "Read the comment history of a task.",
    params: [{ key: "taskId", option: "task", type: "string", required: true, description: "Task id." }],
    effect: "read",
    examples: [`${bin} comment list --task 86abc123`, `${bin} comment ls --task 86abc123 --json`],
    text: (data) => renderRows((data as { comments: CommentSummary[] }).comments as unknown as Array<Record<string, unknown>>, ["id", "user", "date", "text"]),
    run: async (input, ctx) => ({
      comments: (await listComments(ctx.client, input.taskId as string)).map(summarizeComment),
    }),
  },
  {
    path: ["comment", "create"],
    tool: "clickupfy_comment_create",
    title: "Create comment",
    description: "Publish a progress comment on a task.",
    params: [
      { key: "taskId", option: "task", type: "string", required: true, description: "Task id." },
      { key: "text", type: "string", required: true, description: "Comment text." },
      { key: "notifyAll", type: "boolean", description: "Notify every participant of the task." },
    ],
    effect: "write",
    examples: [`${bin} comment create --task 86abc123 --text "Plan: ..."`, `${bin} comment create --task 86abc123 --text "Done" --notify-all --json`],
    run: (input, ctx) => createComment(ctx.client, input.taskId as string, input.text as string, input.notifyAll === true),
  },
];
