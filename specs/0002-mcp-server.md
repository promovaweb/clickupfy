# 0002 Servidor MCP compatível

Status: draft

## Goal

Os MCPs do Hub iniciam `clickupfy mcp serve --account --workspace --space --list`. O servidor precisa aceitar essa chamada, fixar o contexto e expor as tools de contexto e de perfil com os nomes atuais.

## Behavior

`mcp serve` é alias de `mcp`. As flags `--account`, `--workspace`, `--space`, `--folder`, `--list`, `--sprint-folder` e `--read-only` fixam o contexto do servidor; tools com escrita somem em `--read-only`. `mcp setup` grava entradas nomeadas no `.mcp.json` e nos clientes (claude-code, codex, gemini, opencode).

## Design

Contexto fixado em `src/mcp/context.ts`, lido por todas as tools `clickupfy_*`; um arquivo por grupo em `src/mcp/tools/`. Referência: `legacy/src/mcp.ts`, `legacy/src/mcp-setup.ts`, `legacy/src/context.ts`.

## Surface

- Altera o command `mcp`: alias `mcp serve` e options de contexto e `--read-only`.
- Adiciona o command `mcp setup`.
- Adiciona as tools `clickupfy_mcp_context`, `clickupfy_whoami`, `clickupfy_accounts_list`, `clickupfy_account_use`, `clickupfy_workspaces_list` e `clickupfy_workspace_use`.

## Tasks

- [ ] Alias e flags de contexto `#termfy-cli`
- [ ] Contexto fixado e tools de perfil `#termfy-mcp`
- [ ] `mcp setup` `#termfy-mcp-client`

## Tests

- [ ] `mcp serve --list X` com o contexto fixado em `clickupfy_mcp_context`
- [ ] `--read-only` omite tools de escrita
- [ ] Chamada do `.mcp.json` do Hub inicia sem erro

## Notes

- 2026-11-13: criada como draft na entrevista do CLISPEC; options detalhadas na `termfy-spec`.
