/** Persistência atômica e leitura de arquivos locais compatíveis com editores Windows. */
import { mkdir, rename, rm, writeFile } from "node:fs/promises";
import { dirname } from "node:path";
import { randomUUID } from "node:crypto";
import { CliError } from "./errors.js";

/** Remove apenas o BOM inicial, preservando o restante do texto. */
export function removerBom(texto: string): string {
  return texto.replace(/^\uFEFF/u, "");
}

/** Grava ao lado do destino e limpa o temporário inclusive quando rename falha. */
export async function gravarArquivoAtomico(
  caminho: string,
  texto: string,
): Promise<void> {
  await mkdir(dirname(caminho), { recursive: true });
  const temporario = `${caminho}.${randomUUID()}.tmp`;
  try {
    await writeFile(temporario, texto, {
      encoding: "utf8",
      mode: 0o600,
      flag: "wx",
    });
    await rename(temporario, caminho);
  } catch (error) {
    if (
      error instanceof Error &&
      "code" in error &&
      ["EPERM", "EBUSY", "EACCES"].includes(String(error.code))
    ) {
      throw new CliError(
        `Não foi possível substituir ${caminho}. Confira se o arquivo está aberto, somente leitura ou sem permissão de escrita.`,
        1,
        { cause: error },
      );
    }
    throw error;
  } finally {
    await rm(temporario, { force: true });
  }
}
