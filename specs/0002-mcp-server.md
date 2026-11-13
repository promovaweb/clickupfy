# 0002 Servidor MCP compatível

Status: done

## Goal

Os MCPs do Hub iniciam `clickupfy mcp serve --account --workspace --space
--list`. O servidor precisa aceitar essa chamada, fixar o contexto e expor
as tools de contexto e de perfil com os nomes do ClickUpfy 0.9.0. A spec
também cria a camada de operações que as specs seguintes usam para gerar
command e tool a partir de uma única declaração.

## Behavior

`mcp` inicia o servidor stdio; `mcp --list` descreve tools, resources e
prompts. `mcp serve` é a entrada do 0.9.0: nela `--list <id>` fixa a list do
projeto (em `mcp` o mesmo papel é de `--list-id <id>`) e `--describe` lista o
que o escopo registra. As flags `--account`, `--workspace`, `--space`,
`--folder`, `--sprint-folder` e `--read-only` valem nos dois.

Num servidor fixado, cada tool do ClickUp usa os ids fixados como padrão e
recusa outro id com `isError` e a mensagem `This MCP server is pinned to
<recurso> <id>.`. Outro `account` é recusado; workspace fixado diferente do
workspace do perfil também. Com `--read-only`, tools de escrita não aparecem.
Falhas esperadas voltam com `isError: true` e `[exit code N]` no texto.
Tools destrutivas exigem `confirm: true`.

`clickupfy_mcp_context` devolve `{ account, workspace, readOnly, scope }`.
`clickupfy_accounts_list`, `clickupfy_whoami` e `clickupfy_workspaces_list`
espelham os commands da 0001. `clickupfy_account_use` só existe sem perfil
fixado; `clickupfy_workspace_use`, sem perfil nem workspace fixados.

`mcp setup` escolhe perfil, space e list (prompt no terminal ou `--account`,
`--space`, `--list`), grava a entrada `{ command: "clickupfy", args: ["mcp",
"serve", ...] }` em `.mcp.json`, `.codex/config.toml`,
`.gemini/settings.json` e `opencode.json` (ou `opencode.jsonc`), preserva as
outras entradas e só grava o id do perfil. Nome repetido exige `--force`;
fora de TTY, sem as flags, sai com 2.

## Design

- `operations/types.ts`: `Operation` e `Param` (chave camelCase, tipo,
  posicional, option, `only`), compartilhados por CLI e MCP.
- `operations/cli.ts`: `buildCommands(ops, groups)` gera os grupos e
  subcommands; `convert()` tipa os valores; destrutivas ganham `--yes`.
- `operations/mcp.ts`: `registerOperations(registrar, ops, scope)`,
  `connectScoped()`, `toolResult()` e `toolError()`.
- `operations/render.ts`: tabela genérica para a saída texto.
- `operations/index.ts`: lista de operações e descrições dos grupos.
- `clickup/scope.ts`: `Scope`, `pinned()` e `pinnedOptional()`.
- `mcp/server.ts`: `createServer(scope)`, `describeServer(scope)` e
  `startStdioServer(scope)`.
- `mcp/tools/accounts.ts`: tools de perfil e contexto.
- `mcp/setup.ts`: `runMcpSetup()` e `writeClientEntries()`, com
  `smol-toml` e `jsonc-parser` (dependências novas, para editar TOML e JSONC
  preservando o restante).
- `cli/commands/mcp.ts`: `mcp`, `mcp serve` e `mcp setup`.

## Surface

- Altera o command `mcp`: options `--list`, `--list-id <id>`,
  `--workspace <id>`, `--space <id>`, `--folder <id>`,
  `--sprint-folder <id>`, `--read-only`; exit code 9.
- Adiciona o command `mcp serve`: Start the MCP server pinned to a project;
  `--list <id>`, opções de escopo, `--describe`; `data` do catálogo com
  `--describe`; exit code 9.
- Adiciona o command `mcp setup`: Write a pinned MCP server entry to the
  project files; `--name`, `--space`, `--list`, `--clients`, `--project`,
  `--read-only`, `--force`, `--non-interactive`; `data`
  `{ name, account, workspace, space, list, args[], files[] }`; exit codes
  2, 3, 4, 5, 6, 7, 130.
- Adiciona as tools `clickupfy_mcp_context` (read), `clickupfy_accounts_list`
  (read), `clickupfy_whoami` (network), `clickupfy_workspaces_list`
  (network), `clickupfy_account_use` (write) e `clickupfy_workspace_use`
  (write).

## Tasks

- [x] Camada de operações (CLI, MCP, render) `#termfy-cli`
- [x] Escopo fixado, alias `mcp serve` e `--read-only` `#termfy-mcp`
- [x] Tools de perfil e contexto `#termfy-mcp`
- [x] `mcp setup` com escrita atômica nos quatro clientes `#termfy-mcp-client`
- [x] Documentação em `docs/cli.md` e `docs/mcp.md` `#termfy-docs`

## Tests

- [x] `mcp serve --account work --workspace 111 --space S1 --list L1`:
  `clickupfy_mcp_context` traz o escopo e `clickupfy_list_get` usa a list
  fixada
- [x] Outro `listId` ou outro `account` volta com `isError`
- [x] Workspace fixado diferente do perfil volta com `isError`
- [x] Servidor sem escopo expõe `clickupfy_account_use` e
  `clickupfy_workspace_use`; `clickupfy_accounts_list` não traz chaves
- [x] `--read-only` omite tools de escrita
- [x] `mcp setup` grava os quatro arquivos e preserva entradas alheias;
  nome repetido sem `--force` sai com 2
- [x] Smoke test com o comando do `.mcp.json` do Hub e o perfil real

## Notes

- 2026-11-13: criada como draft na entrevista do CLISPEC.
- 2026-11-13: em `mcp`, `--list` continua sendo a listagem do esqueleto; a
  list do projeto entra por `--list-id`. Em `mcp serve`, `--list <id>`
  mantém o contrato do 0.9.0.
- 2026-11-13: as tools passam a devolver listas dentro de objetos
  (`{ spaces[] }`, `{ tasks[] }`) para preencher `structuredContent`.
