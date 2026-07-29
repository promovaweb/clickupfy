/**
 * Testes do contrato de versão usado localmente e no GitHub Actions.
 */

import { execFile } from "node:child_process";
import { resolve } from "node:path";
import { promisify } from "node:util";
import { describe, expect, it } from "vitest";
import packageJson from "../package.json" with { type: "json" };

const execFileAsync = promisify(execFile);
const validador = resolve("scripts/validate-release.mjs");

describe("validação de release", () => {
  it("ignora o nome de uma branch fornecido pelo GitHub Actions", async () => {
    const resultado = await execFileAsync(process.execPath, [validador], {
      env: {
        ...process.env,
        GITHUB_REF_NAME: "main",
        GITHUB_REF_TYPE: "branch",
      },
    });

    expect(resultado.stdout).toContain(
      `Release válida: v${packageJson.version}.`,
    );
  });

  it("valida uma tag explícita contra a versão do pacote", async () => {
    await expect(
      execFileAsync(process.execPath, [validador, "v9.9.9"]),
    ).rejects.toMatchObject({
      stderr: expect.stringContaining(
        `A tag v9.9.9 diverge da versão ${packageJson.version}.`,
      ),
    });
  });
});
