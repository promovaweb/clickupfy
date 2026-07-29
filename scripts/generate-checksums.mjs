/**
 * Gera SHA256SUMS determinístico para os artefatos de uma release.
 */

import { createHash } from "node:crypto";
import { readFile, readdir, writeFile } from "node:fs/promises";
import { basename, resolve } from "node:path";

const diretorio = resolve(process.argv[2] ?? "release-assets");
const destino = resolve(diretorio, "SHA256SUMS");
const arquivos = (await readdir(diretorio, { withFileTypes: true }))
  .filter(
    (entrada) =>
      entrada.isFile() &&
      entrada.name !== basename(destino) &&
      !entrada.name.endsWith(".json"),
  )
  .map((entrada) => entrada.name)
  .sort();

if (arquivos.length === 0) {
  throw new Error(`Nenhum artefato encontrado em ${diretorio}.`);
}

const linhas = [];
for (const arquivo of arquivos) {
  const conteudo = await readFile(resolve(diretorio, arquivo));
  const hash = createHash("sha256").update(conteudo).digest("hex");
  linhas.push(`${hash}  ${arquivo}`);
}

await writeFile(destino, `${linhas.join("\n")}\n`, "utf8");
process.stdout.write(`Checksums gerados: ${destino}\n`);
