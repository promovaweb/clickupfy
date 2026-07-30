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

As opções globais selecionam o account e o formato da resposta antes que o
CLI interprete o grupo e a ação:

| Opção | Efeito |
| --- | --- |
| `-V`, `--version` | Mostra a versão. |
| `--account <perfil>` | Usa outro account somente nessa execução. |
| `--json` | Imprime a resposta completa em JSON. |
| `-h`, `--help` | Mostra ajuda. |

Coloque as opções globais antes do grupo. No exemplo abaixo, a resposta de
`task get` usa o account `cliente-a` e sai em JSON:

```bash
clickupfy --account cliente-a --json task get 86abc123
```

## Configuração e identidade

```bash
clickupfy setup [options]
clickupfy status
clickupfy whoami
clickupfy account list
clickupfy account show [perfil]
clickupfy account use <perfil>
clickupfy account remove <perfil>
clickupfy workspace list
clickupfy workspace use <workspace-id>
```

O setup recebe a credencial, identifica o account local e associa o workspace.
Estes parâmetros permitem executar o mesmo processo com ou sem prompts:

| Opção | Efeito |
| --- | --- |
| `--api-key <chave>` | Informa a API key pessoal do ClickUp. |
| `--token <chave>` | Mantém compatibilidade como alias de `--api-key`. |
| `--name <nome>` | Define o nome local do account. |
| `--workspace <id>` | Associa o account ao workspace indicado. |
| `--non-interactive` | Executa sem abrir prompts e exige os valores necessários por opção. |

`account remove <perfil>` aceita `--yes` para confirmar a remoção sem prompt.
As outras ações desse grupo não possuem opções próprias.

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

| Comando | Opção | Efeito |
| --- | --- | --- |
| `task list` | `--list <id>` | Define a List consultada e é obrigatório. |
| `task list` | `--status <status...>` | Restringe a resposta aos status informados. |
| `task list` | `--assignee <ids...>` | Restringe a resposta aos responsáveis informados. |
| `task list` | `--include-closed` | Inclui tarefas concluídas. |
| `task list` | `--page <n>` | Consulta uma página, começando em zero. |
| `task search` | `--query <texto>` | Procura no nome, na descrição ou no ID. |
| `task search` | `--status <status...>` | Restringe a busca aos status informados. |
| `task search` | `--assignee <ids...>` | Restringe a busca aos responsáveis informados. |
| `task search` | `--include-closed` | Inclui tarefas concluídas. |
| `task search` | `--max-pages <n>` | Limita a paginação consultada entre uma e 100 páginas. |
| `task get` | `--raw` | Retorna a resposta original do ClickUp. |
| `task get` | `--markdown` | Concatena tarefa, subtarefas e checklists em Markdown. |

`--raw` e `--markdown` não podem ser usados juntos. A opção global `--json`
também é incompatível com esses dois formatos, e o CLI encerra a execução com
uma mensagem de uso quando encontra a combinação.

### Campos de criação

| Opção | Efeito |
| --- | --- |
| `--list <id>` | Define a List de destino e é obrigatório. |
| `--name <nome>` | Define o nome e é obrigatório. |
| `--description <texto>` | Envia uma descrição em texto. |
| `--markdown-content <markdown>` | Envia uma descrição preservada como Markdown. |
| `--status <status>` | Define o status inicial. |
| `--priority <n>` | Define prioridade de `1` a `4`. |
| `--assignee <ids...>` | Informa IDs numéricos dos responsáveis. |
| `--parent <task-id>` | Cria uma subtarefa ligada ao item informado. |
| `--start-date <AAAA-MM-DD>` | Define a data de início. |
| `--due-date <AAAA-MM-DD>` | Define a data de entrega. |
| `--points <n>` | Define Sprint Points com número igual ou maior que zero. |

Escolha `--description` para texto ou `--markdown-content` para Markdown. Evite
enviar os dois campos na mesma criação para não deixar a representação da
descrição ambígua.

### Campos de atualização

| Opção | Efeito |
| --- | --- |
| `--name <nome>` | Altera o nome. |
| `--description <texto>` | Substitui a descrição por texto. |
| `--markdown-content <markdown>` | Substitui a descrição por Markdown. |
| `--status <status>` | Altera o status. |
| `--priority <n>` | Altera a prioridade de `1` a `4`. |
| `--start-date <AAAA-MM-DD>` | Altera a data de início. |
| `--clear-start-date` | Remove a data de início. |
| `--due-date <AAAA-MM-DD>` | Altera a data de entrega. |
| `--clear-due-date` | Remove a data de entrega. |
| `--points <n>` | Altera os Sprint Points. |

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

| Comando | Opção | Efeito |
| --- | --- | --- |
| `sprint list` | `--archived` | Inclui Lists arquivadas. |
| `sprint list` | `--include-regular` | Inclui Lists sem período do Sprint Folder. |
| `sprint list` | `--at <AAAA-MM-DD>` | Calcula o estado do ciclo na data informada. |
| `sprint current` | `--at <AAAA-MM-DD>` | Procura a Sprint ativa na data informada. |
| `sprint get` | `--at <AAAA-MM-DD>` | Calcula o relatório na data informada. |
| `sprint tasks` | `--open-only` | Omite tarefas concluídas. |

`sprint list` e `sprint current` exigem `--folder <id>` para limitar a busca ao
Sprint Folder selecionado.

## Time tracking

```bash
clickupfy time current
clickupfy time start --task <task-id> [--description <texto>]
clickupfy time stop
```

## Agentes e MCP

```bash
clickupfy agent skill list
clickupfy agent skill show <nome>
clickupfy agent skill install [--global] [--force]
clickupfy agent init [options]
clickupfy mcp serve --list <id> [options]
```

`agent skill install` aceita uma lista opcional de skills. As opções
`--global`, `--target <pasta>` e `--force` controlam destino e substituição,
permitindo conferir a pasta instalada sem alterar outros catálogos.

`agent init` exige `--space <id>` e `--list <id>`. Ele também aceita
`--global`, `--workspace <id>`, `--folder <id>`,
`--sprint-folder <id>` e `--force`.

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
