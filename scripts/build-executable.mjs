/**
 * Gera um executável standalone nativo do ClickUpfy com Node.js SEA.
 */

import { execFileSync } from "node:child_process";
import {
  appendFile,
  chmod,
  copyFile,
  mkdir,
  mkdtemp,
  readFile,
  readdir,
  rm,
  writeFile,
} from "node:fs/promises";
import { tmpdir } from "node:os";
import { basename, dirname, join, relative, resolve, sep } from "node:path";
import { fileURLToPath, pathToFileURL } from "node:url";
import { build } from "esbuild";
import postject from "postject";

const SENTINEL = "NODE_SEA_FUSE_fce680ab2cc467b6e072b8b5df1996b2";
const raiz = resolve(dirname(fileURLToPath(import.meta.url)), "..");
const packageJson = JSON.parse(
  await readFile(join(raiz, "package.json"), "utf8"),
);
const plataforma = nomePlataforma(process.platform);
const arquitetura = process.arch;
const nomeArtefato =
  `clickupfy-v${packageJson.version}-${plataforma}-${arquitetura}`;
const nomeBinario = process.platform === "win32" ? "clickupfy.exe" : "clickupfy";
const pastaBuild = join(raiz, "build", "sea");
const pastaArtefato = join(raiz, "artifacts", nomeArtefato);
const caminhoBundle = join(pastaBuild, "clickupfy.cjs");
const caminhoBlob = join(pastaBuild, "clickupfy.blob");
const caminhoConfig = join(pastaBuild, "sea-config.json");
const caminhoBinario = join(pastaArtefato, nomeBinario);
const extensaoArchive = process.platform === "win32" ? ".zip" : ".tar.gz";
const caminhoArchive = join(raiz, "artifacts", `${nomeArtefato}${extensaoArchive}`);

await rm(pastaBuild, { recursive: true, force: true });
await rm(pastaArtefato, { recursive: true, force: true });
await rm(caminhoArchive, { force: true });
await mkdir(pastaBuild, { recursive: true });
await mkdir(pastaArtefato, { recursive: true });

await build({
  entryPoints: [join(raiz, "src", "cli.ts")],
  outfile: caminhoBundle,
  bundle: true,
  format: "cjs",
  platform: "node",
  target: "node22",
  sourcemap: false,
  minify: false,
  logLevel: "info",
  define: {
    "import.meta.url": JSON.stringify(pathToFileURL(caminhoBundle).href),
  },
});

const assets = await coletarAssetsSkills();
await writeFile(
  caminhoConfig,
  `${JSON.stringify(
    {
      main: caminhoBundle,
      output: caminhoBlob,
      disableExperimentalSEAWarning: true,
      useSnapshot: false,
      useCodeCache: false,
      execArgvExtension: "none",
      assets,
    },
    null,
    2,
  )}\n`,
  "utf8",
);

execFileSync(process.execPath, ["--experimental-sea-config", caminhoConfig], {
  cwd: raiz,
  stdio: "inherit",
});
await copyFile(process.execPath, caminhoBinario);

if (process.platform === "darwin") {
  execFileSync("codesign", ["--remove-signature", caminhoBinario], {
    stdio: "inherit",
  });
}

await postject.inject(
  caminhoBinario,
  "NODE_SEA_BLOB",
  await readFile(caminhoBlob),
  {
    sentinelFuse: SENTINEL,
    machoSegmentName: "NODE_SEA",
  },
);

if (process.platform === "darwin") {
  execFileSync("codesign", ["--sign", "-", caminhoBinario], {
    stdio: "inherit",
  });
} else if (process.platform !== "win32") {
  await chmod(caminhoBinario, 0o755);
}

const versaoExecutavel = execFileSync(caminhoBinario, ["--version"], {
  encoding: "utf8",
}).trim();
if (versaoExecutavel !== packageJson.version) {
  throw new Error(
    `O executável informou ${versaoExecutavel}; esperado ${packageJson.version}.`,
  );
}

await validarSkillsIncorporadas(caminhoBinario);
criarArchive();
await registrarSaidas();

process.stdout.write(`Executável validado: ${caminhoBinario}\n`);
process.stdout.write(`Archive: ${caminhoArchive}\n`);

/**
 * Incorpora cada arquivo das skills distribuídas pelo pacote.
 */
async function coletarAssetsSkills() {
  const raizSkills = join(raiz, ".codex", "skills");
  const arquivos = await listarArquivos(raizSkills);
  return Object.fromEntries(
    arquivos.map((arquivo) => [
      `skills/${relative(raizSkills, arquivo).split(sep).join("/")}`,
      arquivo,
    ]),
  );
}

/** Percorre uma árvore pequena sem depender de globs do shell. */
async function listarArquivos(caminho) {
  const entradas = await readdir(caminho, { withFileTypes: true });
  const arquivos = [];
  for (const entrada of entradas) {
    const filho = join(caminho, entrada.name);
    if (entrada.isDirectory()) {
      arquivos.push(...(await listarArquivos(filho)));
    } else if (entrada.isFile()) {
      arquivos.push(filho);
    }
  }
  return arquivos.sort();
}

/**
 * Confirma que o SEA consegue ler e instalar as skills incorporadas.
 */
async function validarSkillsIncorporadas(executavel) {
  const pastaTemporaria = await mkdtemp(join(tmpdir(), "clickupfy-sea-"));
  try {
    const saida = execFileSync(
      executavel,
      [
        "agent",
        "skill",
        "install",
        "clickupfy-release",
        "--target",
        join(pastaTemporaria, "skills"),
      ],
      { encoding: "utf8" },
    );
    if (!saida.includes("clickupfy-release")) {
      throw new Error("O executável não confirmou a instalação da skill.");
    }
    const skill = await readFile(
      join(pastaTemporaria, "skills", "clickupfy-release", "SKILL.md"),
      "utf8",
    );
    if (!skill.includes("name: clickupfy-release")) {
      throw new Error("A skill incorporada não foi gravada corretamente.");
    }
  } finally {
    await rm(pastaTemporaria, { recursive: true, force: true });
  }
}

/** Empacota o binário preservando permissão no Unix e usando ZIP no Windows. */
function criarArchive() {
  const argumentos =
    process.platform === "win32"
      ? ["-a", "-cf", caminhoArchive, "-C", pastaArtefato, nomeBinario]
      : ["-czf", caminhoArchive, "-C", pastaArtefato, nomeBinario];
  execFileSync("tar", argumentos, { stdio: "inherit" });
}

/** Expõe caminhos estáveis para os passos seguintes do GitHub Actions. */
async function registrarSaidas() {
  if (!process.env.GITHUB_OUTPUT) return;
  await appendFile(
    process.env.GITHUB_OUTPUT,
    [
      `artifact_name=${nomeArtefato}`,
      `archive_path=${caminhoArchive}`,
      `archive_file=${basename(caminhoArchive)}`,
      "",
    ].join("\n"),
    "utf8",
  );
}

/** Converte nomes internos do Node para os nomes publicados na release. */
function nomePlataforma(valor) {
  if (valor === "win32") return "windows";
  if (valor === "darwin") return "macos";
  if (valor === "linux") return "linux";
  throw new Error(`Plataforma não suportada para executável: ${valor}.`);
}
