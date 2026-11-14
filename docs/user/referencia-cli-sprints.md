# Referência do CLI: Sprints e Sprint Points

## Classificação

| Campo | Valor |
| --- | --- |
| Natureza | referência |
| Escopo | consulta, relatório, associação de tarefas e Sprint Points no terminal |
| Autoridade | `src/operations/cli.ts`, `src/clickup/sprints.ts` e os endpoints públicos do ClickUp usados pelo ClickUpfy |

No ClickUpfy, uma Sprint é uma List dentro de um Sprint Folder que possui
`start_date` e `due_date`. Uma List comum do mesmo Folder não entra no resultado
por padrão. O CLI não cria Sprints, não habilita o ClickApp de Sprints e não
altera datas de um ciclo: essas operações continuam na interface do ClickUp.

O estado de cada Sprint (`planned`, `active` ou `completed`) é calculado contra
uma data de referência: hoje ou o dia informado em `--at <AAAA-MM-DD>`. A data é
lida ao meio-dia UTC, portanto o resultado não muda com o fuso da máquina.
`--at` muda somente o cálculo; ele não altera a Sprint nem suas tarefas.

Em JSON, as listas vêm dentro de um objeto, como `{ "sprints": [] }` e
`{ "tasks": [] }`. O erro carrega o exit code em `error.code`.

## Consulta de ciclos

### `clickupfy sprint list --folder <id>`

Lista Sprints identificadas pelo período. `--folder` é obrigatória no CLI; no
MCP, o Sprint Folder fixado é o padrão. Use `--include-regular` para diagnosticar
um Folder misto e `--archived` para incluir Lists arquivadas.

| Parâmetro | Obrigatório | Uso |
| --- | --- | --- |
| `--folder <id>` | sim | Sprint Folder consultado. |
| `--archived` | não | Inclui Lists arquivadas. |
| `--include-regular` | não | Inclui Lists sem período configurado. |
| `--at <AAAA-MM-DD>` | não | Data usada no cálculo do estado. |

Exemplos:

```bash
clickupfy sprint list --folder 4001
```

```bash
clickupfy sprint list --folder 4001 --at 2026-11-13
```

```bash
clickupfy sprint list --folder 4001 --include-regular
```

```bash
clickupfy sprint list --folder 4001 --archived --include-regular
```

```bash
clickupfy sprint list --folder 4001 --at 2026-12-01 --account produto --json
```

Em `--json`, `data` traz `{ sprints: [] }` e cada Sprint tem `id`, `name`,
`startDate`, `dueDate`, `status`, `taskCount` e `isSprint`. Uma List sem início
ou término aparece somente com `--include-regular`; ela não deve ser tratada como
Sprint. Guarde o ID de uma Sprint retornada para os comandos de relatório e
associação. Sem `--folder`, o comando sai com `2`.

### `clickupfy sprint current --folder <id>`

Encontra a única Sprint cujo período inclui a data atual ou a data indicada por
`--at`. Sem Sprint ativa, o comando sai com `6`. Com mais de uma Sprint ativa,
sai com `2`, lista as candidatas na mensagem e devolve
`error.details.candidates[]` no JSON. Essa falha protege o planejamento contra
uma seleção arbitrária.

| Parâmetro | Obrigatório | Uso |
| --- | --- | --- |
| `--folder <id>` | sim | Sprint Folder consultado. |
| `--at <AAAA-MM-DD>` | não | Data usada para localizar a Sprint. |

Exemplos:

```bash
clickupfy sprint current --folder 4001
```

```bash
clickupfy sprint current --folder 4001 --at 2026-11-13
```

```bash
clickupfy sprint current --folder 4001 --at 2026-12-01
```

```bash
clickupfy sprint current --folder 4001 --account produto
```

```bash
clickupfy sprint current --folder 5001 --at 2026-10-15 --account cliente-a --json
```

Corrija datas sobrepostas no ClickUp quando o comando falhar. Não passe uma List
comum para `sprint get` como alternativa: o relatório depende do período da
Sprint.

### `clickupfy sprint get <sprint-id>`

Mostra período, estado temporal, total de tarefas, distribuição por status e
progresso por quantidade e por Sprint Points. `--at` muda a leitura temporal,
sem alterar a Sprint nem suas tarefas.

| Parâmetro | Obrigatório | Uso |
| --- | --- | --- |
| `<sprint-id>` | sim | Sprint a analisar. |
| `--at <AAAA-MM-DD>` | não | Data usada no cálculo do estado. |

Exemplos:

```bash
clickupfy sprint get 901328052926
```

```bash
clickupfy sprint get 901328052926 --at 2026-11-13
```

```bash
clickupfy sprint get 901328060001
```

```bash
clickupfy sprint get 901328052926 --account produto
```

```bash
clickupfy sprint get 901328060002 --at 2026-12-01 --account cliente-a --json
```

O `data` traz a Sprint com `totalTasks`, `completedTasks`, `openTasks`,
`totalPoints`, `completedPoints`, `unestimatedTasks`, `taskCompletionPercent`,
`pointsCompletionPercent` e `tasksByStatus`. Uma tarefa sem Points entra no total
de tarefas, mas não adiciona peso ao progresso por pontos. Consulte `sprint
tasks` para inspecionar as tarefas que compõem esses números. Uma List sem
período no lugar de `<sprint-id>` sai com `2`.

### `clickupfy sprint tasks <sprint-id>`

Lista tarefas associadas à Sprint. Por padrão, inclui tarefas concluídas.
`--open-only` omite itens fechados e serve para a fila de trabalho atual, não
para conferir o resultado final do ciclo.

| Parâmetro | Obrigatório | Uso |
| --- | --- | --- |
| `<sprint-id>` | sim | Sprint consultada. |
| `--open-only` | não | Omite tarefas concluídas. |

Exemplos:

```bash
clickupfy sprint tasks 901328052926
```

```bash
clickupfy sprint tasks 901328052926 --open-only
```

```bash
clickupfy sprint tasks 901328060001
```

```bash
clickupfy sprint tasks 901328052926 --open-only --account produto
```

```bash
clickupfy sprint tasks 901328060002 --account cliente-a --json
```

O CLI devolve `{ tasks: [] }` com as tarefas completas da API. As tools MCP
devolvem linhas compactas com `id`, `custom_id`, `name`, `status`, `priority`,
`points`, `assignees`, `start_date`, `due_date` e `url`. Para obter descrição,
subtarefas e checklist items de uma tarefa, execute
`clickupfy task get <task-id>`.

## Alterações no planejamento

### `clickupfy sprint add-task <sprint-id> <task-id>`

Associa uma tarefa existente a uma Sprint sem trocar sua List principal. Isso
permite manter a tarefa no backlog e no ciclo atual ao mesmo tempo. A operação
não cria cópia, não move a tarefa e não modifica status. O `data` traz
`{ sprintId, taskId, added }`.

| Parâmetro | Obrigatório | Uso |
| --- | --- | --- |
| `<sprint-id>` | sim | Sprint de destino. |
| `<task-id>` | sim | Tarefa que será associada. |

Exemplos:

```bash
clickupfy sprint add-task 901328052926 86abc123
```

```bash
clickupfy sprint add-task 901328052926 77def456
```

```bash
clickupfy sprint add-task 901328052926 86abc123 --account produto
```

```bash
clickupfy sprint add-task 901328060002 55ghi789 --account cliente-a
```

```bash
clickupfy sprint add-task 901328052926 99jkl012 --json
```

Reler `sprint tasks <sprint-id>` confirma a associação. Só execute essa ação
quando o planejamento da Sprint estiver no escopo autorizado.

### `clickupfy sprint remove-task <sprint-id> <task-id>`

Remove a associação entre tarefa e Sprint. A tarefa continua existindo na List
principal e não perde seus comentários, checklist, tempo ou histórico. O `data`
traz `{ sprintId, taskId, removed }`.

| Parâmetro | Obrigatório | Uso |
| --- | --- | --- |
| `<sprint-id>` | sim | Sprint cuja associação será removida. |
| `<task-id>` | sim | Tarefa associada. |

Exemplos:

```bash
clickupfy sprint remove-task 901328052926 86abc123
```

```bash
clickupfy sprint remove-task 901328052926 77def456
```

```bash
clickupfy sprint remove-task 901328052926 86abc123 --account produto
```

```bash
clickupfy sprint remove-task 901328060002 55ghi789 --account cliente-a
```

```bash
clickupfy sprint remove-task 901328052926 99jkl012 --json
```

Para excluir uma tarefa, use `task delete` apenas com autorização explícita. Para
confirmar que a associação saiu, releia a Sprint e a tarefa depois desta
operação.

### `clickupfy sprint set-points <task-id> <points>`

Define Sprint Points de uma tarefa com um número igual ou maior que zero. O
ClickUpfy não interpreta a escala: o responsável pelo planejamento define o
que cada valor (`1`, `2`, `3`, `5` e outros) representa em tamanho, esforço ou
complexidade.

| Parâmetro | Obrigatório | Uso |
| --- | --- | --- |
| `<task-id>` | sim | Tarefa que receberá pontos. |
| `<points>` | sim | Número não negativo. |

Exemplos:

```bash
clickupfy sprint set-points 86abc123 0
```

```bash
clickupfy sprint set-points 86abc123 1
```

```bash
clickupfy sprint set-points 86abc123 3
```

```bash
clickupfy sprint set-points 86abc123 5 --account produto
```

```bash
clickupfy sprint set-points 77def456 8 --account cliente-a --json
```

Pontos negativos saem com `2`, sem chamar a API. O `data` traz a tarefa
atualizada. `task update <task-id> --points <n>` altera o mesmo campo; use apenas
uma das interfaces por alteração e releia a tarefa para confirmar o valor gravado.
