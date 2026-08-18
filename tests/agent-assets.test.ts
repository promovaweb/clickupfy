/**
 * Testes da instalação de skills e da mesclagem do arquivo MCP.
 */

import { execFile } from "node:child_process";
import { appendFile, chmod, mkdir, mkdtemp, readFile, writeFile } from "node:fs/promises";
import { tmpdir } from "node:os";
import { join, resolve } from "node:path";
import { promisify } from "node:util";
import { parse as parseToml } from "smol-toml";
import { describe, expect, it } from "vitest";
import {
  configurarCodexProjeto,
  configurarMcpProjeto,
  caminhoSkillsEmpacotadas,
  instalarSkills,
  SKILL_NAMES,
} from "../src/agent-assets.js";
import { skillEstaEmPtBr } from "../src/doctor.js";

const execFileAsync = promisify(execFile);

async function criarSkillsFake(pasta: string) {
  const comando = join(pasta, "npx");
  const log = join(pasta, "skills-fake.log");
  const nomes = [
    "clickupfy-setup",
    "clickupfy-dev",
    "clickup-issue-create",
    "clickup-issue-implement",
    "clickupfy-release",
  ];
  await writeFile(
    comando,
    [
      `#!${process.execPath}`,
      'import { appendFile, mkdir, writeFile } from "node:fs/promises";',
      'import { join } from "node:path";',
      `const nomes = ${JSON.stringify(nomes)};`,
      'const rawArgs = process.argv.slice(2);',
      'const args = rawArgs[0] === "--yes" && rawArgs[1] === "skills" ? rawArgs.slice(2) : rawArgs;',
      'const global = args.includes("--global");',
      'const base = global ? join(process.env.SKILLS_FAKE_HOME, ".codex", "skills") : join(process.cwd(), ".agents", "skills");',
      'if (args[0] === "add") {',
      '  await appendFile(process.env.SKILLS_FAKE_LOG, `${args.join(" ")}\\n`);',
      '  for (const nome of nomes) { await mkdir(join(base, nome, "agents"), { recursive: true }); await writeFile(join(base, nome, "SKILL.md"), `name: ${nome}\\n`); await writeFile(join(base, nome, "agents", "openai.yaml"), "interface:\\n  display_name: \\"Skill em português\\"\\n"); }',
      '} else if (args[0] === "list") {',
      '  console.log(JSON.stringify(nomes.map((name) => ({ name, path: join(base, name), scope: global ? "global" : "project", agents: ["Codex"], source: "promovaweb/clickupfy" }))));',
      '}',
    ].join("\n"),
  );
  await chmod(comando, 0o755);
  return {
    skillsCli: {
      command: comando,
      cwd: pasta,
      env: { SKILLS_FAKE_LOG: log, SKILLS_FAKE_HOME: pasta },
    },
    log,
  };
}

describe("integração com agentes", () => {
  it("mantém as skills distribuídas em português do Brasil", async () => {
    for (const nome of SKILL_NAMES) {
      const pasta = join(caminhoSkillsEmpacotadas(), nome);
      expect(skillEstaEmPtBr(await readFile(join(pasta, "SKILL.md"), "utf8"))).toBe(true);
      expect(
        skillEstaEmPtBr(await readFile(join(pasta, "agents", "openai.yaml"), "utf8")),
      ).toBe(true);
    }
  });

  it("exige uma List para iniciar o servidor MCP", async () => {
    await expect(
      execFileAsync(resolve("node_modules/.bin/tsx"), [
        resolve("src/cli.ts"),
        "mcp",
        "serve",
        "--read-only",
      ]),
    ).rejects.toMatchObject({
      stderr: expect.stringContaining(
        "required option '--list <id>' not specified",
      ),
    });
  });

  it("instala as skills e preserva servidores MCP existentes", async () => {
    const pasta = await mkdtemp(join(tmpdir(), "clickupfy-agent-"));
    const fake = await criarSkillsFake(pasta);
    const mcpPath = join(pasta, ".mcp.json");
    await writeFile(
      mcpPath,
      JSON.stringify({
        mcpServers: {
          github: { command: "github-mcp" },
        },
      }),
    );

    const instaladas = await instalarSkills({ skillsCli: fake.skillsCli });
    await configurarMcpProjeto({
      path: mcpPath,
      account: "dev",
      workspace: "123",
      space: "space-1",
      folder: "folder-1",
      list: "list-1",
      sprintFolder: "sprints-1",
    });
    const mcp = JSON.parse(await readFile(mcpPath, "utf8"));

    expect(instaladas).toHaveLength(SKILL_NAMES.length);
    expect(instaladas.every((caminho) => caminho.includes(".agents/skills/"))).toBe(true);
    const chamada = await readFile(fake.log, "utf8");
    expect(chamada).toContain("add promovaweb/clickupfy");
    expect(chamada).toContain("--agent codex");
    expect(chamada).toContain("--skill clickupfy-dev");
    expect(mcp.mcpServers.github).toEqual({ command: "github-mcp" });
    expect(mcp.mcpServers["promovaweb-clickupfy"]).toEqual({
      command: "clickupfy",
      args: [
        "mcp",
        "serve",
        "--account",
        "dev",
        "--workspace",
        "123",
        "--space",
        "space-1",
        "--folder",
        "folder-1",
        "--list",
        "list-1",
        "--sprint-folder",
        "sprints-1",
      ],
    });
  });

  it("usa npx skills quando não há injeção de comando", async () => {
    const pasta = await mkdtemp(join(tmpdir(), "clickupfy-agent-npx-"));
    const fake = await criarSkillsFake(pasta);
    const paths = [pasta, process.env.PATH].filter(Boolean).join(":");

    const instaladas = await instalarSkills({
      skillsCli: { cwd: pasta, env: { SKILLS_FAKE_LOG: fake.skillsCli.env?.SKILLS_FAKE_LOG, SKILLS_FAKE_HOME: pasta, PATH: paths } },
    });

    expect(instaladas).toHaveLength(SKILL_NAMES.length);
    const chamada = await readFile(fake.log, "utf8");
    expect(chamada).toContain("add promovaweb/clickupfy");
  });

  it("mescla o servidor no config.toml existente do Codex", async () => {
    const pasta = await mkdtemp(join(tmpdir(), "clickupfy-codex-"));
    const codexPath = join(pasta, ".codex", "config.toml");
    await mkdir(join(pasta, ".codex"), { recursive: true });
    await writeFile(
      codexPath,
      [
        'model = "gpt-5"',
        "",
        '[mcp_servers."github"]',
        'command = "github-mcp"',
        'args = ["--stdio"]',
        "",
      ].join("\n"),
    );

    await configurarCodexProjeto({
      path: codexPath,
      account: "dev",
      workspace: "123",
      space: "space-1",
      folder: "folder-1",
      list: "list-1",
      sprintFolder: "sprints-1",
    });

    const codex = parseToml(await readFile(codexPath, "utf8"));
    expect(codex.model).toBe("gpt-5");
    expect(codex.mcp_servers.github).toEqual({
      command: "github-mcp",
      args: ["--stdio"],
    });
    expect(codex.mcp_servers["promovaweb-clickupfy"]).toEqual({
      command: "clickupfy",
      args: [
        "mcp",
        "serve",
        "--account",
        "dev",
        "--workspace",
        "123",
        "--space",
        "space-1",
        "--folder",
        "folder-1",
        "--list",
        "list-1",
        "--sprint-folder",
        "sprints-1",
      ],
    });
  });

  it("gera um MCP específico na pasta de cada projeto pelo CLI", async () => {
    const pasta = await mkdtemp(join(tmpdir(), "clickupfy-init-"));
    const fake = await criarSkillsFake(pasta);
    const configPath = join(pasta, "config.json");
    const agora = new Date().toISOString();
    await writeFile(
      configPath,
      JSON.stringify({
        version: 1,
        activeAccount: "dev",
        accounts: {
          dev: {
            name: "Desenvolvimento",
            apiKey: "pk_teste",
            user: { id: 1, username: "dev" },
            workspace: { id: "123", name: "Engenharia" },
            createdAt: agora,
            updatedAt: agora,
          },
        },
      }),
    );

    await execFileAsync(
      resolve("node_modules/.bin/tsx"),
      [
        resolve("src/cli.ts"),
        "agent",
        "init",
        "--account",
        "dev",
        "--workspace",
        "123",
        "--space",
        "space-1",
        "--list",
        "list-1",
      ],
      {
        cwd: pasta,
        env: {
          ...process.env,
          PROMOVAWEB_CLICKUPFY_CONFIG: configPath,
          ...fake.skillsCli.env,
          PATH: [pasta, process.env.PATH].filter(Boolean).join(":"),
        },
      },
    );

    const mcp = JSON.parse(await readFile(join(pasta, ".mcp.json"), "utf8"));
    const codex = parseToml(
      await readFile(join(pasta, ".codex", "config.toml"), "utf8"),
    );
    expect(mcp.mcpServers["promovaweb-clickupfy"].args).toEqual([
      "mcp",
      "serve",
      "--account",
      "dev",
      "--workspace",
      "123",
      "--space",
      "space-1",
      "--list",
      "list-1",
    ]);
    expect(codex.mcp_servers["promovaweb-clickupfy"].args).toEqual([
      "mcp",
      "serve",
      "--account",
      "dev",
      "--workspace",
      "123",
      "--space",
      "space-1",
      "--list",
      "list-1",
    ]);
    expect(
      await readFile(
        join(pasta, ".agents", "skills", "clickupfy-dev", "SKILL.md"),
        "utf8",
      ),
    ).toContain("name: clickupfy-dev");
  }, 15000);
});
