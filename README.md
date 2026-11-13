# ClickUpfy

Esqueleto de binário em [Bun](https://bun.sh) para construir ferramentas de
terminal com três modos no mesmo executável. É o template do GitHub do
framework [Termfy](https://github.com/promovaweb/termfy), e já vem com as
skills do framework instaladas em `.agents/skills/`.

| Modo | Entrada | Para quem |
| --- | --- | --- |
| TUI | `clickupfy` sem argumentos, em terminal interativo | pessoas |
| CLI | `clickupfy <command> [options]`, saída em texto ou `--json` | pessoas, scripts e agentes |
| MCP | `clickupfy mcp`, servidor Model Context Protocol via stdio | agentes de IA |

Os três modos compartilham identidade, configuração (`~/.clickupfy/settings.json`),
cofre de credenciais cifrado (`~/.clickupfy/credentials.json`) e a tabela de
exit codes. A TUI usa o [OpenTUI](https://opentui.com); o CLI publica sua
interface no formato [OpenCLI](https://opencli.org); o MCP usa o
[SDK oficial](https://github.com/modelcontextprotocol/typescript-sdk).

Todo o código é em inglês: arquivos, identificadores, comentários, mensagens,
commands, options, keys e campos do `--json`. A documentação é em português.

```text
 ▌ ClickUpfy v0.9.2  │  CLI, TUI and MCP stdio server skeleton in Bun, with the  linux-x64 • Bun 1.4.4
 ──────────────────────────────────────────────────────────────────────────────────────────────────
 Overview      About
▬▬▬▬▬▬▬▬▬▬▬▬▬▬
 ╭─ Environment ────────────────────────────────────╮╭─ State ────────────────────────────────────╮
 │ Binary    clickupfy v0.9.2                          ││ settings.json     • defaults               │
 │ Runtime   Bun 1.4.4                              ││ credentials.json  • empty                  │
 │ Platform  linux-x64                              ││ master key        not created              │
 │ Terminal  100×24  xterm-256color                 ││ MCP               clickupfy mcp               │
 │ Data      ~/.clickupfy                              ││                                            │
 ╰──────────────────────────────────────────────────╯╰────────────────────────────────────────────╯
 ╭─ Settings in effect ─────────────────────────────╮╭─ Next steps ───────────────────────────────╮
 │ output.colors      true                          ││ In the terminal                            │
 │ output.format      "text"                        ││ → clickupfy --help                            │
 │ telemetry.enabled  false                         ││ → clickupfy credentials set <name>            │
 │ tui.initialTab     "overview"                    ││ → clickupfy config set tui.theme day          │
 │ tui.theme          "night"                       ││ → clickupfy --skill                           │
 │                                                  ││                                            │
 │                                                  ││ For agents                                 │
 │                                                  ││ MCP client: { "command": "clickupfy", "args": │
 │                                                  ││ ["mcp"] }                                  │
 │                                                  ││                                            │
 ╰──────────────────────────────────────────────────╯╰────────────────────────────────────────────╯
  ←/→  tab   1-9  go   ?  help   q  quit
```

## Sobre o template

Este repositório é um template do GitHub. Clique em **Use this template**,
abra o clone no agente e peça: "Use termfy-init para fazer o setup deste
projeto". Informe o nome do executável e o propósito da ferramenta. O agente
conduz a configuração e as verificações pela skill.

O guia completo está em [docs/customize-template.md](docs/customize-template.md).
Para atualizar ou reparar as skills, use `termfy-init` no modo de
manutenção. O guia do método e o ebook ficam no
[framework](https://github.com/promovaweb/termfy).

## Requisitos

Bun 1.4.4 ou superior. Node.js não é usado.

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
