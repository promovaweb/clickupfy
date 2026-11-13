# 0003 Spaces, folders e lists

Status: draft

## Goal

Navegar a hierarquia do workspace para achar onde criar e listar trabalho.

## Behavior

`space list|get`, `folder list|get` e `list list|get` com as options do 0.9.0, em texto e `--json`.

## Design

Módulo `src/clickup/hierarchy.ts`. Referência: `legacy/src/cli.ts` (space, folder, list).

## Surface

- Adiciona os commands `space`, `folder` e `list` com seus verbos.
- Adiciona as tools `clickupfy_spaces_list`, `clickupfy_folders_list`, `clickupfy_lists_list` e `clickupfy_list_get`.

## Tasks

- [ ] Commands da hierarquia `#termfy-command-set`
- [ ] Tools da hierarquia `#termfy-mcp`

## Tests

- [ ] `list get --json` com API fake
- [ ] ID inexistente sai com exit 6

## Notes

- 2026-11-13: criada como draft na entrevista do CLISPEC; options detalhadas na `termfy-spec`.
