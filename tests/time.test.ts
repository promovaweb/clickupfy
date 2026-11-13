/**
 * Spec 0007: time tracking commands and tools against a fake ClickUp API,
 * including the warning when `time start` replaces a timer on another task.
 */
import { afterAll, beforeAll, describe, expect, test } from "bun:test";
import { fakeClickUp, testEnv, toolJson, type FakeApi, type TestEnv } from "./helpers/clickup.ts";

let api: FakeApi;
let env: TestEnv;
/** Running entry of the fake workspace 111. */
let running: Record<string, unknown> | null = null;

beforeAll(async () => {
  api = fakeClickUp({
    "GET /team/111/time_entries/current": () => Response.json({ data: running }),
    "POST /team/111/time_entries/start": (r) => {
      const body = r.body as { tid: string; description?: string };
      running = { id: "E2", task: { id: body.tid, name: `Task ${body.tid}` }, description: body.description ?? "", start: "1700000000000" };
      return Response.json({ data: running });
    },
    "POST /team/111/time_entries/stop": () => {
      if (!running) return Response.json({ err: "No timer running", ECODE: "TIMER_001" }, { status: 400 });
      const stopped = { ...running, duration: "60000" };
      running = null;
      return Response.json({ data: stopped });
    },
  });
  env = await testEnv(api);
});

afterAll(async () => {
  await env.close();
  api.stop();
});

describe("time commands", () => {
  test("time current --json without a timer returns null with exit 0", async () => {
    running = null;
    const r = await env.cli(["time", "current", "--json"]);
    expect(r.code).toBe(0);
    expect(r.json.data).toEqual({ entry: null });
    expect((await env.cli(["time", "current"])).stdout).toContain("no timer running");
  });

  test("time start sends tid and description to the profile workspace", async () => {
    running = null;
    const r = await env.cli(["time", "start", "--task", "T1", "--description", "Parser", "--json"]);
    expect(r.code).toBe(0);
    expect(r.json.data.entry).toMatchObject({ id: "E2", task: { id: "T1" } });
    expect(r.json.data.previous).toBeUndefined();
    expect(r.stderr).not.toContain("Warning");
    const start = api.requests.find((q) => q.path === "/team/111/time_entries/start");
    expect(start?.body).toEqual({ tid: "T1", description: "Parser" });
    expect((await env.cli(["time", "start"])).code).toBe(2);
  });

  test("time start on another task warns and reports previous", async () => {
    running = { id: "E1", task: { id: "T9", name: "Old task" }, description: "old", start: "1690000000000" };
    const r = await env.cli(["time", "start", "--task", "T1", "--json"]);
    expect(r.code).toBe(0);
    expect(r.json.data.previous).toEqual({ id: "E1", taskId: "T9", taskName: "Old task", description: "old", start: "1690000000000" });
    expect(r.stderr).toContain("T9");
    expect(api.requests.at(-1)?.body).toEqual({ tid: "T1" });
  });

  test("time start on the same task does not warn", async () => {
    running = { id: "E1", task: { id: "T1", name: "Same" } };
    const r = await env.cli(["time", "start", "--task", "T1", "--json"]);
    expect(r.json.data.previous).toBeUndefined();
    expect(r.stderr).not.toContain("Warning");
  });

  test("time stop returns the stopped entry; without a timer exits 5", async () => {
    running = { id: "E3", task: { id: "T1" } };
    const r = await env.cli(["time", "stop", "--json"]);
    expect(r.code).toBe(0);
    expect(r.json.data.entry).toMatchObject({ id: "E3", duration: "60000" });
    expect((await env.cli(["time", "stop", "--json"])).code).toBe(5);
  });
});

describe("time tools", () => {
  test("current, start with previous and stop through MCP", async () => {
    const client = await env.mcp(["mcp", "serve", "--workspace", "111", "--list", "L1"]);
    running = null;
    expect(toolJson(await client.callTool({ name: "clickupfy_time_current", arguments: {} }))).toEqual({ entry: null });
    running = { id: "E1", task: { id: "T9", name: "Old task" } };
    const started = toolJson(await client.callTool({ name: "clickupfy_time_start", arguments: { taskId: "T1", description: "Work" } }));
    expect(started.entry.task.id).toBe("T1");
    expect(started.previous).toMatchObject({ id: "E1", taskId: "T9" });
    const stopped = toolJson(await client.callTool({ name: "clickupfy_time_stop", arguments: {} }));
    expect(stopped.entry.id).toBe("E2");
  });

  test("a read-only server keeps only time_current", async () => {
    const client = await env.mcp(["mcp", "serve", "--list", "L1", "--read-only"]);
    const names = (await client.listTools()).tools.map((t) => t.name);
    expect(names).toContain("clickupfy_time_current");
    expect(names).not.toContain("clickupfy_time_start");
    expect(names).not.toContain("clickupfy_time_stop");
  });
});
