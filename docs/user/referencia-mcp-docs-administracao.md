# Referência MCP: Docs e administração de perfil

## Classificação

| Campo | Valor |
| --- | --- |
| Natureza | referência |
| Escopo | ferramentas MCP de Docs do ClickUp, seleção de perfil e seleção de workspace |
| Autoridade | `src/operations/mcp.ts`, `src/clickup/docs.ts`, `src/clickup/scope.ts` e os schemas registrados em `src/mcp/server.ts` |

As ferramentas de Docs usam o workspace resolvido pelo perfil, sem aplicar
o isolamento de Space, Folder ou List do projeto. As ferramentas de seleção de
perfil e de workspace só são registradas quando o servidor tem escrita e não
recebeu os respectivos valores fixos. Objetos JSON a seguir representam os
argumentos de uma chamada MCP; IDs são fictícios.

O conteúdo das páginas entra e sai pelo campo `content`; a leitura de arquivo e
de `stdin` existe só no CLI. Uma falha esperada retorna `isError: true`, a
mensagem e o exit code equivalente do CLI, sem derrubar o servidor.

## Leitura de Docs

### `clickupfy_docs_list`

Busca Docs do workspace do perfil. `maxPages` aceita inteiros de `1` a `50`.
Quando `parentId` for informado, `parentType` informa o tipo do local: `4` Space,
`5` Folder, `6` List, `7` Everything ou `12` tarefa. O retorno é
`{ docs: [] }`.

| Campo | Tipo | Obrigatório | Uso |
| --- | --- | --- | --- |
| `account` | string | não | Perfil a resolver. |
| `query` | string | não | Nome ou ID do Doc. |
| `parentId` | string | não | Local pai do Doc. |
| `parentType` | inteiro | não | Tipo de `parentId`. |
| `deleted`, `archived` | booleano | não | Inclui Docs excluídos ou arquivados. |
| `creator` | inteiro | não | ID numérico da pessoa criadora. |
| `maxPages` | inteiro | não | Cursor de `1` a `50`. |

Exemplos:

```json
{}
```

```json
{"query":"API"}
```

```json
{"parentId":"901328052926","parentType":6}
```

```json
{"archived":true,"deleted":true,"creator":42,"maxPages":10}
```

```json
{"account":"produto","query":"Manual","maxPages":5}
```

Use o ID retornado em `clickupfy_doc_get`, `clickupfy_doc_page_tree` ou uma
ferramenta de página. A busca não devolve todo o conteúdo das páginas e não se
limita à List fixada pelo MCP. `maxPages` fora de `1` a `50` é recusado pelo
schema.

### `clickupfy_doc_get`

Obtém metadados de um Doc. O corpo pertence às páginas, por isso esta ferramenta é
indicada para confirmar nome, local e estado do Doc antes de consultar ou alterar
uma página.

| Campo | Tipo | Obrigatório | Uso |
| --- | --- | --- | --- |
| `account` | string | não | Perfil a resolver. |
| `docId` | string | sim | Doc a obter. |

Exemplos:

```json
{"docId":"8cdu8-123"}
```

```json
{"docId":"8cdu8-456"}
```

```json
{"account":"produto","docId":"8cdu8-123"}
```

```json
{"account":"cliente-a","docId":"8cdu8-456"}
```

```json
{"account":"homologacao","docId":"8cdu8-789"}
```

Se o Doc não pertencer ao workspace do perfil, a API recusa a chamada. Não
substitua `docId` por `pageId`: os dois identificadores pertencem a recursos
distintos. Doc inexistente retorna `isError` com o exit code `6`.

### `clickupfy_doc_page_tree`

Retorna a hierarquia de páginas de um Doc sem trazer os conteúdos, em
`{ pages: [] }` aninhadas. É a escolha adequada para localizar `pageId`,
parentesco e profundidade antes de criar uma subpágina ou atualizar uma página
existente.

| Campo | Tipo | Obrigatório | Uso |
| --- | --- | --- | --- |
| `account` | string | não | Perfil a resolver. |
| `docId` | string | sim | Doc cuja árvore será lida. |

Exemplos:

```json
{"docId":"8cdu8-123"}
```

```json
{"docId":"8cdu8-456"}
```

```json
{"account":"produto","docId":"8cdu8-123"}
```

```json
{"account":"cliente-a","docId":"8cdu8-456"}
```

```json
{"account":"homologacao","docId":"8cdu8-789"}
```

Essa ferramenta não é uma cópia de segurança do texto. Use
`clickupfy_doc_pages_list` para ler muitas páginas ou `clickupfy_doc_page_get`
para ler uma página conhecida.

### `clickupfy_doc_pages_list`

Lista páginas de um Doc com conteúdo. `maxPageDepth` limita o retorno de
subpáginas. `contentFormat` aceita `text/md` ou `text/plain`; quando omitido, a
API usa `text/md`. O retorno é `{ pages: [] }` com conteúdo.

| Campo | Tipo | Obrigatório | Uso |
| --- | --- | --- | --- |
| `account` | string | não | Perfil a resolver. |
| `docId` | string | sim | Doc cujas páginas serão lidas. |
| `maxPageDepth` | inteiro | não | Profundidade máxima de subpáginas. |
| `contentFormat` | string | não | Forma do conteúdo, `text/md` ou `text/plain`. |

Exemplos:

```json
{"docId":"8cdu8-123"}
```

```json
{"docId":"8cdu8-123","maxPageDepth":1}
```

```json
{"docId":"8cdu8-123","maxPageDepth":3}
```

```json
{"docId":"8cdu8-123","contentFormat":"text/plain"}
```

```json
{"account":"produto","docId":"8cdu8-123","contentFormat":"text/md"}
```

Leia somente a profundidade necessária para reduzir conteúdo irrelevante na
conversa do agente. A ferramenta não modifica o Doc nem a árvore.

### `clickupfy_doc_page_get`

Obtém uma página específica e seu conteúdo. O `pageId` deve pertencer ao Doc
informado; localize-o pela árvore ou pela listagem de páginas.

| Campo | Tipo | Obrigatório | Uso |
| --- | --- | --- | --- |
| `account` | string | não | Perfil a resolver. |
| `docId` | string | sim | Doc proprietário. |
| `pageId` | string | sim | Página a obter. |
| `contentFormat` | string | não | Forma do conteúdo. |

Exemplos:

```json
{"docId":"8cdu8-123","pageId":"8cdu8-456"}
```

```json
{"docId":"8cdu8-123","pageId":"8cdu8-456","contentFormat":"text/plain"}
```

```json
{"docId":"8cdu8-123","pageId":"8cdu8-789","contentFormat":"text/md"}
```

```json
{"account":"produto","docId":"8cdu8-123","pageId":"8cdu8-456"}
```

```json
{"account":"cliente-a","docId":"8cdu8-456","pageId":"8cdu8-999"}
```

## Escrita de Docs

As três ferramentas seguintes não aparecem em `--read-only`. A API pública usada
pelo ClickUpfy não expõe ferramentas para excluir Docs ou páginas, mudar
permissões de um Doc existente ou reordenar a árvore depois da criação.

### `clickupfy_doc_create`

Cria um Doc no workspace. `name` é obrigatório. Quando `parentId` é informado,
`parentType` também é obrigatório. Um `parentId` sem `parentType` é recusado antes da
chamada à API. `visibility` pode ser `PRIVATE` ou `PUBLIC`, enquanto `createPage` cria uma
página em branco junto do Doc.

| Campo | Tipo | Obrigatório | Uso |
| --- | --- | --- | --- |
| `account` | string | não | Perfil a resolver. |
| `name` | string | sim | Nome do Doc. |
| `parentId` | string | não | Local pai. |
| `parentType` | inteiro | condicional | Tipo do local pai. |
| `visibility` | string | não | Visibilidade do novo Doc. |
| `createPage` | booleano | não | Cria a primeira página vazia. |

Exemplos:

```json
{"name":"Manual da API"}
```

```json
{"name":"Guia do produto","createPage":true}
```

```json
{"name":"Notas da List","parentId":"901328052926","parentType":6}
```

```json
{"name":"Documento interno","parentId":"2001","parentType":5,"visibility":"PRIVATE"}
```

```json
{"account":"produto","name":"Plano de release","parentId":"86abc123","parentType":12,"createPage":true}
```

Chame `clickupfy_doc_get` depois da criação e use o ID devolvido para criar as
páginas. Criação sem `name` é recusada pelo schema.

### `clickupfy_doc_page_create`

Cria página ou subpágina em um Doc. `name` é obrigatório. `parentPageId` define o
pai; `orderindex` indica a posição entre páginas irmãs. O conteúdo e o subtítulo
são opcionais.

| Campo | Tipo | Obrigatório | Uso |
| --- | --- | --- | --- |
| `account`, `docId` | string | `docId` sim | Perfil e Doc proprietário. |
| `name` | string | sim | Título. |
| `content`, `subTitle` | string | não | Corpo e subtítulo iniciais. |
| `parentPageId` | string | não | Página pai. |
| `orderindex` | número | não | Posição entre páginas irmãs. |
| `contentFormat` | string | não | Forma do conteúdo. |

Exemplos:

```json
{"docId":"8cdu8-123","name":"Introdução"}
```

```json
{"docId":"8cdu8-123","name":"Autenticação","content":"Use uma API key pessoal."}
```

```json
{"docId":"8cdu8-123","name":"Detalhes","subTitle":"Campos e respostas","content":"## Parâmetros"}
```

```json
{"docId":"8cdu8-123","name":"Erros","parentPageId":"8cdu8-456","orderindex":2}
```

```json
{"account":"produto","docId":"8cdu8-123","name":"Integração","content":"# MCP","contentFormat":"text/md"}
```

Leia a página criada com `clickupfy_doc_page_get` e a árvore com
`clickupfy_doc_page_tree` para confirmar conteúdo e posição.

### `clickupfy_doc_page_update`

Atualiza título, subtítulo e/ou conteúdo. O schema recusa chamada sem campo de
alteração. `contentEditMode` aceita `replace`, `append` ou `prepend`; o padrão é
`replace`. O modo afeta somente `content`, não o título ou subtítulo.

| Campo | Tipo | Obrigatório | Uso |
| --- | --- | --- | --- |
| `account`, `docId`, `pageId` | string | Doc e página sim | Recurso a alterar. |
| `name`, `subTitle`, `content` | string | ao menos um | Campos a persistir. |
| `contentEditMode` | enum | não | `replace`, `append` ou `prepend`. |
| `contentFormat` | string | não | Forma do conteúdo. |

Exemplos:

```json
{"docId":"8cdu8-123","pageId":"8cdu8-456","name":"Visão geral"}
```

```json
{"docId":"8cdu8-123","pageId":"8cdu8-456","subTitle":"Instalação e configuração"}
```

```json
{"docId":"8cdu8-123","pageId":"8cdu8-456","content":"# Novo conteúdo"}
```

```json
{"docId":"8cdu8-123","pageId":"8cdu8-456","content":"\n## Changelog","contentEditMode":"append"}
```

```json
{"account":"produto","docId":"8cdu8-123","pageId":"8cdu8-789","content":"# Aviso\n\n","contentEditMode":"prepend","contentFormat":"text/md"}
```

Leia a página com `clickupfy_doc_page_get` após atualizar. Não envie um objeto
vazio para testar a conexão: use uma das ferramentas de leitura, pois uma
atualização sem conteúdo é recusada.

## Administração condicionada ao servidor

### `clickupfy_account_use`

Define o perfil ativo local. Só aparece quando o servidor não recebeu `--account`
e não está em `--read-only`. É a equivalência MCP de `clickupfy account use`; em
projetos isolados, prefira fixar o perfil na configuração do processo para evitar
troca global durante o trabalho.

| Campo | Tipo | Obrigatório | Uso |
| --- | --- | --- | --- |
| `account` | string | sim | Perfil local já configurado. |

Exemplos:

```json
{"account":"produto"}
```

```json
{"account":"cliente-a"}
```

```json
{"account":"homologacao"}
```

```json
{"account":"suporte"}
```

```json
{"account":"desenvolvimento"}
```

O retorno informa `{ activeAccount }`. Esta ação muda o `accounts.json` da
máquina, logo não deve ser usada para uma consulta pontual de outro perfil. Perfil
inexistente retorna `isError` com o exit code `6`.

### `clickupfy_workspace_use`

Associa um workspace autorizado ao perfil. Só aparece quando o processo não fixou
`--account` nem `--workspace` e tem escrita. O servidor confere a autorização
contra a API antes de gravar a associação no perfil local.

| Campo | Tipo | Obrigatório | Uso |
| --- | --- | --- | --- |
| `account` | string | não | Perfil a alterar; quando omitido usa o ativo. |
| `workspaceId` | string | sim | Workspace autorizado para o perfil. |

Exemplos:

```json
{"workspaceId":"90070363783"}
```

```json
{"account":"produto","workspaceId":"90070363783"}
```

```json
{"account":"cliente-a","workspaceId":"9007154145"}
```

```json
{"account":"homologacao","workspaceId":"90070363783"}
```

```json
{"account":"suporte","workspaceId":"9007154145"}
```

O retorno é `{ account, workspace }`. Use `clickupfy_workspaces_list` para
descobrir um ID autorizado. Uma tentativa com workspace ausente da lista é
recusada com `isError` e não altera a associação existente.
