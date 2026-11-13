# Planeje Sprints e Sprint Points

## Classificação

| Campo | Valor |
| --- | --- |
| Natureza | normativo |
| Escopo | consulta e planejamento de Sprints existentes |
| Autoridade | módulo de Sprints e endpoints públicos do ClickUp |

## Como o ClickUpfy reconhece uma Sprint

No ClickUp, uma Sprint é uma List dentro de um Sprint Folder. O ClickUpfy
considera Sprint uma List que possua `start_date` e `due_date`. Lists comuns
do mesmo Folder ficam fora do resultado, salvo quando
`--include-regular` for usado.

O CLI não cria Sprints nem habilita o Sprint ClickApp. Essas operações
continuam na interface do ClickUp.

## Liste os ciclos

```bash
clickupfy sprint list --folder <sprint-folder-id>
```

Para diagnóstico de um Folder misto:

```bash
clickupfy sprint list \
  --folder <sprint-folder-id> \
  --include-regular
```

Confira nome, ID, início e término. Um período ausente indica uma List comum ou
uma Sprint ainda não configurada corretamente.

## Encontre a Sprint atual

```bash
clickupfy sprint current --folder <sprint-folder-id>
```

O comando espera uma única Sprint ativa na data atual. Nenhuma Sprint ativa ou
mais de uma sobreposta produz uma falha explícita. Corrija o calendário no
ClickUp antes de automatizar a seleção.

## Leia o relatório

```bash
clickupfy sprint get <sprint-id>
clickupfy sprint tasks <sprint-id>
clickupfy sprint tasks <sprint-id> --open-only
```

O relatório percorre todas as páginas e inclui tarefas concluídas. O avanço é
calculado por quantidade de tarefas e por Sprint Points. Uma tarefa sem Points
participa da quantidade de itens, mas não acrescenta peso ao cálculo por pontos.

Use `--open-only` para a fila de trabalho corrente, não para o relatório final
da Sprint.

## Associe uma tarefa sem mover a List principal

```bash
clickupfy sprint add-task <sprint-id> <task-id>
```

A API associa a tarefa à Sprint e preserva sua List principal. Isso permite
manter backlog e ciclo como dimensões diferentes.

Para remover a associação:

```bash
clickupfy sprint remove-task <sprint-id> <task-id>
```

Essa ação não exclui a tarefa.

## Defina Sprint Points

```bash
clickupfy sprint set-points <task-id> 5
```

O mesmo campo pode ser atualizado pelo grupo de tarefas:

```bash
clickupfy task update <task-id> --points 8
```

Use a escala adotada pela equipe. O ClickUpfy transmite o número, mas não
define se ele representa complexidade, esforço ou tamanho relativo.

## Configure o MCP para Sprints

Acrescente o Folder ao projeto:

```bash
clickupfy --account produto agent install \
  --space 10 \
  --folder 20 \
  --list 30 \
  --sprint-folder 40
```

As ferramentas de Sprint podem omitir `folderId` quando esse valor está
fixado. Um ID diferente é recusado. Consultas permanecem disponíveis em
read-only. Associação e Points aparecem apenas no servidor com escrita.

Depois do planejamento, aprenda a
[registrar o tempo](time-tracking.md).
