/**
 * Spec 0012: the npm wrapper downloads the release binary, checks
 * SHA256SUMS, caches it and runs it with the same arguments.
 */
import { afterAll, beforeAll, describe, expect, test } from "bun:test";
import { createHash } from "node:crypto";
import { mkdtempSync, readFileSync, rmSync, existsSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";

const root = join(import.meta.dir, "..");
const launcher = join(root, "npm", "bin", "clickupfy.cjs");
const { assetName } = require(join(root, "npm", "lib", "binary.cjs"));

let dir: string;
let server: ReturnType<typeof Bun.serve>;
let fakeBinary: string;
let corrupt = false;

beforeAll(() => {
  dir = mkdtempSync(join(tmpdir(), "clickupfy-npm-"));
  fakeBinary = `#!/bin/sh\necho "fake $*"\nexit 3\n`;
  const asset = assetName();
  server = Bun.serve({
    port: 0,
    fetch(req) {
      const path = new URL(req.url).pathname;
      if (path === `/${asset}`) return new Response(fakeBinary);
      if (path === "/SHA256SUMS") {
        const hash = corrupt ? "0".repeat(64) : createHash("sha256").update(fakeBinary).digest("hex");
        return new Response(`${hash}  ${asset}\n`);
      }
      return new Response("missing", { status: 404 });
    },
  });
});

afterAll(() => {
  server.stop(true);
  rmSync(dir, { recursive: true, force: true });
});

async function runLauncher(args: string[], env: Record<string, string>) {
  const proc = Bun.spawn(["node", launcher, ...args], { env: { ...process.env, ...env }, stdout: "pipe", stderr: "pipe" });
  const [stdout, stderr] = await Promise.all([new Response(proc.stdout).text(), new Response(proc.stderr).text()]);
  return { stdout, stderr, exitCode: await proc.exited };
}

describe("npm wrapper", () => {
  test("versions of package.json and npm/package.json match", () => {
    const main = JSON.parse(readFileSync(join(root, "package.json"), "utf8"));
    const npm = JSON.parse(readFileSync(join(root, "npm", "package.json"), "utf8"));
    expect(npm.version).toBe(main.version);
    expect(npm.name).toBe("@promovaweb/clickupfy");
    expect(npm.bin.clickupfy).toBe("bin/clickupfy.cjs");
  });

  test("npm/README.md is generated from README.md", async () => {
    const { buildNpmReadme } = await import("../scripts/npm-readme.ts");
    const npmReadme = readFileSync(join(root, "npm", "README.md"), "utf8");
    expect(npmReadme).toBe(buildNpmReadme(readFileSync(join(root, "README.md"), "utf8")));
    expect(npmReadme).not.toMatch(/\]\((?!https?:|#)/);
  });

  test("npm package ships the same LICENSE as the repository", () => {
    const npm = JSON.parse(readFileSync(join(root, "npm", "package.json"), "utf8"));
    expect(npm.files).toContain("LICENSE");
    expect(readFileSync(join(root, "npm", "LICENSE"), "utf8")).toBe(readFileSync(join(root, "LICENSE"), "utf8"));
  });

  test("asset names follow the release build", () => {
    expect(assetName("linux", "x64")).toBe("clickupfy-linux-x64");
    expect(assetName("darwin", "arm64")).toBe("clickupfy-darwin-arm64");
    expect(assetName("win32", "x64")).toBe("clickupfy-windows-x64.exe");
    expect(assetName("freebsd", "x64")).toBeNull();
  });

  test.skipIf(process.platform === "win32")("downloads, verifies, caches and runs the binary, passing the exit code", async () => {
    const cache = join(dir, "cache");
    const env = { CLICKUPFY_BINARY_DIR: cache, CLICKUPFY_RELEASE_BASE_URL: `http://localhost:${server.port}` };
    const first = await runLauncher(["task", "list", "--json"], env);
    expect(first.stdout).toBe("fake task list --json\n");
    expect(first.exitCode).toBe(3);
    expect(first.stderr).toContain("downloading");
    expect(existsSync(join(cache, assetName()))).toBe(true);
    const second = await runLauncher(["--version"], env);
    expect(second.stderr).not.toContain("downloading");
    expect(second.stdout).toBe("fake --version\n");
  });

  test.skipIf(process.platform === "win32")("refuses a binary with the wrong checksum", async () => {
    corrupt = true;
    const r = await runLauncher(["--version"], { CLICKUPFY_BINARY_DIR: join(dir, "bad"), CLICKUPFY_RELEASE_BASE_URL: `http://localhost:${server.port}` });
    corrupt = false;
    expect(r.exitCode).toBe(1);
    expect(r.stderr).toContain("Checksum mismatch");
    expect(existsSync(join(dir, "bad", assetName()))).toBe(false);
  });
});
