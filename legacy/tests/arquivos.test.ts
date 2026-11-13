/** Regressões de BOM e limpeza de temporários com dados pessoais. */
import {
  mkdtemp,
  readFile,
  readdir,
  rename,
  rm,
  writeFile,
} from "node:fs/promises";
import { join } from "node:path";
import { tmpdir } from "node:os";
import { afterEach, describe, expect, it, vi } from "vitest";
import { gravarArquivoAtomico } from "../src/arquivos.js";
import { criarConfiguracaoVazia, lerConfiguracao } from "../src/config.js";
import { executarDoctor } from "../src/doctor.js";
vi.mock("node:fs/promises", async (original) => {
  const fs = await original<typeof import("node:fs/promises")>();
  return { ...fs, rename: vi.fn(fs.rename) };
});
const pastas: string[] = [];
afterEach(async () => {
  vi.unstubAllEnvs();
  vi.mocked(rename).mockClear();
  await Promise.all(
    pastas
      .splice(0)
      .map((pasta) => rm(pasta, { recursive: true, force: true })),
  );
});
async function pastaTeste() {
  const pasta = await mkdtemp(join(tmpdir(), "clickupfy arquivos "));
  pastas.push(pasta);
  return pasta;
}
describe("persistência Windows", () => {
  it.each(["EPERM", "EBUSY", "EACCES"])(
    "remove temporário e preserva destino após %s",
    async (code) => {
      const pasta = await pastaTeste();
      const caminho = join(pasta, "config.json");
      await writeFile(caminho, "original");
      vi.mocked(rename).mockRejectedValueOnce(
        Object.assign(new Error("falha simulada"), { code }),
      );
      await expect(
        gravarArquivoAtomico(caminho, "api-key-secreta"),
      ).rejects.toThrow("somente leitura");
      expect(await readFile(caminho, "utf8")).toBe("original");
      expect(await readdir(pasta)).toEqual(["config.json"]);
    },
  );
  it("aceita BOM no cadastro e no diagnóstico", async () => {
    const pasta = await pastaTeste();
    const caminho = join(pasta, "config.json");
    const config = criarConfiguracaoVazia();
    await writeFile(caminho, "\uFEFF" + JSON.stringify(config));
    vi.stubEnv("PROMOVAWEB_CLICKUPFY_CONFIG", caminho);
    expect(await lerConfiguracao()).toEqual(config);
    const resultado = await executarDoctor(pasta, {
      skillsCli: {
        command: process.execPath,
        args: ["-e", "console.log('[]')", "--"],
      },
    });
    expect(
      resultado.checks.find((item) => item.id === "config-schema")?.estado,
    ).toBe("ok");
    if (process.platform === "win32") {
      expect(
        resultado.checks.find((item) => item.id === "config-permissions")
          ?.estado,
      ).toBe("skipped");
      expect(
        resultado.checks.find((item) => item.id === "config-directory")?.estado,
      ).toBe("skipped");
    }
  });
});
