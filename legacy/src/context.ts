/**
 * Resolução compartilhada de perfil, workspace e cliente autenticado.
 */

import { ClickUpClient } from "./clickup.js";
import {
  lerConfiguracao,
  resolverAccount,
  type Configuracao,
  type Account,
} from "./config.js";

export interface ContextoClickUp {
  configuracao: Configuracao;
  accountId: string;
  account: Account;
  client: ClickUpClient;
}

/**
 * Monta o contexto de uma operação. A API key fica encapsulada no cliente e
 * não é devolvida por comandos de status ou ferramentas MCP.
 */
export async function criarContexto(
  accountId?: string,
): Promise<ContextoClickUp> {
  const configuracao = await lerConfiguracao();
  const resolvida = resolverAccount(configuracao, accountId);

  return {
    configuracao,
    accountId: resolvida.id,
    account: resolvida.account,
    client: new ClickUpClient(resolvida.account.apiKey),
  };
}
