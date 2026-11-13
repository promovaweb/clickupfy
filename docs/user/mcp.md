# Conecte agentes pelo servidor MCP

## Classificação

| Campo | Valor |
| --- | --- |
| Natureza | normativo |
| Escopo | configuração, isolamento e uso do servidor MCP |
| Autoridade | implementação do servidor MCP e schemas das ferramentas |

## Configure pelo terminal

Execute `clickupfy mcp setup` dentro do projeto. O assistente pergunta o nome
do MCP e permite selecionar clientes, perfil cadastrado, Space e List. Ele
configura Claude Code, Codex, Gemini CLI e OpenCode nos arquivos locais de cada
cliente. Repita com outro nome para adicionar mais um MCP.

```bash
clickupfy mcp setup
```

Sem terminal, informe os valores:

```bash
clickupfy mcp setup \
  --name promovaweb-clickupfy \
  --account promovaweb \
  --space 10 \
  --list 30 \
  --clients claude-code,codex,gemini,opencode \
  --non-interactive
```

Consulte as flags, arquivos gerados e exemplos na
[referência de setup](referencia-cli-docs-agentes.md#clickupfy-mcp-setup).

## Inicie manualmente

O servidor usa transporte stdio e reserva a saída padrão para as mensagens
JSON-RPC trocadas com o cliente MCP:

```bash
clickupfy mcp
```

`clickupfy mcp serve` mantém a entrada do ClickUpfy 0.9.0 e aceita a List do
projeto:

```bash
clickupfy mcp serve --list 30
```

A List é obrigatória nessa entrada porque limita consultas e mutações ao
destino do projeto. O comando abaixo também fixa os níveis superiores e o
Sprint Folder:

```bash
clickupfy mcp serve \
  --account promovaweb \
  --workspace 123 \
  --space 10 \
  --folder 20 \
  --list 30 \
  --sprint-folder 40
```

Na forma nova, `clickupfy mcp` aceita `--list-id <id>` no lugar de `--list`:

```bash
clickupfy mcp --list-id 30 --read-only
```

Na prática, deixe o cliente MCP iniciar esse processo pelo `.mcp.json` ou pelo
`.codex/config.toml` quando o cliente for o Codex. O comando `agent install`
gera e atualiza os dois formatos; `mcp setup` cobre também Gemini e OpenCode.

## Ative read-only

```bash
clickupfy mcp serve --list 30 --read-only
```

O modo read-only não registra ferramentas de escrita. Elas deixam de aparecer
em `tools/list`, portanto a restrição é aplicada na superfície do servidor e
não depende apenas da obediência do agente.

Use esse modo para descoberta, auditoria, demonstração ou qualquer conversa
que não autorize alterações. Confira `tools/list` no cliente para confirmar
que as ferramentas de escrita não foram registradas.

## Entenda o isolamento

O MCP recebe IDs no processo. Quando uma ferramenta omite um ID, o servidor
usa o valor fixado. Quando recebe um valor diferente, recusa a operação com
`isError`. Essa comparação protege estes níveis:

- account
- workspace
- Space
- Folder
- List
- Sprint Folder.

A busca de tarefas também permanece dentro da List do projeto. Assim, dois
clientes MCP podem operar em paralelo sem compartilhar destino.

Uma falha esperada volta com `isError: true`, a mensagem e o exit code
equivalente do CLI. Ferramentas destrutivas exigem `confirm: true`.

## Ferramentas de contexto e navegação

`clickupfy_mcp_context` mostra perfil e hierarquia sem expor a API key.
`clickupfy_list_get` retorna os status válidos da List.

### Catálogo disponível em read-only

| Ferramenta                  | Função                                                              |
| --------------------------- | ------------------------------------------------------------------- |
| `clickupfy_mcp_context`     | Mostra o perfil e os IDs fixados pelo projeto.                      |
| `clickupfy_accounts_list`   | Lista perfis locais sem revelar API keys.                           |
| `clickupfy_whoami`          | Valida o perfil e retorna o usuário autenticado.                    |
| `clickupfy_workspaces_list` | Lista workspaces autorizados.                                       |
| `clickupfy_spaces_list`     | Lista Spaces do workspace do perfil.                                |
| `clickupfy_folders_list`    | Lista Folders do Space fixado ou informado.                         |
| `clickupfy_lists_list`      | Lista Lists de um Folder ou diretamente de um Space.                |
| `clickupfy_list_get`        | Lê a List do projeto e seus status.                                 |
| `clickupfy_tasks_list`      | Lista tarefas da List autorizada.                                   |
| `clickupfy_tasks_search`    | Busca tarefas dentro da List autorizada.                            |
| `clickupfy_task_get`        | Lê uma tarefa como resposta original, fila `execution` ou Markdown. |
| `clickupfy_comments_list`   | Lê os comentários de uma tarefa.                                    |
| `clickupfy_tags_list`       | Lê as tags de um Space.                                             |
| `clickupfy_sprints_list`    | Lista Sprints do Sprint Folder.                                     |
| `clickupfy_sprint_current`  | Obtém a Sprint ativa na data de referência.                         |
| `clickupfy_sprint_get`      | Produz o relatório de uma Sprint.                                   |
| `clickupfy_sprint_tasks`    | Lista tarefas associadas à Sprint.                                  |
| `clickupfy_time_current`    | Consulta o time entry em execução.                                  |
| `clickupfy_docs_list`       | Busca Docs do workspace do perfil.                                  |
| `clickupfy_doc_get`         | Lê metadados de um Doc.                                             |
| `clickupfy_doc_page_tree`   | Lê a hierarquia de páginas do Doc, sem conteúdo.                    |
| `clickupfy_doc_pages_list`  | Lê as páginas do Doc com conteúdo em Markdown.                      |
| `clickupfy_doc_page_get`    | Lê uma página específica com conteúdo.                              |

### Catálogo acrescentado no modo com escrita

| Ferramenta                        | Função                                                           |
| --------------------------------- | ---------------------------------------------------------------- |
| `clickupfy_account_use`           | Altera o perfil ativo quando o servidor não fixa um perfil.      |
| `clickupfy_workspace_use`         | Altera o workspace quando perfil e workspace não estão fixados.  |
| `clickupfy_task_create`           | Cria tarefa ou subtarefa na List autorizada.                     |
| `clickupfy_task_update`           | Atualiza campos de uma tarefa.                                   |
| `clickupfy_task_delete`           | Exclui uma tarefa mediante `confirm: true`.                      |
| `clickupfy_task_add_tag`          | Adiciona uma tag sem trocar as outras.                           |
| `clickupfy_task_remove_tag`       | Remove uma tag e a mantém no Space.                              |
| `clickupfy_tag_create`            | Cria uma tag no Space.                                           |
| `clickupfy_tag_update`            | Renomeia uma tag ou troca as cores.                              |
| `clickupfy_tag_delete`            | Exclui uma tag do Space mediante `confirm: true`.                |
| `clickupfy_checklist_create`      | Cria um checklist em uma tarefa.                                 |
| `clickupfy_checklist_item_create` | Acrescenta um item ao checklist.                                 |
| `clickupfy_checklist_item_set`    | Marca ou reabre um item e confirma o novo estado.                |
| `clickupfy_sprint_add_task`       | Associa uma tarefa à Sprint.                                     |
| `clickupfy_sprint_remove_task`    | Remove a associação sem excluir a tarefa.                        |
| `clickupfy_sprint_set_points`     | Define Sprint Points.                                            |
| `clickupfy_comment_create`        | Publica um comentário na tarefa.                                 |
| `clickupfy_time_start`            | Inicia um time entry associado à tarefa.                         |
| `clickupfy_time_stop`             | Encerra o time entry atual.                                      |
| `clickupfy_doc_create`            | Cria um Doc no workspace, opcionalmente vinculado a um local.    |
| `clickupfy_doc_page_create`       | Cria uma página, ou sub-página, em um Doc.                       |
| `clickupfy_doc_page_update`       | Atualiza título, subtítulo e/ou conteúdo de uma página.          |

Além dessas, cada operação do catálogo genérico vira uma tool
`clickupfy_api_<versão>_<slug>`, com 173 operações da API v2 e v3. Em
`--read-only`, só as operações de leitura são registradas.

Na criação e na atualização, informe apenas os campos que devem ser enviados.
O servidor recusa IDs que não correspondem ao escopo fixado. A skill de
implementação consulta `clickupfy_time_current` antes de iniciar outro
registro.

Em `clickupfy_task_create`, datas são timestamp em milissegundos. Em
`clickupfy_task_update`, `clearStartDate` e `clearDueDate` removem as datas.

As ferramentas de Docs não seguem o isolamento por Space, Folder ou List: elas
sempre operam no workspace do perfil resolvido, porque Docs não pertencem a
uma List. `clickupfy_doc_create` exige `parentType` sempre que `parentId` for
informado, seguindo os mesmos tipos de local da API do ClickUp (`4` Space,
`5` Folder, `6` List, `7` Everything, `12` tarefa).

## Use Markdown para contexto longo

`clickupfy_task_get` aceita `markdown: true`. Nesse modo, a ferramenta retorna
um texto único, sem envolver o documento em uma string JSON escapada. Essa
forma reduz ruído para agentes e preserva checkboxes hierárquicos.

Esta solicitação usa a leitura em Markdown e informa ao agente que nenhuma
mutação está autorizada:

```text
Leia a tarefa 86abc123 com clickupfy_task_get e markdown: true. Resuma o
objetivo, liste os itens pendentes e não faça mutações.
```

## Liste e teste o servidor

```bash
clickupfy mcp --list
clickupfy mcp --list --json
npx @modelcontextprotocol/inspector clickupfy mcp
```

`--list` descreve tools, resources e prompts sem iniciar o servidor. O
Inspector abre uma página local para chamar tools e inspecionar as mensagens
JSON-RPC.

## Diagnostique a conexão

Se o cliente não listar ferramentas, siga a conexão desde o comando local até
o recarregamento do processo:

1. execute o comando de `args` manualmente no terminal
2. confira se o perfil existe
3. confirme que `--list` ou `--list-id` possui valor
4. valide o JSON ou o TOML do cliente
5. rode `clickupfy doctor` e `clickupfy doctor --online`
6. reinicie o cliente MCP
7. leia os logs sem imprimir a API key.

A [referência do CLI](cli.md) reúne os comandos e as flags usados para
reproduzir o servidor manualmente quando o diagnóstico exigir uma comparação.
