# Referência MCP: tarefas, Sprints, checklists, comentários e tempo

## Classificação

| Campo | Valor |
| --- | --- |
| Natureza | referência |
| Escopo | ferramentas MCP de trabalho em tarefas, Sprints, checklists, comentários e time tracking |
| Autoridade | schemas e handlers de `src/mcp.ts`, `src/work-items.ts` e `src/sprints.ts` |

As chamadas deste capítulo usam objetos JSON de argumentos. Valores como
`3001`, `86abc123` e `sprint-10` são apenas exemplos. Ferramentas de escrita
somem de `tools/list` quando o servidor é iniciado com `--read-only`; não há
parâmetro que contorne essa ausência. Depois de cada escrita, faça uma leitura
do recurso alterado para comparar o estado persistido.

## Tarefas: leitura e busca

### `clickupfy_tasks_list`

Lista tarefas da List autorizada. Omitir `listId` usa a List fixada. Os filtros
aceitam arrays: `status` é uma lista de nomes configurados na List e
`assignees` contém IDs de pessoas. `page` deve ser inteiro maior ou igual a
zero.

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
{"status":["em andamento"]}
```

```json
{"assignees":["42","57"],"includeClosed":false}
```

```json
{"includeClosed":true,"page":1}
```

```json
{"account":"produto","listId":"3001","status":["aberta","em andamento"]}
```

O retorno é compacto, com os campos usados para localizar trabalho. Para
obter descrição, subtarefas e checklist items de uma tarefa, chame
`clickupfy_task_get` com o `id` devolvido. Nunca use um `listId` diferente do
fixado pelo projeto.

### `clickupfy_task_get`

Obtém a tarefa e acrescenta `execution`, uma fila endereçável que preserva
subtarefas e checklist items. `raw` devolve somente a resposta original da API.
`markdown` devolve um texto único com descrição e itens; os dois formatos são
mutuamente exclusivos.

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

Os itens usam chaves como `task:86abc123` e `checklist:check-1:item-1`.
`parentKey` e `depth` preservam a árvore. A ação `complete` de cada item mostra
o comando CLI e a chamada MCP adequados, mas a autorização para executar essa
ação continua vindo do pedido recebido pelo agente.

### `clickupfy_tasks_search`

Busca somente dentro da List fixada, diferentemente do comando CLI `task
search`, que percorre o workspace. `maxPages` aceita inteiro entre `1` e `100`.
Omitir `query` lista de acordo com os outros filtros, portanto inclua um termo
quando a intenção for uma busca nominal.

| Campo | Tipo | Obrigatório | Uso |
| --- | --- | --- | --- |
| `account` | string | não | Perfil a resolver. |
| `query` | string | não | Texto no nome, descrição ou ID. |
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
{"query":"API","status":["em andamento"]}
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

Lê comentários de uma tarefa. O retorno normaliza usuário, data e texto para
facilitar a leitura pelo agente. A ferramenta não aceita paginação nem filtro de
autor; leia a lista completa retornada e não trate um comentário antigo como
instrução mais recente sem conferir as datas.

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
progresso. Ela não expõe anexos como conteúdo, não publica respostas e não
altera o campo de status.

## Sprints

### `clickupfy_sprints_list`

Lista Sprints dentro do Sprint Folder fixado. Uma Sprint é uma List que possui
`start_date` e `due_date`; `includeRegular` acrescenta Lists comuns ao retorno
de diagnóstico. `at` recebe uma data `AAAA-MM-DD` usada para classificar o
estado do ciclo.

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
{"at":"2026-08-10"}
```

```json
{"archived":true,"includeRegular":true}
```

```json
{"folderId":"4001","at":"2026-09-01"}
```

```json
{"account":"produto","folderId":"4001","includeRegular":false}
```

O objeto vazio funciona somente se o servidor recebeu `--sprint-folder`. A
ferramenta não cria Sprint nem altera datas: a API pública do ClickUp não oferece
criação de Sprint por esse fluxo.

### `clickupfy_sprint_current`

Obtém a única Sprint cujo período contém a data informada ou a data atual. Se
não houver Sprint ativa, ou se dois períodos se sobrepuserem, a ferramenta
retorna erro em vez de escolher uma List arbitrariamente.

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
{"at":"2026-08-10"}
```

```json
{"folderId":"4001"}
```

```json
{"folderId":"4001","at":"2026-09-01"}
```

```json
{"account":"produto","folderId":"4001","at":"2026-10-15"}
```

Não use a falha como motivo para anexar tarefa a qualquer List do Folder. Corrija
datas e sobreposição no ClickUp, depois leia novamente a Sprint atual.

### `clickupfy_sprint_get`

Produz relatório de uma Sprint informada. Inclui período, progresso por
quantidade de tarefas, progresso por Sprint Points e distribuição de status.
`at` muda somente o cálculo temporal da situação da Sprint.

| Campo | Tipo | Obrigatório | Uso |
| --- | --- | --- | --- |
| `account` | string | não | Perfil a resolver. |
| `sprintId` | string | sim | Sprint a analisar. |
| `at` | string | não | Data de referência em `AAAA-MM-DD`. |

Exemplos:

```json
{"sprintId":"sprint-10"}
```

```json
{"sprintId":"sprint-10","at":"2026-08-10"}
```

```json
{"sprintId":"sprint-11"}
```

```json
{"account":"produto","sprintId":"sprint-10"}
```

```json
{"account":"cliente-a","sprintId":"sprint-22","at":"2026-09-01"}
```

Uma tarefa sem Points participa do total de tarefas, mas não adiciona peso ao
cálculo por pontos. Leia `clickupfy_sprint_tasks` para obter os itens do
relatório, não tente inferi-los apenas pelas porcentagens.

### `clickupfy_sprint_tasks`

Lista tarefas associadas a uma Sprint, incluindo concluídas por padrão.
`openOnly: true` remove tarefas já concluídas e é útil para a fila presente,
mas não substitui a lista integral usada na revisão final do ciclo.

| Campo | Tipo | Obrigatório | Uso |
| --- | --- | --- | --- |
| `account` | string | não | Perfil a resolver. |
| `sprintId` | string | sim | Sprint consultada. |
| `openOnly` | booleano | não | Omite tarefas concluídas quando vale `true`. |

Exemplos:

```json
{"sprintId":"sprint-10"}
```

```json
{"sprintId":"sprint-10","openOnly":true}
```

```json
{"sprintId":"sprint-11"}
```

```json
{"account":"produto","sprintId":"sprint-10","openOnly":false}
```

```json
{"account":"cliente-a","sprintId":"sprint-22","openOnly":true}
```

A ferramenta retorna resumos de tarefa. Para descrição, subtarefas e checklist
items de um item específico, chame `clickupfy_task_get` com o ID da tarefa.

## Ferramentas de escrita de trabalho

As ferramentas seguintes só aparecem fora de read-only. Informe apenas campos
que devem mudar. Elas usam o mesmo perfil e regras de isolamento das consultas.

### `clickupfy_task_create`

Cria tarefa ou subtarefa na List fixa. `name` é obrigatório. Datas devem ser
timestamps inteiros em milissegundos, diferentemente do CLI, que aceita datas
`AAAA-MM-DD`.

| Campo | Tipo | Obrigatório | Uso |
| --- | --- | --- | --- |
| `account`, `listId` | string | não | Perfil e List fixa quando omitida. |
| `name` | string | sim | Nome da tarefa. |
| `description`, `markdownContent`, `status`, `parent` | string | não | Conteúdo, status e pai. |
| `priority` | inteiro | não | De `1` a `4`. |
| `assignees` | número[] | não | Responsáveis. |
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
{"name":"Implementar token","status":"em andamento","priority":2,"assignees":[42,57],"startDate":1786320000000,"dueDate":1786665600000,"points":5}
```

```json
{"account":"produto","listId":"3001","name":"Cobrir expiração","parent":"86abc123","markdownContent":"Adicionar testes de sessão expirada."}
```

Leia a tarefa criada com `clickupfy_task_get`. Para `listId`, omitir é o caminho
normal no MCP do projeto; um valor diferente do valor fixo é recusado.

### `clickupfy_task_update`

Atualiza campos de uma tarefa. `taskId` é obrigatório e pelo menos um campo de
alteração deve estar presente. Para remover data, use `null` em `startDate` ou
`dueDate`; não envie texto vazio.

| Campo | Tipo | Obrigatório | Uso |
| --- | --- | --- | --- |
| `account`, `taskId` | string | `taskId` sim | Perfil e tarefa. |
| `name`, `description`, `markdownContent`, `status` | string | não | Campos textuais. |
| `priority` | inteiro | não | De `1` a `4`. |
| `startDate`, `dueDate` | inteiro ou `null` | não | Nova data ou remoção. |
| `points` | número | não | Sprint Points não negativos. |

Exemplos:

```json
{"taskId":"86abc123","status":"em andamento"}
```

```json
{"taskId":"86abc123","name":"Corrigir autenticação por token"}
```

```json
{"taskId":"86abc123","priority":1,"points":8}
```

```json
{"taskId":"86abc123","startDate":1786320000000,"dueDate":1786665600000}
```

```json
{"account":"produto","taskId":"86abc123","markdownContent":"## Entrega\n\nPublicar manual atualizado.","dueDate":null}
```

Depois da escrita, use `clickupfy_task_get`. A ferramenta devolve a tarefa
atualizada, mas a releitura é importante quando outras alterações concorrem na
mesma tarefa.

### `clickupfy_checklist_create`

Cria checklist em uma tarefa. O retorno fornece o ID necessário em
`clickupfy_checklist_item_create`. Itens não são criados automaticamente.

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

Acrescenta item aberto a um checklist. `assignee`, quando informado, é um ID
numérico. A ferramenta não recebe `taskId` porque o checklist já define a
tarefa proprietária.

| Campo | Tipo | Obrigatório | Uso |
| --- | --- | --- | --- |
| `account` | string | não | Perfil a resolver. |
| `checklistId` | string | sim | Checklist que receberá o item. |
| `name` | string | sim | Texto do item. |
| `assignee` | inteiro | não | Pessoa responsável pelo item. |

Exemplos:

```json
{"checklistId":"check-1","name":"Executar testes unitários"}
```

```json
{"checklistId":"check-1","name":"Executar build"}
```

```json
{"checklistId":"check-1","name":"Revisar documentação","assignee":42}
```

```json
{"account":"produto","checklistId":"check-2","name":"Conferir changelog"}
```

```json
{"account":"cliente-a","checklistId":"check-3","name":"Validar publicação","assignee":57}
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
{"taskId":"86abc123","checklistId":"check-1","itemId":"item-1","resolved":true}
```

```json
{"taskId":"86abc123","checklistId":"check-1","itemId":"item-1","resolved":false}
```

```json
{"account":"produto","taskId":"86abc123","checklistId":"check-2","itemId":"item-4","resolved":true}
```

```json
{"account":"cliente-a","taskId":"77def456","checklistId":"check-3","itemId":"item-2","resolved":true}
```

```json
{"taskId":"77def456","checklistId":"check-3","itemId":"item-2","resolved":false}
```

Não passe um item de outra tarefa. A ferramenta faz essa conferência e recusa a
escrita quando a relação não corresponde à árvore lida.

### `clickupfy_sprint_add_task`

Associa tarefa a Sprint sem trocar sua List principal. Ela não cria tarefa e
não muda seu status. A ferramenta só aparece em servidor com escrita.

| Campo | Tipo | Obrigatório | Uso |
| --- | --- | --- | --- |
| `account` | string | não | Perfil a resolver. |
| `sprintId` | string | sim | Sprint de destino. |
| `taskId` | string | sim | Tarefa a associar. |

Exemplos:

```json
{"sprintId":"sprint-10","taskId":"86abc123"}
```

```json
{"sprintId":"sprint-10","taskId":"77def456"}
```

```json
{"account":"produto","sprintId":"sprint-10","taskId":"86abc123"}
```

```json
{"account":"cliente-a","sprintId":"sprint-22","taskId":"55ghi789"}
```

```json
{"account":"homologacao","sprintId":"sprint-33","taskId":"99jkl012"}
```

Leia `clickupfy_sprint_tasks` depois da escrita. Só associe a tarefa quando o
planejamento da Sprint estiver incluído no pedido.

### `clickupfy_sprint_remove_task`

Remove uma associação com Sprint sem excluir a tarefa. Comentários, checklist,
tempo e List principal permanecem na tarefa.

| Campo | Tipo | Obrigatório | Uso |
| --- | --- | --- | --- |
| `account` | string | não | Perfil a resolver. |
| `sprintId` | string | sim | Sprint cuja associação será removida. |
| `taskId` | string | sim | Tarefa associada. |

Exemplos:

```json
{"sprintId":"sprint-10","taskId":"86abc123"}
```

```json
{"sprintId":"sprint-10","taskId":"77def456"}
```

```json
{"account":"produto","sprintId":"sprint-10","taskId":"86abc123"}
```

```json
{"account":"cliente-a","sprintId":"sprint-22","taskId":"55ghi789"}
```

```json
{"account":"homologacao","sprintId":"sprint-33","taskId":"99jkl012"}
```

Use `clickupfy_task_delete` somente quando a exclusão inteira estiver
explicitamente autorizada.

### `clickupfy_sprint_set_points`

Define Sprint Points de uma tarefa. `points` é um número maior ou igual a zero.
O ClickUpfy transmite o valor; a escala pertence ao time.

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

Leia a tarefa com `clickupfy_task_get` para confirmar o número persistido.

### `clickupfy_task_delete`

Exclui permanentemente uma tarefa. O campo `confirm` só aceita o literal
`true`; essa exigência impede uma exclusão causada por objeto incompleto ou
ambíguo. A ferramenta não está disponível em read-only.

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

Publica comentário em uma tarefa. `notifyAll` é opcional; ele pede ao ClickUp
para notificar participantes. A ferramenta não modifica status, timer ou
checklist.

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
omitir `account` usa o perfil fixado ou ativo.

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

Inicia um time entry para uma tarefa. Consulte `clickupfy_time_current` antes,
pois a ferramenta não encerra automaticamente um registro que já esteja ativo.

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

### `clickupfy_time_stop`

Encerra o time entry atual do workspace. Ela não recebe `taskId` e não modifica
status nem comentários. Relê `clickupfy_time_current` depois da chamada quando
o encerramento precisa ser confirmado.

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
