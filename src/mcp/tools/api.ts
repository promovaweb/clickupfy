/**
 * Catalog tools: one MCP tool per operation of the public ClickUp API
 * (spec 0009).
 *
 * Each operation of `src/api/catalog.json` becomes the tool
 * `clickupfy_api_<version>_<slug>`, with the input built by
 * `operationShape` (`path`, `query`, `headers`, `body`, `contentType`,
 * `files`, and `confirm` on DELETE) plus `account`, and the annotations
 * `readOnlyHint`, `destructiveHint` and `openWorldHint`. The schemas are
 * dynamic, so these tools do not fit the `Operation` model and are
 * registered here. They are exposed by default, as in ClickUpfy 0.9.0; a
 * `--read-only` server only registers the operations that do not write.
 * Ids pinned by the server (workspace, space, folder, list) fill the
 * parameters the operation declares, are optional in the tool input and
 * refuse a different value; `team_id`/`workspace_id` default to the
 * workspace of the profile.
 */
import { z, type ZodType } from "zod";
import { apiOperations, operationShape, type ApiInput } from "../../api/catalog.ts";
import { applyScope, executeApiOperation, pinnedParams } from "../../api/execute.ts";
import { ClickUpClient } from "../../clickup/client.ts";
import type { Scope } from "../../clickup/scope.ts";
import { connectScoped, toolError, toolResult } from "../../operations/mcp.ts";
import type { Registrar } from "../server.ts";

/** Registers one tool per catalog operation, honoring the pinned scope. */
export function registerApiTools({ server, catalog }: Registrar, scope: Scope): void {
  for (const operation of apiOperations) {
    if (scope.readOnly && !operation.readOnly) continue;
    const description =
      `Run ${operation.method} ${operation.path} (ClickUp API ${operation.version}). Group: ${operation.group}. ` +
      `${operation.readOnly ? "Read-only." : "Changes data in ClickUp."}${operation.deprecated ? " Deprecated by the API." : ""} ` +
      "Path and query parameters go in path and query; the request body in body.";
    const inputSchema: Record<string, ZodType> = {
      // Pinned ids, and the workspace taken from the profile, become optional.
      ...operationShape(operation, pinnedParams(operation, operation.authenticated ? { ...scope, workspaceId: scope.workspaceId ?? "profile" } : scope)),
      account: z.string().optional().describe("Profile id. Defaults to the profile pinned by the server or the active one."),
    };
    catalog.tools.push({ name: operation.tool, description });
    server.registerTool(
      operation.tool,
      {
        title: `API ${operation.version}: ${operation.id}`,
        description,
        inputSchema,
        annotations: { readOnlyHint: operation.readOnly, destructiveHint: operation.method === "DELETE", openWorldHint: true },
      },
      async ({ account, ...input }: Record<string, unknown>) => {
        try {
          const ctx = operation.authenticated ? await connectScoped(scope, account as string | undefined) : undefined;
          const scoped = applyScope(operation, input as ApiInput, {
            ...scope,
            ...(ctx ? { workspaceId: scope.workspaceId ?? ctx.account.workspace.id } : {}),
          });
          return toolResult(await executeApiOperation(ctx?.client ?? new ClickUpClient(""), operation, scoped));
        } catch (e) {
          return toolError(e);
        }
      },
    );
  }
}
