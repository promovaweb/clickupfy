/**
 * Testes da instalação de skills e da mesclagem do arquivo MCP.
 */

import { execFile } from "node:child_process";
import { mkdir, mkdtemp, readFile, writeFile } from "node:fs/promises";
import { tmpdir } from "node:os";
import { join, resolve } from "node:path";
import { promisify } from "node:util";
import { parse as parseToml } from "smol-toml";
import { describe, expect, it } from "vitest";
import {
  configurarCodexProjeto,
  configurarMcpProjeto,
  instalarSkills,
} from "../src/agent-assets.js";

const execFileAsync = promisify(execFile);

describe("integração com agentes", () => {
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
    const skills = join(pasta, "skills");
    const mcpPath = join(pasta, ".mcp.json");
    await writeFile(
      mcpPath,
      JSON.stringify({
        mcpServers: {
          github: { command: "github-mcp" },
        },
      }),
    );

    const instaladas = await instalarSkills({ target: skills });
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

    expect(instaladas).toHaveLength(4);
    expect(
      await readFile(join(skills, "clickupfy-dev", "SKILL.md"), "utf8"),
    ).toContain("clickupfy_checklist_item_set");
    expect(
      await readFile(join(skills, "clickupfy-release", "SKILL.md"), "utf8"),
    ).toContain("npm run release:check");
    expect(
      await readFile(join(skills, "clickup-issue-create", "SKILL.md"), "utf8"),
    ).toContain("name: clickup-issue-create");
    expect(
      await readFile(
        join(skills, "clickup-issue-implement", "SKILL.md"),
        "utf8",
      ),
    ).toContain("name: clickup-issue-implement");
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
        join(pasta, ".codex", "skills", "clickupfy-dev", "SKILL.md"),
        "utf8",
      ),
    ).toContain("clickupfy_mcp_context");
  });
});
