# 0010 Integração com agentes e manutenção

Status: done

## Goal

Instalar as skills do ClickUpfy nos agentes, diagnosticar o setup e atualizar o binário.

## Behavior

- `agent skill list` lista as skills embutidas no binário (nome e
  descrição); `agent skill show <skill>` imprime o `SKILL.md`.
- `agent skill install [skills...]` roda `npx --yes skills add
  promovaweb/clickupfy --yes --copy --agent codex --skill <nome>...` (mais
  `--global`) e confere o resultado com `npx skills list --json`.
- `agent install` (alias `init`) instala todas as skills e grava o servidor
  `promovaweb-clickupfy` no `.mcp.json` e no `.codex/config.toml` do
  diretório atual, com `mcp serve --account <perfil> --space <id> --list
  <id>` e os ids opcionais, preservando as outras entradas.
- `doctor` ganha as verificações do ClickUp sem rede: `accounts`,
  `profile`, `api-key`, `legacy-config`, `mcp-json` e `codex-config`. Com
  `--online` (só CLI), valida a API key em `GET /user` (`clickup-api`) e as
  skills instaladas (`skills-cli`, `skills-project`, `skills-global`,
  `skill-language-<nome>`). A tool `doctor` usa a coleta sem rede.
- `upgrade [target]` atualiza para `latest`, `next` (só npm) ou uma versão:
  pelo npm (`npm install -g @promovaweb/clickupfy@<target>`) quando o
  wrapper npm iniciou o binário (`CLICKUPFY_LAUNCHER=npm`), ou baixando
  `clickupfy-<plataforma>` e o `SHA256SUMS` da GitHub Release e trocando o
  executável. Do código-fonte sai com 2.

## Design

- `src/agent/skills.ts`: `SKILL.md` das cinco skills de `.codex/skills/`
  importados como texto (entram no executável compilado), validação de
  nome, `runSkillsCli` (`Bun.spawn` de `npx`, a exceção permitida pelo
  `CLAUDE.md`), `listManagedSkills` e `installSkills`.
- `src/cli/commands/agent.ts`: o command `agent`; `agent install` reutiliza
  `writeClientEntries` de `src/mcp/setup.ts` com `force: true`.
- `src/cli/commands/doctor.ts`: `collectDoctorChecks(runtime, options)`
  continua síncrono e sem rede; `collectOnlineChecks` faz a parte de rede.
  Checks ganham `path` opcional.
- `src/cli/commands/upgrade.ts`: `releaseAsset()`, caminho npm e caminho
  binário com conferência do SHA256 e troca atômica.

## Surface

| Command | Função | Options | data no `--json` | Exit codes |
| --- | --- | --- | --- | --- |
| `agent skill list` (alias `ls`) | Skills embutidas. | nenhuma | `{ skills[] }` | 0 |
| `agent skill show <skill>` | `SKILL.md` de uma skill. | nenhuma | `{ name, content }` | 2 |
| `agent skill install [skills...]` | Instala com `npx skills add`. | `--global`, `--force` | `{ skills[] }` | 1, 6 |
| `agent install` (alias `init`) | Skills e servidor MCP do projeto. | `--space`, `--list` (obrigatórias), `--workspace`, `--folder`, `--sprint-folder`, `--global`, `--force` | `{ account, name, args[], skills[], files[] }` | 1, 2, 3, 4, 6, 7 |
| `doctor` | Diagnóstico local e do ClickUp. | `--online` | `{ checks[], ok }` | 3 |
| `upgrade [target]` | Atualiza pelo npm ou pela GitHub Release. | nenhuma | `{ from, method, target, ... }` | 2, 5, 6, 7 |

| Tool | Efeito |
| --- | --- |
| `doctor` | `read`; agora inclui as verificações do ClickUp, sem rede |

## Tasks

- [x] `agent` `#termfy-cli`
- [x] `doctor` `#termfy-cli`
- [x] `upgrade` `#termfy-cli`

## Tests

- [x] `doctor --json` sem perfil aponta o problema
- [x] `agent skill list|show|install` e `agent install`/`init` com um `npx`
  falso no PATH (`tests/agent.test.ts`)
- [x] `doctor`: perfil, API key, config antigo, perfil inexistente, entradas
  inválidas em `.mcp.json`/`.codex/config.toml` e `--online`
- [x] `upgrade` pelo npm com um `npm` falso, recusa do código-fonte e alvo
  inválido (`tests/upgrade.test.ts`)

## Notes

- 2026-11-13: criada como draft na entrevista do CLISPEC; options detalhadas na `termfy-spec`.
- 2026-11-13: entregues `agent` e `doctor`. O command `upgrade` fica com a
  spec 0012, por isso a tarefa segue aberta e o status continua `draft`.
- 2026-11-13: mudanças em relação ao 0.9.0. O 0.9.0 chamava
  `agent install`; o nome foi mantido e ganhou o alias `init`, usado no
  CLISPEC. As skills saem do `SKILL.md` embutido (antes, assets do
  `node:sea`); `agent skill list` traz a descrição e `agent skill show` com
  `--json` devolve `{ name, content }`. Skill desconhecida sai com 2 em
  `show` (lista fechada) e 6 em `install` (antes, 1). O doctor deixou de
  conferir `~/clickupfy/config.json` como configuração principal: agora
  confere `accounts.json`, perfil e API key no cofre, e o config antigo vira
  aviso (`legacy-config`). A checagem de `.mcp.json`/`.codex/config.toml`
  aceita qualquer servidor cujo command seja `clickupfy` (o `mcp setup` grava
  nomes livres), exige `mcp` e `--list` e confere se o perfil existe; o
  0.9.0 só olhava a entrada `promovaweb-clickupfy`. As checagens de skills
  (que rodam `npx skills list` e podem baixar o gerenciador) passaram para
  `--online`, para o doctor padrão não chamar a rede.
- 2026-11-13: `upgrade` entregue junto com o wrapper npm da spec 0012;
  spec fechada.
