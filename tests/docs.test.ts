/**
 * Spec 0008: doc and doc page commands and tools against a fake ClickUp API (v3).
 */
import { afterAll, beforeAll, describe, expect, test } from "bun:test";
import { mkdtempSync, rmSync, writeFileSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { fakeClickUp, testEnv, toolJson, type FakeApi, type TestEnv } from "./helpers/clickup.ts";

const W = "/workspaces/111/docs";
const PAGE = { id: "P1", doc_id: "D1", name: "Overview", content: "# Overview\nBody", orderindex: 0 };

let api: FakeApi;
let env: TestEnv;
let dir: string;

beforeAll(async () => {
  api = fakeClickUp({
    [`v3 GET ${W}`]: (req) =>
      req.query.get("cursor")
        ? Response.json({ docs: [{ id: "D2", name: "Specs" }], next_cursor: null })
        : Response.json({ docs: [{ id: "D1", name: "Roadmap" }], next_cursor: "c2" }),
    [`v3 GET ${W}/D1`]: () => Response.json({ id: "D1", name: "Roadmap" }),
    [`v3 POST ${W}`]: (req) => Response.json({ id: "D3", ...(req.body as object) }),
    [`v3 GET ${W}/D1/pageListing`]: () =>
      Response.json([{ id: "P1", name: "Overview", pages: [{ id: "P2", name: "Details", pages: [] }] }]),
    [`v3 GET ${W}/D1/pages`]: () => Response.json([PAGE]),
    [`v3 GET ${W}/D1/pages/P1`]: () => Response.json(PAGE),
    [`v3 POST ${W}/D1/pages`]: () => Response.json({ id: "P9", name: "New" }),
    [`v3 PUT ${W}/D1/pages/P1`]: () => Response.json({ id: "P1", name: "Overview" }),
  });
  env = await testEnv(api);
  dir = mkdtempSync(join(tmpdir(), "clickupfy-docs-"));
});

afterAll(async () => {
  await env.close();
  api.stop();
  rmSync(dir, { recursive: true, force: true });
});

const last = () => api.requests.at(-1)!;

describe("doc commands", () => {
  test("doc list follows the cursor, sends filters and filters by query", async () => {
    const r = await env.cli(["doc", "list", "--parent-id", "S1", "--parent-type", "4", "--archived", "--json"]);
    expect(r.code).toBe(0);
    expect(r.json.data.docs.map((d: { id: string }) => d.id)).toEqual(["D1", "D2"]);
    const first = api.requests.findLast((q) => q.version === "v3" && q.path === W && !q.query.get("cursor"))!;
    expect(first.query.get("parent_id")).toBe("S1");
    expect(first.query.get("parent_type")).toBe("4");
    expect(first.query.get("archived")).toBe("true");
    const q = await env.cli(["doc", "ls", "--query", "spec", "--json"]);
    expect(q.json.data.docs).toEqual([{ id: "D2", name: "Specs" }]);
    const one = await env.cli(["doc", "list", "--max-pages", "1", "--json"]);
    expect(one.json.data.docs).toHaveLength(1);
  });

  test("doc get and an unknown doc exits 6", async () => {
    expect((await env.cli(["doc", "get", "D1", "--json"])).json.data.name).toBe("Roadmap");
    expect((await env.cli(["doc", "get", "NOPE"])).code).toBe(6);
  });

  test("doc create sends the v3 body and validates the parent", async () => {
    const r = await env.cli(["doc", "create", "--name", "Plan", "--parent-id", "S1", "--parent-type", "4", "--visibility", "PRIVATE", "--create-page", "--json"]);
    expect(r.code).toBe(0);
    expect(last().body).toEqual({ name: "Plan", parent: { id: "S1", type: 4 }, visibility: "PRIVATE", create_page: true });
    expect((await env.cli(["doc", "create", "--name", "Plan", "--parent-id", "S1"])).code).toBe(2);
    expect((await env.cli(["doc", "create"])).code).toBe(2);
  });
});

describe("doc page commands", () => {
  test("doc page tree prints the hierarchy", async () => {
    const r = await env.cli(["doc", "page", "tree", "D1"]);
    expect(r.stdout).toContain("Overview (P1)");
    expect(r.stdout).toContain("  Details (P2)");
    expect((await env.cli(["doc", "page", "tree", "D1", "--json"])).json.data.pages[0].pages[0].id).toBe("P2");
  });

  test("doc page list and get send the content format", async () => {
    const list = await env.cli(["doc", "page", "ls", "D1", "--max-page-depth", "2", "--content-format", "text/plain", "--json"]);
    expect(list.json.data.pages[0].id).toBe("P1");
    expect(last().query.get("max_page_depth")).toBe("2");
    expect(last().query.get("content_format")).toBe("text/plain");
    const text = await env.cli(["doc", "page", "get", "D1", "P1"]);
    expect(text.stdout).toContain("# Overview\nBody");
    expect((await env.cli(["doc", "page", "get", "D1", "P1", "--json"])).json.data.id).toBe("P1");
  });

  test("doc page create with --content, --file and stdin", async () => {
    await env.cli(["doc", "page", "create", "D1", "--name", "New", "--content", "hi", "--sub-title", "s", "--parent-page", "P1", "--orderindex", "2", "--json"]);
    expect(last().body).toEqual({ name: "New", content: "hi", sub_title: "s", parent_page_id: "P1", orderindex: 2 });
    const file = join(dir, "page.md");
    writeFileSync(file, "﻿# From file\n");
    await env.cli(["doc", "page", "create", "D1", "--name", "New", "--file", file, "--json"]);
    expect(last().body).toEqual({ name: "New", content: "# From file\n" });
    await env.cli(["doc", "page", "create", "D1", "--name", "New", "--file", "-", "--json"], "piped body");
    expect(last().body).toEqual({ name: "New", content: "piped body" });
    expect((await env.cli(["doc", "page", "create", "D1", "--name", "New", "--file", join(dir, "missing.md")])).code).toBe(6);
    expect((await env.cli(["doc", "page", "create", "D1", "--name", "N", "--content", "a", "--file", file])).code).toBe(2);
  });

  test("doc page update reads content from stdin", async () => {
    const r = await env.cli(["doc", "page", "update", "D1", "P1", "--file", "-", "--content-edit-mode", "append", "--json"], "## Log\n");
    expect(r.code).toBe(0);
    expect(last().method).toBe("PUT");
    expect(last().body).toEqual({ content: "## Log\n", content_edit_mode: "append" });
  });

  test("doc page update validates fields and the edit mode", async () => {
    await env.cli(["doc", "page", "update", "D1", "P1", "--name", "T", "--sub-title", "S", "--json"]);
    expect(last().body).toEqual({ name: "T", sub_title: "S" });
    expect((await env.cli(["doc", "page", "update", "D1", "P1"])).code).toBe(2);
    expect((await env.cli(["doc", "page", "update", "D1", "P1", "--content", "x", "--content-edit-mode", "merge"])).code).toBe(2);
  });
});

describe("doc tools", () => {
  test("read and write tools use the profile workspace", async () => {
    const client = await env.mcp(["mcp", "serve", "--list", "L1"]);
    const docs = toolJson(await client.callTool({ name: "clickupfy_docs_list", arguments: { query: "road" } }));
    expect(docs.docs).toEqual([{ id: "D1", name: "Roadmap" }]);
    expect(toolJson(await client.callTool({ name: "clickupfy_doc_get", arguments: { docId: "D1" } })).id).toBe("D1");
    expect(toolJson(await client.callTool({ name: "clickupfy_doc_page_tree", arguments: { docId: "D1" } })).pages[0].id).toBe("P1");
    expect(toolJson(await client.callTool({ name: "clickupfy_doc_pages_list", arguments: { docId: "D1" } })).pages).toHaveLength(1);
    expect(toolJson(await client.callTool({ name: "clickupfy_doc_page_get", arguments: { docId: "D1", pageId: "P1" } })).content).toContain("Body");
    await client.callTool({ name: "clickupfy_doc_create", arguments: { name: "M", createPage: false } });
    expect(last().body).toEqual({ name: "M", create_page: false });
    const missingType = await client.callTool({ name: "clickupfy_doc_create", arguments: { name: "M", parentId: "S1" } });
    expect(missingType.isError).toBe(true);
    await client.callTool({ name: "clickupfy_doc_page_create", arguments: { docId: "D1", name: "N", parentPageId: "P1", content: "c" } });
    expect(last().body).toEqual({ name: "N", content: "c", parent_page_id: "P1" });
    await client.callTool({ name: "clickupfy_doc_page_update", arguments: { docId: "D1", pageId: "P1", content: "x", contentEditMode: "prepend" } });
    expect(last().body).toEqual({ content: "x", content_edit_mode: "prepend" });
    const empty = await client.callTool({ name: "clickupfy_doc_page_update", arguments: { docId: "D1", pageId: "P1" } });
    expect(empty.isError).toBe(true);
  });

  test("the file param is CLI-only and read-only hides write tools", async () => {
    const client = await env.mcp(["mcp", "serve", "--list", "L1", "--read-only"]);
    const tools = (await client.listTools()).tools;
    const names = tools.map((t) => t.name);
    expect(names).toContain("clickupfy_doc_page_get");
    expect(names).not.toContain("clickupfy_doc_page_update");
    const full = await env.mcp(["mcp", "serve", "--list", "L1"]);
    const update = (await full.listTools()).tools.find((t) => t.name === "clickupfy_doc_page_update")!;
    expect(Object.keys(update.inputSchema.properties ?? {})).not.toContain("file");
  });
});
