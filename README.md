# ClickUpfy

CLI, TUI e servidor MCP da Promovaweb para trabalhar no ClickUp sem abrir o
navegador: tarefas, subtarefas, tags, checklists, comentários, Sprints, Docs
e time tracking, para pessoas no terminal, scripts com `--json` e agentes de
IA pelo MCP. É um binário único em [Bun](https://bun.sh), feito com o
framework [Termfy](https://github.com/promovaweb/termfy).

| Modo | Entrada | Para quem |
| --- | --- | --- |
| TUI | `clickupfy` sem argumentos, em terminal interativo | perfil, workspace e cronômetro de relance |
| CLI | `clickupfy <command> [options]`, saída em texto ou `--json` | pessoas e scripts |
| MCP | `clickupfy mcp` ou `clickupfy mcp serve --list <id>`, via stdio | agentes de IA (Claude Code, Codex, OpenCode, Gemini) |

As API keys ficam cifradas em `~/.clickupfy/credentials.json`, uma por
perfil, e os perfis em `~/.clickupfy/accounts.json`. Nenhum command, tool ou
tela mostra uma chave.

## Instalação

```bash
npm install -g @promovaweb/clickupfy   # baixa o binário da plataforma na primeira execução
clickupfy setup                         # API key pessoal do ClickUp e workspace
clickupfy whoami
```

Sem npm, baixe o binário da plataforma (`clickupfy-linux-x64`,
`clickupfy-darwin-arm64`, `clickupfy-windows-x64.exe`...) na
[GitHub Release](https://github.com/promovaweb/clickupfy/releases), confira
o `SHA256SUMS` e coloque o arquivo no `PATH`. `clickupfy upgrade` atualiza
as duas instalações.

## Vindo do ClickUpfy 0.9.0

A versão 1.0 refaz o CLI sobre o Termfy com os mesmos commands e as mesmas
tools `clickupfy_*`. Na primeira execução, os perfis de
`~/clickupfy/config.json` são importados para o cofre cifrado; o arquivo
antigo não é alterado. `clickupfy account import --force` repete a
importação. As configs MCP com `clickupfy mcp serve --account ... --list ...`
continuam valendo. Duas mudanças pedem atenção:

- o `--json` agora usa o envelope `{ ok, command, data }` (ou
  `{ ok: false, command, error }`), com exit codes estáveis; scripts que
  liam o objeto cru passam a ler `.data`;
- as mensagens, options e campos do `--json` estão em inglês.

## Requisitos

Para usar: nenhum (binário compilado) ou Node.js 18.17+ pelo pacote npm.
Para desenvolver: Bun 1.4.4 ou superior.

## Rodar em desenvolvimento

```bash
bun install
bun run dev                 # TUI
bun run dev -- --help       # help do CLI
bun run dev -- about --json
bun run dev -- mcp --list
bun run api:generate        # regenera src/api/catalog.json a partir de api/
```

## Commands

| Grupo | Commands |
| --- | --- |
| Perfis | `setup` (alias `install`), `status`, `whoami`, `account list\|show\|use\|remove\|import`, `workspace list\|use` |
| Hierarquia | `space list`, `folder list`, `list list\|get` |
| Tarefas | `task list\|get\|search\|create\|update\|delete\|add-tag\|remove-tag`, `tag list\|create\|update\|delete` |
| Execução | `checklist create\|item-create\|set`, `comment list\|create`, `time current\|start\|stop` |
| Sprints | `sprint list\|current\|get\|tasks\|add-task\|remove-task\|set-points` |
| Docs | `doc list\|get\|create`, `doc page list\|get\|tree\|create\|update` |
| API | `api list\|describe\|call` (173 operações v2 e v3) |
| Agentes | `mcp`, `mcp serve`, `mcp setup`, `agent skill list\|show\|install`, `agent install` |
| Manutenção | `doctor [--online]`, `upgrade [target]`, `config`, `credentials`, `about`, `tui`, `skill`, `completion` |

Options globais: `--help`, `--version`, `--json`, `--account <profile>`,
`--skill [topic]`, `--opencli`, `--no-color`. Referência completa em
[docs/cli.md](docs/cli.md); o manual do usuário fica em
[docs/user/](docs/user/README.md) e gera o ebook em [ebook/](ebook/).

## Documentação embutida

```bash
clickupfy --skill            # tudo, em Markdown
clickupfy --skill mcp        # uma seção: cli, tui, mcp, config, exit-codes
clickupfy --opencli          # descrição OpenCLI em JSON
```

A pasta [docs/](docs/README.md) entra no binário em tempo de build. Um agente
lê a documentação sem acesso ao repositório.

## Exit codes

| Code | Name |
| --- | --- |
| 0 | `SUCCESS` |
| 1 | `GENERIC_ERROR` |
| 2 | `USAGE` |
| 3 | `CONFIG` |
| 4 | `CREDENTIALS` |
| 5 | `NETWORK_OR_API` |
| 6 | `NOT_FOUND` |
| 7 | `PERMISSION` |
| 8 | `NO_TTY` |
| 9 | `MCP` |
| 130 | `INTERRUPTED` |

Detalhes em [docs/exit-codes.md](docs/exit-codes.md).

## Configuração e credenciais

```bash
clickupfy setup                     # API key sem eco, workspace e perfil ativo
clickupfy account list
clickupfy config set tui.theme day
clickupfy credentials status
```

Os arquivos ficam em `~/.clickupfy/` com permissão 0600: `accounts.json`
(perfis, sem segredos), `credentials.json` (API keys cifradas com
AES-256-GCM, uma por perfil) e `settings.json`. A master key vem de
`CLICKUPFY_MASTER_KEY` ou de `~/.clickupfy/master.key`. Veja
[docs/configuration.md](docs/configuration.md).

## MCP

```json
{
  "mcpServers": {
    "clickup-projeto": {
      "command": "clickupfy",
      "args": ["mcp", "serve", "--account", "work", "--space", "90070363783", "--list", "901328052926"]
    }
  }
}
```

`clickupfy mcp setup` grava essa entrada no `.mcp.json`, no
`.codex/config.toml`, no `.gemini/settings.json` e no `opencode.json`. O
servidor fixa perfil, space, folder, list e Sprint folder, e `--read-only`
esconde as tools de escrita. São mais de 50 tools `clickupfy_*` (perfis,
hierarquia, tarefas, tags, checklists, comentários, Sprints, Docs e tempo),
mais uma tool por operação do catálogo da API. Detalhes em
[docs/mcp.md](docs/mcp.md).

## Estrutura

```text
src/        código do binário (app, cli, clickup, operations, api, agent, config, mcp, tui, skill)
docs/       documentação embutida, opencli.json e o manual do usuário (docs/user)
api/        especificações OpenAPI v2 e v3 que geram src/api/catalog.json
npm/        pacote npm @promovaweb/clickupfy (launcher que baixa o binário)
specs/      CLISPEC.md e as specs de cada evolução
ebook/      guia do usuário em PDF e EPUB, gerado de docs/user
template/   stubs de command, screen e tool
.agents/    skills do framework Termfy (skills-lock.json)
.codex/     skills do ClickUpfy, embutidas no binário
scripts/    build, geração do catálogo e checks
tests/      bun test
```

Cada operação do ClickUp é declarada uma vez em `src/clickup/<família>.ts` e
vira command do CLI e tool MCP pela camada `src/operations/`. Arquitetura
em [docs/architecture.md](docs/architecture.md); visão do produto em
[CLISPEC.md](CLISPEC.md).

## Validar, compilar e publicar

```bash
bun run validate      # typecheck, testes, skills:check, opencli:check, docs:check, build
bun run build         # dist/clickupfy
bun run build:all     # linux-x64, linux-arm64, darwin-x64, darwin-arm64, windows-x64
```

Releases seguem [docs/release.md](docs/release.md): versão em
`package.json`, entrada no `CHANGELOG.md`, tag `vX.Y.Z` e GitHub Release com
binários gerados pelo workflow, que também publica o pacote npm. O guia do
usuário em PDF e EPUB sai de `bash .ebook/build-ebook.sh`.

## Licença

Código da Promovaweb publicado sem licença de uso aberta (`UNLICENSED`, como no
0.9.0).
