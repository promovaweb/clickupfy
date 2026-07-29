/**
 * Testes do launcher usado por instalações globais pelo npm.
 */

import { execFile } from "node:child_process";
import { resolve } from "node:path";
import { promisify } from "node:util";
import { describe, expect, it } from "vitest";
import packageJson from "../package.json" with { type: "json" };

const execFileAsync = promisify(execFile);

describe("distribuição npm", () => {
  it("usa o build JavaScript quando o pacote nativo não foi preparado", async () => {
    const resultado = await execFileAsync(
      process.execPath,
      [resolve("bin/clickupfy.cjs"), "--version"],
      {
        env: { ...process.env, CLICKUPFY_FORCE_JAVASCRIPT: "1" },
      },
    );

    expect(resultado.stdout.trim()).toBe(packageJson.version);
  });
});
