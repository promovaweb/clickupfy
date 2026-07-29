/**
 * Valida a coerência entre versão, changelog e configuração de release.
 */

import { access, readFile } from "node:fs/promises";
import { dirname, join, resolve } from "node:path";
import { fileURLToPath } from "node:url";

const raiz = resolve(dirname(fileURLToPath(import.meta.url)), "..");
const tagInformada =
  process.argv[2] ??
  (process.env.GITHUB_REF_TYPE === "tag"
    ? process.env.GITHUB_REF_NAME
    : undefined);
const packageJson = await lerJson("package.json");
const packageLock = await lerJson("package-lock.json");
const manifesto = await lerJson(".release-please-manifest.json");
const configuracao = await lerJson("release-please-config.json");
const changelog = await readFile(join(raiz, "CHANGELOG.md"), "utf8");
const workflow = join(raiz, ".github", "workflows", "release.yml");

validarSemver(packageJson.version, "package.json");
igual(
  packageLock.version,
  packageJson.version,
  "A versão raiz do package-lock.json diverge do package.json.",
);
igual(
  packageLock.packages?.[""]?.version,
  packageJson.version,
  "A versão do pacote raiz no package-lock.json diverge do package.json.",
);
igual(
  manifesto["."],
  packageJson.version,
  "O manifesto do Release Please diverge do package.json.",
);
igual(
  configuracao.packages?.["."]?.["release-type"],
  "node",
  "O pacote raiz precisa usar o release-type node.",
);

const versaoEscapada = packageJson.version.replaceAll(".", String.raw`\.`);
if (!new RegExp(`^## (?:\\[)?${versaoEscapada}(?:\\])?\\b`, "m").test(changelog)) {
  throw new Error(`CHANGELOG.md não possui uma seção para ${packageJson.version}.`);
}

await access(workflow);

if (tagInformada) {
  if (!/^v\d+\.\d+\.\d+(?:-[0-9A-Za-z.-]+)?$/.test(tagInformada)) {
    throw new Error(`Tag inválida: ${tagInformada}. Use vMAJOR.MINOR.PATCH.`);
  }
  igual(
    tagInformada.slice(1),
    packageJson.version,
    `A tag ${tagInformada} diverge da versão ${packageJson.version}.`,
  );
}

process.stdout.write(
  `Release válida: v${packageJson.version}${tagInformada ? ` (${tagInformada})` : ""}.\n`,
);

/** Lê um JSON canônico e preserva o caminho no erro de parsing. */
async function lerJson(caminho) {
  try {
    return JSON.parse(await readFile(join(raiz, caminho), "utf8"));
  } catch (error) {
    throw new Error(`JSON inválido em ${caminho}.`, { cause: error });
  }
}

/** Exige uma versão SemVer completa. */
function validarSemver(valor, origem) {
  if (!/^\d+\.\d+\.\d+(?:-[0-9A-Za-z.-]+)?$/.test(valor ?? "")) {
    throw new Error(`Versão inválida em ${origem}: ${String(valor)}.`);
  }
}

/** Produz uma falha curta quando dois valores canônicos divergem. */
function igual(atual, esperado, mensagem) {
  if (atual !== esperado) {
    throw new Error(`${mensagem} Recebido ${String(atual)}.`);
  }
}
