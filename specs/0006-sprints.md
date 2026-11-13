# 0006 Sprints

Status: draft

## Goal

Planejar e acompanhar Sprints existentes sem trocar a List principal das tarefas.

## Behavior

`sprint list|current|get|tasks|add-task|remove-task|set-points` com as options do 0.9.0, identificando Sprints pelo período configurado.

## Design

Módulo `src/clickup/sprints.ts`. Referência: `legacy/src/sprints.ts`.

## Surface

- Adiciona o command `sprint` com seus verbos.
- Adiciona as tools `clickupfy_sprints_list`, `clickupfy_sprint_current`, `clickupfy_sprint_get`, `clickupfy_sprint_tasks`, `clickupfy_sprint_add_task`, `clickupfy_sprint_remove_task` e `clickupfy_sprint_set_points`.

## Tasks

- [ ] Commands `#termfy-command-set`
- [ ] Tools `#termfy-mcp`

## Tests

- [ ] `sprint current` com mais de uma Sprint ativa sai com erro claro

## Notes

- 2026-11-13: criada como draft na entrevista do CLISPEC; options detalhadas na `termfy-spec`.
