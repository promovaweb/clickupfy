# Trabalhe com tarefas, subtarefas e checklists

## Classificação

| Campo | Valor |
| --- | --- |
| Natureza | normativo |
| Escopo | ciclo de leitura, criação, atualização e conclusão do trabalho |
| Autoridade | comandos task, checklist e comment e fila execution |

## Leia antes de alterar

Comece pela tarefa completa:

```bash
clickupfy task get <task-id> --markdown
```

Esse formato reúne metadados, descrição, subtarefas e checklist items em um
documento. Para automação estruturada, use:

```bash
clickupfy task get <task-id> --json
```

Para obter somente a resposta original da API, sem a fila `execution`:

```bash
clickupfy task get <task-id> --raw
```

`--markdown`, `--json` e `--raw` são mutuamente exclusivos.

## Entenda a fila executável

O objeto `execution` transforma a árvore em itens ordenados. Uma chave como
`task:86abc123` identifica uma tarefa ou subtarefa. Uma chave como
`checklist:check-1:item-1` identifica um item de checklist.

O resumo informa totais abertos e concluídos. Cada item inclui `parentKey` e
`depth`, por isso um agente consegue trabalhar em uma subtarefa aninhada sem
tratá-la como item independente.

A fila é uma projeção da leitura atual, não um segundo estado. Sempre releia a
tarefa depois de uma mutação.

## Crie uma tarefa

Use Markdown na descrição quando o ClickUp ClickApp correspondente estiver
disponível:

```bash
clickupfy task create \
  --list <list-id> \
  --name "Implementar autenticação" \
  --markdown-content "Adicionar o fluxo de login e os testes." \
  --start-date 2026-08-01 \
  --due-date 2026-08-05
```

Datas aceitam o formato `AAAA-MM-DD`. Antes de criar, confira o fuso e a
política de datas da equipe.

Para criar uma subtarefa, informe o pai:

```bash
clickupfy task create \
  --list <list-id> \
  --name "Criar testes de autenticação" \
  --parent <task-id> \
  --markdown-content "Cobrir sucesso, credencial inválida e limite."
```

Subtarefas podem receber novas subtarefas. A leitura executável preserva todos
os níveis.

## Monte checklists verificáveis

Crie o checklist na tarefa e depois os itens:

```bash
clickupfy checklist create <task-id> --name "Validação"
clickupfy checklist item-create <checklist-id> --name "Executar testes unitários"
clickupfy checklist item-create <checklist-id> --name "Executar build"
```

Os itens são criados abertos. Marque um item somente depois de executar sua
verificação:

```bash
clickupfy checklist set \
  <task-id> <checklist-id> <item-id> \
  --resolved
```

Para reabrir:

```bash
clickupfy checklist set \
  <task-id> <checklist-id> <item-id> \
  --open
```

O ClickUpfy confirma primeiro que o item pertence à tarefa, grava o novo
estado e relê a tarefa. O comando só comunica sucesso quando a API devolve o
valor esperado.

## Atualize campos

```bash
clickupfy task update <task-id> --status "em andamento"
clickupfy task update <task-id> --priority 2
clickupfy task update <task-id> --start-date 2026-08-01
clickupfy task update <task-id> --due-date 2026-08-05
clickupfy task update <task-id> --points 5
```

As prioridades seguem a API do ClickUp:

| Valor | Prioridade |
| --- | --- |
| `1` | urgente |
| `2` | alta |
| `3` | normal |
| `4` | baixa |

Consulte `list get` antes de definir status. Para remover datas:

```bash
clickupfy task update <task-id> --clear-start-date
clickupfy task update <task-id> --clear-due-date
```

## Registre progresso em comentários

```bash
clickupfy comment list --task <task-id>
clickupfy comment create \
  --task <task-id> \
  --text "Testes focais passaram. Iniciando a regressão."
```

Um comentário útil registra um evento verificável: início, impedimento,
checkpoint de teste ou conclusão. Evite publicar raciocínio interno, secrets,
logs extensos ou promessas sem evidência.

## Exclua apenas com alvo confirmado

```bash
clickupfy task delete <task-id> --yes
```

A exclusão é permanente na interface do CLI e exige confirmação. Leia a
tarefa, confira List e nome e confirme se a solicitação autoriza exclusão antes
de usar `--yes`.

Quando a equipe trabalha por ciclos, continue em
[Sprints e Sprint Points](sprints.md).
