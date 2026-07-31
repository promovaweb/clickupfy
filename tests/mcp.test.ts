/**
 * Teste do handshake MCP, descoberta de ferramentas e perfil read-only.
 */

import { mkdtemp } from "node:fs/promises";
import { createServer } from "node:http";
import { tmpdir } from "node:os";
import { join, resolve } from "node:path";
import { Client } from "@modelcontextprotocol/sdk/client/index.js";
import { StdioClientTransport } from "@modelcontextprotocol/sdk/client/stdio.js";
import { afterEach, describe, expect, it } from "vitest";
import { criarConfiguracaoVazia, salvarConfiguracao } from "../src/config.js";

const clientes: Client[] = [];
const servidores: Array<ReturnType<typeof createServer>> = [];
const originalConfig = process.env.PROMOVAWEB_CLICKUPFY_CONFIG;

afterEach(async () => {
  await Promise.all(clientes.splice(0).map((cliente) => cliente.close()));
  await Promise.all(
    servidores.splice(0).map(
      (servidor) =>
        new Promise<void>((resolveClose, reject) => {
          servidor.close((error) => (error ? reject(error) : resolveClose()));
        }),
    ),
  );
  if (originalConfig === undefined) {
    delete process.env.PROMOVAWEB_CLICKUPFY_CONFIG;
  } else {
    process.env.PROMOVAWEB_CLICKUPFY_CONFIG = originalConfig;
  }
});

describe("servidor MCP", () => {
  it("lista accounts e oculta ferramentas mutáveis em read-only", async () => {
    const pasta = await mkdtemp(join(tmpdir(), "clickupfy-mcp-"));
    const caminho = join(pasta, "config.json");
    process.env.PROMOVAWEB_CLICKUPFY_CONFIG = caminho;
    const config = criarConfiguracaoVazia();
    const agora = new Date().toISOString();
    config.activeAccount = "dev";
    config.accounts.dev = {
      name: "Desenvolvimento",
      apiKey: "pk_teste",
      user: { id: 1, username: "dev" },
      workspace: { id: "123", name: "Engenharia" },
      createdAt: agora,
      updatedAt: agora,
    };
    await salvarConfiguracao(config);

    const transport = new StdioClientTransport({
      command: resolve("node_modules/.bin/tsx"),
      args: [
        "src/cli.ts",
        "mcp",
        "serve",
        "--list",
        "list-project",
        "--read-only",
      ],
      cwd: resolve("."),
      env: {
        ...process.env,
        PROMOVAWEB_CLICKUPFY_CONFIG: caminho,
      } as Record<string, string>,
      stderr: "pipe",
    });
    const client = new Client({ name: "teste", version: "1.0.0" });
    clientes.push(client);
    await client.connect(transport);

    const { tools } = await client.listTools();
    const names = tools.map((tool) => tool.name);
    expect(names).toContain("clickupfy_mcp_context");
    expect(names).toContain("clickupfy_accounts_list");
    expect(names).toContain("clickupfy_list_get");
    expect(names).toContain("clickupfy_task_get");
    expect(names).toContain("clickupfy_tasks_search");
    expect(names).toContain("clickupfy_sprints_list");
    expect(names).toContain("clickupfy_sprint_current");
    expect(names).toContain("clickupfy_sprint_get");
    expect(names).toContain("clickupfy_sprint_tasks");
    expect(names).toContain("clickupfy_docs_list");
    expect(names).toContain("clickupfy_doc_get");
    expect(names).toContain("clickupfy_doc_page_tree");
    expect(names).toContain("clickupfy_doc_pages_list");
    expect(names).toContain("clickupfy_doc_page_get");
    expect(names).not.toContain("clickupfy_doc_create");
    expect(names).not.toContain("clickupfy_doc_page_create");
    expect(names).not.toContain("clickupfy_doc_page_update");
    expect(names).not.toContain("clickupfy_task_create");
    expect(names).not.toContain("clickupfy_task_delete");
    expect(names).not.toContain("clickupfy_sprint_add_task");
    expect(names).not.toContain("clickupfy_sprint_remove_task");
    expect(names).not.toContain("clickupfy_sprint_set_points");
    expect(names).not.toContain("clickupfy_checklist_item_set");
    expect(names).not.toContain("clickupfy_checklist_create");
    expect(names).not.toContain("clickupfy_checklist_item_create");

    const resposta = await client.callTool({
      name: "clickupfy_accounts_list",
      arguments: {},
    });
    expect(JSON.stringify(resposta.content)).toContain("Engenharia");
    expect(JSON.stringify(resposta.content)).not.toContain("pk_teste");

    const writableTransport = new StdioClientTransport({
      command: resolve("node_modules/.bin/tsx"),
      args: [
        "src/cli.ts",
        "mcp",
        "serve",
        "--list",
        "list-project",
      ],
      cwd: resolve("."),
      env: {
        ...process.env,
        PROMOVAWEB_CLICKUPFY_CONFIG: caminho,
      } as Record<string, string>,
      stderr: "pipe",
    });
    const writableClient = new Client({ name: "teste-write", version: "1.0.0" });
    clientes.push(writableClient);
    await writableClient.connect(writableTransport);

    const writableNames = (await writableClient.listTools()).tools.map(
      (tool) => tool.name,
    );
    expect(writableNames).toContain("clickupfy_sprint_add_task");
    expect(writableNames).toContain("clickupfy_sprint_remove_task");
    expect(writableNames).toContain("clickupfy_sprint_set_points");
    expect(writableNames).toContain("clickupfy_checklist_create");
    expect(writableNames).toContain("clickupfy_checklist_item_create");
    expect(writableNames).toContain("clickupfy_checklist_item_set");
    expect(writableNames).toContain("clickupfy_doc_create");
    expect(writableNames).toContain("clickupfy_doc_page_create");
    expect(writableNames).toContain("clickupfy_doc_page_update");
  });

  it("usa a List do projeto quando o agente omite o ID", async () => {
    const pasta = await mkdtemp(join(tmpdir(), "clickupfy-project-mcp-"));
    const configPath = join(pasta, "config.json");
    const agora = new Date().toISOString();
    const config = criarConfiguracaoVazia();
    config.activeAccount = "dev";
    config.accounts.dev = {
      name: "Desenvolvimento",
      apiKey: "pk_teste",
      user: { id: 1, username: "dev" },
      workspace: { id: "123", name: "Engenharia" },
      createdAt: agora,
      updatedAt: agora,
    };
    process.env.PROMOVAWEB_CLICKUPFY_CONFIG = configPath;
    await salvarConfiguracao(config);
    const requisicoes: string[] = [];
    let checklistResolvido = false;
    const servidor = createServer((request, response) => {
      requisicoes.push(request.url ?? "");
      response.setHeader("Content-Type", "application/json");
      if (request.url?.startsWith("/api/v2/list/list-project/task")) {
        response.end(
          JSON.stringify({ tasks: [{ id: "task-1", name: "Implementar API" }] }),
        );
        return;
      }
      if (request.url === "/api/v2/list/list-project") {
        response.end(
          JSON.stringify({
            id: "list-project",
            name: "Desenvolvimento",
            statuses: [
              { status: "em revisão", type: "custom" },
              { status: "concluída", type: "closed" },
            ],
          }),
        );
        return;
      }
      if (
        request.method === "PUT" &&
        request.url ===
          "/api/v2/checklist/check-1/checklist_item/check-item-1"
      ) {
        checklistResolvido = true;
        response.end("{}");
        return;
      }
      if (request.url?.startsWith("/api/v2/task/task-root")) {
        response.end(
          JSON.stringify({
            id: "task-root",
            name: "Implementar API",
            status: { status: "em andamento", type: "custom" },
            checklists: [
              {
                id: "check-1",
                name: "Entrega",
                items: [
                  {
                    id: "check-item-1",
                    name: "Validar endpoint",
                    resolved: checklistResolvido,
                  },
                ],
              },
            ],
            subtasks: [
              {
                id: "sub-1",
                parent: "task-root",
                name: "Escrever testes",
                status: { status: "aberta", type: "custom" },
              },
            ],
          }),
        );
        return;
      }
      response.statusCode = 404;
      response.end(JSON.stringify({ err: "Não encontrado" }));
    });
    servidores.push(servidor);
    await new Promise<void>((resolveListen) =>
      servidor.listen(0, "127.0.0.1", resolveListen),
    );
    const endereco = servidor.address();
    if (!endereco || typeof endereco === "string") {
      throw new Error("Porta ausente.");
    }

    const transport = new StdioClientTransport({
      command: resolve("node_modules/.bin/tsx"),
      args: [
        "src/cli.ts",
        "mcp",
        "serve",
        "--account",
        "dev",
        "--workspace",
        "123",
        "--space",
        "space-1",
        "--list",
        "list-project",
      ],
      cwd: resolve("."),
      env: {
        ...process.env,
        PROMOVAWEB_CLICKUPFY_CONFIG: configPath,
        PROMOVAWEB_CLICKUPFY_API_URL: `http://127.0.0.1:${endereco.port}/api/v2`,
      } as Record<string, string>,
      stderr: "pipe",
    });
    const client = new Client({ name: "teste-project", version: "1.0.0" });
    clientes.push(client);
    await client.connect(transport);

    const nomes = (await client.listTools()).tools.map((tool) => tool.name);
    expect(nomes).toContain("clickupfy_task_create");
    expect(nomes).not.toContain("clickupfy_account_use");
    expect(nomes).not.toContain("clickupfy_workspace_use");

    const contexto = await client.callTool({
      name: "clickupfy_mcp_context",
      arguments: {},
    });
    const tarefas = await client.callTool({
      name: "clickupfy_tasks_list",
      arguments: {},
    });
    const list = await client.callTool({
      name: "clickupfy_list_get",
      arguments: {},
    });
    const busca = await client.callTool({
      name: "clickupfy_tasks_search",
      arguments: { query: "API" },
    });
    const leitura = await client.callTool({
      name: "clickupfy_task_get",
      arguments: { taskId: "task-root" },
    });
    const checklist = await client.callTool({
      name: "clickupfy_checklist_item_set",
      arguments: {
        taskId: "task-root",
        checklistId: "check-1",
        itemId: "check-item-1",
        resolved: true,
      },
    });
    const markdown = await client.callTool({
      name: "clickupfy_task_get",
      arguments: { taskId: "task-root", markdown: true },
    });

    expect(JSON.stringify(contexto.content)).toContain("list-project");
    expect(JSON.stringify(contexto.content)).not.toContain("sprintFolderId");
    expect(JSON.stringify(tarefas.content)).toContain("Implementar API");
    expect(JSON.stringify(list.content)).toContain("em revisão");
    expect(JSON.stringify(busca.content)).toContain("Implementar API");
    expect(JSON.stringify(leitura.content)).toContain("task:sub-1");
    expect(JSON.stringify(leitura.content)).toContain(
      "checklist:check-1:check-item-1",
    );
    expect(
      checklist.content
        .map((bloco) => ("text" in bloco ? bloco.text : ""))
        .join(""),
    ).toContain('"done": true');
    expect(
      markdown.content
        .map((bloco) => ("text" in bloco ? bloco.text : ""))
        .join(""),
    ).toContain("- [x] **Checklist · Entrega:** Validar endpoint");
    expect(requisicoes.some((url) => url.includes("/list/list-project/task"))).toBe(
      true,
    );
    const foraDoEscopo = await client.callTool({
      name: "clickupfy_tasks_list",
      arguments: { listId: "outra-list" },
    });
    expect(foraDoEscopo.isError).toBe(true);
    expect(JSON.stringify(foraDoEscopo.content)).toContain(
      "fixado em List list-project",
    );
  });

  it("encaminha Markdown, subtarefa, datas e checklists pelas ferramentas", async () => {
    const pasta = await mkdtemp(join(tmpdir(), "clickupfy-write-mcp-"));
    const configPath = join(pasta, "config.json");
    const agora = new Date().toISOString();
    const config = criarConfiguracaoVazia();
    config.activeAccount = "dev";
    config.accounts.dev = {
      name: "Desenvolvimento",
      apiKey: "pk_teste",
      user: { id: 1, username: "dev" },
      workspace: { id: "123", name: "Engenharia" },
      createdAt: agora,
      updatedAt: agora,
    };
    process.env.PROMOVAWEB_CLICKUPFY_CONFIG = configPath;
    await salvarConfiguracao(config);

    const requisicoes: Array<{
      method?: string;
      url?: string;
      body?: unknown;
    }> = [];
    const servidor = createServer(async (request, response) => {
      const partes: Buffer[] = [];
      for await (const parte of request) partes.push(Buffer.from(parte));
      const texto = Buffer.concat(partes).toString("utf8");
      requisicoes.push({
        method: request.method,
        url: request.url,
        ...(texto ? { body: JSON.parse(texto) } : {}),
      });
      response.setHeader("Content-Type", "application/json");
      response.end(JSON.stringify({ id: `resultado-${requisicoes.length}` }));
    });
    servidores.push(servidor);
    await new Promise<void>((resolveListen) =>
      servidor.listen(0, "127.0.0.1", resolveListen),
    );
    const endereco = servidor.address();
    if (!endereco || typeof endereco === "string") {
      throw new Error("Porta ausente.");
    }

    const transport = new StdioClientTransport({
      command: resolve("node_modules/.bin/tsx"),
      args: [
        "src/cli.ts",
        "mcp",
        "serve",
        "--account",
        "dev",
        "--list",
        "list-project",
      ],
      cwd: resolve("."),
      env: {
        ...process.env,
        PROMOVAWEB_CLICKUPFY_CONFIG: configPath,
        PROMOVAWEB_CLICKUPFY_API_URL: `http://127.0.0.1:${endereco.port}/api/v2`,
      } as Record<string, string>,
      stderr: "pipe",
    });
    const client = new Client({ name: "teste-write", version: "1.0.0" });
    clientes.push(client);
    await client.connect(transport);

    await client.callTool({
      name: "clickupfy_task_create",
      arguments: {
        name: "Subtarefa",
        markdownContent: "# Escopo",
        parent: "task-pai",
        startDate: 1_700_000_000_000,
        dueDate: 1_700_086_399_999,
      },
    });
    await client.callTool({
      name: "clickupfy_task_update",
      arguments: {
        taskId: "task-pai",
        status: "em revisão",
        startDate: 1_700_000_000_000,
        dueDate: 1_700_086_399_999,
      },
    });
    await client.callTool({
      name: "clickupfy_checklist_create",
      arguments: { taskId: "task-pai", name: "Testes" },
    });
    await client.callTool({
      name: "clickupfy_checklist_item_create",
      arguments: {
        checklistId: "check-1",
        name: "Executar testes unitários",
      },
    });

    expect(requisicoes).toEqual([
      {
        method: "POST",
        url: "/api/v2/list/list-project/task",
        body: {
          name: "Subtarefa",
          markdown_content: "# Escopo",
          parent: "task-pai",
          start_date: 1_700_000_000_000,
          due_date: 1_700_086_399_999,
        },
      },
      {
        method: "PUT",
        url: "/api/v2/task/task-pai",
        body: {
          status: "em revisão",
          start_date: 1_700_000_000_000,
          due_date: 1_700_086_399_999,
        },
      },
      {
        method: "POST",
        url: "/api/v2/task/task-pai/checklist",
        body: { name: "Testes" },
      },
      {
        method: "POST",
        url: "/api/v2/checklist/check-1/checklist_item",
        body: { name: "Executar testes unitários" },
      },
    ]);
  });

  it("consulta e gerencia Docs pela base v3", async () => {
    const pasta = await mkdtemp(join(tmpdir(), "clickupfy-docs-mcp-"));
    const configPath = join(pasta, "config.json");
    const agora = new Date().toISOString();
    const config = criarConfiguracaoVazia();
    config.activeAccount = "dev";
    config.accounts.dev = {
      name: "Desenvolvimento",
      apiKey: "pk_teste",
      user: { id: 1, username: "dev" },
      workspace: { id: "123", name: "Engenharia" },
      createdAt: agora,
      updatedAt: agora,
    };
    process.env.PROMOVAWEB_CLICKUPFY_CONFIG = configPath;
    await salvarConfiguracao(config);

    const requisicoes: Array<{
      method?: string;
      url?: string;
      body?: unknown;
    }> = [];
    const servidor = createServer(async (request, response) => {
      const partes: Buffer[] = [];
      for await (const parte of request) partes.push(Buffer.from(parte));
      const texto = Buffer.concat(partes).toString("utf8");
      requisicoes.push({
        method: request.method,
        url: request.url,
        ...(texto ? { body: JSON.parse(texto) } : {}),
      });
      response.setHeader("Content-Type", "application/json");
      if (request.method === "GET" && request.url?.startsWith("/api/v3/workspaces/123/docs")) {
        response.end(
          JSON.stringify({
            docs: [{ id: "doc-1", name: "Runbook" }],
            next_cursor: null,
          }),
        );
        return;
      }
      response.end(JSON.stringify({ id: "doc-1" }));
    });
    servidores.push(servidor);
    await new Promise<void>((resolveListen) =>
      servidor.listen(0, "127.0.0.1", resolveListen),
    );
    const endereco = servidor.address();
    if (!endereco || typeof endereco === "string") {
      throw new Error("Porta ausente.");
    }
    const baseUrl = `http://127.0.0.1:${endereco.port}`;

    const transport = new StdioClientTransport({
      command: resolve("node_modules/.bin/tsx"),
      args: ["src/cli.ts", "mcp", "serve", "--account", "dev", "--list", "list-project"],
      cwd: resolve("."),
      env: {
        ...process.env,
        PROMOVAWEB_CLICKUPFY_CONFIG: configPath,
        PROMOVAWEB_CLICKUPFY_API_URL: `${baseUrl}/api/v2`,
        PROMOVAWEB_CLICKUPFY_API_URL_V3: `${baseUrl}/api/v3`,
      } as Record<string, string>,
      stderr: "pipe",
    });
    const client = new Client({ name: "teste-docs", version: "1.0.0" });
    clientes.push(client);
    await client.connect(transport);

    const docs = await client.callTool({
      name: "clickupfy_docs_list",
      arguments: {},
    });
    await client.callTool({
      name: "clickupfy_doc_create",
      arguments: { name: "Runbook", parentId: "list-1", parentType: 6 },
    });
    await client.callTool({
      name: "clickupfy_doc_page_create",
      arguments: { docId: "doc-1", name: "Introdução", content: "# Introdução" },
    });
    await client.callTool({
      name: "clickupfy_doc_page_update",
      arguments: {
        docId: "doc-1",
        pageId: "page-1",
        content: "Novo parágrafo",
        contentEditMode: "append",
      },
    });

    expect(JSON.stringify(docs.content)).toContain("Runbook");
    expect(requisicoes).toEqual([
      { method: "GET", url: expect.stringContaining("/api/v3/workspaces/123/docs") },
      {
        method: "POST",
        url: "/api/v3/workspaces/123/docs",
        body: { name: "Runbook", parent: { id: "list-1", type: 6 } },
      },
      {
        method: "POST",
        url: "/api/v3/workspaces/123/docs/doc-1/pages",
        body: { name: "Introdução", content: "# Introdução" },
      },
      {
        method: "PUT",
        url: "/api/v3/workspaces/123/docs/doc-1/pages/page-1",
        body: { content: "Novo parágrafo", content_edit_mode: "append" },
      },
    ]);
  });
});
