/**
 * Testes do diagnóstico local do setup e dos arquivos de agentes.
 */

import { mkdir, mkdtemp } from "node:fs/promises";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { afterEach, describe, expect, it } from "vitest";
import {
  configurarCodexProjeto,
  configurarMcpProjeto,
} from "../src/agent-assets.js";
import { executarDoctor } from "../src/doctor.js";
import {
  criarConfiguracaoVazia,
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

describe("clickupfy doctor", () => {
  it("confirma o JSON global e os arquivos MCP sem expor a API key", async () => {
    const pasta = await mkdtemp(join(tmpdir(), "clickupfy-doctor-"));
    const caminho = join(pasta, "clickupfy", "config.json");
    process.env.PROMOVAWEB_CLICKUPFY_CONFIG = caminho;
    const agora = new Date().toISOString();
    const configuracao = criarConfiguracaoVazia();
    configuracao.accounts.dev = {
      name: "Dev",
      apiKey: "pk_secreta_do_teste",
      user: { id: 1, username: "luiz" },
      workspace: { id: "123", name: "Produto" },
      createdAt: agora,
      updatedAt: agora,
    };
    configuracao.activeAccount = "dev";
    await salvarConfiguracao(configuracao);

    await configurarMcpProjeto({
      path: join(pasta, ".mcp.json"),
      account: "dev",
      space: "space-1",
      list: "list-1",
    });
    await configurarCodexProjeto({
      path: join(pasta, ".codex", "config.toml"),
      account: "dev",
      space: "space-1",
      list: "list-1",
    });

    const resultado = await executarDoctor(pasta);
    const texto = JSON.stringify(resultado);

    expect(resultado.ok).toBe(true);
    expect(resultado.checks.some((check) => check.id === "config-schema")).toBe(
      true,
    );
    expect(resultado.checks.filter((check) => check.id === "mcp-server")).toHaveLength(
      2,
    );
    expect(texto).not.toContain("pk_secreta_do_teste");
  });

  it("identifica setup ausente sem lançar uma exceção", async () => {
    const pasta = await mkdtemp(join(tmpdir(), "clickupfy-doctor-empty-"));
    const caminho = join(pasta, "clickupfy", "config.json");
    process.env.PROMOVAWEB_CLICKUPFY_CONFIG = caminho;
    await mkdir(join(pasta, ".codex"), { recursive: true });

    const resultado = await executarDoctor(pasta);

    expect(resultado.ok).toBe(false);
    expect(
      resultado.checks.find((check) => check.id === "config-file"),
    ).toMatchObject({ estado: "error" });
  });
});
