# 0003 Spaces, folders e lists

Status: done

## Goal

Navegar a hierarquia do workspace para achar onde criar e listar trabalho.

## Behavior

`space list` lista os spaces do workspace do perfil; `folder list --space
<id>` lista os folders; `list list --folder <id>` ou `--space <id>` lista as
lists; `list get <list-id>` mostra a list e os status. `--archived` inclui
itens arquivados. Em texto, tabela com id, nome e contagem de tarefas; no
`--json`, `{ spaces[] }`, `{ folders[] }`, `{ lists[] }` ou a list da API.
Sem `--space` em `folder list`, ou sem `--folder` e `--space` em `list list`,
sai com 2; id inexistente sai com 6. No MCP, `spaceId`, `folderId` e
`listId` são opcionais e usam o escopo fixado.

## Design

- `clickup/hierarchy.ts`: `listSpaces`, `listFolders`, `listLists`,
  `getList` (usadas também por `mcp setup`) e `hierarchyOperations`.
- Registro em `operations/index.ts`, com as descrições dos grupos.

## Surface

- Adiciona o command `space list` (alias `ls`): List the spaces of the
  workspace; `--archived`; `data` `{ spaces[] }`; exit codes 3, 4, 5, 6.
- Adiciona o command `folder list` (alias `ls`): List the folders of a
  space; `--space <id>`, `--archived`; `data` `{ folders[] }`; exit codes 2,
  3, 4, 5, 6.
- Adiciona o command `list list` (alias `ls`): List the lists of a folder or
  space; `--folder <id>`, `--space <id>`, `--archived`; `data` `{ lists[] }`;
  exit codes 2, 3, 4, 5, 6.
- Adiciona o command `list get`: Get a list and its statuses; `<list-id>`;
  `data` a list; exit codes 3, 4, 5, 6.
- Adiciona as tools `clickupfy_spaces_list`, `clickupfy_folders_list`,
  `clickupfy_lists_list` e `clickupfy_list_get` (read).

## Tasks

- [x] Funções e operações da hierarquia `#termfy-command-set`
- [x] Tools da hierarquia `#termfy-mcp`
- [x] Documentação `#termfy-docs`

## Tests

- [x] `space list --json` com API fake
- [x] `folder list` sem `--space` sai com 2
- [x] `list list` por folder e por space; sem os dois sai com 2
- [x] `list get` mostra os status; id inexistente sai com 6

## Notes

- 2026-11-13: criada como draft na entrevista do CLISPEC.
