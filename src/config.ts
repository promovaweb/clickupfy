/**
 * Persistência e resolução da configuração multi-account do ClickUpfy.
 */

import { chmod, mkdir, readFile, rename, writeFile } from "node:fs/promises";
import { homedir } from "node:os";
import { dirname, join } from "node:path";
import { z } from "zod";
import { CliError } from "./errors.js";

const usuarioSchema = z.object({
  id: z.number().or(z.string()),
  username: z.string().optional(),
  email: z.string().optional(),
});

const workspaceSchema = z.object({
  id: z.string(),
  name: z.string(),
});

export const accountSchema = z.object({
  name: z.string().min(1),
  apiKey: z.string().min(1),
  user: usuarioSchema,
  workspace: workspaceSchema,
  createdAt: z.string(),
  updatedAt: z.string(),
});

export const configuracaoSchema = z.object({
  version: z.literal(1),
  activeAccount: z.string().nullable(),
  accounts: z.record(z.string(), accountSchema),
});

export type Account = z.infer<typeof accountSchema>;
export type Configuracao = z.infer<typeof configuracaoSchema>;

/** Cria a estrutura vazia usada na primeira configuração. */
export function criarConfiguracaoVazia(): Configuracao {
  return {
    version: 1,
    activeAccount: null,
    accounts: {},
  };
}

/**
 * Retorna o caminho canônico solicitado pelo produto.
 *
 * A variável de ambiente existe para testes isolados e automações, sem mudar o
 * comportamento padrão em `~/.promovaweb-clickupfy/config.json`.
 */
export function caminhoConfiguracao(): string {
  return (
    process.env.PROMOVAWEB_CLICKUPFY_CONFIG ??
    join(homedir(), ".promovaweb-clickupfy", "config.json")
  );
}

/**
 * Lê e valida a configuração. Quando `permitirAusente` estiver ativo, um
 * arquivo inexistente produz uma configuração vazia.
 */
export async function lerConfiguracao(
  permitirAusente = false,
): Promise<Configuracao> {
  const caminho = caminhoConfiguracao();

  try {
    const conteudo = await readFile(caminho, "utf8");
    return configuracaoSchema.parse(JSON.parse(conteudo));
  } catch (error) {
    if (
      permitirAusente &&
      error instanceof Error &&
      "code" in error &&
      error.code === "ENOENT"
    ) {
      return criarConfiguracaoVazia();
    }

    if (error instanceof z.ZodError || error instanceof SyntaxError) {
      throw new CliError(
        `A configuração em ${caminho} é inválida: ${error.message}`,
        1,
        { cause: error },
      );
    }

    if (
      error instanceof Error &&
      "code" in error &&
      error.code === "ENOENT"
    ) {
      throw new CliError(
        "Nenhum perfil configurado. Execute `clickupfy setup`.",
      );
    }

    throw error;
  }
}

/**
 * Grava a configuração de forma atômica e restringe suas permissões, pois o
 * JSON contém credenciais pessoais do ClickUp.
 */
export async function salvarConfiguracao(
  configuracao: Configuracao,
): Promise<void> {
  const validada = configuracaoSchema.parse(configuracao);
  const caminho = caminhoConfiguracao();
  const diretorio = dirname(caminho);
  const temporario = join(
    diretorio,
    `.config.${process.pid}.${Date.now()}.tmp`,
  );

  await mkdir(diretorio, { recursive: true, mode: 0o700 });
  await chmod(diretorio, 0o700);
  await writeFile(temporario, `${JSON.stringify(validada, null, 2)}\n`, {
    encoding: "utf8",
    mode: 0o600,
  });
  await rename(temporario, caminho);
  await chmod(caminho, 0o600);
}

/**
 * Normaliza um nome humano em um identificador estável de perfil.
 */
export function normalizarIdentificador(valor: string): string {
  const normalizado = valor
    .normalize("NFD")
    .replace(/\p{Diacritic}/gu, "")
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-|-$/g, "");

  if (!normalizado) {
    throw new CliError("Informe um nome de perfil com letras ou números.");
  }

  return normalizado;
}

/**
 * Resolve um perfil explícito ou o perfil ativo, sem expor a API key em erros.
 */
export function resolverAccount(
  configuracao: Configuracao,
  identificador?: string,
): { id: string; account: Account } {
  const id =
    identificador ??
    process.env.PROMOVAWEB_CLICKUPFY_ACCOUNT ??
    configuracao.activeAccount;

  if (!id) {
    throw new CliError(
      "Nenhum perfil ativo. Execute `clickupfy setup` ou `clickupfy account use <perfil>`.",
    );
  }

  const account = configuracao.accounts[id];
  if (!account) {
    throw new CliError(`O perfil "${id}" não existe na configuração.`);
  }

  return { id, account };
}

/** Mascara uma API key para diagnóstico local sem revelar a credencial. */
export function mascararApiKey(apiKey: string): string {
  if (apiKey.length <= 8) return "••••••••";
  return `${apiKey.slice(0, 4)}…${apiKey.slice(-4)}`;
}
