# 0005 Checklists e comentários

Status: done

## Goal

Agentes publicam plano e progresso por checklist e comentário.

## Behavior

`checklist create|item-create|set` e `comment list|create` mantêm os nomes,
argumentos e options do 0.9.0. Os ids de tarefa e de checklist entram como
argumentos posicionais em `checklist`; em `comment`, a tarefa vem de
`--task`.

`checklist set` lê a tarefa raiz com subtarefas, confere se o item pertence
ao checklist informado (na tarefa ou em uma subtarefa), altera o item pelo
endpoint próprio do ClickUp e lê a tarefa de novo para confirmar o estado
gravado. Devolve o item na forma da fila de `task get`, com as ações de
concluir e reabrir prontas para CLI e MCP.

`comment list` percorre o cursor do ClickUp (25 comentários por página, o
último comentário é a referência da página seguinte), com teto de 100
páginas, e devolve cada comentário resumido em autor, data e texto.

## Design

- `src/clickup/checklists.ts`: `createChecklist`, `createChecklistItem`,
  `updateChecklistItem`, `locateChecklistItem` (procura o item na árvore de
  subtarefas e calcula `key`, `parentKey`, `depth` e `action`) e
  `setChecklistItemState`, mais `checklistOperations`.
- `src/clickup/comments.ts`: `listComments`, `summarizeComment`,
  `createComment` e `commentOperations`.
- Registro em `src/operations/index.ts`, grupos `checklist` e `comment`.
- Em `checklist set`, o CLI expõe `--resolved` e `--open` (params `only: "cli"`)
  e o MCP recebe `resolved` obrigatório (`only: "mcp"`).
- Referência: `legacy/src/work-items.ts`, `legacy/src/clickup.ts`,
  `legacy/src/cli.ts` e `legacy/src/mcp.ts`.

## Surface

| Command | Função | Options | data no `--json` | Exit codes |
| --- | --- | --- | --- | --- |
| `checklist create <task-id>` | cria checklist na tarefa | `--name` (obrigatória) | `{ checklist }` do ClickUp | 0, 2, 4, 5, 6 |
| `checklist item-create <checklist-id>` | cria item no checklist | `--name` (obrigatória), `--assignee <id>` | `{ checklist }` do ClickUp | 0, 2, 4, 5, 6 |
| `checklist set <task-id> <checklist-id> <item-id>` | marca ou reabre e confirma | `--resolved` ou `--open` | item da fila (`key`, `done`, `state`, `action`...) | 0, 2, 4, 5 (não confirmado), 6 (item fora da tarefa) |
| `comment list` (alias `ls`) | lista comentários | `--task` (obrigatória) | `{ comments[] }` com `id`, `user`, `date`, `text` | 0, 2, 4, 5, 6 |
| `comment create` | publica comentário | `--task`, `--text` (obrigatórias), `--notify-all` | `{ id, hist_id, date }` | 0, 2, 4, 5, 6 |

| Tool | Entrada | Efeito |
| --- | --- | --- |
| `clickupfy_checklist_create` | `account?`, `taskId`, `name` | write |
| `clickupfy_checklist_item_create` | `account?`, `checklistId`, `name`, `assignee?` | write |
| `clickupfy_checklist_item_set` | `account?`, `taskId`, `checklistId`, `itemId`, `resolved` | write |
| `clickupfy_comments_list` | `account?`, `taskId` | read |
| `clickupfy_comment_create` | `account?`, `taskId`, `text`, `notifyAll?` | write |

## Tasks

- [x] Commands `#termfy-command-set`
- [x] Tools `#termfy-mcp`
- [x] Documentação em `docs/cli.md` e `docs/mcp.md`

## Tests

- [x] `comment create --json` com API fake, com e sem `--notify-all`
- [x] `comment list` segue o cursor de páginas e resume os comentários
- [x] `checklist create` e `item-create` enviam o corpo esperado
- [x] `checklist set` confirma o estado numa releitura (item em subtarefa)
- [x] `checklist set` sai com 2 sem exatamente uma entre `--resolved` e `--open`, 6 para item fora da tarefa e 5 sem confirmação
- [x] Tools via MCP, inclusive `--read-only`

## Notes

- 2026-11-13: criada como draft na entrevista do CLISPEC; options detalhadas na `termfy-spec`.
- 2026-11-13: implementada. Diferenças em relação ao 0.9.0: o command de
  alterar item continua `checklist set` (é o nome do 0.9.0 e o usado pelas
  skills do Hub; `item-set` não existe). Item fora da tarefa sai com 6
  (`NOT_FOUND`) em vez de 3, que agora é erro de configuração. O `state` do
  item passa de `concluído`/`pendente` para `done`/`pending`, por regra de
  campos em inglês. `comment list --json` passa a devolver os comentários
  resumidos dentro de `{ comments }`, igual à tool, em vez do payload cru do
  ClickUp em array. As ações do item usam o nome do binário do manifesto.
