/** Compara a superfície executável com as duas especificações e exercita cada endpoint. */
import { readFile } from "node:fs/promises";
import { Command } from "commander";
import { Client } from "@modelcontextprotocol/sdk/client/index.js";
import { InMemoryTransport } from "@modelcontextprotocol/sdk/inMemory.js";
import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { describe, it, expect, vi } from "vitest";
import { z } from "zod";
import { ClickUpClient } from "../src/clickup.js";
import {
  operations,
  operationShape,
  findOperation,
} from "../src/api/catalog.js";
import { operationExample } from "../src/api/examples.js";
import { executeOperation, applyScope } from "../src/api/execute.js";
import { registerApiCli } from "../src/api/cli.js";
import { registerApiMcp } from "../src/api/mcp.js";
import type { ContextoClickUp } from "../src/context.js";

/** Cria um cliente sem rede e conserva as chamadas para comparação com a especificação. */
function fakeClient() {
  const fetchFn = vi
    .fn<typeof fetch>()
    .mockImplementation(async () => new Response('{"ok":true}'));
  return {
    fetchFn,
    client: new ClickUpClient("pk_teste", {
      fetchFn,
      baseUrl: "https://clickup.test/api/v2",
      baseUrlV3: "https://clickup.test/api/v3",
    }),
  };
}

describe("cobertura da API pública", () => {
  it("inclui cada método e caminho oficial exatamente uma vez no CLI e no MCP", async () => {
    const expected: string[] = [];
    for (const version of ["v2", "v3"]) {
      const spec = JSON.parse(
        await readFile(
          new URL(`../api/${version}.json`, import.meta.url),
          "utf8",
        ),
      );
      for (const [path, item] of Object.entries(spec.paths))
        for (const method of [
          "get",
          "put",
          "post",
          "patch",
          "delete",
          "head",
          "options",
        ]) {
          if ((item as Record<string, unknown>)[method])
            expected.push(
              `${version} ${method.toUpperCase()} ${path.replace(/^\/(?:api\/)?v[23]/, "")}`,
            );
        }
    }
    expect(
      operations.map((o) => `${o.version} ${o.method} ${o.path}`).sort(),
    ).toEqual(expected.sort());
    expect(new Set(operations.map((o) => o.tool)).size).toBe(expected.length);
    expect(operations.every((o) => o.tool.length <= 128)).toBe(true);
    const api = registerApiCli(new Command());
    expect(
      api.commands
        .map((c) => c.name())
        .filter((n) => n.startsWith("v"))
        .sort(),
    ).toEqual(operations.map((o) => o.cli).sort());
  });

  it.each(operations)(
    "executa $id com método, caminho, corpo e autenticação oficiais",
    async (operation) => {
      const { client, fetchFn } = fakeClient();
      const input = operationExample(operation);
      // O schema MCP também deve ser serializável, inclusive unions e corpos DELETE.
      expect(
        z.toJSONSchema(z.strictObject(operationShape(operation))).type,
      ).toBe("object");
      await executeOperation(client, operation, input);
      expect(fetchFn).toHaveBeenCalledTimes(1);
      const [url, init] = fetchFn.mock.calls[0]!;
      const path = operation.path.replace(/\{([^}]+)\}/g, (_, key: string) =>
        encodeURIComponent(String(input.path?.[key])),
      );
      expect(new URL(String(url)).pathname).toBe(
        `/api/${operation.version}${path}`,
      );
      expect(init?.method).toBe(operation.method);
      expect((init?.headers as Record<string, string>).Authorization).toBe(
        operation.authenticated ? "pk_teste" : undefined,
      );
      if (input.files) {
        expect(init?.body).toBeInstanceOf(FormData);
        const file = (init?.body as FormData).get(
          input.files[0]!.field,
        ) as File;
        expect(await file.text()).toBe("teste");
        expect(
          (init?.headers as Record<string, string>)["Content-Type"],
        ).toBeUndefined();
      } else if (input.body !== undefined)
        expect(JSON.parse(String(init?.body))).toEqual(input.body);
    },
  );

  it("serializa filtros de tarefas com colchetes, objetos e caracteres reservados", async () => {
    const { client, fetchFn } = fakeClient();
    await executeOperation(client, findOperation("GetTasks"), {
      path: { list_id: "123" },
      query: {
        statuses: ["em revisão", "QA / pronta"],
        tags: ["a&b"],
        custom_fields: [{ field_id: "x", operator: "=", value: "teste" }],
      },
    });
    const url = new URL(String(fetchFn.mock.calls[0]![0]));
    expect(url.searchParams.getAll("statuses[]")).toEqual([
      "em revisão",
      "QA / pronta",
    ]);
    expect(url.searchParams.get("tags[]")).toBe("a&b");
    expect(JSON.parse(url.searchParams.get("custom_fields")!)).toEqual([
      { field_id: "x", operator: "=", value: "teste" },
    ]);
  });

  it("valida campos obrigatórios e confirmação antes de enviar uma escrita", async () => {
    const { client, fetchFn } = fakeClient();
    await expect(
      executeOperation(client, findOperation("CreateTask"), {
        path: { list_id: "123" },
        body: {},
      }),
    ).rejects.toThrow();
    await expect(
      executeOperation(client, findOperation("DeleteTask"), {
        path: { task_id: "task-1" },
      }),
    ).rejects.toThrow();
    await expect(
      executeOperation(client, findOperation("GetTask"), {
        path: { task_id: ".." },
      }),
    ).rejects.toThrow();
    await expect(
      executeOperation(client, findOperation("GetTask"), {
        path: { task_id: "DEV-1" },
        query: { custom_task_ids: true },
      }),
    ).rejects.toThrow("team_id");
    expect(fetchFn).not.toHaveBeenCalled();
  });

  it("preserva campos adicionais e null em corpos de atualização", async () => {
    const { client, fetchFn } = fakeClient();
    const body = {
      name: "Teste",
      due_date: null,
      campo_futuro: { valor: "mantido" },
    };
    await executeOperation(client, findOperation("UpdateTask"), {
      path: { task_id: "task-1" },
      body,
    });
    expect(JSON.parse(String(fetchFn.mock.calls[0]![1]?.body))).toEqual(body);
  });

  it("envia OAuth como formulário sem perfil ou Authorization", async () => {
    const { client, fetchFn } = fakeClient();
    await executeOperation(client, findOperation("GetAccessToken"), {
      contentType: "application/x-www-form-urlencoded",
      body: { client_id: "id", client_secret: "segredo", code: "code" },
    });
    expect(fetchFn.mock.calls[0]![1]?.body).toBeInstanceOf(URLSearchParams);
    expect(
      (fetchFn.mock.calls[0]![1]?.headers as Record<string, string>)
        .Authorization,
    ).toBeUndefined();
  });

  it("recusa hierarquia diferente da configuração do MCP", () => {
    expect(() =>
      applyScope(
        findOperation("GetTasks"),
        { path: { list_id: "999" } },
        { listId: "123" },
      ),
    ).toThrow("fixado");
    expect(
      applyScope(
        findOperation("getDocPublic"),
        { path: { doc_id: "doc-1" } },
        { workspaceId: "123" },
      ).path,
    ).toEqual({ doc_id: "doc-1", workspace_id: "123" });
  });

  it.each([true, false])(
    "anuncia e executa as ferramentas com readOnly=%s",
    async (readOnly) => {
      const { client: http, fetchFn } = fakeClient();
      const network = vi.spyOn(globalThis, "fetch").mockImplementation(fetchFn);
      const server = new McpServer({ name: "teste-api", version: "1" });
      const ctx = {
        client: http,
        account: { workspace: { id: "1" } },
      } as ContextoClickUp;
      registerApiMcp(server, { readOnly }, async () => ctx);
      const client = new Client({ name: "teste", version: "1" });
      const [left, right] = InMemoryTransport.createLinkedPair();
      await server.connect(right);
      await client.connect(left);
      try {
        const listed = await client.listTools();
        const expected = operations.filter((o) => !readOnly || o.readOnly);
        expect(listed.tools.map((t) => t.name).sort()).toEqual(
          expected.map((o) => o.tool).sort(),
        );
        for (const operation of expected) {
          const input = operationExample(operation);
          for (const parameter of operation.parameters) {
            if (
              ["team_id", "workspace_id"].includes(
                parameter.name.toLowerCase(),
              ) &&
              parameter.in === "path"
            )
              input.path![parameter.name] = "1";
          }
          const result = await client.callTool({
            name: operation.tool,
            arguments: input as Record<string, unknown>,
          });
          expect(
            result.isError,
            `${operation.id}: ${JSON.stringify(result)}`,
          ).not.toBe(true);
        }
        expect(fetchFn).toHaveBeenCalledTimes(expected.length);
        if (readOnly)
          expect(
            (
              await client.callTool({
                name: findOperation("DeleteTask").tool,
                arguments: { path: { task_id: "1" }, confirm: true },
              })
            ).isError,
          ).toBe(true);
      } finally {
        network.mockRestore();
        await client.close();
        await server.close();
      }
    },
  );
});
