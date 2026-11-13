# 0001 Perfis, API keys e client do ClickUp

Status: done

## Goal

Todo command do ClickUpfy depende de um perfil autenticado. Esta spec traz
o client HTTP das APIs v2 e v3 do ClickUp, os perfis com a API key no
cofre cifrado, a migração automática de `~/clickupfy/config.json` e os
commands de perfil e workspace do ClickUpfy 0.9.0, com os mesmos nomes.
Commands de tarefa, Sprint, Doc e tempo ficam para as specs seguintes.

## Behavior

Migração. Na primeira execução de qualquer command que leia perfis,
quando `~/.clickupfy/accounts.json` não existe e o config antigo existe
(`PROMOVAWEB_CLICKUPFY_CONFIG` ou `~/clickupfy/config.json`), o binário
importa cada perfil: metadados em `accounts.json` e a API key no cofre como
`clickup.<perfil>.api_key`. O arquivo antigo não é alterado nem apagado. O
stderr mostra `Imported N profiles from ~/clickupfy/config.json into the
vault.` uma única vez. Config antigo inválido sai com 3 e o caminho. O
command `account import` repete a importação sob demanda, com `--force`
para sobrescrever perfis que já existem.

`setup` (alias `install`) valida a API key em `GET /user`, lista os
workspaces autorizados, associa um ao perfil e torna o perfil ativo. Em
terminal interativo pede a chave sem eco, o nome e o workspace. Fora de
TTY exige `--api-key` (ou `--token`, alias) e, com mais de um workspace,
`--workspace`; sem eles sai com 2. `--name` define o perfil (normalizado
para kebab-case); sem ele, o nome vem do usuário do ClickUp. Chave
recusada pela API sai com 4. `--json` devolve
`{ account, user, workspace, path }`, sem a chave.

`status` mostra o perfil resolvido (`--account`,
`PROMOVAWEB_CLICKUPFY_ACCOUNT` ou o ativo): caminho, id, se é o ativo,
nome, chave mascarada, usuário e workspace. Sem perfil, sai com 4 e sugere
`clickupfy setup`.

`account list` (alias `ls`) lista `id`, `active`, `name`, `user`,
`workspace` e `workspace_id`, sem chaves. `account show [perfil]` mostra os
metadados de um perfil com a chave mascarada; perfil inexistente sai com
6. `account use <perfil>` define o ativo. `account remove <perfil>` apaga
os metadados e a credencial; pede confirmação em TTY e exige `--yes` fora
dele (sem `--yes`, sai com 2).

`workspace list` (alias `ls`) lista os workspaces que a chave alcança.
`workspace use <workspace-id>` associa ao perfil um workspace dessa lista;
id fora da lista sai com 6.

`whoami` chama `GET /user` e mostra id, username e email; o `--json` traz
`{ account, user }`.

A option global `--account <perfil>` vale para todo command. Falha de rede
ou resposta inesperada da API sai com 5; 401 e 403 saem com 4; 404 sai com
6; 429 espera o `Retry-After` e tenta de novo até três vezes antes de sair
com 5. Com `--json`, a saída usa o envelope `{ ok, command, data }` e os erros
`{ ok: false, command, error }`.

## Design

- `clickup/client.ts`: `ClickUpClient` com `request()` (v2) e
  `requestV3()`, base em `PROMOVAWEB_CLICKUPFY_API_URL` e
  `PROMOVAWEB_CLICKUPFY_API_URL_V3` (padrão `https://api.clickup.com/api/v2`
  e `/v3`), timeout de 30 s, header `Authorization` com a chave, retry em
  429 e mapeamento de status para `AppError` (4, 5, 6). Usa `fetch` do
  Bun, injetável nos testes.
- `clickup/accounts.ts`: lê e grava `~/.clickupfy/accounts.json`
  (`{ version: 1, activeAccount, accounts: { [id]: { name, user,
  workspace, createdAt, updatedAt } } }`, modo 0600, gravação atômica),
  `resolveAccount(id?)`, `normalizeAccountId()` e `clientFor(account)`,
  que lê a chave com `getCredential("clickup.<id>.api_key")`.
- `clickup/migrate.ts`: `migrateLegacyConfig({ force })`, chamada por
  `resolveAccount` quando `accounts.json` falta e pelo command
  `account import`. Valida o JSON antigo com zod, como o 0.9.0.
- `cli/commands/setup.ts`, `status.ts`, `account.ts`, `workspace.ts` e
  `whoami.ts`, registrados em `cli/commands.ts`; prompts pelo
  `cli/input.ts` do esqueleto.
- `cli/parser.ts`: option global `--account <perfil>`, recursiva, ao lado
  de `--json`.
- `config/paths.ts`: caminho de `accounts.json` em `dataDir()`.
- Sem dependência nova além de `zod`, que o esqueleto já tem.
- O contexto de projeto (space, folder, list, Sprint folder) que o 0.9.0
  guarda por servidor MCP fica para a spec 0002.

## Surface

- Adiciona o command `setup` (alias `install`): Configure an API key and
  bind the profile to a workspace; `--api-key <key>`, `--token <key>`,
  `--name <name>`, `--workspace <id>`, `--non-interactive`; `data`
  `{ account, user, workspace, path }`; exit codes 2, 4, 5, 7, 130;
  credencial `clickup.<perfil>.api_key`.
- Adiciona o command `status`: Show the resolved profile and its
  configuration; `data` `{ config, account, active, name, apiKey, user,
  workspace }`; exit codes 3, 4.
- Adiciona o command `account list` (alias `account ls`): List profiles
  without API keys; `data` `{ accounts[] }`; exit code 3.
- Adiciona o command `account show`: Show safe metadata of a profile;
  `[profile]`; `data` `{ account }`; exit codes 3, 4, 6.
- Adiciona o command `account use`: Set the active profile; `<profile>`;
  `data` `{ activeAccount }`; exit codes 3, 6, 7.
- Adiciona o command `account remove` (alias `account rm`): Remove a profile
  and its API key;
  `<profile>`, `--yes`; `data` `{ account, removed }`; exit codes 2, 6, 7, 130.
- Adiciona o command `account import`: Import profiles from the legacy
  config file; `--force`; `data` `{ imported[], skipped[], source }`;
  exit codes 3, 6, 7.
- Adiciona o command `workspace list` (alias `workspace ls`): List
  workspaces the API key can reach; `data` `{ workspaces[] }`; exit codes
  4, 5; credencial `clickup.<perfil>.api_key`.
- Adiciona o command `workspace use`: Bind an authorized workspace to the
  profile; `<workspace-id>`; `data` `{ account, workspace }`; exit codes
  4, 5, 6.
- Adiciona o command `whoami`: Validate the API key and show the user;
  `data` `{ account, user }`; exit codes 4, 5; credencial
  `clickup.<perfil>.api_key`.
- Adiciona a option global `--account <profile>`.
- Adiciona a credencial `clickup.<perfil>.api_key`: usada por todos os
  commands e tools que chamam o ClickUp; obtida em ClickUp, Settings,
  Apps, API Token.

## Tasks

- [x] `ClickUpClient` v2/v3 com retry e mapeamento de erros `#termfy-api`
- [x] `accounts.json`, `resolveAccount` e credencial
  `clickup.<perfil>.api_key` `#termfy-config`
- [x] Migração automática e command `account import` `#termfy-config`
- [x] Option global `--account` `#termfy-cli`
- [x] Commands `setup`, `status`, `whoami` `#termfy-cli`
- [x] Commands `account list`, `account show`, `account use`,
  `account remove` `#termfy-command-set`
- [x] Commands `workspace list` e `workspace use` `#termfy-command-set`
- [x] Documentação de perfis, migração e credencial em `docs/` `#termfy-docs`

## Tests

- [x] Com config antigo de dois perfis e `CLICKUPFY_HOME` vazio,
  `account list --json` importa os dois, grava as chaves no cofre e o
  arquivo antigo fica byte a byte igual
- [x] `account import` sem `--force` pula perfis já existentes
- [x] `setup --api-key X --workspace W --non-interactive --json` contra API
  fake (`Bun.serve`) cria o perfil ativo sem a chave na saída
- [x] `setup` sem `--api-key` fora de TTY sai com 2
- [x] `whoami` com chave recusada (401) sai com 4
- [x] `workspace use` com id fora da lista sai com 6
- [x] `account remove` sem `--yes` fora de TTY sai com 2
- [x] `status` sem perfil sai com 4 e sugere `clickupfy setup`
- [x] 429 com `Retry-After` é repetido até três vezes

## Notes

- 2026-11-13: criada como draft na entrevista do CLISPEC.
- 2026-11-13: checkpoint 1 aprovado. Perfis em `~/.clickupfy/accounts.json`
  (sem segredos) e chave no cofre. O `--json` usa o envelope
  `{ ok, command, data }` do Termfy; os scripts e as skills do Hub passam a
  ler `.data` na spec 0012.
- 2026-11-13: implementada e fechada; 17 testes em `tests/accounts.test.ts`,
  smoke test com o config real importado num `CLICKUPFY_HOME` isolado.
