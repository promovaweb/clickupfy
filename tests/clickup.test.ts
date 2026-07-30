/**
 * Testes do cliente HTTP sem acessar uma account real do ClickUp.
 */

import { describe, expect, it, vi } from "vitest";
import { ClickUpClient } from "../src/clickup.js";
import { CliError } from "../src/errors.js";

describe("ClickUpClient", () => {
  it("envia autenticação e filtros repetidos no formato da API", async () => {
    const fetchFn = vi.fn<typeof fetch>().mockResolvedValue(
      new Response(JSON.stringify({ tasks: [] }), {
        status: 200,
        headers: { "Content-Type": "application/json" },
      }),
    );
    const client = new ClickUpClient("pk_secreta", {
      baseUrl: "https://clickup.test/api/v2",
      fetchFn,
    });

    await client.listarTarefas("lista-1", {
      status: ["backlog", "em andamento"],
      assignees: ["10", "20"],
      includeClosed: true,
    });

    const [url, init] = fetchFn.mock.calls[0] ?? [];
    expect(String(url)).toContain("/list/lista-1/task");
    expect(String(url)).toContain("statuses%5B%5D=backlog");
    expect(String(url)).toContain("statuses%5B%5D=em+andamento");
    expect(String(url)).toContain("assignees%5B%5D=10");
    expect(init?.headers).toMatchObject({ Authorization: "pk_secreta" });
  });

  it("mapeia falha de autenticação para o código de saída 2", async () => {
    const client = new ClickUpClient("invalida", {
      fetchFn: vi.fn<typeof fetch>().mockResolvedValue(
        new Response(JSON.stringify({ err: "Token inválido" }), {
          status: 401,
        }),
      ),
    });

    await expect(client.obterUsuario()).rejects.toMatchObject<CliError>({
      message: "Token inválido",
      exitCode: 2,
    });
  });

  it("inclui subtarefas e percorre todo o histórico de comentários", async () => {
    const primeiraPagina = Array.from({ length: 25 }, (_, indice) => ({
      id: indice + 1,
      date: String(1_000 - indice),
      comment_text: `Comentário ${indice + 1}`,
    }));
    const fetchFn = vi
      .fn<typeof fetch>()
      .mockResolvedValueOnce(
        new Response(JSON.stringify({ id: "task-1", name: "Tarefa" }), {
          status: 200,
        }),
      )
      .mockResolvedValueOnce(
        new Response(JSON.stringify({ comments: primeiraPagina }), {
          status: 200,
        }),
      )
      .mockResolvedValueOnce(
        new Response(
          JSON.stringify({
            comments: [{ id: 26, date: "975", comment_text: "Mais antigo" }],
          }),
          { status: 200 },
        ),
      );
    const client = new ClickUpClient("pk_teste", {
      baseUrl: "https://clickup.test/api/v2",
      fetchFn,
    });

    await client.obterTarefa("task-1");
    const comentarios = await client.listarComentarios("task-1");

    expect(String(fetchFn.mock.calls[0]?.[0])).toContain(
      "include_subtasks=true",
    );
    expect(String(fetchFn.mock.calls[0]?.[0])).toContain(
      "include_markdown_description=true",
    );
    expect(String(fetchFn.mock.calls[2]?.[0])).toContain("start=976");
    expect(String(fetchFn.mock.calls[2]?.[0])).toContain("start_id=25");
    expect(comentarios).toHaveLength(26);
  });

  it("busca tarefas no workspace e filtra o texto localmente", async () => {
    const fetchFn = vi.fn<typeof fetch>().mockResolvedValue(
      new Response(
        JSON.stringify({
          tasks: [
            { id: "1", name: "Implementar autenticação" },
            { id: "2", name: "Revisar documentação" },
          ],
        }),
        { status: 200 },
      ),
    );
    const client = new ClickUpClient("pk_teste", {
      baseUrl: "https://clickup.test/api/v2",
      fetchFn,
    });

    const tarefas = await client.buscarTarefasWorkspace("123", {
      query: "AUTENTICAÇÃO",
      status: ["backlog"],
    });

    expect(String(fetchFn.mock.calls[0]?.[0])).toContain("/team/123/task");
    expect(String(fetchFn.mock.calls[0]?.[0])).toContain(
      "statuses%5B%5D=backlog",
    );
    expect(tarefas.map((tarefa) => tarefa.id)).toEqual(["1"]);
  });

  it("pagina tarefas da Sprint e altera sua associação", async () => {
    const primeiraPagina = Array.from({ length: 100 }, (_, indice) => ({
      id: String(indice),
      name: `Tarefa ${indice}`,
    }));
    const fetchFn = vi
      .fn<typeof fetch>()
      .mockResolvedValueOnce(
        new Response(JSON.stringify({ tasks: primeiraPagina }), { status: 200 }),
      )
      .mockResolvedValueOnce(
        new Response(
          JSON.stringify({ tasks: [{ id: "100", name: "Tarefa 100" }] }),
          { status: 200 },
        ),
      )
      .mockResolvedValueOnce(new Response("", { status: 200 }))
      .mockResolvedValueOnce(new Response("", { status: 200 }));
    const client = new ClickUpClient("pk_teste", {
      baseUrl: "https://clickup.test/api/v2",
      fetchFn,
    });

    const tarefas = await client.listarTodasTarefas("sprint-1", {
      includeClosed: true,
    });
    await client.adicionarTarefaAList("sprint-1", "task-1");
    await client.removerTarefaDaList("sprint-1", "task-1");

    expect(tarefas).toHaveLength(101);
    expect(String(fetchFn.mock.calls[1]?.[0])).toContain("page=1");
    expect(fetchFn.mock.calls[2]?.[1]?.method).toBe("POST");
    expect(String(fetchFn.mock.calls[2]?.[0])).toContain(
      "/list/sprint-1/task/task-1",
    );
    expect(fetchFn.mock.calls[3]?.[1]?.method).toBe("DELETE");
  });

  it("cria subtarefas Markdown, checklists e itens com datas", async () => {
    const fetchFn = vi
      .fn<typeof fetch>()
      .mockImplementation(
        async () =>
          new Response(JSON.stringify({ id: "criado" }), { status: 200 }),
      );
    const client = new ClickUpClient("pk_teste", {
      baseUrl: "https://clickup.test/api/v2",
      fetchFn,
    });

    await client.criarTarefa("list-1", {
      name: "Subtarefa",
      markdown_content: "# Escopo",
      parent: "task-pai",
      start_date: 1_700_000_000_000,
      due_date: 1_700_086_399_999,
    });
    await client.criarChecklist("task-pai", "Testes");
    await client.criarItemChecklist("check-1", {
      name: "Executar testes unitários",
      assignee: 42,
    });

    expect(String(fetchFn.mock.calls[0]?.[0])).toContain("/list/list-1/task");
    expect(JSON.parse(String(fetchFn.mock.calls[0]?.[1]?.body))).toMatchObject({
      markdown_content: "# Escopo",
      parent: "task-pai",
      start_date: 1_700_000_000_000,
      due_date: 1_700_086_399_999,
    });
    expect(String(fetchFn.mock.calls[1]?.[0])).toContain(
      "/task/task-pai/checklist",
    );
    expect(JSON.parse(String(fetchFn.mock.calls[1]?.[1]?.body))).toEqual({
      name: "Testes",
    });
    expect(String(fetchFn.mock.calls[2]?.[0])).toContain(
      "/checklist/check-1/checklist_item",
    );
    expect(JSON.parse(String(fetchFn.mock.calls[2]?.[1]?.body))).toEqual({
      name: "Executar testes unitários",
      assignee: 42,
    });
  });
});
