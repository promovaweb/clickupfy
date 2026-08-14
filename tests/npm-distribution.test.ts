/**
 * Testes do launcher usado por instalações globais pelo npm.
 */

import { execFile } from "node:child_process";
import { chmod, mkdtemp, readFile, rm, mkdir, writeFile } from "node:fs/promises";
import { join, resolve } from "node:path";
import { tmpdir } from "node:os";
import { promisify } from "node:util";
import { describe, expect, it } from "vitest";
import packageJson from "../package.json" with { type: "json" };
import { executarUpgrade, normalizarAlvo } from "../src/upgrade.js";

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

  it("normaliza canais e versões aceitos pelo upgrade", () => {
    expect(normalizarAlvo("latest")).toBe("latest");
    expect(normalizarAlvo("next")).toBe("next");
    expect(normalizarAlvo("v0.5.0")).toBe("0.5.0");
  });

  it("recusa um alvo que não seja canal ou SemVer", () => {
    expect(() => normalizarAlvo("stable-now")).toThrow(
      "Alvo de upgrade inválido",
    );
  });

  it("instala o alvo no npm global e confirma o launcher novo", async () => {
    const pasta = await mkdtemp(join(tmpdir(), "clickupfy-upgrade-"));
    const prefixo = join(pasta, "prefix");
    const bin = join(prefixo, "bin");
    const chamadas = join(pasta, "calls.jsonl");
    const npm = join(pasta, "npm.mjs");
    const launcher = join(bin, "clickupfy");

    await mkdir(bin, { recursive: true });
    await writeFile(
      npm,
      `#!/usr/bin/env node
import { appendFileSync } from "node:fs";
const args = process.argv.slice(2);
appendFileSync(process.env.CALLS, JSON.stringify(args) + "\\n");
if (args[0] === "prefix") process.stdout.write(process.env.PREFIX);
`,
      "utf8",
    );
    await writeFile(
      launcher,
      `#!/usr/bin/env node\nprocess.stdout.write(${JSON.stringify("0.6.0\n")});\n`,
      "utf8",
    );
    await chmod(npm, 0o755);
    await chmod(launcher, 0o755);

    try {
      const resultado = executarUpgrade("v0.6.0", {
        npmCommand: npm,
        environment: {
          CALLS: chamadas,
          PREFIX: prefixo,
        },
      });
      const registros = (await readFile(chamadas, "utf8"))
        .trim()
        .split("\n")
        .map((linha) => JSON.parse(linha) as string[]);

      expect(resultado).toEqual({ target: "0.6.0", version: "0.6.0" });
      expect(registros).toEqual([
        ["install", "--global", "@promovaweb/clickupfy@0.6.0", "--no-fund", "--no-audit"],
        ["prefix", "--global"],
      ]);
    } finally {
      await rm(pasta, { recursive: true, force: true });
    }
  });
});
