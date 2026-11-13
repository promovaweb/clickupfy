/**
 * Locates or downloads the compiled ClickUpfy binary for this platform.
 *
 * The npm package is a thin wrapper: the real executable is the Bun binary
 * published in the GitHub Release of the same version. On the first run the
 * wrapper downloads `clickupfy-<platform>` and `SHA256SUMS` from
 * `https://github.com/promovaweb/clickupfy/releases/download/v<version>/`,
 * checks the hash, and keeps the file in
 * `~/.clickupfy/bin/v<version>/` (or `CLICKUPFY_BINARY_DIR`). Later runs use
 * the cached file. `CLICKUPFY_BINARY_PATH` points to a binary directly and
 * skips the download; `CLICKUPFY_RELEASE_BASE_URL` replaces the release URL
 * (mirrors and tests). Progress goes to stderr, so the MCP stdio transport
 * on stdout stays clean.
 *
 * Run as a script (`node lib/binary.cjs`), it pre-downloads the binary and
 * never fails, which is what the `postinstall` hook uses.
 */
"use strict";

const { createHash } = require("node:crypto");
const { chmodSync, existsSync, mkdirSync, renameSync, writeFileSync, unlinkSync } = require("node:fs");
const { homedir } = require("node:os");
const { join } = require("node:path");

const pkg = require("../package.json");
const REPOSITORY = "https://github.com/promovaweb/clickupfy";

const TARGETS = {
  "linux-x64": "linux-x64",
  "linux-arm64": "linux-arm64",
  "darwin-x64": "darwin-x64",
  "darwin-arm64": "darwin-arm64",
  "win32-x64": "windows-x64",
};

/** Release asset name for the current platform, or null when unsupported. */
function assetName(platform = process.platform, arch = process.arch) {
  const suffix = TARGETS[`${platform}-${arch}`];
  if (!suffix) return null;
  return `clickupfy-${suffix}${platform === "win32" ? ".exe" : ""}`;
}

/** Directory that caches the binary of this package version. */
function cacheDir() {
  const override = process.env.CLICKUPFY_BINARY_DIR;
  if (override && override.trim()) return override;
  return join(homedir(), ".clickupfy", "bin", `v${pkg.version}`);
}

async function download(url) {
  const response = await fetch(url, { redirect: "follow" });
  if (!response.ok) throw new Error(`HTTP ${response.status} for ${url}`);
  return Buffer.from(await response.arrayBuffer());
}

/**
 * Returns the path of a ready-to-run binary, downloading and verifying it
 * when the cache is empty. Throws with an actionable message on failure.
 */
async function ensureBinary() {
  const explicit = process.env.CLICKUPFY_BINARY_PATH;
  if (explicit && explicit.trim()) {
    if (!existsSync(explicit)) throw new Error(`CLICKUPFY_BINARY_PATH points to a missing file: ${explicit}`);
    return explicit;
  }
  const asset = assetName();
  if (!asset) {
    throw new Error(`No ClickUpfy binary is published for ${process.platform}-${process.arch}. Supported: ${Object.keys(TARGETS).join(", ")}.`);
  }
  const dir = cacheDir();
  const target = join(dir, asset);
  if (existsSync(target)) return target;

  const base = process.env.CLICKUPFY_RELEASE_BASE_URL || `${REPOSITORY}/releases/download/v${pkg.version}`;
  process.stderr.write(`clickupfy: downloading ${asset} v${pkg.version} (first run)...\n`);
  const [binary, sums] = await Promise.all([download(`${base}/${asset}`), download(`${base}/SHA256SUMS`)]);
  const expected = sums
    .toString("utf8")
    .split(/\r?\n/)
    .map((line) => line.trim().split(/\s+\*?/))
    .find(([, name]) => name === asset);
  if (!expected) throw new Error(`SHA256SUMS of v${pkg.version} has no entry for ${asset}.`);
  const actual = createHash("sha256").update(binary).digest("hex");
  if (actual !== expected[0]) throw new Error(`Checksum mismatch for ${asset}: expected ${expected[0]}, got ${actual}.`);

  mkdirSync(dir, { recursive: true, mode: 0o700 });
  const temp = `${target}.${process.pid}.tmp`;
  try {
    writeFileSync(temp, binary, { mode: 0o755 });
    if (process.platform !== "win32") chmodSync(temp, 0o755);
    renameSync(temp, target);
  } catch (e) {
    try {
      unlinkSync(temp);
    } catch {}
    throw e;
  }
  process.stderr.write(`clickupfy: binary saved to ${target}\n`);
  return target;
}

module.exports = { assetName, cacheDir, ensureBinary, TARGETS };

if (require.main === module) {
  ensureBinary().catch((e) => {
    process.stderr.write(`clickupfy: the binary will be downloaded on first run (${e.message})\n`);
  });
}
