/**
 * `upgrade` command: updates ClickUpfy to the latest release or to a version.
 *
 * Two installation types are handled:
 *
 * - started by the npm wrapper (`CLICKUPFY_LAUNCHER=npm`): runs
 *   `npm install -g @promovaweb/clickupfy@<target>`, as ClickUpfy 0.9.0 did;
 * - standalone binary: downloads `clickupfy-<platform>` and `SHA256SUMS` from
 *   the GitHub Release, checks the hash and replaces the running executable
 *   atomically (on Windows the old file is renamed to `.old` first).
 *
 * Running from source (`bun run src/main.ts`) is refused: update the
 * repository instead. `CLICKUPFY_NPM` and `CLICKUPFY_RELEASE_BASE_URL`
 * replace the npm command and the release URL, for tests and mirrors.
 */
import { createHash } from "node:crypto";
import { chmodSync, renameSync, unlinkSync, writeFileSync, existsSync } from "node:fs";
import { basename } from "node:path";
import { manifest } from "../../app/manifest.ts";
import { ExitCode } from "../../app/exit-codes.ts";
import { error } from "../../app/errors.ts";
import { color } from "../format.ts";
import type { Command } from "../registry.ts";

const PACKAGE = "@promovaweb/clickupfy";
const REPOSITORY = "https://github.com/promovaweb/clickupfy";
const TARGET = /^(latest|next|v?\d+\.\d+\.\d+(-[0-9A-Za-z.-]+)?)$/;

const SUFFIXES: Record<string, string> = {
  "linux-x64": "linux-x64",
  "linux-arm64": "linux-arm64",
  "darwin-x64": "darwin-x64",
  "darwin-arm64": "darwin-arm64",
  "win32-x64": "windows-x64",
};

/** Release asset of the current platform. */
export function releaseAsset(platform = process.platform, arch = process.arch): string | null {
  const suffix = SUFFIXES[`${platform}-${arch}`];
  return suffix ? `${manifest.bin}-${suffix}${platform === "win32" ? ".exe" : ""}` : null;
}

async function fetchBuffer(url: string): Promise<Buffer> {
  let response: Response;
  try {
    response = await fetch(url, { redirect: "follow" });
  } catch (e) {
    throw error.network(`Could not download ${url}: ${e instanceof Error ? e.message : String(e)}`);
  }
  if (response.status === 404) throw error.notFound(`Release asset not found: ${url}`);
  if (!response.ok) throw error.network(`HTTP ${response.status} downloading ${url}`);
  return Buffer.from(await response.arrayBuffer());
}

async function upgradeNpm(target: string) {
  const npm = process.env.CLICKUPFY_NPM || "npm";
  const spec = `${PACKAGE}@${target.replace(/^v/, "")}`;
  const proc = Bun.spawn([npm, "install", "-g", spec], { stdout: "inherit", stderr: "inherit", stdin: "ignore" });
  const code = await proc.exited;
  if (code !== 0) throw error.network(`npm install -g ${spec} failed with exit code ${code}.`);
  return { method: "npm", target, package: spec };
}

async function upgradeBinary(target: string) {
  if (target === "next") throw error.usage('The "next" channel only exists on npm. Use "latest" or a version.');
  const asset = releaseAsset();
  if (!asset) throw error.usage(`No binary is published for ${process.platform}-${process.arch}.`);
  const executable = process.execPath;
  if (/^bun(\.exe)?$/i.test(basename(executable))) {
    throw error.usage("Running from source with Bun: update the repository instead of using upgrade.");
  }
  const version = target === "latest" ? "latest" : `v${target.replace(/^v/, "")}`;
  const base =
    process.env.CLICKUPFY_RELEASE_BASE_URL ||
    (version === "latest" ? `${REPOSITORY}/releases/latest/download` : `${REPOSITORY}/releases/download/${version}`);
  process.stderr.write(`${manifest.bin}: downloading ${asset} (${version})...\n`);
  const [binary, sums] = await Promise.all([fetchBuffer(`${base}/${asset}`), fetchBuffer(`${base}/SHA256SUMS`)]);
  const line = sums
    .toString("utf8")
    .split(/\r?\n/)
    .map((l) => l.trim().split(/\s+\*?/))
    .find(([, name]) => name === asset);
  if (!line) throw error.network(`SHA256SUMS has no entry for ${asset}.`);
  const actual = createHash("sha256").update(binary).digest("hex");
  if (actual !== line[0]) throw error.network(`Checksum mismatch for ${asset}: expected ${line[0]}, got ${actual}.`);

  const temp = `${executable}.new`;
  try {
    writeFileSync(temp, binary, { mode: 0o755 });
    if (process.platform !== "win32") chmodSync(temp, 0o755);
    if (process.platform === "win32") {
      const old = `${executable}.old`;
      if (existsSync(old)) unlinkSync(old);
      renameSync(executable, old);
    }
    renameSync(temp, executable);
  } catch (e) {
    throw error.permission(`Could not replace ${executable}: ${e instanceof Error ? e.message : String(e)}`);
  }
  return { method: "binary", target: version, path: executable };
}

export const upgradeCommand: Command = {
  name: "upgrade",
  description: "Update ClickUpfy to the latest release or to a given version.",
  longDescription:
    "Installed through npm, runs npm install -g @promovaweb/clickupfy@<target>. As a standalone binary, downloads the " +
    "release for this platform, checks SHA256SUMS and replaces the executable.",
  arguments: [{ name: "target", description: "latest, next (npm only) or a SemVer version. Default: latest." }],
  exitCodes: [ExitCode.NETWORK_OR_API, ExitCode.NOT_FOUND, ExitCode.PERMISSION],
  examples: [`${manifest.bin} upgrade`, `${manifest.bin} upgrade 1.0.1`],
  run: async (ctx) => {
    const target = ctx.args[0] ?? "latest";
    if (!TARGET.test(target)) throw error.usage(`Invalid target "${target}". Use latest, next or a SemVer version.`);
    const result = process.env.CLICKUPFY_LAUNCHER === "npm" ? await upgradeNpm(target) : await upgradeBinary(target);
    return {
      data: { from: manifest.version, ...result },
      text: () => `${color.ok("✓")} ${manifest.bin} updated (${result.method}, ${result.target}). Run "${manifest.bin} --version" to confirm.`,
    };
  },
};
