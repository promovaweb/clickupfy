# Referência do CLI: tarefas, checklists, comentários e tempo

## Classificação

| Campo | Valor |
| --- | --- |
| Natureza | referência |
| Escopo | comandos de consulta e alteração de tarefas, checklists, comentários e time tracking |
| Autoridade | `src/cli.ts`, `src/work-items.ts`, `src/clickup.ts` e ajuda da versão instalada |

Os IDs deste capítulo são fictícios. Use `list get` para obter a grafia dos
status e `task get --json` para encontrar IDs de checklist items. Uma chamada
de escrita deve ser seguida por uma nova leitura do recurso alterado; a ausência
de erro não confirma que o ClickUp persistiu o valor esperado.

## Leitura de tarefas

### `clickupfy task list --list <id>`

Lista tarefas de uma List em uma página. `--list` é obrigatório porque o CLI
não lê o `.mcp.json` do projeto. `--status` aceita um ou mais nomes de status;
`--assignee` recebe um ou mais IDs de responsáveis; `--page` começa em zero.

| Parâmetro | Obrigatório | Uso |
| --- | --- | --- |
| `--list <id>` | sim | List consultada. |
| `--status <status...>` | não | Restringe aos status informados. |
| `--assignee <ids...>` | não | Restringe aos responsáveis. |
| `--include-closed` | não | Inclui tarefas concluídas. |
| `--page <n>` | não | Página, iniciando em `0`. |

Exemplos:

```bash
clickupfy task list --list 3001
```

```bash
clickupfy task list --list 3001 --status "em andamento"
```

```bash
clickupfy task list --list 3001 --status aberta "em andamento" --assignee 42
```

```bash
clickupfy task list --list 3001 --include-closed --page 0
```

```bash
clickupfy --account produto --json task list --list 3001 --page 2
```

A saída comum é uma tabela com ID, nome, status, prioridade, pontos, pessoas e
link. Use `--json` quando um script precisar de todos os campos retornados pela
API. Para encontrar uma tarefa fora de uma List conhecida, use `task search`.

### `clickupfy task get <task-id>`

Obtém uma tarefa e prepara uma fila chamada `execution`, que inclui tarefa,
subtarefas e checklist items em uma ordem estável. Sem opção de formato, imprime
uma tabela compacta da fila. `--json` mostra a estrutura; `--markdown` junta
metadados, descrição e itens em um documento; `--raw` mostra apenas a resposta
original da API. Escolha exatamente um desses formatos.

| Parâmetro | Obrigatório | Uso |
| --- | --- | --- |
| `<task-id>` | sim | Tarefa raiz a consultar. |
| `--raw` | não | Retorna somente a resposta original do ClickUp. |
| `--markdown` | não | Renderiza descrição e fila em Markdown. |
| `--json` | não | Opção global que devolve tarefa e fila estruturada. |

Exemplos:

```bash
clickupfy task get 86abc123
```

```bash
clickupfy task get 86abc123 --markdown
```

```bash
clickupfy task get 86abc123 --raw
```

```bash
clickupfy --json task get 86abc123
```

```bash
clickupfy --account produto task get 86abc123 --markdown
```

`execution.items` usa `task:<id>` para tarefas e subtarefas e
`checklist:<checklist-id>:<item-id>` para itens de checklist. `parentKey` e
`depth` preservam a relação de parentesco. Não tente combinar `--raw`,
`--markdown` e `--json`: o CLI recusa a ambiguidade de formato.

### `clickupfy task search`

Busca tarefas em todo o workspace associado ao perfil. É uma consulta
paginada, limitada por `--max-pages`, que começa em uma e aceita no máximo cem
páginas. O texto de `--query` procura nome, descrição ou ID.

| Parâmetro | Obrigatório | Uso |
| --- | --- | --- |
| `--query <texto>` | não | Termo de busca no nome, descrição ou ID. |
| `--status <status...>` | não | Filtra por status. |
| `--assignee <ids...>` | não | Filtra por responsáveis. |
| `--include-closed` | não | Inclui tarefas concluídas. |
| `--max-pages <n>` | não | Limite entre `1` e `100`; o padrão é `100`. |

Exemplos:

```bash
clickupfy task search --query "autenticação"
```

```bash
clickupfy task search --query 86abc123
```

```bash
clickupfy task search --query "API" --status "em andamento"
```

```bash
clickupfy task search --assignee 42 --include-closed --max-pages 5
```

```bash
clickupfy --account cliente-a --json task search --query "checkout" --max-pages 10
```

Se mais de uma tarefa corresponder ao pedido, apresente os IDs e nomes para a
pessoa escolher a correta antes de executar uma escrita. Em MCP de projeto, use
`clickupfy_tasks_search`: essa ferramenta é limitada à List fixa, enquanto este
comando percorre o workspace inteiro.

## Criação e atualização de tarefas

### `clickupfy task create`

Cria tarefa ou subtarefa na List indicada. `--list` e `--name` são obrigatórios.
Use `--description` para texto simples ou `--markdown-content` quando a
descrição precisa preservar Markdown. O CLI não impõe uma regra de prioridade,
status ou pontos do seu time; ele transmite valores válidos para a API.

| Parâmetro | Obrigatório | Uso |
| --- | --- | --- |
| `--list <id>` | sim | List de destino. |
| `--name <nome>` | sim | Nome da tarefa. |
| `--description <texto>` | não | Descrição em texto. |
| `--markdown-content <markdown>` | não | Descrição em Markdown. |
| `--status <status>` | não | Status inicial existente na List. |
| `--priority <n>` | não | `1` urgente, `2` alta, `3` normal, `4` baixa. |
| `--assignee <ids...>` | não | IDs numéricos das pessoas responsáveis. |
| `--parent <task-id>` | não | Cria como subtarefa da tarefa informada. |
| `--start-date <AAAA-MM-DD>` | não | Data de início. |
| `--due-date <AAAA-MM-DD>` | não | Data de entrega. |
| `--points <n>` | não | Sprint Points iguais ou maiores que zero. |

Exemplos:

```bash
clickupfy task create --list 3001 --name "Corrigir retorno da API"
```

```bash
clickupfy task create \
  --list 3001 \
  --name "Documentar autenticação" \
  --description "Explicar o fluxo de login."
```

```bash
clickupfy task create \
  --list 3001 \
  --name "Criar testes" \
  --markdown-content "## Casos\n\n- Login válido\n- Senha inválida"
```

```bash
clickupfy task create \
  --list 3001 \
  --name "Implementar refresh token" \
  --status "em andamento" \
  --priority 2 \
  --assignee 42 57 \
  --start-date 2026-08-10 \
  --due-date 2026-08-14 \
  --points 5
```

```bash
clickupfy --account produto task create \
  --list 3001 \
  --parent 86abc123 \
  --name "Cobrir expiração de sessão" \
  --markdown-content "Adicionar casos de teste para sessão expirada."
```

Consulte `clickupfy list get <list-id>` para copiar o status exato. Depois da
criação, guarde o ID devolvido e chame `task get` para confirmar pai, datas,
responsáveis e conteúdo. Não use `--parent` para mover uma tarefa existente;
ele só define o pai na criação.

### `clickupfy task update <task-id>`

Atualiza campos de uma tarefa existente. Pelo menos um campo é obrigatório.
`--clear-start-date` e `--clear-due-date` removem as respectivas datas; quando
uma flag de remoção e uma nova data aparecem juntas, a remoção prevalece.

| Parâmetro | Obrigatório | Uso |
| --- | --- | --- |
| `<task-id>` | sim | Tarefa a alterar. |
| `--name <nome>` | não | Novo nome. |
| `--description <texto>` | não | Nova descrição textual. |
| `--markdown-content <markdown>` | não | Nova descrição em Markdown. |
| `--status <status>` | não | Status existente na List. |
| `--priority <n>` | não | Prioridade de `1` a `4`. |
| `--start-date <AAAA-MM-DD>` | não | Nova data de início. |
| `--clear-start-date` | não | Remove a data de início. |
| `--due-date <AAAA-MM-DD>` | não | Nova data de entrega. |
| `--clear-due-date` | não | Remove a data de entrega. |
| `--points <n>` | não | Sprint Points não negativos. |

Exemplos:

```bash
clickupfy task update 86abc123 --status "em andamento"
```

```bash
clickupfy task update 86abc123 --name "Corrigir autenticação por token"
```

```bash
clickupfy task update 86abc123 --priority 1 --points 8
```

```bash
clickupfy task update 86abc123 --start-date 2026-08-10 --due-date 2026-08-14
```

```bash
clickupfy --account produto task update 86abc123 --markdown-content "## Entrega\n\nPublicar a documentação atualizada." --clear-due-date
```

`--description` e `--markdown-content` representam alternativas de conteúdo;
envie apenas a forma que você quer persistir. Uma atualização de status precisa
usar a grafia devolvida por `list get`. Releia a tarefa depois da escrita e
compare cada campo solicitado com o estado devolvido.

### `clickupfy task delete <task-id>`

Exclui permanentemente uma tarefa. Em terminal interativo, pede confirmação;
em automação, exige `--yes`. Leia nome, List e relação com Sprint antes de
executar. A exclusão não é uma forma de retirar a tarefa de uma Sprint: use
`sprint remove-task` para remover apenas a associação.

| Parâmetro | Obrigatório | Uso |
| --- | --- | --- |
| `<task-id>` | sim | Tarefa a excluir. |
| `--yes` | não | Confirma a exclusão sem prompt. |

Exemplos:

```bash
clickupfy task delete 86abc123
```

```bash
clickupfy task delete 86abc123 --yes
```

```bash
clickupfy --account produto task delete 86abc123
```

```bash
clickupfy --account cliente-a task delete 77def456 --yes
```

```bash
clickupfy task get 86abc123 && clickupfy task delete 86abc123 --yes
```

O último exemplo lê a tarefa no mesmo terminal, mas ainda exige que você
compare o resultado e tenha autorização explícita. No MCP, a ferramenta
equivalente exige o campo literal `confirm: true`.

## Checklists e comentários

### `clickupfy checklist create <task-id> --name <nome>`

Cria um checklist vazio em uma tarefa. Os itens são criados pelo comando
seguinte. Use um nome que indique a finalidade, como `Testes`, `Publicação` ou
`Revisão manual`.

| Parâmetro | Obrigatório | Uso |
| --- | --- | --- |
| `<task-id>` | sim | Tarefa proprietária. |
| `--name <nome>` | sim | Nome do checklist. |

Exemplos:

```bash
clickupfy checklist create 86abc123 --name "Testes"
```

```bash
clickupfy checklist create 86abc123 --name "Revisão de segurança"
```

```bash
clickupfy checklist create 77def456 --name "Publicação"
```

```bash
clickupfy --account produto checklist create 86abc123 --name "Aceite"
```

```bash
clickupfy --json checklist create 86abc123 --name "Regressão"
```

Guarde o ID retornado: `item-create` usa o ID do checklist, não o ID da tarefa.
Crie o checklist na tarefa que realmente possui os itens; uma subtarefa pode
ter checklist próprio e não deve receber os itens da tarefa pai por acidente.

### `clickupfy checklist item-create <checklist-id> --name <nome>`

Acrescenta um item aberto a um checklist. `--assignee` é opcional e recebe um
ID numérico. O comando não aceita o ID da tarefa porque o checklist já define
seu proprietário.

| Parâmetro | Obrigatório | Uso |
| --- | --- | --- |
| `<checklist-id>` | sim | Checklist que receberá o item. |
| `--name <nome>` | sim | Texto do item. |
| `--assignee <id>` | não | Pessoa responsável pelo item. |

Exemplos:

```bash
clickupfy checklist item-create check-1 --name "Executar testes unitários"
```

```bash
clickupfy checklist item-create check-1 --name "Executar build"
```

```bash
clickupfy checklist item-create check-1 --name "Revisar documentação" --assignee 42
```

```bash
clickupfy --account produto checklist item-create check-2 --name "Conferir changelog"
```

```bash
clickupfy --json checklist item-create check-3 --name "Validar publicação" --assignee 57
```

Um item deve descrever uma verificação observável, não uma promessa genérica.
Depois de criar itens, execute `task get --json` para localizar o `item-id` e
confirmar que todos começam abertos.

### `clickupfy checklist set <task-id> <checklist-id> <item-id>`

Marca um item como concluído com `--resolved` ou o reabre com `--open`. Escolha
exatamente uma flag. O ClickUpfy primeiro confirma que o item pertence à tarefa
raiz informada, grava o estado e relê a tarefa para confirmar o resultado.

| Parâmetro | Obrigatório | Uso |
| --- | --- | --- |
| `<task-id>` | sim | Tarefa raiz usada para validar a associação. |
| `<checklist-id>` | sim | Checklist proprietário. |
| `<item-id>` | sim | Item a alterar. |
| `--resolved` | condicional | Marca como concluído. |
| `--open` | condicional | Reabre o item. |

Exemplos:

```bash
clickupfy checklist set 86abc123 check-1 item-1 --resolved
```

```bash
clickupfy checklist set 86abc123 check-1 item-1 --open
```

```bash
clickupfy --account produto checklist set 86abc123 check-2 item-4 --resolved
```

```bash
clickupfy --json checklist set 77def456 check-3 item-2 --resolved
```

```bash
clickupfy checklist set 77def456 check-3 item-2 --open
```

Não use `--resolved --open` nem omita ambas: o CLI recusa as duas situações.
Um `item-id` de outro checklist também é recusado pela releitura. Marque o
item somente depois da validação correspondente.

### `clickupfy comment list --task <id>`

Lista os comentários de uma tarefa com autoria, data e texto. A API pode
representar o conteúdo em formatos diferentes; o ClickUpfy o normaliza para a
coluna `text` na tabela compacta.

Exemplos:

```bash
clickupfy comment list --task 86abc123
```

```bash
clickupfy comment ls --task 86abc123
```

```bash
clickupfy --json comment list --task 86abc123
```

```bash
clickupfy --account produto comment list --task 86abc123
```

```bash
clickupfy --account cliente-a --json comment list --task 77def456
```

Leia os comentários antes de atualizar status ou publicar outro progresso,
pois podem conter uma orientação nova. Nunca publique credenciais, dados
pessoais, URLs assinadas ou logs extensos em um comentário.

### `clickupfy comment create --task <id> --text <texto>`

Publica um comentário em uma tarefa. `--notify-all` pede ao ClickUp que notifique
todos os participantes. Use o comando para registrar início, resultado de teste,
mudança de escopo ou conclusão, sempre com informação verificável.

| Parâmetro | Obrigatório | Uso |
| --- | --- | --- |
| `--task <id>` | sim | Tarefa que receberá o comentário. |
| `--text <texto>` | sim | Conteúdo do comentário. |
| `--notify-all` | não | Notifica participantes da tarefa. |

Exemplos:

```bash
clickupfy comment create --task 86abc123 --text "Iniciei a análise da tarefa."
```

```bash
clickupfy comment create --task 86abc123 --text "Os testes unitários passaram."
```

```bash
clickupfy comment create --task 86abc123 --text "Aguardando acesso ao ambiente de homologação." --notify-all
```

```bash
clickupfy --account produto comment create --task 86abc123 --text "Documentação e ebook foram atualizados."
```

```bash
clickupfy --json comment create --task 77def456 --text "Validação final concluída." --notify-all
```

Reler `comment list` confirma que o comentário ficou na tarefa pretendida e
que o texto chegou completo. O comando não modifica status, timer ou checklist.

## Time tracking

### `clickupfy time current`

Consulta o time entry em execução no workspace associado ao perfil. Chame este
comando antes de `time start` para não iniciar outro registro sem saber qual
tarefa já está em andamento.

Exemplos:

```bash
clickupfy time current
```

```bash
clickupfy --json time current
```

```bash
clickupfy --account produto time current
```

```bash
clickupfy --account cliente-a --json time current
```

```bash
clickupfy time current && clickupfy task get 86abc123
```

Se houver entrada ativa para outra tarefa, pare e peça orientação antes de usar
`time stop`. O comando é somente leitura e não altera status ou comentários.

### `clickupfy time start --task <id>`

Inicia um time entry associado à tarefa. A descrição é opcional e deve dizer o
trabalho em curso. O registro pertence ao usuário autenticado pelo perfil e ao
workspace desse perfil.

| Parâmetro | Obrigatório | Uso |
| --- | --- | --- |
| `--task <id>` | sim | Tarefa associada ao tempo. |
| `--description <texto>` | não | Descrição curta do trabalho. |

Exemplos:

```bash
clickupfy time start --task 86abc123
```

```bash
clickupfy time start --task 86abc123 --description "Implementação"
```

```bash
clickupfy time start --task 86abc123 --description "Testes de regressão"
```

```bash
clickupfy --account produto time start --task 86abc123 --description "Revisão de documentação"
```

```bash
clickupfy --account cliente-a time start --task 77def456 --description "Correção da integração"
```

Depois da chamada, execute `time current` para confirmar o item ativo. Iniciar
um timer não muda o status da tarefa nem avisa participantes; essas ações usam
`task update` e `comment create` separadamente.

### `clickupfy time stop`

Encerra o time entry em execução no workspace do perfil. Não recebe argumento
de tarefa: ele para o registro atual. Por isso a consulta anterior é necessária
em trabalhos paralelos ou quando mais de uma pessoa usa o mesmo perfil local.

Exemplos:

```bash
clickupfy time stop
```

```bash
clickupfy --account produto time stop
```

```bash
clickupfy --account cliente-a time stop
```

```bash
clickupfy time stop && clickupfy time current
```

```bash
clickupfy --json time stop
```

O quarto exemplo verifica que não há entrada em execução após o encerramento.
Parar o tempo não fecha tarefa, não altera seus pontos e não resolve checklist
items. Registre a conclusão do trabalho nas interfaces próprias se elas também
forem autorizadas.
