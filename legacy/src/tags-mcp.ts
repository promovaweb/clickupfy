/** Ferramentas MCP de tags, com o mesmo perfil e Space fixados pelo servidor. */
import type { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { z } from "zod";
import type { ContextoClickUp } from "./context.js";
import {
  colorSchema,
  tagNameSchema,
  createSpaceTag,
  deleteSpaceTag,
  listSpaceTags,
  removeTaskTag,
  updateSpaceTag,
} from "./tags.js";

/** Resolve o Space explícito ou configurado e recusa a troca de um Space fixado. */
export function registerTagMcp(
  server: McpServer,
  options: { spaceId?: string; readOnly?: boolean },
  context: (account?: string) => Promise<ContextoClickUp>,
): void {
  const account = z.string().optional();
  const spaceId = z
    .string()
    .min(1)
    .optional()
    .describe("ID do Space; omita para usar o Space fixado no MCP.");
  function space(received?: string): string {
    if (options.spaceId && received && received !== options.spaceId)
      throw new Error(`Este MCP está fixado no Space ${options.spaceId}.`);
    const id = options.spaceId ?? received;
    if (!id) throw new Error("Informe spaceId ou configure o Space no MCP.");
    return id;
  }
  async function run(action: () => Promise<unknown>) {
    try {
      return {
        content: [
          {
            type: "text" as const,
            text: JSON.stringify(await action(), null, 2),
          },
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
  }
  server.registerTool(
    "clickupfy_tags_list",
    {
      title: "Listar tags do Space",
      description: "Consulta nomes e cores das tags disponíveis no Space.",
      inputSchema: { account, spaceId },
      annotations: { readOnlyHint: true },
    },
    ({ account, spaceId }) =>
      run(async () =>
        listSpaceTags((await context(account)).client, space(spaceId)),
      ),
  );
  if (options.readOnly) return;
  server.registerTool(
    "clickupfy_tag_create",
    {
      title: "Criar tag",
      description: "Cria uma tag com nome e cores no Space.",
      inputSchema: {
        account,
        spaceId,
        name: tagNameSchema,
        foreground: colorSchema,
        background: colorSchema,
      },
    },
    ({ account, spaceId, ...data }) =>
      run(async () => {
        const id = space(spaceId);
        await createSpaceTag((await context(account)).client, id, data);
        return { created: true, spaceId: id, name: data.name };
      }),
  );
  server.registerTool(
    "clickupfy_tag_update",
    {
      title: "Editar tag",
      description:
        "Renomeia ou altera cores da tag no Space, preservando os campos omitidos.",
      inputSchema: {
        account,
        spaceId,
        tagName: tagNameSchema,
        name: tagNameSchema.optional(),
        foreground: colorSchema.optional(),
        background: colorSchema.optional(),
      },
    },
    ({ account, spaceId, tagName, ...data }) =>
      run(async () => {
        const id = space(spaceId);
        const changes = Object.fromEntries(
          Object.entries(data).filter(([, value]) => value !== undefined),
        );
        await updateSpaceTag(
          (await context(account)).client,
          id,
          tagName,
          changes,
        );
        return { updated: true, spaceId: id, name: data.name ?? tagName };
      }),
  );
  server.registerTool(
    "clickupfy_tag_delete",
    {
      title: "Excluir tag",
      description: "Exclui a tag do Space; exige confirmação explícita.",
      inputSchema: {
        account,
        spaceId,
        tagName: tagNameSchema,
        confirm: z.literal(true),
      },
      annotations: { destructiveHint: true },
    },
    ({ account, spaceId, tagName }) =>
      run(async () => {
        const id = space(spaceId);
        await deleteSpaceTag((await context(account)).client, id, tagName);
        return { deleted: true, spaceId: id, name: tagName };
      }),
  );
  server.registerTool(
    "clickupfy_task_remove_tag",
    {
      title: "Remover tag da tarefa",
      description: "Remove a associação à tarefa e preserva a tag no Space.",
      inputSchema: {
        account,
        taskId: z.string().min(1),
        tagName: tagNameSchema,
        customTaskId: z.boolean().optional(),
      },
    },
    ({ account, taskId, tagName, customTaskId }) =>
      run(async () => {
        const ctx = await context(account);
        await removeTaskTag(
          ctx.client,
          taskId,
          tagName,
          customTaskId ? ctx.account.workspace.id : undefined,
        );
        return { removed: true, taskId, tagName };
      }),
  );
}
