/**
 * Testes da instalação de skills e da mesclagem do arquivo MCP.
 */

import { execFile } from "node:child_process";
import { mkdtemp, readFile, writeFile } from "node:fs/promises";
import { tmpdir } from "node:os";
import { join, resolve } from "node:path";
import { promisify } from "node:util";
import { describe, expect, it } from "vitest";
import {
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

    expect(instaladas).toHaveLength(3);
    expect(
      await readFile(join(skills, "clickupfy-dev", "SKILL.md"), "utf8"),
    ).toContain("clickupfy_checklist_item_set");
    expect(
      await readFile(join(skills, "clickupfy-release", "SKILL.md"), "utf8"),
    ).toContain("npm run release:check");
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
    expect(
      await readFile(
        join(pasta, ".codex", "skills", "clickupfy-dev", "SKILL.md"),
        "utf8",
      ),
    ).toContain("clickupfy_mcp_context");
  });
});
