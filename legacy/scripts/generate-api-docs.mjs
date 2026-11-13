/** Gera a referência operacional do CLI e MCP a partir do mesmo catálogo executável. */
import { readFile, writeFile } from "node:fs/promises";
import { resolve, dirname } from "node:path";
import { fileURLToPath } from "node:url";
import { z } from "zod";
import { operations, operationShape } from "../src/api/catalog.ts";
import { operationExample } from "../src/api/examples.ts";
const root = resolve(dirname(fileURLToPath(import.meta.url)), "..");
const output = [
  "# Referência de endpoints do ClickUp",
  "",
  "Este arquivo é gerado por `npm run api:generate`. Os IDs dos exemplos são fictícios.",
  "Cada seção corresponde a um endpoint das especificações oficiais v2 ou v3.",
  "Consulte [o guia de uso](README.md) para autenticação, flags, uploads, paginação,",
  "confirmações e limites de acesso. Os schemas integrais são consultados com `api describe`.",
  "",
  "## Operações",
  "",
];
const code = (language, source) => ["```" + language, source, "```", ""];
const literal = (value) =>
  "'" + JSON.stringify(value).replaceAll("'", "'\\''") + "'";
for (const operation of operations) {
  const input = operationExample(operation);
  z.strictObject(operationShape(operation)).parse(input);
  const contract = [];
  for (const parameter of operation.parameters.filter((p) => p.in !== "header"))
    contract.push(
      `| \`${parameter.in}.${parameter.name}\` | \`${parameter.schema.type ?? "união"}\` | ${parameter.required ? "sim" : "não"} |`,
    );
  if (operation.request.content)
    contract.push(
      `| \`body\` | objeto conforme \`api describe\` | ${operation.request.required ? "sim" : "não"} |`,
    );
  if (input.files)
    contract.push("| `files` | array de arquivos em base64 | sim |");
  if (operation.method === "DELETE")
    contract.push("| `confirm` | boolean, somente `true` | sim |");
  for (const channel of ["cli", "mcp"]) {
    const name =
      channel === "cli" ? `clickupfy api ${operation.cli}` : operation.tool;
    output.push(
      `### \`${name}\``,
      "",
      `A operação \`${operation.id}\` pertence ao grupo \`${operation.group}\` e usa`,
      `\`${operation.method} /api/${operation.version}${operation.path}\`.`,
      "",
      operation.readOnly
        ? "A chamada consulta o recurso sem modificá-lo."
        : "A chamada altera o recurso indicado pelos parâmetros. Confira o resultado com a consulta correspondente antes de continuar.",
      "",
      "A resposta preserva o JSON da API; respostas sem corpo retornam `{}`.",
      operation.authenticated
        ? "A API key do perfil precisa ter acesso ao recurso. As permissões e o plano do Workspace podem restringir o endpoint."
        : "Esta operação OAuth recebe as credenciais do aplicativo no corpo e não usa a API key do perfil.",
      operation.deprecated
        ? "O fornecedor marca este endpoint como obsoleto; ele permanece disponível para compatibilidade."
        : "Os campos omitidos são tratados pelo servidor do ClickUp, sem padrões adicionais do cliente.",
      "",
      "[Referência oficial](" + operation.documentation + ").",
      "",
    );
    if (contract.length)
      output.push(
        "| Entrada | Tipo | Obrigatória |",
        "| --- | --- | --- |",
        ...contract,
        "",
      );
    else output.push("Este endpoint não exige parâmetros de recurso.", "");
    if (channel === "mcp")
      output.push(
        "`account` é opcional e usa o perfil ativo ou fixado no MCP. O retorno aparece em",
        "`content` como JSON; recusas retornam `isError: true`. Ferramentas de escrita",
        "ficam ausentes em `--read-only`. IDs explícitos devem respeitar a hierarquia fixada.",
        "",
      );
    else
      output.push(
        "O comando aceita as flags comuns de `api`: `--input`, `--path`, `--query`,",
        "`--body`, `--body-file`, `--content-type`, `--file`, `--dry-run` e `--yes`.",
        "A referência completa de tipos, campos aninhados e valores permitidos está no comando `describe` abaixo.",
        "",
      );
    output.push("Exemplos:", "");
    if (channel === "cli") {
      output.push(
        "Consulte o contrato antes de preencher os IDs reais:",
        "",
        ...code("bash", `clickupfy api describe ${operation.cli}`),
      );
      output.push(
        "Valide uma entrada em arquivo sem enviar uma requisição:",
        "",
        ...code(
          "bash",
          `clickupfy api ${operation.cli} --input entrada.json --dry-run`,
        ),
      );
      output.push(
        "Use um envelope JSON pelo stdin:",
        "",
        ...code(
          "bash",
          `printf '%s' ${literal(input)} | clickupfy api ${operation.cli} --input -`,
        ),
      );
      output.push(
        "Selecione o perfil que tem acesso ao recurso:",
        "",
        ...code(
          "bash",
          `clickupfy --account produto api ${operation.cli} --input entrada.json`,
        ),
      );
      output.push(
        "Grave a resposta JSON para conferência. O arquivo de entrada usa o envelope do exemplo anterior:",
        "",
        ...code(
          "bash",
          `clickupfy --json api ${operation.cli} --input entrada.json > resposta.json`,
        ),
      );
    } else {
      output.push(
        "Use o perfil ativo com o envelope mínimo:",
        "",
        ...code(
          "json",
          JSON.stringify({ name: operation.tool, arguments: input }, null, 2),
        ),
      );
      output.push(
        "Direcione a chamada ao perfil de desenvolvimento:",
        "",
        ...code(
          "json",
          JSON.stringify(
            { name: operation.tool, arguments: { ...input, account: "dev" } },
            null,
            2,
          ),
        ),
      );
      output.push(
        "Use o perfil do produto, quando o MCP permitir selecionar outro perfil:",
        "",
        ...code(
          "json",
          JSON.stringify(
            {
              name: operation.tool,
              arguments: { ...input, account: "produto" },
            },
            null,
            2,
          ),
        ),
      );
      output.push(
        "Consulte o schema antes de compor uma chamada pelo agente:",
        "",
        ...code("bash", `clickupfy api describe ${operation.tool}`),
      );
      output.push(
        "Reproduza pelo CLI a entrada usada pelo agente, sem executar a operação:",
        "",
        ...code(
          "bash",
          `printf '%s' ${literal(input)} | clickupfy api ${operation.cli} --input - --dry-run`,
        ),
      );
    }
  }
}
const path = resolve(root, "docs/api/REFERENCE.md");
const text = output.join("\n");
if (process.argv.includes("--check")) {
  if ((await readFile(path, "utf8")) !== text)
    throw new Error("Referência divergente. Execute npm run api:generate.");
} else await writeFile(path, text);
console.log(
  `Referência: ${operations.length} comandos e ${operations.length} ferramentas, com cinco exemplos por interface.`,
);
