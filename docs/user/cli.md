# Consulte a referência do CLI

## Classificação

| Campo      | Valor                                                           |
| ---------- | --------------------------------------------------------------- |
| Natureza   | referência                                                      |
| Escopo     | grupos públicos, opções globais, formatos de saída e exit codes |
| Autoridade | registry de commands em src/cli/commands.ts                     |

## Sintaxe global

```text
clickupfy [options] <command> [subcommand] [arguments]
```

Sem argumentos, em um terminal interativo, o binário abre a TUI. Sem TTY,
imprime o help e sai com exit code 2.

O comando de manutenção da instalação usa esta forma:

```text
clickupfy upgrade [alvo]
```

As opções globais valem em qualquer posição, antes ou depois do comando:

| Opção                | Efeito                                                     |
| -------------------- | ---------------------------------------------------------- |
| `-V`, `--version`    | Mostra a versão.                                           |
| `-h`, `--help`       | Mostra o help do comando atual.                            |
| `--account <perfil>` | Usa outro perfil somente nessa execução.                   |
| `--json`             | Imprime a resposta no envelope `{ ok, command, data }`.    |
| `--skill [tópico]`   | Imprime a documentação embutida, inteira ou por tópico.    |
| `--opencli`          | Imprime a descrição OpenCLI da árvore de commands em JSON. |
| `--no-color`         | Desliga cores ANSI. `NO_COLOR=1` tem o mesmo efeito.       |

Os tópicos de `--skill` são `cli`, `tui`, `mcp`, `config`, `exit-codes` e
`reference`.

No exemplo abaixo, a resposta de `task get` usa o perfil `cliente-a` e sai em
JSON:

```bash
clickupfy --account cliente-a --json task get 86abc123
```

## Saída em texto e em JSON

Texto é o padrão quando `output.format` em settings.json é `text`. Com
`--json`, a resposta segue este envelope:

```json
{
  "ok": true,
  "command": "clickupfy task get",
  "data": { "task": {}, "execution": {} }
}
```

Em erro:

```json
{
  "ok": false,
  "command": "clickupfy task get",
  "error": {
    "code": 6,
    "name": "NOT_FOUND",
    "message": "Task \"x\" not found.",
    "details": {}
  }
}
```

Listas vêm dentro de um objeto, como `data.tasks`, `data.spaces` ou
`data.comments`. O exit code do processo é igual ao de `error.code` em toda falha.

## Configuração e identidade

```bash
clickupfy setup [options]
clickupfy status
clickupfy whoami
clickupfy account list
clickupfy account show [perfil]
clickupfy account use <perfil>
clickupfy account remove <perfil>
clickupfy account import [--force]
clickupfy workspace list
clickupfy workspace use <workspace-id>
clickupfy doctor [--online]
clickupfy config list
clickupfy config get <key>
clickupfy config set <key> <value>
clickupfy config unset <key>
clickupfy config path
clickupfy config schema
clickupfy credentials status
```

O setup recebe a credencial, identifica o perfil local e associa o workspace.
`install` é o alias de `setup`. Estes parâmetros permitem executar o mesmo
processo com ou sem prompts:

| Opção               | Efeito                                                              |
| ------------------- | ------------------------------------------------------------------- |
| `--api-key <chave>` | Informa a API key pessoal do ClickUp.                               |
| `--token <chave>`   | Mantém compatibilidade como alias de `--api-key`.                   |
| `--name <nome>`     | Define o nome local do perfil, normalizado em kebab-case.           |
| `--workspace <id>`  | Associa o perfil ao workspace indicado.                             |
| `--non-interactive` | Executa sem abrir prompts e exige os valores necessários por opção. |

`account remove <perfil>` aceita `--yes` para confirmar a remoção sem prompt.
Já `account import` aceita `--force` para substituir perfis já existentes. As
outras ações desse grupo não possuem opções próprias.

`clickupfy doctor` verifica localmente três grupos de itens:

- o runtime, o terminal e as permissões da pasta;
- o `settings.json`, a origem da master key, o cofre, o
  `~/.clickupfy/accounts.json`, o perfil resolvido e a presença da API key;
- o config antigo do ClickUpfy 0.9.0 e os arquivos `.mcp.json` e
  `.codex/config.toml` do projeto, quando existirem.

Use `--json` para automação. O comando não faz chamada ao ClickUp e não cria
arquivos.

`clickupfy doctor --online` também valida a API key em `GET /user` e lê as
skills instaladas com `npx skills list --json`. Essas verificações podem chamar
a rede e baixar o gerenciador de skills.

## Hierarquia

```bash
clickupfy space list [--archived]
clickupfy folder list --space <id> [--archived]
clickupfy list list --folder <id> [--archived]
clickupfy list list --space <id> [--archived]
clickupfy list get <list-id>
```

`space list`, `folder list` e `list list` aceitam `--archived`. O comando
`folder list` exige `--space <id>`. Em `list list`, informe `--folder <id>` ou
`--space <id>`, pois os dois destinos são mutuamente exclusivos e a resposta
precisa pertencer a um único nível da hierarquia.

## Tarefas

```bash
clickupfy task list --list <list-id>
clickupfy task search --query <texto>
clickupfy task get <task-id>
clickupfy task get <task-id> --markdown
clickupfy task get <task-id> --raw
clickupfy task create [options]
clickupfy task update <task-id> [options]
clickupfy task delete <task-id> [--yes]
clickupfy task add-tag <task-id> <tag-name>
clickupfy task remove-tag <task-id> <tag-name>
```

### Filtros de leitura

| Comando       | Opção                  | Efeito                                                 |
| ------------- | ---------------------- | ------------------------------------------------------ |
| `task list`   | `--list <id>`          | Define a List consultada e é obrigatório.              |
| `task list`   | `--status <valores>`   | Restringe a resposta aos status informados.            |
| `task list`   | `--assignee <valores>` | Restringe a resposta aos responsáveis informados.      |
| `task list`   | `--include-closed`     | Inclui tarefas concluídas.                             |
| `task list`   | `--page <n>`           | Consulta uma página, começando em zero.                |
| `task search` | `--query <texto>`      | Procura no nome, na descrição ou no ID.                |
| `task search` | `--status <valores>`   | Restringe a busca aos status informados.               |
| `task search` | `--assignee <valores>` | Restringe a busca aos responsáveis informados.         |
| `task search` | `--include-closed`     | Inclui tarefas concluídas.                             |
| `task search` | `--max-pages <n>`      | Limita a paginação consultada entre um e 100.          |
| `task get`    | `--raw`                | Retorna a resposta original do ClickUp.                |
| `task get`    | `--markdown`           | Concatena tarefa, subtarefas e checklists em Markdown. |

`--status` e `--assignee` aceitam vários valores separados por vírgula, como
em `--status "to do,review"` e `--assignee 7,8`.

`--raw` e `--markdown` não podem ser usados juntos nem com `--json`. Quando
encontra essa combinação, o CLI encerra a execução com uma mensagem de uso.

### Campos de criação

| Opção                           | Efeito                                                   |
| ------------------------------- | -------------------------------------------------------- |
| `--list <id>`                   | Define a List de destino e é obrigatório.                |
| `--name <nome>`                 | Define o nome e é obrigatório.                           |
| `--description <texto>`         | Envia uma descrição em texto.                            |
| `--markdown-content <markdown>` | Envia uma descrição preservada como Markdown.            |
| `--status <status>`             | Define o status inicial.                                 |
| `--priority <n>`                | Define prioridade de `1` a `4`.                          |
| `--assignee <ids>`              | Informa IDs dos responsáveis, separados por vírgula.     |
| `--parent <task-id>`            | Cria uma subtarefa ligada ao item informado.             |
| `--start-date <AAAA-MM-DD>`     | Define a data de início.                                 |
| `--due-date <AAAA-MM-DD>`       | Define a data de entrega.                                |
| `--points <n>`                  | Define Sprint Points com número igual ou maior que zero. |

Datas são gravadas no início do dia no fuso local da máquina, para o ClickUp
mostrar só a data. Escolha `--description` para texto ou `--markdown-content`
para Markdown. Evite enviar os dois campos na mesma criação para não deixar a
representação da descrição ambígua.

### Campos de atualização

| Opção                           | Efeito                              |
| ------------------------------- | ----------------------------------- |
| `--name <nome>`                 | Altera o nome.                      |
| `--description <texto>`         | Substitui a descrição por texto.    |
| `--markdown-content <markdown>` | Substitui a descrição por Markdown. |
| `--status <status>`             | Altera o status.                    |
| `--priority <n>`                | Altera a prioridade de `1` a `4`.   |
| `--start-date <AAAA-MM-DD>`     | Altera a data de início.            |
| `--clear-start-date`            | Remove a data de início.            |
| `--due-date <AAAA-MM-DD>`       | Altera a data de entrega.           |
| `--clear-due-date`              | Remove a data de entrega.           |
| `--points <n>`                  | Altera os Sprint Points.            |

O comando exige pelo menos um campo. Quando uma data e sua opção `--clear-*`
aparecem na mesma execução, a remoção prevalece. `task delete` usa `--yes` para
confirmar a exclusão sem prompt.

### Tags

```bash
clickupfy tag list --space <space-id>
clickupfy tag create <name> --space <space-id> --foreground "#ffffff" --background "#336699"
clickupfy tag update <tag-name> --space <space-id> --name <novo-nome>
clickupfy tag delete <tag-name> --space <space-id> --yes
```

`--foreground` e `--background` aceitam cores `#RRGGBB`. `task add-tag` e
`task remove-tag` aceitam `--custom-task-id` para trabalhar com o id
personalizado do workspace.

Depois de escolher os campos, consulte a ajuda da versão instalada para
comparar a referência com o contrato executável:

```bash
clickupfy task create --help
clickupfy task update --help
```

## Checklists e comentários

```bash
clickupfy checklist create <task-id> --name <nome>
clickupfy checklist item-create <checklist-id> --name <nome>
clickupfy checklist set \
  <task-id> <checklist-id> <item-id> \
  --resolved
clickupfy checklist set \
  <task-id> <checklist-id> <item-id> \
  --open
clickupfy comment list --task <task-id>
clickupfy comment create --task <task-id> --text <texto>
```

`checklist item-create` aceita `--assignee <id>` para associar o item a um
responsável. Em `checklist set`, escolha exatamente `--resolved` ou `--open`
para que a releitura confirme o estado pretendido. `comment create` aceita
`--notify-all` quando a atualização precisa notificar os participantes da
tarefa.

## Sprints

```bash
clickupfy sprint list --folder <folder-id>
clickupfy sprint current --folder <folder-id>
clickupfy sprint get <sprint-id>
clickupfy sprint tasks <sprint-id> [--open-only]
clickupfy sprint add-task <sprint-id> <task-id>
clickupfy sprint remove-task <sprint-id> <task-id>
clickupfy sprint set-points <task-id> <points>
```

Os comandos de Sprint aceitam opções de calendário, inclusão e estado para
separar uma List comum do ciclo que será analisado:

| Comando          | Opção               | Efeito                                       |
| ---------------- | ------------------- | -------------------------------------------- |
| `sprint list`    | `--archived`        | Inclui Lists arquivadas.                     |
| `sprint list`    | `--include-regular` | Inclui Lists sem período do Sprint Folder.   |
| `sprint list`    | `--at <AAAA-MM-DD>` | Calcula o estado do ciclo na data informada. |
| `sprint current` | `--at <AAAA-MM-DD>` | Procura a Sprint ativa na data informada.    |
| `sprint get`     | `--at <AAAA-MM-DD>` | Calcula o relatório na data informada.       |
| `sprint tasks`   | `--open-only`       | Omite tarefas concluídas.                    |

`sprint list` e `sprint current` exigem `--folder <id>` para limitar a busca ao
Sprint Folder selecionado.

## Time tracking

```bash
clickupfy time current
clickupfy time start --task <task-id> [--description <texto>]
clickupfy time stop
```

`time start` com outro cronômetro ativo em outra tarefa troca o cronômetro,
avisa no stderr e devolve a tarefa anterior em `previous`.

## Docs

```bash
clickupfy doc list [--query <texto>] [options]
clickupfy doc get <doc-id>
clickupfy doc create --name <nome> [options]
clickupfy doc page tree <doc-id>
clickupfy doc page list <doc-id> [options]
clickupfy doc page get <doc-id> <page-id> [--content-format <valor>]
clickupfy doc page create <doc-id> --name <nome> [options]
clickupfy doc page update <doc-id> <page-id> [options]
```

Docs usam a API v3 do ClickUp e operam no workspace do perfil ativo,
fora da hierarquia de Space, Folder ou List.

| Comando                          | Opção                        | Efeito                                                                       |
| -------------------------------- | ---------------------------- | ---------------------------------------------------------------------------- |
| `doc list`                       | `--query <texto>`            | Filtra pelo nome ou ID localmente.                                           |
| `doc list`                       | `--parent-id <id>`           | Restringe aos Docs criados sob este local.                                   |
| `doc list`                       | `--parent-type <n>`          | Tipo do local: `4` Space, `5` Folder, `6` List, `7` Everything, `12` tarefa. |
| `doc list`                       | `--deleted`                  | Inclui Docs excluídos.                                                       |
| `doc list`                       | `--archived`                 | Inclui Docs arquivados.                                                      |
| `doc list`                       | `--creator <id>`             | Restringe ao ID numérico do criador.                                         |
| `doc list`                       | `--max-pages <n>`            | Limita a paginação por cursor, entre uma e 50 páginas.                       |
| `doc create`                     | `--parent-id <id>`           | Local onde o Doc é criado; exige `--parent-type`.                            |
| `doc create`                     | `--parent-type <n>`          | Tipo do local; exige `--parent-id`.                                          |
| `doc create`                     | `--visibility <valor>`       | `PRIVATE` ou `PUBLIC`.                                                       |
| `doc create`                     | `--create-page`              | Cria também a primeira página em branco.                                     |
| `doc page list`                  | `--max-page-depth <n>`       | Limita a profundidade de sub-páginas retornadas.                             |
| `doc page list` / `doc page get` | `--content-format <valor>`   | `text/md` (padrão) ou `text/plain`.                                          |
| `doc page create`                | `--content <texto>`          | Conteúdo inicial da página.                                                  |
| `doc page create`                | `--file <caminho>`           | Lê o conteúdo de um arquivo; `--file -` lê do stdin.                         |
| `doc page create`                | `--sub-title <texto>`        | Subtítulo da página.                                                         |
| `doc page create`                | `--parent-page <id>`         | Cria como sub-página deste ID.                                               |
| `doc page create`                | `--orderindex <n>`           | Posição entre as páginas irmãs.                                              |
| `doc page update`                | `--content-edit-mode <modo>` | `replace` (padrão), `append` ou `prepend`.                                   |

`doc page tree` mostra a hierarquia de páginas sem conteúdo, o caminho mais
rápido para localizar um `page-id`. `doc page update` exige pelo menos um
campo entre `--name`, `--sub-title`, `--content` e `--file`. `--content` e
`--file` juntos saem com exit code 2.

A API pública do ClickUp não oferece endpoints para excluir Docs ou páginas,
reordenar páginas na árvore, nem gerenciar permissões de compartilhamento.

## API genérica

```bash
clickupfy api list
clickupfy api describe <operation>
clickupfy api call <operation> [options]
```

O catálogo cobre as 173 operações das especificações públicas v2 e v3. O
argumento `<operation>` aceita o `operationId` (`GetTask`), o nome de CLI
(`v2-get-task`) ou o nome da tool (`clickupfy_api_v2_get_task`).

```bash
clickupfy api list --group Tasks
clickupfy api describe GetTask
clickupfy api call GetTask --path '{"task_id":"abc123"}'
clickupfy api call v2-create-task-attachment --path '{"task_id":"abc123"}' --file attachment[0]=./relatorio.pdf
```

`api call` aceita `--path`, `--query`, `--body`, `--body-file`, `--input`,
`--content-type`, `--file`, `--yes` e `--dry-run`. Operações `DELETE` exigem
confirmação no terminal; fora dele, sem `--yes`, saem com exit code 2.

## Agentes e MCP

```bash
clickupfy agent skill list
clickupfy agent skill show <nome>
clickupfy agent skill install [skills...] [--global] [--force]
clickupfy agent install [options]
clickupfy mcp setup [options]
clickupfy mcp [--list] [--list-id <id>] [options]
clickupfy mcp serve --list <id> [options]
```

`agent skill install` aceita uma lista opcional de skills e chama
`npx skills add promovaweb/clickupfy --copy --agent codex --skill <nome>...`.
Sem `--global`, o gerenciador usa `.agents/skills/` e cria ou atualiza
`skills-lock.json` no projeto. Com `--global`, usa o catálogo global do
usuário. Para consultar o estado real, use `npx skills list` ou
`npx skills list --global`; `clickupfy agent skill list` exibe somente o
catálogo embutido no binário.

O comando não oferece `--target`: o gerenciador de skills controla os caminhos
canônicos. `--force` permanece aceito por compatibilidade.

`agent install` exige `--space <id>` e `--list <id>`. Ele também aceita
`--global`, `--workspace <id>`, `--folder <id>`, `--sprint-folder <id>` e
`--force`. O comando atualiza o servidor `promovaweb-clickupfy` no `.mcp.json`
e no `.codex/config.toml`, preservando as outras entradas de cada arquivo.
`agent init` é o alias.

`mcp setup` grava uma entrada fixada nos quatro formatos de cliente e aceita
`--name`, `--space`, `--list`, `--clients`, `--project`, `--read-only`,
`--force` e `--non-interactive`.

`mcp serve` exige `--list <id>`, enquanto `mcp` aceita `--list-id <id>`. Os
dois aceitam `--account <perfil>`, `--workspace <id>`, `--space <id>`,
`--folder <id>`, `--sprint-folder <id>` e `--read-only`.

## Manutenção e outros modos

```bash
clickupfy
clickupfy tui --tab about
clickupfy about
clickupfy upgrade
clickupfy skill cli
clickupfy completion bash
```

`clickupfy` sem argumentos abre a TUI na aba Overview, com o perfil, o
workspace e o cronômetro em execução. A tecla `r` atualiza a tela.

`clickupfy --skill` imprime a documentação embutida. Já `clickupfy completion`
gera o script de autocompletar para `bash`, `zsh` ou `fish`.

## Exit codes

| Code  | Name             | Quando                                                          |
| ----- | ---------------- | --------------------------------------------------------------- |
| `0`   | `SUCCESS`        | operação concluída                                              |
| `1`   | `GENERIC_ERROR`  | falha inesperada sem classificação                              |
| `2`   | `USAGE`          | arguments, options ou subcommand inválidos                      |
| `3`   | `CONFIG`         | settings.json ausente, inválido ou key desconhecida             |
| `4`   | `CREDENTIALS`    | cofre ilegível, master key ausente ou credencial não encontrada |
| `5`   | `NETWORK_OR_API` | falha de rede ou resposta de API fora do esperado               |
| `6`   | `NOT_FOUND`      | recurso solicitado não existe                                   |
| `7`   | `PERMISSION`     | permissão negada no sistema de arquivos                         |
| `8`   | `NO_TTY`         | a TUI exige um terminal interativo                              |
| `9`   | `MCP`            | o servidor MCP falhou ao iniciar ou perdeu o transporte         |
| `130` | `INTERRUPTED`    | entrada cancelada ou processo interrompido com Ctrl+C           |

## Escolha o formato de saída

A tabela compacta é adequada para leitura humana. Use `--json` quando um
script precisar de campos completos ou quando a tabela não mostrar um detalhe
da API. Listas vêm dentro de um objeto, como `data.tasks`.

Use `task get --markdown` para ler a tarefa como texto. Use `--raw` apenas quando
precisar comparar a resposta original do ClickUp com a projeção do ClickUpfy.

## Ajuda é a referência da versão instalada

Esta documentação explica o contrato estável. Para flags exatas da versão
presente na máquina:

```bash
clickupfy --help
clickupfy <grupo> --help
clickupfy <grupo> <ação> --help
```

Quando a ajuda estiver correta, mas a execução falhar, continue no guia de
[solução de problemas](solucao-de-problemas.md) para conferir instalação,
credencial, escopo e resposta da API.
