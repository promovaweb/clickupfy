# API pública do ClickUp pelo CLI e MCP

O ClickUpfy expõe as 173 operações das especificações oficiais consultadas:
138 da v2 e 35 da v3. Cada operação tem um comando próprio em `clickupfy api`
e uma ferramenta com prefixo `clickupfy_api_`. Os atalhos existentes, como
`task get`, `tag list` e `doc create`, continuam disponíveis.

A cobertura se refere aos endpoints presentes nos arquivos oficiais versionados
em `api/v2.json` e `api/v3.json`. Ela não inclui APIs privadas da interface do
ClickUp nem garante acesso a recursos que dependem do seu plano ou das
permissões da API key. Os testes exercitam transporte e contratos com respostas
simuladas; não executam as 173 operações em um Workspace real.

## Descoberta e execução

Use o catálogo para encontrar o identificador de uma operação e consulte seu
schema antes de preencher os parâmetros. A [referência por endpoint](REFERENCE.md)
relaciona os comandos e as ferramentas MCP, com cinco exemplos por interface.

```bash
clickupfy api list
clickupfy api list --group Tags
clickupfy api list --read-only
clickupfy api describe v2-get-space-tags
clickupfy api describe CreateTask
```

Cada chamada recebe um envelope com `path`, `query`, `body` e, quando aplicável,
`files` e `contentType`. Os nomes dos parâmetros seguem a especificação,
inclusive `team_id`, `team_Id` e `workspace_id`. `path` contém os valores que
substituem os segmentos entre chaves; você não informa uma URL arbitrária.

```bash
clickupfy --json api v2-get-space-tags --path '{"space_id":"123"}'
clickupfy api v2-create-space-tag --path '{"space_id":"123"}' \
  --body '{"tag":{"name":"bug","tag_fg":"#ffffff","tag_bg":"#cc0000"}}'
clickupfy api v2-get-tasks --path '{"list_id":"456"}' \
  --query '{"tags":["bug"],"include_closed":true,"page":0}'
clickupfy api v3-search-docs-public --path '{"workspace_id":"123"}' \
  --query '{"limit":10}'
clickupfy api v2-delete-task --path '{"task_id":"tarefa-1"}' --yes
```

As respostas são impressas como JSON, inclusive sem `--json`. Respostas vazias
viram `{}`. A chamada trata uma página por vez: use os campos `page`, `cursor`
ou os outros parâmetros indicados pelo endpoint para continuar a consulta.
Não há retentativa automática de escrita; uma falha de rede não dispara uma
segunda criação ou exclusão.

## Entradas do CLI

| Opção | Tipo | Obrigatória | Comportamento |
| --- | --- | --- | --- |
| `--path <json>` | objeto JSON | conforme o endpoint | Preenche os segmentos do caminho. |
| `--query <json>` | objeto JSON | conforme o endpoint | Envia filtros e paginação. |
| `--body <json>` | JSON | conforme o endpoint | Envia o corpo na estrutura documentada. |
| `--body-file <arquivo>` | caminho local | não | Lê o corpo de um arquivo JSON; não pode acompanhar `--body`. |
| `--input <arquivo>` | caminho local ou `-` | não | Lê o envelope inteiro de um arquivo ou do stdin. |
| `--content-type <tipo>` | string | não | Usa um dos formatos aceitos pelo endpoint; JSON tem preferência. |
| `--file <campo=caminho>` | string repetível | uploads | Envia o arquivo pelo campo multipart indicado. |
| `--yes` | boolean | chamadas DELETE | Preenche `confirm: true`; não aparece nas outras requisições. |
| `--dry-run` | boolean | não | Valida a entrada local sem autenticar ou chamar a API. |
| `--account <perfil>` | string | não | Usa o perfil ativo quando omitido. |
| `--json` | boolean | não | Compatível com a saída JSON padrão dos comandos `api`. |

Para combinar `--input` com opções individuais, forneça cada campo em um único
lugar. O CLI recusa campos duplicados. Cabeçalhos adicionais só são aceitos
quando previstos na especificação; o perfil fornece o header `Authorization`.
O transporte define o `Content-Type` e o boundary de uploads.

Você pode guardar um corpo maior em arquivo e validar antes de executar:

```bash
clickupfy api v2-create-task --path '{"list_id":"456"}' --body-file tarefa.json --dry-run
clickupfy api v2-create-task --path '{"list_id":"456"}' --body-file tarefa.json
clickupfy api v2-get-task --input consulta.json
printf '%s' '{"path":{"task_id":"tarefa-1"}}' | clickupfy api v2-get-task --input -
clickupfy --account produto api v2-get-task --input consulta.json > resposta.json
```

## Uploads e OAuth

Uploads usam multipart real e aceitam múltiplos arquivos. O CLI lê somente os
caminhos fornecidos em `--file`. O nome do campo é explícito porque as versões
da API podem exigir nomes diferentes; na v2, use `attachment[0]`,
`attachment[1]` e assim por diante. A especificação v3 não declara o campo
binário, por isso ele permanece configurável e deve ser conferido no endpoint.

```bash
clickupfy api v2-create-task-attachment --path '{"task_id":"tarefa-1"}' \
  --file 'attachment[0]=./relatorio.pdf'
clickupfy api v2-create-task-attachment --path '{"task_id":"tarefa-1"}' \
  --file 'attachment[0]=./antes.png' --file 'attachment[1]=./depois.png'
```

`GetAccessToken` é a exceção de autenticação: recebe `client_id`,
`client_secret` e `code` no corpo e não exige perfil local. Use um arquivo ou o
stdin para evitar colocar o segredo diretamente na linha de comando. O token
retornado não é salvo automaticamente na configuração.

```bash
clickupfy api v2-get-access-token --body-file oauth.json
```

## Ferramentas MCP

Todas as operações são anunciadas individualmente em `tools/list`. Os schemas
incluem os parâmetros de caminho, filtros, corpo e campos aninhados. A chamada
abaixo consulta tags pelo protocolo MCP:

```json
{
  "name": "clickupfy_api_v2_get_space_tags",
  "arguments": {"path":{"space_id":"123"}}
}
```

`account` é opcional e respeita o perfil fixado pelo servidor. IDs de workspace,
Space, Folder e List declarados em `path` ou `query` são comparados com a
configuração do MCP. Endpoints que recebem somente um ID de tarefa, Doc,
comentário ou outro objeto continuam sujeitos às permissões da API key; o
cliente não consulta toda a hierarquia para comprovar a filiação desse objeto.
A configuração de projeto não substitui as permissões do ClickUp.

No modo `--read-only`, ferramentas de escrita não são registradas. A consulta
`queryAuditLog` permanece disponível porque usa POST para pesquisar registros,
sem alterá-los. Chamadas DELETE exigem `confirm: true` no envelope.

```json
{
  "name": "clickupfy_api_v2_delete_task",
  "arguments": {"path":{"task_id":"tarefa-1"},"confirm":true}
}
```

Para uploads, envie `files` com `field`, `filename`, `contentBase64` e
`contentType` opcional. O MCP não lê caminhos locais para construir anexos.
As respostas chegam como JSON no campo textual `content`; falhas retornam
`isError: true` e a mensagem correspondente.

```json
{
  "name":"clickupfy_api_v2_create_task_attachment",
  "arguments":{
    "path":{"task_id":"tarefa-1"},
    "files":[{"field":"attachment[0]","filename":"teste.txt","contentBase64":"dGVzdGU=","contentType":"text/plain"}]
  }
}
```

## Atualização e validação do catálogo

Os arquivos de origem vêm da [especificação oficial](https://developer.clickup.com/docs/open-api-spec).
O catálogo gerado inclui o SHA-256 de cada arquivo. O gerador resolve referências
locais, combina parâmetros do caminho com os da operação e recusa colisões de
nomes. A referência técnica é gerada junto com o catálogo executável.

```bash
npm run api:generate
npm run api:check
npm run api:upstream:check
npm run api:update
npm run validar
```

`api:generate` e `api:update` escrevem o catálogo e a referência.
`api:check` compara os arquivos gerados com as fontes locais sem gravar.
`api:upstream:check` consulta as duas URLs oficiais e informa se mudaram;
`api:update` baixa as especificações atuais. Revise as alterações e execute
`validar` antes de disponibilizar uma atualização.

O arquivo `api/overrides.json` registra duas diferenças já tratadas: filtros
`custom_fields` aceitam os objetos mostrados nos exemplos oficiais, e datas de
`UpdateTask` aceitam `null`, como o comando existente `task update`.
A especificação original permanece preservada. Na edição de tags, o schema
oficial usa `fg_color` e `bg_color`; criação e exclusão usam `tag_fg` e `tag_bg`.

A suíte compara cada par método/caminho com as duas especificações, executa os
173 endpoints com transporte simulado e verifica a descoberta e execução pelo
MCP. Também cobre autenticação, uploads, filtros, corpos DELETE, validação de
entrada, escopo fixado e ausência de ferramentas mutáveis no modo somente leitura.
