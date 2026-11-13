# Superfície do CLI e do MCP antigos

Este documento descreve somente o que está implementado em `legacy/src` e em
`legacy/bin`. Nomes de command, argumentos, options, textos de descrição,
ferramentas MCP, variáveis de ambiente e caminhos foram copiados do código.

## Commands

Options globais, declaradas no programa raiz e aceitas por todos os
subcomandos:

| Option | Texto no código |
| --- | --- |
| `--account <perfil>` | `perfil configurado; usa o perfil ativo por padrão` |
| `--json` | `imprime a resposta completa em JSON` |

O programa também declara `.version(packageJson.version)`, que acrescenta a
option `-V, --version` do Commander. A ajuda `-h, --help` é gerada pelo
Commander.

### setup/status

| Command | Argumentos | Options | Descrição |
| --- | --- | --- | --- |
| `install` | nenhum | `--api-key <chave>` API key pessoal do ClickUp; `--token <chave>` alias compatível para --api-key; `--name <nome>` nome local do perfil; `--workspace <id>` workspace associado; `--non-interactive` não abre prompts | Configura uma API key e associa o perfil a um workspace |
| `status` | nenhum | nenhuma além das globais | Mostra o perfil ativo e a configuração atual |

### account

| Command | Argumentos | Options | Descrição |
| --- | --- | --- | --- |
| `account list` (alias `ls`) | nenhum | nenhuma além das globais | Lista perfis sem revelar API keys |
| `account show` | `[perfil]` perfil; usa o perfil ativo por padrão | nenhuma além das globais | Mostra metadados seguros de um perfil |
| `account use` | `<perfil>` | nenhuma além das globais | Define o perfil ativo |
| `account remove` | `<perfil>` | `--yes` confirma a remoção sem prompt | Remove um perfil da configuração local |

### workspace

| Command | Argumentos | Options | Descrição |
| --- | --- | --- | --- |
| `workspace list` (alias `ls`) | nenhum | nenhuma além das globais | Lista workspaces autorizados |
| `workspace use` | `<workspace-id>` | nenhuma além das globais | Associa um workspace autorizado ao perfil |

### whoami

| Command | Argumentos | Options | Descrição |
| --- | --- | --- | --- |
| `whoami` | nenhum | nenhuma além das globais | Valida a API key e mostra o usuário autenticado |

### space

| Command | Argumentos | Options | Descrição |
| --- | --- | --- | --- |
| `space list` (alias `ls`) | nenhum | `--archived` inclui spaces arquivados | Lista spaces do workspace associado |

### folder

| Command | Argumentos | Options | Descrição |
| --- | --- | --- | --- |
| `folder list` (alias `ls`) | nenhum | `--space <id>` ID do space (obrigatória); `--archived` inclui folders arquivados | Lista folders de um space |

### list

| Command | Argumentos | Options | Descrição |
| --- | --- | --- | --- |
| `list list` (alias `ls`) | nenhum | `--folder <id>` ID do folder; `--space <id>` ID do space para lists sem folder; `--archived` inclui lists arquivadas | Lista lists de um folder ou space |
| `list get` | `<list-id>` ID da List | nenhuma além das globais | Obtém a List e os status disponíveis para tarefas |

### sprint

| Command | Argumentos | Options | Descrição |
| --- | --- | --- | --- |
| `sprint list` (alias `ls`) | nenhum | `--folder <id>` ID do Sprint Folder (obrigatória); `--archived` inclui Lists arquivadas; `--include-regular` inclui Lists comuns do Sprint Folder; `--at <AAAA-MM-DD>` data usada para calcular o status da Sprint | Lista Sprints identificadas pelo período configurado |
| `sprint current` | nenhum | `--folder <id>` ID do Sprint Folder (obrigatória); `--at <AAAA-MM-DD>` data usada para localizar a Sprint | Obtém a única Sprint ativa do folder |
| `sprint get` | `<sprint-id>` | `--at <AAAA-MM-DD>` data usada para calcular o status da Sprint | Mostra período, progresso e Sprint Points |
| `sprint tasks` | `<sprint-id>` | `--open-only` omite tarefas concluídas | Lista todas as tarefas associadas à Sprint |
| `sprint add-task` | `<sprint-id>`, `<task-id>` | nenhuma além das globais | Adiciona uma tarefa à Sprint sem trocar sua List principal |
| `sprint remove-task` | `<sprint-id>`, `<task-id>` | nenhuma além das globais | Remove a associação da tarefa com a Sprint |
| `sprint set-points` | `<task-id>`, `<points>` Sprint Points | nenhuma além das globais | Define os Sprint Points de uma tarefa |

### task

| Command | Argumentos | Options | Descrição |
| --- | --- | --- | --- |
| `task list` (alias `ls`) | nenhum | `--list <id>` ID da list (obrigatória); `--status <status...>` status aceitos; `--assignee <ids...>` IDs dos responsáveis; `--include-closed` inclui tarefas concluídas; `--page <n>` página, começando em zero | Lista tarefas de uma list |
| `task get` | `<task-id>` | `--raw` retorna somente a resposta original do ClickUp; `--markdown` concatena a tarefa e os itens em um único Markdown | Obtém a tarefa e sua fila de subtarefas e checklists |
| `task search` | nenhum | `--query <texto>` texto no nome, descrição ou ID; `--status <status...>` status aceitos; `--assignee <ids...>` IDs dos responsáveis; `--include-closed` inclui tarefas concluídas; `--max-pages <n>` limite de páginas consultadas (padrão 100) | Busca tarefas em todo o workspace |
| `task create` | nenhum | `--list <id>` ID da list (obrigatória); `--name <nome>` nome da tarefa (obrigatória); `--description <texto>` descrição; `--markdown-content <markdown>` descrição preservada como Markdown; `--status <status>` status inicial; `--priority <n>` 1 urgente, 2 alta, 3 normal, 4 baixa; `--assignee <ids...>` IDs numéricos dos responsáveis; `--parent <task-id>` cria a tarefa como subtarefa; `--start-date <AAAA-MM-DD>` data de início; `--due-date <AAAA-MM-DD>` data de entrega; `--points <n>` Sprint Points | Cria uma tarefa de desenvolvimento |
| `task update` | `<task-id>` | `--name <nome>` novo nome; `--description <texto>` nova descrição; `--markdown-content <markdown>` nova descrição em Markdown; `--status <status>` novo status; `--priority <n>` 1 urgente, 2 alta, 3 normal, 4 baixa; `--start-date <AAAA-MM-DD>` nova data de início; `--clear-start-date` remove a data de início; `--due-date <AAAA-MM-DD>` nova data de entrega; `--clear-due-date` remove a data de entrega; `--points <n>` Sprint Points | Atualiza uma tarefa |
| `task add-tag` | `<task-id>` ID da tarefa, `<tag>` nome da tag | `--custom-task-id` usa ID personalizado no workspace do perfil | Adiciona uma tag a uma tarefa |
| `task remove-tag` | `<task-id>`, `<tag>` | `--custom-task-id` usa ID personalizado no workspace do perfil | Remove uma tag da tarefa, preservando o catálogo do Space |
| `task delete` | `<task-id>` | `--yes` confirma a exclusão sem prompt | Exclui permanentemente uma tarefa |

### tag

| Command | Argumentos | Options | Descrição |
| --- | --- | --- | --- |
| `tag list` | nenhum | `--space <id>` ID do Space (obrigatória) | Lista nomes e cores das tags |
| `tag create` | `<name>` | `--space <id>` ID do Space (obrigatória); `--foreground <cor>` cor do texto em #RRGGBB (obrigatória); `--background <cor>` cor do fundo em #RRGGBB (obrigatória) | Cria uma tag no Space |
| `tag update` | `<tag>` | `--space <id>` ID do Space (obrigatória); `--name <nome>` novo nome; `--foreground <cor>` nova cor do texto em #RRGGBB; `--background <cor>` nova cor do fundo em #RRGGBB | Renomeia uma tag ou altera suas cores |
| `tag delete` | `<tag>` | `--space <id>` ID do Space (obrigatória); `--yes` confirma a exclusão sem prompt | Exclui a tag do Space |

### checklist

| Command | Argumentos | Options | Descrição |
| --- | --- | --- | --- |
| `checklist create` | `<task-id>` ID da tarefa | `--name <nome>` nome do checklist (obrigatória) | Cria um checklist em uma tarefa |
| `checklist item-create` | `<checklist-id>` ID do checklist | `--name <nome>` nome do item (obrigatória); `--assignee <id>` ID numérico do responsável | Cria um item em um checklist |
| `checklist set` | `<task-id>` tarefa raiz usada para validar o item, `<checklist-id>` ID do checklist, `<item-id>` ID do checklist item | `--resolved` marca o item como concluído; `--open` reabre o item | Altera e confirma o estado de um checklist item |

### comment

| Command | Argumentos | Options | Descrição |
| --- | --- | --- | --- |
| `comment list` (alias `ls`) | nenhum | `--task <id>` ID da tarefa (obrigatória) | Lista comentários de uma tarefa |
| `comment create` | nenhum | `--task <id>` ID da tarefa (obrigatória); `--text <texto>` texto do comentário (obrigatória); `--notify-all` notifica todos os participantes | Publica um comentário de progresso |

### doc

| Command | Argumentos | Options | Descrição |
| --- | --- | --- | --- |
| `doc list` (alias `ls`) | nenhum | `--query <texto>` texto no nome ou ID do Doc; `--parent-id <id>` filtra Docs criados sob este local; `--parent-type <n>` tipo do local (4 Space, 5 Folder, 6 List, 7 Everything, 12 Task); `--deleted` inclui Docs excluídos; `--archived` inclui Docs arquivados; `--creator <id>` ID numérico do criador; `--max-pages <n>` limite de páginas de cursor consultadas (padrão 50) | Busca Docs do workspace associado |
| `doc get` | `<doc-id>` | nenhuma além das globais | Obtém metadados de um Doc |
| `doc create` | nenhum | `--name <nome>` nome do Doc (obrigatória); `--parent-id <id>` ID do local onde o Doc nasce (Space, Folder, List ou tarefa); `--parent-type <n>` tipo do local (4 Space, 5 Folder, 6 List, 7 Everything, 12 Task); `--visibility <valor>` visibilidade do Doc (PRIVATE ou PUBLIC); `--create-page` cria também a primeira página em branco | Cria um Doc no workspace associado |

### doc page

| Command | Argumentos | Options | Descrição |
| --- | --- | --- | --- |
| `doc page tree` | `<doc-id>` | nenhuma além das globais | Mostra a árvore de páginas do Doc, sem conteúdo |
| `doc page list` (alias `ls`) | `<doc-id>` | `--max-page-depth <n>` profundidade máxima de sub-páginas; `--content-format <valor>` text/md (padrão) ou text/plain | Lista as páginas do Doc com conteúdo |
| `doc page get` | `<doc-id>`, `<page-id>` | `--content-format <valor>` text/md (padrão) ou text/plain | Obtém uma página do Doc com conteúdo |
| `doc page create` | `<doc-id>` | `--name <nome>` título da página (obrigatória); `--content <texto>` conteúdo inicial; `--sub-title <texto>` subtítulo da página; `--parent-page <id>` cria como sub-página deste ID; `--orderindex <n>` posição entre as páginas irmãs; `--content-format <valor>` text/md (padrão) ou text/plain | Cria uma página, ou sub-página, em um Doc |
| `doc page update` | `<doc-id>`, `<page-id>` | `--name <nome>` novo título; `--sub-title <texto>` novo subtítulo; `--content <texto>` novo conteúdo; `--content-edit-mode <modo>` replace (padrão), append ou prepend; `--content-format <valor>` text/md (padrão) ou text/plain | Atualiza título, subtítulo e/ou conteúdo de uma página |

### time

| Command | Argumentos | Options | Descrição |
| --- | --- | --- | --- |
| `time current` | nenhum | nenhuma além das globais | Mostra o time entry em execução |
| `time start` | nenhum | `--task <id>` ID da tarefa (obrigatória); `--description <texto>` descrição do trabalho | Inicia um time entry |
| `time stop` | nenhum | nenhuma além das globais | Encerra o time entry em execução |

### mcp

| Command | Argumentos | Options | Descrição |
| --- | --- | --- | --- |
| `mcp setup` | nenhum | `--name <nome>` nome único do MCP no projeto; `--account <perfil>` conta cadastrada no ClickUpfy; `--space <id>` espaço do workspace da conta; `--list <id>` lista pertencente ao espaço; `--clients <clientes>` claude-code,codex,gemini,opencode separados por vírgula; `--project <diretorio>` (diretório do projeto; padrão: diretório atual); `--read-only` configura ferramentas somente de leitura; `--force` substitui a entrada com o mesmo nome; `--non-interactive` exige nome, conta, espaço e lista por flags | Seleciona conta, espaço e lista e configura MCPs locais nomeados |
| `mcp serve` | nenhum | `--account <perfil>` fixa um perfil para o servidor; `--workspace <id>` fixa o workspace esperado; `--space <id>` fixa o Space do projeto; `--folder <id>` fixa o Folder do projeto; `--list <id>` fixa a List obrigatória do projeto (obrigatória); `--sprint-folder <id>` fixa o Sprint Folder do projeto; `--read-only` expõe somente ferramentas de leitura | Inicia o servidor MCP pelo transporte stdio |

### agent

| Command | Argumentos | Options | Descrição |
| --- | --- | --- | --- |
| `agent skill list` | nenhum | nenhuma além das globais | Lista as skills disponíveis |
| `agent skill show` | `<skill>` nome da skill | nenhuma além das globais | Mostra as instruções de uma skill |
| `agent skill install` | `[skills...]` skills; omita para instalar todas | `--global` instala no catálogo global do usuário; `--force` mantém compatibilidade e permite repetir a instalação | Instala skills pelo gerenciador oficial `npx skills add` |
| `agent install` | nenhum | `--global` instala as skills globalmente; `--workspace <id>` workspace esperado pelo MCP; `--space <id>` Space fixo do MCP deste projeto (obrigatória); `--folder <id>` Folder fixo do MCP deste projeto; `--list <id>` List fixa do MCP deste projeto (obrigatória); `--sprint-folder <id>` Sprint Folder fixo do MCP; `--force` atualiza skills existentes | Instala as skills e adiciona o servidor ao .mcp.json e ao .codex/config.toml |

### api

| Command | Argumentos | Options | Descrição |
| --- | --- | --- | --- |
| `api list` | nenhum | `--group <grupo>` filtra um grupo do catálogo; `--read-only` mostra apenas consultas | Lista operações, métodos, versões e ferramentas MCP |
| `api describe` | `<operation>` operationId, comando ou ferramenta | nenhuma além das globais | Mostra parâmetros, corpo, formatos e schema de uma operação |
| `api <operação>` | nenhum | `--path <json>` parâmetros de caminho em objeto JSON; `--query <json>` parâmetros de consulta em objeto JSON; `--body <json>` corpo da requisição em JSON; `--body-file <arquivo>` arquivo JSON com o corpo da requisição; `--input <arquivo>` (envelope JSON; use - para ler stdin); `--content-type <tipo>` formato documentado para o corpo; `--file <campo=caminho>` (arquivo multipart; opção repetível); `--yes` confirma uma exclusão ou remoção; `--dry-run` valida a entrada sem enviar a requisição | Método e caminho da operação do catálogo, com a marcação (obsoleto na API) quando aplicável |

Cada operação do catálogo vira um subcomando `api v2-<slug>` ou `api v3-<slug>`
gerado a partir do `operationId`. O catálogo tem 173 operações (138 v2 e 35
v3). A descrição do subcomando é montada como
`${method} ${path}` mais o sufixo `(obsoleto na API)` quando `deprecated` é verdadeiro,
e o texto de ajuda final imprime `Contrato completo: clickupfy api describe
<cli>` e `MCP: <tool>`.

### doctor

| Command | Argumentos | Options | Descrição |
| --- | --- | --- | --- |
| `doctor` | nenhum | nenhuma além das globais | Verifica o setup e os arquivos de configuração locais |

### upgrade

| Command | Argumentos | Options | Descrição |
| --- | --- | --- | --- |
| `upgrade` | `[alvo]` latest, next ou uma versão SemVer; usa latest por padrão | nenhuma além das globais | Atualiza a instalação global do ClickUpfy pelo npm |

## MCP tools

O servidor registra o nome `promovaweb-clickupfy` na versão `0.1.0`. As
ferramentas de escrita só são registradas quando o servidor não está em
`--read-only`. `clickupfy_account_use` só existe sem `accountId` fixo;
`clickupfy_workspace_use` só existe sem `accountId` e sem `workspaceId` fixos.

| Tool | Parâmetros do inputSchema | Escreve? | Descrição |
| --- | --- | --- | --- |
| `clickupfy_mcp_context` | `account` (opcional) | não | Mostra o perfil e a hierarquia fixados pelo MCP deste projeto |
| `clickupfy_accounts_list` | nenhum | não | Lista perfis configurados localmente, sem revelar nenhuma API key |
| `clickupfy_whoami` | `account` (opcional) | não | Valida o perfil e retorna o usuário autenticado no ClickUp |
| `clickupfy_workspaces_list` | `account` (opcional) | não | Lista os workspaces autorizados para um perfil |
| `clickupfy_spaces_list` | `account` (opcional), `archived` (opcional) | não | Lista os spaces do workspace associado ao perfil |
| `clickupfy_folders_list` | `account` (opcional), `spaceId` (opcional), `archived` (opcional) | não | Lista os folders de um space |
| `clickupfy_lists_list` | `account` (opcional), `folderId` (opcional), `spaceId` (opcional), `archived` (opcional) | não | Lista as lists de um folder ou de um space sem folders |
| `clickupfy_list_get` | `account` (opcional), `listId` (opcional) | não | Obtém a List fixada pelo projeto e os status disponíveis para tarefas |
| `clickupfy_tasks_list` | `account` (opcional), `listId` (opcional), `status` (opcional), `assignees` (opcional), `includeClosed` (opcional), `page` (opcional) | não | Lista tarefas de desenvolvimento de uma list com saída compacta |
| `clickupfy_sprints_list` | `account` (opcional), `folderId` (opcional), `archived` (opcional), `includeRegular` (opcional), `at` (opcional) | não | Lista Sprints existentes de um Sprint Folder, identificadas pelo período |
| `clickupfy_sprint_current` | `account` (opcional), `folderId` (opcional), `at` (opcional) | não | Obtém a única Sprint ativa de um Sprint Folder |
| `clickupfy_sprint_get` | `account` (opcional), `sprintId` (obrigatório), `at` (opcional) | não | Retorna período, progresso, distribuição de status e Sprint Points |
| `clickupfy_sprint_tasks` | `account` (opcional), `sprintId` (obrigatório), `openOnly` (opcional) | não | Lista todas as tarefas associadas à Sprint, incluindo concluídas |
| `clickupfy_task_get` | `account` (opcional), `taskId` (obrigatório), `raw` (opcional), `markdown` (opcional) | não | Obtém a tarefa e uma fila endereçável de subtarefas e checklist items |
| `clickupfy_tasks_search` | `account` (opcional), `query` (opcional), `status` (opcional), `assignees` (opcional), `includeClosed` (opcional), `maxPages` (opcional) | não | Busca tarefas somente na List fixada pelo MCP |
| `clickupfy_comments_list` | `account` (opcional), `taskId` (obrigatório) | não | Lê o histórico de comentários de uma tarefa |
| `clickupfy_docs_list` | `account` (opcional), `query` (opcional), `parentId` (opcional), `parentType` (opcional), `deleted` (opcional), `archived` (opcional), `creator` (opcional), `maxPages` (opcional) | não | Busca Docs do workspace associado ao perfil |
| `clickupfy_doc_get` | `account` (opcional), `docId` (obrigatório) | não | Obtém metadados de um Doc do workspace associado |
| `clickupfy_doc_page_tree` | `account` (opcional), `docId` (obrigatório) | não | Mostra a hierarquia de páginas do Doc, sem conteúdo |
| `clickupfy_doc_pages_list` | `account` (opcional), `docId` (obrigatório), `maxPageDepth` (opcional), `contentFormat` (opcional) | não | Lista as páginas do Doc com conteúdo em Markdown |
| `clickupfy_doc_page_get` | `account` (opcional), `docId` (obrigatório), `pageId` (obrigatório), `contentFormat` (opcional) | não | Obtém uma página específica de um Doc, com conteúdo |
| `clickupfy_time_current` | `account` (opcional) | não | Retorna o time entry em execução no workspace |
| `clickupfy_account_use` | `account` (obrigatório) | sim | Define qual perfil local será usado por padrão |
| `clickupfy_workspace_use` | `account` (opcional), `workspaceId` (obrigatório) | sim | Associa outro workspace autorizado a um perfil configurado |
| `clickupfy_task_create` | `account` (opcional), `listId` (opcional), `name` (obrigatório), `description` (opcional), `markdownContent` (opcional), `status` (opcional), `priority` (opcional), `assignees` (opcional), `parent` (opcional), `startDate` (opcional), `dueDate` (opcional), `points` (opcional) | sim | Cria uma tarefa de desenvolvimento em uma list |
| `clickupfy_task_update` | `account` (opcional), `taskId` (obrigatório), `name` (opcional), `description` (opcional), `markdownContent` (opcional), `status` (opcional), `priority` (opcional), `startDate` (opcional), `dueDate` (opcional), `points` (opcional) | sim | Atualiza nome, descrição, status, prioridade ou data de uma tarefa |
| `clickupfy_task_add_tag` | `account` (opcional), `taskId` (obrigatório), `tagName` (obrigatório), `customTaskId` (opcional) | sim | Adiciona uma tag à tarefa sem substituir as tags existentes |
| `clickupfy_checklist_create` | `account` (opcional), `taskId` (obrigatório), `name` (obrigatório) | sim | Cria um checklist em uma tarefa |
| `clickupfy_checklist_item_create` | `account` (opcional), `checklistId` (obrigatório), `name` (obrigatório), `assignee` (opcional) | sim | Acrescenta um item a um checklist existente |
| `clickupfy_checklist_item_set` | `account` (opcional), `taskId` (obrigatório), `checklistId` (obrigatório), `itemId` (obrigatório), `resolved` (obrigatório) | sim | Marca ou reabre um checklist item e confirma o estado em uma nova leitura |
| `clickupfy_doc_create` | `account` (opcional), `name` (obrigatório), `parentId` (opcional), `parentType` (opcional), `visibility` (opcional), `createPage` (opcional) | sim | Cria um Doc no workspace associado, opcionalmente vinculado a um Space, Folder, List ou tarefa |
| `clickupfy_doc_page_create` | `account` (opcional), `docId` (obrigatório), `name` (obrigatório), `content` (opcional), `subTitle` (opcional), `parentPageId` (opcional), `orderindex` (opcional), `contentFormat` (opcional) | sim | Cria uma página, ou sub-página, em um Doc existente |
| `clickupfy_doc_page_update` | `account` (opcional), `docId` (obrigatório), `pageId` (obrigatório), `name` (opcional), `subTitle` (opcional), `content` (opcional), `contentEditMode` (opcional), `contentFormat` (opcional) | sim | Atualiza título, subtítulo e/ou conteúdo de uma página existente |
| `clickupfy_sprint_add_task` | `account` (opcional), `sprintId` (obrigatório), `taskId` (obrigatório) | sim | Associa uma tarefa a uma Sprint sem trocar sua List principal |
| `clickupfy_sprint_remove_task` | `account` (opcional), `sprintId` (obrigatório), `taskId` (obrigatório) | sim | Remove a associação com a Sprint sem excluir a tarefa do ClickUp |
| `clickupfy_sprint_set_points` | `account` (opcional), `taskId` (obrigatório), `points` (obrigatório) | sim | Define a estimativa em Sprint Points de uma tarefa |
| `clickupfy_task_delete` | `account` (opcional), `taskId` (obrigatório), `confirm` (obrigatório, literal `true`) | sim | Exclui permanentemente uma tarefa; use somente com autorização explícita |
| `clickupfy_comment_create` | `account` (opcional), `taskId` (obrigatório), `text` (obrigatório), `notifyAll` (opcional) | sim | Publica um comentário de progresso em uma tarefa |
| `clickupfy_time_start` | `account` (opcional), `taskId` (obrigatório), `description` (opcional) | sim | Inicia um time entry associado a uma tarefa |
| `clickupfy_time_stop` | `account` (opcional) | sim | Encerra o time entry em execução no workspace |
| `clickupfy_tags_list` | `account` (opcional), `spaceId` (opcional) | não | Consulta nomes e cores das tags disponíveis no Space |
| `clickupfy_tag_create` | `account` (opcional), `spaceId` (opcional), `name` (obrigatório), `foreground` (obrigatório), `background` (obrigatório) | sim | Cria uma tag com nome e cores no Space |
| `clickupfy_tag_update` | `account` (opcional), `spaceId` (opcional), `tagName` (obrigatório), `name` (opcional), `foreground` (opcional), `background` (opcional) | sim | Renomeia ou altera cores da tag no Space, preservando os campos omitidos |
| `clickupfy_tag_delete` | `account` (opcional), `spaceId` (opcional), `tagName` (obrigatório), `confirm` (obrigatório, literal `true`) | sim | Exclui a tag do Space; exige confirmação explícita |
| `clickupfy_task_remove_tag` | `account` (opcional), `taskId` (obrigatório), `tagName` (obrigatório), `customTaskId` (opcional) | sim | Remove a associação à tarefa e preserva a tag no Space |

As tools do catálogo `api` são geradas em tempo de execução percorrendo
`src/api/catalog.json` (gerado por `scripts/generate-api.mjs` a partir das
especificações OpenAPI públicas v2 e v3): cada operação vira a tool
`clickupfy_api_<versão>_<slug do operationId>`, com `inputSchema` construído
por `operationShape` (objetos `path`, `query`, `headers`, `body`,
`contentType`, `files` e `confirm` quando o método é `DELETE`) mais o campo
`account`, e com `readOnlyHint`, `destructiveHint` e `openWorldHint` nas
annotations. Em `--read-only`, apenas operações cujo `readOnly` é verdadeiro
são registradas.

## Variáveis de ambiente e arquivos

### Variáveis de ambiente

| Variável | Lida em | Efeito no código |
| --- | --- | --- |
| `PROMOVAWEB_CLICKUPFY_CONFIG` | `src/config.ts` (`caminhoConfiguracao`) e `src/doctor.ts` | Substitui o caminho da configuração; o doctor registra a verificação `config-path` como warning quando ela existe |
| `PROMOVAWEB_CLICKUPFY_ACCOUNT` | `src/config.ts` (`resolverAccount`) | Define o perfil usado quando nenhum `--account` é informado, antes do perfil ativo |
| `PROMOVAWEB_CLICKUPFY_API_URL` | `src/clickup.ts` | Sobrescreve a base URL v2 (padrão `https://api.clickup.com/api/v2`) |
| `PROMOVAWEB_CLICKUPFY_API_URL_V3` | `src/clickup.ts` | Sobrescreve a base URL v3 (padrão `https://api.clickup.com/api/v3`) |
| `CLICKUPFY_REQUIRE_NATIVE` | `bin/clickupfy.cjs` | Com valor `1`, falha quando não existe executável nativo para a plataforma |
| `CLICKUPFY_FORCE_JAVASCRIPT` | `bin/clickupfy.cjs` | Com valor `1`, ignora o executável nativo e usa o fallback JavaScript |

`process.env` inteiro é repassado ao `npx skills` em `src/agent-assets.ts` e ao
`npm` em `src/upgrade.ts`. `src/processos.ts` executa os processos externos
com o ambiente recebido.

### Arquivos e diretórios

| Caminho | Uso | Origem |
| --- | --- | --- |
| `~/clickupfy/config.json` | Configuração multiperfil, com API keys; diretório em `0700` e arquivo em `0600` | `src/config.ts` |
| `<caminho da configuração>.<uuid>.tmp` | Arquivo temporário da gravação atômica | `src/arquivos.ts` |
| `.mcp.json` | Servidores MCP no projeto, chave `mcpServers`, entrada `promovaweb-clickupfy` | `src/agent-assets.ts` e `src/mcp-setup.ts` |
| `.codex/config.toml` | Servidores MCP do Codex, chave `mcp_servers` | `src/agent-assets.ts` e `src/mcp-setup.ts` |
| `.gemini/settings.json` | Servidores MCP do Gemini, chave `mcpServers` | `src/mcp-setup.ts` |
| `opencode.json` | Servidores MCP do OpenCode, chave `mcp` | `src/mcp-setup.ts` |
| `opencode.jsonc` | Usado no lugar de `opencode.json` quando já existe | `src/mcp-setup.ts` |
| `../.codex/skills/<skill>/SKILL.md` | Skill lida por `agent skill show` fora do executável standalone | `src/agent-assets.ts` |
| `skills/<skill>/SKILL.md` (asset interno) | Mesma leitura quando `node:sea` está ativo | `src/agent-assets.ts` |
| `<skill.path>/SKILL.md` e `<skill.path>/agents/openai.yaml` | Verificação de idioma das skills no doctor | `src/doctor.ts` |
| `--input <arquivo>` (ou `-` para stdin) | Envelope JSON das operações `api` | `src/api/cli.ts` |
| `--body-file <arquivo>` | Corpo JSON das operações `api` | `src/api/cli.ts` |
| `--file <campo=caminho>` | Arquivo lido, convertido em base64 e enviado como multipart | `src/api/cli.ts` |
| `$(npm prefix --global)/bin/clickupfy` | Launcher relido após o upgrade em sistemas não Windows | `src/upgrade.ts` |
| `$(npm prefix --global)/clickupfy.cmd` | Launcher relido após o upgrade no Windows | `src/upgrade.ts` |
| `vendor/<plataforma>-<arquitetura>/clickupfy` | Executável nativo procurado pelo launcher | `bin/clickupfy.cjs` |
| `dist/cli.js` | Fallback JavaScript compilado | `bin/clickupfy.cjs` |
| `node_modules/tsx/dist/cli.mjs` e `src/cli.ts` | Fallback de desenvolvimento via tsx | `bin/clickupfy.cjs` |
