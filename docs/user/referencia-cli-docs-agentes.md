# Referência do CLI: Docs, skills e servidor MCP

## Classificação

| Campo | Valor |
| --- | --- |
| Natureza | referência |
| Escopo | comandos de Docs do ClickUp, skills distribuídas, inicialização de projeto e servidor MCP |
| Autoridade | `src/cli.ts`, `src/agent-assets.ts`, `src/mcp.ts` e ajuda da versão instalada |

Os Docs do ClickUp pertencem ao workspace do perfil. Eles não usam a List,
Space ou Folder fixados pelo MCP, porque a API de Docs trabalha em outro ramo
da plataforma. Os IDs abaixo são fictícios. Use `doc list`, `doc get` e
`doc page tree` para descobrir IDs reais antes de criar ou alterar conteúdo.

## Docs

### `clickupfy doc list`

Busca Docs no workspace associado ao perfil. `--max-pages` controla o número de
páginas de cursor consultadas e aceita inteiros de `1` a `50`; o padrão é `50`.
`--parent-id` deve ser usado junto de `--parent-type` para identificar o local.

| Parâmetro           | Obrigatório | Uso                                                           |
| ------------------- | ----------- | ------------------------------------------------------------- |
| `--query <texto>`   | não         | Filtro pelo nome ou ID do Doc.                                |
| `--parent-id <id>`  | não         | Local pai do Doc.                                             |
| `--parent-type <n>` | não         | `4` Space, `5` Folder, `6` List, `7` Everything, `12` tarefa. |
| `--deleted`         | não         | Inclui Docs excluídos.                                        |
| `--archived`        | não         | Inclui Docs arquivados.                                       |
| `--creator <id>`    | não         | ID numérico da pessoa criadora.                               |
| `--max-pages <n>`   | não         | Cursor de `1` a `50`; padrão `50`.                            |

Exemplos:

```bash
clickupfy doc list
```

```bash
clickupfy doc list --query "API"
```

```bash
clickupfy doc list --parent-id 3001 --parent-type 6
```

```bash
clickupfy doc list --archived --deleted --creator 42 --max-pages 10
```

```bash
clickupfy --account produto --json doc list --query "Manual" --max-pages 5
```

`--parent-type` sem `--parent-id` não cria uma consulta útil, pois não há local
para classificar. A saída inclui os metadados necessários para chamar `doc get`
ou navegar pelas páginas.

### `clickupfy doc get <doc-id>`

Obtém metadados de um Doc no workspace atual. Ele não devolve automaticamente
o conteúdo das páginas; use `doc page list` para conteúdo completo ou `doc page
get` para uma página determinada.

Exemplos:

```bash
clickupfy doc get doc-1
```

```bash
clickupfy --json doc get doc-1
```

```bash
clickupfy --account produto doc get doc-1
```

```bash
clickupfy --account cliente-a --json doc get doc-22
```

```bash
clickupfy doc get doc-1 > /tmp/doc-1.txt
```

O último exemplo guarda a tabela compacta. Para processamento por outro
programa, acrescente `--json` e preserve os dados do workspace como informação
interna da equipe.

### `clickupfy doc create --name <nome>`

Cria um Doc no workspace. Quando `--parent-id` é informado, `--parent-type` é
obrigatório. Os tipos são `4` Space, `5` Folder, `6` List, `7` Everything e
`12` tarefa. `--visibility` aceita o valor definido pela API, normalmente
`PRIVATE` ou `PUBLIC`; `--create-page` cria a primeira página em branco.

| Parâmetro              | Obrigatório | Uso                                       |
| ---------------------- | ----------- | ----------------------------------------- |
| `--name <nome>`        | sim         | Nome do Doc.                              |
| `--parent-id <id>`     | não         | Local onde o Doc será criado.             |
| `--parent-type <n>`    | condicional | Tipo do local quando há `parent-id`.      |
| `--visibility <valor>` | não         | Visibilidade, como `PRIVATE` ou `PUBLIC`. |
| `--create-page`        | não         | Cria uma primeira página vazia.           |

Exemplos:

```bash
clickupfy doc create --name "Manual da API"
```

```bash
clickupfy doc create --name "Guia do produto" --create-page
```

```bash
clickupfy doc create --name "Notas da List" --parent-id 3001 --parent-type 6
```

```bash
clickupfy doc create --name "Documento interno" --parent-id 2001 --parent-type 5 --visibility PRIVATE
```

```bash
clickupfy --account produto --json doc create --name "Plano de release" --parent-id 86abc123 --parent-type 12 --create-page
```

Uma criação bem-sucedida devolve o ID do Doc. Releia seus metadados e crie as
páginas pelo grupo `doc page`. A API pública usada pelo ClickUpfy não expõe
exclusão de Docs, mudança de permissões ou reordenação da árvore.

### `clickupfy doc page tree <doc-id>`

Mostra somente a árvore de páginas, sem o corpo. É a leitura mais econômica
para descobrir um `page-id` e a relação pai-filho antes de criar uma subpágina
ou atualizar conteúdo.

Exemplos:

```bash
clickupfy doc page tree doc-1
```

```bash
clickupfy --json doc page tree doc-1
```

```bash
clickupfy --account produto doc page tree doc-1
```

```bash
clickupfy --account cliente-a --json doc page tree doc-22
```

```bash
clickupfy doc page tree doc-1 > /tmp/doc-1-tree.txt
```

O retorno não é cópia de segurança do conteúdo. Use `doc page list` quando o
objetivo for ler todas as páginas em Markdown.

### `clickupfy doc page list <doc-id>`

Lista páginas com conteúdo. `--max-page-depth` limita a profundidade de
subpáginas retornada. `--content-format` aceita `text/md`, o padrão, ou
`text/plain` para texto sem a representação Markdown da API.

| Parâmetro                  | Obrigatório | Uso                                |
| -------------------------- | ----------- | ---------------------------------- |
| `<doc-id>`                 | sim         | Doc cujas páginas serão lidas.     |
| `--max-page-depth <n>`     | não         | Profundidade máxima de subpáginas. |
| `--content-format <valor>` | não         | `text/md` ou `text/plain`.         |

Exemplos:

```bash
clickupfy doc page list doc-1
```

```bash
clickupfy doc page ls doc-1 --max-page-depth 1
```

```bash
clickupfy doc page list doc-1 --max-page-depth 3
```

```bash
clickupfy doc page list doc-1 --content-format text/plain
```

```bash
clickupfy --account produto --json doc page list doc-1 --content-format text/md
```

Use uma profundidade pequena quando só precisa dos capítulos principais. Para
uma página conhecida, `doc page get` reduz a resposta e evita transmitir o
conteúdo de outras páginas a um agente.

### `clickupfy doc page get <doc-id> <page-id>`

Obtém uma página específica e seu conteúdo. `--content-format` tem os mesmos
valores de `doc page list`: `text/md` por padrão e `text/plain` como opção.

Exemplos:

```bash
clickupfy doc page get doc-1 page-1
```

```bash
clickupfy doc page get doc-1 page-1 --content-format text/plain
```

```bash
clickupfy --json doc page get doc-1 page-1
```

```bash
clickupfy --account produto doc page get doc-1 page-2 --content-format text/md
```

```bash
clickupfy --account cliente-a --json doc page get doc-22 page-8
```

O ID da página deve pertencer ao Doc informado. Localize-o com `doc page tree`
ou `doc page list`, não com tentativa e erro.

### `clickupfy doc page create <doc-id> --name <nome>`

Cria página ou subpágina em um Doc. `--parent-page` indica uma página pai;
`--orderindex` escolhe a posição entre páginas irmãs. O conteúdo inicial e o
subtítulo são opcionais. Não use `orderindex` como substituto de uma revisão da
árvore existente: leia a árvore antes de inserir conteúdo.

| Parâmetro                  | Obrigatório | Uso                          |
| -------------------------- | ----------- | ---------------------------- |
| `<doc-id>`                 | sim         | Doc proprietário.            |
| `--name <nome>`            | sim         | Título da página.            |
| `--content <texto>`        | não         | Conteúdo inicial.            |
| `--sub-title <texto>`      | não         | Subtítulo.                   |
| `--parent-page <id>`       | não         | Página pai de uma subpágina. |
| `--orderindex <n>`         | não         | Posição entre páginas irmãs. |
| `--content-format <valor>` | não         | `text/md` ou `text/plain`.   |

Exemplos:

```bash
clickupfy doc page create doc-1 --name "Introdução"
```

```bash
clickupfy doc page create doc-1 --name "Autenticação" --content "Use uma API key pessoal."
```

```bash
clickupfy doc page create doc-1 --name "Detalhes" --sub-title "Campos e respostas" --content "## Parâmetros"
```

```bash
clickupfy doc page create doc-1 --name "Erros" --parent-page page-1 --orderindex 2
```

```bash
clickupfy --account produto --json doc page create doc-1 --name "Integração" --content "# MCP" --content-format text/md
```

Leia a página criada com `doc page get` e a árvore com `doc page tree` para
confirmar conteúdo e posição. A criação não atualiza outras páginas nem cria um
Doc novo.

### `clickupfy doc page update <doc-id> <page-id>`

Atualiza título, subtítulo e/ou conteúdo de uma página. Pelo menos um campo é
necessário. `--content-edit-mode` controla o conteúdo: `replace` substitui,
`append` acrescenta ao fim e `prepend` insere no começo. Sem a flag, o modo é
`replace`.

| Parâmetro                    | Obrigatório | Uso                               |
| ---------------------------- | ----------- | --------------------------------- |
| `<doc-id>`, `<page-id>`      | sim         | Doc e página a atualizar.         |
| `--name <nome>`              | não         | Novo título.                      |
| `--sub-title <texto>`        | não         | Novo subtítulo.                   |
| `--content <texto>`          | não         | Conteúdo enviado à API.           |
| `--content-edit-mode <modo>` | não         | `replace`, `append` ou `prepend`. |
| `--content-format <valor>`   | não         | `text/md` ou `text/plain`.        |

Exemplos:

```bash
clickupfy doc page update doc-1 page-1 --name "Visão geral"
```

```bash
clickupfy doc page update doc-1 page-1 --sub-title "Instalação e configuração"
```

```bash
clickupfy doc page update doc-1 page-1 --content "# Novo conteúdo"
```

```bash
clickupfy doc page update doc-1 page-1 --content "\n## Changelog" --content-edit-mode append
```

```bash
clickupfy --account produto --json doc page update doc-1 page-2 --content "# Aviso\n\n" --content-edit-mode prepend --content-format text/md
```

Leia a página depois da escrita para confirmar o modo aplicado. A API pública
usada pelo ClickUpfy não oferece exclusão de página nem movimentação na árvore.

## Skills e projeto de agente

### `clickupfy agent skill list`

Lista as skills embaladas: `clickupfy-dev`, `clickup-issue-create`,
`clickup-issue-implement` e `clickupfy-release`. Não instala nada e não precisa
de perfil configurado. O estado da instalação é responsabilidade do gerenciador
`skills`; use `skills list` no projeto ou `skills list --global`.

Exemplos:

```bash
clickupfy agent skill list
```

```bash
clickupfy agent skill list | sort
```

```bash
clickupfy agent skill list > /tmp/clickupfy-skills.txt
```

```bash
clickupfy agent skill list | wc -l
```

```bash
clickupfy agent skill list && clickupfy agent skill show clickupfy-dev
```

O catálogo é incorporado ao pacote ou executável. `list` não verifica se uma
skill já está instalada no projeto; ele apenas mostra o que a versão instalada
do ClickUpfy pode distribuir. As instruções e os metadados distribuídos estão
em português do Brasil.

### `clickupfy agent skill show <skill>`

Imprime a fonte da skill embarcada. Use-o para revisar instruções e permissões
antes da instalação. O argumento precisa ser um dos quatro nomes do catálogo.

Exemplos:

```bash
clickupfy agent skill show clickupfy-dev
```

```bash
clickupfy agent skill show clickup-issue-create
```

```bash
clickupfy agent skill show clickup-issue-implement
```

```bash
clickupfy agent skill show clickupfy-release
```

```bash
clickupfy agent skill show clickupfy-dev > /tmp/clickupfy-dev-skill.md
```

Uma skill inexistente é recusada. O comando só lê o asset distribuído; ele não
abre uma cópia local já instalada, que pode ter sido alterada pelo projeto.

### `clickupfy agent skill install [skills...]`

Instala todas as skills quando nenhum nome é informado, ou somente as skills
posicionais escolhidas, chamando `skills add promovaweb/clickupfy`. Sem
`--global`, o destino é `.agents/skills/` da pasta atual e o gerenciador
atualiza `skills-lock.json`. `--global` usa `~/.codex/skills`. A instalação
sempre usa `--agent codex`, `--copy` e `--yes`.

| Parâmetro     | Obrigatório | Uso                                    |
| ------------- | ----------- | -------------------------------------- |
| `[skills...]` | não         | Uma ou mais skills do catálogo.        |
| `--global`    | não         | Instala no catálogo global do usuário. |
| `--force`     | não         | Permite repetir a instalação.          |

Exemplos:

```bash
clickupfy agent skill install
```

```bash
clickupfy agent skill install clickupfy-dev
```

```bash
clickupfy agent skill install clickup-issue-create clickup-issue-implement
```

```bash
clickupfy agent skill install --global clickupfy-dev
```

```bash
clickupfy agent skill install clickupfy-release --force
```

`--target` não é aceito porque os caminhos canônicos pertencem ao gerenciador
`skills`. Revise a fonte com `agent skill show` e consulte `skills list` antes de
atualizar regras de um projeto.

### `clickupfy agent init`

Instala as skills e mescla um servidor `promovaweb-clickupfy` no `.mcp.json` e
no `.codex/config.toml` do projeto. `--space` e `--list` são obrigatórios. Os
arquivos gerados guardam perfil e IDs, mas nunca a API key. O JSON usa
`mcpServers`; o Codex usa `[mcp_servers."promovaweb-clickupfy"]`. Acrescente
`--read-only` manualmente aos argumentos das entradas quando o primeiro uso só
pode consultar dados.

| Parâmetro              | Obrigatório | Uso                          |
| ---------------------- | ----------- | ---------------------------- |
| `--global`             | não         | Instala skills globalmente.  |
| `--workspace <id>`     | não         | Workspace esperado pelo MCP. |
| `--space <id>`         | sim         | Space fixado para o projeto. |
| `--folder <id>`        | não         | Folder fixado.               |
| `--list <id>`          | sim         | List fixa e obrigatória.     |
| `--sprint-folder <id>` | não         | Sprint Folder do projeto.    |
| `--force`              | não         | Atualiza skills existentes.  |

Exemplos:

```bash
clickupfy agent init --space 1001 --list 3001
```

```bash
clickupfy --account produto agent init --workspace 123456 --space 1001 --folder 2001 --list 3001
```

```bash
clickupfy agent init --space 1001 --list 3001 --sprint-folder 4001
```

```bash
clickupfy agent init --global --space 1001 --list 3001 --force
```

```bash
clickupfy --account cliente-a agent init --workspace 987654 --space 5001 --list 7001 --sprint-folder 8001 --force
```

O comando preserva outros servidores e configurações nos dois arquivos. Reabra
o cliente MCP e chame `clickupfy_mcp_context` para conferir o destino. O CLI não
lê esses arquivos em chamadas normais: eles só são usados pelo cliente para
iniciar `mcp serve`.

### `clickupfy mcp serve --list <id>`

Inicia o servidor MCP em stdio. A saída padrão é reservada ao protocolo
JSON-RPC; mensagens operacionais são escritas em stderr. `--list` é obrigatório.
Os outros IDs fixam os níveis superiores; `--read-only` remove ferramentas de
escrita de `tools/list`.

| Parâmetro              | Obrigatório | Uso                                   |
| ---------------------- | ----------- | ------------------------------------- |
| `--account <perfil>`   | não         | Perfil fixado.                        |
| `--workspace <id>`     | não         | Workspace esperado.                   |
| `--space <id>`         | não         | Space fixado.                         |
| `--folder <id>`        | não         | Folder fixado.                        |
| `--list <id>`          | sim         | List fixa.                            |
| `--sprint-folder <id>` | não         | Sprint Folder fixado.                 |
| `--read-only`          | não         | Expõe somente ferramentas de leitura. |

Exemplos:

```bash
clickupfy mcp serve --list 3001
```

```bash
clickupfy mcp serve --account produto --list 3001
```

```bash
clickupfy mcp serve --workspace 123456 --space 1001 --folder 2001 --list 3001
```

```bash
clickupfy mcp serve --list 3001 --sprint-folder 4001 --read-only
```

```bash
clickupfy mcp serve --account cliente-a --workspace 987654 --space 5001 --list 7001 --sprint-folder 8001
```

Normalmente o cliente MCP executa esse comando a partir do `.mcp.json` ou do
`.codex/config.toml`; não o inicie em um terminal que também precise de saída
humana. A referência MCP
detalha cada ferramenta exposta pelo servidor e as diferenças entre leitura e
escrita.
