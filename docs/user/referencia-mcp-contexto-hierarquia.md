# Referência MCP: contexto, perfis e hierarquia

## Classificação

| Campo | Valor |
| --- | --- |
| Natureza | referência |
| Escopo | ferramentas MCP de identificação do projeto, perfis e navegação na hierarquia do ClickUp |
| Autoridade | schemas e handlers de `src/mcp.ts` |

Este capítulo registra as ferramentas de leitura que permitem descobrir o
destino do servidor MCP sem alterar o ClickUp. Cada exemplo representa os
argumentos enviados em uma chamada de ferramenta. O cliente MCP é responsável
por transportar esse objeto; não execute esses blocos diretamente no shell.

O servidor pode fixar `account`, `workspaceId`, `spaceId`, `folderId` e
`listId` quando é iniciado. Quando um ID fixado recebe um valor diferente, a
chamada é recusada. O campo `account` é opcional nas ferramentas que o aceitam,
mas também será recusado se divergir do perfil fixado. Nenhuma ferramenta deste
capítulo devolve a API key.

## Ferramentas de identificação

### `clickupfy_mcp_context`

Mostra o perfil resolvido, o workspace associado e a hierarquia fixada pelo
processo MCP. Execute-a como primeira chamada de um agente: ela informa quais
IDs podem ser omitidos nas ferramentas seguintes e se o projeto tem
`sprintFolderId`. O único argumento aceito é `account`, opcional.

| Campo | Tipo | Obrigatório | Efeito |
| --- | --- | --- | --- |
| `account` | string | não | Perfil a resolver quando o processo não o fixou. |

Exemplos:

```json
{}
```

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

Uma chamada sem argumento não seleciona outro perfil: ela usa o perfil fixado
ou o perfil ativo do arquivo local. Guarde os valores de `scope` durante a
sessão. O campo `listId` sempre existe porque `mcp serve --list` é obrigatório.

### `clickupfy_accounts_list`

Lista todos os perfis configurados na máquina, com nome, usuário, workspace e
marca do perfil ativo. Ela não recebe argumentos e não faz requisição à API do
ClickUp. Use-a para localizar o identificador de um perfil, nunca para obter
uma credencial.

Exemplos:

```json
{}
```

```json
{}
```

```json
{}
```

```json
{}
```

```json
{}
```

Os cinco exemplos são idênticos porque a ferramenta não possui parâmetro. Em
um cliente com chamada nomeada, a variação fica no nome da ferramenta, não nos
argumentos: `clickupfy_accounts_list` sempre recebe o objeto vazio. Esse fato é
importante para agentes: não invente filtros como `workspace`, `query` ou
`includeArchived`, pois o schema os rejeita.

### `clickupfy_whoami`

Valida o perfil escolhido na API do ClickUp e retorna o usuário autenticado,
além do workspace associado ao perfil. É a confirmação remota para uma chave
que pode ter sido revogada ou cujas permissões acabaram de mudar.

| Campo | Tipo | Obrigatório | Efeito |
| --- | --- | --- | --- |
| `account` | string | não | Perfil que será autenticado. |

Exemplos:

```json
{}
```

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

Quando `account` for omitido, o mesmo resolvedor usado por
`clickupfy_mcp_context` escolhe o perfil. Uma resposta bem-sucedida prova que a
chave funciona naquele momento; não prova permissão para uma List específica.
Consulte `clickupfy_mcp_context` e `clickupfy_list_get` para conferir o destino
do projeto e os status permitidos.

### `clickupfy_workspaces_list`

Lista os workspaces autorizados pela API key do perfil. Ela não recebe ID de
workspace porque consulta todos os workspaces acessíveis e o servidor usa o
perfil para autenticar a chamada.

| Campo | Tipo | Obrigatório | Efeito |
| --- | --- | --- | --- |
| `account` | string | não | Perfil cuja chave será usada na consulta. |

Exemplos:

```json
{}
```

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

Essa ferramenta apenas lê os workspaces. Para alterar a associação do perfil,
`clickupfy_workspace_use` só fica disponível quando o servidor tem escrita e
não foi iniciado com `--account` nem `--workspace`. O valor retornado aqui deve
ser usado literalmente nessa ferramenta de escrita ou no CLI.

## Ferramentas de navegação

### `clickupfy_spaces_list`

Lista Spaces do workspace associado ao perfil. A ferramenta usa o workspace do
perfil ou o que foi fixado no processo. `archived` é opcional e, quando
verdadeiro, acrescenta Spaces arquivados.

| Campo | Tipo | Obrigatório | Efeito |
| --- | --- | --- | --- |
| `account` | string | não | Perfil usado para a consulta. |
| `archived` | booleano | não | Inclui Spaces arquivados quando vale `true`. |

Exemplos:

```json
{}
```

```json
{"archived":true}
```

```json
{"account":"produto"}
```

```json
{"account":"produto","archived":true}
```

```json
{"account":"cliente-a","archived":false}
```

O valor `false` é diferente de omitir o campo apenas para deixar a intenção
explícita no registro do agente; os dois retornam somente recursos ativos.
Escolha um `id` da resposta para chamar `clickupfy_folders_list` ou
`clickupfy_lists_list`.

### `clickupfy_folders_list`

Lista Folders de um Space. Quando o servidor foi iniciado com `--space`, omita
`spaceId` para usar o valor fixado. Quando não há Space fixo, o campo é
necessário. Um ID diferente do fixado é recusado para preservar o isolamento do
projeto.

| Campo | Tipo | Obrigatório | Efeito |
| --- | --- | --- | --- |
| `account` | string | não | Perfil usado para a consulta. |
| `spaceId` | string | condicional | Space a consultar; obrigatório sem Space fixo. |
| `archived` | booleano | não | Inclui Folders arquivados. |

Exemplos:

```json
{}
```

```json
{"spaceId":"1001"}
```

```json
{"spaceId":"1001","archived":true}
```

```json
{"account":"produto","spaceId":"1001"}
```

```json
{"account":"cliente-a","spaceId":"2001","archived":false}
```

O primeiro exemplo só funciona quando o processo MCP já recebeu `--space`.
Uma resposta vazia pode significar que o Space guarda Lists diretamente; ela
não autoriza assumir que o projeto não tem Lists. Nesse caso, consulte
`clickupfy_lists_list` com `spaceId`.

### `clickupfy_lists_list`

Lista Lists de um Folder ou Lists criadas diretamente em um Space. O servidor
resolve `folderId` e `spaceId` contra os IDs fixados. Quando um Folder é
resolvido, ele tem precedência e o Space não é enviado à API. Sem Folder e sem
Space, a ferramenta recusa a chamada porque não há nível da hierarquia para
consultar.

| Campo | Tipo | Obrigatório | Efeito |
| --- | --- | --- | --- |
| `account` | string | não | Perfil usado para a consulta. |
| `folderId` | string | condicional | Folder que contém as Lists. |
| `spaceId` | string | condicional | Space usado quando as Lists não pertencem a Folder. |
| `archived` | booleano | não | Inclui Lists arquivadas. |

Exemplos:

```json
{}
```

```json
{"folderId":"2001"}
```

```json
{"folderId":"2001","archived":true}
```

```json
{"spaceId":"1001"}
```

```json
{"account":"produto","spaceId":"1001","archived":false}
```

A primeira chamada exige que o processo tenha iniciado com `--folder` ou
`--space`. Não passe IDs de ambos os níveis para tentar ampliar a resposta. A
separação permite que o agente descubra a hierarquia sem atravessar o destino
do projeto.

### `clickupfy_list_get`

Obtém os metadados de uma List e os status aceitos por suas tarefas. A List
fixada no processo é a escolha normal: omita `listId` para usá-la. Só informe o
campo em um MCP sem List fixa, situação que não ocorre no comando público
`mcp serve`, ou para repetir exatamente o ID fixado.

| Campo | Tipo | Obrigatório | Efeito |
| --- | --- | --- | --- |
| `account` | string | não | Perfil usado para a consulta. |
| `listId` | string | não no MCP do projeto | List a obter; omita para usar a List fixada. |

Exemplos:

```json
{}
```

```json
{"listId":"3001"}
```

```json
{"account":"produto"}
```

```json
{"account":"produto","listId":"3001"}
```

```json
{"account":"cliente-a","listId":"4001"}
```

Leia os nomes dos status retornados antes de chamar uma ferramenta que crie ou
atualize tarefa. `status` não é um conjunto global do ClickUp: uma grafia como
`em revisão` pode existir em uma List e ser recusada em outra. Esta ferramenta
não altera o status de nenhuma tarefa.
