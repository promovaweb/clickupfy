# Registre tempo de trabalho

## Classificação

| Campo | Valor |
| --- | --- |
| Natureza | normativo |
| Escopo | início, consulta e encerramento de time entries |
| Autoridade | comandos e ferramentas de time tracking |

## Consulte antes de iniciar

```bash
clickupfy time current
```

Essa leitura evita iniciar um segundo registro enquanto outro item permanece
em execução. Se houver um time entry ativo, confirme a tarefa e decida se ele
deve continuar ou ser encerrado. Sem cronômetro, a resposta traz
`entry: null` e sai com exit code 0.

## Inicie um registro

```bash
clickupfy time start \
  --task <task-id> \
  --description "Implementação e testes"
```

Use uma descrição curta e observável. O registro fica com o usuário
autenticado pelo perfil selecionado.

O ClickUp mantém um cronômetro por usuário. Se outro cronômetro estiver ativo
em outra tarefa, `time start` faz a troca, avisa no stderr e devolve a tarefa
anterior em `previous`. Esse objeto traz `id`, `taskId`, `taskName`,
`description` e `start`.

Em um fluxo com agente, inicie o tempo somente quando a implementação realmente
começar. Leitura inicial, esclarecimento e espera por autorização não devem ser
registrados automaticamente sem uma convenção explícita do projeto.

## Encerre o registro

```bash
clickupfy time stop
```

Depois, consulte novamente:

```bash
clickupfy time current
```

A ausência de registro em execução confirma o encerramento. `time stop` sem
cronômetro ativo sai com exit code 5 e a mensagem do ClickUp.

## Use outro perfil em uma operação

```bash
clickupfy --account cliente-a time current
clickupfy --account cliente-a time start \
  --task <task-id> \
  --description "Correção e regressão"
```

Essa seleção não altera o perfil ativo. É útil quando dois projetos usam
workspaces diferentes na mesma máquina.

## Relação com comentários e status

Time tracking não muda status nem publica comentário. As três ações representam
registros diferentes:

- status indica a etapa no fluxo
- comentário registra um evento legível pelos participantes da tarefa
- time entry mede o período atribuído ao trabalho.

A skill de implementação coordena essas ações, mas cada mutação continua
explícita e verificável.

Continue em [skills para agentes](agentes.md).
