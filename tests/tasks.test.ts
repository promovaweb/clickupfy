/**
 * Spec 0004: task and tag commands and tools against a fake ClickUp API.
 */
import { afterAll, beforeAll, describe, expect, test } from "bun:test";
import { fakeClickUp, testEnv, toolJson, type FakeApi, type TestEnv } from "./helpers/clickup.ts";

let api: FakeApi;
let env: TestEnv;

const TASK = {
  id: "T1",
  name: "Root task",
  url: "https://app.clickup.com/t/T1",
  status: { status: "to do", type: "open" },
  priority: { priority: "high" },
  assignees: [{ id: 7, username: "Dev Person" }],
  markdown_description: "Root **body**",
  checklists: [
    {
      id: "C1",
      name: "Steps",
      orderindex: 0,
      items: [
        { id: "I2", name: "Second", orderindex: 1, resolved: true },
        { id: "I1", name: "First", orderindex: 0, resolved: false },
        { id: "I3", name: "Nested", orderindex: 0, parent: "I1", resolved: false },
      ],
    },
  ],
  subtasks: [{ id: "T2", name: "Child", parent: "T1", status: { status: "done", type: "closed" }, description: "child text" }],
};

const TAGS = [{ name: "backend", tag_fg: "#ffffff", tag_bg: "#336699" }];

const last = (method: string, path: string) => [...api.requests].reverse().find((r) => r.method === method && r.path === path);

beforeAll(async () => {
  const page = (n: number) => Array.from({ length: n }, (_, i) => ({ id: `P${i}`, name: i === 3 ? "Login bug" : `Task ${i}`, status: { status: "open" } }));
  api = fakeClickUp({
    "GET /list/L1/task": (req) => Response.json({ tasks: req.query.get("page") === "1" ? page(5) : page(100) }),
    "GET /team/111/task": () => Response.json({ tasks: [{ id: "W1", name: "Workspace login", status: { status: "open" } }, { id: "W2", name: "Other" }] }),
    "GET /task/T1": () => Response.json(TASK),
    "POST /list/L1/task": (req) => Response.json({ id: "NEW", url: "https://app.clickup.com/t/NEW", ...(req.body as object) }),
    "PUT /task/T1": (req) => Response.json({ ...TASK, ...(req.body as object) }),
    "DELETE /task/T1": () => Response.json({}),
    "POST /task/T1/tag/backend": () => Response.json({}),
    "DELETE /task/T1/tag/backend": () => Response.json({}),
    "GET /space/S1/tag": () => Response.json({ tags: TAGS }),
    "POST /space/S1/tag": () => Response.json({}),
    "PUT /space/S1/tag/backend": () => Response.json({}),
    "DELETE /space/S1/tag/backend": () => Response.json({}),
  });
  env = await testEnv(api);
});

afterAll(async () => {
  await env.close();
  api.stop();
});

describe("task commands", () => {
  test("task list sends the filters and returns full tasks", async () => {
    const r = await env.cli(["task", "ls", "--list", "L1", "--status", "open,review", "--assignee", "7", "--include-closed", "--page", "0", "--json"]);
    expect(r.code).toBe(0);
    expect(r.json.data.tasks).toHaveLength(100);
    expect(r.json.data.tasks[0].status).toEqual({ status: "open" });
    const q = last("GET", "/list/L1/task")!.query;
    expect(q.getAll("statuses[]")).toEqual(["open", "review"]);
    expect(q.getAll("assignees[]")).toEqual(["7"]);
    expect(q.get("include_closed")).toBe("true");
    expect((await env.cli(["task", "list"])).code).toBe(2);
    expect((await env.cli(["task", "list", "--list", "L1", "--page", "-1"])).code).toBe(2);
  });

  test("task get returns the reading with the ordered queue", async () => {
    const r = await env.cli(["task", "get", "T1", "--json"]);
    expect(r.code).toBe(0);
    expect(r.json.data.task.id).toBe("T1");
    const keys = r.json.data.execution.items.map((i: { key: string }) => i.key);
    expect(keys).toEqual(["task:T1", "checklist:C1:I1", "checklist:C1:I3", "checklist:C1:I2", "task:T2"]);
    expect(r.json.data.execution.summary).toEqual({ total: 5, done: 2, pending: 3, tasks: 1, subtasks: 1, checklistItems: 3 });
    expect(r.json.data.execution.items[1].action.complete.mcp).toEqual({
      tool: "clickupfy_checklist_item_set",
      arguments: { taskId: "T1", checklistId: "C1", itemId: "I1", resolved: true },
    });
    const q = last("GET", "/task/T1")!.query;
    expect(q.get("include_subtasks")).toBe("true");
    expect(q.get("include_markdown_description")).toBe("true");
  });

  test("task get --raw, --markdown and text", async () => {
    expect((await env.cli(["task", "get", "T1", "--raw", "--json"])).json.data.checklists[0].id).toBe("C1");
    const md = await env.cli(["task", "get", "T1", "--markdown"]);
    expect(md.stdout).toContain("# Root task");
    expect(md.stdout).toContain("## Description\n\nRoot **body**");
    expect(md.stdout).toContain("- [x] **Subtask:** Child `task:T2`");
    expect(md.stdout).toContain("    > child text");
    const text = await env.cli(["task", "get", "T1"]);
    expect(text.stdout).toContain("checklist:C1:I3");
    expect((await env.cli(["task", "get", "T1", "--raw", "--markdown"])).code).toBe(2);
    expect((await env.cli(["task", "get", "missing", "--json"])).code).toBe(6);
  });

  test("task search covers the workspace and filters the text locally", async () => {
    const r = await env.cli(["task", "search", "--query", "LOGIN", "--json"]);
    expect(r.json.data.tasks.map((t: { id: string }) => t.id)).toEqual(["W1"]);
    expect(last("GET", "/team/111/task")!.query.get("subtasks")).toBe("true");
    expect((await env.cli(["task", "search", "--max-pages", "0"])).code).toBe(2);
  });

  test("task create sends the body and returns the task with id and url", async () => {
    const r = await env.cli([
      "--json",
      "task",
      "create",
      "--list",
      "L1",
      "--name",
      "New",
      "--markdown-content",
      "# Title\n\n- item",
      "--status",
      "to do",
      "--priority",
      "2",
      "--assignee",
      "7,8",
      "--parent",
      "T1",
      "--points",
      "3",
    ]);
    expect(r.code).toBe(0);
    expect(r.json.data.id).toBe("NEW");
    expect(r.json.data.url).toBe("https://app.clickup.com/t/NEW");
    expect(last("POST", "/list/L1/task")!.body).toEqual({
      name: "New",
      markdown_content: "# Title\n\n- item",
      status: "to do",
      priority: 2,
      assignees: [7, 8],
      parent: "T1",
      points: 3,
    });
    expect((await env.cli(["task", "create", "--list", "L1"])).code).toBe(2);
    expect((await env.cli(["task", "create", "--list", "L1", "--name", "x", "--priority", "5"])).code).toBe(2);
    expect((await env.cli(["task", "create", "--list", "L1", "--name", "x", "--points", "-1"])).code).toBe(2);
    expect((await env.cli(["task", "create", "--list", "L1", "--name", "x", "--start-date", "2026-02-30"])).code).toBe(2);
  });

  test("--start-date and --due-date use the start of the day in the local time zone", async () => {
    env.env.TZ = "America/Sao_Paulo";
    try {
      const r = await env.cli(["task", "create", "--list", "L1", "--name", "Dated", "--start-date", "2026-11-13", "--due-date", "2026-11-20", "--json"]);
      expect(r.code).toBe(0);
      const body = last("POST", "/list/L1/task")!.body as Record<string, unknown>;
      expect(body.start_date).toBe(Date.UTC(2026, 10, 13, 3));
      expect(body.start_date_time).toBe(false);
      expect(body.due_date).toBe(Date.UTC(2026, 10, 20, 3));
      expect(body.due_date_time).toBe(false);
    } finally {
      delete env.env.TZ;
    }
  });

  test("task update sends only the changed fields and clears dates", async () => {
    const r = await env.cli(["task", "update", "T1", "--status", "done", "--clear-start-date", "--json"]);
    expect(r.code).toBe(0);
    expect(last("PUT", "/task/T1")!.body).toEqual({ status: "done", start_date: null });
    expect((await env.cli(["task", "update", "T1"])).code).toBe(2);
    expect((await env.cli(["task", "update", "T1", "--due-date", "2026-11-20", "--clear-due-date"])).code).toBe(2);
  });

  test("task delete requires --yes off a TTY", async () => {
    const before = api.requests.length;
    expect((await env.cli(["task", "delete", "T1"])).code).toBe(2);
    expect(api.requests.slice(before).some((r) => r.method === "DELETE")).toBe(false);
    const r = await env.cli(["task", "delete", "T1", "--yes", "--json"]);
    expect(r.json.data).toEqual({ deleted: true, taskId: "T1" });
  });

  test("task add-tag and remove-tag", async () => {
    const added = await env.cli(["task", "add-tag", "T1", "backend", "--custom-task-id", "--json"]);
    expect(added.json.data).toEqual({ added: true, taskId: "T1", tagName: "backend" });
    const q = last("POST", "/task/T1/tag/backend")!.query;
    expect(q.get("custom_task_ids")).toBe("true");
    expect(q.get("team_id")).toBe("111");
    const removed = await env.cli(["task", "remove-tag", "T1", "backend", "--json"]);
    expect(removed.json.data).toEqual({ removed: true, taskId: "T1", tagName: "backend" });
    expect(last("DELETE", "/task/T1/tag/backend")!.query.has("custom_task_ids")).toBe(false);
    expect((await env.cli(["task", "add-tag", "T1", ".."])).code).toBe(2);
  });
});

describe("tag commands", () => {
  test("tag list and create", async () => {
    expect((await env.cli(["tag", "list", "--space", "S1", "--json"])).json.data.tags).toEqual(TAGS);
    expect((await env.cli(["tag", "list"])).code).toBe(2);
    const r = await env.cli(["tag", "create", "api", "--space", "S1", "--foreground", "#000000", "--background", "#ABCDEF", "--json"]);
    expect(r.json.data).toEqual({ created: true, spaceId: "S1", name: "api" });
    expect(last("POST", "/space/S1/tag")!.body).toEqual({ tag: { name: "api", tag_fg: "#000000", tag_bg: "#ABCDEF" } });
    expect((await env.cli(["tag", "create", "api", "--space", "S1", "--foreground", "red", "--background", "#ABCDEF"])).code).toBe(2);
  });

  test("tag update preserves the omitted colors", async () => {
    const r = await env.cli(["tag", "update", "backend", "--space", "S1", "--name", "api", "--json"]);
    expect(r.json.data).toEqual({ updated: true, spaceId: "S1", name: "api" });
    expect(last("PUT", "/space/S1/tag/backend")!.body).toEqual({ tag: { name: "api", fg_color: "#ffffff", bg_color: "#336699" } });
    expect((await env.cli(["tag", "update", "backend", "--space", "S1"])).code).toBe(2);
    expect((await env.cli(["tag", "update", "ghost", "--space", "S1", "--name", "x"])).code).toBe(6);
  });

  test("tag delete confirms and sends the current definition", async () => {
    expect((await env.cli(["tag", "delete", "backend", "--space", "S1"])).code).toBe(2);
    const r = await env.cli(["tag", "delete", "backend", "--space", "S1", "--yes", "--json"]);
    expect(r.json.data).toEqual({ deleted: true, spaceId: "S1", name: "backend" });
    expect(last("DELETE", "/space/S1/tag/backend")!.body).toEqual({ tag: { name: "backend", tag_fg: "#ffffff", tag_bg: "#336699" } });
  });
});

describe("task and tag tools", () => {
  test("pinned list and space are the defaults", async () => {
    const client = await env.mcp(["mcp", "serve", "--space", "S1", "--list", "L1"]);
    const list = toolJson(await client.callTool({ name: "clickupfy_tasks_list", arguments: {} }));
    expect(list.tasks[0]).toMatchObject({ id: "P0", status: "open" });
    expect(Object.keys(list.tasks[0])).toContain("url");
    const refused = await client.callTool({ name: "clickupfy_tasks_list", arguments: { listId: "L9" } });
    expect(refused.isError).toBe(true);

    const search = toolJson(await client.callTool({ name: "clickupfy_tasks_search", arguments: { query: "login" } }));
    expect(search.tasks.map((t: { id: string }) => t.id)).toEqual(["P3", "P3"]);
    expect(last("GET", "/list/L1/task")!.query.get("page")).toBe("1");

    const created = toolJson(
      await client.callTool({ name: "clickupfy_task_create", arguments: { name: "Agent", assignees: ["7"], startDate: 1763002800000, priority: 3 } }),
    );
    expect(created.id).toBe("NEW");
    expect(last("POST", "/list/L1/task")!.body).toEqual({ name: "Agent", assignees: [7], start_date: 1763002800000, priority: 3 });

    expect(toolJson(await client.callTool({ name: "clickupfy_tags_list", arguments: {} })).tags).toEqual(TAGS);
    const tagRefused = await client.callTool({ name: "clickupfy_tags_list", arguments: { spaceId: "S9" } });
    expect(tagRefused.isError).toBe(true);
  });

  test("task get markdown, update and destructive tools", async () => {
    const client = await env.mcp(["mcp", "serve"]);
    const md = await client.callTool({ name: "clickupfy_task_get", arguments: { taskId: "T1", markdown: true } });
    expect((md.content as Array<{ text: string }>)[0]!.text).toContain("## Work items");
    const updated = await client.callTool({ name: "clickupfy_task_update", arguments: { taskId: "T1", dueDate: 1763607600000, clearStartDate: true } });
    expect(updated.isError).toBeFalsy();
    expect(last("PUT", "/task/T1")!.body).toEqual({ start_date: null, due_date: 1763607600000 });
    const noConfirm = await client.callTool({ name: "clickupfy_task_delete", arguments: { taskId: "T1" } });
    expect(noConfirm.isError).toBe(true);
    expect(toolJson(await client.callTool({ name: "clickupfy_task_delete", arguments: { taskId: "T1", confirm: true } }))).toEqual({ deleted: true, taskId: "T1" });
    const noSpace = await client.callTool({ name: "clickupfy_tag_delete", arguments: { tagName: "backend", confirm: true } });
    expect(noSpace.isError).toBe(true);
    const search = toolJson(await client.callTool({ name: "clickupfy_tasks_search", arguments: { query: "login" } }));
    expect(search.tasks[0].id).toBe("W1");
  });

  test("a read-only server hides the write tools", async () => {
    const client = await env.mcp(["mcp", "serve", "--read-only"]);
    const names = (await client.listTools()).tools.map((t) => t.name);
    expect(names).toContain("clickupfy_task_get");
    expect(names).toContain("clickupfy_tags_list");
    expect(names).not.toContain("clickupfy_task_create");
    expect(names).not.toContain("clickupfy_tag_delete");
  });
});
