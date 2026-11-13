# Referência MCP: Docs e administração de perfil

## Classificação

| Campo | Valor |
| --- | --- |
| Natureza | referência |
| Escopo | ferramentas MCP de Docs do ClickUp, seleção de perfil e seleção de workspace |
| Autoridade | schemas e handlers de `src/mcp.ts` e cliente de Docs em `src/clickup.ts` |

As ferramentas de Docs sempre usam o workspace resolvido pelo perfil, sem
aplicar o isolamento de Space, Folder ou List do projeto. As ferramentas de
seleção de perfil e workspace só são registradas quando o servidor tem escrita
e não recebeu os respectivos valores fixos. Objetos JSON a seguir representam
os argumentos de uma chamada MCP; IDs são fictícios.

## Leitura de Docs

### `clickupfy_docs_list`

Busca Docs do workspace do perfil. `maxPages` aceita inteiros de `1` a `50`.
Quando `parentId` for informado, `parentType` informa o tipo do local: `4`
Space, `5` Folder, `6` List, `7` Everything ou `12` tarefa.

| Campo | Tipo | Obrigatório | Uso |
| --- | --- | --- | --- |
| `account` | string | não | Perfil a resolver. |
| `query` | string | não | Nome ou ID do Doc. |
| `parentId` | string | não | Local pai do Doc. |
| `parentType` | inteiro | não | Tipo de `parentId`. |
| `deleted`, `archived` | booleano | não | Inclui Docs excluídos ou arquivados. |
| `creator` | inteiro | não | Pessoa criadora. |
| `maxPages` | inteiro | não | Cursor de `1` a `50`. |

Exemplos:

```json
{}
```

```json
{"query":"API"}
```

```json
{"parentId":"3001","parentType":6}
```

```json
{"archived":true,"deleted":true,"creator":42,"maxPages":10}
```

```json
{"account":"produto","query":"Manual","maxPages":5}
```

Use o ID retornado em `clickupfy_doc_get`, `clickupfy_doc_page_tree` ou uma
ferramenta de página. A busca não devolve automaticamente todo conteúdo das
páginas e não se limita à List fixada pelo MCP.

### `clickupfy_doc_get`

Obtém metadados de um Doc. O corpo pertence às páginas, por isso esta ferramenta
é indicada para confirmar nome, local e estado do Doc antes de consultar ou
alterar uma página.

| Campo | Tipo | Obrigatório | Uso |
| --- | --- | --- | --- |
| `account` | string | não | Perfil a resolver. |
| `docId` | string | sim | Doc a obter. |

Exemplos:

```json
{"docId":"doc-1"}
```

```json
{"docId":"doc-22"}
```

```json
{"account":"produto","docId":"doc-1"}
```

```json
{"account":"cliente-a","docId":"doc-22"}
```

```json
{"account":"homologacao","docId":"doc-33"}
```

Se o Doc não pertencer ao workspace do perfil, a API recusa a chamada. Não
substitua `docId` por `pageId`: os dois identificadores pertencem a recursos
distintos.

### `clickupfy_doc_page_tree`

Retorna a hierarquia de páginas de um Doc sem trazer seus conteúdos. É a escolha
adequada para localizar `pageId`, parentesco e profundidade antes de criar uma
subpágina ou atualizar uma página existente.

Exemplos:

```json
{"docId":"doc-1"}
```

```json
{"docId":"doc-22"}
```

```json
{"account":"produto","docId":"doc-1"}
```

```json
{"account":"cliente-a","docId":"doc-22"}
```

```json
{"account":"homologacao","docId":"doc-33"}
```

Essa ferramenta não é uma cópia de segurança do texto. Use
`clickupfy_doc_pages_list` para ler muitas páginas ou `clickupfy_doc_page_get`
para ler uma página conhecida.

### `clickupfy_doc_pages_list`

Lista páginas de um Doc com conteúdo. `maxPageDepth` limita o retorno de
subpáginas. `contentFormat` aceita a forma usada pela API, normalmente
`text/md` ou `text/plain`; quando omitido, a API usa `text/md`.

| Campo | Tipo | Obrigatório | Uso |
| --- | --- | --- | --- |
| `account` | string | não | Perfil a resolver. |
| `docId` | string | sim | Doc cujas páginas serão lidas. |
| `maxPageDepth` | inteiro | não | Profundidade máxima de subpáginas. |
| `contentFormat` | string | não | Forma do conteúdo, como `text/md`. |

Exemplos:

```json
{"docId":"doc-1"}
```

```json
{"docId":"doc-1","maxPageDepth":1}
```

```json
{"docId":"doc-1","maxPageDepth":3}
```

```json
{"docId":"doc-1","contentFormat":"text/plain"}
```

```json
{"account":"produto","docId":"doc-1","contentFormat":"text/md"}
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
{"docId":"doc-1","pageId":"page-1"}
```

```json
{"docId":"doc-1","pageId":"page-1","contentFormat":"text/plain"}
```

```json
{"docId":"doc-1","pageId":"page-2","contentFormat":"text/md"}
```

```json
{"account":"produto","docId":"doc-1","pageId":"page-1"}
```

```json
{"account":"cliente-a","docId":"doc-22","pageId":"page-8"}
```

## Escrita de Docs

As três ferramentas seguintes não aparecem em read-only. A API pública usada
pelo ClickUpfy não expõe ferramentas para excluir Docs ou páginas, mudar
permissões de um Doc existente ou reordenar a árvore depois da criação.

### `clickupfy_doc_create`

Cria Doc no workspace. `name` é obrigatório. Quando `parentId` é informado,
`parentType` também é obrigatório. `visibility` pode ser `PRIVATE` ou `PUBLIC`;
`createPage` cria uma página em branco junto do Doc.

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
{"name":"Notas da List","parentId":"3001","parentType":6}
```

```json
{"name":"Documento interno","parentId":"2001","parentType":5,"visibility":"PRIVATE"}
```

```json
{"account":"produto","name":"Plano de release","parentId":"86abc123","parentType":12,"createPage":true}
```

Chame `clickupfy_doc_get` depois da criação e use o ID devolvido para criar as
páginas. Quando houver `parentId` sem `parentType`, o servidor recusa a chamada
antes de tocar na API.

### `clickupfy_doc_page_create`

Cria página ou subpágina em um Doc. `name` é obrigatório. `parentPageId` define
o pai; `orderindex` indica a posição entre páginas irmãs. O conteúdo e o
subtítulo são opcionais.

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
{"docId":"doc-1","name":"Introdução"}
```

```json
{"docId":"doc-1","name":"Autenticação","content":"Use uma API key pessoal."}
```

```json
{"docId":"doc-1","name":"Detalhes","subTitle":"Campos e respostas","content":"## Parâmetros"}
```

```json
{"docId":"doc-1","name":"Erros","parentPageId":"page-1","orderindex":2}
```

```json
{"account":"produto","docId":"doc-1","name":"Integração","content":"# MCP","contentFormat":"text/md"}
```

### `clickupfy_doc_page_update`

Atualiza título, subtítulo e/ou conteúdo. O schema recusa chamada sem campo de
alteração. `contentEditMode` aceita `replace`, `append` ou `prepend`; o padrão é
`replace`. O modo afeta somente `content` e não o título ou subtítulo.

| Campo | Tipo | Obrigatório | Uso |
| --- | --- | --- | --- |
| `account`, `docId`, `pageId` | string | Doc e página sim | Recurso a alterar. |
| `name`, `subTitle`, `content` | string | ao menos um | Campos a persistir. |
| `contentEditMode` | enum | não | `replace`, `append` ou `prepend`. |
| `contentFormat` | string | não | Forma do conteúdo. |

Exemplos:

```json
{"docId":"doc-1","pageId":"page-1","name":"Visão geral"}
```

```json
{"docId":"doc-1","pageId":"page-1","subTitle":"Instalação e configuração"}
```

```json
{"docId":"doc-1","pageId":"page-1","content":"# Novo conteúdo"}
```

```json
{"docId":"doc-1","pageId":"page-1","content":"\n## Changelog","contentEditMode":"append"}
```

```json
{"account":"produto","docId":"doc-1","pageId":"page-2","content":"# Aviso\n\n","contentEditMode":"prepend","contentFormat":"text/md"}
```

Leia a página com `clickupfy_doc_page_get` após atualizar. Não envie um objeto
vazio para testar a conexão: use uma das ferramentas de leitura, pois uma
atualização sem conteúdo é recusada.

## Administração condicionada ao servidor

### `clickupfy_account_use`

Define o perfil ativo local. Só aparece quando `mcp serve` não recebeu
`--account` e o servidor não está em read-only. É a equivalência MCP de
`clickupfy account use`; em projetos isolados, prefira fixar o perfil na
configuração do processo para evitar troca global durante o trabalho.

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

O retorno informa `activeAccount`. Esta ação muda a configuração da máquina,
logo não deve ser usada para uma consulta pontual de outro perfil.

### `clickupfy_workspace_use`

Associa workspace autorizado ao perfil. Só aparece quando o processo não fixou
`--account` nem `--workspace` e tem escrita. O servidor confere a autorização
contra a API antes de salvar a associação no perfil local.

| Campo | Tipo | Obrigatório | Uso |
| --- | --- | --- | --- |
| `account` | string | não | Perfil a alterar quando omitido usa o ativo. |
| `workspaceId` | string | sim | Workspace autorizado para o perfil. |

Exemplos:

```json
{"workspaceId":"123456"}
```

```json
{"account":"produto","workspaceId":"123456"}
```

```json
{"account":"cliente-a","workspaceId":"987654"}
```

```json
{"account":"homologacao","workspaceId":"246810"}
```

```json
{"account":"suporte","workspaceId":"135791"}
```

Use `clickupfy_workspaces_list` para descobrir um ID autorizado. Uma tentativa
com workspace ausente da lista é recusada e não altera a associação existente.
