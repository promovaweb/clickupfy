# 0004 Tarefas e tags

Status: done

## Goal

Tarefas são o centro do uso do ClickUpfy por pessoas e agentes.

## Behavior

`task list` lista uma página de até 100 tarefas de uma list, com filtros de
status, responsáveis, tarefas concluídas e página. `task search` busca em
todo o workspace do perfil, percorrendo até 100 páginas, e filtra o texto
localmente no id, custom id, nome e descrição. `task get <task-id>` devolve a
tarefa da API e a fila endereçável (`execution`) com a tarefa, os
checklists, os checklist items aninhados e as subtarefas, na ordem do
`orderindex`, cada item com `key` estável e a ação que o conclui; `--raw`
devolve só a tarefa e `--markdown` um documento Markdown único.

`task create` aceita `--list`, `--name`, `--description`,
`--markdown-content`, `--status`, `--priority` (1 a 4), `--assignee` (ids
numéricos), `--parent`, `--start-date`, `--due-date` e `--points`, e devolve
a tarefa criada com `id` e `url`. `task update` aceita os mesmos campos
(sem list, parent e responsáveis) mais `--clear-start-date` e
`--clear-due-date`, e exige ao menos um campo. Datas AAAA-MM-DD viram o
início do dia no fuso local, com `start_date_time`/`due_date_time` iguais a
`false`. `task delete` pede confirmação no terminal e exige `--yes` fora
dele. `task add-tag` e `task remove-tag` associam e desassociam uma tag,
com `--custom-task-id` para ids personalizados.

`tag list|create|update|delete` mantêm o catálogo de tags de um space;
`update` e `delete` leem a tag antes e preservam nome e cores omitidos.
`tag delete` é destrutivo.

No MCP, `listId` usa a list fixada e `spaceId` o space fixado; um id
diferente do fixado é recusado. `clickupfy_tasks_search` busca só na list
fixada; sem list fixada, busca no workspace. As listagens do MCP devolvem
linhas compactas; o `--json` do CLI devolve as tarefas completas.

## Design

- `src/clickup/tasks.ts`: funções de domínio (`listTasks`,
  `searchListTasks`, `searchWorkspaceTasks`, `getTask`, `createTask`,
  `updateTask`, `deleteTask`, `setTaskTag`, `localDayStart`,
  `summarizeTask`), a leitura da fila (`buildTaskReading`,
  `renderTaskReadingMarkdown`, exportadas para a spec 0005) e
  `taskOperations`.
- `src/clickup/tags.ts`: `listSpaceTags`, `createSpaceTag`, `findSpaceTag`,
  `updateSpaceTag`, `deleteSpaceTag` e `tagOperations`, chamando os
  endpoints `/space/{id}/tag` direto, sem o catálogo de API do 0.9.0.
- Datas: params duplicados com `only`; no CLI `startDate`/`dueDate` são
  texto AAAA-MM-DD, no MCP continuam timestamp em ms, como no 0.9.0.
- Registro em `src/operations/index.ts`, grupos `task` e `tag`.

## Surface

- Adiciona o command `task list` (alias `ls`): List the tasks of a list;
  `--list <id>`, `--status <values>`, `--assignee <values>`,
  `--include-closed`, `--page <n>`; `data` `{ tasks[] }`; exit codes 2, 3,
  4, 5, 6.
- Adiciona o command `task get`: Get a task and its addressable queue;
  `<task-id>`, `--raw`, `--markdown`; `data` `{ task, execution }`, a tarefa
  ou o Markdown; exit codes 2, 3, 4, 5, 6.
- Adiciona o command `task search`: Search tasks; `--query`, `--status`,
  `--assignee`, `--include-closed`, `--max-pages <n>`; `data`
  `{ tasks[] }`; exit codes 2, 3, 4, 5, 6.
- Adiciona o command `task create`: Create a task in a list; `--list`,
  `--name`, `--description`, `--markdown-content`, `--status`,
  `--priority`, `--assignee`, `--parent`, `--start-date`, `--due-date`,
  `--points`; `data` a tarefa criada; exit codes 2, 3, 4, 5, 6.
- Adiciona o command `task update`: Update a task; `<task-id>`, `--name`,
  `--description`, `--markdown-content`, `--status`, `--priority`,
  `--start-date`, `--clear-start-date`, `--due-date`, `--clear-due-date`,
  `--points`; `data` a tarefa atualizada; exit codes 2, 3, 4, 5, 6.
- Adiciona o command `task delete`: Delete a task permanently;
  `<task-id>`, `--yes`; `data` `{ deleted, taskId }`; exit codes 2, 3, 4,
  5, 6, 130.
- Adiciona os commands `task add-tag` e `task remove-tag`: `<task-id>`,
  `<tag-name>`, `--custom-task-id`; `data` `{ added|removed, taskId,
  tagName }`; exit codes 2, 3, 4, 5, 6.
- Adiciona o command `tag list`: `--space <id>`; `data` `{ tags[] }`; exit
  codes 2, 3, 4, 5, 6.
- Adiciona o command `tag create`: `<name>`, `--space`, `--foreground`,
  `--background`; `data` `{ created, spaceId, name }`; exit codes 2, 3, 4,
  5, 6.
- Adiciona o command `tag update`: `<tag-name>`, `--space`, `--name`,
  `--foreground`, `--background`; `data` `{ updated, spaceId, name }`; exit
  codes 2, 3, 4, 5, 6.
- Adiciona o command `tag delete`: `<tag-name>`, `--space`, `--yes`;
  `data` `{ deleted, spaceId, name }`; exit codes 2, 3, 4, 5, 6, 130.
- Adiciona as tools `clickupfy_tasks_list`, `clickupfy_task_get`,
  `clickupfy_tasks_search` e `clickupfy_tags_list` (read).
- Adiciona as tools `clickupfy_task_create`, `clickupfy_task_update`,
  `clickupfy_task_add_tag`, `clickupfy_task_remove_tag`,
  `clickupfy_tag_create` e `clickupfy_tag_update` (write) e
  `clickupfy_task_delete` e `clickupfy_tag_delete` (write, destrutivas,
  exigem `confirm: true`).

## Tasks

- [x] Commands de tarefa e tag `#termfy-command-set`
- [x] Tools de tarefa e tag `#termfy-mcp`
- [x] Documentação em `docs/cli.md` e `docs/mcp.md` `#termfy-docs`

## Tests

- [x] `task create --json` com API fake, com `id` e `url` em `data`
- [x] `--start-date` grava o início do dia no fuso local
- [x] `task delete` sem `--yes` fora de TTY sai com exit 2
- [x] `task list`, `task get` (fila, `--raw`, `--markdown`), `task search`,
  `task update` e tags de tarefa
- [x] `tag list|create|update|delete` com corpo enviado e exit codes
- [x] Tools com list e space fixados, `confirm: true` e servidor
  `--read-only`

## Notes

- 2026-11-13: criada como draft na entrevista do CLISPEC; options detalhadas na `termfy-spec`.
- 2026-11-13: entregue. Mudanças em relação ao 0.9.0:
  - `--start-date` e `--due-date` deixam de gravar meia-noite UTC (e
    23:59:59.999 UTC na entrega), que aparecia como o dia anterior em
    Brasília; agora enviam o início do dia no fuso local da máquina com
    `start_date_time`/`due_date_time` iguais a `false`.
  - Opções de lista (`--status`, `--assignee`) usam valores separados por
    vírgula em vez de vários argumentos após a option.
  - O `--json` do CLI vem no envelope `{ ok, command, data }`; listas saem
    dentro de objeto (`{ tasks[] }`, `{ tags[] }`), inclusive nas tools
    `clickupfy_tasks_list`, `clickupfy_tasks_search` e
    `clickupfy_tags_list`, que no 0.9.0 devolviam array cru. Scripts que
    leem `id` de `task create` passam a ler `data.id`.
  - `task delete`, `tag update` e `tag delete` passam a ter `data` no
    `--json`; `--raw` ou `--markdown` junto de `--json` não é mais erro.
  - Em `clickupfy_task_update`, `startDate`/`dueDate` não aceitam mais
    `null`; a remoção usa `clearStartDate`/`clearDueDate`, os mesmos
    campos de `--clear-start-date`/`--clear-due-date`.
  - Em `clickupfy_task_create`, `assignees` é lista de ids em texto
    (convertidos para número), como nos filtros de listagem.
  - `clickupfy_tasks_search` sem list fixada busca no workspace (no 0.9.0
    chamava `/list/undefined/task`).
  - `--priority` de `task update` passa a validar 1 a 4, como `task create`;
    tag inexistente em `tag update|delete` sai com 6.
  - Textos do Markdown de `task get --markdown` e os estados dos checklist
    items (`done`/`pending`) passam para inglês, como as demais mensagens
    do binário. O `checklist set` (spec 0005) reusa `buildTaskReading`, e
    os dois devolvem o item no mesmo formato.
