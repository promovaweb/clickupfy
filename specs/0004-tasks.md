# 0004 Tarefas e tags

Status: draft

## Goal

Tarefas são o centro do uso do ClickUpfy por pessoas e agentes.

## Behavior

`task list|get|search|create|update|delete`, `task add-tag|remove-tag` e `tag list|create|update|delete` com as options do 0.9.0 (`--markdown-content`, `--parent`, `--start-date`, `--points`, status, prioridade, responsáveis). `task get` traz a fila de subtarefas e checklists. `task delete` pede confirmação no terminal. Corrigir a data do `--start-date` gravada como meia-noite UTC.

## Design

Módulo `src/clickup/tasks.ts` e `src/clickup/tags.ts`. Referência: `legacy/src/work-items.ts`, `legacy/src/tags.ts`, `legacy/src/tags-cli.ts`.

## Surface

- Adiciona os commands `task` e `tag` com seus verbos.
- Adiciona as tools `clickupfy_tasks_list`, `clickupfy_task_get`, `clickupfy_tasks_search`, `clickupfy_task_create`, `clickupfy_task_update`, `clickupfy_task_delete`, `clickupfy_task_add_tag`, `clickupfy_task_remove_tag`, `clickupfy_tags_list`, `clickupfy_tag_create`, `clickupfy_tag_update` e `clickupfy_tag_delete`.

## Tasks

- [ ] Commands de tarefa e tag `#termfy-command-set`
- [ ] Tools de tarefa e tag `#termfy-mcp`

## Tests

- [ ] `task create --json` com API fake
- [ ] `--start-date` grava o início do dia no fuso local
- [ ] `task delete` sem `--yes` fora de TTY sai com exit 2

## Notes

- 2026-11-13: criada como draft na entrevista do CLISPEC; options detalhadas na `termfy-spec`.
