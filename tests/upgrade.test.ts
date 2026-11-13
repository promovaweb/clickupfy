/** Spec 0012: `upgrade` through npm, refusal from source and target validation. */
import { afterAll, beforeAll, describe, expect, test } from "bun:test";
import { chmodSync, mkdtempSync, readFileSync, rmSync, writeFileSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { HOME_VARIABLE } from "../src/config/paths.ts";
import { releaseAsset } from "../src/cli/commands/upgrade.ts";

let dir: string;
let fakeNpm: string;

beforeAll(() => {
  dir = mkdtempSync(join(tmpdir(), "clickupfy-upgrade-"));
  fakeNpm = join(dir, "npm");
  writeFileSync(fakeNpm, `#!/bin/sh\necho "$@" > "${join(dir, "npm-args")}"\n`);
  chmodSync(fakeNpm, 0o755);
});
afterAll(() => rmSync(dir, { recursive: true, force: true }));

async function run(args: string[], env: Record<string, string> = {}) {
  const proc = Bun.spawn(["bun", "run", "src/main.ts", ...args], {
    cwd: join(import.meta.dir, ".."),
    env: { ...process.env, [HOME_VARIABLE]: dir, NO_COLOR: "1", ...env },
    stdin: "ignore",
    stdout: "pipe",
    stderr: "pipe",
  });
  const [stdout, stderr] = await Promise.all([new Response(proc.stdout).text(), new Response(proc.stderr).text()]);
  return { code: await proc.exited, stdout, stderr };
}

describe("upgrade", () => {
  test.skipIf(process.platform === "win32")("through the npm wrapper runs npm install -g with the target", async () => {
    const r = await run(["upgrade", "1.2.3", "--json"], { CLICKUPFY_LAUNCHER: "npm", CLICKUPFY_NPM: fakeNpm });
    expect(r.code).toBe(0);
    expect(JSON.parse(r.stdout).data).toMatchObject({ method: "npm", package: "@promovaweb/clickupfy@1.2.3" });
    expect(readFileSync(join(dir, "npm-args"), "utf8").trim()).toBe("install -g @promovaweb/clickupfy@1.2.3");
  });

  test("from source it refuses with exit code 2", async () => {
    const r = await run(["upgrade", "--json"], { CLICKUPFY_LAUNCHER: "" });
    expect(r.code).toBe(2);
    expect(JSON.parse(r.stdout).error.message).toContain("source");
  });

  test("an invalid target exits with 2", async () => {
    expect((await run(["upgrade", "banana"])).code).toBe(2);
  });

  test("release asset names", () => {
    expect(releaseAsset("linux", "x64")).toBe("clickupfy-linux-x64");
    expect(releaseAsset("win32", "x64")).toBe("clickupfy-windows-x64.exe");
    expect(releaseAsset("sunos", "x64")).toBeNull();
  });
});
