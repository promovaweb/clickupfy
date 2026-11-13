# 0007 Time tracking

Status: draft

## Goal

Registrar o tempo trabalhado em cada tarefa pelo terminal e pelos agentes.

## Behavior

`time current|start|stop` com as options do 0.9.0. `time start` sem `--task` usa a tarefa informada no contexto; com cronômetro ativo em outra tarefa, avisa sem parar.

## Design

Módulo `src/clickup/time.ts`. Referência: `legacy/src/cli.ts` (time).

## Surface

- Adiciona o command `time` com seus verbos.
- Adiciona as tools `clickupfy_time_current`, `clickupfy_time_start` e `clickupfy_time_stop`.

## Tasks

- [ ] Commands `#termfy-command-set`
- [ ] Tools `#termfy-mcp`

## Tests

- [ ] `time current --json` sem cronômetro devolve `null` com exit 0

## Notes

- 2026-11-13: criada como draft na entrevista do CLISPEC; options detalhadas na `termfy-spec`.
