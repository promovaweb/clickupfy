/**
 * Teste ponta a ponta do setup não interativo contra uma API local simulada.
 */

import { execFile } from "node:child_process";
import { mkdtemp, readFile } from "node:fs/promises";
import { createServer } from "node:http";
import { tmpdir } from "node:os";
import { join, resolve } from "node:path";
import { promisify } from "node:util";
import { afterEach, describe, expect, it } from "vitest";

const execFileAsync = promisify(execFile);
const servidores: Array<ReturnType<typeof createServer>> = [];

afterEach(async () => {
  await Promise.all(
    servidores.splice(0).map(
      (servidor) =>
        new Promise<void>((resolveClose, reject) => {
          servidor.close((error) => (error ? reject(error) : resolveClose()));
        }),
    ),
  );
});

describe("clickupfy install", () => {
  it("valida a chave, associa o workspace e cria o config.json", async () => {
    const servidor = createServer((request, response) => {
      response.setHeader("Content-Type", "application/json");
      if (request.url === "/api/v2/user") {
        response.end(
          JSON.stringify({
            user: {
              id: 10,
              username: "Dev Promovaweb",
              email: "dev@example.com",
            },
          }),
        );
        return;
      }
      if (request.url === "/api/v2/team") {
        response.end(
          JSON.stringify({ teams: [{ id: "123", name: "Engenharia" }] }),
        );
        return;
      }
      if (request.url?.startsWith("/api/v2/team/123/space")) {
        response.end(JSON.stringify({ spaces: [{ id: "10", name: "Dev" }] }));
        return;
      }
      if (request.url?.startsWith("/api/v2/space/10/folder")) {
        response.end(JSON.stringify({ folders: [] }));
        return;
      }
      if (request.url?.startsWith("/api/v2/space/10/list")) {
        response.end(
          JSON.stringify({ lists: [{ id: "30", name: "Produto" }] }),
        );
        return;
      }
      response.statusCode = 404;
      response.end(JSON.stringify({ err: "Não encontrado" }));
    });
    servidores.push(servidor);
    await new Promise<void>((resolveListen) =>
      servidor.listen(0, "127.0.0.1", resolveListen),
    );
    const endereco = servidor.address();
    if (!endereco || typeof endereco === "string")
      throw new Error("Porta ausente");
    const pasta = await mkdtemp(join(tmpdir(), "clickupfy-setup-"));
    const caminho = join(pasta, "clickupfy", "config.json");
    const tsx = process.execPath;

    const { stdout } = await execFileAsync(
      tsx,
      [
        "--import",
        "tsx",
        "src/cli.ts",
        "install",
        "--api-key",
        "pk_teste",
        "--name",
        "Promovaweb Dev",
        "--workspace",
        "123",
        "--non-interactive",
      ],
      {
        cwd: resolve("."),
        env: {
          ...process.env,
          PROMOVAWEB_CLICKUPFY_CONFIG: caminho,
          PROMOVAWEB_CLICKUPFY_API_URL: `http://127.0.0.1:${endereco.port}/api/v2`,
        },
      },
    );

    const config = JSON.parse(await readFile(caminho, "utf8"));
    expect(stdout).toContain('Perfil "promovaweb-dev" configurado');
    expect(config.activeAccount).toBe("promovaweb-dev");
    expect(config.accounts["promovaweb-dev"].apiKey).toBe("pk_teste");
    expect(config.accounts["promovaweb-dev"].workspace).toEqual({
      id: "123",
      name: "Engenharia",
    });
    const setupMcp = await execFileAsync(
      tsx,
      [
        "--import",
        "tsx",
        "src/cli.ts",
        "mcp",
        "setup",
        "--name",
        "produto",
        "--account",
        "promovaweb-dev",
        "--space",
        "10",
        "--list",
        "30",
        "--project",
        pasta,
        "--non-interactive",
        "--json",
      ],
      {
        cwd: resolve("."),
        env: {
          ...process.env,
          PROMOVAWEB_CLICKUPFY_CONFIG: caminho,
          PROMOVAWEB_CLICKUPFY_API_URL: `http://127.0.0.1:${endereco.port}/api/v2`,
        },
      },
    );
    expect(JSON.parse(setupMcp.stdout)).toMatchObject({
      name: "produto",
      account: "promovaweb-dev",
      space: "10",
      list: "30",
    });
    expect(
      JSON.parse(await readFile(join(pasta, ".mcp.json"), "utf8")).mcpServers
        .produto.command,
    ).toBe("clickupfy");
  });
});
