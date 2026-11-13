/**
 * Spec 0001: profiles, API keys, legacy migration and the ClickUp client.
 *
 * Each CLI run happens in a subprocess with an isolated data directory, a
 * fake legacy config and a fake ClickUp API served by `Bun.serve`.
 */
import { afterAll, beforeAll, beforeEach, describe, expect, test } from "bun:test";
import { mkdtempSync, readFileSync, rmSync, writeFileSync, mkdirSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { HOME_VARIABLE } from "../src/config/paths.ts";
import { ClickUpClient } from "../src/clickup/client.ts";

let root: string;
let home: string;
let legacy: string;
let server: ReturnType<typeof Bun.serve>;
let hits429 = 0;

const VALID_KEY = "pk_valid_1234567890";

beforeAll(() => {
  root = mkdtempSync(join(tmpdir(), "clickupfy-accounts-"));
  server = Bun.serve({
    port: 0,
    fetch(req) {
      const url = new URL(req.url);
      if (url.pathname === "/api/v2/flaky") {
        hits429 += 1;
        if (hits429 <= 2) return new Response("{}", { status: 429, headers: { "retry-after": "0" } });
        return Response.json({ ok: true });
      }
      if (req.headers.get("authorization") !== VALID_KEY) {
        return Response.json({ err: "Token invalid", ECODE: "OAUTH_025" }, { status: 401 });
      }
      if (url.pathname === "/api/v2/user") return Response.json({ user: { id: 7, username: "Dev Person", email: "dev@example.com" } });
      if (url.pathname === "/api/v2/team") {
        return Response.json({ teams: [{ id: "111", name: "Main" }, { id: "222", name: "Side" }] });
      }
      return Response.json({ err: "Not found" }, { status: 404 });
    },
  });
});

afterAll(() => {
  server.stop(true);
  rmSync(root, { recursive: true, force: true });
});

beforeEach(() => {
  home = mkdtempSync(join(root, "home-"));
  legacy = join(mkdtempSync(join(root, "legacy-")), "config.json");
});

function writeLegacy(): string {
  const account = (name: string, apiKey: string) => ({
    name,
    apiKey,
    user: { id: 7, username: "Dev Person" },
    workspace: { id: "111", name: "Main" },
    createdAt: "2026-01-01T00:00:00.000Z",
    updatedAt: "2026-01-01T00:00:00.000Z",
  });
  const text = `${JSON.stringify(
    { version: 1, activeAccount: "work", accounts: { work: account("Work", VALID_KEY), side: account("Side", "pk_other") } },
    null,
    2,
  )}\n`;
  mkdirSync(join(legacy, ".."), { recursive: true });
  writeFileSync(legacy, text);
  return text;
}

async function run(args: string[], extraEnv: Record<string, string> = {}) {
  const proc = Bun.spawn(["bun", "run", "src/main.ts", ...args], {
    cwd: join(import.meta.dir, ".."),
    env: {
      ...process.env,
      [HOME_VARIABLE]: home,
      NO_COLOR: "1",
      PROMOVAWEB_CLICKUPFY_CONFIG: legacy,
      PROMOVAWEB_CLICKUPFY_API_URL: `http://localhost:${server.port}/api/v2`,
      PROMOVAWEB_CLICKUPFY_API_URL_V3: `http://localhost:${server.port}/api/v3`,
      PROMOVAWEB_CLICKUPFY_ACCOUNT: "",
      ...extraEnv,
    },
    stdin: "ignore",
    stdout: "pipe",
    stderr: "pipe",
  });
  const [stdout, stderr] = await Promise.all([new Response(proc.stdout).text(), new Response(proc.stderr).text()]);
  return { code: await proc.exited, stdout, stderr };
}

describe("legacy migration", () => {
  test("account list imports every profile and leaves the legacy file untouched", async () => {
    const before = writeLegacy();
    const r = await run(["account", "list", "--json"]);
    expect(r.code).toBe(0);
    const json = JSON.parse(r.stdout);
    expect(json.ok).toBe(true);
    expect(json.data.accounts.map((a: { id: string }) => a.id).sort()).toEqual(["side", "work"]);
    expect(json.data.accounts.find((a: { id: string }) => a.id === "work").active).toBe(true);
    expect(r.stderr).toContain("Imported 2 profile(s)");
    expect(readFileSync(legacy, "utf8")).toBe(before);
    const accounts = readFileSync(join(home, "accounts.json"), "utf8");
    expect(accounts).not.toContain(VALID_KEY);
    expect(readFileSync(join(home, "credentials.json"), "utf8")).not.toContain(VALID_KEY);
    const cred = await run(["credentials", "get", "clickup.work.api_key", "--reveal", "--json"]);
    expect(JSON.parse(cred.stdout).data.value).toBe(VALID_KEY);
  });

  test("account import without --force skips existing profiles", async () => {
    writeLegacy();
    await run(["account", "list"]);
    const r = await run(["account", "import", "--json"]);
    expect(r.code).toBe(0);
    const data = JSON.parse(r.stdout).data;
    expect(data.imported).toEqual([]);
    expect(data.skipped.sort()).toEqual(["side", "work"]);
    const forced = JSON.parse((await run(["account", "import", "--force", "--json"])).stdout).data;
    expect(forced.imported.sort()).toEqual(["side", "work"]);
  });

  test("an invalid legacy file exits with 3", async () => {
    writeFileSync(legacy, "{ not json");
    const r = await run(["account", "list", "--json"]);
    expect(r.code).toBe(3);
    expect(JSON.parse(r.stdout).ok).toBe(false);
  });
});

describe("setup", () => {
  test("setup --non-interactive creates the active profile without the key in the output", async () => {
    const r = await run(["setup", "--api-key", VALID_KEY, "--name", "My Work", "--workspace", "222", "--non-interactive", "--json"]);
    expect(r.code).toBe(0);
    expect(r.stdout).not.toContain(VALID_KEY);
    const data = JSON.parse(r.stdout).data;
    expect(data.account).toBe("my-work");
    expect(data.workspace).toEqual({ id: "222", name: "Side" });
    const status = JSON.parse((await run(["status", "--json"])).stdout).data;
    expect(status.account).toBe("my-work");
    expect(status.active).toBe(true);
    expect(status.apiKey).not.toBe(VALID_KEY);
  });

  test("install is an alias of setup", async () => {
    const r = await run(["install", "--token", VALID_KEY, "--workspace", "111", "--non-interactive", "--json"]);
    expect(r.code).toBe(0);
    expect(JSON.parse(r.stdout).data.account).toBe("dev-person");
  });

  test("setup without --api-key off a TTY exits with 2", async () => {
    const r = await run(["setup", "--json"]);
    expect(r.code).toBe(2);
  });

  test("setup with several workspaces and no --workspace off a TTY exits with 2", async () => {
    const r = await run(["setup", "--api-key", VALID_KEY, "--json"]);
    expect(r.code).toBe(2);
    expect(JSON.parse(r.stdout).error.details.available).toHaveLength(2);
  });
});

describe("profile commands", () => {
  test("whoami with a rejected key (401) exits with 4", async () => {
    writeLegacy();
    const r = await run(["whoami", "--account", "side", "--json"]);
    expect(r.code).toBe(4);
    expect(JSON.parse(r.stdout).error.message).toBe("Token invalid");
  });

  test("whoami returns the user", async () => {
    writeLegacy();
    const r = await run(["whoami", "--json"]);
    expect(r.code).toBe(0);
    expect(JSON.parse(r.stdout).data.user.username).toBe("Dev Person");
  });

  test("PROMOVAWEB_CLICKUPFY_ACCOUNT picks the profile", async () => {
    writeLegacy();
    const r = await run(["status", "--json"], { PROMOVAWEB_CLICKUPFY_ACCOUNT: "side" });
    expect(JSON.parse(r.stdout).data.account).toBe("side");
  });

  test("workspace use with an id outside the list exits with 6", async () => {
    writeLegacy();
    const r = await run(["workspace", "use", "999", "--json"]);
    expect(r.code).toBe(6);
    const ok = await run(["workspace", "use", "222", "--json"]);
    expect(JSON.parse(ok.stdout).data.workspace.id).toBe("222");
  });

  test("account remove without --yes off a TTY exits with 2", async () => {
    writeLegacy();
    expect((await run(["account", "remove", "side", "--json"])).code).toBe(2);
    const r = await run(["account", "remove", "side", "--yes", "--json"]);
    expect(r.code).toBe(0);
    const names = JSON.parse((await run(["credentials", "list", "--json"])).stdout).data.names;
    expect(names).toEqual(["clickup.work.api_key"]);
  });

  test("account use and show", async () => {
    writeLegacy();
    expect((await run(["account", "use", "side"])).code).toBe(0);
    const show = JSON.parse((await run(["account", "show", "--json"])).stdout).data.account;
    expect(show.id).toBe("side");
    expect(show.apiKey).not.toContain("pk_other");
    expect((await run(["account", "use", "nope"])).code).toBe(6);
  });

  test("status without profiles exits with 4 and suggests setup", async () => {
    const r = await run(["status"]);
    expect(r.code).toBe(4);
    expect(r.stderr).toContain("clickupfy setup");
  });
});

describe("client", () => {
  test("429 with Retry-After is retried up to three times", async () => {
    hits429 = 0;
    const client = new ClickUpClient(VALID_KEY, { baseUrl: `http://localhost:${server.port}/api/v2` });
    expect(await client.request<{ ok: boolean }>("GET", "/flaky")).toEqual({ ok: true });
    expect(hits429).toBe(3);
  });

  test("404 maps to exit code 6", async () => {
    const client = new ClickUpClient(VALID_KEY, { baseUrl: `http://localhost:${server.port}/api/v2` });
    await expect(client.request("GET", "/missing")).rejects.toMatchObject({ code: 6 });
  });

  test("network failure maps to exit code 5", async () => {
    const client = new ClickUpClient(VALID_KEY, { baseUrl: "http://127.0.0.1:1/api/v2", timeoutMs: 2000 });
    await expect(client.request("GET", "/user")).rejects.toMatchObject({ code: 5 });
  });
});
