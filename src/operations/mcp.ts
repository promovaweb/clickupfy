/**
 * Registers operations as MCP tools.
 *
 * Every tool receives an optional `account` plus the operation params as a
 * Zod schema. The profile follows the server scope: a pinned profile refuses
 * another `account`, and a pinned workspace must match the profile's
 * workspace. Write tools are skipped on a `--read-only` server and
 * destructive tools require `confirm: true`. Expected failures come back
 * with `isError` and the message, never as a crash of the server.
 */
import { z, type ZodType } from "zod";
import { AppError, error } from "../app/errors.ts";
import { connect } from "../clickup/accounts.ts";
import type { Scope } from "../clickup/scope.ts";
import type { Registrar } from "../mcp/server.ts";
import type { Operation, Param } from "./types.ts";

function zodFor(p: Param): ZodType {
  let schema: ZodType;
  switch (p.type) {
    case "boolean":
      schema = z.boolean();
      break;
    case "number":
      schema = z.number();
      break;
    case "integer":
      schema = z.number().int();
      break;
    case "strings":
      schema = z.array(z.string());
      break;
    default:
      schema = p.values ? z.enum(p.values as [string, ...string[]]) : z.string();
  }
  schema = schema.describe(p.description);
  return p.required ? schema : schema.optional();
}

/** Result envelope of a tool call. */
export interface ToolResult {
  [key: string]: unknown;
  content: Array<{ type: "text"; text: string }>;
  structuredContent?: Record<string, unknown>;
  isError?: boolean;
}

/** Wraps a value as a tool result; plain objects also go to structuredContent. */
export function toolResult(value: unknown): ToolResult {
  const text = typeof value === "string" ? value : JSON.stringify(value ?? null, null, 2);
  const structured = value && typeof value === "object" && !Array.isArray(value) ? (value as Record<string, unknown>) : undefined;
  return { content: [{ type: "text", text }], ...(structured ? { structuredContent: structured } : {}) };
}

/** Wraps a failure as a tool result with `isError`. */
export function toolError(e: unknown): ToolResult {
  const message = e instanceof Error ? e.message : String(e);
  const code = e instanceof AppError ? ` [exit code ${e.code}]` : "";
  return { content: [{ type: "text", text: `${message}${code}` }], isError: true };
}

/** Resolves the profile for a tool call honoring the pinned scope. */
export async function connectScoped(scope: Scope, account: string | undefined) {
  if (scope.accountId && account && account !== scope.accountId) {
    throw error.usage(`This MCP server is pinned to profile "${scope.accountId}".`);
  }
  const ctx = await connect(scope.accountId ?? account);
  if (scope.workspaceId && ctx.account.workspace.id !== scope.workspaceId) {
    throw error.usage(
      `This MCP server requires workspace ${scope.workspaceId}, but profile "${ctx.id}" uses ${ctx.account.workspace.id}.`,
    );
  }
  return ctx;
}

/** Registers every operation that has a tool name. */
export function registerOperations({ server, catalog }: Registrar, ops: readonly Operation[], scope: Scope): void {
  for (const op of ops) {
    if (!op.tool) continue;
    if (scope.readOnly && op.effect === "write") continue;
    const params = op.params.filter((p) => p.only !== "cli");
    const shape: Record<string, ZodType> = {
      account: z.string().optional().describe("Profile id. Defaults to the profile pinned by the server or the active one."),
    };
    for (const p of params) shape[p.key] = zodFor(p);
    if (op.destructive) shape.confirm = z.literal(true).describe("Must be true: confirms an irreversible change authorized by the user.");

    catalog.tools.push({ name: op.tool, description: op.description });
    server.registerTool(
      op.tool,
      {
        title: op.title,
        description: `${op.description}${op.longDescription ? ` ${op.longDescription}` : ""}`,
        inputSchema: shape,
        annotations: { readOnlyHint: op.effect === "read", destructiveHint: op.destructive === true, openWorldHint: true },
      },
      async (args: Record<string, unknown>) => {
        try {
          const { client, ...account } = await connectScoped(scope, args.account as string | undefined);
          const input: Record<string, unknown> = {};
          for (const p of params) if (args[p.key] !== undefined) input[p.key] = args[p.key];
          const data = await op.run(input, { account, client, scope, source: "mcp", warn: () => {} });
          return toolResult(data);
        } catch (e) {
          return toolError(e);
        }
      },
    );
  }
}
