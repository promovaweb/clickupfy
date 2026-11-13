/**
 * Spec 0009: API catalog commands (`api list|describe|call`, plus the hidden
 * 0.9.0 form `api v2-<slug>`) and the generated `clickupfy_api_*` tools,
 * against a fake ClickUp API.
 */
import { afterAll, beforeAll, describe, expect, test } from "bun:test";
import { writeFileSync } from "node:fs";
import { join } from "node:path";
import { fakeClickUp, testEnv, toolJson, type FakeApi, type TestEnv } from "./helpers/clickup.ts";
import { apiOperations, findApiOperation } from "../src/api/catalog.ts";

let api: FakeApi;
let env: TestEnv;

beforeAll(async () => {
  api = fakeClickUp({
    "GET /task/abc": () => Response.json({ id: "abc", name: "Fix login" }),
    "DELETE /task/abc": () => Response.json({}),
    "GET /list/901/task": () => Response.json({ tasks: [{ id: "t1" }] }),
    "GET /team/111/space": () => Response.json({ spaces: [{ id: "S1" }] }),
    "POST /task/abc/attachment": () => Response.json({ id: "att1" }),
    "v3 GET /workspaces/111/chat/channels": () => Response.json({ data: [] }),
  });
  env = await testEnv(api);
});

afterAll(async () => {
  await env.close();
  api.stop();
});

function last() {
  return api.requests[api.requests.length - 1]!;
}

describe("catalog", () => {
  test("has the 0.9.0 operations with stable names", () => {
    expect(apiOperations.length).toBe(173);
    const op = findApiOperation("v2-get-task");
    expect(op.id).toBe("GetTask");
    expect(op.tool).toBe("clickupfy_api_v2_get_task");
    expect(findApiOperation("clickupfy_api_v2_get_task")).toBe(op);
  });

  test("the generator check finds the committed catalog current", () => {
    const r = Bun.spawnSync(["bun", "run", "scripts/generate-api.ts", "--check"], { cwd: join(import.meta.dir, "..") });
    expect(r.exitCode).toBe(0);
  });
});

describe("api commands", () => {
  test("api list --json filters by group and effect", async () => {
    const all = await env.cli(["api", "list", "--json"]);
    expect(all.code).toBe(0);
    expect(all.json.data.total).toBe(173);
    expect(all.json.data.sources).toHaveLength(2);
    const reads = await env.cli(["api", "list", "--read-only", "--group", "tasks", "--json"]);
    const ops = reads.json.data.operations as Array<{ group: string; readOnly: boolean; id: string }>;
    expect(ops.length).toBeGreaterThan(0);
    expect(ops.every((o) => o.group === "Tasks" && o.readOnly)).toBe(true);
    expect(ops.some((o) => o.id === "GetTask")).toBe(true);
  });

  test("api describe of a known operation returns the input schema", async () => {
    const r = await env.cli(["api", "describe", "GetTask", "--json"]);
    expect(r.code).toBe(0);
    expect(r.json.data).toMatchObject({ id: "GetTask", method: "GET", path: "/task/{task_id}", cli: "v2-get-task" });
    expect(r.json.data.inputSchema.properties.path.required).toEqual(["task_id"]);
    const del = await env.cli(["api", "describe", "v2-delete-task", "--json"]);
    expect(del.json.data.inputSchema.properties.confirm).toBeDefined();
    const text = await env.cli(["api", "describe", "clickupfy_api_v2_get_task"]);
    expect(text.stdout).toContain("GET /task/{task_id}");
    expect((await env.cli(["api", "describe", "NoSuchOperation", "--json"])).code).toBe(6);
  });

  test("api call sends the request to the documented path", async () => {
    const r = await env.cli(["api", "call", "v2-get-task", "--path", '{"task_id":"abc"}', "--json"]);
    expect(r.code).toBe(0);
    expect(r.json.data).toEqual({ id: "abc", name: "Fix login" });
    expect(last()).toMatchObject({ method: "GET", path: "/task/abc", version: "v2" });
  });

  test("the 0.9.0 form api v2-<slug> still works", async () => {
    const r = await env.cli(["api", "v2-get-task", "--path", '{"task_id":"abc"}', "--json"]);
    expect(r.code).toBe(0);
    expect(r.json.data.id).toBe("abc");
  });

  test("query arrays follow the v2 convention and v3 goes to /api/v3", async () => {
    const r = await env.cli(["api", "call", "GetTasks", "--path", '{"list_id":"901"}', "--query", '{"statuses":["to do","done"]}', "--json"]);
    expect(r.code).toBe(0);
    expect(last().query.getAll("statuses[]")).toEqual(["to do", "done"]);
    const v3 = await env.cli(["api", "call", "v3-get-chat-channels", "--path", '{"workspace_id":"111"}', "--json"]);
    expect(v3.code).toBe(0);
    expect(last()).toMatchObject({ version: "v3", path: "/workspaces/111/chat/channels" });
  });

  test("--input - reads the envelope from stdin", async () => {
    const r = await env.cli(["api", "call", "v2-get-task", "--input", "-", "--json"], JSON.stringify({ path: { task_id: "abc" } }));
    expect(r.code).toBe(0);
    expect(r.json.data.id).toBe("abc");
  });

  test("repeated --file sends a multipart body", async () => {
    const a = join(env.home, "a.txt");
    const b = join(env.home, "b.txt");
    writeFileSync(a, "first file");
    writeFileSync(b, "second file");
    const r = await env.cli([
      "api", "call", "v2-create-task-attachment", "--path", '{"task_id":"abc"}',
      "--file", `attachment[0]=${a}`, "--file", `attachment[1]=${b}`, "--json",
    ]);
    expect(r.code).toBe(0);
    const body = String(last().body);
    expect(body).toContain('filename="a.txt"');
    expect(body).toContain('filename="b.txt"');
    expect(body).toContain("second file");
  });

  test("validation and confirmation errors exit with 2 without calling the API", async () => {
    const before = api.requests.length;
    expect((await env.cli(["api", "call", "v2-get-task", "--json"])).code).toBe(2);
    expect((await env.cli(["api", "call", "v2-get-task", "--path", "{bad", "--json"])).code).toBe(2);
    expect((await env.cli(["api", "call", "v2-get-task", "--path", '{"task_id":"abc","extra":1}', "--json"])).code).toBe(2);
    expect((await env.cli(["api", "call", "v2-delete-task", "--path", '{"task_id":"abc"}', "--json"])).code).toBe(2);
    expect((await env.cli(["api", "call", "v2-get-task", "--body", "{}", "--body-file", "x.json"])).code).toBe(2);
    expect((await env.cli(["api", "call", "nope", "--json"])).code).toBe(6);
    expect(api.requests.length).toBe(before);
  });

  test("--dry-run validates without sending; --yes confirms a DELETE", async () => {
    const before = api.requests.length;
    const dry = await env.cli(["api", "call", "v2-delete-task", "--path", '{"task_id":"abc"}', "--yes", "--dry-run", "--json"]);
    expect(dry.json.data).toEqual({ valid: true, operation: "DeleteTask", method: "DELETE", path: "/task/{task_id}" });
    expect(api.requests.length).toBe(before);
    const del = await env.cli(["api", "call", "v2-delete-task", "--path", '{"task_id":"abc"}', "--yes", "--json"]);
    expect(del.code).toBe(0);
    expect(last()).toMatchObject({ method: "DELETE", path: "/task/abc" });
  });

  test("API errors keep the client exit codes", async () => {
    expect((await env.cli(["api", "call", "v2-get-task", "--path", '{"task_id":"missing"}', "--json"])).code).toBe(6);
  });
});

describe("catalog tools", () => {
  test("are exposed by default with the 0.9.0 input and annotations", async () => {
    const client = await env.mcp(["mcp"]);
    const tools = (await client.listTools()).tools;
    const get = tools.find((t) => t.name === "clickupfy_api_v2_get_task")!;
    expect(get).toBeDefined();
    expect(Object.keys(get.inputSchema.properties ?? {}).sort()).toEqual(["account", "path", "query"]);
    expect(get.annotations).toMatchObject({ readOnlyHint: true, destructiveHint: false, openWorldHint: true });
    const del = tools.find((t) => t.name === "clickupfy_api_v2_delete_task")!;
    expect(del.inputSchema.required).toContain("confirm");
    expect(del.annotations).toMatchObject({ readOnlyHint: false, destructiveHint: true });
    const attach = tools.find((t) => t.name === "clickupfy_api_v2_create_task_attachment")!;
    expect(Object.keys(attach.inputSchema.properties ?? {})).toEqual(expect.arrayContaining(["body", "contentType", "files"]));

    const result = await client.callTool({ name: "clickupfy_api_v2_get_task", arguments: { path: { task_id: "abc" } } });
    expect(result.isError).toBeFalsy();
    expect(toolJson(result)).toEqual({ id: "abc", name: "Fix login" });
    const refused = await client.callTool({ name: "clickupfy_api_v2_delete_task", arguments: { path: { task_id: "abc" } } });
    expect(refused.isError).toBe(true);
  });

  test("write tools are omitted in --read-only", async () => {
    const client = await env.mcp(["mcp", "serve", "--list", "L1", "--read-only"]);
    const names = (await client.listTools()).tools.map((t) => t.name);
    expect(names).toContain("clickupfy_api_v2_get_task");
    expect(names).not.toContain("clickupfy_api_v2_delete_task");
    expect(names).not.toContain("clickupfy_api_v2_create_task");
    expect(names.filter((n) => n.startsWith("clickupfy_api_")).length).toBe(apiOperations.filter((o) => o.readOnly).length);
  });

  test("pinned ids fill the operation parameters and refuse other values", async () => {
    const client = await env.mcp(["mcp", "serve", "--account", "work", "--list", "901"]);
    const tasks = await client.callTool({ name: "clickupfy_api_v2_get_tasks", arguments: {} });
    expect(toolJson(tasks)).toEqual({ tasks: [{ id: "t1" }] });
    expect(last().path).toBe("/list/901/task");
    const other = await client.callTool({ name: "clickupfy_api_v2_get_tasks", arguments: { path: { list_id: "902" } } });
    expect(other.isError).toBe(true);
    const spaces = await client.callTool({ name: "clickupfy_api_v2_get_spaces", arguments: {} });
    expect(spaces.isError).toBeFalsy();
    expect(last().path).toBe("/team/111/space");
    const wrong = await client.callTool({ name: "clickupfy_api_v2_get_task", arguments: { account: "other", path: { task_id: "abc" } } });
    expect(wrong.isError).toBe(true);
  });
});
