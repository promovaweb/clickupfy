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
```

## Commands

| Command | Função |
| --- | --- |
| `clickupfy` | abre a TUI (abas Overview e About) |
| `clickupfy tui [--tab overview\|about]` | abre a TUI em uma aba |
| `clickupfy about` | version, executable, runtime, platform e credits |
| `clickupfy config list\|get\|set\|unset\|path\|schema` | preferências em `settings.json` |
| `clickupfy credentials set\|get\|list\|remove\|status\|clear` | segredos cifrados em `credentials.json` |
| `clickupfy mcp [--list]` | servidor MCP via stdio |
| `clickupfy skill [topic]` | documentação embutida |

Options globais: `--help`, `--version`, `--json`, `--skill [topic]`,
`--opencli`, `--no-color`. Referência completa em [docs/cli.md](docs/cli.md).

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
clickupfy config set tui.theme day
clickupfy credentials set openai.api_key        # digita sem eco
printf '%s' "$TOKEN" | clickupfy credentials set github.token --stdin
clickupfy credentials status
```

Os arquivos ficam em `~/.clickupfy/` com permissão 0600. As credenciais são
cifradas com AES-256-GCM; a master key vem de `CLICKUPFY_MASTER_KEY` ou de
`~/.clickupfy/master.key`. Veja [docs/configuration.md](docs/configuration.md).

## MCP

```json
{ "mcpServers": { "clickupfy": { "command": "clickupfy", "args": ["mcp"] } } }
```

Tools: `about`, `exit_codes`, `skill`, `config_list`, `config_get`,
`credentials_status`. Resources: `clickupfy://about`, `clickupfy://exit-codes`,
`clickupfy://skill`, `clickupfy://skill/{topic}`. Prompt: `operate`.
Detalhes em [docs/mcp.md](docs/mcp.md).

## Estrutura

```text
src/        código do binário (app, cli, config, mcp, tui, skill)
docs/       documentação embutida e opencli.json
template/   stubs de command, screen e tool
.agents/    skills do framework instaladas via npx skills (skills-lock.json)
scripts/    build, init e checks
tests/      bun test
```

Arquitetura em [docs/architecture.md](docs/architecture.md).

## Validar, compilar e publicar

```bash
bun run validate      # typecheck, testes, skills:check, opencli:check, docs:check, build
bun run build         # dist/clickupfy
bun run build:all     # linux-x64, linux-arm64, darwin-x64, darwin-arm64, windows-x64
```

Releases seguem [docs/release.md](docs/release.md): versão em
`package.json`, entrada no `CHANGELOG.md`, tag `vX.Y.Z` e GitHub Release com
binários gerados pelo workflow. O guia do método em PDF e EPUB fica no
framework, não aqui.

## Licença

Repositório privado da Promovaweb. Uso interno e dos alunos autorizados.
