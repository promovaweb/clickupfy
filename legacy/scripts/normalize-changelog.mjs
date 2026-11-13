/**
 * Normaliza o Markdown gerado pelo Release Please para as regras do projeto.
 */

import { readFile, writeFile } from "node:fs/promises";
import { dirname, join, resolve } from "node:path";
import { fileURLToPath } from "node:url";

const raiz = resolve(dirname(fileURLToPath(import.meta.url)), "..");
const caminho = join(raiz, "CHANGELOG.md");
const verificar = process.argv.includes("--check");
const original = await readFile(caminho, "utf8");
const normalizado = original
  .replace(/^\* /gm, "- ")
  .replace(/\n{3,}/g, "\n\n");

if (normalizado === original) {
  process.stdout.write("CHANGELOG.md já está normalizado.\n");
} else if (verificar) {
  throw new Error(
    "CHANGELOG.md diverge do padrão. Execute npm run changelog:format.",
  );
} else {
  await writeFile(caminho, normalizado, "utf8");
  process.stdout.write("CHANGELOG.md normalizado.\n");
}
