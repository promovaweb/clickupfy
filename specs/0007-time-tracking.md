# 0007 Time tracking

Status: done

## Goal

Registrar o tempo trabalhado em cada tarefa pelo terminal e pelos agentes.

## Behavior

`time current|start|stop` mantêm as options do 0.9.0 e usam o workspace
associado ao perfil (`/team/{workspace}/time_entries/...`). O envelope `data`
do ClickUp vira `{ entry }`; sem cronômetro, `time current` devolve
`{ entry: null }` com exit 0.

`time start` exige `--task`. Antes de iniciar, consulta o cronômetro atual:
quando ele roda em outra tarefa, o CLI avisa no stderr e o resultado (CLI e
MCP) traz `previous` com `id`, `taskId`, `taskName`, `description` e
`start`. A troca não é impedida, porque o ClickUp mantém um cronômetro por
pessoa e encerra o anterior sozinho. Cronômetro na mesma tarefa não gera
aviso.

## Design

- `src/clickup/time.ts`: `currentTimeEntry`, `startTimeEntry`,
  `stopTimeEntry` e `timeOperations`, com renderização em texto própria.
- O aviso sai por `ctx.warn` (stderr no CLI, descartado no MCP, que recebe
  `previous` nos dados).
- Registro em `src/operations/index.ts`, grupo `time`.
- Referência: `legacy/src/cli.ts` (time), `legacy/src/clickup.ts` e
  `legacy/src/mcp.ts`.

## Surface

| Command | Função | Options | data no `--json` | Exit codes |
| --- | --- | --- | --- | --- |
| `time current` | time entry em execução | nenhuma | `{ entry }` ou `{ entry: null }` | 0, 4, 5 |
| `time start` | inicia time entry | `--task <id>` (obrigatória), `--description <texto>` | `{ entry, previous? }` | 0, 2, 4, 5, 6 |
| `time stop` | encerra o time entry | nenhuma | `{ entry }` encerrado | 0, 4, 5 (sem cronômetro ativo) |

| Tool | Entrada | Efeito |
| --- | --- | --- |
| `clickupfy_time_current` | `account?` | read |
| `clickupfy_time_start` | `account?`, `taskId`, `description?` | write |
| `clickupfy_time_stop` | `account?` | write |

## Tasks

- [x] Commands `#termfy-command-set`
- [x] Tools `#termfy-mcp`
- [x] Documentação em `docs/cli.md` e `docs/mcp.md`

## Tests

- [x] `time current --json` sem cronômetro devolve `null` com exit 0
- [x] `time start` envia `tid` e `description` ao workspace do perfil
- [x] `time start` com cronômetro em outra tarefa avisa no stderr e devolve `previous`
- [x] `time start` na mesma tarefa não avisa
- [x] `time stop` devolve o time entry e sai com 5 sem cronômetro
- [x] Tools via MCP, inclusive `--read-only`

## Notes

- 2026-11-13: criada como draft na entrevista do CLISPEC; options detalhadas na `termfy-spec`.
- 2026-11-13: implementada. Diferenças em relação ao 0.9.0: o resultado
  deixa de ser o payload cru `{ data }` do ClickUp e passa a `{ entry }`
  (`entry: null` sem cronômetro). `time start` consulta o cronômetro antes de
  iniciar e, quando ele roda em outra tarefa, avisa no stderr e devolve
  `previous`; o 0.9.0 trocava o cronômetro sem avisar. `--task` continua
  obrigatória, como no 0.9.0; a ideia do draft de usar a tarefa do contexto
  não entrou, porque o escopo do MCP não fixa tarefa.
