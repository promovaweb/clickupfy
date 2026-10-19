/** Configuração guiada de servidores MCP nomeados no diretório do projeto. */
import { checkbox, input, select } from "@inquirer/prompts";
import { mkdir, readFile, rename, writeFile } from "node:fs/promises";
import { dirname, join, resolve } from "node:path";
import { randomUUID } from "node:crypto";
import {
  applyEdits,
  modify,
  parse as parseJsonc,
  type ParseError,
} from "jsonc-parser";
import { parse as parseToml, stringify as stringifyToml } from "smol-toml";
import { ClickUpClient } from "./clickup.js";
import { lerConfiguracao, resolverAccount } from "./config.js";
import { CliError } from "./errors.js";

export const CLIENTES_MCP = [
  "claude-code",
  "codex",
  "gemini",
  "opencode",
] as const;
type Cliente = (typeof CLIENTES_MCP)[number];
/** Flags opcionais preenchem etapas do assistente; sem TTY, todas as escolhas são explícitas. */
export interface McpSetupOptions {
  name?: string;
  account?: string;
  space?: string;
  list?: string;
  clients?: string;
  project?: string;
  force?: boolean;
  readOnly?: boolean;
  nonInteractive?: boolean;
}
type Item = { id: string; name: string; folder?: string };

/** Valida coleções da API antes de apresentá-las no seletor. */
function itens(valores: unknown[]): Item[] {
  return valores.map((valor) => {
    if (
      !valor ||
      typeof valor !== "object" ||
      !("id" in valor) ||
      !("name" in valor)
    ) {
      throw new CliError("O ClickUp retornou uma hierarquia inválida.");
    }
    return { id: String(valor.id), name: String(valor.name) };
  });
}

/** Seleciona um recurso autorizado ou valida o ID recebido por flag. */
async function escolher(
  message: string,
  valores: Item[],
  id: string | undefined,
  interativo: boolean,
  flag: string,
): Promise<Item> {
  if (!valores.length)
    throw new CliError(`Nenhuma opção disponível: ${message}`);
  if (!id && !interativo)
    throw new CliError(
      `Informe --${flag} ao executar sem terminal interativo.`,
    );
  const selecionado =
    id ??
    (await select({
      message,
      choices: valores.map((item) => ({
        name: `${item.name} (${item.id})`,
        value: item.id,
      })),
    }));
  const item = valores.find((valor) => valor.id === selecionado);
  if (!item)
    throw new CliError(`A opção de --${flag} não pertence à seleção atual.`);
  return item;
}

/** Consulta a hierarquia, coleta escolhas e grava somente referências aos perfis locais. */
export async function executarMcpSetup(options: McpSetupOptions = {}) {
  const interativo =
    !options.nonInteractive &&
    Boolean(process.stdin.isTTY && process.stderr.isTTY);
  const nome =
    options.name ??
    (interativo
      ? await input({
          message: "Nome deste MCP:",
          default: "clickup-projeto",
          validate: (valor) =>
            /^[a-zA-Z0-9][a-zA-Z0-9_-]*$/.test(valor) ||
            "Use letras, números, hífen ou sublinhado, começando por letra ou número.",
        })
      : "");
  if (!/^[a-zA-Z0-9][a-zA-Z0-9_-]*$/.test(nome))
    throw new CliError(
      "Informe --name com letras, números, hífen ou sublinhado, começando por letra ou número.",
    );
  const clientes = options.clients
    ? options.clients.split(",").map((valor) => valor.trim())
    : interativo
      ? await checkbox({
          message: "Clientes que receberão este MCP:",
          choices: CLIENTES_MCP.map((value) => ({
            name: value,
            value,
            checked: true,
          })),
          required: true,
        })
      : [...CLIENTES_MCP];
  if (
    !clientes.length ||
    clientes.some((cliente) => !CLIENTES_MCP.includes(cliente as Cliente))
  )
    throw new CliError(`Clientes válidos: ${CLIENTES_MCP.join(", ")}.`);
  const config = await lerConfiguracao();
  const perfil = await escolher(
    "Conta do ClickUp:",
    Object.entries(config.accounts).map(([id, account]) => ({
      id,
      name: `${account.name} / ${account.workspace.name}`,
    })),
    options.account,
    interativo,
    "account",
  );
  const { account } = resolverAccount(config, perfil.id);
  const client = new ClickUpClient(account.apiKey);
  const space = await escolher(
    "Espaço do projeto:",
    itens(await client.listarSpaces(account.workspace.id)),
    options.space,
    interativo,
    "space",
  );
  const listas: Item[] = itens(await client.listarLists({ spaceId: space.id }));
  // Cada folder é consultado separadamente: a API de Space retorna apenas listas sem pasta.
  for (const folder of itens(await client.listarFolders(space.id))) {
    listas.push(
      ...itens(await client.listarLists({ folderId: folder.id })).map(
        (list) => ({
          ...list,
          name: `${folder.name} / ${list.name}`,
          folder: folder.id,
        }),
      ),
    );
  }
  const list = await escolher(
    "Lista disponível neste MCP:",
    listas,
    options.list,
    interativo,
    "list",
  );
  const args = [
    "mcp",
    "serve",
    "--account",
    perfil.id,
    "--workspace",
    account.workspace.id,
    "--space",
    space.id,
    ...(list.folder ? ["--folder", list.folder] : []),
    "--list",
    list.id,
    ...(options.readOnly ? ["--read-only"] : []),
  ];
  const arquivos = await gravarClientes({
    project: options.project ?? process.cwd(),
    name: nome,
    clients: [...new Set(clientes)] as Cliente[],
    args,
    force: options.force ?? false,
  });
  return {
    name: nome,
    account: perfil.id,
    workspace: account.workspace.id,
    space: space.id,
    list: list.id,
    arquivos,
  };
}

/** Recusa estruturas inválidas em vez de descartar configurações de outros servidores. */
function objeto(valor: unknown, caminho: string): Record<string, unknown> {
  if (!valor || typeof valor !== "object" || Array.isArray(valor))
    throw new CliError(`Configuração inválida em ${caminho}.`);
  return valor as Record<string, unknown>;
}

/**
 * Prepara todos os arquivos antes de gravar. Colisões exigem --force; outras
 * entradas são preservadas. A substituição de cada arquivo usa rename atômico.
 */
export async function gravarClientes(options: {
  project: string;
  name: string;
  clients: Cliente[];
  args: string[];
  force: boolean;
}): Promise<string[]> {
  const destinos: Record<Cliente, [string, string]> = {
    "claude-code": [".mcp.json", "mcpServers"],
    codex: [".codex/config.toml", "mcp_servers"],
    gemini: [".gemini/settings.json", "mcpServers"],
    opencode: ["opencode.json", "mcp"],
  };
  const preparados: { path: string; text: string }[] = [];
  for (const cliente of options.clients) {
    const [relativo, chave] = destinos[cliente];
    let path = resolve(options.project, relativo);
    if (cliente === "opencode") {
      try {
        await readFile(join(options.project, "opencode.jsonc"), "utf8");
        path = resolve(options.project, "opencode.jsonc");
      } catch (error) {
        if (
          !(
            error instanceof Error &&
            "code" in error &&
            error.code === "ENOENT"
          )
        )
          throw error;
      }
    }
    let config: Record<string, unknown> = {};
    let original = "{}\n";
    try {
      const texto = await readFile(path, "utf8");
      original = texto;
      const erros: ParseError[] = [];
      config = objeto(
        cliente === "codex"
          ? parseToml(texto)
          : cliente === "opencode"
            ? parseJsonc(texto, erros, { allowTrailingComma: true })
            : JSON.parse(texto),
        path,
      );
      if (erros.length) throw new CliError(`JSONC inválido em ${path}.`);
    } catch (error) {
      if (
        !(error instanceof Error && "code" in error && error.code === "ENOENT")
      )
        throw new CliError(
          `Não foi possível ler ${path}. Nenhum arquivo foi alterado.`,
          1,
          { cause: error },
        );
    }
    const servidores =
      config[chave] === undefined ? {} : objeto(config[chave], path);
    if (Object.hasOwn(servidores, options.name) && !options.force)
      throw new CliError(
        `O MCP "${options.name}" já existe em ${path}. Use outro nome ou --force para substituí-lo.`,
      );
    config[chave] = {
      ...servidores,
      [options.name]:
        cliente === "opencode"
          ? {
              type: "local",
              command: ["clickupfy", ...options.args],
              enabled: true,
            }
          : { command: "clickupfy", args: options.args },
    };
    const text =
      cliente === "codex"
        ? `${stringifyToml(config)}\n`
        : cliente === "opencode"
          ? applyEdits(
              original,
              modify(
                original,
                [chave, options.name],
                (config[chave] as Record<string, unknown>)[options.name],
                { formattingOptions: { insertSpaces: true, tabSize: 2 } },
              ),
            )
          : `${JSON.stringify(config, null, 2)}\n`;
    preparados.push({ path, text });
  }
  for (const arquivo of preparados) {
    await mkdir(dirname(arquivo.path), { recursive: true });
    const temp = `${arquivo.path}.${randomUUID()}.tmp`;
    await writeFile(temp, arquivo.text, { mode: 0o600 });
    await rename(temp, arquivo.path);
  }
  return preparados.map((arquivo) => arquivo.path);
}
