/**
 * Diagnóstico local da configuração global e dos arquivos MCP do projeto.
 */

import { readFile, stat } from "node:fs/promises";
import { dirname, join } from "node:path";
import { parse as parseToml } from "smol-toml";
import {
  listarSkillsGerenciadas,
  SKILL_NAMES,
  type OpcoesSkillsCli,
  type SkillGerenciada,
} from "./agent-assets.js";
import {
  caminhoConfiguracao,
  configuracaoSchema,
  type Configuracao,
} from "./config.js";

type EstadoDiagnostico = "ok" | "warning" | "error" | "skipped";

export interface VerificacaoDoctor {
  id: string;
  estado: EstadoDiagnostico;
  mensagem: string;
  caminho?: string;
}

export interface ResultadoDoctor {
  ok: boolean;
  config: string;
  checks: VerificacaoDoctor[];
}

export interface OpcoesDoctor {
  skillsCli?: OpcoesSkillsCli;
}

/**
 * Verifica a configuração local sem fazer chamadas à API do ClickUp.
 *
 * O diagnóstico não retorna o conteúdo do JSON nem valores de accounts. Ele
 * confirma somente existência, permissões, schema e referências necessárias
 * para o servidor MCP do projeto.
 */
export async function executarDoctor(
  diretorioProjeto = process.cwd(),
  options: OpcoesDoctor = {},
): Promise<ResultadoDoctor> {
  const config = caminhoConfiguracao();
  const checks: VerificacaoDoctor[] = [];
  const configuracao = await verificarArquivoGlobal(config, checks);

  if (configuracao) verificarAccounts(configuracao, checks);
  await verificarArquivoMcp(join(diretorioProjeto, ".mcp.json"), checks);
  await verificarArquivoCodex(
    join(diretorioProjeto, ".codex", "config.toml"),
    checks,
  );
  await verificarSkills(diretorioProjeto, checks, options.skillsCli);

  return {
    ok: !checks.some((check) => check.estado === "error"),
    config,
    checks,
  };
}

/** Verifica o gerenciador externo, os escopos instalados e o idioma das skills. */
async function verificarSkills(
  diretorioProjeto: string,
  checks: VerificacaoDoctor[],
  skillsCli?: OpcoesSkillsCli,
): Promise<void> {
  let projeto: SkillGerenciada[];
  let global: SkillGerenciada[];
  try {
    [projeto, global] = await Promise.all([
      listarSkillsGerenciadas({ skillsCli: { ...skillsCli, cwd: diretorioProjeto } }),
      listarSkillsGerenciadas({
        global: true,
        ...(skillsCli ? { skillsCli } : {}),
      }),
    ]);
    checks.push({
      id: "skills-cli",
      estado: "ok",
      mensagem: "O gerenciador `skills` está disponível e responde em JSON.",
    });
  } catch (error) {
    checks.push({
      id: "skills-cli",
      estado: "warning",
      mensagem:
        error instanceof Error
          ? error.message
          : "O gerenciador `skills` não pôde ser verificado.",
    });
    return;
  }

  await verificarEscopoSkills("project", projeto, checks);
  await verificarEscopoSkills("global", global, checks);
}

async function verificarEscopoSkills(
  escopo: "project" | "global",
  skills: SkillGerenciada[],
  checks: VerificacaoDoctor[],
): Promise<void> {
  const esperadas = SKILL_NAMES.filter((name) =>
    skills.some((skill) => skill.name === name),
  );
  const ausentes = SKILL_NAMES.filter((name) => !esperadas.includes(name));
  const label = escopo === "project" ? "projeto" : "global";

  checks.push({
    id: `skills-${escopo}`,
    estado: ausentes.length === 0 ? "ok" : "warning",
    mensagem:
      ausentes.length === 0
        ? `As ${SKILL_NAMES.length} skills do ClickUpfy estão instaladas no escopo ${label}.`
        : `Faltam skills do ClickUpfy no escopo ${label}: ${ausentes.join(", ")}. Execute 'clickupfy agent skill install${escopo === "global" ? " --global" : ""}'.`,
  });

  await Promise.all(
    skills
      .filter((item) => SKILL_NAMES.some((name) => name === item.name))
      .map((skill) => verificarIdiomaSkill(skill, checks)),
  );
}

async function verificarIdiomaSkill(
  skill: SkillGerenciada,
  checks: VerificacaoDoctor[],
): Promise<void> {
  const arquivos = [join(skill.path, "SKILL.md"), join(skill.path, "agents", "openai.yaml")];
  try {
    const conteudos = await Promise.all(arquivos.map((caminho) => readFile(caminho, "utf8")));
    const ptBr = conteudos.every(skillEstaEmPtBr);
    checks.push({
      id: `skill-language-${skill.name}`,
      estado: ptBr ? "ok" : "error",
      mensagem: ptBr
        ? `A skill ${skill.name} está documentada em português do Brasil.`
        : `A skill ${skill.name} possui conteúdo fora do padrão de português do Brasil.`,
      caminho: skill.path,
    });
  } catch {
    checks.push({
      id: `skill-language-${skill.name}`,
      estado: "error",
      mensagem: `A skill ${skill.name} não possui todos os arquivos esperados.`,
      caminho: skill.path,
    });
  }
}

/** Heurística pequena para detectar regressões de idioma sem traduzir comandos. */
export function skillEstaEmPtBr(conteudo: string): boolean {
  const marcadores = [
    " de ",
    " para ",
    " com ",
    " que ",
    " do ",
    " da ",
    " e ",
    " o ",
    " a ",
    " uma ",
  ];
  const ocorrencias = marcadores.filter((marcador) => conteudo.toLowerCase().includes(marcador));
  const padroesIngleses = /^(use the|when you|this skill|install the|manage the)\b/im;
  return ocorrencias.length >= 3 && !padroesIngleses.test(conteudo);
}

/** Verifica diretório, arquivo, permissões e schema da configuração global. */
async function verificarArquivoGlobal(
  caminho: string,
  checks: VerificacaoDoctor[],
): Promise<Configuracao | undefined> {
  const diretorio = dirname(caminho);
  const override = Boolean(process.env.PROMOVAWEB_CLICKUPFY_CONFIG);
  checks.push({
    id: "config-path",
    estado: override ? "warning" : "ok",
    mensagem: override
      ? "PROMOVAWEB_CLICKUPFY_CONFIG substitui o caminho padrão."
      : "O caminho padrão ~/clickupfy/config.json está ativo.",
    caminho,
  });

  const informacaoDiretorio = await obterStat(diretorio);
  if (!informacaoDiretorio) {
    checks.push({
      id: "config-directory",
      estado: "error",
      mensagem: "O diretório da configuração não existe. Execute `clickupfy setup`.",
      caminho: diretorio,
    });
  } else if (!informacaoDiretorio.isDirectory()) {
    checks.push({
      id: "config-directory",
      estado: "error",
      mensagem: "O caminho da configuração não aponta para um diretório.",
      caminho: diretorio,
    });
  } else {
    checks.push({
      id: "config-directory",
      estado: (informacaoDiretorio.mode & 0o777) === 0o700 ? "ok" : "error",
      mensagem:
        (informacaoDiretorio.mode & 0o777) === 0o700
          ? "O diretório da configuração usa permissão 0700."
          : "O diretório da configuração precisa usar permissão 0700.",
      caminho: diretorio,
    });
  }

  const informacaoArquivo = await obterStat(caminho);
  if (!informacaoArquivo) {
    checks.push({
      id: "config-file",
      estado: "error",
      mensagem: "O arquivo não existe. Execute `clickupfy setup`.",
      caminho,
    });
    return undefined;
  }

  if (!informacaoArquivo.isFile()) {
    checks.push({
      id: "config-file",
      estado: "error",
      mensagem: "O caminho da configuração não aponta para um arquivo.",
      caminho,
    });
    return undefined;
  }

  const permissaoArquivo = informacaoArquivo.mode & 0o777;
  checks.push({
    id: "config-permissions",
    estado: permissaoArquivo === 0o600 ? "ok" : "error",
    mensagem:
      permissaoArquivo === 0o600
        ? "O arquivo de configuração usa permissão 0600."
        : "O arquivo de configuração precisa usar permissão 0600.",
    caminho,
  });

  checks.push({
    id: "config-file",
    estado: "ok",
    mensagem: "O arquivo de configuração foi encontrado.",
    caminho,
  });

  let conteudo: string;
  try {
    conteudo = await readFile(caminho, "utf8");
  } catch {
    checks.push({
      id: "config-json",
      estado: "error",
      mensagem: "O arquivo de configuração não pôde ser lido.",
      caminho,
    });
    return undefined;
  }

  let valor: unknown;
  try {
    valor = JSON.parse(conteudo);
  } catch {
    checks.push({
      id: "config-json",
      estado: "error",
      mensagem: "O arquivo de configuração não contém JSON válido.",
      caminho,
    });
    return undefined;
  }

  const resultado = configuracaoSchema.safeParse(valor);
  if (!resultado.success) {
    checks.push({
      id: "config-schema",
      estado: "error",
      mensagem: "O JSON não corresponde ao schema de configuração do ClickUpfy.",
      caminho,
    });
    return undefined;
  }

  checks.push({
    id: "config-schema",
    estado: "ok",
    mensagem: "O JSON corresponde ao schema de configuração do ClickUpfy.",
    caminho,
  });
  return resultado.data;
}

/** Confirma que existe account e que o account ativo aponta para um registro. */
function verificarAccounts(
  configuracao: Configuracao,
  checks: VerificacaoDoctor[],
): void {
  const quantidade = Object.keys(configuracao.accounts).length;
  checks.push({
    id: "accounts",
    estado: quantidade > 0 ? "ok" : "error",
    mensagem:
      quantidade > 0
        ? `${quantidade} account(s) local(is) configurado(s).`
        : "Nenhum account local configurado. Execute `clickupfy setup`.",
  });

  const ativo = configuracao.activeAccount;
  const ativoValido = Boolean(ativo && configuracao.accounts[ativo]);
  checks.push({
    id: "active-account",
    estado: ativoValido ? "ok" : "error",
    mensagem: ativoValido
      ? `O account ativo está configurado: ${ativo}.`
      : "O account ativo não aponta para um perfil configurado.",
  });
}

/** Verifica o arquivo JSON opcional usado por clientes MCP compatíveis. */
async function verificarArquivoMcp(
  caminho: string,
  checks: VerificacaoDoctor[],
): Promise<void> {
  const conteudo = await lerArquivoOpcional(caminho, checks, "mcp-json");
  if (conteudo === undefined) return;

  try {
    const valor = JSON.parse(conteudo) as Record<string, unknown>;
    const servidores = valor.mcpServers;
    const servidor =
      servidores && typeof servidores === "object" && !Array.isArray(servidores)
        ? (servidores as Record<string, unknown>)["promovaweb-clickupfy"]
        : undefined;
    verificarServidorMcp(servidor, checks, caminho, "JSON");
  } catch {
    checks.push({
      id: "mcp-json-format",
      estado: "error",
      mensagem: "O .mcp.json não contém JSON válido.",
      caminho,
    });
  }
}

/** Verifica o arquivo TOML opcional usado pelo Codex. */
async function verificarArquivoCodex(
  caminho: string,
  checks: VerificacaoDoctor[],
): Promise<void> {
  const conteudo = await lerArquivoOpcional(caminho, checks, "codex-config");
  if (conteudo === undefined) return;

  try {
    const valor = parseToml(conteudo);
    const servidores = valor.mcp_servers;
    const servidor =
      servidores && typeof servidores === "object" && !Array.isArray(servidores)
        ? (servidores as Record<string, unknown>)["promovaweb-clickupfy"]
        : undefined;
    verificarServidorMcp(servidor, checks, caminho, "TOML");
  } catch {
    checks.push({
      id: "codex-config-format",
      estado: "error",
      mensagem: "O .codex/config.toml não contém TOML válido.",
      caminho,
    });
  }
}

/** Registra a presença e a estrutura mínima do servidor MCP gerenciado. */
function verificarServidorMcp(
  servidor: unknown,
  checks: VerificacaoDoctor[],
  caminho: string,
  formato: string,
): void {
  if (!servidor) {
    checks.push({
      id: "mcp-server",
      estado: "warning",
      mensagem: `O servidor promovaweb-clickupfy não está configurado no arquivo ${formato}. Execute 'clickupfy agent init'.`,
      caminho,
    });
    return;
  }

  const registro = servidor as { command?: unknown; args?: unknown };
  const argumentos = Array.isArray(registro.args) ? registro.args : [];
  const valido =
    registro.command === "clickupfy" &&
    argumentos.includes("mcp") &&
    argumentos.includes("serve") &&
    argumentos.includes("--account") &&
    argumentos.includes("--space") &&
    argumentos.includes("--list");
  checks.push({
    id: "mcp-server",
    estado: valido ? "ok" : "error",
    mensagem: valido
      ? `O servidor promovaweb-clickupfy está configurado no arquivo ${formato}.`
      : `O servidor promovaweb-clickupfy no arquivo ${formato} não possui command, mcp, serve, account, space e list válidos.`,
    caminho,
  });
}

/** Lê um arquivo opcional e transforma ausência em uma verificação ignorada. */
async function lerArquivoOpcional(
  caminho: string,
  checks: VerificacaoDoctor[],
  id: string,
): Promise<string | undefined> {
  try {
    const conteudo = await readFile(caminho, "utf8");
    checks.push({
      id,
      estado: "ok",
      mensagem: "Arquivo de configuração do projeto encontrado.",
      caminho,
    });
    return conteudo;
  } catch (error) {
    if (codigoErro(error) === "ENOENT") {
      checks.push({
        id,
        estado: "skipped",
        mensagem: "Arquivo opcional não encontrado neste projeto.",
        caminho,
      });
      return undefined;
    }

    checks.push({
      id,
      estado: "error",
      mensagem: "Arquivo de configuração do projeto não pôde ser lido.",
      caminho,
    });
    return undefined;
  }
}

/** Retorna metadados de um caminho sem transformar ausência em exceção. */
async function obterStat(caminho: string) {
  try {
    return await stat(caminho);
  } catch {
    return undefined;
  }
}

/** Lê o código de erro de uma falha de filesystem sem expor detalhes. */
function codigoErro(error: unknown): string | undefined {
  return error instanceof Error && "code" in error
    ? String(error.code)
    : undefined;
}
