/**
 * Instala o tarball npm isoladamente e exige o executável nativo da máquina.
 */

import { execFileSync } from "node:child_process";
import { mkdtemp, readFile, rm } from "node:fs/promises";
import { tmpdir } from "node:os";
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
const destino = await mkdtemp(join(tmpdir(), "clickupfy-npm-"));

try {
  execFileSync(
    comandoNpm(),
    ["install", "--prefix", destino, "--ignore-scripts", tarball],
    { cwd: raiz, stdio: "inherit" },
  );
  const launcher = join(
    destino,
    "node_modules",
    "@promovaweb",
    "clickupfy",
    "bin",
    "clickupfy.cjs",
  );
  const versao = execFileSync(process.execPath, [launcher, "--version"], {
    encoding: "utf8",
    env: { ...process.env, CLICKUPFY_REQUIRE_NATIVE: "1" },
  }).trim();

  if (versao !== packageJson.version) {
    throw new Error(
      `O pacote npm informou ${versao}; esperado ${packageJson.version}.`,
    );
  }
  process.stdout.write(`Pacote npm nativo validado: ${tarball}.\n`);
} finally {
  await rm(destino, { recursive: true, force: true });
}

/** Retorna o nome do launcher do npm compatível com a plataforma atual. */
function comandoNpm() {
  return process.platform === "win32" ? "npm.cmd" : "npm";
}
