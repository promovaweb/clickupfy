/** Exercita os comandos de API e tags em processos reais com um servidor HTTP local. */
import { execFile } from "node:child_process";
import { mkdtemp, rm, writeFile } from "node:fs/promises";
import { createServer } from "node:http";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { promisify } from "node:util";
import { expect, it } from "vitest";
import { criarConfiguracaoVazia } from "../src/config.js";
const run = promisify(execFile);

it("executa CRUD de tags, JSON em arquivo, upload e falhas pelo CLI", async () => {
  const directory = await mkdtemp(join(tmpdir(), "clickupfy-api-cli-"));
  const configPath = join(directory, "config.json");
  const config = criarConfiguracaoVazia();
  const now = new Date().toISOString();
  config.activeAccount = "teste";
  config.accounts.teste = {
    name: "Teste",
    apiKey: "pk_local",
    user: { id: 1 },
    workspace: { id: "123", name: "Teste" },
    createdAt: now,
    updatedAt: now,
  };
  await writeFile(configPath, JSON.stringify(config));
  const requests: {
    method: string;
    url: string;
    body: string;
    contentType: string;
  }[] = [];
  const server = createServer(async (req, res) => {
    const chunks: Buffer[] = [];
    for await (const chunk of req) chunks.push(Buffer.from(chunk));
    requests.push({
      method: req.method ?? "",
      url: req.url ?? "",
      body: Buffer.concat(chunks).toString(),
      contentType: req.headers["content-type"] ?? "",
    });
    res.setHeader("Content-Type", "application/json");
    if (req.url?.includes("negada")) {
      res.writeHead(403);
      res.end('{"err":"Sem acesso"}');
      return;
    }
    res.end(
      JSON.stringify(
        req.method === "GET"
          ? { tags: [{ name: "bug", tag_fg: "#ffffff", tag_bg: "#112233" }] }
          : {},
      ),
    );
  });
  await new Promise<void>((resolve) => server.listen(0, "127.0.0.1", resolve));
  const address = server.address();
  if (!address || typeof address === "string") throw new Error("Porta ausente");
  const env = {
    ...process.env,
    PROMOVAWEB_CLICKUPFY_CONFIG: configPath,
    PROMOVAWEB_CLICKUPFY_API_URL: `http://127.0.0.1:${address.port}/api/v2`,
  };
  const cli = (...args: string[]) =>
    run(process.execPath, ["--import", "tsx", "src/cli.ts", ...args], { env });
  try {
    expect(JSON.parse((await cli("api", "list")).stdout).total).toBe(173);
    expect(
      JSON.parse((await cli("api", "describe", "DeleteSpaceTag")).stdout)
        .inputSchema.properties.confirm.const,
    ).toBe(true);
    expect(
      JSON.parse(
        (await cli("--json", "tag", "list", "--space", "123")).stdout,
      )[0].name,
    ).toBe("bug");
    await cli(
      "tag",
      "create",
      "bug",
      "--space",
      "123",
      "--foreground",
      "#ffffff",
      "--background",
      "#112233",
    );
    await cli("tag", "update", "bug", "--space", "123", "--name", "pronta");
    await cli("tag", "delete", "bug", "--space", "123", "--yes");
    await cli("task", "remove-tag", "DEV-42", "bug", "--custom-task-id");
    expect(requests.map((r) => r.method)).toEqual([
      "GET",
      "POST",
      "GET",
      "PUT",
      "GET",
      "DELETE",
      "DELETE",
    ]);
    expect(JSON.parse(requests[3]!.body).tag).toEqual({
      name: "pronta",
      fg_color: "#ffffff",
      bg_color: "#112233",
    });
    const bodyFile = join(directory, "body.json");
    const inputFile = join(directory, "input.json");
    await writeFile(
      bodyFile,
      JSON.stringify({ name: "Tarefa", custom_field_extra: { enabled: true } }),
    );
    await writeFile(
      inputFile,
      JSON.stringify({ path: { list_id: "456" }, body: { name: "Tarefa" } }),
    );
    await cli(
      "api",
      "v2-create-task",
      "--path",
      '{"list_id":"456"}',
      "--body-file",
      bodyFile,
    );
    expect(JSON.parse(requests.at(-1)!.body).custom_field_extra).toEqual({
      enabled: true,
    });
    await cli("api", "v2-create-task", "--input", inputFile);
    const count = requests.length;
    await cli("api", "v2-create-task", "--input", inputFile, "--dry-run");
    await expect(
      cli("api", "v2-create-task", "--input", inputFile, "--body", "{}"),
    ).rejects.toThrow();
    await expect(
      cli("api", "v2-delete-task", "--path", '{"task_id":"task-1"}'),
    ).rejects.toThrow();
    await expect(
      cli("tag", "delete", "bug", "--space", "123"),
    ).rejects.toThrow();
    expect(requests).toHaveLength(count);
    await cli(
      "api",
      "v2-create-task-attachment",
      "--path",
      '{"task_id":"task-1"}',
      "--file",
      `attachment[0]=${bodyFile}`,
    );
    expect(requests.at(-1)!.contentType).toMatch(
      /^multipart\/form-data; boundary=/,
    );
    expect(requests.at(-1)!.body).toContain('filename="body.json"');
    expect(requests.at(-1)!.body).toContain('name="attachment[0]"');
    await expect(
      cli("api", "v2-get-task", "--path", '{"task_id":"negada"}'),
    ).rejects.toMatchObject({ code: 2 });
  } finally {
    await new Promise<void>((resolve, reject) =>
      server.close((error) => (error ? reject(error) : resolve())),
    );
    await rm(directory, { recursive: true, force: true });
  }
});
