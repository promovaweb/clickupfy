/**
 * Cliente HTTP tipado para os endpoints do ClickUp usados em desenvolvimento.
 */

import { CliError, exitCodeForStatus } from "./errors.js";

export interface ClickUpUser {
  id: number | string;
  username?: string;
  email?: string;
  color?: string;
  profilePicture?: string;
}

export interface ClickUpWorkspace {
  id: string;
  name: string;
  color?: string;
  avatar?: string;
  members?: unknown[];
}

export interface ClickUpList {
  id: string;
  name: string;
  task_count?: number;
  archived?: boolean;
  start_date?: string | null;
  start_date_time?: boolean;
  due_date?: string | null;
  due_date_time?: boolean;
  status?: { status?: string; color?: string } | null;
  priority?: { priority?: string; color?: string } | null;
  folder?: { id?: string; name?: string };
  space?: { id?: string; name?: string };
  statuses?: ClickUpStatus[];
}

/** Status configurado na List, inclusive o tipo usado no encerramento. */
export interface ClickUpStatus {
  id?: string;
  status: string;
  type?: string;
  orderindex?: number | string;
  color?: string;
}

/** Item de checklist retornado dentro de uma tarefa do ClickUp. */
export interface ClickUpChecklistItem {
  id: string;
  name: string;
  orderindex?: number | string;
  assignee?: ClickUpUser | null;
  resolved?: boolean;
  parent?: string | null;
}

/** Checklist e seus itens conforme o payload de leitura de uma tarefa. */
export interface ClickUpChecklist {
  id: string;
  task_id?: string;
  name: string;
  orderindex?: number | string;
  resolved?: number;
  unresolved?: number;
  items?: ClickUpChecklistItem[];
}

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
  folder?: { id?: string; name?: string };
  space?: { id?: string };
  parent?: string | null;
  subtasks?: ClickUpTask[];
  checklists?: ClickUpChecklist[];
}

export interface ClickUpComment {
  id: number | string;
  comment_text?: string;
  comment?: Array<{ text?: string }>;
  user?: ClickUpUser;
  date?: string;
}

/** Doc do ClickUp (v3), com o local onde foi criado. */
export interface ClickUpDoc {
  id: string;
  name?: string;
  date_created?: string | number;
  date_updated?: string | number;
  creator?: number | string;
  workspace_id?: number | string;
  public?: boolean;
  parent?: { id?: string; type?: number };
}

/** Nó da árvore de páginas de um Doc, sem o conteúdo de cada página. */
export interface ClickUpDocPageListingItem {
  id: string;
  doc_id?: string;
  name?: string;
  orderindex?: number | string;
  pages?: ClickUpDocPageListingItem[];
}

/** Página de um Doc com conteúdo, no formato solicitado (markdown por padrão). */
export interface ClickUpDocPage {
  id: string;
  doc_id?: string;
  parent_page_id?: string | null;
  name?: string;
  sub_title?: string;
  content?: string;
  orderindex?: number | string;
  date_created?: string | number;
  date_updated?: string | number;
  pages?: ClickUpDocPage[];
}

type QueryValue = string | number | boolean | undefined;
type FetchLike = typeof fetch;

export interface ClickUpClientOptions {
  baseUrl?: string;
  baseUrlV3?: string;
  fetchFn?: FetchLike;
  timeoutMs?: number;
}

/**
 * Executa chamadas autenticadas e normaliza erros da API para CLI e MCP.
 */
export class ClickUpClient {
  readonly #baseUrl: string;
  readonly #baseUrlV3: string;
  readonly #fetch: FetchLike;
  readonly #timeoutMs: number;

  public constructor(
    private readonly apiKey: string,
    options: ClickUpClientOptions = {},
  ) {
    this.#baseUrl =
      options.baseUrl ??
      process.env.PROMOVAWEB_CLICKUPFY_API_URL ??
      "https://api.clickup.com/api/v2";
    this.#baseUrlV3 =
      options.baseUrlV3 ??
      process.env.PROMOVAWEB_CLICKUPFY_API_URL_V3 ??
      "https://api.clickup.com/api/v3";
    this.#fetch = options.fetchFn ?? fetch;
    this.#timeoutMs = options.timeoutMs ?? 30_000;
  }

  /**
   * Faz uma requisição e retorna JSON. Respostas vazias são representadas por
   * um objeto vazio para manter um contrato único entre comandos.
   */
  public async request<T>(
    method: string,
    path: string,
    options: {
      query?: Record<string, QueryValue | QueryValue[]>;
      body?: unknown;
    } = {},
  ): Promise<T> {
    return this.#executar(this.#baseUrl, method, path, options);
  }

  /**
   * Igual a `request`, mas contra a base `/api/v3`, usada pelos endpoints de
   * Docs, que ainda não têm equivalente na v2.
   */
  public async requestV3<T>(
    method: string,
    path: string,
    options: {
      query?: Record<string, QueryValue | QueryValue[]>;
      body?: unknown;
    } = {},
  ): Promise<T> {
    return this.#executar(this.#baseUrlV3, method, path, options);
  }

  async #executar<T>(
    baseUrl: string,
    method: string,
    path: string,
    options: {
      query?: Record<string, QueryValue | QueryValue[]>;
      body?: unknown;
    },
  ): Promise<T> {
    const url = new URL(`${baseUrl.replace(/\/$/, "")}/${path.replace(/^\//, "")}`);

    for (const [chave, valor] of Object.entries(options.query ?? {})) {
      const valores = Array.isArray(valor) ? valor : [valor];
      for (const item of valores) {
        if (item !== undefined) url.searchParams.append(chave, String(item));
      }
    }

    let resposta: Response;
    try {
      resposta = await this.#fetch(url, {
        method,
        headers: {
          Authorization: this.apiKey,
          "Content-Type": "application/json",
        },
        ...(options.body === undefined
          ? {}
          : { body: JSON.stringify(options.body) }),
        signal: AbortSignal.timeout(this.#timeoutMs),
      });
    } catch (error) {
      throw new CliError(
        `Não foi possível acessar a API do ClickUp: ${error instanceof Error ? error.message : String(error)}`,
        5,
        { cause: error },
      );
    }

    const texto = await resposta.text();
    const dados = texto ? this.#parseJson(texto) : {};

    if (!resposta.ok) {
      const mensagem =
        this.#extractError(dados) || `A API do ClickUp respondeu HTTP ${resposta.status}.`;
      throw new CliError(mensagem, exitCodeForStatus(resposta.status));
    }

    return dados as T;
  }

  public async obterUsuario(): Promise<ClickUpUser> {
    const resposta = await this.request<{ user: ClickUpUser }>("GET", "/user");
    return resposta.user;
  }

  public async listarWorkspaces(): Promise<ClickUpWorkspace[]> {
    const resposta = await this.request<{ teams: ClickUpWorkspace[] }>(
      "GET",
      "/team",
    );
    return resposta.teams;
  }

  public async listarSpaces(
    workspaceId: string,
    archived = false,
  ): Promise<unknown[]> {
    const resposta = await this.request<{ spaces: unknown[] }>(
      "GET",
      `/team/${workspaceId}/space`,
      { query: { archived } },
    );
    return resposta.spaces;
  }

  public async listarFolders(
    spaceId: string,
    archived = false,
  ): Promise<unknown[]> {
    const resposta = await this.request<{ folders: unknown[] }>(
      "GET",
      `/space/${spaceId}/folder`,
      { query: { archived } },
    );
    return resposta.folders;
  }

  public async listarLists(
    escopo: { folderId?: string; spaceId?: string },
    archived = false,
  ): Promise<ClickUpList[]> {
    const path = escopo.folderId
      ? `/folder/${escopo.folderId}/list`
      : `/space/${escopo.spaceId}/list`;
    const resposta = await this.request<{ lists: ClickUpList[] }>("GET", path, {
      query: { archived },
    });
    return resposta.lists;
  }

  public async obterList(listId: string): Promise<ClickUpList> {
    return this.request<ClickUpList>("GET", `/list/${listId}`);
  }

  public async listarTarefas(
    listId: string,
    filtros: {
      archived?: boolean;
      includeClosed?: boolean;
      page?: number;
      status?: string[];
      assignees?: string[];
    } = {},
  ): Promise<ClickUpTask[]> {
    const resposta = await this.request<{ tasks: ClickUpTask[] }>(
      "GET",
      `/list/${listId}/task`,
      {
        query: {
          archived: filtros.archived,
          include_closed: filtros.includeClosed,
          page: filtros.page,
          "statuses[]": filtros.status,
          "assignees[]": filtros.assignees,
        },
      },
    );
    return resposta.tasks;
  }

  /**
   * Percorre todas as páginas de uma List. O teto protege agentes contra uma
   * paginação remota que deixe de avançar.
   */
  public async listarTodasTarefas(
    listId: string,
    filtros: {
      archived?: boolean;
      includeClosed?: boolean;
      query?: string;
      status?: string[];
      assignees?: string[];
      maxPages?: number;
    } = {},
  ): Promise<ClickUpTask[]> {
    const tarefas: ClickUpTask[] = [];
    const maxPages = Math.min(Math.max(filtros.maxPages ?? 100, 1), 100);

    for (let page = 0; page < maxPages; page += 1) {
      const pagina = await this.listarTarefas(listId, {
        ...(filtros.archived !== undefined
          ? { archived: filtros.archived }
          : {}),
        ...(filtros.includeClosed !== undefined
          ? { includeClosed: filtros.includeClosed }
          : {}),
        ...(filtros.status ? { status: filtros.status } : {}),
        ...(filtros.assignees ? { assignees: filtros.assignees } : {}),
        page,
      });
      tarefas.push(...pagina);
      if (pagina.length < 100) break;
    }

    const query = filtros.query?.trim().toLocaleLowerCase("pt-BR");
    if (!query) return tarefas;
    return tarefas.filter((tarefa) =>
      [
        tarefa.id,
        tarefa.custom_id,
        tarefa.name,
        tarefa.description,
        tarefa.text_content,
      ].some((valor) => valor?.toLocaleLowerCase("pt-BR").includes(query)),
    );
  }

  /**
   * Busca tarefas em todo o workspace. A API aplica os filtros estruturados;
   * o texto é filtrado localmente porque esse endpoint não possui `query`.
   */
  public async buscarTarefasWorkspace(
    workspaceId: string,
    filtros: {
      query?: string;
      includeClosed?: boolean;
      status?: string[];
      assignees?: string[];
      maxPages?: number;
    } = {},
  ): Promise<ClickUpTask[]> {
    const tarefas: ClickUpTask[] = [];
    const maxPages = Math.min(Math.max(filtros.maxPages ?? 100, 1), 100);

    for (let page = 0; page < maxPages; page += 1) {
      const resposta = await this.request<{ tasks: ClickUpTask[] }>(
        "GET",
        `/team/${workspaceId}/task`,
        {
          query: {
            page,
            subtasks: true,
            include_closed: filtros.includeClosed,
            "statuses[]": filtros.status,
            "assignees[]": filtros.assignees,
          },
        },
      );
      tarefas.push(...resposta.tasks);
      if (resposta.tasks.length < 100) break;
    }

    const query = filtros.query?.trim().toLocaleLowerCase("pt-BR");
    if (!query) return tarefas;
    return tarefas.filter((tarefa) =>
      [
        tarefa.id,
        tarefa.custom_id,
        tarefa.name,
        tarefa.description,
        tarefa.text_content,
      ].some((valor) => valor?.toLocaleLowerCase("pt-BR").includes(query)),
    );
  }

  public async obterTarefa(
    taskId: string,
    options: { includeSubtasks?: boolean; includeMarkdown?: boolean } = {},
  ): Promise<ClickUpTask> {
    return this.request<ClickUpTask>("GET", `/task/${taskId}`, {
      query: {
        include_subtasks: options.includeSubtasks ?? true,
        include_markdown_description: options.includeMarkdown ?? true,
      },
    });
  }

  public async criarTarefa(
    listId: string,
    dados: Record<string, unknown>,
  ): Promise<ClickUpTask> {
    return this.request<ClickUpTask>("POST", `/list/${listId}/task`, {
      body: dados,
    });
  }

  /** Cria um checklist dentro de uma tarefa. */
  public async criarChecklist(
    taskId: string,
    name: string,
  ): Promise<Record<string, unknown>> {
    return this.request<Record<string, unknown>>(
      "POST",
      `/task/${taskId}/checklist`,
      { body: { name } },
    );
  }

  /** Acrescenta um item a um checklist existente. */
  public async criarItemChecklist(
    checklistId: string,
    dados: { name: string; assignee?: number },
  ): Promise<Record<string, unknown>> {
    return this.request<Record<string, unknown>>(
      "POST",
      `/checklist/${checklistId}/checklist_item`,
      { body: dados },
    );
  }

  public async atualizarTarefa(
    taskId: string,
    dados: Record<string, unknown>,
  ): Promise<ClickUpTask> {
    return this.request<ClickUpTask>("PUT", `/task/${taskId}`, { body: dados });
  }

  /**
   * Atualiza um item individual de checklist pelo endpoint próprio do ClickUp.
   */
  public async atualizarItemChecklist(
    checklistId: string,
    checklistItemId: string,
    dados: {
      name?: string;
      assignee?: string | null;
      resolved?: boolean;
      parent?: string | null;
    },
  ): Promise<Record<string, unknown>> {
    return this.request<Record<string, unknown>>(
      "PUT",
      `/checklist/${checklistId}/checklist_item/${checklistItemId}`,
      { body: dados },
    );
  }

  public async adicionarTarefaAList(
    listId: string,
    taskId: string,
  ): Promise<Record<string, never>> {
    return this.request<Record<string, never>>(
      "POST",
      `/list/${listId}/task/${taskId}`,
    );
  }

  public async removerTarefaDaList(
    listId: string,
    taskId: string,
  ): Promise<Record<string, never>> {
    return this.request<Record<string, never>>(
      "DELETE",
      `/list/${listId}/task/${taskId}`,
    );
  }

  public async excluirTarefa(taskId: string): Promise<Record<string, never>> {
    return this.request<Record<string, never>>("DELETE", `/task/${taskId}`);
  }

  public async listarComentarios(taskId: string): Promise<ClickUpComment[]> {
    const comentarios: ClickUpComment[] = [];
    let start: string | undefined;
    let startId: string | undefined;

    // O ClickUp entrega 25 comentários por página e usa o último item como
    // referência para a página seguinte. O limite evita um ciclo remoto caso
    // a API devolva repetidamente a mesma página.
    for (let pagina = 0; pagina < 100; pagina += 1) {
      const resposta = await this.request<{ comments: ClickUpComment[] }>(
        "GET",
        `/task/${taskId}/comment`,
        {
          query: {
            start,
            start_id: startId,
          },
        },
      );
      comentarios.push(...resposta.comments);

      if (resposta.comments.length < 25) break;
      const ultimo = resposta.comments.at(-1);
      const proximoStart = ultimo?.date;
      const proximoStartId =
        ultimo?.id === undefined ? undefined : String(ultimo.id);
      if (!proximoStart || !proximoStartId) break;
      if (proximoStart === start && proximoStartId === startId) break;
      start = proximoStart;
      startId = proximoStartId;
    }

    return comentarios;
  }

  public async criarComentario(
    taskId: string,
    text: string,
    notifyAll = false,
  ): Promise<{ id: number | string; hist_id?: string; date?: number }> {
    return this.request("POST", `/task/${taskId}/comment`, {
      body: { comment_text: text, notify_all: notifyAll },
    });
  }

  public async obterTimeEntryAtual(
    workspaceId: string,
  ): Promise<unknown> {
    return this.request("GET", `/team/${workspaceId}/time_entries/current`);
  }

  public async iniciarTimeEntry(
    workspaceId: string,
    dados: { tid: string; description?: string },
  ): Promise<unknown> {
    return this.request("POST", `/team/${workspaceId}/time_entries/start`, {
      body: dados,
    });
  }

  public async pararTimeEntry(workspaceId: string): Promise<unknown> {
    return this.request("POST", `/team/${workspaceId}/time_entries/stop`);
  }

  /**
   * Busca Docs do workspace. Percorre o cursor de paginação até o teto de
   * páginas, pelo mesmo motivo aplicado às buscas de tarefas.
   */
  public async listarDocs(
    workspaceId: string,
    filtros: {
      query?: string;
      parentId?: string;
      parentType?: number;
      deleted?: boolean;
      archived?: boolean;
      creator?: number;
      maxPages?: number;
    } = {},
  ): Promise<ClickUpDoc[]> {
    const docs: ClickUpDoc[] = [];
    const maxPages = Math.min(Math.max(filtros.maxPages ?? 50, 1), 50);
    let cursor: string | undefined;

    for (let pagina = 0; pagina < maxPages; pagina += 1) {
      const resposta = await this.requestV3<{
        docs: ClickUpDoc[];
        next_cursor?: string | null;
      }>("GET", `/workspaces/${workspaceId}/docs`, {
        query: {
          cursor,
          deleted: filtros.deleted,
          archived: filtros.archived,
          parent_id: filtros.parentId,
          parent_type: filtros.parentType,
          creator: filtros.creator,
        },
      });
      docs.push(...resposta.docs);
      if (!resposta.next_cursor) break;
      cursor = resposta.next_cursor;
    }

    const query = filtros.query?.trim().toLocaleLowerCase("pt-BR");
    if (!query) return docs;
    return docs.filter((doc) =>
      [doc.id, doc.name].some((valor) =>
        valor?.toString().toLocaleLowerCase("pt-BR").includes(query),
      ),
    );
  }

  /** Cria um Doc no workspace, opcionalmente associado a um local (Space, Folder, List ou tarefa). */
  public async criarDoc(
    workspaceId: string,
    dados: {
      name: string;
      parent?: { id: string; type: number };
      visibility?: string;
      createPage?: boolean;
    },
  ): Promise<ClickUpDoc> {
    return this.requestV3<ClickUpDoc>(
      "POST",
      `/workspaces/${workspaceId}/docs`,
      {
        body: {
          name: dados.name,
          parent: dados.parent,
          visibility: dados.visibility,
          create_page: dados.createPage,
        },
      },
    );
  }

  public async obterDoc(
    workspaceId: string,
    docId: string,
  ): Promise<ClickUpDoc> {
    return this.requestV3<ClickUpDoc>(
      "GET",
      `/workspaces/${workspaceId}/docs/${docId}`,
    );
  }

  /** Retorna a árvore de páginas do Doc, sem o conteúdo de cada uma. */
  public async obterEstruturaPaginasDoc(
    workspaceId: string,
    docId: string,
  ): Promise<ClickUpDocPageListingItem[]> {
    return this.requestV3<ClickUpDocPageListingItem[]>(
      "GET",
      `/workspaces/${workspaceId}/docs/${docId}/pageListing`,
    );
  }

  /** Retorna as páginas do Doc com conteúdo, no formato solicitado. */
  public async listarPaginasDoc(
    workspaceId: string,
    docId: string,
    opcoes: { maxPageDepth?: number; contentFormat?: string } = {},
  ): Promise<ClickUpDocPage[]> {
    return this.requestV3<ClickUpDocPage[]>(
      "GET",
      `/workspaces/${workspaceId}/docs/${docId}/pages`,
      {
        query: {
          max_page_depth: opcoes.maxPageDepth,
          content_format: opcoes.contentFormat,
        },
      },
    );
  }

  public async obterPaginaDoc(
    workspaceId: string,
    docId: string,
    pageId: string,
    opcoes: { contentFormat?: string } = {},
  ): Promise<ClickUpDocPage> {
    return this.requestV3<ClickUpDocPage>(
      "GET",
      `/workspaces/${workspaceId}/docs/${docId}/pages/${pageId}`,
      { query: { content_format: opcoes.contentFormat } },
    );
  }

  /** Cria uma página, ou sub-página quando `parentPageId` é informado. */
  public async criarPaginaDoc(
    workspaceId: string,
    docId: string,
    dados: {
      name: string;
      content?: string;
      subTitle?: string;
      parentPageId?: string;
      orderindex?: number;
      contentFormat?: string;
    },
  ): Promise<ClickUpDocPage> {
    return this.requestV3<ClickUpDocPage>(
      "POST",
      `/workspaces/${workspaceId}/docs/${docId}/pages`,
      {
        body: {
          name: dados.name,
          content: dados.content,
          sub_title: dados.subTitle,
          parent_page_id: dados.parentPageId,
          orderindex: dados.orderindex,
          content_format: dados.contentFormat,
        },
      },
    );
  }

  /**
   * Atualiza título e/ou conteúdo de uma página. `contentEditMode` decide se
   * o conteúdo enviado substitui, acrescenta ou antecede o conteúdo salvo.
   */
  public async atualizarPaginaDoc(
    workspaceId: string,
    docId: string,
    pageId: string,
    dados: {
      name?: string;
      subTitle?: string;
      content?: string;
      contentEditMode?: "replace" | "append" | "prepend";
      contentFormat?: string;
    },
  ): Promise<ClickUpDocPage> {
    return this.requestV3<ClickUpDocPage>(
      "PUT",
      `/workspaces/${workspaceId}/docs/${docId}/pages/${pageId}`,
      {
        body: {
          name: dados.name,
          sub_title: dados.subTitle,
          content: dados.content,
          content_edit_mode: dados.contentEditMode,
          content_format: dados.contentFormat,
        },
      },
    );
  }

  #parseJson(texto: string): unknown {
    try {
      return JSON.parse(texto);
    } catch (error) {
      throw new CliError("A API do ClickUp retornou JSON inválido.", 5, {
        cause: error,
      });
    }
  }

  #extractError(dados: unknown): string | undefined {
    if (!dados || typeof dados !== "object") return undefined;
    const objeto = dados as Record<string, unknown>;
    const valor = objeto.err ?? objeto.message ?? objeto.error;
    return typeof valor === "string" ? valor : undefined;
  }
}
