/**
 * Publica o tarball no npm de modo idempotente para reexecuções do workflow.
 */

import { execFileSync } from "node:child_process";
import { readFile } from "node:fs/promises";
import { dirname, join, resolve } from "node:path";
import { fileURLToPath } from "node:url";

const raiz = resolve(dirname(fileURLToPath(import.meta.url)), "..");
const packageJson = JSON.parse(
  await readFile(join(raiz, "package.json"), "utf8"),
);
const tarball = resolve(
  process.argv[2] ??
    join(
      raiz,
      "release-assets",
      `promovaweb-clickupfy-${packageJson.version}.tgz`,
    ),
);
const referencia = `${packageJson.name}@${packageJson.version}`;

if (versaoPublicada(referencia)) {
  process.stdout.write(`${referencia} já existe no npm; publicação ignorada.\n`);
  process.exit(0);
}
if (!process.env.NODE_AUTH_TOKEN) {
  throw new Error(
    "Defina o secret NPM_TOKEN para publicar o pacote no registry npm.",
  );
}

const argumentos = ["publish", tarball, "--access", "public"];
if (process.env.GITHUB_REPOSITORY_VISIBILITY === "public") {
  argumentos.push("--provenance");
}
execFileSync(comandoNpm(), argumentos, { cwd: raiz, stdio: "inherit" });
process.stdout.write(`${referencia} publicado no npm.\n`);

/** Consulta o registry sem transformar um pacote ausente em falha. */
function versaoPublicada(referencia) {
  try {
    const versao = execFileSync(
      comandoNpm(),
      ["view", referencia, "version", "--json"],
      { cwd: raiz, encoding: "utf8", stdio: ["ignore", "pipe", "ignore"] },
    ).trim();
    return JSON.parse(versao) === packageJson.version;
  } catch {
    return false;
  }
}

/** Retorna o launcher do npm compatível com a plataforma atual. */
function comandoNpm() {
  return process.platform === "win32" ? "npm.cmd" : "npm";
}
