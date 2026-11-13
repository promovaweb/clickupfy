#!/usr/bin/env node
/**
 * npm launcher of ClickUpfy.
 *
 * Resolves the compiled binary for this platform (downloading it from the
 * GitHub Release on the first run, see `lib/binary.cjs`) and runs it with
 * the same arguments and inherited stdio, so the TUI, the CLI and the MCP
 * stdio server behave exactly as the standalone binary. The exit code and
 * terminating signal are passed through. `CLICKUPFY_LAUNCHER=npm` tells the
 * binary it was started by npm, which `clickupfy upgrade` uses to update
 * through npm.
 */
"use strict";

const { spawnSync } = require("node:child_process");
const { ensureBinary } = require("../lib/binary.cjs");

ensureBinary()
  .then((binary) => {
    const result = spawnSync(binary, process.argv.slice(2), {
      stdio: "inherit",
      env: { ...process.env, CLICKUPFY_LAUNCHER: "npm" },
    });
    if (result.error) {
      process.stderr.write(`clickupfy: could not start ${binary}: ${result.error.message}\n`);
      process.exit(1);
    }
    if (result.signal) process.kill(process.pid, result.signal);
    process.exit(result.status ?? 1);
  })
  .catch((e) => {
    process.stderr.write(`clickupfy: ${e.message}\n`);
    process.exit(1);
  });
