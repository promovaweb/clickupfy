/**
 * Testes da persistência segura e da resolução multi-account.
 */

import { mkdtemp, stat } from "node:fs/promises";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { afterEach, describe, expect, it } from "vitest";
import {
  criarConfiguracaoVazia,
  lerConfiguracao,
  resolverAccount,
  salvarConfiguracao,
} from "../src/config.js";

const originalConfig = process.env.PROMOVAWEB_CLICKUPFY_CONFIG;

afterEach(() => {
  if (originalConfig === undefined) {
    delete process.env.PROMOVAWEB_CLICKUPFY_CONFIG;
  } else {
    process.env.PROMOVAWEB_CLICKUPFY_CONFIG = originalConfig;
  }
});

describe("configuração", () => {
  it("grava o JSON com permissão 0600 e preserva múltiplas accounts", async () => {
    const pasta = await mkdtemp(join(tmpdir(), "clickupfy-config-"));
    const caminho = join(pasta, "dados", "config.json");
    process.env.PROMOVAWEB_CLICKUPFY_CONFIG = caminho;
    const config = criarConfiguracaoVazia();
    const agora = new Date().toISOString();
    config.accounts.dev = {
      name: "Dev",
      apiKey: "pk_teste",
      user: { id: 1, username: "luiz" },
      workspace: { id: "123", name: "Produto" },
      createdAt: agora,
      updatedAt: agora,
    };
    config.accounts.consultoria = {
      name: "Consultoria",
      apiKey: "pk_teste_2",
      user: { id: 2, username: "equipe" },
      workspace: { id: "456", name: "Clientes" },
      createdAt: agora,
      updatedAt: agora,
    };
    config.activeAccount = "dev";

    await salvarConfiguracao(config);

    expect(await lerConfiguracao()).toEqual(config);
    expect((await stat(caminho)).mode & 0o777).toBe(0o600);
    expect(resolverAccount(config).id).toBe("dev");
    expect(resolverAccount(config, "consultoria").account.workspace.id).toBe("456");
  });
});

