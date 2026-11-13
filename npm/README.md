<p align="center">
  <a href="https://promovaweb.com">
    <picture>
      <source media="(prefers-color-scheme: dark)" srcset="https://promovaweb.com/promovaweb-logo-dark-586.png">
      <img alt="Promovaweb" src="https://promovaweb.com/promovaweb-logo-light-586.png" width="240">
    </picture>
  </a>
</p>

<h1 align="center">ClickUpfy</h1>

<p align="center">
  Trabalhe no ClickUp pelo terminal e pelos seus agentes de IA.
</p>

<p align="center">
  <a href="https://github.com/promovaweb/clickupfy/releases/latest"><img alt="GitHub Release" src="https://img.shields.io/github/v/release/promovaweb/clickupfy"></a>
  <a href="https://www.npmjs.com/package/@promovaweb/clickupfy"><img alt="npm" src="https://img.shields.io/npm/v/@promovaweb/clickupfy"></a>
  <a href="https://github.com/promovaweb/clickupfy/actions/workflows/ci.yml"><img alt="CI" src="https://github.com/promovaweb/clickupfy/actions/workflows/ci.yml/badge.svg"></a>
</p>

<p align="center">
  <a href="https://promovaweb.com/discord"><img alt="Discord: obter ajuda e conversar com a Comunidade" src="https://img.shields.io/badge/Discord-Obter%20ajuda%20e%20conversar%20com%20a%20Comunidade-5865F2?style=for-the-badge&logo=discord&logoColor=white"></a>
</p>

<p align="center">
  <a href="https://promovaweb.com/docs/clickupfy/">Documentação</a> ·
  <a href="https://promovaweb.com/discord">Discord</a> ·
  <a href="https://promovaweb.com/planos?utm_source=github&utm_medium=readme&utm_campaign=clickupfy">Planos da Promovaweb</a> ·
  <a href="https://github.com/promovaweb/clickupfy/blob/main/CHANGELOG.md">Changelog</a>
</p>

## O que é

O ClickUpfy é um binário único que lista, cria e atualiza tarefas,
subtarefas, tags, checklists, comentários, Sprints, Docs e registros de tempo
no ClickUp. Ele atende quem trabalha no terminal e quem delega o trabalho a um
agente de IA, com três formas de uso:

| Modo | Como abrir | Para quê |
| --- | --- | --- |
| **CLI** | `clickupfy <command>` | consultar e alterar o ClickUp no terminal, em texto ou `--json` para scripts |
| **MCP** | `clickupfy mcp serve` | dar ao Claude Code, Codex, OpenCode ou Gemini as tools `clickupfy_*`, presas a um projeto |
| **TUI** | `clickupfy` | ver perfil, workspace e cronômetro em execução de relance |

As API keys ficam cifradas no seu computador e nenhum command, tool ou tela
mostra uma chave.

## Instalação

```bash
npm install -g @promovaweb/clickupfy
```

Na primeira execução, o pacote baixa o binário da sua plataforma da
[GitHub Release](https://github.com/promovaweb/clickupfy/releases/latest),
confere o `SHA256SUMS` e o guarda em cache. O Node.js 18.17 ou superior serve
só para isso; o ClickUpfy em si não usa Node.

Sem npm, baixe o binário da plataforma na release (`clickupfy-linux-x64`,
`clickupfy-linux-arm64`, `clickupfy-darwin-x64`, `clickupfy-darwin-arm64` ou
`clickupfy-windows-x64.exe`), confira o hash no `SHA256SUMS`, renomeie para
`clickupfy` e coloque no `PATH`.

Para atualizar, nos dois casos:

```bash
clickupfy upgrade
```

## Primeiros passos

Crie uma API key pessoal no ClickUp (Settings, Apps, API Token) e configure
o perfil:

```bash
clickupfy setup          # pede a chave sem mostrar e escolhe o workspace
clickupfy whoami         # confirma a chave
clickupfy space list     # explora a hierarquia
clickupfy list list --space 90070363783
```

Com mais de uma conta, cada uma vira um perfil:

```bash
clickupfy setup --name cliente-a
clickupfy account list
clickupfy --account cliente-a task list --list 901328052926
```

## Uso

### Tarefas

```bash
clickupfy task list --list 901328052926 --status "em andamento"
clickupfy task get 86abc123          # tarefa, subtarefas e checklists numa fila
clickupfy task search --query "login"
clickupfy task create --list 901328052926 --name "Revisar onboarding" \
  --markdown-content "## Contexto" --priority 2 --due-date 2026-11-20
clickupfy task update 86abc123 --status revisar
clickupfy task add-tag 86abc123 backend
```

`--start-date` e `--due-date` recebem `AAAA-MM-DD` e gravam o início do dia
no seu fuso. `--status` e `--assignee` aceitam vários valores separados por
vírgula.

### Checklists e comentários

```bash
clickupfy checklist create 86abc123 --name "Etapas"
clickupfy checklist item-create <checklist-id> --name "Escrever testes"
clickupfy checklist set 86abc123 <checklist-id> <item-id> --resolved
clickupfy comment create --task 86abc123 --text "Plano publicado"
```

### Tempo

```bash
clickupfy time start --task 86abc123 --description "Implementação"
clickupfy time current
clickupfy time stop
```

Se outro cronômetro estiver rodando em outra tarefa, o `time start` avisa e
mostra qual foi trocado.

### Sprints e Docs

```bash
clickupfy sprint current --folder <sprint-folder-id>
clickupfy sprint tasks <sprint-id> --open-only
clickupfy doc list
clickupfy doc page update <doc-id> <page-id> --file notas.md
```

### Qualquer endpoint da API

O catálogo cobre as 173 operações das APIs v2 e v3 do ClickUp:

```bash
clickupfy api list --group Tasks
clickupfy api describe v2-get-task
clickupfy api call v2-get-task --path '{"task_id":"86abc123"}'
```

## Uso com agentes (MCP)

Na pasta do projeto, o assistente escolhe perfil, space e list e grava a
configuração do MCP para Claude Code, Codex, Gemini e OpenCode:

```bash
clickupfy mcp setup
```

O resultado é uma entrada como esta no `.mcp.json`:

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

O servidor fica preso a esse perfil e a essa list: as tools usam os ids
fixados como padrão e recusam outro. Com `--read-only`, as tools que alteram
o ClickUp não aparecem. São mais de 50 tools `clickupfy_*` (tarefas, tags,
checklists, comentários, Sprints, Docs, tempo e hierarquia), mais uma tool
por operação do catálogo da API. As skills do ClickUpfy para agentes se
instalam com `clickupfy agent skill install`.

## Saída para scripts

Com `--json`, toda resposta usa o mesmo envelope, inclusive os erros:

```json
{ "ok": true, "command": "clickupfy task create", "data": { "id": "86abc123", "url": "https://app.clickup.com/t/86abc123" } }
```

```json
{ "ok": false, "command": "clickupfy task get", "error": { "code": 6, "name": "NOT_FOUND", "message": "Task not found" } }
```

O exit code do processo é o mesmo de `error.code`:

| Code | Significado |
| --- | --- |
| 0 | sucesso |
| 2 | uso inválido (option, argumento ou confirmação ausente) |
| 3 | configuração inválida |
| 4 | credencial ausente ou recusada |
| 5 | rede ou API do ClickUp |
| 6 | recurso inexistente |
| 7 | permissão no sistema de arquivos |
| 130 | interrompido |

## Arquivos e segurança

Tudo fica em `~/.clickupfy/`, com permissão 0600:

| Arquivo | Conteúdo |
| --- | --- |
| `accounts.json` | perfis (usuário e workspace), sem segredos |
| `credentials.json` | API keys cifradas com AES-256-GCM, uma por perfil |
| `master.key` | chave do cofre; pode vir de `CLICKUPFY_MASTER_KEY` |
| `settings.json` | preferências (`clickupfy config list`) |

`clickupfy doctor` confere perfil, chave, cofre e as configs de MCP do
projeto; `clickupfy doctor --online` também valida a chave na API.

## Vindo do ClickUpfy 0.9.0

A 1.0 mantém os commands e as tools `clickupfy_*`. Na primeira execução, os
perfis de `~/clickupfy/config.json` são importados para o cofre e o arquivo
antigo não é alterado (`clickupfy account import --force` repete a
importação). As configs MCP com `clickupfy mcp serve --account ... --list ...`
continuam funcionando. Mudaram:

- o `--json`, que agora vem no envelope `{ ok, command, data }`: scripts
  leem `.data`;
- mensagens, options e campos do JSON, agora em inglês;
- os valores múltiplos, agora separados por vírgula.

O histórico completo está no [CHANGELOG](https://github.com/promovaweb/clickupfy/blob/main/CHANGELOG.md).

## Documentação

- Manual completo em [promovaweb.com/docs/clickupfy](https://promovaweb.com/docs/clickupfy/),
  também em [PDF](https://promovaweb.com/pdf/ebook-clickupfy.pdf) e
  [EPUB](https://promovaweb.com/pdf/ebook-clickupfy.epub).
- Página do projeto em
  [promovaweb.com/opensource/clickupfy](https://promovaweb.com/opensource/clickupfy/).
- No terminal: `clickupfy --help`, `clickupfy <command> --help` e
  `clickupfy --skill`, que imprime a referência inteira para agentes.

## Feito com

| Projeto | Para quê |
| --- | --- |
| [Bun](https://github.com/oven-sh/bun) | runtime e compilação do binário |
| [Termfy](https://github.com/promovaweb/termfy) | framework de CLI, TUI e MCP da Promovaweb |
| [MCP TypeScript SDK](https://github.com/modelcontextprotocol/typescript-sdk) | servidor MCP via stdio |
| [OpenTUI](https://github.com/anomalyco/opentui) | interface de terminal |
| [ClickUp API](https://clickup.com/api) | APIs v2 e v3 que o binário acessa |

## Comunidade e suporte

- **Discord:** [obter ajuda e conversar com a Comunidade](https://promovaweb.com/discord).
- **Bugs e pedidos:** abra uma [issue](https://github.com/promovaweb/clickupfy/issues)
  com a versão, o sistema operacional e o passo a passo para reproduzir.
- **Novidades:** acompanhe o [CHANGELOG](https://github.com/promovaweb/clickupfy/blob/main/CHANGELOG.md) e as
  [releases](https://github.com/promovaweb/clickupfy/releases).

## Contribuir

Instruções para desenvolver, testar e publicar estão no
[CONTRIBUTING.md](https://github.com/promovaweb/clickupfy/blob/main/CONTRIBUTING.md).

## Promovaweb

O ClickUpfy é mantido pela [Promovaweb](https://promovaweb.com), comunidade de
co-working digital onde profissionais aprendem a construir, automatizar e
gerir negócios de tecnologia e IA com aulas ao vivo, Co-works e revisão de
projetos reais.

Quer usar o ClickUpfy em projetos de verdade, com acompanhamento? Conheça os
[planos da Promovaweb](https://promovaweb.com/planos?utm_source=github&utm_medium=readme&utm_campaign=clickupfy).
