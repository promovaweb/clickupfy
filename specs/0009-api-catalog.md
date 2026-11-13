# 0009 Catálogo genérico da API

Status: done

## Goal

Cobrir endpoints que os commands dedicados não cobrem.

## Behavior

O catálogo nasce das especificações OpenAPI públicas do ClickUp, versionadas
em `api/v2.json` e `api/v3.json`, com os ajustes de `api/overrides.json`. O
gerador grava `src/api/catalog.json` (173 operações: 138 da v2 e 35 da v3),
que entra no binário; nada é baixado em tempo de execução.

- `api list` lista as operações com `id`, `cli`, `tool`, método, caminho,
  versão, grupo, `readOnly` e `deprecated`, filtrando por `--group` e
  `--read-only`.
- `api describe <operation>` devolve a operação e o JSON Schema da entrada.
- `api call <operation>` monta o envelope (`path`, `query`, `headers`,
  `body`, `contentType`, `files`) a partir de `--input` (arquivo ou `-` para
  stdin) e das options, valida contra o contrato da operação e envia uma
  única requisição ao caminho documentado, com a API key do perfil. Operações
  `DELETE` pedem confirmação no terminal ou `--yes`. `--dry-run` só valida.
- `<operation>` aceita `operationId`, nome de CLI (`v2-get-task`) ou nome da
  tool. A forma do 0.9.0, `api v2-get-task ...`, continua aceita por
  subcommands ocultos.
- No MCP, cada operação vira a tool `clickupfy_api_<versão>_<slug>`,
  registrada por padrão (como no 0.9.0); em `--read-only`, só as operações de
  leitura. Os ids fixados pelo servidor preenchem os parâmetros declarados e
  recusam outro valor.

## Design

- `scripts/generate-api.ts` (Bun): lê `api/`, resolve os `$ref` locais,
  aplica `overrides.json`, gera nomes estáveis e detecta colisões. Flags
  `--check` (falha se o catálogo divergir) e `--fetch` (baixa as
  especificações antes). Script `bun run api:generate`.
- `src/api/catalog.ts`: tipos, `apiOperations`, `findApiOperation`,
  `normalizeSchema`, `operationShape` (Zod com cache por operação; parâmetros
  fixados viram opcionais) e `operationInputSchema`.
- `src/api/execute.ts`: `applyScope`, `pinnedParams`, `serializeQuery`,
  `validateApiInput` (erros de Zod viram USAGE) e `executeApiOperation`
  (JSON, multipart, urlencoded, v2 ou v3 pelo `ClickUpClient`).
- `src/cli/commands/api.ts`: o command `api`, registrado em
  `src/cli/commands.ts`. `--file` é repetível graças à nova propriedade
  `repeatable` de `OptionDefinition` (valores unidos por NUL no parser).
- `src/mcp/tools/api.ts`: as tools do catálogo fogem do modelo `Operation`
  (schema dinâmico) e usam `connectScoped`, `toolResult` e `toolError` de
  `src/operations/mcp.ts`; registradas em `registerAll`.
- `scripts/check-docs.ts` aceita as tools do catálogo quando vêm de
  `catalog.json` e `docs/mcp.md` documenta o padrão
  `clickupfy_api_<versão>_<slug>`.

## Surface

| Command | Função | Options | data no `--json` | Exit codes |
| --- | --- | --- | --- | --- |
| `api list` (alias `ls`) | Operações do catálogo. | `--group <group>`, `--read-only` | `{ sources[], total, operations[] }` | 0 |
| `api describe <operation>` | Contrato e JSON Schema da entrada. | nenhuma | operação com `inputSchema` | 6 |
| `api call <operation>` | Valida e envia uma requisição. | `--path`, `--query`, `--body`, `--body-file`, `--input`, `--content-type`, `--file` (repetível), `--yes`, `--dry-run` | resposta da API ou `{ valid, operation, method, path }` | 2, 3, 4, 5, 6, 130 |

| Tool | Efeito |
| --- | --- |
| `clickupfy_api_<versão>_<slug>` (173) | `read` em `GET`; `write` nas demais; destrutiva em `DELETE` (`confirm: true`); só leitura em `--read-only` |

## Tasks

- [x] Gerador do catálogo `#termfy-api-import`
- [x] Commands `#termfy-cli`
- [x] Tools `#termfy-mcp`

## Tests

- [x] `api describe` de uma operação conhecida
- [x] Tools de escrita omitidas em `--read-only`
- [x] `api list` com filtros, `api call` (v2, v3, query em array, stdin,
  multipart com `--file` repetido, `--dry-run`, `--yes`), forma `api v2-*`
  do 0.9.0 e exit codes 2 e 6 (`tests/api.test.ts`)
- [x] Tools do catálogo: schema, annotations, confirmação em `DELETE` e ids
  fixados

## Notes

- 2026-11-13: criada como draft na entrevista do CLISPEC; options detalhadas na `termfy-spec`.
- 2026-11-13: entregue. Mudanças em relação ao 0.9.0: o subcommand por
  operação (`api v2-get-task`) passa a ser `api call <operation>`, e a forma
  antiga segue aceita por subcommands ocultos, fora do `--help` e do
  OpenCLI; `<operation>` também aceita `operationId` e nome da tool; a
  saída usa o envelope `{ ok, command, data }`; `api list` ganhou alias `ls`
  e saída em tabela no modo texto; operação desconhecida sai com 6 e entrada
  inválida com 2 (antes, 1); `DELETE` sem `--yes` pergunta no terminal em vez
  de falhar. Correção: nas tools, parâmetros fixados pelo servidor e
  `team_id`/`workspace_id` (preenchidos pelo perfil) ficam opcionais; no
  0.9.0 o schema os exigia e o agente precisava repeti-los. O parser passou a
  aceitar `-` como valor (`--input -`).
- 2026-11-13: documentação das tools. Uma tabela com as 173 tools deixaria o
  `docs/mcp.md` e o `--skill` com centenas de linhas, então
  `scripts/check-docs.ts` aceita as tools que vêm de `catalog.json` quando o
  `docs/mcp.md` documenta o padrão `clickupfy_api_<versão>_<slug>`; o nome de
  cada tool aparece em `api list` e `api describe`.
