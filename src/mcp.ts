/**
 * Servidor MCP stdio com ferramentas voltadas ao fluxo de desenvolvimento.
 */

import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { StdioServerTransport } from "@modelcontextprotocol/sdk/server/stdio.js";
import { z } from "zod";
import {
  lerConfiguracao,
  resolverAccount,
  salvarConfiguracao,
} from "./config.js";
import { criarContexto } from "./context.js";
import { resumirComentario, resumirTarefa } from "./output.js";
import {
  adicionarTarefaASprint,
  definirSprintPoints,
  listarSprints,
  listarTarefasSprint,
  obterRelatorioSprint,
  obterSprintAtual,
  removerTarefaDaSprint,
} from "./sprints.js";

/** Hierarquia opcional fixada pelos argumentos do MCP de um projeto. */
export interface McpServerOptions {
  accountId?: string;
  workspaceId?: string;
  spaceId?: string;
  folderId?: string;
  listId?: string;
  sprintFolderId?: string;
  readOnly?: boolean;
}

type McpResult = {
  content: Array<{ type: "text"; text: string }>;
  isError?: boolean;
};

/** Cria um resultado textual compacto aceito por qualquer cliente MCP. */
function resultado(valor: unknown): McpResult {
  return {
    content: [{ type: "text", text: JSON.stringify(valor, null, 2) }],
  };
}

/** Impede que falhas conhecidas encerrem o processo MCP. */
async function executar(
  operacao: () => Promise<unknown>,
): Promise<McpResult> {
  try {
    return resultado(await operacao());
  } catch (error) {
    return {
      content: [
        {
          type: "text",
          text: error instanceof Error ? error.message : String(error),
        },
      ],
      isError: true,
    };
  }
}

/**
 * Registra as ferramentas. Em modo somente leitura, ferramentas que alteram o
 * ClickUp ou o perfil ativo sequer aparecem em `tools/list`.
 */
export function createMcpServer(options: McpServerOptions = {}): McpServer {
  const server = new McpServer({
    name: "promovaweb-clickupfy",
    version: "0.1.0",
  });
  const accountSchema = {
    account: z
      .string()
      .optional()
      .describe("Perfil; o MCP do projeto pode fixar esse valor."),
  };
  const contexto = (account?: string) => criarContextoMcp(options, account);

  server.registerTool(
    "clickupfy_mcp_context",
    {
      title: "Consultar escopo do MCP",
      description:
        "Mostra o perfil e a hierarquia fixados pelo MCP deste projeto.",
      inputSchema: accountSchema,
    },
    ({ account }) =>
      executar(async () => {
        const ctx = await contexto(account);
        return {
          account: ctx.accountId,
          workspace: ctx.account.workspace,
          scope: {
            workspaceId: options.workspaceId ?? ctx.account.workspace.id,
            spaceId: options.spaceId,
            folderId: options.folderId,
            listId: options.listId,
            sprintFolderId: options.sprintFolderId,
          },
        };
      }),
  );

  server.registerTool(
    "clickupfy_accounts_list",
    {
      title: "Listar perfis do ClickUp",
      description:
        "Lista perfis configurados localmente, sem revelar nenhuma API key.",
      inputSchema: {},
    },
    () =>
      executar(async () => {
        const config = await lerConfiguracao();
        return Object.entries(config.accounts).map(([id, account]) => ({
          id,
          active: config.activeAccount === id,
          name: account.name,
          user: account.user.username ?? account.user.email ?? account.user.id,
          workspace: account.workspace,
        }));
      }),
  );

  server.registerTool(
    "clickupfy_whoami",
    {
      title: "Consultar usuário autenticado",
      description: "Valida o perfil e retorna o usuário autenticado no ClickUp.",
      inputSchema: accountSchema,
    },
    ({ account }) =>
      executar(async () => {
        const ctx = await contexto(account);
        return {
          account: ctx.accountId,
          workspace: ctx.account.workspace,
          user: await ctx.client.obterUsuario(),
        };
      }),
  );

  server.registerTool(
    "clickupfy_workspaces_list",
    {
      title: "Listar workspaces",
      description: "Lista os workspaces autorizados para um perfil.",
      inputSchema: accountSchema,
    },
    ({ account }) =>
      executar(async () => (await contexto(account)).client.listarWorkspaces()),
  );

  server.registerTool(
    "clickupfy_spaces_list",
    {
      title: "Listar spaces",
      description: "Lista os spaces do workspace associado ao perfil.",
      inputSchema: {
        ...accountSchema,
        archived: z.boolean().optional(),
      },
    },
    ({ account, archived }) =>
      executar(async () => {
        const ctx = await contexto(account);
        return ctx.client.listarSpaces(ctx.account.workspace.id, archived);
      }),
  );

  server.registerTool(
    "clickupfy_folders_list",
    {
      title: "Listar folders",
      description: "Lista os folders de um space.",
      inputSchema: {
        ...accountSchema,
        spaceId: z
          .string()
          .optional()
          .describe("ID do Space; omita para usar o projeto."),
        archived: z.boolean().optional(),
      },
    },
    ({ account, spaceId, archived }) =>
      executar(async () => {
        const ctx = await contexto(account);
        return ctx.client.listarFolders(
          resolverIdFixo(options.spaceId, spaceId, "Space"),
          archived,
        );
      }),
  );

  server.registerTool(
    "clickupfy_lists_list",
    {
      title: "Listar lists",
      description: "Lista as lists de um folder ou de um space sem folders.",
      inputSchema: {
        ...accountSchema,
        folderId: z.string().optional(),
        spaceId: z.string().optional(),
        archived: z.boolean().optional(),
      },
    },
    ({ account, folderId, spaceId, archived }) =>
      executar(async () => {
        const ctx = await contexto(account);
        const resolvedFolderId = resolverIdOpcionalFixo(
          options.folderId,
          folderId,
          "Folder",
        );
        const scopedSpaceId = resolverIdOpcionalFixo(
          options.spaceId,
          spaceId,
          "Space",
        );
        const resolvedSpaceId = resolvedFolderId ? undefined : scopedSpaceId;
        if (!resolvedFolderId && !resolvedSpaceId) {
          throw new Error(
            "Informe folderId ou spaceId na configuração do MCP.",
          );
        }
        return ctx.client.listarLists(
          {
            ...(resolvedFolderId ? { folderId: resolvedFolderId } : {}),
            ...(resolvedSpaceId ? { spaceId: resolvedSpaceId } : {}),
          },
          archived,
        );
      }),
  );

  server.registerTool(
    "clickupfy_tasks_list",
    {
      title: "Listar tarefas",
      description:
        "Lista tarefas de desenvolvimento de uma list com saída compacta.",
      inputSchema: {
        ...accountSchema,
        listId: z
          .string()
          .optional()
          .describe("ID da List; omita para usar o projeto."),
        status: z.array(z.string()).optional(),
        assignees: z.array(z.string()).optional(),
        includeClosed: z.boolean().optional(),
        page: z.number().int().min(0).optional(),
      },
    },
    ({ account, listId, status, assignees, includeClosed, page }) =>
      executar(async () => {
        const ctx = await contexto(account);
        const tarefas = await ctx.client.listarTarefas(
          resolverIdFixo(options.listId, listId, "List"),
          {
            ...(status ? { status } : {}),
            ...(assignees ? { assignees } : {}),
            ...(includeClosed !== undefined ? { includeClosed } : {}),
            ...(page !== undefined ? { page } : {}),
          },
        );
        return tarefas.map(resumirTarefa);
      }),
  );

  server.registerTool(
    "clickupfy_sprints_list",
    {
      title: "Listar Sprints",
      description:
        "Lista Sprints existentes de um Sprint Folder, identificadas pelo período.",
      inputSchema: {
        ...accountSchema,
        folderId: z
          .string()
          .optional()
          .describe("ID do Sprint Folder; omita para usar o projeto."),
        archived: z.boolean().optional(),
        includeRegular: z.boolean().optional(),
        at: z.string().optional().describe("Data de referência em AAAA-MM-DD."),
      },
    },
    ({ account, folderId, archived, includeRegular, at }) =>
      executar(async () => {
        const ctx = await contexto(account);
        return listarSprints(
          ctx.client,
          resolverIdFixo(
            options.sprintFolderId,
            folderId,
            "Sprint Folder",
          ),
          {
          ...(archived !== undefined ? { archived } : {}),
          ...(includeRegular !== undefined ? { includeRegular } : {}),
          ...(at ? { referencia: dataDeReferencia(at) } : {}),
          },
        );
      }),
  );

  server.registerTool(
    "clickupfy_sprint_current",
    {
      title: "Obter Sprint atual",
      description: "Obtém a única Sprint ativa de um Sprint Folder.",
      inputSchema: {
        ...accountSchema,
        folderId: z
          .string()
          .optional()
          .describe("ID do Sprint Folder; omita para usar o projeto."),
        at: z.string().optional().describe("Data de referência em AAAA-MM-DD."),
      },
    },
    ({ account, folderId, at }) =>
      executar(async () => {
        const ctx = await contexto(account);
        return obterSprintAtual(
          ctx.client,
          resolverIdFixo(
            options.sprintFolderId,
            folderId,
            "Sprint Folder",
          ),
          at ? dataDeReferencia(at) : Date.now(),
        );
      }),
  );

  server.registerTool(
    "clickupfy_sprint_get",
    {
      title: "Obter relatório da Sprint",
      description:
        "Retorna período, progresso, distribuição de status e Sprint Points.",
      inputSchema: {
        ...accountSchema,
        sprintId: z.string(),
        at: z.string().optional().describe("Data de referência em AAAA-MM-DD."),
      },
    },
    ({ account, sprintId, at }) =>
      executar(async () =>
        obterRelatorioSprint(
          (await contexto(account)).client,
          sprintId,
          at ? dataDeReferencia(at) : Date.now(),
        ),
      ),
  );

  server.registerTool(
    "clickupfy_sprint_tasks",
    {
      title: "Listar tarefas da Sprint",
      description:
        "Lista todas as tarefas associadas à Sprint, incluindo concluídas.",
      inputSchema: {
        ...accountSchema,
        sprintId: z.string(),
        openOnly: z.boolean().optional(),
      },
    },
    ({ account, sprintId, openOnly }) =>
      executar(async () =>
        (
          await listarTarefasSprint(
            (await contexto(account)).client,
            sprintId,
            openOnly,
          )
        ).map(resumirTarefa),
      ),
  );

  server.registerTool(
    "clickupfy_task_get",
    {
      title: "Obter tarefa",
      description: "Obtém os detalhes completos de uma tarefa pelo ID.",
      inputSchema: {
        ...accountSchema,
        taskId: z.string(),
      },
    },
    ({ account, taskId }) =>
      executar(async () => (await contexto(account)).client.obterTarefa(taskId)),
  );

  server.registerTool(
    "clickupfy_tasks_search",
    {
      title: "Buscar tarefas",
      description:
        "Busca tarefas na List fixada pelo MCP ou, sem ela, no workspace.",
      inputSchema: {
        ...accountSchema,
        query: z.string().optional(),
        status: z.array(z.string()).optional(),
        assignees: z.array(z.string()).optional(),
        includeClosed: z.boolean().optional(),
        maxPages: z.number().int().min(1).max(100).optional(),
      },
    },
    ({ account, query, status, assignees, includeClosed, maxPages }) =>
      executar(async () => {
        const ctx = await contexto(account);
        const filtros = {
            ...(query ? { query } : {}),
            ...(status ? { status } : {}),
            ...(assignees ? { assignees } : {}),
            ...(includeClosed !== undefined ? { includeClosed } : {}),
            ...(maxPages !== undefined ? { maxPages } : {}),
        };
        const tarefas = options.listId
          ? await ctx.client.listarTodasTarefas(options.listId, filtros)
          : await ctx.client.buscarTarefasWorkspace(
              ctx.account.workspace.id,
              filtros,
            );
        return tarefas.map(resumirTarefa);
      }),
  );

  server.registerTool(
    "clickupfy_comments_list",
    {
      title: "Listar comentários",
      description: "Lê o histórico de comentários de uma tarefa.",
      inputSchema: {
        ...accountSchema,
        taskId: z.string(),
      },
    },
    ({ account, taskId }) =>
      executar(async () =>
        (await (await contexto(account)).client.listarComentarios(taskId)).map(
          resumirComentario,
        ),
      ),
  );

  server.registerTool(
    "clickupfy_time_current",
    {
      title: "Consultar time tracking atual",
      description: "Retorna o time entry em execução no workspace.",
      inputSchema: accountSchema,
    },
    ({ account }) =>
      executar(async () => {
        const ctx = await contexto(account);
        return ctx.client.obterTimeEntryAtual(ctx.account.workspace.id);
      }),
  );

  if (!options.readOnly) {
    registerWriteTools(server, options);
  }

  return server;
}

function registerWriteTools(
  server: McpServer,
  options: McpServerOptions,
): void {
  const accountSchema = {
    account: z.string().optional(),
  };
  const contexto = (account?: string) => criarContextoMcp(options, account);

  if (!options.accountId) {
    server.registerTool(
      "clickupfy_account_use",
      {
        title: "Selecionar perfil ativo",
        description: "Define qual perfil local será usado por padrão.",
        inputSchema: { account: z.string() },
      },
      ({ account }) =>
        executar(async () => {
          const config = await lerConfiguracao();
          resolverAccount(config, account);
          config.activeAccount = account;
          await salvarConfiguracao(config);
          return { activeAccount: account };
        }),
    );
  }

  if (!options.accountId && !options.workspaceId) {
    server.registerTool(
      "clickupfy_workspace_use",
      {
        title: "Associar workspace",
        description:
          "Associa outro workspace autorizado a um perfil configurado.",
        inputSchema: {
          ...accountSchema,
          workspaceId: z.string(),
        },
      },
      ({ account, workspaceId }) =>
        executar(async () => {
          const ctx = await contexto(account);
          const config = ctx.configuracao;
          const resolvida = resolverAccount(config, ctx.accountId);
          const workspace = (await ctx.client.listarWorkspaces()).find(
            (item) => item.id === workspaceId,
          );
          if (!workspace) {
            throw new Error("Workspace não autorizado para o perfil.");
          }
          resolvida.account.workspace = {
            id: workspace.id,
            name: workspace.name,
          };
          resolvida.account.updatedAt = new Date().toISOString();
          await salvarConfiguracao(config);
          return {
            account: resolvida.id,
            workspace: resolvida.account.workspace,
          };
        }),
    );
  }

  server.registerTool(
    "clickupfy_task_create",
    {
      title: "Criar tarefa",
      description: "Cria uma tarefa de desenvolvimento em uma list.",
      inputSchema: {
        ...accountSchema,
        listId: z
          .string()
          .optional()
          .describe("ID da List; omita para usar o projeto."),
        name: z.string(),
        description: z.string().optional(),
        status: z.string().optional(),
        priority: z.number().int().min(1).max(4).optional(),
        assignees: z.array(z.number()).optional(),
        dueDate: z.number().int().optional(),
        points: z.number().min(0).optional(),
      },
    },
    ({ account, listId, ...dados }) =>
      executar(async () => {
        const ctx = await contexto(account);
        return ctx.client.criarTarefa(
          resolverIdFixo(options.listId, listId, "List"),
          limparIndefinidos({
            name: dados.name,
            description: dados.description,
            status: dados.status,
            priority: dados.priority,
            assignees: dados.assignees,
            due_date: dados.dueDate,
            points: dados.points,
          }),
        );
      }),
  );

  server.registerTool(
    "clickupfy_task_update",
    {
      title: "Atualizar tarefa",
      description:
        "Atualiza nome, descrição, status, prioridade ou data de uma tarefa.",
      inputSchema: {
        ...accountSchema,
        taskId: z.string(),
        name: z.string().optional(),
        description: z.string().optional(),
        status: z.string().optional(),
        priority: z.number().int().min(1).max(4).optional(),
        dueDate: z.number().int().nullable().optional(),
        points: z.number().min(0).optional(),
      },
    },
    ({ account, taskId, ...dados }) =>
      executar(async () => {
        const atualizacoes = limparIndefinidos({
          name: dados.name,
          description: dados.description,
          status: dados.status,
          priority: dados.priority,
          due_date: dados.dueDate,
          points: dados.points,
        });
        if (Object.keys(atualizacoes).length === 0) {
          throw new Error("Informe ao menos um campo para atualizar.");
        }
        return (await contexto(account)).client.atualizarTarefa(
          taskId,
          atualizacoes,
        );
      }),
  );

  server.registerTool(
    "clickupfy_sprint_add_task",
    {
      title: "Adicionar tarefa à Sprint",
      description:
        "Associa uma tarefa a uma Sprint sem trocar sua List principal.",
      inputSchema: {
        ...accountSchema,
        sprintId: z.string(),
        taskId: z.string(),
      },
    },
    ({ account, sprintId, taskId }) =>
      executar(async () =>
        adicionarTarefaASprint(
          (await contexto(account)).client,
          sprintId,
          taskId,
        ),
      ),
  );

  server.registerTool(
    "clickupfy_sprint_remove_task",
    {
      title: "Remover tarefa da Sprint",
      description:
        "Remove a associação com a Sprint sem excluir a tarefa do ClickUp.",
      inputSchema: {
        ...accountSchema,
        sprintId: z.string(),
        taskId: z.string(),
      },
    },
    ({ account, sprintId, taskId }) =>
      executar(async () =>
        removerTarefaDaSprint(
          (await contexto(account)).client,
          sprintId,
          taskId,
        ),
      ),
  );

  server.registerTool(
    "clickupfy_sprint_set_points",
    {
      title: "Definir Sprint Points",
      description: "Define a estimativa em Sprint Points de uma tarefa.",
      inputSchema: {
        ...accountSchema,
        taskId: z.string(),
        points: z.number().min(0),
      },
    },
    ({ account, taskId, points }) =>
      executar(async () =>
        definirSprintPoints(
          (await contexto(account)).client,
          taskId,
          points,
        ),
      ),
  );

  server.registerTool(
    "clickupfy_task_delete",
    {
      title: "Excluir tarefa",
      description:
        "Exclui permanentemente uma tarefa. Use somente com autorização explícita.",
      inputSchema: {
        ...accountSchema,
        taskId: z.string(),
        confirm: z.literal(true).describe("Confirmação obrigatória da exclusão."),
      },
    },
    ({ account, taskId }) =>
      executar(async () => {
        await (await contexto(account)).client.excluirTarefa(taskId);
        return { deleted: true, taskId };
      }),
  );

  server.registerTool(
    "clickupfy_comment_create",
    {
      title: "Criar comentário",
      description: "Publica um comentário de progresso em uma tarefa.",
      inputSchema: {
        ...accountSchema,
        taskId: z.string(),
        text: z.string(),
        notifyAll: z.boolean().optional(),
      },
    },
    ({ account, taskId, text, notifyAll }) =>
      executar(async () =>
        (await contexto(account)).client.criarComentario(
          taskId,
          text,
          notifyAll,
        ),
      ),
  );

  server.registerTool(
    "clickupfy_time_start",
    {
      title: "Iniciar time tracking",
      description: "Inicia um time entry associado a uma tarefa.",
      inputSchema: {
        ...accountSchema,
        taskId: z.string(),
        description: z.string().optional(),
      },
    },
    ({ account, taskId, description }) =>
      executar(async () => {
        const ctx = await contexto(account);
        return ctx.client.iniciarTimeEntry(
          ctx.account.workspace.id,
          limparIndefinidos({ tid: taskId, description }) as {
            tid: string;
            description?: string;
          },
        );
      }),
  );

  server.registerTool(
    "clickupfy_time_stop",
    {
      title: "Parar time tracking",
      description: "Encerra o time entry em execução no workspace.",
      inputSchema: accountSchema,
    },
    ({ account }) =>
      executar(async () => {
        const ctx = await contexto(account);
        return ctx.client.pararTimeEntry(ctx.account.workspace.id);
      }),
  );
}

/** Inicia o transporte stdio; stdout fica reservado ao protocolo JSON-RPC. */
export async function serveMcp(options: McpServerOptions = {}): Promise<void> {
  const server = createMcpServer(options);
  const transport = new StdioServerTransport();
  await server.connect(transport);
  process.stderr.write(
    `Promovaweb ClickUp MCP iniciado${options.readOnly ? " em modo somente leitura" : ""}.\n`,
  );
}

function limparIndefinidos(
  objeto: Record<string, unknown>,
): Record<string, unknown> {
  return Object.fromEntries(
    Object.entries(objeto).filter(([, valor]) => valor !== undefined),
  );
}

async function criarContextoMcp(
  options: McpServerOptions,
  account?: string,
) {
  if (
    options.accountId &&
    account &&
    account !== options.accountId
  ) {
    throw new Error(
      `Este MCP está fixado no perfil "${options.accountId}".`,
    );
  }
  const ctx = await criarContexto(options.accountId ?? account);
  if (
    options.workspaceId &&
    ctx.account.workspace.id !== options.workspaceId
  ) {
    throw new Error(
      `Este MCP exige o workspace ${options.workspaceId}, mas o perfil "${ctx.accountId}" usa ${ctx.account.workspace.id}.`,
    );
  }
  return ctx;
}

function resolverIdFixo(
  configurado: string | undefined,
  recebido: string | undefined,
  recurso: string,
): string {
  const id = resolverIdOpcionalFixo(configurado, recebido, recurso);
  if (!id) {
    throw new Error(
      `${recurso} não configurado neste MCP e não informado na ferramenta.`,
    );
  }
  return id;
}

function resolverIdOpcionalFixo(
  configurado: string | undefined,
  recebido: string | undefined,
  recurso: string,
): string | undefined {
  if (configurado && recebido && configurado !== recebido) {
    throw new Error(
      `Este MCP está fixado em ${recurso} ${configurado}.`,
    );
  }
  return configurado ?? recebido;
}

function dataDeReferencia(valor: string): number {
  if (!/^\d{4}-\d{2}-\d{2}$/.test(valor)) {
    throw new Error(`Data inválida: ${valor}. Use AAAA-MM-DD.`);
  }
  const data = new Date(`${valor}T12:00:00.000Z`);
  if (Number.isNaN(data.getTime()) || !data.toISOString().startsWith(valor)) {
    throw new Error(`Data inválida: ${valor}.`);
  }
  return data.getTime();
}
