# ClickUpfy

`clickupfy`: CLI, TUI and MCP stdio server to manage ClickUp Sprints, tasks, Docs and time tracking.

## Purpose

Quem desenvolve na Promovaweb, e os agentes de IA que trabalham com essa
pessoa, precisam ler e atualizar tarefas, Sprints, checklists, comentários,
Docs e cronômetros do ClickUp sem abrir o navegador. Hoje isso é feito pelo
ClickUpfy 0.9.0, um CLI em Node publicado no npm, que guarda os perfis e as
API keys em `~/clickupfy/config.json` em texto puro e expõe dezenas de tools
`clickupfy_*` usadas pelos MCPs do Hub. Este binário refaz o ClickUpfy sobre
o Termfy, com paridade 1:1 de commands e tools, cofre cifrado para as API
keys, migração automática dos perfis antigos e uma TUI mínima. Ele conversa
com as APIs v2 e v3 do ClickUp por API key pessoal e não guarda dados do
ClickUp localmente: só settings, perfis e credenciais.

## Audiences

| Público | Modo | Necessidade |
| --- | --- | --- |
| pessoa desenvolvedora | CLI texto | consultar e atualizar tarefas, Sprints, Docs e o cronômetro sem sair do terminal |
| pessoa desenvolvedora | TUI | ver de relance o perfil, o contexto (workspace, space, list) e o cronômetro em execução |
| scripts e rotinas do Hub | CLI `--json` | criar tarefas, comentar, mudar status e registrar tempo com saída estável |
| agentes (Claude Code, Codex, OpenCode) | MCP | operar tarefas, checklists, comentários, Sprints, Docs e tempo com as tools `clickupfy_*`, num contexto fixado por servidor |

## Out of scope

- Funcionalidades novas até o merge na `main`: a fase atual é paridade
  1:1 com o ClickUpfy 0.9.0; melhorias viram specs depois.
- Guardar tarefas, Docs ou histórico do ClickUp localmente (sem SQLite).
- Autenticação OAuth: só API key pessoal por perfil.
- Criar ou apagar workspaces, spaces, folders e lists.
- Telas de edição na TUI: a TUI desta fase só mostra estado.

## Surface

### Commands

| Command | Função | Options | `data` no `--json` | Exit codes | Credenciais |
| --- | --- | --- | --- | --- | --- |
| `setup` (alias `install`) | Configure a ClickUp API key and bind the profile to a workspace. | `--api-key <key>`, `--token <key>`, `--name <name>`, `--workspace <id>`, `--non-interactive` | `{ account, user, workspace, path }` | 4, 5, 6, 7, 130 | `clickup.<perfil>.api_key` |
| `status` | Show the resolved profile and its configuration. | | veja `docs/cli.md` | 3, 4, 6 | `clickup.<perfil>.api_key` |
| `account list` (alias `ls`) | List profiles without API keys. | | `{ accounts[] }` | 3 | |
| `account show` | Show safe metadata of a profile, with the API key masked. | `[profile]` | `{ account }` | 3, 4, 6 | `clickup.<perfil>.api_key` |
| `account use` | Set the active profile. | `<profile>` | `{ activeAccount }` | 3, 6, 7 | |
| `account remove` (alias `rm`) | Remove a profile and its API key from the vault. | `<profile>`, `--yes` | `{ account, removed }` | 3, 6, 7, 130 | `clickup.<perfil>.api_key` |
| `account import` | Import profiles from the ClickUpfy 0.9.0 config file into the vault. | `--force` | `{ source, imported[], skipped[], activeAccount }` | 3, 6, 7 | `clickup.<perfil>.api_key` |
| `workspace list` (alias `ls`) | List workspaces the API key can reach. | | veja `docs/cli.md` | 3, 4, 5, 6 | `clickup.<perfil>.api_key` |
| `workspace use` | Bind an authorized workspace to the profile. | `<workspace-id>` | `{ account, workspace }` | 3, 4, 5, 6, 7 | `clickup.<perfil>.api_key` |
| `whoami` | Validate the API key and show the authenticated user. | | `{ account, user }` | 3, 4, 5, 6 | `clickup.<perfil>.api_key` |
| `space list` (alias `ls`) | List the spaces of the workspace bound to the profile. | `--archived` | `{ spaces[] }` | 3, 4, 5, 6 | `clickup.<perfil>.api_key` |
| `folder list` (alias `ls`) | List the folders of a space. | `--space <space-id>`, `--archived` | `{ folders[] }` | 3, 4, 5, 6 | `clickup.<perfil>.api_key` |
| `list list` (alias `ls`) | List the lists of a folder, or the folderless lists of a space. | `--folder <folder-id>`, `--space <space-id>`, `--archived` | `{ lists[] }` | 3, 4, 5, 6 | `clickup.<perfil>.api_key` |
| `list get` | Get a list and the statuses available for its tasks. | `<list-id>` | list da API | 3, 4, 5, 6 | `clickup.<perfil>.api_key` |
| `task list` (alias `ls`) | List the tasks of a list. | `--list <list-id>`, `--status <values>`, `--assignee <values>`, `--include-closed`, `--page <page>` | veja `docs/cli.md` | 2, 3, 4, 5, 6 | `clickup.<perfil>.api_key` |
| `task get` | Get a task and its addressable queue of subtasks and checklist items. | `<task-id>`, `--raw`, `--markdown` | veja `docs/cli.md` | 2, 3, 4, 5, 6 | `clickup.<perfil>.api_key` |
| `task search` | Search tasks by text, status and assignee. | `--query <query>`, `--status <values>`, `--assignee <values>`, `--include-closed`, `--max-pages <max-pages>` | veja `docs/cli.md` | 2, 3, 4, 5, 6 | `clickup.<perfil>.api_key` |
| `task create` | Create a task in a list. | `--list <list-id>`, `--name <name>`, `--description <description>`, `--markdown-content <markdown-content>`, `--status <status>`, `--priority <priority>`, `--assignee <values>`, `--parent <parent>`, `--start-date <start-date>`, `--due-date <due-date>`, `--points <points>` | veja `docs/cli.md` | 2, 3, 4, 5, 6 | `clickup.<perfil>.api_key` |
| `task update` | Update the name, description, status, priority, dates or points of a task. | `<task-id>`, `--name <name>`, `--description <description>`, `--markdown-content <markdown-content>`, `--status <status>`, `--priority <priority>`, `--start-date <start-date>`, `--clear-start-date`, `--due-date <due-date>`, `--clear-due-date`, `--points <points>` | veja `docs/cli.md` | 2, 3, 4, 5, 6 | `clickup.<perfil>.api_key` |
| `task delete` | Delete a task permanently. | `<task-id>`, `--yes` | veja `docs/cli.md` | 2, 3, 4, 5, 6, 130 | `clickup.<perfil>.api_key` |
| `task add-tag` | Add a tag to a task without replacing its other tags. | `<task-id>`, `<tag-name>`, `--custom-task-id` | veja `docs/cli.md` | 2, 3, 4, 5, 6 | `clickup.<perfil>.api_key` |
| `task remove-tag` | Remove a tag from a task, keeping the tag in the space catalog. | `<task-id>`, `<tag-name>`, `--custom-task-id` | veja `docs/cli.md` | 2, 3, 4, 5, 6 | `clickup.<perfil>.api_key` |
| `tag list` | List the names and colors of the tags of a space. | `--space <space-id>` | veja `docs/cli.md` | 2, 3, 4, 5, 6 | `clickup.<perfil>.api_key` |
| `tag create` | Create a tag with a name and colors in a space. | `<name>`, `--space <space-id>`, `--foreground <foreground>`, `--background <background>` | veja `docs/cli.md` | 2, 3, 4, 5, 6 | `clickup.<perfil>.api_key` |
| `tag update` | Rename a tag or change its colors, preserving the omitted fields. | `<tag-name>`, `--space <space-id>`, `--name <name>`, `--foreground <foreground>`, `--background <background>` | veja `docs/cli.md` | 2, 3, 4, 5, 6 | `clickup.<perfil>.api_key` |
| `tag delete` | Delete a tag from a space. | `<tag-name>`, `--space <space-id>`, `--yes` | veja `docs/cli.md` | 2, 3, 4, 5, 6, 130 | `clickup.<perfil>.api_key` |
| `checklist create` | Create a checklist on a task. | `<task-id>`, `--name <name>` | veja `docs/cli.md` | 3, 4, 5, 6 | `clickup.<perfil>.api_key` |
| `checklist item-create` | Add an item to an existing checklist. | `<checklist-id>`, `--name <name>`, `--assignee <assignee>` | veja `docs/cli.md` | 3, 4, 5, 6 | `clickup.<perfil>.api_key` |
| `checklist set` | Mark or reopen a checklist item and confirm the state in a new read of the task. | `<task-id>`, `<checklist-id>`, `<item-id>`, `--resolved`, `--open` | veja `docs/cli.md` | 2, 3, 4, 5, 6 | `clickup.<perfil>.api_key` |
| `comment list` (alias `ls`) | Read the comment history of a task. | `--task <task-id>` | veja `docs/cli.md` | 3, 4, 5, 6 | `clickup.<perfil>.api_key` |
| `comment create` | Publish a progress comment on a task. | `--task <task-id>`, `--text <text>`, `--notify-all` | veja `docs/cli.md` | 3, 4, 5, 6 | `clickup.<perfil>.api_key` |
| `time current` | Show the running time entry of the workspace. | | veja `docs/cli.md` | 3, 4, 5, 6 | `clickup.<perfil>.api_key` |
| `time start` | Start a time entry on a task. | `--task <task-id>`, `--description <description>` | veja `docs/cli.md` | 3, 4, 5, 6 | `clickup.<perfil>.api_key` |
| `time stop` | Stop the running time entry of the workspace. | | veja `docs/cli.md` | 3, 4, 5, 6 | `clickup.<perfil>.api_key` |
| `sprint list` (alias `ls`) | List the Sprints of a Sprint folder, identified by their period. | `--folder <folder-id>`, `--archived`, `--include-regular`, `--at <at>` | veja `docs/cli.md` | 2, 3, 4, 5, 6 | `clickup.<perfil>.api_key` |
| `sprint current` | Get the only active Sprint of a Sprint folder. | `--folder <folder-id>`, `--at <at>` | veja `docs/cli.md` | 2, 3, 4, 5, 6 | `clickup.<perfil>.api_key` |
| `sprint get` | Show the period, progress, status distribution and Sprint Points of a Sprint. | `<sprint-id>`, `--at <at>` | veja `docs/cli.md` | 2, 3, 4, 5, 6 | `clickup.<perfil>.api_key` |
| `sprint tasks` | List every task associated with a Sprint, closed tasks included. | `<sprint-id>`, `--open-only` | veja `docs/cli.md` | 2, 3, 4, 5, 6 | `clickup.<perfil>.api_key` |
| `sprint add-task` | Add a task to a Sprint without changing its main list. | `<sprint-id>`, `<task-id>` | veja `docs/cli.md` | 2, 3, 4, 5, 6 | `clickup.<perfil>.api_key` |
| `sprint remove-task` | Remove the association between a task and a Sprint without deleting the task. | `<sprint-id>`, `<task-id>` | veja `docs/cli.md` | 2, 3, 4, 5, 6 | `clickup.<perfil>.api_key` |
| `sprint set-points` | Set the Sprint Points estimate of a task. | `<task-id>`, `<points>` | veja `docs/cli.md` | 2, 3, 4, 5, 6 | `clickup.<perfil>.api_key` |
| `doc list` (alias `ls`) | Search the Docs of the workspace bound to the profile. | `--query <query>`, `--parent-id <parent-id>`, `--parent-type <parent-type>`, `--deleted`, `--archived`, `--creator <creator>`, `--max-pages <max-pages>` | veja `docs/cli.md` | 3, 4, 5, 6 | `clickup.<perfil>.api_key` |
| `doc get` | Get the metadata of a Doc. | `<doc-id>` | veja `docs/cli.md` | 3, 4, 5, 6 | `clickup.<perfil>.api_key` |
| `doc create` | Create a Doc in the bound workspace, optionally under a Space, Folder, List or task. | `--name <name>`, `--parent-id <parent-id>`, `--parent-type <parent-type>`, `--visibility <visibility>`, `--create-page` | veja `docs/cli.md` | 2, 3, 4, 5, 6 | `clickup.<perfil>.api_key` |
| `doc page list` (alias `ls`) | List the pages of a Doc with their content. | `<doc-id>`, `--max-page-depth <max-page-depth>`, `--content-format <content-format>` | veja `docs/cli.md` | 3, 4, 5, 6 | `clickup.<perfil>.api_key` |
| `doc page get` | Get one page of a Doc with its content. | `<doc-id>`, `<page-id>`, `--content-format <content-format>` | veja `docs/cli.md` | 3, 4, 5, 6 | `clickup.<perfil>.api_key` |
| `doc page tree` | Show the page tree of a Doc, without content. | `<doc-id>` | veja `docs/cli.md` | 3, 4, 5, 6 | `clickup.<perfil>.api_key` |
| `doc page create` | Create a page, or a sub-page, in an existing Doc. | `<doc-id>`, `--name <name>`, `--content <content>`, `--file <file>`, `--sub-title <sub-title>`, `--parent-page <parent-page-id>`, `--orderindex <orderindex>`, `--content-format <content-format>` | veja `docs/cli.md` | 2, 3, 4, 5, 6 | `clickup.<perfil>.api_key` |
| `doc page update` | Update the title, subtitle and/or content of an existing page. | `<doc-id>`, `<page-id>`, `--name <name>`, `--sub-title <sub-title>`, `--content <content>`, `--file <file>`, `--content-edit-mode <content-edit-mode>`, `--content-format <content-format>` | veja `docs/cli.md` | 2, 3, 4, 5, 6 | `clickup.<perfil>.api_key` |
| `api list` (alias `ls`) | List the catalog operations with method, path, version, group and MCP tool. | `--group <group>`, `--read-only` | veja `docs/cli.md` | | `clickup.<perfil>.api_key` |
| `api describe` | Show parameters, body formats and the input JSON Schema of an operation. | `<operation>` | veja `docs/cli.md` | 6 | `clickup.<perfil>.api_key` |
| `api call` | Validate the input and send one request to a catalog operation. | `<operation>`, `--path <json>`, `--query <json>`, `--body <json>`, `--body-file <file>`, `--input <file>`, `--content-type <type>`, `--file <field=path>`, `--yes`, `--dry-run` | veja `docs/cli.md` | 3, 4, 5, 6, 130 | `clickup.<perfil>.api_key` |
| `agent skill list` (alias `ls`) | List the skills embedded in the binary. | | veja `docs/cli.md` | | `clickup.<perfil>.api_key` |
| `agent skill show` | Print the instructions (SKILL.md) of one skill. | `<skill>` | veja `docs/cli.md` | | `clickup.<perfil>.api_key` |
| `agent skill install` | Install skills with the official manager (npx skills add). | `[skills]`, `--global`, `--force` | veja `docs/cli.md` | 6 | `clickup.<perfil>.api_key` |
| `agent install` (alias `init`) | Install the skills and add the pinned MCP server to .mcp.json and .codex/config.toml. | `--global`, `--workspace <id>`, `--space <id>`, `--folder <id>`, `--list <id>`, `--sprint-folder <id>`, `--force` | veja `docs/cli.md` | 3, 4, 6, 7 | `clickup.<perfil>.api_key` |
| `upgrade` | Update ClickUpfy to the latest release or to a given version. | `[target]` | veja `docs/cli.md` | 5, 6, 7 | `clickup.<perfil>.api_key` |
| `tui` | Open the terminal interface (Overview and About). Requires a TTY. | `--tab <tab>` | não se aplica | 8 | |
| `about` | Show version, executable, runtime, platform and credits. | | veja `docs/cli.md` | | |
| `config list` (alias `ls`) | List every key with its effective value (file merged with defaults). | | veja `docs/cli.md` | 3, 6, 7 | |
| `config get` | Show the value of a key. | `<key>` | `{ key, value }` | 3, 6, 7 | |
| `config set` | Write a value to settings.json, converting the type according to the schema. | `<key>`, `<value>` | `{ key, value }` | 3, 6, 7 | |
| `config unset` (alias `rm`) | Remove a key from the file. The key falls back to its default, if any. | `<key>` | `{ key, removed }` | 3, 6, 7 | |
| `config path` | Print the data directory and file paths. | | veja `docs/cli.md` | | |
| `config schema` | List the known keys with type, default and description. | | veja `docs/cli.md` | | |
| `credentials set` | Save or replace a credential. The value is read without echo or from stdin. | `<name>`, `--stdin` | `{ name }` | 4, 7, 130 | |
| `credentials get` | Show a masked credential. Use --reveal for the full value. | `<name>`, `--reveal` | `{ name, value }` | 4, 7, 130 | |
| `credentials list` (alias `ls`) | List saved names. Never shows values. | | veja `docs/cli.md` | 4, 7, 130 | |
| `credentials remove` (alias `rm`) | Remove a credential from the vault. | `<name>` | `{ name, removed }` | 4, 7, 130 | |
| `credentials status` | Show file, master key source and number of credentials. | | veja `docs/cli.md` | | |
| `credentials clear` | Delete credentials.json entirely. Keeps master.key. Asks for confirmation on a terminal. | `--yes` | `{ cleared }` | 4, 7, 130 | |
| `credentials rotate-key` | Re-encrypt the existing vault with a new master key and write master.key with mode 0600. | `--from-env` | `{ rotated }` | 4, 7, 130 | |
| `mcp` | Start the MCP server (stdio) with tools, resources and prompts for agents. | `--list`, `--list-id <id>`, `--workspace <id>`, `--space <id>`, `--folder <id>`, `--sprint-folder <id>`, `--read-only` | catálogo com `--list` | 9 | |
| `mcp serve` | Start the MCP server pinned to a project, as in ClickUpfy 0.9.0 client configs. | `--list <id>`, `--workspace <id>`, `--space <id>`, `--folder <id>`, `--sprint-folder <id>`, `--read-only`, `--describe` | catálogo com `--describe` | 9 | `clickup.<perfil>.api_key` |
| `mcp setup` | Write a pinned MCP server entry to the project files of Claude Code, Codex, Gemini and OpenCode. | `--name <name>`, `--space <id>`, `--list <id>`, `--clients <clients>`, `--project <dir>`, `--read-only`, `--force`, `--non-interactive` | `{ name, account, workspace, space, list, args[], files[] }` | 3, 4, 5, 6, 7, 130 | `clickup.<perfil>.api_key` |
| `skill` | Print the embedded documentation, whole or by topic. Same effect as --skill. | `[topic]` | `{ topic, markdown }` | | |
| `doctor` | Check runtime, settings, vault, ClickUp profile, API key and project MCP files without changing files. | `--online` | veja `docs/cli.md` | 3 | |
| `completion` | Print a registry-generated completion script for bash, zsh or fish. | `<shell>` | não se aplica | | |

### Global options

| Option | Função |
| --- | --- |
| `--account <profile>` | perfil do ClickUp; padrão `PROMOVAWEB_CLICKUPFY_ACCOUNT` e depois o perfil ativo |

### Screens

| Screen | Função | Teclas |
| --- | --- | --- |
| `overview` | perfil resolvido, workspace, cronômetro em execução, estado local e perfis | `r`, `←` `→`, `1`-`9`, `?`, `q` |
| `about` | identidade, links e créditos do binário | `←` `→`, `1`-`9`, `?`, `q` |

### MCP

| Tipo | Nome | Função | Efeito |
| --- | --- | --- | --- |
| tool | `about` | versão, executável, runtime, plataforma e créditos | `read` |
| tool | `exit_codes` | tabela de exit codes | `read` |
| tool | `skill` | documentação embutida, inteira ou por tópico | `read` |
| tool | `config_list` | todas as keys com o valor efetivo | `read` |
| tool | `config_get` | valor de uma key | `read` |
| tool | `credentials_status` | nomes salvos e origem da master key, sem valores | `read` |
| tool | `doctor` | diagnóstico de runtime, terminal e configuração | `read` |
| tool | `clickupfy_mcp_context` | perfil, workspace e escopo fixados | `read` |
| tool | `clickupfy_accounts_list` | perfis locais sem API keys | `read` |
| tool | `clickupfy_whoami` | usuário autenticado | `network` |
| tool | `clickupfy_workspaces_list` | workspaces autorizados | `network` |
| tool | `clickupfy_account_use` | define o perfil padrão; só sem perfil fixado | `write` |
| tool | `clickupfy_workspace_use` | associa outro workspace; só sem perfil e workspace fixados | `write` |
| tool | `clickupfy_spaces_list` | spaces do workspace | `network` |
| tool | `clickupfy_folders_list` | folders de um space | `network` |
| tool | `clickupfy_lists_list` | lists de um folder ou space | `network` |
| tool | `clickupfy_list_get` | list e seus status | `network` |
| tool | `clickupfy_tasks_list` | List the tasks of a list. | `network` |
| tool | `clickupfy_task_get` | Get a task and its addressable queue of subtasks and checklist items. | `network` |
| tool | `clickupfy_tasks_search` | Search tasks by text, status and assignee. | `network` |
| tool | `clickupfy_task_create` | Create a task in a list. | `network` |
| tool | `clickupfy_task_update` | Update the name, description, status, priority, dates or points of a task. | `network` |
| tool | `clickupfy_task_delete` | Delete a task permanently. | `network` |
| tool | `clickupfy_task_add_tag` | Add a tag to a task without replacing its other tags. | `network` |
| tool | `clickupfy_task_remove_tag` | Remove a tag from a task, keeping the tag in the space catalog. | `network` |
| tool | `clickupfy_tags_list` | List the names and colors of the tags of a space. | `network` |
| tool | `clickupfy_tag_create` | Create a tag with a name and colors in a space. | `network` |
| tool | `clickupfy_tag_update` | Rename a tag or change its colors, preserving the omitted fields. | `network` |
| tool | `clickupfy_tag_delete` | Delete a tag from a space. | `network` |
| tool | `clickupfy_checklist_create` | Create a checklist on a task. | `network` |
| tool | `clickupfy_checklist_item_create` | Add an item to an existing checklist. | `network` |
| tool | `clickupfy_checklist_item_set` | Mark or reopen a checklist item and confirm the state in a new read of the task. | `network` |
| tool | `clickupfy_comments_list` | Read the comment history of a task. | `network` |
| tool | `clickupfy_comment_create` | Publish a progress comment on a task. | `network` |
| tool | `clickupfy_time_current` | Show the running time entry of the workspace. | `network` |
| tool | `clickupfy_time_start` | Start a time entry on a task. | `network` |
| tool | `clickupfy_time_stop` | Stop the running time entry of the workspace. | `network` |
| tool | `clickupfy_sprints_list` | List the Sprints of a Sprint folder, identified by their period. | `network` |
| tool | `clickupfy_sprint_current` | Get the only active Sprint of a Sprint folder. | `network` |
| tool | `clickupfy_sprint_get` | Show the period, progress, status distribution and Sprint Points of a Sprint. | `network` |
| tool | `clickupfy_sprint_tasks` | List every task associated with a Sprint, closed tasks included. | `network` |
| tool | `clickupfy_sprint_add_task` | Add a task to a Sprint without changing its main list. | `network` |
| tool | `clickupfy_sprint_remove_task` | Remove the association between a task and a Sprint without deleting the task. | `network` |
| tool | `clickupfy_sprint_set_points` | Set the Sprint Points estimate of a task. | `network` |
| tool | `clickupfy_docs_list` | Search the Docs of the workspace bound to the profile. | `network` |
| tool | `clickupfy_doc_get` | Get the metadata of a Doc. | `network` |
| tool | `clickupfy_doc_create` | Create a Doc in the bound workspace, optionally under a Space, Folder, List or task. | `network` |
| tool | `clickupfy_doc_pages_list` | List the pages of a Doc with their content. | `network` |
| tool | `clickupfy_doc_page_get` | Get one page of a Doc with its content. | `network` |
| tool | `clickupfy_doc_page_tree` | Show the page tree of a Doc, without content. | `network` |
| tool | `clickupfy_doc_page_create` | Create a page, or a sub-page, in an existing Doc. | `network` |
| tool | `clickupfy_doc_page_update` | Update the title, subtitle and/or content of an existing page. | `network` |
| tool | `clickupfy_api_<versão>_<slug>` | uma tool por operação do catálogo (173 operações v2 e v3); só leitura em `--read-only` | `network` |
| resource | `clickupfy://about` | Binary identity and runtime as JSON. | `read` |
| resource | `clickupfy://exit-codes` | Exit-code table as JSON. | `read` |
| resource | `clickupfy://skill` | Full documentation in Markdown. | `read` |
| resource | `clickupfy://skill/{topic}` | One documentation section. Topics: cli, tui, mcp, config, exit-codes, reference. | `read` |
| prompt | `operate` | Guides the agent to read the documentation and run a task through the CLI. | `read` |

### Settings

| Key | Tipo | Padrão | Função |
| --- | --- | --- | --- |
| `output.format` | `enum` (`text`, `json`) | `text` | formato padrão da saída do CLI |
| `output.colors` | `boolean` | `true` | cores ANSI na saída texto |
| `tui.initialTab` | `enum` (`overview`, `about`) | `overview` | aba aberta ao iniciar a TUI |
| `tui.theme` | `enum` (`night`, `day`) | `night` | paleta da TUI |
| `telemetry.enabled` | `boolean` | `false` | reservado; nada é enviado |

### Credentials

| Nome | Usada por | Como obter |
| --- | --- | --- |
| `clickup.<perfil>.api_key` | todos os commands e tools que chamam o ClickUp | ClickUp, Settings, Apps, API Token; gravada por `setup` ou importada do config antigo |

## Specs

| ID | Título | Status |
| --- | --- | --- |
| 0001 | Perfis, API keys e client do ClickUp | done |
| 0002 | Servidor MCP compatível | done |
| 0003 | Spaces, folders e lists | done |
| 0004 | Tarefas e tags | done |
| 0005 | Checklists e comentários | done |
| 0006 | Sprints | done |
| 0007 | Time tracking | done |
| 0008 | Docs e páginas | done |
| 0009 | Catálogo genérico da API | done |
| 0010 | Integração com agentes e manutenção | done |
| 0011 | Overview do ClickUp na TUI | done |
| 0012 | Distribuição, documentação e merge | in_progress |

## Notes

- 2026-11-13: binário iniciado a partir do Termfy Starter Kit 0.9.2, na
  branch `termfy` do repositório `promovaweb/clickupfy`. O CLI Node 0.9.0
  fica em `legacy/` como referência até a paridade e sai antes do merge.
- 2026-11-13: entrevista com o Luiz definiu paridade 1:1 primeiro, nomes de
  commands e de tools MCP `clickupfy_*` mantidos (com otimizações quando
  necessário), `mcp serve` como alias de `mcp` com as flags de contexto
  atuais, TUI mínima e migração automática de `~/clickupfy/config.json`
  para o cofre, sem apagar o arquivo antigo.
- 2026-11-13: distribuição por binários compilados na GitHub Release e
  pacote npm `@promovaweb/clickupfy` como wrapper que baixa e roda o
  binário. A versão segue a série do projeto (0.9.0); a release do
  binário Termfy será a 1.0.0.
- 2026-11-13: nenhum command atual sai na paridade (`upgrade`,
  `agent init/skill`, `api` e `task delete` continuam). O texto do código
  passa a ser em inglês, como exige o Termfy; a documentação segue em
  português.
- 2026-11-13: checkpoint 1 aprovado. Perfis em `~/.clickupfy/accounts.json`
  e API key de cada perfil no cofre como `clickup.<perfil>.api_key`.
- 2026-11-13: o `--json` adota o envelope `{ ok, command, data }` do
  Termfy; scripts e skills do Hub que leem o objeto cru migram na spec 0012.
- 2026-11-13: spec 0001 (Perfis, API keys e client do ClickUp) closed.
- 2026-11-13: spec 0002 (Servidor MCP compatível) closed.
- 2026-11-13: spec 0003 (Spaces, folders e lists) closed.
- 2026-11-13: spec 0011 (Overview do ClickUp na TUI) closed.
- 2026-11-13: spec 0004 (Tarefas e tags) closed.
- 2026-11-13: spec 0005 (Checklists e comentários) closed.
- 2026-11-13: spec 0006 (Sprints) closed.
- 2026-11-13: spec 0007 (Time tracking) closed.
- 2026-11-13: spec 0008 (Docs e páginas) closed.
- 2026-11-13: spec 0009 (Catálogo genérico da API) closed.
- 2026-11-13: spec 0010 (Integração com agentes e manutenção) closed.
- 2026-11-13: na Surface, o `data` dos commands das specs 0004 a 0010 está
  descrito em `docs/cli.md`, que o `docs:check` confere com o registry.
