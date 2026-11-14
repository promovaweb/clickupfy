# Referência MCP: contexto, perfis e hierarquia

## Classificação

| Campo | Valor |
| --- | --- |
| Natureza | referência |
| Escopo | ferramentas MCP de identificação do projeto, perfis e navegação na hierarquia do ClickUp |
| Autoridade | `src/operations/mcp.ts`, `src/clickup/accounts.ts`, `src/clickup/hierarchy.ts`, `src/clickup/scope.ts` e os schemas registrados em `src/mcp/server.ts` |

Este capítulo registra as ferramentas de leitura que permitem descobrir o
destino do servidor MCP sem alterar o ClickUp. Cada exemplo representa os
argumentos enviados em uma chamada de ferramenta. O cliente MCP é responsável
por transportar esse objeto; não execute esses blocos diretamente no shell.

O servidor pode fixar `account`, `workspace`, `space`, `folder`, `list` e
`sprint-folder` quando é iniciado, com `clickupfy mcp` ou com
`clickupfy mcp serve`. Os IDs fixados valem como padrão das ferramentas e um
valor diferente é recusado com `isError`. O campo `account` é opcional nas
ferramentas que o aceitam, mas também será recusado se divergir do perfil
fixado. Nenhuma ferramenta deste capítulo devolve a API key.

As listas voltam dentro de um objeto, como `{ "spaces": [] }`, igual ao CLI com
`--json`. Uma falha esperada retorna `isError: true`, a mensagem e o exit code
equivalente do CLI. Ferramentas de escrita não são registradas quando o servidor
inicia com `--read-only`.

## Ferramentas de identificação

### `clickupfy_mcp_context`

Mostra o perfil resolvido, o workspace associado e a hierarquia fixada pelo
processo MCP. Execute-a como primeira chamada de um agente: ela informa quais IDs
podem ser omitidos nas ferramentas seguintes, se o servidor é somente leitura e
se o projeto tem Sprint Folder fixado.

O `data` traz `{ account, workspace, readOnly, scope }`. O `scope` reúne os IDs
fixados. O único argumento aceito é `account`, opcional.

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

Uma chamada sem argumento não seleciona outro perfil: ela usa o perfil fixado ou
o perfil ativo do `accounts.json`. Guarde os valores de `scope` durante a sessão,
porque eles explicam por que uma ferramenta exige ou recusa um ID. Em um servidor
fixado, passar outro perfil retorna `isError` e não troca o destino.

### `clickupfy_accounts_list`

Lista os perfis configurados na máquina, com nome, usuário, workspace e marca do
perfil ativo. Ela não recebe argumentos e não faz requisição à API do ClickUp.
Use-a para localizar o identificador de um perfil, já que ela não devolve
credenciais. O retorno é `{ accounts: [] }`, sem API keys.

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

Os cinco exemplos são idênticos porque a ferramenta não possui parâmetro. Em um
cliente com chamada nomeada, a variação fica no nome da ferramenta, não nos
argumentos. Esse fato é importante para agentes: não invente filtros como
`workspace`, `query` ou `includeArchived`, pois o schema os rejeita. Como a
ferramenta não recebe `account`, ela lê o arquivo local da máquina onde o
servidor roda.

### `clickupfy_whoami`

Valida o perfil escolhido na API do ClickUp e retorna o usuário autenticado, além
do workspace associado ao perfil. É a confirmação remota para uma chave que pode
ter sido revogada ou cujas permissões acabaram de mudar. O retorno é
`{ account, workspace, user }`.

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
do projeto e os status permitidos. Chave ausente no cofre retorna `isError` com o
exit code `4`; chave recusada pela API retorna `5`.

### `clickupfy_workspaces_list`

Lista os workspaces autorizados pela API key do perfil. Ela não recebe ID de
workspace porque consulta todos os workspaces acessíveis. O servidor usa o
perfil para autenticar a chamada. O retorno é `{ workspaces: [] }`.

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
`clickupfy_workspace_use` só fica disponível quando o servidor tem escrita e não
foi iniciado com `--account` nem `--workspace`. O valor retornado aqui deve ser
usado literalmente nessa ferramenta de escrita ou no CLI.

## Ferramentas de navegação

### `clickupfy_spaces_list`

Lista Spaces do workspace associado ao perfil. A ferramenta usa o workspace do
perfil ou o que foi fixado no processo. `archived` é opcional e, quando
verdadeiro, acrescenta Spaces arquivados. O retorno é `{ spaces: [] }`.

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
projeto. O retorno é `{ folders: [] }`.

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
{"spaceId":"90070363783"}
```

```json
{"spaceId":"90070363783","archived":true}
```

```json
{"account":"produto","spaceId":"90070363783"}
```

```json
{"account":"cliente-a","spaceId":"9007154145","archived":false}
```

O primeiro exemplo exige que o processo MCP já tenha recebido `--space`. Uma
resposta vazia pode significar que o Space guarda Lists diretamente; ela não
autoriza assumir que o projeto não tem Lists. Nesse caso, consulte
`clickupfy_lists_list` com `spaceId`.

### `clickupfy_lists_list`

Lista Lists de um Folder ou Lists criadas diretamente em um Space. O servidor
resolve `folderId` e `spaceId` contra os IDs fixados. Quando um Folder é
resolvido, ele tem precedência e o Space não é enviado à API. Sem Folder, sem
Space e sem valor fixado, a ferramenta recusa a chamada porque não há nível da
hierarquia para consultar. O retorno é `{ lists: [] }`.

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
{"spaceId":"90070363783"}
```

```json
{"account":"produto","spaceId":"90070363783","archived":false}
```

A primeira chamada exige que o processo tenha iniciado com `--folder` ou
`--space`. Não passe IDs de ambos os níveis para tentar ampliar a resposta: o
Folder prevalece. A separação permite que o agente descubra a hierarquia sem
atravessar o destino do projeto.

### `clickupfy_list_get`

Obtém os metadados de uma List e os status aceitos por suas tarefas. A List
fixada no processo é a escolha normal: omita `listId` para usá-la. Só informe o
campo em um servidor sem List fixa. O retorno é a List da API com `statuses[]`.

| Campo | Tipo | Obrigatório | Efeito |
| --- | --- | --- | --- |
| `account` | string | não | Perfil usado para a consulta. |
| `listId` | string | condicional | List a obter; omita para usar a List fixada. |

Exemplos:

```json
{}
```

```json
{"listId":"901328052926"}
```

```json
{"account":"produto"}
```

```json
{"account":"produto","listId":"901328052926"}
```

```json
{"account":"cliente-a","listId":"901328060001"}
```

Leia os nomes dos status retornados antes de chamar uma ferramenta que crie ou
atualize tarefa. `status` não é um conjunto global do ClickUp: uma grafia como
`in review` pode existir em uma List e ser recusada em outra. Esta ferramenta não
altera o status de nenhuma tarefa.
