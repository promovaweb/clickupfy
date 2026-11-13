/**
 * Specs 0002 and 0003: pinned MCP server, profile tools, mcp setup and the
 * hierarchy commands and tools, against a fake ClickUp API.
 */
import { afterAll, beforeAll, describe, expect, test } from "bun:test";
import { mkdtempSync, readFileSync, writeFileSync, rmSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { parse as parseToml } from "smol-toml";
import { fakeClickUp, testEnv, toolJson, type FakeApi, type TestEnv } from "./helpers/clickup.ts";

let api: FakeApi;
let env: TestEnv;

beforeAll(async () => {
  api = fakeClickUp({
    "GET /team/111/space": () => Response.json({ spaces: [{ id: "S1", name: "Product" }] }),
    "GET /space/S1/folder": () => Response.json({ folders: [{ id: "F1", name: "Sprints", task_count: "3" }] }),
    "GET /space/S1/list": () => Response.json({ lists: [{ id: "L0", name: "Inbox" }] }),
    "GET /folder/F1/list": () => Response.json({ lists: [{ id: "L1", name: "Backlog", task_count: 3 }] }),
    "GET /list/L1": () => Response.json({ id: "L1", name: "Backlog", statuses: [{ status: "to do" }, { status: "done" }] }),
  });
  env = await testEnv(api);
});

afterAll(async () => {
  await env.close();
  api.stop();
});

describe("hierarchy commands", () => {
  test("space list --json", async () => {
    const r = await env.cli(["space", "list", "--json"]);
    expect(r.code).toBe(0);
    expect(r.json.data.spaces[0]).toEqual({ id: "S1", name: "Product" });
  });

  test("folder list requires --space in the CLI", async () => {
    expect((await env.cli(["folder", "list"])).code).toBe(2);
    const r = await env.cli(["folder", "ls", "--space", "S1", "--json"]);
    expect(r.json.data.folders[0].id).toBe("F1");
  });

  test("list list by folder or space", async () => {
    expect((await env.cli(["list", "list", "--folder", "F1", "--json"])).json.data.lists[0].id).toBe("L1");
    expect((await env.cli(["list", "list", "--space", "S1", "--json"])).json.data.lists[0].id).toBe("L0");
    expect((await env.cli(["list", "list"])).code).toBe(2);
  });

  test("list get prints statuses and an unknown id exits with 6", async () => {
    const r = await env.cli(["list", "get", "L1"]);
    expect(r.stdout).toContain("statuses: to do, done");
    expect((await env.cli(["list", "get", "nope", "--json"])).code).toBe(6);
  });
});

describe("pinned MCP server", () => {
  test("mcp serve accepts the 0.9.0 flags and pins the scope", async () => {
    const client = await env.mcp(["mcp", "serve", "--account", "work", "--workspace", "111", "--space", "S1", "--list", "L1"]);
    const ctx = toolJson(await client.callTool({ name: "clickupfy_mcp_context", arguments: {} }));
    expect(ctx.scope).toMatchObject({ workspaceId: "111", spaceId: "S1", listId: "L1" });
    const list = toolJson(await client.callTool({ name: "clickupfy_list_get", arguments: {} }));
    expect(list.name).toBe("Backlog");
    const folders = toolJson(await client.callTool({ name: "clickupfy_folders_list", arguments: {} }));
    expect(folders.folders[0].id).toBe("F1");
    const refused = await client.callTool({ name: "clickupfy_list_get", arguments: { listId: "L9" } });
    expect(refused.isError).toBe(true);
    const otherProfile = await client.callTool({ name: "clickupfy_whoami", arguments: { account: "other" } });
    expect(otherProfile.isError).toBe(true);
    const names = (await client.listTools()).tools.map((t) => t.name);
    expect(names).not.toContain("clickupfy_account_use");
    expect(names).not.toContain("clickupfy_workspace_use");
  });

  test("a workspace mismatch is refused", async () => {
    const client = await env.mcp(["mcp", "serve", "--workspace", "999", "--list", "L1"]);
    const r = await client.callTool({ name: "clickupfy_whoami", arguments: {} });
    expect(r.isError).toBe(true);
    expect(toolJson(r)).toContain("999");
  });

  test("an unpinned server exposes the profile tools", async () => {
    const client = await env.mcp(["mcp"]);
    const names = (await client.listTools()).tools.map((t) => t.name);
    expect(names).toEqual(expect.arrayContaining(["clickupfy_accounts_list", "clickupfy_account_use", "clickupfy_workspace_use", "clickupfy_whoami", "clickupfy_workspaces_list"]));
    const accounts = toolJson(await client.callTool({ name: "clickupfy_accounts_list", arguments: {} }));
    expect(accounts.accounts[0].id).toBe("work");
    expect(JSON.stringify(accounts)).not.toContain("pk_");
  });

  test("--read-only hides write tools", async () => {
    const r = await env.cli(["mcp", "serve", "--list", "L1", "--read-only", "--describe", "--json"]);
    const names = r.json.data.tools.map((t: { name: string }) => t.name);
    expect(names).toContain("clickupfy_list_get");
    expect(names).not.toContain("clickupfy_account_use");
  });
});

describe("mcp setup", () => {
  test("writes pinned entries to every client and keeps other entries", async () => {
    const project = mkdtempSync(join(tmpdir(), "clickupfy-project-"));
    writeFileSync(join(project, ".mcp.json"), JSON.stringify({ mcpServers: { other: { command: "x" } } }));
    const r = await env.cli([
      "mcp", "setup", "--name", "proj", "--account", "work", "--space", "S1", "--list", "L1",
      "--project", project, "--non-interactive", "--json",
    ]);
    expect(r.code).toBe(0);
    expect(r.json.data.args).toEqual(["mcp", "serve", "--account", "work", "--workspace", "111", "--space", "S1", "--folder", "F1", "--list", "L1"]);
    const claude = JSON.parse(readFileSync(join(project, ".mcp.json"), "utf8"));
    expect(Object.keys(claude.mcpServers).sort()).toEqual(["other", "proj"]);
    expect(claude.mcpServers.proj.command).toBe("clickupfy");
    const codex = parseToml(readFileSync(join(project, ".codex/config.toml"), "utf8")) as any;
    expect(codex.mcp_servers.proj.args).toContain("L1");
    expect(JSON.parse(readFileSync(join(project, "opencode.json"), "utf8")).mcp.proj.type).toBe("local");
    expect(readFileSync(join(project, ".gemini/settings.json"), "utf8")).toContain("proj");
    expect(readFileSync(join(project, ".mcp.json"), "utf8")).not.toContain("pk_");
    const again = await env.cli(["mcp", "setup", "--name", "proj", "--account", "work", "--space", "S1", "--list", "L1", "--project", project, "--non-interactive"]);
    expect(again.code).toBe(2);
    rmSync(project, { recursive: true, force: true });
  });

  test("off a TTY, missing flags exit with 2", async () => {
    expect((await env.cli(["mcp", "setup", "--json"])).code).toBe(2);
  });
});
