/** Expõe cada operação oficial como ferramenta MCP, com contratos e modo somente leitura. */
import type { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { z } from "zod";
import { ClickUpClient } from "../clickup.js";
import type { ContextoClickUp } from "../context.js";
import { operations, operationShape, type ApiInput } from "./catalog.js";
import { applyScope, executeOperation, type ApiScope } from "./execute.js";

/** Usa a resolução de perfil do servidor para preservar suas restrições existentes. */
export function registerApiMcp(
  server: McpServer,
  options: ApiScope & { readOnly?: boolean },
  context: (account?: string) => Promise<ContextoClickUp>,
): void {
  for (const operation of operations) {
    if (options.readOnly && !operation.readOnly) continue;
    const shape = operationShape(operation);
    server.registerTool(
      operation.tool,
      {
        title: `API ${operation.version}: ${operation.id}`,
        description: `Executa ${operation.method} ${operation.path}. Grupo: ${operation.group}. ${operation.readOnly ? "Consulta sem escrita." : "Altera dados no ClickUp."}${operation.deprecated ? " Endpoint obsoleto na API." : ""} Parâmetros em path e query; corpo em body.`,
        inputSchema: {
          ...shape,
          account: z
            .string()
            .optional()
            .describe(
              "Perfil ativo por padrão; respeita o perfil fixado no servidor.",
            ),
        },
        annotations: {
          readOnlyHint: operation.readOnly,
          destructiveHint: operation.method === "DELETE",
          openWorldHint: true,
        },
      },
      async ({ account, ...input }) => {
        try {
          const ctx = operation.authenticated
            ? await context(account as string | undefined)
            : undefined;
          const scoped = applyScope(operation, input as ApiInput, {
            ...options,
            ...(ctx
              ? { workspaceId: options.workspaceId ?? ctx.account.workspace.id }
              : {}),
          });
          const result = await executeOperation(
            ctx?.client ?? new ClickUpClient(""),
            operation,
            scoped,
          );
          return {
            content: [
              { type: "text" as const, text: JSON.stringify(result, null, 2) },
            ],
          };
        } catch (error) {
          return {
            isError: true,
            content: [
              {
                type: "text" as const,
                text: error instanceof Error ? error.message : String(error),
              },
            ],
          };
        }
      },
    );
  }
}
