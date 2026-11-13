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
| `setup` (alias `install`) | Configure a ClickUp API key and bind the profile to a workspace. | `--api-key <key>`, `--token <key>`, `--name <name>`, `--workspace <id>`, `--non-interactive` | `{ account, user, workspace, path }` | 2, 4, 5, 6, 7, 130 | `clickup.<perfil>.api_key` |
| `status` | Show the resolved profile and its configuration. | | `{ config, account, active, name, apiKey, user, workspace }` | 3, 4, 6 | `clickup.<perfil>.api_key` |
| `account list` (alias `ls`) | List profiles without API keys. | | `{ accounts[] }` | 3 | |
| `account show` | Show safe metadata of a profile. | `[profile]` | `{ account }` | 3, 4, 6 | `clickup.<perfil>.api_key` |
| `account use` | Set the active profile. | `<profile>` | `{ activeAccount }` | 3, 6, 7 | |
| `account remove` (alias `rm`) | Remove a profile and its API key. | `<profile>`, `--yes` | `{ account, removed }` | 2, 3, 6, 7, 130 | `clickup.<perfil>.api_key` |
| `account import` | Import profiles from the ClickUpfy 0.9.0 config file. | `--force` | `{ source, imported[], skipped[], activeAccount }` | 3, 6, 7 | `clickup.<perfil>.api_key` |
| `workspace list` (alias `ls`) | List workspaces the API key can reach. | | `{ workspaces[] }` | 3, 4, 5, 6 | `clickup.<perfil>.api_key` |
| `workspace use` | Bind an authorized workspace to the profile. | `<workspace-id>` | `{ account, workspace }` | 3, 4, 5, 6, 7 | `clickup.<perfil>.api_key` |
| `whoami` | Validate the API key and show the user. | | `{ account, user }` | 3, 4, 5, 6 | `clickup.<perfil>.api_key` |
| `tui` | Open the terminal interface (Overview and About). | `--tab <tab>` | não se aplica | 8 | |
| `about` | Show version, executable, runtime, platform and credits. | | `{ bin, title, version, description, author, site, repository, license, executable, runtime, platform, pid, dataDir, credits[] }` | | |
| `config list` | List every key with its effective value. | | `{ settings }` | 3 | |
| `config get` | Show the value of a key. | `<key>` | `{ key, value }` | 3 | |
| `config set` | Write a value to settings.json. | `<key> <value>` | `{ key, value }` | 3, 7 | |
| `config unset` | Remove a key from the file. | `<key>` | `{ key, removed }` | 3, 7 | |
| `config path` | Print the data directory and file paths. | | `{ dir, settings, credentials, masterKey }` | | |
| `config schema` | List the known keys with type, default and description. | | `{ keys[] }` | | |
| `credentials set` | Save or replace a credential. | `<name>`, `--stdin` | `{ name }` | 4, 7, 130 | |
| `credentials get` | Show a masked credential. | `<name>`, `--reveal` | `{ name, value }` | 4 | |
| `credentials list` | List saved names. | | `{ names[] }` | 4 | |
| `credentials remove` | Remove a credential from the vault. | `<name>` | `{ name, removed }` | 4, 7 | |
| `credentials status` | Show file, master key source and number of credentials. | | `{ file, keySource, count }` | 4 | |
| `credentials clear` | Delete credentials.json entirely. | `--yes` | `{ cleared }` | 7, 130 | |
| `credentials rotate-key` | Re-encrypt the vault with a new master key. | `--from-env` | `{ rotated }` | 4, 7 | |
| `mcp` | Start the MCP server (stdio). | `--list`, `--list-id <id>`, `--workspace <id>`, `--space <id>`, `--folder <id>`, `--sprint-folder <id>`, `--read-only` | catálogo com `--list` | 9 | |
| `space list` (alias `ls`) | List the spaces of the workspace bound to the profile. | `--archived` | `{ spaces[] }` | 3, 4, 5, 6 | `clickup.<perfil>.api_key` |
| `folder list` (alias `ls`) | List the folders of a space. | `--space <id>`, `--archived` | `{ folders[] }` | 2, 3, 4, 5, 6 | `clickup.<perfil>.api_key` |
| `list list` (alias `ls`) | List the lists of a folder, or the folderless lists of a space. | `--folder <id>`, `--space <id>`, `--archived` | `{ lists[] }` | 2, 3, 4, 5, 6 | `clickup.<perfil>.api_key` |
| `list get` | Get a list and the statuses available for its tasks. | `<list-id>` | list da API | 3, 4, 5, 6 | `clickup.<perfil>.api_key` |
| `mcp serve` | Start the MCP server pinned to a project (ClickUpfy 0.9.0 entry). | `--list <id>`, `--workspace <id>`, `--space <id>`, `--folder <id>`, `--sprint-folder <id>`, `--read-only`, `--describe` | catálogo com `--describe` | 9 | `clickup.<perfil>.api_key` |
| `mcp setup` | Write a pinned MCP server entry to the project client files. | `--name`, `--space`, `--list`, `--clients`, `--project`, `--read-only`, `--force`, `--non-interactive` | `{ name, account, workspace, space, list, args[], files[] }` | 2, 3, 4, 5, 6, 7, 130 | `clickup.<perfil>.api_key` |
| `skill` | Print the embedded documentation, whole or by topic. | `<topic>` | `{ topic, markdown }` | 6 | |
| `doctor` | Check runtime, terminal, settings, key source and vault readability. | | `{ ok, checks[] }` | 1 | |
| `completion` | Print a completion script for bash, zsh or fish. | `<shell>` | não se aplica | 2 | |

### Global options

| Option | Função |
| --- | --- |
| `--account <profile>` | perfil do ClickUp; padrão `PROMOVAWEB_CLICKUPFY_ACCOUNT` e depois o perfil ativo |

### Screens

| Screen | Função | Teclas |
| --- | --- | --- |
| `overview` | ambiente, estado de settings e cofre, settings em vigor e próximos passos | `←` `→`, `1`-`9`, `?`, `q` |
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
| resource | `clickupfy://about` | identidade e runtime em JSON | `read` |
| resource | `clickupfy://exit-codes` | tabela de exit codes em JSON | `read` |
| resource | `clickupfy://skill` | documentação completa em Markdown | `read` |
| resource | `clickupfy://skill/{topic}` | uma seção da documentação | `read` |
| prompt | `operate` | orienta o agente a ler a documentação e operar pelo CLI | `read` |

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
| 0004 | Tarefas e tags | draft |
| 0005 | Checklists e comentários | draft |
| 0006 | Sprints | draft |
| 0007 | Time tracking | draft |
| 0008 | Docs e páginas | draft |
| 0009 | Catálogo genérico da API | draft |
| 0010 | Integração com agentes e manutenção | draft |
| 0011 | Overview do ClickUp na TUI | draft |
| 0012 | Distribuição, documentação e merge | draft |

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
