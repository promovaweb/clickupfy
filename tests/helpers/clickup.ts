/**
 * Shared test helpers: a fake ClickUp API, an isolated data directory with
 * one profile, a CLI runner and an MCP client.
 *
 * Usage in a test file:
 *
 *   const api = fakeClickUp({ "GET /team/111/space": () => Response.json({ spaces: [] }) });
 *   const env = await testEnv(api);           // home with profile "work" bound to workspace 111
 *   const r = await env.cli(["space", "list", "--json"]);
 *   const mcp = await env.mcp(["mcp", "serve", "--list", "L1"]);
 *   ...
 *   await env.close(); api.stop();
 *
 * Routes are keyed by `METHOD /path` relative to `/api/v2` (or `/api/v3` with
 * the `v3 ` prefix, e.g. `"v3 GET /workspaces/111/docs"`). Every request is
 * recorded in `api.requests` with method, path, query and JSON body.
 */
import { mkdtempSync, rmSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { Client } from "@modelcontextprotocol/sdk/client/index.js";
import { StdioClientTransport } from "@modelcontextprotocol/sdk/client/stdio.js";
import { HOME_VARIABLE } from "../../src/config/paths.ts";

export const API_KEY = "pk_test_0123456789";
export const WORKSPACE = { id: "111", name: "Main" };

export interface RecordedRequest {
  method: string;
  path: string;
  version: "v2" | "v3";
  query: URLSearchParams;
  body: unknown;
}

export type Handler = (req: RecordedRequest) => Response | Promise<Response>;

export interface FakeApi {
  port: number;
  requests: RecordedRequest[];
  routes: Record<string, Handler>;
  stop: () => void;
}

/** Starts a fake ClickUp API. Unknown routes answer 404 `{ err }`. */
export function fakeClickUp(routes: Record<string, Handler> = {}): FakeApi {
  const requests: RecordedRequest[] = [];
  const api: FakeApi = { port: 0, requests, routes, stop: () => {} };
  const server = Bun.serve({
    port: 0,
    async fetch(req) {
      const url = new URL(req.url);
      const version = url.pathname.startsWith("/api/v3") ? "v3" : "v2";
      const path = url.pathname.replace(/^\/api\/v[23]/, "");
      const text = await req.text();
      let body: unknown;
      try {
        body = text ? JSON.parse(text) : undefined;
      } catch {
        body = text;
      }
      const recorded: RecordedRequest = { method: req.method, path, version, query: url.searchParams, body };
      requests.push(recorded);
      if (req.headers.get("authorization") !== API_KEY) return Response.json({ err: "Token invalid" }, { status: 401 });
      const key = `${version === "v3" ? "v3 " : ""}${req.method} ${path}`;
      if (key === "GET /user") return Response.json({ user: { id: 7, username: "Dev Person", email: "dev@example.com" } });
      if (key === "GET /team") return Response.json({ teams: [WORKSPACE] });
      const handler = api.routes[key];
      if (!handler) return Response.json({ err: `No route ${key}` }, { status: 404 });
      return handler(recorded);
    },
  });
  api.port = server.port ?? 0;
  api.stop = () => server.stop(true);
  return api;
}

export interface TestEnv {
  home: string;
  env: Record<string, string>;
  cli: (args: string[], stdin?: string) => Promise<{ code: number; stdout: string; stderr: string; json: any }>;
  mcp: (args: string[]) => Promise<Client>;
  close: () => Promise<void>;
}

/** Creates an isolated home with profile "work" (workspace 111) pointing at the fake API. */
export async function testEnv(api: FakeApi): Promise<TestEnv> {
  const home = mkdtempSync(join(tmpdir(), "clickupfy-test-"));
  const env: Record<string, string> = {
    ...(process.env as Record<string, string>),
    [HOME_VARIABLE]: home,
    NO_COLOR: "1",
    PROMOVAWEB_CLICKUPFY_CONFIG: join(home, "no-legacy.json"),
    PROMOVAWEB_CLICKUPFY_API_URL: `http://localhost:${api.port}/api/v2`,
    PROMOVAWEB_CLICKUPFY_API_URL_V3: `http://localhost:${api.port}/api/v3`,
    PROMOVAWEB_CLICKUPFY_ACCOUNT: "",
  };
  const clients: Client[] = [];
  const cwd = join(import.meta.dir, "..", "..");

  const cli: TestEnv["cli"] = async (args, stdin) => {
    const proc = Bun.spawn(["bun", "run", "src/main.ts", ...args], {
      cwd,
      env,
      stdin: stdin === undefined ? "ignore" : new Response(stdin),
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
  };

  const mcp: TestEnv["mcp"] = async (args) => {
    const client = new Client({ name: "test", version: "0.0.0" });
    await client.connect(new StdioClientTransport({ command: "bun", args: ["run", "src/main.ts", ...args], cwd, env, stderr: "pipe" }));
    clients.push(client);
    return client;
  };

  const setup = await cli(["setup", "--api-key", API_KEY, "--name", "work", "--workspace", WORKSPACE.id, "--non-interactive", "--json"]);
  if (setup.code !== 0) throw new Error(`test profile setup failed: ${setup.stdout}${setup.stderr}`);

  return {
    home,
    env,
    cli,
    mcp,
    close: async () => {
      await Promise.all(clients.map((c) => c.close().catch(() => {})));
      rmSync(home, { recursive: true, force: true });
    },
  };
}

/** Parses the JSON text of a tool result. */
export function toolJson(result: { content?: unknown }): any {
  const text = (result.content as Array<{ text: string }>)[0]?.text ?? "null";
  try {
    return JSON.parse(text);
  } catch {
    return text;
  }
}
