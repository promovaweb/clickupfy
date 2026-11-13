# 0006 Sprints

Status: done

## Goal

Planejar e acompanhar Sprints existentes sem trocar a List principal das tarefas.

## Behavior

Uma Sprint é uma list de um Sprint Folder com `start_date` e `due_date`
preenchidos. Lists sem período são comuns e só aparecem em `sprint list` com
`--include-regular`. O status de cada Sprint (`planned`, `active`,
`completed`; `regular` para lists comuns) é calculado contra a data de
referência: hoje, ou `--at <AAAA-MM-DD>` (`at` no MCP), lida ao meio-dia UTC.

- `sprint current` devolve a única Sprint ativa. Sem Sprint ativa sai com 6.
  Com mais de uma, sai com 2, cita as candidatas na mensagem e as devolve em
  `error.details.candidates[]` no `--json`.
- `sprint get` soma tarefas e Sprint Points (concluídas pelo `status.type`
  `closed`), conta as tarefas sem estimativa e agrupa por status.
- `sprint tasks` lê todas as páginas da list com `include_closed=true`;
  `--open-only` descarta as concluídas.
- `sprint add-task` e `sprint remove-task` usam `POST|DELETE
  /list/{sprint}/task/{task}`, a associação a várias lists, sem trocar a
  list principal. `sprint get|tasks|add-task|remove-task` conferem antes que
  o id é de uma Sprint (com período) e saem com 2 quando não é.
- `sprint set-points` grava `points` em `PUT /task/{id}`; valor negativo ou
  não numérico sai com 2.
- No MCP, `folderId` usa o Sprint Folder fixado por `mcp serve
  --sprint-folder` e recusa outro id; sem fixação, é obrigatório.

## Design

Módulo `src/clickup/sprints.ts`: funções de domínio que recebem
`ClickUpClient` (`listSprints`, `currentSprint`, `sprintReport`,
`sprintTasks`, `addTaskToSprint`, `removeTaskFromSprint`, `setSprintPoints`,
`referenceDate`, `summarizeSprint`, `summarizeTask`) e o array
`sprintOperations`, registrado em `src/operations/index.ts` com o grupo
`sprint`. Reaproveita `listLists` e `getList` de `hierarchy.ts` e `pinned()`
de `scope.ts`. Referência: `legacy/src/sprints.ts`.

## Surface

| Command | Função | Options | data no `--json` | Exit codes |
| --- | --- | --- | --- | --- |
| `sprint list` (alias `ls`) | Sprints do folder | `--folder <id>` (obrigatória), `--archived`, `--include-regular`, `--at <date>` | `{ sprints[] }` | 2, 3, 4, 5, 6 |
| `sprint current` | Única Sprint ativa | `--folder <id>` (obrigatória), `--at <date>` | a Sprint resumida | 2, 3, 4, 5, 6 |
| `sprint get <sprint-id>` | Relatório de progresso e Sprint Points | `--at <date>` | o relatório | 2, 3, 4, 5, 6 |
| `sprint tasks <sprint-id>` | Tarefas da Sprint | `--open-only` | `{ tasks[] }` completas | 2, 3, 4, 5, 6 |
| `sprint add-task <sprint-id> <task-id>` | Associa a tarefa | nenhuma | `{ sprintId, taskId, added }` | 2, 3, 4, 5, 6 |
| `sprint remove-task <sprint-id> <task-id>` | Remove a associação | nenhuma | `{ sprintId, taskId, removed }` | 2, 3, 4, 5, 6 |
| `sprint set-points <task-id> <points>` | Define Sprint Points | nenhuma | a tarefa | 2, 3, 4, 5, 6 |

| Tool | Efeito |
| --- | --- |
| `clickupfy_sprints_list` | read |
| `clickupfy_sprint_current` | read |
| `clickupfy_sprint_get` | read |
| `clickupfy_sprint_tasks` | read (linhas compactas) |
| `clickupfy_sprint_add_task` | write |
| `clickupfy_sprint_remove_task` | write |
| `clickupfy_sprint_set_points` | write |

## Tasks

- [x] Commands `#termfy-command-set`
- [x] Tools `#termfy-mcp`
- [x] Documentação em `docs/cli.md` e `docs/mcp.md`

## Tests

- [x] `sprint current` com mais de uma Sprint ativa sai com erro claro
- [x] `sprint list` filtra lists comuns e calcula o status com `--at`
- [x] `sprint current` sem Sprint ativa sai com 6
- [x] `sprint get` calcula progresso e Sprint Points
- [x] list sem período no lugar de Sprint sai com 2
- [x] `sprint tasks` com e sem `--open-only`
- [x] `add-task`, `remove-task` e `set-points` chamam a API com o corpo certo
- [x] MCP: `folderId` padrão no Sprint Folder fixado, recusa de outro id e servidor `--read-only`

## Notes

- 2026-11-13: criada como draft na entrevista do CLISPEC; options detalhadas na `termfy-spec`.
- 2026-11-13: implementada (`tests/sprints.test.ts`, 13 testes). Diferenças em
  relação ao 0.9.0: os valores de `status` passam a ser em inglês
  (`planned`, `active`, `completed`, `regular` no lugar de `planejada`,
  `ativa`, `concluída`, `regular`); listas saem dentro de objeto
  (`{ sprints[] }`, `{ tasks[] }`) em vez de array cru; os erros ganharam
  exit codes por família (nenhuma Sprint ativa sai com 6, mais de uma ou
  list sem período sai com 2, no lugar do 1 genérico), e a mensagem de mais
  de uma Sprint ativa agora lista as candidatas. O CLI segue devolvendo as
  tarefas completas em `sprint tasks --json` e o MCP, linhas compactas.
