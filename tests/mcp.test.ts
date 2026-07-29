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
      args: ["src/cli.ts", "mcp", "serve", "--read-only"],
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
    expect(names).toContain("clickupfy_task_get");
    expect(names).toContain("clickupfy_tasks_search");
    expect(names).toContain("clickupfy_sprints_list");
    expect(names).toContain("clickupfy_sprint_current");
    expect(names).toContain("clickupfy_sprint_get");
    expect(names).toContain("clickupfy_sprint_tasks");
    expect(names).not.toContain("clickupfy_task_create");
    expect(names).not.toContain("clickupfy_task_delete");
    expect(names).not.toContain("clickupfy_sprint_add_task");
    expect(names).not.toContain("clickupfy_sprint_remove_task");
    expect(names).not.toContain("clickupfy_sprint_set_points");

    const resposta = await client.callTool({
      name: "clickupfy_accounts_list",
      arguments: {},
    });
    expect(JSON.stringify(resposta.content)).toContain("Engenharia");
    expect(JSON.stringify(resposta.content)).not.toContain("pk_teste");

    const writableTransport = new StdioClientTransport({
      command: resolve("node_modules/.bin/tsx"),
      args: ["src/cli.ts", "mcp", "serve"],
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
    const servidor = createServer((request, response) => {
      requisicoes.push(request.url ?? "");
      response.setHeader("Content-Type", "application/json");
      if (request.url?.startsWith("/api/v2/list/list-project/task")) {
        response.end(
          JSON.stringify({ tasks: [{ id: "task-1", name: "Implementar API" }] }),
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
    const busca = await client.callTool({
      name: "clickupfy_tasks_search",
      arguments: { query: "API" },
    });

    expect(JSON.stringify(contexto.content)).toContain("list-project");
    expect(JSON.stringify(tarefas.content)).toContain("Implementar API");
    expect(JSON.stringify(busca.content)).toContain("Implementar API");
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
});
