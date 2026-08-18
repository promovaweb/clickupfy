/**
 * Instalação das skills e geração da configuração MCP para agentes locais.
 */

import { execFile } from "node:child_process";
import { mkdir, readFile, writeFile } from "node:fs/promises";
import { dirname, join, resolve } from "node:path";
import { getAsset, isSea } from "node:sea";
import { fileURLToPath } from "node:url";
import { parse as parseToml, stringify as stringifyToml } from "smol-toml";
import { promisify } from "node:util";
import { CliError } from "./errors.js";

export const SKILL_NAMES = [
  "clickupfy-dev",
  "clickup-issue-create",
  "clickup-issue-implement",
  "clickupfy-release",
] as const;
export type SkillName = (typeof SKILL_NAMES)[number];

const MCP_SERVER_NAME = "promovaweb-clickupfy";
const SKILLS_SOURCE = "promovaweb/clickupfy";
const execFileAsync = promisify(execFile);

export interface SkillGerenciada {
  name: string;
  path: string;
  scope: "project" | "global";
  agents: string[];
  source?: string | null;
}

export interface OpcoesSkillsCli {
  command?: string;
  args?: string[];
  cwd?: string;
  env?: NodeJS.ProcessEnv;
}

interface OpcoesMcpProjeto {
  path?: string;
  account: string;
  workspace?: string;
  space: string;
  folder?: string;
  list: string;
  sprintFolder?: string;
}

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
 * Instala uma ou todas as skills pelo gerenciador oficial `npx skills add`.
 *
 * O ClickUpfy mantém este wrapper para oferecer uma entrada única no CLI, mas
 * a fonte, o lockfile e os caminhos de instalação ficam sob responsabilidade
 * do gerenciador de skills.
 */
export async function instalarSkills(options: {
  names?: SkillName[];
  global?: boolean;
  /** Mantido apenas para emitir uma mensagem de migração clara. */
  target?: string;
  force?: boolean;
  skillsCli?: OpcoesSkillsCli;
}): Promise<string[]> {
  if (options.target) {
    throw new CliError(
      "--target não é compatível com o gerenciador `skills`. Use o projeto atual ou --global.",
    );
  }

  const names = options.names ?? [...SKILL_NAMES];
  const args = [
    "add",
    SKILLS_SOURCE,
    "--yes",
    "--copy",
    "--agent",
    "codex",
    ...names.flatMap((name) => ["--skill", name]),
    ...(options.global ? ["--global"] : []),
  ];

  await executarSkillsCli(args, options.skillsCli);
  const instaladas = await listarSkillsGerenciadas({
    names,
    ...(options.global ? { global: true } : {}),
    ...(options.skillsCli ? { skillsCli: options.skillsCli } : {}),
  });

  const ausentes = names.filter(
    (name) => !instaladas.some((skill) => skill.name === name),
  );
  if (ausentes.length > 0) {
    throw new CliError(
      `O gerenciador "skills add" terminou sem registrar: ${ausentes.join(", ")}.`,
    );
  }

  return instaladas.map((skill) => skill.path);
}

/** Lista as skills registradas pelo gerenciador oficial. */
export async function listarSkillsGerenciadas(options: {
  global?: boolean;
  names?: readonly string[];
  skillsCli?: OpcoesSkillsCli;
} = {}): Promise<SkillGerenciada[]> {
  const args = ["list", "--json", ...(options.global ? ["--global"] : [])];
  const { stdout } = await executarSkillsCli(args, options.skillsCli);
  let valor: unknown;
  try {
    valor = JSON.parse(stdout);
  } catch (error) {
    throw new CliError("O comando `skills list --json` não retornou JSON válido.", 1, {
      cause: error,
    });
  }

  if (!Array.isArray(valor)) {
    throw new CliError("O comando `skills list --json` retornou uma estrutura inválida.");
  }

  const nomes = options.names ? new Set(options.names) : undefined;
  return valor.filter(isSkillGerenciada).filter((skill) =>
    nomes ? nomes.has(skill.name) : true,
  );
}

/** Executa o binário externo sem expor variáveis sensíveis na mensagem de erro. */
async function executarSkillsCli(
  args: string[],
  options: OpcoesSkillsCli = {},
): Promise<{ stdout: string; stderr: string }> {
  const command = options.command ?? "npx";
  const commandArgs = options.command
    ? [...(options.args ?? []), ...args]
    : ["--yes", "skills", ...(options.args ?? []), ...args];
  try {
    return await execFileAsync(command, commandArgs, {
      cwd: options.cwd ?? process.cwd(),
      env: { ...process.env, ...options.env },
      maxBuffer: 4 * 1024 * 1024,
    });
  } catch (error) {
    const codigo = error instanceof Error && "code" in error ? error.code : undefined;
    if (codigo === "ENOENT") {
      throw new CliError(
        "O comando `npx` não foi encontrado. Instale Node.js para usar `npx skills`.",
        1,
        { cause: error },
      );
    }
    const mensagem = error instanceof Error ? error.message.split("\n")[0] : "falha desconhecida";
    throw new CliError(`O comando "skills" falhou: ${mensagem}`, 1, {
      cause: error,
    });
  }
}

function isSkillGerenciada(valor: unknown): valor is SkillGerenciada {
  if (!valor || typeof valor !== "object") return false;
  const skill = valor as Record<string, unknown>;
  return (
    typeof skill.name === "string" &&
    typeof skill.path === "string" &&
    (skill.scope === "project" || skill.scope === "global") &&
    Array.isArray(skill.agents)
  );
}

/** Retorna o conteúdo da skill para inspeção sem instalá-la. */
export async function lerSkill(name: SkillName): Promise<string> {
  if (isSea()) {
    return getAsset(chaveAssetSkill(name, "SKILL.md"), "utf8");
  }
  return readFile(join(caminhoSkillsEmpacotadas(), name, "SKILL.md"), "utf8");
}

/** Mantém a mesma chave usada pelo build ao incorporar uma skill. */
function chaveAssetSkill(name: SkillName, arquivo: string): string {
  return `skills/${name}/${arquivo}`;
}

/**
 * Mescla no `.mcp.json` um servidor preso ao perfil e à hierarquia do projeto,
 * sem remover servidores já configurados.
 */
export async function configurarMcpProjeto(
  options: OpcoesMcpProjeto,
): Promise<string> {
  const caminho = resolve(options.path ?? join(process.cwd(), ".mcp.json"));
  let configuracao: Record<string, unknown> = {};

  try {
    configuracao = JSON.parse(await readFile(caminho, "utf8")) as Record<
      string,
      unknown
    >;
  } catch (error) {
    if (!(
      error instanceof Error &&
      "code" in error &&
      error.code === "ENOENT"
    )) {
      throw new CliError(`Não foi possível ler ${caminho}.`, 1, {
        cause: error,
      });
    }
  }

  const servidores =
    configuracao.mcpServers &&
    typeof configuracao.mcpServers === "object" &&
    !Array.isArray(configuracao.mcpServers)
      ? (configuracao.mcpServers as Record<string, unknown>)
      : {};
  servidores[MCP_SERVER_NAME] = criarServidorMcp(options);
  configuracao.mcpServers = servidores;

  await mkdir(dirname(caminho), { recursive: true });
  await writeFile(
    caminho,
    `${JSON.stringify(configuracao, null, 2)}\n`,
    "utf8",
  );
  return caminho;
}

/**
 * Mescla o mesmo servidor MCP no `config.toml` local usado pelo Codex.
 *
 * O parser mantém todas as chaves existentes e substitui somente a entrada
 * gerenciada do ClickUpfy. Um TOML inválido é recusado para evitar substituir
 * uma configuração que o Codex não conseguiria ler.
 */
export async function configurarCodexProjeto(
  options: OpcoesMcpProjeto,
): Promise<string> {
  const caminho = resolve(
    options.path ?? join(process.cwd(), ".codex", "config.toml"),
  );
  let configuracao: Record<string, unknown> = {};

  try {
    configuracao = parseToml(await readFile(caminho, "utf8"));
  } catch (error) {
    if (!(
      error instanceof Error &&
      "code" in error &&
      error.code === "ENOENT"
    )) {
      throw new CliError(`Não foi possível ler ${caminho}.`, 1, {
        cause: error,
      });
    }
  }

  const servidores = configuracao.mcp_servers;
  if (
    servidores !== undefined &&
    (typeof servidores !== "object" ||
      servidores === null ||
      Array.isArray(servidores))
  ) {
    throw new CliError(
      `A configuração Codex em ${caminho} possui mcp_servers inválido.`,
    );
  }

  configuracao.mcp_servers = {
    ...(servidores as Record<string, unknown> | undefined),
    [MCP_SERVER_NAME]: criarServidorMcp(options),
  };

  await mkdir(dirname(caminho), { recursive: true });
  await writeFile(caminho, `${stringifyToml(configuracao)}\n`, "utf8");
  return caminho;
}

/** Monta os argumentos comuns ao wrapper JSON e à entrada TOML do Codex. */
function criarServidorMcp(options: OpcoesMcpProjeto): {
  command: string;
  args: string[];
} {
  return {
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
}
