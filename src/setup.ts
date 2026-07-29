/**
 * Fluxo interativo e não interativo de cadastro de perfis do ClickUp.
 */

import { input, password, select } from "@inquirer/prompts";
import { ClickUpClient, type ClickUpWorkspace } from "./clickup.js";
import {
  caminhoConfiguracao,
  lerConfiguracao,
  normalizarIdentificador,
  salvarConfiguracao,
  type Account,
} from "./config.js";
import { CliError } from "./errors.js";

export interface SetupOptions {
  apiKey?: string;
  token?: string;
  name?: string;
  workspace?: string;
  nonInteractive?: boolean;
}

/**
 * Valida a API key, seleciona um workspace autorizado e atualiza o perfil sem
 * apagar os demais cadastros do usuário.
 */
export async function executarSetup(
  options: SetupOptions,
): Promise<{ accountId: string; account: Account; path: string }> {
  const interativo =
    !options.nonInteractive && Boolean(process.stdin.isTTY && process.stderr.isTTY);
  const apiKey =
    options.apiKey ??
    options.token ??
    (interativo
      ? await password({
          message: "API key pessoal do ClickUp:",
          mask: "•",
          validate: (valor) => valor.trim().length > 0 || "Informe a API key.",
        })
      : undefined);

  if (!apiKey) {
    throw new CliError(
      "Informe `--api-key <chave>` ao executar setup sem terminal interativo.",
    );
  }

  process.stderr.write("Validando a API key no ClickUp…\n");
  const client = new ClickUpClient(apiKey);
  const [user, workspaces] = await Promise.all([
    client.obterUsuario(),
    client.listarWorkspaces(),
  ]);

  if (workspaces.length === 0) {
    throw new CliError("Essa API key não possui workspaces autorizados.");
  }

  const workspace = await escolherWorkspace(workspaces, options.workspace, interativo);
  const sugestaoNome =
    user.username ?? user.email?.split("@")[0] ?? workspace.name ?? "clickup";
  const nome =
    options.name ??
    (interativo
      ? await input({
          message: "Nome local do perfil:",
          default: sugestaoNome,
          validate: (valor) => valor.trim().length > 0 || "Informe um nome.",
        })
      : sugestaoNome);
  const accountId = normalizarIdentificador(nome);
  const configuracao = await lerConfiguracao(true);
  const existente = configuracao.accounts[accountId];
  const agora = new Date().toISOString();
  const account: Account = {
    name: nome.trim(),
    apiKey,
    user: {
      id: user.id,
      ...(user.username ? { username: user.username } : {}),
      ...(user.email ? { email: user.email } : {}),
    },
    workspace: {
      id: workspace.id,
      name: workspace.name,
    },
    createdAt: existente?.createdAt ?? agora,
    updatedAt: agora,
  };

  configuracao.accounts[accountId] = account;
  configuracao.activeAccount = accountId;
  await salvarConfiguracao(configuracao);

  return { accountId, account, path: caminhoConfiguracao() };
}

async function escolherWorkspace(
  workspaces: ClickUpWorkspace[],
  workspaceId: string | undefined,
  interativo: boolean,
): Promise<ClickUpWorkspace> {
  if (workspaceId) {
    const encontrado = workspaces.find((item) => item.id === workspaceId);
    if (!encontrado) {
      throw new CliError(
        `O workspace "${workspaceId}" não está autorizado para essa API key.`,
      );
    }
    return encontrado;
  }

  const unico = workspaces[0];
  if (workspaces.length === 1 && unico) return unico;

  if (!interativo) {
    throw new CliError(
      "A API key acessa mais de um workspace. Informe `--workspace <id>`.",
    );
  }

  const selecionado = await select({
    message: "Workspace associado ao perfil:",
    choices: workspaces.map((workspace) => ({
      name: `${workspace.name} (${workspace.id})`,
      value: workspace.id,
    })),
  });
  const workspace = workspaces.find((item) => item.id === selecionado);
  if (!workspace) throw new CliError("O workspace selecionado não foi encontrado.");
  return workspace;
}
