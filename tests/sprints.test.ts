/**
 * Spec 0006: sprint commands and tools against a fake ClickUp API.
 */
import { afterAll, beforeAll, describe, expect, test } from "bun:test";
import { fakeClickUp, testEnv, toolJson, type FakeApi, type TestEnv } from "./helpers/clickup.ts";

const day = (iso: string) => String(Date.parse(`${iso}T00:00:00.000Z`));
const S1 = { id: "S1", name: "Sprint 1", start_date: day("2026-11-01"), due_date: day("2026-11-09"), task_count: 1 };
const S2 = { id: "S2", name: "Sprint 2", start_date: day("2026-11-10"), due_date: day("2026-11-20"), task_count: 2 };
const S3 = { id: "S3", name: "Sprint 3", start_date: day("2026-11-15"), due_date: day("2026-11-25"), task_count: 0 };
const REG = { id: "R1", name: "Backlog", start_date: null, due_date: null };
const TASKS = [
  { id: "T1", name: "Done", status: { status: "complete", type: "closed" }, points: 3 },
  { id: "T2", name: "Open", status: { status: "to do", type: "open" }, points: 2 },
  { id: "T3", name: "No estimate", status: { status: "to do", type: "open" } },
];

let api: FakeApi;
let env: TestEnv;

beforeAll(async () => {
  api = fakeClickUp({
    "GET /folder/F1/list": () => Response.json({ lists: [S1, S2, S3, REG] }),
    "GET /folder/F2/list": () => Response.json({ lists: [S1] }),
    "GET /list/S2": () => Response.json(S2),
    "GET /list/R1": () => Response.json(REG),
    "GET /list/S2/task": () => Response.json({ tasks: TASKS }),
    "POST /list/S2/task/T9": () => Response.json({}),
    "DELETE /list/S2/task/T9": () => Response.json({}),
    "PUT /task/T9": (req) => Response.json({ id: "T9", name: "Task", points: (req.body as { points: number }).points }),
  });
  env = await testEnv(api);
});

afterAll(async () => {
  await env.close();
  api.stop();
});

describe("sprint commands", () => {
  test("sprint list filters regular lists and computes the status at --at", async () => {
    const r = await env.cli(["sprint", "list", "--folder", "F1", "--at", "2026-11-12", "--json"]);
    expect(r.code).toBe(0);
    expect(r.json.data.sprints.map((s: { id: string; status: string }) => [s.id, s.status])).toEqual([
      ["S1", "completed"],
      ["S2", "active"],
      ["S3", "planned"],
    ]);
    const all = await env.cli(["sprint", "ls", "--folder", "F1", "--include-regular", "--archived", "--json"]);
    expect(all.json.data.sprints.at(-1)).toMatchObject({ id: "R1", status: "regular", isSprint: false });
    expect(api.requests.at(-1)?.query.get("archived")).toBe("true");
  });

  test("sprint list requires --folder and a valid date", async () => {
    expect((await env.cli(["sprint", "list"])).code).toBe(2);
    expect((await env.cli(["sprint", "list", "--folder", "F1", "--at", "2026-13-40"])).code).toBe(2);
  });

  test("sprint current returns the only active Sprint", async () => {
    const r = await env.cli(["sprint", "current", "--folder", "F1", "--at", "2026-11-12", "--json"]);
    expect(r.code).toBe(0);
    expect(r.json.data).toMatchObject({ id: "S2", status: "active" });
  });

  test("sprint current with more than one active Sprint exits 2 and lists the candidates", async () => {
    const r = await env.cli(["sprint", "current", "--folder", "F1", "--at", "2026-11-16", "--json"]);
    expect(r.code).toBe(2);
    expect(r.json.error.message).toContain("Sprint 2 (S2)");
    expect(r.json.error.message).toContain("Sprint 3 (S3)");
    expect(r.json.error.details.candidates.map((c: { id: string }) => c.id)).toEqual(["S2", "S3"]);
  });

  test("sprint current without an active Sprint exits 6", async () => {
    expect((await env.cli(["sprint", "current", "--folder", "F2", "--at", "2026-11-16"])).code).toBe(6);
  });

  test("sprint get reports progress and Sprint Points", async () => {
    const r = await env.cli(["sprint", "get", "S2", "--at", "2026-11-12", "--json"]);
    expect(r.code).toBe(0);
    expect(r.json.data).toMatchObject({
      id: "S2",
      status: "active",
      totalTasks: 3,
      completedTasks: 1,
      openTasks: 2,
      totalPoints: 5,
      completedPoints: 3,
      unestimatedTasks: 1,
      taskCompletionPercent: 33.33,
      pointsCompletionPercent: 60,
      tasksByStatus: { complete: 1, "to do": 2 },
    });
    const taskReq = api.requests.findLast((q) => q.path === "/list/S2/task");
    expect(taskReq?.query.get("include_closed")).toBe("true");
  });

  test("a list without a period is not a Sprint", async () => {
    expect((await env.cli(["sprint", "get", "R1"])).code).toBe(2);
  });

  test("sprint tasks returns full tasks and --open-only drops closed ones", async () => {
    const r = await env.cli(["sprint", "tasks", "S2", "--json"]);
    expect(r.json.data.tasks).toHaveLength(3);
    expect(r.json.data.tasks[0].status).toEqual({ status: "complete", type: "closed" });
    const open = await env.cli(["sprint", "tasks", "S2", "--open-only", "--json"]);
    expect(open.json.data.tasks.map((t: { id: string }) => t.id)).toEqual(["T2", "T3"]);
  });

  test("add-task, remove-task and set-points call the API", async () => {
    const add = await env.cli(["sprint", "add-task", "S2", "T9", "--json"]);
    expect(add.json.data).toEqual({ sprintId: "S2", taskId: "T9", added: true });
    expect(api.requests.some((q) => q.method === "POST" && q.path === "/list/S2/task/T9")).toBe(true);
    const rem = await env.cli(["sprint", "remove-task", "S2", "T9", "--json"]);
    expect(rem.json.data).toEqual({ sprintId: "S2", taskId: "T9", removed: true });
    const pts = await env.cli(["sprint", "set-points", "T9", "5", "--json"]);
    expect(pts.json.data.points).toBe(5);
    expect(api.requests.at(-1)?.body).toEqual({ points: 5 });
    expect((await env.cli(["sprint", "set-points", "T9", "abc"])).code).toBe(2);
    expect((await env.cli(["sprint", "set-points", "T9", "--", "-1"])).code).toBe(2);
  });
});

describe("sprint tools", () => {
  test("folderId defaults to the pinned Sprint folder and a different one is refused", async () => {
    const client = await env.mcp(["mcp", "serve", "--list", "L1", "--sprint-folder", "F1"]);
    const list = toolJson(await client.callTool({ name: "clickupfy_sprints_list", arguments: { at: "2026-11-12" } }));
    expect(list.sprints).toHaveLength(3);
    const current = toolJson(await client.callTool({ name: "clickupfy_sprint_current", arguments: { at: "2026-11-12" } }));
    expect(current.id).toBe("S2");
    const refused = await client.callTool({ name: "clickupfy_sprints_list", arguments: { folderId: "F9" } });
    expect(refused.isError).toBe(true);
    const several = await client.callTool({ name: "clickupfy_sprint_current", arguments: { at: "2026-11-16" } });
    expect(several.isError).toBe(true);
    expect(toolJson(several)).toContain("exit code 2");
  });

  test("without a pinned Sprint folder, folderId is required", async () => {
    const client = await env.mcp(["mcp", "serve", "--list", "L1"]);
    const r = await client.callTool({ name: "clickupfy_sprints_list", arguments: {} });
    expect(r.isError).toBe(true);
  });

  test("sprint_tasks returns compact rows and write tools work", async () => {
    const client = await env.mcp(["mcp", "serve", "--list", "L1"]);
    const tasks = toolJson(await client.callTool({ name: "clickupfy_sprint_tasks", arguments: { sprintId: "S2", openOnly: true } }));
    expect(tasks.tasks[0]).toMatchObject({ id: "T2", status: "to do", points: 2 });
    const report = toolJson(await client.callTool({ name: "clickupfy_sprint_get", arguments: { sprintId: "S2" } }));
    expect(report.totalPoints).toBe(5);
    const add = toolJson(await client.callTool({ name: "clickupfy_sprint_add_task", arguments: { sprintId: "S2", taskId: "T9" } }));
    expect(add.added).toBe(true);
    const pts = toolJson(await client.callTool({ name: "clickupfy_sprint_set_points", arguments: { taskId: "T9", points: 8 } }));
    expect(pts.points).toBe(8);
  });

  test("a read-only server hides the write tools", async () => {
    const client = await env.mcp(["mcp", "serve", "--list", "L1", "--read-only"]);
    const names = (await client.listTools()).tools.map((t) => t.name);
    expect(names).toContain("clickupfy_sprint_current");
    expect(names).not.toContain("clickupfy_sprint_add_task");
    expect(names).not.toContain("clickupfy_sprint_set_points");
  });
});
