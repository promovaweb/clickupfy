/**
 * Spec 0005: checklist and comment commands and tools against a fake
 * ClickUp API, including the confirmation read of `checklist set`.
 */
import { afterAll, beforeAll, describe, expect, test } from "bun:test";
import { fakeClickUp, testEnv, toolJson, type FakeApi, type TestEnv } from "./helpers/clickup.ts";

let api: FakeApi;
let env: TestEnv;
/** Persisted state of item I1 in the fake API. */
let resolvedI1 = false;
/** When true, the update is accepted but not persisted. */
let ignoreUpdates = false;

function task() {
  return {
    id: "T1",
    name: "Root",
    checklists: [],
    subtasks: [
      {
        id: "T2",
        name: "Child",
        parent: "T1",
        checklists: [
          {
            id: "C1",
            name: "Plan",
            items: [
              { id: "I1", name: "Write code", orderindex: 0, resolved: resolvedI1, parent: null },
              { id: "I2", name: "Nested", orderindex: 1, resolved: false, parent: "I1" },
            ],
          },
        ],
      },
    ],
  };
}

function comments(from: number, count: number) {
  return Array.from({ length: count }, (_, i) => ({
    id: String(from + i),
    comment_text: `c${from + i}`,
    user: { id: 7, username: "Dev Person" },
    date: String(1000 + from + i),
  }));
}

beforeAll(async () => {
  api = fakeClickUp({
    "POST /task/T1/checklist": (r) => Response.json({ checklist: { id: "C9", name: (r.body as { name: string }).name, items: [] } }),
    "POST /checklist/C1/checklist_item": (r) =>
      Response.json({ checklist: { id: "C1", name: "Plan", items: [{ id: "I9", name: (r.body as { name: string }).name, resolved: false }] } }),
    "GET /task/T1": () => Response.json(task()),
    "PUT /checklist/C1/checklist_item/I1": (r) => {
      if (!ignoreUpdates) resolvedI1 = (r.body as { resolved: boolean }).resolved;
      return Response.json({});
    },
    "GET /task/T1/comment": (r) => {
      // Two pages: 25 comments, then 3 after the cursor.
      if (!r.query.get("start_id")) return Response.json({ comments: comments(0, 25) });
      return Response.json({ comments: comments(25, 3) });
    },
    "POST /task/T1/comment": () => Response.json({ id: 555, hist_id: "h1", date: 1700000000000 }),
  });
  env = await testEnv(api);
});

afterAll(async () => {
  await env.close();
  api.stop();
});

describe("checklist commands", () => {
  test("checklist create takes the task id as argument", async () => {
    const r = await env.cli(["--json", "checklist", "create", "T1", "--name", "Steps"]);
    expect(r.code).toBe(0);
    expect(r.json.data.checklist).toMatchObject({ id: "C9", name: "Steps" });
    expect(api.requests.at(-1)?.body).toEqual({ name: "Steps" });
    expect((await env.cli(["checklist", "create", "T1"])).code).toBe(2);
  });

  test("checklist item-create sends name and assignee", async () => {
    const r = await env.cli(["--json", "checklist", "item-create", "C1", "--name", "Review", "--assignee", "183"]);
    expect(r.code).toBe(0);
    expect(r.json.data.checklist.items[0].id).toBe("I9");
    expect(api.requests.at(-1)?.body).toEqual({ name: "Review", assignee: 183 });
    expect((await env.cli(["checklist", "item-create", "C1", "--name", "x", "--assignee", "abc"])).code).toBe(2);
  });

  test("checklist set resolves an item of a subtask and confirms it", async () => {
    resolvedI1 = false;
    const before = api.requests.length;
    const r = await env.cli(["checklist", "set", "T1", "C1", "I1", "--resolved", "--json"]);
    expect(r.code).toBe(0);
    expect(r.json.data).toMatchObject({
      key: "checklist:C1:I1",
      type: "checklist_item",
      taskId: "T2",
      parentKey: "task:T2",
      depth: 2,
      done: true,
      state: "done",
      checklistName: "Plan",
    });
    expect(r.json.data.action.reopen.mcp).toEqual({
      tool: "clickupfy_checklist_item_set",
      arguments: { taskId: "T2", checklistId: "C1", itemId: "I1", resolved: false },
    });
    const sent = api.requests.slice(before).map((q) => `${q.method} ${q.path}`);
    expect(sent).toEqual(["GET /task/T1", "PUT /checklist/C1/checklist_item/I1", "GET /task/T1"]);
    expect(api.requests.slice(before)[0]?.query.get("include_subtasks")).toBe("true");
  });

  test("checklist set requires exactly one of --resolved or --open", async () => {
    expect((await env.cli(["checklist", "set", "T1", "C1", "I1"])).code).toBe(2);
    expect((await env.cli(["checklist", "set", "T1", "C1", "I1", "--resolved", "--open"])).code).toBe(2);
  });

  test("checklist set exits 6 for an item outside the task and 5 when not confirmed", async () => {
    expect((await env.cli(["checklist", "set", "T1", "C1", "NOPE", "--open", "--json"])).code).toBe(6);
    resolvedI1 = false;
    ignoreUpdates = true;
    const r = await env.cli(["checklist", "set", "T1", "C1", "I1", "--resolved", "--json"]);
    ignoreUpdates = false;
    expect(r.code).toBe(5);
  });
});

describe("comment commands", () => {
  test("comment list follows the cursor and summarizes", async () => {
    const r = await env.cli(["comment", "ls", "--task", "T1", "--json"]);
    expect(r.code).toBe(0);
    expect(r.json.data.comments).toHaveLength(28);
    expect(r.json.data.comments[0]).toEqual({ id: "0", user: "Dev Person", date: "1000", text: "c0" });
    const second = api.requests.filter((q) => q.path === "/task/T1/comment" && q.method === "GET").at(-1);
    expect(second?.query.get("start_id")).toBe("24");
    expect(second?.query.get("start")).toBe("1024");
    expect((await env.cli(["comment", "list"])).code).toBe(2);
  });

  test("comment create --json sends text and notify_all", async () => {
    const r = await env.cli(["comment", "create", "--task", "T1", "--text", "Progress", "--notify-all", "--json"]);
    expect(r.code).toBe(0);
    expect(r.json.data).toEqual({ id: 555, hist_id: "h1", date: 1700000000000 });
    expect(api.requests.at(-1)?.body).toEqual({ comment_text: "Progress", notify_all: true });
    await env.cli(["comment", "create", "--task", "T1", "--text", "Quiet", "--json"]);
    expect(api.requests.at(-1)?.body).toEqual({ comment_text: "Quiet", notify_all: false });
    expect((await env.cli(["comment", "create", "--task", "T1"])).code).toBe(2);
  });
});

describe("checklist and comment tools", () => {
  test("tools create, set and list through MCP", async () => {
    const client = await env.mcp(["mcp", "serve", "--list", "L1"]);
    const created = toolJson(await client.callTool({ name: "clickupfy_checklist_create", arguments: { taskId: "T1", name: "Plan" } }));
    expect(created.checklist.id).toBe("C9");
    const item = toolJson(await client.callTool({ name: "clickupfy_checklist_item_create", arguments: { checklistId: "C1", name: "Step", assignee: 5 } }));
    expect(item.checklist.items[0].id).toBe("I9");
    resolvedI1 = true;
    const reopened = toolJson(
      await client.callTool({ name: "clickupfy_checklist_item_set", arguments: { taskId: "T1", checklistId: "C1", itemId: "I1", resolved: false } }),
    );
    expect(reopened).toMatchObject({ done: false, state: "pending" });
    const missing = await client.callTool({ name: "clickupfy_checklist_item_set", arguments: { taskId: "T1", checklistId: "C1", itemId: "I1" } });
    expect(missing.isError).toBe(true);
    const comment = toolJson(await client.callTool({ name: "clickupfy_comment_create", arguments: { taskId: "T1", text: "Hi", notifyAll: true } }));
    expect(comment.id).toBe(555);
    const list = toolJson(await client.callTool({ name: "clickupfy_comments_list", arguments: { taskId: "T1" } }));
    expect(list.comments).toHaveLength(28);
  });

  test("a read-only server keeps only comments_list", async () => {
    const client = await env.mcp(["mcp", "serve", "--list", "L1", "--read-only"]);
    const names = (await client.listTools()).tools.map((t) => t.name);
    expect(names).toContain("clickupfy_comments_list");
    expect(names).not.toContain("clickupfy_comment_create");
    expect(names).not.toContain("clickupfy_checklist_item_set");
  });
});
