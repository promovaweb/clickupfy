/**
 * Garante que o manual de referência acompanhe a superfície pública do CLI e
 * do MCP, com cinco exemplos em cada seção de comando ou ferramenta.
 */

import { readFile } from "node:fs/promises";
import { join, resolve } from "node:path";
import { describe, expect, it } from "vitest";

const root = resolve(import.meta.dirname, "..");
const docsRoot = join(root, "docs", "user");

/** Comandos públicos que exigem seção detalhada no manual do usuário. */
const cliCommands = [
  "clickupfy setup",
  "clickupfy status",
  "clickupfy account list",
  "clickupfy account show",
  "clickupfy account use",
  "clickupfy account remove",
  "clickupfy workspace list",
  "clickupfy workspace use",
  "clickupfy whoami",
  "clickupfy space list",
  "clickupfy folder list",
  "clickupfy list list",
  "clickupfy list get",
  "clickupfy sprint list",
  "clickupfy sprint current",
  "clickupfy sprint get",
  "clickupfy sprint tasks",
  "clickupfy sprint add-task",
  "clickupfy sprint remove-task",
  "clickupfy sprint set-points",
  "clickupfy task list",
  "clickupfy task get",
  "clickupfy task search",
  "clickupfy task create",
  "clickupfy task update",
  "clickupfy task delete",
  "clickupfy checklist create",
  "clickupfy checklist item-create",
  "clickupfy checklist set",
  "clickupfy comment list",
  "clickupfy comment create",
  "clickupfy time current",
  "clickupfy time start",
  "clickupfy time stop",
  "clickupfy doc list",
  "clickupfy doc get",
  "clickupfy doc create",
  "clickupfy doc page tree",
  "clickupfy doc page list",
  "clickupfy doc page get",
  "clickupfy doc page create",
  "clickupfy doc page update",
  "clickupfy agent skill list",
  "clickupfy agent skill show",
  "clickupfy agent skill install",
  "clickupfy agent init",
  "clickupfy mcp serve",
] as const;

/** Lê as referências acrescentadas ao manual, onde a cobertura é mantida. */
async function lerReferencias(): Promise<string> {
  const nomes = [
    "referencia-cli-perfis-hierarquia.md",
    "referencia-cli-tarefas.md",
    "referencia-cli-sprints.md",
    "referencia-cli-docs-agentes.md",
    "referencia-mcp-contexto-hierarquia.md",
    "referencia-mcp-trabalho.md",
    "referencia-mcp-docs-administracao.md",
  ];
  return Promise.all(
    nomes.map((nome) => readFile(join(docsRoot, nome), "utf8")),
  ).then((arquivos) => arquivos.join("\n\n"));
}

/** Extrai a seção Markdown iniciada pelo heading do comando ou ferramenta. */
function secao(source: string, nome: string): string {
  const padrao = "^### `" + escaparRegex(nome) + "(?:[ `])";
  const inicio = source.search(new RegExp(padrao, "m"));
  if (inicio < 0) return "";
  const restante = source.slice(inicio);
  const proximaSecao = restante.slice(4).search(/^### /m);
  return proximaSecao < 0 ? restante : restante.slice(0, proximaSecao + 4);
}

/** Escapa identificadores públicos para uso seguro em expressão regular. */
function escaparRegex(valor: string): string {
  return valor.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
}

/** Conta blocos de código, cada um tratado como um exemplo executável. */
function quantidadeExemplos(texto: string): number {
  return (texto.match(/^```(?:bash|json|text)$/gm) ?? []).length;
}

describe("cobertura do manual de referência", () => {
  it.each(cliCommands)("documenta %s com cinco exemplos", async (comando) => {
    const texto = secao(await lerReferencias(), comando);
    expect(texto, `Seção ausente para ${comando}`).not.toBe("");
    expect(texto, `Exemplos insuficientes para ${comando}`).toContain("Exemplos:");
    expect(quantidadeExemplos(texto), comando).toBeGreaterThanOrEqual(5);
  });

  it("documenta cada ferramenta registrada no servidor MCP", async () => {
    const [referencias, mcp] = await Promise.all([
      lerReferencias(),
      readFile(join(root, "src", "mcp.ts"), "utf8"),
    ]);
    const ferramentas = [
      ...new Set(
        [...mcp.matchAll(/server\.registerTool\(\s*"([^"]+)"/g)].map(
          (resultado) => resultado[1],
        ),
      ),
    ];

    expect(ferramentas.length).toBeGreaterThan(0);
    for (const ferramenta of ferramentas) {
      const texto = secao(referencias, ferramenta);
      expect(texto, `Seção ausente para ${ferramenta}`).not.toBe("");
      expect(texto, `Exemplos insuficientes para ${ferramenta}`).toContain(
        "Exemplos:",
      );
      expect(quantidadeExemplos(texto), ferramenta).toBeGreaterThanOrEqual(5);
    }
  });
});
