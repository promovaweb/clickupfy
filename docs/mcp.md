# MCP

`{{bin}} mcp` transforma o processo em um servidor Model Context Protocol
sobre stdio. Nada mais é escrito em stdout; diagnósticos vão para stderr.

## Configuração no cliente

```json
{
  "mcpServers": {
    "{{bin}}": { "command": "{{bin}}", "args": ["mcp"] }
  }
}
```

Para o Claude Code: `claude mcp add {{bin}} -- {{bin}} mcp`.
Para desenvolvimento, sem compilar: `"command": "bun", "args": ["run", "src/main.ts", "mcp"]`.

## Tools

| Tool | Entrada | Saída |
| --- | --- | --- |
| `doctor` | nenhuma | `{ checks, ok }` com as verificações locais e do ClickUp; `isError: true` se houver `fail` |
| `about` | nenhuma | identity, runtime, platform, data directory e credits |
| `exit_codes` | nenhuma | tabela de exit codes |
| `skill` | `topic?` (`cli`, `tui`, `mcp`, `config`, `exit-codes`, `reference`) | documentação em Markdown |
| `config_list` | nenhuma | keys de settings.json em vigor e o schema |
| `config_get` | `key` | valor da key; `isError` quando não existe |
| `credentials_status` | nenhuma | file, master key source, count e names |

Nenhuma dessas tools devolve o valor de uma credencial ou grava arquivos.

## Escopo fixado

`{{bin}} mcp serve --account <perfil> --workspace <id> --space <id> --list <id>`
fixa o perfil e parte da hierarquia, como no ClickUpfy 0.9.0. As tools usam
esses ids como padrão e recusam outro id com `isError`. Toda tool do ClickUp
aceita `account` opcional; num servidor fixado, outro perfil é recusado, e o
workspace fixado precisa ser o do perfil. Com `--read-only`, as tools de
escrita não aparecem em `tools/list`. Falhas esperadas voltam com
`isError: true` e a mensagem, seguida do exit code equivalente do CLI.
Tools destrutivas exigem `confirm: true`.

## Tools de perfil e contexto

| Tool | Entrada | Saída | Efeito |
| --- | --- | --- | --- |
| `clickupfy_mcp_context` | `account?` | `{ account, workspace, readOnly, scope }` com os ids fixados | read |
| `clickupfy_accounts_list` | nenhuma | `{ accounts[] }`, sem API keys | read |
| `clickupfy_whoami` | `account?` | `{ account, workspace, user }` | network |
| `clickupfy_workspaces_list` | `account?` | `{ workspaces[] }` | network |
| `clickupfy_account_use` | `account` | `{ activeAccount }`; só sem perfil fixado | write |
| `clickupfy_workspace_use` | `account?`, `workspaceId` | `{ account, workspace }`; só sem perfil nem workspace fixados | write |

## Tools da hierarquia

| Tool | Entrada | Saída | Efeito |
| --- | --- | --- | --- |
| `clickupfy_spaces_list` | `account?`, `archived?` | `{ spaces[] }` | read |
| `clickupfy_folders_list` | `account?`, `spaceId?` (padrão: space fixado), `archived?` | `{ folders[] }` | read |
| `clickupfy_lists_list` | `account?`, `folderId?`, `spaceId?`, `archived?` | `{ lists[] }` | read |
| `clickupfy_list_get` | `account?`, `listId?` (padrão: list fixada) | a list com `statuses[]` | read |

## Tools de checklists e comentários

| Tool | Entrada | Saída | Efeito |
| --- | --- | --- | --- |
| `clickupfy_checklist_create` | `account?`, `taskId`, `name` | resposta do ClickUp, `{ checklist }` | write |
| `clickupfy_checklist_item_create` | `account?`, `checklistId`, `name`, `assignee?` (inteiro) | resposta do ClickUp, `{ checklist }` | write |
| `clickupfy_checklist_item_set` | `account?`, `taskId` (tarefa raiz de `clickupfy_task_get`), `checklistId`, `itemId`, `resolved` | o item confirmado numa nova leitura da tarefa, com `done`, `state` e `action` | write |
| `clickupfy_comments_list` | `account?`, `taskId` | `{ comments[] }` com `id`, `user`, `date`, `text` | read |
| `clickupfy_comment_create` | `account?`, `taskId`, `text`, `notifyAll?` | `{ id, hist_id, date }` | write |

## Tools de time tracking

| Tool | Entrada | Saída | Efeito |
| --- | --- | --- | --- |
| `clickupfy_time_current` | `account?` | `{ entry }`, com `entry: null` sem cronômetro | read |
| `clickupfy_time_start` | `account?`, `taskId`, `description?` | `{ entry, previous? }`; `previous` aparece quando o ClickUp trocou um cronômetro de outra tarefa | write |
| `clickupfy_time_stop` | `account?` | `{ entry }` com o time entry encerrado | write |

## Tools de sprints

`folderId` usa o Sprint Folder fixado por `mcp serve --sprint-folder` e
recusa outro id; sem Sprint Folder fixado, é obrigatório. `at` é a data de
referência em `AAAA-MM-DD`.

| Tool | Entrada | Saída | Efeito |
| --- | --- | --- | --- |
| `clickupfy_sprints_list` | `account?`, `folderId?`, `archived?`, `includeRegular?`, `at?` | `{ sprints[] }` | read |
| `clickupfy_sprint_current` | `account?`, `folderId?`, `at?` | a única Sprint ativa; erro com as candidatas quando há mais de uma | read |
| `clickupfy_sprint_get` | `account?`, `sprintId`, `at?` | período, progresso, `tasksByStatus` e Sprint Points | read |
| `clickupfy_sprint_tasks` | `account?`, `sprintId`, `openOnly?` | `{ tasks[] }` em linhas compactas (`id`, `custom_id`, `name`, `status`, `priority`, `points`, `assignees`, `start_date`, `due_date`, `url`) | read |
| `clickupfy_sprint_add_task` | `account?`, `sprintId`, `taskId` | `{ sprintId, taskId, added }` | write |
| `clickupfy_sprint_remove_task` | `account?`, `sprintId`, `taskId` | `{ sprintId, taskId, removed }` | write |
| `clickupfy_sprint_set_points` | `account?`, `taskId`, `points` | a tarefa atualizada | write |

## Tools de Docs

As tools usam o workspace do perfil. O conteúdo das páginas entra e sai pelo
campo `content`; a leitura de arquivo e de `stdin` existe só no CLI.

| Tool | Entrada | Saída | Efeito |
| --- | --- | --- | --- |
| `clickupfy_docs_list` | `account?`, `query?`, `parentId?`, `parentType?`, `deleted?`, `archived?`, `creator?`, `maxPages?` | `{ docs[] }` | read |
| `clickupfy_doc_get` | `account?`, `docId` | o Doc | read |
| `clickupfy_doc_create` | `account?`, `name`, `parentId?`, `parentType?` (obrigatório com `parentId`), `visibility?`, `createPage?` | o Doc criado | write |
| `clickupfy_doc_pages_list` | `account?`, `docId`, `maxPageDepth?`, `contentFormat?` | `{ pages[] }` com conteúdo | read |
| `clickupfy_doc_page_get` | `account?`, `docId`, `pageId`, `contentFormat?` | a página com conteúdo | read |
| `clickupfy_doc_page_tree` | `account?`, `docId` | `{ pages[] }` aninhadas, sem conteúdo | read |
| `clickupfy_doc_page_create` | `account?`, `docId`, `name`, `content?`, `subTitle?`, `parentPageId?`, `orderindex?`, `contentFormat?` | a página criada | write |
| `clickupfy_doc_page_update` | `account?`, `docId`, `pageId`, `name?`, `subTitle?`, `content?`, `contentEditMode?` (`replace`, `append`, `prepend`), `contentFormat?` | a página atualizada | write |

## Tools de tarefas e tags

| Tool | Entrada | Saída | Efeito |
| --- | --- | --- | --- |
| `clickupfy_tasks_list` | `account?`, `listId?` (padrão: list fixada), `status?[]`, `assignees?[]`, `includeClosed?`, `page?` | `{ tasks[] }` com linhas compactas (`id`, `custom_id`, `name`, `status`, `priority`, `points`, `assignees`, `start_date`, `due_date`, `url`) | read |
| `clickupfy_task_get` | `account?`, `taskId`, `raw?`, `markdown?` | `{ task, execution }`; com `raw`, a tarefa da API; com `markdown`, o texto | read |
| `clickupfy_tasks_search` | `account?`, `query?`, `status?[]`, `assignees?[]`, `includeClosed?`, `maxPages?` | `{ tasks[] }` compactas; busca só na list fixada e, sem list fixada, no workspace | read |
| `clickupfy_task_create` | `account?`, `listId?` (padrão: list fixada), `name`, `description?`, `markdownContent?`, `status?`, `priority?` (1 a 4), `assignees?[]` (ids numéricos em texto), `parent?`, `startDate?` e `dueDate?` (timestamp em ms), `points?` | a tarefa criada, com `id` e `url` | write |
| `clickupfy_task_update` | `account?`, `taskId`, `name?`, `description?`, `markdownContent?`, `status?`, `priority?`, `startDate?`, `clearStartDate?`, `dueDate?`, `clearDueDate?`, `points?` | a tarefa atualizada | write |
| `clickupfy_task_delete` | `account?`, `taskId`, `confirm: true` | `{ deleted, taskId }` | write, destrutiva |
| `clickupfy_task_add_tag` | `account?`, `taskId`, `tagName`, `customTaskId?` | `{ added, taskId, tagName }` | write |
| `clickupfy_task_remove_tag` | `account?`, `taskId`, `tagName`, `customTaskId?` | `{ removed, taskId, tagName }` | write |
| `clickupfy_tags_list` | `account?`, `spaceId?` (padrão: space fixado) | `{ tags[] }` | read |
| `clickupfy_tag_create` | `account?`, `spaceId?`, `name`, `foreground`, `background` | `{ created, spaceId, name }` | write |
| `clickupfy_tag_update` | `account?`, `spaceId?`, `tagName`, `name?`, `foreground?`, `background?` | `{ updated, spaceId, name }` | write |
| `clickupfy_tag_delete` | `account?`, `spaceId?`, `tagName`, `confirm: true` | `{ deleted, spaceId, name }` | write, destrutiva |

Em `clickupfy_task_update`, `clearStartDate` e `clearDueDate` removem as
datas. Cores usam `#RRGGBB`.

## Tools do catálogo da API

Cada operação do catálogo genérico (veja a seção "API" do CLI) vira uma tool
`clickupfy_api_<versão>_<slug>`, em que `<versão>` é `v2` ou `v3` e `<slug>`
é o `operationId` em `snake_case`: `GetTask` vira `clickupfy_api_v2_get_task`
e `getChatChannels` vira `clickupfy_api_v3_get_chat_channels`. São 173 tools,
registradas por padrão como no ClickUpfy 0.9.0. `{{bin}} api list` mostra o
nome da tool de cada operação e `{{bin}} api describe <tool>` mostra o
schema de entrada.

| Tool | Entrada | Saída | Efeito |
| --- | --- | --- | --- |
| `clickupfy_api_<versão>_<slug>` | `account?`, `path`, `query`, `headers`, `body`, `contentType`, `files` (multipart, `{ field, filename, contentBase64, contentType? }`), `confirm: true` em `DELETE`; cada objeto só existe quando a operação o declara | a resposta da API | read nas consultas (`GET`), write nas demais, destrutiva em `DELETE` |

As annotations trazem `readOnlyHint`, `destructiveHint` (operações `DELETE`)
e `openWorldHint`. Num servidor `--read-only`, só as operações de leitura
são registradas. Os ids fixados pelo servidor (`team_id`/`workspace_id`,
`space_id`, `folder_id`, `list_id`) preenchem os parâmetros que a operação
declara, ficam opcionais na entrada e recusam outro valor com `isError`;
sem workspace fixado, `team_id` e `workspace_id` usam o workspace do perfil.
O servidor nunca abre caminhos locais: arquivos chegam em base64 em `files`.

## Resources

| URI | Conteúdo |
| --- | --- |
| `{{bin}}://about` | identity em JSON |
| `{{bin}}://exit-codes` | exit codes em JSON |
| `{{bin}}://skill` | documentação completa em Markdown |
| `{{bin}}://skill/{topic}` | uma seção; o template lista os topics |

## Prompts

| Prompt | Arguments | Função |
| --- | --- | --- |
| `operate` | `task` | instrui o agente a ler `skill cli` e executar a task pelo CLI com `--json` |

## Listar sem iniciar

```bash
{{bin}} mcp --list
{{bin}} mcp --list --json
```

## Testar

```bash
npx @modelcontextprotocol/inspector {{bin}} mcp
```

O Inspector abre uma página local para chamar tools, ler resources e
inspecionar as mensagens JSON-RPC.

## Como adicionar uma tool

1. Copie `template/tool/example.ts` para `src/mcp/tools/<name>.ts`.
2. Declare `inputSchema` com Zod e descreva cada campo com `.describe()`. A
   description da tool diz quando usar e o que ela devolve.
3. Devolva `content` em texto e, quando a saída for estruturada,
   `structuredContent` com o mesmo objeto.
4. Acrescente a tool ao `catalog.tools` para que `mcp --list` a enxergue.
5. Registre a função em `registerAll` em `src/mcp/server.ts`.
6. Teste com o Inspector e com `bun test`.

Nomes de tools usam `snake_case`. Tools que gravam ou chamam APIs externas
precisam dizer isso na description e nunca devem ecoar segredos na resposta.

A tool `doctor` usa a mesma coleta do command CLI sem `--online`: confere
runtime, terminal, permissões da pasta, settings, origem da chave, leitura do
cofre e as verificações do ClickUp (`accounts`, `profile`, `api-key`,
`legacy-config`, `mcp-json`, `codex-config`), sem chamar a rede. Não grava
arquivos e não retorna valores de credenciais. Cada check traz `name`,
`status` (`ok`, `warn` ou `fail`), `detail` e, quando houver, `path`.
