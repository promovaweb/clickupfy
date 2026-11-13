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
deve continuar ou ser encerrado.

## Inicie um registro

```bash
clickupfy time start \
  --task <task-id> \
  --description "Implementação e testes"
```

Use uma descrição curta e observável. O registro pertence ao usuário
autenticado pelo account selecionado.

Em um fluxo com agente, inicie o tempo somente quando a implementação realmente
começar. Leitura inicial, esclarecimento e espera por autorização não devem ser
registrados automaticamente sem uma regra explícita da equipe.

## Encerre o registro

```bash
clickupfy time stop
```

Depois, consulte novamente:

```bash
clickupfy time current
```

A ausência de registro em execução confirma o encerramento.

## Use outro account em uma operação

```bash
clickupfy --account cliente-a time current
clickupfy --account cliente-a time start \
  --task <task-id> \
  --description "Correção e regressão"
```

Essa seleção não altera o account ativo. É útil quando dois projetos usam
workspaces diferentes na mesma máquina.

## Relação com comentários e status

Time tracking não muda status nem publica comentário. As três ações representam
evidências diferentes:

- status indica a etapa no fluxo
- comentário registra um evento legível pela equipe
- time entry mede o período atribuído ao trabalho.

A skill de implementação coordena essas ações, mas cada mutação continua
explícita e verificável.

Continue em [skills para agentes](agentes.md).
