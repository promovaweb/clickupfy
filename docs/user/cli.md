# Consulte a referência do CLI

## Classificação

| Campo | Valor |
| --- | --- |
| Natureza | referência |
| Escopo | grupos públicos, opções globais e formatos de saída |
| Autoridade | definições Commander em src/cli.ts |

## Sintaxe global

```text
clickupfy [options] [command]
```

O comando de manutenção da instalação npm usa esta forma:

```text
clickupfy upgrade [alvo]
```

As opções globais selecionam o account e o formato da resposta antes que o
CLI interprete o grupo e a ação:

| Opção                | Efeito                                    |
| -------------------- | ----------------------------------------- |
| `-V`, `--version`    | Mostra a versão.                          |
| `--account <perfil>` | Usa outro account somente nessa execução. |
| `--json`             | Imprime a resposta completa em JSON.      |
| `-h`, `--help`       | Mostra ajuda.                             |

Coloque as opções globais antes do grupo. No exemplo abaixo, a resposta de
`task get` usa o account `cliente-a` e sai em JSON:

```bash
clickupfy --account cliente-a --json task get 86abc123
```

## Configuração e identidade

```bash
clickupfy setup [options]
clickupfy doctor
clickupfy status
clickupfy whoami
clickupfy account list
clickupfy account show [perfil]
clickupfy account use <perfil>
clickupfy account remove <perfil>
clickupfy workspace list
clickupfy workspace use <workspace-id>
```

Para atualizar uma instalação global feita pelo npm, use `clickupfy upgrade`.
Consulte a [referência de perfis e hierarquia](referencia-cli-perfis-hierarquia.md)
para parâmetros, canais aceitos, confirmação da versão e limites do comando.

O setup recebe a credencial, identifica o account local e associa o workspace.
Estes parâmetros permitem executar o mesmo processo com ou sem prompts:

| Opção               | Efeito                                                              |
| ------------------- | ------------------------------------------------------------------- |
| `--api-key <chave>` | Informa a API key pessoal do ClickUp.                               |
| `--token <chave>`   | Mantém compatibilidade como alias de `--api-key`.                   |
| `--name <nome>`     | Define o nome local do account.                                     |
| `--workspace <id>`  | Associa o account ao workspace indicado.                            |
| `--non-interactive` | Executa sem abrir prompts e exige os valores necessários por opção. |

`account remove <perfil>` aceita `--yes` para confirmar a remoção sem prompt.
As outras ações desse grupo não possuem opções próprias.

`clickupfy doctor` verifica localmente o JSON em `~/clickupfy/config.json`, as
permissões, o schema, os accounts, o gerenciador `skills`, as skills do
ClickUpfy e os arquivos `.mcp.json` e `.codex/config.toml` do projeto quando
existirem. Use `--json` para automação. O comando não faz chamada ao ClickUp.
Use `clickupfy whoami` para validar a API key remotamente.

## Hierarquia

```bash
clickupfy space list [--archived]
clickupfy folder list --space <id> [--archived]
clickupfy list list --folder <id> [--archived]
clickupfy list list --space <id> [--archived]
clickupfy list get <list-id>
```

`space list`, `folder list` e `list list` aceitam `--archived`. O comando
`folder list` exige `--space <id>`. Em `list list`, informe
`--folder <id>` ou `--space <id>`, pois os dois destinos são mutuamente
exclusivos e a resposta precisa pertencer a um único nível da hierarquia.

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
```

### Filtros de leitura

| Comando       | Opção                  | Efeito                                                 |
| ------------- | ---------------------- | ------------------------------------------------------ |
| `task list`   | `--list <id>`          | Define a List consultada e é obrigatório.              |
| `task list`   | `--status <status...>` | Restringe a resposta aos status informados.            |
| `task list`   | `--assignee <ids...>`  | Restringe a resposta aos responsáveis informados.      |
| `task list`   | `--include-closed`     | Inclui tarefas concluídas.                             |
| `task list`   | `--page <n>`           | Consulta uma página, começando em zero.                |
| `task search` | `--query <texto>`      | Procura no nome, na descrição ou no ID.                |
| `task search` | `--status <status...>` | Restringe a busca aos status informados.               |
| `task search` | `--assignee <ids...>`  | Restringe a busca aos responsáveis informados.         |
| `task search` | `--include-closed`     | Inclui tarefas concluídas.                             |
| `task search` | `--max-pages <n>`      | Limita a paginação consultada entre uma e 100 páginas. |
| `task get`    | `--raw`                | Retorna a resposta original do ClickUp.                |
| `task get`    | `--markdown`           | Concatena tarefa, subtarefas e checklists em Markdown. |

`--raw` e `--markdown` não podem ser usados juntos. A opção global `--json`
também é incompatível com esses dois formatos, e o CLI encerra a execução com
uma mensagem de uso quando encontra a combinação.

### Campos de criação

| Opção                           | Efeito                                                   |
| ------------------------------- | -------------------------------------------------------- |
| `--list <id>`                   | Define a List de destino e é obrigatório.                |
| `--name <nome>`                 | Define o nome e é obrigatório.                           |
| `--description <texto>`         | Envia uma descrição em texto.                            |
| `--markdown-content <markdown>` | Envia uma descrição preservada como Markdown.            |
| `--status <status>`             | Define o status inicial.                                 |
| `--priority <n>`                | Define prioridade de `1` a `4`.                          |
| `--assignee <ids...>`           | Informa IDs numéricos dos responsáveis.                  |
| `--parent <task-id>`            | Cria uma subtarefa ligada ao item informado.             |
| `--start-date <AAAA-MM-DD>`     | Define a data de início.                                 |
| `--due-date <AAAA-MM-DD>`       | Define a data de entrega.                                |
| `--points <n>`                  | Define Sprint Points com número igual ou maior que zero. |

Escolha `--description` para texto ou `--markdown-content` para Markdown. Evite
enviar os dois campos na mesma criação para não deixar a representação da
descrição ambígua.

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
aparecem na mesma execução, a remoção prevalece. `task delete` usa `--yes`
para confirmar a exclusão sem prompt.

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

Docs usam a API v3 do ClickUp e sempre operam no workspace do account ativo,
sem depender de Space, Folder ou List.

| Comando                          | Opção                        | Efeito                                                                       |
| -------------------------------- | ---------------------------- | ---------------------------------------------------------------------------- |
| `doc list`                       | `--query <texto>`            | Filtra pelo nome ou ID localmente.                                           |
| `doc list`                       | `--parent-id <id>`           | Restringe aos Docs criados sob este local.                                   |
| `doc list`                       | `--parent-type <n>`          | Tipo do local: `4` Space, `5` Folder, `6` List, `7` Everything, `12` tarefa. |
| `doc list`                       | `--deleted`                  | Inclui Docs excluídos.                                                       |
| `doc list`                       | `--archived`                 | Inclui Docs arquivados.                                                      |
| `doc list`                       | `--creator <id>`             | Restringe ao ID numérico do criador.                                         |
| `doc list`                       | `--max-pages <n>`            | Limita a paginação por cursor, entre uma e 50 páginas.                       |
| `doc create`                     | `--parent-id <id>`           | Local onde o Doc nasce; exige `--parent-type`.                               |
| `doc create`                     | `--parent-type <n>`          | Tipo do local; exige `--parent-id`.                                          |
| `doc create`                     | `--visibility <valor>`       | `PRIVATE` ou `PUBLIC`.                                                       |
| `doc create`                     | `--create-page`              | Cria também a primeira página em branco.                                     |
| `doc page list`                  | `--max-page-depth <n>`       | Limita a profundidade de sub-páginas retornadas.                             |
| `doc page list` / `doc page get` | `--content-format <valor>`   | `text/md` (padrão) ou `text/plain`.                                          |
| `doc page create`                | `--content <texto>`          | Conteúdo inicial da página.                                                  |
| `doc page create`                | `--sub-title <texto>`        | Subtítulo da página.                                                         |
| `doc page create`                | `--parent-page <id>`         | Cria como sub-página deste ID.                                               |
| `doc page create`                | `--orderindex <n>`           | Posição entre as páginas irmãs.                                              |
| `doc page update`                | `--content-edit-mode <modo>` | `replace` (padrão), `append` ou `prepend`.                                   |

`doc page tree` mostra a hierarquia de páginas sem conteúdo, o caminho mais
rápido para localizar um `page-id`. `doc page update` exige pelo menos um
campo entre `--name`, `--sub-title` e `--content`.

A API pública do ClickUp não oferece endpoints para excluir Docs ou páginas,
reordenar páginas na árvore, nem gerenciar permissões de compartilhamento.

## Agentes e MCP

```bash
clickupfy agent skill list
clickupfy agent skill show <nome>
clickupfy agent skill install [--global] [--force]
clickupfy agent init [options]
clickupfy mcp serve --list <id> [options]
```

`agent skill install` aceita uma lista opcional de skills e chama
`skills add promovaweb/clickupfy --agent codex --copy --yes`. Sem `--global`, o
gerenciador usa `.agents/skills/` e cria ou atualiza `skills-lock.json` no
projeto. Com `--global`, usa `~/.codex/skills/`. Para consultar o estado real,
use `skills list` ou `skills list --global`; `clickupfy agent skill list` exibe
somente o catálogo distribuído pelo ClickUpfy.

O comando não oferece `--target`: o gerenciador de skills controla os caminhos
canônicos. `--force` permanece aceito por compatibilidade, mas a sincronização
é feita pelo próprio `skills add`.

`agent init` exige `--space <id>` e `--list <id>`. Ele também aceita
`--global`, `--workspace <id>`, `--folder <id>`,
`--sprint-folder <id>` e `--force`. O comando atualiza o servidor
`promovaweb-clickupfy` no `.mcp.json` e no `.codex/config.toml`, preservando as
outras entradas de cada arquivo.

`mcp serve` exige `--list <id>` e aceita `--account <perfil>`,
`--workspace <id>`, `--space <id>`, `--folder <id>`,
`--sprint-folder <id>` e `--read-only`.

## Escolha o formato de saída

A tabela compacta é adequada para leitura humana. Use `--json` quando um
script precisar de campos completos ou quando a tabela não mostrar um detalhe
da API.

Use `task get --markdown` para contexto textual. Use `--raw` apenas quando
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
