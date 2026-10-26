/** Comandos individuais do catálogo OpenAPI, com JSON literal, arquivos e uploads. */
import { readFile } from "node:fs/promises";
import { basename } from "node:path";
import { Command } from "commander";
import { z } from "zod";
import { criarContexto } from "../context.js";
import { ClickUpClient } from "../clickup.js";
import {
  operations,
  sources,
  findOperation,
  operationShape,
  type ApiInput,
} from "./catalog.js";
import { executeOperation, validateOperationInput } from "./execute.js";

/** Recebe JSON sem avaliação de código, com diagnóstico identificando a opção. */
function parseJson(value: string, label: string): unknown {
  try {
    return JSON.parse(value);
  } catch {
    throw new Error(`JSON inválido em ${label}.`);
  }
}

/** Acrescenta uma ocorrência de --file sem interpretar operadores de shell. */
function appendFile(value: string, previous: string[]): string[] {
  return [...previous, value];
}

/** Lê um envelope de entrada, inclusive stdin, sem exigir um perfil para descoberta. */
async function readInput(path: string): Promise<unknown> {
  if (path !== "-") return parseJson(await readFile(path, "utf8"), "--input");
  const chunks: Buffer[] = [];
  for await (const chunk of process.stdin) chunks.push(Buffer.from(chunk));
  return parseJson(Buffer.concat(chunks).toString("utf8"), "stdin");
}

/** Registra todos os endpoints como api v2-... e api v3-..., mantendo nomes estáveis. */
export function registerApiCli(program: Command): Command {
  const api = program
    .command("api")
    .description(
      "acessa todos os endpoints da especificação pública do ClickUp",
    );
  api
    .command("list")
    .description("lista operações, métodos, versões e ferramentas MCP")
    .option("--group <grupo>", "filtra um grupo do catálogo")
    .option("--read-only", "mostra apenas consultas")
    .action((options) => {
      const selected = operations.filter(
        (o) =>
          (!options.group ||
            o.group.toLowerCase() === options.group.toLowerCase()) &&
          (!options.readOnly || o.readOnly),
      );
      process.stdout.write(
        JSON.stringify(
          {
            sources,
            total: selected.length,
            operations: selected.map(
              ({
                id,
                cli,
                tool,
                method,
                path,
                version,
                group,
                readOnly,
                deprecated,
              }) => ({
                id,
                cli,
                tool,
                method,
                path,
                version,
                group,
                readOnly,
                deprecated,
              }),
            ),
          },
          null,
          2,
        ) + "\n",
      );
    });
  api
    .command("describe")
    .argument("<operation>", "operationId, comando ou ferramenta")
    .description("mostra parâmetros, corpo, formatos e schema de uma operação")
    .action((id) => {
      const operation = findOperation(id);
      process.stdout.write(
        JSON.stringify(
          {
            ...operation,
            inputSchema: z.toJSONSchema(
              z.strictObject(operationShape(operation)),
            ),
          },
          null,
          2,
        ) + "\n",
      );
    });
  for (const operation of operations) {
    api
      .command(operation.cli)
      .description(
        `${operation.method} ${operation.path}${operation.deprecated ? " (obsoleto na API)" : ""}`,
      )
      .option("--path <json>", "parâmetros de caminho em objeto JSON")
      .option("--query <json>", "parâmetros de consulta em objeto JSON")
      .option("--body <json>", "corpo da requisição em JSON")
      .option("--body-file <arquivo>", "arquivo JSON com o corpo da requisição")
      .option("--input <arquivo>", "envelope JSON; use - para ler stdin")
      .option("--content-type <tipo>", "formato documentado para o corpo")
      .option(
        "--file <campo=caminho>",
        "arquivo multipart; opção repetível",
        appendFile,
        [],
      )
      .option("--yes", "confirma uma exclusão ou remoção")
      .option("--dry-run", "valida a entrada sem enviar a requisição")
      .addHelpText(
        "after",
        `\nContrato completo: clickupfy api describe ${operation.cli}\nMCP: ${operation.tool}\n`,
      )
      .action(async function (this: Command, options) {
        const input = options.input ? await readInput(options.input) : {};
        if (!input || typeof input !== "object" || Array.isArray(input))
          throw new Error("--input exige um objeto JSON.");
        const data = input as ApiInput;
        if (options.body !== undefined && options.bodyFile)
          throw new Error("Use --body ou --body-file, separadamente.");
        for (const field of ["path", "query", "body"] as const) {
          if (options[field] !== undefined) {
            if (data[field] !== undefined)
              throw new Error(`Campo duplicado: ${field}.`);
            data[field] = parseJson(options[field], `--${field}`) as never;
          }
        }
        if (options.bodyFile) {
          if (data.body !== undefined)
            throw new Error("Campo duplicado: body.");
          data.body = parseJson(
            await readFile(options.bodyFile, "utf8"),
            "--body-file",
          );
        }
        if (options.contentType) data.contentType = options.contentType;
        if (options.yes) data.confirm = true;
        for (const item of options.file as string[]) {
          const index = item.indexOf("=");
          if (index < 1 || index === item.length - 1)
            throw new Error("Use --file campo=caminho.");
          const path = item.slice(index + 1);
          (data.files ??= []).push({
            field: item.slice(0, index),
            filename: basename(path),
            contentBase64: (await readFile(path)).toString("base64"),
          });
        }
        validateOperationInput(operation, data);
        if (options.dryRun) {
          process.stdout.write(
            JSON.stringify({
              valid: true,
              operation: operation.id,
              method: operation.method,
              path: operation.path,
            }) + "\n",
          );
          return;
        }
        const globals = this.optsWithGlobals();
        const client = operation.authenticated
          ? (await criarContexto(globals.account)).client
          : new ClickUpClient("");
        process.stdout.write(
          JSON.stringify(
            await executeOperation(client, operation, data),
            null,
            2,
          ) + "\n",
        );
      });
  }
  return api;
}
