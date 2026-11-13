/** Testes das escolhas do assistente e da preservação dos clientes MCP. */
import { mkdtemp, readFile, mkdir, writeFile, rm } from "node:fs/promises";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { parse } from "smol-toml";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { input, select, checkbox } from "@inquirer/prompts";
import { executarMcpSetup } from "../src/mcp-setup.js";
import { criarConfiguracaoVazia, salvarConfiguracao } from "../src/config.js";
import { ClickUpClient } from "../src/clickup.js";
vi.mock("@inquirer/prompts", () => ({
  input: vi.fn(),
  select: vi.fn(),
  checkbox: vi.fn(),
}));
let pasta: string;
beforeEach(async () => {
  pasta = await mkdtemp(join(tmpdir(), "mcp-setup-"));
  vi.stubEnv("PROMOVAWEB_CLICKUPFY_CONFIG", join(pasta, "perfil.json"));
  const config = criarConfiguracaoVazia();
  config.activeAccount = "dev";
  config.accounts.dev = {
    name: "Dev",
    apiKey: "segredo-nao-copiar",
    user: { id: 1 },
    workspace: { id: "w1", name: "Empresa" },
    createdAt: "2026-10-19",
    updatedAt: "2026-10-19",
  };
  await salvarConfiguracao(config);
  vi.spyOn(ClickUpClient.prototype, "listarSpaces").mockResolvedValue([
    { id: "s1", name: "Produto" },
  ]);
  vi.spyOn(ClickUpClient.prototype, "listarFolders").mockResolvedValue([
    { id: "f1", name: "Dev" },
  ]);
  vi.spyOn(ClickUpClient.prototype, "listarLists").mockImplementation(
    async (scope) =>
      scope.folderId
        ? [{ id: "l2", name: "Sprint" }]
        : [{ id: "l1", name: "Backlog" }],
  );
});
afterEach(async () => {
  vi.restoreAllMocks();
  vi.unstubAllEnvs();
  vi.clearAllMocks();
  await rm(pasta, { recursive: true, force: true });
});
const opcoes = {
  name: "produto",
  account: "dev",
  space: "s1",
  list: "l2",
  nonInteractive: true,
};
describe("clickupfy mcp setup", () => {
  it("seleciona conta, espaço e lista pelo terminal", async () => {
    const stdin = Object.getOwnPropertyDescriptor(process.stdin, "isTTY");
    const stderr = Object.getOwnPropertyDescriptor(process.stderr, "isTTY");
    Object.defineProperty(process.stdin, "isTTY", {
      configurable: true,
      value: true,
    });
    Object.defineProperty(process.stderr, "isTTY", {
      configurable: true,
      value: true,
    });
    try {
      vi.mocked(input).mockResolvedValue("meu-projeto");
      vi.mocked(checkbox).mockResolvedValue(["codex", "gemini"]);
      vi.mocked(select)
        .mockResolvedValueOnce("dev")
        .mockResolvedValueOnce("s1")
        .mockResolvedValueOnce("l2");
      const resultado = await executarMcpSetup({ project: pasta });
      expect(resultado.name).toBe("meu-projeto");
      expect(resultado.arquivos).toHaveLength(2);
      expect(select).toHaveBeenCalledTimes(3);
      expect(vi.mocked(select).mock.calls[2]?.[0]).toMatchObject({
        choices: [{ value: "l1" }, { value: "l2", name: "Dev / Sprint (l2)" }],
      });
    } finally {
      if (stdin) Object.defineProperty(process.stdin, "isTTY", stdin);
      else delete (process.stdin as any).isTTY;
      if (stderr) Object.defineProperty(process.stderr, "isTTY", stderr);
      else delete (process.stderr as any).isTTY;
    }
  });
  it("gera quatro formatos com hierarquia fixa sem copiar credenciais", async () => {
    const resultado = await executarMcpSetup({
      ...opcoes,
      project: pasta,
      readOnly: true,
    });
    expect(resultado.arquivos).toHaveLength(4);
    const claude = JSON.parse(await readFile(join(pasta, ".mcp.json"), "utf8"));
    const codex = parse(
      await readFile(join(pasta, ".codex/config.toml"), "utf8"),
    );
    const gemini = JSON.parse(
      await readFile(join(pasta, ".gemini/settings.json"), "utf8"),
    );
    const opencode = JSON.parse(
      await readFile(join(pasta, "opencode.json"), "utf8"),
    );
    const server = claude.mcpServers.produto;
    expect(server.args).toEqual([
      "mcp",
      "serve",
      "--account",
      "dev",
      "--workspace",
      "w1",
      "--space",
      "s1",
      "--folder",
      "f1",
      "--list",
      "l2",
      "--read-only",
    ]);
    expect(codex.mcp_servers).toEqual(claude.mcpServers);
    expect(gemini.mcpServers.produto).toEqual(server);
    expect(opencode.mcp.produto).toEqual({
      type: "local",
      command: ["clickupfy", ...server.args],
      enabled: true,
    });
    for (const path of resultado.arquivos)
      expect(await readFile(path, "utf8")).not.toContain("segredo-nao-copiar");
  });
  it("adiciona nomes independentes e preserva perfil global", async () => {
    const antes = await readFile(join(pasta, "perfil.json"), "utf8");
    await executarMcpSetup({ ...opcoes, project: pasta });
    await executarMcpSetup({
      ...opcoes,
      name: "suporte",
      list: "l1",
      project: pasta,
    });
    const config = JSON.parse(await readFile(join(pasta, ".mcp.json"), "utf8"));
    expect(Object.keys(config.mcpServers)).toEqual(["produto", "suporte"]);
    expect(config.mcpServers.suporte.args).not.toContain("--folder");
    expect(await readFile(join(pasta, "perfil.json"), "utf8")).toBe(antes);
  });
  it.each([
    { space: "outro" },
    { list: "fora" },
    { account: "ausente" },
    { name: "nome com espaço" },
  ])("recusa seleção inválida %j sem gravar", async (invalido) => {
    await expect(
      executarMcpSetup({ ...opcoes, ...invalido, project: pasta }),
    ).rejects.toThrow();
    await expect(readFile(join(pasta, ".mcp.json"))).rejects.toMatchObject({
      code: "ENOENT",
    });
  });
  it("exige --force para substituir um nome existente", async () => {
    await executarMcpSetup({ ...opcoes, project: pasta });
    await expect(
      executarMcpSetup({ ...opcoes, project: pasta }),
    ).rejects.toThrow("já existe");
    await executarMcpSetup({
      ...opcoes,
      list: "l1",
      force: true,
      project: pasta,
    });
    expect(
      JSON.parse(await readFile(join(pasta, ".mcp.json"), "utf8")).mcpServers
        .produto.args,
    ).toContain("l1");
  });
  it("valida todos os arquivos antes de gravar", async () => {
    await mkdir(join(pasta, ".gemini"));
    await writeFile(join(pasta, ".gemini/settings.json"), '{"mcpServers": []}');
    await expect(
      executarMcpSetup({ ...opcoes, project: pasta }),
    ).rejects.toThrow("inválida");
    await expect(readFile(join(pasta, ".mcp.json"))).rejects.toMatchObject({
      code: "ENOENT",
    });
  });
  it("preserva o primeiro arquivo quando há colisão em outro cliente", async () => {
    await mkdir(join(pasta, ".gemini"));
    const original = '{"mcpServers":{"externo":{"command":"outro"}}}';
    await writeFile(join(pasta, ".mcp.json"), original);
    await writeFile(
      join(pasta, ".gemini/settings.json"),
      '{"mcpServers":{"produto":{"command":"outro"}}}',
    );
    await expect(
      executarMcpSetup({ ...opcoes, project: pasta }),
    ).rejects.toThrow("já existe");
    expect(await readFile(join(pasta, ".mcp.json"), "utf8")).toBe(original);
    await expect(
      readFile(join(pasta, ".codex/config.toml")),
    ).rejects.toMatchObject({ code: "ENOENT" });
  });
  it("encerra sem gravar quando não há espaços acessíveis", async () => {
    vi.mocked(ClickUpClient.prototype.listarSpaces).mockResolvedValue([]);
    await expect(
      executarMcpSetup({ ...opcoes, project: pasta }),
    ).rejects.toThrow("Nenhuma opção");
    await expect(readFile(join(pasta, ".mcp.json"))).rejects.toMatchObject({
      code: "ENOENT",
    });
  });
  it("propaga falhas da API sem gravar configurações", async () => {
    vi.mocked(ClickUpClient.prototype.listarFolders).mockRejectedValue(
      new Error("API indisponível"),
    );
    await expect(
      executarMcpSetup({ ...opcoes, project: pasta }),
    ).rejects.toThrow("API indisponível");
    await expect(readFile(join(pasta, ".mcp.json"))).rejects.toMatchObject({
      code: "ENOENT",
    });
  });
  it("preserva comentários e configurações do OpenCode JSONC", async () => {
    await writeFile(
      join(pasta, "opencode.jsonc"),
      '{\n// comentário original\n"model":"modelo", "mcp":{"externo":{"type":"remote","url":"https://example.com"}},\n}',
    );
    await executarMcpSetup({ ...opcoes, project: pasta });
    const texto = await readFile(join(pasta, "opencode.jsonc"), "utf8");
    expect(texto).toContain("// comentário original");
    expect(texto).toContain('"externo"');
    expect(texto).toMatch(/"model":\s*"modelo"/);
    expect(texto).toContain('"produto"');
    await expect(readFile(join(pasta, "opencode.json"))).rejects.toMatchObject({
      code: "ENOENT",
    });
  });
});
