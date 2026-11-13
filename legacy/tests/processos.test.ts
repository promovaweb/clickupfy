/** Executa argumentos literais e lançadores com espaços em cada sistema operacional. */
import { mkdtemp, writeFile, chmod, rm } from "node:fs/promises";
import { join } from "node:path";
import { tmpdir } from "node:os";
import { describe, expect, it } from "vitest";
import { executarProcesso, executarProcessoSync } from "../src/processos.js";
describe("processos portáteis", () => {
  it("preserva argumentos sem interpretar operadores de shell", async () => {
    const valores = ["com espaços", "ação", "a&b", "a|b", "a>b", "(texto)"];
    const args = [
      "-e",
      "console.log(JSON.stringify(process.argv.slice(1)))",
      ...valores,
    ];
    const resultado = await executarProcesso(process.execPath, args);
    expect(JSON.parse(resultado.stdout)).toEqual(valores);
    const sync = executarProcessoSync(process.execPath, args, {
      encoding: "utf8",
    });
    expect(sync.status).toBe(0);
    expect(JSON.parse(sync.stdout)).toEqual(valores);
  });
  it("executa lançador em diretório com espaços sem alterar argumentos", async () => {
    const pasta = await mkdtemp(join(tmpdir(), "clickupfy Maria Silva "));
    const script = join(pasta, "programa.cjs");
    const comando =
      process.platform === "win32" ? join(pasta, "programa.cmd") : script;
    await writeFile(
      script,
      `#!${process.execPath}\nconsole.log(JSON.stringify(process.argv.slice(2)));\n`,
    );
    await chmod(script, 0o755);
    if (process.platform === "win32")
      await writeFile(
        comando,
        `@echo off\r\n"${process.execPath}" "${script}" %*\r\n`,
      );
    try {
      const args = ["um dois", "a&b", "ação"];
      expect(
        JSON.parse((await executarProcesso(comando, args)).stdout),
      ).toEqual(args);
      const sync = executarProcessoSync(comando, args, { encoding: "utf8" });
      expect(sync.status).toBe(0);
      expect(JSON.parse(sync.stdout)).toEqual(args);
    } finally {
      await rm(pasta, { recursive: true, force: true });
    }
  });
  it("identifica um comando ausente sem confundir com uma falha do programa", async () => {
    await expect(
      executarProcesso("clickupfy-comando-inexistente-8", []),
    ).rejects.toMatchObject({ code: "ENOENT" });
  });
});
