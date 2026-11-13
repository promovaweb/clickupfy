/** Verifica a gestão de tags no Space e a preservação dos campos omitidos. */
import { describe, it, expect, vi } from "vitest";
import { ClickUpClient } from "../src/clickup.js";
import {
  createSpaceTag,
  deleteSpaceTag,
  listSpaceTags,
  removeTaskTag,
  updateSpaceTag,
} from "../src/tags.js";
import { registerTagMcp } from "../src/tags-mcp.js";
import { Client } from "@modelcontextprotocol/sdk/client/index.js";
import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { InMemoryTransport } from "@modelcontextprotocol/sdk/inMemory.js";
import type { ContextoClickUp } from "../src/context.js";

const tag = { name: "em revisão", tag_fg: "#ffffff", tag_bg: "#112233" };
function setup() {
  const fetchFn = vi
    .fn<typeof fetch>()
    .mockImplementation(
      async (_url, init) =>
        new Response(
          JSON.stringify(init?.method === "GET" ? { tags: [tag] } : {}),
        ),
    );
  return { fetchFn, client: new ClickUpClient("pk_teste", { fetchFn }) };
}

describe("gestão de tags", () => {
  it("lista e cria com as cores declaradas", async () => {
    const { client, fetchFn } = setup();
    expect(await listSpaceTags(client, "123")).toEqual([tag]);
    await createSpaceTag(client, "123", {
      name: tag.name,
      foreground: tag.tag_fg,
      background: tag.tag_bg,
    });
    expect(fetchFn.mock.calls[1]![1]).toMatchObject({
      method: "POST",
      body: JSON.stringify({ tag }),
    });
  });
  it("preserva cores ao renomear e nome ao alterar somente uma cor", async () => {
    const { client, fetchFn } = setup();
    await updateSpaceTag(client, "123", tag.name, { name: "revisada" });
    expect(JSON.parse(String(fetchFn.mock.calls[1]![1]?.body))).toEqual({
      tag: { name: "revisada", fg_color: tag.tag_fg, bg_color: tag.tag_bg },
    });
    await updateSpaceTag(client, "123", tag.name, { background: "#abcdef" });
    expect(JSON.parse(String(fetchFn.mock.calls[3]![1]?.body))).toEqual({
      tag: { name: tag.name, fg_color: tag.tag_fg, bg_color: "#abcdef" },
    });
  });
  it("envia a definição completa no DELETE do Space", async () => {
    const { client, fetchFn } = setup();
    await deleteSpaceTag(client, "123", tag.name);
    expect(String(fetchFn.mock.calls[1]![0])).toContain(
      "/space/123/tag/em%20revis%C3%A3o",
    );
    expect(fetchFn.mock.calls[1]![1]).toMatchObject({
      method: "DELETE",
      body: JSON.stringify({ tag }),
    });
  });
  it("remove a associação com ID personalizado sem excluir no Space", async () => {
    const { client, fetchFn } = setup();
    await removeTaskTag(client, "DEV-42", tag.name, "123");
    expect(String(fetchFn.mock.calls[0]![0])).toContain(
      "/task/DEV-42/tag/em%20revis%C3%A3o?custom_task_ids=true&team_id=123",
    );
    expect(fetchFn.mock.calls[0]![1]?.method).toBe("DELETE");
    expect(fetchFn.mock.calls[0]![1]?.body).toBeUndefined();
  });
  it("recusa nome vazio, cor inválida, atualização vazia e tag ausente", async () => {
    const { client, fetchFn } = setup();
    await expect(
      createSpaceTag(client, "123", {
        name: " ",
        foreground: "#ffffff",
        background: "#000000",
      }),
    ).rejects.toThrow();
    await expect(
      createSpaceTag(client, "123", {
        name: "bug",
        foreground: "red",
        background: "#000000",
      }),
    ).rejects.toThrow();
    await expect(updateSpaceTag(client, "123", tag.name, {})).rejects.toThrow();
    expect(fetchFn).not.toHaveBeenCalled();
    await expect(deleteSpaceTag(client, "123", "ausente")).rejects.toThrow(
      "não encontrada",
    );
    expect(fetchFn).toHaveBeenCalledTimes(1);
  });
  it.each([true, false])(
    "aplica read-only=%s e Space fixado no MCP",
    async (readOnly) => {
      const { client: http, fetchFn } = setup();
      const context = async () =>
        ({
          client: http,
          account: { workspace: { id: "1" } },
        }) as ContextoClickUp;
      const server = new McpServer({ name: "tags", version: "1" });
      registerTagMcp(server, { readOnly, spaceId: "123" }, context);
      const client = new Client({ name: "teste", version: "1" });
      const [a, b] = InMemoryTransport.createLinkedPair();
      await server.connect(b);
      await client.connect(a);
      try {
        const names = (await client.listTools()).tools.map((t) => t.name);
        expect(names.length).toBe(readOnly ? 1 : 5);
        expect(
          (
            await client.callTool({
              name: "clickupfy_tags_list",
              arguments: {},
            })
          ).isError,
        ).not.toBe(true);
        expect(
          (
            await client.callTool({
              name: "clickupfy_tags_list",
              arguments: { spaceId: "999" },
            })
          ).isError,
        ).toBe(true);
        expect(fetchFn).toHaveBeenCalledTimes(1);
        if (!readOnly) {
          for (const [name, args] of [
            [
              "clickupfy_tag_create",
              { name: "bug", foreground: "#ffffff", background: "#000000" },
            ],
            ["clickupfy_tag_update", { tagName: tag.name, name: "pronta" }],
            ["clickupfy_tag_delete", { tagName: tag.name, confirm: true }],
            [
              "clickupfy_task_remove_tag",
              { taskId: "DEV-42", tagName: tag.name, customTaskId: true },
            ],
          ] as const)
            expect(
              (await client.callTool({ name, arguments: args })).isError,
            ).not.toBe(true);
          expect(
            (
              await client.callTool({
                name: "clickupfy_tag_delete",
                arguments: { tagName: tag.name },
              })
            ).isError,
          ).toBe(true);
        }
      } finally {
        await client.close();
        await server.close();
      }
    },
  );
});
