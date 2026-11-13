# ClickUpfy

[![npm](https://img.shields.io/npm/v/@promovaweb/clickupfy)](https://www.npmjs.com/package/@promovaweb/clickupfy)
[![GitHub Release](https://img.shields.io/github/v/release/promovaweb/clickupfy)](https://github.com/promovaweb/clickupfy/releases/latest)

Trabalhe no ClickUp pelo terminal e pelos seus agentes de IA. O ClickUpfy é
um binário único que lista, cria e atualiza tarefas, subtarefas, tags,
checklists, comentários, Sprints, Docs e registros de tempo, com três formas
de uso:

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

## Uso no terminal

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

O histórico completo está no [CHANGELOG](CHANGELOG.md).

## Documentação

- Manual completo em [promovaweb.com/docs/clickupfy](https://promovaweb.com/docs/clickupfy/),
  também em [PDF](https://promovaweb.com/pdf/ebook-clickupfy.pdf) e
  [EPUB](https://promovaweb.com/pdf/ebook-clickupfy.epub).
- No terminal: `clickupfy --help`, `clickupfy <command> --help` e
  `clickupfy --skill`, que imprime a referência inteira para agentes.

## Contribuir

Instruções para desenvolver, testar e publicar estão no
[CONTRIBUTING.md](CONTRIBUTING.md).

## Licença

Código da Promovaweb publicado sem licença de uso aberta (`UNLICENSED`).
