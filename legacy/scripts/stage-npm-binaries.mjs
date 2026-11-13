/**
 * Extrai os executáveis de Linux e macOS que serão distribuídos pelo npm.
 */

import { execFileSync } from "node:child_process";
import { chmod, mkdir, readFile, rm, writeFile } from "node:fs/promises";
import { dirname, join, resolve } from "node:path";
import { fileURLToPath } from "node:url";

const raiz = resolve(dirname(fileURLToPath(import.meta.url)), "..");
const diretorioAssets = resolve(process.argv[2] ?? join(raiz, "release-assets"));
const packageJson = JSON.parse(
  await readFile(join(raiz, "package.json"), "utf8"),
);
const diretorioVendor = join(raiz, "vendor");
const alvos = [
  { plataforma: "linux", arquitetura: "x64", destino: "linux-x64" },
  { plataforma: "macos", arquitetura: "x64", destino: "darwin-x64" },
  { plataforma: "macos", arquitetura: "arm64", destino: "darwin-arm64" },
];

await rm(diretorioVendor, { recursive: true, force: true });

for (const alvo of alvos) {
  const nome =
    `clickupfy-v${packageJson.version}-${alvo.plataforma}-` +
    `${alvo.arquitetura}.tar.gz`;
  const archive = join(diretorioAssets, nome);
  const destino = join(diretorioVendor, alvo.destino);

  await mkdir(destino, { recursive: true });
  execFileSync("tar", ["-xzf", archive, "-C", destino], {
    cwd: raiz,
    stdio: "inherit",
  });
  await chmod(join(destino, "clickupfy"), 0o755);
}

await writeFile(
  join(diretorioVendor, "manifest.json"),
  `${JSON.stringify(
    {
      version: packageJson.version,
      targets: alvos.map((alvo) => alvo.destino),
    },
    null,
    2,
  )}\n`,
  "utf8",
);

process.stdout.write(
  `Binários npm preparados em ${diretorioVendor} para ${packageJson.version}.\n`,
);
