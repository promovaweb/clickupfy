/**
 * Spec 0010: `agent skill list|show|install`, `agent install` (alias
 * `init`) and the ClickUp checks of `doctor`. A fake `npx` placed first in
 * PATH stands in for the skills manager and logs every call.
 */
import { afterAll, beforeAll, describe, expect, test } from "bun:test";
import { chmodSync, existsSync, mkdirSync, mkdtempSync, readFileSync, rmSync, writeFileSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { parse as parseToml } from "smol-toml";
import { fakeClickUp, testEnv, type FakeApi, type TestEnv } from "./helpers/clickup.ts";
import { SKILL_NAMES } from "../src/agent/skills.ts";
import { HOME_VARIABLE } from "../src/config/paths.ts";

const repo = join(import.meta.dir, "..");
let api: FakeApi;
let env: TestEnv;
let tools: string;
let log: string;

/** Runs the CLI in another working directory, with the test environment. */
async function cliIn(cwd: string, args: string[], extra: Record<string, string> = {}) {
  const proc = Bun.spawn(["bun", "run", join(repo, "src", "main.ts"), ...args], {
    cwd,
    env: { ...env.env, ...extra },
    stdin: "ignore",
    stdout: "pipe",
    stderr: "pipe",
  });
  const [stdout, stderr] = await Promise.all([new Response(proc.stdout).text(), new Response(proc.stderr).text()]);
  const code = await proc.exited;
  let json: any;
  try {
    json = JSON.parse(stdout);
  } catch {
    json = undefined;
  }
  return { code, stdout, stderr, json };
}

function calls(): string[] {
  return existsSync(log) ? readFileSync(log, "utf8").trim().split("\n").filter(Boolean) : [];
}

beforeAll(async () => {
  api = fakeClickUp();
  env = await testEnv(api);
  tools = mkdtempSync(join(tmpdir(), "clickupfy-npx-"));
  log = join(tools, "calls.log");
  const skillsDir = join(tools, "skills");
  for (const name of SKILL_NAMES) {
    mkdirSync(join(skillsDir, name, "agents"), { recursive: true });
    writeFileSync(join(skillsDir, name, "SKILL.md"), readFileSync(join(repo, ".codex", "skills", name, "SKILL.md")));
    writeFileSync(join(skillsDir, name, "agents", "openai.yaml"), readFileSync(join(repo, ".codex", "skills", name, "agents", "openai.yaml")));
  }
  const listing = JSON.stringify(SKILL_NAMES.map((name) => ({ name, path: join(skillsDir, name), scope: "project", agents: ["codex"] })));
  writeFileSync(join(tools, "listing.json"), listing);
  const script = [
    "#!/bin/sh",
    `echo "$*" >> "${log}"`,
    'if [ -n "$FAKE_NPX_FAIL" ]; then echo "registry unreachable" >&2; exit 1; fi',
    'case "$*" in',
    `  *" list --json"*) cat "${join(tools, "listing.json")}" ;;`,
    "esac",
    "exit 0",
  ].join("\n");
  writeFileSync(join(tools, "npx"), `${script}\n`);
  chmodSync(join(tools, "npx"), 0o755);
  env.env.PATH = `${tools}:${env.env.PATH ?? ""}`;
});

afterAll(async () => {
  await env.close();
  api.stop();
  rmSync(tools, { recursive: true, force: true });
});

describe("agent skill", () => {
  test("list --json returns the embedded skills", async () => {
    const r = await env.cli(["agent", "skill", "list", "--json"]);
    expect(r.code).toBe(0);
    expect(r.json.data.skills.map((s: { name: string }) => s.name)).toEqual(SKILL_NAMES);
    expect(r.json.data.skills[0].description.length).toBeGreaterThan(10);
  });

  test("show prints SKILL.md and rejects an unknown skill", async () => {
    const r = await env.cli(["agent", "skill", "show", "clickupfy-dev"]);
    expect(r.code).toBe(0);
    expect(r.stdout).toContain("name: clickupfy-dev");
    const json = await env.cli(["agent", "skill", "show", "clickupfy-dev", "--json"]);
    expect(json.json.data.content).toBe(readFileSync(join(repo, ".codex", "skills", "clickupfy-dev", "SKILL.md"), "utf8"));
    expect((await env.cli(["agent", "skill", "show", "nope"])).code).toBe(2);
  });

  test("install calls npx skills add and confirms with skills list", async () => {
    writeFileSync(log, "");
    const r = await env.cli(["agent", "skill", "install", "clickupfy-dev", "--global", "--json"]);
    expect(r.code).toBe(0);
    expect(r.json.data.skills.map((s: { name: string }) => s.name)).toEqual(["clickupfy-dev"]);
    const [add, list] = calls();
    expect(add).toBe("--yes skills add promovaweb/clickupfy --yes --copy --agent codex --skill clickupfy-dev --global");
    expect(list).toBe("--yes skills list --json --global");
    expect((await env.cli(["agent", "skill", "install", "nope"])).code).toBe(6);
  });

  test("a failing manager exits with 1", async () => {
    const tmp = mkdtempSync(join(tmpdir(), "clickupfy-agent-"));
    const r = await cliIn(tmp, ["agent", "skill", "install", "--json"], { FAKE_NPX_FAIL: "1" });
    expect(r.code).toBe(1);
    expect(r.json.error.message).toContain("registry unreachable");
    rmSync(tmp, { recursive: true, force: true });
  });
});

describe("agent install", () => {
  test("installs every skill and writes the pinned server to .mcp.json and .codex/config.toml", async () => {
    const project = mkdtempSync(join(tmpdir(), "clickupfy-agent-"));
    writeFileSync(join(project, ".mcp.json"), JSON.stringify({ mcpServers: { other: { command: "x" } } }));
    writeFileSync(log, "");
    const r = await cliIn(project, ["agent", "init", "--space", "901", "--list", "902", "--sprint-folder", "903", "--json"]);
    expect(r.code).toBe(0);
    expect(calls()[0]).toContain(`skills add promovaweb/clickupfy --yes --copy --agent codex ${SKILL_NAMES.map((n) => `--skill ${n}`).join(" ")}`);
    const expectedArgs = ["mcp", "serve", "--account", "work", "--space", "901", "--list", "902", "--sprint-folder", "903"];
    expect(r.json.data).toMatchObject({ account: "work", name: "promovaweb-clickupfy", args: expectedArgs });
    const mcp = JSON.parse(readFileSync(join(project, ".mcp.json"), "utf8"));
    expect(mcp.mcpServers.other).toEqual({ command: "x" });
    expect(mcp.mcpServers["promovaweb-clickupfy"]).toEqual({ command: "clickupfy", args: expectedArgs });
    const codex = parseToml(readFileSync(join(project, ".codex", "config.toml"), "utf8")) as any;
    expect(codex.mcp_servers["promovaweb-clickupfy"].args).toEqual(expectedArgs);
    expect(readFileSync(join(project, ".mcp.json"), "utf8")).not.toContain("pk_test");

    const again = await cliIn(project, ["agent", "install", "--space", "901", "--list", "905", "--json"]);
    expect(again.code).toBe(0);
    expect(JSON.parse(readFileSync(join(project, ".mcp.json"), "utf8")).mcpServers["promovaweb-clickupfy"].args).toContain("905");

    const doctor = await cliIn(project, ["doctor", "--json"]);
    const mcpCheck = doctor.json.data.checks.find((c: { name: string }) => c.name === "mcp-json");
    expect(mcpCheck).toMatchObject({ status: "ok" });
    rmSync(project, { recursive: true, force: true });
  });

  test("requires --space and --list and the profile's workspace", async () => {
    const project = mkdtempSync(join(tmpdir(), "clickupfy-agent-"));
    expect((await cliIn(project, ["agent", "install", "--list", "902"])).code).toBe(2);
    expect((await cliIn(project, ["agent", "install", "--space", "901", "--list", "902", "--workspace", "999"])).code).toBe(2);
    expect((await cliIn(project, ["agent", "install", "--space", "901", "--list", "902", "--account", "ghost"])).code).toBe(6);
    expect(existsSync(join(project, ".mcp.json"))).toBe(false);
    rmSync(project, { recursive: true, force: true });
  });
});

describe("doctor ClickUp checks", () => {
  test("reports the profile, the API key and the legacy config without network calls", async () => {
    const project = mkdtempSync(join(tmpdir(), "clickupfy-agent-"));
    const before = api.requests.length;
    const r = await cliIn(project, ["doctor", "--json"]);
    expect(r.code).toBe(0);
    const byName = Object.fromEntries(r.json.data.checks.map((c: { name: string }) => [c.name, c]));
    expect(byName.accounts.status).toBe("ok");
    expect(byName.profile).toMatchObject({ status: "ok" });
    expect(byName.profile.detail).toContain("work");
    expect(byName["api-key"]).toMatchObject({ status: "ok" });
    expect(byName["legacy-config"].status).toBe("ok");
    expect(api.requests.length).toBe(before);
    expect(r.stdout).not.toContain("pk_test");

    writeFileSync(join(env.home, "no-legacy.json"), "{}");
    const legacy = await cliIn(project, ["doctor", "--json"]);
    expect(legacy.json.data.checks.find((c: { name: string }) => c.name === "legacy-config").status).toBe("warn");
    rmSync(join(env.home, "no-legacy.json"));

    const ghost = await cliIn(project, ["doctor", "--json", "--account", "ghost"]);
    expect(ghost.code).toBe(3);
    expect(ghost.json.data.checks.find((c: { name: string }) => c.name === "profile").status).toBe("fail");
    rmSync(project, { recursive: true, force: true });
  });

  test("doctor --json without a profile points to setup", async () => {
    const home = mkdtempSync(join(tmpdir(), "clickupfy-empty-"));
    const project = mkdtempSync(join(tmpdir(), "clickupfy-agent-"));
    const r = await cliIn(project, ["doctor", "--json"], { [HOME_VARIABLE]: home });
    expect(r.code).toBe(0);
    const profile = r.json.data.checks.find((c: { name: string }) => c.name === "profile");
    expect(profile.status).toBe("warn");
    expect(profile.detail).toContain("clickupfy setup");
    rmSync(home, { recursive: true, force: true });
    rmSync(project, { recursive: true, force: true });
  });

  test("an invalid project server entry fails", async () => {
    const project = mkdtempSync(join(tmpdir(), "clickupfy-agent-"));
    writeFileSync(join(project, ".mcp.json"), JSON.stringify({ mcpServers: { cu: { command: "clickupfy", args: ["mcp", "serve", "--account", "ghost", "--list", "1"] } } }));
    mkdirSync(join(project, ".codex"));
    writeFileSync(join(project, ".codex", "config.toml"), "not = [valid");
    const r = await cliIn(project, ["doctor", "--json"]);
    expect(r.code).toBe(3);
    const byName = Object.fromEntries(r.json.data.checks.map((c: { name: string }) => [c.name, c]));
    expect(byName["mcp-json"].status).toBe("fail");
    expect(byName["mcp-json"].detail).toContain("ghost");
    expect(byName["codex-config"].status).toBe("fail");
    rmSync(project, { recursive: true, force: true });
  });

  test("--online validates the API key and the installed skills", async () => {
    const project = mkdtempSync(join(tmpdir(), "clickupfy-agent-"));
    const r = await cliIn(project, ["doctor", "--online", "--json"]);
    expect(r.code).toBe(0);
    const byName = Object.fromEntries(r.json.data.checks.map((c: { name: string }) => [c.name, c]));
    expect(byName["clickup-api"]).toMatchObject({ status: "ok", detail: "Authenticated as Dev Person" });
    expect(byName["skills-cli"].status).toBe("ok");
    expect(byName["skills-project"].status).toBe("ok");
    expect(byName["skill-language-clickupfy-dev"].status).toBe("ok");
    expect(api.requests.some((q) => q.path === "/user")).toBe(true);
    rmSync(project, { recursive: true, force: true });
  });
});
