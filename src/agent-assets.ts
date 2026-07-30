/**
 * Instalação das skills e geração da configuração MCP para agentes locais.
 */

import { access, cp, mkdir, readFile, writeFile } from "node:fs/promises";
import { homedir } from "node:os";
import { dirname, join, resolve } from "node:path";
import { getAsset, isSea } from "node:sea";
import { fileURLToPath } from "node:url";
import { CliError } from "./errors.js";

export const SKILL_NAMES = [
  "clickupfy-dev",
  "clickup-issue-create",
  "clickup-issue-implement",
  "clickupfy-release",
] as const;
export type SkillName = (typeof SKILL_NAMES)[number];

const SKILL_FILES: Record<SkillName, readonly string[]> = {
  "clickupfy-dev": ["SKILL.md", "agents/openai.yaml"],
  "clickup-issue-create": ["SKILL.md", "agents/openai.yaml"],
  "clickup-issue-implement": ["SKILL.md", "agents/openai.yaml"],
  "clickupfy-release": ["SKILL.md", "agents/openai.yaml"],
};

/**
 * Localiza as skills no código-fonte ou no pacote npm.
 *
 * O executável standalone lê esses arquivos dos assets incorporados e não usa
 * um caminho no sistema de arquivos.
 */
export function caminhoSkillsEmpacotadas(): string {
  if (isSea()) {
    throw new CliError(
      "As skills estão incorporadas ao executável standalone.",
    );
  }
  return fileURLToPath(new URL("../.codex/skills", import.meta.url));
}

/**
 * Copia uma ou todas as skills para o projeto atual ou para a pasta global do
 * Codex. Um destino existente só é atualizado com `force`.
 */
export async function instalarSkills(options: {
  names?: SkillName[];
  global?: boolean;
  target?: string;
  force?: boolean;
}): Promise<string[]> {
  const baseDestino = options.target
    ? resolve(options.target)
    : options.global
      ? join(homedir(), ".codex", "skills")
      : join(process.cwd(), ".codex", "skills");
  const names = options.names ?? [...SKILL_NAMES];
  const instaladas: string[] = [];

  await mkdir(baseDestino, { recursive: true });
  for (const name of names) {
    const destino = join(baseDestino, name);

    if ((await existe(destino)) && !options.force) {
      throw new CliError(
        `A skill "${name}" já existe em ${destino}. Use --force para atualizá-la.`,
      );
    }

    if (isSea()) {
      await instalarSkillIncorporada(name, destino);
    } else {
      await cp(join(caminhoSkillsEmpacotadas(), name), destino, {
        recursive: true,
        force: Boolean(options.force),
        errorOnExist: !options.force,
      });
    }
    instaladas.push(destino);
  }

  return instaladas;
}

/** Retorna o conteúdo da skill para inspeção sem instalá-la. */
export async function lerSkill(name: SkillName): Promise<string> {
  if (isSea()) {
    return getAsset(chaveAssetSkill(name, "SKILL.md"), "utf8");
  }
  return readFile(join(caminhoSkillsEmpacotadas(), name, "SKILL.md"), "utf8");
}

/** Grava no destino todos os arquivos de uma skill incorporada ao SEA. */
async function instalarSkillIncorporada(
  name: SkillName,
  destino: string,
): Promise<void> {
  for (const arquivo of SKILL_FILES[name]) {
    const caminho = join(destino, arquivo);
    await mkdir(dirname(caminho), { recursive: true });
    await writeFile(
      caminho,
      Buffer.from(getAsset(chaveAssetSkill(name, arquivo))),
    );
  }
}

/** Mantém a mesma chave usada pelo build ao incorporar uma skill. */
function chaveAssetSkill(name: SkillName, arquivo: string): string {
  return `skills/${name}/${arquivo}`;
}

/**
 * Mescla no `.mcp.json` um servidor preso ao perfil e à hierarquia do projeto,
 * sem remover servidores já configurados.
 */
export async function configurarMcpProjeto(options: {
  path?: string;
  account: string;
  workspace?: string;
  space: string;
  folder?: string;
  list: string;
  sprintFolder?: string;
}): Promise<string> {
  const caminho = resolve(options.path ?? join(process.cwd(), ".mcp.json"));
  let configuracao: Record<string, unknown> = {};

  try {
    configuracao = JSON.parse(await readFile(caminho, "utf8")) as Record<
      string,
      unknown
    >;
  } catch (error) {
    if (!(error instanceof Error && "code" in error && error.code === "ENOENT")) {
      throw new CliError(`Não foi possível ler ${caminho}.`, 1, { cause: error });
    }
  }

  const servidores =
    configuracao.mcpServers &&
    typeof configuracao.mcpServers === "object" &&
    !Array.isArray(configuracao.mcpServers)
      ? (configuracao.mcpServers as Record<string, unknown>)
      : {};
  servidores["promovaweb-clickupfy"] = {
    command: "clickupfy",
    args: [
      "mcp",
      "serve",
      "--account",
      options.account,
      ...(options.workspace ? ["--workspace", options.workspace] : []),
      "--space",
      options.space,
      ...(options.folder ? ["--folder", options.folder] : []),
      "--list",
      options.list,
      ...(options.sprintFolder
        ? ["--sprint-folder", options.sprintFolder]
        : []),
    ],
  };
  configuracao.mcpServers = servidores;

  await mkdir(dirname(caminho), { recursive: true });
  await writeFile(caminho, `${JSON.stringify(configuracao, null, 2)}\n`, "utf8");
  return caminho;
}

async function existe(caminho: string): Promise<boolean> {
  try {
    await access(caminho);
    return true;
  } catch {
    return false;
  }
}
