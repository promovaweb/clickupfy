# Referência do CLI: Sprints e Sprint Points

## Classificação

| Campo | Valor |
| --- | --- |
| Natureza | referência |
| Escopo | consulta, relatório, associação de tarefas e Sprint Points no terminal |
| Autoridade | `src/cli.ts`, `src/sprints.ts` e endpoints públicos do ClickUp usados pelo ClickUpfy |

No ClickUpfy, uma Sprint é uma List dentro de um Sprint Folder que possui
`start_date` e `due_date`. Uma List comum do mesmo Folder não entra no resultado
por padrão. O CLI não cria Sprints, não habilita o ClickApp de Sprints e não
altera datas de um ciclo: essas operações continuam na interface do ClickUp.

## Consulta de ciclos

### `clickupfy sprint list --folder <id>`

Lista Sprints identificadas pelo período. `--folder` é obrigatório. Use
`--include-regular` para diagnosticar um Folder misto e `--archived` para
incluir Lists arquivadas. `--at` recebe uma data `AAAA-MM-DD` para calcular o
estado do ciclo naquela data.

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
clickupfy sprint list --folder 4001 --at 2026-08-10
```

```bash
clickupfy sprint list --folder 4001 --include-regular
```

```bash
clickupfy sprint list --folder 4001 --archived --include-regular
```

```bash
clickupfy --account produto --json sprint list --folder 4001 --at 2026-09-01
```

Uma List sem início ou término aparece somente com `--include-regular`; ela não
deve ser tratada como Sprint. Guarde o ID de uma Sprint retornada para os
comandos de relatório e associação.

### `clickupfy sprint current --folder <id>`

Encontra a única Sprint cujo período inclui a data atual ou a data indicada por
`--at`. A consulta falha quando não existe ciclo ativo ou quando dois ciclos se
sobrepõem; essa falha protege o planejamento contra uma seleção arbitrária.

| Parâmetro | Obrigatório | Uso |
| --- | --- | --- |
| `--folder <id>` | sim | Sprint Folder consultado. |
| `--at <AAAA-MM-DD>` | não | Data usada para localizar a Sprint. |

Exemplos:

```bash
clickupfy sprint current --folder 4001
```

```bash
clickupfy sprint current --folder 4001 --at 2026-08-10
```

```bash
clickupfy sprint current --folder 4001 --at 2026-09-01
```

```bash
clickupfy --account produto sprint current --folder 4001
```

```bash
clickupfy --account cliente-a --json sprint current --folder 5001 --at 2026-10-15
```

Corrija datas sobrepostas no ClickUp quando o comando falhar. Não passe uma
List comum para `sprint get` como alternativa: o relatório depende do período
da Sprint.

### `clickupfy sprint get <sprint-id>`

Mostra período, estado temporal, total de tarefas, distribuição de status e
progresso por quantidade e por Sprint Points. `--at` muda a leitura temporal,
sem alterar a Sprint nem suas tarefas.

| Parâmetro | Obrigatório | Uso |
| --- | --- | --- |
| `<sprint-id>` | sim | Sprint a analisar. |
| `--at <AAAA-MM-DD>` | não | Data usada no cálculo do estado. |

Exemplos:

```bash
clickupfy sprint get sprint-10
```

```bash
clickupfy sprint get sprint-10 --at 2026-08-10
```

```bash
clickupfy sprint get sprint-11
```

```bash
clickupfy --account produto sprint get sprint-10
```

```bash
clickupfy --account cliente-a --json sprint get sprint-22 --at 2026-09-01
```

Uma tarefa sem Points entra no total de tarefas, mas não adiciona peso ao
progresso por pontos. Consulte `sprint tasks` para inspecionar as tarefas que
compõem esses números.

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
clickupfy sprint tasks sprint-10
```

```bash
clickupfy sprint tasks sprint-10 --open-only
```

```bash
clickupfy sprint tasks sprint-11
```

```bash
clickupfy --account produto sprint tasks sprint-10 --open-only
```

```bash
clickupfy --account cliente-a --json sprint tasks sprint-22
```

O retorno é um resumo de tarefas. Para obter descrição, subtarefas e checklist
items de uma tarefa, execute `clickupfy task get <task-id>`.

## Alterações no planejamento

### `clickupfy sprint add-task <sprint-id> <task-id>`

Associa uma tarefa existente a uma Sprint sem trocar sua List principal. Isso
permite manter a tarefa no backlog e no ciclo atual ao mesmo tempo. A operação
não cria cópia, não move a tarefa e não modifica status.

| Parâmetro | Obrigatório | Uso |
| --- | --- | --- |
| `<sprint-id>` | sim | Sprint de destino. |
| `<task-id>` | sim | Tarefa que será associada. |

Exemplos:

```bash
clickupfy sprint add-task sprint-10 86abc123
```

```bash
clickupfy sprint add-task sprint-10 77def456
```

```bash
clickupfy --account produto sprint add-task sprint-10 86abc123
```

```bash
clickupfy --account cliente-a sprint add-task sprint-22 55ghi789
```

```bash
clickupfy --json sprint add-task sprint-10 99jkl012
```

Reler `sprint tasks <sprint-id>` confirma a associação. Só execute essa ação
quando o planejamento da Sprint estiver no escopo autorizado.

### `clickupfy sprint remove-task <sprint-id> <task-id>`

Remove a associação entre tarefa e Sprint. A tarefa continua existindo na List
principal e não perde seus comentários, checklist, tempo ou histórico.

| Parâmetro | Obrigatório | Uso |
| --- | --- | --- |
| `<sprint-id>` | sim | Sprint cuja associação será removida. |
| `<task-id>` | sim | Tarefa associada. |

Exemplos:

```bash
clickupfy sprint remove-task sprint-10 86abc123
```

```bash
clickupfy sprint remove-task sprint-10 77def456
```

```bash
clickupfy --account produto sprint remove-task sprint-10 86abc123
```

```bash
clickupfy --account cliente-a sprint remove-task sprint-22 55ghi789
```

```bash
clickupfy --json sprint remove-task sprint-10 99jkl012
```

Para excluir uma tarefa, use `task delete` apenas com autorização explícita.
Para confirmar que a associação saiu, releia a Sprint e a tarefa depois desta
operação.

### `clickupfy sprint set-points <task-id> <points>`

Define Sprint Points de uma tarefa. O número deve ser igual ou maior que zero.
O ClickUpfy não interpreta a escala: a equipe define se `1`, `2`, `3`, `5` ou
outros valores representam tamanho, esforço ou complexidade.

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
clickupfy --account produto sprint set-points 86abc123 5
```

```bash
clickupfy --account cliente-a --json sprint set-points 77def456 8
```

`task update <task-id> --points <n>` atualiza o mesmo campo. Use apenas uma
das interfaces por alteração e releia a tarefa para confirmar o valor salvo.
