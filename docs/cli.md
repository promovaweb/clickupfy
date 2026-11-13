# CLI

## Convenções

- `{{bin}} <command> [subcommand] [arguments] [options]`.
- Options aceitam `--key value` e `--key=value`. Não há agrupamento de flags
  curtas (`-abc`).
- `--` encerra a leitura de options; o que vem depois é argument.
- Options globais valem em qualquer posição, antes ou depois do command.
- Sem argumentos, em terminal interativo, o binário abre a TUI. Sem TTY,
  imprime o help e sai com exit code 2.
- Toda saída de dados vai para stdout. Avisos, progresso e erros em modo
  texto vão para stderr.
- Nomes de commands, subcommands, options, arguments, keys e campos de saída
  são em inglês. Mensagens do binário também.

## Options globais

| Option | Efeito |
| --- | --- |
| `-h`, `--help` | Help do command atual. Exit code 0. |
| `-V`, `--version` | Imprime `{{bin}} <version>`. Exit code 0. |
| `--json` | Saída em JSON com envelope estável. Erros também saem em JSON, em stdout. |
| `--skill [topic]` | Documentação embutida. Topics: `cli`, `tui`, `mcp`, `config`, `exit-codes`, `reference`. |
| `--opencli` | Descrição OpenCLI 0.1 da árvore de commands em JSON. |
| `--account <profile>` | Perfil do ClickUp usado pelo command. O padrão vem de `PROMOVAWEB_CLICKUPFY_ACCOUNT` e, depois, do perfil ativo. |
| `--no-color` | Desliga cores ANSI. `NO_COLOR=1` tem o mesmo efeito. |

## Saída em texto e em JSON

Texto é o padrão quando `output.format` em settings.json é `text`. Com
`--json`, ou com `output.format = json`, a saída segue este envelope:

```json
{ "ok": true, "command": "{{bin}} config get", "data": { "key": "tui.theme", "value": "night" } }
```

Em erro:

```json
{
  "ok": false,
  "command": "{{bin}} credentials get",
  "error": { "code": 4, "name": "CREDENTIALS", "message": "Credential \"x\" not found.", "details": { "name": "x" } }
}
```

O exit code do processo é sempre o mesmo de `error.code`. Um agente deve ler
os dois: o envelope para a mensagem, o code para a classe da falha.

## Perfis e workspaces

Um perfil reúne o nome local, o usuário do ClickUp, um workspace e a API
key guardada no cofre. Estes commands criam, consultam e trocam o perfil
usado pelos demais commands.

| Command | Função | Options | data no `--json` | Exit codes |
| --- | --- | --- | --- | --- |
| `setup` (alias `install`) | Valida a API key em `GET /user`, associa um workspace e torna o perfil ativo. Pede a chave sem eco e o workspace em TTY. | `--api-key <key>`, `--token <key>`, `--name <name>`, `--workspace <id>`, `--non-interactive` | `{ account, user, workspace, path }` | 2, 4, 5, 6, 7, 130 |
| `status` | Mostra o perfil resolvido, o caminho do `accounts.json`, se é o ativo, a chave mascarada, o usuário e o workspace. Não chama a API. | nenhuma | `{ config, account, active, name, apiKey, user, workspace }` | 3, 4, 6 |
| `whoami` | Valida a API key em `GET /user` e mostra id, username e email. | nenhuma | `{ account, user }` | 3, 4, 5, 6 |
| `account list` (alias `ls`) | Lista `id`, `active`, `name`, `user`, `workspace` e `workspace_id`, sem chaves. | nenhuma | `{ accounts[] }` | 3 |
| `account show [profile]` | Mostra os metadados de um perfil com a chave mascarada. Sem argument, usa o perfil resolvido. | nenhuma | `{ account }` | 3, 4, 6 |
| `account use <profile>` | Define o perfil ativo. | nenhuma | `{ activeAccount }` | 3, 6, 7 |
| `account remove <profile>` (alias `rm`) | Apaga os metadados e a credencial do perfil. | `--yes` | `{ account, removed }` | 2, 3, 6, 7, 130 |
| `account import` | Importa os perfis do config antigo do ClickUpfy 0.9.0 para o cofre. | `--force` | `{ source, imported[], skipped[], activeAccount }` | 3, 6, 7 |
| `workspace list` (alias `ls`) | Lista os workspaces que a API key alcança, marcando o associado ao perfil. | nenhuma | `{ workspaces[] }` | 3, 4, 5, 6 |
| `workspace use <workspace-id>` | Associa ao perfil um workspace da lista. | nenhuma | `{ account, workspace }` | 3, 4, 5, 6, 7 |

O perfil usado por um command é resolvido nesta ordem: a option
`--account <profile>`, a variável `PROMOVAWEB_CLICKUPFY_ACCOUNT` e o perfil
ativo em `accounts.json`. Sem nenhum deles o command sai com 4 e sugere
`{{bin}} setup`; um id inexistente sai com 6. A API key fica no cofre como
`clickup.<perfil>.api_key` e nunca aparece na saída: `status` e
`account show` mostram a versão mascarada e `account list` a omite.

## Hierarquia

Os commands abaixo consultam a hierarquia do workspace associado ao perfil.
Listas saem como tabela em texto e dentro de um objeto no `--json`.

| Command | Função | Options | data no `--json` |
| --- | --- | --- | --- |
| `space list` (alias `ls`) | Spaces do workspace do perfil. | `--archived` | `{ spaces[] }` |
| `folder list` (alias `ls`) | Folders de um space. | `--space <id>` (obrigatória no CLI), `--archived` | `{ folders[] }` |
| `list list` (alias `ls`) | Lists de um folder, ou lists sem folder de um space. | `--folder <id>` ou `--space <id>`, `--archived` | `{ lists[] }` |
| `list get <list-id>` | Uma list e os status disponíveis para as tarefas. | nenhuma | a list da API, com `statuses[]` |

Sem `--folder` nem `--space`, `list list` sai com 2. Um id inexistente sai
com 6.

## Checklists e comentários

Os agentes publicam o plano como checklist na tarefa e o progresso como
comentário. `checklist set` confere, antes da mudança, se o item pertence à
tarefa raiz (ou a uma subtarefa dela) e, depois, confirma o estado gravado
numa nova leitura da tarefa.

| Command | Função | Options | data no `--json` |
| --- | --- | --- | --- |
| `checklist create <task-id>` | Cria um checklist na tarefa. | `--name <nome>` (obrigatória) | resposta do ClickUp, `{ checklist }` |
| `checklist item-create <checklist-id>` | Acrescenta um item ao checklist. | `--name <nome>` (obrigatória), `--assignee <id>` (inteiro) | resposta do ClickUp, `{ checklist }` com `items[]` |
| `checklist set <task-id> <checklist-id> <item-id>` | Marca ou reabre o item e confirma o estado. | `--resolved` ou `--open` (exatamente uma) | o item na forma da fila de `task get`: `key`, `type`, `taskId`, `parentKey`, `depth`, `name`, `done`, `state` (`done` ou `pending`), `checklistId`, `checklistName`, `action` |
| `comment list` (alias `ls`) | Histórico de comentários da tarefa, com todas as páginas. | `--task <id>` (obrigatória) | `{ comments[] }` com `id`, `user`, `date`, `text` |
| `comment create` | Publica um comentário de progresso. | `--task <id>` e `--text <texto>` (obrigatórias), `--notify-all` | resposta do ClickUp, `{ id, hist_id, date }` |

Option obrigatória ausente, `--assignee` não inteiro ou `checklist set` sem
exatamente uma entre `--resolved` e `--open` saem com 2. Item que não pertence
ao checklist da tarefa sai com 6. Estado não confirmado na releitura sai com 5.

## Time tracking

O cronômetro usa o workspace associado ao perfil
(`/team/{workspace}/time_entries`). O ClickUp mantém um cronômetro por pessoa:
`time start` com outro cronômetro ativo em outra tarefa troca o cronômetro.
Antes de iniciar, o command consulta o atual e, quando ele roda em outra
tarefa, avisa no stderr e devolve a tarefa anterior em `previous`, sem impedir
a troca.

| Command | Função | Options | data no `--json` |
| --- | --- | --- | --- |
| `time current` | Mostra o time entry em execução. | nenhuma | `{ entry }`, com `entry: null` e exit 0 sem cronômetro |
| `time start` | Inicia um time entry na tarefa. | `--task <id>` (obrigatória), `--description <texto>` | `{ entry, previous? }`; `previous` traz `id`, `taskId`, `taskName`, `description`, `start` |
| `time stop` | Encerra o time entry em execução. | nenhuma | `{ entry }` com o time entry encerrado |

`time start` sem `--task` sai com 2. `time stop` sem cronômetro ativo sai com
5, com a mensagem do ClickUp.

## Sprints

Uma Sprint é uma list existente de um Sprint Folder com `start_date` e
`due_date` preenchidos; lists sem período são comuns (`regular`). O status
(`planned`, `active`, `completed`) é calculado contra a data de referência:
hoje ou `--at <AAAA-MM-DD>`, lida ao meio-dia UTC. Adicionar uma tarefa à
Sprint usa a associação a várias lists do ClickUp, sem trocar a list
principal da tarefa.

| Command | Função | Options | data no `--json` |
| --- | --- | --- | --- |
| `sprint list` (alias `ls`) | Sprints do folder com período, status e quantidade de tarefas. | `--folder <id>` (obrigatória), `--archived`, `--include-regular`, `--at <date>` | `{ sprints[] }` com `id`, `name`, `startDate`, `dueDate`, `status`, `taskCount`, `isSprint` |
| `sprint current` | A única Sprint ativa do folder. | `--folder <id>` (obrigatória), `--at <date>` | a Sprint resumida |
| `sprint get <sprint-id>` | Período, progresso, distribuição por status e Sprint Points. | `--at <date>` | a Sprint com `totalTasks`, `completedTasks`, `openTasks`, `totalPoints`, `completedPoints`, `unestimatedTasks`, `taskCompletionPercent`, `pointsCompletionPercent`, `tasksByStatus` |
| `sprint tasks <sprint-id>` | Todas as tarefas da Sprint, concluídas inclusive. | `--open-only` | `{ tasks[] }` com as tarefas completas da API |
| `sprint add-task <sprint-id> <task-id>` | Associa a tarefa à Sprint sem trocar a list principal. | nenhuma | `{ sprintId, taskId, added }` |
| `sprint remove-task <sprint-id> <task-id>` | Remove só a associação com a Sprint. | nenhuma | `{ sprintId, taskId, removed }` |
| `sprint set-points <task-id> <points>` | Define os Sprint Points da tarefa (zero ou mais). | nenhuma | a tarefa atualizada |

Sem `--folder`, com data inválida, com Sprint Points negativos ou com uma list
sem período no lugar de `<sprint-id>`, o command sai com 2. `sprint current`
sai com 6 quando nenhuma Sprint está ativa e com 2 quando há mais de uma: a
mensagem lista as candidatas e o `--json` traz `error.details.candidates[]`.

## Docs

Docs ficam na API v3, no workspace associado ao perfil. O conteúdo das
páginas sai em Markdown (`text/md`, padrão) ou em texto puro com
`--content-format text/plain`. Em `doc page create` e `doc page update`, o
conteúdo vem de `--content <text>`, de um arquivo com `--file <path>` ou do
`stdin` com `--file -`; `--content` e `--file` juntos saem com 2.

| Command | Função | Options | data no `--json` |
| --- | --- | --- | --- |
| `doc list` (alias `ls`) | Docs do workspace, seguindo o cursor da API. | `--query <text>`, `--parent-id <id>`, `--parent-type <n>`, `--deleted`, `--archived`, `--creator <id>`, `--max-pages <n>` (1 a 50, padrão 50) | `{ docs[] }` |
| `doc get <doc-id>` | Metadados de um Doc. | nenhuma | o Doc da API |
| `doc create` | Cria um Doc, opcionalmente sob um Space, Folder, List ou tarefa. | `--name <name>` (obrigatória), `--parent-id <id>`, `--parent-type <n>`, `--visibility <value>`, `--create-page` | o Doc criado |
| `doc page list <doc-id>` (alias `ls`) | Páginas do Doc com conteúdo. | `--max-page-depth <n>`, `--content-format <value>` | `{ pages[] }` |
| `doc page get <doc-id> <page-id>` | Uma página com conteúdo; em texto imprime só o conteúdo. | `--content-format <value>` | a página da API |
| `doc page tree <doc-id>` | Árvore de páginas, sem conteúdo; em texto, indentada. | nenhuma | `{ pages[] }` com `pages[]` aninhadas |
| `doc page create <doc-id>` | Cria uma página ou sub-página. | `--name <name>` (obrigatória), `--content <text>`, `--file <path>`, `--sub-title <text>`, `--parent-page <id>`, `--orderindex <n>`, `--content-format <value>` | a página criada |
| `doc page update <doc-id> <page-id>` | Atualiza título, subtítulo e/ou conteúdo. | `--name <name>`, `--sub-title <text>`, `--content <text>`, `--file <path>`, `--content-edit-mode <mode>` (`replace`, `append`, `prepend`), `--content-format <value>` | a página atualizada |

`--parent-type` aceita 4 (Space), 5 (Folder), 6 (List), 7 (Everything) e 12
(Task) e é obrigatória junto de `--parent-id` em `doc create`. `doc page
update` sem `--name`, `--sub-title`, `--content` nem `--file` sai com 2. Um
Doc ou página inexistente sai com 6, assim como um `--file` que não existe.

## Tarefas e tags

Os commands `task` leem e alteram tarefas; `tag` mantém o catálogo de tags
de um space. Listas aceitam vários valores separados por vírgula
(`--status "to do,review"`, `--assignee 7,8`).

| Command | Função | Options | data no `--json` |
| --- | --- | --- | --- |
| `task list` (alias `ls`) | Uma página (até 100) de tarefas de uma list. | `--list <id>` (obrigatória no CLI), `--status <values>`, `--assignee <values>`, `--include-closed`, `--page <n>` (a partir de zero) | `{ tasks[] }` com as tarefas completas da API |
| `task get <task-id>` | Tarefa com a fila endereçável de subtarefas e checklist items. | `--raw` (só a resposta da API), `--markdown` (um documento Markdown) | `{ task, execution: { summary, items[] } }`; com `--raw`, a tarefa; com `--markdown`, o texto |
| `task search` | Busca tarefas em todo o workspace do perfil. | `--query <texto>` (id, custom id, nome ou descrição), `--status <values>`, `--assignee <values>`, `--include-closed`, `--max-pages <n>` (1 a 100, padrão 100) | `{ tasks[] }` |
| `task create` | Cria uma tarefa ou subtarefa. | `--list <id>`, `--name <nome>` (obrigatória), `--description <texto>`, `--markdown-content <markdown>`, `--status <status>`, `--priority <1-4>`, `--assignee <ids>`, `--parent <task-id>`, `--start-date <AAAA-MM-DD>`, `--due-date <AAAA-MM-DD>`, `--points <n>` | a tarefa criada, com `id` e `url` |
| `task update <task-id>` | Atualiza campos de uma tarefa; exige ao menos um. | `--name`, `--description`, `--markdown-content`, `--status`, `--priority <1-4>`, `--start-date <AAAA-MM-DD>`, `--clear-start-date`, `--due-date <AAAA-MM-DD>`, `--clear-due-date`, `--points <n>` | a tarefa atualizada |
| `task delete <task-id>` | Exclui a tarefa de forma permanente. | `--yes` | `{ deleted, taskId }` |
| `task add-tag <task-id> <tag-name>` | Adiciona uma tag sem trocar as outras. | `--custom-task-id` (id personalizado no workspace do perfil) | `{ added, taskId, tagName }` |
| `task remove-tag <task-id> <tag-name>` | Remove a tag da tarefa e a mantém no space. | `--custom-task-id` | `{ removed, taskId, tagName }` |
| `tag list` | Nomes e cores das tags de um space. | `--space <id>` (obrigatória no CLI) | `{ tags[] }` com `name`, `tag_fg`, `tag_bg` |
| `tag create <name>` | Cria uma tag no space. | `--space <id>`, `--foreground <#RRGGBB>` e `--background <#RRGGBB>` (obrigatórias) | `{ created, spaceId, name }` |
| `tag update <tag-name>` | Renomeia a tag ou troca as cores, preservando o que foi omitido. | `--space <id>`, `--name <nome>`, `--foreground <#RRGGBB>`, `--background <#RRGGBB>` | `{ updated, spaceId, name }` |
| `tag delete <tag-name>` | Exclui a tag do space. | `--space <id>`, `--yes` | `{ deleted, spaceId, name }` |

Cada item de `execution.items` em `task get` tem `key` estável
(`task:<id>` ou `checklist:<checklist-id>:<item-id>`), `type`, `depth`,
`done`, `state` e `action.complete` com o command do CLI e a chamada MCP que
conclui o item. A ordem segue a tarefa, seus checklists e as subtarefas, pelo
`orderindex`.

Datas em `--start-date` e `--due-date` viram o início do dia no fuso local da
máquina, enviadas com `start_date_time` e `due_date_time` iguais a `false`,
para o ClickUp mostrar só a data. Prioridade fora de 1 a 4, pontos
negativos, data inválida, `task update` sem campo, `--raw` junto de
`--markdown` ou cor fora de `#RRGGBB` saem com 2. `task delete` e
`tag delete` sem `--yes` fora de um terminal interativo saem com 2; recusar a
confirmação sai com 130. Tarefa ou tag inexistente sai com 6.

## API

O catálogo genérico cobre os endpoints que os commands dedicados não cobrem.
Ele é gerado das especificações OpenAPI públicas do ClickUp (173 operações:
138 da v2 e 35 da v3), fica em `src/api/catalog.json` e entra no binário;
nada é baixado em tempo de execução. O argument `<operation>` aceita o
`operationId` (`GetTask`), o nome de CLI (`v2-get-task`) ou o nome da tool
(`clickupfy_api_v2_get_task`).

| Command | Função | Options | data no `--json` |
| --- | --- | --- | --- |
| `api list` (alias `ls`) | Operações com método, caminho, versão, grupo e tool MCP. | `--group <group>`, `--read-only` | `{ sources[], total, operations[] }` |
| `api describe <operation>` | Parâmetros, formatos do corpo e JSON Schema da entrada. | nenhuma | a operação do catálogo com `inputSchema` |
| `api call <operation>` | Valida a entrada e envia uma requisição ao caminho documentado. | `--path <json>`, `--query <json>`, `--body <json>`, `--body-file <file>`, `--input <file>`, `--content-type <type>`, `--file <field=path>` (repetível), `--yes`, `--dry-run` | a resposta da API; com `--dry-run`, `{ valid, operation, method, path }` |

A entrada de `api call` é um envelope com `path`, `query`, `headers`, `body`,
`contentType` e `files`. `--input` lê o envelope de um arquivo, ou do stdin
com `-`; `--path`, `--query`, `--body`, `--body-file`, `--content-type` e
`--file` preenchem os mesmos campos, e um campo informado duas vezes sai com
2. `--file attachment[0]=./relatorio.pdf` lê o arquivo e o envia como
multipart; repita a option para mais arquivos. Arrays de query seguem a
convenção da v2 (`statuses[]`) e filtros de Custom Fields saem como JSON.

A forma do ClickUpfy 0.9.0, `{{bin}} api v2-get-task --path ...`, continua
aceita: cada operação tem um subcommand oculto que roda `api call` com a
operação fixada.

Entrada fora do contrato da operação, JSON inválido ou `--body` junto de
`--body-file` saem com 2, sem chamar a API. Operações `DELETE` pedem
confirmação no terminal; fora dele, sem `--yes`, saem com 2, e recusar sai
com 130. Operação desconhecida sai com 6. Erros da API seguem os exit codes
do client (4, 5 e 6). Para atualizar o catálogo, rode
`bun run api:generate` (`--check` confere se `src/api/catalog.json` está em
dia; `--fetch` baixa as especificações antes).

## Agentes

As skills do ClickUpfy ficam em `.codex/skills/` do repositório e o
`SKILL.md` de cada uma entra no binário. A instalação usa o gerenciador
oficial `npx skills add promovaweb/clickupfy`, a única ferramenta Node que o
binário chama.

| Command | Função | Options | data no `--json` |
| --- | --- | --- | --- |
| `agent skill list` (alias `ls`) | Skills embutidas no binário. | nenhuma | `{ skills[] }` com `name` e `description` |
| `agent skill show <skill>` | Imprime o `SKILL.md` de uma skill. | nenhuma | `{ name, content }` |
| `agent skill install [skills...]` | Instala as skills indicadas, ou todas, com `npx skills add`. | `--global`, `--force` | `{ skills[] }` como `skills list --json` informa |
| `agent install` (alias `init`) | Instala todas as skills e grava o servidor `promovaweb-clickupfy` no `.mcp.json` e no `.codex/config.toml` do diretório atual. | `--space <id>` e `--list <id>` (obrigatórias), `--workspace <id>`, `--folder <id>`, `--sprint-folder <id>`, `--global`, `--force` | `{ account, name, args[], skills[], files[] }` |

`agent skill install` roda `npx --yes skills add promovaweb/clickupfy --yes
--copy --agent codex --skill <nome>...` (mais `--global`) e confere o
resultado com `npx skills list --json`; `--force` existe só por
compatibilidade. `agent install` usa o perfil de `--account` (ou o ativo),
substitui a entrada `promovaweb-clickupfy` e preserva as demais, com
`mcp serve --account <perfil> --space <id> --list <id>` e os ids opcionais.
Só o id do perfil vai para os arquivos, nunca a API key.

Skill desconhecida em `agent skill show` sai com 2 e em
`agent skill install` sai com 6. Falta de `--space` ou `--list`, ou um
`--workspace` diferente do perfil, sai com 2; perfil inexistente sai com 6.
Falha do `npx skills` ou `npx` ausente do PATH sai com 1.

## Instalação e atualização

| Command | Função | Options | data no `--json` |
| --- | --- | --- | --- |
| `upgrade [target]` | Atualiza para `latest` (padrão), `next` (só npm) ou uma versão SemVer. | nenhuma | `{ from, method, target, ... }` |

Instalado pelo pacote npm `@promovaweb/clickupfy`, o `upgrade` roda
`npm install -g @promovaweb/clickupfy@<target>`. Como binário avulso, baixa
`clickupfy-<plataforma>` e o `SHA256SUMS` da GitHub Release, confere o hash
e troca o executável. Rodando do código-fonte (`bun run src/main.ts`), sai
com 2. Alvo inválido sai com 2; asset ausente, com 6; falha de rede ou de
checksum, com 5; sem permissão para trocar o arquivo, com 7.

## Servidor MCP

| Command | Função |
| --- | --- |
| `mcp` | Inicia o servidor stdio. `--list` descreve tools, resources e prompts; `--list-id <id>` fixa a list do projeto. |
| `mcp serve` | Entrada do ClickUpfy 0.9.0, mantida para as configs existentes. Aqui `--list <id>` fixa a list do projeto e `--describe` lista as tools do escopo. |
| `mcp setup` | Grava uma entrada fixada no `.mcp.json`, `.codex/config.toml`, `.gemini/settings.json` e `opencode.json` do projeto. |

As flags de escopo valem para `mcp` e `mcp serve`: `--account <profile>`,
`--workspace <id>`, `--space <id>`, `--folder <id>`, `--sprint-folder <id>`
e `--read-only`. Um servidor fixado usa esses ids como padrão das tools e
recusa outro id enviado pelo agente; com `--read-only`, as tools que alteram
o ClickUp ou os perfis locais não são registradas.

`mcp setup` escolhe perfil, space e list (perguntando no terminal, ou por
`--account`, `--space` e `--list`), aceita `--name`, `--clients`
(`claude-code`, `codex`, `gemini`, `opencode`), `--project`,
`--read-only`, `--force` e `--non-interactive`, preserva as outras
entradas e grava só o id do perfil, nunca a API key. Uma entrada com o mesmo
nome exige `--force`; fora de TTY, sem as flags, sai com 2. O `--json`
devolve `{ name, account, workspace, space, list, args[], files[] }`.

## Commands do esqueleto

| Command | Função |
| --- | --- |
| `tui [--tab <tab>]` | Abre a TUI. Exige TTY. |
| `about` | Version, executable, runtime, platform e credits. |
| `config list\|get\|set\|unset\|path\|schema` | Preferências em settings.json. |
| `credentials set\|get\|list\|remove\|status\|clear\|rotate-key` | Cofre cifrado em credentials.json. |
| `mcp [--list]` | Servidor MCP via stdio, ou listagem do que ele registra; veja "Servidor MCP". |
| `skill [topic]` | Mesmo efeito de `--skill`. |
| `doctor [--online]` | Confere runtime, TTY, pasta, settings, chave, cofre, perfil do ClickUp, API key e arquivos MCP do projeto. |
| `completion <shell>` | Gera script para `bash`, `zsh` ou `fish`. |

## Como adicionar um command

1. Copie `template/command/example.ts` para `src/cli/commands/<name>.ts`.
2. Preencha `name`, `description`, `arguments`, `options`, `examples` e
   `exitCodes`. Toda option precisa de `description`; é ela que aparece no
   `--help`, no `--skill` e no OpenCLI.
3. Implemente `run(ctx)` devolvendo `{ data, text }`. `data` é o que sai em
   `--json`; `text` é o que sai para humanos. Lance `AppError` (ou use
   `error.*`) para falhas previstas, com o exit code certo.
4. Registre o command em `src/cli/commands.ts`.
5. Rode `bun test`, `bun run opencli` e confira `docs/opencli.json`.

Segredos nunca entram por argument de linha de comando. Leia pelo stdin ou
por `readSecret()`; grave com `setCredential()`; recupere com
`getCredential()`, que encerra com exit code 4 quando o valor não existe.

## Diagnóstico e completion

`{{bin}} doctor` confere Bun 1.4.4 ou superior, TTY de stdin/stdout,
pasta de dados com 0700, leitura de settings.json, origem da master key,
decifragem do cofre, versão e plataforma. Cada linha usa ✓, ! ou ✗.
Em JSON, `data` contém `{ checks, ok }`; cada check tem `name`, `status`,
`detail` e, quando se refere a um arquivo, `path`. Ausência de TTY ou de
arquivos ainda não criados gera `warn`.
Uma verificação com `fail` produz exit code 3; as demais retornam 0.
O diagnóstico não cria arquivos nem mostra segredos.

As verificações do ClickUp também rodam sem rede:

| Check | O que confere |
| --- | --- |
| `accounts` | `~/.clickupfy/accounts.json` existe e segue o schema; ausente gera `warn`, inválido gera `fail`. |
| `profile` | O perfil resolvido por `--account`, `PROMOVAWEB_CLICKUPFY_ACCOUNT` ou o perfil ativo; sem perfil gera `warn` apontando `{{bin}} setup`, perfil inexistente gera `fail`. |
| `api-key` | A API key do perfil está no cofre como `clickup.<perfil>.api_key`, sem mostrar o valor. |
| `legacy-config` | O config do ClickUpfy 0.9.0 (`PROMOVAWEB_CLICKUPFY_CONFIG` ou `~/clickupfy/config.json`) ainda existe; gera `warn`, porque guarda API keys em texto puro. |
| `mcp-json`, `codex-config` | Servidores `clickupfy` no `.mcp.json` e no `.codex/config.toml` do diretório atual: args com `mcp` e `--list` e perfil existente. Arquivo ausente não gera check; sem servidor gera `warn`; formato inválido ou entrada errada gera `fail`. |

Com `--online`, o doctor também valida a API key em `GET /user`
(`clickup-api`) e lê as skills instaladas com `npx skills list --json`
(`skills-cli`, `skills-project`, `skills-global` e `skill-language-<nome>`,
que confere se cada skill continua em português do Brasil). Essas
verificações podem chamar a rede e baixar o gerenciador de skills.

`{{bin}} completion <shell>` imprime o script em stdout. O argument `shell`
aceita `bash`, `zsh` ou `fish`; subcommands, options locais e globais e valores
de enum vêm do registry. Com `--json`, `data` contém `{ shell, script }`.
O script Zsh usa `compdef` e `compadd`, sem `bashcompinit`.
Instale na sessão atual ou acrescente a linha ao arquivo de inicialização:

```bash
eval "$({{bin}} completion bash)"
eval "$({{bin}} completion zsh)"
# fish
{{bin}} completion fish | source
```

`{{bin}} --skill reference` retorna somente a referência gerada, com
commands, arguments, options e exit codes. `skill reference` tem o mesmo
resultado, sem os capítulos da documentação.
