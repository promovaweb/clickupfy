# Referência MCP: tarefas, Sprints, checklists, comentários e tempo

## Classificação

| Campo | Valor |
| --- | --- |
| Natureza | referência |
| Escopo | ferramentas MCP de trabalho em tarefas, Sprints, checklists, comentários, time tracking e tags |
| Autoridade | `src/operations/mcp.ts`, `src/clickup/tasks.ts`, `src/clickup/sprints.ts`, `src/clickup/checklists.ts`, `src/clickup/comments.ts`, `src/clickup/time.ts`, `src/clickup/tags.ts` e os schemas registrados em `src/mcp/server.ts` |

As chamadas deste capítulo usam objetos JSON de argumentos. Valores como
`901328052926`, `86abc123` e `8cdu8-123` são apenas exemplos. Ferramentas de
escrita somem de `tools/list` quando o servidor é iniciado com `--read-only`; não
há parâmetro que contorne essa ausência. Depois de cada escrita, faça uma leitura
do recurso alterado para comparar o estado persistido.

Toda falha esperada volta com `isError: true`, a mensagem e o exit code
equivalente do CLI, como `[exit code 6]`. Toda tool aceita `account` opcional; em
um servidor com perfil fixado, outro perfil é recusado. Os IDs fixados pelo
servidor valem como padrão e um valor diferente é recusado.

As listas de tarefas em MCP saem em linhas compactas com `id`, `custom_id`,
`name`, `status`, `priority`, `points`, `assignees`, `start_date`, `due_date` e
`url`. O CLI com `--json` devolve as tarefas completas da API.

## Tarefas: leitura e busca

### `clickupfy_tasks_list`

Lista tarefas da List autorizada. Omitir `listId` usa a List fixada. Os filtros
aceitam arrays: `status` é uma lista de nomes configurados na List e `assignees`
contém IDs de pessoas em texto. `page` deve ser inteiro maior ou igual a zero.

| Campo | Tipo | Obrigatório | Uso |
| --- | --- | --- | --- |
| `account` | string | não | Perfil a resolver. |
| `listId` | string | não | List fixa do projeto quando omitido. |
| `status` | string[] | não | Filtra por um ou mais status. |
| `assignees` | string[] | não | Filtra por responsáveis. |
| `includeClosed` | booleano | não | Inclui tarefas concluídas. |
| `page` | inteiro | não | Página, iniciando em zero. |

Exemplos:

```json
{}
```

```json
{"status":["in progress"]}
```

```json
{"assignees":["42","57"],"includeClosed":false}
```

```json
{"includeClosed":true,"page":1}
```

```json
{"account":"produto","listId":"901328052926","status":["to do","in progress"]}
```

Cada página traz até 100 tarefas. Para obter descrição, subtarefas e checklist
items de uma tarefa, chame `clickupfy_task_get` com o `id` devolvido. Nunca use
um `listId` diferente do fixado pelo projeto.

### `clickupfy_task_get`

Obtém a tarefa e acrescenta `execution`, uma fila endereçável que preserva
subtarefas e checklist items. `raw` devolve somente a resposta original da API.
`markdown` devolve um texto único com descrição e itens; os dois campos são
mutuamente exclusivos e, juntos, produzem erro.

| Campo | Tipo | Obrigatório | Uso |
| --- | --- | --- | --- |
| `account` | string | não | Perfil a resolver. |
| `taskId` | string | sim | Tarefa raiz. |
| `raw` | booleano | não | Retorna somente o payload do ClickUp. |
| `markdown` | booleano | não | Renderiza tarefa e fila em Markdown. |

Exemplos:

```json
{"taskId":"86abc123"}
```

```json
{"taskId":"86abc123","markdown":true}
```

```json
{"taskId":"86abc123","raw":true}
```

```json
{"account":"produto","taskId":"86abc123"}
```

```json
{"account":"cliente-a","taskId":"77def456","markdown":true}
```

Os itens usam chaves como `task:86abc123` e
`checklist:b955c4dc:21e08dc8`. `parentKey` e `depth` preservam a árvore, e
`state` vale `done` ou `pending`. A ação `complete` de cada item mostra o comando
do CLI e a chamada MCP adequados, mas a autorização para executar essa ação
continua vindo do pedido recebido pelo agente.

### `clickupfy_tasks_search`

Busca tarefas por texto, status e responsável. Com List fixada, percorre somente
essa List, página por página; sem List fixada, percorre o workspace, como o CLI.
`maxPages` aceita inteiro entre `1` e `100`. Omitir `query` lista de acordo com os
outros filtros, portanto inclua um termo quando a intenção for uma busca nominal.

| Campo | Tipo | Obrigatório | Uso |
| --- | --- | --- | --- |
| `account` | string | não | Perfil a resolver. |
| `query` | string | não | Texto no ID, nome ou descrição. |
| `status` | string[] | não | Filtra por status. |
| `assignees` | string[] | não | Filtra por responsáveis. |
| `includeClosed` | booleano | não | Inclui tarefas concluídas. |
| `maxPages` | inteiro | não | Paginação, de `1` a `100`. |

Exemplos:

```json
{"query":"autenticação"}
```

```json
{"query":"86abc123"}
```

```json
{"query":"API","status":["in progress"]}
```

```json
{"assignees":["42"],"includeClosed":true,"maxPages":5}
```

```json
{"account":"produto","query":"checkout","maxPages":10}
```

Se duas tarefas forem plausíveis, apresente ID e nome e aguarde a escolha da
pessoa que solicitou o trabalho. A ferramenta não altera tarefa e não expande a
busca para uma List não autorizada.

### `clickupfy_comments_list`

Lê os comentários de uma tarefa, com todas as páginas da API. O retorno normaliza
usuário, data e texto para facilitar a leitura pelo agente, em
`{ comments: [] }` com `id`, `user`, `date` e `text`.

| Campo | Tipo | Obrigatório | Uso |
| --- | --- | --- | --- |
| `account` | string | não | Perfil a resolver. |
| `taskId` | string | sim | Tarefa cujos comentários serão lidos. |

Exemplos:

```json
{"taskId":"86abc123"}
```

```json
{"taskId":"77def456"}
```

```json
{"account":"produto","taskId":"86abc123"}
```

```json
{"account":"cliente-a","taskId":"77def456"}
```

```json
{"account":"homologacao","taskId":"55ghi789"}
```

Leia essa ferramenta antes de publicar mudança de status ou comentário de
progresso, e não trate um comentário antigo como instrução mais recente sem
conferir as datas. Ela não expõe anexos como conteúdo, não publica respostas e não
altera o campo de status.

## Sprints

### `clickupfy_sprints_list`

Lista Sprints dentro do Sprint Folder fixado. Uma Sprint é uma List que possui
`start_date` e `due_date`; `includeRegular` acrescenta Lists comuns ao retorno de
diagnóstico. `at` recebe uma data `AAAA-MM-DD` usada para classificar o estado do
ciclo.

| Campo | Tipo | Obrigatório | Uso |
| --- | --- | --- | --- |
| `account` | string | não | Perfil a resolver. |
| `folderId` | string | não | Sprint Folder fixado quando omitido. |
| `archived` | booleano | não | Inclui Lists arquivadas. |
| `includeRegular` | booleano | não | Inclui Lists que não são Sprints. |
| `at` | string | não | Data de referência em `AAAA-MM-DD`. |

Exemplos:

```json
{}
```

```json
{"at":"2026-11-13"}
```

```json
{"archived":true,"includeRegular":true}
```

```json
{"folderId":"4001","at":"2026-12-01"}
```

```json
{"account":"produto","folderId":"4001","includeRegular":false}
```

O objeto vazio funciona somente se o servidor recebeu `--sprint-folder`; sem
Sprint Folder fixado, `folderId` é obrigatório. O retorno é
`{ sprints: [] }` com `id`, `name`, `startDate`, `dueDate`, `status`,
`taskCount` e `isSprint`. A ferramenta não cria Sprint nem altera datas: a API
pública do ClickUp não oferece criação de Sprint por esse fluxo.

### `clickupfy_sprint_current`

Obtém a única Sprint cujo período contém a data informada ou a data atual. Se não
houver Sprint ativa, a ferramenta retorna erro com o exit code `6`; se dois
períodos se sobrepuserem, retorna erro com as candidatas em vez de escolher uma
List arbitrariamente.

| Campo | Tipo | Obrigatório | Uso |
| --- | --- | --- | --- |
| `account` | string | não | Perfil a resolver. |
| `folderId` | string | não | Sprint Folder fixado quando omitido. |
| `at` | string | não | Data de referência em `AAAA-MM-DD`. |

Exemplos:

```json
{}
```

```json
{"at":"2026-11-13"}
```

```json
{"folderId":"4001"}
```

```json
{"folderId":"4001","at":"2026-12-01"}
```

```json
{"account":"produto","folderId":"4001","at":"2026-10-15"}
```

Não use a falha como motivo para anexar tarefa a qualquer List do Folder. Corrija
datas e sobreposição no ClickUp, depois leia novamente a Sprint atual.

### `clickupfy_sprint_get`

Produz o relatório de uma Sprint. Inclui período, progresso por quantidade de
tarefas, progresso por Sprint Points e distribuição de status. `at` muda somente
o cálculo temporal da situação da Sprint.

| Campo | Tipo | Obrigatório | Uso |
| --- | --- | --- | --- |
| `account` | string | não | Perfil a resolver. |
| `sprintId` | string | sim | Sprint a analisar. |
| `at` | string | não | Data de referência em `AAAA-MM-DD`. |

Exemplos:

```json
{"sprintId":"901328052926"}
```

```json
{"sprintId":"901328052926","at":"2026-11-13"}
```

```json
{"sprintId":"901328060001"}
```

```json
{"account":"produto","sprintId":"901328052926"}
```

```json
{"account":"cliente-a","sprintId":"901328060002","at":"2026-12-01"}
```

O retorno tem `totalTasks`, `completedTasks`, `openTasks`, `totalPoints`,
`completedPoints`, `unestimatedTasks`, `taskCompletionPercent`,
`pointsCompletionPercent` e `tasksByStatus`. Uma tarefa sem Points participa do
total de tarefas, mas não adiciona peso ao cálculo por pontos. Leia
`clickupfy_sprint_tasks` para obter os itens do relatório, não tente inferi-los
apenas pelas porcentagens.

### `clickupfy_sprint_tasks`

Lista tarefas associadas a uma Sprint, incluindo concluídas por padrão.
`openOnly: true` remove tarefas já concluídas e é útil para a fila presente, mas
não substitui a lista integral usada na revisão final do ciclo.

| Campo | Tipo | Obrigatório | Uso |
| --- | --- | --- | --- |
| `account` | string | não | Perfil a resolver. |
| `sprintId` | string | sim | Sprint consultada. |
| `openOnly` | booleano | não | Omite tarefas concluídas quando vale `true`. |

Exemplos:

```json
{"sprintId":"901328052926"}
```

```json
{"sprintId":"901328052926","openOnly":true}
```

```json
{"sprintId":"901328060001"}
```

```json
{"account":"produto","sprintId":"901328052926","openOnly":false}
```

```json
{"account":"cliente-a","sprintId":"901328060002","openOnly":true}
```

A ferramenta retorna `{ tasks: [] }` em linhas compactas. Para descrição,
subtarefas e checklist items de um item específico, chame
`clickupfy_task_get` com o ID da tarefa.

## Ferramentas de escrita de trabalho

As ferramentas seguintes só aparecem fora de `--read-only`. Informe apenas campos
que devem mudar. Elas usam o mesmo perfil e as mesmas regras de isolamento das
consultas.

### `clickupfy_task_create`

Cria tarefa ou subtarefa na List fixa. `name` é obrigatório. Datas devem ser
timestamps inteiros em milissegundos, diferentemente do CLI, que aceita datas
`AAAA-MM-DD` gravadas no começo do dia local.

| Campo | Tipo | Obrigatório | Uso |
| --- | --- | --- | --- |
| `account`, `listId` | string | não | Perfil e List fixa quando omitida. |
| `name` | string | sim | Nome da tarefa. |
| `description`, `markdownContent`, `status`, `parent` | string | não | Conteúdo, status e pai. |
| `priority` | inteiro | não | De `1` a `4`. |
| `assignees` | string[] | não | IDs numéricos dos responsáveis, em texto. |
| `startDate`, `dueDate` | inteiro | não | Timestamp em milissegundos. |
| `points` | número | não | Sprint Points não negativos. |

Exemplos:

```json
{"name":"Corrigir retorno da API"}
```

```json
{"name":"Documentar login","description":"Explicar a sessão."}
```

```json
{"name":"Criar testes","markdownContent":"## Casos\n\n- Login válido"}
```

```json
{"name":"Implementar token","status":"in progress","priority":2,"assignees":["42","57"],"startDate":1763251200000,"dueDate":1763596800000,"points":5}
```

```json
{"account":"produto","listId":"901328052926","name":"Cobrir expiração","parent":"86abc123","markdownContent":"Adicionar testes de sessão expirada."}
```

Leia a tarefa criada com `clickupfy_task_get`. Para `listId`, omitir é o caminho
normal no MCP do projeto; um valor diferente do fixo é recusado.

### `clickupfy_task_update`

Atualiza campos de uma tarefa. `taskId` é obrigatório e pelo menos um campo de
alteração deve estar presente. Para remover uma data, use `clearStartDate: true`
ou `clearDueDate: true`; não envie timestamp nulo nem texto vazio.

| Campo | Tipo | Obrigatório | Uso |
| --- | --- | --- | --- |
| `account`, `taskId` | string | `taskId` sim | Perfil e tarefa. |
| `name`, `description`, `markdownContent`, `status` | string | não | Campos textuais. |
| `priority` | inteiro | não | De `1` a `4`. |
| `startDate`, `dueDate` | inteiro | não | Nova data em milissegundos. |
| `clearStartDate`, `clearDueDate` | booleano | não | Remove a data correspondente. |
| `points` | número | não | Sprint Points não negativos. |

Exemplos:

```json
{"taskId":"86abc123","status":"in progress"}
```

```json
{"taskId":"86abc123","name":"Corrigir autenticação por token"}
```

```json
{"taskId":"86abc123","priority":1,"points":8}
```

```json
{"taskId":"86abc123","startDate":1763251200000,"dueDate":1763596800000}
```

```json
{"account":"produto","taskId":"86abc123","markdownContent":"## Entrega\n\nPublicar manual atualizado.","clearDueDate":true}
```

Enviar `startDate` junto de `clearStartDate`, ou `dueDate` junto de
`clearDueDate`, produz erro. Depois da escrita, use `clickupfy_task_get`. A
ferramenta devolve a tarefa atualizada, mas a releitura é importante quando
outras alterações concorrem na mesma tarefa.

### `clickupfy_checklist_create`

Cria checklist em uma tarefa. O retorno é `{ checklist }` e fornece o ID
necessário em `clickupfy_checklist_item_create`. Itens não são criados
automaticamente.

| Campo | Tipo | Obrigatório | Uso |
| --- | --- | --- | --- |
| `account` | string | não | Perfil a resolver. |
| `taskId` | string | sim | Tarefa proprietária. |
| `name` | string | sim | Nome do checklist. |

Exemplos:

```json
{"taskId":"86abc123","name":"Testes"}
```

```json
{"taskId":"86abc123","name":"Revisão de segurança"}
```

```json
{"taskId":"77def456","name":"Publicação"}
```

```json
{"account":"produto","taskId":"86abc123","name":"Aceite"}
```

```json
{"account":"cliente-a","taskId":"77def456","name":"Regressão"}
```

### `clickupfy_checklist_item_create`

Acrescenta um item aberto a um checklist. `assignee`, quando informado, é um ID
numérico. A ferramenta não recebe `taskId` porque o checklist já define a tarefa
proprietária. O retorno é `{ checklist }` com `items[]`.

| Campo | Tipo | Obrigatório | Uso |
| --- | --- | --- | --- |
| `account` | string | não | Perfil a resolver. |
| `checklistId` | string | sim | Checklist que receberá o item. |
| `name` | string | sim | Texto do item. |
| `assignee` | inteiro | não | ID numérico da pessoa responsável. |

Exemplos:

```json
{"checklistId":"b955c4dc","name":"Executar testes unitários"}
```

```json
{"checklistId":"b955c4dc","name":"Executar build"}
```

```json
{"checklistId":"b955c4dc","name":"Revisar documentação","assignee":42}
```

```json
{"account":"produto","checklistId":"3f1a7c22","name":"Conferir changelog"}
```

```json
{"account":"cliente-a","checklistId":"3f1a7c22","name":"Validar publicação","assignee":57}
```

### `clickupfy_checklist_item_set`

Marca ou reabre um item e confirma o estado por uma nova leitura da tarefa.
`taskId` deve ser a tarefa raiz devolvida por `clickupfy_task_get`,
`resolved: true` conclui e `resolved: false` reabre.

| Campo | Tipo | Obrigatório | Uso |
| --- | --- | --- | --- |
| `account` | string | não | Perfil a resolver. |
| `taskId` | string | sim | Tarefa raiz usada na conferência. |
| `checklistId` | string | sim | Checklist proprietário. |
| `itemId` | string | sim | Item a atualizar. |
| `resolved` | booleano | sim | `true` conclui; `false` reabre. |

Exemplos:

```json
{"taskId":"86abc123","checklistId":"b955c4dc","itemId":"21e08dc8","resolved":true}
```

```json
{"taskId":"86abc123","checklistId":"b955c4dc","itemId":"21e08dc8","resolved":false}
```

```json
{"account":"produto","taskId":"86abc123","checklistId":"3f1a7c22","itemId":"8b2d7e10","resolved":true}
```

```json
{"account":"cliente-a","taskId":"77def456","checklistId":"3f1a7c22","itemId":"8b2d7e10","resolved":true}
```

```json
{"taskId":"77def456","checklistId":"3f1a7c22","itemId":"8b2d7e10","resolved":false}
```

O retorno é o item confirmado na nova leitura, com `done`, `state` e `action`.
Não passe um item de outra tarefa: a ferramenta faz essa conferência e recusa a
escrita com o exit code `6` quando a relação não corresponde à árvore lida. Se o
ClickUp não confirmar o estado, a resposta traz `isError` com o exit code `5`.

### `clickupfy_sprint_add_task`

Associa tarefa a Sprint sem trocar sua List principal. Ela não cria tarefa e não
muda seu status. A ferramenta só aparece em servidor com escrita. O retorno é
`{ sprintId, taskId, added }`.

| Campo | Tipo | Obrigatório | Uso |
| --- | --- | --- | --- |
| `account` | string | não | Perfil a resolver. |
| `sprintId` | string | sim | Sprint de destino. |
| `taskId` | string | sim | Tarefa a associar. |

Exemplos:

```json
{"sprintId":"901328052926","taskId":"86abc123"}
```

```json
{"sprintId":"901328052926","taskId":"77def456"}
```

```json
{"account":"produto","sprintId":"901328052926","taskId":"86abc123"}
```

```json
{"account":"cliente-a","sprintId":"901328060002","taskId":"55ghi789"}
```

```json
{"account":"homologacao","sprintId":"901328060003","taskId":"99jkl012"}
```

Leia `clickupfy_sprint_tasks` depois da escrita. Só associe a tarefa quando o
planejamento da Sprint estiver incluído no pedido.

### `clickupfy_sprint_remove_task`

Remove uma associação com Sprint sem excluir a tarefa. Comentários, checklist,
tempo e List principal permanecem na tarefa. O retorno é
`{ sprintId, taskId, removed }`.

| Campo | Tipo | Obrigatório | Uso |
| --- | --- | --- | --- |
| `account` | string | não | Perfil a resolver. |
| `sprintId` | string | sim | Sprint cuja associação será removida. |
| `taskId` | string | sim | Tarefa associada. |

Exemplos:

```json
{"sprintId":"901328052926","taskId":"86abc123"}
```

```json
{"sprintId":"901328052926","taskId":"77def456"}
```

```json
{"account":"produto","sprintId":"901328052926","taskId":"86abc123"}
```

```json
{"account":"cliente-a","sprintId":"901328060002","taskId":"55ghi789"}
```

```json
{"account":"homologacao","sprintId":"901328060003","taskId":"99jkl012"}
```

Use `clickupfy_task_delete` somente quando a exclusão inteira estiver
explicitamente autorizada.

### `clickupfy_sprint_set_points`

Define Sprint Points de uma tarefa. `points` é um número maior ou igual a zero. O
ClickUpfy transmite o valor; a escala pertence ao time. O retorno é a tarefa
atualizada.

| Campo | Tipo | Obrigatório | Uso |
| --- | --- | --- | --- |
| `account` | string | não | Perfil a resolver. |
| `taskId` | string | sim | Tarefa que receberá pontos. |
| `points` | número | sim | Valor não negativo. |

Exemplos:

```json
{"taskId":"86abc123","points":0}
```

```json
{"taskId":"86abc123","points":1}
```

```json
{"taskId":"86abc123","points":3}
```

```json
{"account":"produto","taskId":"86abc123","points":5}
```

```json
{"account":"cliente-a","taskId":"77def456","points":8}
```

Pontos negativos retornam `isError` sem chamar a API. Leia a tarefa com
`clickupfy_task_get` para confirmar o número persistido.

### `clickupfy_task_delete`

Exclui permanentemente uma tarefa. O campo `confirm` só aceita o literal `true`;
essa exigência impede uma exclusão causada por objeto incompleto ou ambíguo. A
ferramenta não está disponível em `--read-only`. O retorno é
`{ deleted, taskId }`.

| Campo | Tipo | Obrigatório | Uso |
| --- | --- | --- | --- |
| `account` | string | não | Perfil a resolver. |
| `taskId` | string | sim | Tarefa a excluir. |
| `confirm` | `true` | sim | Confirmação literal obrigatória. |

Exemplos:

```json
{"taskId":"86abc123","confirm":true}
```

```json
{"taskId":"77def456","confirm":true}
```

```json
{"account":"produto","taskId":"86abc123","confirm":true}
```

```json
{"account":"cliente-a","taskId":"77def456","confirm":true}
```

```json
{"account":"homologacao","taskId":"55ghi789","confirm":true}
```

Leia tarefa, nome e List e obtenha autorização explícita para exclusão antes de
qualquer exemplo deste tipo. Para somente retirar a tarefa do ciclo, use
`clickupfy_sprint_remove_task`.

### `clickupfy_comment_create`

Publica comentário em uma tarefa. `notifyAll` é opcional; ele pede ao ClickUp para
notificar participantes. A ferramenta não modifica status, timer ou checklist. O
retorno é `{ id, hist_id, date }`.

| Campo | Tipo | Obrigatório | Uso |
| --- | --- | --- | --- |
| `account` | string | não | Perfil a resolver. |
| `taskId` | string | sim | Tarefa que receberá o comentário. |
| `text` | string | sim | Conteúdo do comentário. |
| `notifyAll` | booleano | não | Pede notificação aos participantes. |

Exemplos:

```json
{"taskId":"86abc123","text":"Iniciei a análise da tarefa."}
```

```json
{"taskId":"86abc123","text":"Os testes unitários passaram."}
```

```json
{"taskId":"86abc123","text":"Aguardando acesso ao ambiente de homologação.","notifyAll":true}
```

```json
{"account":"produto","taskId":"86abc123","text":"Documentação e ebook foram atualizados."}
```

```json
{"account":"cliente-a","taskId":"77def456","text":"Validação final concluída.","notifyAll":true}
```

### `clickupfy_time_current`

Consulta o time entry que está em execução no workspace. Não recebe filtros;
omitir `account` usa o perfil fixado ou ativo. O retorno é `{ entry }`, com
`entry: null` quando não há cronômetro.

| Campo | Tipo | Obrigatório | Uso |
| --- | --- | --- | --- |
| `account` | string | não | Perfil cujo workspace será consultado. |

Exemplos:

```json
{}
```

```json
{"account":"produto"}
```

```json
{"account":"cliente-a"}
```

```json
{"account":"homologacao"}
```

```json
{"account":"suporte"}
```

### `clickupfy_time_start`

Inicia um time entry para uma tarefa. Consulte `clickupfy_time_current` antes. O
ClickUp mantém um cronômetro por pessoa: quando um já roda em outra tarefa, ele é
substituído, e a tarefa anterior volta em `previous` com `id`, `taskId`,
`taskName`, `description` e `start`.

| Campo | Tipo | Obrigatório | Uso |
| --- | --- | --- | --- |
| `account` | string | não | Perfil a resolver. |
| `taskId` | string | sim | Tarefa associada ao tempo. |
| `description` | string | não | Descrição curta do trabalho. |

Exemplos:

```json
{"taskId":"86abc123"}
```

```json
{"taskId":"86abc123","description":"Implementação"}
```

```json
{"taskId":"86abc123","description":"Testes de regressão"}
```

```json
{"account":"produto","taskId":"86abc123","description":"Revisão de documentação"}
```

```json
{"account":"cliente-a","taskId":"77def456","description":"Correção da integração"}
```

O retorno é `{ entry, previous? }`.

### `clickupfy_time_stop`

Encerra o time entry atual do workspace. Ela não recebe `taskId` e não modifica
status nem comentários. Releia `clickupfy_time_current` depois da chamada quando o
encerramento precisa ser confirmado. Sem cronômetro ativo, a resposta traz
`isError` com o exit code `5`.

| Campo | Tipo | Obrigatório | Uso |
| --- | --- | --- | --- |
| `account` | string | não | Perfil cujo registro atual será encerrado. |

Exemplos:

```json
{}
```

```json
{"account":"produto"}
```

```json
{"account":"cliente-a"}
```

```json
{"account":"homologacao"}
```

```json
{"account":"suporte"}
```

O retorno é `{ entry }` com o time entry encerrado.

## Tags de tarefas

### `clickupfy_task_add_tag`

Adiciona uma tag a uma tarefa ou subtarefa existente, preservando as outras tags.
A ferramenta está disponível somente quando o servidor permite escrita. Ela usa a
API key do perfil selecionado e respeita o perfil e o workspace fixados pelo MCP
do projeto.

| Campo | Tipo | Obrigatório | Padrão e uso |
| --- | --- | --- | --- |
| `taskId` | string | sim | ID interno da tarefa; não aceita texto vazio. |
| `tagName` | string | sim | Nome da tag; não aceita texto vazio ou composto apenas por espaços. |
| `customTaskId` | booleano | não | `false`; habilite para resolver o ID no workspace do perfil. |
| `account` | string | não | Perfil ativo ou fixado no projeto. |

Cada chamada associa um nome e retorna `{ added, taskId, tagName }` quando a API
aceita a operação. A permissão para alterar a tarefa depende da API key. Recusas
do ClickUp retornam `isError: true`; argumentos inválidos são recusados pelo
schema. Em `--read-only`, a ferramenta não é registrada. A ferramenta não gerencia
as cores ou o catálogo de tags do Space.

Exemplos:

Associe uma tag pelo ID interno:

```json
{"taskId":"86abc123","tagName":"bug"}
```

Use um nome com espaços e acentos:

```json
{"taskId":"86abc123","tagName":"em revisão"}
```

Resolva um ID personalizado no workspace configurado:

```json
{"taskId":"DEV-42","tagName":"backend","customTaskId":true}
```

Selecione outro perfil quando o servidor permitir:

```json
{"account":"produto","taskId":"77def456","tagName":"documentação"}
```

Associe uma tag a uma subtarefa pelo ID interno:

```json
{"taskId":"sub-1","tagName":"QA / revisão","customTaskId":false}
```

Depois da escrita, consulte `clickupfy_task_get` com `raw: true` e o ID interno
para conferir o campo `tags`. IDs personalizados usam `custom_task_ids=true` e
`team_id` no endpoint [Add Tag To Task](https://developer.clickup.com/reference/addtagtotask).

## Gestão do catálogo de tags

As operações usam o perfil ativo ou `account` no MCP. A API key precisa ter
acesso ao Space ou à tarefa. Falhas do ClickUp são propagadas e retornam
`isError: true`. Ferramentas de escrita não ficam disponíveis em modo somente
leitura. O MCP aceita `spaceId` ou usa o Space fixado na configuração; no CLI, o
equivalente é `--space`, obrigatório nos comandos `tag`.

### `clickupfy_tags_list`

Lista nomes e cores das tags de um Space, em `{ tags: [] }`. A consulta não altera
tags.

`spaceId` é string, opcional quando o MCP fixa o Space.

| Campo | Tipo | Obrigatório | Uso |
| --- | --- | --- | --- |
| `account` | string | não | Perfil a resolver. |
| `spaceId` | string | condicional | Space consultado; obrigatório sem Space fixo. |

Exemplos:

```json
{"spaceId":"90070363783"}
```

```json
{"spaceId":"9007154145"}
```

```json
{"spaceId":"90070363783","account":"dev"}
```

```json
{"spaceId":"9007154145","account":"produto"}
```

```json
{}
```

O último exemplo funciona apenas com Space fixado no servidor. Após uma escrita,
consulte `clickupfy_tags_list` para conferir o catálogo ou
`clickupfy_task_get` com `raw: true` para conferir as associações da tarefa.

### `clickupfy_tag_create`

Cria uma tag no catálogo do Space com nome e cores. Retorna
`{ created, spaceId, name }`. A associação a tarefas é feita separadamente com
`clickupfy_task_add_tag`.

`name`, `foreground` e `background` são obrigatórios. As cores usam `#RRGGBB`.
Nome vazio e cor fora do formato são recusados.

| Campo | Tipo | Obrigatório | Uso |
| --- | --- | --- | --- |
| `account` | string | não | Perfil a resolver. |
| `spaceId` | string | condicional | Space do catálogo. |
| `name` | string | sim | Nome da tag. |
| `foreground` | string | sim | Cor do texto em `#RRGGBB`. |
| `background` | string | sim | Cor de fundo em `#RRGGBB`. |

Exemplos:

```json
{"spaceId":"90070363783","name":"bug","foreground":"#ffffff","background":"#112233"}
```

```json
{"spaceId":"90070363783","name":"em revisão","foreground":"#ffffff","background":"#336699"}
```

```json
{"spaceId":"90070363783","name":"backend","foreground":"#ffffff","background":"#112233"}
```

```json
{"spaceId":"9007154145","name":"documentação","foreground":"#ffffff","background":"#336699"}
```

```json
{"spaceId":"90070363783","name":"QA / revisão","foreground":"#ffffff","background":"#112233"}
```

### `clickupfy_tag_update`

Renomeia a tag ou altera suas cores no Space. Consulta a definição atual e
preserva os campos omitidos. Retorna `{ updated, spaceId, name }`. Tag ausente e
atualização sem campos são recusadas.

`tagName` é o nome atual obrigatório. `name`, `foreground` e `background` são
opcionais, com pelo menos um campo informado.

| Campo | Tipo | Obrigatório | Uso |
| --- | --- | --- | --- |
| `account` | string | não | Perfil a resolver. |
| `spaceId` | string | condicional | Space do catálogo. |
| `tagName` | string | sim | Nome atual da tag. |
| `name` | string | não | Novo nome. |
| `foreground`, `background` | string | não | Novas cores em `#RRGGBB`. |

Exemplos:

```json
{"spaceId":"90070363783","tagName":"bug","name":"defeito"}
```

```json
{"spaceId":"90070363783","tagName":"bug","foreground":"#ffffff"}
```

```json
{"spaceId":"90070363783","tagName":"bug","background":"#cc0000"}
```

```json
{"spaceId":"90070363783","tagName":"em revisão","name":"revisada","background":"#00aa00"}
```

```json
{"spaceId":"90070363783","tagName":"backend","foreground":"#ffffff","background":"#112233"}
```

### `clickupfy_tag_delete`

Exclui a tag do Space e de todas as tarefas que a usavam. Consulte as tarefas que
a utilizam antes de executar essa alteração. Retorna `{ deleted, spaceId, name }`.
Para remover somente a associação a uma tarefa, use `clickupfy_task_remove_tag`.

`tagName` é obrigatório e `confirm: true` também. O cliente consulta a definição
da tag para enviar o corpo DELETE exigido pela API.

| Campo | Tipo | Obrigatório | Uso |
| --- | --- | --- | --- |
| `account` | string | não | Perfil a resolver. |
| `spaceId` | string | condicional | Space do catálogo. |
| `tagName` | string | sim | Nome atual da tag. |
| `confirm` | `true` | sim | Confirmação literal obrigatória. |

Exemplos:

```json
{"spaceId":"90070363783","tagName":"bug","confirm":true}
```

```json
{"spaceId":"90070363783","tagName":"em revisão","confirm":true}
```

```json
{"spaceId":"90070363783","tagName":"backend","confirm":true}
```

```json
{"spaceId":"9007154145","tagName":"documentação","confirm":true}
```

```json
{"spaceId":"90070363783","tagName":"QA / revisão","confirm":true}
```

### `clickupfy_task_remove_tag`

Remove uma tag da tarefa e mantém a definição no Space. Retorna
`{ removed, taskId, tagName }`. As outras associações da tarefa permanecem
intactas.

`taskId` e `tagName` são obrigatórios. `customTaskId` é booleano opcional,
desativado por padrão; IDs personalizados usam o workspace do perfil.

| Campo | Tipo | Obrigatório | Uso |
| --- | --- | --- | --- |
| `account` | string | não | Perfil a resolver. |
| `taskId` | string | sim | Tarefa que perderá a tag. |
| `tagName` | string | sim | Nome da tag. |
| `customTaskId` | booleano | não | Resolve o ID no workspace do perfil. |

Exemplos:

```json
{"taskId":"86abc123","tagName":"bug"}
```

```json
{"taskId":"86abc123","tagName":"em revisão"}
```

```json
{"taskId":"DEV-42","tagName":"backend","customTaskId":true}
```

```json
{"account":"produto","taskId":"77def456","tagName":"documentação"}
```

```json
{"taskId":"sub-1","tagName":"QA / revisão"}
```

Após uma escrita, consulte `clickupfy_tags_list` para conferir o catálogo ou
`clickupfy_task_get` com `raw: true` para conferir as associações da tarefa.
