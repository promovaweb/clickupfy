/** Confere tags pela API, pelo CLI e pelo protocolo MCP sem alterar tarefas reais. */
import { execFile } from "node:child_process";
import { mkdtemp, rm, writeFile } from "node:fs/promises";
import { createServer } from "node:http";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { promisify } from "node:util";
import { Client } from "@modelcontextprotocol/sdk/client/index.js";
import { InMemoryTransport } from "@modelcontextprotocol/sdk/inMemory.js";
import { describe, expect, it, vi } from "vitest";
import { ClickUpClient } from "../src/clickup.js";
import { criarConfiguracaoVazia } from "../src/config.js";
import { createMcpServer } from "../src/mcp.js";

const executar = promisify(execFile);

describe("tags de tarefas", () => {
  it.each([undefined, "123"])(
    "codifica nomes e envia workspace %s sem corpo",
    async (workspaceId) => {
      const fetchFn = vi
        .fn<typeof fetch>()
        .mockResolvedValue(new Response("{}"));
      const client = new ClickUpClient("pk_teste", { fetchFn });
      await expect(
        client.adicionarTagTarefa("DEV-42", "revisão / QA?#%", workspaceId),
      ).resolves.toEqual({});
      const [url, init] = fetchFn.mock.calls[0]!;
      expect(new URL(String(url)).pathname).toBe(
        "/api/v2/task/DEV-42/tag/revis%C3%A3o%20%2F%20QA%3F%23%25",
      );
      expect(new URL(String(url)).search).toBe(
        workspaceId ? "?custom_task_ids=true&team_id=123" : "",
      );
      expect(init).toMatchObject({
        method: "POST",
        headers: { Authorization: "pk_teste" },
      });
      expect(init?.body).toBeUndefined();
    },
  );

  it("recusa campos vazios antes de acessar a API", async () => {
    const fetchFn = vi.fn<typeof fetch>();
    const client = new ClickUpClient("pk_teste", { fetchFn });
    await expect(client.adicionarTagTarefa("task-1", " ")).rejects.toThrow(
      "nome da tag",
    );
    await expect(client.adicionarTagTarefa(" ", "bug")).rejects.toThrow(
      "ID da tarefa",
    );
    await expect(
      client.adicionarTagTarefa("DEV-42", "bug", ""),
    ).rejects.toThrow("workspace");
    expect(fetchFn).not.toHaveBeenCalled();
  });

  it("propaga a recusa da API", async () => {
    const fetchFn = vi
      .fn<typeof fetch>()
      .mockResolvedValue(new Response('{"err":"Sem acesso"}', { status: 403 }));
    await expect(
      new ClickUpClient("pk_teste", { fetchFn }).adicionarTagTarefa(
        "task-1",
        "bug",
      ),
    ).rejects.toThrow("Sem acesso");
  });

  it("executa o CLI e o MCP com o perfil selecionado e trata falhas", async () => {
    const pasta = await mkdtemp(join(tmpdir(), "clickupfy-tags-"));
    const configPath = join(pasta, "config.json");
    const config = criarConfiguracaoVazia();
    const agora = new Date().toISOString();
    config.activeAccount = "dev";
    config.accounts.dev = {
      name: "Dev",
      apiKey: "pk_teste",
      user: { id: 1 },
      workspace: { id: "123", name: "Dev" },
      createdAt: agora,
      updatedAt: agora,
    };
    await writeFile(configPath, JSON.stringify(config));
    const requests: string[] = [];
    const http = createServer((req, res) => {
      requests.push(`${req.method} ${req.url}`);
      expect(req.headers.authorization).toBe("pk_teste");
      res.setHeader("Content-Type", "application/json");
      if (req.url?.includes("/tag/negada")) {
        res.writeHead(403);
        res.end('{"err":"Sem acesso"}');
      } else res.end("{}");
    });
    await new Promise<void>((resolve) => http.listen(0, "127.0.0.1", resolve));
    const address = http.address();
    if (!address || typeof address === "string")
      throw new Error("Porta ausente");
    const env = {
      PROMOVAWEB_CLICKUPFY_CONFIG: configPath,
      PROMOVAWEB_CLICKUPFY_API_URL: `http://127.0.0.1:${address.port}/api/v2`,
    };
    const original = {
      config: process.env.PROMOVAWEB_CLICKUPFY_CONFIG,
      url: process.env.PROMOVAWEB_CLICKUPFY_API_URL,
    };
    const server = createMcpServer({ listId: "list-test" });
    const client = new Client({ name: "tags-test", version: "1.0.0" });
    try {
      const cli = await executar(
        process.execPath,
        [
          "--import",
          "tsx",
          "src/cli.ts",
          "--json",
          "task",
          "add-tag",
          "DEV-42",
          "em revisão",
          "--custom-task-id",
        ],
        { env: { ...process.env, ...env } },
      );
      expect(JSON.parse(cli.stdout)).toEqual({
        added: true,
        taskId: "DEV-42",
        tagName: "em revisão",
      });
      Object.assign(process.env, env);
      const [clientTransport, serverTransport] =
        InMemoryTransport.createLinkedPair();
      await server.connect(serverTransport);
      await client.connect(clientTransport);
      const result = await client.callTool({
        name: "clickupfy_task_add_tag",
        arguments: {
          taskId: "DEV-42",
          tagName: "em revisão",
          customTaskId: true,
          account: "dev",
        },
      });
      expect(result.isError).not.toBe(true);
      expect(requests).toEqual(
        Array(2).fill(
          "POST /api/v2/task/DEV-42/tag/em%20revis%C3%A3o?custom_task_ids=true&team_id=123",
        ),
      );
      const failure = await client.callTool({
        name: "clickupfy_task_add_tag",
        arguments: { taskId: "task-1", tagName: "negada" },
      });
      expect(failure.isError).toBe(true);
      await expect(
        executar(
          process.execPath,
          [
            "--import",
            "tsx",
            "src/cli.ts",
            "--json",
            "task",
            "add-tag",
            "task-1",
            "negada",
          ],
          { env: { ...process.env, ...env } },
        ),
      ).rejects.toThrow();
    } finally {
      await client.close();
      await server.close();
      await new Promise<void>((resolve, reject) =>
        http.close((error) => (error ? reject(error) : resolve())),
      );
      if (original.config === undefined)
        delete process.env.PROMOVAWEB_CLICKUPFY_CONFIG;
      else process.env.PROMOVAWEB_CLICKUPFY_CONFIG = original.config;
      if (original.url === undefined)
        delete process.env.PROMOVAWEB_CLICKUPFY_API_URL;
      else process.env.PROMOVAWEB_CLICKUPFY_API_URL = original.url;
      await rm(pasta, { recursive: true, force: true });
    }
  });
});
