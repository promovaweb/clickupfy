# 0001 Perfis, API keys e client do ClickUp

Status: draft

## Goal

Todo command depende de um perfil autenticado. Esta spec traz o client HTTP das APIs v2 e v3, os perfis com a API key no cofre cifrado e a migração automática de `~/clickupfy/config.json`, com os commands de perfil e workspace do ClickUpfy 0.9.0.

## Behavior

Na primeira execução sem perfis no cofre, se `~/clickupfy/config.json` (ou `PROMOVAWEB_CLICKUPFY_CONFIG`) existir, os perfis e as API keys são importados e o arquivo antigo fica intacto, com aviso no stderr. `setup` cadastra uma API key e associa o perfil a um workspace; `status` mostra perfil ativo e contexto; `account list|show|use|remove` gerenciam perfis sem revelar chaves; `workspace list|use`; `whoami` valida a chave. `--account <perfil>` e `PROMOVAWEB_CLICKUPFY_ACCOUNT` escolhem o perfil por execução. Sem chave, exit 4; falha da API, exit 5.

## Design

Client em `src/clickup/client.ts` (v2 e v3, erros mapeados para exit codes), perfis em `src/clickup/accounts.ts`, migração em `src/clickup/migrate.ts`. Referência: `legacy/src/clickup.ts`, `legacy/src/config.ts`, `legacy/src/setup.ts`.

## Surface

- Adiciona os commands `setup`, `status`, `account list`, `account show`, `account use`, `account remove`, `workspace list`, `workspace use` e `whoami`.
- Adiciona a option global `--account <perfil>`.
- Adiciona credenciais `clickup.<perfil>.api_key`.

## Tasks

- [ ] Client HTTP v2/v3 `#termfy-api`
- [ ] Perfis e credenciais por perfil `#termfy-config`
- [ ] Migração automática do config antigo `#termfy-config`
- [ ] Commands de perfil, workspace e `whoami` `#termfy-cli`

## Tests

- [ ] Migração importa perfis e chaves sem alterar o arquivo antigo
- [ ] `whoami --json` com API fake (`Bun.serve`)
- [ ] Sem chave, exit 4

## Notes

- 2026-11-13: criada como draft na entrevista do CLISPEC; options detalhadas na `termfy-spec`.
