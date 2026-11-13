# Referência de endpoints do ClickUp

Este arquivo é gerado por `npm run api:generate`. Os IDs dos exemplos são fictícios.
Cada seção corresponde a um endpoint das especificações oficiais v2 ou v3.
Consulte [o guia de uso](README.md) para autenticação, flags, uploads, paginação,
confirmações e limites de acesso. Os schemas integrais são consultados com `api describe`.

## Operações

### `clickupfy api v2-create-task-attachment`

A operação `CreateTaskAttachment` pertence ao grupo `Attachments` e usa
`POST /api/v2/task/{task_id}/attachment`.

A chamada altera o recurso indicado pelos parâmetros. Confira o resultado com a consulta correspondente antes de continuar.

A resposta preserva o JSON da API; respostas sem corpo retornam `{}`.
A API key do perfil precisa ter acesso ao recurso. As permissões e o plano do Workspace podem restringir o endpoint.
Os campos omitidos são tratados pelo servidor do ClickUp, sem padrões adicionais do cliente.

[Referência oficial](https://developer.clickup.com/reference/createtaskattachment).

| Entrada | Tipo | Obrigatória |
| --- | --- | --- |
| `path.task_id` | `string` | sim |
| `query.custom_task_ids` | `boolean` | não |
| `query.team_id` | `number` | não |
| `body` | objeto conforme `api describe` | sim |
| `files` | array de arquivos em base64 | sim |

O comando aceita as flags comuns de `api`: `--input`, `--path`, `--query`,
`--body`, `--body-file`, `--content-type`, `--file`, `--dry-run` e `--yes`.
A referência completa de tipos, campos aninhados e valores permitidos está no comando `describe` abaixo.

Exemplos:

Consulte o contrato antes de preencher os IDs reais:

```bash
clickupfy api describe v2-create-task-attachment
```

Valide uma entrada em arquivo sem enviar uma requisição:

```bash
clickupfy api v2-create-task-attachment --input entrada.json --dry-run
```

Use um envelope JSON pelo stdin:

```bash
printf '%s' '{"path":{"task_id":"exemplo-1"},"body":{},"files":[{"field":"attachment[0]","filename":"exemplo-1.txt","contentBase64":"dGVzdGU=","contentType":"text/plain"}]}' | clickupfy api v2-create-task-attachment --input -
```

Selecione o perfil que tem acesso ao recurso:

```bash
clickupfy --account produto api v2-create-task-attachment --input entrada.json
```

Grave a resposta JSON para conferência. O arquivo de entrada usa o envelope do exemplo anterior:

```bash
clickupfy --json api v2-create-task-attachment --input entrada.json > resposta.json
```

### `clickupfy_api_v2_create_task_attachment`

A operação `CreateTaskAttachment` pertence ao grupo `Attachments` e usa
`POST /api/v2/task/{task_id}/attachment`.

A chamada altera o recurso indicado pelos parâmetros. Confira o resultado com a consulta correspondente antes de continuar.

A resposta preserva o JSON da API; respostas sem corpo retornam `{}`.
A API key do perfil precisa ter acesso ao recurso. As permissões e o plano do Workspace podem restringir o endpoint.
Os campos omitidos são tratados pelo servidor do ClickUp, sem padrões adicionais do cliente.

[Referência oficial](https://developer.clickup.com/reference/createtaskattachment).

| Entrada | Tipo | Obrigatória |
| --- | --- | --- |
| `path.task_id` | `string` | sim |
| `query.custom_task_ids` | `boolean` | não |
| `query.team_id` | `number` | não |
| `body` | objeto conforme `api describe` | sim |
| `files` | array de arquivos em base64 | sim |

`account` é opcional e usa o perfil ativo ou fixado no MCP. O retorno aparece em
`content` como JSON; recusas retornam `isError: true`. Ferramentas de escrita
ficam ausentes em `--read-only`. IDs explícitos devem respeitar a hierarquia fixada.

Exemplos:

Use o perfil ativo com o envelope mínimo:

```json
{
  "name": "clickupfy_api_v2_create_task_attachment",
  "arguments": {
    "path": {
      "task_id": "exemplo-1"
    },
    "body": {},
    "files": [
      {
        "field": "attachment[0]",
        "filename": "exemplo-1.txt",
        "contentBase64": "dGVzdGU=",
        "contentType": "text/plain"
      }
    ]
  }
}
```

Direcione a chamada ao perfil de desenvolvimento:

```json
{
  "name": "clickupfy_api_v2_create_task_attachment",
  "arguments": {
    "path": {
      "task_id": "exemplo-1"
    },
    "body": {},
    "files": [
      {
        "field": "attachment[0]",
        "filename": "exemplo-1.txt",
        "contentBase64": "dGVzdGU=",
        "contentType": "text/plain"
      }
    ],
    "account": "dev"
  }
}
```

Use o perfil do produto, quando o MCP permitir selecionar outro perfil:

```json
{
  "name": "clickupfy_api_v2_create_task_attachment",
  "arguments": {
    "path": {
      "task_id": "exemplo-1"
    },
    "body": {},
    "files": [
      {
        "field": "attachment[0]",
        "filename": "exemplo-1.txt",
        "contentBase64": "dGVzdGU=",
        "contentType": "text/plain"
      }
    ],
    "account": "produto"
  }
}
```

Consulte o schema antes de compor uma chamada pelo agente:

```bash
clickupfy api describe clickupfy_api_v2_create_task_attachment
```

Reproduza pelo CLI a entrada usada pelo agente, sem executar a operação:

```bash
printf '%s' '{"path":{"task_id":"exemplo-1"},"body":{},"files":[{"field":"attachment[0]","filename":"exemplo-1.txt","contentBase64":"dGVzdGU=","contentType":"text/plain"}]}' | clickupfy api v2-create-task-attachment --input - --dry-run
```

### `clickupfy api v2-get-access-token`

A operação `GetAccessToken` pertence ao grupo `Authorization` e usa
`POST /api/v2/oauth/token`.

A chamada altera o recurso indicado pelos parâmetros. Confira o resultado com a consulta correspondente antes de continuar.

A resposta preserva o JSON da API; respostas sem corpo retornam `{}`.
Esta operação OAuth recebe as credenciais do aplicativo no corpo e não usa a API key do perfil.
Os campos omitidos são tratados pelo servidor do ClickUp, sem padrões adicionais do cliente.

[Referência oficial](https://developer.clickup.com/reference/getaccesstoken).

| Entrada | Tipo | Obrigatória |
| --- | --- | --- |
| `body` | objeto conforme `api describe` | sim |

O comando aceita as flags comuns de `api`: `--input`, `--path`, `--query`,
`--body`, `--body-file`, `--content-type`, `--file`, `--dry-run` e `--yes`.
A referência completa de tipos, campos aninhados e valores permitidos está no comando `describe` abaixo.

Exemplos:

Consulte o contrato antes de preencher os IDs reais:

```bash
clickupfy api describe v2-get-access-token
```

Valide uma entrada em arquivo sem enviar uma requisição:

```bash
clickupfy api v2-get-access-token --input entrada.json --dry-run
```

Use um envelope JSON pelo stdin:

```bash
printf '%s' '{"body":{"client_id":"exemplo-1","client_secret":"exemplo-1","code":"exemplo-1"}}' | clickupfy api v2-get-access-token --input -
```

Selecione o perfil que tem acesso ao recurso:

```bash
clickupfy --account produto api v2-get-access-token --input entrada.json
```

Grave a resposta JSON para conferência. O arquivo de entrada usa o envelope do exemplo anterior:

```bash
clickupfy --json api v2-get-access-token --input entrada.json > resposta.json
```

### `clickupfy_api_v2_get_access_token`

A operação `GetAccessToken` pertence ao grupo `Authorization` e usa
`POST /api/v2/oauth/token`.

A chamada altera o recurso indicado pelos parâmetros. Confira o resultado com a consulta correspondente antes de continuar.

A resposta preserva o JSON da API; respostas sem corpo retornam `{}`.
Esta operação OAuth recebe as credenciais do aplicativo no corpo e não usa a API key do perfil.
Os campos omitidos são tratados pelo servidor do ClickUp, sem padrões adicionais do cliente.

[Referência oficial](https://developer.clickup.com/reference/getaccesstoken).

| Entrada | Tipo | Obrigatória |
| --- | --- | --- |
| `body` | objeto conforme `api describe` | sim |

`account` é opcional e usa o perfil ativo ou fixado no MCP. O retorno aparece em
`content` como JSON; recusas retornam `isError: true`. Ferramentas de escrita
ficam ausentes em `--read-only`. IDs explícitos devem respeitar a hierarquia fixada.

Exemplos:

Use o perfil ativo com o envelope mínimo:

```json
{
  "name": "clickupfy_api_v2_get_access_token",
  "arguments": {
    "body": {
      "client_id": "exemplo-1",
      "client_secret": "exemplo-1",
      "code": "exemplo-1"
    }
  }
}
```

Direcione a chamada ao perfil de desenvolvimento:

```json
{
  "name": "clickupfy_api_v2_get_access_token",
  "arguments": {
    "body": {
      "client_id": "exemplo-1",
      "client_secret": "exemplo-1",
      "code": "exemplo-1"
    },
    "account": "dev"
  }
}
```

Use o perfil do produto, quando o MCP permitir selecionar outro perfil:

```json
{
  "name": "clickupfy_api_v2_get_access_token",
  "arguments": {
    "body": {
      "client_id": "exemplo-1",
      "client_secret": "exemplo-1",
      "code": "exemplo-1"
    },
    "account": "produto"
  }
}
```

Consulte o schema antes de compor uma chamada pelo agente:

```bash
clickupfy api describe clickupfy_api_v2_get_access_token
```

Reproduza pelo CLI a entrada usada pelo agente, sem executar a operação:

```bash
printf '%s' '{"body":{"client_id":"exemplo-1","client_secret":"exemplo-1","code":"exemplo-1"}}' | clickupfy api v2-get-access-token --input - --dry-run
```

### `clickupfy api v2-get-authorized-user`

A operação `GetAuthorizedUser` pertence ao grupo `Authorization` e usa
`GET /api/v2/user`.

A chamada consulta o recurso sem modificá-lo.

A resposta preserva o JSON da API; respostas sem corpo retornam `{}`.
A API key do perfil precisa ter acesso ao recurso. As permissões e o plano do Workspace podem restringir o endpoint.
Os campos omitidos são tratados pelo servidor do ClickUp, sem padrões adicionais do cliente.

[Referência oficial](https://developer.clickup.com/reference/getauthorizeduser).

Este endpoint não exige parâmetros de recurso.

O comando aceita as flags comuns de `api`: `--input`, `--path`, `--query`,
`--body`, `--body-file`, `--content-type`, `--file`, `--dry-run` e `--yes`.
A referência completa de tipos, campos aninhados e valores permitidos está no comando `describe` abaixo.

Exemplos:

Consulte o contrato antes de preencher os IDs reais:

```bash
clickupfy api describe v2-get-authorized-user
```

Valide uma entrada em arquivo sem enviar uma requisição:

```bash
clickupfy api v2-get-authorized-user --input entrada.json --dry-run
```

Use um envelope JSON pelo stdin:

```bash
printf '%s' '{}' | clickupfy api v2-get-authorized-user --input -
```

Selecione o perfil que tem acesso ao recurso:

```bash
clickupfy --account produto api v2-get-authorized-user --input entrada.json
```

Grave a resposta JSON para conferência. O arquivo de entrada usa o envelope do exemplo anterior:

```bash
clickupfy --json api v2-get-authorized-user --input entrada.json > resposta.json
```

### `clickupfy_api_v2_get_authorized_user`

A operação `GetAuthorizedUser` pertence ao grupo `Authorization` e usa
`GET /api/v2/user`.

A chamada consulta o recurso sem modificá-lo.

A resposta preserva o JSON da API; respostas sem corpo retornam `{}`.
A API key do perfil precisa ter acesso ao recurso. As permissões e o plano do Workspace podem restringir o endpoint.
Os campos omitidos são tratados pelo servidor do ClickUp, sem padrões adicionais do cliente.

[Referência oficial](https://developer.clickup.com/reference/getauthorizeduser).

Este endpoint não exige parâmetros de recurso.

`account` é opcional e usa o perfil ativo ou fixado no MCP. O retorno aparece em
`content` como JSON; recusas retornam `isError: true`. Ferramentas de escrita
ficam ausentes em `--read-only`. IDs explícitos devem respeitar a hierarquia fixada.

Exemplos:

Use o perfil ativo com o envelope mínimo:

```json
{
  "name": "clickupfy_api_v2_get_authorized_user",
  "arguments": {}
}
```

Direcione a chamada ao perfil de desenvolvimento:

```json
{
  "name": "clickupfy_api_v2_get_authorized_user",
  "arguments": {
    "account": "dev"
  }
}
```

Use o perfil do produto, quando o MCP permitir selecionar outro perfil:

```json
{
  "name": "clickupfy_api_v2_get_authorized_user",
  "arguments": {
    "account": "produto"
  }
}
```

Consulte o schema antes de compor uma chamada pelo agente:

```bash
clickupfy api describe clickupfy_api_v2_get_authorized_user
```

Reproduza pelo CLI a entrada usada pelo agente, sem executar a operação:

```bash
printf '%s' '{}' | clickupfy api v2-get-authorized-user --input - --dry-run
```

### `clickupfy api v2-get-authorized-teams`

A operação `GetAuthorizedTeams` pertence ao grupo `Workspaces` e usa
`GET /api/v2/team`.

A chamada consulta o recurso sem modificá-lo.

A resposta preserva o JSON da API; respostas sem corpo retornam `{}`.
A API key do perfil precisa ter acesso ao recurso. As permissões e o plano do Workspace podem restringir o endpoint.
Os campos omitidos são tratados pelo servidor do ClickUp, sem padrões adicionais do cliente.

[Referência oficial](https://developer.clickup.com/reference/getauthorizedteams).

Este endpoint não exige parâmetros de recurso.

O comando aceita as flags comuns de `api`: `--input`, `--path`, `--query`,
`--body`, `--body-file`, `--content-type`, `--file`, `--dry-run` e `--yes`.
A referência completa de tipos, campos aninhados e valores permitidos está no comando `describe` abaixo.

Exemplos:

Consulte o contrato antes de preencher os IDs reais:

```bash
clickupfy api describe v2-get-authorized-teams
```

Valide uma entrada em arquivo sem enviar uma requisição:

```bash
clickupfy api v2-get-authorized-teams --input entrada.json --dry-run
```

Use um envelope JSON pelo stdin:

```bash
printf '%s' '{}' | clickupfy api v2-get-authorized-teams --input -
```

Selecione o perfil que tem acesso ao recurso:

```bash
clickupfy --account produto api v2-get-authorized-teams --input entrada.json
```

Grave a resposta JSON para conferência. O arquivo de entrada usa o envelope do exemplo anterior:

```bash
clickupfy --json api v2-get-authorized-teams --input entrada.json > resposta.json
```

### `clickupfy_api_v2_get_authorized_teams`

A operação `GetAuthorizedTeams` pertence ao grupo `Workspaces` e usa
`GET /api/v2/team`.

A chamada consulta o recurso sem modificá-lo.

A resposta preserva o JSON da API; respostas sem corpo retornam `{}`.
A API key do perfil precisa ter acesso ao recurso. As permissões e o plano do Workspace podem restringir o endpoint.
Os campos omitidos são tratados pelo servidor do ClickUp, sem padrões adicionais do cliente.

[Referência oficial](https://developer.clickup.com/reference/getauthorizedteams).

Este endpoint não exige parâmetros de recurso.

`account` é opcional e usa o perfil ativo ou fixado no MCP. O retorno aparece em
`content` como JSON; recusas retornam `isError: true`. Ferramentas de escrita
ficam ausentes em `--read-only`. IDs explícitos devem respeitar a hierarquia fixada.

Exemplos:

Use o perfil ativo com o envelope mínimo:

```json
{
  "name": "clickupfy_api_v2_get_authorized_teams",
  "arguments": {}
}
```

Direcione a chamada ao perfil de desenvolvimento:

```json
{
  "name": "clickupfy_api_v2_get_authorized_teams",
  "arguments": {
    "account": "dev"
  }
}
```

Use o perfil do produto, quando o MCP permitir selecionar outro perfil:

```json
{
  "name": "clickupfy_api_v2_get_authorized_teams",
  "arguments": {
    "account": "produto"
  }
}
```

Consulte o schema antes de compor uma chamada pelo agente:

```bash
clickupfy api describe clickupfy_api_v2_get_authorized_teams
```

Reproduza pelo CLI a entrada usada pelo agente, sem executar a operação:

```bash
printf '%s' '{}' | clickupfy api v2-get-authorized-teams --input - --dry-run
```

### `clickupfy api v2-create-checklist`

A operação `CreateChecklist` pertence ao grupo `Task Checklists` e usa
`POST /api/v2/task/{task_id}/checklist`.

A chamada altera o recurso indicado pelos parâmetros. Confira o resultado com a consulta correspondente antes de continuar.

A resposta preserva o JSON da API; respostas sem corpo retornam `{}`.
A API key do perfil precisa ter acesso ao recurso. As permissões e o plano do Workspace podem restringir o endpoint.
Os campos omitidos são tratados pelo servidor do ClickUp, sem padrões adicionais do cliente.

[Referência oficial](https://developer.clickup.com/reference/createchecklist).

| Entrada | Tipo | Obrigatória |
| --- | --- | --- |
| `path.task_id` | `string` | sim |
| `query.custom_task_ids` | `boolean` | não |
| `query.team_id` | `number` | não |
| `body` | objeto conforme `api describe` | sim |

O comando aceita as flags comuns de `api`: `--input`, `--path`, `--query`,
`--body`, `--body-file`, `--content-type`, `--file`, `--dry-run` e `--yes`.
A referência completa de tipos, campos aninhados e valores permitidos está no comando `describe` abaixo.

Exemplos:

Consulte o contrato antes de preencher os IDs reais:

```bash
clickupfy api describe v2-create-checklist
```

Valide uma entrada em arquivo sem enviar uma requisição:

```bash
clickupfy api v2-create-checklist --input entrada.json --dry-run
```

Use um envelope JSON pelo stdin:

```bash
printf '%s' '{"path":{"task_id":"exemplo-1"},"body":{"name":"exemplo-1"}}' | clickupfy api v2-create-checklist --input -
```

Selecione o perfil que tem acesso ao recurso:

```bash
clickupfy --account produto api v2-create-checklist --input entrada.json
```

Grave a resposta JSON para conferência. O arquivo de entrada usa o envelope do exemplo anterior:

```bash
clickupfy --json api v2-create-checklist --input entrada.json > resposta.json
```

### `clickupfy_api_v2_create_checklist`

A operação `CreateChecklist` pertence ao grupo `Task Checklists` e usa
`POST /api/v2/task/{task_id}/checklist`.

A chamada altera o recurso indicado pelos parâmetros. Confira o resultado com a consulta correspondente antes de continuar.

A resposta preserva o JSON da API; respostas sem corpo retornam `{}`.
A API key do perfil precisa ter acesso ao recurso. As permissões e o plano do Workspace podem restringir o endpoint.
Os campos omitidos são tratados pelo servidor do ClickUp, sem padrões adicionais do cliente.

[Referência oficial](https://developer.clickup.com/reference/createchecklist).

| Entrada | Tipo | Obrigatória |
| --- | --- | --- |
| `path.task_id` | `string` | sim |
| `query.custom_task_ids` | `boolean` | não |
| `query.team_id` | `number` | não |
| `body` | objeto conforme `api describe` | sim |

`account` é opcional e usa o perfil ativo ou fixado no MCP. O retorno aparece em
`content` como JSON; recusas retornam `isError: true`. Ferramentas de escrita
ficam ausentes em `--read-only`. IDs explícitos devem respeitar a hierarquia fixada.

Exemplos:

Use o perfil ativo com o envelope mínimo:

```json
{
  "name": "clickupfy_api_v2_create_checklist",
  "arguments": {
    "path": {
      "task_id": "exemplo-1"
    },
    "body": {
      "name": "exemplo-1"
    }
  }
}
```

Direcione a chamada ao perfil de desenvolvimento:

```json
{
  "name": "clickupfy_api_v2_create_checklist",
  "arguments": {
    "path": {
      "task_id": "exemplo-1"
    },
    "body": {
      "name": "exemplo-1"
    },
    "account": "dev"
  }
}
```

Use o perfil do produto, quando o MCP permitir selecionar outro perfil:

```json
{
  "name": "clickupfy_api_v2_create_checklist",
  "arguments": {
    "path": {
      "task_id": "exemplo-1"
    },
    "body": {
      "name": "exemplo-1"
    },
    "account": "produto"
  }
}
```

Consulte o schema antes de compor uma chamada pelo agente:

```bash
clickupfy api describe clickupfy_api_v2_create_checklist
```

Reproduza pelo CLI a entrada usada pelo agente, sem executar a operação:

```bash
printf '%s' '{"path":{"task_id":"exemplo-1"},"body":{"name":"exemplo-1"}}' | clickupfy api v2-create-checklist --input - --dry-run
```

### `clickupfy api v2-edit-checklist`

A operação `EditChecklist` pertence ao grupo `Task Checklists` e usa
`PUT /api/v2/checklist/{checklist_id}`.

A chamada altera o recurso indicado pelos parâmetros. Confira o resultado com a consulta correspondente antes de continuar.

A resposta preserva o JSON da API; respostas sem corpo retornam `{}`.
A API key do perfil precisa ter acesso ao recurso. As permissões e o plano do Workspace podem restringir o endpoint.
Os campos omitidos são tratados pelo servidor do ClickUp, sem padrões adicionais do cliente.

[Referência oficial](https://developer.clickup.com/reference/editchecklist).

| Entrada | Tipo | Obrigatória |
| --- | --- | --- |
| `path.checklist_id` | `string` | sim |
| `body` | objeto conforme `api describe` | sim |

O comando aceita as flags comuns de `api`: `--input`, `--path`, `--query`,
`--body`, `--body-file`, `--content-type`, `--file`, `--dry-run` e `--yes`.
A referência completa de tipos, campos aninhados e valores permitidos está no comando `describe` abaixo.

Exemplos:

Consulte o contrato antes de preencher os IDs reais:

```bash
clickupfy api describe v2-edit-checklist
```

Valide uma entrada em arquivo sem enviar uma requisição:

```bash
clickupfy api v2-edit-checklist --input entrada.json --dry-run
```

Use um envelope JSON pelo stdin:

```bash
printf '%s' '{"path":{"checklist_id":"exemplo-1"},"body":{}}' | clickupfy api v2-edit-checklist --input -
```

Selecione o perfil que tem acesso ao recurso:

```bash
clickupfy --account produto api v2-edit-checklist --input entrada.json
```

Grave a resposta JSON para conferência. O arquivo de entrada usa o envelope do exemplo anterior:

```bash
clickupfy --json api v2-edit-checklist --input entrada.json > resposta.json
```

### `clickupfy_api_v2_edit_checklist`

A operação `EditChecklist` pertence ao grupo `Task Checklists` e usa
`PUT /api/v2/checklist/{checklist_id}`.

A chamada altera o recurso indicado pelos parâmetros. Confira o resultado com a consulta correspondente antes de continuar.

A resposta preserva o JSON da API; respostas sem corpo retornam `{}`.
A API key do perfil precisa ter acesso ao recurso. As permissões e o plano do Workspace podem restringir o endpoint.
Os campos omitidos são tratados pelo servidor do ClickUp, sem padrões adicionais do cliente.

[Referência oficial](https://developer.clickup.com/reference/editchecklist).

| Entrada | Tipo | Obrigatória |
| --- | --- | --- |
| `path.checklist_id` | `string` | sim |
| `body` | objeto conforme `api describe` | sim |

`account` é opcional e usa o perfil ativo ou fixado no MCP. O retorno aparece em
`content` como JSON; recusas retornam `isError: true`. Ferramentas de escrita
ficam ausentes em `--read-only`. IDs explícitos devem respeitar a hierarquia fixada.

Exemplos:

Use o perfil ativo com o envelope mínimo:

```json
{
  "name": "clickupfy_api_v2_edit_checklist",
  "arguments": {
    "path": {
      "checklist_id": "exemplo-1"
    },
    "body": {}
  }
}
```

Direcione a chamada ao perfil de desenvolvimento:

```json
{
  "name": "clickupfy_api_v2_edit_checklist",
  "arguments": {
    "path": {
      "checklist_id": "exemplo-1"
    },
    "body": {},
    "account": "dev"
  }
}
```

Use o perfil do produto, quando o MCP permitir selecionar outro perfil:

```json
{
  "name": "clickupfy_api_v2_edit_checklist",
  "arguments": {
    "path": {
      "checklist_id": "exemplo-1"
    },
    "body": {},
    "account": "produto"
  }
}
```

Consulte o schema antes de compor uma chamada pelo agente:

```bash
clickupfy api describe clickupfy_api_v2_edit_checklist
```

Reproduza pelo CLI a entrada usada pelo agente, sem executar a operação:

```bash
printf '%s' '{"path":{"checklist_id":"exemplo-1"},"body":{}}' | clickupfy api v2-edit-checklist --input - --dry-run
```

### `clickupfy api v2-delete-checklist`

A operação `DeleteChecklist` pertence ao grupo `Task Checklists` e usa
`DELETE /api/v2/checklist/{checklist_id}`.

A chamada altera o recurso indicado pelos parâmetros. Confira o resultado com a consulta correspondente antes de continuar.

A resposta preserva o JSON da API; respostas sem corpo retornam `{}`.
A API key do perfil precisa ter acesso ao recurso. As permissões e o plano do Workspace podem restringir o endpoint.
Os campos omitidos são tratados pelo servidor do ClickUp, sem padrões adicionais do cliente.

[Referência oficial](https://developer.clickup.com/reference/deletechecklist).

| Entrada | Tipo | Obrigatória |
| --- | --- | --- |
| `path.checklist_id` | `string` | sim |
| `confirm` | boolean, somente `true` | sim |

O comando aceita as flags comuns de `api`: `--input`, `--path`, `--query`,
`--body`, `--body-file`, `--content-type`, `--file`, `--dry-run` e `--yes`.
A referência completa de tipos, campos aninhados e valores permitidos está no comando `describe` abaixo.

Exemplos:

Consulte o contrato antes de preencher os IDs reais:

```bash
clickupfy api describe v2-delete-checklist
```

Valide uma entrada em arquivo sem enviar uma requisição:

```bash
clickupfy api v2-delete-checklist --input entrada.json --dry-run
```

Use um envelope JSON pelo stdin:

```bash
printf '%s' '{"path":{"checklist_id":"exemplo-1"},"confirm":true}' | clickupfy api v2-delete-checklist --input -
```

Selecione o perfil que tem acesso ao recurso:

```bash
clickupfy --account produto api v2-delete-checklist --input entrada.json
```

Grave a resposta JSON para conferência. O arquivo de entrada usa o envelope do exemplo anterior:

```bash
clickupfy --json api v2-delete-checklist --input entrada.json > resposta.json
```

### `clickupfy_api_v2_delete_checklist`

A operação `DeleteChecklist` pertence ao grupo `Task Checklists` e usa
`DELETE /api/v2/checklist/{checklist_id}`.

A chamada altera o recurso indicado pelos parâmetros. Confira o resultado com a consulta correspondente antes de continuar.

A resposta preserva o JSON da API; respostas sem corpo retornam `{}`.
A API key do perfil precisa ter acesso ao recurso. As permissões e o plano do Workspace podem restringir o endpoint.
Os campos omitidos são tratados pelo servidor do ClickUp, sem padrões adicionais do cliente.

[Referência oficial](https://developer.clickup.com/reference/deletechecklist).

| Entrada | Tipo | Obrigatória |
| --- | --- | --- |
| `path.checklist_id` | `string` | sim |
| `confirm` | boolean, somente `true` | sim |

`account` é opcional e usa o perfil ativo ou fixado no MCP. O retorno aparece em
`content` como JSON; recusas retornam `isError: true`. Ferramentas de escrita
ficam ausentes em `--read-only`. IDs explícitos devem respeitar a hierarquia fixada.

Exemplos:

Use o perfil ativo com o envelope mínimo:

```json
{
  "name": "clickupfy_api_v2_delete_checklist",
  "arguments": {
    "path": {
      "checklist_id": "exemplo-1"
    },
    "confirm": true
  }
}
```

Direcione a chamada ao perfil de desenvolvimento:

```json
{
  "name": "clickupfy_api_v2_delete_checklist",
  "arguments": {
    "path": {
      "checklist_id": "exemplo-1"
    },
    "confirm": true,
    "account": "dev"
  }
}
```

Use o perfil do produto, quando o MCP permitir selecionar outro perfil:

```json
{
  "name": "clickupfy_api_v2_delete_checklist",
  "arguments": {
    "path": {
      "checklist_id": "exemplo-1"
    },
    "confirm": true,
    "account": "produto"
  }
}
```

Consulte o schema antes de compor uma chamada pelo agente:

```bash
clickupfy api describe clickupfy_api_v2_delete_checklist
```

Reproduza pelo CLI a entrada usada pelo agente, sem executar a operação:

```bash
printf '%s' '{"path":{"checklist_id":"exemplo-1"},"confirm":true}' | clickupfy api v2-delete-checklist --input - --dry-run
```

### `clickupfy api v2-create-checklist-item`

A operação `CreateChecklistItem` pertence ao grupo `Task Checklists` e usa
`POST /api/v2/checklist/{checklist_id}/checklist_item`.

A chamada altera o recurso indicado pelos parâmetros. Confira o resultado com a consulta correspondente antes de continuar.

A resposta preserva o JSON da API; respostas sem corpo retornam `{}`.
A API key do perfil precisa ter acesso ao recurso. As permissões e o plano do Workspace podem restringir o endpoint.
Os campos omitidos são tratados pelo servidor do ClickUp, sem padrões adicionais do cliente.

[Referência oficial](https://developer.clickup.com/reference/createchecklistitem).

| Entrada | Tipo | Obrigatória |
| --- | --- | --- |
| `path.checklist_id` | `string` | sim |
| `body` | objeto conforme `api describe` | sim |

O comando aceita as flags comuns de `api`: `--input`, `--path`, `--query`,
`--body`, `--body-file`, `--content-type`, `--file`, `--dry-run` e `--yes`.
A referência completa de tipos, campos aninhados e valores permitidos está no comando `describe` abaixo.

Exemplos:

Consulte o contrato antes de preencher os IDs reais:

```bash
clickupfy api describe v2-create-checklist-item
```

Valide uma entrada em arquivo sem enviar uma requisição:

```bash
clickupfy api v2-create-checklist-item --input entrada.json --dry-run
```

Use um envelope JSON pelo stdin:

```bash
printf '%s' '{"path":{"checklist_id":"exemplo-1"},"body":{}}' | clickupfy api v2-create-checklist-item --input -
```

Selecione o perfil que tem acesso ao recurso:

```bash
clickupfy --account produto api v2-create-checklist-item --input entrada.json
```

Grave a resposta JSON para conferência. O arquivo de entrada usa o envelope do exemplo anterior:

```bash
clickupfy --json api v2-create-checklist-item --input entrada.json > resposta.json
```

### `clickupfy_api_v2_create_checklist_item`

A operação `CreateChecklistItem` pertence ao grupo `Task Checklists` e usa
`POST /api/v2/checklist/{checklist_id}/checklist_item`.

A chamada altera o recurso indicado pelos parâmetros. Confira o resultado com a consulta correspondente antes de continuar.

A resposta preserva o JSON da API; respostas sem corpo retornam `{}`.
A API key do perfil precisa ter acesso ao recurso. As permissões e o plano do Workspace podem restringir o endpoint.
Os campos omitidos são tratados pelo servidor do ClickUp, sem padrões adicionais do cliente.

[Referência oficial](https://developer.clickup.com/reference/createchecklistitem).

| Entrada | Tipo | Obrigatória |
| --- | --- | --- |
| `path.checklist_id` | `string` | sim |
| `body` | objeto conforme `api describe` | sim |

`account` é opcional e usa o perfil ativo ou fixado no MCP. O retorno aparece em
`content` como JSON; recusas retornam `isError: true`. Ferramentas de escrita
ficam ausentes em `--read-only`. IDs explícitos devem respeitar a hierarquia fixada.

Exemplos:

Use o perfil ativo com o envelope mínimo:

```json
{
  "name": "clickupfy_api_v2_create_checklist_item",
  "arguments": {
    "path": {
      "checklist_id": "exemplo-1"
    },
    "body": {}
  }
}
```

Direcione a chamada ao perfil de desenvolvimento:

```json
{
  "name": "clickupfy_api_v2_create_checklist_item",
  "arguments": {
    "path": {
      "checklist_id": "exemplo-1"
    },
    "body": {},
    "account": "dev"
  }
}
```

Use o perfil do produto, quando o MCP permitir selecionar outro perfil:

```json
{
  "name": "clickupfy_api_v2_create_checklist_item",
  "arguments": {
    "path": {
      "checklist_id": "exemplo-1"
    },
    "body": {},
    "account": "produto"
  }
}
```

Consulte o schema antes de compor uma chamada pelo agente:

```bash
clickupfy api describe clickupfy_api_v2_create_checklist_item
```

Reproduza pelo CLI a entrada usada pelo agente, sem executar a operação:

```bash
printf '%s' '{"path":{"checklist_id":"exemplo-1"},"body":{}}' | clickupfy api v2-create-checklist-item --input - --dry-run
```

### `clickupfy api v2-edit-checklist-item`

A operação `EditChecklistItem` pertence ao grupo `Task Checklists` e usa
`PUT /api/v2/checklist/{checklist_id}/checklist_item/{checklist_item_id}`.

A chamada altera o recurso indicado pelos parâmetros. Confira o resultado com a consulta correspondente antes de continuar.

A resposta preserva o JSON da API; respostas sem corpo retornam `{}`.
A API key do perfil precisa ter acesso ao recurso. As permissões e o plano do Workspace podem restringir o endpoint.
Os campos omitidos são tratados pelo servidor do ClickUp, sem padrões adicionais do cliente.

[Referência oficial](https://developer.clickup.com/reference/editchecklistitem).

| Entrada | Tipo | Obrigatória |
| --- | --- | --- |
| `path.checklist_id` | `string` | sim |
| `path.checklist_item_id` | `string` | sim |
| `body` | objeto conforme `api describe` | sim |

O comando aceita as flags comuns de `api`: `--input`, `--path`, `--query`,
`--body`, `--body-file`, `--content-type`, `--file`, `--dry-run` e `--yes`.
A referência completa de tipos, campos aninhados e valores permitidos está no comando `describe` abaixo.

Exemplos:

Consulte o contrato antes de preencher os IDs reais:

```bash
clickupfy api describe v2-edit-checklist-item
```

Valide uma entrada em arquivo sem enviar uma requisição:

```bash
clickupfy api v2-edit-checklist-item --input entrada.json --dry-run
```

Use um envelope JSON pelo stdin:

```bash
printf '%s' '{"path":{"checklist_id":"exemplo-1","checklist_item_id":"exemplo-1"},"body":{}}' | clickupfy api v2-edit-checklist-item --input -
```

Selecione o perfil que tem acesso ao recurso:

```bash
clickupfy --account produto api v2-edit-checklist-item --input entrada.json
```

Grave a resposta JSON para conferência. O arquivo de entrada usa o envelope do exemplo anterior:

```bash
clickupfy --json api v2-edit-checklist-item --input entrada.json > resposta.json
```

### `clickupfy_api_v2_edit_checklist_item`

A operação `EditChecklistItem` pertence ao grupo `Task Checklists` e usa
`PUT /api/v2/checklist/{checklist_id}/checklist_item/{checklist_item_id}`.

A chamada altera o recurso indicado pelos parâmetros. Confira o resultado com a consulta correspondente antes de continuar.

A resposta preserva o JSON da API; respostas sem corpo retornam `{}`.
A API key do perfil precisa ter acesso ao recurso. As permissões e o plano do Workspace podem restringir o endpoint.
Os campos omitidos são tratados pelo servidor do ClickUp, sem padrões adicionais do cliente.

[Referência oficial](https://developer.clickup.com/reference/editchecklistitem).

| Entrada | Tipo | Obrigatória |
| --- | --- | --- |
| `path.checklist_id` | `string` | sim |
| `path.checklist_item_id` | `string` | sim |
| `body` | objeto conforme `api describe` | sim |

`account` é opcional e usa o perfil ativo ou fixado no MCP. O retorno aparece em
`content` como JSON; recusas retornam `isError: true`. Ferramentas de escrita
ficam ausentes em `--read-only`. IDs explícitos devem respeitar a hierarquia fixada.

Exemplos:

Use o perfil ativo com o envelope mínimo:

```json
{
  "name": "clickupfy_api_v2_edit_checklist_item",
  "arguments": {
    "path": {
      "checklist_id": "exemplo-1",
      "checklist_item_id": "exemplo-1"
    },
    "body": {}
  }
}
```

Direcione a chamada ao perfil de desenvolvimento:

```json
{
  "name": "clickupfy_api_v2_edit_checklist_item",
  "arguments": {
    "path": {
      "checklist_id": "exemplo-1",
      "checklist_item_id": "exemplo-1"
    },
    "body": {},
    "account": "dev"
  }
}
```

Use o perfil do produto, quando o MCP permitir selecionar outro perfil:

```json
{
  "name": "clickupfy_api_v2_edit_checklist_item",
  "arguments": {
    "path": {
      "checklist_id": "exemplo-1",
      "checklist_item_id": "exemplo-1"
    },
    "body": {},
    "account": "produto"
  }
}
```

Consulte o schema antes de compor uma chamada pelo agente:

```bash
clickupfy api describe clickupfy_api_v2_edit_checklist_item
```

Reproduza pelo CLI a entrada usada pelo agente, sem executar a operação:

```bash
printf '%s' '{"path":{"checklist_id":"exemplo-1","checklist_item_id":"exemplo-1"},"body":{}}' | clickupfy api v2-edit-checklist-item --input - --dry-run
```

### `clickupfy api v2-delete-checklist-item`

A operação `DeleteChecklistItem` pertence ao grupo `Task Checklists` e usa
`DELETE /api/v2/checklist/{checklist_id}/checklist_item/{checklist_item_id}`.

A chamada altera o recurso indicado pelos parâmetros. Confira o resultado com a consulta correspondente antes de continuar.

A resposta preserva o JSON da API; respostas sem corpo retornam `{}`.
A API key do perfil precisa ter acesso ao recurso. As permissões e o plano do Workspace podem restringir o endpoint.
Os campos omitidos são tratados pelo servidor do ClickUp, sem padrões adicionais do cliente.

[Referência oficial](https://developer.clickup.com/reference/deletechecklistitem).

| Entrada | Tipo | Obrigatória |
| --- | --- | --- |
| `path.checklist_id` | `string` | sim |
| `path.checklist_item_id` | `string` | sim |
| `confirm` | boolean, somente `true` | sim |

O comando aceita as flags comuns de `api`: `--input`, `--path`, `--query`,
`--body`, `--body-file`, `--content-type`, `--file`, `--dry-run` e `--yes`.
A referência completa de tipos, campos aninhados e valores permitidos está no comando `describe` abaixo.

Exemplos:

Consulte o contrato antes de preencher os IDs reais:

```bash
clickupfy api describe v2-delete-checklist-item
```

Valide uma entrada em arquivo sem enviar uma requisição:

```bash
clickupfy api v2-delete-checklist-item --input entrada.json --dry-run
```

Use um envelope JSON pelo stdin:

```bash
printf '%s' '{"path":{"checklist_id":"exemplo-1","checklist_item_id":"exemplo-1"},"confirm":true}' | clickupfy api v2-delete-checklist-item --input -
```

Selecione o perfil que tem acesso ao recurso:

```bash
clickupfy --account produto api v2-delete-checklist-item --input entrada.json
```

Grave a resposta JSON para conferência. O arquivo de entrada usa o envelope do exemplo anterior:

```bash
clickupfy --json api v2-delete-checklist-item --input entrada.json > resposta.json
```

### `clickupfy_api_v2_delete_checklist_item`

A operação `DeleteChecklistItem` pertence ao grupo `Task Checklists` e usa
`DELETE /api/v2/checklist/{checklist_id}/checklist_item/{checklist_item_id}`.

A chamada altera o recurso indicado pelos parâmetros. Confira o resultado com a consulta correspondente antes de continuar.

A resposta preserva o JSON da API; respostas sem corpo retornam `{}`.
A API key do perfil precisa ter acesso ao recurso. As permissões e o plano do Workspace podem restringir o endpoint.
Os campos omitidos são tratados pelo servidor do ClickUp, sem padrões adicionais do cliente.

[Referência oficial](https://developer.clickup.com/reference/deletechecklistitem).

| Entrada | Tipo | Obrigatória |
| --- | --- | --- |
| `path.checklist_id` | `string` | sim |
| `path.checklist_item_id` | `string` | sim |
| `confirm` | boolean, somente `true` | sim |

`account` é opcional e usa o perfil ativo ou fixado no MCP. O retorno aparece em
`content` como JSON; recusas retornam `isError: true`. Ferramentas de escrita
ficam ausentes em `--read-only`. IDs explícitos devem respeitar a hierarquia fixada.

Exemplos:

Use o perfil ativo com o envelope mínimo:

```json
{
  "name": "clickupfy_api_v2_delete_checklist_item",
  "arguments": {
    "path": {
      "checklist_id": "exemplo-1",
      "checklist_item_id": "exemplo-1"
    },
    "confirm": true
  }
}
```

Direcione a chamada ao perfil de desenvolvimento:

```json
{
  "name": "clickupfy_api_v2_delete_checklist_item",
  "arguments": {
    "path": {
      "checklist_id": "exemplo-1",
      "checklist_item_id": "exemplo-1"
    },
    "confirm": true,
    "account": "dev"
  }
}
```

Use o perfil do produto, quando o MCP permitir selecionar outro perfil:

```json
{
  "name": "clickupfy_api_v2_delete_checklist_item",
  "arguments": {
    "path": {
      "checklist_id": "exemplo-1",
      "checklist_item_id": "exemplo-1"
    },
    "confirm": true,
    "account": "produto"
  }
}
```

Consulte o schema antes de compor uma chamada pelo agente:

```bash
clickupfy api describe clickupfy_api_v2_delete_checklist_item
```

Reproduza pelo CLI a entrada usada pelo agente, sem executar a operação:

```bash
printf '%s' '{"path":{"checklist_id":"exemplo-1","checklist_item_id":"exemplo-1"},"confirm":true}' | clickupfy api v2-delete-checklist-item --input - --dry-run
```

### `clickupfy api v2-get-task-comments`

A operação `GetTaskComments` pertence ao grupo `Comments` e usa
`GET /api/v2/task/{task_id}/comment`.

A chamada consulta o recurso sem modificá-lo.

A resposta preserva o JSON da API; respostas sem corpo retornam `{}`.
A API key do perfil precisa ter acesso ao recurso. As permissões e o plano do Workspace podem restringir o endpoint.
Os campos omitidos são tratados pelo servidor do ClickUp, sem padrões adicionais do cliente.

[Referência oficial](https://developer.clickup.com/reference/gettaskcomments).

| Entrada | Tipo | Obrigatória |
| --- | --- | --- |
| `path.task_id` | `string` | sim |
| `query.custom_task_ids` | `boolean` | não |
| `query.team_id` | `number` | não |
| `query.start` | `integer` | não |
| `query.start_id` | `string` | não |

O comando aceita as flags comuns de `api`: `--input`, `--path`, `--query`,
`--body`, `--body-file`, `--content-type`, `--file`, `--dry-run` e `--yes`.
A referência completa de tipos, campos aninhados e valores permitidos está no comando `describe` abaixo.

Exemplos:

Consulte o contrato antes de preencher os IDs reais:

```bash
clickupfy api describe v2-get-task-comments
```

Valide uma entrada em arquivo sem enviar uma requisição:

```bash
clickupfy api v2-get-task-comments --input entrada.json --dry-run
```

Use um envelope JSON pelo stdin:

```bash
printf '%s' '{"path":{"task_id":"exemplo-1"}}' | clickupfy api v2-get-task-comments --input -
```

Selecione o perfil que tem acesso ao recurso:

```bash
clickupfy --account produto api v2-get-task-comments --input entrada.json
```

Grave a resposta JSON para conferência. O arquivo de entrada usa o envelope do exemplo anterior:

```bash
clickupfy --json api v2-get-task-comments --input entrada.json > resposta.json
```

### `clickupfy_api_v2_get_task_comments`

A operação `GetTaskComments` pertence ao grupo `Comments` e usa
`GET /api/v2/task/{task_id}/comment`.

A chamada consulta o recurso sem modificá-lo.

A resposta preserva o JSON da API; respostas sem corpo retornam `{}`.
A API key do perfil precisa ter acesso ao recurso. As permissões e o plano do Workspace podem restringir o endpoint.
Os campos omitidos são tratados pelo servidor do ClickUp, sem padrões adicionais do cliente.

[Referência oficial](https://developer.clickup.com/reference/gettaskcomments).

| Entrada | Tipo | Obrigatória |
| --- | --- | --- |
| `path.task_id` | `string` | sim |
| `query.custom_task_ids` | `boolean` | não |
| `query.team_id` | `number` | não |
| `query.start` | `integer` | não |
| `query.start_id` | `string` | não |

`account` é opcional e usa o perfil ativo ou fixado no MCP. O retorno aparece em
`content` como JSON; recusas retornam `isError: true`. Ferramentas de escrita
ficam ausentes em `--read-only`. IDs explícitos devem respeitar a hierarquia fixada.

Exemplos:

Use o perfil ativo com o envelope mínimo:

```json
{
  "name": "clickupfy_api_v2_get_task_comments",
  "arguments": {
    "path": {
      "task_id": "exemplo-1"
    }
  }
}
```

Direcione a chamada ao perfil de desenvolvimento:

```json
{
  "name": "clickupfy_api_v2_get_task_comments",
  "arguments": {
    "path": {
      "task_id": "exemplo-1"
    },
    "account": "dev"
  }
}
```

Use o perfil do produto, quando o MCP permitir selecionar outro perfil:

```json
{
  "name": "clickupfy_api_v2_get_task_comments",
  "arguments": {
    "path": {
      "task_id": "exemplo-1"
    },
    "account": "produto"
  }
}
```

Consulte o schema antes de compor uma chamada pelo agente:

```bash
clickupfy api describe clickupfy_api_v2_get_task_comments
```

Reproduza pelo CLI a entrada usada pelo agente, sem executar a operação:

```bash
printf '%s' '{"path":{"task_id":"exemplo-1"}}' | clickupfy api v2-get-task-comments --input - --dry-run
```

### `clickupfy api v2-create-task-comment`

A operação `CreateTaskComment` pertence ao grupo `Comments` e usa
`POST /api/v2/task/{task_id}/comment`.

A chamada altera o recurso indicado pelos parâmetros. Confira o resultado com a consulta correspondente antes de continuar.

A resposta preserva o JSON da API; respostas sem corpo retornam `{}`.
A API key do perfil precisa ter acesso ao recurso. As permissões e o plano do Workspace podem restringir o endpoint.
Os campos omitidos são tratados pelo servidor do ClickUp, sem padrões adicionais do cliente.

[Referência oficial](https://developer.clickup.com/reference/createtaskcomment).

| Entrada | Tipo | Obrigatória |
| --- | --- | --- |
| `path.task_id` | `string` | sim |
| `query.custom_task_ids` | `boolean` | não |
| `query.team_id` | `number` | não |
| `body` | objeto conforme `api describe` | sim |

O comando aceita as flags comuns de `api`: `--input`, `--path`, `--query`,
`--body`, `--body-file`, `--content-type`, `--file`, `--dry-run` e `--yes`.
A referência completa de tipos, campos aninhados e valores permitidos está no comando `describe` abaixo.

Exemplos:

Consulte o contrato antes de preencher os IDs reais:

```bash
clickupfy api describe v2-create-task-comment
```

Valide uma entrada em arquivo sem enviar uma requisição:

```bash
clickupfy api v2-create-task-comment --input entrada.json --dry-run
```

Use um envelope JSON pelo stdin:

```bash
printf '%s' '{"path":{"task_id":"exemplo-1"},"body":{"comment_text":"exemplo-1","notify_all":true}}' | clickupfy api v2-create-task-comment --input -
```

Selecione o perfil que tem acesso ao recurso:

```bash
clickupfy --account produto api v2-create-task-comment --input entrada.json
```

Grave a resposta JSON para conferência. O arquivo de entrada usa o envelope do exemplo anterior:

```bash
clickupfy --json api v2-create-task-comment --input entrada.json > resposta.json
```

### `clickupfy_api_v2_create_task_comment`

A operação `CreateTaskComment` pertence ao grupo `Comments` e usa
`POST /api/v2/task/{task_id}/comment`.

A chamada altera o recurso indicado pelos parâmetros. Confira o resultado com a consulta correspondente antes de continuar.

A resposta preserva o JSON da API; respostas sem corpo retornam `{}`.
A API key do perfil precisa ter acesso ao recurso. As permissões e o plano do Workspace podem restringir o endpoint.
Os campos omitidos são tratados pelo servidor do ClickUp, sem padrões adicionais do cliente.

[Referência oficial](https://developer.clickup.com/reference/createtaskcomment).

| Entrada | Tipo | Obrigatória |
| --- | --- | --- |
| `path.task_id` | `string` | sim |
| `query.custom_task_ids` | `boolean` | não |
| `query.team_id` | `number` | não |
| `body` | objeto conforme `api describe` | sim |

`account` é opcional e usa o perfil ativo ou fixado no MCP. O retorno aparece em
`content` como JSON; recusas retornam `isError: true`. Ferramentas de escrita
ficam ausentes em `--read-only`. IDs explícitos devem respeitar a hierarquia fixada.

Exemplos:

Use o perfil ativo com o envelope mínimo:

```json
{
  "name": "clickupfy_api_v2_create_task_comment",
  "arguments": {
    "path": {
      "task_id": "exemplo-1"
    },
    "body": {
      "comment_text": "exemplo-1",
      "notify_all": true
    }
  }
}
```

Direcione a chamada ao perfil de desenvolvimento:

```json
{
  "name": "clickupfy_api_v2_create_task_comment",
  "arguments": {
    "path": {
      "task_id": "exemplo-1"
    },
    "body": {
      "comment_text": "exemplo-1",
      "notify_all": true
    },
    "account": "dev"
  }
}
```

Use o perfil do produto, quando o MCP permitir selecionar outro perfil:

```json
{
  "name": "clickupfy_api_v2_create_task_comment",
  "arguments": {
    "path": {
      "task_id": "exemplo-1"
    },
    "body": {
      "comment_text": "exemplo-1",
      "notify_all": true
    },
    "account": "produto"
  }
}
```

Consulte o schema antes de compor uma chamada pelo agente:

```bash
clickupfy api describe clickupfy_api_v2_create_task_comment
```

Reproduza pelo CLI a entrada usada pelo agente, sem executar a operação:

```bash
printf '%s' '{"path":{"task_id":"exemplo-1"},"body":{"comment_text":"exemplo-1","notify_all":true}}' | clickupfy api v2-create-task-comment --input - --dry-run
```

### `clickupfy api v2-get-chat-view-comments`

A operação `GetChatViewComments` pertence ao grupo `Comments` e usa
`GET /api/v2/view/{view_id}/comment`.

A chamada consulta o recurso sem modificá-lo.

A resposta preserva o JSON da API; respostas sem corpo retornam `{}`.
A API key do perfil precisa ter acesso ao recurso. As permissões e o plano do Workspace podem restringir o endpoint.
Os campos omitidos são tratados pelo servidor do ClickUp, sem padrões adicionais do cliente.

[Referência oficial](https://developer.clickup.com/reference/getchatviewcomments).

| Entrada | Tipo | Obrigatória |
| --- | --- | --- |
| `path.view_id` | `string` | sim |
| `query.start` | `integer` | não |
| `query.start_id` | `string` | não |

O comando aceita as flags comuns de `api`: `--input`, `--path`, `--query`,
`--body`, `--body-file`, `--content-type`, `--file`, `--dry-run` e `--yes`.
A referência completa de tipos, campos aninhados e valores permitidos está no comando `describe` abaixo.

Exemplos:

Consulte o contrato antes de preencher os IDs reais:

```bash
clickupfy api describe v2-get-chat-view-comments
```

Valide uma entrada em arquivo sem enviar uma requisição:

```bash
clickupfy api v2-get-chat-view-comments --input entrada.json --dry-run
```

Use um envelope JSON pelo stdin:

```bash
printf '%s' '{"path":{"view_id":"exemplo-1"}}' | clickupfy api v2-get-chat-view-comments --input -
```

Selecione o perfil que tem acesso ao recurso:

```bash
clickupfy --account produto api v2-get-chat-view-comments --input entrada.json
```

Grave a resposta JSON para conferência. O arquivo de entrada usa o envelope do exemplo anterior:

```bash
clickupfy --json api v2-get-chat-view-comments --input entrada.json > resposta.json
```

### `clickupfy_api_v2_get_chat_view_comments`

A operação `GetChatViewComments` pertence ao grupo `Comments` e usa
`GET /api/v2/view/{view_id}/comment`.

A chamada consulta o recurso sem modificá-lo.

A resposta preserva o JSON da API; respostas sem corpo retornam `{}`.
A API key do perfil precisa ter acesso ao recurso. As permissões e o plano do Workspace podem restringir o endpoint.
Os campos omitidos são tratados pelo servidor do ClickUp, sem padrões adicionais do cliente.

[Referência oficial](https://developer.clickup.com/reference/getchatviewcomments).

| Entrada | Tipo | Obrigatória |
| --- | --- | --- |
| `path.view_id` | `string` | sim |
| `query.start` | `integer` | não |
| `query.start_id` | `string` | não |

`account` é opcional e usa o perfil ativo ou fixado no MCP. O retorno aparece em
`content` como JSON; recusas retornam `isError: true`. Ferramentas de escrita
ficam ausentes em `--read-only`. IDs explícitos devem respeitar a hierarquia fixada.

Exemplos:

Use o perfil ativo com o envelope mínimo:

```json
{
  "name": "clickupfy_api_v2_get_chat_view_comments",
  "arguments": {
    "path": {
      "view_id": "exemplo-1"
    }
  }
}
```

Direcione a chamada ao perfil de desenvolvimento:

```json
{
  "name": "clickupfy_api_v2_get_chat_view_comments",
  "arguments": {
    "path": {
      "view_id": "exemplo-1"
    },
    "account": "dev"
  }
}
```

Use o perfil do produto, quando o MCP permitir selecionar outro perfil:

```json
{
  "name": "clickupfy_api_v2_get_chat_view_comments",
  "arguments": {
    "path": {
      "view_id": "exemplo-1"
    },
    "account": "produto"
  }
}
```

Consulte o schema antes de compor uma chamada pelo agente:

```bash
clickupfy api describe clickupfy_api_v2_get_chat_view_comments
```

Reproduza pelo CLI a entrada usada pelo agente, sem executar a operação:

```bash
printf '%s' '{"path":{"view_id":"exemplo-1"}}' | clickupfy api v2-get-chat-view-comments --input - --dry-run
```

### `clickupfy api v2-create-chat-view-comment`

A operação `CreateChatViewComment` pertence ao grupo `Comments` e usa
`POST /api/v2/view/{view_id}/comment`.

A chamada altera o recurso indicado pelos parâmetros. Confira o resultado com a consulta correspondente antes de continuar.

A resposta preserva o JSON da API; respostas sem corpo retornam `{}`.
A API key do perfil precisa ter acesso ao recurso. As permissões e o plano do Workspace podem restringir o endpoint.
Os campos omitidos são tratados pelo servidor do ClickUp, sem padrões adicionais do cliente.

[Referência oficial](https://developer.clickup.com/reference/createchatviewcomment).

| Entrada | Tipo | Obrigatória |
| --- | --- | --- |
| `path.view_id` | `string` | sim |
| `body` | objeto conforme `api describe` | sim |

O comando aceita as flags comuns de `api`: `--input`, `--path`, `--query`,
`--body`, `--body-file`, `--content-type`, `--file`, `--dry-run` e `--yes`.
A referência completa de tipos, campos aninhados e valores permitidos está no comando `describe` abaixo.

Exemplos:

Consulte o contrato antes de preencher os IDs reais:

```bash
clickupfy api describe v2-create-chat-view-comment
```

Valide uma entrada em arquivo sem enviar uma requisição:

```bash
clickupfy api v2-create-chat-view-comment --input entrada.json --dry-run
```

Use um envelope JSON pelo stdin:

```bash
printf '%s' '{"path":{"view_id":"exemplo-1"},"body":{"comment_text":"exemplo-1","notify_all":true}}' | clickupfy api v2-create-chat-view-comment --input -
```

Selecione o perfil que tem acesso ao recurso:

```bash
clickupfy --account produto api v2-create-chat-view-comment --input entrada.json
```

Grave a resposta JSON para conferência. O arquivo de entrada usa o envelope do exemplo anterior:

```bash
clickupfy --json api v2-create-chat-view-comment --input entrada.json > resposta.json
```

### `clickupfy_api_v2_create_chat_view_comment`

A operação `CreateChatViewComment` pertence ao grupo `Comments` e usa
`POST /api/v2/view/{view_id}/comment`.

A chamada altera o recurso indicado pelos parâmetros. Confira o resultado com a consulta correspondente antes de continuar.

A resposta preserva o JSON da API; respostas sem corpo retornam `{}`.
A API key do perfil precisa ter acesso ao recurso. As permissões e o plano do Workspace podem restringir o endpoint.
Os campos omitidos são tratados pelo servidor do ClickUp, sem padrões adicionais do cliente.

[Referência oficial](https://developer.clickup.com/reference/createchatviewcomment).

| Entrada | Tipo | Obrigatória |
| --- | --- | --- |
| `path.view_id` | `string` | sim |
| `body` | objeto conforme `api describe` | sim |

`account` é opcional e usa o perfil ativo ou fixado no MCP. O retorno aparece em
`content` como JSON; recusas retornam `isError: true`. Ferramentas de escrita
ficam ausentes em `--read-only`. IDs explícitos devem respeitar a hierarquia fixada.

Exemplos:

Use o perfil ativo com o envelope mínimo:

```json
{
  "name": "clickupfy_api_v2_create_chat_view_comment",
  "arguments": {
    "path": {
      "view_id": "exemplo-1"
    },
    "body": {
      "comment_text": "exemplo-1",
      "notify_all": true
    }
  }
}
```

Direcione a chamada ao perfil de desenvolvimento:

```json
{
  "name": "clickupfy_api_v2_create_chat_view_comment",
  "arguments": {
    "path": {
      "view_id": "exemplo-1"
    },
    "body": {
      "comment_text": "exemplo-1",
      "notify_all": true
    },
    "account": "dev"
  }
}
```

Use o perfil do produto, quando o MCP permitir selecionar outro perfil:

```json
{
  "name": "clickupfy_api_v2_create_chat_view_comment",
  "arguments": {
    "path": {
      "view_id": "exemplo-1"
    },
    "body": {
      "comment_text": "exemplo-1",
      "notify_all": true
    },
    "account": "produto"
  }
}
```

Consulte o schema antes de compor uma chamada pelo agente:

```bash
clickupfy api describe clickupfy_api_v2_create_chat_view_comment
```

Reproduza pelo CLI a entrada usada pelo agente, sem executar a operação:

```bash
printf '%s' '{"path":{"view_id":"exemplo-1"},"body":{"comment_text":"exemplo-1","notify_all":true}}' | clickupfy api v2-create-chat-view-comment --input - --dry-run
```

### `clickupfy api v2-get-list-comments`

A operação `GetListComments` pertence ao grupo `Comments` e usa
`GET /api/v2/list/{list_id}/comment`.

A chamada consulta o recurso sem modificá-lo.

A resposta preserva o JSON da API; respostas sem corpo retornam `{}`.
A API key do perfil precisa ter acesso ao recurso. As permissões e o plano do Workspace podem restringir o endpoint.
Os campos omitidos são tratados pelo servidor do ClickUp, sem padrões adicionais do cliente.

[Referência oficial](https://developer.clickup.com/reference/getlistcomments).

| Entrada | Tipo | Obrigatória |
| --- | --- | --- |
| `path.list_id` | `number` | sim |
| `query.start` | `integer` | não |
| `query.start_id` | `string` | não |

O comando aceita as flags comuns de `api`: `--input`, `--path`, `--query`,
`--body`, `--body-file`, `--content-type`, `--file`, `--dry-run` e `--yes`.
A referência completa de tipos, campos aninhados e valores permitidos está no comando `describe` abaixo.

Exemplos:

Consulte o contrato antes de preencher os IDs reais:

```bash
clickupfy api describe v2-get-list-comments
```

Valide uma entrada em arquivo sem enviar uma requisição:

```bash
clickupfy api v2-get-list-comments --input entrada.json --dry-run
```

Use um envelope JSON pelo stdin:

```bash
printf '%s' '{"path":{"list_id":1}}' | clickupfy api v2-get-list-comments --input -
```

Selecione o perfil que tem acesso ao recurso:

```bash
clickupfy --account produto api v2-get-list-comments --input entrada.json
```

Grave a resposta JSON para conferência. O arquivo de entrada usa o envelope do exemplo anterior:

```bash
clickupfy --json api v2-get-list-comments --input entrada.json > resposta.json
```

### `clickupfy_api_v2_get_list_comments`

A operação `GetListComments` pertence ao grupo `Comments` e usa
`GET /api/v2/list/{list_id}/comment`.

A chamada consulta o recurso sem modificá-lo.

A resposta preserva o JSON da API; respostas sem corpo retornam `{}`.
A API key do perfil precisa ter acesso ao recurso. As permissões e o plano do Workspace podem restringir o endpoint.
Os campos omitidos são tratados pelo servidor do ClickUp, sem padrões adicionais do cliente.

[Referência oficial](https://developer.clickup.com/reference/getlistcomments).

| Entrada | Tipo | Obrigatória |
| --- | --- | --- |
| `path.list_id` | `number` | sim |
| `query.start` | `integer` | não |
| `query.start_id` | `string` | não |

`account` é opcional e usa o perfil ativo ou fixado no MCP. O retorno aparece em
`content` como JSON; recusas retornam `isError: true`. Ferramentas de escrita
ficam ausentes em `--read-only`. IDs explícitos devem respeitar a hierarquia fixada.

Exemplos:

Use o perfil ativo com o envelope mínimo:

```json
{
  "name": "clickupfy_api_v2_get_list_comments",
  "arguments": {
    "path": {
      "list_id": 1
    }
  }
}
```

Direcione a chamada ao perfil de desenvolvimento:

```json
{
  "name": "clickupfy_api_v2_get_list_comments",
  "arguments": {
    "path": {
      "list_id": 1
    },
    "account": "dev"
  }
}
```

Use o perfil do produto, quando o MCP permitir selecionar outro perfil:

```json
{
  "name": "clickupfy_api_v2_get_list_comments",
  "arguments": {
    "path": {
      "list_id": 1
    },
    "account": "produto"
  }
}
```

Consulte o schema antes de compor uma chamada pelo agente:

```bash
clickupfy api describe clickupfy_api_v2_get_list_comments
```

Reproduza pelo CLI a entrada usada pelo agente, sem executar a operação:

```bash
printf '%s' '{"path":{"list_id":1}}' | clickupfy api v2-get-list-comments --input - --dry-run
```

### `clickupfy api v2-create-list-comment`

A operação `CreateListComment` pertence ao grupo `Comments` e usa
`POST /api/v2/list/{list_id}/comment`.

A chamada altera o recurso indicado pelos parâmetros. Confira o resultado com a consulta correspondente antes de continuar.

A resposta preserva o JSON da API; respostas sem corpo retornam `{}`.
A API key do perfil precisa ter acesso ao recurso. As permissões e o plano do Workspace podem restringir o endpoint.
Os campos omitidos são tratados pelo servidor do ClickUp, sem padrões adicionais do cliente.

[Referência oficial](https://developer.clickup.com/reference/createlistcomment).

| Entrada | Tipo | Obrigatória |
| --- | --- | --- |
| `path.list_id` | `number` | sim |
| `body` | objeto conforme `api describe` | sim |

O comando aceita as flags comuns de `api`: `--input`, `--path`, `--query`,
`--body`, `--body-file`, `--content-type`, `--file`, `--dry-run` e `--yes`.
A referência completa de tipos, campos aninhados e valores permitidos está no comando `describe` abaixo.

Exemplos:

Consulte o contrato antes de preencher os IDs reais:

```bash
clickupfy api describe v2-create-list-comment
```

Valide uma entrada em arquivo sem enviar uma requisição:

```bash
clickupfy api v2-create-list-comment --input entrada.json --dry-run
```

Use um envelope JSON pelo stdin:

```bash
printf '%s' '{"path":{"list_id":1},"body":{"comment_text":"exemplo-1","assignee":1,"notify_all":true}}' | clickupfy api v2-create-list-comment --input -
```

Selecione o perfil que tem acesso ao recurso:

```bash
clickupfy --account produto api v2-create-list-comment --input entrada.json
```

Grave a resposta JSON para conferência. O arquivo de entrada usa o envelope do exemplo anterior:

```bash
clickupfy --json api v2-create-list-comment --input entrada.json > resposta.json
```

### `clickupfy_api_v2_create_list_comment`

A operação `CreateListComment` pertence ao grupo `Comments` e usa
`POST /api/v2/list/{list_id}/comment`.

A chamada altera o recurso indicado pelos parâmetros. Confira o resultado com a consulta correspondente antes de continuar.

A resposta preserva o JSON da API; respostas sem corpo retornam `{}`.
A API key do perfil precisa ter acesso ao recurso. As permissões e o plano do Workspace podem restringir o endpoint.
Os campos omitidos são tratados pelo servidor do ClickUp, sem padrões adicionais do cliente.

[Referência oficial](https://developer.clickup.com/reference/createlistcomment).

| Entrada | Tipo | Obrigatória |
| --- | --- | --- |
| `path.list_id` | `number` | sim |
| `body` | objeto conforme `api describe` | sim |

`account` é opcional e usa o perfil ativo ou fixado no MCP. O retorno aparece em
`content` como JSON; recusas retornam `isError: true`. Ferramentas de escrita
ficam ausentes em `--read-only`. IDs explícitos devem respeitar a hierarquia fixada.

Exemplos:

Use o perfil ativo com o envelope mínimo:

```json
{
  "name": "clickupfy_api_v2_create_list_comment",
  "arguments": {
    "path": {
      "list_id": 1
    },
    "body": {
      "comment_text": "exemplo-1",
      "assignee": 1,
      "notify_all": true
    }
  }
}
```

Direcione a chamada ao perfil de desenvolvimento:

```json
{
  "name": "clickupfy_api_v2_create_list_comment",
  "arguments": {
    "path": {
      "list_id": 1
    },
    "body": {
      "comment_text": "exemplo-1",
      "assignee": 1,
      "notify_all": true
    },
    "account": "dev"
  }
}
```

Use o perfil do produto, quando o MCP permitir selecionar outro perfil:

```json
{
  "name": "clickupfy_api_v2_create_list_comment",
  "arguments": {
    "path": {
      "list_id": 1
    },
    "body": {
      "comment_text": "exemplo-1",
      "assignee": 1,
      "notify_all": true
    },
    "account": "produto"
  }
}
```

Consulte o schema antes de compor uma chamada pelo agente:

```bash
clickupfy api describe clickupfy_api_v2_create_list_comment
```

Reproduza pelo CLI a entrada usada pelo agente, sem executar a operação:

```bash
printf '%s' '{"path":{"list_id":1},"body":{"comment_text":"exemplo-1","assignee":1,"notify_all":true}}' | clickupfy api v2-create-list-comment --input - --dry-run
```

### `clickupfy api v2-update-comment`

A operação `UpdateComment` pertence ao grupo `Comments` e usa
`PUT /api/v2/comment/{comment_id}`.

A chamada altera o recurso indicado pelos parâmetros. Confira o resultado com a consulta correspondente antes de continuar.

A resposta preserva o JSON da API; respostas sem corpo retornam `{}`.
A API key do perfil precisa ter acesso ao recurso. As permissões e o plano do Workspace podem restringir o endpoint.
Os campos omitidos são tratados pelo servidor do ClickUp, sem padrões adicionais do cliente.

[Referência oficial](https://developer.clickup.com/reference/updatecomment).

| Entrada | Tipo | Obrigatória |
| --- | --- | --- |
| `path.comment_id` | `number` | sim |
| `body` | objeto conforme `api describe` | sim |

O comando aceita as flags comuns de `api`: `--input`, `--path`, `--query`,
`--body`, `--body-file`, `--content-type`, `--file`, `--dry-run` e `--yes`.
A referência completa de tipos, campos aninhados e valores permitidos está no comando `describe` abaixo.

Exemplos:

Consulte o contrato antes de preencher os IDs reais:

```bash
clickupfy api describe v2-update-comment
```

Valide uma entrada em arquivo sem enviar uma requisição:

```bash
clickupfy api v2-update-comment --input entrada.json --dry-run
```

Use um envelope JSON pelo stdin:

```bash
printf '%s' '{"path":{"comment_id":1},"body":{"comment_text":"exemplo-1","assignee":1,"resolved":true}}' | clickupfy api v2-update-comment --input -
```

Selecione o perfil que tem acesso ao recurso:

```bash
clickupfy --account produto api v2-update-comment --input entrada.json
```

Grave a resposta JSON para conferência. O arquivo de entrada usa o envelope do exemplo anterior:

```bash
clickupfy --json api v2-update-comment --input entrada.json > resposta.json
```

### `clickupfy_api_v2_update_comment`

A operação `UpdateComment` pertence ao grupo `Comments` e usa
`PUT /api/v2/comment/{comment_id}`.

A chamada altera o recurso indicado pelos parâmetros. Confira o resultado com a consulta correspondente antes de continuar.

A resposta preserva o JSON da API; respostas sem corpo retornam `{}`.
A API key do perfil precisa ter acesso ao recurso. As permissões e o plano do Workspace podem restringir o endpoint.
Os campos omitidos são tratados pelo servidor do ClickUp, sem padrões adicionais do cliente.

[Referência oficial](https://developer.clickup.com/reference/updatecomment).

| Entrada | Tipo | Obrigatória |
| --- | --- | --- |
| `path.comment_id` | `number` | sim |
| `body` | objeto conforme `api describe` | sim |

`account` é opcional e usa o perfil ativo ou fixado no MCP. O retorno aparece em
`content` como JSON; recusas retornam `isError: true`. Ferramentas de escrita
ficam ausentes em `--read-only`. IDs explícitos devem respeitar a hierarquia fixada.

Exemplos:

Use o perfil ativo com o envelope mínimo:

```json
{
  "name": "clickupfy_api_v2_update_comment",
  "arguments": {
    "path": {
      "comment_id": 1
    },
    "body": {
      "comment_text": "exemplo-1",
      "assignee": 1,
      "resolved": true
    }
  }
}
```

Direcione a chamada ao perfil de desenvolvimento:

```json
{
  "name": "clickupfy_api_v2_update_comment",
  "arguments": {
    "path": {
      "comment_id": 1
    },
    "body": {
      "comment_text": "exemplo-1",
      "assignee": 1,
      "resolved": true
    },
    "account": "dev"
  }
}
```

Use o perfil do produto, quando o MCP permitir selecionar outro perfil:

```json
{
  "name": "clickupfy_api_v2_update_comment",
  "arguments": {
    "path": {
      "comment_id": 1
    },
    "body": {
      "comment_text": "exemplo-1",
      "assignee": 1,
      "resolved": true
    },
    "account": "produto"
  }
}
```

Consulte o schema antes de compor uma chamada pelo agente:

```bash
clickupfy api describe clickupfy_api_v2_update_comment
```

Reproduza pelo CLI a entrada usada pelo agente, sem executar a operação:

```bash
printf '%s' '{"path":{"comment_id":1},"body":{"comment_text":"exemplo-1","assignee":1,"resolved":true}}' | clickupfy api v2-update-comment --input - --dry-run
```

### `clickupfy api v2-delete-comment`

A operação `DeleteComment` pertence ao grupo `Comments` e usa
`DELETE /api/v2/comment/{comment_id}`.

A chamada altera o recurso indicado pelos parâmetros. Confira o resultado com a consulta correspondente antes de continuar.

A resposta preserva o JSON da API; respostas sem corpo retornam `{}`.
A API key do perfil precisa ter acesso ao recurso. As permissões e o plano do Workspace podem restringir o endpoint.
Os campos omitidos são tratados pelo servidor do ClickUp, sem padrões adicionais do cliente.

[Referência oficial](https://developer.clickup.com/reference/deletecomment).

| Entrada | Tipo | Obrigatória |
| --- | --- | --- |
| `path.comment_id` | `number` | sim |
| `confirm` | boolean, somente `true` | sim |

O comando aceita as flags comuns de `api`: `--input`, `--path`, `--query`,
`--body`, `--body-file`, `--content-type`, `--file`, `--dry-run` e `--yes`.
A referência completa de tipos, campos aninhados e valores permitidos está no comando `describe` abaixo.

Exemplos:

Consulte o contrato antes de preencher os IDs reais:

```bash
clickupfy api describe v2-delete-comment
```

Valide uma entrada em arquivo sem enviar uma requisição:

```bash
clickupfy api v2-delete-comment --input entrada.json --dry-run
```

Use um envelope JSON pelo stdin:

```bash
printf '%s' '{"path":{"comment_id":1},"confirm":true}' | clickupfy api v2-delete-comment --input -
```

Selecione o perfil que tem acesso ao recurso:

```bash
clickupfy --account produto api v2-delete-comment --input entrada.json
```

Grave a resposta JSON para conferência. O arquivo de entrada usa o envelope do exemplo anterior:

```bash
clickupfy --json api v2-delete-comment --input entrada.json > resposta.json
```

### `clickupfy_api_v2_delete_comment`

A operação `DeleteComment` pertence ao grupo `Comments` e usa
`DELETE /api/v2/comment/{comment_id}`.

A chamada altera o recurso indicado pelos parâmetros. Confira o resultado com a consulta correspondente antes de continuar.

A resposta preserva o JSON da API; respostas sem corpo retornam `{}`.
A API key do perfil precisa ter acesso ao recurso. As permissões e o plano do Workspace podem restringir o endpoint.
Os campos omitidos são tratados pelo servidor do ClickUp, sem padrões adicionais do cliente.

[Referência oficial](https://developer.clickup.com/reference/deletecomment).

| Entrada | Tipo | Obrigatória |
| --- | --- | --- |
| `path.comment_id` | `number` | sim |
| `confirm` | boolean, somente `true` | sim |

`account` é opcional e usa o perfil ativo ou fixado no MCP. O retorno aparece em
`content` como JSON; recusas retornam `isError: true`. Ferramentas de escrita
ficam ausentes em `--read-only`. IDs explícitos devem respeitar a hierarquia fixada.

Exemplos:

Use o perfil ativo com o envelope mínimo:

```json
{
  "name": "clickupfy_api_v2_delete_comment",
  "arguments": {
    "path": {
      "comment_id": 1
    },
    "confirm": true
  }
}
```

Direcione a chamada ao perfil de desenvolvimento:

```json
{
  "name": "clickupfy_api_v2_delete_comment",
  "arguments": {
    "path": {
      "comment_id": 1
    },
    "confirm": true,
    "account": "dev"
  }
}
```

Use o perfil do produto, quando o MCP permitir selecionar outro perfil:

```json
{
  "name": "clickupfy_api_v2_delete_comment",
  "arguments": {
    "path": {
      "comment_id": 1
    },
    "confirm": true,
    "account": "produto"
  }
}
```

Consulte o schema antes de compor uma chamada pelo agente:

```bash
clickupfy api describe clickupfy_api_v2_delete_comment
```

Reproduza pelo CLI a entrada usada pelo agente, sem executar a operação:

```bash
printf '%s' '{"path":{"comment_id":1},"confirm":true}' | clickupfy api v2-delete-comment --input - --dry-run
```

### `clickupfy api v2-get-threaded-comments`

A operação `GetThreadedComments` pertence ao grupo `Comments` e usa
`GET /api/v2/comment/{comment_id}/reply`.

A chamada consulta o recurso sem modificá-lo.

A resposta preserva o JSON da API; respostas sem corpo retornam `{}`.
A API key do perfil precisa ter acesso ao recurso. As permissões e o plano do Workspace podem restringir o endpoint.
Os campos omitidos são tratados pelo servidor do ClickUp, sem padrões adicionais do cliente.

[Referência oficial](https://developer.clickup.com/reference/getthreadedcomments).

| Entrada | Tipo | Obrigatória |
| --- | --- | --- |
| `path.comment_id` | `number` | sim |

O comando aceita as flags comuns de `api`: `--input`, `--path`, `--query`,
`--body`, `--body-file`, `--content-type`, `--file`, `--dry-run` e `--yes`.
A referência completa de tipos, campos aninhados e valores permitidos está no comando `describe` abaixo.

Exemplos:

Consulte o contrato antes de preencher os IDs reais:

```bash
clickupfy api describe v2-get-threaded-comments
```

Valide uma entrada em arquivo sem enviar uma requisição:

```bash
clickupfy api v2-get-threaded-comments --input entrada.json --dry-run
```

Use um envelope JSON pelo stdin:

```bash
printf '%s' '{"path":{"comment_id":1}}' | clickupfy api v2-get-threaded-comments --input -
```

Selecione o perfil que tem acesso ao recurso:

```bash
clickupfy --account produto api v2-get-threaded-comments --input entrada.json
```

Grave a resposta JSON para conferência. O arquivo de entrada usa o envelope do exemplo anterior:

```bash
clickupfy --json api v2-get-threaded-comments --input entrada.json > resposta.json
```

### `clickupfy_api_v2_get_threaded_comments`

A operação `GetThreadedComments` pertence ao grupo `Comments` e usa
`GET /api/v2/comment/{comment_id}/reply`.

A chamada consulta o recurso sem modificá-lo.

A resposta preserva o JSON da API; respostas sem corpo retornam `{}`.
A API key do perfil precisa ter acesso ao recurso. As permissões e o plano do Workspace podem restringir o endpoint.
Os campos omitidos são tratados pelo servidor do ClickUp, sem padrões adicionais do cliente.

[Referência oficial](https://developer.clickup.com/reference/getthreadedcomments).

| Entrada | Tipo | Obrigatória |
| --- | --- | --- |
| `path.comment_id` | `number` | sim |

`account` é opcional e usa o perfil ativo ou fixado no MCP. O retorno aparece em
`content` como JSON; recusas retornam `isError: true`. Ferramentas de escrita
ficam ausentes em `--read-only`. IDs explícitos devem respeitar a hierarquia fixada.

Exemplos:

Use o perfil ativo com o envelope mínimo:

```json
{
  "name": "clickupfy_api_v2_get_threaded_comments",
  "arguments": {
    "path": {
      "comment_id": 1
    }
  }
}
```

Direcione a chamada ao perfil de desenvolvimento:

```json
{
  "name": "clickupfy_api_v2_get_threaded_comments",
  "arguments": {
    "path": {
      "comment_id": 1
    },
    "account": "dev"
  }
}
```

Use o perfil do produto, quando o MCP permitir selecionar outro perfil:

```json
{
  "name": "clickupfy_api_v2_get_threaded_comments",
  "arguments": {
    "path": {
      "comment_id": 1
    },
    "account": "produto"
  }
}
```

Consulte o schema antes de compor uma chamada pelo agente:

```bash
clickupfy api describe clickupfy_api_v2_get_threaded_comments
```

Reproduza pelo CLI a entrada usada pelo agente, sem executar a operação:

```bash
printf '%s' '{"path":{"comment_id":1}}' | clickupfy api v2-get-threaded-comments --input - --dry-run
```

### `clickupfy api v2-create-threaded-comment`

A operação `CreateThreadedComment` pertence ao grupo `Comments` e usa
`POST /api/v2/comment/{comment_id}/reply`.

A chamada altera o recurso indicado pelos parâmetros. Confira o resultado com a consulta correspondente antes de continuar.

A resposta preserva o JSON da API; respostas sem corpo retornam `{}`.
A API key do perfil precisa ter acesso ao recurso. As permissões e o plano do Workspace podem restringir o endpoint.
Os campos omitidos são tratados pelo servidor do ClickUp, sem padrões adicionais do cliente.

[Referência oficial](https://developer.clickup.com/reference/createthreadedcomment).

| Entrada | Tipo | Obrigatória |
| --- | --- | --- |
| `path.comment_id` | `number` | sim |
| `body` | objeto conforme `api describe` | sim |

O comando aceita as flags comuns de `api`: `--input`, `--path`, `--query`,
`--body`, `--body-file`, `--content-type`, `--file`, `--dry-run` e `--yes`.
A referência completa de tipos, campos aninhados e valores permitidos está no comando `describe` abaixo.

Exemplos:

Consulte o contrato antes de preencher os IDs reais:

```bash
clickupfy api describe v2-create-threaded-comment
```

Valide uma entrada em arquivo sem enviar uma requisição:

```bash
clickupfy api v2-create-threaded-comment --input entrada.json --dry-run
```

Use um envelope JSON pelo stdin:

```bash
printf '%s' '{"path":{"comment_id":1},"body":{"comment_text":"exemplo-1","notify_all":true}}' | clickupfy api v2-create-threaded-comment --input -
```

Selecione o perfil que tem acesso ao recurso:

```bash
clickupfy --account produto api v2-create-threaded-comment --input entrada.json
```

Grave a resposta JSON para conferência. O arquivo de entrada usa o envelope do exemplo anterior:

```bash
clickupfy --json api v2-create-threaded-comment --input entrada.json > resposta.json
```

### `clickupfy_api_v2_create_threaded_comment`

A operação `CreateThreadedComment` pertence ao grupo `Comments` e usa
`POST /api/v2/comment/{comment_id}/reply`.

A chamada altera o recurso indicado pelos parâmetros. Confira o resultado com a consulta correspondente antes de continuar.

A resposta preserva o JSON da API; respostas sem corpo retornam `{}`.
A API key do perfil precisa ter acesso ao recurso. As permissões e o plano do Workspace podem restringir o endpoint.
Os campos omitidos são tratados pelo servidor do ClickUp, sem padrões adicionais do cliente.

[Referência oficial](https://developer.clickup.com/reference/createthreadedcomment).

| Entrada | Tipo | Obrigatória |
| --- | --- | --- |
| `path.comment_id` | `number` | sim |
| `body` | objeto conforme `api describe` | sim |

`account` é opcional e usa o perfil ativo ou fixado no MCP. O retorno aparece em
`content` como JSON; recusas retornam `isError: true`. Ferramentas de escrita
ficam ausentes em `--read-only`. IDs explícitos devem respeitar a hierarquia fixada.

Exemplos:

Use o perfil ativo com o envelope mínimo:

```json
{
  "name": "clickupfy_api_v2_create_threaded_comment",
  "arguments": {
    "path": {
      "comment_id": 1
    },
    "body": {
      "comment_text": "exemplo-1",
      "notify_all": true
    }
  }
}
```

Direcione a chamada ao perfil de desenvolvimento:

```json
{
  "name": "clickupfy_api_v2_create_threaded_comment",
  "arguments": {
    "path": {
      "comment_id": 1
    },
    "body": {
      "comment_text": "exemplo-1",
      "notify_all": true
    },
    "account": "dev"
  }
}
```

Use o perfil do produto, quando o MCP permitir selecionar outro perfil:

```json
{
  "name": "clickupfy_api_v2_create_threaded_comment",
  "arguments": {
    "path": {
      "comment_id": 1
    },
    "body": {
      "comment_text": "exemplo-1",
      "notify_all": true
    },
    "account": "produto"
  }
}
```

Consulte o schema antes de compor uma chamada pelo agente:

```bash
clickupfy api describe clickupfy_api_v2_create_threaded_comment
```

Reproduza pelo CLI a entrada usada pelo agente, sem executar a operação:

```bash
printf '%s' '{"path":{"comment_id":1},"body":{"comment_text":"exemplo-1","notify_all":true}}' | clickupfy api v2-create-threaded-comment --input - --dry-run
```

### `clickupfy api v2-get-accessible-custom-fields`

A operação `GetAccessibleCustomFields` pertence ao grupo `Custom Fields` e usa
`GET /api/v2/list/{list_id}/field`.

A chamada consulta o recurso sem modificá-lo.

A resposta preserva o JSON da API; respostas sem corpo retornam `{}`.
A API key do perfil precisa ter acesso ao recurso. As permissões e o plano do Workspace podem restringir o endpoint.
Os campos omitidos são tratados pelo servidor do ClickUp, sem padrões adicionais do cliente.

[Referência oficial](https://developer.clickup.com/reference/getaccessiblecustomfields).

| Entrada | Tipo | Obrigatória |
| --- | --- | --- |
| `path.list_id` | `number` | sim |
| `query.include_applied_objects` | `boolean` | não |

O comando aceita as flags comuns de `api`: `--input`, `--path`, `--query`,
`--body`, `--body-file`, `--content-type`, `--file`, `--dry-run` e `--yes`.
A referência completa de tipos, campos aninhados e valores permitidos está no comando `describe` abaixo.

Exemplos:

Consulte o contrato antes de preencher os IDs reais:

```bash
clickupfy api describe v2-get-accessible-custom-fields
```

Valide uma entrada em arquivo sem enviar uma requisição:

```bash
clickupfy api v2-get-accessible-custom-fields --input entrada.json --dry-run
```

Use um envelope JSON pelo stdin:

```bash
printf '%s' '{"path":{"list_id":1}}' | clickupfy api v2-get-accessible-custom-fields --input -
```

Selecione o perfil que tem acesso ao recurso:

```bash
clickupfy --account produto api v2-get-accessible-custom-fields --input entrada.json
```

Grave a resposta JSON para conferência. O arquivo de entrada usa o envelope do exemplo anterior:

```bash
clickupfy --json api v2-get-accessible-custom-fields --input entrada.json > resposta.json
```

### `clickupfy_api_v2_get_accessible_custom_fields`

A operação `GetAccessibleCustomFields` pertence ao grupo `Custom Fields` e usa
`GET /api/v2/list/{list_id}/field`.

A chamada consulta o recurso sem modificá-lo.

A resposta preserva o JSON da API; respostas sem corpo retornam `{}`.
A API key do perfil precisa ter acesso ao recurso. As permissões e o plano do Workspace podem restringir o endpoint.
Os campos omitidos são tratados pelo servidor do ClickUp, sem padrões adicionais do cliente.

[Referência oficial](https://developer.clickup.com/reference/getaccessiblecustomfields).

| Entrada | Tipo | Obrigatória |
| --- | --- | --- |
| `path.list_id` | `number` | sim |
| `query.include_applied_objects` | `boolean` | não |

`account` é opcional e usa o perfil ativo ou fixado no MCP. O retorno aparece em
`content` como JSON; recusas retornam `isError: true`. Ferramentas de escrita
ficam ausentes em `--read-only`. IDs explícitos devem respeitar a hierarquia fixada.

Exemplos:

Use o perfil ativo com o envelope mínimo:

```json
{
  "name": "clickupfy_api_v2_get_accessible_custom_fields",
  "arguments": {
    "path": {
      "list_id": 1
    }
  }
}
```

Direcione a chamada ao perfil de desenvolvimento:

```json
{
  "name": "clickupfy_api_v2_get_accessible_custom_fields",
  "arguments": {
    "path": {
      "list_id": 1
    },
    "account": "dev"
  }
}
```

Use o perfil do produto, quando o MCP permitir selecionar outro perfil:

```json
{
  "name": "clickupfy_api_v2_get_accessible_custom_fields",
  "arguments": {
    "path": {
      "list_id": 1
    },
    "account": "produto"
  }
}
```

Consulte o schema antes de compor uma chamada pelo agente:

```bash
clickupfy api describe clickupfy_api_v2_get_accessible_custom_fields
```

Reproduza pelo CLI a entrada usada pelo agente, sem executar a operação:

```bash
printf '%s' '{"path":{"list_id":1}}' | clickupfy api v2-get-accessible-custom-fields --input - --dry-run
```

### `clickupfy api v2-get-folder-available-fields`

A operação `getFolderAvailableFields` pertence ao grupo `Custom Fields` e usa
`GET /api/v2/folder/{folder_id}/field`.

A chamada consulta o recurso sem modificá-lo.

A resposta preserva o JSON da API; respostas sem corpo retornam `{}`.
A API key do perfil precisa ter acesso ao recurso. As permissões e o plano do Workspace podem restringir o endpoint.
Os campos omitidos são tratados pelo servidor do ClickUp, sem padrões adicionais do cliente.

[Referência oficial](https://developer.clickup.com/reference/getfolderavailablefields).

| Entrada | Tipo | Obrigatória |
| --- | --- | --- |
| `path.folder_id` | `number` | sim |
| `query.include_applied_objects` | `boolean` | não |

O comando aceita as flags comuns de `api`: `--input`, `--path`, `--query`,
`--body`, `--body-file`, `--content-type`, `--file`, `--dry-run` e `--yes`.
A referência completa de tipos, campos aninhados e valores permitidos está no comando `describe` abaixo.

Exemplos:

Consulte o contrato antes de preencher os IDs reais:

```bash
clickupfy api describe v2-get-folder-available-fields
```

Valide uma entrada em arquivo sem enviar uma requisição:

```bash
clickupfy api v2-get-folder-available-fields --input entrada.json --dry-run
```

Use um envelope JSON pelo stdin:

```bash
printf '%s' '{"path":{"folder_id":1}}' | clickupfy api v2-get-folder-available-fields --input -
```

Selecione o perfil que tem acesso ao recurso:

```bash
clickupfy --account produto api v2-get-folder-available-fields --input entrada.json
```

Grave a resposta JSON para conferência. O arquivo de entrada usa o envelope do exemplo anterior:

```bash
clickupfy --json api v2-get-folder-available-fields --input entrada.json > resposta.json
```

### `clickupfy_api_v2_get_folder_available_fields`

A operação `getFolderAvailableFields` pertence ao grupo `Custom Fields` e usa
`GET /api/v2/folder/{folder_id}/field`.

A chamada consulta o recurso sem modificá-lo.

A resposta preserva o JSON da API; respostas sem corpo retornam `{}`.
A API key do perfil precisa ter acesso ao recurso. As permissões e o plano do Workspace podem restringir o endpoint.
Os campos omitidos são tratados pelo servidor do ClickUp, sem padrões adicionais do cliente.

[Referência oficial](https://developer.clickup.com/reference/getfolderavailablefields).

| Entrada | Tipo | Obrigatória |
| --- | --- | --- |
| `path.folder_id` | `number` | sim |
| `query.include_applied_objects` | `boolean` | não |

`account` é opcional e usa o perfil ativo ou fixado no MCP. O retorno aparece em
`content` como JSON; recusas retornam `isError: true`. Ferramentas de escrita
ficam ausentes em `--read-only`. IDs explícitos devem respeitar a hierarquia fixada.

Exemplos:

Use o perfil ativo com o envelope mínimo:

```json
{
  "name": "clickupfy_api_v2_get_folder_available_fields",
  "arguments": {
    "path": {
      "folder_id": 1
    }
  }
}
```

Direcione a chamada ao perfil de desenvolvimento:

```json
{
  "name": "clickupfy_api_v2_get_folder_available_fields",
  "arguments": {
    "path": {
      "folder_id": 1
    },
    "account": "dev"
  }
}
```

Use o perfil do produto, quando o MCP permitir selecionar outro perfil:

```json
{
  "name": "clickupfy_api_v2_get_folder_available_fields",
  "arguments": {
    "path": {
      "folder_id": 1
    },
    "account": "produto"
  }
}
```

Consulte o schema antes de compor uma chamada pelo agente:

```bash
clickupfy api describe clickupfy_api_v2_get_folder_available_fields
```

Reproduza pelo CLI a entrada usada pelo agente, sem executar a operação:

```bash
printf '%s' '{"path":{"folder_id":1}}' | clickupfy api v2-get-folder-available-fields --input - --dry-run
```

### `clickupfy api v2-get-space-available-fields`

A operação `getSpaceAvailableFields` pertence ao grupo `Custom Fields` e usa
`GET /api/v2/space/{space_id}/field`.

A chamada consulta o recurso sem modificá-lo.

A resposta preserva o JSON da API; respostas sem corpo retornam `{}`.
A API key do perfil precisa ter acesso ao recurso. As permissões e o plano do Workspace podem restringir o endpoint.
Os campos omitidos são tratados pelo servidor do ClickUp, sem padrões adicionais do cliente.

[Referência oficial](https://developer.clickup.com/reference/getspaceavailablefields).

| Entrada | Tipo | Obrigatória |
| --- | --- | --- |
| `path.space_id` | `number` | sim |
| `query.include_applied_objects` | `boolean` | não |

O comando aceita as flags comuns de `api`: `--input`, `--path`, `--query`,
`--body`, `--body-file`, `--content-type`, `--file`, `--dry-run` e `--yes`.
A referência completa de tipos, campos aninhados e valores permitidos está no comando `describe` abaixo.

Exemplos:

Consulte o contrato antes de preencher os IDs reais:

```bash
clickupfy api describe v2-get-space-available-fields
```

Valide uma entrada em arquivo sem enviar uma requisição:

```bash
clickupfy api v2-get-space-available-fields --input entrada.json --dry-run
```

Use um envelope JSON pelo stdin:

```bash
printf '%s' '{"path":{"space_id":1}}' | clickupfy api v2-get-space-available-fields --input -
```

Selecione o perfil que tem acesso ao recurso:

```bash
clickupfy --account produto api v2-get-space-available-fields --input entrada.json
```

Grave a resposta JSON para conferência. O arquivo de entrada usa o envelope do exemplo anterior:

```bash
clickupfy --json api v2-get-space-available-fields --input entrada.json > resposta.json
```

### `clickupfy_api_v2_get_space_available_fields`

A operação `getSpaceAvailableFields` pertence ao grupo `Custom Fields` e usa
`GET /api/v2/space/{space_id}/field`.

A chamada consulta o recurso sem modificá-lo.

A resposta preserva o JSON da API; respostas sem corpo retornam `{}`.
A API key do perfil precisa ter acesso ao recurso. As permissões e o plano do Workspace podem restringir o endpoint.
Os campos omitidos são tratados pelo servidor do ClickUp, sem padrões adicionais do cliente.

[Referência oficial](https://developer.clickup.com/reference/getspaceavailablefields).

| Entrada | Tipo | Obrigatória |
| --- | --- | --- |
| `path.space_id` | `number` | sim |
| `query.include_applied_objects` | `boolean` | não |

`account` é opcional e usa o perfil ativo ou fixado no MCP. O retorno aparece em
`content` como JSON; recusas retornam `isError: true`. Ferramentas de escrita
ficam ausentes em `--read-only`. IDs explícitos devem respeitar a hierarquia fixada.

Exemplos:

Use o perfil ativo com o envelope mínimo:

```json
{
  "name": "clickupfy_api_v2_get_space_available_fields",
  "arguments": {
    "path": {
      "space_id": 1
    }
  }
}
```

Direcione a chamada ao perfil de desenvolvimento:

```json
{
  "name": "clickupfy_api_v2_get_space_available_fields",
  "arguments": {
    "path": {
      "space_id": 1
    },
    "account": "dev"
  }
}
```

Use o perfil do produto, quando o MCP permitir selecionar outro perfil:

```json
{
  "name": "clickupfy_api_v2_get_space_available_fields",
  "arguments": {
    "path": {
      "space_id": 1
    },
    "account": "produto"
  }
}
```

Consulte o schema antes de compor uma chamada pelo agente:

```bash
clickupfy api describe clickupfy_api_v2_get_space_available_fields
```

Reproduza pelo CLI a entrada usada pelo agente, sem executar a operação:

```bash
printf '%s' '{"path":{"space_id":1}}' | clickupfy api v2-get-space-available-fields --input - --dry-run
```

### `clickupfy api v2-get-team-available-fields`

A operação `getTeamAvailableFields` pertence ao grupo `Custom Fields` e usa
`GET /api/v2/team/{team_id}/field`.

A chamada consulta o recurso sem modificá-lo.

A resposta preserva o JSON da API; respostas sem corpo retornam `{}`.
A API key do perfil precisa ter acesso ao recurso. As permissões e o plano do Workspace podem restringir o endpoint.
Os campos omitidos são tratados pelo servidor do ClickUp, sem padrões adicionais do cliente.

[Referência oficial](https://developer.clickup.com/reference/getteamavailablefields).

| Entrada | Tipo | Obrigatória |
| --- | --- | --- |
| `path.team_id` | `number` | sim |
| `query.include_applied_objects` | `boolean` | não |

O comando aceita as flags comuns de `api`: `--input`, `--path`, `--query`,
`--body`, `--body-file`, `--content-type`, `--file`, `--dry-run` e `--yes`.
A referência completa de tipos, campos aninhados e valores permitidos está no comando `describe` abaixo.

Exemplos:

Consulte o contrato antes de preencher os IDs reais:

```bash
clickupfy api describe v2-get-team-available-fields
```

Valide uma entrada em arquivo sem enviar uma requisição:

```bash
clickupfy api v2-get-team-available-fields --input entrada.json --dry-run
```

Use um envelope JSON pelo stdin:

```bash
printf '%s' '{"path":{"team_id":1}}' | clickupfy api v2-get-team-available-fields --input -
```

Selecione o perfil que tem acesso ao recurso:

```bash
clickupfy --account produto api v2-get-team-available-fields --input entrada.json
```

Grave a resposta JSON para conferência. O arquivo de entrada usa o envelope do exemplo anterior:

```bash
clickupfy --json api v2-get-team-available-fields --input entrada.json > resposta.json
```

### `clickupfy_api_v2_get_team_available_fields`

A operação `getTeamAvailableFields` pertence ao grupo `Custom Fields` e usa
`GET /api/v2/team/{team_id}/field`.

A chamada consulta o recurso sem modificá-lo.

A resposta preserva o JSON da API; respostas sem corpo retornam `{}`.
A API key do perfil precisa ter acesso ao recurso. As permissões e o plano do Workspace podem restringir o endpoint.
Os campos omitidos são tratados pelo servidor do ClickUp, sem padrões adicionais do cliente.

[Referência oficial](https://developer.clickup.com/reference/getteamavailablefields).

| Entrada | Tipo | Obrigatória |
| --- | --- | --- |
| `path.team_id` | `number` | sim |
| `query.include_applied_objects` | `boolean` | não |

`account` é opcional e usa o perfil ativo ou fixado no MCP. O retorno aparece em
`content` como JSON; recusas retornam `isError: true`. Ferramentas de escrita
ficam ausentes em `--read-only`. IDs explícitos devem respeitar a hierarquia fixada.

Exemplos:

Use o perfil ativo com o envelope mínimo:

```json
{
  "name": "clickupfy_api_v2_get_team_available_fields",
  "arguments": {
    "path": {
      "team_id": 1
    }
  }
}
```

Direcione a chamada ao perfil de desenvolvimento:

```json
{
  "name": "clickupfy_api_v2_get_team_available_fields",
  "arguments": {
    "path": {
      "team_id": 1
    },
    "account": "dev"
  }
}
```

Use o perfil do produto, quando o MCP permitir selecionar outro perfil:

```json
{
  "name": "clickupfy_api_v2_get_team_available_fields",
  "arguments": {
    "path": {
      "team_id": 1
    },
    "account": "produto"
  }
}
```

Consulte o schema antes de compor uma chamada pelo agente:

```bash
clickupfy api describe clickupfy_api_v2_get_team_available_fields
```

Reproduza pelo CLI a entrada usada pelo agente, sem executar a operação:

```bash
printf '%s' '{"path":{"team_id":1}}' | clickupfy api v2-get-team-available-fields --input - --dry-run
```

### `clickupfy api v2-set-custom-field-value`

A operação `SetCustomFieldValue` pertence ao grupo `Custom Fields` e usa
`POST /api/v2/task/{task_id}/field/{field_id}`.

A chamada altera o recurso indicado pelos parâmetros. Confira o resultado com a consulta correspondente antes de continuar.

A resposta preserva o JSON da API; respostas sem corpo retornam `{}`.
A API key do perfil precisa ter acesso ao recurso. As permissões e o plano do Workspace podem restringir o endpoint.
Os campos omitidos são tratados pelo servidor do ClickUp, sem padrões adicionais do cliente.

[Referência oficial](https://developer.clickup.com/reference/setcustomfieldvalue).

| Entrada | Tipo | Obrigatória |
| --- | --- | --- |
| `path.task_id` | `string` | sim |
| `path.field_id` | `string` | sim |
| `query.custom_task_ids` | `boolean` | não |
| `query.team_id` | `number` | não |
| `body` | objeto conforme `api describe` | sim |

O comando aceita as flags comuns de `api`: `--input`, `--path`, `--query`,
`--body`, `--body-file`, `--content-type`, `--file`, `--dry-run` e `--yes`.
A referência completa de tipos, campos aninhados e valores permitidos está no comando `describe` abaixo.

Exemplos:

Consulte o contrato antes de preencher os IDs reais:

```bash
clickupfy api describe v2-set-custom-field-value
```

Valide uma entrada em arquivo sem enviar uma requisição:

```bash
clickupfy api v2-set-custom-field-value --input entrada.json --dry-run
```

Use um envelope JSON pelo stdin:

```bash
printf '%s' '{"path":{"task_id":"exemplo-1","field_id":"exemplo-1"},"body":{"value":"exemplo-1"}}' | clickupfy api v2-set-custom-field-value --input -
```

Selecione o perfil que tem acesso ao recurso:

```bash
clickupfy --account produto api v2-set-custom-field-value --input entrada.json
```

Grave a resposta JSON para conferência. O arquivo de entrada usa o envelope do exemplo anterior:

```bash
clickupfy --json api v2-set-custom-field-value --input entrada.json > resposta.json
```

### `clickupfy_api_v2_set_custom_field_value`

A operação `SetCustomFieldValue` pertence ao grupo `Custom Fields` e usa
`POST /api/v2/task/{task_id}/field/{field_id}`.

A chamada altera o recurso indicado pelos parâmetros. Confira o resultado com a consulta correspondente antes de continuar.

A resposta preserva o JSON da API; respostas sem corpo retornam `{}`.
A API key do perfil precisa ter acesso ao recurso. As permissões e o plano do Workspace podem restringir o endpoint.
Os campos omitidos são tratados pelo servidor do ClickUp, sem padrões adicionais do cliente.

[Referência oficial](https://developer.clickup.com/reference/setcustomfieldvalue).

| Entrada | Tipo | Obrigatória |
| --- | --- | --- |
| `path.task_id` | `string` | sim |
| `path.field_id` | `string` | sim |
| `query.custom_task_ids` | `boolean` | não |
| `query.team_id` | `number` | não |
| `body` | objeto conforme `api describe` | sim |

`account` é opcional e usa o perfil ativo ou fixado no MCP. O retorno aparece em
`content` como JSON; recusas retornam `isError: true`. Ferramentas de escrita
ficam ausentes em `--read-only`. IDs explícitos devem respeitar a hierarquia fixada.

Exemplos:

Use o perfil ativo com o envelope mínimo:

```json
{
  "name": "clickupfy_api_v2_set_custom_field_value",
  "arguments": {
    "path": {
      "task_id": "exemplo-1",
      "field_id": "exemplo-1"
    },
    "body": {
      "value": "exemplo-1"
    }
  }
}
```

Direcione a chamada ao perfil de desenvolvimento:

```json
{
  "name": "clickupfy_api_v2_set_custom_field_value",
  "arguments": {
    "path": {
      "task_id": "exemplo-1",
      "field_id": "exemplo-1"
    },
    "body": {
      "value": "exemplo-1"
    },
    "account": "dev"
  }
}
```

Use o perfil do produto, quando o MCP permitir selecionar outro perfil:

```json
{
  "name": "clickupfy_api_v2_set_custom_field_value",
  "arguments": {
    "path": {
      "task_id": "exemplo-1",
      "field_id": "exemplo-1"
    },
    "body": {
      "value": "exemplo-1"
    },
    "account": "produto"
  }
}
```

Consulte o schema antes de compor uma chamada pelo agente:

```bash
clickupfy api describe clickupfy_api_v2_set_custom_field_value
```

Reproduza pelo CLI a entrada usada pelo agente, sem executar a operação:

```bash
printf '%s' '{"path":{"task_id":"exemplo-1","field_id":"exemplo-1"},"body":{"value":"exemplo-1"}}' | clickupfy api v2-set-custom-field-value --input - --dry-run
```

### `clickupfy api v2-remove-custom-field-value`

A operação `RemoveCustomFieldValue` pertence ao grupo `Custom Fields` e usa
`DELETE /api/v2/task/{task_id}/field/{field_id}`.

A chamada altera o recurso indicado pelos parâmetros. Confira o resultado com a consulta correspondente antes de continuar.

A resposta preserva o JSON da API; respostas sem corpo retornam `{}`.
A API key do perfil precisa ter acesso ao recurso. As permissões e o plano do Workspace podem restringir o endpoint.
Os campos omitidos são tratados pelo servidor do ClickUp, sem padrões adicionais do cliente.

[Referência oficial](https://developer.clickup.com/reference/removecustomfieldvalue).

| Entrada | Tipo | Obrigatória |
| --- | --- | --- |
| `path.task_id` | `string` | sim |
| `path.field_id` | `string` | sim |
| `query.custom_task_ids` | `boolean` | não |
| `query.team_id` | `number` | não |
| `confirm` | boolean, somente `true` | sim |

O comando aceita as flags comuns de `api`: `--input`, `--path`, `--query`,
`--body`, `--body-file`, `--content-type`, `--file`, `--dry-run` e `--yes`.
A referência completa de tipos, campos aninhados e valores permitidos está no comando `describe` abaixo.

Exemplos:

Consulte o contrato antes de preencher os IDs reais:

```bash
clickupfy api describe v2-remove-custom-field-value
```

Valide uma entrada em arquivo sem enviar uma requisição:

```bash
clickupfy api v2-remove-custom-field-value --input entrada.json --dry-run
```

Use um envelope JSON pelo stdin:

```bash
printf '%s' '{"path":{"task_id":"exemplo-1","field_id":"exemplo-1"},"confirm":true}' | clickupfy api v2-remove-custom-field-value --input -
```

Selecione o perfil que tem acesso ao recurso:

```bash
clickupfy --account produto api v2-remove-custom-field-value --input entrada.json
```

Grave a resposta JSON para conferência. O arquivo de entrada usa o envelope do exemplo anterior:

```bash
clickupfy --json api v2-remove-custom-field-value --input entrada.json > resposta.json
```

### `clickupfy_api_v2_remove_custom_field_value`

A operação `RemoveCustomFieldValue` pertence ao grupo `Custom Fields` e usa
`DELETE /api/v2/task/{task_id}/field/{field_id}`.

A chamada altera o recurso indicado pelos parâmetros. Confira o resultado com a consulta correspondente antes de continuar.

A resposta preserva o JSON da API; respostas sem corpo retornam `{}`.
A API key do perfil precisa ter acesso ao recurso. As permissões e o plano do Workspace podem restringir o endpoint.
Os campos omitidos são tratados pelo servidor do ClickUp, sem padrões adicionais do cliente.

[Referência oficial](https://developer.clickup.com/reference/removecustomfieldvalue).

| Entrada | Tipo | Obrigatória |
| --- | --- | --- |
| `path.task_id` | `string` | sim |
| `path.field_id` | `string` | sim |
| `query.custom_task_ids` | `boolean` | não |
| `query.team_id` | `number` | não |
| `confirm` | boolean, somente `true` | sim |

`account` é opcional e usa o perfil ativo ou fixado no MCP. O retorno aparece em
`content` como JSON; recusas retornam `isError: true`. Ferramentas de escrita
ficam ausentes em `--read-only`. IDs explícitos devem respeitar a hierarquia fixada.

Exemplos:

Use o perfil ativo com o envelope mínimo:

```json
{
  "name": "clickupfy_api_v2_remove_custom_field_value",
  "arguments": {
    "path": {
      "task_id": "exemplo-1",
      "field_id": "exemplo-1"
    },
    "confirm": true
  }
}
```

Direcione a chamada ao perfil de desenvolvimento:

```json
{
  "name": "clickupfy_api_v2_remove_custom_field_value",
  "arguments": {
    "path": {
      "task_id": "exemplo-1",
      "field_id": "exemplo-1"
    },
    "confirm": true,
    "account": "dev"
  }
}
```

Use o perfil do produto, quando o MCP permitir selecionar outro perfil:

```json
{
  "name": "clickupfy_api_v2_remove_custom_field_value",
  "arguments": {
    "path": {
      "task_id": "exemplo-1",
      "field_id": "exemplo-1"
    },
    "confirm": true,
    "account": "produto"
  }
}
```

Consulte o schema antes de compor uma chamada pelo agente:

```bash
clickupfy api describe clickupfy_api_v2_remove_custom_field_value
```

Reproduza pelo CLI a entrada usada pelo agente, sem executar a operação:

```bash
printf '%s' '{"path":{"task_id":"exemplo-1","field_id":"exemplo-1"},"confirm":true}' | clickupfy api v2-remove-custom-field-value --input - --dry-run
```

### `clickupfy api v2-add-dependency`

A operação `AddDependency` pertence ao grupo `Task Relationships` e usa
`POST /api/v2/task/{task_id}/dependency`.

A chamada altera o recurso indicado pelos parâmetros. Confira o resultado com a consulta correspondente antes de continuar.

A resposta preserva o JSON da API; respostas sem corpo retornam `{}`.
A API key do perfil precisa ter acesso ao recurso. As permissões e o plano do Workspace podem restringir o endpoint.
Os campos omitidos são tratados pelo servidor do ClickUp, sem padrões adicionais do cliente.

[Referência oficial](https://developer.clickup.com/reference/adddependency).

| Entrada | Tipo | Obrigatória |
| --- | --- | --- |
| `path.task_id` | `string` | sim |
| `query.custom_task_ids` | `boolean` | não |
| `query.team_id` | `number` | não |
| `body` | objeto conforme `api describe` | sim |

O comando aceita as flags comuns de `api`: `--input`, `--path`, `--query`,
`--body`, `--body-file`, `--content-type`, `--file`, `--dry-run` e `--yes`.
A referência completa de tipos, campos aninhados e valores permitidos está no comando `describe` abaixo.

Exemplos:

Consulte o contrato antes de preencher os IDs reais:

```bash
clickupfy api describe v2-add-dependency
```

Valide uma entrada em arquivo sem enviar uma requisição:

```bash
clickupfy api v2-add-dependency --input entrada.json --dry-run
```

Use um envelope JSON pelo stdin:

```bash
printf '%s' '{"path":{"task_id":"exemplo-1"},"body":{}}' | clickupfy api v2-add-dependency --input -
```

Selecione o perfil que tem acesso ao recurso:

```bash
clickupfy --account produto api v2-add-dependency --input entrada.json
```

Grave a resposta JSON para conferência. O arquivo de entrada usa o envelope do exemplo anterior:

```bash
clickupfy --json api v2-add-dependency --input entrada.json > resposta.json
```

### `clickupfy_api_v2_add_dependency`

A operação `AddDependency` pertence ao grupo `Task Relationships` e usa
`POST /api/v2/task/{task_id}/dependency`.

A chamada altera o recurso indicado pelos parâmetros. Confira o resultado com a consulta correspondente antes de continuar.

A resposta preserva o JSON da API; respostas sem corpo retornam `{}`.
A API key do perfil precisa ter acesso ao recurso. As permissões e o plano do Workspace podem restringir o endpoint.
Os campos omitidos são tratados pelo servidor do ClickUp, sem padrões adicionais do cliente.

[Referência oficial](https://developer.clickup.com/reference/adddependency).

| Entrada | Tipo | Obrigatória |
| --- | --- | --- |
| `path.task_id` | `string` | sim |
| `query.custom_task_ids` | `boolean` | não |
| `query.team_id` | `number` | não |
| `body` | objeto conforme `api describe` | sim |

`account` é opcional e usa o perfil ativo ou fixado no MCP. O retorno aparece em
`content` como JSON; recusas retornam `isError: true`. Ferramentas de escrita
ficam ausentes em `--read-only`. IDs explícitos devem respeitar a hierarquia fixada.

Exemplos:

Use o perfil ativo com o envelope mínimo:

```json
{
  "name": "clickupfy_api_v2_add_dependency",
  "arguments": {
    "path": {
      "task_id": "exemplo-1"
    },
    "body": {}
  }
}
```

Direcione a chamada ao perfil de desenvolvimento:

```json
{
  "name": "clickupfy_api_v2_add_dependency",
  "arguments": {
    "path": {
      "task_id": "exemplo-1"
    },
    "body": {},
    "account": "dev"
  }
}
```

Use o perfil do produto, quando o MCP permitir selecionar outro perfil:

```json
{
  "name": "clickupfy_api_v2_add_dependency",
  "arguments": {
    "path": {
      "task_id": "exemplo-1"
    },
    "body": {},
    "account": "produto"
  }
}
```

Consulte o schema antes de compor uma chamada pelo agente:

```bash
clickupfy api describe clickupfy_api_v2_add_dependency
```

Reproduza pelo CLI a entrada usada pelo agente, sem executar a operação:

```bash
printf '%s' '{"path":{"task_id":"exemplo-1"},"body":{}}' | clickupfy api v2-add-dependency --input - --dry-run
```

### `clickupfy api v2-delete-dependency`

A operação `DeleteDependency` pertence ao grupo `Task Relationships` e usa
`DELETE /api/v2/task/{task_id}/dependency`.

A chamada altera o recurso indicado pelos parâmetros. Confira o resultado com a consulta correspondente antes de continuar.

A resposta preserva o JSON da API; respostas sem corpo retornam `{}`.
A API key do perfil precisa ter acesso ao recurso. As permissões e o plano do Workspace podem restringir o endpoint.
Os campos omitidos são tratados pelo servidor do ClickUp, sem padrões adicionais do cliente.

[Referência oficial](https://developer.clickup.com/reference/deletedependency).

| Entrada | Tipo | Obrigatória |
| --- | --- | --- |
| `path.task_id` | `string` | sim |
| `query.depends_on` | `string` | sim |
| `query.dependency_of` | `string` | sim |
| `query.custom_task_ids` | `boolean` | não |
| `query.team_id` | `number` | não |
| `confirm` | boolean, somente `true` | sim |

O comando aceita as flags comuns de `api`: `--input`, `--path`, `--query`,
`--body`, `--body-file`, `--content-type`, `--file`, `--dry-run` e `--yes`.
A referência completa de tipos, campos aninhados e valores permitidos está no comando `describe` abaixo.

Exemplos:

Consulte o contrato antes de preencher os IDs reais:

```bash
clickupfy api describe v2-delete-dependency
```

Valide uma entrada em arquivo sem enviar uma requisição:

```bash
clickupfy api v2-delete-dependency --input entrada.json --dry-run
```

Use um envelope JSON pelo stdin:

```bash
printf '%s' '{"path":{"task_id":"exemplo-1"},"query":{"depends_on":"exemplo-1","dependency_of":"exemplo-1"},"confirm":true}' | clickupfy api v2-delete-dependency --input -
```

Selecione o perfil que tem acesso ao recurso:

```bash
clickupfy --account produto api v2-delete-dependency --input entrada.json
```

Grave a resposta JSON para conferência. O arquivo de entrada usa o envelope do exemplo anterior:

```bash
clickupfy --json api v2-delete-dependency --input entrada.json > resposta.json
```

### `clickupfy_api_v2_delete_dependency`

A operação `DeleteDependency` pertence ao grupo `Task Relationships` e usa
`DELETE /api/v2/task/{task_id}/dependency`.

A chamada altera o recurso indicado pelos parâmetros. Confira o resultado com a consulta correspondente antes de continuar.

A resposta preserva o JSON da API; respostas sem corpo retornam `{}`.
A API key do perfil precisa ter acesso ao recurso. As permissões e o plano do Workspace podem restringir o endpoint.
Os campos omitidos são tratados pelo servidor do ClickUp, sem padrões adicionais do cliente.

[Referência oficial](https://developer.clickup.com/reference/deletedependency).

| Entrada | Tipo | Obrigatória |
| --- | --- | --- |
| `path.task_id` | `string` | sim |
| `query.depends_on` | `string` | sim |
| `query.dependency_of` | `string` | sim |
| `query.custom_task_ids` | `boolean` | não |
| `query.team_id` | `number` | não |
| `confirm` | boolean, somente `true` | sim |

`account` é opcional e usa o perfil ativo ou fixado no MCP. O retorno aparece em
`content` como JSON; recusas retornam `isError: true`. Ferramentas de escrita
ficam ausentes em `--read-only`. IDs explícitos devem respeitar a hierarquia fixada.

Exemplos:

Use o perfil ativo com o envelope mínimo:

```json
{
  "name": "clickupfy_api_v2_delete_dependency",
  "arguments": {
    "path": {
      "task_id": "exemplo-1"
    },
    "query": {
      "depends_on": "exemplo-1",
      "dependency_of": "exemplo-1"
    },
    "confirm": true
  }
}
```

Direcione a chamada ao perfil de desenvolvimento:

```json
{
  "name": "clickupfy_api_v2_delete_dependency",
  "arguments": {
    "path": {
      "task_id": "exemplo-1"
    },
    "query": {
      "depends_on": "exemplo-1",
      "dependency_of": "exemplo-1"
    },
    "confirm": true,
    "account": "dev"
  }
}
```

Use o perfil do produto, quando o MCP permitir selecionar outro perfil:

```json
{
  "name": "clickupfy_api_v2_delete_dependency",
  "arguments": {
    "path": {
      "task_id": "exemplo-1"
    },
    "query": {
      "depends_on": "exemplo-1",
      "dependency_of": "exemplo-1"
    },
    "confirm": true,
    "account": "produto"
  }
}
```

Consulte o schema antes de compor uma chamada pelo agente:

```bash
clickupfy api describe clickupfy_api_v2_delete_dependency
```

Reproduza pelo CLI a entrada usada pelo agente, sem executar a operação:

```bash
printf '%s' '{"path":{"task_id":"exemplo-1"},"query":{"depends_on":"exemplo-1","dependency_of":"exemplo-1"},"confirm":true}' | clickupfy api v2-delete-dependency --input - --dry-run
```

### `clickupfy api v2-add-task-link`

A operação `AddTaskLink` pertence ao grupo `Task Relationships` e usa
`POST /api/v2/task/{task_id}/link/{links_to}`.

A chamada altera o recurso indicado pelos parâmetros. Confira o resultado com a consulta correspondente antes de continuar.

A resposta preserva o JSON da API; respostas sem corpo retornam `{}`.
A API key do perfil precisa ter acesso ao recurso. As permissões e o plano do Workspace podem restringir o endpoint.
Os campos omitidos são tratados pelo servidor do ClickUp, sem padrões adicionais do cliente.

[Referência oficial](https://developer.clickup.com/reference/addtasklink).

| Entrada | Tipo | Obrigatória |
| --- | --- | --- |
| `path.task_id` | `string` | sim |
| `path.links_to` | `string` | sim |
| `query.custom_task_ids` | `boolean` | não |
| `query.team_id` | `number` | não |

O comando aceita as flags comuns de `api`: `--input`, `--path`, `--query`,
`--body`, `--body-file`, `--content-type`, `--file`, `--dry-run` e `--yes`.
A referência completa de tipos, campos aninhados e valores permitidos está no comando `describe` abaixo.

Exemplos:

Consulte o contrato antes de preencher os IDs reais:

```bash
clickupfy api describe v2-add-task-link
```

Valide uma entrada em arquivo sem enviar uma requisição:

```bash
clickupfy api v2-add-task-link --input entrada.json --dry-run
```

Use um envelope JSON pelo stdin:

```bash
printf '%s' '{"path":{"task_id":"exemplo-1","links_to":"exemplo-1"}}' | clickupfy api v2-add-task-link --input -
```

Selecione o perfil que tem acesso ao recurso:

```bash
clickupfy --account produto api v2-add-task-link --input entrada.json
```

Grave a resposta JSON para conferência. O arquivo de entrada usa o envelope do exemplo anterior:

```bash
clickupfy --json api v2-add-task-link --input entrada.json > resposta.json
```

### `clickupfy_api_v2_add_task_link`

A operação `AddTaskLink` pertence ao grupo `Task Relationships` e usa
`POST /api/v2/task/{task_id}/link/{links_to}`.

A chamada altera o recurso indicado pelos parâmetros. Confira o resultado com a consulta correspondente antes de continuar.

A resposta preserva o JSON da API; respostas sem corpo retornam `{}`.
A API key do perfil precisa ter acesso ao recurso. As permissões e o plano do Workspace podem restringir o endpoint.
Os campos omitidos são tratados pelo servidor do ClickUp, sem padrões adicionais do cliente.

[Referência oficial](https://developer.clickup.com/reference/addtasklink).

| Entrada | Tipo | Obrigatória |
| --- | --- | --- |
| `path.task_id` | `string` | sim |
| `path.links_to` | `string` | sim |
| `query.custom_task_ids` | `boolean` | não |
| `query.team_id` | `number` | não |

`account` é opcional e usa o perfil ativo ou fixado no MCP. O retorno aparece em
`content` como JSON; recusas retornam `isError: true`. Ferramentas de escrita
ficam ausentes em `--read-only`. IDs explícitos devem respeitar a hierarquia fixada.

Exemplos:

Use o perfil ativo com o envelope mínimo:

```json
{
  "name": "clickupfy_api_v2_add_task_link",
  "arguments": {
    "path": {
      "task_id": "exemplo-1",
      "links_to": "exemplo-1"
    }
  }
}
```

Direcione a chamada ao perfil de desenvolvimento:

```json
{
  "name": "clickupfy_api_v2_add_task_link",
  "arguments": {
    "path": {
      "task_id": "exemplo-1",
      "links_to": "exemplo-1"
    },
    "account": "dev"
  }
}
```

Use o perfil do produto, quando o MCP permitir selecionar outro perfil:

```json
{
  "name": "clickupfy_api_v2_add_task_link",
  "arguments": {
    "path": {
      "task_id": "exemplo-1",
      "links_to": "exemplo-1"
    },
    "account": "produto"
  }
}
```

Consulte o schema antes de compor uma chamada pelo agente:

```bash
clickupfy api describe clickupfy_api_v2_add_task_link
```

Reproduza pelo CLI a entrada usada pelo agente, sem executar a operação:

```bash
printf '%s' '{"path":{"task_id":"exemplo-1","links_to":"exemplo-1"}}' | clickupfy api v2-add-task-link --input - --dry-run
```

### `clickupfy api v2-delete-task-link`

A operação `DeleteTaskLink` pertence ao grupo `Task Relationships` e usa
`DELETE /api/v2/task/{task_id}/link/{links_to}`.

A chamada altera o recurso indicado pelos parâmetros. Confira o resultado com a consulta correspondente antes de continuar.

A resposta preserva o JSON da API; respostas sem corpo retornam `{}`.
A API key do perfil precisa ter acesso ao recurso. As permissões e o plano do Workspace podem restringir o endpoint.
Os campos omitidos são tratados pelo servidor do ClickUp, sem padrões adicionais do cliente.

[Referência oficial](https://developer.clickup.com/reference/deletetasklink).

| Entrada | Tipo | Obrigatória |
| --- | --- | --- |
| `path.task_id` | `string` | sim |
| `path.links_to` | `string` | sim |
| `query.custom_task_ids` | `boolean` | não |
| `query.team_id` | `number` | não |
| `confirm` | boolean, somente `true` | sim |

O comando aceita as flags comuns de `api`: `--input`, `--path`, `--query`,
`--body`, `--body-file`, `--content-type`, `--file`, `--dry-run` e `--yes`.
A referência completa de tipos, campos aninhados e valores permitidos está no comando `describe` abaixo.

Exemplos:

Consulte o contrato antes de preencher os IDs reais:

```bash
clickupfy api describe v2-delete-task-link
```

Valide uma entrada em arquivo sem enviar uma requisição:

```bash
clickupfy api v2-delete-task-link --input entrada.json --dry-run
```

Use um envelope JSON pelo stdin:

```bash
printf '%s' '{"path":{"task_id":"exemplo-1","links_to":"exemplo-1"},"confirm":true}' | clickupfy api v2-delete-task-link --input -
```

Selecione o perfil que tem acesso ao recurso:

```bash
clickupfy --account produto api v2-delete-task-link --input entrada.json
```

Grave a resposta JSON para conferência. O arquivo de entrada usa o envelope do exemplo anterior:

```bash
clickupfy --json api v2-delete-task-link --input entrada.json > resposta.json
```

### `clickupfy_api_v2_delete_task_link`

A operação `DeleteTaskLink` pertence ao grupo `Task Relationships` e usa
`DELETE /api/v2/task/{task_id}/link/{links_to}`.

A chamada altera o recurso indicado pelos parâmetros. Confira o resultado com a consulta correspondente antes de continuar.

A resposta preserva o JSON da API; respostas sem corpo retornam `{}`.
A API key do perfil precisa ter acesso ao recurso. As permissões e o plano do Workspace podem restringir o endpoint.
Os campos omitidos são tratados pelo servidor do ClickUp, sem padrões adicionais do cliente.

[Referência oficial](https://developer.clickup.com/reference/deletetasklink).

| Entrada | Tipo | Obrigatória |
| --- | --- | --- |
| `path.task_id` | `string` | sim |
| `path.links_to` | `string` | sim |
| `query.custom_task_ids` | `boolean` | não |
| `query.team_id` | `number` | não |
| `confirm` | boolean, somente `true` | sim |

`account` é opcional e usa o perfil ativo ou fixado no MCP. O retorno aparece em
`content` como JSON; recusas retornam `isError: true`. Ferramentas de escrita
ficam ausentes em `--read-only`. IDs explícitos devem respeitar a hierarquia fixada.

Exemplos:

Use o perfil ativo com o envelope mínimo:

```json
{
  "name": "clickupfy_api_v2_delete_task_link",
  "arguments": {
    "path": {
      "task_id": "exemplo-1",
      "links_to": "exemplo-1"
    },
    "confirm": true
  }
}
```

Direcione a chamada ao perfil de desenvolvimento:

```json
{
  "name": "clickupfy_api_v2_delete_task_link",
  "arguments": {
    "path": {
      "task_id": "exemplo-1",
      "links_to": "exemplo-1"
    },
    "confirm": true,
    "account": "dev"
  }
}
```

Use o perfil do produto, quando o MCP permitir selecionar outro perfil:

```json
{
  "name": "clickupfy_api_v2_delete_task_link",
  "arguments": {
    "path": {
      "task_id": "exemplo-1",
      "links_to": "exemplo-1"
    },
    "confirm": true,
    "account": "produto"
  }
}
```

Consulte o schema antes de compor uma chamada pelo agente:

```bash
clickupfy api describe clickupfy_api_v2_delete_task_link
```

Reproduza pelo CLI a entrada usada pelo agente, sem executar a operação:

```bash
printf '%s' '{"path":{"task_id":"exemplo-1","links_to":"exemplo-1"},"confirm":true}' | clickupfy api v2-delete-task-link --input - --dry-run
```

### `clickupfy api v2-get-folders`

A operação `GetFolders` pertence ao grupo `Folders` e usa
`GET /api/v2/space/{space_id}/folder`.

A chamada consulta o recurso sem modificá-lo.

A resposta preserva o JSON da API; respostas sem corpo retornam `{}`.
A API key do perfil precisa ter acesso ao recurso. As permissões e o plano do Workspace podem restringir o endpoint.
Os campos omitidos são tratados pelo servidor do ClickUp, sem padrões adicionais do cliente.

[Referência oficial](https://developer.clickup.com/reference/getfolders).

| Entrada | Tipo | Obrigatória |
| --- | --- | --- |
| `path.space_id` | `number` | sim |
| `query.archived` | `boolean` | não |

O comando aceita as flags comuns de `api`: `--input`, `--path`, `--query`,
`--body`, `--body-file`, `--content-type`, `--file`, `--dry-run` e `--yes`.
A referência completa de tipos, campos aninhados e valores permitidos está no comando `describe` abaixo.

Exemplos:

Consulte o contrato antes de preencher os IDs reais:

```bash
clickupfy api describe v2-get-folders
```

Valide uma entrada em arquivo sem enviar uma requisição:

```bash
clickupfy api v2-get-folders --input entrada.json --dry-run
```

Use um envelope JSON pelo stdin:

```bash
printf '%s' '{"path":{"space_id":1}}' | clickupfy api v2-get-folders --input -
```

Selecione o perfil que tem acesso ao recurso:

```bash
clickupfy --account produto api v2-get-folders --input entrada.json
```

Grave a resposta JSON para conferência. O arquivo de entrada usa o envelope do exemplo anterior:

```bash
clickupfy --json api v2-get-folders --input entrada.json > resposta.json
```

### `clickupfy_api_v2_get_folders`

A operação `GetFolders` pertence ao grupo `Folders` e usa
`GET /api/v2/space/{space_id}/folder`.

A chamada consulta o recurso sem modificá-lo.

A resposta preserva o JSON da API; respostas sem corpo retornam `{}`.
A API key do perfil precisa ter acesso ao recurso. As permissões e o plano do Workspace podem restringir o endpoint.
Os campos omitidos são tratados pelo servidor do ClickUp, sem padrões adicionais do cliente.

[Referência oficial](https://developer.clickup.com/reference/getfolders).

| Entrada | Tipo | Obrigatória |
| --- | --- | --- |
| `path.space_id` | `number` | sim |
| `query.archived` | `boolean` | não |

`account` é opcional e usa o perfil ativo ou fixado no MCP. O retorno aparece em
`content` como JSON; recusas retornam `isError: true`. Ferramentas de escrita
ficam ausentes em `--read-only`. IDs explícitos devem respeitar a hierarquia fixada.

Exemplos:

Use o perfil ativo com o envelope mínimo:

```json
{
  "name": "clickupfy_api_v2_get_folders",
  "arguments": {
    "path": {
      "space_id": 1
    }
  }
}
```

Direcione a chamada ao perfil de desenvolvimento:

```json
{
  "name": "clickupfy_api_v2_get_folders",
  "arguments": {
    "path": {
      "space_id": 1
    },
    "account": "dev"
  }
}
```

Use o perfil do produto, quando o MCP permitir selecionar outro perfil:

```json
{
  "name": "clickupfy_api_v2_get_folders",
  "arguments": {
    "path": {
      "space_id": 1
    },
    "account": "produto"
  }
}
```

Consulte o schema antes de compor uma chamada pelo agente:

```bash
clickupfy api describe clickupfy_api_v2_get_folders
```

Reproduza pelo CLI a entrada usada pelo agente, sem executar a operação:

```bash
printf '%s' '{"path":{"space_id":1}}' | clickupfy api v2-get-folders --input - --dry-run
```

### `clickupfy api v2-create-folder`

A operação `CreateFolder` pertence ao grupo `Folders` e usa
`POST /api/v2/space/{space_id}/folder`.

A chamada altera o recurso indicado pelos parâmetros. Confira o resultado com a consulta correspondente antes de continuar.

A resposta preserva o JSON da API; respostas sem corpo retornam `{}`.
A API key do perfil precisa ter acesso ao recurso. As permissões e o plano do Workspace podem restringir o endpoint.
Os campos omitidos são tratados pelo servidor do ClickUp, sem padrões adicionais do cliente.

[Referência oficial](https://developer.clickup.com/reference/createfolder).

| Entrada | Tipo | Obrigatória |
| --- | --- | --- |
| `path.space_id` | `number` | sim |
| `body` | objeto conforme `api describe` | sim |

O comando aceita as flags comuns de `api`: `--input`, `--path`, `--query`,
`--body`, `--body-file`, `--content-type`, `--file`, `--dry-run` e `--yes`.
A referência completa de tipos, campos aninhados e valores permitidos está no comando `describe` abaixo.

Exemplos:

Consulte o contrato antes de preencher os IDs reais:

```bash
clickupfy api describe v2-create-folder
```

Valide uma entrada em arquivo sem enviar uma requisição:

```bash
clickupfy api v2-create-folder --input entrada.json --dry-run
```

Use um envelope JSON pelo stdin:

```bash
printf '%s' '{"path":{"space_id":1},"body":{"name":"exemplo-1"}}' | clickupfy api v2-create-folder --input -
```

Selecione o perfil que tem acesso ao recurso:

```bash
clickupfy --account produto api v2-create-folder --input entrada.json
```

Grave a resposta JSON para conferência. O arquivo de entrada usa o envelope do exemplo anterior:

```bash
clickupfy --json api v2-create-folder --input entrada.json > resposta.json
```

### `clickupfy_api_v2_create_folder`

A operação `CreateFolder` pertence ao grupo `Folders` e usa
`POST /api/v2/space/{space_id}/folder`.

A chamada altera o recurso indicado pelos parâmetros. Confira o resultado com a consulta correspondente antes de continuar.

A resposta preserva o JSON da API; respostas sem corpo retornam `{}`.
A API key do perfil precisa ter acesso ao recurso. As permissões e o plano do Workspace podem restringir o endpoint.
Os campos omitidos são tratados pelo servidor do ClickUp, sem padrões adicionais do cliente.

[Referência oficial](https://developer.clickup.com/reference/createfolder).

| Entrada | Tipo | Obrigatória |
| --- | --- | --- |
| `path.space_id` | `number` | sim |
| `body` | objeto conforme `api describe` | sim |

`account` é opcional e usa o perfil ativo ou fixado no MCP. O retorno aparece em
`content` como JSON; recusas retornam `isError: true`. Ferramentas de escrita
ficam ausentes em `--read-only`. IDs explícitos devem respeitar a hierarquia fixada.

Exemplos:

Use o perfil ativo com o envelope mínimo:

```json
{
  "name": "clickupfy_api_v2_create_folder",
  "arguments": {
    "path": {
      "space_id": 1
    },
    "body": {
      "name": "exemplo-1"
    }
  }
}
```

Direcione a chamada ao perfil de desenvolvimento:

```json
{
  "name": "clickupfy_api_v2_create_folder",
  "arguments": {
    "path": {
      "space_id": 1
    },
    "body": {
      "name": "exemplo-1"
    },
    "account": "dev"
  }
}
```

Use o perfil do produto, quando o MCP permitir selecionar outro perfil:

```json
{
  "name": "clickupfy_api_v2_create_folder",
  "arguments": {
    "path": {
      "space_id": 1
    },
    "body": {
      "name": "exemplo-1"
    },
    "account": "produto"
  }
}
```

Consulte o schema antes de compor uma chamada pelo agente:

```bash
clickupfy api describe clickupfy_api_v2_create_folder
```

Reproduza pelo CLI a entrada usada pelo agente, sem executar a operação:

```bash
printf '%s' '{"path":{"space_id":1},"body":{"name":"exemplo-1"}}' | clickupfy api v2-create-folder --input - --dry-run
```

### `clickupfy api v2-get-folder`

A operação `GetFolder` pertence ao grupo `Folders` e usa
`GET /api/v2/folder/{folder_id}`.

A chamada consulta o recurso sem modificá-lo.

A resposta preserva o JSON da API; respostas sem corpo retornam `{}`.
A API key do perfil precisa ter acesso ao recurso. As permissões e o plano do Workspace podem restringir o endpoint.
Os campos omitidos são tratados pelo servidor do ClickUp, sem padrões adicionais do cliente.

[Referência oficial](https://developer.clickup.com/reference/getfolder).

| Entrada | Tipo | Obrigatória |
| --- | --- | --- |
| `path.folder_id` | `number` | sim |
| `query.include_subfolders` | `boolean` | não |

O comando aceita as flags comuns de `api`: `--input`, `--path`, `--query`,
`--body`, `--body-file`, `--content-type`, `--file`, `--dry-run` e `--yes`.
A referência completa de tipos, campos aninhados e valores permitidos está no comando `describe` abaixo.

Exemplos:

Consulte o contrato antes de preencher os IDs reais:

```bash
clickupfy api describe v2-get-folder
```

Valide uma entrada em arquivo sem enviar uma requisição:

```bash
clickupfy api v2-get-folder --input entrada.json --dry-run
```

Use um envelope JSON pelo stdin:

```bash
printf '%s' '{"path":{"folder_id":1}}' | clickupfy api v2-get-folder --input -
```

Selecione o perfil que tem acesso ao recurso:

```bash
clickupfy --account produto api v2-get-folder --input entrada.json
```

Grave a resposta JSON para conferência. O arquivo de entrada usa o envelope do exemplo anterior:

```bash
clickupfy --json api v2-get-folder --input entrada.json > resposta.json
```

### `clickupfy_api_v2_get_folder`

A operação `GetFolder` pertence ao grupo `Folders` e usa
`GET /api/v2/folder/{folder_id}`.

A chamada consulta o recurso sem modificá-lo.

A resposta preserva o JSON da API; respostas sem corpo retornam `{}`.
A API key do perfil precisa ter acesso ao recurso. As permissões e o plano do Workspace podem restringir o endpoint.
Os campos omitidos são tratados pelo servidor do ClickUp, sem padrões adicionais do cliente.

[Referência oficial](https://developer.clickup.com/reference/getfolder).

| Entrada | Tipo | Obrigatória |
| --- | --- | --- |
| `path.folder_id` | `number` | sim |
| `query.include_subfolders` | `boolean` | não |

`account` é opcional e usa o perfil ativo ou fixado no MCP. O retorno aparece em
`content` como JSON; recusas retornam `isError: true`. Ferramentas de escrita
ficam ausentes em `--read-only`. IDs explícitos devem respeitar a hierarquia fixada.

Exemplos:

Use o perfil ativo com o envelope mínimo:

```json
{
  "name": "clickupfy_api_v2_get_folder",
  "arguments": {
    "path": {
      "folder_id": 1
    }
  }
}
```

Direcione a chamada ao perfil de desenvolvimento:

```json
{
  "name": "clickupfy_api_v2_get_folder",
  "arguments": {
    "path": {
      "folder_id": 1
    },
    "account": "dev"
  }
}
```

Use o perfil do produto, quando o MCP permitir selecionar outro perfil:

```json
{
  "name": "clickupfy_api_v2_get_folder",
  "arguments": {
    "path": {
      "folder_id": 1
    },
    "account": "produto"
  }
}
```

Consulte o schema antes de compor uma chamada pelo agente:

```bash
clickupfy api describe clickupfy_api_v2_get_folder
```

Reproduza pelo CLI a entrada usada pelo agente, sem executar a operação:

```bash
printf '%s' '{"path":{"folder_id":1}}' | clickupfy api v2-get-folder --input - --dry-run
```

### `clickupfy api v2-update-folder`

A operação `UpdateFolder` pertence ao grupo `Folders` e usa
`PUT /api/v2/folder/{folder_id}`.

A chamada altera o recurso indicado pelos parâmetros. Confira o resultado com a consulta correspondente antes de continuar.

A resposta preserva o JSON da API; respostas sem corpo retornam `{}`.
A API key do perfil precisa ter acesso ao recurso. As permissões e o plano do Workspace podem restringir o endpoint.
Os campos omitidos são tratados pelo servidor do ClickUp, sem padrões adicionais do cliente.

[Referência oficial](https://developer.clickup.com/reference/updatefolder).

| Entrada | Tipo | Obrigatória |
| --- | --- | --- |
| `path.folder_id` | `number` | sim |
| `body` | objeto conforme `api describe` | sim |

O comando aceita as flags comuns de `api`: `--input`, `--path`, `--query`,
`--body`, `--body-file`, `--content-type`, `--file`, `--dry-run` e `--yes`.
A referência completa de tipos, campos aninhados e valores permitidos está no comando `describe` abaixo.

Exemplos:

Consulte o contrato antes de preencher os IDs reais:

```bash
clickupfy api describe v2-update-folder
```

Valide uma entrada em arquivo sem enviar uma requisição:

```bash
clickupfy api v2-update-folder --input entrada.json --dry-run
```

Use um envelope JSON pelo stdin:

```bash
printf '%s' '{"path":{"folder_id":1},"body":{"name":"exemplo-1"}}' | clickupfy api v2-update-folder --input -
```

Selecione o perfil que tem acesso ao recurso:

```bash
clickupfy --account produto api v2-update-folder --input entrada.json
```

Grave a resposta JSON para conferência. O arquivo de entrada usa o envelope do exemplo anterior:

```bash
clickupfy --json api v2-update-folder --input entrada.json > resposta.json
```

### `clickupfy_api_v2_update_folder`

A operação `UpdateFolder` pertence ao grupo `Folders` e usa
`PUT /api/v2/folder/{folder_id}`.

A chamada altera o recurso indicado pelos parâmetros. Confira o resultado com a consulta correspondente antes de continuar.

A resposta preserva o JSON da API; respostas sem corpo retornam `{}`.
A API key do perfil precisa ter acesso ao recurso. As permissões e o plano do Workspace podem restringir o endpoint.
Os campos omitidos são tratados pelo servidor do ClickUp, sem padrões adicionais do cliente.

[Referência oficial](https://developer.clickup.com/reference/updatefolder).

| Entrada | Tipo | Obrigatória |
| --- | --- | --- |
| `path.folder_id` | `number` | sim |
| `body` | objeto conforme `api describe` | sim |

`account` é opcional e usa o perfil ativo ou fixado no MCP. O retorno aparece em
`content` como JSON; recusas retornam `isError: true`. Ferramentas de escrita
ficam ausentes em `--read-only`. IDs explícitos devem respeitar a hierarquia fixada.

Exemplos:

Use o perfil ativo com o envelope mínimo:

```json
{
  "name": "clickupfy_api_v2_update_folder",
  "arguments": {
    "path": {
      "folder_id": 1
    },
    "body": {
      "name": "exemplo-1"
    }
  }
}
```

Direcione a chamada ao perfil de desenvolvimento:

```json
{
  "name": "clickupfy_api_v2_update_folder",
  "arguments": {
    "path": {
      "folder_id": 1
    },
    "body": {
      "name": "exemplo-1"
    },
    "account": "dev"
  }
}
```

Use o perfil do produto, quando o MCP permitir selecionar outro perfil:

```json
{
  "name": "clickupfy_api_v2_update_folder",
  "arguments": {
    "path": {
      "folder_id": 1
    },
    "body": {
      "name": "exemplo-1"
    },
    "account": "produto"
  }
}
```

Consulte o schema antes de compor uma chamada pelo agente:

```bash
clickupfy api describe clickupfy_api_v2_update_folder
```

Reproduza pelo CLI a entrada usada pelo agente, sem executar a operação:

```bash
printf '%s' '{"path":{"folder_id":1},"body":{"name":"exemplo-1"}}' | clickupfy api v2-update-folder --input - --dry-run
```

### `clickupfy api v2-delete-folder`

A operação `DeleteFolder` pertence ao grupo `Folders` e usa
`DELETE /api/v2/folder/{folder_id}`.

A chamada altera o recurso indicado pelos parâmetros. Confira o resultado com a consulta correspondente antes de continuar.

A resposta preserva o JSON da API; respostas sem corpo retornam `{}`.
A API key do perfil precisa ter acesso ao recurso. As permissões e o plano do Workspace podem restringir o endpoint.
Os campos omitidos são tratados pelo servidor do ClickUp, sem padrões adicionais do cliente.

[Referência oficial](https://developer.clickup.com/reference/deletefolder).

| Entrada | Tipo | Obrigatória |
| --- | --- | --- |
| `path.folder_id` | `number` | sim |
| `confirm` | boolean, somente `true` | sim |

O comando aceita as flags comuns de `api`: `--input`, `--path`, `--query`,
`--body`, `--body-file`, `--content-type`, `--file`, `--dry-run` e `--yes`.
A referência completa de tipos, campos aninhados e valores permitidos está no comando `describe` abaixo.

Exemplos:

Consulte o contrato antes de preencher os IDs reais:

```bash
clickupfy api describe v2-delete-folder
```

Valide uma entrada em arquivo sem enviar uma requisição:

```bash
clickupfy api v2-delete-folder --input entrada.json --dry-run
```

Use um envelope JSON pelo stdin:

```bash
printf '%s' '{"path":{"folder_id":1},"confirm":true}' | clickupfy api v2-delete-folder --input -
```

Selecione o perfil que tem acesso ao recurso:

```bash
clickupfy --account produto api v2-delete-folder --input entrada.json
```

Grave a resposta JSON para conferência. O arquivo de entrada usa o envelope do exemplo anterior:

```bash
clickupfy --json api v2-delete-folder --input entrada.json > resposta.json
```

### `clickupfy_api_v2_delete_folder`

A operação `DeleteFolder` pertence ao grupo `Folders` e usa
`DELETE /api/v2/folder/{folder_id}`.

A chamada altera o recurso indicado pelos parâmetros. Confira o resultado com a consulta correspondente antes de continuar.

A resposta preserva o JSON da API; respostas sem corpo retornam `{}`.
A API key do perfil precisa ter acesso ao recurso. As permissões e o plano do Workspace podem restringir o endpoint.
Os campos omitidos são tratados pelo servidor do ClickUp, sem padrões adicionais do cliente.

[Referência oficial](https://developer.clickup.com/reference/deletefolder).

| Entrada | Tipo | Obrigatória |
| --- | --- | --- |
| `path.folder_id` | `number` | sim |
| `confirm` | boolean, somente `true` | sim |

`account` é opcional e usa o perfil ativo ou fixado no MCP. O retorno aparece em
`content` como JSON; recusas retornam `isError: true`. Ferramentas de escrita
ficam ausentes em `--read-only`. IDs explícitos devem respeitar a hierarquia fixada.

Exemplos:

Use o perfil ativo com o envelope mínimo:

```json
{
  "name": "clickupfy_api_v2_delete_folder",
  "arguments": {
    "path": {
      "folder_id": 1
    },
    "confirm": true
  }
}
```

Direcione a chamada ao perfil de desenvolvimento:

```json
{
  "name": "clickupfy_api_v2_delete_folder",
  "arguments": {
    "path": {
      "folder_id": 1
    },
    "confirm": true,
    "account": "dev"
  }
}
```

Use o perfil do produto, quando o MCP permitir selecionar outro perfil:

```json
{
  "name": "clickupfy_api_v2_delete_folder",
  "arguments": {
    "path": {
      "folder_id": 1
    },
    "confirm": true,
    "account": "produto"
  }
}
```

Consulte o schema antes de compor uma chamada pelo agente:

```bash
clickupfy api describe clickupfy_api_v2_delete_folder
```

Reproduza pelo CLI a entrada usada pelo agente, sem executar a operação:

```bash
printf '%s' '{"path":{"folder_id":1},"confirm":true}' | clickupfy api v2-delete-folder --input - --dry-run
```

### `clickupfy api v2-move-folder`

A operação `MoveFolder` pertence ao grupo `Folders` e usa
`PUT /api/v2/folder/{folder_id}/position`.

A chamada altera o recurso indicado pelos parâmetros. Confira o resultado com a consulta correspondente antes de continuar.

A resposta preserva o JSON da API; respostas sem corpo retornam `{}`.
A API key do perfil precisa ter acesso ao recurso. As permissões e o plano do Workspace podem restringir o endpoint.
Os campos omitidos são tratados pelo servidor do ClickUp, sem padrões adicionais do cliente.

[Referência oficial](https://developer.clickup.com/reference/movefolder).

| Entrada | Tipo | Obrigatória |
| --- | --- | --- |
| `path.folder_id` | `number` | sim |
| `body` | objeto conforme `api describe` | sim |

O comando aceita as flags comuns de `api`: `--input`, `--path`, `--query`,
`--body`, `--body-file`, `--content-type`, `--file`, `--dry-run` e `--yes`.
A referência completa de tipos, campos aninhados e valores permitidos está no comando `describe` abaixo.

Exemplos:

Consulte o contrato antes de preencher os IDs reais:

```bash
clickupfy api describe v2-move-folder
```

Valide uma entrada em arquivo sem enviar uma requisição:

```bash
clickupfy api v2-move-folder --input entrada.json --dry-run
```

Use um envelope JSON pelo stdin:

```bash
printf '%s' '{"path":{"folder_id":1},"body":{}}' | clickupfy api v2-move-folder --input -
```

Selecione o perfil que tem acesso ao recurso:

```bash
clickupfy --account produto api v2-move-folder --input entrada.json
```

Grave a resposta JSON para conferência. O arquivo de entrada usa o envelope do exemplo anterior:

```bash
clickupfy --json api v2-move-folder --input entrada.json > resposta.json
```

### `clickupfy_api_v2_move_folder`

A operação `MoveFolder` pertence ao grupo `Folders` e usa
`PUT /api/v2/folder/{folder_id}/position`.

A chamada altera o recurso indicado pelos parâmetros. Confira o resultado com a consulta correspondente antes de continuar.

A resposta preserva o JSON da API; respostas sem corpo retornam `{}`.
A API key do perfil precisa ter acesso ao recurso. As permissões e o plano do Workspace podem restringir o endpoint.
Os campos omitidos são tratados pelo servidor do ClickUp, sem padrões adicionais do cliente.

[Referência oficial](https://developer.clickup.com/reference/movefolder).

| Entrada | Tipo | Obrigatória |
| --- | --- | --- |
| `path.folder_id` | `number` | sim |
| `body` | objeto conforme `api describe` | sim |

`account` é opcional e usa o perfil ativo ou fixado no MCP. O retorno aparece em
`content` como JSON; recusas retornam `isError: true`. Ferramentas de escrita
ficam ausentes em `--read-only`. IDs explícitos devem respeitar a hierarquia fixada.

Exemplos:

Use o perfil ativo com o envelope mínimo:

```json
{
  "name": "clickupfy_api_v2_move_folder",
  "arguments": {
    "path": {
      "folder_id": 1
    },
    "body": {}
  }
}
```

Direcione a chamada ao perfil de desenvolvimento:

```json
{
  "name": "clickupfy_api_v2_move_folder",
  "arguments": {
    "path": {
      "folder_id": 1
    },
    "body": {},
    "account": "dev"
  }
}
```

Use o perfil do produto, quando o MCP permitir selecionar outro perfil:

```json
{
  "name": "clickupfy_api_v2_move_folder",
  "arguments": {
    "path": {
      "folder_id": 1
    },
    "body": {},
    "account": "produto"
  }
}
```

Consulte o schema antes de compor uma chamada pelo agente:

```bash
clickupfy api describe clickupfy_api_v2_move_folder
```

Reproduza pelo CLI a entrada usada pelo agente, sem executar a operação:

```bash
printf '%s' '{"path":{"folder_id":1},"body":{}}' | clickupfy api v2-move-folder --input - --dry-run
```

### `clickupfy api v2-get-goals`

A operação `GetGoals` pertence ao grupo `Goals` e usa
`GET /api/v2/team/{team_id}/goal`.

A chamada consulta o recurso sem modificá-lo.

A resposta preserva o JSON da API; respostas sem corpo retornam `{}`.
A API key do perfil precisa ter acesso ao recurso. As permissões e o plano do Workspace podem restringir o endpoint.
Os campos omitidos são tratados pelo servidor do ClickUp, sem padrões adicionais do cliente.

[Referência oficial](https://developer.clickup.com/reference/getgoals).

| Entrada | Tipo | Obrigatória |
| --- | --- | --- |
| `path.team_id` | `number` | sim |
| `query.include_completed` | `boolean` | não |

O comando aceita as flags comuns de `api`: `--input`, `--path`, `--query`,
`--body`, `--body-file`, `--content-type`, `--file`, `--dry-run` e `--yes`.
A referência completa de tipos, campos aninhados e valores permitidos está no comando `describe` abaixo.

Exemplos:

Consulte o contrato antes de preencher os IDs reais:

```bash
clickupfy api describe v2-get-goals
```

Valide uma entrada em arquivo sem enviar uma requisição:

```bash
clickupfy api v2-get-goals --input entrada.json --dry-run
```

Use um envelope JSON pelo stdin:

```bash
printf '%s' '{"path":{"team_id":1}}' | clickupfy api v2-get-goals --input -
```

Selecione o perfil que tem acesso ao recurso:

```bash
clickupfy --account produto api v2-get-goals --input entrada.json
```

Grave a resposta JSON para conferência. O arquivo de entrada usa o envelope do exemplo anterior:

```bash
clickupfy --json api v2-get-goals --input entrada.json > resposta.json
```

### `clickupfy_api_v2_get_goals`

A operação `GetGoals` pertence ao grupo `Goals` e usa
`GET /api/v2/team/{team_id}/goal`.

A chamada consulta o recurso sem modificá-lo.

A resposta preserva o JSON da API; respostas sem corpo retornam `{}`.
A API key do perfil precisa ter acesso ao recurso. As permissões e o plano do Workspace podem restringir o endpoint.
Os campos omitidos são tratados pelo servidor do ClickUp, sem padrões adicionais do cliente.

[Referência oficial](https://developer.clickup.com/reference/getgoals).

| Entrada | Tipo | Obrigatória |
| --- | --- | --- |
| `path.team_id` | `number` | sim |
| `query.include_completed` | `boolean` | não |

`account` é opcional e usa o perfil ativo ou fixado no MCP. O retorno aparece em
`content` como JSON; recusas retornam `isError: true`. Ferramentas de escrita
ficam ausentes em `--read-only`. IDs explícitos devem respeitar a hierarquia fixada.

Exemplos:

Use o perfil ativo com o envelope mínimo:

```json
{
  "name": "clickupfy_api_v2_get_goals",
  "arguments": {
    "path": {
      "team_id": 1
    }
  }
}
```

Direcione a chamada ao perfil de desenvolvimento:

```json
{
  "name": "clickupfy_api_v2_get_goals",
  "arguments": {
    "path": {
      "team_id": 1
    },
    "account": "dev"
  }
}
```

Use o perfil do produto, quando o MCP permitir selecionar outro perfil:

```json
{
  "name": "clickupfy_api_v2_get_goals",
  "arguments": {
    "path": {
      "team_id": 1
    },
    "account": "produto"
  }
}
```

Consulte o schema antes de compor uma chamada pelo agente:

```bash
clickupfy api describe clickupfy_api_v2_get_goals
```

Reproduza pelo CLI a entrada usada pelo agente, sem executar a operação:

```bash
printf '%s' '{"path":{"team_id":1}}' | clickupfy api v2-get-goals --input - --dry-run
```

### `clickupfy api v2-create-goal`

A operação `CreateGoal` pertence ao grupo `Goals` e usa
`POST /api/v2/team/{team_id}/goal`.

A chamada altera o recurso indicado pelos parâmetros. Confira o resultado com a consulta correspondente antes de continuar.

A resposta preserva o JSON da API; respostas sem corpo retornam `{}`.
A API key do perfil precisa ter acesso ao recurso. As permissões e o plano do Workspace podem restringir o endpoint.
Os campos omitidos são tratados pelo servidor do ClickUp, sem padrões adicionais do cliente.

[Referência oficial](https://developer.clickup.com/reference/creategoal).

| Entrada | Tipo | Obrigatória |
| --- | --- | --- |
| `path.team_id` | `number` | sim |
| `body` | objeto conforme `api describe` | sim |

O comando aceita as flags comuns de `api`: `--input`, `--path`, `--query`,
`--body`, `--body-file`, `--content-type`, `--file`, `--dry-run` e `--yes`.
A referência completa de tipos, campos aninhados e valores permitidos está no comando `describe` abaixo.

Exemplos:

Consulte o contrato antes de preencher os IDs reais:

```bash
clickupfy api describe v2-create-goal
```

Valide uma entrada em arquivo sem enviar uma requisição:

```bash
clickupfy api v2-create-goal --input entrada.json --dry-run
```

Use um envelope JSON pelo stdin:

```bash
printf '%s' '{"path":{"team_id":1},"body":{"name":"exemplo-1","due_date":1,"description":"exemplo-1","multiple_owners":true,"owners":[1],"color":"exemplo-1"}}' | clickupfy api v2-create-goal --input -
```

Selecione o perfil que tem acesso ao recurso:

```bash
clickupfy --account produto api v2-create-goal --input entrada.json
```

Grave a resposta JSON para conferência. O arquivo de entrada usa o envelope do exemplo anterior:

```bash
clickupfy --json api v2-create-goal --input entrada.json > resposta.json
```

### `clickupfy_api_v2_create_goal`

A operação `CreateGoal` pertence ao grupo `Goals` e usa
`POST /api/v2/team/{team_id}/goal`.

A chamada altera o recurso indicado pelos parâmetros. Confira o resultado com a consulta correspondente antes de continuar.

A resposta preserva o JSON da API; respostas sem corpo retornam `{}`.
A API key do perfil precisa ter acesso ao recurso. As permissões e o plano do Workspace podem restringir o endpoint.
Os campos omitidos são tratados pelo servidor do ClickUp, sem padrões adicionais do cliente.

[Referência oficial](https://developer.clickup.com/reference/creategoal).

| Entrada | Tipo | Obrigatória |
| --- | --- | --- |
| `path.team_id` | `number` | sim |
| `body` | objeto conforme `api describe` | sim |

`account` é opcional e usa o perfil ativo ou fixado no MCP. O retorno aparece em
`content` como JSON; recusas retornam `isError: true`. Ferramentas de escrita
ficam ausentes em `--read-only`. IDs explícitos devem respeitar a hierarquia fixada.

Exemplos:

Use o perfil ativo com o envelope mínimo:

```json
{
  "name": "clickupfy_api_v2_create_goal",
  "arguments": {
    "path": {
      "team_id": 1
    },
    "body": {
      "name": "exemplo-1",
      "due_date": 1,
      "description": "exemplo-1",
      "multiple_owners": true,
      "owners": [
        1
      ],
      "color": "exemplo-1"
    }
  }
}
```

Direcione a chamada ao perfil de desenvolvimento:

```json
{
  "name": "clickupfy_api_v2_create_goal",
  "arguments": {
    "path": {
      "team_id": 1
    },
    "body": {
      "name": "exemplo-1",
      "due_date": 1,
      "description": "exemplo-1",
      "multiple_owners": true,
      "owners": [
        1
      ],
      "color": "exemplo-1"
    },
    "account": "dev"
  }
}
```

Use o perfil do produto, quando o MCP permitir selecionar outro perfil:

```json
{
  "name": "clickupfy_api_v2_create_goal",
  "arguments": {
    "path": {
      "team_id": 1
    },
    "body": {
      "name": "exemplo-1",
      "due_date": 1,
      "description": "exemplo-1",
      "multiple_owners": true,
      "owners": [
        1
      ],
      "color": "exemplo-1"
    },
    "account": "produto"
  }
}
```

Consulte o schema antes de compor uma chamada pelo agente:

```bash
clickupfy api describe clickupfy_api_v2_create_goal
```

Reproduza pelo CLI a entrada usada pelo agente, sem executar a operação:

```bash
printf '%s' '{"path":{"team_id":1},"body":{"name":"exemplo-1","due_date":1,"description":"exemplo-1","multiple_owners":true,"owners":[1],"color":"exemplo-1"}}' | clickupfy api v2-create-goal --input - --dry-run
```

### `clickupfy api v2-get-goal`

A operação `GetGoal` pertence ao grupo `Goals` e usa
`GET /api/v2/goal/{goal_id}`.

A chamada consulta o recurso sem modificá-lo.

A resposta preserva o JSON da API; respostas sem corpo retornam `{}`.
A API key do perfil precisa ter acesso ao recurso. As permissões e o plano do Workspace podem restringir o endpoint.
Os campos omitidos são tratados pelo servidor do ClickUp, sem padrões adicionais do cliente.

[Referência oficial](https://developer.clickup.com/reference/getgoal).

| Entrada | Tipo | Obrigatória |
| --- | --- | --- |
| `path.goal_id` | `string` | sim |

O comando aceita as flags comuns de `api`: `--input`, `--path`, `--query`,
`--body`, `--body-file`, `--content-type`, `--file`, `--dry-run` e `--yes`.
A referência completa de tipos, campos aninhados e valores permitidos está no comando `describe` abaixo.

Exemplos:

Consulte o contrato antes de preencher os IDs reais:

```bash
clickupfy api describe v2-get-goal
```

Valide uma entrada em arquivo sem enviar uma requisição:

```bash
clickupfy api v2-get-goal --input entrada.json --dry-run
```

Use um envelope JSON pelo stdin:

```bash
printf '%s' '{"path":{"goal_id":"exemplo-1"}}' | clickupfy api v2-get-goal --input -
```

Selecione o perfil que tem acesso ao recurso:

```bash
clickupfy --account produto api v2-get-goal --input entrada.json
```

Grave a resposta JSON para conferência. O arquivo de entrada usa o envelope do exemplo anterior:

```bash
clickupfy --json api v2-get-goal --input entrada.json > resposta.json
```

### `clickupfy_api_v2_get_goal`

A operação `GetGoal` pertence ao grupo `Goals` e usa
`GET /api/v2/goal/{goal_id}`.

A chamada consulta o recurso sem modificá-lo.

A resposta preserva o JSON da API; respostas sem corpo retornam `{}`.
A API key do perfil precisa ter acesso ao recurso. As permissões e o plano do Workspace podem restringir o endpoint.
Os campos omitidos são tratados pelo servidor do ClickUp, sem padrões adicionais do cliente.

[Referência oficial](https://developer.clickup.com/reference/getgoal).

| Entrada | Tipo | Obrigatória |
| --- | --- | --- |
| `path.goal_id` | `string` | sim |

`account` é opcional e usa o perfil ativo ou fixado no MCP. O retorno aparece em
`content` como JSON; recusas retornam `isError: true`. Ferramentas de escrita
ficam ausentes em `--read-only`. IDs explícitos devem respeitar a hierarquia fixada.

Exemplos:

Use o perfil ativo com o envelope mínimo:

```json
{
  "name": "clickupfy_api_v2_get_goal",
  "arguments": {
    "path": {
      "goal_id": "exemplo-1"
    }
  }
}
```

Direcione a chamada ao perfil de desenvolvimento:

```json
{
  "name": "clickupfy_api_v2_get_goal",
  "arguments": {
    "path": {
      "goal_id": "exemplo-1"
    },
    "account": "dev"
  }
}
```

Use o perfil do produto, quando o MCP permitir selecionar outro perfil:

```json
{
  "name": "clickupfy_api_v2_get_goal",
  "arguments": {
    "path": {
      "goal_id": "exemplo-1"
    },
    "account": "produto"
  }
}
```

Consulte o schema antes de compor uma chamada pelo agente:

```bash
clickupfy api describe clickupfy_api_v2_get_goal
```

Reproduza pelo CLI a entrada usada pelo agente, sem executar a operação:

```bash
printf '%s' '{"path":{"goal_id":"exemplo-1"}}' | clickupfy api v2-get-goal --input - --dry-run
```

### `clickupfy api v2-update-goal`

A operação `UpdateGoal` pertence ao grupo `Goals` e usa
`PUT /api/v2/goal/{goal_id}`.

A chamada altera o recurso indicado pelos parâmetros. Confira o resultado com a consulta correspondente antes de continuar.

A resposta preserva o JSON da API; respostas sem corpo retornam `{}`.
A API key do perfil precisa ter acesso ao recurso. As permissões e o plano do Workspace podem restringir o endpoint.
Os campos omitidos são tratados pelo servidor do ClickUp, sem padrões adicionais do cliente.

[Referência oficial](https://developer.clickup.com/reference/updategoal).

| Entrada | Tipo | Obrigatória |
| --- | --- | --- |
| `path.goal_id` | `string` | sim |
| `body` | objeto conforme `api describe` | sim |

O comando aceita as flags comuns de `api`: `--input`, `--path`, `--query`,
`--body`, `--body-file`, `--content-type`, `--file`, `--dry-run` e `--yes`.
A referência completa de tipos, campos aninhados e valores permitidos está no comando `describe` abaixo.

Exemplos:

Consulte o contrato antes de preencher os IDs reais:

```bash
clickupfy api describe v2-update-goal
```

Valide uma entrada em arquivo sem enviar uma requisição:

```bash
clickupfy api v2-update-goal --input entrada.json --dry-run
```

Use um envelope JSON pelo stdin:

```bash
printf '%s' '{"path":{"goal_id":"exemplo-1"},"body":{"name":"exemplo-1","due_date":1,"description":"exemplo-1","rem_owners":[1],"add_owners":[1],"color":"exemplo-1"}}' | clickupfy api v2-update-goal --input -
```

Selecione o perfil que tem acesso ao recurso:

```bash
clickupfy --account produto api v2-update-goal --input entrada.json
```

Grave a resposta JSON para conferência. O arquivo de entrada usa o envelope do exemplo anterior:

```bash
clickupfy --json api v2-update-goal --input entrada.json > resposta.json
```

### `clickupfy_api_v2_update_goal`

A operação `UpdateGoal` pertence ao grupo `Goals` e usa
`PUT /api/v2/goal/{goal_id}`.

A chamada altera o recurso indicado pelos parâmetros. Confira o resultado com a consulta correspondente antes de continuar.

A resposta preserva o JSON da API; respostas sem corpo retornam `{}`.
A API key do perfil precisa ter acesso ao recurso. As permissões e o plano do Workspace podem restringir o endpoint.
Os campos omitidos são tratados pelo servidor do ClickUp, sem padrões adicionais do cliente.

[Referência oficial](https://developer.clickup.com/reference/updategoal).

| Entrada | Tipo | Obrigatória |
| --- | --- | --- |
| `path.goal_id` | `string` | sim |
| `body` | objeto conforme `api describe` | sim |

`account` é opcional e usa o perfil ativo ou fixado no MCP. O retorno aparece em
`content` como JSON; recusas retornam `isError: true`. Ferramentas de escrita
ficam ausentes em `--read-only`. IDs explícitos devem respeitar a hierarquia fixada.

Exemplos:

Use o perfil ativo com o envelope mínimo:

```json
{
  "name": "clickupfy_api_v2_update_goal",
  "arguments": {
    "path": {
      "goal_id": "exemplo-1"
    },
    "body": {
      "name": "exemplo-1",
      "due_date": 1,
      "description": "exemplo-1",
      "rem_owners": [
        1
      ],
      "add_owners": [
        1
      ],
      "color": "exemplo-1"
    }
  }
}
```

Direcione a chamada ao perfil de desenvolvimento:

```json
{
  "name": "clickupfy_api_v2_update_goal",
  "arguments": {
    "path": {
      "goal_id": "exemplo-1"
    },
    "body": {
      "name": "exemplo-1",
      "due_date": 1,
      "description": "exemplo-1",
      "rem_owners": [
        1
      ],
      "add_owners": [
        1
      ],
      "color": "exemplo-1"
    },
    "account": "dev"
  }
}
```

Use o perfil do produto, quando o MCP permitir selecionar outro perfil:

```json
{
  "name": "clickupfy_api_v2_update_goal",
  "arguments": {
    "path": {
      "goal_id": "exemplo-1"
    },
    "body": {
      "name": "exemplo-1",
      "due_date": 1,
      "description": "exemplo-1",
      "rem_owners": [
        1
      ],
      "add_owners": [
        1
      ],
      "color": "exemplo-1"
    },
    "account": "produto"
  }
}
```

Consulte o schema antes de compor uma chamada pelo agente:

```bash
clickupfy api describe clickupfy_api_v2_update_goal
```

Reproduza pelo CLI a entrada usada pelo agente, sem executar a operação:

```bash
printf '%s' '{"path":{"goal_id":"exemplo-1"},"body":{"name":"exemplo-1","due_date":1,"description":"exemplo-1","rem_owners":[1],"add_owners":[1],"color":"exemplo-1"}}' | clickupfy api v2-update-goal --input - --dry-run
```

### `clickupfy api v2-delete-goal`

A operação `DeleteGoal` pertence ao grupo `Goals` e usa
`DELETE /api/v2/goal/{goal_id}`.

A chamada altera o recurso indicado pelos parâmetros. Confira o resultado com a consulta correspondente antes de continuar.

A resposta preserva o JSON da API; respostas sem corpo retornam `{}`.
A API key do perfil precisa ter acesso ao recurso. As permissões e o plano do Workspace podem restringir o endpoint.
Os campos omitidos são tratados pelo servidor do ClickUp, sem padrões adicionais do cliente.

[Referência oficial](https://developer.clickup.com/reference/deletegoal).

| Entrada | Tipo | Obrigatória |
| --- | --- | --- |
| `path.goal_id` | `string` | sim |
| `confirm` | boolean, somente `true` | sim |

O comando aceita as flags comuns de `api`: `--input`, `--path`, `--query`,
`--body`, `--body-file`, `--content-type`, `--file`, `--dry-run` e `--yes`.
A referência completa de tipos, campos aninhados e valores permitidos está no comando `describe` abaixo.

Exemplos:

Consulte o contrato antes de preencher os IDs reais:

```bash
clickupfy api describe v2-delete-goal
```

Valide uma entrada em arquivo sem enviar uma requisição:

```bash
clickupfy api v2-delete-goal --input entrada.json --dry-run
```

Use um envelope JSON pelo stdin:

```bash
printf '%s' '{"path":{"goal_id":"exemplo-1"},"confirm":true}' | clickupfy api v2-delete-goal --input -
```

Selecione o perfil que tem acesso ao recurso:

```bash
clickupfy --account produto api v2-delete-goal --input entrada.json
```

Grave a resposta JSON para conferência. O arquivo de entrada usa o envelope do exemplo anterior:

```bash
clickupfy --json api v2-delete-goal --input entrada.json > resposta.json
```

### `clickupfy_api_v2_delete_goal`

A operação `DeleteGoal` pertence ao grupo `Goals` e usa
`DELETE /api/v2/goal/{goal_id}`.

A chamada altera o recurso indicado pelos parâmetros. Confira o resultado com a consulta correspondente antes de continuar.

A resposta preserva o JSON da API; respostas sem corpo retornam `{}`.
A API key do perfil precisa ter acesso ao recurso. As permissões e o plano do Workspace podem restringir o endpoint.
Os campos omitidos são tratados pelo servidor do ClickUp, sem padrões adicionais do cliente.

[Referência oficial](https://developer.clickup.com/reference/deletegoal).

| Entrada | Tipo | Obrigatória |
| --- | --- | --- |
| `path.goal_id` | `string` | sim |
| `confirm` | boolean, somente `true` | sim |

`account` é opcional e usa o perfil ativo ou fixado no MCP. O retorno aparece em
`content` como JSON; recusas retornam `isError: true`. Ferramentas de escrita
ficam ausentes em `--read-only`. IDs explícitos devem respeitar a hierarquia fixada.

Exemplos:

Use o perfil ativo com o envelope mínimo:

```json
{
  "name": "clickupfy_api_v2_delete_goal",
  "arguments": {
    "path": {
      "goal_id": "exemplo-1"
    },
    "confirm": true
  }
}
```

Direcione a chamada ao perfil de desenvolvimento:

```json
{
  "name": "clickupfy_api_v2_delete_goal",
  "arguments": {
    "path": {
      "goal_id": "exemplo-1"
    },
    "confirm": true,
    "account": "dev"
  }
}
```

Use o perfil do produto, quando o MCP permitir selecionar outro perfil:

```json
{
  "name": "clickupfy_api_v2_delete_goal",
  "arguments": {
    "path": {
      "goal_id": "exemplo-1"
    },
    "confirm": true,
    "account": "produto"
  }
}
```

Consulte o schema antes de compor uma chamada pelo agente:

```bash
clickupfy api describe clickupfy_api_v2_delete_goal
```

Reproduza pelo CLI a entrada usada pelo agente, sem executar a operação:

```bash
printf '%s' '{"path":{"goal_id":"exemplo-1"},"confirm":true}' | clickupfy api v2-delete-goal --input - --dry-run
```

### `clickupfy api v2-create-key-result`

A operação `CreateKeyResult` pertence ao grupo `Goals` e usa
`POST /api/v2/goal/{goal_id}/key_result`.

A chamada altera o recurso indicado pelos parâmetros. Confira o resultado com a consulta correspondente antes de continuar.

A resposta preserva o JSON da API; respostas sem corpo retornam `{}`.
A API key do perfil precisa ter acesso ao recurso. As permissões e o plano do Workspace podem restringir o endpoint.
Os campos omitidos são tratados pelo servidor do ClickUp, sem padrões adicionais do cliente.

[Referência oficial](https://developer.clickup.com/reference/createkeyresult).

| Entrada | Tipo | Obrigatória |
| --- | --- | --- |
| `path.goal_id` | `string` | sim |
| `body` | objeto conforme `api describe` | sim |

O comando aceita as flags comuns de `api`: `--input`, `--path`, `--query`,
`--body`, `--body-file`, `--content-type`, `--file`, `--dry-run` e `--yes`.
A referência completa de tipos, campos aninhados e valores permitidos está no comando `describe` abaixo.

Exemplos:

Consulte o contrato antes de preencher os IDs reais:

```bash
clickupfy api describe v2-create-key-result
```

Valide uma entrada em arquivo sem enviar uma requisição:

```bash
clickupfy api v2-create-key-result --input entrada.json --dry-run
```

Use um envelope JSON pelo stdin:

```bash
printf '%s' '{"path":{"goal_id":"exemplo-1"},"body":{"name":"exemplo-1","owners":[1],"type":"exemplo-1","steps_start":1,"steps_end":1,"unit":"exemplo-1","task_ids":["exemplo-1"],"list_ids":["exemplo-1"]}}' | clickupfy api v2-create-key-result --input -
```

Selecione o perfil que tem acesso ao recurso:

```bash
clickupfy --account produto api v2-create-key-result --input entrada.json
```

Grave a resposta JSON para conferência. O arquivo de entrada usa o envelope do exemplo anterior:

```bash
clickupfy --json api v2-create-key-result --input entrada.json > resposta.json
```

### `clickupfy_api_v2_create_key_result`

A operação `CreateKeyResult` pertence ao grupo `Goals` e usa
`POST /api/v2/goal/{goal_id}/key_result`.

A chamada altera o recurso indicado pelos parâmetros. Confira o resultado com a consulta correspondente antes de continuar.

A resposta preserva o JSON da API; respostas sem corpo retornam `{}`.
A API key do perfil precisa ter acesso ao recurso. As permissões e o plano do Workspace podem restringir o endpoint.
Os campos omitidos são tratados pelo servidor do ClickUp, sem padrões adicionais do cliente.

[Referência oficial](https://developer.clickup.com/reference/createkeyresult).

| Entrada | Tipo | Obrigatória |
| --- | --- | --- |
| `path.goal_id` | `string` | sim |
| `body` | objeto conforme `api describe` | sim |

`account` é opcional e usa o perfil ativo ou fixado no MCP. O retorno aparece em
`content` como JSON; recusas retornam `isError: true`. Ferramentas de escrita
ficam ausentes em `--read-only`. IDs explícitos devem respeitar a hierarquia fixada.

Exemplos:

Use o perfil ativo com o envelope mínimo:

```json
{
  "name": "clickupfy_api_v2_create_key_result",
  "arguments": {
    "path": {
      "goal_id": "exemplo-1"
    },
    "body": {
      "name": "exemplo-1",
      "owners": [
        1
      ],
      "type": "exemplo-1",
      "steps_start": 1,
      "steps_end": 1,
      "unit": "exemplo-1",
      "task_ids": [
        "exemplo-1"
      ],
      "list_ids": [
        "exemplo-1"
      ]
    }
  }
}
```

Direcione a chamada ao perfil de desenvolvimento:

```json
{
  "name": "clickupfy_api_v2_create_key_result",
  "arguments": {
    "path": {
      "goal_id": "exemplo-1"
    },
    "body": {
      "name": "exemplo-1",
      "owners": [
        1
      ],
      "type": "exemplo-1",
      "steps_start": 1,
      "steps_end": 1,
      "unit": "exemplo-1",
      "task_ids": [
        "exemplo-1"
      ],
      "list_ids": [
        "exemplo-1"
      ]
    },
    "account": "dev"
  }
}
```

Use o perfil do produto, quando o MCP permitir selecionar outro perfil:

```json
{
  "name": "clickupfy_api_v2_create_key_result",
  "arguments": {
    "path": {
      "goal_id": "exemplo-1"
    },
    "body": {
      "name": "exemplo-1",
      "owners": [
        1
      ],
      "type": "exemplo-1",
      "steps_start": 1,
      "steps_end": 1,
      "unit": "exemplo-1",
      "task_ids": [
        "exemplo-1"
      ],
      "list_ids": [
        "exemplo-1"
      ]
    },
    "account": "produto"
  }
}
```

Consulte o schema antes de compor uma chamada pelo agente:

```bash
clickupfy api describe clickupfy_api_v2_create_key_result
```

Reproduza pelo CLI a entrada usada pelo agente, sem executar a operação:

```bash
printf '%s' '{"path":{"goal_id":"exemplo-1"},"body":{"name":"exemplo-1","owners":[1],"type":"exemplo-1","steps_start":1,"steps_end":1,"unit":"exemplo-1","task_ids":["exemplo-1"],"list_ids":["exemplo-1"]}}' | clickupfy api v2-create-key-result --input - --dry-run
```

### `clickupfy api v2-edit-key-result`

A operação `EditKeyResult` pertence ao grupo `Goals` e usa
`PUT /api/v2/key_result/{key_result_id}`.

A chamada altera o recurso indicado pelos parâmetros. Confira o resultado com a consulta correspondente antes de continuar.

A resposta preserva o JSON da API; respostas sem corpo retornam `{}`.
A API key do perfil precisa ter acesso ao recurso. As permissões e o plano do Workspace podem restringir o endpoint.
Os campos omitidos são tratados pelo servidor do ClickUp, sem padrões adicionais do cliente.

[Referência oficial](https://developer.clickup.com/reference/editkeyresult).

| Entrada | Tipo | Obrigatória |
| --- | --- | --- |
| `path.key_result_id` | `string` | sim |
| `body` | objeto conforme `api describe` | sim |

O comando aceita as flags comuns de `api`: `--input`, `--path`, `--query`,
`--body`, `--body-file`, `--content-type`, `--file`, `--dry-run` e `--yes`.
A referência completa de tipos, campos aninhados e valores permitidos está no comando `describe` abaixo.

Exemplos:

Consulte o contrato antes de preencher os IDs reais:

```bash
clickupfy api describe v2-edit-key-result
```

Valide uma entrada em arquivo sem enviar uma requisição:

```bash
clickupfy api v2-edit-key-result --input entrada.json --dry-run
```

Use um envelope JSON pelo stdin:

```bash
printf '%s' '{"path":{"key_result_id":"exemplo-1"},"body":{"steps_current":1,"note":"exemplo-1"}}' | clickupfy api v2-edit-key-result --input -
```

Selecione o perfil que tem acesso ao recurso:

```bash
clickupfy --account produto api v2-edit-key-result --input entrada.json
```

Grave a resposta JSON para conferência. O arquivo de entrada usa o envelope do exemplo anterior:

```bash
clickupfy --json api v2-edit-key-result --input entrada.json > resposta.json
```

### `clickupfy_api_v2_edit_key_result`

A operação `EditKeyResult` pertence ao grupo `Goals` e usa
`PUT /api/v2/key_result/{key_result_id}`.

A chamada altera o recurso indicado pelos parâmetros. Confira o resultado com a consulta correspondente antes de continuar.

A resposta preserva o JSON da API; respostas sem corpo retornam `{}`.
A API key do perfil precisa ter acesso ao recurso. As permissões e o plano do Workspace podem restringir o endpoint.
Os campos omitidos são tratados pelo servidor do ClickUp, sem padrões adicionais do cliente.

[Referência oficial](https://developer.clickup.com/reference/editkeyresult).

| Entrada | Tipo | Obrigatória |
| --- | --- | --- |
| `path.key_result_id` | `string` | sim |
| `body` | objeto conforme `api describe` | sim |

`account` é opcional e usa o perfil ativo ou fixado no MCP. O retorno aparece em
`content` como JSON; recusas retornam `isError: true`. Ferramentas de escrita
ficam ausentes em `--read-only`. IDs explícitos devem respeitar a hierarquia fixada.

Exemplos:

Use o perfil ativo com o envelope mínimo:

```json
{
  "name": "clickupfy_api_v2_edit_key_result",
  "arguments": {
    "path": {
      "key_result_id": "exemplo-1"
    },
    "body": {
      "steps_current": 1,
      "note": "exemplo-1"
    }
  }
}
```

Direcione a chamada ao perfil de desenvolvimento:

```json
{
  "name": "clickupfy_api_v2_edit_key_result",
  "arguments": {
    "path": {
      "key_result_id": "exemplo-1"
    },
    "body": {
      "steps_current": 1,
      "note": "exemplo-1"
    },
    "account": "dev"
  }
}
```

Use o perfil do produto, quando o MCP permitir selecionar outro perfil:

```json
{
  "name": "clickupfy_api_v2_edit_key_result",
  "arguments": {
    "path": {
      "key_result_id": "exemplo-1"
    },
    "body": {
      "steps_current": 1,
      "note": "exemplo-1"
    },
    "account": "produto"
  }
}
```

Consulte o schema antes de compor uma chamada pelo agente:

```bash
clickupfy api describe clickupfy_api_v2_edit_key_result
```

Reproduza pelo CLI a entrada usada pelo agente, sem executar a operação:

```bash
printf '%s' '{"path":{"key_result_id":"exemplo-1"},"body":{"steps_current":1,"note":"exemplo-1"}}' | clickupfy api v2-edit-key-result --input - --dry-run
```

### `clickupfy api v2-delete-key-result`

A operação `DeleteKeyResult` pertence ao grupo `Goals` e usa
`DELETE /api/v2/key_result/{key_result_id}`.

A chamada altera o recurso indicado pelos parâmetros. Confira o resultado com a consulta correspondente antes de continuar.

A resposta preserva o JSON da API; respostas sem corpo retornam `{}`.
A API key do perfil precisa ter acesso ao recurso. As permissões e o plano do Workspace podem restringir o endpoint.
Os campos omitidos são tratados pelo servidor do ClickUp, sem padrões adicionais do cliente.

[Referência oficial](https://developer.clickup.com/reference/deletekeyresult).

| Entrada | Tipo | Obrigatória |
| --- | --- | --- |
| `path.key_result_id` | `string` | sim |
| `confirm` | boolean, somente `true` | sim |

O comando aceita as flags comuns de `api`: `--input`, `--path`, `--query`,
`--body`, `--body-file`, `--content-type`, `--file`, `--dry-run` e `--yes`.
A referência completa de tipos, campos aninhados e valores permitidos está no comando `describe` abaixo.

Exemplos:

Consulte o contrato antes de preencher os IDs reais:

```bash
clickupfy api describe v2-delete-key-result
```

Valide uma entrada em arquivo sem enviar uma requisição:

```bash
clickupfy api v2-delete-key-result --input entrada.json --dry-run
```

Use um envelope JSON pelo stdin:

```bash
printf '%s' '{"path":{"key_result_id":"exemplo-1"},"confirm":true}' | clickupfy api v2-delete-key-result --input -
```

Selecione o perfil que tem acesso ao recurso:

```bash
clickupfy --account produto api v2-delete-key-result --input entrada.json
```

Grave a resposta JSON para conferência. O arquivo de entrada usa o envelope do exemplo anterior:

```bash
clickupfy --json api v2-delete-key-result --input entrada.json > resposta.json
```

### `clickupfy_api_v2_delete_key_result`

A operação `DeleteKeyResult` pertence ao grupo `Goals` e usa
`DELETE /api/v2/key_result/{key_result_id}`.

A chamada altera o recurso indicado pelos parâmetros. Confira o resultado com a consulta correspondente antes de continuar.

A resposta preserva o JSON da API; respostas sem corpo retornam `{}`.
A API key do perfil precisa ter acesso ao recurso. As permissões e o plano do Workspace podem restringir o endpoint.
Os campos omitidos são tratados pelo servidor do ClickUp, sem padrões adicionais do cliente.

[Referência oficial](https://developer.clickup.com/reference/deletekeyresult).

| Entrada | Tipo | Obrigatória |
| --- | --- | --- |
| `path.key_result_id` | `string` | sim |
| `confirm` | boolean, somente `true` | sim |

`account` é opcional e usa o perfil ativo ou fixado no MCP. O retorno aparece em
`content` como JSON; recusas retornam `isError: true`. Ferramentas de escrita
ficam ausentes em `--read-only`. IDs explícitos devem respeitar a hierarquia fixada.

Exemplos:

Use o perfil ativo com o envelope mínimo:

```json
{
  "name": "clickupfy_api_v2_delete_key_result",
  "arguments": {
    "path": {
      "key_result_id": "exemplo-1"
    },
    "confirm": true
  }
}
```

Direcione a chamada ao perfil de desenvolvimento:

```json
{
  "name": "clickupfy_api_v2_delete_key_result",
  "arguments": {
    "path": {
      "key_result_id": "exemplo-1"
    },
    "confirm": true,
    "account": "dev"
  }
}
```

Use o perfil do produto, quando o MCP permitir selecionar outro perfil:

```json
{
  "name": "clickupfy_api_v2_delete_key_result",
  "arguments": {
    "path": {
      "key_result_id": "exemplo-1"
    },
    "confirm": true,
    "account": "produto"
  }
}
```

Consulte o schema antes de compor uma chamada pelo agente:

```bash
clickupfy api describe clickupfy_api_v2_delete_key_result
```

Reproduza pelo CLI a entrada usada pelo agente, sem executar a operação:

```bash
printf '%s' '{"path":{"key_result_id":"exemplo-1"},"confirm":true}' | clickupfy api v2-delete-key-result --input - --dry-run
```

### `clickupfy api v2-invite-guest-to-workspace`

A operação `InviteGuestToWorkspace` pertence ao grupo `Guests` e usa
`POST /api/v2/team/{team_id}/guest`.

A chamada altera o recurso indicado pelos parâmetros. Confira o resultado com a consulta correspondente antes de continuar.

A resposta preserva o JSON da API; respostas sem corpo retornam `{}`.
A API key do perfil precisa ter acesso ao recurso. As permissões e o plano do Workspace podem restringir o endpoint.
Os campos omitidos são tratados pelo servidor do ClickUp, sem padrões adicionais do cliente.

[Referência oficial](https://developer.clickup.com/reference/inviteguesttoworkspace).

| Entrada | Tipo | Obrigatória |
| --- | --- | --- |
| `path.team_id` | `number` | sim |
| `body` | objeto conforme `api describe` | sim |

O comando aceita as flags comuns de `api`: `--input`, `--path`, `--query`,
`--body`, `--body-file`, `--content-type`, `--file`, `--dry-run` e `--yes`.
A referência completa de tipos, campos aninhados e valores permitidos está no comando `describe` abaixo.

Exemplos:

Consulte o contrato antes de preencher os IDs reais:

```bash
clickupfy api describe v2-invite-guest-to-workspace
```

Valide uma entrada em arquivo sem enviar uma requisição:

```bash
clickupfy api v2-invite-guest-to-workspace --input entrada.json --dry-run
```

Use um envelope JSON pelo stdin:

```bash
printf '%s' '{"path":{"team_id":1},"body":{"email":"exemplo-1"}}' | clickupfy api v2-invite-guest-to-workspace --input -
```

Selecione o perfil que tem acesso ao recurso:

```bash
clickupfy --account produto api v2-invite-guest-to-workspace --input entrada.json
```

Grave a resposta JSON para conferência. O arquivo de entrada usa o envelope do exemplo anterior:

```bash
clickupfy --json api v2-invite-guest-to-workspace --input entrada.json > resposta.json
```

### `clickupfy_api_v2_invite_guest_to_workspace`

A operação `InviteGuestToWorkspace` pertence ao grupo `Guests` e usa
`POST /api/v2/team/{team_id}/guest`.

A chamada altera o recurso indicado pelos parâmetros. Confira o resultado com a consulta correspondente antes de continuar.

A resposta preserva o JSON da API; respostas sem corpo retornam `{}`.
A API key do perfil precisa ter acesso ao recurso. As permissões e o plano do Workspace podem restringir o endpoint.
Os campos omitidos são tratados pelo servidor do ClickUp, sem padrões adicionais do cliente.

[Referência oficial](https://developer.clickup.com/reference/inviteguesttoworkspace).

| Entrada | Tipo | Obrigatória |
| --- | --- | --- |
| `path.team_id` | `number` | sim |
| `body` | objeto conforme `api describe` | sim |

`account` é opcional e usa o perfil ativo ou fixado no MCP. O retorno aparece em
`content` como JSON; recusas retornam `isError: true`. Ferramentas de escrita
ficam ausentes em `--read-only`. IDs explícitos devem respeitar a hierarquia fixada.

Exemplos:

Use o perfil ativo com o envelope mínimo:

```json
{
  "name": "clickupfy_api_v2_invite_guest_to_workspace",
  "arguments": {
    "path": {
      "team_id": 1
    },
    "body": {
      "email": "exemplo-1"
    }
  }
}
```

Direcione a chamada ao perfil de desenvolvimento:

```json
{
  "name": "clickupfy_api_v2_invite_guest_to_workspace",
  "arguments": {
    "path": {
      "team_id": 1
    },
    "body": {
      "email": "exemplo-1"
    },
    "account": "dev"
  }
}
```

Use o perfil do produto, quando o MCP permitir selecionar outro perfil:

```json
{
  "name": "clickupfy_api_v2_invite_guest_to_workspace",
  "arguments": {
    "path": {
      "team_id": 1
    },
    "body": {
      "email": "exemplo-1"
    },
    "account": "produto"
  }
}
```

Consulte o schema antes de compor uma chamada pelo agente:

```bash
clickupfy api describe clickupfy_api_v2_invite_guest_to_workspace
```

Reproduza pelo CLI a entrada usada pelo agente, sem executar a operação:

```bash
printf '%s' '{"path":{"team_id":1},"body":{"email":"exemplo-1"}}' | clickupfy api v2-invite-guest-to-workspace --input - --dry-run
```

### `clickupfy api v2-get-guest`

A operação `GetGuest` pertence ao grupo `Guests` e usa
`GET /api/v2/team/{team_id}/guest/{guest_id}`.

A chamada consulta o recurso sem modificá-lo.

A resposta preserva o JSON da API; respostas sem corpo retornam `{}`.
A API key do perfil precisa ter acesso ao recurso. As permissões e o plano do Workspace podem restringir o endpoint.
Os campos omitidos são tratados pelo servidor do ClickUp, sem padrões adicionais do cliente.

[Referência oficial](https://developer.clickup.com/reference/getguest).

| Entrada | Tipo | Obrigatória |
| --- | --- | --- |
| `path.team_id` | `number` | sim |
| `path.guest_id` | `number` | sim |

O comando aceita as flags comuns de `api`: `--input`, `--path`, `--query`,
`--body`, `--body-file`, `--content-type`, `--file`, `--dry-run` e `--yes`.
A referência completa de tipos, campos aninhados e valores permitidos está no comando `describe` abaixo.

Exemplos:

Consulte o contrato antes de preencher os IDs reais:

```bash
clickupfy api describe v2-get-guest
```

Valide uma entrada em arquivo sem enviar uma requisição:

```bash
clickupfy api v2-get-guest --input entrada.json --dry-run
```

Use um envelope JSON pelo stdin:

```bash
printf '%s' '{"path":{"team_id":1,"guest_id":1}}' | clickupfy api v2-get-guest --input -
```

Selecione o perfil que tem acesso ao recurso:

```bash
clickupfy --account produto api v2-get-guest --input entrada.json
```

Grave a resposta JSON para conferência. O arquivo de entrada usa o envelope do exemplo anterior:

```bash
clickupfy --json api v2-get-guest --input entrada.json > resposta.json
```

### `clickupfy_api_v2_get_guest`

A operação `GetGuest` pertence ao grupo `Guests` e usa
`GET /api/v2/team/{team_id}/guest/{guest_id}`.

A chamada consulta o recurso sem modificá-lo.

A resposta preserva o JSON da API; respostas sem corpo retornam `{}`.
A API key do perfil precisa ter acesso ao recurso. As permissões e o plano do Workspace podem restringir o endpoint.
Os campos omitidos são tratados pelo servidor do ClickUp, sem padrões adicionais do cliente.

[Referência oficial](https://developer.clickup.com/reference/getguest).

| Entrada | Tipo | Obrigatória |
| --- | --- | --- |
| `path.team_id` | `number` | sim |
| `path.guest_id` | `number` | sim |

`account` é opcional e usa o perfil ativo ou fixado no MCP. O retorno aparece em
`content` como JSON; recusas retornam `isError: true`. Ferramentas de escrita
ficam ausentes em `--read-only`. IDs explícitos devem respeitar a hierarquia fixada.

Exemplos:

Use o perfil ativo com o envelope mínimo:

```json
{
  "name": "clickupfy_api_v2_get_guest",
  "arguments": {
    "path": {
      "team_id": 1,
      "guest_id": 1
    }
  }
}
```

Direcione a chamada ao perfil de desenvolvimento:

```json
{
  "name": "clickupfy_api_v2_get_guest",
  "arguments": {
    "path": {
      "team_id": 1,
      "guest_id": 1
    },
    "account": "dev"
  }
}
```

Use o perfil do produto, quando o MCP permitir selecionar outro perfil:

```json
{
  "name": "clickupfy_api_v2_get_guest",
  "arguments": {
    "path": {
      "team_id": 1,
      "guest_id": 1
    },
    "account": "produto"
  }
}
```

Consulte o schema antes de compor uma chamada pelo agente:

```bash
clickupfy api describe clickupfy_api_v2_get_guest
```

Reproduza pelo CLI a entrada usada pelo agente, sem executar a operação:

```bash
printf '%s' '{"path":{"team_id":1,"guest_id":1}}' | clickupfy api v2-get-guest --input - --dry-run
```

### `clickupfy api v2-edit-guest-on-workspace`

A operação `EditGuestOnWorkspace` pertence ao grupo `Guests` e usa
`PUT /api/v2/team/{team_id}/guest/{guest_id}`.

A chamada altera o recurso indicado pelos parâmetros. Confira o resultado com a consulta correspondente antes de continuar.

A resposta preserva o JSON da API; respostas sem corpo retornam `{}`.
A API key do perfil precisa ter acesso ao recurso. As permissões e o plano do Workspace podem restringir o endpoint.
Os campos omitidos são tratados pelo servidor do ClickUp, sem padrões adicionais do cliente.

[Referência oficial](https://developer.clickup.com/reference/editguestonworkspace).

| Entrada | Tipo | Obrigatória |
| --- | --- | --- |
| `path.team_id` | `number` | sim |
| `path.guest_id` | `number` | sim |
| `body` | objeto conforme `api describe` | não |

O comando aceita as flags comuns de `api`: `--input`, `--path`, `--query`,
`--body`, `--body-file`, `--content-type`, `--file`, `--dry-run` e `--yes`.
A referência completa de tipos, campos aninhados e valores permitidos está no comando `describe` abaixo.

Exemplos:

Consulte o contrato antes de preencher os IDs reais:

```bash
clickupfy api describe v2-edit-guest-on-workspace
```

Valide uma entrada em arquivo sem enviar uma requisição:

```bash
clickupfy api v2-edit-guest-on-workspace --input entrada.json --dry-run
```

Use um envelope JSON pelo stdin:

```bash
printf '%s' '{"path":{"team_id":1,"guest_id":1}}' | clickupfy api v2-edit-guest-on-workspace --input -
```

Selecione o perfil que tem acesso ao recurso:

```bash
clickupfy --account produto api v2-edit-guest-on-workspace --input entrada.json
```

Grave a resposta JSON para conferência. O arquivo de entrada usa o envelope do exemplo anterior:

```bash
clickupfy --json api v2-edit-guest-on-workspace --input entrada.json > resposta.json
```

### `clickupfy_api_v2_edit_guest_on_workspace`

A operação `EditGuestOnWorkspace` pertence ao grupo `Guests` e usa
`PUT /api/v2/team/{team_id}/guest/{guest_id}`.

A chamada altera o recurso indicado pelos parâmetros. Confira o resultado com a consulta correspondente antes de continuar.

A resposta preserva o JSON da API; respostas sem corpo retornam `{}`.
A API key do perfil precisa ter acesso ao recurso. As permissões e o plano do Workspace podem restringir o endpoint.
Os campos omitidos são tratados pelo servidor do ClickUp, sem padrões adicionais do cliente.

[Referência oficial](https://developer.clickup.com/reference/editguestonworkspace).

| Entrada | Tipo | Obrigatória |
| --- | --- | --- |
| `path.team_id` | `number` | sim |
| `path.guest_id` | `number` | sim |
| `body` | objeto conforme `api describe` | não |

`account` é opcional e usa o perfil ativo ou fixado no MCP. O retorno aparece em
`content` como JSON; recusas retornam `isError: true`. Ferramentas de escrita
ficam ausentes em `--read-only`. IDs explícitos devem respeitar a hierarquia fixada.

Exemplos:

Use o perfil ativo com o envelope mínimo:

```json
{
  "name": "clickupfy_api_v2_edit_guest_on_workspace",
  "arguments": {
    "path": {
      "team_id": 1,
      "guest_id": 1
    }
  }
}
```

Direcione a chamada ao perfil de desenvolvimento:

```json
{
  "name": "clickupfy_api_v2_edit_guest_on_workspace",
  "arguments": {
    "path": {
      "team_id": 1,
      "guest_id": 1
    },
    "account": "dev"
  }
}
```

Use o perfil do produto, quando o MCP permitir selecionar outro perfil:

```json
{
  "name": "clickupfy_api_v2_edit_guest_on_workspace",
  "arguments": {
    "path": {
      "team_id": 1,
      "guest_id": 1
    },
    "account": "produto"
  }
}
```

Consulte o schema antes de compor uma chamada pelo agente:

```bash
clickupfy api describe clickupfy_api_v2_edit_guest_on_workspace
```

Reproduza pelo CLI a entrada usada pelo agente, sem executar a operação:

```bash
printf '%s' '{"path":{"team_id":1,"guest_id":1}}' | clickupfy api v2-edit-guest-on-workspace --input - --dry-run
```

### `clickupfy api v2-remove-guest-from-workspace`

A operação `RemoveGuestFromWorkspace` pertence ao grupo `Guests` e usa
`DELETE /api/v2/team/{team_id}/guest/{guest_id}`.

A chamada altera o recurso indicado pelos parâmetros. Confira o resultado com a consulta correspondente antes de continuar.

A resposta preserva o JSON da API; respostas sem corpo retornam `{}`.
A API key do perfil precisa ter acesso ao recurso. As permissões e o plano do Workspace podem restringir o endpoint.
Os campos omitidos são tratados pelo servidor do ClickUp, sem padrões adicionais do cliente.

[Referência oficial](https://developer.clickup.com/reference/removeguestfromworkspace).

| Entrada | Tipo | Obrigatória |
| --- | --- | --- |
| `path.team_id` | `number` | sim |
| `path.guest_id` | `number` | sim |
| `confirm` | boolean, somente `true` | sim |

O comando aceita as flags comuns de `api`: `--input`, `--path`, `--query`,
`--body`, `--body-file`, `--content-type`, `--file`, `--dry-run` e `--yes`.
A referência completa de tipos, campos aninhados e valores permitidos está no comando `describe` abaixo.

Exemplos:

Consulte o contrato antes de preencher os IDs reais:

```bash
clickupfy api describe v2-remove-guest-from-workspace
```

Valide uma entrada em arquivo sem enviar uma requisição:

```bash
clickupfy api v2-remove-guest-from-workspace --input entrada.json --dry-run
```

Use um envelope JSON pelo stdin:

```bash
printf '%s' '{"path":{"team_id":1,"guest_id":1},"confirm":true}' | clickupfy api v2-remove-guest-from-workspace --input -
```

Selecione o perfil que tem acesso ao recurso:

```bash
clickupfy --account produto api v2-remove-guest-from-workspace --input entrada.json
```

Grave a resposta JSON para conferência. O arquivo de entrada usa o envelope do exemplo anterior:

```bash
clickupfy --json api v2-remove-guest-from-workspace --input entrada.json > resposta.json
```

### `clickupfy_api_v2_remove_guest_from_workspace`

A operação `RemoveGuestFromWorkspace` pertence ao grupo `Guests` e usa
`DELETE /api/v2/team/{team_id}/guest/{guest_id}`.

A chamada altera o recurso indicado pelos parâmetros. Confira o resultado com a consulta correspondente antes de continuar.

A resposta preserva o JSON da API; respostas sem corpo retornam `{}`.
A API key do perfil precisa ter acesso ao recurso. As permissões e o plano do Workspace podem restringir o endpoint.
Os campos omitidos são tratados pelo servidor do ClickUp, sem padrões adicionais do cliente.

[Referência oficial](https://developer.clickup.com/reference/removeguestfromworkspace).

| Entrada | Tipo | Obrigatória |
| --- | --- | --- |
| `path.team_id` | `number` | sim |
| `path.guest_id` | `number` | sim |
| `confirm` | boolean, somente `true` | sim |

`account` é opcional e usa o perfil ativo ou fixado no MCP. O retorno aparece em
`content` como JSON; recusas retornam `isError: true`. Ferramentas de escrita
ficam ausentes em `--read-only`. IDs explícitos devem respeitar a hierarquia fixada.

Exemplos:

Use o perfil ativo com o envelope mínimo:

```json
{
  "name": "clickupfy_api_v2_remove_guest_from_workspace",
  "arguments": {
    "path": {
      "team_id": 1,
      "guest_id": 1
    },
    "confirm": true
  }
}
```

Direcione a chamada ao perfil de desenvolvimento:

```json
{
  "name": "clickupfy_api_v2_remove_guest_from_workspace",
  "arguments": {
    "path": {
      "team_id": 1,
      "guest_id": 1
    },
    "confirm": true,
    "account": "dev"
  }
}
```

Use o perfil do produto, quando o MCP permitir selecionar outro perfil:

```json
{
  "name": "clickupfy_api_v2_remove_guest_from_workspace",
  "arguments": {
    "path": {
      "team_id": 1,
      "guest_id": 1
    },
    "confirm": true,
    "account": "produto"
  }
}
```

Consulte o schema antes de compor uma chamada pelo agente:

```bash
clickupfy api describe clickupfy_api_v2_remove_guest_from_workspace
```

Reproduza pelo CLI a entrada usada pelo agente, sem executar a operação:

```bash
printf '%s' '{"path":{"team_id":1,"guest_id":1},"confirm":true}' | clickupfy api v2-remove-guest-from-workspace --input - --dry-run
```

### `clickupfy api v2-add-guest-to-task`

A operação `AddGuestToTask` pertence ao grupo `Guests` e usa
`POST /api/v2/task/{task_id}/guest/{guest_id}`.

A chamada altera o recurso indicado pelos parâmetros. Confira o resultado com a consulta correspondente antes de continuar.

A resposta preserva o JSON da API; respostas sem corpo retornam `{}`.
A API key do perfil precisa ter acesso ao recurso. As permissões e o plano do Workspace podem restringir o endpoint.
Os campos omitidos são tratados pelo servidor do ClickUp, sem padrões adicionais do cliente.

[Referência oficial](https://developer.clickup.com/reference/addguesttotask).

| Entrada | Tipo | Obrigatória |
| --- | --- | --- |
| `path.task_id` | `string` | sim |
| `path.guest_id` | `number` | sim |
| `query.include_shared` | `boolean` | não |
| `query.custom_task_ids` | `boolean` | não |
| `query.team_id` | `number` | não |
| `body` | objeto conforme `api describe` | sim |

O comando aceita as flags comuns de `api`: `--input`, `--path`, `--query`,
`--body`, `--body-file`, `--content-type`, `--file`, `--dry-run` e `--yes`.
A referência completa de tipos, campos aninhados e valores permitidos está no comando `describe` abaixo.

Exemplos:

Consulte o contrato antes de preencher os IDs reais:

```bash
clickupfy api describe v2-add-guest-to-task
```

Valide uma entrada em arquivo sem enviar uma requisição:

```bash
clickupfy api v2-add-guest-to-task --input entrada.json --dry-run
```

Use um envelope JSON pelo stdin:

```bash
printf '%s' '{"path":{"task_id":"exemplo-1","guest_id":1},"body":{"permission_level":"exemplo-1"}}' | clickupfy api v2-add-guest-to-task --input -
```

Selecione o perfil que tem acesso ao recurso:

```bash
clickupfy --account produto api v2-add-guest-to-task --input entrada.json
```

Grave a resposta JSON para conferência. O arquivo de entrada usa o envelope do exemplo anterior:

```bash
clickupfy --json api v2-add-guest-to-task --input entrada.json > resposta.json
```

### `clickupfy_api_v2_add_guest_to_task`

A operação `AddGuestToTask` pertence ao grupo `Guests` e usa
`POST /api/v2/task/{task_id}/guest/{guest_id}`.

A chamada altera o recurso indicado pelos parâmetros. Confira o resultado com a consulta correspondente antes de continuar.

A resposta preserva o JSON da API; respostas sem corpo retornam `{}`.
A API key do perfil precisa ter acesso ao recurso. As permissões e o plano do Workspace podem restringir o endpoint.
Os campos omitidos são tratados pelo servidor do ClickUp, sem padrões adicionais do cliente.

[Referência oficial](https://developer.clickup.com/reference/addguesttotask).

| Entrada | Tipo | Obrigatória |
| --- | --- | --- |
| `path.task_id` | `string` | sim |
| `path.guest_id` | `number` | sim |
| `query.include_shared` | `boolean` | não |
| `query.custom_task_ids` | `boolean` | não |
| `query.team_id` | `number` | não |
| `body` | objeto conforme `api describe` | sim |

`account` é opcional e usa o perfil ativo ou fixado no MCP. O retorno aparece em
`content` como JSON; recusas retornam `isError: true`. Ferramentas de escrita
ficam ausentes em `--read-only`. IDs explícitos devem respeitar a hierarquia fixada.

Exemplos:

Use o perfil ativo com o envelope mínimo:

```json
{
  "name": "clickupfy_api_v2_add_guest_to_task",
  "arguments": {
    "path": {
      "task_id": "exemplo-1",
      "guest_id": 1
    },
    "body": {
      "permission_level": "exemplo-1"
    }
  }
}
```

Direcione a chamada ao perfil de desenvolvimento:

```json
{
  "name": "clickupfy_api_v2_add_guest_to_task",
  "arguments": {
    "path": {
      "task_id": "exemplo-1",
      "guest_id": 1
    },
    "body": {
      "permission_level": "exemplo-1"
    },
    "account": "dev"
  }
}
```

Use o perfil do produto, quando o MCP permitir selecionar outro perfil:

```json
{
  "name": "clickupfy_api_v2_add_guest_to_task",
  "arguments": {
    "path": {
      "task_id": "exemplo-1",
      "guest_id": 1
    },
    "body": {
      "permission_level": "exemplo-1"
    },
    "account": "produto"
  }
}
```

Consulte o schema antes de compor uma chamada pelo agente:

```bash
clickupfy api describe clickupfy_api_v2_add_guest_to_task
```

Reproduza pelo CLI a entrada usada pelo agente, sem executar a operação:

```bash
printf '%s' '{"path":{"task_id":"exemplo-1","guest_id":1},"body":{"permission_level":"exemplo-1"}}' | clickupfy api v2-add-guest-to-task --input - --dry-run
```

### `clickupfy api v2-remove-guest-from-task`

A operação `RemoveGuestFromTask` pertence ao grupo `Guests` e usa
`DELETE /api/v2/task/{task_id}/guest/{guest_id}`.

A chamada altera o recurso indicado pelos parâmetros. Confira o resultado com a consulta correspondente antes de continuar.

A resposta preserva o JSON da API; respostas sem corpo retornam `{}`.
A API key do perfil precisa ter acesso ao recurso. As permissões e o plano do Workspace podem restringir o endpoint.
Os campos omitidos são tratados pelo servidor do ClickUp, sem padrões adicionais do cliente.

[Referência oficial](https://developer.clickup.com/reference/removeguestfromtask).

| Entrada | Tipo | Obrigatória |
| --- | --- | --- |
| `path.task_id` | `string` | sim |
| `path.guest_id` | `number` | sim |
| `query.include_shared` | `boolean` | não |
| `query.custom_task_ids` | `boolean` | não |
| `query.team_id` | `number` | não |
| `confirm` | boolean, somente `true` | sim |

O comando aceita as flags comuns de `api`: `--input`, `--path`, `--query`,
`--body`, `--body-file`, `--content-type`, `--file`, `--dry-run` e `--yes`.
A referência completa de tipos, campos aninhados e valores permitidos está no comando `describe` abaixo.

Exemplos:

Consulte o contrato antes de preencher os IDs reais:

```bash
clickupfy api describe v2-remove-guest-from-task
```

Valide uma entrada em arquivo sem enviar uma requisição:

```bash
clickupfy api v2-remove-guest-from-task --input entrada.json --dry-run
```

Use um envelope JSON pelo stdin:

```bash
printf '%s' '{"path":{"task_id":"exemplo-1","guest_id":1},"confirm":true}' | clickupfy api v2-remove-guest-from-task --input -
```

Selecione o perfil que tem acesso ao recurso:

```bash
clickupfy --account produto api v2-remove-guest-from-task --input entrada.json
```

Grave a resposta JSON para conferência. O arquivo de entrada usa o envelope do exemplo anterior:

```bash
clickupfy --json api v2-remove-guest-from-task --input entrada.json > resposta.json
```

### `clickupfy_api_v2_remove_guest_from_task`

A operação `RemoveGuestFromTask` pertence ao grupo `Guests` e usa
`DELETE /api/v2/task/{task_id}/guest/{guest_id}`.

A chamada altera o recurso indicado pelos parâmetros. Confira o resultado com a consulta correspondente antes de continuar.

A resposta preserva o JSON da API; respostas sem corpo retornam `{}`.
A API key do perfil precisa ter acesso ao recurso. As permissões e o plano do Workspace podem restringir o endpoint.
Os campos omitidos são tratados pelo servidor do ClickUp, sem padrões adicionais do cliente.

[Referência oficial](https://developer.clickup.com/reference/removeguestfromtask).

| Entrada | Tipo | Obrigatória |
| --- | --- | --- |
| `path.task_id` | `string` | sim |
| `path.guest_id` | `number` | sim |
| `query.include_shared` | `boolean` | não |
| `query.custom_task_ids` | `boolean` | não |
| `query.team_id` | `number` | não |
| `confirm` | boolean, somente `true` | sim |

`account` é opcional e usa o perfil ativo ou fixado no MCP. O retorno aparece em
`content` como JSON; recusas retornam `isError: true`. Ferramentas de escrita
ficam ausentes em `--read-only`. IDs explícitos devem respeitar a hierarquia fixada.

Exemplos:

Use o perfil ativo com o envelope mínimo:

```json
{
  "name": "clickupfy_api_v2_remove_guest_from_task",
  "arguments": {
    "path": {
      "task_id": "exemplo-1",
      "guest_id": 1
    },
    "confirm": true
  }
}
```

Direcione a chamada ao perfil de desenvolvimento:

```json
{
  "name": "clickupfy_api_v2_remove_guest_from_task",
  "arguments": {
    "path": {
      "task_id": "exemplo-1",
      "guest_id": 1
    },
    "confirm": true,
    "account": "dev"
  }
}
```

Use o perfil do produto, quando o MCP permitir selecionar outro perfil:

```json
{
  "name": "clickupfy_api_v2_remove_guest_from_task",
  "arguments": {
    "path": {
      "task_id": "exemplo-1",
      "guest_id": 1
    },
    "confirm": true,
    "account": "produto"
  }
}
```

Consulte o schema antes de compor uma chamada pelo agente:

```bash
clickupfy api describe clickupfy_api_v2_remove_guest_from_task
```

Reproduza pelo CLI a entrada usada pelo agente, sem executar a operação:

```bash
printf '%s' '{"path":{"task_id":"exemplo-1","guest_id":1},"confirm":true}' | clickupfy api v2-remove-guest-from-task --input - --dry-run
```

### `clickupfy api v2-add-guest-to-list`

A operação `AddGuestToList` pertence ao grupo `Guests` e usa
`POST /api/v2/list/{list_id}/guest/{guest_id}`.

A chamada altera o recurso indicado pelos parâmetros. Confira o resultado com a consulta correspondente antes de continuar.

A resposta preserva o JSON da API; respostas sem corpo retornam `{}`.
A API key do perfil precisa ter acesso ao recurso. As permissões e o plano do Workspace podem restringir o endpoint.
Os campos omitidos são tratados pelo servidor do ClickUp, sem padrões adicionais do cliente.

[Referência oficial](https://developer.clickup.com/reference/addguesttolist).

| Entrada | Tipo | Obrigatória |
| --- | --- | --- |
| `path.list_id` | `number` | sim |
| `path.guest_id` | `number` | sim |
| `query.include_shared` | `boolean` | não |
| `body` | objeto conforme `api describe` | sim |

O comando aceita as flags comuns de `api`: `--input`, `--path`, `--query`,
`--body`, `--body-file`, `--content-type`, `--file`, `--dry-run` e `--yes`.
A referência completa de tipos, campos aninhados e valores permitidos está no comando `describe` abaixo.

Exemplos:

Consulte o contrato antes de preencher os IDs reais:

```bash
clickupfy api describe v2-add-guest-to-list
```

Valide uma entrada em arquivo sem enviar uma requisição:

```bash
clickupfy api v2-add-guest-to-list --input entrada.json --dry-run
```

Use um envelope JSON pelo stdin:

```bash
printf '%s' '{"path":{"list_id":1,"guest_id":1},"body":{"permission_level":"exemplo-1"}}' | clickupfy api v2-add-guest-to-list --input -
```

Selecione o perfil que tem acesso ao recurso:

```bash
clickupfy --account produto api v2-add-guest-to-list --input entrada.json
```

Grave a resposta JSON para conferência. O arquivo de entrada usa o envelope do exemplo anterior:

```bash
clickupfy --json api v2-add-guest-to-list --input entrada.json > resposta.json
```

### `clickupfy_api_v2_add_guest_to_list`

A operação `AddGuestToList` pertence ao grupo `Guests` e usa
`POST /api/v2/list/{list_id}/guest/{guest_id}`.

A chamada altera o recurso indicado pelos parâmetros. Confira o resultado com a consulta correspondente antes de continuar.

A resposta preserva o JSON da API; respostas sem corpo retornam `{}`.
A API key do perfil precisa ter acesso ao recurso. As permissões e o plano do Workspace podem restringir o endpoint.
Os campos omitidos são tratados pelo servidor do ClickUp, sem padrões adicionais do cliente.

[Referência oficial](https://developer.clickup.com/reference/addguesttolist).

| Entrada | Tipo | Obrigatória |
| --- | --- | --- |
| `path.list_id` | `number` | sim |
| `path.guest_id` | `number` | sim |
| `query.include_shared` | `boolean` | não |
| `body` | objeto conforme `api describe` | sim |

`account` é opcional e usa o perfil ativo ou fixado no MCP. O retorno aparece em
`content` como JSON; recusas retornam `isError: true`. Ferramentas de escrita
ficam ausentes em `--read-only`. IDs explícitos devem respeitar a hierarquia fixada.

Exemplos:

Use o perfil ativo com o envelope mínimo:

```json
{
  "name": "clickupfy_api_v2_add_guest_to_list",
  "arguments": {
    "path": {
      "list_id": 1,
      "guest_id": 1
    },
    "body": {
      "permission_level": "exemplo-1"
    }
  }
}
```

Direcione a chamada ao perfil de desenvolvimento:

```json
{
  "name": "clickupfy_api_v2_add_guest_to_list",
  "arguments": {
    "path": {
      "list_id": 1,
      "guest_id": 1
    },
    "body": {
      "permission_level": "exemplo-1"
    },
    "account": "dev"
  }
}
```

Use o perfil do produto, quando o MCP permitir selecionar outro perfil:

```json
{
  "name": "clickupfy_api_v2_add_guest_to_list",
  "arguments": {
    "path": {
      "list_id": 1,
      "guest_id": 1
    },
    "body": {
      "permission_level": "exemplo-1"
    },
    "account": "produto"
  }
}
```

Consulte o schema antes de compor uma chamada pelo agente:

```bash
clickupfy api describe clickupfy_api_v2_add_guest_to_list
```

Reproduza pelo CLI a entrada usada pelo agente, sem executar a operação:

```bash
printf '%s' '{"path":{"list_id":1,"guest_id":1},"body":{"permission_level":"exemplo-1"}}' | clickupfy api v2-add-guest-to-list --input - --dry-run
```

### `clickupfy api v2-remove-guest-from-list`

A operação `RemoveGuestFromList` pertence ao grupo `Guests` e usa
`DELETE /api/v2/list/{list_id}/guest/{guest_id}`.

A chamada altera o recurso indicado pelos parâmetros. Confira o resultado com a consulta correspondente antes de continuar.

A resposta preserva o JSON da API; respostas sem corpo retornam `{}`.
A API key do perfil precisa ter acesso ao recurso. As permissões e o plano do Workspace podem restringir o endpoint.
Os campos omitidos são tratados pelo servidor do ClickUp, sem padrões adicionais do cliente.

[Referência oficial](https://developer.clickup.com/reference/removeguestfromlist).

| Entrada | Tipo | Obrigatória |
| --- | --- | --- |
| `path.list_id` | `number` | sim |
| `path.guest_id` | `number` | sim |
| `query.include_shared` | `boolean` | não |
| `confirm` | boolean, somente `true` | sim |

O comando aceita as flags comuns de `api`: `--input`, `--path`, `--query`,
`--body`, `--body-file`, `--content-type`, `--file`, `--dry-run` e `--yes`.
A referência completa de tipos, campos aninhados e valores permitidos está no comando `describe` abaixo.

Exemplos:

Consulte o contrato antes de preencher os IDs reais:

```bash
clickupfy api describe v2-remove-guest-from-list
```

Valide uma entrada em arquivo sem enviar uma requisição:

```bash
clickupfy api v2-remove-guest-from-list --input entrada.json --dry-run
```

Use um envelope JSON pelo stdin:

```bash
printf '%s' '{"path":{"list_id":1,"guest_id":1},"confirm":true}' | clickupfy api v2-remove-guest-from-list --input -
```

Selecione o perfil que tem acesso ao recurso:

```bash
clickupfy --account produto api v2-remove-guest-from-list --input entrada.json
```

Grave a resposta JSON para conferência. O arquivo de entrada usa o envelope do exemplo anterior:

```bash
clickupfy --json api v2-remove-guest-from-list --input entrada.json > resposta.json
```

### `clickupfy_api_v2_remove_guest_from_list`

A operação `RemoveGuestFromList` pertence ao grupo `Guests` e usa
`DELETE /api/v2/list/{list_id}/guest/{guest_id}`.

A chamada altera o recurso indicado pelos parâmetros. Confira o resultado com a consulta correspondente antes de continuar.

A resposta preserva o JSON da API; respostas sem corpo retornam `{}`.
A API key do perfil precisa ter acesso ao recurso. As permissões e o plano do Workspace podem restringir o endpoint.
Os campos omitidos são tratados pelo servidor do ClickUp, sem padrões adicionais do cliente.

[Referência oficial](https://developer.clickup.com/reference/removeguestfromlist).

| Entrada | Tipo | Obrigatória |
| --- | --- | --- |
| `path.list_id` | `number` | sim |
| `path.guest_id` | `number` | sim |
| `query.include_shared` | `boolean` | não |
| `confirm` | boolean, somente `true` | sim |

`account` é opcional e usa o perfil ativo ou fixado no MCP. O retorno aparece em
`content` como JSON; recusas retornam `isError: true`. Ferramentas de escrita
ficam ausentes em `--read-only`. IDs explícitos devem respeitar a hierarquia fixada.

Exemplos:

Use o perfil ativo com o envelope mínimo:

```json
{
  "name": "clickupfy_api_v2_remove_guest_from_list",
  "arguments": {
    "path": {
      "list_id": 1,
      "guest_id": 1
    },
    "confirm": true
  }
}
```

Direcione a chamada ao perfil de desenvolvimento:

```json
{
  "name": "clickupfy_api_v2_remove_guest_from_list",
  "arguments": {
    "path": {
      "list_id": 1,
      "guest_id": 1
    },
    "confirm": true,
    "account": "dev"
  }
}
```

Use o perfil do produto, quando o MCP permitir selecionar outro perfil:

```json
{
  "name": "clickupfy_api_v2_remove_guest_from_list",
  "arguments": {
    "path": {
      "list_id": 1,
      "guest_id": 1
    },
    "confirm": true,
    "account": "produto"
  }
}
```

Consulte o schema antes de compor uma chamada pelo agente:

```bash
clickupfy api describe clickupfy_api_v2_remove_guest_from_list
```

Reproduza pelo CLI a entrada usada pelo agente, sem executar a operação:

```bash
printf '%s' '{"path":{"list_id":1,"guest_id":1},"confirm":true}' | clickupfy api v2-remove-guest-from-list --input - --dry-run
```

### `clickupfy api v2-add-guest-to-folder`

A operação `AddGuestToFolder` pertence ao grupo `Guests` e usa
`POST /api/v2/folder/{folder_id}/guest/{guest_id}`.

A chamada altera o recurso indicado pelos parâmetros. Confira o resultado com a consulta correspondente antes de continuar.

A resposta preserva o JSON da API; respostas sem corpo retornam `{}`.
A API key do perfil precisa ter acesso ao recurso. As permissões e o plano do Workspace podem restringir o endpoint.
Os campos omitidos são tratados pelo servidor do ClickUp, sem padrões adicionais do cliente.

[Referência oficial](https://developer.clickup.com/reference/addguesttofolder).

| Entrada | Tipo | Obrigatória |
| --- | --- | --- |
| `path.folder_id` | `number` | sim |
| `path.guest_id` | `number` | sim |
| `query.include_shared` | `boolean` | não |
| `body` | objeto conforme `api describe` | sim |

O comando aceita as flags comuns de `api`: `--input`, `--path`, `--query`,
`--body`, `--body-file`, `--content-type`, `--file`, `--dry-run` e `--yes`.
A referência completa de tipos, campos aninhados e valores permitidos está no comando `describe` abaixo.

Exemplos:

Consulte o contrato antes de preencher os IDs reais:

```bash
clickupfy api describe v2-add-guest-to-folder
```

Valide uma entrada em arquivo sem enviar uma requisição:

```bash
clickupfy api v2-add-guest-to-folder --input entrada.json --dry-run
```

Use um envelope JSON pelo stdin:

```bash
printf '%s' '{"path":{"folder_id":1,"guest_id":1},"body":{"permission_level":"exemplo-1"}}' | clickupfy api v2-add-guest-to-folder --input -
```

Selecione o perfil que tem acesso ao recurso:

```bash
clickupfy --account produto api v2-add-guest-to-folder --input entrada.json
```

Grave a resposta JSON para conferência. O arquivo de entrada usa o envelope do exemplo anterior:

```bash
clickupfy --json api v2-add-guest-to-folder --input entrada.json > resposta.json
```

### `clickupfy_api_v2_add_guest_to_folder`

A operação `AddGuestToFolder` pertence ao grupo `Guests` e usa
`POST /api/v2/folder/{folder_id}/guest/{guest_id}`.

A chamada altera o recurso indicado pelos parâmetros. Confira o resultado com a consulta correspondente antes de continuar.

A resposta preserva o JSON da API; respostas sem corpo retornam `{}`.
A API key do perfil precisa ter acesso ao recurso. As permissões e o plano do Workspace podem restringir o endpoint.
Os campos omitidos são tratados pelo servidor do ClickUp, sem padrões adicionais do cliente.

[Referência oficial](https://developer.clickup.com/reference/addguesttofolder).

| Entrada | Tipo | Obrigatória |
| --- | --- | --- |
| `path.folder_id` | `number` | sim |
| `path.guest_id` | `number` | sim |
| `query.include_shared` | `boolean` | não |
| `body` | objeto conforme `api describe` | sim |

`account` é opcional e usa o perfil ativo ou fixado no MCP. O retorno aparece em
`content` como JSON; recusas retornam `isError: true`. Ferramentas de escrita
ficam ausentes em `--read-only`. IDs explícitos devem respeitar a hierarquia fixada.

Exemplos:

Use o perfil ativo com o envelope mínimo:

```json
{
  "name": "clickupfy_api_v2_add_guest_to_folder",
  "arguments": {
    "path": {
      "folder_id": 1,
      "guest_id": 1
    },
    "body": {
      "permission_level": "exemplo-1"
    }
  }
}
```

Direcione a chamada ao perfil de desenvolvimento:

```json
{
  "name": "clickupfy_api_v2_add_guest_to_folder",
  "arguments": {
    "path": {
      "folder_id": 1,
      "guest_id": 1
    },
    "body": {
      "permission_level": "exemplo-1"
    },
    "account": "dev"
  }
}
```

Use o perfil do produto, quando o MCP permitir selecionar outro perfil:

```json
{
  "name": "clickupfy_api_v2_add_guest_to_folder",
  "arguments": {
    "path": {
      "folder_id": 1,
      "guest_id": 1
    },
    "body": {
      "permission_level": "exemplo-1"
    },
    "account": "produto"
  }
}
```

Consulte o schema antes de compor uma chamada pelo agente:

```bash
clickupfy api describe clickupfy_api_v2_add_guest_to_folder
```

Reproduza pelo CLI a entrada usada pelo agente, sem executar a operação:

```bash
printf '%s' '{"path":{"folder_id":1,"guest_id":1},"body":{"permission_level":"exemplo-1"}}' | clickupfy api v2-add-guest-to-folder --input - --dry-run
```

### `clickupfy api v2-remove-guest-from-folder`

A operação `RemoveGuestFromFolder` pertence ao grupo `Guests` e usa
`DELETE /api/v2/folder/{folder_id}/guest/{guest_id}`.

A chamada altera o recurso indicado pelos parâmetros. Confira o resultado com a consulta correspondente antes de continuar.

A resposta preserva o JSON da API; respostas sem corpo retornam `{}`.
A API key do perfil precisa ter acesso ao recurso. As permissões e o plano do Workspace podem restringir o endpoint.
Os campos omitidos são tratados pelo servidor do ClickUp, sem padrões adicionais do cliente.

[Referência oficial](https://developer.clickup.com/reference/removeguestfromfolder).

| Entrada | Tipo | Obrigatória |
| --- | --- | --- |
| `path.folder_id` | `number` | sim |
| `path.guest_id` | `number` | sim |
| `query.include_shared` | `boolean` | não |
| `confirm` | boolean, somente `true` | sim |

O comando aceita as flags comuns de `api`: `--input`, `--path`, `--query`,
`--body`, `--body-file`, `--content-type`, `--file`, `--dry-run` e `--yes`.
A referência completa de tipos, campos aninhados e valores permitidos está no comando `describe` abaixo.

Exemplos:

Consulte o contrato antes de preencher os IDs reais:

```bash
clickupfy api describe v2-remove-guest-from-folder
```

Valide uma entrada em arquivo sem enviar uma requisição:

```bash
clickupfy api v2-remove-guest-from-folder --input entrada.json --dry-run
```

Use um envelope JSON pelo stdin:

```bash
printf '%s' '{"path":{"folder_id":1,"guest_id":1},"confirm":true}' | clickupfy api v2-remove-guest-from-folder --input -
```

Selecione o perfil que tem acesso ao recurso:

```bash
clickupfy --account produto api v2-remove-guest-from-folder --input entrada.json
```

Grave a resposta JSON para conferência. O arquivo de entrada usa o envelope do exemplo anterior:

```bash
clickupfy --json api v2-remove-guest-from-folder --input entrada.json > resposta.json
```

### `clickupfy_api_v2_remove_guest_from_folder`

A operação `RemoveGuestFromFolder` pertence ao grupo `Guests` e usa
`DELETE /api/v2/folder/{folder_id}/guest/{guest_id}`.

A chamada altera o recurso indicado pelos parâmetros. Confira o resultado com a consulta correspondente antes de continuar.

A resposta preserva o JSON da API; respostas sem corpo retornam `{}`.
A API key do perfil precisa ter acesso ao recurso. As permissões e o plano do Workspace podem restringir o endpoint.
Os campos omitidos são tratados pelo servidor do ClickUp, sem padrões adicionais do cliente.

[Referência oficial](https://developer.clickup.com/reference/removeguestfromfolder).

| Entrada | Tipo | Obrigatória |
| --- | --- | --- |
| `path.folder_id` | `number` | sim |
| `path.guest_id` | `number` | sim |
| `query.include_shared` | `boolean` | não |
| `confirm` | boolean, somente `true` | sim |

`account` é opcional e usa o perfil ativo ou fixado no MCP. O retorno aparece em
`content` como JSON; recusas retornam `isError: true`. Ferramentas de escrita
ficam ausentes em `--read-only`. IDs explícitos devem respeitar a hierarquia fixada.

Exemplos:

Use o perfil ativo com o envelope mínimo:

```json
{
  "name": "clickupfy_api_v2_remove_guest_from_folder",
  "arguments": {
    "path": {
      "folder_id": 1,
      "guest_id": 1
    },
    "confirm": true
  }
}
```

Direcione a chamada ao perfil de desenvolvimento:

```json
{
  "name": "clickupfy_api_v2_remove_guest_from_folder",
  "arguments": {
    "path": {
      "folder_id": 1,
      "guest_id": 1
    },
    "confirm": true,
    "account": "dev"
  }
}
```

Use o perfil do produto, quando o MCP permitir selecionar outro perfil:

```json
{
  "name": "clickupfy_api_v2_remove_guest_from_folder",
  "arguments": {
    "path": {
      "folder_id": 1,
      "guest_id": 1
    },
    "confirm": true,
    "account": "produto"
  }
}
```

Consulte o schema antes de compor uma chamada pelo agente:

```bash
clickupfy api describe clickupfy_api_v2_remove_guest_from_folder
```

Reproduza pelo CLI a entrada usada pelo agente, sem executar a operação:

```bash
printf '%s' '{"path":{"folder_id":1,"guest_id":1},"confirm":true}' | clickupfy api v2-remove-guest-from-folder --input - --dry-run
```

### `clickupfy api v2-get-lists`

A operação `GetLists` pertence ao grupo `Lists` e usa
`GET /api/v2/folder/{folder_id}/list`.

A chamada consulta o recurso sem modificá-lo.

A resposta preserva o JSON da API; respostas sem corpo retornam `{}`.
A API key do perfil precisa ter acesso ao recurso. As permissões e o plano do Workspace podem restringir o endpoint.
Os campos omitidos são tratados pelo servidor do ClickUp, sem padrões adicionais do cliente.

[Referência oficial](https://developer.clickup.com/reference/getlists).

| Entrada | Tipo | Obrigatória |
| --- | --- | --- |
| `path.folder_id` | `number` | sim |
| `query.archived` | `boolean` | não |

O comando aceita as flags comuns de `api`: `--input`, `--path`, `--query`,
`--body`, `--body-file`, `--content-type`, `--file`, `--dry-run` e `--yes`.
A referência completa de tipos, campos aninhados e valores permitidos está no comando `describe` abaixo.

Exemplos:

Consulte o contrato antes de preencher os IDs reais:

```bash
clickupfy api describe v2-get-lists
```

Valide uma entrada em arquivo sem enviar uma requisição:

```bash
clickupfy api v2-get-lists --input entrada.json --dry-run
```

Use um envelope JSON pelo stdin:

```bash
printf '%s' '{"path":{"folder_id":1}}' | clickupfy api v2-get-lists --input -
```

Selecione o perfil que tem acesso ao recurso:

```bash
clickupfy --account produto api v2-get-lists --input entrada.json
```

Grave a resposta JSON para conferência. O arquivo de entrada usa o envelope do exemplo anterior:

```bash
clickupfy --json api v2-get-lists --input entrada.json > resposta.json
```

### `clickupfy_api_v2_get_lists`

A operação `GetLists` pertence ao grupo `Lists` e usa
`GET /api/v2/folder/{folder_id}/list`.

A chamada consulta o recurso sem modificá-lo.

A resposta preserva o JSON da API; respostas sem corpo retornam `{}`.
A API key do perfil precisa ter acesso ao recurso. As permissões e o plano do Workspace podem restringir o endpoint.
Os campos omitidos são tratados pelo servidor do ClickUp, sem padrões adicionais do cliente.

[Referência oficial](https://developer.clickup.com/reference/getlists).

| Entrada | Tipo | Obrigatória |
| --- | --- | --- |
| `path.folder_id` | `number` | sim |
| `query.archived` | `boolean` | não |

`account` é opcional e usa o perfil ativo ou fixado no MCP. O retorno aparece em
`content` como JSON; recusas retornam `isError: true`. Ferramentas de escrita
ficam ausentes em `--read-only`. IDs explícitos devem respeitar a hierarquia fixada.

Exemplos:

Use o perfil ativo com o envelope mínimo:

```json
{
  "name": "clickupfy_api_v2_get_lists",
  "arguments": {
    "path": {
      "folder_id": 1
    }
  }
}
```

Direcione a chamada ao perfil de desenvolvimento:

```json
{
  "name": "clickupfy_api_v2_get_lists",
  "arguments": {
    "path": {
      "folder_id": 1
    },
    "account": "dev"
  }
}
```

Use o perfil do produto, quando o MCP permitir selecionar outro perfil:

```json
{
  "name": "clickupfy_api_v2_get_lists",
  "arguments": {
    "path": {
      "folder_id": 1
    },
    "account": "produto"
  }
}
```

Consulte o schema antes de compor uma chamada pelo agente:

```bash
clickupfy api describe clickupfy_api_v2_get_lists
```

Reproduza pelo CLI a entrada usada pelo agente, sem executar a operação:

```bash
printf '%s' '{"path":{"folder_id":1}}' | clickupfy api v2-get-lists --input - --dry-run
```

### `clickupfy api v2-create-list`

A operação `CreateList` pertence ao grupo `Lists` e usa
`POST /api/v2/folder/{folder_id}/list`.

A chamada altera o recurso indicado pelos parâmetros. Confira o resultado com a consulta correspondente antes de continuar.

A resposta preserva o JSON da API; respostas sem corpo retornam `{}`.
A API key do perfil precisa ter acesso ao recurso. As permissões e o plano do Workspace podem restringir o endpoint.
Os campos omitidos são tratados pelo servidor do ClickUp, sem padrões adicionais do cliente.

[Referência oficial](https://developer.clickup.com/reference/createlist).

| Entrada | Tipo | Obrigatória |
| --- | --- | --- |
| `path.folder_id` | `number` | sim |
| `body` | objeto conforme `api describe` | sim |

O comando aceita as flags comuns de `api`: `--input`, `--path`, `--query`,
`--body`, `--body-file`, `--content-type`, `--file`, `--dry-run` e `--yes`.
A referência completa de tipos, campos aninhados e valores permitidos está no comando `describe` abaixo.

Exemplos:

Consulte o contrato antes de preencher os IDs reais:

```bash
clickupfy api describe v2-create-list
```

Valide uma entrada em arquivo sem enviar uma requisição:

```bash
clickupfy api v2-create-list --input entrada.json --dry-run
```

Use um envelope JSON pelo stdin:

```bash
printf '%s' '{"path":{"folder_id":1},"body":{"name":"exemplo-1"}}' | clickupfy api v2-create-list --input -
```

Selecione o perfil que tem acesso ao recurso:

```bash
clickupfy --account produto api v2-create-list --input entrada.json
```

Grave a resposta JSON para conferência. O arquivo de entrada usa o envelope do exemplo anterior:

```bash
clickupfy --json api v2-create-list --input entrada.json > resposta.json
```

### `clickupfy_api_v2_create_list`

A operação `CreateList` pertence ao grupo `Lists` e usa
`POST /api/v2/folder/{folder_id}/list`.

A chamada altera o recurso indicado pelos parâmetros. Confira o resultado com a consulta correspondente antes de continuar.

A resposta preserva o JSON da API; respostas sem corpo retornam `{}`.
A API key do perfil precisa ter acesso ao recurso. As permissões e o plano do Workspace podem restringir o endpoint.
Os campos omitidos são tratados pelo servidor do ClickUp, sem padrões adicionais do cliente.

[Referência oficial](https://developer.clickup.com/reference/createlist).

| Entrada | Tipo | Obrigatória |
| --- | --- | --- |
| `path.folder_id` | `number` | sim |
| `body` | objeto conforme `api describe` | sim |

`account` é opcional e usa o perfil ativo ou fixado no MCP. O retorno aparece em
`content` como JSON; recusas retornam `isError: true`. Ferramentas de escrita
ficam ausentes em `--read-only`. IDs explícitos devem respeitar a hierarquia fixada.

Exemplos:

Use o perfil ativo com o envelope mínimo:

```json
{
  "name": "clickupfy_api_v2_create_list",
  "arguments": {
    "path": {
      "folder_id": 1
    },
    "body": {
      "name": "exemplo-1"
    }
  }
}
```

Direcione a chamada ao perfil de desenvolvimento:

```json
{
  "name": "clickupfy_api_v2_create_list",
  "arguments": {
    "path": {
      "folder_id": 1
    },
    "body": {
      "name": "exemplo-1"
    },
    "account": "dev"
  }
}
```

Use o perfil do produto, quando o MCP permitir selecionar outro perfil:

```json
{
  "name": "clickupfy_api_v2_create_list",
  "arguments": {
    "path": {
      "folder_id": 1
    },
    "body": {
      "name": "exemplo-1"
    },
    "account": "produto"
  }
}
```

Consulte o schema antes de compor uma chamada pelo agente:

```bash
clickupfy api describe clickupfy_api_v2_create_list
```

Reproduza pelo CLI a entrada usada pelo agente, sem executar a operação:

```bash
printf '%s' '{"path":{"folder_id":1},"body":{"name":"exemplo-1"}}' | clickupfy api v2-create-list --input - --dry-run
```

### `clickupfy api v2-create-folder-from-template`

A operação `CreateFolderFromTemplate` pertence ao grupo `Folders` e usa
`POST /api/v2/space/{space_id}/folder_template/{template_id}`.

A chamada altera o recurso indicado pelos parâmetros. Confira o resultado com a consulta correspondente antes de continuar.

A resposta preserva o JSON da API; respostas sem corpo retornam `{}`.
A API key do perfil precisa ter acesso ao recurso. As permissões e o plano do Workspace podem restringir o endpoint.
Os campos omitidos são tratados pelo servidor do ClickUp, sem padrões adicionais do cliente.

[Referência oficial](https://developer.clickup.com/reference/createfolderfromtemplate).

| Entrada | Tipo | Obrigatória |
| --- | --- | --- |
| `path.space_id` | `string` | sim |
| `path.template_id` | `string` | sim |
| `body` | objeto conforme `api describe` | sim |

O comando aceita as flags comuns de `api`: `--input`, `--path`, `--query`,
`--body`, `--body-file`, `--content-type`, `--file`, `--dry-run` e `--yes`.
A referência completa de tipos, campos aninhados e valores permitidos está no comando `describe` abaixo.

Exemplos:

Consulte o contrato antes de preencher os IDs reais:

```bash
clickupfy api describe v2-create-folder-from-template
```

Valide uma entrada em arquivo sem enviar uma requisição:

```bash
clickupfy api v2-create-folder-from-template --input entrada.json --dry-run
```

Use um envelope JSON pelo stdin:

```bash
printf '%s' '{"path":{"space_id":"exemplo-1","template_id":"exemplo-1"},"body":{"name":"exemplo-1"}}' | clickupfy api v2-create-folder-from-template --input -
```

Selecione o perfil que tem acesso ao recurso:

```bash
clickupfy --account produto api v2-create-folder-from-template --input entrada.json
```

Grave a resposta JSON para conferência. O arquivo de entrada usa o envelope do exemplo anterior:

```bash
clickupfy --json api v2-create-folder-from-template --input entrada.json > resposta.json
```

### `clickupfy_api_v2_create_folder_from_template`

A operação `CreateFolderFromTemplate` pertence ao grupo `Folders` e usa
`POST /api/v2/space/{space_id}/folder_template/{template_id}`.

A chamada altera o recurso indicado pelos parâmetros. Confira o resultado com a consulta correspondente antes de continuar.

A resposta preserva o JSON da API; respostas sem corpo retornam `{}`.
A API key do perfil precisa ter acesso ao recurso. As permissões e o plano do Workspace podem restringir o endpoint.
Os campos omitidos são tratados pelo servidor do ClickUp, sem padrões adicionais do cliente.

[Referência oficial](https://developer.clickup.com/reference/createfolderfromtemplate).

| Entrada | Tipo | Obrigatória |
| --- | --- | --- |
| `path.space_id` | `string` | sim |
| `path.template_id` | `string` | sim |
| `body` | objeto conforme `api describe` | sim |

`account` é opcional e usa o perfil ativo ou fixado no MCP. O retorno aparece em
`content` como JSON; recusas retornam `isError: true`. Ferramentas de escrita
ficam ausentes em `--read-only`. IDs explícitos devem respeitar a hierarquia fixada.

Exemplos:

Use o perfil ativo com o envelope mínimo:

```json
{
  "name": "clickupfy_api_v2_create_folder_from_template",
  "arguments": {
    "path": {
      "space_id": "exemplo-1",
      "template_id": "exemplo-1"
    },
    "body": {
      "name": "exemplo-1"
    }
  }
}
```

Direcione a chamada ao perfil de desenvolvimento:

```json
{
  "name": "clickupfy_api_v2_create_folder_from_template",
  "arguments": {
    "path": {
      "space_id": "exemplo-1",
      "template_id": "exemplo-1"
    },
    "body": {
      "name": "exemplo-1"
    },
    "account": "dev"
  }
}
```

Use o perfil do produto, quando o MCP permitir selecionar outro perfil:

```json
{
  "name": "clickupfy_api_v2_create_folder_from_template",
  "arguments": {
    "path": {
      "space_id": "exemplo-1",
      "template_id": "exemplo-1"
    },
    "body": {
      "name": "exemplo-1"
    },
    "account": "produto"
  }
}
```

Consulte o schema antes de compor uma chamada pelo agente:

```bash
clickupfy api describe clickupfy_api_v2_create_folder_from_template
```

Reproduza pelo CLI a entrada usada pelo agente, sem executar a operação:

```bash
printf '%s' '{"path":{"space_id":"exemplo-1","template_id":"exemplo-1"},"body":{"name":"exemplo-1"}}' | clickupfy api v2-create-folder-from-template --input - --dry-run
```

### `clickupfy api v2-get-folderless-lists`

A operação `GetFolderlessLists` pertence ao grupo `Lists` e usa
`GET /api/v2/space/{space_id}/list`.

A chamada consulta o recurso sem modificá-lo.

A resposta preserva o JSON da API; respostas sem corpo retornam `{}`.
A API key do perfil precisa ter acesso ao recurso. As permissões e o plano do Workspace podem restringir o endpoint.
Os campos omitidos são tratados pelo servidor do ClickUp, sem padrões adicionais do cliente.

[Referência oficial](https://developer.clickup.com/reference/getfolderlesslists).

| Entrada | Tipo | Obrigatória |
| --- | --- | --- |
| `path.space_id` | `number` | sim |
| `query.archived` | `boolean` | não |

O comando aceita as flags comuns de `api`: `--input`, `--path`, `--query`,
`--body`, `--body-file`, `--content-type`, `--file`, `--dry-run` e `--yes`.
A referência completa de tipos, campos aninhados e valores permitidos está no comando `describe` abaixo.

Exemplos:

Consulte o contrato antes de preencher os IDs reais:

```bash
clickupfy api describe v2-get-folderless-lists
```

Valide uma entrada em arquivo sem enviar uma requisição:

```bash
clickupfy api v2-get-folderless-lists --input entrada.json --dry-run
```

Use um envelope JSON pelo stdin:

```bash
printf '%s' '{"path":{"space_id":1}}' | clickupfy api v2-get-folderless-lists --input -
```

Selecione o perfil que tem acesso ao recurso:

```bash
clickupfy --account produto api v2-get-folderless-lists --input entrada.json
```

Grave a resposta JSON para conferência. O arquivo de entrada usa o envelope do exemplo anterior:

```bash
clickupfy --json api v2-get-folderless-lists --input entrada.json > resposta.json
```

### `clickupfy_api_v2_get_folderless_lists`

A operação `GetFolderlessLists` pertence ao grupo `Lists` e usa
`GET /api/v2/space/{space_id}/list`.

A chamada consulta o recurso sem modificá-lo.

A resposta preserva o JSON da API; respostas sem corpo retornam `{}`.
A API key do perfil precisa ter acesso ao recurso. As permissões e o plano do Workspace podem restringir o endpoint.
Os campos omitidos são tratados pelo servidor do ClickUp, sem padrões adicionais do cliente.

[Referência oficial](https://developer.clickup.com/reference/getfolderlesslists).

| Entrada | Tipo | Obrigatória |
| --- | --- | --- |
| `path.space_id` | `number` | sim |
| `query.archived` | `boolean` | não |

`account` é opcional e usa o perfil ativo ou fixado no MCP. O retorno aparece em
`content` como JSON; recusas retornam `isError: true`. Ferramentas de escrita
ficam ausentes em `--read-only`. IDs explícitos devem respeitar a hierarquia fixada.

Exemplos:

Use o perfil ativo com o envelope mínimo:

```json
{
  "name": "clickupfy_api_v2_get_folderless_lists",
  "arguments": {
    "path": {
      "space_id": 1
    }
  }
}
```

Direcione a chamada ao perfil de desenvolvimento:

```json
{
  "name": "clickupfy_api_v2_get_folderless_lists",
  "arguments": {
    "path": {
      "space_id": 1
    },
    "account": "dev"
  }
}
```

Use o perfil do produto, quando o MCP permitir selecionar outro perfil:

```json
{
  "name": "clickupfy_api_v2_get_folderless_lists",
  "arguments": {
    "path": {
      "space_id": 1
    },
    "account": "produto"
  }
}
```

Consulte o schema antes de compor uma chamada pelo agente:

```bash
clickupfy api describe clickupfy_api_v2_get_folderless_lists
```

Reproduza pelo CLI a entrada usada pelo agente, sem executar a operação:

```bash
printf '%s' '{"path":{"space_id":1}}' | clickupfy api v2-get-folderless-lists --input - --dry-run
```

### `clickupfy api v2-create-folderless-list`

A operação `CreateFolderlessList` pertence ao grupo `Lists` e usa
`POST /api/v2/space/{space_id}/list`.

A chamada altera o recurso indicado pelos parâmetros. Confira o resultado com a consulta correspondente antes de continuar.

A resposta preserva o JSON da API; respostas sem corpo retornam `{}`.
A API key do perfil precisa ter acesso ao recurso. As permissões e o plano do Workspace podem restringir o endpoint.
Os campos omitidos são tratados pelo servidor do ClickUp, sem padrões adicionais do cliente.

[Referência oficial](https://developer.clickup.com/reference/createfolderlesslist).

| Entrada | Tipo | Obrigatória |
| --- | --- | --- |
| `path.space_id` | `number` | sim |
| `body` | objeto conforme `api describe` | sim |

O comando aceita as flags comuns de `api`: `--input`, `--path`, `--query`,
`--body`, `--body-file`, `--content-type`, `--file`, `--dry-run` e `--yes`.
A referência completa de tipos, campos aninhados e valores permitidos está no comando `describe` abaixo.

Exemplos:

Consulte o contrato antes de preencher os IDs reais:

```bash
clickupfy api describe v2-create-folderless-list
```

Valide uma entrada em arquivo sem enviar uma requisição:

```bash
clickupfy api v2-create-folderless-list --input entrada.json --dry-run
```

Use um envelope JSON pelo stdin:

```bash
printf '%s' '{"path":{"space_id":1},"body":{"name":"exemplo-1"}}' | clickupfy api v2-create-folderless-list --input -
```

Selecione o perfil que tem acesso ao recurso:

```bash
clickupfy --account produto api v2-create-folderless-list --input entrada.json
```

Grave a resposta JSON para conferência. O arquivo de entrada usa o envelope do exemplo anterior:

```bash
clickupfy --json api v2-create-folderless-list --input entrada.json > resposta.json
```

### `clickupfy_api_v2_create_folderless_list`

A operação `CreateFolderlessList` pertence ao grupo `Lists` e usa
`POST /api/v2/space/{space_id}/list`.

A chamada altera o recurso indicado pelos parâmetros. Confira o resultado com a consulta correspondente antes de continuar.

A resposta preserva o JSON da API; respostas sem corpo retornam `{}`.
A API key do perfil precisa ter acesso ao recurso. As permissões e o plano do Workspace podem restringir o endpoint.
Os campos omitidos são tratados pelo servidor do ClickUp, sem padrões adicionais do cliente.

[Referência oficial](https://developer.clickup.com/reference/createfolderlesslist).

| Entrada | Tipo | Obrigatória |
| --- | --- | --- |
| `path.space_id` | `number` | sim |
| `body` | objeto conforme `api describe` | sim |

`account` é opcional e usa o perfil ativo ou fixado no MCP. O retorno aparece em
`content` como JSON; recusas retornam `isError: true`. Ferramentas de escrita
ficam ausentes em `--read-only`. IDs explícitos devem respeitar a hierarquia fixada.

Exemplos:

Use o perfil ativo com o envelope mínimo:

```json
{
  "name": "clickupfy_api_v2_create_folderless_list",
  "arguments": {
    "path": {
      "space_id": 1
    },
    "body": {
      "name": "exemplo-1"
    }
  }
}
```

Direcione a chamada ao perfil de desenvolvimento:

```json
{
  "name": "clickupfy_api_v2_create_folderless_list",
  "arguments": {
    "path": {
      "space_id": 1
    },
    "body": {
      "name": "exemplo-1"
    },
    "account": "dev"
  }
}
```

Use o perfil do produto, quando o MCP permitir selecionar outro perfil:

```json
{
  "name": "clickupfy_api_v2_create_folderless_list",
  "arguments": {
    "path": {
      "space_id": 1
    },
    "body": {
      "name": "exemplo-1"
    },
    "account": "produto"
  }
}
```

Consulte o schema antes de compor uma chamada pelo agente:

```bash
clickupfy api describe clickupfy_api_v2_create_folderless_list
```

Reproduza pelo CLI a entrada usada pelo agente, sem executar a operação:

```bash
printf '%s' '{"path":{"space_id":1},"body":{"name":"exemplo-1"}}' | clickupfy api v2-create-folderless-list --input - --dry-run
```

### `clickupfy api v2-get-list`

A operação `GetList` pertence ao grupo `Lists` e usa
`GET /api/v2/list/{list_id}`.

A chamada consulta o recurso sem modificá-lo.

A resposta preserva o JSON da API; respostas sem corpo retornam `{}`.
A API key do perfil precisa ter acesso ao recurso. As permissões e o plano do Workspace podem restringir o endpoint.
Os campos omitidos são tratados pelo servidor do ClickUp, sem padrões adicionais do cliente.

[Referência oficial](https://developer.clickup.com/reference/getlist).

| Entrada | Tipo | Obrigatória |
| --- | --- | --- |
| `path.list_id` | `number` | sim |

O comando aceita as flags comuns de `api`: `--input`, `--path`, `--query`,
`--body`, `--body-file`, `--content-type`, `--file`, `--dry-run` e `--yes`.
A referência completa de tipos, campos aninhados e valores permitidos está no comando `describe` abaixo.

Exemplos:

Consulte o contrato antes de preencher os IDs reais:

```bash
clickupfy api describe v2-get-list
```

Valide uma entrada em arquivo sem enviar uma requisição:

```bash
clickupfy api v2-get-list --input entrada.json --dry-run
```

Use um envelope JSON pelo stdin:

```bash
printf '%s' '{"path":{"list_id":1}}' | clickupfy api v2-get-list --input -
```

Selecione o perfil que tem acesso ao recurso:

```bash
clickupfy --account produto api v2-get-list --input entrada.json
```

Grave a resposta JSON para conferência. O arquivo de entrada usa o envelope do exemplo anterior:

```bash
clickupfy --json api v2-get-list --input entrada.json > resposta.json
```

### `clickupfy_api_v2_get_list`

A operação `GetList` pertence ao grupo `Lists` e usa
`GET /api/v2/list/{list_id}`.

A chamada consulta o recurso sem modificá-lo.

A resposta preserva o JSON da API; respostas sem corpo retornam `{}`.
A API key do perfil precisa ter acesso ao recurso. As permissões e o plano do Workspace podem restringir o endpoint.
Os campos omitidos são tratados pelo servidor do ClickUp, sem padrões adicionais do cliente.

[Referência oficial](https://developer.clickup.com/reference/getlist).

| Entrada | Tipo | Obrigatória |
| --- | --- | --- |
| `path.list_id` | `number` | sim |

`account` é opcional e usa o perfil ativo ou fixado no MCP. O retorno aparece em
`content` como JSON; recusas retornam `isError: true`. Ferramentas de escrita
ficam ausentes em `--read-only`. IDs explícitos devem respeitar a hierarquia fixada.

Exemplos:

Use o perfil ativo com o envelope mínimo:

```json
{
  "name": "clickupfy_api_v2_get_list",
  "arguments": {
    "path": {
      "list_id": 1
    }
  }
}
```

Direcione a chamada ao perfil de desenvolvimento:

```json
{
  "name": "clickupfy_api_v2_get_list",
  "arguments": {
    "path": {
      "list_id": 1
    },
    "account": "dev"
  }
}
```

Use o perfil do produto, quando o MCP permitir selecionar outro perfil:

```json
{
  "name": "clickupfy_api_v2_get_list",
  "arguments": {
    "path": {
      "list_id": 1
    },
    "account": "produto"
  }
}
```

Consulte o schema antes de compor uma chamada pelo agente:

```bash
clickupfy api describe clickupfy_api_v2_get_list
```

Reproduza pelo CLI a entrada usada pelo agente, sem executar a operação:

```bash
printf '%s' '{"path":{"list_id":1}}' | clickupfy api v2-get-list --input - --dry-run
```

### `clickupfy api v2-update-list`

A operação `UpdateList` pertence ao grupo `Lists` e usa
`PUT /api/v2/list/{list_id}`.

A chamada altera o recurso indicado pelos parâmetros. Confira o resultado com a consulta correspondente antes de continuar.

A resposta preserva o JSON da API; respostas sem corpo retornam `{}`.
A API key do perfil precisa ter acesso ao recurso. As permissões e o plano do Workspace podem restringir o endpoint.
Os campos omitidos são tratados pelo servidor do ClickUp, sem padrões adicionais do cliente.

[Referência oficial](https://developer.clickup.com/reference/updatelist).

| Entrada | Tipo | Obrigatória |
| --- | --- | --- |
| `path.list_id` | `string` | sim |
| `body` | objeto conforme `api describe` | sim |

O comando aceita as flags comuns de `api`: `--input`, `--path`, `--query`,
`--body`, `--body-file`, `--content-type`, `--file`, `--dry-run` e `--yes`.
A referência completa de tipos, campos aninhados e valores permitidos está no comando `describe` abaixo.

Exemplos:

Consulte o contrato antes de preencher os IDs reais:

```bash
clickupfy api describe v2-update-list
```

Valide uma entrada em arquivo sem enviar uma requisição:

```bash
clickupfy api v2-update-list --input entrada.json --dry-run
```

Use um envelope JSON pelo stdin:

```bash
printf '%s' '{"path":{"list_id":"exemplo-1"},"body":{"name":"exemplo-1"}}' | clickupfy api v2-update-list --input -
```

Selecione o perfil que tem acesso ao recurso:

```bash
clickupfy --account produto api v2-update-list --input entrada.json
```

Grave a resposta JSON para conferência. O arquivo de entrada usa o envelope do exemplo anterior:

```bash
clickupfy --json api v2-update-list --input entrada.json > resposta.json
```

### `clickupfy_api_v2_update_list`

A operação `UpdateList` pertence ao grupo `Lists` e usa
`PUT /api/v2/list/{list_id}`.

A chamada altera o recurso indicado pelos parâmetros. Confira o resultado com a consulta correspondente antes de continuar.

A resposta preserva o JSON da API; respostas sem corpo retornam `{}`.
A API key do perfil precisa ter acesso ao recurso. As permissões e o plano do Workspace podem restringir o endpoint.
Os campos omitidos são tratados pelo servidor do ClickUp, sem padrões adicionais do cliente.

[Referência oficial](https://developer.clickup.com/reference/updatelist).

| Entrada | Tipo | Obrigatória |
| --- | --- | --- |
| `path.list_id` | `string` | sim |
| `body` | objeto conforme `api describe` | sim |

`account` é opcional e usa o perfil ativo ou fixado no MCP. O retorno aparece em
`content` como JSON; recusas retornam `isError: true`. Ferramentas de escrita
ficam ausentes em `--read-only`. IDs explícitos devem respeitar a hierarquia fixada.

Exemplos:

Use o perfil ativo com o envelope mínimo:

```json
{
  "name": "clickupfy_api_v2_update_list",
  "arguments": {
    "path": {
      "list_id": "exemplo-1"
    },
    "body": {
      "name": "exemplo-1"
    }
  }
}
```

Direcione a chamada ao perfil de desenvolvimento:

```json
{
  "name": "clickupfy_api_v2_update_list",
  "arguments": {
    "path": {
      "list_id": "exemplo-1"
    },
    "body": {
      "name": "exemplo-1"
    },
    "account": "dev"
  }
}
```

Use o perfil do produto, quando o MCP permitir selecionar outro perfil:

```json
{
  "name": "clickupfy_api_v2_update_list",
  "arguments": {
    "path": {
      "list_id": "exemplo-1"
    },
    "body": {
      "name": "exemplo-1"
    },
    "account": "produto"
  }
}
```

Consulte o schema antes de compor uma chamada pelo agente:

```bash
clickupfy api describe clickupfy_api_v2_update_list
```

Reproduza pelo CLI a entrada usada pelo agente, sem executar a operação:

```bash
printf '%s' '{"path":{"list_id":"exemplo-1"},"body":{"name":"exemplo-1"}}' | clickupfy api v2-update-list --input - --dry-run
```

### `clickupfy api v2-delete-list`

A operação `DeleteList` pertence ao grupo `Lists` e usa
`DELETE /api/v2/list/{list_id}`.

A chamada altera o recurso indicado pelos parâmetros. Confira o resultado com a consulta correspondente antes de continuar.

A resposta preserva o JSON da API; respostas sem corpo retornam `{}`.
A API key do perfil precisa ter acesso ao recurso. As permissões e o plano do Workspace podem restringir o endpoint.
Os campos omitidos são tratados pelo servidor do ClickUp, sem padrões adicionais do cliente.

[Referência oficial](https://developer.clickup.com/reference/deletelist).

| Entrada | Tipo | Obrigatória |
| --- | --- | --- |
| `path.list_id` | `number` | sim |
| `confirm` | boolean, somente `true` | sim |

O comando aceita as flags comuns de `api`: `--input`, `--path`, `--query`,
`--body`, `--body-file`, `--content-type`, `--file`, `--dry-run` e `--yes`.
A referência completa de tipos, campos aninhados e valores permitidos está no comando `describe` abaixo.

Exemplos:

Consulte o contrato antes de preencher os IDs reais:

```bash
clickupfy api describe v2-delete-list
```

Valide uma entrada em arquivo sem enviar uma requisição:

```bash
clickupfy api v2-delete-list --input entrada.json --dry-run
```

Use um envelope JSON pelo stdin:

```bash
printf '%s' '{"path":{"list_id":1},"confirm":true}' | clickupfy api v2-delete-list --input -
```

Selecione o perfil que tem acesso ao recurso:

```bash
clickupfy --account produto api v2-delete-list --input entrada.json
```

Grave a resposta JSON para conferência. O arquivo de entrada usa o envelope do exemplo anterior:

```bash
clickupfy --json api v2-delete-list --input entrada.json > resposta.json
```

### `clickupfy_api_v2_delete_list`

A operação `DeleteList` pertence ao grupo `Lists` e usa
`DELETE /api/v2/list/{list_id}`.

A chamada altera o recurso indicado pelos parâmetros. Confira o resultado com a consulta correspondente antes de continuar.

A resposta preserva o JSON da API; respostas sem corpo retornam `{}`.
A API key do perfil precisa ter acesso ao recurso. As permissões e o plano do Workspace podem restringir o endpoint.
Os campos omitidos são tratados pelo servidor do ClickUp, sem padrões adicionais do cliente.

[Referência oficial](https://developer.clickup.com/reference/deletelist).

| Entrada | Tipo | Obrigatória |
| --- | --- | --- |
| `path.list_id` | `number` | sim |
| `confirm` | boolean, somente `true` | sim |

`account` é opcional e usa o perfil ativo ou fixado no MCP. O retorno aparece em
`content` como JSON; recusas retornam `isError: true`. Ferramentas de escrita
ficam ausentes em `--read-only`. IDs explícitos devem respeitar a hierarquia fixada.

Exemplos:

Use o perfil ativo com o envelope mínimo:

```json
{
  "name": "clickupfy_api_v2_delete_list",
  "arguments": {
    "path": {
      "list_id": 1
    },
    "confirm": true
  }
}
```

Direcione a chamada ao perfil de desenvolvimento:

```json
{
  "name": "clickupfy_api_v2_delete_list",
  "arguments": {
    "path": {
      "list_id": 1
    },
    "confirm": true,
    "account": "dev"
  }
}
```

Use o perfil do produto, quando o MCP permitir selecionar outro perfil:

```json
{
  "name": "clickupfy_api_v2_delete_list",
  "arguments": {
    "path": {
      "list_id": 1
    },
    "confirm": true,
    "account": "produto"
  }
}
```

Consulte o schema antes de compor uma chamada pelo agente:

```bash
clickupfy api describe clickupfy_api_v2_delete_list
```

Reproduza pelo CLI a entrada usada pelo agente, sem executar a operação:

```bash
printf '%s' '{"path":{"list_id":1},"confirm":true}' | clickupfy api v2-delete-list --input - --dry-run
```

### `clickupfy api v2-add-task-to-list`

A operação `AddTaskToList` pertence ao grupo `Lists` e usa
`POST /api/v2/list/{list_id}/task/{task_id}`.

A chamada altera o recurso indicado pelos parâmetros. Confira o resultado com a consulta correspondente antes de continuar.

A resposta preserva o JSON da API; respostas sem corpo retornam `{}`.
A API key do perfil precisa ter acesso ao recurso. As permissões e o plano do Workspace podem restringir o endpoint.
Os campos omitidos são tratados pelo servidor do ClickUp, sem padrões adicionais do cliente.

[Referência oficial](https://developer.clickup.com/reference/addtasktolist).

| Entrada | Tipo | Obrigatória |
| --- | --- | --- |
| `path.list_id` | `number` | sim |
| `path.task_id` | `string` | sim |

O comando aceita as flags comuns de `api`: `--input`, `--path`, `--query`,
`--body`, `--body-file`, `--content-type`, `--file`, `--dry-run` e `--yes`.
A referência completa de tipos, campos aninhados e valores permitidos está no comando `describe` abaixo.

Exemplos:

Consulte o contrato antes de preencher os IDs reais:

```bash
clickupfy api describe v2-add-task-to-list
```

Valide uma entrada em arquivo sem enviar uma requisição:

```bash
clickupfy api v2-add-task-to-list --input entrada.json --dry-run
```

Use um envelope JSON pelo stdin:

```bash
printf '%s' '{"path":{"list_id":1,"task_id":"exemplo-1"}}' | clickupfy api v2-add-task-to-list --input -
```

Selecione o perfil que tem acesso ao recurso:

```bash
clickupfy --account produto api v2-add-task-to-list --input entrada.json
```

Grave a resposta JSON para conferência. O arquivo de entrada usa o envelope do exemplo anterior:

```bash
clickupfy --json api v2-add-task-to-list --input entrada.json > resposta.json
```

### `clickupfy_api_v2_add_task_to_list`

A operação `AddTaskToList` pertence ao grupo `Lists` e usa
`POST /api/v2/list/{list_id}/task/{task_id}`.

A chamada altera o recurso indicado pelos parâmetros. Confira o resultado com a consulta correspondente antes de continuar.

A resposta preserva o JSON da API; respostas sem corpo retornam `{}`.
A API key do perfil precisa ter acesso ao recurso. As permissões e o plano do Workspace podem restringir o endpoint.
Os campos omitidos são tratados pelo servidor do ClickUp, sem padrões adicionais do cliente.

[Referência oficial](https://developer.clickup.com/reference/addtasktolist).

| Entrada | Tipo | Obrigatória |
| --- | --- | --- |
| `path.list_id` | `number` | sim |
| `path.task_id` | `string` | sim |

`account` é opcional e usa o perfil ativo ou fixado no MCP. O retorno aparece em
`content` como JSON; recusas retornam `isError: true`. Ferramentas de escrita
ficam ausentes em `--read-only`. IDs explícitos devem respeitar a hierarquia fixada.

Exemplos:

Use o perfil ativo com o envelope mínimo:

```json
{
  "name": "clickupfy_api_v2_add_task_to_list",
  "arguments": {
    "path": {
      "list_id": 1,
      "task_id": "exemplo-1"
    }
  }
}
```

Direcione a chamada ao perfil de desenvolvimento:

```json
{
  "name": "clickupfy_api_v2_add_task_to_list",
  "arguments": {
    "path": {
      "list_id": 1,
      "task_id": "exemplo-1"
    },
    "account": "dev"
  }
}
```

Use o perfil do produto, quando o MCP permitir selecionar outro perfil:

```json
{
  "name": "clickupfy_api_v2_add_task_to_list",
  "arguments": {
    "path": {
      "list_id": 1,
      "task_id": "exemplo-1"
    },
    "account": "produto"
  }
}
```

Consulte o schema antes de compor uma chamada pelo agente:

```bash
clickupfy api describe clickupfy_api_v2_add_task_to_list
```

Reproduza pelo CLI a entrada usada pelo agente, sem executar a operação:

```bash
printf '%s' '{"path":{"list_id":1,"task_id":"exemplo-1"}}' | clickupfy api v2-add-task-to-list --input - --dry-run
```

### `clickupfy api v2-remove-task-from-list`

A operação `RemoveTaskFromList` pertence ao grupo `Lists` e usa
`DELETE /api/v2/list/{list_id}/task/{task_id}`.

A chamada altera o recurso indicado pelos parâmetros. Confira o resultado com a consulta correspondente antes de continuar.

A resposta preserva o JSON da API; respostas sem corpo retornam `{}`.
A API key do perfil precisa ter acesso ao recurso. As permissões e o plano do Workspace podem restringir o endpoint.
Os campos omitidos são tratados pelo servidor do ClickUp, sem padrões adicionais do cliente.

[Referência oficial](https://developer.clickup.com/reference/removetaskfromlist).

| Entrada | Tipo | Obrigatória |
| --- | --- | --- |
| `path.list_id` | `number` | sim |
| `path.task_id` | `string` | sim |
| `confirm` | boolean, somente `true` | sim |

O comando aceita as flags comuns de `api`: `--input`, `--path`, `--query`,
`--body`, `--body-file`, `--content-type`, `--file`, `--dry-run` e `--yes`.
A referência completa de tipos, campos aninhados e valores permitidos está no comando `describe` abaixo.

Exemplos:

Consulte o contrato antes de preencher os IDs reais:

```bash
clickupfy api describe v2-remove-task-from-list
```

Valide uma entrada em arquivo sem enviar uma requisição:

```bash
clickupfy api v2-remove-task-from-list --input entrada.json --dry-run
```

Use um envelope JSON pelo stdin:

```bash
printf '%s' '{"path":{"list_id":1,"task_id":"exemplo-1"},"confirm":true}' | clickupfy api v2-remove-task-from-list --input -
```

Selecione o perfil que tem acesso ao recurso:

```bash
clickupfy --account produto api v2-remove-task-from-list --input entrada.json
```

Grave a resposta JSON para conferência. O arquivo de entrada usa o envelope do exemplo anterior:

```bash
clickupfy --json api v2-remove-task-from-list --input entrada.json > resposta.json
```

### `clickupfy_api_v2_remove_task_from_list`

A operação `RemoveTaskFromList` pertence ao grupo `Lists` e usa
`DELETE /api/v2/list/{list_id}/task/{task_id}`.

A chamada altera o recurso indicado pelos parâmetros. Confira o resultado com a consulta correspondente antes de continuar.

A resposta preserva o JSON da API; respostas sem corpo retornam `{}`.
A API key do perfil precisa ter acesso ao recurso. As permissões e o plano do Workspace podem restringir o endpoint.
Os campos omitidos são tratados pelo servidor do ClickUp, sem padrões adicionais do cliente.

[Referência oficial](https://developer.clickup.com/reference/removetaskfromlist).

| Entrada | Tipo | Obrigatória |
| --- | --- | --- |
| `path.list_id` | `number` | sim |
| `path.task_id` | `string` | sim |
| `confirm` | boolean, somente `true` | sim |

`account` é opcional e usa o perfil ativo ou fixado no MCP. O retorno aparece em
`content` como JSON; recusas retornam `isError: true`. Ferramentas de escrita
ficam ausentes em `--read-only`. IDs explícitos devem respeitar a hierarquia fixada.

Exemplos:

Use o perfil ativo com o envelope mínimo:

```json
{
  "name": "clickupfy_api_v2_remove_task_from_list",
  "arguments": {
    "path": {
      "list_id": 1,
      "task_id": "exemplo-1"
    },
    "confirm": true
  }
}
```

Direcione a chamada ao perfil de desenvolvimento:

```json
{
  "name": "clickupfy_api_v2_remove_task_from_list",
  "arguments": {
    "path": {
      "list_id": 1,
      "task_id": "exemplo-1"
    },
    "confirm": true,
    "account": "dev"
  }
}
```

Use o perfil do produto, quando o MCP permitir selecionar outro perfil:

```json
{
  "name": "clickupfy_api_v2_remove_task_from_list",
  "arguments": {
    "path": {
      "list_id": 1,
      "task_id": "exemplo-1"
    },
    "confirm": true,
    "account": "produto"
  }
}
```

Consulte o schema antes de compor uma chamada pelo agente:

```bash
clickupfy api describe clickupfy_api_v2_remove_task_from_list
```

Reproduza pelo CLI a entrada usada pelo agente, sem executar a operação:

```bash
printf '%s' '{"path":{"list_id":1,"task_id":"exemplo-1"},"confirm":true}' | clickupfy api v2-remove-task-from-list --input - --dry-run
```

### `clickupfy api v2-get-task-members`

A operação `GetTaskMembers` pertence ao grupo `Members` e usa
`GET /api/v2/task/{task_id}/member`.

A chamada consulta o recurso sem modificá-lo.

A resposta preserva o JSON da API; respostas sem corpo retornam `{}`.
A API key do perfil precisa ter acesso ao recurso. As permissões e o plano do Workspace podem restringir o endpoint.
Os campos omitidos são tratados pelo servidor do ClickUp, sem padrões adicionais do cliente.

[Referência oficial](https://developer.clickup.com/reference/gettaskmembers).

| Entrada | Tipo | Obrigatória |
| --- | --- | --- |
| `path.task_id` | `string` | sim |

O comando aceita as flags comuns de `api`: `--input`, `--path`, `--query`,
`--body`, `--body-file`, `--content-type`, `--file`, `--dry-run` e `--yes`.
A referência completa de tipos, campos aninhados e valores permitidos está no comando `describe` abaixo.

Exemplos:

Consulte o contrato antes de preencher os IDs reais:

```bash
clickupfy api describe v2-get-task-members
```

Valide uma entrada em arquivo sem enviar uma requisição:

```bash
clickupfy api v2-get-task-members --input entrada.json --dry-run
```

Use um envelope JSON pelo stdin:

```bash
printf '%s' '{"path":{"task_id":"exemplo-1"}}' | clickupfy api v2-get-task-members --input -
```

Selecione o perfil que tem acesso ao recurso:

```bash
clickupfy --account produto api v2-get-task-members --input entrada.json
```

Grave a resposta JSON para conferência. O arquivo de entrada usa o envelope do exemplo anterior:

```bash
clickupfy --json api v2-get-task-members --input entrada.json > resposta.json
```

### `clickupfy_api_v2_get_task_members`

A operação `GetTaskMembers` pertence ao grupo `Members` e usa
`GET /api/v2/task/{task_id}/member`.

A chamada consulta o recurso sem modificá-lo.

A resposta preserva o JSON da API; respostas sem corpo retornam `{}`.
A API key do perfil precisa ter acesso ao recurso. As permissões e o plano do Workspace podem restringir o endpoint.
Os campos omitidos são tratados pelo servidor do ClickUp, sem padrões adicionais do cliente.

[Referência oficial](https://developer.clickup.com/reference/gettaskmembers).

| Entrada | Tipo | Obrigatória |
| --- | --- | --- |
| `path.task_id` | `string` | sim |

`account` é opcional e usa o perfil ativo ou fixado no MCP. O retorno aparece em
`content` como JSON; recusas retornam `isError: true`. Ferramentas de escrita
ficam ausentes em `--read-only`. IDs explícitos devem respeitar a hierarquia fixada.

Exemplos:

Use o perfil ativo com o envelope mínimo:

```json
{
  "name": "clickupfy_api_v2_get_task_members",
  "arguments": {
    "path": {
      "task_id": "exemplo-1"
    }
  }
}
```

Direcione a chamada ao perfil de desenvolvimento:

```json
{
  "name": "clickupfy_api_v2_get_task_members",
  "arguments": {
    "path": {
      "task_id": "exemplo-1"
    },
    "account": "dev"
  }
}
```

Use o perfil do produto, quando o MCP permitir selecionar outro perfil:

```json
{
  "name": "clickupfy_api_v2_get_task_members",
  "arguments": {
    "path": {
      "task_id": "exemplo-1"
    },
    "account": "produto"
  }
}
```

Consulte o schema antes de compor uma chamada pelo agente:

```bash
clickupfy api describe clickupfy_api_v2_get_task_members
```

Reproduza pelo CLI a entrada usada pelo agente, sem executar a operação:

```bash
printf '%s' '{"path":{"task_id":"exemplo-1"}}' | clickupfy api v2-get-task-members --input - --dry-run
```

### `clickupfy api v2-get-list-members`

A operação `GetListMembers` pertence ao grupo `Members` e usa
`GET /api/v2/list/{list_id}/member`.

A chamada consulta o recurso sem modificá-lo.

A resposta preserva o JSON da API; respostas sem corpo retornam `{}`.
A API key do perfil precisa ter acesso ao recurso. As permissões e o plano do Workspace podem restringir o endpoint.
Os campos omitidos são tratados pelo servidor do ClickUp, sem padrões adicionais do cliente.

[Referência oficial](https://developer.clickup.com/reference/getlistmembers).

| Entrada | Tipo | Obrigatória |
| --- | --- | --- |
| `path.list_id` | `number` | sim |

O comando aceita as flags comuns de `api`: `--input`, `--path`, `--query`,
`--body`, `--body-file`, `--content-type`, `--file`, `--dry-run` e `--yes`.
A referência completa de tipos, campos aninhados e valores permitidos está no comando `describe` abaixo.

Exemplos:

Consulte o contrato antes de preencher os IDs reais:

```bash
clickupfy api describe v2-get-list-members
```

Valide uma entrada em arquivo sem enviar uma requisição:

```bash
clickupfy api v2-get-list-members --input entrada.json --dry-run
```

Use um envelope JSON pelo stdin:

```bash
printf '%s' '{"path":{"list_id":1}}' | clickupfy api v2-get-list-members --input -
```

Selecione o perfil que tem acesso ao recurso:

```bash
clickupfy --account produto api v2-get-list-members --input entrada.json
```

Grave a resposta JSON para conferência. O arquivo de entrada usa o envelope do exemplo anterior:

```bash
clickupfy --json api v2-get-list-members --input entrada.json > resposta.json
```

### `clickupfy_api_v2_get_list_members`

A operação `GetListMembers` pertence ao grupo `Members` e usa
`GET /api/v2/list/{list_id}/member`.

A chamada consulta o recurso sem modificá-lo.

A resposta preserva o JSON da API; respostas sem corpo retornam `{}`.
A API key do perfil precisa ter acesso ao recurso. As permissões e o plano do Workspace podem restringir o endpoint.
Os campos omitidos são tratados pelo servidor do ClickUp, sem padrões adicionais do cliente.

[Referência oficial](https://developer.clickup.com/reference/getlistmembers).

| Entrada | Tipo | Obrigatória |
| --- | --- | --- |
| `path.list_id` | `number` | sim |

`account` é opcional e usa o perfil ativo ou fixado no MCP. O retorno aparece em
`content` como JSON; recusas retornam `isError: true`. Ferramentas de escrita
ficam ausentes em `--read-only`. IDs explícitos devem respeitar a hierarquia fixada.

Exemplos:

Use o perfil ativo com o envelope mínimo:

```json
{
  "name": "clickupfy_api_v2_get_list_members",
  "arguments": {
    "path": {
      "list_id": 1
    }
  }
}
```

Direcione a chamada ao perfil de desenvolvimento:

```json
{
  "name": "clickupfy_api_v2_get_list_members",
  "arguments": {
    "path": {
      "list_id": 1
    },
    "account": "dev"
  }
}
```

Use o perfil do produto, quando o MCP permitir selecionar outro perfil:

```json
{
  "name": "clickupfy_api_v2_get_list_members",
  "arguments": {
    "path": {
      "list_id": 1
    },
    "account": "produto"
  }
}
```

Consulte o schema antes de compor uma chamada pelo agente:

```bash
clickupfy api describe clickupfy_api_v2_get_list_members
```

Reproduza pelo CLI a entrada usada pelo agente, sem executar a operação:

```bash
printf '%s' '{"path":{"list_id":1}}' | clickupfy api v2-get-list-members --input - --dry-run
```

### `clickupfy api v2-get-custom-roles`

A operação `GetCustomRoles` pertence ao grupo `Roles` e usa
`GET /api/v2/team/{team_id}/customroles`.

A chamada consulta o recurso sem modificá-lo.

A resposta preserva o JSON da API; respostas sem corpo retornam `{}`.
A API key do perfil precisa ter acesso ao recurso. As permissões e o plano do Workspace podem restringir o endpoint.
Os campos omitidos são tratados pelo servidor do ClickUp, sem padrões adicionais do cliente.

[Referência oficial](https://developer.clickup.com/reference/getcustomroles).

| Entrada | Tipo | Obrigatória |
| --- | --- | --- |
| `path.team_id` | `number` | sim |
| `query.include_members` | `boolean` | não |

O comando aceita as flags comuns de `api`: `--input`, `--path`, `--query`,
`--body`, `--body-file`, `--content-type`, `--file`, `--dry-run` e `--yes`.
A referência completa de tipos, campos aninhados e valores permitidos está no comando `describe` abaixo.

Exemplos:

Consulte o contrato antes de preencher os IDs reais:

```bash
clickupfy api describe v2-get-custom-roles
```

Valide uma entrada em arquivo sem enviar uma requisição:

```bash
clickupfy api v2-get-custom-roles --input entrada.json --dry-run
```

Use um envelope JSON pelo stdin:

```bash
printf '%s' '{"path":{"team_id":1}}' | clickupfy api v2-get-custom-roles --input -
```

Selecione o perfil que tem acesso ao recurso:

```bash
clickupfy --account produto api v2-get-custom-roles --input entrada.json
```

Grave a resposta JSON para conferência. O arquivo de entrada usa o envelope do exemplo anterior:

```bash
clickupfy --json api v2-get-custom-roles --input entrada.json > resposta.json
```

### `clickupfy_api_v2_get_custom_roles`

A operação `GetCustomRoles` pertence ao grupo `Roles` e usa
`GET /api/v2/team/{team_id}/customroles`.

A chamada consulta o recurso sem modificá-lo.

A resposta preserva o JSON da API; respostas sem corpo retornam `{}`.
A API key do perfil precisa ter acesso ao recurso. As permissões e o plano do Workspace podem restringir o endpoint.
Os campos omitidos são tratados pelo servidor do ClickUp, sem padrões adicionais do cliente.

[Referência oficial](https://developer.clickup.com/reference/getcustomroles).

| Entrada | Tipo | Obrigatória |
| --- | --- | --- |
| `path.team_id` | `number` | sim |
| `query.include_members` | `boolean` | não |

`account` é opcional e usa o perfil ativo ou fixado no MCP. O retorno aparece em
`content` como JSON; recusas retornam `isError: true`. Ferramentas de escrita
ficam ausentes em `--read-only`. IDs explícitos devem respeitar a hierarquia fixada.

Exemplos:

Use o perfil ativo com o envelope mínimo:

```json
{
  "name": "clickupfy_api_v2_get_custom_roles",
  "arguments": {
    "path": {
      "team_id": 1
    }
  }
}
```

Direcione a chamada ao perfil de desenvolvimento:

```json
{
  "name": "clickupfy_api_v2_get_custom_roles",
  "arguments": {
    "path": {
      "team_id": 1
    },
    "account": "dev"
  }
}
```

Use o perfil do produto, quando o MCP permitir selecionar outro perfil:

```json
{
  "name": "clickupfy_api_v2_get_custom_roles",
  "arguments": {
    "path": {
      "team_id": 1
    },
    "account": "produto"
  }
}
```

Consulte o schema antes de compor uma chamada pelo agente:

```bash
clickupfy api describe clickupfy_api_v2_get_custom_roles
```

Reproduza pelo CLI a entrada usada pelo agente, sem executar a operação:

```bash
printf '%s' '{"path":{"team_id":1}}' | clickupfy api v2-get-custom-roles --input - --dry-run
```

### `clickupfy api v2-shared-hierarchy`

A operação `SharedHierarchy` pertence ao grupo `Shared Hierarchy` e usa
`GET /api/v2/team/{team_id}/shared`.

A chamada consulta o recurso sem modificá-lo.

A resposta preserva o JSON da API; respostas sem corpo retornam `{}`.
A API key do perfil precisa ter acesso ao recurso. As permissões e o plano do Workspace podem restringir o endpoint.
Os campos omitidos são tratados pelo servidor do ClickUp, sem padrões adicionais do cliente.

[Referência oficial](https://developer.clickup.com/reference/sharedhierarchy).

| Entrada | Tipo | Obrigatória |
| --- | --- | --- |
| `path.team_id` | `number` | sim |

O comando aceita as flags comuns de `api`: `--input`, `--path`, `--query`,
`--body`, `--body-file`, `--content-type`, `--file`, `--dry-run` e `--yes`.
A referência completa de tipos, campos aninhados e valores permitidos está no comando `describe` abaixo.

Exemplos:

Consulte o contrato antes de preencher os IDs reais:

```bash
clickupfy api describe v2-shared-hierarchy
```

Valide uma entrada em arquivo sem enviar uma requisição:

```bash
clickupfy api v2-shared-hierarchy --input entrada.json --dry-run
```

Use um envelope JSON pelo stdin:

```bash
printf '%s' '{"path":{"team_id":1}}' | clickupfy api v2-shared-hierarchy --input -
```

Selecione o perfil que tem acesso ao recurso:

```bash
clickupfy --account produto api v2-shared-hierarchy --input entrada.json
```

Grave a resposta JSON para conferência. O arquivo de entrada usa o envelope do exemplo anterior:

```bash
clickupfy --json api v2-shared-hierarchy --input entrada.json > resposta.json
```

### `clickupfy_api_v2_shared_hierarchy`

A operação `SharedHierarchy` pertence ao grupo `Shared Hierarchy` e usa
`GET /api/v2/team/{team_id}/shared`.

A chamada consulta o recurso sem modificá-lo.

A resposta preserva o JSON da API; respostas sem corpo retornam `{}`.
A API key do perfil precisa ter acesso ao recurso. As permissões e o plano do Workspace podem restringir o endpoint.
Os campos omitidos são tratados pelo servidor do ClickUp, sem padrões adicionais do cliente.

[Referência oficial](https://developer.clickup.com/reference/sharedhierarchy).

| Entrada | Tipo | Obrigatória |
| --- | --- | --- |
| `path.team_id` | `number` | sim |

`account` é opcional e usa o perfil ativo ou fixado no MCP. O retorno aparece em
`content` como JSON; recusas retornam `isError: true`. Ferramentas de escrita
ficam ausentes em `--read-only`. IDs explícitos devem respeitar a hierarquia fixada.

Exemplos:

Use o perfil ativo com o envelope mínimo:

```json
{
  "name": "clickupfy_api_v2_shared_hierarchy",
  "arguments": {
    "path": {
      "team_id": 1
    }
  }
}
```

Direcione a chamada ao perfil de desenvolvimento:

```json
{
  "name": "clickupfy_api_v2_shared_hierarchy",
  "arguments": {
    "path": {
      "team_id": 1
    },
    "account": "dev"
  }
}
```

Use o perfil do produto, quando o MCP permitir selecionar outro perfil:

```json
{
  "name": "clickupfy_api_v2_shared_hierarchy",
  "arguments": {
    "path": {
      "team_id": 1
    },
    "account": "produto"
  }
}
```

Consulte o schema antes de compor uma chamada pelo agente:

```bash
clickupfy api describe clickupfy_api_v2_shared_hierarchy
```

Reproduza pelo CLI a entrada usada pelo agente, sem executar a operação:

```bash
printf '%s' '{"path":{"team_id":1}}' | clickupfy api v2-shared-hierarchy --input - --dry-run
```

### `clickupfy api v2-get-spaces`

A operação `GetSpaces` pertence ao grupo `Spaces` e usa
`GET /api/v2/team/{team_id}/space`.

A chamada consulta o recurso sem modificá-lo.

A resposta preserva o JSON da API; respostas sem corpo retornam `{}`.
A API key do perfil precisa ter acesso ao recurso. As permissões e o plano do Workspace podem restringir o endpoint.
Os campos omitidos são tratados pelo servidor do ClickUp, sem padrões adicionais do cliente.

[Referência oficial](https://developer.clickup.com/reference/getspaces).

| Entrada | Tipo | Obrigatória |
| --- | --- | --- |
| `path.team_id` | `number` | sim |
| `query.archived` | `boolean` | não |

O comando aceita as flags comuns de `api`: `--input`, `--path`, `--query`,
`--body`, `--body-file`, `--content-type`, `--file`, `--dry-run` e `--yes`.
A referência completa de tipos, campos aninhados e valores permitidos está no comando `describe` abaixo.

Exemplos:

Consulte o contrato antes de preencher os IDs reais:

```bash
clickupfy api describe v2-get-spaces
```

Valide uma entrada em arquivo sem enviar uma requisição:

```bash
clickupfy api v2-get-spaces --input entrada.json --dry-run
```

Use um envelope JSON pelo stdin:

```bash
printf '%s' '{"path":{"team_id":1}}' | clickupfy api v2-get-spaces --input -
```

Selecione o perfil que tem acesso ao recurso:

```bash
clickupfy --account produto api v2-get-spaces --input entrada.json
```

Grave a resposta JSON para conferência. O arquivo de entrada usa o envelope do exemplo anterior:

```bash
clickupfy --json api v2-get-spaces --input entrada.json > resposta.json
```

### `clickupfy_api_v2_get_spaces`

A operação `GetSpaces` pertence ao grupo `Spaces` e usa
`GET /api/v2/team/{team_id}/space`.

A chamada consulta o recurso sem modificá-lo.

A resposta preserva o JSON da API; respostas sem corpo retornam `{}`.
A API key do perfil precisa ter acesso ao recurso. As permissões e o plano do Workspace podem restringir o endpoint.
Os campos omitidos são tratados pelo servidor do ClickUp, sem padrões adicionais do cliente.

[Referência oficial](https://developer.clickup.com/reference/getspaces).

| Entrada | Tipo | Obrigatória |
| --- | --- | --- |
| `path.team_id` | `number` | sim |
| `query.archived` | `boolean` | não |

`account` é opcional e usa o perfil ativo ou fixado no MCP. O retorno aparece em
`content` como JSON; recusas retornam `isError: true`. Ferramentas de escrita
ficam ausentes em `--read-only`. IDs explícitos devem respeitar a hierarquia fixada.

Exemplos:

Use o perfil ativo com o envelope mínimo:

```json
{
  "name": "clickupfy_api_v2_get_spaces",
  "arguments": {
    "path": {
      "team_id": 1
    }
  }
}
```

Direcione a chamada ao perfil de desenvolvimento:

```json
{
  "name": "clickupfy_api_v2_get_spaces",
  "arguments": {
    "path": {
      "team_id": 1
    },
    "account": "dev"
  }
}
```

Use o perfil do produto, quando o MCP permitir selecionar outro perfil:

```json
{
  "name": "clickupfy_api_v2_get_spaces",
  "arguments": {
    "path": {
      "team_id": 1
    },
    "account": "produto"
  }
}
```

Consulte o schema antes de compor uma chamada pelo agente:

```bash
clickupfy api describe clickupfy_api_v2_get_spaces
```

Reproduza pelo CLI a entrada usada pelo agente, sem executar a operação:

```bash
printf '%s' '{"path":{"team_id":1}}' | clickupfy api v2-get-spaces --input - --dry-run
```

### `clickupfy api v2-create-space`

A operação `CreateSpace` pertence ao grupo `Spaces` e usa
`POST /api/v2/team/{team_id}/space`.

A chamada altera o recurso indicado pelos parâmetros. Confira o resultado com a consulta correspondente antes de continuar.

A resposta preserva o JSON da API; respostas sem corpo retornam `{}`.
A API key do perfil precisa ter acesso ao recurso. As permissões e o plano do Workspace podem restringir o endpoint.
Os campos omitidos são tratados pelo servidor do ClickUp, sem padrões adicionais do cliente.

[Referência oficial](https://developer.clickup.com/reference/createspace).

| Entrada | Tipo | Obrigatória |
| --- | --- | --- |
| `path.team_id` | `number` | sim |
| `body` | objeto conforme `api describe` | sim |

O comando aceita as flags comuns de `api`: `--input`, `--path`, `--query`,
`--body`, `--body-file`, `--content-type`, `--file`, `--dry-run` e `--yes`.
A referência completa de tipos, campos aninhados e valores permitidos está no comando `describe` abaixo.

Exemplos:

Consulte o contrato antes de preencher os IDs reais:

```bash
clickupfy api describe v2-create-space
```

Valide uma entrada em arquivo sem enviar uma requisição:

```bash
clickupfy api v2-create-space --input entrada.json --dry-run
```

Use um envelope JSON pelo stdin:

```bash
printf '%s' '{"path":{"team_id":1},"body":{"name":"exemplo-1","multiple_assignees":true,"features":{"due_dates":{"enabled":true,"start_date":true,"remap_due_dates":true,"remap_closed_due_date":true},"time_tracking":{"enabled":true},"tags":{"enabled":true},"time_estimates":{"enabled":true},"checklists":{"enabled":true},"custom_fields":{"enabled":true},"remap_dependencies":{"enabled":true},"dependency_warning":{"enabled":true},"portfolios":{"enabled":true}}}}' | clickupfy api v2-create-space --input -
```

Selecione o perfil que tem acesso ao recurso:

```bash
clickupfy --account produto api v2-create-space --input entrada.json
```

Grave a resposta JSON para conferência. O arquivo de entrada usa o envelope do exemplo anterior:

```bash
clickupfy --json api v2-create-space --input entrada.json > resposta.json
```

### `clickupfy_api_v2_create_space`

A operação `CreateSpace` pertence ao grupo `Spaces` e usa
`POST /api/v2/team/{team_id}/space`.

A chamada altera o recurso indicado pelos parâmetros. Confira o resultado com a consulta correspondente antes de continuar.

A resposta preserva o JSON da API; respostas sem corpo retornam `{}`.
A API key do perfil precisa ter acesso ao recurso. As permissões e o plano do Workspace podem restringir o endpoint.
Os campos omitidos são tratados pelo servidor do ClickUp, sem padrões adicionais do cliente.

[Referência oficial](https://developer.clickup.com/reference/createspace).

| Entrada | Tipo | Obrigatória |
| --- | --- | --- |
| `path.team_id` | `number` | sim |
| `body` | objeto conforme `api describe` | sim |

`account` é opcional e usa o perfil ativo ou fixado no MCP. O retorno aparece em
`content` como JSON; recusas retornam `isError: true`. Ferramentas de escrita
ficam ausentes em `--read-only`. IDs explícitos devem respeitar a hierarquia fixada.

Exemplos:

Use o perfil ativo com o envelope mínimo:

```json
{
  "name": "clickupfy_api_v2_create_space",
  "arguments": {
    "path": {
      "team_id": 1
    },
    "body": {
      "name": "exemplo-1",
      "multiple_assignees": true,
      "features": {
        "due_dates": {
          "enabled": true,
          "start_date": true,
          "remap_due_dates": true,
          "remap_closed_due_date": true
        },
        "time_tracking": {
          "enabled": true
        },
        "tags": {
          "enabled": true
        },
        "time_estimates": {
          "enabled": true
        },
        "checklists": {
          "enabled": true
        },
        "custom_fields": {
          "enabled": true
        },
        "remap_dependencies": {
          "enabled": true
        },
        "dependency_warning": {
          "enabled": true
        },
        "portfolios": {
          "enabled": true
        }
      }
    }
  }
}
```

Direcione a chamada ao perfil de desenvolvimento:

```json
{
  "name": "clickupfy_api_v2_create_space",
  "arguments": {
    "path": {
      "team_id": 1
    },
    "body": {
      "name": "exemplo-1",
      "multiple_assignees": true,
      "features": {
        "due_dates": {
          "enabled": true,
          "start_date": true,
          "remap_due_dates": true,
          "remap_closed_due_date": true
        },
        "time_tracking": {
          "enabled": true
        },
        "tags": {
          "enabled": true
        },
        "time_estimates": {
          "enabled": true
        },
        "checklists": {
          "enabled": true
        },
        "custom_fields": {
          "enabled": true
        },
        "remap_dependencies": {
          "enabled": true
        },
        "dependency_warning": {
          "enabled": true
        },
        "portfolios": {
          "enabled": true
        }
      }
    },
    "account": "dev"
  }
}
```

Use o perfil do produto, quando o MCP permitir selecionar outro perfil:

```json
{
  "name": "clickupfy_api_v2_create_space",
  "arguments": {
    "path": {
      "team_id": 1
    },
    "body": {
      "name": "exemplo-1",
      "multiple_assignees": true,
      "features": {
        "due_dates": {
          "enabled": true,
          "start_date": true,
          "remap_due_dates": true,
          "remap_closed_due_date": true
        },
        "time_tracking": {
          "enabled": true
        },
        "tags": {
          "enabled": true
        },
        "time_estimates": {
          "enabled": true
        },
        "checklists": {
          "enabled": true
        },
        "custom_fields": {
          "enabled": true
        },
        "remap_dependencies": {
          "enabled": true
        },
        "dependency_warning": {
          "enabled": true
        },
        "portfolios": {
          "enabled": true
        }
      }
    },
    "account": "produto"
  }
}
```

Consulte o schema antes de compor uma chamada pelo agente:

```bash
clickupfy api describe clickupfy_api_v2_create_space
```

Reproduza pelo CLI a entrada usada pelo agente, sem executar a operação:

```bash
printf '%s' '{"path":{"team_id":1},"body":{"name":"exemplo-1","multiple_assignees":true,"features":{"due_dates":{"enabled":true,"start_date":true,"remap_due_dates":true,"remap_closed_due_date":true},"time_tracking":{"enabled":true},"tags":{"enabled":true},"time_estimates":{"enabled":true},"checklists":{"enabled":true},"custom_fields":{"enabled":true},"remap_dependencies":{"enabled":true},"dependency_warning":{"enabled":true},"portfolios":{"enabled":true}}}}' | clickupfy api v2-create-space --input - --dry-run
```

### `clickupfy api v2-get-space`

A operação `GetSpace` pertence ao grupo `Spaces` e usa
`GET /api/v2/space/{space_id}`.

A chamada consulta o recurso sem modificá-lo.

A resposta preserva o JSON da API; respostas sem corpo retornam `{}`.
A API key do perfil precisa ter acesso ao recurso. As permissões e o plano do Workspace podem restringir o endpoint.
Os campos omitidos são tratados pelo servidor do ClickUp, sem padrões adicionais do cliente.

[Referência oficial](https://developer.clickup.com/reference/getspace).

| Entrada | Tipo | Obrigatória |
| --- | --- | --- |
| `path.space_id` | `number` | sim |

O comando aceita as flags comuns de `api`: `--input`, `--path`, `--query`,
`--body`, `--body-file`, `--content-type`, `--file`, `--dry-run` e `--yes`.
A referência completa de tipos, campos aninhados e valores permitidos está no comando `describe` abaixo.

Exemplos:

Consulte o contrato antes de preencher os IDs reais:

```bash
clickupfy api describe v2-get-space
```

Valide uma entrada em arquivo sem enviar uma requisição:

```bash
clickupfy api v2-get-space --input entrada.json --dry-run
```

Use um envelope JSON pelo stdin:

```bash
printf '%s' '{"path":{"space_id":1}}' | clickupfy api v2-get-space --input -
```

Selecione o perfil que tem acesso ao recurso:

```bash
clickupfy --account produto api v2-get-space --input entrada.json
```

Grave a resposta JSON para conferência. O arquivo de entrada usa o envelope do exemplo anterior:

```bash
clickupfy --json api v2-get-space --input entrada.json > resposta.json
```

### `clickupfy_api_v2_get_space`

A operação `GetSpace` pertence ao grupo `Spaces` e usa
`GET /api/v2/space/{space_id}`.

A chamada consulta o recurso sem modificá-lo.

A resposta preserva o JSON da API; respostas sem corpo retornam `{}`.
A API key do perfil precisa ter acesso ao recurso. As permissões e o plano do Workspace podem restringir o endpoint.
Os campos omitidos são tratados pelo servidor do ClickUp, sem padrões adicionais do cliente.

[Referência oficial](https://developer.clickup.com/reference/getspace).

| Entrada | Tipo | Obrigatória |
| --- | --- | --- |
| `path.space_id` | `number` | sim |

`account` é opcional e usa o perfil ativo ou fixado no MCP. O retorno aparece em
`content` como JSON; recusas retornam `isError: true`. Ferramentas de escrita
ficam ausentes em `--read-only`. IDs explícitos devem respeitar a hierarquia fixada.

Exemplos:

Use o perfil ativo com o envelope mínimo:

```json
{
  "name": "clickupfy_api_v2_get_space",
  "arguments": {
    "path": {
      "space_id": 1
    }
  }
}
```

Direcione a chamada ao perfil de desenvolvimento:

```json
{
  "name": "clickupfy_api_v2_get_space",
  "arguments": {
    "path": {
      "space_id": 1
    },
    "account": "dev"
  }
}
```

Use o perfil do produto, quando o MCP permitir selecionar outro perfil:

```json
{
  "name": "clickupfy_api_v2_get_space",
  "arguments": {
    "path": {
      "space_id": 1
    },
    "account": "produto"
  }
}
```

Consulte o schema antes de compor uma chamada pelo agente:

```bash
clickupfy api describe clickupfy_api_v2_get_space
```

Reproduza pelo CLI a entrada usada pelo agente, sem executar a operação:

```bash
printf '%s' '{"path":{"space_id":1}}' | clickupfy api v2-get-space --input - --dry-run
```

### `clickupfy api v2-update-space`

A operação `UpdateSpace` pertence ao grupo `Spaces` e usa
`PUT /api/v2/space/{space_id}`.

A chamada altera o recurso indicado pelos parâmetros. Confira o resultado com a consulta correspondente antes de continuar.

A resposta preserva o JSON da API; respostas sem corpo retornam `{}`.
A API key do perfil precisa ter acesso ao recurso. As permissões e o plano do Workspace podem restringir o endpoint.
Os campos omitidos são tratados pelo servidor do ClickUp, sem padrões adicionais do cliente.

[Referência oficial](https://developer.clickup.com/reference/updatespace).

| Entrada | Tipo | Obrigatória |
| --- | --- | --- |
| `path.space_id` | `number` | sim |
| `body` | objeto conforme `api describe` | sim |

O comando aceita as flags comuns de `api`: `--input`, `--path`, `--query`,
`--body`, `--body-file`, `--content-type`, `--file`, `--dry-run` e `--yes`.
A referência completa de tipos, campos aninhados e valores permitidos está no comando `describe` abaixo.

Exemplos:

Consulte o contrato antes de preencher os IDs reais:

```bash
clickupfy api describe v2-update-space
```

Valide uma entrada em arquivo sem enviar uma requisição:

```bash
clickupfy api v2-update-space --input entrada.json --dry-run
```

Use um envelope JSON pelo stdin:

```bash
printf '%s' '{"path":{"space_id":1},"body":{"name":"exemplo-1","color":"exemplo-1","private":true,"admin_can_manage":true,"multiple_assignees":true,"features":{"due_dates":{"enabled":true,"start_date":true,"remap_due_dates":true,"remap_closed_due_date":true},"time_tracking":{"enabled":true},"tags":{"enabled":true},"time_estimates":{"enabled":true},"checklists":{"enabled":true},"custom_fields":{"enabled":true},"remap_dependencies":{"enabled":true},"dependency_warning":{"enabled":true},"portfolios":{"enabled":true}}}}' | clickupfy api v2-update-space --input -
```

Selecione o perfil que tem acesso ao recurso:

```bash
clickupfy --account produto api v2-update-space --input entrada.json
```

Grave a resposta JSON para conferência. O arquivo de entrada usa o envelope do exemplo anterior:

```bash
clickupfy --json api v2-update-space --input entrada.json > resposta.json
```

### `clickupfy_api_v2_update_space`

A operação `UpdateSpace` pertence ao grupo `Spaces` e usa
`PUT /api/v2/space/{space_id}`.

A chamada altera o recurso indicado pelos parâmetros. Confira o resultado com a consulta correspondente antes de continuar.

A resposta preserva o JSON da API; respostas sem corpo retornam `{}`.
A API key do perfil precisa ter acesso ao recurso. As permissões e o plano do Workspace podem restringir o endpoint.
Os campos omitidos são tratados pelo servidor do ClickUp, sem padrões adicionais do cliente.

[Referência oficial](https://developer.clickup.com/reference/updatespace).

| Entrada | Tipo | Obrigatória |
| --- | --- | --- |
| `path.space_id` | `number` | sim |
| `body` | objeto conforme `api describe` | sim |

`account` é opcional e usa o perfil ativo ou fixado no MCP. O retorno aparece em
`content` como JSON; recusas retornam `isError: true`. Ferramentas de escrita
ficam ausentes em `--read-only`. IDs explícitos devem respeitar a hierarquia fixada.

Exemplos:

Use o perfil ativo com o envelope mínimo:

```json
{
  "name": "clickupfy_api_v2_update_space",
  "arguments": {
    "path": {
      "space_id": 1
    },
    "body": {
      "name": "exemplo-1",
      "color": "exemplo-1",
      "private": true,
      "admin_can_manage": true,
      "multiple_assignees": true,
      "features": {
        "due_dates": {
          "enabled": true,
          "start_date": true,
          "remap_due_dates": true,
          "remap_closed_due_date": true
        },
        "time_tracking": {
          "enabled": true
        },
        "tags": {
          "enabled": true
        },
        "time_estimates": {
          "enabled": true
        },
        "checklists": {
          "enabled": true
        },
        "custom_fields": {
          "enabled": true
        },
        "remap_dependencies": {
          "enabled": true
        },
        "dependency_warning": {
          "enabled": true
        },
        "portfolios": {
          "enabled": true
        }
      }
    }
  }
}
```

Direcione a chamada ao perfil de desenvolvimento:

```json
{
  "name": "clickupfy_api_v2_update_space",
  "arguments": {
    "path": {
      "space_id": 1
    },
    "body": {
      "name": "exemplo-1",
      "color": "exemplo-1",
      "private": true,
      "admin_can_manage": true,
      "multiple_assignees": true,
      "features": {
        "due_dates": {
          "enabled": true,
          "start_date": true,
          "remap_due_dates": true,
          "remap_closed_due_date": true
        },
        "time_tracking": {
          "enabled": true
        },
        "tags": {
          "enabled": true
        },
        "time_estimates": {
          "enabled": true
        },
        "checklists": {
          "enabled": true
        },
        "custom_fields": {
          "enabled": true
        },
        "remap_dependencies": {
          "enabled": true
        },
        "dependency_warning": {
          "enabled": true
        },
        "portfolios": {
          "enabled": true
        }
      }
    },
    "account": "dev"
  }
}
```

Use o perfil do produto, quando o MCP permitir selecionar outro perfil:

```json
{
  "name": "clickupfy_api_v2_update_space",
  "arguments": {
    "path": {
      "space_id": 1
    },
    "body": {
      "name": "exemplo-1",
      "color": "exemplo-1",
      "private": true,
      "admin_can_manage": true,
      "multiple_assignees": true,
      "features": {
        "due_dates": {
          "enabled": true,
          "start_date": true,
          "remap_due_dates": true,
          "remap_closed_due_date": true
        },
        "time_tracking": {
          "enabled": true
        },
        "tags": {
          "enabled": true
        },
        "time_estimates": {
          "enabled": true
        },
        "checklists": {
          "enabled": true
        },
        "custom_fields": {
          "enabled": true
        },
        "remap_dependencies": {
          "enabled": true
        },
        "dependency_warning": {
          "enabled": true
        },
        "portfolios": {
          "enabled": true
        }
      }
    },
    "account": "produto"
  }
}
```

Consulte o schema antes de compor uma chamada pelo agente:

```bash
clickupfy api describe clickupfy_api_v2_update_space
```

Reproduza pelo CLI a entrada usada pelo agente, sem executar a operação:

```bash
printf '%s' '{"path":{"space_id":1},"body":{"name":"exemplo-1","color":"exemplo-1","private":true,"admin_can_manage":true,"multiple_assignees":true,"features":{"due_dates":{"enabled":true,"start_date":true,"remap_due_dates":true,"remap_closed_due_date":true},"time_tracking":{"enabled":true},"tags":{"enabled":true},"time_estimates":{"enabled":true},"checklists":{"enabled":true},"custom_fields":{"enabled":true},"remap_dependencies":{"enabled":true},"dependency_warning":{"enabled":true},"portfolios":{"enabled":true}}}}' | clickupfy api v2-update-space --input - --dry-run
```

### `clickupfy api v2-delete-space`

A operação `DeleteSpace` pertence ao grupo `Spaces` e usa
`DELETE /api/v2/space/{space_id}`.

A chamada altera o recurso indicado pelos parâmetros. Confira o resultado com a consulta correspondente antes de continuar.

A resposta preserva o JSON da API; respostas sem corpo retornam `{}`.
A API key do perfil precisa ter acesso ao recurso. As permissões e o plano do Workspace podem restringir o endpoint.
Os campos omitidos são tratados pelo servidor do ClickUp, sem padrões adicionais do cliente.

[Referência oficial](https://developer.clickup.com/reference/deletespace).

| Entrada | Tipo | Obrigatória |
| --- | --- | --- |
| `path.space_id` | `number` | sim |
| `confirm` | boolean, somente `true` | sim |

O comando aceita as flags comuns de `api`: `--input`, `--path`, `--query`,
`--body`, `--body-file`, `--content-type`, `--file`, `--dry-run` e `--yes`.
A referência completa de tipos, campos aninhados e valores permitidos está no comando `describe` abaixo.

Exemplos:

Consulte o contrato antes de preencher os IDs reais:

```bash
clickupfy api describe v2-delete-space
```

Valide uma entrada em arquivo sem enviar uma requisição:

```bash
clickupfy api v2-delete-space --input entrada.json --dry-run
```

Use um envelope JSON pelo stdin:

```bash
printf '%s' '{"path":{"space_id":1},"confirm":true}' | clickupfy api v2-delete-space --input -
```

Selecione o perfil que tem acesso ao recurso:

```bash
clickupfy --account produto api v2-delete-space --input entrada.json
```

Grave a resposta JSON para conferência. O arquivo de entrada usa o envelope do exemplo anterior:

```bash
clickupfy --json api v2-delete-space --input entrada.json > resposta.json
```

### `clickupfy_api_v2_delete_space`

A operação `DeleteSpace` pertence ao grupo `Spaces` e usa
`DELETE /api/v2/space/{space_id}`.

A chamada altera o recurso indicado pelos parâmetros. Confira o resultado com a consulta correspondente antes de continuar.

A resposta preserva o JSON da API; respostas sem corpo retornam `{}`.
A API key do perfil precisa ter acesso ao recurso. As permissões e o plano do Workspace podem restringir o endpoint.
Os campos omitidos são tratados pelo servidor do ClickUp, sem padrões adicionais do cliente.

[Referência oficial](https://developer.clickup.com/reference/deletespace).

| Entrada | Tipo | Obrigatória |
| --- | --- | --- |
| `path.space_id` | `number` | sim |
| `confirm` | boolean, somente `true` | sim |

`account` é opcional e usa o perfil ativo ou fixado no MCP. O retorno aparece em
`content` como JSON; recusas retornam `isError: true`. Ferramentas de escrita
ficam ausentes em `--read-only`. IDs explícitos devem respeitar a hierarquia fixada.

Exemplos:

Use o perfil ativo com o envelope mínimo:

```json
{
  "name": "clickupfy_api_v2_delete_space",
  "arguments": {
    "path": {
      "space_id": 1
    },
    "confirm": true
  }
}
```

Direcione a chamada ao perfil de desenvolvimento:

```json
{
  "name": "clickupfy_api_v2_delete_space",
  "arguments": {
    "path": {
      "space_id": 1
    },
    "confirm": true,
    "account": "dev"
  }
}
```

Use o perfil do produto, quando o MCP permitir selecionar outro perfil:

```json
{
  "name": "clickupfy_api_v2_delete_space",
  "arguments": {
    "path": {
      "space_id": 1
    },
    "confirm": true,
    "account": "produto"
  }
}
```

Consulte o schema antes de compor uma chamada pelo agente:

```bash
clickupfy api describe clickupfy_api_v2_delete_space
```

Reproduza pelo CLI a entrada usada pelo agente, sem executar a operação:

```bash
printf '%s' '{"path":{"space_id":1},"confirm":true}' | clickupfy api v2-delete-space --input - --dry-run
```

### `clickupfy api v2-get-space-tags`

A operação `GetSpaceTags` pertence ao grupo `Tags` e usa
`GET /api/v2/space/{space_id}/tag`.

A chamada consulta o recurso sem modificá-lo.

A resposta preserva o JSON da API; respostas sem corpo retornam `{}`.
A API key do perfil precisa ter acesso ao recurso. As permissões e o plano do Workspace podem restringir o endpoint.
Os campos omitidos são tratados pelo servidor do ClickUp, sem padrões adicionais do cliente.

[Referência oficial](https://developer.clickup.com/reference/getspacetags).

| Entrada | Tipo | Obrigatória |
| --- | --- | --- |
| `path.space_id` | `number` | sim |

O comando aceita as flags comuns de `api`: `--input`, `--path`, `--query`,
`--body`, `--body-file`, `--content-type`, `--file`, `--dry-run` e `--yes`.
A referência completa de tipos, campos aninhados e valores permitidos está no comando `describe` abaixo.

Exemplos:

Consulte o contrato antes de preencher os IDs reais:

```bash
clickupfy api describe v2-get-space-tags
```

Valide uma entrada em arquivo sem enviar uma requisição:

```bash
clickupfy api v2-get-space-tags --input entrada.json --dry-run
```

Use um envelope JSON pelo stdin:

```bash
printf '%s' '{"path":{"space_id":1}}' | clickupfy api v2-get-space-tags --input -
```

Selecione o perfil que tem acesso ao recurso:

```bash
clickupfy --account produto api v2-get-space-tags --input entrada.json
```

Grave a resposta JSON para conferência. O arquivo de entrada usa o envelope do exemplo anterior:

```bash
clickupfy --json api v2-get-space-tags --input entrada.json > resposta.json
```

### `clickupfy_api_v2_get_space_tags`

A operação `GetSpaceTags` pertence ao grupo `Tags` e usa
`GET /api/v2/space/{space_id}/tag`.

A chamada consulta o recurso sem modificá-lo.

A resposta preserva o JSON da API; respostas sem corpo retornam `{}`.
A API key do perfil precisa ter acesso ao recurso. As permissões e o plano do Workspace podem restringir o endpoint.
Os campos omitidos são tratados pelo servidor do ClickUp, sem padrões adicionais do cliente.

[Referência oficial](https://developer.clickup.com/reference/getspacetags).

| Entrada | Tipo | Obrigatória |
| --- | --- | --- |
| `path.space_id` | `number` | sim |

`account` é opcional e usa o perfil ativo ou fixado no MCP. O retorno aparece em
`content` como JSON; recusas retornam `isError: true`. Ferramentas de escrita
ficam ausentes em `--read-only`. IDs explícitos devem respeitar a hierarquia fixada.

Exemplos:

Use o perfil ativo com o envelope mínimo:

```json
{
  "name": "clickupfy_api_v2_get_space_tags",
  "arguments": {
    "path": {
      "space_id": 1
    }
  }
}
```

Direcione a chamada ao perfil de desenvolvimento:

```json
{
  "name": "clickupfy_api_v2_get_space_tags",
  "arguments": {
    "path": {
      "space_id": 1
    },
    "account": "dev"
  }
}
```

Use o perfil do produto, quando o MCP permitir selecionar outro perfil:

```json
{
  "name": "clickupfy_api_v2_get_space_tags",
  "arguments": {
    "path": {
      "space_id": 1
    },
    "account": "produto"
  }
}
```

Consulte o schema antes de compor uma chamada pelo agente:

```bash
clickupfy api describe clickupfy_api_v2_get_space_tags
```

Reproduza pelo CLI a entrada usada pelo agente, sem executar a operação:

```bash
printf '%s' '{"path":{"space_id":1}}' | clickupfy api v2-get-space-tags --input - --dry-run
```

### `clickupfy api v2-create-space-tag`

A operação `CreateSpaceTag` pertence ao grupo `Tags` e usa
`POST /api/v2/space/{space_id}/tag`.

A chamada altera o recurso indicado pelos parâmetros. Confira o resultado com a consulta correspondente antes de continuar.

A resposta preserva o JSON da API; respostas sem corpo retornam `{}`.
A API key do perfil precisa ter acesso ao recurso. As permissões e o plano do Workspace podem restringir o endpoint.
Os campos omitidos são tratados pelo servidor do ClickUp, sem padrões adicionais do cliente.

[Referência oficial](https://developer.clickup.com/reference/createspacetag).

| Entrada | Tipo | Obrigatória |
| --- | --- | --- |
| `path.space_id` | `number` | sim |
| `body` | objeto conforme `api describe` | sim |

O comando aceita as flags comuns de `api`: `--input`, `--path`, `--query`,
`--body`, `--body-file`, `--content-type`, `--file`, `--dry-run` e `--yes`.
A referência completa de tipos, campos aninhados e valores permitidos está no comando `describe` abaixo.

Exemplos:

Consulte o contrato antes de preencher os IDs reais:

```bash
clickupfy api describe v2-create-space-tag
```

Valide uma entrada em arquivo sem enviar uma requisição:

```bash
clickupfy api v2-create-space-tag --input entrada.json --dry-run
```

Use um envelope JSON pelo stdin:

```bash
printf '%s' '{"path":{"space_id":1},"body":{"tag":{"name":"exemplo-1","tag_fg":"exemplo-1","tag_bg":"exemplo-1"}}}' | clickupfy api v2-create-space-tag --input -
```

Selecione o perfil que tem acesso ao recurso:

```bash
clickupfy --account produto api v2-create-space-tag --input entrada.json
```

Grave a resposta JSON para conferência. O arquivo de entrada usa o envelope do exemplo anterior:

```bash
clickupfy --json api v2-create-space-tag --input entrada.json > resposta.json
```

### `clickupfy_api_v2_create_space_tag`

A operação `CreateSpaceTag` pertence ao grupo `Tags` e usa
`POST /api/v2/space/{space_id}/tag`.

A chamada altera o recurso indicado pelos parâmetros. Confira o resultado com a consulta correspondente antes de continuar.

A resposta preserva o JSON da API; respostas sem corpo retornam `{}`.
A API key do perfil precisa ter acesso ao recurso. As permissões e o plano do Workspace podem restringir o endpoint.
Os campos omitidos são tratados pelo servidor do ClickUp, sem padrões adicionais do cliente.

[Referência oficial](https://developer.clickup.com/reference/createspacetag).

| Entrada | Tipo | Obrigatória |
| --- | --- | --- |
| `path.space_id` | `number` | sim |
| `body` | objeto conforme `api describe` | sim |

`account` é opcional e usa o perfil ativo ou fixado no MCP. O retorno aparece em
`content` como JSON; recusas retornam `isError: true`. Ferramentas de escrita
ficam ausentes em `--read-only`. IDs explícitos devem respeitar a hierarquia fixada.

Exemplos:

Use o perfil ativo com o envelope mínimo:

```json
{
  "name": "clickupfy_api_v2_create_space_tag",
  "arguments": {
    "path": {
      "space_id": 1
    },
    "body": {
      "tag": {
        "name": "exemplo-1",
        "tag_fg": "exemplo-1",
        "tag_bg": "exemplo-1"
      }
    }
  }
}
```

Direcione a chamada ao perfil de desenvolvimento:

```json
{
  "name": "clickupfy_api_v2_create_space_tag",
  "arguments": {
    "path": {
      "space_id": 1
    },
    "body": {
      "tag": {
        "name": "exemplo-1",
        "tag_fg": "exemplo-1",
        "tag_bg": "exemplo-1"
      }
    },
    "account": "dev"
  }
}
```

Use o perfil do produto, quando o MCP permitir selecionar outro perfil:

```json
{
  "name": "clickupfy_api_v2_create_space_tag",
  "arguments": {
    "path": {
      "space_id": 1
    },
    "body": {
      "tag": {
        "name": "exemplo-1",
        "tag_fg": "exemplo-1",
        "tag_bg": "exemplo-1"
      }
    },
    "account": "produto"
  }
}
```

Consulte o schema antes de compor uma chamada pelo agente:

```bash
clickupfy api describe clickupfy_api_v2_create_space_tag
```

Reproduza pelo CLI a entrada usada pelo agente, sem executar a operação:

```bash
printf '%s' '{"path":{"space_id":1},"body":{"tag":{"name":"exemplo-1","tag_fg":"exemplo-1","tag_bg":"exemplo-1"}}}' | clickupfy api v2-create-space-tag --input - --dry-run
```

### `clickupfy api v2-edit-space-tag`

A operação `EditSpaceTag` pertence ao grupo `Tags` e usa
`PUT /api/v2/space/{space_id}/tag/{tag_name}`.

A chamada altera o recurso indicado pelos parâmetros. Confira o resultado com a consulta correspondente antes de continuar.

A resposta preserva o JSON da API; respostas sem corpo retornam `{}`.
A API key do perfil precisa ter acesso ao recurso. As permissões e o plano do Workspace podem restringir o endpoint.
Os campos omitidos são tratados pelo servidor do ClickUp, sem padrões adicionais do cliente.

[Referência oficial](https://developer.clickup.com/reference/editspacetag).

| Entrada | Tipo | Obrigatória |
| --- | --- | --- |
| `path.space_id` | `number` | sim |
| `path.tag_name` | `string` | sim |
| `body` | objeto conforme `api describe` | sim |

O comando aceita as flags comuns de `api`: `--input`, `--path`, `--query`,
`--body`, `--body-file`, `--content-type`, `--file`, `--dry-run` e `--yes`.
A referência completa de tipos, campos aninhados e valores permitidos está no comando `describe` abaixo.

Exemplos:

Consulte o contrato antes de preencher os IDs reais:

```bash
clickupfy api describe v2-edit-space-tag
```

Valide uma entrada em arquivo sem enviar uma requisição:

```bash
clickupfy api v2-edit-space-tag --input entrada.json --dry-run
```

Use um envelope JSON pelo stdin:

```bash
printf '%s' '{"path":{"space_id":1,"tag_name":"exemplo-1"},"body":{"tag":{"name":"exemplo-1","fg_color":"exemplo-1","bg_color":"exemplo-1"}}}' | clickupfy api v2-edit-space-tag --input -
```

Selecione o perfil que tem acesso ao recurso:

```bash
clickupfy --account produto api v2-edit-space-tag --input entrada.json
```

Grave a resposta JSON para conferência. O arquivo de entrada usa o envelope do exemplo anterior:

```bash
clickupfy --json api v2-edit-space-tag --input entrada.json > resposta.json
```

### `clickupfy_api_v2_edit_space_tag`

A operação `EditSpaceTag` pertence ao grupo `Tags` e usa
`PUT /api/v2/space/{space_id}/tag/{tag_name}`.

A chamada altera o recurso indicado pelos parâmetros. Confira o resultado com a consulta correspondente antes de continuar.

A resposta preserva o JSON da API; respostas sem corpo retornam `{}`.
A API key do perfil precisa ter acesso ao recurso. As permissões e o plano do Workspace podem restringir o endpoint.
Os campos omitidos são tratados pelo servidor do ClickUp, sem padrões adicionais do cliente.

[Referência oficial](https://developer.clickup.com/reference/editspacetag).

| Entrada | Tipo | Obrigatória |
| --- | --- | --- |
| `path.space_id` | `number` | sim |
| `path.tag_name` | `string` | sim |
| `body` | objeto conforme `api describe` | sim |

`account` é opcional e usa o perfil ativo ou fixado no MCP. O retorno aparece em
`content` como JSON; recusas retornam `isError: true`. Ferramentas de escrita
ficam ausentes em `--read-only`. IDs explícitos devem respeitar a hierarquia fixada.

Exemplos:

Use o perfil ativo com o envelope mínimo:

```json
{
  "name": "clickupfy_api_v2_edit_space_tag",
  "arguments": {
    "path": {
      "space_id": 1,
      "tag_name": "exemplo-1"
    },
    "body": {
      "tag": {
        "name": "exemplo-1",
        "fg_color": "exemplo-1",
        "bg_color": "exemplo-1"
      }
    }
  }
}
```

Direcione a chamada ao perfil de desenvolvimento:

```json
{
  "name": "clickupfy_api_v2_edit_space_tag",
  "arguments": {
    "path": {
      "space_id": 1,
      "tag_name": "exemplo-1"
    },
    "body": {
      "tag": {
        "name": "exemplo-1",
        "fg_color": "exemplo-1",
        "bg_color": "exemplo-1"
      }
    },
    "account": "dev"
  }
}
```

Use o perfil do produto, quando o MCP permitir selecionar outro perfil:

```json
{
  "name": "clickupfy_api_v2_edit_space_tag",
  "arguments": {
    "path": {
      "space_id": 1,
      "tag_name": "exemplo-1"
    },
    "body": {
      "tag": {
        "name": "exemplo-1",
        "fg_color": "exemplo-1",
        "bg_color": "exemplo-1"
      }
    },
    "account": "produto"
  }
}
```

Consulte o schema antes de compor uma chamada pelo agente:

```bash
clickupfy api describe clickupfy_api_v2_edit_space_tag
```

Reproduza pelo CLI a entrada usada pelo agente, sem executar a operação:

```bash
printf '%s' '{"path":{"space_id":1,"tag_name":"exemplo-1"},"body":{"tag":{"name":"exemplo-1","fg_color":"exemplo-1","bg_color":"exemplo-1"}}}' | clickupfy api v2-edit-space-tag --input - --dry-run
```

### `clickupfy api v2-delete-space-tag`

A operação `DeleteSpaceTag` pertence ao grupo `Tags` e usa
`DELETE /api/v2/space/{space_id}/tag/{tag_name}`.

A chamada altera o recurso indicado pelos parâmetros. Confira o resultado com a consulta correspondente antes de continuar.

A resposta preserva o JSON da API; respostas sem corpo retornam `{}`.
A API key do perfil precisa ter acesso ao recurso. As permissões e o plano do Workspace podem restringir o endpoint.
Os campos omitidos são tratados pelo servidor do ClickUp, sem padrões adicionais do cliente.

[Referência oficial](https://developer.clickup.com/reference/deletespacetag).

| Entrada | Tipo | Obrigatória |
| --- | --- | --- |
| `path.space_id` | `number` | sim |
| `path.tag_name` | `string` | sim |
| `body` | objeto conforme `api describe` | sim |
| `confirm` | boolean, somente `true` | sim |

O comando aceita as flags comuns de `api`: `--input`, `--path`, `--query`,
`--body`, `--body-file`, `--content-type`, `--file`, `--dry-run` e `--yes`.
A referência completa de tipos, campos aninhados e valores permitidos está no comando `describe` abaixo.

Exemplos:

Consulte o contrato antes de preencher os IDs reais:

```bash
clickupfy api describe v2-delete-space-tag
```

Valide uma entrada em arquivo sem enviar uma requisição:

```bash
clickupfy api v2-delete-space-tag --input entrada.json --dry-run
```

Use um envelope JSON pelo stdin:

```bash
printf '%s' '{"path":{"space_id":1,"tag_name":"exemplo-1"},"body":{"tag":{"name":"exemplo-1","tag_fg":"exemplo-1","tag_bg":"exemplo-1"}},"confirm":true}' | clickupfy api v2-delete-space-tag --input -
```

Selecione o perfil que tem acesso ao recurso:

```bash
clickupfy --account produto api v2-delete-space-tag --input entrada.json
```

Grave a resposta JSON para conferência. O arquivo de entrada usa o envelope do exemplo anterior:

```bash
clickupfy --json api v2-delete-space-tag --input entrada.json > resposta.json
```

### `clickupfy_api_v2_delete_space_tag`

A operação `DeleteSpaceTag` pertence ao grupo `Tags` e usa
`DELETE /api/v2/space/{space_id}/tag/{tag_name}`.

A chamada altera o recurso indicado pelos parâmetros. Confira o resultado com a consulta correspondente antes de continuar.

A resposta preserva o JSON da API; respostas sem corpo retornam `{}`.
A API key do perfil precisa ter acesso ao recurso. As permissões e o plano do Workspace podem restringir o endpoint.
Os campos omitidos são tratados pelo servidor do ClickUp, sem padrões adicionais do cliente.

[Referência oficial](https://developer.clickup.com/reference/deletespacetag).

| Entrada | Tipo | Obrigatória |
| --- | --- | --- |
| `path.space_id` | `number` | sim |
| `path.tag_name` | `string` | sim |
| `body` | objeto conforme `api describe` | sim |
| `confirm` | boolean, somente `true` | sim |

`account` é opcional e usa o perfil ativo ou fixado no MCP. O retorno aparece em
`content` como JSON; recusas retornam `isError: true`. Ferramentas de escrita
ficam ausentes em `--read-only`. IDs explícitos devem respeitar a hierarquia fixada.

Exemplos:

Use o perfil ativo com o envelope mínimo:

```json
{
  "name": "clickupfy_api_v2_delete_space_tag",
  "arguments": {
    "path": {
      "space_id": 1,
      "tag_name": "exemplo-1"
    },
    "body": {
      "tag": {
        "name": "exemplo-1",
        "tag_fg": "exemplo-1",
        "tag_bg": "exemplo-1"
      }
    },
    "confirm": true
  }
}
```

Direcione a chamada ao perfil de desenvolvimento:

```json
{
  "name": "clickupfy_api_v2_delete_space_tag",
  "arguments": {
    "path": {
      "space_id": 1,
      "tag_name": "exemplo-1"
    },
    "body": {
      "tag": {
        "name": "exemplo-1",
        "tag_fg": "exemplo-1",
        "tag_bg": "exemplo-1"
      }
    },
    "confirm": true,
    "account": "dev"
  }
}
```

Use o perfil do produto, quando o MCP permitir selecionar outro perfil:

```json
{
  "name": "clickupfy_api_v2_delete_space_tag",
  "arguments": {
    "path": {
      "space_id": 1,
      "tag_name": "exemplo-1"
    },
    "body": {
      "tag": {
        "name": "exemplo-1",
        "tag_fg": "exemplo-1",
        "tag_bg": "exemplo-1"
      }
    },
    "confirm": true,
    "account": "produto"
  }
}
```

Consulte o schema antes de compor uma chamada pelo agente:

```bash
clickupfy api describe clickupfy_api_v2_delete_space_tag
```

Reproduza pelo CLI a entrada usada pelo agente, sem executar a operação:

```bash
printf '%s' '{"path":{"space_id":1,"tag_name":"exemplo-1"},"body":{"tag":{"name":"exemplo-1","tag_fg":"exemplo-1","tag_bg":"exemplo-1"}},"confirm":true}' | clickupfy api v2-delete-space-tag --input - --dry-run
```

### `clickupfy api v2-add-tag-to-task`

A operação `AddTagToTask` pertence ao grupo `Tags` e usa
`POST /api/v2/task/{task_id}/tag/{tag_name}`.

A chamada altera o recurso indicado pelos parâmetros. Confira o resultado com a consulta correspondente antes de continuar.

A resposta preserva o JSON da API; respostas sem corpo retornam `{}`.
A API key do perfil precisa ter acesso ao recurso. As permissões e o plano do Workspace podem restringir o endpoint.
Os campos omitidos são tratados pelo servidor do ClickUp, sem padrões adicionais do cliente.

[Referência oficial](https://developer.clickup.com/reference/addtagtotask).

| Entrada | Tipo | Obrigatória |
| --- | --- | --- |
| `path.task_id` | `string` | sim |
| `path.tag_name` | `string` | sim |
| `query.custom_task_ids` | `boolean` | não |
| `query.team_id` | `number` | não |

O comando aceita as flags comuns de `api`: `--input`, `--path`, `--query`,
`--body`, `--body-file`, `--content-type`, `--file`, `--dry-run` e `--yes`.
A referência completa de tipos, campos aninhados e valores permitidos está no comando `describe` abaixo.

Exemplos:

Consulte o contrato antes de preencher os IDs reais:

```bash
clickupfy api describe v2-add-tag-to-task
```

Valide uma entrada em arquivo sem enviar uma requisição:

```bash
clickupfy api v2-add-tag-to-task --input entrada.json --dry-run
```

Use um envelope JSON pelo stdin:

```bash
printf '%s' '{"path":{"task_id":"exemplo-1","tag_name":"exemplo-1"}}' | clickupfy api v2-add-tag-to-task --input -
```

Selecione o perfil que tem acesso ao recurso:

```bash
clickupfy --account produto api v2-add-tag-to-task --input entrada.json
```

Grave a resposta JSON para conferência. O arquivo de entrada usa o envelope do exemplo anterior:

```bash
clickupfy --json api v2-add-tag-to-task --input entrada.json > resposta.json
```

### `clickupfy_api_v2_add_tag_to_task`

A operação `AddTagToTask` pertence ao grupo `Tags` e usa
`POST /api/v2/task/{task_id}/tag/{tag_name}`.

A chamada altera o recurso indicado pelos parâmetros. Confira o resultado com a consulta correspondente antes de continuar.

A resposta preserva o JSON da API; respostas sem corpo retornam `{}`.
A API key do perfil precisa ter acesso ao recurso. As permissões e o plano do Workspace podem restringir o endpoint.
Os campos omitidos são tratados pelo servidor do ClickUp, sem padrões adicionais do cliente.

[Referência oficial](https://developer.clickup.com/reference/addtagtotask).

| Entrada | Tipo | Obrigatória |
| --- | --- | --- |
| `path.task_id` | `string` | sim |
| `path.tag_name` | `string` | sim |
| `query.custom_task_ids` | `boolean` | não |
| `query.team_id` | `number` | não |

`account` é opcional e usa o perfil ativo ou fixado no MCP. O retorno aparece em
`content` como JSON; recusas retornam `isError: true`. Ferramentas de escrita
ficam ausentes em `--read-only`. IDs explícitos devem respeitar a hierarquia fixada.

Exemplos:

Use o perfil ativo com o envelope mínimo:

```json
{
  "name": "clickupfy_api_v2_add_tag_to_task",
  "arguments": {
    "path": {
      "task_id": "exemplo-1",
      "tag_name": "exemplo-1"
    }
  }
}
```

Direcione a chamada ao perfil de desenvolvimento:

```json
{
  "name": "clickupfy_api_v2_add_tag_to_task",
  "arguments": {
    "path": {
      "task_id": "exemplo-1",
      "tag_name": "exemplo-1"
    },
    "account": "dev"
  }
}
```

Use o perfil do produto, quando o MCP permitir selecionar outro perfil:

```json
{
  "name": "clickupfy_api_v2_add_tag_to_task",
  "arguments": {
    "path": {
      "task_id": "exemplo-1",
      "tag_name": "exemplo-1"
    },
    "account": "produto"
  }
}
```

Consulte o schema antes de compor uma chamada pelo agente:

```bash
clickupfy api describe clickupfy_api_v2_add_tag_to_task
```

Reproduza pelo CLI a entrada usada pelo agente, sem executar a operação:

```bash
printf '%s' '{"path":{"task_id":"exemplo-1","tag_name":"exemplo-1"}}' | clickupfy api v2-add-tag-to-task --input - --dry-run
```

### `clickupfy api v2-remove-tag-from-task`

A operação `RemoveTagFromTask` pertence ao grupo `Tags` e usa
`DELETE /api/v2/task/{task_id}/tag/{tag_name}`.

A chamada altera o recurso indicado pelos parâmetros. Confira o resultado com a consulta correspondente antes de continuar.

A resposta preserva o JSON da API; respostas sem corpo retornam `{}`.
A API key do perfil precisa ter acesso ao recurso. As permissões e o plano do Workspace podem restringir o endpoint.
Os campos omitidos são tratados pelo servidor do ClickUp, sem padrões adicionais do cliente.

[Referência oficial](https://developer.clickup.com/reference/removetagfromtask).

| Entrada | Tipo | Obrigatória |
| --- | --- | --- |
| `path.task_id` | `string` | sim |
| `path.tag_name` | `string` | sim |
| `query.custom_task_ids` | `boolean` | não |
| `query.team_id` | `number` | não |
| `confirm` | boolean, somente `true` | sim |

O comando aceita as flags comuns de `api`: `--input`, `--path`, `--query`,
`--body`, `--body-file`, `--content-type`, `--file`, `--dry-run` e `--yes`.
A referência completa de tipos, campos aninhados e valores permitidos está no comando `describe` abaixo.

Exemplos:

Consulte o contrato antes de preencher os IDs reais:

```bash
clickupfy api describe v2-remove-tag-from-task
```

Valide uma entrada em arquivo sem enviar uma requisição:

```bash
clickupfy api v2-remove-tag-from-task --input entrada.json --dry-run
```

Use um envelope JSON pelo stdin:

```bash
printf '%s' '{"path":{"task_id":"exemplo-1","tag_name":"exemplo-1"},"confirm":true}' | clickupfy api v2-remove-tag-from-task --input -
```

Selecione o perfil que tem acesso ao recurso:

```bash
clickupfy --account produto api v2-remove-tag-from-task --input entrada.json
```

Grave a resposta JSON para conferência. O arquivo de entrada usa o envelope do exemplo anterior:

```bash
clickupfy --json api v2-remove-tag-from-task --input entrada.json > resposta.json
```

### `clickupfy_api_v2_remove_tag_from_task`

A operação `RemoveTagFromTask` pertence ao grupo `Tags` e usa
`DELETE /api/v2/task/{task_id}/tag/{tag_name}`.

A chamada altera o recurso indicado pelos parâmetros. Confira o resultado com a consulta correspondente antes de continuar.

A resposta preserva o JSON da API; respostas sem corpo retornam `{}`.
A API key do perfil precisa ter acesso ao recurso. As permissões e o plano do Workspace podem restringir o endpoint.
Os campos omitidos são tratados pelo servidor do ClickUp, sem padrões adicionais do cliente.

[Referência oficial](https://developer.clickup.com/reference/removetagfromtask).

| Entrada | Tipo | Obrigatória |
| --- | --- | --- |
| `path.task_id` | `string` | sim |
| `path.tag_name` | `string` | sim |
| `query.custom_task_ids` | `boolean` | não |
| `query.team_id` | `number` | não |
| `confirm` | boolean, somente `true` | sim |

`account` é opcional e usa o perfil ativo ou fixado no MCP. O retorno aparece em
`content` como JSON; recusas retornam `isError: true`. Ferramentas de escrita
ficam ausentes em `--read-only`. IDs explícitos devem respeitar a hierarquia fixada.

Exemplos:

Use o perfil ativo com o envelope mínimo:

```json
{
  "name": "clickupfy_api_v2_remove_tag_from_task",
  "arguments": {
    "path": {
      "task_id": "exemplo-1",
      "tag_name": "exemplo-1"
    },
    "confirm": true
  }
}
```

Direcione a chamada ao perfil de desenvolvimento:

```json
{
  "name": "clickupfy_api_v2_remove_tag_from_task",
  "arguments": {
    "path": {
      "task_id": "exemplo-1",
      "tag_name": "exemplo-1"
    },
    "confirm": true,
    "account": "dev"
  }
}
```

Use o perfil do produto, quando o MCP permitir selecionar outro perfil:

```json
{
  "name": "clickupfy_api_v2_remove_tag_from_task",
  "arguments": {
    "path": {
      "task_id": "exemplo-1",
      "tag_name": "exemplo-1"
    },
    "confirm": true,
    "account": "produto"
  }
}
```

Consulte o schema antes de compor uma chamada pelo agente:

```bash
clickupfy api describe clickupfy_api_v2_remove_tag_from_task
```

Reproduza pelo CLI a entrada usada pelo agente, sem executar a operação:

```bash
printf '%s' '{"path":{"task_id":"exemplo-1","tag_name":"exemplo-1"},"confirm":true}' | clickupfy api v2-remove-tag-from-task --input - --dry-run
```

### `clickupfy api v2-get-tasks`

A operação `GetTasks` pertence ao grupo `Tasks` e usa
`GET /api/v2/list/{list_id}/task`.

A chamada consulta o recurso sem modificá-lo.

A resposta preserva o JSON da API; respostas sem corpo retornam `{}`.
A API key do perfil precisa ter acesso ao recurso. As permissões e o plano do Workspace podem restringir o endpoint.
Os campos omitidos são tratados pelo servidor do ClickUp, sem padrões adicionais do cliente.

[Referência oficial](https://developer.clickup.com/reference/gettasks).

| Entrada | Tipo | Obrigatória |
| --- | --- | --- |
| `path.list_id` | `number` | sim |
| `query.archived` | `boolean` | não |
| `query.include_markdown_description` | `boolean` | não |
| `query.page` | `integer` | não |
| `query.order_by` | `string` | não |
| `query.reverse` | `boolean` | não |
| `query.subtasks` | `boolean` | não |
| `query.statuses` | `array` | não |
| `query.include_closed` | `boolean` | não |
| `query.include_timl` | `boolean` | não |
| `query.assignees` | `array` | não |
| `query.watchers` | `array` | não |
| `query.tags` | `array` | não |
| `query.due_date_gt` | `integer` | não |
| `query.due_date_lt` | `integer` | não |
| `query.date_created_gt` | `integer` | não |
| `query.date_created_lt` | `integer` | não |
| `query.date_updated_gt` | `integer` | não |
| `query.date_updated_lt` | `integer` | não |
| `query.date_done_gt` | `integer` | não |
| `query.date_done_lt` | `integer` | não |
| `query.custom_fields` | `array` | não |
| `query.custom_field` | `array` | não |
| `query.custom_items` | `array` | não |

O comando aceita as flags comuns de `api`: `--input`, `--path`, `--query`,
`--body`, `--body-file`, `--content-type`, `--file`, `--dry-run` e `--yes`.
A referência completa de tipos, campos aninhados e valores permitidos está no comando `describe` abaixo.

Exemplos:

Consulte o contrato antes de preencher os IDs reais:

```bash
clickupfy api describe v2-get-tasks
```

Valide uma entrada em arquivo sem enviar uma requisição:

```bash
clickupfy api v2-get-tasks --input entrada.json --dry-run
```

Use um envelope JSON pelo stdin:

```bash
printf '%s' '{"path":{"list_id":1}}' | clickupfy api v2-get-tasks --input -
```

Selecione o perfil que tem acesso ao recurso:

```bash
clickupfy --account produto api v2-get-tasks --input entrada.json
```

Grave a resposta JSON para conferência. O arquivo de entrada usa o envelope do exemplo anterior:

```bash
clickupfy --json api v2-get-tasks --input entrada.json > resposta.json
```

### `clickupfy_api_v2_get_tasks`

A operação `GetTasks` pertence ao grupo `Tasks` e usa
`GET /api/v2/list/{list_id}/task`.

A chamada consulta o recurso sem modificá-lo.

A resposta preserva o JSON da API; respostas sem corpo retornam `{}`.
A API key do perfil precisa ter acesso ao recurso. As permissões e o plano do Workspace podem restringir o endpoint.
Os campos omitidos são tratados pelo servidor do ClickUp, sem padrões adicionais do cliente.

[Referência oficial](https://developer.clickup.com/reference/gettasks).

| Entrada | Tipo | Obrigatória |
| --- | --- | --- |
| `path.list_id` | `number` | sim |
| `query.archived` | `boolean` | não |
| `query.include_markdown_description` | `boolean` | não |
| `query.page` | `integer` | não |
| `query.order_by` | `string` | não |
| `query.reverse` | `boolean` | não |
| `query.subtasks` | `boolean` | não |
| `query.statuses` | `array` | não |
| `query.include_closed` | `boolean` | não |
| `query.include_timl` | `boolean` | não |
| `query.assignees` | `array` | não |
| `query.watchers` | `array` | não |
| `query.tags` | `array` | não |
| `query.due_date_gt` | `integer` | não |
| `query.due_date_lt` | `integer` | não |
| `query.date_created_gt` | `integer` | não |
| `query.date_created_lt` | `integer` | não |
| `query.date_updated_gt` | `integer` | não |
| `query.date_updated_lt` | `integer` | não |
| `query.date_done_gt` | `integer` | não |
| `query.date_done_lt` | `integer` | não |
| `query.custom_fields` | `array` | não |
| `query.custom_field` | `array` | não |
| `query.custom_items` | `array` | não |

`account` é opcional e usa o perfil ativo ou fixado no MCP. O retorno aparece em
`content` como JSON; recusas retornam `isError: true`. Ferramentas de escrita
ficam ausentes em `--read-only`. IDs explícitos devem respeitar a hierarquia fixada.

Exemplos:

Use o perfil ativo com o envelope mínimo:

```json
{
  "name": "clickupfy_api_v2_get_tasks",
  "arguments": {
    "path": {
      "list_id": 1
    }
  }
}
```

Direcione a chamada ao perfil de desenvolvimento:

```json
{
  "name": "clickupfy_api_v2_get_tasks",
  "arguments": {
    "path": {
      "list_id": 1
    },
    "account": "dev"
  }
}
```

Use o perfil do produto, quando o MCP permitir selecionar outro perfil:

```json
{
  "name": "clickupfy_api_v2_get_tasks",
  "arguments": {
    "path": {
      "list_id": 1
    },
    "account": "produto"
  }
}
```

Consulte o schema antes de compor uma chamada pelo agente:

```bash
clickupfy api describe clickupfy_api_v2_get_tasks
```

Reproduza pelo CLI a entrada usada pelo agente, sem executar a operação:

```bash
printf '%s' '{"path":{"list_id":1}}' | clickupfy api v2-get-tasks --input - --dry-run
```

### `clickupfy api v2-create-task`

A operação `CreateTask` pertence ao grupo `Tasks` e usa
`POST /api/v2/list/{list_id}/task`.

A chamada altera o recurso indicado pelos parâmetros. Confira o resultado com a consulta correspondente antes de continuar.

A resposta preserva o JSON da API; respostas sem corpo retornam `{}`.
A API key do perfil precisa ter acesso ao recurso. As permissões e o plano do Workspace podem restringir o endpoint.
Os campos omitidos são tratados pelo servidor do ClickUp, sem padrões adicionais do cliente.

[Referência oficial](https://developer.clickup.com/reference/createtask).

| Entrada | Tipo | Obrigatória |
| --- | --- | --- |
| `path.list_id` | `number` | sim |
| `body` | objeto conforme `api describe` | sim |

O comando aceita as flags comuns de `api`: `--input`, `--path`, `--query`,
`--body`, `--body-file`, `--content-type`, `--file`, `--dry-run` e `--yes`.
A referência completa de tipos, campos aninhados e valores permitidos está no comando `describe` abaixo.

Exemplos:

Consulte o contrato antes de preencher os IDs reais:

```bash
clickupfy api describe v2-create-task
```

Valide uma entrada em arquivo sem enviar uma requisição:

```bash
clickupfy api v2-create-task --input entrada.json --dry-run
```

Use um envelope JSON pelo stdin:

```bash
printf '%s' '{"path":{"list_id":1},"body":{"name":"exemplo-1"}}' | clickupfy api v2-create-task --input -
```

Selecione o perfil que tem acesso ao recurso:

```bash
clickupfy --account produto api v2-create-task --input entrada.json
```

Grave a resposta JSON para conferência. O arquivo de entrada usa o envelope do exemplo anterior:

```bash
clickupfy --json api v2-create-task --input entrada.json > resposta.json
```

### `clickupfy_api_v2_create_task`

A operação `CreateTask` pertence ao grupo `Tasks` e usa
`POST /api/v2/list/{list_id}/task`.

A chamada altera o recurso indicado pelos parâmetros. Confira o resultado com a consulta correspondente antes de continuar.

A resposta preserva o JSON da API; respostas sem corpo retornam `{}`.
A API key do perfil precisa ter acesso ao recurso. As permissões e o plano do Workspace podem restringir o endpoint.
Os campos omitidos são tratados pelo servidor do ClickUp, sem padrões adicionais do cliente.

[Referência oficial](https://developer.clickup.com/reference/createtask).

| Entrada | Tipo | Obrigatória |
| --- | --- | --- |
| `path.list_id` | `number` | sim |
| `body` | objeto conforme `api describe` | sim |

`account` é opcional e usa o perfil ativo ou fixado no MCP. O retorno aparece em
`content` como JSON; recusas retornam `isError: true`. Ferramentas de escrita
ficam ausentes em `--read-only`. IDs explícitos devem respeitar a hierarquia fixada.

Exemplos:

Use o perfil ativo com o envelope mínimo:

```json
{
  "name": "clickupfy_api_v2_create_task",
  "arguments": {
    "path": {
      "list_id": 1
    },
    "body": {
      "name": "exemplo-1"
    }
  }
}
```

Direcione a chamada ao perfil de desenvolvimento:

```json
{
  "name": "clickupfy_api_v2_create_task",
  "arguments": {
    "path": {
      "list_id": 1
    },
    "body": {
      "name": "exemplo-1"
    },
    "account": "dev"
  }
}
```

Use o perfil do produto, quando o MCP permitir selecionar outro perfil:

```json
{
  "name": "clickupfy_api_v2_create_task",
  "arguments": {
    "path": {
      "list_id": 1
    },
    "body": {
      "name": "exemplo-1"
    },
    "account": "produto"
  }
}
```

Consulte o schema antes de compor uma chamada pelo agente:

```bash
clickupfy api describe clickupfy_api_v2_create_task
```

Reproduza pelo CLI a entrada usada pelo agente, sem executar a operação:

```bash
printf '%s' '{"path":{"list_id":1},"body":{"name":"exemplo-1"}}' | clickupfy api v2-create-task --input - --dry-run
```

### `clickupfy api v2-get-task`

A operação `GetTask` pertence ao grupo `Tasks` e usa
`GET /api/v2/task/{task_id}`.

A chamada consulta o recurso sem modificá-lo.

A resposta preserva o JSON da API; respostas sem corpo retornam `{}`.
A API key do perfil precisa ter acesso ao recurso. As permissões e o plano do Workspace podem restringir o endpoint.
Os campos omitidos são tratados pelo servidor do ClickUp, sem padrões adicionais do cliente.

[Referência oficial](https://developer.clickup.com/reference/gettask).

| Entrada | Tipo | Obrigatória |
| --- | --- | --- |
| `path.task_id` | `string` | sim |
| `query.custom_task_ids` | `boolean` | não |
| `query.team_id` | `number` | não |
| `query.include_subtasks` | `boolean` | não |
| `query.include_markdown_description` | `boolean` | não |
| `query.custom_fields` | `array` | não |

O comando aceita as flags comuns de `api`: `--input`, `--path`, `--query`,
`--body`, `--body-file`, `--content-type`, `--file`, `--dry-run` e `--yes`.
A referência completa de tipos, campos aninhados e valores permitidos está no comando `describe` abaixo.

Exemplos:

Consulte o contrato antes de preencher os IDs reais:

```bash
clickupfy api describe v2-get-task
```

Valide uma entrada em arquivo sem enviar uma requisição:

```bash
clickupfy api v2-get-task --input entrada.json --dry-run
```

Use um envelope JSON pelo stdin:

```bash
printf '%s' '{"path":{"task_id":"exemplo-1"}}' | clickupfy api v2-get-task --input -
```

Selecione o perfil que tem acesso ao recurso:

```bash
clickupfy --account produto api v2-get-task --input entrada.json
```

Grave a resposta JSON para conferência. O arquivo de entrada usa o envelope do exemplo anterior:

```bash
clickupfy --json api v2-get-task --input entrada.json > resposta.json
```

### `clickupfy_api_v2_get_task`

A operação `GetTask` pertence ao grupo `Tasks` e usa
`GET /api/v2/task/{task_id}`.

A chamada consulta o recurso sem modificá-lo.

A resposta preserva o JSON da API; respostas sem corpo retornam `{}`.
A API key do perfil precisa ter acesso ao recurso. As permissões e o plano do Workspace podem restringir o endpoint.
Os campos omitidos são tratados pelo servidor do ClickUp, sem padrões adicionais do cliente.

[Referência oficial](https://developer.clickup.com/reference/gettask).

| Entrada | Tipo | Obrigatória |
| --- | --- | --- |
| `path.task_id` | `string` | sim |
| `query.custom_task_ids` | `boolean` | não |
| `query.team_id` | `number` | não |
| `query.include_subtasks` | `boolean` | não |
| `query.include_markdown_description` | `boolean` | não |
| `query.custom_fields` | `array` | não |

`account` é opcional e usa o perfil ativo ou fixado no MCP. O retorno aparece em
`content` como JSON; recusas retornam `isError: true`. Ferramentas de escrita
ficam ausentes em `--read-only`. IDs explícitos devem respeitar a hierarquia fixada.

Exemplos:

Use o perfil ativo com o envelope mínimo:

```json
{
  "name": "clickupfy_api_v2_get_task",
  "arguments": {
    "path": {
      "task_id": "exemplo-1"
    }
  }
}
```

Direcione a chamada ao perfil de desenvolvimento:

```json
{
  "name": "clickupfy_api_v2_get_task",
  "arguments": {
    "path": {
      "task_id": "exemplo-1"
    },
    "account": "dev"
  }
}
```

Use o perfil do produto, quando o MCP permitir selecionar outro perfil:

```json
{
  "name": "clickupfy_api_v2_get_task",
  "arguments": {
    "path": {
      "task_id": "exemplo-1"
    },
    "account": "produto"
  }
}
```

Consulte o schema antes de compor uma chamada pelo agente:

```bash
clickupfy api describe clickupfy_api_v2_get_task
```

Reproduza pelo CLI a entrada usada pelo agente, sem executar a operação:

```bash
printf '%s' '{"path":{"task_id":"exemplo-1"}}' | clickupfy api v2-get-task --input - --dry-run
```

### `clickupfy api v2-update-task`

A operação `UpdateTask` pertence ao grupo `Tasks` e usa
`PUT /api/v2/task/{task_id}`.

A chamada altera o recurso indicado pelos parâmetros. Confira o resultado com a consulta correspondente antes de continuar.

A resposta preserva o JSON da API; respostas sem corpo retornam `{}`.
A API key do perfil precisa ter acesso ao recurso. As permissões e o plano do Workspace podem restringir o endpoint.
Os campos omitidos são tratados pelo servidor do ClickUp, sem padrões adicionais do cliente.

[Referência oficial](https://developer.clickup.com/reference/updatetask).

| Entrada | Tipo | Obrigatória |
| --- | --- | --- |
| `path.task_id` | `string` | sim |
| `query.custom_task_ids` | `boolean` | não |
| `query.team_id` | `number` | não |
| `body` | objeto conforme `api describe` | sim |

O comando aceita as flags comuns de `api`: `--input`, `--path`, `--query`,
`--body`, `--body-file`, `--content-type`, `--file`, `--dry-run` e `--yes`.
A referência completa de tipos, campos aninhados e valores permitidos está no comando `describe` abaixo.

Exemplos:

Consulte o contrato antes de preencher os IDs reais:

```bash
clickupfy api describe v2-update-task
```

Valide uma entrada em arquivo sem enviar uma requisição:

```bash
clickupfy api v2-update-task --input entrada.json --dry-run
```

Use um envelope JSON pelo stdin:

```bash
printf '%s' '{"path":{"task_id":"exemplo-1"},"body":{}}' | clickupfy api v2-update-task --input -
```

Selecione o perfil que tem acesso ao recurso:

```bash
clickupfy --account produto api v2-update-task --input entrada.json
```

Grave a resposta JSON para conferência. O arquivo de entrada usa o envelope do exemplo anterior:

```bash
clickupfy --json api v2-update-task --input entrada.json > resposta.json
```

### `clickupfy_api_v2_update_task`

A operação `UpdateTask` pertence ao grupo `Tasks` e usa
`PUT /api/v2/task/{task_id}`.

A chamada altera o recurso indicado pelos parâmetros. Confira o resultado com a consulta correspondente antes de continuar.

A resposta preserva o JSON da API; respostas sem corpo retornam `{}`.
A API key do perfil precisa ter acesso ao recurso. As permissões e o plano do Workspace podem restringir o endpoint.
Os campos omitidos são tratados pelo servidor do ClickUp, sem padrões adicionais do cliente.

[Referência oficial](https://developer.clickup.com/reference/updatetask).

| Entrada | Tipo | Obrigatória |
| --- | --- | --- |
| `path.task_id` | `string` | sim |
| `query.custom_task_ids` | `boolean` | não |
| `query.team_id` | `number` | não |
| `body` | objeto conforme `api describe` | sim |

`account` é opcional e usa o perfil ativo ou fixado no MCP. O retorno aparece em
`content` como JSON; recusas retornam `isError: true`. Ferramentas de escrita
ficam ausentes em `--read-only`. IDs explícitos devem respeitar a hierarquia fixada.

Exemplos:

Use o perfil ativo com o envelope mínimo:

```json
{
  "name": "clickupfy_api_v2_update_task",
  "arguments": {
    "path": {
      "task_id": "exemplo-1"
    },
    "body": {}
  }
}
```

Direcione a chamada ao perfil de desenvolvimento:

```json
{
  "name": "clickupfy_api_v2_update_task",
  "arguments": {
    "path": {
      "task_id": "exemplo-1"
    },
    "body": {},
    "account": "dev"
  }
}
```

Use o perfil do produto, quando o MCP permitir selecionar outro perfil:

```json
{
  "name": "clickupfy_api_v2_update_task",
  "arguments": {
    "path": {
      "task_id": "exemplo-1"
    },
    "body": {},
    "account": "produto"
  }
}
```

Consulte o schema antes de compor uma chamada pelo agente:

```bash
clickupfy api describe clickupfy_api_v2_update_task
```

Reproduza pelo CLI a entrada usada pelo agente, sem executar a operação:

```bash
printf '%s' '{"path":{"task_id":"exemplo-1"},"body":{}}' | clickupfy api v2-update-task --input - --dry-run
```

### `clickupfy api v2-delete-task`

A operação `DeleteTask` pertence ao grupo `Tasks` e usa
`DELETE /api/v2/task/{task_id}`.

A chamada altera o recurso indicado pelos parâmetros. Confira o resultado com a consulta correspondente antes de continuar.

A resposta preserva o JSON da API; respostas sem corpo retornam `{}`.
A API key do perfil precisa ter acesso ao recurso. As permissões e o plano do Workspace podem restringir o endpoint.
Os campos omitidos são tratados pelo servidor do ClickUp, sem padrões adicionais do cliente.

[Referência oficial](https://developer.clickup.com/reference/deletetask).

| Entrada | Tipo | Obrigatória |
| --- | --- | --- |
| `path.task_id` | `string` | sim |
| `query.custom_task_ids` | `boolean` | não |
| `query.team_id` | `number` | não |
| `confirm` | boolean, somente `true` | sim |

O comando aceita as flags comuns de `api`: `--input`, `--path`, `--query`,
`--body`, `--body-file`, `--content-type`, `--file`, `--dry-run` e `--yes`.
A referência completa de tipos, campos aninhados e valores permitidos está no comando `describe` abaixo.

Exemplos:

Consulte o contrato antes de preencher os IDs reais:

```bash
clickupfy api describe v2-delete-task
```

Valide uma entrada em arquivo sem enviar uma requisição:

```bash
clickupfy api v2-delete-task --input entrada.json --dry-run
```

Use um envelope JSON pelo stdin:

```bash
printf '%s' '{"path":{"task_id":"exemplo-1"},"confirm":true}' | clickupfy api v2-delete-task --input -
```

Selecione o perfil que tem acesso ao recurso:

```bash
clickupfy --account produto api v2-delete-task --input entrada.json
```

Grave a resposta JSON para conferência. O arquivo de entrada usa o envelope do exemplo anterior:

```bash
clickupfy --json api v2-delete-task --input entrada.json > resposta.json
```

### `clickupfy_api_v2_delete_task`

A operação `DeleteTask` pertence ao grupo `Tasks` e usa
`DELETE /api/v2/task/{task_id}`.

A chamada altera o recurso indicado pelos parâmetros. Confira o resultado com a consulta correspondente antes de continuar.

A resposta preserva o JSON da API; respostas sem corpo retornam `{}`.
A API key do perfil precisa ter acesso ao recurso. As permissões e o plano do Workspace podem restringir o endpoint.
Os campos omitidos são tratados pelo servidor do ClickUp, sem padrões adicionais do cliente.

[Referência oficial](https://developer.clickup.com/reference/deletetask).

| Entrada | Tipo | Obrigatória |
| --- | --- | --- |
| `path.task_id` | `string` | sim |
| `query.custom_task_ids` | `boolean` | não |
| `query.team_id` | `number` | não |
| `confirm` | boolean, somente `true` | sim |

`account` é opcional e usa o perfil ativo ou fixado no MCP. O retorno aparece em
`content` como JSON; recusas retornam `isError: true`. Ferramentas de escrita
ficam ausentes em `--read-only`. IDs explícitos devem respeitar a hierarquia fixada.

Exemplos:

Use o perfil ativo com o envelope mínimo:

```json
{
  "name": "clickupfy_api_v2_delete_task",
  "arguments": {
    "path": {
      "task_id": "exemplo-1"
    },
    "confirm": true
  }
}
```

Direcione a chamada ao perfil de desenvolvimento:

```json
{
  "name": "clickupfy_api_v2_delete_task",
  "arguments": {
    "path": {
      "task_id": "exemplo-1"
    },
    "confirm": true,
    "account": "dev"
  }
}
```

Use o perfil do produto, quando o MCP permitir selecionar outro perfil:

```json
{
  "name": "clickupfy_api_v2_delete_task",
  "arguments": {
    "path": {
      "task_id": "exemplo-1"
    },
    "confirm": true,
    "account": "produto"
  }
}
```

Consulte o schema antes de compor uma chamada pelo agente:

```bash
clickupfy api describe clickupfy_api_v2_delete_task
```

Reproduza pelo CLI a entrada usada pelo agente, sem executar a operação:

```bash
printf '%s' '{"path":{"task_id":"exemplo-1"},"confirm":true}' | clickupfy api v2-delete-task --input - --dry-run
```

### `clickupfy api v2-get-filtered-team-tasks`

A operação `GetFilteredTeamTasks` pertence ao grupo `Tasks` e usa
`GET /api/v2/team/{team_Id}/task`.

A chamada consulta o recurso sem modificá-lo.

A resposta preserva o JSON da API; respostas sem corpo retornam `{}`.
A API key do perfil precisa ter acesso ao recurso. As permissões e o plano do Workspace podem restringir o endpoint.
Os campos omitidos são tratados pelo servidor do ClickUp, sem padrões adicionais do cliente.

[Referência oficial](https://developer.clickup.com/reference/getfilteredteamtasks).

| Entrada | Tipo | Obrigatória |
| --- | --- | --- |
| `path.team_Id` | `number` | sim |
| `query.page` | `integer` | não |
| `query.order_by` | `string` | não |
| `query.reverse` | `boolean` | não |
| `query.subtasks` | `boolean` | não |
| `query.space_ids[]` | `array` | não |
| `query.project_ids[]` | `array` | não |
| `query.list_ids[]` | `array` | não |
| `query.statuses[]` | `array` | não |
| `query.include_closed` | `boolean` | não |
| `query.assignees[]` | `array` | não |
| `query.tags[]` | `array` | não |
| `query.due_date_gt` | `integer` | não |
| `query.due_date_lt` | `integer` | não |
| `query.date_created_gt` | `integer` | não |
| `query.date_created_lt` | `integer` | não |
| `query.date_updated_gt` | `integer` | não |
| `query.date_updated_lt` | `integer` | não |
| `query.date_done_gt` | `integer` | não |
| `query.date_done_lt` | `integer` | não |
| `query.custom_fields` | `array` | não |
| `query.parent` | `string` | não |
| `query.include_markdown_description` | `boolean` | não |
| `query.custom_items[]` | `array` | não |

O comando aceita as flags comuns de `api`: `--input`, `--path`, `--query`,
`--body`, `--body-file`, `--content-type`, `--file`, `--dry-run` e `--yes`.
A referência completa de tipos, campos aninhados e valores permitidos está no comando `describe` abaixo.

Exemplos:

Consulte o contrato antes de preencher os IDs reais:

```bash
clickupfy api describe v2-get-filtered-team-tasks
```

Valide uma entrada em arquivo sem enviar uma requisição:

```bash
clickupfy api v2-get-filtered-team-tasks --input entrada.json --dry-run
```

Use um envelope JSON pelo stdin:

```bash
printf '%s' '{"path":{"team_Id":1}}' | clickupfy api v2-get-filtered-team-tasks --input -
```

Selecione o perfil que tem acesso ao recurso:

```bash
clickupfy --account produto api v2-get-filtered-team-tasks --input entrada.json
```

Grave a resposta JSON para conferência. O arquivo de entrada usa o envelope do exemplo anterior:

```bash
clickupfy --json api v2-get-filtered-team-tasks --input entrada.json > resposta.json
```

### `clickupfy_api_v2_get_filtered_team_tasks`

A operação `GetFilteredTeamTasks` pertence ao grupo `Tasks` e usa
`GET /api/v2/team/{team_Id}/task`.

A chamada consulta o recurso sem modificá-lo.

A resposta preserva o JSON da API; respostas sem corpo retornam `{}`.
A API key do perfil precisa ter acesso ao recurso. As permissões e o plano do Workspace podem restringir o endpoint.
Os campos omitidos são tratados pelo servidor do ClickUp, sem padrões adicionais do cliente.

[Referência oficial](https://developer.clickup.com/reference/getfilteredteamtasks).

| Entrada | Tipo | Obrigatória |
| --- | --- | --- |
| `path.team_Id` | `number` | sim |
| `query.page` | `integer` | não |
| `query.order_by` | `string` | não |
| `query.reverse` | `boolean` | não |
| `query.subtasks` | `boolean` | não |
| `query.space_ids[]` | `array` | não |
| `query.project_ids[]` | `array` | não |
| `query.list_ids[]` | `array` | não |
| `query.statuses[]` | `array` | não |
| `query.include_closed` | `boolean` | não |
| `query.assignees[]` | `array` | não |
| `query.tags[]` | `array` | não |
| `query.due_date_gt` | `integer` | não |
| `query.due_date_lt` | `integer` | não |
| `query.date_created_gt` | `integer` | não |
| `query.date_created_lt` | `integer` | não |
| `query.date_updated_gt` | `integer` | não |
| `query.date_updated_lt` | `integer` | não |
| `query.date_done_gt` | `integer` | não |
| `query.date_done_lt` | `integer` | não |
| `query.custom_fields` | `array` | não |
| `query.parent` | `string` | não |
| `query.include_markdown_description` | `boolean` | não |
| `query.custom_items[]` | `array` | não |

`account` é opcional e usa o perfil ativo ou fixado no MCP. O retorno aparece em
`content` como JSON; recusas retornam `isError: true`. Ferramentas de escrita
ficam ausentes em `--read-only`. IDs explícitos devem respeitar a hierarquia fixada.

Exemplos:

Use o perfil ativo com o envelope mínimo:

```json
{
  "name": "clickupfy_api_v2_get_filtered_team_tasks",
  "arguments": {
    "path": {
      "team_Id": 1
    }
  }
}
```

Direcione a chamada ao perfil de desenvolvimento:

```json
{
  "name": "clickupfy_api_v2_get_filtered_team_tasks",
  "arguments": {
    "path": {
      "team_Id": 1
    },
    "account": "dev"
  }
}
```

Use o perfil do produto, quando o MCP permitir selecionar outro perfil:

```json
{
  "name": "clickupfy_api_v2_get_filtered_team_tasks",
  "arguments": {
    "path": {
      "team_Id": 1
    },
    "account": "produto"
  }
}
```

Consulte o schema antes de compor uma chamada pelo agente:

```bash
clickupfy api describe clickupfy_api_v2_get_filtered_team_tasks
```

Reproduza pelo CLI a entrada usada pelo agente, sem executar a operação:

```bash
printf '%s' '{"path":{"team_Id":1}}' | clickupfy api v2-get-filtered-team-tasks --input - --dry-run
```

### `clickupfy api v2-merge-tasks`

A operação `mergeTasks` pertence ao grupo `Tasks` e usa
`POST /api/v2/task/{task_id}/merge`.

A chamada altera o recurso indicado pelos parâmetros. Confira o resultado com a consulta correspondente antes de continuar.

A resposta preserva o JSON da API; respostas sem corpo retornam `{}`.
A API key do perfil precisa ter acesso ao recurso. As permissões e o plano do Workspace podem restringir o endpoint.
Os campos omitidos são tratados pelo servidor do ClickUp, sem padrões adicionais do cliente.

[Referência oficial](https://developer.clickup.com/reference/mergetasks).

| Entrada | Tipo | Obrigatória |
| --- | --- | --- |
| `path.task_id` | `string` | sim |
| `body` | objeto conforme `api describe` | sim |

O comando aceita as flags comuns de `api`: `--input`, `--path`, `--query`,
`--body`, `--body-file`, `--content-type`, `--file`, `--dry-run` e `--yes`.
A referência completa de tipos, campos aninhados e valores permitidos está no comando `describe` abaixo.

Exemplos:

Consulte o contrato antes de preencher os IDs reais:

```bash
clickupfy api describe v2-merge-tasks
```

Valide uma entrada em arquivo sem enviar uma requisição:

```bash
clickupfy api v2-merge-tasks --input entrada.json --dry-run
```

Use um envelope JSON pelo stdin:

```bash
printf '%s' '{"path":{"task_id":"exemplo-1"},"body":{"source_task_ids":["exemplo-1"]}}' | clickupfy api v2-merge-tasks --input -
```

Selecione o perfil que tem acesso ao recurso:

```bash
clickupfy --account produto api v2-merge-tasks --input entrada.json
```

Grave a resposta JSON para conferência. O arquivo de entrada usa o envelope do exemplo anterior:

```bash
clickupfy --json api v2-merge-tasks --input entrada.json > resposta.json
```

### `clickupfy_api_v2_merge_tasks`

A operação `mergeTasks` pertence ao grupo `Tasks` e usa
`POST /api/v2/task/{task_id}/merge`.

A chamada altera o recurso indicado pelos parâmetros. Confira o resultado com a consulta correspondente antes de continuar.

A resposta preserva o JSON da API; respostas sem corpo retornam `{}`.
A API key do perfil precisa ter acesso ao recurso. As permissões e o plano do Workspace podem restringir o endpoint.
Os campos omitidos são tratados pelo servidor do ClickUp, sem padrões adicionais do cliente.

[Referência oficial](https://developer.clickup.com/reference/mergetasks).

| Entrada | Tipo | Obrigatória |
| --- | --- | --- |
| `path.task_id` | `string` | sim |
| `body` | objeto conforme `api describe` | sim |

`account` é opcional e usa o perfil ativo ou fixado no MCP. O retorno aparece em
`content` como JSON; recusas retornam `isError: true`. Ferramentas de escrita
ficam ausentes em `--read-only`. IDs explícitos devem respeitar a hierarquia fixada.

Exemplos:

Use o perfil ativo com o envelope mínimo:

```json
{
  "name": "clickupfy_api_v2_merge_tasks",
  "arguments": {
    "path": {
      "task_id": "exemplo-1"
    },
    "body": {
      "source_task_ids": [
        "exemplo-1"
      ]
    }
  }
}
```

Direcione a chamada ao perfil de desenvolvimento:

```json
{
  "name": "clickupfy_api_v2_merge_tasks",
  "arguments": {
    "path": {
      "task_id": "exemplo-1"
    },
    "body": {
      "source_task_ids": [
        "exemplo-1"
      ]
    },
    "account": "dev"
  }
}
```

Use o perfil do produto, quando o MCP permitir selecionar outro perfil:

```json
{
  "name": "clickupfy_api_v2_merge_tasks",
  "arguments": {
    "path": {
      "task_id": "exemplo-1"
    },
    "body": {
      "source_task_ids": [
        "exemplo-1"
      ]
    },
    "account": "produto"
  }
}
```

Consulte o schema antes de compor uma chamada pelo agente:

```bash
clickupfy api describe clickupfy_api_v2_merge_tasks
```

Reproduza pelo CLI a entrada usada pelo agente, sem executar a operação:

```bash
printf '%s' '{"path":{"task_id":"exemplo-1"},"body":{"source_task_ids":["exemplo-1"]}}' | clickupfy api v2-merge-tasks --input - --dry-run
```

### `clickupfy api v2-get-task-s-timein-status`

A operação `GetTask'sTimeinStatus` pertence ao grupo `Tasks` e usa
`GET /api/v2/task/{task_id}/time_in_status`.

A chamada consulta o recurso sem modificá-lo.

A resposta preserva o JSON da API; respostas sem corpo retornam `{}`.
A API key do perfil precisa ter acesso ao recurso. As permissões e o plano do Workspace podem restringir o endpoint.
Os campos omitidos são tratados pelo servidor do ClickUp, sem padrões adicionais do cliente.

[Referência oficial](https://developer.clickup.com/reference/gettask'stimeinstatus).

| Entrada | Tipo | Obrigatória |
| --- | --- | --- |
| `path.task_id` | `string` | sim |
| `query.custom_task_ids` | `boolean` | não |
| `query.team_id` | `number` | não |

O comando aceita as flags comuns de `api`: `--input`, `--path`, `--query`,
`--body`, `--body-file`, `--content-type`, `--file`, `--dry-run` e `--yes`.
A referência completa de tipos, campos aninhados e valores permitidos está no comando `describe` abaixo.

Exemplos:

Consulte o contrato antes de preencher os IDs reais:

```bash
clickupfy api describe v2-get-task-s-timein-status
```

Valide uma entrada em arquivo sem enviar uma requisição:

```bash
clickupfy api v2-get-task-s-timein-status --input entrada.json --dry-run
```

Use um envelope JSON pelo stdin:

```bash
printf '%s' '{"path":{"task_id":"exemplo-1"}}' | clickupfy api v2-get-task-s-timein-status --input -
```

Selecione o perfil que tem acesso ao recurso:

```bash
clickupfy --account produto api v2-get-task-s-timein-status --input entrada.json
```

Grave a resposta JSON para conferência. O arquivo de entrada usa o envelope do exemplo anterior:

```bash
clickupfy --json api v2-get-task-s-timein-status --input entrada.json > resposta.json
```

### `clickupfy_api_v2_get_task_s_timein_status`

A operação `GetTask'sTimeinStatus` pertence ao grupo `Tasks` e usa
`GET /api/v2/task/{task_id}/time_in_status`.

A chamada consulta o recurso sem modificá-lo.

A resposta preserva o JSON da API; respostas sem corpo retornam `{}`.
A API key do perfil precisa ter acesso ao recurso. As permissões e o plano do Workspace podem restringir o endpoint.
Os campos omitidos são tratados pelo servidor do ClickUp, sem padrões adicionais do cliente.

[Referência oficial](https://developer.clickup.com/reference/gettask'stimeinstatus).

| Entrada | Tipo | Obrigatória |
| --- | --- | --- |
| `path.task_id` | `string` | sim |
| `query.custom_task_ids` | `boolean` | não |
| `query.team_id` | `number` | não |

`account` é opcional e usa o perfil ativo ou fixado no MCP. O retorno aparece em
`content` como JSON; recusas retornam `isError: true`. Ferramentas de escrita
ficam ausentes em `--read-only`. IDs explícitos devem respeitar a hierarquia fixada.

Exemplos:

Use o perfil ativo com o envelope mínimo:

```json
{
  "name": "clickupfy_api_v2_get_task_s_timein_status",
  "arguments": {
    "path": {
      "task_id": "exemplo-1"
    }
  }
}
```

Direcione a chamada ao perfil de desenvolvimento:

```json
{
  "name": "clickupfy_api_v2_get_task_s_timein_status",
  "arguments": {
    "path": {
      "task_id": "exemplo-1"
    },
    "account": "dev"
  }
}
```

Use o perfil do produto, quando o MCP permitir selecionar outro perfil:

```json
{
  "name": "clickupfy_api_v2_get_task_s_timein_status",
  "arguments": {
    "path": {
      "task_id": "exemplo-1"
    },
    "account": "produto"
  }
}
```

Consulte o schema antes de compor uma chamada pelo agente:

```bash
clickupfy api describe clickupfy_api_v2_get_task_s_timein_status
```

Reproduza pelo CLI a entrada usada pelo agente, sem executar a operação:

```bash
printf '%s' '{"path":{"task_id":"exemplo-1"}}' | clickupfy api v2-get-task-s-timein-status --input - --dry-run
```

### `clickupfy api v2-get-bulk-tasks-timein-status`

A operação `GetBulkTasks'TimeinStatus` pertence ao grupo `Tasks` e usa
`GET /api/v2/task/bulk_time_in_status/task_ids`.

A chamada consulta o recurso sem modificá-lo.

A resposta preserva o JSON da API; respostas sem corpo retornam `{}`.
A API key do perfil precisa ter acesso ao recurso. As permissões e o plano do Workspace podem restringir o endpoint.
Os campos omitidos são tratados pelo servidor do ClickUp, sem padrões adicionais do cliente.

[Referência oficial](https://developer.clickup.com/reference/getbulktasks'timeinstatus).

| Entrada | Tipo | Obrigatória |
| --- | --- | --- |
| `query.task_ids` | `string` | sim |
| `query.custom_task_ids` | `boolean` | não |
| `query.team_id` | `number` | não |

O comando aceita as flags comuns de `api`: `--input`, `--path`, `--query`,
`--body`, `--body-file`, `--content-type`, `--file`, `--dry-run` e `--yes`.
A referência completa de tipos, campos aninhados e valores permitidos está no comando `describe` abaixo.

Exemplos:

Consulte o contrato antes de preencher os IDs reais:

```bash
clickupfy api describe v2-get-bulk-tasks-timein-status
```

Valide uma entrada em arquivo sem enviar uma requisição:

```bash
clickupfy api v2-get-bulk-tasks-timein-status --input entrada.json --dry-run
```

Use um envelope JSON pelo stdin:

```bash
printf '%s' '{"query":{"task_ids":"exemplo-1"}}' | clickupfy api v2-get-bulk-tasks-timein-status --input -
```

Selecione o perfil que tem acesso ao recurso:

```bash
clickupfy --account produto api v2-get-bulk-tasks-timein-status --input entrada.json
```

Grave a resposta JSON para conferência. O arquivo de entrada usa o envelope do exemplo anterior:

```bash
clickupfy --json api v2-get-bulk-tasks-timein-status --input entrada.json > resposta.json
```

### `clickupfy_api_v2_get_bulk_tasks_timein_status`

A operação `GetBulkTasks'TimeinStatus` pertence ao grupo `Tasks` e usa
`GET /api/v2/task/bulk_time_in_status/task_ids`.

A chamada consulta o recurso sem modificá-lo.

A resposta preserva o JSON da API; respostas sem corpo retornam `{}`.
A API key do perfil precisa ter acesso ao recurso. As permissões e o plano do Workspace podem restringir o endpoint.
Os campos omitidos são tratados pelo servidor do ClickUp, sem padrões adicionais do cliente.

[Referência oficial](https://developer.clickup.com/reference/getbulktasks'timeinstatus).

| Entrada | Tipo | Obrigatória |
| --- | --- | --- |
| `query.task_ids` | `string` | sim |
| `query.custom_task_ids` | `boolean` | não |
| `query.team_id` | `number` | não |

`account` é opcional e usa o perfil ativo ou fixado no MCP. O retorno aparece em
`content` como JSON; recusas retornam `isError: true`. Ferramentas de escrita
ficam ausentes em `--read-only`. IDs explícitos devem respeitar a hierarquia fixada.

Exemplos:

Use o perfil ativo com o envelope mínimo:

```json
{
  "name": "clickupfy_api_v2_get_bulk_tasks_timein_status",
  "arguments": {
    "query": {
      "task_ids": "exemplo-1"
    }
  }
}
```

Direcione a chamada ao perfil de desenvolvimento:

```json
{
  "name": "clickupfy_api_v2_get_bulk_tasks_timein_status",
  "arguments": {
    "query": {
      "task_ids": "exemplo-1"
    },
    "account": "dev"
  }
}
```

Use o perfil do produto, quando o MCP permitir selecionar outro perfil:

```json
{
  "name": "clickupfy_api_v2_get_bulk_tasks_timein_status",
  "arguments": {
    "query": {
      "task_ids": "exemplo-1"
    },
    "account": "produto"
  }
}
```

Consulte o schema antes de compor uma chamada pelo agente:

```bash
clickupfy api describe clickupfy_api_v2_get_bulk_tasks_timein_status
```

Reproduza pelo CLI a entrada usada pelo agente, sem executar a operação:

```bash
printf '%s' '{"query":{"task_ids":"exemplo-1"}}' | clickupfy api v2-get-bulk-tasks-timein-status --input - --dry-run
```

### `clickupfy api v2-get-task-templates`

A operação `GetTaskTemplates` pertence ao grupo `Templates` e usa
`GET /api/v2/team/{team_id}/taskTemplate`.

A chamada consulta o recurso sem modificá-lo.

A resposta preserva o JSON da API; respostas sem corpo retornam `{}`.
A API key do perfil precisa ter acesso ao recurso. As permissões e o plano do Workspace podem restringir o endpoint.
Os campos omitidos são tratados pelo servidor do ClickUp, sem padrões adicionais do cliente.

[Referência oficial](https://developer.clickup.com/reference/gettasktemplates).

| Entrada | Tipo | Obrigatória |
| --- | --- | --- |
| `path.team_id` | `number` | sim |
| `query.page` | `integer` | sim |

O comando aceita as flags comuns de `api`: `--input`, `--path`, `--query`,
`--body`, `--body-file`, `--content-type`, `--file`, `--dry-run` e `--yes`.
A referência completa de tipos, campos aninhados e valores permitidos está no comando `describe` abaixo.

Exemplos:

Consulte o contrato antes de preencher os IDs reais:

```bash
clickupfy api describe v2-get-task-templates
```

Valide uma entrada em arquivo sem enviar uma requisição:

```bash
clickupfy api v2-get-task-templates --input entrada.json --dry-run
```

Use um envelope JSON pelo stdin:

```bash
printf '%s' '{"path":{"team_id":1},"query":{"page":1}}' | clickupfy api v2-get-task-templates --input -
```

Selecione o perfil que tem acesso ao recurso:

```bash
clickupfy --account produto api v2-get-task-templates --input entrada.json
```

Grave a resposta JSON para conferência. O arquivo de entrada usa o envelope do exemplo anterior:

```bash
clickupfy --json api v2-get-task-templates --input entrada.json > resposta.json
```

### `clickupfy_api_v2_get_task_templates`

A operação `GetTaskTemplates` pertence ao grupo `Templates` e usa
`GET /api/v2/team/{team_id}/taskTemplate`.

A chamada consulta o recurso sem modificá-lo.

A resposta preserva o JSON da API; respostas sem corpo retornam `{}`.
A API key do perfil precisa ter acesso ao recurso. As permissões e o plano do Workspace podem restringir o endpoint.
Os campos omitidos são tratados pelo servidor do ClickUp, sem padrões adicionais do cliente.

[Referência oficial](https://developer.clickup.com/reference/gettasktemplates).

| Entrada | Tipo | Obrigatória |
| --- | --- | --- |
| `path.team_id` | `number` | sim |
| `query.page` | `integer` | sim |

`account` é opcional e usa o perfil ativo ou fixado no MCP. O retorno aparece em
`content` como JSON; recusas retornam `isError: true`. Ferramentas de escrita
ficam ausentes em `--read-only`. IDs explícitos devem respeitar a hierarquia fixada.

Exemplos:

Use o perfil ativo com o envelope mínimo:

```json
{
  "name": "clickupfy_api_v2_get_task_templates",
  "arguments": {
    "path": {
      "team_id": 1
    },
    "query": {
      "page": 1
    }
  }
}
```

Direcione a chamada ao perfil de desenvolvimento:

```json
{
  "name": "clickupfy_api_v2_get_task_templates",
  "arguments": {
    "path": {
      "team_id": 1
    },
    "query": {
      "page": 1
    },
    "account": "dev"
  }
}
```

Use o perfil do produto, quando o MCP permitir selecionar outro perfil:

```json
{
  "name": "clickupfy_api_v2_get_task_templates",
  "arguments": {
    "path": {
      "team_id": 1
    },
    "query": {
      "page": 1
    },
    "account": "produto"
  }
}
```

Consulte o schema antes de compor uma chamada pelo agente:

```bash
clickupfy api describe clickupfy_api_v2_get_task_templates
```

Reproduza pelo CLI a entrada usada pelo agente, sem executar a operação:

```bash
printf '%s' '{"path":{"team_id":1},"query":{"page":1}}' | clickupfy api v2-get-task-templates --input - --dry-run
```

### `clickupfy api v2-get-list-templates`

A operação `GetListTemplates` pertence ao grupo `Templates` e usa
`GET /api/v2/team/{team_id}/list_template`.

A chamada consulta o recurso sem modificá-lo.

A resposta preserva o JSON da API; respostas sem corpo retornam `{}`.
A API key do perfil precisa ter acesso ao recurso. As permissões e o plano do Workspace podem restringir o endpoint.
Os campos omitidos são tratados pelo servidor do ClickUp, sem padrões adicionais do cliente.

[Referência oficial](https://developer.clickup.com/reference/getlisttemplates).

| Entrada | Tipo | Obrigatória |
| --- | --- | --- |
| `path.team_id` | `number` | sim |

O comando aceita as flags comuns de `api`: `--input`, `--path`, `--query`,
`--body`, `--body-file`, `--content-type`, `--file`, `--dry-run` e `--yes`.
A referência completa de tipos, campos aninhados e valores permitidos está no comando `describe` abaixo.

Exemplos:

Consulte o contrato antes de preencher os IDs reais:

```bash
clickupfy api describe v2-get-list-templates
```

Valide uma entrada em arquivo sem enviar uma requisição:

```bash
clickupfy api v2-get-list-templates --input entrada.json --dry-run
```

Use um envelope JSON pelo stdin:

```bash
printf '%s' '{"path":{"team_id":1}}' | clickupfy api v2-get-list-templates --input -
```

Selecione o perfil que tem acesso ao recurso:

```bash
clickupfy --account produto api v2-get-list-templates --input entrada.json
```

Grave a resposta JSON para conferência. O arquivo de entrada usa o envelope do exemplo anterior:

```bash
clickupfy --json api v2-get-list-templates --input entrada.json > resposta.json
```

### `clickupfy_api_v2_get_list_templates`

A operação `GetListTemplates` pertence ao grupo `Templates` e usa
`GET /api/v2/team/{team_id}/list_template`.

A chamada consulta o recurso sem modificá-lo.

A resposta preserva o JSON da API; respostas sem corpo retornam `{}`.
A API key do perfil precisa ter acesso ao recurso. As permissões e o plano do Workspace podem restringir o endpoint.
Os campos omitidos são tratados pelo servidor do ClickUp, sem padrões adicionais do cliente.

[Referência oficial](https://developer.clickup.com/reference/getlisttemplates).

| Entrada | Tipo | Obrigatória |
| --- | --- | --- |
| `path.team_id` | `number` | sim |

`account` é opcional e usa o perfil ativo ou fixado no MCP. O retorno aparece em
`content` como JSON; recusas retornam `isError: true`. Ferramentas de escrita
ficam ausentes em `--read-only`. IDs explícitos devem respeitar a hierarquia fixada.

Exemplos:

Use o perfil ativo com o envelope mínimo:

```json
{
  "name": "clickupfy_api_v2_get_list_templates",
  "arguments": {
    "path": {
      "team_id": 1
    }
  }
}
```

Direcione a chamada ao perfil de desenvolvimento:

```json
{
  "name": "clickupfy_api_v2_get_list_templates",
  "arguments": {
    "path": {
      "team_id": 1
    },
    "account": "dev"
  }
}
```

Use o perfil do produto, quando o MCP permitir selecionar outro perfil:

```json
{
  "name": "clickupfy_api_v2_get_list_templates",
  "arguments": {
    "path": {
      "team_id": 1
    },
    "account": "produto"
  }
}
```

Consulte o schema antes de compor uma chamada pelo agente:

```bash
clickupfy api describe clickupfy_api_v2_get_list_templates
```

Reproduza pelo CLI a entrada usada pelo agente, sem executar a operação:

```bash
printf '%s' '{"path":{"team_id":1}}' | clickupfy api v2-get-list-templates --input - --dry-run
```

### `clickupfy api v2-get-folder-templates`

A operação `GetFolderTemplates` pertence ao grupo `Templates` e usa
`GET /api/v2/team/{team_id}/folder_template`.

A chamada consulta o recurso sem modificá-lo.

A resposta preserva o JSON da API; respostas sem corpo retornam `{}`.
A API key do perfil precisa ter acesso ao recurso. As permissões e o plano do Workspace podem restringir o endpoint.
Os campos omitidos são tratados pelo servidor do ClickUp, sem padrões adicionais do cliente.

[Referência oficial](https://developer.clickup.com/reference/getfoldertemplates).

| Entrada | Tipo | Obrigatória |
| --- | --- | --- |
| `path.team_id` | `number` | sim |

O comando aceita as flags comuns de `api`: `--input`, `--path`, `--query`,
`--body`, `--body-file`, `--content-type`, `--file`, `--dry-run` e `--yes`.
A referência completa de tipos, campos aninhados e valores permitidos está no comando `describe` abaixo.

Exemplos:

Consulte o contrato antes de preencher os IDs reais:

```bash
clickupfy api describe v2-get-folder-templates
```

Valide uma entrada em arquivo sem enviar uma requisição:

```bash
clickupfy api v2-get-folder-templates --input entrada.json --dry-run
```

Use um envelope JSON pelo stdin:

```bash
printf '%s' '{"path":{"team_id":1}}' | clickupfy api v2-get-folder-templates --input -
```

Selecione o perfil que tem acesso ao recurso:

```bash
clickupfy --account produto api v2-get-folder-templates --input entrada.json
```

Grave a resposta JSON para conferência. O arquivo de entrada usa o envelope do exemplo anterior:

```bash
clickupfy --json api v2-get-folder-templates --input entrada.json > resposta.json
```

### `clickupfy_api_v2_get_folder_templates`

A operação `GetFolderTemplates` pertence ao grupo `Templates` e usa
`GET /api/v2/team/{team_id}/folder_template`.

A chamada consulta o recurso sem modificá-lo.

A resposta preserva o JSON da API; respostas sem corpo retornam `{}`.
A API key do perfil precisa ter acesso ao recurso. As permissões e o plano do Workspace podem restringir o endpoint.
Os campos omitidos são tratados pelo servidor do ClickUp, sem padrões adicionais do cliente.

[Referência oficial](https://developer.clickup.com/reference/getfoldertemplates).

| Entrada | Tipo | Obrigatória |
| --- | --- | --- |
| `path.team_id` | `number` | sim |

`account` é opcional e usa o perfil ativo ou fixado no MCP. O retorno aparece em
`content` como JSON; recusas retornam `isError: true`. Ferramentas de escrita
ficam ausentes em `--read-only`. IDs explícitos devem respeitar a hierarquia fixada.

Exemplos:

Use o perfil ativo com o envelope mínimo:

```json
{
  "name": "clickupfy_api_v2_get_folder_templates",
  "arguments": {
    "path": {
      "team_id": 1
    }
  }
}
```

Direcione a chamada ao perfil de desenvolvimento:

```json
{
  "name": "clickupfy_api_v2_get_folder_templates",
  "arguments": {
    "path": {
      "team_id": 1
    },
    "account": "dev"
  }
}
```

Use o perfil do produto, quando o MCP permitir selecionar outro perfil:

```json
{
  "name": "clickupfy_api_v2_get_folder_templates",
  "arguments": {
    "path": {
      "team_id": 1
    },
    "account": "produto"
  }
}
```

Consulte o schema antes de compor uma chamada pelo agente:

```bash
clickupfy api describe clickupfy_api_v2_get_folder_templates
```

Reproduza pelo CLI a entrada usada pelo agente, sem executar a operação:

```bash
printf '%s' '{"path":{"team_id":1}}' | clickupfy api v2-get-folder-templates --input - --dry-run
```

### `clickupfy api v2-create-task-from-template`

A operação `CreateTaskFromTemplate` pertence ao grupo `Tasks` e usa
`POST /api/v2/list/{list_id}/taskTemplate/{template_id}`.

A chamada altera o recurso indicado pelos parâmetros. Confira o resultado com a consulta correspondente antes de continuar.

A resposta preserva o JSON da API; respostas sem corpo retornam `{}`.
A API key do perfil precisa ter acesso ao recurso. As permissões e o plano do Workspace podem restringir o endpoint.
Os campos omitidos são tratados pelo servidor do ClickUp, sem padrões adicionais do cliente.

[Referência oficial](https://developer.clickup.com/reference/createtaskfromtemplate).

| Entrada | Tipo | Obrigatória |
| --- | --- | --- |
| `path.list_id` | `number` | sim |
| `path.template_id` | `string` | sim |
| `body` | objeto conforme `api describe` | sim |

O comando aceita as flags comuns de `api`: `--input`, `--path`, `--query`,
`--body`, `--body-file`, `--content-type`, `--file`, `--dry-run` e `--yes`.
A referência completa de tipos, campos aninhados e valores permitidos está no comando `describe` abaixo.

Exemplos:

Consulte o contrato antes de preencher os IDs reais:

```bash
clickupfy api describe v2-create-task-from-template
```

Valide uma entrada em arquivo sem enviar uma requisição:

```bash
clickupfy api v2-create-task-from-template --input entrada.json --dry-run
```

Use um envelope JSON pelo stdin:

```bash
printf '%s' '{"path":{"list_id":1,"template_id":"exemplo-1"},"body":{"name":"exemplo-1"}}' | clickupfy api v2-create-task-from-template --input -
```

Selecione o perfil que tem acesso ao recurso:

```bash
clickupfy --account produto api v2-create-task-from-template --input entrada.json
```

Grave a resposta JSON para conferência. O arquivo de entrada usa o envelope do exemplo anterior:

```bash
clickupfy --json api v2-create-task-from-template --input entrada.json > resposta.json
```

### `clickupfy_api_v2_create_task_from_template`

A operação `CreateTaskFromTemplate` pertence ao grupo `Tasks` e usa
`POST /api/v2/list/{list_id}/taskTemplate/{template_id}`.

A chamada altera o recurso indicado pelos parâmetros. Confira o resultado com a consulta correspondente antes de continuar.

A resposta preserva o JSON da API; respostas sem corpo retornam `{}`.
A API key do perfil precisa ter acesso ao recurso. As permissões e o plano do Workspace podem restringir o endpoint.
Os campos omitidos são tratados pelo servidor do ClickUp, sem padrões adicionais do cliente.

[Referência oficial](https://developer.clickup.com/reference/createtaskfromtemplate).

| Entrada | Tipo | Obrigatória |
| --- | --- | --- |
| `path.list_id` | `number` | sim |
| `path.template_id` | `string` | sim |
| `body` | objeto conforme `api describe` | sim |

`account` é opcional e usa o perfil ativo ou fixado no MCP. O retorno aparece em
`content` como JSON; recusas retornam `isError: true`. Ferramentas de escrita
ficam ausentes em `--read-only`. IDs explícitos devem respeitar a hierarquia fixada.

Exemplos:

Use o perfil ativo com o envelope mínimo:

```json
{
  "name": "clickupfy_api_v2_create_task_from_template",
  "arguments": {
    "path": {
      "list_id": 1,
      "template_id": "exemplo-1"
    },
    "body": {
      "name": "exemplo-1"
    }
  }
}
```

Direcione a chamada ao perfil de desenvolvimento:

```json
{
  "name": "clickupfy_api_v2_create_task_from_template",
  "arguments": {
    "path": {
      "list_id": 1,
      "template_id": "exemplo-1"
    },
    "body": {
      "name": "exemplo-1"
    },
    "account": "dev"
  }
}
```

Use o perfil do produto, quando o MCP permitir selecionar outro perfil:

```json
{
  "name": "clickupfy_api_v2_create_task_from_template",
  "arguments": {
    "path": {
      "list_id": 1,
      "template_id": "exemplo-1"
    },
    "body": {
      "name": "exemplo-1"
    },
    "account": "produto"
  }
}
```

Consulte o schema antes de compor uma chamada pelo agente:

```bash
clickupfy api describe clickupfy_api_v2_create_task_from_template
```

Reproduza pelo CLI a entrada usada pelo agente, sem executar a operação:

```bash
printf '%s' '{"path":{"list_id":1,"template_id":"exemplo-1"},"body":{"name":"exemplo-1"}}' | clickupfy api v2-create-task-from-template --input - --dry-run
```

### `clickupfy api v2-create-folder-list-from-template`

A operação `CreateFolderListFromTemplate` pertence ao grupo `Lists` e usa
`POST /api/v2/folder/{folder_id}/list_template/{template_id}`.

A chamada altera o recurso indicado pelos parâmetros. Confira o resultado com a consulta correspondente antes de continuar.

A resposta preserva o JSON da API; respostas sem corpo retornam `{}`.
A API key do perfil precisa ter acesso ao recurso. As permissões e o plano do Workspace podem restringir o endpoint.
Os campos omitidos são tratados pelo servidor do ClickUp, sem padrões adicionais do cliente.

[Referência oficial](https://developer.clickup.com/reference/createfolderlistfromtemplate).

| Entrada | Tipo | Obrigatória |
| --- | --- | --- |
| `path.folder_id` | `string` | sim |
| `path.template_id` | `string` | sim |
| `body` | objeto conforme `api describe` | sim |

O comando aceita as flags comuns de `api`: `--input`, `--path`, `--query`,
`--body`, `--body-file`, `--content-type`, `--file`, `--dry-run` e `--yes`.
A referência completa de tipos, campos aninhados e valores permitidos está no comando `describe` abaixo.

Exemplos:

Consulte o contrato antes de preencher os IDs reais:

```bash
clickupfy api describe v2-create-folder-list-from-template
```

Valide uma entrada em arquivo sem enviar uma requisição:

```bash
clickupfy api v2-create-folder-list-from-template --input entrada.json --dry-run
```

Use um envelope JSON pelo stdin:

```bash
printf '%s' '{"path":{"folder_id":"exemplo-1","template_id":"exemplo-1"},"body":{"name":"exemplo-1"}}' | clickupfy api v2-create-folder-list-from-template --input -
```

Selecione o perfil que tem acesso ao recurso:

```bash
clickupfy --account produto api v2-create-folder-list-from-template --input entrada.json
```

Grave a resposta JSON para conferência. O arquivo de entrada usa o envelope do exemplo anterior:

```bash
clickupfy --json api v2-create-folder-list-from-template --input entrada.json > resposta.json
```

### `clickupfy_api_v2_create_folder_list_from_template`

A operação `CreateFolderListFromTemplate` pertence ao grupo `Lists` e usa
`POST /api/v2/folder/{folder_id}/list_template/{template_id}`.

A chamada altera o recurso indicado pelos parâmetros. Confira o resultado com a consulta correspondente antes de continuar.

A resposta preserva o JSON da API; respostas sem corpo retornam `{}`.
A API key do perfil precisa ter acesso ao recurso. As permissões e o plano do Workspace podem restringir o endpoint.
Os campos omitidos são tratados pelo servidor do ClickUp, sem padrões adicionais do cliente.

[Referência oficial](https://developer.clickup.com/reference/createfolderlistfromtemplate).

| Entrada | Tipo | Obrigatória |
| --- | --- | --- |
| `path.folder_id` | `string` | sim |
| `path.template_id` | `string` | sim |
| `body` | objeto conforme `api describe` | sim |

`account` é opcional e usa o perfil ativo ou fixado no MCP. O retorno aparece em
`content` como JSON; recusas retornam `isError: true`. Ferramentas de escrita
ficam ausentes em `--read-only`. IDs explícitos devem respeitar a hierarquia fixada.

Exemplos:

Use o perfil ativo com o envelope mínimo:

```json
{
  "name": "clickupfy_api_v2_create_folder_list_from_template",
  "arguments": {
    "path": {
      "folder_id": "exemplo-1",
      "template_id": "exemplo-1"
    },
    "body": {
      "name": "exemplo-1"
    }
  }
}
```

Direcione a chamada ao perfil de desenvolvimento:

```json
{
  "name": "clickupfy_api_v2_create_folder_list_from_template",
  "arguments": {
    "path": {
      "folder_id": "exemplo-1",
      "template_id": "exemplo-1"
    },
    "body": {
      "name": "exemplo-1"
    },
    "account": "dev"
  }
}
```

Use o perfil do produto, quando o MCP permitir selecionar outro perfil:

```json
{
  "name": "clickupfy_api_v2_create_folder_list_from_template",
  "arguments": {
    "path": {
      "folder_id": "exemplo-1",
      "template_id": "exemplo-1"
    },
    "body": {
      "name": "exemplo-1"
    },
    "account": "produto"
  }
}
```

Consulte o schema antes de compor uma chamada pelo agente:

```bash
clickupfy api describe clickupfy_api_v2_create_folder_list_from_template
```

Reproduza pelo CLI a entrada usada pelo agente, sem executar a operação:

```bash
printf '%s' '{"path":{"folder_id":"exemplo-1","template_id":"exemplo-1"},"body":{"name":"exemplo-1"}}' | clickupfy api v2-create-folder-list-from-template --input - --dry-run
```

### `clickupfy api v2-create-space-list-from-template`

A operação `CreateSpaceListFromTemplate` pertence ao grupo `Lists` e usa
`POST /api/v2/space/{space_id}/list_template/{template_id}`.

A chamada altera o recurso indicado pelos parâmetros. Confira o resultado com a consulta correspondente antes de continuar.

A resposta preserva o JSON da API; respostas sem corpo retornam `{}`.
A API key do perfil precisa ter acesso ao recurso. As permissões e o plano do Workspace podem restringir o endpoint.
Os campos omitidos são tratados pelo servidor do ClickUp, sem padrões adicionais do cliente.

[Referência oficial](https://developer.clickup.com/reference/createspacelistfromtemplate).

| Entrada | Tipo | Obrigatória |
| --- | --- | --- |
| `path.space_id` | `string` | sim |
| `path.template_id` | `string` | sim |
| `body` | objeto conforme `api describe` | sim |

O comando aceita as flags comuns de `api`: `--input`, `--path`, `--query`,
`--body`, `--body-file`, `--content-type`, `--file`, `--dry-run` e `--yes`.
A referência completa de tipos, campos aninhados e valores permitidos está no comando `describe` abaixo.

Exemplos:

Consulte o contrato antes de preencher os IDs reais:

```bash
clickupfy api describe v2-create-space-list-from-template
```

Valide uma entrada em arquivo sem enviar uma requisição:

```bash
clickupfy api v2-create-space-list-from-template --input entrada.json --dry-run
```

Use um envelope JSON pelo stdin:

```bash
printf '%s' '{"path":{"space_id":"exemplo-1","template_id":"exemplo-1"},"body":{"name":"exemplo-1"}}' | clickupfy api v2-create-space-list-from-template --input -
```

Selecione o perfil que tem acesso ao recurso:

```bash
clickupfy --account produto api v2-create-space-list-from-template --input entrada.json
```

Grave a resposta JSON para conferência. O arquivo de entrada usa o envelope do exemplo anterior:

```bash
clickupfy --json api v2-create-space-list-from-template --input entrada.json > resposta.json
```

### `clickupfy_api_v2_create_space_list_from_template`

A operação `CreateSpaceListFromTemplate` pertence ao grupo `Lists` e usa
`POST /api/v2/space/{space_id}/list_template/{template_id}`.

A chamada altera o recurso indicado pelos parâmetros. Confira o resultado com a consulta correspondente antes de continuar.

A resposta preserva o JSON da API; respostas sem corpo retornam `{}`.
A API key do perfil precisa ter acesso ao recurso. As permissões e o plano do Workspace podem restringir o endpoint.
Os campos omitidos são tratados pelo servidor do ClickUp, sem padrões adicionais do cliente.

[Referência oficial](https://developer.clickup.com/reference/createspacelistfromtemplate).

| Entrada | Tipo | Obrigatória |
| --- | --- | --- |
| `path.space_id` | `string` | sim |
| `path.template_id` | `string` | sim |
| `body` | objeto conforme `api describe` | sim |

`account` é opcional e usa o perfil ativo ou fixado no MCP. O retorno aparece em
`content` como JSON; recusas retornam `isError: true`. Ferramentas de escrita
ficam ausentes em `--read-only`. IDs explícitos devem respeitar a hierarquia fixada.

Exemplos:

Use o perfil ativo com o envelope mínimo:

```json
{
  "name": "clickupfy_api_v2_create_space_list_from_template",
  "arguments": {
    "path": {
      "space_id": "exemplo-1",
      "template_id": "exemplo-1"
    },
    "body": {
      "name": "exemplo-1"
    }
  }
}
```

Direcione a chamada ao perfil de desenvolvimento:

```json
{
  "name": "clickupfy_api_v2_create_space_list_from_template",
  "arguments": {
    "path": {
      "space_id": "exemplo-1",
      "template_id": "exemplo-1"
    },
    "body": {
      "name": "exemplo-1"
    },
    "account": "dev"
  }
}
```

Use o perfil do produto, quando o MCP permitir selecionar outro perfil:

```json
{
  "name": "clickupfy_api_v2_create_space_list_from_template",
  "arguments": {
    "path": {
      "space_id": "exemplo-1",
      "template_id": "exemplo-1"
    },
    "body": {
      "name": "exemplo-1"
    },
    "account": "produto"
  }
}
```

Consulte o schema antes de compor uma chamada pelo agente:

```bash
clickupfy api describe clickupfy_api_v2_create_space_list_from_template
```

Reproduza pelo CLI a entrada usada pelo agente, sem executar a operação:

```bash
printf '%s' '{"path":{"space_id":"exemplo-1","template_id":"exemplo-1"},"body":{"name":"exemplo-1"}}' | clickupfy api v2-create-space-list-from-template --input - --dry-run
```

### `clickupfy api v2-get-workspaceseats`

A operação `GetWorkspaceseats` pertence ao grupo `Workspaces` e usa
`GET /api/v2/team/{team_id}/seats`.

A chamada consulta o recurso sem modificá-lo.

A resposta preserva o JSON da API; respostas sem corpo retornam `{}`.
A API key do perfil precisa ter acesso ao recurso. As permissões e o plano do Workspace podem restringir o endpoint.
Os campos omitidos são tratados pelo servidor do ClickUp, sem padrões adicionais do cliente.

[Referência oficial](https://developer.clickup.com/reference/getworkspaceseats).

| Entrada | Tipo | Obrigatória |
| --- | --- | --- |
| `path.team_id` | `string` | sim |

O comando aceita as flags comuns de `api`: `--input`, `--path`, `--query`,
`--body`, `--body-file`, `--content-type`, `--file`, `--dry-run` e `--yes`.
A referência completa de tipos, campos aninhados e valores permitidos está no comando `describe` abaixo.

Exemplos:

Consulte o contrato antes de preencher os IDs reais:

```bash
clickupfy api describe v2-get-workspaceseats
```

Valide uma entrada em arquivo sem enviar uma requisição:

```bash
clickupfy api v2-get-workspaceseats --input entrada.json --dry-run
```

Use um envelope JSON pelo stdin:

```bash
printf '%s' '{"path":{"team_id":"exemplo-1"}}' | clickupfy api v2-get-workspaceseats --input -
```

Selecione o perfil que tem acesso ao recurso:

```bash
clickupfy --account produto api v2-get-workspaceseats --input entrada.json
```

Grave a resposta JSON para conferência. O arquivo de entrada usa o envelope do exemplo anterior:

```bash
clickupfy --json api v2-get-workspaceseats --input entrada.json > resposta.json
```

### `clickupfy_api_v2_get_workspaceseats`

A operação `GetWorkspaceseats` pertence ao grupo `Workspaces` e usa
`GET /api/v2/team/{team_id}/seats`.

A chamada consulta o recurso sem modificá-lo.

A resposta preserva o JSON da API; respostas sem corpo retornam `{}`.
A API key do perfil precisa ter acesso ao recurso. As permissões e o plano do Workspace podem restringir o endpoint.
Os campos omitidos são tratados pelo servidor do ClickUp, sem padrões adicionais do cliente.

[Referência oficial](https://developer.clickup.com/reference/getworkspaceseats).

| Entrada | Tipo | Obrigatória |
| --- | --- | --- |
| `path.team_id` | `string` | sim |

`account` é opcional e usa o perfil ativo ou fixado no MCP. O retorno aparece em
`content` como JSON; recusas retornam `isError: true`. Ferramentas de escrita
ficam ausentes em `--read-only`. IDs explícitos devem respeitar a hierarquia fixada.

Exemplos:

Use o perfil ativo com o envelope mínimo:

```json
{
  "name": "clickupfy_api_v2_get_workspaceseats",
  "arguments": {
    "path": {
      "team_id": "exemplo-1"
    }
  }
}
```

Direcione a chamada ao perfil de desenvolvimento:

```json
{
  "name": "clickupfy_api_v2_get_workspaceseats",
  "arguments": {
    "path": {
      "team_id": "exemplo-1"
    },
    "account": "dev"
  }
}
```

Use o perfil do produto, quando o MCP permitir selecionar outro perfil:

```json
{
  "name": "clickupfy_api_v2_get_workspaceseats",
  "arguments": {
    "path": {
      "team_id": "exemplo-1"
    },
    "account": "produto"
  }
}
```

Consulte o schema antes de compor uma chamada pelo agente:

```bash
clickupfy api describe clickupfy_api_v2_get_workspaceseats
```

Reproduza pelo CLI a entrada usada pelo agente, sem executar a operação:

```bash
printf '%s' '{"path":{"team_id":"exemplo-1"}}' | clickupfy api v2-get-workspaceseats --input - --dry-run
```

### `clickupfy api v2-get-workspaceplan`

A operação `GetWorkspaceplan` pertence ao grupo `Workspaces` e usa
`GET /api/v2/team/{team_id}/plan`.

A chamada consulta o recurso sem modificá-lo.

A resposta preserva o JSON da API; respostas sem corpo retornam `{}`.
A API key do perfil precisa ter acesso ao recurso. As permissões e o plano do Workspace podem restringir o endpoint.
Os campos omitidos são tratados pelo servidor do ClickUp, sem padrões adicionais do cliente.

[Referência oficial](https://developer.clickup.com/reference/getworkspaceplan).

| Entrada | Tipo | Obrigatória |
| --- | --- | --- |
| `path.team_id` | `string` | sim |

O comando aceita as flags comuns de `api`: `--input`, `--path`, `--query`,
`--body`, `--body-file`, `--content-type`, `--file`, `--dry-run` e `--yes`.
A referência completa de tipos, campos aninhados e valores permitidos está no comando `describe` abaixo.

Exemplos:

Consulte o contrato antes de preencher os IDs reais:

```bash
clickupfy api describe v2-get-workspaceplan
```

Valide uma entrada em arquivo sem enviar uma requisição:

```bash
clickupfy api v2-get-workspaceplan --input entrada.json --dry-run
```

Use um envelope JSON pelo stdin:

```bash
printf '%s' '{"path":{"team_id":"exemplo-1"}}' | clickupfy api v2-get-workspaceplan --input -
```

Selecione o perfil que tem acesso ao recurso:

```bash
clickupfy --account produto api v2-get-workspaceplan --input entrada.json
```

Grave a resposta JSON para conferência. O arquivo de entrada usa o envelope do exemplo anterior:

```bash
clickupfy --json api v2-get-workspaceplan --input entrada.json > resposta.json
```

### `clickupfy_api_v2_get_workspaceplan`

A operação `GetWorkspaceplan` pertence ao grupo `Workspaces` e usa
`GET /api/v2/team/{team_id}/plan`.

A chamada consulta o recurso sem modificá-lo.

A resposta preserva o JSON da API; respostas sem corpo retornam `{}`.
A API key do perfil precisa ter acesso ao recurso. As permissões e o plano do Workspace podem restringir o endpoint.
Os campos omitidos são tratados pelo servidor do ClickUp, sem padrões adicionais do cliente.

[Referência oficial](https://developer.clickup.com/reference/getworkspaceplan).

| Entrada | Tipo | Obrigatória |
| --- | --- | --- |
| `path.team_id` | `string` | sim |

`account` é opcional e usa o perfil ativo ou fixado no MCP. O retorno aparece em
`content` como JSON; recusas retornam `isError: true`. Ferramentas de escrita
ficam ausentes em `--read-only`. IDs explícitos devem respeitar a hierarquia fixada.

Exemplos:

Use o perfil ativo com o envelope mínimo:

```json
{
  "name": "clickupfy_api_v2_get_workspaceplan",
  "arguments": {
    "path": {
      "team_id": "exemplo-1"
    }
  }
}
```

Direcione a chamada ao perfil de desenvolvimento:

```json
{
  "name": "clickupfy_api_v2_get_workspaceplan",
  "arguments": {
    "path": {
      "team_id": "exemplo-1"
    },
    "account": "dev"
  }
}
```

Use o perfil do produto, quando o MCP permitir selecionar outro perfil:

```json
{
  "name": "clickupfy_api_v2_get_workspaceplan",
  "arguments": {
    "path": {
      "team_id": "exemplo-1"
    },
    "account": "produto"
  }
}
```

Consulte o schema antes de compor uma chamada pelo agente:

```bash
clickupfy api describe clickupfy_api_v2_get_workspaceplan
```

Reproduza pelo CLI a entrada usada pelo agente, sem executar a operação:

```bash
printf '%s' '{"path":{"team_id":"exemplo-1"}}' | clickupfy api v2-get-workspaceplan --input - --dry-run
```

### `clickupfy api v2-create-user-group`

A operação `CreateUserGroup` pertence ao grupo `User Groups` e usa
`POST /api/v2/team/{team_id}/group`.

A chamada altera o recurso indicado pelos parâmetros. Confira o resultado com a consulta correspondente antes de continuar.

A resposta preserva o JSON da API; respostas sem corpo retornam `{}`.
A API key do perfil precisa ter acesso ao recurso. As permissões e o plano do Workspace podem restringir o endpoint.
Os campos omitidos são tratados pelo servidor do ClickUp, sem padrões adicionais do cliente.

[Referência oficial](https://developer.clickup.com/reference/createusergroup).

| Entrada | Tipo | Obrigatória |
| --- | --- | --- |
| `path.team_id` | `number` | sim |
| `body` | objeto conforme `api describe` | sim |

O comando aceita as flags comuns de `api`: `--input`, `--path`, `--query`,
`--body`, `--body-file`, `--content-type`, `--file`, `--dry-run` e `--yes`.
A referência completa de tipos, campos aninhados e valores permitidos está no comando `describe` abaixo.

Exemplos:

Consulte o contrato antes de preencher os IDs reais:

```bash
clickupfy api describe v2-create-user-group
```

Valide uma entrada em arquivo sem enviar uma requisição:

```bash
clickupfy api v2-create-user-group --input entrada.json --dry-run
```

Use um envelope JSON pelo stdin:

```bash
printf '%s' '{"path":{"team_id":1},"body":{"name":"exemplo-1","members":[1]}}' | clickupfy api v2-create-user-group --input -
```

Selecione o perfil que tem acesso ao recurso:

```bash
clickupfy --account produto api v2-create-user-group --input entrada.json
```

Grave a resposta JSON para conferência. O arquivo de entrada usa o envelope do exemplo anterior:

```bash
clickupfy --json api v2-create-user-group --input entrada.json > resposta.json
```

### `clickupfy_api_v2_create_user_group`

A operação `CreateUserGroup` pertence ao grupo `User Groups` e usa
`POST /api/v2/team/{team_id}/group`.

A chamada altera o recurso indicado pelos parâmetros. Confira o resultado com a consulta correspondente antes de continuar.

A resposta preserva o JSON da API; respostas sem corpo retornam `{}`.
A API key do perfil precisa ter acesso ao recurso. As permissões e o plano do Workspace podem restringir o endpoint.
Os campos omitidos são tratados pelo servidor do ClickUp, sem padrões adicionais do cliente.

[Referência oficial](https://developer.clickup.com/reference/createusergroup).

| Entrada | Tipo | Obrigatória |
| --- | --- | --- |
| `path.team_id` | `number` | sim |
| `body` | objeto conforme `api describe` | sim |

`account` é opcional e usa o perfil ativo ou fixado no MCP. O retorno aparece em
`content` como JSON; recusas retornam `isError: true`. Ferramentas de escrita
ficam ausentes em `--read-only`. IDs explícitos devem respeitar a hierarquia fixada.

Exemplos:

Use o perfil ativo com o envelope mínimo:

```json
{
  "name": "clickupfy_api_v2_create_user_group",
  "arguments": {
    "path": {
      "team_id": 1
    },
    "body": {
      "name": "exemplo-1",
      "members": [
        1
      ]
    }
  }
}
```

Direcione a chamada ao perfil de desenvolvimento:

```json
{
  "name": "clickupfy_api_v2_create_user_group",
  "arguments": {
    "path": {
      "team_id": 1
    },
    "body": {
      "name": "exemplo-1",
      "members": [
        1
      ]
    },
    "account": "dev"
  }
}
```

Use o perfil do produto, quando o MCP permitir selecionar outro perfil:

```json
{
  "name": "clickupfy_api_v2_create_user_group",
  "arguments": {
    "path": {
      "team_id": 1
    },
    "body": {
      "name": "exemplo-1",
      "members": [
        1
      ]
    },
    "account": "produto"
  }
}
```

Consulte o schema antes de compor uma chamada pelo agente:

```bash
clickupfy api describe clickupfy_api_v2_create_user_group
```

Reproduza pelo CLI a entrada usada pelo agente, sem executar a operação:

```bash
printf '%s' '{"path":{"team_id":1},"body":{"name":"exemplo-1","members":[1]}}' | clickupfy api v2-create-user-group --input - --dry-run
```

### `clickupfy api v2-get-custom-items`

A operação `GetCustomItems` pertence ao grupo `Custom Task Types` e usa
`GET /api/v2/team/{team_id}/custom_item`.

A chamada consulta o recurso sem modificá-lo.

A resposta preserva o JSON da API; respostas sem corpo retornam `{}`.
A API key do perfil precisa ter acesso ao recurso. As permissões e o plano do Workspace podem restringir o endpoint.
Os campos omitidos são tratados pelo servidor do ClickUp, sem padrões adicionais do cliente.

[Referência oficial](https://developer.clickup.com/reference/getcustomitems).

| Entrada | Tipo | Obrigatória |
| --- | --- | --- |
| `path.team_id` | `number` | sim |

O comando aceita as flags comuns de `api`: `--input`, `--path`, `--query`,
`--body`, `--body-file`, `--content-type`, `--file`, `--dry-run` e `--yes`.
A referência completa de tipos, campos aninhados e valores permitidos está no comando `describe` abaixo.

Exemplos:

Consulte o contrato antes de preencher os IDs reais:

```bash
clickupfy api describe v2-get-custom-items
```

Valide uma entrada em arquivo sem enviar uma requisição:

```bash
clickupfy api v2-get-custom-items --input entrada.json --dry-run
```

Use um envelope JSON pelo stdin:

```bash
printf '%s' '{"path":{"team_id":1}}' | clickupfy api v2-get-custom-items --input -
```

Selecione o perfil que tem acesso ao recurso:

```bash
clickupfy --account produto api v2-get-custom-items --input entrada.json
```

Grave a resposta JSON para conferência. O arquivo de entrada usa o envelope do exemplo anterior:

```bash
clickupfy --json api v2-get-custom-items --input entrada.json > resposta.json
```

### `clickupfy_api_v2_get_custom_items`

A operação `GetCustomItems` pertence ao grupo `Custom Task Types` e usa
`GET /api/v2/team/{team_id}/custom_item`.

A chamada consulta o recurso sem modificá-lo.

A resposta preserva o JSON da API; respostas sem corpo retornam `{}`.
A API key do perfil precisa ter acesso ao recurso. As permissões e o plano do Workspace podem restringir o endpoint.
Os campos omitidos são tratados pelo servidor do ClickUp, sem padrões adicionais do cliente.

[Referência oficial](https://developer.clickup.com/reference/getcustomitems).

| Entrada | Tipo | Obrigatória |
| --- | --- | --- |
| `path.team_id` | `number` | sim |

`account` é opcional e usa o perfil ativo ou fixado no MCP. O retorno aparece em
`content` como JSON; recusas retornam `isError: true`. Ferramentas de escrita
ficam ausentes em `--read-only`. IDs explícitos devem respeitar a hierarquia fixada.

Exemplos:

Use o perfil ativo com o envelope mínimo:

```json
{
  "name": "clickupfy_api_v2_get_custom_items",
  "arguments": {
    "path": {
      "team_id": 1
    }
  }
}
```

Direcione a chamada ao perfil de desenvolvimento:

```json
{
  "name": "clickupfy_api_v2_get_custom_items",
  "arguments": {
    "path": {
      "team_id": 1
    },
    "account": "dev"
  }
}
```

Use o perfil do produto, quando o MCP permitir selecionar outro perfil:

```json
{
  "name": "clickupfy_api_v2_get_custom_items",
  "arguments": {
    "path": {
      "team_id": 1
    },
    "account": "produto"
  }
}
```

Consulte o schema antes de compor uma chamada pelo agente:

```bash
clickupfy api describe clickupfy_api_v2_get_custom_items
```

Reproduza pelo CLI a entrada usada pelo agente, sem executar a operação:

```bash
printf '%s' '{"path":{"team_id":1}}' | clickupfy api v2-get-custom-items --input - --dry-run
```

### `clickupfy api v2-update-team`

A operação `UpdateTeam` pertence ao grupo `User Groups` e usa
`PUT /api/v2/group/{group_id}`.

A chamada altera o recurso indicado pelos parâmetros. Confira o resultado com a consulta correspondente antes de continuar.

A resposta preserva o JSON da API; respostas sem corpo retornam `{}`.
A API key do perfil precisa ter acesso ao recurso. As permissões e o plano do Workspace podem restringir o endpoint.
Os campos omitidos são tratados pelo servidor do ClickUp, sem padrões adicionais do cliente.

[Referência oficial](https://developer.clickup.com/reference/updateteam).

| Entrada | Tipo | Obrigatória |
| --- | --- | --- |
| `path.group_id` | `string` | sim |
| `body` | objeto conforme `api describe` | sim |

O comando aceita as flags comuns de `api`: `--input`, `--path`, `--query`,
`--body`, `--body-file`, `--content-type`, `--file`, `--dry-run` e `--yes`.
A referência completa de tipos, campos aninhados e valores permitidos está no comando `describe` abaixo.

Exemplos:

Consulte o contrato antes de preencher os IDs reais:

```bash
clickupfy api describe v2-update-team
```

Valide uma entrada em arquivo sem enviar uma requisição:

```bash
clickupfy api v2-update-team --input entrada.json --dry-run
```

Use um envelope JSON pelo stdin:

```bash
printf '%s' '{"path":{"group_id":"exemplo-1"},"body":{}}' | clickupfy api v2-update-team --input -
```

Selecione o perfil que tem acesso ao recurso:

```bash
clickupfy --account produto api v2-update-team --input entrada.json
```

Grave a resposta JSON para conferência. O arquivo de entrada usa o envelope do exemplo anterior:

```bash
clickupfy --json api v2-update-team --input entrada.json > resposta.json
```

### `clickupfy_api_v2_update_team`

A operação `UpdateTeam` pertence ao grupo `User Groups` e usa
`PUT /api/v2/group/{group_id}`.

A chamada altera o recurso indicado pelos parâmetros. Confira o resultado com a consulta correspondente antes de continuar.

A resposta preserva o JSON da API; respostas sem corpo retornam `{}`.
A API key do perfil precisa ter acesso ao recurso. As permissões e o plano do Workspace podem restringir o endpoint.
Os campos omitidos são tratados pelo servidor do ClickUp, sem padrões adicionais do cliente.

[Referência oficial](https://developer.clickup.com/reference/updateteam).

| Entrada | Tipo | Obrigatória |
| --- | --- | --- |
| `path.group_id` | `string` | sim |
| `body` | objeto conforme `api describe` | sim |

`account` é opcional e usa o perfil ativo ou fixado no MCP. O retorno aparece em
`content` como JSON; recusas retornam `isError: true`. Ferramentas de escrita
ficam ausentes em `--read-only`. IDs explícitos devem respeitar a hierarquia fixada.

Exemplos:

Use o perfil ativo com o envelope mínimo:

```json
{
  "name": "clickupfy_api_v2_update_team",
  "arguments": {
    "path": {
      "group_id": "exemplo-1"
    },
    "body": {}
  }
}
```

Direcione a chamada ao perfil de desenvolvimento:

```json
{
  "name": "clickupfy_api_v2_update_team",
  "arguments": {
    "path": {
      "group_id": "exemplo-1"
    },
    "body": {},
    "account": "dev"
  }
}
```

Use o perfil do produto, quando o MCP permitir selecionar outro perfil:

```json
{
  "name": "clickupfy_api_v2_update_team",
  "arguments": {
    "path": {
      "group_id": "exemplo-1"
    },
    "body": {},
    "account": "produto"
  }
}
```

Consulte o schema antes de compor uma chamada pelo agente:

```bash
clickupfy api describe clickupfy_api_v2_update_team
```

Reproduza pelo CLI a entrada usada pelo agente, sem executar a operação:

```bash
printf '%s' '{"path":{"group_id":"exemplo-1"},"body":{}}' | clickupfy api v2-update-team --input - --dry-run
```

### `clickupfy api v2-delete-team`

A operação `DeleteTeam` pertence ao grupo `User Groups` e usa
`DELETE /api/v2/group/{group_id}`.

A chamada altera o recurso indicado pelos parâmetros. Confira o resultado com a consulta correspondente antes de continuar.

A resposta preserva o JSON da API; respostas sem corpo retornam `{}`.
A API key do perfil precisa ter acesso ao recurso. As permissões e o plano do Workspace podem restringir o endpoint.
Os campos omitidos são tratados pelo servidor do ClickUp, sem padrões adicionais do cliente.

[Referência oficial](https://developer.clickup.com/reference/deleteteam).

| Entrada | Tipo | Obrigatória |
| --- | --- | --- |
| `path.group_id` | `string` | sim |
| `confirm` | boolean, somente `true` | sim |

O comando aceita as flags comuns de `api`: `--input`, `--path`, `--query`,
`--body`, `--body-file`, `--content-type`, `--file`, `--dry-run` e `--yes`.
A referência completa de tipos, campos aninhados e valores permitidos está no comando `describe` abaixo.

Exemplos:

Consulte o contrato antes de preencher os IDs reais:

```bash
clickupfy api describe v2-delete-team
```

Valide uma entrada em arquivo sem enviar uma requisição:

```bash
clickupfy api v2-delete-team --input entrada.json --dry-run
```

Use um envelope JSON pelo stdin:

```bash
printf '%s' '{"path":{"group_id":"exemplo-1"},"confirm":true}' | clickupfy api v2-delete-team --input -
```

Selecione o perfil que tem acesso ao recurso:

```bash
clickupfy --account produto api v2-delete-team --input entrada.json
```

Grave a resposta JSON para conferência. O arquivo de entrada usa o envelope do exemplo anterior:

```bash
clickupfy --json api v2-delete-team --input entrada.json > resposta.json
```

### `clickupfy_api_v2_delete_team`

A operação `DeleteTeam` pertence ao grupo `User Groups` e usa
`DELETE /api/v2/group/{group_id}`.

A chamada altera o recurso indicado pelos parâmetros. Confira o resultado com a consulta correspondente antes de continuar.

A resposta preserva o JSON da API; respostas sem corpo retornam `{}`.
A API key do perfil precisa ter acesso ao recurso. As permissões e o plano do Workspace podem restringir o endpoint.
Os campos omitidos são tratados pelo servidor do ClickUp, sem padrões adicionais do cliente.

[Referência oficial](https://developer.clickup.com/reference/deleteteam).

| Entrada | Tipo | Obrigatória |
| --- | --- | --- |
| `path.group_id` | `string` | sim |
| `confirm` | boolean, somente `true` | sim |

`account` é opcional e usa o perfil ativo ou fixado no MCP. O retorno aparece em
`content` como JSON; recusas retornam `isError: true`. Ferramentas de escrita
ficam ausentes em `--read-only`. IDs explícitos devem respeitar a hierarquia fixada.

Exemplos:

Use o perfil ativo com o envelope mínimo:

```json
{
  "name": "clickupfy_api_v2_delete_team",
  "arguments": {
    "path": {
      "group_id": "exemplo-1"
    },
    "confirm": true
  }
}
```

Direcione a chamada ao perfil de desenvolvimento:

```json
{
  "name": "clickupfy_api_v2_delete_team",
  "arguments": {
    "path": {
      "group_id": "exemplo-1"
    },
    "confirm": true,
    "account": "dev"
  }
}
```

Use o perfil do produto, quando o MCP permitir selecionar outro perfil:

```json
{
  "name": "clickupfy_api_v2_delete_team",
  "arguments": {
    "path": {
      "group_id": "exemplo-1"
    },
    "confirm": true,
    "account": "produto"
  }
}
```

Consulte o schema antes de compor uma chamada pelo agente:

```bash
clickupfy api describe clickupfy_api_v2_delete_team
```

Reproduza pelo CLI a entrada usada pelo agente, sem executar a operação:

```bash
printf '%s' '{"path":{"group_id":"exemplo-1"},"confirm":true}' | clickupfy api v2-delete-team --input - --dry-run
```

### `clickupfy api v2-get-teams1`

A operação `GetTeams1` pertence ao grupo `User Groups` e usa
`GET /api/v2/group`.

A chamada consulta o recurso sem modificá-lo.

A resposta preserva o JSON da API; respostas sem corpo retornam `{}`.
A API key do perfil precisa ter acesso ao recurso. As permissões e o plano do Workspace podem restringir o endpoint.
Os campos omitidos são tratados pelo servidor do ClickUp, sem padrões adicionais do cliente.

[Referência oficial](https://developer.clickup.com/reference/getteams1).

| Entrada | Tipo | Obrigatória |
| --- | --- | --- |
| `query.team_id` | `number` | sim |
| `query.group_ids` | `array` | não |

O comando aceita as flags comuns de `api`: `--input`, `--path`, `--query`,
`--body`, `--body-file`, `--content-type`, `--file`, `--dry-run` e `--yes`.
A referência completa de tipos, campos aninhados e valores permitidos está no comando `describe` abaixo.

Exemplos:

Consulte o contrato antes de preencher os IDs reais:

```bash
clickupfy api describe v2-get-teams1
```

Valide uma entrada em arquivo sem enviar uma requisição:

```bash
clickupfy api v2-get-teams1 --input entrada.json --dry-run
```

Use um envelope JSON pelo stdin:

```bash
printf '%s' '{"query":{"team_id":1}}' | clickupfy api v2-get-teams1 --input -
```

Selecione o perfil que tem acesso ao recurso:

```bash
clickupfy --account produto api v2-get-teams1 --input entrada.json
```

Grave a resposta JSON para conferência. O arquivo de entrada usa o envelope do exemplo anterior:

```bash
clickupfy --json api v2-get-teams1 --input entrada.json > resposta.json
```

### `clickupfy_api_v2_get_teams1`

A operação `GetTeams1` pertence ao grupo `User Groups` e usa
`GET /api/v2/group`.

A chamada consulta o recurso sem modificá-lo.

A resposta preserva o JSON da API; respostas sem corpo retornam `{}`.
A API key do perfil precisa ter acesso ao recurso. As permissões e o plano do Workspace podem restringir o endpoint.
Os campos omitidos são tratados pelo servidor do ClickUp, sem padrões adicionais do cliente.

[Referência oficial](https://developer.clickup.com/reference/getteams1).

| Entrada | Tipo | Obrigatória |
| --- | --- | --- |
| `query.team_id` | `number` | sim |
| `query.group_ids` | `array` | não |

`account` é opcional e usa o perfil ativo ou fixado no MCP. O retorno aparece em
`content` como JSON; recusas retornam `isError: true`. Ferramentas de escrita
ficam ausentes em `--read-only`. IDs explícitos devem respeitar a hierarquia fixada.

Exemplos:

Use o perfil ativo com o envelope mínimo:

```json
{
  "name": "clickupfy_api_v2_get_teams1",
  "arguments": {
    "query": {
      "team_id": 1
    }
  }
}
```

Direcione a chamada ao perfil de desenvolvimento:

```json
{
  "name": "clickupfy_api_v2_get_teams1",
  "arguments": {
    "query": {
      "team_id": 1
    },
    "account": "dev"
  }
}
```

Use o perfil do produto, quando o MCP permitir selecionar outro perfil:

```json
{
  "name": "clickupfy_api_v2_get_teams1",
  "arguments": {
    "query": {
      "team_id": 1
    },
    "account": "produto"
  }
}
```

Consulte o schema antes de compor uma chamada pelo agente:

```bash
clickupfy api describe clickupfy_api_v2_get_teams1
```

Reproduza pelo CLI a entrada usada pelo agente, sem executar a operação:

```bash
printf '%s' '{"query":{"team_id":1}}' | clickupfy api v2-get-teams1 --input - --dry-run
```

### `clickupfy api v2-gettrackedtime`

A operação `Gettrackedtime` pertence ao grupo `Time Tracking (Legacy)` e usa
`GET /api/v2/task/{task_id}/time`.

A chamada consulta o recurso sem modificá-lo.

A resposta preserva o JSON da API; respostas sem corpo retornam `{}`.
A API key do perfil precisa ter acesso ao recurso. As permissões e o plano do Workspace podem restringir o endpoint.
Os campos omitidos são tratados pelo servidor do ClickUp, sem padrões adicionais do cliente.

[Referência oficial](https://developer.clickup.com/reference/gettrackedtime).

| Entrada | Tipo | Obrigatória |
| --- | --- | --- |
| `path.task_id` | `string` | sim |
| `query.custom_task_ids` | `boolean` | não |
| `query.team_id` | `number` | não |

O comando aceita as flags comuns de `api`: `--input`, `--path`, `--query`,
`--body`, `--body-file`, `--content-type`, `--file`, `--dry-run` e `--yes`.
A referência completa de tipos, campos aninhados e valores permitidos está no comando `describe` abaixo.

Exemplos:

Consulte o contrato antes de preencher os IDs reais:

```bash
clickupfy api describe v2-gettrackedtime
```

Valide uma entrada em arquivo sem enviar uma requisição:

```bash
clickupfy api v2-gettrackedtime --input entrada.json --dry-run
```

Use um envelope JSON pelo stdin:

```bash
printf '%s' '{"path":{"task_id":"exemplo-1"}}' | clickupfy api v2-gettrackedtime --input -
```

Selecione o perfil que tem acesso ao recurso:

```bash
clickupfy --account produto api v2-gettrackedtime --input entrada.json
```

Grave a resposta JSON para conferência. O arquivo de entrada usa o envelope do exemplo anterior:

```bash
clickupfy --json api v2-gettrackedtime --input entrada.json > resposta.json
```

### `clickupfy_api_v2_gettrackedtime`

A operação `Gettrackedtime` pertence ao grupo `Time Tracking (Legacy)` e usa
`GET /api/v2/task/{task_id}/time`.

A chamada consulta o recurso sem modificá-lo.

A resposta preserva o JSON da API; respostas sem corpo retornam `{}`.
A API key do perfil precisa ter acesso ao recurso. As permissões e o plano do Workspace podem restringir o endpoint.
Os campos omitidos são tratados pelo servidor do ClickUp, sem padrões adicionais do cliente.

[Referência oficial](https://developer.clickup.com/reference/gettrackedtime).

| Entrada | Tipo | Obrigatória |
| --- | --- | --- |
| `path.task_id` | `string` | sim |
| `query.custom_task_ids` | `boolean` | não |
| `query.team_id` | `number` | não |

`account` é opcional e usa o perfil ativo ou fixado no MCP. O retorno aparece em
`content` como JSON; recusas retornam `isError: true`. Ferramentas de escrita
ficam ausentes em `--read-only`. IDs explícitos devem respeitar a hierarquia fixada.

Exemplos:

Use o perfil ativo com o envelope mínimo:

```json
{
  "name": "clickupfy_api_v2_gettrackedtime",
  "arguments": {
    "path": {
      "task_id": "exemplo-1"
    }
  }
}
```

Direcione a chamada ao perfil de desenvolvimento:

```json
{
  "name": "clickupfy_api_v2_gettrackedtime",
  "arguments": {
    "path": {
      "task_id": "exemplo-1"
    },
    "account": "dev"
  }
}
```

Use o perfil do produto, quando o MCP permitir selecionar outro perfil:

```json
{
  "name": "clickupfy_api_v2_gettrackedtime",
  "arguments": {
    "path": {
      "task_id": "exemplo-1"
    },
    "account": "produto"
  }
}
```

Consulte o schema antes de compor uma chamada pelo agente:

```bash
clickupfy api describe clickupfy_api_v2_gettrackedtime
```

Reproduza pelo CLI a entrada usada pelo agente, sem executar a operação:

```bash
printf '%s' '{"path":{"task_id":"exemplo-1"}}' | clickupfy api v2-gettrackedtime --input - --dry-run
```

### `clickupfy api v2-tracktime`

A operação `Tracktime` pertence ao grupo `Time Tracking (Legacy)` e usa
`POST /api/v2/task/{task_id}/time`.

A chamada altera o recurso indicado pelos parâmetros. Confira o resultado com a consulta correspondente antes de continuar.

A resposta preserva o JSON da API; respostas sem corpo retornam `{}`.
A API key do perfil precisa ter acesso ao recurso. As permissões e o plano do Workspace podem restringir o endpoint.
Os campos omitidos são tratados pelo servidor do ClickUp, sem padrões adicionais do cliente.

[Referência oficial](https://developer.clickup.com/reference/tracktime).

| Entrada | Tipo | Obrigatória |
| --- | --- | --- |
| `path.task_id` | `string` | sim |
| `query.custom_task_ids` | `boolean` | não |
| `query.team_id` | `number` | não |
| `body` | objeto conforme `api describe` | sim |

O comando aceita as flags comuns de `api`: `--input`, `--path`, `--query`,
`--body`, `--body-file`, `--content-type`, `--file`, `--dry-run` e `--yes`.
A referência completa de tipos, campos aninhados e valores permitidos está no comando `describe` abaixo.

Exemplos:

Consulte o contrato antes de preencher os IDs reais:

```bash
clickupfy api describe v2-tracktime
```

Valide uma entrada em arquivo sem enviar uma requisição:

```bash
clickupfy api v2-tracktime --input entrada.json --dry-run
```

Use um envelope JSON pelo stdin:

```bash
printf '%s' '{"path":{"task_id":"exemplo-1"},"body":{"start":1,"end":1,"time":1}}' | clickupfy api v2-tracktime --input -
```

Selecione o perfil que tem acesso ao recurso:

```bash
clickupfy --account produto api v2-tracktime --input entrada.json
```

Grave a resposta JSON para conferência. O arquivo de entrada usa o envelope do exemplo anterior:

```bash
clickupfy --json api v2-tracktime --input entrada.json > resposta.json
```

### `clickupfy_api_v2_tracktime`

A operação `Tracktime` pertence ao grupo `Time Tracking (Legacy)` e usa
`POST /api/v2/task/{task_id}/time`.

A chamada altera o recurso indicado pelos parâmetros. Confira o resultado com a consulta correspondente antes de continuar.

A resposta preserva o JSON da API; respostas sem corpo retornam `{}`.
A API key do perfil precisa ter acesso ao recurso. As permissões e o plano do Workspace podem restringir o endpoint.
Os campos omitidos são tratados pelo servidor do ClickUp, sem padrões adicionais do cliente.

[Referência oficial](https://developer.clickup.com/reference/tracktime).

| Entrada | Tipo | Obrigatória |
| --- | --- | --- |
| `path.task_id` | `string` | sim |
| `query.custom_task_ids` | `boolean` | não |
| `query.team_id` | `number` | não |
| `body` | objeto conforme `api describe` | sim |

`account` é opcional e usa o perfil ativo ou fixado no MCP. O retorno aparece em
`content` como JSON; recusas retornam `isError: true`. Ferramentas de escrita
ficam ausentes em `--read-only`. IDs explícitos devem respeitar a hierarquia fixada.

Exemplos:

Use o perfil ativo com o envelope mínimo:

```json
{
  "name": "clickupfy_api_v2_tracktime",
  "arguments": {
    "path": {
      "task_id": "exemplo-1"
    },
    "body": {
      "start": 1,
      "end": 1,
      "time": 1
    }
  }
}
```

Direcione a chamada ao perfil de desenvolvimento:

```json
{
  "name": "clickupfy_api_v2_tracktime",
  "arguments": {
    "path": {
      "task_id": "exemplo-1"
    },
    "body": {
      "start": 1,
      "end": 1,
      "time": 1
    },
    "account": "dev"
  }
}
```

Use o perfil do produto, quando o MCP permitir selecionar outro perfil:

```json
{
  "name": "clickupfy_api_v2_tracktime",
  "arguments": {
    "path": {
      "task_id": "exemplo-1"
    },
    "body": {
      "start": 1,
      "end": 1,
      "time": 1
    },
    "account": "produto"
  }
}
```

Consulte o schema antes de compor uma chamada pelo agente:

```bash
clickupfy api describe clickupfy_api_v2_tracktime
```

Reproduza pelo CLI a entrada usada pelo agente, sem executar a operação:

```bash
printf '%s' '{"path":{"task_id":"exemplo-1"},"body":{"start":1,"end":1,"time":1}}' | clickupfy api v2-tracktime --input - --dry-run
```

### `clickupfy api v2-edittimetracked`

A operação `Edittimetracked` pertence ao grupo `Time Tracking (Legacy)` e usa
`PUT /api/v2/task/{task_id}/time/{interval_id}`.

A chamada altera o recurso indicado pelos parâmetros. Confira o resultado com a consulta correspondente antes de continuar.

A resposta preserva o JSON da API; respostas sem corpo retornam `{}`.
A API key do perfil precisa ter acesso ao recurso. As permissões e o plano do Workspace podem restringir o endpoint.
Os campos omitidos são tratados pelo servidor do ClickUp, sem padrões adicionais do cliente.

[Referência oficial](https://developer.clickup.com/reference/edittimetracked).

| Entrada | Tipo | Obrigatória |
| --- | --- | --- |
| `path.task_id` | `string` | sim |
| `path.interval_id` | `string` | sim |
| `query.custom_task_ids` | `boolean` | não |
| `query.team_id` | `number` | não |
| `body` | objeto conforme `api describe` | sim |

O comando aceita as flags comuns de `api`: `--input`, `--path`, `--query`,
`--body`, `--body-file`, `--content-type`, `--file`, `--dry-run` e `--yes`.
A referência completa de tipos, campos aninhados e valores permitidos está no comando `describe` abaixo.

Exemplos:

Consulte o contrato antes de preencher os IDs reais:

```bash
clickupfy api describe v2-edittimetracked
```

Valide uma entrada em arquivo sem enviar uma requisição:

```bash
clickupfy api v2-edittimetracked --input entrada.json --dry-run
```

Use um envelope JSON pelo stdin:

```bash
printf '%s' '{"path":{"task_id":"exemplo-1","interval_id":"exemplo-1"},"body":{"start":1,"end":1,"time":1}}' | clickupfy api v2-edittimetracked --input -
```

Selecione o perfil que tem acesso ao recurso:

```bash
clickupfy --account produto api v2-edittimetracked --input entrada.json
```

Grave a resposta JSON para conferência. O arquivo de entrada usa o envelope do exemplo anterior:

```bash
clickupfy --json api v2-edittimetracked --input entrada.json > resposta.json
```

### `clickupfy_api_v2_edittimetracked`

A operação `Edittimetracked` pertence ao grupo `Time Tracking (Legacy)` e usa
`PUT /api/v2/task/{task_id}/time/{interval_id}`.

A chamada altera o recurso indicado pelos parâmetros. Confira o resultado com a consulta correspondente antes de continuar.

A resposta preserva o JSON da API; respostas sem corpo retornam `{}`.
A API key do perfil precisa ter acesso ao recurso. As permissões e o plano do Workspace podem restringir o endpoint.
Os campos omitidos são tratados pelo servidor do ClickUp, sem padrões adicionais do cliente.

[Referência oficial](https://developer.clickup.com/reference/edittimetracked).

| Entrada | Tipo | Obrigatória |
| --- | --- | --- |
| `path.task_id` | `string` | sim |
| `path.interval_id` | `string` | sim |
| `query.custom_task_ids` | `boolean` | não |
| `query.team_id` | `number` | não |
| `body` | objeto conforme `api describe` | sim |

`account` é opcional e usa o perfil ativo ou fixado no MCP. O retorno aparece em
`content` como JSON; recusas retornam `isError: true`. Ferramentas de escrita
ficam ausentes em `--read-only`. IDs explícitos devem respeitar a hierarquia fixada.

Exemplos:

Use o perfil ativo com o envelope mínimo:

```json
{
  "name": "clickupfy_api_v2_edittimetracked",
  "arguments": {
    "path": {
      "task_id": "exemplo-1",
      "interval_id": "exemplo-1"
    },
    "body": {
      "start": 1,
      "end": 1,
      "time": 1
    }
  }
}
```

Direcione a chamada ao perfil de desenvolvimento:

```json
{
  "name": "clickupfy_api_v2_edittimetracked",
  "arguments": {
    "path": {
      "task_id": "exemplo-1",
      "interval_id": "exemplo-1"
    },
    "body": {
      "start": 1,
      "end": 1,
      "time": 1
    },
    "account": "dev"
  }
}
```

Use o perfil do produto, quando o MCP permitir selecionar outro perfil:

```json
{
  "name": "clickupfy_api_v2_edittimetracked",
  "arguments": {
    "path": {
      "task_id": "exemplo-1",
      "interval_id": "exemplo-1"
    },
    "body": {
      "start": 1,
      "end": 1,
      "time": 1
    },
    "account": "produto"
  }
}
```

Consulte o schema antes de compor uma chamada pelo agente:

```bash
clickupfy api describe clickupfy_api_v2_edittimetracked
```

Reproduza pelo CLI a entrada usada pelo agente, sem executar a operação:

```bash
printf '%s' '{"path":{"task_id":"exemplo-1","interval_id":"exemplo-1"},"body":{"start":1,"end":1,"time":1}}' | clickupfy api v2-edittimetracked --input - --dry-run
```

### `clickupfy api v2-deletetimetracked`

A operação `Deletetimetracked` pertence ao grupo `Time Tracking (Legacy)` e usa
`DELETE /api/v2/task/{task_id}/time/{interval_id}`.

A chamada altera o recurso indicado pelos parâmetros. Confira o resultado com a consulta correspondente antes de continuar.

A resposta preserva o JSON da API; respostas sem corpo retornam `{}`.
A API key do perfil precisa ter acesso ao recurso. As permissões e o plano do Workspace podem restringir o endpoint.
Os campos omitidos são tratados pelo servidor do ClickUp, sem padrões adicionais do cliente.

[Referência oficial](https://developer.clickup.com/reference/deletetimetracked).

| Entrada | Tipo | Obrigatória |
| --- | --- | --- |
| `path.task_id` | `string` | sim |
| `path.interval_id` | `string` | sim |
| `query.custom_task_ids` | `boolean` | não |
| `query.team_id` | `number` | não |
| `confirm` | boolean, somente `true` | sim |

O comando aceita as flags comuns de `api`: `--input`, `--path`, `--query`,
`--body`, `--body-file`, `--content-type`, `--file`, `--dry-run` e `--yes`.
A referência completa de tipos, campos aninhados e valores permitidos está no comando `describe` abaixo.

Exemplos:

Consulte o contrato antes de preencher os IDs reais:

```bash
clickupfy api describe v2-deletetimetracked
```

Valide uma entrada em arquivo sem enviar uma requisição:

```bash
clickupfy api v2-deletetimetracked --input entrada.json --dry-run
```

Use um envelope JSON pelo stdin:

```bash
printf '%s' '{"path":{"task_id":"exemplo-1","interval_id":"exemplo-1"},"confirm":true}' | clickupfy api v2-deletetimetracked --input -
```

Selecione o perfil que tem acesso ao recurso:

```bash
clickupfy --account produto api v2-deletetimetracked --input entrada.json
```

Grave a resposta JSON para conferência. O arquivo de entrada usa o envelope do exemplo anterior:

```bash
clickupfy --json api v2-deletetimetracked --input entrada.json > resposta.json
```

### `clickupfy_api_v2_deletetimetracked`

A operação `Deletetimetracked` pertence ao grupo `Time Tracking (Legacy)` e usa
`DELETE /api/v2/task/{task_id}/time/{interval_id}`.

A chamada altera o recurso indicado pelos parâmetros. Confira o resultado com a consulta correspondente antes de continuar.

A resposta preserva o JSON da API; respostas sem corpo retornam `{}`.
A API key do perfil precisa ter acesso ao recurso. As permissões e o plano do Workspace podem restringir o endpoint.
Os campos omitidos são tratados pelo servidor do ClickUp, sem padrões adicionais do cliente.

[Referência oficial](https://developer.clickup.com/reference/deletetimetracked).

| Entrada | Tipo | Obrigatória |
| --- | --- | --- |
| `path.task_id` | `string` | sim |
| `path.interval_id` | `string` | sim |
| `query.custom_task_ids` | `boolean` | não |
| `query.team_id` | `number` | não |
| `confirm` | boolean, somente `true` | sim |

`account` é opcional e usa o perfil ativo ou fixado no MCP. O retorno aparece em
`content` como JSON; recusas retornam `isError: true`. Ferramentas de escrita
ficam ausentes em `--read-only`. IDs explícitos devem respeitar a hierarquia fixada.

Exemplos:

Use o perfil ativo com o envelope mínimo:

```json
{
  "name": "clickupfy_api_v2_deletetimetracked",
  "arguments": {
    "path": {
      "task_id": "exemplo-1",
      "interval_id": "exemplo-1"
    },
    "confirm": true
  }
}
```

Direcione a chamada ao perfil de desenvolvimento:

```json
{
  "name": "clickupfy_api_v2_deletetimetracked",
  "arguments": {
    "path": {
      "task_id": "exemplo-1",
      "interval_id": "exemplo-1"
    },
    "confirm": true,
    "account": "dev"
  }
}
```

Use o perfil do produto, quando o MCP permitir selecionar outro perfil:

```json
{
  "name": "clickupfy_api_v2_deletetimetracked",
  "arguments": {
    "path": {
      "task_id": "exemplo-1",
      "interval_id": "exemplo-1"
    },
    "confirm": true,
    "account": "produto"
  }
}
```

Consulte o schema antes de compor uma chamada pelo agente:

```bash
clickupfy api describe clickupfy_api_v2_deletetimetracked
```

Reproduza pelo CLI a entrada usada pelo agente, sem executar a operação:

```bash
printf '%s' '{"path":{"task_id":"exemplo-1","interval_id":"exemplo-1"},"confirm":true}' | clickupfy api v2-deletetimetracked --input - --dry-run
```

### `clickupfy api v2-gettimeentrieswithinadaterange`

A operação `Gettimeentrieswithinadaterange` pertence ao grupo `Time Tracking` e usa
`GET /api/v2/team/{team_Id}/time_entries`.

A chamada consulta o recurso sem modificá-lo.

A resposta preserva o JSON da API; respostas sem corpo retornam `{}`.
A API key do perfil precisa ter acesso ao recurso. As permissões e o plano do Workspace podem restringir o endpoint.
Os campos omitidos são tratados pelo servidor do ClickUp, sem padrões adicionais do cliente.

[Referência oficial](https://developer.clickup.com/reference/gettimeentrieswithinadaterange).

| Entrada | Tipo | Obrigatória |
| --- | --- | --- |
| `path.team_Id` | `number` | sim |
| `query.start_date` | `number` | não |
| `query.end_date` | `number` | não |
| `query.assignee` | `number` | não |
| `query.include_task_tags` | `boolean` | não |
| `query.include_location_names` | `boolean` | não |
| `query.include_approval_history` | `boolean` | não |
| `query.include_approval_details` | `boolean` | não |
| `query.space_id` | `number` | não |
| `query.folder_id` | `number` | não |
| `query.list_id` | `number` | não |
| `query.task_id` | `string` | não |
| `query.custom_task_ids` | `boolean` | não |
| `query.team_id` | `number` | não |
| `query.is_billable` | `boolean` | não |

O comando aceita as flags comuns de `api`: `--input`, `--path`, `--query`,
`--body`, `--body-file`, `--content-type`, `--file`, `--dry-run` e `--yes`.
A referência completa de tipos, campos aninhados e valores permitidos está no comando `describe` abaixo.

Exemplos:

Consulte o contrato antes de preencher os IDs reais:

```bash
clickupfy api describe v2-gettimeentrieswithinadaterange
```

Valide uma entrada em arquivo sem enviar uma requisição:

```bash
clickupfy api v2-gettimeentrieswithinadaterange --input entrada.json --dry-run
```

Use um envelope JSON pelo stdin:

```bash
printf '%s' '{"path":{"team_Id":1}}' | clickupfy api v2-gettimeentrieswithinadaterange --input -
```

Selecione o perfil que tem acesso ao recurso:

```bash
clickupfy --account produto api v2-gettimeentrieswithinadaterange --input entrada.json
```

Grave a resposta JSON para conferência. O arquivo de entrada usa o envelope do exemplo anterior:

```bash
clickupfy --json api v2-gettimeentrieswithinadaterange --input entrada.json > resposta.json
```

### `clickupfy_api_v2_gettimeentrieswithinadaterange`

A operação `Gettimeentrieswithinadaterange` pertence ao grupo `Time Tracking` e usa
`GET /api/v2/team/{team_Id}/time_entries`.

A chamada consulta o recurso sem modificá-lo.

A resposta preserva o JSON da API; respostas sem corpo retornam `{}`.
A API key do perfil precisa ter acesso ao recurso. As permissões e o plano do Workspace podem restringir o endpoint.
Os campos omitidos são tratados pelo servidor do ClickUp, sem padrões adicionais do cliente.

[Referência oficial](https://developer.clickup.com/reference/gettimeentrieswithinadaterange).

| Entrada | Tipo | Obrigatória |
| --- | --- | --- |
| `path.team_Id` | `number` | sim |
| `query.start_date` | `number` | não |
| `query.end_date` | `number` | não |
| `query.assignee` | `number` | não |
| `query.include_task_tags` | `boolean` | não |
| `query.include_location_names` | `boolean` | não |
| `query.include_approval_history` | `boolean` | não |
| `query.include_approval_details` | `boolean` | não |
| `query.space_id` | `number` | não |
| `query.folder_id` | `number` | não |
| `query.list_id` | `number` | não |
| `query.task_id` | `string` | não |
| `query.custom_task_ids` | `boolean` | não |
| `query.team_id` | `number` | não |
| `query.is_billable` | `boolean` | não |

`account` é opcional e usa o perfil ativo ou fixado no MCP. O retorno aparece em
`content` como JSON; recusas retornam `isError: true`. Ferramentas de escrita
ficam ausentes em `--read-only`. IDs explícitos devem respeitar a hierarquia fixada.

Exemplos:

Use o perfil ativo com o envelope mínimo:

```json
{
  "name": "clickupfy_api_v2_gettimeentrieswithinadaterange",
  "arguments": {
    "path": {
      "team_Id": 1
    }
  }
}
```

Direcione a chamada ao perfil de desenvolvimento:

```json
{
  "name": "clickupfy_api_v2_gettimeentrieswithinadaterange",
  "arguments": {
    "path": {
      "team_Id": 1
    },
    "account": "dev"
  }
}
```

Use o perfil do produto, quando o MCP permitir selecionar outro perfil:

```json
{
  "name": "clickupfy_api_v2_gettimeentrieswithinadaterange",
  "arguments": {
    "path": {
      "team_Id": 1
    },
    "account": "produto"
  }
}
```

Consulte o schema antes de compor uma chamada pelo agente:

```bash
clickupfy api describe clickupfy_api_v2_gettimeentrieswithinadaterange
```

Reproduza pelo CLI a entrada usada pelo agente, sem executar a operação:

```bash
printf '%s' '{"path":{"team_Id":1}}' | clickupfy api v2-gettimeentrieswithinadaterange --input - --dry-run
```

### `clickupfy api v2-createatimeentry`

A operação `Createatimeentry` pertence ao grupo `Time Tracking` e usa
`POST /api/v2/team/{team_Id}/time_entries`.

A chamada altera o recurso indicado pelos parâmetros. Confira o resultado com a consulta correspondente antes de continuar.

A resposta preserva o JSON da API; respostas sem corpo retornam `{}`.
A API key do perfil precisa ter acesso ao recurso. As permissões e o plano do Workspace podem restringir o endpoint.
Os campos omitidos são tratados pelo servidor do ClickUp, sem padrões adicionais do cliente.

[Referência oficial](https://developer.clickup.com/reference/createatimeentry).

| Entrada | Tipo | Obrigatória |
| --- | --- | --- |
| `path.team_Id` | `number` | sim |
| `query.custom_task_ids` | `boolean` | não |
| `query.team_id` | `number` | não |
| `body` | objeto conforme `api describe` | sim |

O comando aceita as flags comuns de `api`: `--input`, `--path`, `--query`,
`--body`, `--body-file`, `--content-type`, `--file`, `--dry-run` e `--yes`.
A referência completa de tipos, campos aninhados e valores permitidos está no comando `describe` abaixo.

Exemplos:

Consulte o contrato antes de preencher os IDs reais:

```bash
clickupfy api describe v2-createatimeentry
```

Valide uma entrada em arquivo sem enviar uma requisição:

```bash
clickupfy api v2-createatimeentry --input entrada.json --dry-run
```

Use um envelope JSON pelo stdin:

```bash
printf '%s' '{"path":{"team_Id":1},"body":{"start":1,"duration":1}}' | clickupfy api v2-createatimeentry --input -
```

Selecione o perfil que tem acesso ao recurso:

```bash
clickupfy --account produto api v2-createatimeentry --input entrada.json
```

Grave a resposta JSON para conferência. O arquivo de entrada usa o envelope do exemplo anterior:

```bash
clickupfy --json api v2-createatimeentry --input entrada.json > resposta.json
```

### `clickupfy_api_v2_createatimeentry`

A operação `Createatimeentry` pertence ao grupo `Time Tracking` e usa
`POST /api/v2/team/{team_Id}/time_entries`.

A chamada altera o recurso indicado pelos parâmetros. Confira o resultado com a consulta correspondente antes de continuar.

A resposta preserva o JSON da API; respostas sem corpo retornam `{}`.
A API key do perfil precisa ter acesso ao recurso. As permissões e o plano do Workspace podem restringir o endpoint.
Os campos omitidos são tratados pelo servidor do ClickUp, sem padrões adicionais do cliente.

[Referência oficial](https://developer.clickup.com/reference/createatimeentry).

| Entrada | Tipo | Obrigatória |
| --- | --- | --- |
| `path.team_Id` | `number` | sim |
| `query.custom_task_ids` | `boolean` | não |
| `query.team_id` | `number` | não |
| `body` | objeto conforme `api describe` | sim |

`account` é opcional e usa o perfil ativo ou fixado no MCP. O retorno aparece em
`content` como JSON; recusas retornam `isError: true`. Ferramentas de escrita
ficam ausentes em `--read-only`. IDs explícitos devem respeitar a hierarquia fixada.

Exemplos:

Use o perfil ativo com o envelope mínimo:

```json
{
  "name": "clickupfy_api_v2_createatimeentry",
  "arguments": {
    "path": {
      "team_Id": 1
    },
    "body": {
      "start": 1,
      "duration": 1
    }
  }
}
```

Direcione a chamada ao perfil de desenvolvimento:

```json
{
  "name": "clickupfy_api_v2_createatimeentry",
  "arguments": {
    "path": {
      "team_Id": 1
    },
    "body": {
      "start": 1,
      "duration": 1
    },
    "account": "dev"
  }
}
```

Use o perfil do produto, quando o MCP permitir selecionar outro perfil:

```json
{
  "name": "clickupfy_api_v2_createatimeentry",
  "arguments": {
    "path": {
      "team_Id": 1
    },
    "body": {
      "start": 1,
      "duration": 1
    },
    "account": "produto"
  }
}
```

Consulte o schema antes de compor uma chamada pelo agente:

```bash
clickupfy api describe clickupfy_api_v2_createatimeentry
```

Reproduza pelo CLI a entrada usada pelo agente, sem executar a operação:

```bash
printf '%s' '{"path":{"team_Id":1},"body":{"start":1,"duration":1}}' | clickupfy api v2-createatimeentry --input - --dry-run
```

### `clickupfy api v2-getsingulartimeentry`

A operação `Getsingulartimeentry` pertence ao grupo `Time Tracking` e usa
`GET /api/v2/team/{team_id}/time_entries/{timer_id}`.

A chamada consulta o recurso sem modificá-lo.

A resposta preserva o JSON da API; respostas sem corpo retornam `{}`.
A API key do perfil precisa ter acesso ao recurso. As permissões e o plano do Workspace podem restringir o endpoint.
Os campos omitidos são tratados pelo servidor do ClickUp, sem padrões adicionais do cliente.

[Referência oficial](https://developer.clickup.com/reference/getsingulartimeentry).

| Entrada | Tipo | Obrigatória |
| --- | --- | --- |
| `path.team_id` | `number` | sim |
| `path.timer_id` | `string` | sim |
| `query.include_task_tags` | `boolean` | não |
| `query.include_location_names` | `boolean` | não |
| `query.include_approval_history` | `boolean` | não |
| `query.include_approval_details` | `boolean` | não |

O comando aceita as flags comuns de `api`: `--input`, `--path`, `--query`,
`--body`, `--body-file`, `--content-type`, `--file`, `--dry-run` e `--yes`.
A referência completa de tipos, campos aninhados e valores permitidos está no comando `describe` abaixo.

Exemplos:

Consulte o contrato antes de preencher os IDs reais:

```bash
clickupfy api describe v2-getsingulartimeentry
```

Valide uma entrada em arquivo sem enviar uma requisição:

```bash
clickupfy api v2-getsingulartimeentry --input entrada.json --dry-run
```

Use um envelope JSON pelo stdin:

```bash
printf '%s' '{"path":{"team_id":1,"timer_id":"exemplo-1"}}' | clickupfy api v2-getsingulartimeentry --input -
```

Selecione o perfil que tem acesso ao recurso:

```bash
clickupfy --account produto api v2-getsingulartimeentry --input entrada.json
```

Grave a resposta JSON para conferência. O arquivo de entrada usa o envelope do exemplo anterior:

```bash
clickupfy --json api v2-getsingulartimeentry --input entrada.json > resposta.json
```

### `clickupfy_api_v2_getsingulartimeentry`

A operação `Getsingulartimeentry` pertence ao grupo `Time Tracking` e usa
`GET /api/v2/team/{team_id}/time_entries/{timer_id}`.

A chamada consulta o recurso sem modificá-lo.

A resposta preserva o JSON da API; respostas sem corpo retornam `{}`.
A API key do perfil precisa ter acesso ao recurso. As permissões e o plano do Workspace podem restringir o endpoint.
Os campos omitidos são tratados pelo servidor do ClickUp, sem padrões adicionais do cliente.

[Referência oficial](https://developer.clickup.com/reference/getsingulartimeentry).

| Entrada | Tipo | Obrigatória |
| --- | --- | --- |
| `path.team_id` | `number` | sim |
| `path.timer_id` | `string` | sim |
| `query.include_task_tags` | `boolean` | não |
| `query.include_location_names` | `boolean` | não |
| `query.include_approval_history` | `boolean` | não |
| `query.include_approval_details` | `boolean` | não |

`account` é opcional e usa o perfil ativo ou fixado no MCP. O retorno aparece em
`content` como JSON; recusas retornam `isError: true`. Ferramentas de escrita
ficam ausentes em `--read-only`. IDs explícitos devem respeitar a hierarquia fixada.

Exemplos:

Use o perfil ativo com o envelope mínimo:

```json
{
  "name": "clickupfy_api_v2_getsingulartimeentry",
  "arguments": {
    "path": {
      "team_id": 1,
      "timer_id": "exemplo-1"
    }
  }
}
```

Direcione a chamada ao perfil de desenvolvimento:

```json
{
  "name": "clickupfy_api_v2_getsingulartimeentry",
  "arguments": {
    "path": {
      "team_id": 1,
      "timer_id": "exemplo-1"
    },
    "account": "dev"
  }
}
```

Use o perfil do produto, quando o MCP permitir selecionar outro perfil:

```json
{
  "name": "clickupfy_api_v2_getsingulartimeentry",
  "arguments": {
    "path": {
      "team_id": 1,
      "timer_id": "exemplo-1"
    },
    "account": "produto"
  }
}
```

Consulte o schema antes de compor uma chamada pelo agente:

```bash
clickupfy api describe clickupfy_api_v2_getsingulartimeentry
```

Reproduza pelo CLI a entrada usada pelo agente, sem executar a operação:

```bash
printf '%s' '{"path":{"team_id":1,"timer_id":"exemplo-1"}}' | clickupfy api v2-getsingulartimeentry --input - --dry-run
```

### `clickupfy api v2-updateatime-entry`

A operação `UpdateatimeEntry` pertence ao grupo `Time Tracking` e usa
`PUT /api/v2/team/{team_id}/time_entries/{timer_id}`.

A chamada altera o recurso indicado pelos parâmetros. Confira o resultado com a consulta correspondente antes de continuar.

A resposta preserva o JSON da API; respostas sem corpo retornam `{}`.
A API key do perfil precisa ter acesso ao recurso. As permissões e o plano do Workspace podem restringir o endpoint.
Os campos omitidos são tratados pelo servidor do ClickUp, sem padrões adicionais do cliente.

[Referência oficial](https://developer.clickup.com/reference/updateatimeentry).

| Entrada | Tipo | Obrigatória |
| --- | --- | --- |
| `path.team_id` | `number` | sim |
| `path.timer_id` | `number` | sim |
| `query.custom_task_ids` | `boolean` | não |
| `query.team_id` | `number` | não |
| `body` | objeto conforme `api describe` | sim |

O comando aceita as flags comuns de `api`: `--input`, `--path`, `--query`,
`--body`, `--body-file`, `--content-type`, `--file`, `--dry-run` e `--yes`.
A referência completa de tipos, campos aninhados e valores permitidos está no comando `describe` abaixo.

Exemplos:

Consulte o contrato antes de preencher os IDs reais:

```bash
clickupfy api describe v2-updateatime-entry
```

Valide uma entrada em arquivo sem enviar uma requisição:

```bash
clickupfy api v2-updateatime-entry --input entrada.json --dry-run
```

Use um envelope JSON pelo stdin:

```bash
printf '%s' '{"path":{"team_id":1,"timer_id":1},"body":{"tags":[{"name":"exemplo-1","tag_fg":"exemplo-1","tag_bg":"exemplo-1"}]}}' | clickupfy api v2-updateatime-entry --input -
```

Selecione o perfil que tem acesso ao recurso:

```bash
clickupfy --account produto api v2-updateatime-entry --input entrada.json
```

Grave a resposta JSON para conferência. O arquivo de entrada usa o envelope do exemplo anterior:

```bash
clickupfy --json api v2-updateatime-entry --input entrada.json > resposta.json
```

### `clickupfy_api_v2_updateatime_entry`

A operação `UpdateatimeEntry` pertence ao grupo `Time Tracking` e usa
`PUT /api/v2/team/{team_id}/time_entries/{timer_id}`.

A chamada altera o recurso indicado pelos parâmetros. Confira o resultado com a consulta correspondente antes de continuar.

A resposta preserva o JSON da API; respostas sem corpo retornam `{}`.
A API key do perfil precisa ter acesso ao recurso. As permissões e o plano do Workspace podem restringir o endpoint.
Os campos omitidos são tratados pelo servidor do ClickUp, sem padrões adicionais do cliente.

[Referência oficial](https://developer.clickup.com/reference/updateatimeentry).

| Entrada | Tipo | Obrigatória |
| --- | --- | --- |
| `path.team_id` | `number` | sim |
| `path.timer_id` | `number` | sim |
| `query.custom_task_ids` | `boolean` | não |
| `query.team_id` | `number` | não |
| `body` | objeto conforme `api describe` | sim |

`account` é opcional e usa o perfil ativo ou fixado no MCP. O retorno aparece em
`content` como JSON; recusas retornam `isError: true`. Ferramentas de escrita
ficam ausentes em `--read-only`. IDs explícitos devem respeitar a hierarquia fixada.

Exemplos:

Use o perfil ativo com o envelope mínimo:

```json
{
  "name": "clickupfy_api_v2_updateatime_entry",
  "arguments": {
    "path": {
      "team_id": 1,
      "timer_id": 1
    },
    "body": {
      "tags": [
        {
          "name": "exemplo-1",
          "tag_fg": "exemplo-1",
          "tag_bg": "exemplo-1"
        }
      ]
    }
  }
}
```

Direcione a chamada ao perfil de desenvolvimento:

```json
{
  "name": "clickupfy_api_v2_updateatime_entry",
  "arguments": {
    "path": {
      "team_id": 1,
      "timer_id": 1
    },
    "body": {
      "tags": [
        {
          "name": "exemplo-1",
          "tag_fg": "exemplo-1",
          "tag_bg": "exemplo-1"
        }
      ]
    },
    "account": "dev"
  }
}
```

Use o perfil do produto, quando o MCP permitir selecionar outro perfil:

```json
{
  "name": "clickupfy_api_v2_updateatime_entry",
  "arguments": {
    "path": {
      "team_id": 1,
      "timer_id": 1
    },
    "body": {
      "tags": [
        {
          "name": "exemplo-1",
          "tag_fg": "exemplo-1",
          "tag_bg": "exemplo-1"
        }
      ]
    },
    "account": "produto"
  }
}
```

Consulte o schema antes de compor uma chamada pelo agente:

```bash
clickupfy api describe clickupfy_api_v2_updateatime_entry
```

Reproduza pelo CLI a entrada usada pelo agente, sem executar a operação:

```bash
printf '%s' '{"path":{"team_id":1,"timer_id":1},"body":{"tags":[{"name":"exemplo-1","tag_fg":"exemplo-1","tag_bg":"exemplo-1"}]}}' | clickupfy api v2-updateatime-entry --input - --dry-run
```

### `clickupfy api v2-deleteatime-entry`

A operação `DeleteatimeEntry` pertence ao grupo `Time Tracking` e usa
`DELETE /api/v2/team/{team_id}/time_entries/{timer_id}`.

A chamada altera o recurso indicado pelos parâmetros. Confira o resultado com a consulta correspondente antes de continuar.

A resposta preserva o JSON da API; respostas sem corpo retornam `{}`.
A API key do perfil precisa ter acesso ao recurso. As permissões e o plano do Workspace podem restringir o endpoint.
Os campos omitidos são tratados pelo servidor do ClickUp, sem padrões adicionais do cliente.

[Referência oficial](https://developer.clickup.com/reference/deleteatimeentry).

| Entrada | Tipo | Obrigatória |
| --- | --- | --- |
| `path.team_id` | `number` | sim |
| `path.timer_id` | `number` | sim |
| `confirm` | boolean, somente `true` | sim |

O comando aceita as flags comuns de `api`: `--input`, `--path`, `--query`,
`--body`, `--body-file`, `--content-type`, `--file`, `--dry-run` e `--yes`.
A referência completa de tipos, campos aninhados e valores permitidos está no comando `describe` abaixo.

Exemplos:

Consulte o contrato antes de preencher os IDs reais:

```bash
clickupfy api describe v2-deleteatime-entry
```

Valide uma entrada em arquivo sem enviar uma requisição:

```bash
clickupfy api v2-deleteatime-entry --input entrada.json --dry-run
```

Use um envelope JSON pelo stdin:

```bash
printf '%s' '{"path":{"team_id":1,"timer_id":1},"confirm":true}' | clickupfy api v2-deleteatime-entry --input -
```

Selecione o perfil que tem acesso ao recurso:

```bash
clickupfy --account produto api v2-deleteatime-entry --input entrada.json
```

Grave a resposta JSON para conferência. O arquivo de entrada usa o envelope do exemplo anterior:

```bash
clickupfy --json api v2-deleteatime-entry --input entrada.json > resposta.json
```

### `clickupfy_api_v2_deleteatime_entry`

A operação `DeleteatimeEntry` pertence ao grupo `Time Tracking` e usa
`DELETE /api/v2/team/{team_id}/time_entries/{timer_id}`.

A chamada altera o recurso indicado pelos parâmetros. Confira o resultado com a consulta correspondente antes de continuar.

A resposta preserva o JSON da API; respostas sem corpo retornam `{}`.
A API key do perfil precisa ter acesso ao recurso. As permissões e o plano do Workspace podem restringir o endpoint.
Os campos omitidos são tratados pelo servidor do ClickUp, sem padrões adicionais do cliente.

[Referência oficial](https://developer.clickup.com/reference/deleteatimeentry).

| Entrada | Tipo | Obrigatória |
| --- | --- | --- |
| `path.team_id` | `number` | sim |
| `path.timer_id` | `number` | sim |
| `confirm` | boolean, somente `true` | sim |

`account` é opcional e usa o perfil ativo ou fixado no MCP. O retorno aparece em
`content` como JSON; recusas retornam `isError: true`. Ferramentas de escrita
ficam ausentes em `--read-only`. IDs explícitos devem respeitar a hierarquia fixada.

Exemplos:

Use o perfil ativo com o envelope mínimo:

```json
{
  "name": "clickupfy_api_v2_deleteatime_entry",
  "arguments": {
    "path": {
      "team_id": 1,
      "timer_id": 1
    },
    "confirm": true
  }
}
```

Direcione a chamada ao perfil de desenvolvimento:

```json
{
  "name": "clickupfy_api_v2_deleteatime_entry",
  "arguments": {
    "path": {
      "team_id": 1,
      "timer_id": 1
    },
    "confirm": true,
    "account": "dev"
  }
}
```

Use o perfil do produto, quando o MCP permitir selecionar outro perfil:

```json
{
  "name": "clickupfy_api_v2_deleteatime_entry",
  "arguments": {
    "path": {
      "team_id": 1,
      "timer_id": 1
    },
    "confirm": true,
    "account": "produto"
  }
}
```

Consulte o schema antes de compor uma chamada pelo agente:

```bash
clickupfy api describe clickupfy_api_v2_deleteatime_entry
```

Reproduza pelo CLI a entrada usada pelo agente, sem executar a operação:

```bash
printf '%s' '{"path":{"team_id":1,"timer_id":1},"confirm":true}' | clickupfy api v2-deleteatime-entry --input - --dry-run
```

### `clickupfy api v2-gettimeentryhistory`

A operação `Gettimeentryhistory` pertence ao grupo `Time Tracking` e usa
`GET /api/v2/team/{team_id}/time_entries/{timer_id}/history`.

A chamada consulta o recurso sem modificá-lo.

A resposta preserva o JSON da API; respostas sem corpo retornam `{}`.
A API key do perfil precisa ter acesso ao recurso. As permissões e o plano do Workspace podem restringir o endpoint.
Os campos omitidos são tratados pelo servidor do ClickUp, sem padrões adicionais do cliente.

[Referência oficial](https://developer.clickup.com/reference/gettimeentryhistory).

| Entrada | Tipo | Obrigatória |
| --- | --- | --- |
| `path.team_id` | `number` | sim |
| `path.timer_id` | `string` | sim |

O comando aceita as flags comuns de `api`: `--input`, `--path`, `--query`,
`--body`, `--body-file`, `--content-type`, `--file`, `--dry-run` e `--yes`.
A referência completa de tipos, campos aninhados e valores permitidos está no comando `describe` abaixo.

Exemplos:

Consulte o contrato antes de preencher os IDs reais:

```bash
clickupfy api describe v2-gettimeentryhistory
```

Valide uma entrada em arquivo sem enviar uma requisição:

```bash
clickupfy api v2-gettimeentryhistory --input entrada.json --dry-run
```

Use um envelope JSON pelo stdin:

```bash
printf '%s' '{"path":{"team_id":1,"timer_id":"exemplo-1"}}' | clickupfy api v2-gettimeentryhistory --input -
```

Selecione o perfil que tem acesso ao recurso:

```bash
clickupfy --account produto api v2-gettimeentryhistory --input entrada.json
```

Grave a resposta JSON para conferência. O arquivo de entrada usa o envelope do exemplo anterior:

```bash
clickupfy --json api v2-gettimeentryhistory --input entrada.json > resposta.json
```

### `clickupfy_api_v2_gettimeentryhistory`

A operação `Gettimeentryhistory` pertence ao grupo `Time Tracking` e usa
`GET /api/v2/team/{team_id}/time_entries/{timer_id}/history`.

A chamada consulta o recurso sem modificá-lo.

A resposta preserva o JSON da API; respostas sem corpo retornam `{}`.
A API key do perfil precisa ter acesso ao recurso. As permissões e o plano do Workspace podem restringir o endpoint.
Os campos omitidos são tratados pelo servidor do ClickUp, sem padrões adicionais do cliente.

[Referência oficial](https://developer.clickup.com/reference/gettimeentryhistory).

| Entrada | Tipo | Obrigatória |
| --- | --- | --- |
| `path.team_id` | `number` | sim |
| `path.timer_id` | `string` | sim |

`account` é opcional e usa o perfil ativo ou fixado no MCP. O retorno aparece em
`content` como JSON; recusas retornam `isError: true`. Ferramentas de escrita
ficam ausentes em `--read-only`. IDs explícitos devem respeitar a hierarquia fixada.

Exemplos:

Use o perfil ativo com o envelope mínimo:

```json
{
  "name": "clickupfy_api_v2_gettimeentryhistory",
  "arguments": {
    "path": {
      "team_id": 1,
      "timer_id": "exemplo-1"
    }
  }
}
```

Direcione a chamada ao perfil de desenvolvimento:

```json
{
  "name": "clickupfy_api_v2_gettimeentryhistory",
  "arguments": {
    "path": {
      "team_id": 1,
      "timer_id": "exemplo-1"
    },
    "account": "dev"
  }
}
```

Use o perfil do produto, quando o MCP permitir selecionar outro perfil:

```json
{
  "name": "clickupfy_api_v2_gettimeentryhistory",
  "arguments": {
    "path": {
      "team_id": 1,
      "timer_id": "exemplo-1"
    },
    "account": "produto"
  }
}
```

Consulte o schema antes de compor uma chamada pelo agente:

```bash
clickupfy api describe clickupfy_api_v2_gettimeentryhistory
```

Reproduza pelo CLI a entrada usada pelo agente, sem executar a operação:

```bash
printf '%s' '{"path":{"team_id":1,"timer_id":"exemplo-1"}}' | clickupfy api v2-gettimeentryhistory --input - --dry-run
```

### `clickupfy api v2-getrunningtimeentry`

A operação `Getrunningtimeentry` pertence ao grupo `Time Tracking` e usa
`GET /api/v2/team/{team_id}/time_entries/current`.

A chamada consulta o recurso sem modificá-lo.

A resposta preserva o JSON da API; respostas sem corpo retornam `{}`.
A API key do perfil precisa ter acesso ao recurso. As permissões e o plano do Workspace podem restringir o endpoint.
Os campos omitidos são tratados pelo servidor do ClickUp, sem padrões adicionais do cliente.

[Referência oficial](https://developer.clickup.com/reference/getrunningtimeentry).

| Entrada | Tipo | Obrigatória |
| --- | --- | --- |
| `path.team_id` | `number` | sim |
| `query.assignee` | `number` | não |

O comando aceita as flags comuns de `api`: `--input`, `--path`, `--query`,
`--body`, `--body-file`, `--content-type`, `--file`, `--dry-run` e `--yes`.
A referência completa de tipos, campos aninhados e valores permitidos está no comando `describe` abaixo.

Exemplos:

Consulte o contrato antes de preencher os IDs reais:

```bash
clickupfy api describe v2-getrunningtimeentry
```

Valide uma entrada em arquivo sem enviar uma requisição:

```bash
clickupfy api v2-getrunningtimeentry --input entrada.json --dry-run
```

Use um envelope JSON pelo stdin:

```bash
printf '%s' '{"path":{"team_id":1}}' | clickupfy api v2-getrunningtimeentry --input -
```

Selecione o perfil que tem acesso ao recurso:

```bash
clickupfy --account produto api v2-getrunningtimeentry --input entrada.json
```

Grave a resposta JSON para conferência. O arquivo de entrada usa o envelope do exemplo anterior:

```bash
clickupfy --json api v2-getrunningtimeentry --input entrada.json > resposta.json
```

### `clickupfy_api_v2_getrunningtimeentry`

A operação `Getrunningtimeentry` pertence ao grupo `Time Tracking` e usa
`GET /api/v2/team/{team_id}/time_entries/current`.

A chamada consulta o recurso sem modificá-lo.

A resposta preserva o JSON da API; respostas sem corpo retornam `{}`.
A API key do perfil precisa ter acesso ao recurso. As permissões e o plano do Workspace podem restringir o endpoint.
Os campos omitidos são tratados pelo servidor do ClickUp, sem padrões adicionais do cliente.

[Referência oficial](https://developer.clickup.com/reference/getrunningtimeentry).

| Entrada | Tipo | Obrigatória |
| --- | --- | --- |
| `path.team_id` | `number` | sim |
| `query.assignee` | `number` | não |

`account` é opcional e usa o perfil ativo ou fixado no MCP. O retorno aparece em
`content` como JSON; recusas retornam `isError: true`. Ferramentas de escrita
ficam ausentes em `--read-only`. IDs explícitos devem respeitar a hierarquia fixada.

Exemplos:

Use o perfil ativo com o envelope mínimo:

```json
{
  "name": "clickupfy_api_v2_getrunningtimeentry",
  "arguments": {
    "path": {
      "team_id": 1
    }
  }
}
```

Direcione a chamada ao perfil de desenvolvimento:

```json
{
  "name": "clickupfy_api_v2_getrunningtimeentry",
  "arguments": {
    "path": {
      "team_id": 1
    },
    "account": "dev"
  }
}
```

Use o perfil do produto, quando o MCP permitir selecionar outro perfil:

```json
{
  "name": "clickupfy_api_v2_getrunningtimeentry",
  "arguments": {
    "path": {
      "team_id": 1
    },
    "account": "produto"
  }
}
```

Consulte o schema antes de compor uma chamada pelo agente:

```bash
clickupfy api describe clickupfy_api_v2_getrunningtimeentry
```

Reproduza pelo CLI a entrada usada pelo agente, sem executar a operação:

```bash
printf '%s' '{"path":{"team_id":1}}' | clickupfy api v2-getrunningtimeentry --input - --dry-run
```

### `clickupfy api v2-getalltagsfromtimeentries`

A operação `Getalltagsfromtimeentries` pertence ao grupo `Time Tracking` e usa
`GET /api/v2/team/{team_id}/time_entries/tags`.

A chamada consulta o recurso sem modificá-lo.

A resposta preserva o JSON da API; respostas sem corpo retornam `{}`.
A API key do perfil precisa ter acesso ao recurso. As permissões e o plano do Workspace podem restringir o endpoint.
Os campos omitidos são tratados pelo servidor do ClickUp, sem padrões adicionais do cliente.

[Referência oficial](https://developer.clickup.com/reference/getalltagsfromtimeentries).

| Entrada | Tipo | Obrigatória |
| --- | --- | --- |
| `path.team_id` | `number` | sim |

O comando aceita as flags comuns de `api`: `--input`, `--path`, `--query`,
`--body`, `--body-file`, `--content-type`, `--file`, `--dry-run` e `--yes`.
A referência completa de tipos, campos aninhados e valores permitidos está no comando `describe` abaixo.

Exemplos:

Consulte o contrato antes de preencher os IDs reais:

```bash
clickupfy api describe v2-getalltagsfromtimeentries
```

Valide uma entrada em arquivo sem enviar uma requisição:

```bash
clickupfy api v2-getalltagsfromtimeentries --input entrada.json --dry-run
```

Use um envelope JSON pelo stdin:

```bash
printf '%s' '{"path":{"team_id":1}}' | clickupfy api v2-getalltagsfromtimeentries --input -
```

Selecione o perfil que tem acesso ao recurso:

```bash
clickupfy --account produto api v2-getalltagsfromtimeentries --input entrada.json
```

Grave a resposta JSON para conferência. O arquivo de entrada usa o envelope do exemplo anterior:

```bash
clickupfy --json api v2-getalltagsfromtimeentries --input entrada.json > resposta.json
```

### `clickupfy_api_v2_getalltagsfromtimeentries`

A operação `Getalltagsfromtimeentries` pertence ao grupo `Time Tracking` e usa
`GET /api/v2/team/{team_id}/time_entries/tags`.

A chamada consulta o recurso sem modificá-lo.

A resposta preserva o JSON da API; respostas sem corpo retornam `{}`.
A API key do perfil precisa ter acesso ao recurso. As permissões e o plano do Workspace podem restringir o endpoint.
Os campos omitidos são tratados pelo servidor do ClickUp, sem padrões adicionais do cliente.

[Referência oficial](https://developer.clickup.com/reference/getalltagsfromtimeentries).

| Entrada | Tipo | Obrigatória |
| --- | --- | --- |
| `path.team_id` | `number` | sim |

`account` é opcional e usa o perfil ativo ou fixado no MCP. O retorno aparece em
`content` como JSON; recusas retornam `isError: true`. Ferramentas de escrita
ficam ausentes em `--read-only`. IDs explícitos devem respeitar a hierarquia fixada.

Exemplos:

Use o perfil ativo com o envelope mínimo:

```json
{
  "name": "clickupfy_api_v2_getalltagsfromtimeentries",
  "arguments": {
    "path": {
      "team_id": 1
    }
  }
}
```

Direcione a chamada ao perfil de desenvolvimento:

```json
{
  "name": "clickupfy_api_v2_getalltagsfromtimeentries",
  "arguments": {
    "path": {
      "team_id": 1
    },
    "account": "dev"
  }
}
```

Use o perfil do produto, quando o MCP permitir selecionar outro perfil:

```json
{
  "name": "clickupfy_api_v2_getalltagsfromtimeentries",
  "arguments": {
    "path": {
      "team_id": 1
    },
    "account": "produto"
  }
}
```

Consulte o schema antes de compor uma chamada pelo agente:

```bash
clickupfy api describe clickupfy_api_v2_getalltagsfromtimeentries
```

Reproduza pelo CLI a entrada usada pelo agente, sem executar a operação:

```bash
printf '%s' '{"path":{"team_id":1}}' | clickupfy api v2-getalltagsfromtimeentries --input - --dry-run
```

### `clickupfy api v2-addtagsfromtimeentries`

A operação `Addtagsfromtimeentries` pertence ao grupo `Time Tracking` e usa
`POST /api/v2/team/{team_id}/time_entries/tags`.

A chamada altera o recurso indicado pelos parâmetros. Confira o resultado com a consulta correspondente antes de continuar.

A resposta preserva o JSON da API; respostas sem corpo retornam `{}`.
A API key do perfil precisa ter acesso ao recurso. As permissões e o plano do Workspace podem restringir o endpoint.
Os campos omitidos são tratados pelo servidor do ClickUp, sem padrões adicionais do cliente.

[Referência oficial](https://developer.clickup.com/reference/addtagsfromtimeentries).

| Entrada | Tipo | Obrigatória |
| --- | --- | --- |
| `path.team_id` | `number` | sim |
| `body` | objeto conforme `api describe` | sim |

O comando aceita as flags comuns de `api`: `--input`, `--path`, `--query`,
`--body`, `--body-file`, `--content-type`, `--file`, `--dry-run` e `--yes`.
A referência completa de tipos, campos aninhados e valores permitidos está no comando `describe` abaixo.

Exemplos:

Consulte o contrato antes de preencher os IDs reais:

```bash
clickupfy api describe v2-addtagsfromtimeentries
```

Valide uma entrada em arquivo sem enviar uma requisição:

```bash
clickupfy api v2-addtagsfromtimeentries --input entrada.json --dry-run
```

Use um envelope JSON pelo stdin:

```bash
printf '%s' '{"path":{"team_id":1},"body":{"time_entry_ids":["exemplo-1"],"tags":[{"name":"exemplo-1","tag_fg":"exemplo-1","tag_bg":"exemplo-1"}]}}' | clickupfy api v2-addtagsfromtimeentries --input -
```

Selecione o perfil que tem acesso ao recurso:

```bash
clickupfy --account produto api v2-addtagsfromtimeentries --input entrada.json
```

Grave a resposta JSON para conferência. O arquivo de entrada usa o envelope do exemplo anterior:

```bash
clickupfy --json api v2-addtagsfromtimeentries --input entrada.json > resposta.json
```

### `clickupfy_api_v2_addtagsfromtimeentries`

A operação `Addtagsfromtimeentries` pertence ao grupo `Time Tracking` e usa
`POST /api/v2/team/{team_id}/time_entries/tags`.

A chamada altera o recurso indicado pelos parâmetros. Confira o resultado com a consulta correspondente antes de continuar.

A resposta preserva o JSON da API; respostas sem corpo retornam `{}`.
A API key do perfil precisa ter acesso ao recurso. As permissões e o plano do Workspace podem restringir o endpoint.
Os campos omitidos são tratados pelo servidor do ClickUp, sem padrões adicionais do cliente.

[Referência oficial](https://developer.clickup.com/reference/addtagsfromtimeentries).

| Entrada | Tipo | Obrigatória |
| --- | --- | --- |
| `path.team_id` | `number` | sim |
| `body` | objeto conforme `api describe` | sim |

`account` é opcional e usa o perfil ativo ou fixado no MCP. O retorno aparece em
`content` como JSON; recusas retornam `isError: true`. Ferramentas de escrita
ficam ausentes em `--read-only`. IDs explícitos devem respeitar a hierarquia fixada.

Exemplos:

Use o perfil ativo com o envelope mínimo:

```json
{
  "name": "clickupfy_api_v2_addtagsfromtimeentries",
  "arguments": {
    "path": {
      "team_id": 1
    },
    "body": {
      "time_entry_ids": [
        "exemplo-1"
      ],
      "tags": [
        {
          "name": "exemplo-1",
          "tag_fg": "exemplo-1",
          "tag_bg": "exemplo-1"
        }
      ]
    }
  }
}
```

Direcione a chamada ao perfil de desenvolvimento:

```json
{
  "name": "clickupfy_api_v2_addtagsfromtimeentries",
  "arguments": {
    "path": {
      "team_id": 1
    },
    "body": {
      "time_entry_ids": [
        "exemplo-1"
      ],
      "tags": [
        {
          "name": "exemplo-1",
          "tag_fg": "exemplo-1",
          "tag_bg": "exemplo-1"
        }
      ]
    },
    "account": "dev"
  }
}
```

Use o perfil do produto, quando o MCP permitir selecionar outro perfil:

```json
{
  "name": "clickupfy_api_v2_addtagsfromtimeentries",
  "arguments": {
    "path": {
      "team_id": 1
    },
    "body": {
      "time_entry_ids": [
        "exemplo-1"
      ],
      "tags": [
        {
          "name": "exemplo-1",
          "tag_fg": "exemplo-1",
          "tag_bg": "exemplo-1"
        }
      ]
    },
    "account": "produto"
  }
}
```

Consulte o schema antes de compor uma chamada pelo agente:

```bash
clickupfy api describe clickupfy_api_v2_addtagsfromtimeentries
```

Reproduza pelo CLI a entrada usada pelo agente, sem executar a operação:

```bash
printf '%s' '{"path":{"team_id":1},"body":{"time_entry_ids":["exemplo-1"],"tags":[{"name":"exemplo-1","tag_fg":"exemplo-1","tag_bg":"exemplo-1"}]}}' | clickupfy api v2-addtagsfromtimeentries --input - --dry-run
```

### `clickupfy api v2-changetagnamesfromtimeentries`

A operação `Changetagnamesfromtimeentries` pertence ao grupo `Time Tracking` e usa
`PUT /api/v2/team/{team_id}/time_entries/tags`.

A chamada altera o recurso indicado pelos parâmetros. Confira o resultado com a consulta correspondente antes de continuar.

A resposta preserva o JSON da API; respostas sem corpo retornam `{}`.
A API key do perfil precisa ter acesso ao recurso. As permissões e o plano do Workspace podem restringir o endpoint.
Os campos omitidos são tratados pelo servidor do ClickUp, sem padrões adicionais do cliente.

[Referência oficial](https://developer.clickup.com/reference/changetagnamesfromtimeentries).

| Entrada | Tipo | Obrigatória |
| --- | --- | --- |
| `path.team_id` | `number` | sim |
| `body` | objeto conforme `api describe` | sim |

O comando aceita as flags comuns de `api`: `--input`, `--path`, `--query`,
`--body`, `--body-file`, `--content-type`, `--file`, `--dry-run` e `--yes`.
A referência completa de tipos, campos aninhados e valores permitidos está no comando `describe` abaixo.

Exemplos:

Consulte o contrato antes de preencher os IDs reais:

```bash
clickupfy api describe v2-changetagnamesfromtimeentries
```

Valide uma entrada em arquivo sem enviar uma requisição:

```bash
clickupfy api v2-changetagnamesfromtimeentries --input entrada.json --dry-run
```

Use um envelope JSON pelo stdin:

```bash
printf '%s' '{"path":{"team_id":1},"body":{"name":"exemplo-1","new_name":"exemplo-1","tag_bg":"exemplo-1","tag_fg":"exemplo-1"}}' | clickupfy api v2-changetagnamesfromtimeentries --input -
```

Selecione o perfil que tem acesso ao recurso:

```bash
clickupfy --account produto api v2-changetagnamesfromtimeentries --input entrada.json
```

Grave a resposta JSON para conferência. O arquivo de entrada usa o envelope do exemplo anterior:

```bash
clickupfy --json api v2-changetagnamesfromtimeentries --input entrada.json > resposta.json
```

### `clickupfy_api_v2_changetagnamesfromtimeentries`

A operação `Changetagnamesfromtimeentries` pertence ao grupo `Time Tracking` e usa
`PUT /api/v2/team/{team_id}/time_entries/tags`.

A chamada altera o recurso indicado pelos parâmetros. Confira o resultado com a consulta correspondente antes de continuar.

A resposta preserva o JSON da API; respostas sem corpo retornam `{}`.
A API key do perfil precisa ter acesso ao recurso. As permissões e o plano do Workspace podem restringir o endpoint.
Os campos omitidos são tratados pelo servidor do ClickUp, sem padrões adicionais do cliente.

[Referência oficial](https://developer.clickup.com/reference/changetagnamesfromtimeentries).

| Entrada | Tipo | Obrigatória |
| --- | --- | --- |
| `path.team_id` | `number` | sim |
| `body` | objeto conforme `api describe` | sim |

`account` é opcional e usa o perfil ativo ou fixado no MCP. O retorno aparece em
`content` como JSON; recusas retornam `isError: true`. Ferramentas de escrita
ficam ausentes em `--read-only`. IDs explícitos devem respeitar a hierarquia fixada.

Exemplos:

Use o perfil ativo com o envelope mínimo:

```json
{
  "name": "clickupfy_api_v2_changetagnamesfromtimeentries",
  "arguments": {
    "path": {
      "team_id": 1
    },
    "body": {
      "name": "exemplo-1",
      "new_name": "exemplo-1",
      "tag_bg": "exemplo-1",
      "tag_fg": "exemplo-1"
    }
  }
}
```

Direcione a chamada ao perfil de desenvolvimento:

```json
{
  "name": "clickupfy_api_v2_changetagnamesfromtimeentries",
  "arguments": {
    "path": {
      "team_id": 1
    },
    "body": {
      "name": "exemplo-1",
      "new_name": "exemplo-1",
      "tag_bg": "exemplo-1",
      "tag_fg": "exemplo-1"
    },
    "account": "dev"
  }
}
```

Use o perfil do produto, quando o MCP permitir selecionar outro perfil:

```json
{
  "name": "clickupfy_api_v2_changetagnamesfromtimeentries",
  "arguments": {
    "path": {
      "team_id": 1
    },
    "body": {
      "name": "exemplo-1",
      "new_name": "exemplo-1",
      "tag_bg": "exemplo-1",
      "tag_fg": "exemplo-1"
    },
    "account": "produto"
  }
}
```

Consulte o schema antes de compor uma chamada pelo agente:

```bash
clickupfy api describe clickupfy_api_v2_changetagnamesfromtimeentries
```

Reproduza pelo CLI a entrada usada pelo agente, sem executar a operação:

```bash
printf '%s' '{"path":{"team_id":1},"body":{"name":"exemplo-1","new_name":"exemplo-1","tag_bg":"exemplo-1","tag_fg":"exemplo-1"}}' | clickupfy api v2-changetagnamesfromtimeentries --input - --dry-run
```

### `clickupfy api v2-removetagsfromtimeentries`

A operação `Removetagsfromtimeentries` pertence ao grupo `Time Tracking` e usa
`DELETE /api/v2/team/{team_id}/time_entries/tags`.

A chamada altera o recurso indicado pelos parâmetros. Confira o resultado com a consulta correspondente antes de continuar.

A resposta preserva o JSON da API; respostas sem corpo retornam `{}`.
A API key do perfil precisa ter acesso ao recurso. As permissões e o plano do Workspace podem restringir o endpoint.
Os campos omitidos são tratados pelo servidor do ClickUp, sem padrões adicionais do cliente.

[Referência oficial](https://developer.clickup.com/reference/removetagsfromtimeentries).

| Entrada | Tipo | Obrigatória |
| --- | --- | --- |
| `path.team_id` | `number` | sim |
| `body` | objeto conforme `api describe` | sim |
| `confirm` | boolean, somente `true` | sim |

O comando aceita as flags comuns de `api`: `--input`, `--path`, `--query`,
`--body`, `--body-file`, `--content-type`, `--file`, `--dry-run` e `--yes`.
A referência completa de tipos, campos aninhados e valores permitidos está no comando `describe` abaixo.

Exemplos:

Consulte o contrato antes de preencher os IDs reais:

```bash
clickupfy api describe v2-removetagsfromtimeentries
```

Valide uma entrada em arquivo sem enviar uma requisição:

```bash
clickupfy api v2-removetagsfromtimeentries --input entrada.json --dry-run
```

Use um envelope JSON pelo stdin:

```bash
printf '%s' '{"path":{"team_id":1},"body":{"time_entry_ids":["exemplo-1"],"tags":[{"name":"exemplo-1"}]},"confirm":true}' | clickupfy api v2-removetagsfromtimeentries --input -
```

Selecione o perfil que tem acesso ao recurso:

```bash
clickupfy --account produto api v2-removetagsfromtimeentries --input entrada.json
```

Grave a resposta JSON para conferência. O arquivo de entrada usa o envelope do exemplo anterior:

```bash
clickupfy --json api v2-removetagsfromtimeentries --input entrada.json > resposta.json
```

### `clickupfy_api_v2_removetagsfromtimeentries`

A operação `Removetagsfromtimeentries` pertence ao grupo `Time Tracking` e usa
`DELETE /api/v2/team/{team_id}/time_entries/tags`.

A chamada altera o recurso indicado pelos parâmetros. Confira o resultado com a consulta correspondente antes de continuar.

A resposta preserva o JSON da API; respostas sem corpo retornam `{}`.
A API key do perfil precisa ter acesso ao recurso. As permissões e o plano do Workspace podem restringir o endpoint.
Os campos omitidos são tratados pelo servidor do ClickUp, sem padrões adicionais do cliente.

[Referência oficial](https://developer.clickup.com/reference/removetagsfromtimeentries).

| Entrada | Tipo | Obrigatória |
| --- | --- | --- |
| `path.team_id` | `number` | sim |
| `body` | objeto conforme `api describe` | sim |
| `confirm` | boolean, somente `true` | sim |

`account` é opcional e usa o perfil ativo ou fixado no MCP. O retorno aparece em
`content` como JSON; recusas retornam `isError: true`. Ferramentas de escrita
ficam ausentes em `--read-only`. IDs explícitos devem respeitar a hierarquia fixada.

Exemplos:

Use o perfil ativo com o envelope mínimo:

```json
{
  "name": "clickupfy_api_v2_removetagsfromtimeentries",
  "arguments": {
    "path": {
      "team_id": 1
    },
    "body": {
      "time_entry_ids": [
        "exemplo-1"
      ],
      "tags": [
        {
          "name": "exemplo-1"
        }
      ]
    },
    "confirm": true
  }
}
```

Direcione a chamada ao perfil de desenvolvimento:

```json
{
  "name": "clickupfy_api_v2_removetagsfromtimeentries",
  "arguments": {
    "path": {
      "team_id": 1
    },
    "body": {
      "time_entry_ids": [
        "exemplo-1"
      ],
      "tags": [
        {
          "name": "exemplo-1"
        }
      ]
    },
    "confirm": true,
    "account": "dev"
  }
}
```

Use o perfil do produto, quando o MCP permitir selecionar outro perfil:

```json
{
  "name": "clickupfy_api_v2_removetagsfromtimeentries",
  "arguments": {
    "path": {
      "team_id": 1
    },
    "body": {
      "time_entry_ids": [
        "exemplo-1"
      ],
      "tags": [
        {
          "name": "exemplo-1"
        }
      ]
    },
    "confirm": true,
    "account": "produto"
  }
}
```

Consulte o schema antes de compor uma chamada pelo agente:

```bash
clickupfy api describe clickupfy_api_v2_removetagsfromtimeentries
```

Reproduza pelo CLI a entrada usada pelo agente, sem executar a operação:

```bash
printf '%s' '{"path":{"team_id":1},"body":{"time_entry_ids":["exemplo-1"],"tags":[{"name":"exemplo-1"}]},"confirm":true}' | clickupfy api v2-removetagsfromtimeentries --input - --dry-run
```

### `clickupfy api v2-startatime-entry`

A operação `StartatimeEntry` pertence ao grupo `Time Tracking` e usa
`POST /api/v2/team/{team_Id}/time_entries/start`.

A chamada altera o recurso indicado pelos parâmetros. Confira o resultado com a consulta correspondente antes de continuar.

A resposta preserva o JSON da API; respostas sem corpo retornam `{}`.
A API key do perfil precisa ter acesso ao recurso. As permissões e o plano do Workspace podem restringir o endpoint.
Os campos omitidos são tratados pelo servidor do ClickUp, sem padrões adicionais do cliente.

[Referência oficial](https://developer.clickup.com/reference/startatimeentry).

| Entrada | Tipo | Obrigatória |
| --- | --- | --- |
| `path.team_Id` | `number` | sim |
| `query.custom_task_ids` | `boolean` | não |
| `query.team_id` | `number` | não |
| `body` | objeto conforme `api describe` | sim |

O comando aceita as flags comuns de `api`: `--input`, `--path`, `--query`,
`--body`, `--body-file`, `--content-type`, `--file`, `--dry-run` e `--yes`.
A referência completa de tipos, campos aninhados e valores permitidos está no comando `describe` abaixo.

Exemplos:

Consulte o contrato antes de preencher os IDs reais:

```bash
clickupfy api describe v2-startatime-entry
```

Valide uma entrada em arquivo sem enviar uma requisição:

```bash
clickupfy api v2-startatime-entry --input entrada.json --dry-run
```

Use um envelope JSON pelo stdin:

```bash
printf '%s' '{"path":{"team_Id":1},"body":{}}' | clickupfy api v2-startatime-entry --input -
```

Selecione o perfil que tem acesso ao recurso:

```bash
clickupfy --account produto api v2-startatime-entry --input entrada.json
```

Grave a resposta JSON para conferência. O arquivo de entrada usa o envelope do exemplo anterior:

```bash
clickupfy --json api v2-startatime-entry --input entrada.json > resposta.json
```

### `clickupfy_api_v2_startatime_entry`

A operação `StartatimeEntry` pertence ao grupo `Time Tracking` e usa
`POST /api/v2/team/{team_Id}/time_entries/start`.

A chamada altera o recurso indicado pelos parâmetros. Confira o resultado com a consulta correspondente antes de continuar.

A resposta preserva o JSON da API; respostas sem corpo retornam `{}`.
A API key do perfil precisa ter acesso ao recurso. As permissões e o plano do Workspace podem restringir o endpoint.
Os campos omitidos são tratados pelo servidor do ClickUp, sem padrões adicionais do cliente.

[Referência oficial](https://developer.clickup.com/reference/startatimeentry).

| Entrada | Tipo | Obrigatória |
| --- | --- | --- |
| `path.team_Id` | `number` | sim |
| `query.custom_task_ids` | `boolean` | não |
| `query.team_id` | `number` | não |
| `body` | objeto conforme `api describe` | sim |

`account` é opcional e usa o perfil ativo ou fixado no MCP. O retorno aparece em
`content` como JSON; recusas retornam `isError: true`. Ferramentas de escrita
ficam ausentes em `--read-only`. IDs explícitos devem respeitar a hierarquia fixada.

Exemplos:

Use o perfil ativo com o envelope mínimo:

```json
{
  "name": "clickupfy_api_v2_startatime_entry",
  "arguments": {
    "path": {
      "team_Id": 1
    },
    "body": {}
  }
}
```

Direcione a chamada ao perfil de desenvolvimento:

```json
{
  "name": "clickupfy_api_v2_startatime_entry",
  "arguments": {
    "path": {
      "team_Id": 1
    },
    "body": {},
    "account": "dev"
  }
}
```

Use o perfil do produto, quando o MCP permitir selecionar outro perfil:

```json
{
  "name": "clickupfy_api_v2_startatime_entry",
  "arguments": {
    "path": {
      "team_Id": 1
    },
    "body": {},
    "account": "produto"
  }
}
```

Consulte o schema antes de compor uma chamada pelo agente:

```bash
clickupfy api describe clickupfy_api_v2_startatime_entry
```

Reproduza pelo CLI a entrada usada pelo agente, sem executar a operação:

```bash
printf '%s' '{"path":{"team_Id":1},"body":{}}' | clickupfy api v2-startatime-entry --input - --dry-run
```

### `clickupfy api v2-stopatime-entry`

A operação `StopatimeEntry` pertence ao grupo `Time Tracking` e usa
`POST /api/v2/team/{team_id}/time_entries/stop`.

A chamada altera o recurso indicado pelos parâmetros. Confira o resultado com a consulta correspondente antes de continuar.

A resposta preserva o JSON da API; respostas sem corpo retornam `{}`.
A API key do perfil precisa ter acesso ao recurso. As permissões e o plano do Workspace podem restringir o endpoint.
Os campos omitidos são tratados pelo servidor do ClickUp, sem padrões adicionais do cliente.

[Referência oficial](https://developer.clickup.com/reference/stopatimeentry).

| Entrada | Tipo | Obrigatória |
| --- | --- | --- |
| `path.team_id` | `number` | sim |

O comando aceita as flags comuns de `api`: `--input`, `--path`, `--query`,
`--body`, `--body-file`, `--content-type`, `--file`, `--dry-run` e `--yes`.
A referência completa de tipos, campos aninhados e valores permitidos está no comando `describe` abaixo.

Exemplos:

Consulte o contrato antes de preencher os IDs reais:

```bash
clickupfy api describe v2-stopatime-entry
```

Valide uma entrada em arquivo sem enviar uma requisição:

```bash
clickupfy api v2-stopatime-entry --input entrada.json --dry-run
```

Use um envelope JSON pelo stdin:

```bash
printf '%s' '{"path":{"team_id":1}}' | clickupfy api v2-stopatime-entry --input -
```

Selecione o perfil que tem acesso ao recurso:

```bash
clickupfy --account produto api v2-stopatime-entry --input entrada.json
```

Grave a resposta JSON para conferência. O arquivo de entrada usa o envelope do exemplo anterior:

```bash
clickupfy --json api v2-stopatime-entry --input entrada.json > resposta.json
```

### `clickupfy_api_v2_stopatime_entry`

A operação `StopatimeEntry` pertence ao grupo `Time Tracking` e usa
`POST /api/v2/team/{team_id}/time_entries/stop`.

A chamada altera o recurso indicado pelos parâmetros. Confira o resultado com a consulta correspondente antes de continuar.

A resposta preserva o JSON da API; respostas sem corpo retornam `{}`.
A API key do perfil precisa ter acesso ao recurso. As permissões e o plano do Workspace podem restringir o endpoint.
Os campos omitidos são tratados pelo servidor do ClickUp, sem padrões adicionais do cliente.

[Referência oficial](https://developer.clickup.com/reference/stopatimeentry).

| Entrada | Tipo | Obrigatória |
| --- | --- | --- |
| `path.team_id` | `number` | sim |

`account` é opcional e usa o perfil ativo ou fixado no MCP. O retorno aparece em
`content` como JSON; recusas retornam `isError: true`. Ferramentas de escrita
ficam ausentes em `--read-only`. IDs explícitos devem respeitar a hierarquia fixada.

Exemplos:

Use o perfil ativo com o envelope mínimo:

```json
{
  "name": "clickupfy_api_v2_stopatime_entry",
  "arguments": {
    "path": {
      "team_id": 1
    }
  }
}
```

Direcione a chamada ao perfil de desenvolvimento:

```json
{
  "name": "clickupfy_api_v2_stopatime_entry",
  "arguments": {
    "path": {
      "team_id": 1
    },
    "account": "dev"
  }
}
```

Use o perfil do produto, quando o MCP permitir selecionar outro perfil:

```json
{
  "name": "clickupfy_api_v2_stopatime_entry",
  "arguments": {
    "path": {
      "team_id": 1
    },
    "account": "produto"
  }
}
```

Consulte o schema antes de compor uma chamada pelo agente:

```bash
clickupfy api describe clickupfy_api_v2_stopatime_entry
```

Reproduza pelo CLI a entrada usada pelo agente, sem executar a operação:

```bash
printf '%s' '{"path":{"team_id":1}}' | clickupfy api v2-stopatime-entry --input - --dry-run
```

### `clickupfy api v2-invite-user-to-workspace`

A operação `InviteUserToWorkspace` pertence ao grupo `Users` e usa
`POST /api/v2/team/{team_id}/user`.

A chamada altera o recurso indicado pelos parâmetros. Confira o resultado com a consulta correspondente antes de continuar.

A resposta preserva o JSON da API; respostas sem corpo retornam `{}`.
A API key do perfil precisa ter acesso ao recurso. As permissões e o plano do Workspace podem restringir o endpoint.
Os campos omitidos são tratados pelo servidor do ClickUp, sem padrões adicionais do cliente.

[Referência oficial](https://developer.clickup.com/reference/inviteusertoworkspace).

| Entrada | Tipo | Obrigatória |
| --- | --- | --- |
| `path.team_id` | `number` | sim |
| `body` | objeto conforme `api describe` | sim |

O comando aceita as flags comuns de `api`: `--input`, `--path`, `--query`,
`--body`, `--body-file`, `--content-type`, `--file`, `--dry-run` e `--yes`.
A referência completa de tipos, campos aninhados e valores permitidos está no comando `describe` abaixo.

Exemplos:

Consulte o contrato antes de preencher os IDs reais:

```bash
clickupfy api describe v2-invite-user-to-workspace
```

Valide uma entrada em arquivo sem enviar uma requisição:

```bash
clickupfy api v2-invite-user-to-workspace --input entrada.json --dry-run
```

Use um envelope JSON pelo stdin:

```bash
printf '%s' '{"path":{"team_id":1},"body":{"email":"exemplo-1","admin":true}}' | clickupfy api v2-invite-user-to-workspace --input -
```

Selecione o perfil que tem acesso ao recurso:

```bash
clickupfy --account produto api v2-invite-user-to-workspace --input entrada.json
```

Grave a resposta JSON para conferência. O arquivo de entrada usa o envelope do exemplo anterior:

```bash
clickupfy --json api v2-invite-user-to-workspace --input entrada.json > resposta.json
```

### `clickupfy_api_v2_invite_user_to_workspace`

A operação `InviteUserToWorkspace` pertence ao grupo `Users` e usa
`POST /api/v2/team/{team_id}/user`.

A chamada altera o recurso indicado pelos parâmetros. Confira o resultado com a consulta correspondente antes de continuar.

A resposta preserva o JSON da API; respostas sem corpo retornam `{}`.
A API key do perfil precisa ter acesso ao recurso. As permissões e o plano do Workspace podem restringir o endpoint.
Os campos omitidos são tratados pelo servidor do ClickUp, sem padrões adicionais do cliente.

[Referência oficial](https://developer.clickup.com/reference/inviteusertoworkspace).

| Entrada | Tipo | Obrigatória |
| --- | --- | --- |
| `path.team_id` | `number` | sim |
| `body` | objeto conforme `api describe` | sim |

`account` é opcional e usa o perfil ativo ou fixado no MCP. O retorno aparece em
`content` como JSON; recusas retornam `isError: true`. Ferramentas de escrita
ficam ausentes em `--read-only`. IDs explícitos devem respeitar a hierarquia fixada.

Exemplos:

Use o perfil ativo com o envelope mínimo:

```json
{
  "name": "clickupfy_api_v2_invite_user_to_workspace",
  "arguments": {
    "path": {
      "team_id": 1
    },
    "body": {
      "email": "exemplo-1",
      "admin": true
    }
  }
}
```

Direcione a chamada ao perfil de desenvolvimento:

```json
{
  "name": "clickupfy_api_v2_invite_user_to_workspace",
  "arguments": {
    "path": {
      "team_id": 1
    },
    "body": {
      "email": "exemplo-1",
      "admin": true
    },
    "account": "dev"
  }
}
```

Use o perfil do produto, quando o MCP permitir selecionar outro perfil:

```json
{
  "name": "clickupfy_api_v2_invite_user_to_workspace",
  "arguments": {
    "path": {
      "team_id": 1
    },
    "body": {
      "email": "exemplo-1",
      "admin": true
    },
    "account": "produto"
  }
}
```

Consulte o schema antes de compor uma chamada pelo agente:

```bash
clickupfy api describe clickupfy_api_v2_invite_user_to_workspace
```

Reproduza pelo CLI a entrada usada pelo agente, sem executar a operação:

```bash
printf '%s' '{"path":{"team_id":1},"body":{"email":"exemplo-1","admin":true}}' | clickupfy api v2-invite-user-to-workspace --input - --dry-run
```

### `clickupfy api v2-get-user`

A operação `GetUser` pertence ao grupo `Users` e usa
`GET /api/v2/team/{team_id}/user/{user_id}`.

A chamada consulta o recurso sem modificá-lo.

A resposta preserva o JSON da API; respostas sem corpo retornam `{}`.
A API key do perfil precisa ter acesso ao recurso. As permissões e o plano do Workspace podem restringir o endpoint.
Os campos omitidos são tratados pelo servidor do ClickUp, sem padrões adicionais do cliente.

[Referência oficial](https://developer.clickup.com/reference/getuser).

| Entrada | Tipo | Obrigatória |
| --- | --- | --- |
| `path.team_id` | `number` | sim |
| `path.user_id` | `number` | sim |
| `query.include_shared` | `boolean` | não |

O comando aceita as flags comuns de `api`: `--input`, `--path`, `--query`,
`--body`, `--body-file`, `--content-type`, `--file`, `--dry-run` e `--yes`.
A referência completa de tipos, campos aninhados e valores permitidos está no comando `describe` abaixo.

Exemplos:

Consulte o contrato antes de preencher os IDs reais:

```bash
clickupfy api describe v2-get-user
```

Valide uma entrada em arquivo sem enviar uma requisição:

```bash
clickupfy api v2-get-user --input entrada.json --dry-run
```

Use um envelope JSON pelo stdin:

```bash
printf '%s' '{"path":{"team_id":1,"user_id":1}}' | clickupfy api v2-get-user --input -
```

Selecione o perfil que tem acesso ao recurso:

```bash
clickupfy --account produto api v2-get-user --input entrada.json
```

Grave a resposta JSON para conferência. O arquivo de entrada usa o envelope do exemplo anterior:

```bash
clickupfy --json api v2-get-user --input entrada.json > resposta.json
```

### `clickupfy_api_v2_get_user`

A operação `GetUser` pertence ao grupo `Users` e usa
`GET /api/v2/team/{team_id}/user/{user_id}`.

A chamada consulta o recurso sem modificá-lo.

A resposta preserva o JSON da API; respostas sem corpo retornam `{}`.
A API key do perfil precisa ter acesso ao recurso. As permissões e o plano do Workspace podem restringir o endpoint.
Os campos omitidos são tratados pelo servidor do ClickUp, sem padrões adicionais do cliente.

[Referência oficial](https://developer.clickup.com/reference/getuser).

| Entrada | Tipo | Obrigatória |
| --- | --- | --- |
| `path.team_id` | `number` | sim |
| `path.user_id` | `number` | sim |
| `query.include_shared` | `boolean` | não |

`account` é opcional e usa o perfil ativo ou fixado no MCP. O retorno aparece em
`content` como JSON; recusas retornam `isError: true`. Ferramentas de escrita
ficam ausentes em `--read-only`. IDs explícitos devem respeitar a hierarquia fixada.

Exemplos:

Use o perfil ativo com o envelope mínimo:

```json
{
  "name": "clickupfy_api_v2_get_user",
  "arguments": {
    "path": {
      "team_id": 1,
      "user_id": 1
    }
  }
}
```

Direcione a chamada ao perfil de desenvolvimento:

```json
{
  "name": "clickupfy_api_v2_get_user",
  "arguments": {
    "path": {
      "team_id": 1,
      "user_id": 1
    },
    "account": "dev"
  }
}
```

Use o perfil do produto, quando o MCP permitir selecionar outro perfil:

```json
{
  "name": "clickupfy_api_v2_get_user",
  "arguments": {
    "path": {
      "team_id": 1,
      "user_id": 1
    },
    "account": "produto"
  }
}
```

Consulte o schema antes de compor uma chamada pelo agente:

```bash
clickupfy api describe clickupfy_api_v2_get_user
```

Reproduza pelo CLI a entrada usada pelo agente, sem executar a operação:

```bash
printf '%s' '{"path":{"team_id":1,"user_id":1}}' | clickupfy api v2-get-user --input - --dry-run
```

### `clickupfy api v2-edit-user-on-workspace`

A operação `EditUserOnWorkspace` pertence ao grupo `Users` e usa
`PUT /api/v2/team/{team_id}/user/{user_id}`.

A chamada altera o recurso indicado pelos parâmetros. Confira o resultado com a consulta correspondente antes de continuar.

A resposta preserva o JSON da API; respostas sem corpo retornam `{}`.
A API key do perfil precisa ter acesso ao recurso. As permissões e o plano do Workspace podem restringir o endpoint.
Os campos omitidos são tratados pelo servidor do ClickUp, sem padrões adicionais do cliente.

[Referência oficial](https://developer.clickup.com/reference/edituseronworkspace).

| Entrada | Tipo | Obrigatória |
| --- | --- | --- |
| `path.team_id` | `number` | sim |
| `path.user_id` | `number` | sim |
| `body` | objeto conforme `api describe` | sim |

O comando aceita as flags comuns de `api`: `--input`, `--path`, `--query`,
`--body`, `--body-file`, `--content-type`, `--file`, `--dry-run` e `--yes`.
A referência completa de tipos, campos aninhados e valores permitidos está no comando `describe` abaixo.

Exemplos:

Consulte o contrato antes de preencher os IDs reais:

```bash
clickupfy api describe v2-edit-user-on-workspace
```

Valide uma entrada em arquivo sem enviar uma requisição:

```bash
clickupfy api v2-edit-user-on-workspace --input entrada.json --dry-run
```

Use um envelope JSON pelo stdin:

```bash
printf '%s' '{"path":{"team_id":1,"user_id":1},"body":{"username":"exemplo-1","admin":true,"custom_role_id":1}}' | clickupfy api v2-edit-user-on-workspace --input -
```

Selecione o perfil que tem acesso ao recurso:

```bash
clickupfy --account produto api v2-edit-user-on-workspace --input entrada.json
```

Grave a resposta JSON para conferência. O arquivo de entrada usa o envelope do exemplo anterior:

```bash
clickupfy --json api v2-edit-user-on-workspace --input entrada.json > resposta.json
```

### `clickupfy_api_v2_edit_user_on_workspace`

A operação `EditUserOnWorkspace` pertence ao grupo `Users` e usa
`PUT /api/v2/team/{team_id}/user/{user_id}`.

A chamada altera o recurso indicado pelos parâmetros. Confira o resultado com a consulta correspondente antes de continuar.

A resposta preserva o JSON da API; respostas sem corpo retornam `{}`.
A API key do perfil precisa ter acesso ao recurso. As permissões e o plano do Workspace podem restringir o endpoint.
Os campos omitidos são tratados pelo servidor do ClickUp, sem padrões adicionais do cliente.

[Referência oficial](https://developer.clickup.com/reference/edituseronworkspace).

| Entrada | Tipo | Obrigatória |
| --- | --- | --- |
| `path.team_id` | `number` | sim |
| `path.user_id` | `number` | sim |
| `body` | objeto conforme `api describe` | sim |

`account` é opcional e usa o perfil ativo ou fixado no MCP. O retorno aparece em
`content` como JSON; recusas retornam `isError: true`. Ferramentas de escrita
ficam ausentes em `--read-only`. IDs explícitos devem respeitar a hierarquia fixada.

Exemplos:

Use o perfil ativo com o envelope mínimo:

```json
{
  "name": "clickupfy_api_v2_edit_user_on_workspace",
  "arguments": {
    "path": {
      "team_id": 1,
      "user_id": 1
    },
    "body": {
      "username": "exemplo-1",
      "admin": true,
      "custom_role_id": 1
    }
  }
}
```

Direcione a chamada ao perfil de desenvolvimento:

```json
{
  "name": "clickupfy_api_v2_edit_user_on_workspace",
  "arguments": {
    "path": {
      "team_id": 1,
      "user_id": 1
    },
    "body": {
      "username": "exemplo-1",
      "admin": true,
      "custom_role_id": 1
    },
    "account": "dev"
  }
}
```

Use o perfil do produto, quando o MCP permitir selecionar outro perfil:

```json
{
  "name": "clickupfy_api_v2_edit_user_on_workspace",
  "arguments": {
    "path": {
      "team_id": 1,
      "user_id": 1
    },
    "body": {
      "username": "exemplo-1",
      "admin": true,
      "custom_role_id": 1
    },
    "account": "produto"
  }
}
```

Consulte o schema antes de compor uma chamada pelo agente:

```bash
clickupfy api describe clickupfy_api_v2_edit_user_on_workspace
```

Reproduza pelo CLI a entrada usada pelo agente, sem executar a operação:

```bash
printf '%s' '{"path":{"team_id":1,"user_id":1},"body":{"username":"exemplo-1","admin":true,"custom_role_id":1}}' | clickupfy api v2-edit-user-on-workspace --input - --dry-run
```

### `clickupfy api v2-remove-user-from-workspace`

A operação `RemoveUserFromWorkspace` pertence ao grupo `Users` e usa
`DELETE /api/v2/team/{team_id}/user/{user_id}`.

A chamada altera o recurso indicado pelos parâmetros. Confira o resultado com a consulta correspondente antes de continuar.

A resposta preserva o JSON da API; respostas sem corpo retornam `{}`.
A API key do perfil precisa ter acesso ao recurso. As permissões e o plano do Workspace podem restringir o endpoint.
Os campos omitidos são tratados pelo servidor do ClickUp, sem padrões adicionais do cliente.

[Referência oficial](https://developer.clickup.com/reference/removeuserfromworkspace).

| Entrada | Tipo | Obrigatória |
| --- | --- | --- |
| `path.team_id` | `number` | sim |
| `path.user_id` | `number` | sim |
| `confirm` | boolean, somente `true` | sim |

O comando aceita as flags comuns de `api`: `--input`, `--path`, `--query`,
`--body`, `--body-file`, `--content-type`, `--file`, `--dry-run` e `--yes`.
A referência completa de tipos, campos aninhados e valores permitidos está no comando `describe` abaixo.

Exemplos:

Consulte o contrato antes de preencher os IDs reais:

```bash
clickupfy api describe v2-remove-user-from-workspace
```

Valide uma entrada em arquivo sem enviar uma requisição:

```bash
clickupfy api v2-remove-user-from-workspace --input entrada.json --dry-run
```

Use um envelope JSON pelo stdin:

```bash
printf '%s' '{"path":{"team_id":1,"user_id":1},"confirm":true}' | clickupfy api v2-remove-user-from-workspace --input -
```

Selecione o perfil que tem acesso ao recurso:

```bash
clickupfy --account produto api v2-remove-user-from-workspace --input entrada.json
```

Grave a resposta JSON para conferência. O arquivo de entrada usa o envelope do exemplo anterior:

```bash
clickupfy --json api v2-remove-user-from-workspace --input entrada.json > resposta.json
```

### `clickupfy_api_v2_remove_user_from_workspace`

A operação `RemoveUserFromWorkspace` pertence ao grupo `Users` e usa
`DELETE /api/v2/team/{team_id}/user/{user_id}`.

A chamada altera o recurso indicado pelos parâmetros. Confira o resultado com a consulta correspondente antes de continuar.

A resposta preserva o JSON da API; respostas sem corpo retornam `{}`.
A API key do perfil precisa ter acesso ao recurso. As permissões e o plano do Workspace podem restringir o endpoint.
Os campos omitidos são tratados pelo servidor do ClickUp, sem padrões adicionais do cliente.

[Referência oficial](https://developer.clickup.com/reference/removeuserfromworkspace).

| Entrada | Tipo | Obrigatória |
| --- | --- | --- |
| `path.team_id` | `number` | sim |
| `path.user_id` | `number` | sim |
| `confirm` | boolean, somente `true` | sim |

`account` é opcional e usa o perfil ativo ou fixado no MCP. O retorno aparece em
`content` como JSON; recusas retornam `isError: true`. Ferramentas de escrita
ficam ausentes em `--read-only`. IDs explícitos devem respeitar a hierarquia fixada.

Exemplos:

Use o perfil ativo com o envelope mínimo:

```json
{
  "name": "clickupfy_api_v2_remove_user_from_workspace",
  "arguments": {
    "path": {
      "team_id": 1,
      "user_id": 1
    },
    "confirm": true
  }
}
```

Direcione a chamada ao perfil de desenvolvimento:

```json
{
  "name": "clickupfy_api_v2_remove_user_from_workspace",
  "arguments": {
    "path": {
      "team_id": 1,
      "user_id": 1
    },
    "confirm": true,
    "account": "dev"
  }
}
```

Use o perfil do produto, quando o MCP permitir selecionar outro perfil:

```json
{
  "name": "clickupfy_api_v2_remove_user_from_workspace",
  "arguments": {
    "path": {
      "team_id": 1,
      "user_id": 1
    },
    "confirm": true,
    "account": "produto"
  }
}
```

Consulte o schema antes de compor uma chamada pelo agente:

```bash
clickupfy api describe clickupfy_api_v2_remove_user_from_workspace
```

Reproduza pelo CLI a entrada usada pelo agente, sem executar a operação:

```bash
printf '%s' '{"path":{"team_id":1,"user_id":1},"confirm":true}' | clickupfy api v2-remove-user-from-workspace --input - --dry-run
```

### `clickupfy api v2-get-team-views`

A operação `GetTeamViews` pertence ao grupo `Views` e usa
`GET /api/v2/team/{team_id}/view`.

A chamada consulta o recurso sem modificá-lo.

A resposta preserva o JSON da API; respostas sem corpo retornam `{}`.
A API key do perfil precisa ter acesso ao recurso. As permissões e o plano do Workspace podem restringir o endpoint.
Os campos omitidos são tratados pelo servidor do ClickUp, sem padrões adicionais do cliente.

[Referência oficial](https://developer.clickup.com/reference/getteamviews).

| Entrada | Tipo | Obrigatória |
| --- | --- | --- |
| `path.team_id` | `number` | sim |

O comando aceita as flags comuns de `api`: `--input`, `--path`, `--query`,
`--body`, `--body-file`, `--content-type`, `--file`, `--dry-run` e `--yes`.
A referência completa de tipos, campos aninhados e valores permitidos está no comando `describe` abaixo.

Exemplos:

Consulte o contrato antes de preencher os IDs reais:

```bash
clickupfy api describe v2-get-team-views
```

Valide uma entrada em arquivo sem enviar uma requisição:

```bash
clickupfy api v2-get-team-views --input entrada.json --dry-run
```

Use um envelope JSON pelo stdin:

```bash
printf '%s' '{"path":{"team_id":1}}' | clickupfy api v2-get-team-views --input -
```

Selecione o perfil que tem acesso ao recurso:

```bash
clickupfy --account produto api v2-get-team-views --input entrada.json
```

Grave a resposta JSON para conferência. O arquivo de entrada usa o envelope do exemplo anterior:

```bash
clickupfy --json api v2-get-team-views --input entrada.json > resposta.json
```

### `clickupfy_api_v2_get_team_views`

A operação `GetTeamViews` pertence ao grupo `Views` e usa
`GET /api/v2/team/{team_id}/view`.

A chamada consulta o recurso sem modificá-lo.

A resposta preserva o JSON da API; respostas sem corpo retornam `{}`.
A API key do perfil precisa ter acesso ao recurso. As permissões e o plano do Workspace podem restringir o endpoint.
Os campos omitidos são tratados pelo servidor do ClickUp, sem padrões adicionais do cliente.

[Referência oficial](https://developer.clickup.com/reference/getteamviews).

| Entrada | Tipo | Obrigatória |
| --- | --- | --- |
| `path.team_id` | `number` | sim |

`account` é opcional e usa o perfil ativo ou fixado no MCP. O retorno aparece em
`content` como JSON; recusas retornam `isError: true`. Ferramentas de escrita
ficam ausentes em `--read-only`. IDs explícitos devem respeitar a hierarquia fixada.

Exemplos:

Use o perfil ativo com o envelope mínimo:

```json
{
  "name": "clickupfy_api_v2_get_team_views",
  "arguments": {
    "path": {
      "team_id": 1
    }
  }
}
```

Direcione a chamada ao perfil de desenvolvimento:

```json
{
  "name": "clickupfy_api_v2_get_team_views",
  "arguments": {
    "path": {
      "team_id": 1
    },
    "account": "dev"
  }
}
```

Use o perfil do produto, quando o MCP permitir selecionar outro perfil:

```json
{
  "name": "clickupfy_api_v2_get_team_views",
  "arguments": {
    "path": {
      "team_id": 1
    },
    "account": "produto"
  }
}
```

Consulte o schema antes de compor uma chamada pelo agente:

```bash
clickupfy api describe clickupfy_api_v2_get_team_views
```

Reproduza pelo CLI a entrada usada pelo agente, sem executar a operação:

```bash
printf '%s' '{"path":{"team_id":1}}' | clickupfy api v2-get-team-views --input - --dry-run
```

### `clickupfy api v2-create-team-view`

A operação `CreateTeamView` pertence ao grupo `Views` e usa
`POST /api/v2/team/{team_id}/view`.

A chamada altera o recurso indicado pelos parâmetros. Confira o resultado com a consulta correspondente antes de continuar.

A resposta preserva o JSON da API; respostas sem corpo retornam `{}`.
A API key do perfil precisa ter acesso ao recurso. As permissões e o plano do Workspace podem restringir o endpoint.
Os campos omitidos são tratados pelo servidor do ClickUp, sem padrões adicionais do cliente.

[Referência oficial](https://developer.clickup.com/reference/createteamview).

| Entrada | Tipo | Obrigatória |
| --- | --- | --- |
| `path.team_id` | `number` | sim |
| `body` | objeto conforme `api describe` | sim |

O comando aceita as flags comuns de `api`: `--input`, `--path`, `--query`,
`--body`, `--body-file`, `--content-type`, `--file`, `--dry-run` e `--yes`.
A referência completa de tipos, campos aninhados e valores permitidos está no comando `describe` abaixo.

Exemplos:

Consulte o contrato antes de preencher os IDs reais:

```bash
clickupfy api describe v2-create-team-view
```

Valide uma entrada em arquivo sem enviar uma requisição:

```bash
clickupfy api v2-create-team-view --input entrada.json --dry-run
```

Use um envelope JSON pelo stdin:

```bash
printf '%s' '{"path":{"team_id":1},"body":{"name":"exemplo-1","type":"exemplo-1","grouping":{"field":"exemplo-1","dir":1,"collapsed":["exemplo-1"],"ignore":true},"divide":{"collapsed":["exemplo-1"]},"sorting":{"fields":["exemplo-1"]},"filters":{"op":"exemplo-1","fields":["exemplo-1"],"search":"exemplo-1","show_closed":true},"columns":{"fields":["exemplo-1"]},"team_sidebar":{"assignees":["exemplo-1"],"assigned_comments":true,"unassigned_tasks":true},"settings":{"show_task_locations":true,"show_subtasks":1,"show_subtask_parent_names":true,"show_closed_subtasks":true,"show_assignees":true,"show_images":true,"collapse_empty_columns":"exemplo-1","me_comments":true,"me_subtasks":true,"me_checklists":true}}}' | clickupfy api v2-create-team-view --input -
```

Selecione o perfil que tem acesso ao recurso:

```bash
clickupfy --account produto api v2-create-team-view --input entrada.json
```

Grave a resposta JSON para conferência. O arquivo de entrada usa o envelope do exemplo anterior:

```bash
clickupfy --json api v2-create-team-view --input entrada.json > resposta.json
```

### `clickupfy_api_v2_create_team_view`

A operação `CreateTeamView` pertence ao grupo `Views` e usa
`POST /api/v2/team/{team_id}/view`.

A chamada altera o recurso indicado pelos parâmetros. Confira o resultado com a consulta correspondente antes de continuar.

A resposta preserva o JSON da API; respostas sem corpo retornam `{}`.
A API key do perfil precisa ter acesso ao recurso. As permissões e o plano do Workspace podem restringir o endpoint.
Os campos omitidos são tratados pelo servidor do ClickUp, sem padrões adicionais do cliente.

[Referência oficial](https://developer.clickup.com/reference/createteamview).

| Entrada | Tipo | Obrigatória |
| --- | --- | --- |
| `path.team_id` | `number` | sim |
| `body` | objeto conforme `api describe` | sim |

`account` é opcional e usa o perfil ativo ou fixado no MCP. O retorno aparece em
`content` como JSON; recusas retornam `isError: true`. Ferramentas de escrita
ficam ausentes em `--read-only`. IDs explícitos devem respeitar a hierarquia fixada.

Exemplos:

Use o perfil ativo com o envelope mínimo:

```json
{
  "name": "clickupfy_api_v2_create_team_view",
  "arguments": {
    "path": {
      "team_id": 1
    },
    "body": {
      "name": "exemplo-1",
      "type": "exemplo-1",
      "grouping": {
        "field": "exemplo-1",
        "dir": 1,
        "collapsed": [
          "exemplo-1"
        ],
        "ignore": true
      },
      "divide": {
        "collapsed": [
          "exemplo-1"
        ]
      },
      "sorting": {
        "fields": [
          "exemplo-1"
        ]
      },
      "filters": {
        "op": "exemplo-1",
        "fields": [
          "exemplo-1"
        ],
        "search": "exemplo-1",
        "show_closed": true
      },
      "columns": {
        "fields": [
          "exemplo-1"
        ]
      },
      "team_sidebar": {
        "assignees": [
          "exemplo-1"
        ],
        "assigned_comments": true,
        "unassigned_tasks": true
      },
      "settings": {
        "show_task_locations": true,
        "show_subtasks": 1,
        "show_subtask_parent_names": true,
        "show_closed_subtasks": true,
        "show_assignees": true,
        "show_images": true,
        "collapse_empty_columns": "exemplo-1",
        "me_comments": true,
        "me_subtasks": true,
        "me_checklists": true
      }
    }
  }
}
```

Direcione a chamada ao perfil de desenvolvimento:

```json
{
  "name": "clickupfy_api_v2_create_team_view",
  "arguments": {
    "path": {
      "team_id": 1
    },
    "body": {
      "name": "exemplo-1",
      "type": "exemplo-1",
      "grouping": {
        "field": "exemplo-1",
        "dir": 1,
        "collapsed": [
          "exemplo-1"
        ],
        "ignore": true
      },
      "divide": {
        "collapsed": [
          "exemplo-1"
        ]
      },
      "sorting": {
        "fields": [
          "exemplo-1"
        ]
      },
      "filters": {
        "op": "exemplo-1",
        "fields": [
          "exemplo-1"
        ],
        "search": "exemplo-1",
        "show_closed": true
      },
      "columns": {
        "fields": [
          "exemplo-1"
        ]
      },
      "team_sidebar": {
        "assignees": [
          "exemplo-1"
        ],
        "assigned_comments": true,
        "unassigned_tasks": true
      },
      "settings": {
        "show_task_locations": true,
        "show_subtasks": 1,
        "show_subtask_parent_names": true,
        "show_closed_subtasks": true,
        "show_assignees": true,
        "show_images": true,
        "collapse_empty_columns": "exemplo-1",
        "me_comments": true,
        "me_subtasks": true,
        "me_checklists": true
      }
    },
    "account": "dev"
  }
}
```

Use o perfil do produto, quando o MCP permitir selecionar outro perfil:

```json
{
  "name": "clickupfy_api_v2_create_team_view",
  "arguments": {
    "path": {
      "team_id": 1
    },
    "body": {
      "name": "exemplo-1",
      "type": "exemplo-1",
      "grouping": {
        "field": "exemplo-1",
        "dir": 1,
        "collapsed": [
          "exemplo-1"
        ],
        "ignore": true
      },
      "divide": {
        "collapsed": [
          "exemplo-1"
        ]
      },
      "sorting": {
        "fields": [
          "exemplo-1"
        ]
      },
      "filters": {
        "op": "exemplo-1",
        "fields": [
          "exemplo-1"
        ],
        "search": "exemplo-1",
        "show_closed": true
      },
      "columns": {
        "fields": [
          "exemplo-1"
        ]
      },
      "team_sidebar": {
        "assignees": [
          "exemplo-1"
        ],
        "assigned_comments": true,
        "unassigned_tasks": true
      },
      "settings": {
        "show_task_locations": true,
        "show_subtasks": 1,
        "show_subtask_parent_names": true,
        "show_closed_subtasks": true,
        "show_assignees": true,
        "show_images": true,
        "collapse_empty_columns": "exemplo-1",
        "me_comments": true,
        "me_subtasks": true,
        "me_checklists": true
      }
    },
    "account": "produto"
  }
}
```

Consulte o schema antes de compor uma chamada pelo agente:

```bash
clickupfy api describe clickupfy_api_v2_create_team_view
```

Reproduza pelo CLI a entrada usada pelo agente, sem executar a operação:

```bash
printf '%s' '{"path":{"team_id":1},"body":{"name":"exemplo-1","type":"exemplo-1","grouping":{"field":"exemplo-1","dir":1,"collapsed":["exemplo-1"],"ignore":true},"divide":{"collapsed":["exemplo-1"]},"sorting":{"fields":["exemplo-1"]},"filters":{"op":"exemplo-1","fields":["exemplo-1"],"search":"exemplo-1","show_closed":true},"columns":{"fields":["exemplo-1"]},"team_sidebar":{"assignees":["exemplo-1"],"assigned_comments":true,"unassigned_tasks":true},"settings":{"show_task_locations":true,"show_subtasks":1,"show_subtask_parent_names":true,"show_closed_subtasks":true,"show_assignees":true,"show_images":true,"collapse_empty_columns":"exemplo-1","me_comments":true,"me_subtasks":true,"me_checklists":true}}}' | clickupfy api v2-create-team-view --input - --dry-run
```

### `clickupfy api v2-get-space-views`

A operação `GetSpaceViews` pertence ao grupo `Views` e usa
`GET /api/v2/space/{space_id}/view`.

A chamada consulta o recurso sem modificá-lo.

A resposta preserva o JSON da API; respostas sem corpo retornam `{}`.
A API key do perfil precisa ter acesso ao recurso. As permissões e o plano do Workspace podem restringir o endpoint.
Os campos omitidos são tratados pelo servidor do ClickUp, sem padrões adicionais do cliente.

[Referência oficial](https://developer.clickup.com/reference/getspaceviews).

| Entrada | Tipo | Obrigatória |
| --- | --- | --- |
| `path.space_id` | `number` | sim |

O comando aceita as flags comuns de `api`: `--input`, `--path`, `--query`,
`--body`, `--body-file`, `--content-type`, `--file`, `--dry-run` e `--yes`.
A referência completa de tipos, campos aninhados e valores permitidos está no comando `describe` abaixo.

Exemplos:

Consulte o contrato antes de preencher os IDs reais:

```bash
clickupfy api describe v2-get-space-views
```

Valide uma entrada em arquivo sem enviar uma requisição:

```bash
clickupfy api v2-get-space-views --input entrada.json --dry-run
```

Use um envelope JSON pelo stdin:

```bash
printf '%s' '{"path":{"space_id":1}}' | clickupfy api v2-get-space-views --input -
```

Selecione o perfil que tem acesso ao recurso:

```bash
clickupfy --account produto api v2-get-space-views --input entrada.json
```

Grave a resposta JSON para conferência. O arquivo de entrada usa o envelope do exemplo anterior:

```bash
clickupfy --json api v2-get-space-views --input entrada.json > resposta.json
```

### `clickupfy_api_v2_get_space_views`

A operação `GetSpaceViews` pertence ao grupo `Views` e usa
`GET /api/v2/space/{space_id}/view`.

A chamada consulta o recurso sem modificá-lo.

A resposta preserva o JSON da API; respostas sem corpo retornam `{}`.
A API key do perfil precisa ter acesso ao recurso. As permissões e o plano do Workspace podem restringir o endpoint.
Os campos omitidos são tratados pelo servidor do ClickUp, sem padrões adicionais do cliente.

[Referência oficial](https://developer.clickup.com/reference/getspaceviews).

| Entrada | Tipo | Obrigatória |
| --- | --- | --- |
| `path.space_id` | `number` | sim |

`account` é opcional e usa o perfil ativo ou fixado no MCP. O retorno aparece em
`content` como JSON; recusas retornam `isError: true`. Ferramentas de escrita
ficam ausentes em `--read-only`. IDs explícitos devem respeitar a hierarquia fixada.

Exemplos:

Use o perfil ativo com o envelope mínimo:

```json
{
  "name": "clickupfy_api_v2_get_space_views",
  "arguments": {
    "path": {
      "space_id": 1
    }
  }
}
```

Direcione a chamada ao perfil de desenvolvimento:

```json
{
  "name": "clickupfy_api_v2_get_space_views",
  "arguments": {
    "path": {
      "space_id": 1
    },
    "account": "dev"
  }
}
```

Use o perfil do produto, quando o MCP permitir selecionar outro perfil:

```json
{
  "name": "clickupfy_api_v2_get_space_views",
  "arguments": {
    "path": {
      "space_id": 1
    },
    "account": "produto"
  }
}
```

Consulte o schema antes de compor uma chamada pelo agente:

```bash
clickupfy api describe clickupfy_api_v2_get_space_views
```

Reproduza pelo CLI a entrada usada pelo agente, sem executar a operação:

```bash
printf '%s' '{"path":{"space_id":1}}' | clickupfy api v2-get-space-views --input - --dry-run
```

### `clickupfy api v2-create-space-view`

A operação `CreateSpaceView` pertence ao grupo `Views` e usa
`POST /api/v2/space/{space_id}/view`.

A chamada altera o recurso indicado pelos parâmetros. Confira o resultado com a consulta correspondente antes de continuar.

A resposta preserva o JSON da API; respostas sem corpo retornam `{}`.
A API key do perfil precisa ter acesso ao recurso. As permissões e o plano do Workspace podem restringir o endpoint.
Os campos omitidos são tratados pelo servidor do ClickUp, sem padrões adicionais do cliente.

[Referência oficial](https://developer.clickup.com/reference/createspaceview).

| Entrada | Tipo | Obrigatória |
| --- | --- | --- |
| `path.space_id` | `number` | sim |
| `body` | objeto conforme `api describe` | sim |

O comando aceita as flags comuns de `api`: `--input`, `--path`, `--query`,
`--body`, `--body-file`, `--content-type`, `--file`, `--dry-run` e `--yes`.
A referência completa de tipos, campos aninhados e valores permitidos está no comando `describe` abaixo.

Exemplos:

Consulte o contrato antes de preencher os IDs reais:

```bash
clickupfy api describe v2-create-space-view
```

Valide uma entrada em arquivo sem enviar uma requisição:

```bash
clickupfy api v2-create-space-view --input entrada.json --dry-run
```

Use um envelope JSON pelo stdin:

```bash
printf '%s' '{"path":{"space_id":1},"body":{"name":"exemplo-1","type":"exemplo-1","grouping":{"field":"exemplo-1","dir":1,"collapsed":["exemplo-1"],"ignore":true},"divide":{"collapsed":["exemplo-1"]},"sorting":{"fields":["exemplo-1"]},"filters":{"op":"exemplo-1","fields":["exemplo-1"],"search":"exemplo-1","show_closed":true},"columns":{"fields":["exemplo-1"]},"team_sidebar":{"assignees":["exemplo-1"],"assigned_comments":true,"unassigned_tasks":true},"settings":{"show_task_locations":true,"show_subtasks":1,"show_subtask_parent_names":true,"show_closed_subtasks":true,"show_assignees":true,"show_images":true,"collapse_empty_columns":"exemplo-1","me_comments":true,"me_subtasks":true,"me_checklists":true}}}' | clickupfy api v2-create-space-view --input -
```

Selecione o perfil que tem acesso ao recurso:

```bash
clickupfy --account produto api v2-create-space-view --input entrada.json
```

Grave a resposta JSON para conferência. O arquivo de entrada usa o envelope do exemplo anterior:

```bash
clickupfy --json api v2-create-space-view --input entrada.json > resposta.json
```

### `clickupfy_api_v2_create_space_view`

A operação `CreateSpaceView` pertence ao grupo `Views` e usa
`POST /api/v2/space/{space_id}/view`.

A chamada altera o recurso indicado pelos parâmetros. Confira o resultado com a consulta correspondente antes de continuar.

A resposta preserva o JSON da API; respostas sem corpo retornam `{}`.
A API key do perfil precisa ter acesso ao recurso. As permissões e o plano do Workspace podem restringir o endpoint.
Os campos omitidos são tratados pelo servidor do ClickUp, sem padrões adicionais do cliente.

[Referência oficial](https://developer.clickup.com/reference/createspaceview).

| Entrada | Tipo | Obrigatória |
| --- | --- | --- |
| `path.space_id` | `number` | sim |
| `body` | objeto conforme `api describe` | sim |

`account` é opcional e usa o perfil ativo ou fixado no MCP. O retorno aparece em
`content` como JSON; recusas retornam `isError: true`. Ferramentas de escrita
ficam ausentes em `--read-only`. IDs explícitos devem respeitar a hierarquia fixada.

Exemplos:

Use o perfil ativo com o envelope mínimo:

```json
{
  "name": "clickupfy_api_v2_create_space_view",
  "arguments": {
    "path": {
      "space_id": 1
    },
    "body": {
      "name": "exemplo-1",
      "type": "exemplo-1",
      "grouping": {
        "field": "exemplo-1",
        "dir": 1,
        "collapsed": [
          "exemplo-1"
        ],
        "ignore": true
      },
      "divide": {
        "collapsed": [
          "exemplo-1"
        ]
      },
      "sorting": {
        "fields": [
          "exemplo-1"
        ]
      },
      "filters": {
        "op": "exemplo-1",
        "fields": [
          "exemplo-1"
        ],
        "search": "exemplo-1",
        "show_closed": true
      },
      "columns": {
        "fields": [
          "exemplo-1"
        ]
      },
      "team_sidebar": {
        "assignees": [
          "exemplo-1"
        ],
        "assigned_comments": true,
        "unassigned_tasks": true
      },
      "settings": {
        "show_task_locations": true,
        "show_subtasks": 1,
        "show_subtask_parent_names": true,
        "show_closed_subtasks": true,
        "show_assignees": true,
        "show_images": true,
        "collapse_empty_columns": "exemplo-1",
        "me_comments": true,
        "me_subtasks": true,
        "me_checklists": true
      }
    }
  }
}
```

Direcione a chamada ao perfil de desenvolvimento:

```json
{
  "name": "clickupfy_api_v2_create_space_view",
  "arguments": {
    "path": {
      "space_id": 1
    },
    "body": {
      "name": "exemplo-1",
      "type": "exemplo-1",
      "grouping": {
        "field": "exemplo-1",
        "dir": 1,
        "collapsed": [
          "exemplo-1"
        ],
        "ignore": true
      },
      "divide": {
        "collapsed": [
          "exemplo-1"
        ]
      },
      "sorting": {
        "fields": [
          "exemplo-1"
        ]
      },
      "filters": {
        "op": "exemplo-1",
        "fields": [
          "exemplo-1"
        ],
        "search": "exemplo-1",
        "show_closed": true
      },
      "columns": {
        "fields": [
          "exemplo-1"
        ]
      },
      "team_sidebar": {
        "assignees": [
          "exemplo-1"
        ],
        "assigned_comments": true,
        "unassigned_tasks": true
      },
      "settings": {
        "show_task_locations": true,
        "show_subtasks": 1,
        "show_subtask_parent_names": true,
        "show_closed_subtasks": true,
        "show_assignees": true,
        "show_images": true,
        "collapse_empty_columns": "exemplo-1",
        "me_comments": true,
        "me_subtasks": true,
        "me_checklists": true
      }
    },
    "account": "dev"
  }
}
```

Use o perfil do produto, quando o MCP permitir selecionar outro perfil:

```json
{
  "name": "clickupfy_api_v2_create_space_view",
  "arguments": {
    "path": {
      "space_id": 1
    },
    "body": {
      "name": "exemplo-1",
      "type": "exemplo-1",
      "grouping": {
        "field": "exemplo-1",
        "dir": 1,
        "collapsed": [
          "exemplo-1"
        ],
        "ignore": true
      },
      "divide": {
        "collapsed": [
          "exemplo-1"
        ]
      },
      "sorting": {
        "fields": [
          "exemplo-1"
        ]
      },
      "filters": {
        "op": "exemplo-1",
        "fields": [
          "exemplo-1"
        ],
        "search": "exemplo-1",
        "show_closed": true
      },
      "columns": {
        "fields": [
          "exemplo-1"
        ]
      },
      "team_sidebar": {
        "assignees": [
          "exemplo-1"
        ],
        "assigned_comments": true,
        "unassigned_tasks": true
      },
      "settings": {
        "show_task_locations": true,
        "show_subtasks": 1,
        "show_subtask_parent_names": true,
        "show_closed_subtasks": true,
        "show_assignees": true,
        "show_images": true,
        "collapse_empty_columns": "exemplo-1",
        "me_comments": true,
        "me_subtasks": true,
        "me_checklists": true
      }
    },
    "account": "produto"
  }
}
```

Consulte o schema antes de compor uma chamada pelo agente:

```bash
clickupfy api describe clickupfy_api_v2_create_space_view
```

Reproduza pelo CLI a entrada usada pelo agente, sem executar a operação:

```bash
printf '%s' '{"path":{"space_id":1},"body":{"name":"exemplo-1","type":"exemplo-1","grouping":{"field":"exemplo-1","dir":1,"collapsed":["exemplo-1"],"ignore":true},"divide":{"collapsed":["exemplo-1"]},"sorting":{"fields":["exemplo-1"]},"filters":{"op":"exemplo-1","fields":["exemplo-1"],"search":"exemplo-1","show_closed":true},"columns":{"fields":["exemplo-1"]},"team_sidebar":{"assignees":["exemplo-1"],"assigned_comments":true,"unassigned_tasks":true},"settings":{"show_task_locations":true,"show_subtasks":1,"show_subtask_parent_names":true,"show_closed_subtasks":true,"show_assignees":true,"show_images":true,"collapse_empty_columns":"exemplo-1","me_comments":true,"me_subtasks":true,"me_checklists":true}}}' | clickupfy api v2-create-space-view --input - --dry-run
```

### `clickupfy api v2-get-folder-views`

A operação `GetFolderViews` pertence ao grupo `Views` e usa
`GET /api/v2/folder/{folder_id}/view`.

A chamada consulta o recurso sem modificá-lo.

A resposta preserva o JSON da API; respostas sem corpo retornam `{}`.
A API key do perfil precisa ter acesso ao recurso. As permissões e o plano do Workspace podem restringir o endpoint.
Os campos omitidos são tratados pelo servidor do ClickUp, sem padrões adicionais do cliente.

[Referência oficial](https://developer.clickup.com/reference/getfolderviews).

| Entrada | Tipo | Obrigatória |
| --- | --- | --- |
| `path.folder_id` | `number` | sim |

O comando aceita as flags comuns de `api`: `--input`, `--path`, `--query`,
`--body`, `--body-file`, `--content-type`, `--file`, `--dry-run` e `--yes`.
A referência completa de tipos, campos aninhados e valores permitidos está no comando `describe` abaixo.

Exemplos:

Consulte o contrato antes de preencher os IDs reais:

```bash
clickupfy api describe v2-get-folder-views
```

Valide uma entrada em arquivo sem enviar uma requisição:

```bash
clickupfy api v2-get-folder-views --input entrada.json --dry-run
```

Use um envelope JSON pelo stdin:

```bash
printf '%s' '{"path":{"folder_id":1}}' | clickupfy api v2-get-folder-views --input -
```

Selecione o perfil que tem acesso ao recurso:

```bash
clickupfy --account produto api v2-get-folder-views --input entrada.json
```

Grave a resposta JSON para conferência. O arquivo de entrada usa o envelope do exemplo anterior:

```bash
clickupfy --json api v2-get-folder-views --input entrada.json > resposta.json
```

### `clickupfy_api_v2_get_folder_views`

A operação `GetFolderViews` pertence ao grupo `Views` e usa
`GET /api/v2/folder/{folder_id}/view`.

A chamada consulta o recurso sem modificá-lo.

A resposta preserva o JSON da API; respostas sem corpo retornam `{}`.
A API key do perfil precisa ter acesso ao recurso. As permissões e o plano do Workspace podem restringir o endpoint.
Os campos omitidos são tratados pelo servidor do ClickUp, sem padrões adicionais do cliente.

[Referência oficial](https://developer.clickup.com/reference/getfolderviews).

| Entrada | Tipo | Obrigatória |
| --- | --- | --- |
| `path.folder_id` | `number` | sim |

`account` é opcional e usa o perfil ativo ou fixado no MCP. O retorno aparece em
`content` como JSON; recusas retornam `isError: true`. Ferramentas de escrita
ficam ausentes em `--read-only`. IDs explícitos devem respeitar a hierarquia fixada.

Exemplos:

Use o perfil ativo com o envelope mínimo:

```json
{
  "name": "clickupfy_api_v2_get_folder_views",
  "arguments": {
    "path": {
      "folder_id": 1
    }
  }
}
```

Direcione a chamada ao perfil de desenvolvimento:

```json
{
  "name": "clickupfy_api_v2_get_folder_views",
  "arguments": {
    "path": {
      "folder_id": 1
    },
    "account": "dev"
  }
}
```

Use o perfil do produto, quando o MCP permitir selecionar outro perfil:

```json
{
  "name": "clickupfy_api_v2_get_folder_views",
  "arguments": {
    "path": {
      "folder_id": 1
    },
    "account": "produto"
  }
}
```

Consulte o schema antes de compor uma chamada pelo agente:

```bash
clickupfy api describe clickupfy_api_v2_get_folder_views
```

Reproduza pelo CLI a entrada usada pelo agente, sem executar a operação:

```bash
printf '%s' '{"path":{"folder_id":1}}' | clickupfy api v2-get-folder-views --input - --dry-run
```

### `clickupfy api v2-create-folder-view`

A operação `CreateFolderView` pertence ao grupo `Views` e usa
`POST /api/v2/folder/{folder_id}/view`.

A chamada altera o recurso indicado pelos parâmetros. Confira o resultado com a consulta correspondente antes de continuar.

A resposta preserva o JSON da API; respostas sem corpo retornam `{}`.
A API key do perfil precisa ter acesso ao recurso. As permissões e o plano do Workspace podem restringir o endpoint.
Os campos omitidos são tratados pelo servidor do ClickUp, sem padrões adicionais do cliente.

[Referência oficial](https://developer.clickup.com/reference/createfolderview).

| Entrada | Tipo | Obrigatória |
| --- | --- | --- |
| `path.folder_id` | `number` | sim |
| `body` | objeto conforme `api describe` | sim |

O comando aceita as flags comuns de `api`: `--input`, `--path`, `--query`,
`--body`, `--body-file`, `--content-type`, `--file`, `--dry-run` e `--yes`.
A referência completa de tipos, campos aninhados e valores permitidos está no comando `describe` abaixo.

Exemplos:

Consulte o contrato antes de preencher os IDs reais:

```bash
clickupfy api describe v2-create-folder-view
```

Valide uma entrada em arquivo sem enviar uma requisição:

```bash
clickupfy api v2-create-folder-view --input entrada.json --dry-run
```

Use um envelope JSON pelo stdin:

```bash
printf '%s' '{"path":{"folder_id":1},"body":{"name":"exemplo-1","type":"exemplo-1","grouping":{"field":"exemplo-1","dir":1,"collapsed":["exemplo-1"],"ignore":true},"divide":{"collapsed":["exemplo-1"]},"sorting":{"fields":["exemplo-1"]},"filters":{"op":"exemplo-1","fields":["exemplo-1"],"search":"exemplo-1","show_closed":true},"columns":{"fields":["exemplo-1"]},"team_sidebar":{"assignees":["exemplo-1"],"assigned_comments":true,"unassigned_tasks":true},"settings":{"show_task_locations":true,"show_subtasks":1,"show_subtask_parent_names":true,"show_closed_subtasks":true,"show_assignees":true,"show_images":true,"collapse_empty_columns":"exemplo-1","me_comments":true,"me_subtasks":true,"me_checklists":true}}}' | clickupfy api v2-create-folder-view --input -
```

Selecione o perfil que tem acesso ao recurso:

```bash
clickupfy --account produto api v2-create-folder-view --input entrada.json
```

Grave a resposta JSON para conferência. O arquivo de entrada usa o envelope do exemplo anterior:

```bash
clickupfy --json api v2-create-folder-view --input entrada.json > resposta.json
```

### `clickupfy_api_v2_create_folder_view`

A operação `CreateFolderView` pertence ao grupo `Views` e usa
`POST /api/v2/folder/{folder_id}/view`.

A chamada altera o recurso indicado pelos parâmetros. Confira o resultado com a consulta correspondente antes de continuar.

A resposta preserva o JSON da API; respostas sem corpo retornam `{}`.
A API key do perfil precisa ter acesso ao recurso. As permissões e o plano do Workspace podem restringir o endpoint.
Os campos omitidos são tratados pelo servidor do ClickUp, sem padrões adicionais do cliente.

[Referência oficial](https://developer.clickup.com/reference/createfolderview).

| Entrada | Tipo | Obrigatória |
| --- | --- | --- |
| `path.folder_id` | `number` | sim |
| `body` | objeto conforme `api describe` | sim |

`account` é opcional e usa o perfil ativo ou fixado no MCP. O retorno aparece em
`content` como JSON; recusas retornam `isError: true`. Ferramentas de escrita
ficam ausentes em `--read-only`. IDs explícitos devem respeitar a hierarquia fixada.

Exemplos:

Use o perfil ativo com o envelope mínimo:

```json
{
  "name": "clickupfy_api_v2_create_folder_view",
  "arguments": {
    "path": {
      "folder_id": 1
    },
    "body": {
      "name": "exemplo-1",
      "type": "exemplo-1",
      "grouping": {
        "field": "exemplo-1",
        "dir": 1,
        "collapsed": [
          "exemplo-1"
        ],
        "ignore": true
      },
      "divide": {
        "collapsed": [
          "exemplo-1"
        ]
      },
      "sorting": {
        "fields": [
          "exemplo-1"
        ]
      },
      "filters": {
        "op": "exemplo-1",
        "fields": [
          "exemplo-1"
        ],
        "search": "exemplo-1",
        "show_closed": true
      },
      "columns": {
        "fields": [
          "exemplo-1"
        ]
      },
      "team_sidebar": {
        "assignees": [
          "exemplo-1"
        ],
        "assigned_comments": true,
        "unassigned_tasks": true
      },
      "settings": {
        "show_task_locations": true,
        "show_subtasks": 1,
        "show_subtask_parent_names": true,
        "show_closed_subtasks": true,
        "show_assignees": true,
        "show_images": true,
        "collapse_empty_columns": "exemplo-1",
        "me_comments": true,
        "me_subtasks": true,
        "me_checklists": true
      }
    }
  }
}
```

Direcione a chamada ao perfil de desenvolvimento:

```json
{
  "name": "clickupfy_api_v2_create_folder_view",
  "arguments": {
    "path": {
      "folder_id": 1
    },
    "body": {
      "name": "exemplo-1",
      "type": "exemplo-1",
      "grouping": {
        "field": "exemplo-1",
        "dir": 1,
        "collapsed": [
          "exemplo-1"
        ],
        "ignore": true
      },
      "divide": {
        "collapsed": [
          "exemplo-1"
        ]
      },
      "sorting": {
        "fields": [
          "exemplo-1"
        ]
      },
      "filters": {
        "op": "exemplo-1",
        "fields": [
          "exemplo-1"
        ],
        "search": "exemplo-1",
        "show_closed": true
      },
      "columns": {
        "fields": [
          "exemplo-1"
        ]
      },
      "team_sidebar": {
        "assignees": [
          "exemplo-1"
        ],
        "assigned_comments": true,
        "unassigned_tasks": true
      },
      "settings": {
        "show_task_locations": true,
        "show_subtasks": 1,
        "show_subtask_parent_names": true,
        "show_closed_subtasks": true,
        "show_assignees": true,
        "show_images": true,
        "collapse_empty_columns": "exemplo-1",
        "me_comments": true,
        "me_subtasks": true,
        "me_checklists": true
      }
    },
    "account": "dev"
  }
}
```

Use o perfil do produto, quando o MCP permitir selecionar outro perfil:

```json
{
  "name": "clickupfy_api_v2_create_folder_view",
  "arguments": {
    "path": {
      "folder_id": 1
    },
    "body": {
      "name": "exemplo-1",
      "type": "exemplo-1",
      "grouping": {
        "field": "exemplo-1",
        "dir": 1,
        "collapsed": [
          "exemplo-1"
        ],
        "ignore": true
      },
      "divide": {
        "collapsed": [
          "exemplo-1"
        ]
      },
      "sorting": {
        "fields": [
          "exemplo-1"
        ]
      },
      "filters": {
        "op": "exemplo-1",
        "fields": [
          "exemplo-1"
        ],
        "search": "exemplo-1",
        "show_closed": true
      },
      "columns": {
        "fields": [
          "exemplo-1"
        ]
      },
      "team_sidebar": {
        "assignees": [
          "exemplo-1"
        ],
        "assigned_comments": true,
        "unassigned_tasks": true
      },
      "settings": {
        "show_task_locations": true,
        "show_subtasks": 1,
        "show_subtask_parent_names": true,
        "show_closed_subtasks": true,
        "show_assignees": true,
        "show_images": true,
        "collapse_empty_columns": "exemplo-1",
        "me_comments": true,
        "me_subtasks": true,
        "me_checklists": true
      }
    },
    "account": "produto"
  }
}
```

Consulte o schema antes de compor uma chamada pelo agente:

```bash
clickupfy api describe clickupfy_api_v2_create_folder_view
```

Reproduza pelo CLI a entrada usada pelo agente, sem executar a operação:

```bash
printf '%s' '{"path":{"folder_id":1},"body":{"name":"exemplo-1","type":"exemplo-1","grouping":{"field":"exemplo-1","dir":1,"collapsed":["exemplo-1"],"ignore":true},"divide":{"collapsed":["exemplo-1"]},"sorting":{"fields":["exemplo-1"]},"filters":{"op":"exemplo-1","fields":["exemplo-1"],"search":"exemplo-1","show_closed":true},"columns":{"fields":["exemplo-1"]},"team_sidebar":{"assignees":["exemplo-1"],"assigned_comments":true,"unassigned_tasks":true},"settings":{"show_task_locations":true,"show_subtasks":1,"show_subtask_parent_names":true,"show_closed_subtasks":true,"show_assignees":true,"show_images":true,"collapse_empty_columns":"exemplo-1","me_comments":true,"me_subtasks":true,"me_checklists":true}}}' | clickupfy api v2-create-folder-view --input - --dry-run
```

### `clickupfy api v2-get-list-views`

A operação `GetListViews` pertence ao grupo `Views` e usa
`GET /api/v2/list/{list_id}/view`.

A chamada consulta o recurso sem modificá-lo.

A resposta preserva o JSON da API; respostas sem corpo retornam `{}`.
A API key do perfil precisa ter acesso ao recurso. As permissões e o plano do Workspace podem restringir o endpoint.
Os campos omitidos são tratados pelo servidor do ClickUp, sem padrões adicionais do cliente.

[Referência oficial](https://developer.clickup.com/reference/getlistviews).

| Entrada | Tipo | Obrigatória |
| --- | --- | --- |
| `path.list_id` | `number` | sim |

O comando aceita as flags comuns de `api`: `--input`, `--path`, `--query`,
`--body`, `--body-file`, `--content-type`, `--file`, `--dry-run` e `--yes`.
A referência completa de tipos, campos aninhados e valores permitidos está no comando `describe` abaixo.

Exemplos:

Consulte o contrato antes de preencher os IDs reais:

```bash
clickupfy api describe v2-get-list-views
```

Valide uma entrada em arquivo sem enviar uma requisição:

```bash
clickupfy api v2-get-list-views --input entrada.json --dry-run
```

Use um envelope JSON pelo stdin:

```bash
printf '%s' '{"path":{"list_id":1}}' | clickupfy api v2-get-list-views --input -
```

Selecione o perfil que tem acesso ao recurso:

```bash
clickupfy --account produto api v2-get-list-views --input entrada.json
```

Grave a resposta JSON para conferência. O arquivo de entrada usa o envelope do exemplo anterior:

```bash
clickupfy --json api v2-get-list-views --input entrada.json > resposta.json
```

### `clickupfy_api_v2_get_list_views`

A operação `GetListViews` pertence ao grupo `Views` e usa
`GET /api/v2/list/{list_id}/view`.

A chamada consulta o recurso sem modificá-lo.

A resposta preserva o JSON da API; respostas sem corpo retornam `{}`.
A API key do perfil precisa ter acesso ao recurso. As permissões e o plano do Workspace podem restringir o endpoint.
Os campos omitidos são tratados pelo servidor do ClickUp, sem padrões adicionais do cliente.

[Referência oficial](https://developer.clickup.com/reference/getlistviews).

| Entrada | Tipo | Obrigatória |
| --- | --- | --- |
| `path.list_id` | `number` | sim |

`account` é opcional e usa o perfil ativo ou fixado no MCP. O retorno aparece em
`content` como JSON; recusas retornam `isError: true`. Ferramentas de escrita
ficam ausentes em `--read-only`. IDs explícitos devem respeitar a hierarquia fixada.

Exemplos:

Use o perfil ativo com o envelope mínimo:

```json
{
  "name": "clickupfy_api_v2_get_list_views",
  "arguments": {
    "path": {
      "list_id": 1
    }
  }
}
```

Direcione a chamada ao perfil de desenvolvimento:

```json
{
  "name": "clickupfy_api_v2_get_list_views",
  "arguments": {
    "path": {
      "list_id": 1
    },
    "account": "dev"
  }
}
```

Use o perfil do produto, quando o MCP permitir selecionar outro perfil:

```json
{
  "name": "clickupfy_api_v2_get_list_views",
  "arguments": {
    "path": {
      "list_id": 1
    },
    "account": "produto"
  }
}
```

Consulte o schema antes de compor uma chamada pelo agente:

```bash
clickupfy api describe clickupfy_api_v2_get_list_views
```

Reproduza pelo CLI a entrada usada pelo agente, sem executar a operação:

```bash
printf '%s' '{"path":{"list_id":1}}' | clickupfy api v2-get-list-views --input - --dry-run
```

### `clickupfy api v2-create-list-view`

A operação `CreateListView` pertence ao grupo `Views` e usa
`POST /api/v2/list/{list_id}/view`.

A chamada altera o recurso indicado pelos parâmetros. Confira o resultado com a consulta correspondente antes de continuar.

A resposta preserva o JSON da API; respostas sem corpo retornam `{}`.
A API key do perfil precisa ter acesso ao recurso. As permissões e o plano do Workspace podem restringir o endpoint.
Os campos omitidos são tratados pelo servidor do ClickUp, sem padrões adicionais do cliente.

[Referência oficial](https://developer.clickup.com/reference/createlistview).

| Entrada | Tipo | Obrigatória |
| --- | --- | --- |
| `path.list_id` | `number` | sim |
| `body` | objeto conforme `api describe` | sim |

O comando aceita as flags comuns de `api`: `--input`, `--path`, `--query`,
`--body`, `--body-file`, `--content-type`, `--file`, `--dry-run` e `--yes`.
A referência completa de tipos, campos aninhados e valores permitidos está no comando `describe` abaixo.

Exemplos:

Consulte o contrato antes de preencher os IDs reais:

```bash
clickupfy api describe v2-create-list-view
```

Valide uma entrada em arquivo sem enviar uma requisição:

```bash
clickupfy api v2-create-list-view --input entrada.json --dry-run
```

Use um envelope JSON pelo stdin:

```bash
printf '%s' '{"path":{"list_id":1},"body":{"name":"exemplo-1","type":"exemplo-1","grouping":{"field":"exemplo-1","dir":1,"collapsed":["exemplo-1"],"ignore":true},"divide":{"collapsed":["exemplo-1"]},"sorting":{"fields":["exemplo-1"]},"filters":{"op":"exemplo-1","fields":["exemplo-1"],"search":"exemplo-1","show_closed":true},"columns":{"fields":["exemplo-1"]},"team_sidebar":{"assignees":["exemplo-1"],"assigned_comments":true,"unassigned_tasks":true},"settings":{"show_task_locations":true,"show_subtasks":1,"show_subtask_parent_names":true,"show_closed_subtasks":true,"show_assignees":true,"show_images":true,"collapse_empty_columns":"exemplo-1","me_comments":true,"me_subtasks":true,"me_checklists":true}}}' | clickupfy api v2-create-list-view --input -
```

Selecione o perfil que tem acesso ao recurso:

```bash
clickupfy --account produto api v2-create-list-view --input entrada.json
```

Grave a resposta JSON para conferência. O arquivo de entrada usa o envelope do exemplo anterior:

```bash
clickupfy --json api v2-create-list-view --input entrada.json > resposta.json
```

### `clickupfy_api_v2_create_list_view`

A operação `CreateListView` pertence ao grupo `Views` e usa
`POST /api/v2/list/{list_id}/view`.

A chamada altera o recurso indicado pelos parâmetros. Confira o resultado com a consulta correspondente antes de continuar.

A resposta preserva o JSON da API; respostas sem corpo retornam `{}`.
A API key do perfil precisa ter acesso ao recurso. As permissões e o plano do Workspace podem restringir o endpoint.
Os campos omitidos são tratados pelo servidor do ClickUp, sem padrões adicionais do cliente.

[Referência oficial](https://developer.clickup.com/reference/createlistview).

| Entrada | Tipo | Obrigatória |
| --- | --- | --- |
| `path.list_id` | `number` | sim |
| `body` | objeto conforme `api describe` | sim |

`account` é opcional e usa o perfil ativo ou fixado no MCP. O retorno aparece em
`content` como JSON; recusas retornam `isError: true`. Ferramentas de escrita
ficam ausentes em `--read-only`. IDs explícitos devem respeitar a hierarquia fixada.

Exemplos:

Use o perfil ativo com o envelope mínimo:

```json
{
  "name": "clickupfy_api_v2_create_list_view",
  "arguments": {
    "path": {
      "list_id": 1
    },
    "body": {
      "name": "exemplo-1",
      "type": "exemplo-1",
      "grouping": {
        "field": "exemplo-1",
        "dir": 1,
        "collapsed": [
          "exemplo-1"
        ],
        "ignore": true
      },
      "divide": {
        "collapsed": [
          "exemplo-1"
        ]
      },
      "sorting": {
        "fields": [
          "exemplo-1"
        ]
      },
      "filters": {
        "op": "exemplo-1",
        "fields": [
          "exemplo-1"
        ],
        "search": "exemplo-1",
        "show_closed": true
      },
      "columns": {
        "fields": [
          "exemplo-1"
        ]
      },
      "team_sidebar": {
        "assignees": [
          "exemplo-1"
        ],
        "assigned_comments": true,
        "unassigned_tasks": true
      },
      "settings": {
        "show_task_locations": true,
        "show_subtasks": 1,
        "show_subtask_parent_names": true,
        "show_closed_subtasks": true,
        "show_assignees": true,
        "show_images": true,
        "collapse_empty_columns": "exemplo-1",
        "me_comments": true,
        "me_subtasks": true,
        "me_checklists": true
      }
    }
  }
}
```

Direcione a chamada ao perfil de desenvolvimento:

```json
{
  "name": "clickupfy_api_v2_create_list_view",
  "arguments": {
    "path": {
      "list_id": 1
    },
    "body": {
      "name": "exemplo-1",
      "type": "exemplo-1",
      "grouping": {
        "field": "exemplo-1",
        "dir": 1,
        "collapsed": [
          "exemplo-1"
        ],
        "ignore": true
      },
      "divide": {
        "collapsed": [
          "exemplo-1"
        ]
      },
      "sorting": {
        "fields": [
          "exemplo-1"
        ]
      },
      "filters": {
        "op": "exemplo-1",
        "fields": [
          "exemplo-1"
        ],
        "search": "exemplo-1",
        "show_closed": true
      },
      "columns": {
        "fields": [
          "exemplo-1"
        ]
      },
      "team_sidebar": {
        "assignees": [
          "exemplo-1"
        ],
        "assigned_comments": true,
        "unassigned_tasks": true
      },
      "settings": {
        "show_task_locations": true,
        "show_subtasks": 1,
        "show_subtask_parent_names": true,
        "show_closed_subtasks": true,
        "show_assignees": true,
        "show_images": true,
        "collapse_empty_columns": "exemplo-1",
        "me_comments": true,
        "me_subtasks": true,
        "me_checklists": true
      }
    },
    "account": "dev"
  }
}
```

Use o perfil do produto, quando o MCP permitir selecionar outro perfil:

```json
{
  "name": "clickupfy_api_v2_create_list_view",
  "arguments": {
    "path": {
      "list_id": 1
    },
    "body": {
      "name": "exemplo-1",
      "type": "exemplo-1",
      "grouping": {
        "field": "exemplo-1",
        "dir": 1,
        "collapsed": [
          "exemplo-1"
        ],
        "ignore": true
      },
      "divide": {
        "collapsed": [
          "exemplo-1"
        ]
      },
      "sorting": {
        "fields": [
          "exemplo-1"
        ]
      },
      "filters": {
        "op": "exemplo-1",
        "fields": [
          "exemplo-1"
        ],
        "search": "exemplo-1",
        "show_closed": true
      },
      "columns": {
        "fields": [
          "exemplo-1"
        ]
      },
      "team_sidebar": {
        "assignees": [
          "exemplo-1"
        ],
        "assigned_comments": true,
        "unassigned_tasks": true
      },
      "settings": {
        "show_task_locations": true,
        "show_subtasks": 1,
        "show_subtask_parent_names": true,
        "show_closed_subtasks": true,
        "show_assignees": true,
        "show_images": true,
        "collapse_empty_columns": "exemplo-1",
        "me_comments": true,
        "me_subtasks": true,
        "me_checklists": true
      }
    },
    "account": "produto"
  }
}
```

Consulte o schema antes de compor uma chamada pelo agente:

```bash
clickupfy api describe clickupfy_api_v2_create_list_view
```

Reproduza pelo CLI a entrada usada pelo agente, sem executar a operação:

```bash
printf '%s' '{"path":{"list_id":1},"body":{"name":"exemplo-1","type":"exemplo-1","grouping":{"field":"exemplo-1","dir":1,"collapsed":["exemplo-1"],"ignore":true},"divide":{"collapsed":["exemplo-1"]},"sorting":{"fields":["exemplo-1"]},"filters":{"op":"exemplo-1","fields":["exemplo-1"],"search":"exemplo-1","show_closed":true},"columns":{"fields":["exemplo-1"]},"team_sidebar":{"assignees":["exemplo-1"],"assigned_comments":true,"unassigned_tasks":true},"settings":{"show_task_locations":true,"show_subtasks":1,"show_subtask_parent_names":true,"show_closed_subtasks":true,"show_assignees":true,"show_images":true,"collapse_empty_columns":"exemplo-1","me_comments":true,"me_subtasks":true,"me_checklists":true}}}' | clickupfy api v2-create-list-view --input - --dry-run
```

### `clickupfy api v2-get-view`

A operação `GetView` pertence ao grupo `Views` e usa
`GET /api/v2/view/{view_id}`.

A chamada consulta o recurso sem modificá-lo.

A resposta preserva o JSON da API; respostas sem corpo retornam `{}`.
A API key do perfil precisa ter acesso ao recurso. As permissões e o plano do Workspace podem restringir o endpoint.
Os campos omitidos são tratados pelo servidor do ClickUp, sem padrões adicionais do cliente.

[Referência oficial](https://developer.clickup.com/reference/getview).

| Entrada | Tipo | Obrigatória |
| --- | --- | --- |
| `path.view_id` | `string` | sim |

O comando aceita as flags comuns de `api`: `--input`, `--path`, `--query`,
`--body`, `--body-file`, `--content-type`, `--file`, `--dry-run` e `--yes`.
A referência completa de tipos, campos aninhados e valores permitidos está no comando `describe` abaixo.

Exemplos:

Consulte o contrato antes de preencher os IDs reais:

```bash
clickupfy api describe v2-get-view
```

Valide uma entrada em arquivo sem enviar uma requisição:

```bash
clickupfy api v2-get-view --input entrada.json --dry-run
```

Use um envelope JSON pelo stdin:

```bash
printf '%s' '{"path":{"view_id":"exemplo-1"}}' | clickupfy api v2-get-view --input -
```

Selecione o perfil que tem acesso ao recurso:

```bash
clickupfy --account produto api v2-get-view --input entrada.json
```

Grave a resposta JSON para conferência. O arquivo de entrada usa o envelope do exemplo anterior:

```bash
clickupfy --json api v2-get-view --input entrada.json > resposta.json
```

### `clickupfy_api_v2_get_view`

A operação `GetView` pertence ao grupo `Views` e usa
`GET /api/v2/view/{view_id}`.

A chamada consulta o recurso sem modificá-lo.

A resposta preserva o JSON da API; respostas sem corpo retornam `{}`.
A API key do perfil precisa ter acesso ao recurso. As permissões e o plano do Workspace podem restringir o endpoint.
Os campos omitidos são tratados pelo servidor do ClickUp, sem padrões adicionais do cliente.

[Referência oficial](https://developer.clickup.com/reference/getview).

| Entrada | Tipo | Obrigatória |
| --- | --- | --- |
| `path.view_id` | `string` | sim |

`account` é opcional e usa o perfil ativo ou fixado no MCP. O retorno aparece em
`content` como JSON; recusas retornam `isError: true`. Ferramentas de escrita
ficam ausentes em `--read-only`. IDs explícitos devem respeitar a hierarquia fixada.

Exemplos:

Use o perfil ativo com o envelope mínimo:

```json
{
  "name": "clickupfy_api_v2_get_view",
  "arguments": {
    "path": {
      "view_id": "exemplo-1"
    }
  }
}
```

Direcione a chamada ao perfil de desenvolvimento:

```json
{
  "name": "clickupfy_api_v2_get_view",
  "arguments": {
    "path": {
      "view_id": "exemplo-1"
    },
    "account": "dev"
  }
}
```

Use o perfil do produto, quando o MCP permitir selecionar outro perfil:

```json
{
  "name": "clickupfy_api_v2_get_view",
  "arguments": {
    "path": {
      "view_id": "exemplo-1"
    },
    "account": "produto"
  }
}
```

Consulte o schema antes de compor uma chamada pelo agente:

```bash
clickupfy api describe clickupfy_api_v2_get_view
```

Reproduza pelo CLI a entrada usada pelo agente, sem executar a operação:

```bash
printf '%s' '{"path":{"view_id":"exemplo-1"}}' | clickupfy api v2-get-view --input - --dry-run
```

### `clickupfy api v2-update-view`

A operação `UpdateView` pertence ao grupo `Views` e usa
`PUT /api/v2/view/{view_id}`.

A chamada altera o recurso indicado pelos parâmetros. Confira o resultado com a consulta correspondente antes de continuar.

A resposta preserva o JSON da API; respostas sem corpo retornam `{}`.
A API key do perfil precisa ter acesso ao recurso. As permissões e o plano do Workspace podem restringir o endpoint.
Os campos omitidos são tratados pelo servidor do ClickUp, sem padrões adicionais do cliente.

[Referência oficial](https://developer.clickup.com/reference/updateview).

| Entrada | Tipo | Obrigatória |
| --- | --- | --- |
| `path.view_id` | `string` | sim |
| `body` | objeto conforme `api describe` | sim |

O comando aceita as flags comuns de `api`: `--input`, `--path`, `--query`,
`--body`, `--body-file`, `--content-type`, `--file`, `--dry-run` e `--yes`.
A referência completa de tipos, campos aninhados e valores permitidos está no comando `describe` abaixo.

Exemplos:

Consulte o contrato antes de preencher os IDs reais:

```bash
clickupfy api describe v2-update-view
```

Valide uma entrada em arquivo sem enviar uma requisição:

```bash
clickupfy api v2-update-view --input entrada.json --dry-run
```

Use um envelope JSON pelo stdin:

```bash
printf '%s' '{"path":{"view_id":"exemplo-1"},"body":{"name":"exemplo-1","type":"exemplo-1","parent":{"id":"exemplo-1","type":1},"grouping":{"field":"exemplo-1","dir":1,"collapsed":["exemplo-1"],"ignore":true},"divide":{"collapsed":["exemplo-1"]},"sorting":{"fields":["exemplo-1"]},"filters":{"op":"exemplo-1","fields":["exemplo-1"],"search":"exemplo-1","show_closed":true},"columns":{"fields":["exemplo-1"]},"team_sidebar":{"assignees":["exemplo-1"],"assigned_comments":true,"unassigned_tasks":true},"settings":{"show_task_locations":true,"show_subtasks":1,"show_subtask_parent_names":true,"show_closed_subtasks":true,"show_assignees":true,"show_images":true,"collapse_empty_columns":"exemplo-1","me_comments":true,"me_subtasks":true,"me_checklists":true}}}' | clickupfy api v2-update-view --input -
```

Selecione o perfil que tem acesso ao recurso:

```bash
clickupfy --account produto api v2-update-view --input entrada.json
```

Grave a resposta JSON para conferência. O arquivo de entrada usa o envelope do exemplo anterior:

```bash
clickupfy --json api v2-update-view --input entrada.json > resposta.json
```

### `clickupfy_api_v2_update_view`

A operação `UpdateView` pertence ao grupo `Views` e usa
`PUT /api/v2/view/{view_id}`.

A chamada altera o recurso indicado pelos parâmetros. Confira o resultado com a consulta correspondente antes de continuar.

A resposta preserva o JSON da API; respostas sem corpo retornam `{}`.
A API key do perfil precisa ter acesso ao recurso. As permissões e o plano do Workspace podem restringir o endpoint.
Os campos omitidos são tratados pelo servidor do ClickUp, sem padrões adicionais do cliente.

[Referência oficial](https://developer.clickup.com/reference/updateview).

| Entrada | Tipo | Obrigatória |
| --- | --- | --- |
| `path.view_id` | `string` | sim |
| `body` | objeto conforme `api describe` | sim |

`account` é opcional e usa o perfil ativo ou fixado no MCP. O retorno aparece em
`content` como JSON; recusas retornam `isError: true`. Ferramentas de escrita
ficam ausentes em `--read-only`. IDs explícitos devem respeitar a hierarquia fixada.

Exemplos:

Use o perfil ativo com o envelope mínimo:

```json
{
  "name": "clickupfy_api_v2_update_view",
  "arguments": {
    "path": {
      "view_id": "exemplo-1"
    },
    "body": {
      "name": "exemplo-1",
      "type": "exemplo-1",
      "parent": {
        "id": "exemplo-1",
        "type": 1
      },
      "grouping": {
        "field": "exemplo-1",
        "dir": 1,
        "collapsed": [
          "exemplo-1"
        ],
        "ignore": true
      },
      "divide": {
        "collapsed": [
          "exemplo-1"
        ]
      },
      "sorting": {
        "fields": [
          "exemplo-1"
        ]
      },
      "filters": {
        "op": "exemplo-1",
        "fields": [
          "exemplo-1"
        ],
        "search": "exemplo-1",
        "show_closed": true
      },
      "columns": {
        "fields": [
          "exemplo-1"
        ]
      },
      "team_sidebar": {
        "assignees": [
          "exemplo-1"
        ],
        "assigned_comments": true,
        "unassigned_tasks": true
      },
      "settings": {
        "show_task_locations": true,
        "show_subtasks": 1,
        "show_subtask_parent_names": true,
        "show_closed_subtasks": true,
        "show_assignees": true,
        "show_images": true,
        "collapse_empty_columns": "exemplo-1",
        "me_comments": true,
        "me_subtasks": true,
        "me_checklists": true
      }
    }
  }
}
```

Direcione a chamada ao perfil de desenvolvimento:

```json
{
  "name": "clickupfy_api_v2_update_view",
  "arguments": {
    "path": {
      "view_id": "exemplo-1"
    },
    "body": {
      "name": "exemplo-1",
      "type": "exemplo-1",
      "parent": {
        "id": "exemplo-1",
        "type": 1
      },
      "grouping": {
        "field": "exemplo-1",
        "dir": 1,
        "collapsed": [
          "exemplo-1"
        ],
        "ignore": true
      },
      "divide": {
        "collapsed": [
          "exemplo-1"
        ]
      },
      "sorting": {
        "fields": [
          "exemplo-1"
        ]
      },
      "filters": {
        "op": "exemplo-1",
        "fields": [
          "exemplo-1"
        ],
        "search": "exemplo-1",
        "show_closed": true
      },
      "columns": {
        "fields": [
          "exemplo-1"
        ]
      },
      "team_sidebar": {
        "assignees": [
          "exemplo-1"
        ],
        "assigned_comments": true,
        "unassigned_tasks": true
      },
      "settings": {
        "show_task_locations": true,
        "show_subtasks": 1,
        "show_subtask_parent_names": true,
        "show_closed_subtasks": true,
        "show_assignees": true,
        "show_images": true,
        "collapse_empty_columns": "exemplo-1",
        "me_comments": true,
        "me_subtasks": true,
        "me_checklists": true
      }
    },
    "account": "dev"
  }
}
```

Use o perfil do produto, quando o MCP permitir selecionar outro perfil:

```json
{
  "name": "clickupfy_api_v2_update_view",
  "arguments": {
    "path": {
      "view_id": "exemplo-1"
    },
    "body": {
      "name": "exemplo-1",
      "type": "exemplo-1",
      "parent": {
        "id": "exemplo-1",
        "type": 1
      },
      "grouping": {
        "field": "exemplo-1",
        "dir": 1,
        "collapsed": [
          "exemplo-1"
        ],
        "ignore": true
      },
      "divide": {
        "collapsed": [
          "exemplo-1"
        ]
      },
      "sorting": {
        "fields": [
          "exemplo-1"
        ]
      },
      "filters": {
        "op": "exemplo-1",
        "fields": [
          "exemplo-1"
        ],
        "search": "exemplo-1",
        "show_closed": true
      },
      "columns": {
        "fields": [
          "exemplo-1"
        ]
      },
      "team_sidebar": {
        "assignees": [
          "exemplo-1"
        ],
        "assigned_comments": true,
        "unassigned_tasks": true
      },
      "settings": {
        "show_task_locations": true,
        "show_subtasks": 1,
        "show_subtask_parent_names": true,
        "show_closed_subtasks": true,
        "show_assignees": true,
        "show_images": true,
        "collapse_empty_columns": "exemplo-1",
        "me_comments": true,
        "me_subtasks": true,
        "me_checklists": true
      }
    },
    "account": "produto"
  }
}
```

Consulte o schema antes de compor uma chamada pelo agente:

```bash
clickupfy api describe clickupfy_api_v2_update_view
```

Reproduza pelo CLI a entrada usada pelo agente, sem executar a operação:

```bash
printf '%s' '{"path":{"view_id":"exemplo-1"},"body":{"name":"exemplo-1","type":"exemplo-1","parent":{"id":"exemplo-1","type":1},"grouping":{"field":"exemplo-1","dir":1,"collapsed":["exemplo-1"],"ignore":true},"divide":{"collapsed":["exemplo-1"]},"sorting":{"fields":["exemplo-1"]},"filters":{"op":"exemplo-1","fields":["exemplo-1"],"search":"exemplo-1","show_closed":true},"columns":{"fields":["exemplo-1"]},"team_sidebar":{"assignees":["exemplo-1"],"assigned_comments":true,"unassigned_tasks":true},"settings":{"show_task_locations":true,"show_subtasks":1,"show_subtask_parent_names":true,"show_closed_subtasks":true,"show_assignees":true,"show_images":true,"collapse_empty_columns":"exemplo-1","me_comments":true,"me_subtasks":true,"me_checklists":true}}}' | clickupfy api v2-update-view --input - --dry-run
```

### `clickupfy api v2-delete-view`

A operação `DeleteView` pertence ao grupo `Views` e usa
`DELETE /api/v2/view/{view_id}`.

A chamada altera o recurso indicado pelos parâmetros. Confira o resultado com a consulta correspondente antes de continuar.

A resposta preserva o JSON da API; respostas sem corpo retornam `{}`.
A API key do perfil precisa ter acesso ao recurso. As permissões e o plano do Workspace podem restringir o endpoint.
Os campos omitidos são tratados pelo servidor do ClickUp, sem padrões adicionais do cliente.

[Referência oficial](https://developer.clickup.com/reference/deleteview).

| Entrada | Tipo | Obrigatória |
| --- | --- | --- |
| `path.view_id` | `string` | sim |
| `confirm` | boolean, somente `true` | sim |

O comando aceita as flags comuns de `api`: `--input`, `--path`, `--query`,
`--body`, `--body-file`, `--content-type`, `--file`, `--dry-run` e `--yes`.
A referência completa de tipos, campos aninhados e valores permitidos está no comando `describe` abaixo.

Exemplos:

Consulte o contrato antes de preencher os IDs reais:

```bash
clickupfy api describe v2-delete-view
```

Valide uma entrada em arquivo sem enviar uma requisição:

```bash
clickupfy api v2-delete-view --input entrada.json --dry-run
```

Use um envelope JSON pelo stdin:

```bash
printf '%s' '{"path":{"view_id":"exemplo-1"},"confirm":true}' | clickupfy api v2-delete-view --input -
```

Selecione o perfil que tem acesso ao recurso:

```bash
clickupfy --account produto api v2-delete-view --input entrada.json
```

Grave a resposta JSON para conferência. O arquivo de entrada usa o envelope do exemplo anterior:

```bash
clickupfy --json api v2-delete-view --input entrada.json > resposta.json
```

### `clickupfy_api_v2_delete_view`

A operação `DeleteView` pertence ao grupo `Views` e usa
`DELETE /api/v2/view/{view_id}`.

A chamada altera o recurso indicado pelos parâmetros. Confira o resultado com a consulta correspondente antes de continuar.

A resposta preserva o JSON da API; respostas sem corpo retornam `{}`.
A API key do perfil precisa ter acesso ao recurso. As permissões e o plano do Workspace podem restringir o endpoint.
Os campos omitidos são tratados pelo servidor do ClickUp, sem padrões adicionais do cliente.

[Referência oficial](https://developer.clickup.com/reference/deleteview).

| Entrada | Tipo | Obrigatória |
| --- | --- | --- |
| `path.view_id` | `string` | sim |
| `confirm` | boolean, somente `true` | sim |

`account` é opcional e usa o perfil ativo ou fixado no MCP. O retorno aparece em
`content` como JSON; recusas retornam `isError: true`. Ferramentas de escrita
ficam ausentes em `--read-only`. IDs explícitos devem respeitar a hierarquia fixada.

Exemplos:

Use o perfil ativo com o envelope mínimo:

```json
{
  "name": "clickupfy_api_v2_delete_view",
  "arguments": {
    "path": {
      "view_id": "exemplo-1"
    },
    "confirm": true
  }
}
```

Direcione a chamada ao perfil de desenvolvimento:

```json
{
  "name": "clickupfy_api_v2_delete_view",
  "arguments": {
    "path": {
      "view_id": "exemplo-1"
    },
    "confirm": true,
    "account": "dev"
  }
}
```

Use o perfil do produto, quando o MCP permitir selecionar outro perfil:

```json
{
  "name": "clickupfy_api_v2_delete_view",
  "arguments": {
    "path": {
      "view_id": "exemplo-1"
    },
    "confirm": true,
    "account": "produto"
  }
}
```

Consulte o schema antes de compor uma chamada pelo agente:

```bash
clickupfy api describe clickupfy_api_v2_delete_view
```

Reproduza pelo CLI a entrada usada pelo agente, sem executar a operação:

```bash
printf '%s' '{"path":{"view_id":"exemplo-1"},"confirm":true}' | clickupfy api v2-delete-view --input - --dry-run
```

### `clickupfy api v2-get-view-tasks`

A operação `GetViewTasks` pertence ao grupo `Views` e usa
`GET /api/v2/view/{view_id}/task`.

A chamada consulta o recurso sem modificá-lo.

A resposta preserva o JSON da API; respostas sem corpo retornam `{}`.
A API key do perfil precisa ter acesso ao recurso. As permissões e o plano do Workspace podem restringir o endpoint.
Os campos omitidos são tratados pelo servidor do ClickUp, sem padrões adicionais do cliente.

[Referência oficial](https://developer.clickup.com/reference/getviewtasks).

| Entrada | Tipo | Obrigatória |
| --- | --- | --- |
| `path.view_id` | `string` | sim |
| `query.page` | `integer` | sim |

O comando aceita as flags comuns de `api`: `--input`, `--path`, `--query`,
`--body`, `--body-file`, `--content-type`, `--file`, `--dry-run` e `--yes`.
A referência completa de tipos, campos aninhados e valores permitidos está no comando `describe` abaixo.

Exemplos:

Consulte o contrato antes de preencher os IDs reais:

```bash
clickupfy api describe v2-get-view-tasks
```

Valide uma entrada em arquivo sem enviar uma requisição:

```bash
clickupfy api v2-get-view-tasks --input entrada.json --dry-run
```

Use um envelope JSON pelo stdin:

```bash
printf '%s' '{"path":{"view_id":"exemplo-1"},"query":{"page":1}}' | clickupfy api v2-get-view-tasks --input -
```

Selecione o perfil que tem acesso ao recurso:

```bash
clickupfy --account produto api v2-get-view-tasks --input entrada.json
```

Grave a resposta JSON para conferência. O arquivo de entrada usa o envelope do exemplo anterior:

```bash
clickupfy --json api v2-get-view-tasks --input entrada.json > resposta.json
```

### `clickupfy_api_v2_get_view_tasks`

A operação `GetViewTasks` pertence ao grupo `Views` e usa
`GET /api/v2/view/{view_id}/task`.

A chamada consulta o recurso sem modificá-lo.

A resposta preserva o JSON da API; respostas sem corpo retornam `{}`.
A API key do perfil precisa ter acesso ao recurso. As permissões e o plano do Workspace podem restringir o endpoint.
Os campos omitidos são tratados pelo servidor do ClickUp, sem padrões adicionais do cliente.

[Referência oficial](https://developer.clickup.com/reference/getviewtasks).

| Entrada | Tipo | Obrigatória |
| --- | --- | --- |
| `path.view_id` | `string` | sim |
| `query.page` | `integer` | sim |

`account` é opcional e usa o perfil ativo ou fixado no MCP. O retorno aparece em
`content` como JSON; recusas retornam `isError: true`. Ferramentas de escrita
ficam ausentes em `--read-only`. IDs explícitos devem respeitar a hierarquia fixada.

Exemplos:

Use o perfil ativo com o envelope mínimo:

```json
{
  "name": "clickupfy_api_v2_get_view_tasks",
  "arguments": {
    "path": {
      "view_id": "exemplo-1"
    },
    "query": {
      "page": 1
    }
  }
}
```

Direcione a chamada ao perfil de desenvolvimento:

```json
{
  "name": "clickupfy_api_v2_get_view_tasks",
  "arguments": {
    "path": {
      "view_id": "exemplo-1"
    },
    "query": {
      "page": 1
    },
    "account": "dev"
  }
}
```

Use o perfil do produto, quando o MCP permitir selecionar outro perfil:

```json
{
  "name": "clickupfy_api_v2_get_view_tasks",
  "arguments": {
    "path": {
      "view_id": "exemplo-1"
    },
    "query": {
      "page": 1
    },
    "account": "produto"
  }
}
```

Consulte o schema antes de compor uma chamada pelo agente:

```bash
clickupfy api describe clickupfy_api_v2_get_view_tasks
```

Reproduza pelo CLI a entrada usada pelo agente, sem executar a operação:

```bash
printf '%s' '{"path":{"view_id":"exemplo-1"},"query":{"page":1}}' | clickupfy api v2-get-view-tasks --input - --dry-run
```

### `clickupfy api v2-get-webhooks`

A operação `GetWebhooks` pertence ao grupo `Webhooks` e usa
`GET /api/v2/team/{team_id}/webhook`.

A chamada consulta o recurso sem modificá-lo.

A resposta preserva o JSON da API; respostas sem corpo retornam `{}`.
A API key do perfil precisa ter acesso ao recurso. As permissões e o plano do Workspace podem restringir o endpoint.
Os campos omitidos são tratados pelo servidor do ClickUp, sem padrões adicionais do cliente.

[Referência oficial](https://developer.clickup.com/reference/getwebhooks).

| Entrada | Tipo | Obrigatória |
| --- | --- | --- |
| `path.team_id` | `number` | sim |

O comando aceita as flags comuns de `api`: `--input`, `--path`, `--query`,
`--body`, `--body-file`, `--content-type`, `--file`, `--dry-run` e `--yes`.
A referência completa de tipos, campos aninhados e valores permitidos está no comando `describe` abaixo.

Exemplos:

Consulte o contrato antes de preencher os IDs reais:

```bash
clickupfy api describe v2-get-webhooks
```

Valide uma entrada em arquivo sem enviar uma requisição:

```bash
clickupfy api v2-get-webhooks --input entrada.json --dry-run
```

Use um envelope JSON pelo stdin:

```bash
printf '%s' '{"path":{"team_id":1}}' | clickupfy api v2-get-webhooks --input -
```

Selecione o perfil que tem acesso ao recurso:

```bash
clickupfy --account produto api v2-get-webhooks --input entrada.json
```

Grave a resposta JSON para conferência. O arquivo de entrada usa o envelope do exemplo anterior:

```bash
clickupfy --json api v2-get-webhooks --input entrada.json > resposta.json
```

### `clickupfy_api_v2_get_webhooks`

A operação `GetWebhooks` pertence ao grupo `Webhooks` e usa
`GET /api/v2/team/{team_id}/webhook`.

A chamada consulta o recurso sem modificá-lo.

A resposta preserva o JSON da API; respostas sem corpo retornam `{}`.
A API key do perfil precisa ter acesso ao recurso. As permissões e o plano do Workspace podem restringir o endpoint.
Os campos omitidos são tratados pelo servidor do ClickUp, sem padrões adicionais do cliente.

[Referência oficial](https://developer.clickup.com/reference/getwebhooks).

| Entrada | Tipo | Obrigatória |
| --- | --- | --- |
| `path.team_id` | `number` | sim |

`account` é opcional e usa o perfil ativo ou fixado no MCP. O retorno aparece em
`content` como JSON; recusas retornam `isError: true`. Ferramentas de escrita
ficam ausentes em `--read-only`. IDs explícitos devem respeitar a hierarquia fixada.

Exemplos:

Use o perfil ativo com o envelope mínimo:

```json
{
  "name": "clickupfy_api_v2_get_webhooks",
  "arguments": {
    "path": {
      "team_id": 1
    }
  }
}
```

Direcione a chamada ao perfil de desenvolvimento:

```json
{
  "name": "clickupfy_api_v2_get_webhooks",
  "arguments": {
    "path": {
      "team_id": 1
    },
    "account": "dev"
  }
}
```

Use o perfil do produto, quando o MCP permitir selecionar outro perfil:

```json
{
  "name": "clickupfy_api_v2_get_webhooks",
  "arguments": {
    "path": {
      "team_id": 1
    },
    "account": "produto"
  }
}
```

Consulte o schema antes de compor uma chamada pelo agente:

```bash
clickupfy api describe clickupfy_api_v2_get_webhooks
```

Reproduza pelo CLI a entrada usada pelo agente, sem executar a operação:

```bash
printf '%s' '{"path":{"team_id":1}}' | clickupfy api v2-get-webhooks --input - --dry-run
```

### `clickupfy api v2-create-webhook`

A operação `CreateWebhook` pertence ao grupo `Webhooks` e usa
`POST /api/v2/team/{team_id}/webhook`.

A chamada altera o recurso indicado pelos parâmetros. Confira o resultado com a consulta correspondente antes de continuar.

A resposta preserva o JSON da API; respostas sem corpo retornam `{}`.
A API key do perfil precisa ter acesso ao recurso. As permissões e o plano do Workspace podem restringir o endpoint.
Os campos omitidos são tratados pelo servidor do ClickUp, sem padrões adicionais do cliente.

[Referência oficial](https://developer.clickup.com/reference/createwebhook).

| Entrada | Tipo | Obrigatória |
| --- | --- | --- |
| `path.team_id` | `number` | sim |
| `body` | objeto conforme `api describe` | sim |

O comando aceita as flags comuns de `api`: `--input`, `--path`, `--query`,
`--body`, `--body-file`, `--content-type`, `--file`, `--dry-run` e `--yes`.
A referência completa de tipos, campos aninhados e valores permitidos está no comando `describe` abaixo.

Exemplos:

Consulte o contrato antes de preencher os IDs reais:

```bash
clickupfy api describe v2-create-webhook
```

Valide uma entrada em arquivo sem enviar uma requisição:

```bash
clickupfy api v2-create-webhook --input entrada.json --dry-run
```

Use um envelope JSON pelo stdin:

```bash
printf '%s' '{"path":{"team_id":1},"body":{"endpoint":"exemplo-1","events":["exemplo-1"]}}' | clickupfy api v2-create-webhook --input -
```

Selecione o perfil que tem acesso ao recurso:

```bash
clickupfy --account produto api v2-create-webhook --input entrada.json
```

Grave a resposta JSON para conferência. O arquivo de entrada usa o envelope do exemplo anterior:

```bash
clickupfy --json api v2-create-webhook --input entrada.json > resposta.json
```

### `clickupfy_api_v2_create_webhook`

A operação `CreateWebhook` pertence ao grupo `Webhooks` e usa
`POST /api/v2/team/{team_id}/webhook`.

A chamada altera o recurso indicado pelos parâmetros. Confira o resultado com a consulta correspondente antes de continuar.

A resposta preserva o JSON da API; respostas sem corpo retornam `{}`.
A API key do perfil precisa ter acesso ao recurso. As permissões e o plano do Workspace podem restringir o endpoint.
Os campos omitidos são tratados pelo servidor do ClickUp, sem padrões adicionais do cliente.

[Referência oficial](https://developer.clickup.com/reference/createwebhook).

| Entrada | Tipo | Obrigatória |
| --- | --- | --- |
| `path.team_id` | `number` | sim |
| `body` | objeto conforme `api describe` | sim |

`account` é opcional e usa o perfil ativo ou fixado no MCP. O retorno aparece em
`content` como JSON; recusas retornam `isError: true`. Ferramentas de escrita
ficam ausentes em `--read-only`. IDs explícitos devem respeitar a hierarquia fixada.

Exemplos:

Use o perfil ativo com o envelope mínimo:

```json
{
  "name": "clickupfy_api_v2_create_webhook",
  "arguments": {
    "path": {
      "team_id": 1
    },
    "body": {
      "endpoint": "exemplo-1",
      "events": [
        "exemplo-1"
      ]
    }
  }
}
```

Direcione a chamada ao perfil de desenvolvimento:

```json
{
  "name": "clickupfy_api_v2_create_webhook",
  "arguments": {
    "path": {
      "team_id": 1
    },
    "body": {
      "endpoint": "exemplo-1",
      "events": [
        "exemplo-1"
      ]
    },
    "account": "dev"
  }
}
```

Use o perfil do produto, quando o MCP permitir selecionar outro perfil:

```json
{
  "name": "clickupfy_api_v2_create_webhook",
  "arguments": {
    "path": {
      "team_id": 1
    },
    "body": {
      "endpoint": "exemplo-1",
      "events": [
        "exemplo-1"
      ]
    },
    "account": "produto"
  }
}
```

Consulte o schema antes de compor uma chamada pelo agente:

```bash
clickupfy api describe clickupfy_api_v2_create_webhook
```

Reproduza pelo CLI a entrada usada pelo agente, sem executar a operação:

```bash
printf '%s' '{"path":{"team_id":1},"body":{"endpoint":"exemplo-1","events":["exemplo-1"]}}' | clickupfy api v2-create-webhook --input - --dry-run
```

### `clickupfy api v2-update-webhook`

A operação `UpdateWebhook` pertence ao grupo `Webhooks` e usa
`PUT /api/v2/webhook/{webhook_id}`.

A chamada altera o recurso indicado pelos parâmetros. Confira o resultado com a consulta correspondente antes de continuar.

A resposta preserva o JSON da API; respostas sem corpo retornam `{}`.
A API key do perfil precisa ter acesso ao recurso. As permissões e o plano do Workspace podem restringir o endpoint.
Os campos omitidos são tratados pelo servidor do ClickUp, sem padrões adicionais do cliente.

[Referência oficial](https://developer.clickup.com/reference/updatewebhook).

| Entrada | Tipo | Obrigatória |
| --- | --- | --- |
| `path.webhook_id` | `string` | sim |
| `body` | objeto conforme `api describe` | sim |

O comando aceita as flags comuns de `api`: `--input`, `--path`, `--query`,
`--body`, `--body-file`, `--content-type`, `--file`, `--dry-run` e `--yes`.
A referência completa de tipos, campos aninhados e valores permitidos está no comando `describe` abaixo.

Exemplos:

Consulte o contrato antes de preencher os IDs reais:

```bash
clickupfy api describe v2-update-webhook
```

Valide uma entrada em arquivo sem enviar uma requisição:

```bash
clickupfy api v2-update-webhook --input entrada.json --dry-run
```

Use um envelope JSON pelo stdin:

```bash
printf '%s' '{"path":{"webhook_id":"exemplo-1"},"body":{"endpoint":"exemplo-1","events":"exemplo-1","status":"exemplo-1"}}' | clickupfy api v2-update-webhook --input -
```

Selecione o perfil que tem acesso ao recurso:

```bash
clickupfy --account produto api v2-update-webhook --input entrada.json
```

Grave a resposta JSON para conferência. O arquivo de entrada usa o envelope do exemplo anterior:

```bash
clickupfy --json api v2-update-webhook --input entrada.json > resposta.json
```

### `clickupfy_api_v2_update_webhook`

A operação `UpdateWebhook` pertence ao grupo `Webhooks` e usa
`PUT /api/v2/webhook/{webhook_id}`.

A chamada altera o recurso indicado pelos parâmetros. Confira o resultado com a consulta correspondente antes de continuar.

A resposta preserva o JSON da API; respostas sem corpo retornam `{}`.
A API key do perfil precisa ter acesso ao recurso. As permissões e o plano do Workspace podem restringir o endpoint.
Os campos omitidos são tratados pelo servidor do ClickUp, sem padrões adicionais do cliente.

[Referência oficial](https://developer.clickup.com/reference/updatewebhook).

| Entrada | Tipo | Obrigatória |
| --- | --- | --- |
| `path.webhook_id` | `string` | sim |
| `body` | objeto conforme `api describe` | sim |

`account` é opcional e usa o perfil ativo ou fixado no MCP. O retorno aparece em
`content` como JSON; recusas retornam `isError: true`. Ferramentas de escrita
ficam ausentes em `--read-only`. IDs explícitos devem respeitar a hierarquia fixada.

Exemplos:

Use o perfil ativo com o envelope mínimo:

```json
{
  "name": "clickupfy_api_v2_update_webhook",
  "arguments": {
    "path": {
      "webhook_id": "exemplo-1"
    },
    "body": {
      "endpoint": "exemplo-1",
      "events": "exemplo-1",
      "status": "exemplo-1"
    }
  }
}
```

Direcione a chamada ao perfil de desenvolvimento:

```json
{
  "name": "clickupfy_api_v2_update_webhook",
  "arguments": {
    "path": {
      "webhook_id": "exemplo-1"
    },
    "body": {
      "endpoint": "exemplo-1",
      "events": "exemplo-1",
      "status": "exemplo-1"
    },
    "account": "dev"
  }
}
```

Use o perfil do produto, quando o MCP permitir selecionar outro perfil:

```json
{
  "name": "clickupfy_api_v2_update_webhook",
  "arguments": {
    "path": {
      "webhook_id": "exemplo-1"
    },
    "body": {
      "endpoint": "exemplo-1",
      "events": "exemplo-1",
      "status": "exemplo-1"
    },
    "account": "produto"
  }
}
```

Consulte o schema antes de compor uma chamada pelo agente:

```bash
clickupfy api describe clickupfy_api_v2_update_webhook
```

Reproduza pelo CLI a entrada usada pelo agente, sem executar a operação:

```bash
printf '%s' '{"path":{"webhook_id":"exemplo-1"},"body":{"endpoint":"exemplo-1","events":"exemplo-1","status":"exemplo-1"}}' | clickupfy api v2-update-webhook --input - --dry-run
```

### `clickupfy api v2-delete-webhook`

A operação `DeleteWebhook` pertence ao grupo `Webhooks` e usa
`DELETE /api/v2/webhook/{webhook_id}`.

A chamada altera o recurso indicado pelos parâmetros. Confira o resultado com a consulta correspondente antes de continuar.

A resposta preserva o JSON da API; respostas sem corpo retornam `{}`.
A API key do perfil precisa ter acesso ao recurso. As permissões e o plano do Workspace podem restringir o endpoint.
Os campos omitidos são tratados pelo servidor do ClickUp, sem padrões adicionais do cliente.

[Referência oficial](https://developer.clickup.com/reference/deletewebhook).

| Entrada | Tipo | Obrigatória |
| --- | --- | --- |
| `path.webhook_id` | `string` | sim |
| `confirm` | boolean, somente `true` | sim |

O comando aceita as flags comuns de `api`: `--input`, `--path`, `--query`,
`--body`, `--body-file`, `--content-type`, `--file`, `--dry-run` e `--yes`.
A referência completa de tipos, campos aninhados e valores permitidos está no comando `describe` abaixo.

Exemplos:

Consulte o contrato antes de preencher os IDs reais:

```bash
clickupfy api describe v2-delete-webhook
```

Valide uma entrada em arquivo sem enviar uma requisição:

```bash
clickupfy api v2-delete-webhook --input entrada.json --dry-run
```

Use um envelope JSON pelo stdin:

```bash
printf '%s' '{"path":{"webhook_id":"exemplo-1"},"confirm":true}' | clickupfy api v2-delete-webhook --input -
```

Selecione o perfil que tem acesso ao recurso:

```bash
clickupfy --account produto api v2-delete-webhook --input entrada.json
```

Grave a resposta JSON para conferência. O arquivo de entrada usa o envelope do exemplo anterior:

```bash
clickupfy --json api v2-delete-webhook --input entrada.json > resposta.json
```

### `clickupfy_api_v2_delete_webhook`

A operação `DeleteWebhook` pertence ao grupo `Webhooks` e usa
`DELETE /api/v2/webhook/{webhook_id}`.

A chamada altera o recurso indicado pelos parâmetros. Confira o resultado com a consulta correspondente antes de continuar.

A resposta preserva o JSON da API; respostas sem corpo retornam `{}`.
A API key do perfil precisa ter acesso ao recurso. As permissões e o plano do Workspace podem restringir o endpoint.
Os campos omitidos são tratados pelo servidor do ClickUp, sem padrões adicionais do cliente.

[Referência oficial](https://developer.clickup.com/reference/deletewebhook).

| Entrada | Tipo | Obrigatória |
| --- | --- | --- |
| `path.webhook_id` | `string` | sim |
| `confirm` | boolean, somente `true` | sim |

`account` é opcional e usa o perfil ativo ou fixado no MCP. O retorno aparece em
`content` como JSON; recusas retornam `isError: true`. Ferramentas de escrita
ficam ausentes em `--read-only`. IDs explícitos devem respeitar a hierarquia fixada.

Exemplos:

Use o perfil ativo com o envelope mínimo:

```json
{
  "name": "clickupfy_api_v2_delete_webhook",
  "arguments": {
    "path": {
      "webhook_id": "exemplo-1"
    },
    "confirm": true
  }
}
```

Direcione a chamada ao perfil de desenvolvimento:

```json
{
  "name": "clickupfy_api_v2_delete_webhook",
  "arguments": {
    "path": {
      "webhook_id": "exemplo-1"
    },
    "confirm": true,
    "account": "dev"
  }
}
```

Use o perfil do produto, quando o MCP permitir selecionar outro perfil:

```json
{
  "name": "clickupfy_api_v2_delete_webhook",
  "arguments": {
    "path": {
      "webhook_id": "exemplo-1"
    },
    "confirm": true,
    "account": "produto"
  }
}
```

Consulte o schema antes de compor uma chamada pelo agente:

```bash
clickupfy api describe clickupfy_api_v2_delete_webhook
```

Reproduza pelo CLI a entrada usada pelo agente, sem executar a operação:

```bash
printf '%s' '{"path":{"webhook_id":"exemplo-1"},"confirm":true}' | clickupfy api v2-delete-webhook --input - --dry-run
```

### `clickupfy api v3-get-chat-channels`

A operação `getChatChannels` pertence ao grupo `Chat` e usa
`GET /api/v3/workspaces/{workspace_id}/chat/channels`.

A chamada consulta o recurso sem modificá-lo.

A resposta preserva o JSON da API; respostas sem corpo retornam `{}`.
A API key do perfil precisa ter acesso ao recurso. As permissões e o plano do Workspace podem restringir o endpoint.
Os campos omitidos são tratados pelo servidor do ClickUp, sem padrões adicionais do cliente.

[Referência oficial](https://developer.clickup.com/reference/getchatchannels).

| Entrada | Tipo | Obrigatória |
| --- | --- | --- |
| `path.workspace_id` | `integer` | sim |
| `query.description_format` | `string` | não |
| `query.cursor` | `string` | não |
| `query.limit` | `integer` | não |
| `query.is_follower` | `boolean` | não |
| `query.include_closed` | `boolean` | não |
| `query.with_message_since` | `number` | não |
| `query.channel_types` | `união` | não |

O comando aceita as flags comuns de `api`: `--input`, `--path`, `--query`,
`--body`, `--body-file`, `--content-type`, `--file`, `--dry-run` e `--yes`.
A referência completa de tipos, campos aninhados e valores permitidos está no comando `describe` abaixo.

Exemplos:

Consulte o contrato antes de preencher os IDs reais:

```bash
clickupfy api describe v3-get-chat-channels
```

Valide uma entrada em arquivo sem enviar uma requisição:

```bash
clickupfy api v3-get-chat-channels --input entrada.json --dry-run
```

Use um envelope JSON pelo stdin:

```bash
printf '%s' '{"path":{"workspace_id":1}}' | clickupfy api v3-get-chat-channels --input -
```

Selecione o perfil que tem acesso ao recurso:

```bash
clickupfy --account produto api v3-get-chat-channels --input entrada.json
```

Grave a resposta JSON para conferência. O arquivo de entrada usa o envelope do exemplo anterior:

```bash
clickupfy --json api v3-get-chat-channels --input entrada.json > resposta.json
```

### `clickupfy_api_v3_get_chat_channels`

A operação `getChatChannels` pertence ao grupo `Chat` e usa
`GET /api/v3/workspaces/{workspace_id}/chat/channels`.

A chamada consulta o recurso sem modificá-lo.

A resposta preserva o JSON da API; respostas sem corpo retornam `{}`.
A API key do perfil precisa ter acesso ao recurso. As permissões e o plano do Workspace podem restringir o endpoint.
Os campos omitidos são tratados pelo servidor do ClickUp, sem padrões adicionais do cliente.

[Referência oficial](https://developer.clickup.com/reference/getchatchannels).

| Entrada | Tipo | Obrigatória |
| --- | --- | --- |
| `path.workspace_id` | `integer` | sim |
| `query.description_format` | `string` | não |
| `query.cursor` | `string` | não |
| `query.limit` | `integer` | não |
| `query.is_follower` | `boolean` | não |
| `query.include_closed` | `boolean` | não |
| `query.with_message_since` | `number` | não |
| `query.channel_types` | `união` | não |

`account` é opcional e usa o perfil ativo ou fixado no MCP. O retorno aparece em
`content` como JSON; recusas retornam `isError: true`. Ferramentas de escrita
ficam ausentes em `--read-only`. IDs explícitos devem respeitar a hierarquia fixada.

Exemplos:

Use o perfil ativo com o envelope mínimo:

```json
{
  "name": "clickupfy_api_v3_get_chat_channels",
  "arguments": {
    "path": {
      "workspace_id": 1
    }
  }
}
```

Direcione a chamada ao perfil de desenvolvimento:

```json
{
  "name": "clickupfy_api_v3_get_chat_channels",
  "arguments": {
    "path": {
      "workspace_id": 1
    },
    "account": "dev"
  }
}
```

Use o perfil do produto, quando o MCP permitir selecionar outro perfil:

```json
{
  "name": "clickupfy_api_v3_get_chat_channels",
  "arguments": {
    "path": {
      "workspace_id": 1
    },
    "account": "produto"
  }
}
```

Consulte o schema antes de compor uma chamada pelo agente:

```bash
clickupfy api describe clickupfy_api_v3_get_chat_channels
```

Reproduza pelo CLI a entrada usada pelo agente, sem executar a operação:

```bash
printf '%s' '{"path":{"workspace_id":1}}' | clickupfy api v3-get-chat-channels --input - --dry-run
```

### `clickupfy api v3-create-chat-channel`

A operação `createChatChannel` pertence ao grupo `Chat` e usa
`POST /api/v3/workspaces/{workspace_id}/chat/channels`.

A chamada altera o recurso indicado pelos parâmetros. Confira o resultado com a consulta correspondente antes de continuar.

A resposta preserva o JSON da API; respostas sem corpo retornam `{}`.
A API key do perfil precisa ter acesso ao recurso. As permissões e o plano do Workspace podem restringir o endpoint.
Os campos omitidos são tratados pelo servidor do ClickUp, sem padrões adicionais do cliente.

[Referência oficial](https://developer.clickup.com/reference/createchatchannel).

| Entrada | Tipo | Obrigatória |
| --- | --- | --- |
| `path.workspace_id` | `integer` | sim |
| `body` | objeto conforme `api describe` | sim |

O comando aceita as flags comuns de `api`: `--input`, `--path`, `--query`,
`--body`, `--body-file`, `--content-type`, `--file`, `--dry-run` e `--yes`.
A referência completa de tipos, campos aninhados e valores permitidos está no comando `describe` abaixo.

Exemplos:

Consulte o contrato antes de preencher os IDs reais:

```bash
clickupfy api describe v3-create-chat-channel
```

Valide uma entrada em arquivo sem enviar uma requisição:

```bash
clickupfy api v3-create-chat-channel --input entrada.json --dry-run
```

Use um envelope JSON pelo stdin:

```bash
printf '%s' '{"path":{"workspace_id":1},"body":{"name":"exemplo-1"}}' | clickupfy api v3-create-chat-channel --input -
```

Selecione o perfil que tem acesso ao recurso:

```bash
clickupfy --account produto api v3-create-chat-channel --input entrada.json
```

Grave a resposta JSON para conferência. O arquivo de entrada usa o envelope do exemplo anterior:

```bash
clickupfy --json api v3-create-chat-channel --input entrada.json > resposta.json
```

### `clickupfy_api_v3_create_chat_channel`

A operação `createChatChannel` pertence ao grupo `Chat` e usa
`POST /api/v3/workspaces/{workspace_id}/chat/channels`.

A chamada altera o recurso indicado pelos parâmetros. Confira o resultado com a consulta correspondente antes de continuar.

A resposta preserva o JSON da API; respostas sem corpo retornam `{}`.
A API key do perfil precisa ter acesso ao recurso. As permissões e o plano do Workspace podem restringir o endpoint.
Os campos omitidos são tratados pelo servidor do ClickUp, sem padrões adicionais do cliente.

[Referência oficial](https://developer.clickup.com/reference/createchatchannel).

| Entrada | Tipo | Obrigatória |
| --- | --- | --- |
| `path.workspace_id` | `integer` | sim |
| `body` | objeto conforme `api describe` | sim |

`account` é opcional e usa o perfil ativo ou fixado no MCP. O retorno aparece em
`content` como JSON; recusas retornam `isError: true`. Ferramentas de escrita
ficam ausentes em `--read-only`. IDs explícitos devem respeitar a hierarquia fixada.

Exemplos:

Use o perfil ativo com o envelope mínimo:

```json
{
  "name": "clickupfy_api_v3_create_chat_channel",
  "arguments": {
    "path": {
      "workspace_id": 1
    },
    "body": {
      "name": "exemplo-1"
    }
  }
}
```

Direcione a chamada ao perfil de desenvolvimento:

```json
{
  "name": "clickupfy_api_v3_create_chat_channel",
  "arguments": {
    "path": {
      "workspace_id": 1
    },
    "body": {
      "name": "exemplo-1"
    },
    "account": "dev"
  }
}
```

Use o perfil do produto, quando o MCP permitir selecionar outro perfil:

```json
{
  "name": "clickupfy_api_v3_create_chat_channel",
  "arguments": {
    "path": {
      "workspace_id": 1
    },
    "body": {
      "name": "exemplo-1"
    },
    "account": "produto"
  }
}
```

Consulte o schema antes de compor uma chamada pelo agente:

```bash
clickupfy api describe clickupfy_api_v3_create_chat_channel
```

Reproduza pelo CLI a entrada usada pelo agente, sem executar a operação:

```bash
printf '%s' '{"path":{"workspace_id":1},"body":{"name":"exemplo-1"}}' | clickupfy api v3-create-chat-channel --input - --dry-run
```

### `clickupfy api v3-create-location-chat-channel`

A operação `createLocationChatChannel` pertence ao grupo `Chat` e usa
`POST /api/v3/workspaces/{workspace_id}/chat/channels/location`.

A chamada altera o recurso indicado pelos parâmetros. Confira o resultado com a consulta correspondente antes de continuar.

A resposta preserva o JSON da API; respostas sem corpo retornam `{}`.
A API key do perfil precisa ter acesso ao recurso. As permissões e o plano do Workspace podem restringir o endpoint.
Os campos omitidos são tratados pelo servidor do ClickUp, sem padrões adicionais do cliente.

[Referência oficial](https://developer.clickup.com/reference/createlocationchatchannel).

| Entrada | Tipo | Obrigatória |
| --- | --- | --- |
| `path.workspace_id` | `integer` | sim |
| `body` | objeto conforme `api describe` | sim |

O comando aceita as flags comuns de `api`: `--input`, `--path`, `--query`,
`--body`, `--body-file`, `--content-type`, `--file`, `--dry-run` e `--yes`.
A referência completa de tipos, campos aninhados e valores permitidos está no comando `describe` abaixo.

Exemplos:

Consulte o contrato antes de preencher os IDs reais:

```bash
clickupfy api describe v3-create-location-chat-channel
```

Valide uma entrada em arquivo sem enviar uma requisição:

```bash
clickupfy api v3-create-location-chat-channel --input entrada.json --dry-run
```

Use um envelope JSON pelo stdin:

```bash
printf '%s' '{"path":{"workspace_id":1},"body":{"location":{"id":"exemplo-1","type":"folder"}}}' | clickupfy api v3-create-location-chat-channel --input -
```

Selecione o perfil que tem acesso ao recurso:

```bash
clickupfy --account produto api v3-create-location-chat-channel --input entrada.json
```

Grave a resposta JSON para conferência. O arquivo de entrada usa o envelope do exemplo anterior:

```bash
clickupfy --json api v3-create-location-chat-channel --input entrada.json > resposta.json
```

### `clickupfy_api_v3_create_location_chat_channel`

A operação `createLocationChatChannel` pertence ao grupo `Chat` e usa
`POST /api/v3/workspaces/{workspace_id}/chat/channels/location`.

A chamada altera o recurso indicado pelos parâmetros. Confira o resultado com a consulta correspondente antes de continuar.

A resposta preserva o JSON da API; respostas sem corpo retornam `{}`.
A API key do perfil precisa ter acesso ao recurso. As permissões e o plano do Workspace podem restringir o endpoint.
Os campos omitidos são tratados pelo servidor do ClickUp, sem padrões adicionais do cliente.

[Referência oficial](https://developer.clickup.com/reference/createlocationchatchannel).

| Entrada | Tipo | Obrigatória |
| --- | --- | --- |
| `path.workspace_id` | `integer` | sim |
| `body` | objeto conforme `api describe` | sim |

`account` é opcional e usa o perfil ativo ou fixado no MCP. O retorno aparece em
`content` como JSON; recusas retornam `isError: true`. Ferramentas de escrita
ficam ausentes em `--read-only`. IDs explícitos devem respeitar a hierarquia fixada.

Exemplos:

Use o perfil ativo com o envelope mínimo:

```json
{
  "name": "clickupfy_api_v3_create_location_chat_channel",
  "arguments": {
    "path": {
      "workspace_id": 1
    },
    "body": {
      "location": {
        "id": "exemplo-1",
        "type": "folder"
      }
    }
  }
}
```

Direcione a chamada ao perfil de desenvolvimento:

```json
{
  "name": "clickupfy_api_v3_create_location_chat_channel",
  "arguments": {
    "path": {
      "workspace_id": 1
    },
    "body": {
      "location": {
        "id": "exemplo-1",
        "type": "folder"
      }
    },
    "account": "dev"
  }
}
```

Use o perfil do produto, quando o MCP permitir selecionar outro perfil:

```json
{
  "name": "clickupfy_api_v3_create_location_chat_channel",
  "arguments": {
    "path": {
      "workspace_id": 1
    },
    "body": {
      "location": {
        "id": "exemplo-1",
        "type": "folder"
      }
    },
    "account": "produto"
  }
}
```

Consulte o schema antes de compor uma chamada pelo agente:

```bash
clickupfy api describe clickupfy_api_v3_create_location_chat_channel
```

Reproduza pelo CLI a entrada usada pelo agente, sem executar a operação:

```bash
printf '%s' '{"path":{"workspace_id":1},"body":{"location":{"id":"exemplo-1","type":"folder"}}}' | clickupfy api v3-create-location-chat-channel --input - --dry-run
```

### `clickupfy api v3-create-direct-message-chat-channel`

A operação `createDirectMessageChatChannel` pertence ao grupo `Chat` e usa
`POST /api/v3/workspaces/{workspace_id}/chat/channels/direct_message`.

A chamada altera o recurso indicado pelos parâmetros. Confira o resultado com a consulta correspondente antes de continuar.

A resposta preserva o JSON da API; respostas sem corpo retornam `{}`.
A API key do perfil precisa ter acesso ao recurso. As permissões e o plano do Workspace podem restringir o endpoint.
Os campos omitidos são tratados pelo servidor do ClickUp, sem padrões adicionais do cliente.

[Referência oficial](https://developer.clickup.com/reference/createdirectmessagechatchannel).

| Entrada | Tipo | Obrigatória |
| --- | --- | --- |
| `path.workspace_id` | `integer` | sim |
| `body` | objeto conforme `api describe` | sim |

O comando aceita as flags comuns de `api`: `--input`, `--path`, `--query`,
`--body`, `--body-file`, `--content-type`, `--file`, `--dry-run` e `--yes`.
A referência completa de tipos, campos aninhados e valores permitidos está no comando `describe` abaixo.

Exemplos:

Consulte o contrato antes de preencher os IDs reais:

```bash
clickupfy api describe v3-create-direct-message-chat-channel
```

Valide uma entrada em arquivo sem enviar uma requisição:

```bash
clickupfy api v3-create-direct-message-chat-channel --input entrada.json --dry-run
```

Use um envelope JSON pelo stdin:

```bash
printf '%s' '{"path":{"workspace_id":1},"body":{}}' | clickupfy api v3-create-direct-message-chat-channel --input -
```

Selecione o perfil que tem acesso ao recurso:

```bash
clickupfy --account produto api v3-create-direct-message-chat-channel --input entrada.json
```

Grave a resposta JSON para conferência. O arquivo de entrada usa o envelope do exemplo anterior:

```bash
clickupfy --json api v3-create-direct-message-chat-channel --input entrada.json > resposta.json
```

### `clickupfy_api_v3_create_direct_message_chat_channel`

A operação `createDirectMessageChatChannel` pertence ao grupo `Chat` e usa
`POST /api/v3/workspaces/{workspace_id}/chat/channels/direct_message`.

A chamada altera o recurso indicado pelos parâmetros. Confira o resultado com a consulta correspondente antes de continuar.

A resposta preserva o JSON da API; respostas sem corpo retornam `{}`.
A API key do perfil precisa ter acesso ao recurso. As permissões e o plano do Workspace podem restringir o endpoint.
Os campos omitidos são tratados pelo servidor do ClickUp, sem padrões adicionais do cliente.

[Referência oficial](https://developer.clickup.com/reference/createdirectmessagechatchannel).

| Entrada | Tipo | Obrigatória |
| --- | --- | --- |
| `path.workspace_id` | `integer` | sim |
| `body` | objeto conforme `api describe` | sim |

`account` é opcional e usa o perfil ativo ou fixado no MCP. O retorno aparece em
`content` como JSON; recusas retornam `isError: true`. Ferramentas de escrita
ficam ausentes em `--read-only`. IDs explícitos devem respeitar a hierarquia fixada.

Exemplos:

Use o perfil ativo com o envelope mínimo:

```json
{
  "name": "clickupfy_api_v3_create_direct_message_chat_channel",
  "arguments": {
    "path": {
      "workspace_id": 1
    },
    "body": {}
  }
}
```

Direcione a chamada ao perfil de desenvolvimento:

```json
{
  "name": "clickupfy_api_v3_create_direct_message_chat_channel",
  "arguments": {
    "path": {
      "workspace_id": 1
    },
    "body": {},
    "account": "dev"
  }
}
```

Use o perfil do produto, quando o MCP permitir selecionar outro perfil:

```json
{
  "name": "clickupfy_api_v3_create_direct_message_chat_channel",
  "arguments": {
    "path": {
      "workspace_id": 1
    },
    "body": {},
    "account": "produto"
  }
}
```

Consulte o schema antes de compor uma chamada pelo agente:

```bash
clickupfy api describe clickupfy_api_v3_create_direct_message_chat_channel
```

Reproduza pelo CLI a entrada usada pelo agente, sem executar a operação:

```bash
printf '%s' '{"path":{"workspace_id":1},"body":{}}' | clickupfy api v3-create-direct-message-chat-channel --input - --dry-run
```

### `clickupfy api v3-get-chat-channel`

A operação `getChatChannel` pertence ao grupo `Chat` e usa
`GET /api/v3/workspaces/{workspace_id}/chat/channels/{channel_id}`.

A chamada consulta o recurso sem modificá-lo.

A resposta preserva o JSON da API; respostas sem corpo retornam `{}`.
A API key do perfil precisa ter acesso ao recurso. As permissões e o plano do Workspace podem restringir o endpoint.
Os campos omitidos são tratados pelo servidor do ClickUp, sem padrões adicionais do cliente.

[Referência oficial](https://developer.clickup.com/reference/getchatchannel).

| Entrada | Tipo | Obrigatória |
| --- | --- | --- |
| `path.workspace_id` | `integer` | sim |
| `path.channel_id` | `string` | sim |
| `query.description_format` | `string` | não |

O comando aceita as flags comuns de `api`: `--input`, `--path`, `--query`,
`--body`, `--body-file`, `--content-type`, `--file`, `--dry-run` e `--yes`.
A referência completa de tipos, campos aninhados e valores permitidos está no comando `describe` abaixo.

Exemplos:

Consulte o contrato antes de preencher os IDs reais:

```bash
clickupfy api describe v3-get-chat-channel
```

Valide uma entrada em arquivo sem enviar uma requisição:

```bash
clickupfy api v3-get-chat-channel --input entrada.json --dry-run
```

Use um envelope JSON pelo stdin:

```bash
printf '%s' '{"path":{"workspace_id":1,"channel_id":"exemplo-1"}}' | clickupfy api v3-get-chat-channel --input -
```

Selecione o perfil que tem acesso ao recurso:

```bash
clickupfy --account produto api v3-get-chat-channel --input entrada.json
```

Grave a resposta JSON para conferência. O arquivo de entrada usa o envelope do exemplo anterior:

```bash
clickupfy --json api v3-get-chat-channel --input entrada.json > resposta.json
```

### `clickupfy_api_v3_get_chat_channel`

A operação `getChatChannel` pertence ao grupo `Chat` e usa
`GET /api/v3/workspaces/{workspace_id}/chat/channels/{channel_id}`.

A chamada consulta o recurso sem modificá-lo.

A resposta preserva o JSON da API; respostas sem corpo retornam `{}`.
A API key do perfil precisa ter acesso ao recurso. As permissões e o plano do Workspace podem restringir o endpoint.
Os campos omitidos são tratados pelo servidor do ClickUp, sem padrões adicionais do cliente.

[Referência oficial](https://developer.clickup.com/reference/getchatchannel).

| Entrada | Tipo | Obrigatória |
| --- | --- | --- |
| `path.workspace_id` | `integer` | sim |
| `path.channel_id` | `string` | sim |
| `query.description_format` | `string` | não |

`account` é opcional e usa o perfil ativo ou fixado no MCP. O retorno aparece em
`content` como JSON; recusas retornam `isError: true`. Ferramentas de escrita
ficam ausentes em `--read-only`. IDs explícitos devem respeitar a hierarquia fixada.

Exemplos:

Use o perfil ativo com o envelope mínimo:

```json
{
  "name": "clickupfy_api_v3_get_chat_channel",
  "arguments": {
    "path": {
      "workspace_id": 1,
      "channel_id": "exemplo-1"
    }
  }
}
```

Direcione a chamada ao perfil de desenvolvimento:

```json
{
  "name": "clickupfy_api_v3_get_chat_channel",
  "arguments": {
    "path": {
      "workspace_id": 1,
      "channel_id": "exemplo-1"
    },
    "account": "dev"
  }
}
```

Use o perfil do produto, quando o MCP permitir selecionar outro perfil:

```json
{
  "name": "clickupfy_api_v3_get_chat_channel",
  "arguments": {
    "path": {
      "workspace_id": 1,
      "channel_id": "exemplo-1"
    },
    "account": "produto"
  }
}
```

Consulte o schema antes de compor uma chamada pelo agente:

```bash
clickupfy api describe clickupfy_api_v3_get_chat_channel
```

Reproduza pelo CLI a entrada usada pelo agente, sem executar a operação:

```bash
printf '%s' '{"path":{"workspace_id":1,"channel_id":"exemplo-1"}}' | clickupfy api v3-get-chat-channel --input - --dry-run
```

### `clickupfy api v3-update-chat-channel`

A operação `updateChatChannel` pertence ao grupo `Chat` e usa
`PATCH /api/v3/workspaces/{workspace_id}/chat/channels/{channel_id}`.

A chamada altera o recurso indicado pelos parâmetros. Confira o resultado com a consulta correspondente antes de continuar.

A resposta preserva o JSON da API; respostas sem corpo retornam `{}`.
A API key do perfil precisa ter acesso ao recurso. As permissões e o plano do Workspace podem restringir o endpoint.
Os campos omitidos são tratados pelo servidor do ClickUp, sem padrões adicionais do cliente.

[Referência oficial](https://developer.clickup.com/reference/updatechatchannel).

| Entrada | Tipo | Obrigatória |
| --- | --- | --- |
| `path.workspace_id` | `integer` | sim |
| `path.channel_id` | `string` | sim |
| `body` | objeto conforme `api describe` | sim |

O comando aceita as flags comuns de `api`: `--input`, `--path`, `--query`,
`--body`, `--body-file`, `--content-type`, `--file`, `--dry-run` e `--yes`.
A referência completa de tipos, campos aninhados e valores permitidos está no comando `describe` abaixo.

Exemplos:

Consulte o contrato antes de preencher os IDs reais:

```bash
clickupfy api describe v3-update-chat-channel
```

Valide uma entrada em arquivo sem enviar uma requisição:

```bash
clickupfy api v3-update-chat-channel --input entrada.json --dry-run
```

Use um envelope JSON pelo stdin:

```bash
printf '%s' '{"path":{"workspace_id":1,"channel_id":"exemplo-1"},"body":{}}' | clickupfy api v3-update-chat-channel --input -
```

Selecione o perfil que tem acesso ao recurso:

```bash
clickupfy --account produto api v3-update-chat-channel --input entrada.json
```

Grave a resposta JSON para conferência. O arquivo de entrada usa o envelope do exemplo anterior:

```bash
clickupfy --json api v3-update-chat-channel --input entrada.json > resposta.json
```

### `clickupfy_api_v3_update_chat_channel`

A operação `updateChatChannel` pertence ao grupo `Chat` e usa
`PATCH /api/v3/workspaces/{workspace_id}/chat/channels/{channel_id}`.

A chamada altera o recurso indicado pelos parâmetros. Confira o resultado com a consulta correspondente antes de continuar.

A resposta preserva o JSON da API; respostas sem corpo retornam `{}`.
A API key do perfil precisa ter acesso ao recurso. As permissões e o plano do Workspace podem restringir o endpoint.
Os campos omitidos são tratados pelo servidor do ClickUp, sem padrões adicionais do cliente.

[Referência oficial](https://developer.clickup.com/reference/updatechatchannel).

| Entrada | Tipo | Obrigatória |
| --- | --- | --- |
| `path.workspace_id` | `integer` | sim |
| `path.channel_id` | `string` | sim |
| `body` | objeto conforme `api describe` | sim |

`account` é opcional e usa o perfil ativo ou fixado no MCP. O retorno aparece em
`content` como JSON; recusas retornam `isError: true`. Ferramentas de escrita
ficam ausentes em `--read-only`. IDs explícitos devem respeitar a hierarquia fixada.

Exemplos:

Use o perfil ativo com o envelope mínimo:

```json
{
  "name": "clickupfy_api_v3_update_chat_channel",
  "arguments": {
    "path": {
      "workspace_id": 1,
      "channel_id": "exemplo-1"
    },
    "body": {}
  }
}
```

Direcione a chamada ao perfil de desenvolvimento:

```json
{
  "name": "clickupfy_api_v3_update_chat_channel",
  "arguments": {
    "path": {
      "workspace_id": 1,
      "channel_id": "exemplo-1"
    },
    "body": {},
    "account": "dev"
  }
}
```

Use o perfil do produto, quando o MCP permitir selecionar outro perfil:

```json
{
  "name": "clickupfy_api_v3_update_chat_channel",
  "arguments": {
    "path": {
      "workspace_id": 1,
      "channel_id": "exemplo-1"
    },
    "body": {},
    "account": "produto"
  }
}
```

Consulte o schema antes de compor uma chamada pelo agente:

```bash
clickupfy api describe clickupfy_api_v3_update_chat_channel
```

Reproduza pelo CLI a entrada usada pelo agente, sem executar a operação:

```bash
printf '%s' '{"path":{"workspace_id":1,"channel_id":"exemplo-1"},"body":{}}' | clickupfy api v3-update-chat-channel --input - --dry-run
```

### `clickupfy api v3-delete-chat-channel`

A operação `deleteChatChannel` pertence ao grupo `Chat` e usa
`DELETE /api/v3/workspaces/{workspace_id}/chat/channels/{channel_id}`.

A chamada altera o recurso indicado pelos parâmetros. Confira o resultado com a consulta correspondente antes de continuar.

A resposta preserva o JSON da API; respostas sem corpo retornam `{}`.
A API key do perfil precisa ter acesso ao recurso. As permissões e o plano do Workspace podem restringir o endpoint.
Os campos omitidos são tratados pelo servidor do ClickUp, sem padrões adicionais do cliente.

[Referência oficial](https://developer.clickup.com/reference/deletechatchannel).

| Entrada | Tipo | Obrigatória |
| --- | --- | --- |
| `path.workspace_id` | `integer` | sim |
| `path.channel_id` | `string` | sim |
| `confirm` | boolean, somente `true` | sim |

O comando aceita as flags comuns de `api`: `--input`, `--path`, `--query`,
`--body`, `--body-file`, `--content-type`, `--file`, `--dry-run` e `--yes`.
A referência completa de tipos, campos aninhados e valores permitidos está no comando `describe` abaixo.

Exemplos:

Consulte o contrato antes de preencher os IDs reais:

```bash
clickupfy api describe v3-delete-chat-channel
```

Valide uma entrada em arquivo sem enviar uma requisição:

```bash
clickupfy api v3-delete-chat-channel --input entrada.json --dry-run
```

Use um envelope JSON pelo stdin:

```bash
printf '%s' '{"path":{"workspace_id":1,"channel_id":"exemplo-1"},"confirm":true}' | clickupfy api v3-delete-chat-channel --input -
```

Selecione o perfil que tem acesso ao recurso:

```bash
clickupfy --account produto api v3-delete-chat-channel --input entrada.json
```

Grave a resposta JSON para conferência. O arquivo de entrada usa o envelope do exemplo anterior:

```bash
clickupfy --json api v3-delete-chat-channel --input entrada.json > resposta.json
```

### `clickupfy_api_v3_delete_chat_channel`

A operação `deleteChatChannel` pertence ao grupo `Chat` e usa
`DELETE /api/v3/workspaces/{workspace_id}/chat/channels/{channel_id}`.

A chamada altera o recurso indicado pelos parâmetros. Confira o resultado com a consulta correspondente antes de continuar.

A resposta preserva o JSON da API; respostas sem corpo retornam `{}`.
A API key do perfil precisa ter acesso ao recurso. As permissões e o plano do Workspace podem restringir o endpoint.
Os campos omitidos são tratados pelo servidor do ClickUp, sem padrões adicionais do cliente.

[Referência oficial](https://developer.clickup.com/reference/deletechatchannel).

| Entrada | Tipo | Obrigatória |
| --- | --- | --- |
| `path.workspace_id` | `integer` | sim |
| `path.channel_id` | `string` | sim |
| `confirm` | boolean, somente `true` | sim |

`account` é opcional e usa o perfil ativo ou fixado no MCP. O retorno aparece em
`content` como JSON; recusas retornam `isError: true`. Ferramentas de escrita
ficam ausentes em `--read-only`. IDs explícitos devem respeitar a hierarquia fixada.

Exemplos:

Use o perfil ativo com o envelope mínimo:

```json
{
  "name": "clickupfy_api_v3_delete_chat_channel",
  "arguments": {
    "path": {
      "workspace_id": 1,
      "channel_id": "exemplo-1"
    },
    "confirm": true
  }
}
```

Direcione a chamada ao perfil de desenvolvimento:

```json
{
  "name": "clickupfy_api_v3_delete_chat_channel",
  "arguments": {
    "path": {
      "workspace_id": 1,
      "channel_id": "exemplo-1"
    },
    "confirm": true,
    "account": "dev"
  }
}
```

Use o perfil do produto, quando o MCP permitir selecionar outro perfil:

```json
{
  "name": "clickupfy_api_v3_delete_chat_channel",
  "arguments": {
    "path": {
      "workspace_id": 1,
      "channel_id": "exemplo-1"
    },
    "confirm": true,
    "account": "produto"
  }
}
```

Consulte o schema antes de compor uma chamada pelo agente:

```bash
clickupfy api describe clickupfy_api_v3_delete_chat_channel
```

Reproduza pelo CLI a entrada usada pelo agente, sem executar a operação:

```bash
printf '%s' '{"path":{"workspace_id":1,"channel_id":"exemplo-1"},"confirm":true}' | clickupfy api v3-delete-chat-channel --input - --dry-run
```

### `clickupfy api v3-get-chat-channel-followers`

A operação `getChatChannelFollowers` pertence ao grupo `Chat` e usa
`GET /api/v3/workspaces/{workspace_id}/chat/channels/{channel_id}/followers`.

A chamada consulta o recurso sem modificá-lo.

A resposta preserva o JSON da API; respostas sem corpo retornam `{}`.
A API key do perfil precisa ter acesso ao recurso. As permissões e o plano do Workspace podem restringir o endpoint.
Os campos omitidos são tratados pelo servidor do ClickUp, sem padrões adicionais do cliente.

[Referência oficial](https://developer.clickup.com/reference/getchatchannelfollowers).

| Entrada | Tipo | Obrigatória |
| --- | --- | --- |
| `path.workspace_id` | `integer` | sim |
| `path.channel_id` | `string` | sim |
| `query.cursor` | `string` | não |
| `query.limit` | `integer` | não |

O comando aceita as flags comuns de `api`: `--input`, `--path`, `--query`,
`--body`, `--body-file`, `--content-type`, `--file`, `--dry-run` e `--yes`.
A referência completa de tipos, campos aninhados e valores permitidos está no comando `describe` abaixo.

Exemplos:

Consulte o contrato antes de preencher os IDs reais:

```bash
clickupfy api describe v3-get-chat-channel-followers
```

Valide uma entrada em arquivo sem enviar uma requisição:

```bash
clickupfy api v3-get-chat-channel-followers --input entrada.json --dry-run
```

Use um envelope JSON pelo stdin:

```bash
printf '%s' '{"path":{"workspace_id":1,"channel_id":"exemplo-1"}}' | clickupfy api v3-get-chat-channel-followers --input -
```

Selecione o perfil que tem acesso ao recurso:

```bash
clickupfy --account produto api v3-get-chat-channel-followers --input entrada.json
```

Grave a resposta JSON para conferência. O arquivo de entrada usa o envelope do exemplo anterior:

```bash
clickupfy --json api v3-get-chat-channel-followers --input entrada.json > resposta.json
```

### `clickupfy_api_v3_get_chat_channel_followers`

A operação `getChatChannelFollowers` pertence ao grupo `Chat` e usa
`GET /api/v3/workspaces/{workspace_id}/chat/channels/{channel_id}/followers`.

A chamada consulta o recurso sem modificá-lo.

A resposta preserva o JSON da API; respostas sem corpo retornam `{}`.
A API key do perfil precisa ter acesso ao recurso. As permissões e o plano do Workspace podem restringir o endpoint.
Os campos omitidos são tratados pelo servidor do ClickUp, sem padrões adicionais do cliente.

[Referência oficial](https://developer.clickup.com/reference/getchatchannelfollowers).

| Entrada | Tipo | Obrigatória |
| --- | --- | --- |
| `path.workspace_id` | `integer` | sim |
| `path.channel_id` | `string` | sim |
| `query.cursor` | `string` | não |
| `query.limit` | `integer` | não |

`account` é opcional e usa o perfil ativo ou fixado no MCP. O retorno aparece em
`content` como JSON; recusas retornam `isError: true`. Ferramentas de escrita
ficam ausentes em `--read-only`. IDs explícitos devem respeitar a hierarquia fixada.

Exemplos:

Use o perfil ativo com o envelope mínimo:

```json
{
  "name": "clickupfy_api_v3_get_chat_channel_followers",
  "arguments": {
    "path": {
      "workspace_id": 1,
      "channel_id": "exemplo-1"
    }
  }
}
```

Direcione a chamada ao perfil de desenvolvimento:

```json
{
  "name": "clickupfy_api_v3_get_chat_channel_followers",
  "arguments": {
    "path": {
      "workspace_id": 1,
      "channel_id": "exemplo-1"
    },
    "account": "dev"
  }
}
```

Use o perfil do produto, quando o MCP permitir selecionar outro perfil:

```json
{
  "name": "clickupfy_api_v3_get_chat_channel_followers",
  "arguments": {
    "path": {
      "workspace_id": 1,
      "channel_id": "exemplo-1"
    },
    "account": "produto"
  }
}
```

Consulte o schema antes de compor uma chamada pelo agente:

```bash
clickupfy api describe clickupfy_api_v3_get_chat_channel_followers
```

Reproduza pelo CLI a entrada usada pelo agente, sem executar a operação:

```bash
printf '%s' '{"path":{"workspace_id":1,"channel_id":"exemplo-1"}}' | clickupfy api v3-get-chat-channel-followers --input - --dry-run
```

### `clickupfy api v3-get-chat-channel-members`

A operação `getChatChannelMembers` pertence ao grupo `Chat` e usa
`GET /api/v3/workspaces/{workspace_id}/chat/channels/{channel_id}/members`.

A chamada consulta o recurso sem modificá-lo.

A resposta preserva o JSON da API; respostas sem corpo retornam `{}`.
A API key do perfil precisa ter acesso ao recurso. As permissões e o plano do Workspace podem restringir o endpoint.
Os campos omitidos são tratados pelo servidor do ClickUp, sem padrões adicionais do cliente.

[Referência oficial](https://developer.clickup.com/reference/getchatchannelmembers).

| Entrada | Tipo | Obrigatória |
| --- | --- | --- |
| `path.workspace_id` | `integer` | sim |
| `path.channel_id` | `string` | sim |
| `query.cursor` | `string` | não |
| `query.limit` | `integer` | não |

O comando aceita as flags comuns de `api`: `--input`, `--path`, `--query`,
`--body`, `--body-file`, `--content-type`, `--file`, `--dry-run` e `--yes`.
A referência completa de tipos, campos aninhados e valores permitidos está no comando `describe` abaixo.

Exemplos:

Consulte o contrato antes de preencher os IDs reais:

```bash
clickupfy api describe v3-get-chat-channel-members
```

Valide uma entrada em arquivo sem enviar uma requisição:

```bash
clickupfy api v3-get-chat-channel-members --input entrada.json --dry-run
```

Use um envelope JSON pelo stdin:

```bash
printf '%s' '{"path":{"workspace_id":1,"channel_id":"exemplo-1"}}' | clickupfy api v3-get-chat-channel-members --input -
```

Selecione o perfil que tem acesso ao recurso:

```bash
clickupfy --account produto api v3-get-chat-channel-members --input entrada.json
```

Grave a resposta JSON para conferência. O arquivo de entrada usa o envelope do exemplo anterior:

```bash
clickupfy --json api v3-get-chat-channel-members --input entrada.json > resposta.json
```

### `clickupfy_api_v3_get_chat_channel_members`

A operação `getChatChannelMembers` pertence ao grupo `Chat` e usa
`GET /api/v3/workspaces/{workspace_id}/chat/channels/{channel_id}/members`.

A chamada consulta o recurso sem modificá-lo.

A resposta preserva o JSON da API; respostas sem corpo retornam `{}`.
A API key do perfil precisa ter acesso ao recurso. As permissões e o plano do Workspace podem restringir o endpoint.
Os campos omitidos são tratados pelo servidor do ClickUp, sem padrões adicionais do cliente.

[Referência oficial](https://developer.clickup.com/reference/getchatchannelmembers).

| Entrada | Tipo | Obrigatória |
| --- | --- | --- |
| `path.workspace_id` | `integer` | sim |
| `path.channel_id` | `string` | sim |
| `query.cursor` | `string` | não |
| `query.limit` | `integer` | não |

`account` é opcional e usa o perfil ativo ou fixado no MCP. O retorno aparece em
`content` como JSON; recusas retornam `isError: true`. Ferramentas de escrita
ficam ausentes em `--read-only`. IDs explícitos devem respeitar a hierarquia fixada.

Exemplos:

Use o perfil ativo com o envelope mínimo:

```json
{
  "name": "clickupfy_api_v3_get_chat_channel_members",
  "arguments": {
    "path": {
      "workspace_id": 1,
      "channel_id": "exemplo-1"
    }
  }
}
```

Direcione a chamada ao perfil de desenvolvimento:

```json
{
  "name": "clickupfy_api_v3_get_chat_channel_members",
  "arguments": {
    "path": {
      "workspace_id": 1,
      "channel_id": "exemplo-1"
    },
    "account": "dev"
  }
}
```

Use o perfil do produto, quando o MCP permitir selecionar outro perfil:

```json
{
  "name": "clickupfy_api_v3_get_chat_channel_members",
  "arguments": {
    "path": {
      "workspace_id": 1,
      "channel_id": "exemplo-1"
    },
    "account": "produto"
  }
}
```

Consulte o schema antes de compor uma chamada pelo agente:

```bash
clickupfy api describe clickupfy_api_v3_get_chat_channel_members
```

Reproduza pelo CLI a entrada usada pelo agente, sem executar a operação:

```bash
printf '%s' '{"path":{"workspace_id":1,"channel_id":"exemplo-1"}}' | clickupfy api v3-get-chat-channel-members --input - --dry-run
```

### `clickupfy api v3-get-chat-messages`

A operação `getChatMessages` pertence ao grupo `Chat` e usa
`GET /api/v3/workspaces/{workspace_id}/chat/channels/{channel_id}/messages`.

A chamada consulta o recurso sem modificá-lo.

A resposta preserva o JSON da API; respostas sem corpo retornam `{}`.
A API key do perfil precisa ter acesso ao recurso. As permissões e o plano do Workspace podem restringir o endpoint.
Os campos omitidos são tratados pelo servidor do ClickUp, sem padrões adicionais do cliente.

[Referência oficial](https://developer.clickup.com/reference/getchatmessages).

| Entrada | Tipo | Obrigatória |
| --- | --- | --- |
| `path.workspace_id` | `integer` | sim |
| `path.channel_id` | `string` | sim |
| `query.cursor` | `string` | não |
| `query.limit` | `integer` | não |
| `query.content_format` | `string` | não |

O comando aceita as flags comuns de `api`: `--input`, `--path`, `--query`,
`--body`, `--body-file`, `--content-type`, `--file`, `--dry-run` e `--yes`.
A referência completa de tipos, campos aninhados e valores permitidos está no comando `describe` abaixo.

Exemplos:

Consulte o contrato antes de preencher os IDs reais:

```bash
clickupfy api describe v3-get-chat-messages
```

Valide uma entrada em arquivo sem enviar uma requisição:

```bash
clickupfy api v3-get-chat-messages --input entrada.json --dry-run
```

Use um envelope JSON pelo stdin:

```bash
printf '%s' '{"path":{"workspace_id":1,"channel_id":"exemplo-1"}}' | clickupfy api v3-get-chat-messages --input -
```

Selecione o perfil que tem acesso ao recurso:

```bash
clickupfy --account produto api v3-get-chat-messages --input entrada.json
```

Grave a resposta JSON para conferência. O arquivo de entrada usa o envelope do exemplo anterior:

```bash
clickupfy --json api v3-get-chat-messages --input entrada.json > resposta.json
```

### `clickupfy_api_v3_get_chat_messages`

A operação `getChatMessages` pertence ao grupo `Chat` e usa
`GET /api/v3/workspaces/{workspace_id}/chat/channels/{channel_id}/messages`.

A chamada consulta o recurso sem modificá-lo.

A resposta preserva o JSON da API; respostas sem corpo retornam `{}`.
A API key do perfil precisa ter acesso ao recurso. As permissões e o plano do Workspace podem restringir o endpoint.
Os campos omitidos são tratados pelo servidor do ClickUp, sem padrões adicionais do cliente.

[Referência oficial](https://developer.clickup.com/reference/getchatmessages).

| Entrada | Tipo | Obrigatória |
| --- | --- | --- |
| `path.workspace_id` | `integer` | sim |
| `path.channel_id` | `string` | sim |
| `query.cursor` | `string` | não |
| `query.limit` | `integer` | não |
| `query.content_format` | `string` | não |

`account` é opcional e usa o perfil ativo ou fixado no MCP. O retorno aparece em
`content` como JSON; recusas retornam `isError: true`. Ferramentas de escrita
ficam ausentes em `--read-only`. IDs explícitos devem respeitar a hierarquia fixada.

Exemplos:

Use o perfil ativo com o envelope mínimo:

```json
{
  "name": "clickupfy_api_v3_get_chat_messages",
  "arguments": {
    "path": {
      "workspace_id": 1,
      "channel_id": "exemplo-1"
    }
  }
}
```

Direcione a chamada ao perfil de desenvolvimento:

```json
{
  "name": "clickupfy_api_v3_get_chat_messages",
  "arguments": {
    "path": {
      "workspace_id": 1,
      "channel_id": "exemplo-1"
    },
    "account": "dev"
  }
}
```

Use o perfil do produto, quando o MCP permitir selecionar outro perfil:

```json
{
  "name": "clickupfy_api_v3_get_chat_messages",
  "arguments": {
    "path": {
      "workspace_id": 1,
      "channel_id": "exemplo-1"
    },
    "account": "produto"
  }
}
```

Consulte o schema antes de compor uma chamada pelo agente:

```bash
clickupfy api describe clickupfy_api_v3_get_chat_messages
```

Reproduza pelo CLI a entrada usada pelo agente, sem executar a operação:

```bash
printf '%s' '{"path":{"workspace_id":1,"channel_id":"exemplo-1"}}' | clickupfy api v3-get-chat-messages --input - --dry-run
```

### `clickupfy api v3-create-chat-message`

A operação `createChatMessage` pertence ao grupo `Chat` e usa
`POST /api/v3/workspaces/{workspace_id}/chat/channels/{channel_id}/messages`.

A chamada altera o recurso indicado pelos parâmetros. Confira o resultado com a consulta correspondente antes de continuar.

A resposta preserva o JSON da API; respostas sem corpo retornam `{}`.
A API key do perfil precisa ter acesso ao recurso. As permissões e o plano do Workspace podem restringir o endpoint.
Os campos omitidos são tratados pelo servidor do ClickUp, sem padrões adicionais do cliente.

[Referência oficial](https://developer.clickup.com/reference/createchatmessage).

| Entrada | Tipo | Obrigatória |
| --- | --- | --- |
| `path.workspace_id` | `integer` | sim |
| `path.channel_id` | `string` | sim |
| `body` | objeto conforme `api describe` | sim |

O comando aceita as flags comuns de `api`: `--input`, `--path`, `--query`,
`--body`, `--body-file`, `--content-type`, `--file`, `--dry-run` e `--yes`.
A referência completa de tipos, campos aninhados e valores permitidos está no comando `describe` abaixo.

Exemplos:

Consulte o contrato antes de preencher os IDs reais:

```bash
clickupfy api describe v3-create-chat-message
```

Valide uma entrada em arquivo sem enviar uma requisição:

```bash
clickupfy api v3-create-chat-message --input entrada.json --dry-run
```

Use um envelope JSON pelo stdin:

```bash
printf '%s' '{"path":{"workspace_id":1,"channel_id":"exemplo-1"},"body":{"type":"message","content":"exemplo-1"}}' | clickupfy api v3-create-chat-message --input -
```

Selecione o perfil que tem acesso ao recurso:

```bash
clickupfy --account produto api v3-create-chat-message --input entrada.json
```

Grave a resposta JSON para conferência. O arquivo de entrada usa o envelope do exemplo anterior:

```bash
clickupfy --json api v3-create-chat-message --input entrada.json > resposta.json
```

### `clickupfy_api_v3_create_chat_message`

A operação `createChatMessage` pertence ao grupo `Chat` e usa
`POST /api/v3/workspaces/{workspace_id}/chat/channels/{channel_id}/messages`.

A chamada altera o recurso indicado pelos parâmetros. Confira o resultado com a consulta correspondente antes de continuar.

A resposta preserva o JSON da API; respostas sem corpo retornam `{}`.
A API key do perfil precisa ter acesso ao recurso. As permissões e o plano do Workspace podem restringir o endpoint.
Os campos omitidos são tratados pelo servidor do ClickUp, sem padrões adicionais do cliente.

[Referência oficial](https://developer.clickup.com/reference/createchatmessage).

| Entrada | Tipo | Obrigatória |
| --- | --- | --- |
| `path.workspace_id` | `integer` | sim |
| `path.channel_id` | `string` | sim |
| `body` | objeto conforme `api describe` | sim |

`account` é opcional e usa o perfil ativo ou fixado no MCP. O retorno aparece em
`content` como JSON; recusas retornam `isError: true`. Ferramentas de escrita
ficam ausentes em `--read-only`. IDs explícitos devem respeitar a hierarquia fixada.

Exemplos:

Use o perfil ativo com o envelope mínimo:

```json
{
  "name": "clickupfy_api_v3_create_chat_message",
  "arguments": {
    "path": {
      "workspace_id": 1,
      "channel_id": "exemplo-1"
    },
    "body": {
      "type": "message",
      "content": "exemplo-1"
    }
  }
}
```

Direcione a chamada ao perfil de desenvolvimento:

```json
{
  "name": "clickupfy_api_v3_create_chat_message",
  "arguments": {
    "path": {
      "workspace_id": 1,
      "channel_id": "exemplo-1"
    },
    "body": {
      "type": "message",
      "content": "exemplo-1"
    },
    "account": "dev"
  }
}
```

Use o perfil do produto, quando o MCP permitir selecionar outro perfil:

```json
{
  "name": "clickupfy_api_v3_create_chat_message",
  "arguments": {
    "path": {
      "workspace_id": 1,
      "channel_id": "exemplo-1"
    },
    "body": {
      "type": "message",
      "content": "exemplo-1"
    },
    "account": "produto"
  }
}
```

Consulte o schema antes de compor uma chamada pelo agente:

```bash
clickupfy api describe clickupfy_api_v3_create_chat_message
```

Reproduza pelo CLI a entrada usada pelo agente, sem executar a operação:

```bash
printf '%s' '{"path":{"workspace_id":1,"channel_id":"exemplo-1"},"body":{"type":"message","content":"exemplo-1"}}' | clickupfy api v3-create-chat-message --input - --dry-run
```

### `clickupfy api v3-patch-chat-message`

A operação `patchChatMessage` pertence ao grupo `Chat` e usa
`PATCH /api/v3/workspaces/{workspace_id}/chat/messages/{message_id}`.

A chamada altera o recurso indicado pelos parâmetros. Confira o resultado com a consulta correspondente antes de continuar.

A resposta preserva o JSON da API; respostas sem corpo retornam `{}`.
A API key do perfil precisa ter acesso ao recurso. As permissões e o plano do Workspace podem restringir o endpoint.
Os campos omitidos são tratados pelo servidor do ClickUp, sem padrões adicionais do cliente.

[Referência oficial](https://developer.clickup.com/reference/patchchatmessage).

| Entrada | Tipo | Obrigatória |
| --- | --- | --- |
| `path.workspace_id` | `integer` | sim |
| `path.message_id` | `string` | sim |
| `body` | objeto conforme `api describe` | sim |

O comando aceita as flags comuns de `api`: `--input`, `--path`, `--query`,
`--body`, `--body-file`, `--content-type`, `--file`, `--dry-run` e `--yes`.
A referência completa de tipos, campos aninhados e valores permitidos está no comando `describe` abaixo.

Exemplos:

Consulte o contrato antes de preencher os IDs reais:

```bash
clickupfy api describe v3-patch-chat-message
```

Valide uma entrada em arquivo sem enviar uma requisição:

```bash
clickupfy api v3-patch-chat-message --input entrada.json --dry-run
```

Use um envelope JSON pelo stdin:

```bash
printf '%s' '{"path":{"workspace_id":1,"message_id":"exemplo-1"},"body":{}}' | clickupfy api v3-patch-chat-message --input -
```

Selecione o perfil que tem acesso ao recurso:

```bash
clickupfy --account produto api v3-patch-chat-message --input entrada.json
```

Grave a resposta JSON para conferência. O arquivo de entrada usa o envelope do exemplo anterior:

```bash
clickupfy --json api v3-patch-chat-message --input entrada.json > resposta.json
```

### `clickupfy_api_v3_patch_chat_message`

A operação `patchChatMessage` pertence ao grupo `Chat` e usa
`PATCH /api/v3/workspaces/{workspace_id}/chat/messages/{message_id}`.

A chamada altera o recurso indicado pelos parâmetros. Confira o resultado com a consulta correspondente antes de continuar.

A resposta preserva o JSON da API; respostas sem corpo retornam `{}`.
A API key do perfil precisa ter acesso ao recurso. As permissões e o plano do Workspace podem restringir o endpoint.
Os campos omitidos são tratados pelo servidor do ClickUp, sem padrões adicionais do cliente.

[Referência oficial](https://developer.clickup.com/reference/patchchatmessage).

| Entrada | Tipo | Obrigatória |
| --- | --- | --- |
| `path.workspace_id` | `integer` | sim |
| `path.message_id` | `string` | sim |
| `body` | objeto conforme `api describe` | sim |

`account` é opcional e usa o perfil ativo ou fixado no MCP. O retorno aparece em
`content` como JSON; recusas retornam `isError: true`. Ferramentas de escrita
ficam ausentes em `--read-only`. IDs explícitos devem respeitar a hierarquia fixada.

Exemplos:

Use o perfil ativo com o envelope mínimo:

```json
{
  "name": "clickupfy_api_v3_patch_chat_message",
  "arguments": {
    "path": {
      "workspace_id": 1,
      "message_id": "exemplo-1"
    },
    "body": {}
  }
}
```

Direcione a chamada ao perfil de desenvolvimento:

```json
{
  "name": "clickupfy_api_v3_patch_chat_message",
  "arguments": {
    "path": {
      "workspace_id": 1,
      "message_id": "exemplo-1"
    },
    "body": {},
    "account": "dev"
  }
}
```

Use o perfil do produto, quando o MCP permitir selecionar outro perfil:

```json
{
  "name": "clickupfy_api_v3_patch_chat_message",
  "arguments": {
    "path": {
      "workspace_id": 1,
      "message_id": "exemplo-1"
    },
    "body": {},
    "account": "produto"
  }
}
```

Consulte o schema antes de compor uma chamada pelo agente:

```bash
clickupfy api describe clickupfy_api_v3_patch_chat_message
```

Reproduza pelo CLI a entrada usada pelo agente, sem executar a operação:

```bash
printf '%s' '{"path":{"workspace_id":1,"message_id":"exemplo-1"},"body":{}}' | clickupfy api v3-patch-chat-message --input - --dry-run
```

### `clickupfy api v3-delete-chat-message`

A operação `deleteChatMessage` pertence ao grupo `Chat` e usa
`DELETE /api/v3/workspaces/{workspace_id}/chat/messages/{message_id}`.

A chamada altera o recurso indicado pelos parâmetros. Confira o resultado com a consulta correspondente antes de continuar.

A resposta preserva o JSON da API; respostas sem corpo retornam `{}`.
A API key do perfil precisa ter acesso ao recurso. As permissões e o plano do Workspace podem restringir o endpoint.
Os campos omitidos são tratados pelo servidor do ClickUp, sem padrões adicionais do cliente.

[Referência oficial](https://developer.clickup.com/reference/deletechatmessage).

| Entrada | Tipo | Obrigatória |
| --- | --- | --- |
| `path.workspace_id` | `integer` | sim |
| `path.message_id` | `string` | sim |
| `confirm` | boolean, somente `true` | sim |

O comando aceita as flags comuns de `api`: `--input`, `--path`, `--query`,
`--body`, `--body-file`, `--content-type`, `--file`, `--dry-run` e `--yes`.
A referência completa de tipos, campos aninhados e valores permitidos está no comando `describe` abaixo.

Exemplos:

Consulte o contrato antes de preencher os IDs reais:

```bash
clickupfy api describe v3-delete-chat-message
```

Valide uma entrada em arquivo sem enviar uma requisição:

```bash
clickupfy api v3-delete-chat-message --input entrada.json --dry-run
```

Use um envelope JSON pelo stdin:

```bash
printf '%s' '{"path":{"workspace_id":1,"message_id":"exemplo-1"},"confirm":true}' | clickupfy api v3-delete-chat-message --input -
```

Selecione o perfil que tem acesso ao recurso:

```bash
clickupfy --account produto api v3-delete-chat-message --input entrada.json
```

Grave a resposta JSON para conferência. O arquivo de entrada usa o envelope do exemplo anterior:

```bash
clickupfy --json api v3-delete-chat-message --input entrada.json > resposta.json
```

### `clickupfy_api_v3_delete_chat_message`

A operação `deleteChatMessage` pertence ao grupo `Chat` e usa
`DELETE /api/v3/workspaces/{workspace_id}/chat/messages/{message_id}`.

A chamada altera o recurso indicado pelos parâmetros. Confira o resultado com a consulta correspondente antes de continuar.

A resposta preserva o JSON da API; respostas sem corpo retornam `{}`.
A API key do perfil precisa ter acesso ao recurso. As permissões e o plano do Workspace podem restringir o endpoint.
Os campos omitidos são tratados pelo servidor do ClickUp, sem padrões adicionais do cliente.

[Referência oficial](https://developer.clickup.com/reference/deletechatmessage).

| Entrada | Tipo | Obrigatória |
| --- | --- | --- |
| `path.workspace_id` | `integer` | sim |
| `path.message_id` | `string` | sim |
| `confirm` | boolean, somente `true` | sim |

`account` é opcional e usa o perfil ativo ou fixado no MCP. O retorno aparece em
`content` como JSON; recusas retornam `isError: true`. Ferramentas de escrita
ficam ausentes em `--read-only`. IDs explícitos devem respeitar a hierarquia fixada.

Exemplos:

Use o perfil ativo com o envelope mínimo:

```json
{
  "name": "clickupfy_api_v3_delete_chat_message",
  "arguments": {
    "path": {
      "workspace_id": 1,
      "message_id": "exemplo-1"
    },
    "confirm": true
  }
}
```

Direcione a chamada ao perfil de desenvolvimento:

```json
{
  "name": "clickupfy_api_v3_delete_chat_message",
  "arguments": {
    "path": {
      "workspace_id": 1,
      "message_id": "exemplo-1"
    },
    "confirm": true,
    "account": "dev"
  }
}
```

Use o perfil do produto, quando o MCP permitir selecionar outro perfil:

```json
{
  "name": "clickupfy_api_v3_delete_chat_message",
  "arguments": {
    "path": {
      "workspace_id": 1,
      "message_id": "exemplo-1"
    },
    "confirm": true,
    "account": "produto"
  }
}
```

Consulte o schema antes de compor uma chamada pelo agente:

```bash
clickupfy api describe clickupfy_api_v3_delete_chat_message
```

Reproduza pelo CLI a entrada usada pelo agente, sem executar a operação:

```bash
printf '%s' '{"path":{"workspace_id":1,"message_id":"exemplo-1"},"confirm":true}' | clickupfy api v3-delete-chat-message --input - --dry-run
```

### `clickupfy api v3-get-chat-message-reactions`

A operação `getChatMessageReactions` pertence ao grupo `Chat` e usa
`GET /api/v3/workspaces/{workspace_id}/chat/messages/{message_id}/reactions`.

A chamada consulta o recurso sem modificá-lo.

A resposta preserva o JSON da API; respostas sem corpo retornam `{}`.
A API key do perfil precisa ter acesso ao recurso. As permissões e o plano do Workspace podem restringir o endpoint.
Os campos omitidos são tratados pelo servidor do ClickUp, sem padrões adicionais do cliente.

[Referência oficial](https://developer.clickup.com/reference/getchatmessagereactions).

| Entrada | Tipo | Obrigatória |
| --- | --- | --- |
| `path.workspace_id` | `integer` | sim |
| `path.message_id` | `string` | sim |
| `query.cursor` | `string` | não |
| `query.limit` | `integer` | não |

O comando aceita as flags comuns de `api`: `--input`, `--path`, `--query`,
`--body`, `--body-file`, `--content-type`, `--file`, `--dry-run` e `--yes`.
A referência completa de tipos, campos aninhados e valores permitidos está no comando `describe` abaixo.

Exemplos:

Consulte o contrato antes de preencher os IDs reais:

```bash
clickupfy api describe v3-get-chat-message-reactions
```

Valide uma entrada em arquivo sem enviar uma requisição:

```bash
clickupfy api v3-get-chat-message-reactions --input entrada.json --dry-run
```

Use um envelope JSON pelo stdin:

```bash
printf '%s' '{"path":{"workspace_id":1,"message_id":"exemplo-1"}}' | clickupfy api v3-get-chat-message-reactions --input -
```

Selecione o perfil que tem acesso ao recurso:

```bash
clickupfy --account produto api v3-get-chat-message-reactions --input entrada.json
```

Grave a resposta JSON para conferência. O arquivo de entrada usa o envelope do exemplo anterior:

```bash
clickupfy --json api v3-get-chat-message-reactions --input entrada.json > resposta.json
```

### `clickupfy_api_v3_get_chat_message_reactions`

A operação `getChatMessageReactions` pertence ao grupo `Chat` e usa
`GET /api/v3/workspaces/{workspace_id}/chat/messages/{message_id}/reactions`.

A chamada consulta o recurso sem modificá-lo.

A resposta preserva o JSON da API; respostas sem corpo retornam `{}`.
A API key do perfil precisa ter acesso ao recurso. As permissões e o plano do Workspace podem restringir o endpoint.
Os campos omitidos são tratados pelo servidor do ClickUp, sem padrões adicionais do cliente.

[Referência oficial](https://developer.clickup.com/reference/getchatmessagereactions).

| Entrada | Tipo | Obrigatória |
| --- | --- | --- |
| `path.workspace_id` | `integer` | sim |
| `path.message_id` | `string` | sim |
| `query.cursor` | `string` | não |
| `query.limit` | `integer` | não |

`account` é opcional e usa o perfil ativo ou fixado no MCP. O retorno aparece em
`content` como JSON; recusas retornam `isError: true`. Ferramentas de escrita
ficam ausentes em `--read-only`. IDs explícitos devem respeitar a hierarquia fixada.

Exemplos:

Use o perfil ativo com o envelope mínimo:

```json
{
  "name": "clickupfy_api_v3_get_chat_message_reactions",
  "arguments": {
    "path": {
      "workspace_id": 1,
      "message_id": "exemplo-1"
    }
  }
}
```

Direcione a chamada ao perfil de desenvolvimento:

```json
{
  "name": "clickupfy_api_v3_get_chat_message_reactions",
  "arguments": {
    "path": {
      "workspace_id": 1,
      "message_id": "exemplo-1"
    },
    "account": "dev"
  }
}
```

Use o perfil do produto, quando o MCP permitir selecionar outro perfil:

```json
{
  "name": "clickupfy_api_v3_get_chat_message_reactions",
  "arguments": {
    "path": {
      "workspace_id": 1,
      "message_id": "exemplo-1"
    },
    "account": "produto"
  }
}
```

Consulte o schema antes de compor uma chamada pelo agente:

```bash
clickupfy api describe clickupfy_api_v3_get_chat_message_reactions
```

Reproduza pelo CLI a entrada usada pelo agente, sem executar a operação:

```bash
printf '%s' '{"path":{"workspace_id":1,"message_id":"exemplo-1"}}' | clickupfy api v3-get-chat-message-reactions --input - --dry-run
```

### `clickupfy api v3-create-chat-reaction`

A operação `createChatReaction` pertence ao grupo `Chat` e usa
`POST /api/v3/workspaces/{workspace_id}/chat/messages/{message_id}/reactions`.

A chamada altera o recurso indicado pelos parâmetros. Confira o resultado com a consulta correspondente antes de continuar.

A resposta preserva o JSON da API; respostas sem corpo retornam `{}`.
A API key do perfil precisa ter acesso ao recurso. As permissões e o plano do Workspace podem restringir o endpoint.
Os campos omitidos são tratados pelo servidor do ClickUp, sem padrões adicionais do cliente.

[Referência oficial](https://developer.clickup.com/reference/createchatreaction).

| Entrada | Tipo | Obrigatória |
| --- | --- | --- |
| `path.workspace_id` | `integer` | sim |
| `path.message_id` | `string` | sim |
| `body` | objeto conforme `api describe` | sim |

O comando aceita as flags comuns de `api`: `--input`, `--path`, `--query`,
`--body`, `--body-file`, `--content-type`, `--file`, `--dry-run` e `--yes`.
A referência completa de tipos, campos aninhados e valores permitidos está no comando `describe` abaixo.

Exemplos:

Consulte o contrato antes de preencher os IDs reais:

```bash
clickupfy api describe v3-create-chat-reaction
```

Valide uma entrada em arquivo sem enviar uma requisição:

```bash
clickupfy api v3-create-chat-reaction --input entrada.json --dry-run
```

Use um envelope JSON pelo stdin:

```bash
printf '%s' '{"path":{"workspace_id":1,"message_id":"exemplo-1"},"body":{"reaction":"exemplo-1"}}' | clickupfy api v3-create-chat-reaction --input -
```

Selecione o perfil que tem acesso ao recurso:

```bash
clickupfy --account produto api v3-create-chat-reaction --input entrada.json
```

Grave a resposta JSON para conferência. O arquivo de entrada usa o envelope do exemplo anterior:

```bash
clickupfy --json api v3-create-chat-reaction --input entrada.json > resposta.json
```

### `clickupfy_api_v3_create_chat_reaction`

A operação `createChatReaction` pertence ao grupo `Chat` e usa
`POST /api/v3/workspaces/{workspace_id}/chat/messages/{message_id}/reactions`.

A chamada altera o recurso indicado pelos parâmetros. Confira o resultado com a consulta correspondente antes de continuar.

A resposta preserva o JSON da API; respostas sem corpo retornam `{}`.
A API key do perfil precisa ter acesso ao recurso. As permissões e o plano do Workspace podem restringir o endpoint.
Os campos omitidos são tratados pelo servidor do ClickUp, sem padrões adicionais do cliente.

[Referência oficial](https://developer.clickup.com/reference/createchatreaction).

| Entrada | Tipo | Obrigatória |
| --- | --- | --- |
| `path.workspace_id` | `integer` | sim |
| `path.message_id` | `string` | sim |
| `body` | objeto conforme `api describe` | sim |

`account` é opcional e usa o perfil ativo ou fixado no MCP. O retorno aparece em
`content` como JSON; recusas retornam `isError: true`. Ferramentas de escrita
ficam ausentes em `--read-only`. IDs explícitos devem respeitar a hierarquia fixada.

Exemplos:

Use o perfil ativo com o envelope mínimo:

```json
{
  "name": "clickupfy_api_v3_create_chat_reaction",
  "arguments": {
    "path": {
      "workspace_id": 1,
      "message_id": "exemplo-1"
    },
    "body": {
      "reaction": "exemplo-1"
    }
  }
}
```

Direcione a chamada ao perfil de desenvolvimento:

```json
{
  "name": "clickupfy_api_v3_create_chat_reaction",
  "arguments": {
    "path": {
      "workspace_id": 1,
      "message_id": "exemplo-1"
    },
    "body": {
      "reaction": "exemplo-1"
    },
    "account": "dev"
  }
}
```

Use o perfil do produto, quando o MCP permitir selecionar outro perfil:

```json
{
  "name": "clickupfy_api_v3_create_chat_reaction",
  "arguments": {
    "path": {
      "workspace_id": 1,
      "message_id": "exemplo-1"
    },
    "body": {
      "reaction": "exemplo-1"
    },
    "account": "produto"
  }
}
```

Consulte o schema antes de compor uma chamada pelo agente:

```bash
clickupfy api describe clickupfy_api_v3_create_chat_reaction
```

Reproduza pelo CLI a entrada usada pelo agente, sem executar a operação:

```bash
printf '%s' '{"path":{"workspace_id":1,"message_id":"exemplo-1"},"body":{"reaction":"exemplo-1"}}' | clickupfy api v3-create-chat-reaction --input - --dry-run
```

### `clickupfy api v3-delete-chat-reaction`

A operação `deleteChatReaction` pertence ao grupo `Chat` e usa
`DELETE /api/v3/workspaces/{workspace_id}/chat/messages/{message_id}/reactions/{reaction}`.

A chamada altera o recurso indicado pelos parâmetros. Confira o resultado com a consulta correspondente antes de continuar.

A resposta preserva o JSON da API; respostas sem corpo retornam `{}`.
A API key do perfil precisa ter acesso ao recurso. As permissões e o plano do Workspace podem restringir o endpoint.
Os campos omitidos são tratados pelo servidor do ClickUp, sem padrões adicionais do cliente.

[Referência oficial](https://developer.clickup.com/reference/deletechatreaction).

| Entrada | Tipo | Obrigatória |
| --- | --- | --- |
| `path.workspace_id` | `integer` | sim |
| `path.message_id` | `string` | sim |
| `path.reaction` | `string` | sim |
| `confirm` | boolean, somente `true` | sim |

O comando aceita as flags comuns de `api`: `--input`, `--path`, `--query`,
`--body`, `--body-file`, `--content-type`, `--file`, `--dry-run` e `--yes`.
A referência completa de tipos, campos aninhados e valores permitidos está no comando `describe` abaixo.

Exemplos:

Consulte o contrato antes de preencher os IDs reais:

```bash
clickupfy api describe v3-delete-chat-reaction
```

Valide uma entrada em arquivo sem enviar uma requisição:

```bash
clickupfy api v3-delete-chat-reaction --input entrada.json --dry-run
```

Use um envelope JSON pelo stdin:

```bash
printf '%s' '{"path":{"workspace_id":1,"message_id":"exemplo-1","reaction":"exemplo-1"},"confirm":true}' | clickupfy api v3-delete-chat-reaction --input -
```

Selecione o perfil que tem acesso ao recurso:

```bash
clickupfy --account produto api v3-delete-chat-reaction --input entrada.json
```

Grave a resposta JSON para conferência. O arquivo de entrada usa o envelope do exemplo anterior:

```bash
clickupfy --json api v3-delete-chat-reaction --input entrada.json > resposta.json
```

### `clickupfy_api_v3_delete_chat_reaction`

A operação `deleteChatReaction` pertence ao grupo `Chat` e usa
`DELETE /api/v3/workspaces/{workspace_id}/chat/messages/{message_id}/reactions/{reaction}`.

A chamada altera o recurso indicado pelos parâmetros. Confira o resultado com a consulta correspondente antes de continuar.

A resposta preserva o JSON da API; respostas sem corpo retornam `{}`.
A API key do perfil precisa ter acesso ao recurso. As permissões e o plano do Workspace podem restringir o endpoint.
Os campos omitidos são tratados pelo servidor do ClickUp, sem padrões adicionais do cliente.

[Referência oficial](https://developer.clickup.com/reference/deletechatreaction).

| Entrada | Tipo | Obrigatória |
| --- | --- | --- |
| `path.workspace_id` | `integer` | sim |
| `path.message_id` | `string` | sim |
| `path.reaction` | `string` | sim |
| `confirm` | boolean, somente `true` | sim |

`account` é opcional e usa o perfil ativo ou fixado no MCP. O retorno aparece em
`content` como JSON; recusas retornam `isError: true`. Ferramentas de escrita
ficam ausentes em `--read-only`. IDs explícitos devem respeitar a hierarquia fixada.

Exemplos:

Use o perfil ativo com o envelope mínimo:

```json
{
  "name": "clickupfy_api_v3_delete_chat_reaction",
  "arguments": {
    "path": {
      "workspace_id": 1,
      "message_id": "exemplo-1",
      "reaction": "exemplo-1"
    },
    "confirm": true
  }
}
```

Direcione a chamada ao perfil de desenvolvimento:

```json
{
  "name": "clickupfy_api_v3_delete_chat_reaction",
  "arguments": {
    "path": {
      "workspace_id": 1,
      "message_id": "exemplo-1",
      "reaction": "exemplo-1"
    },
    "confirm": true,
    "account": "dev"
  }
}
```

Use o perfil do produto, quando o MCP permitir selecionar outro perfil:

```json
{
  "name": "clickupfy_api_v3_delete_chat_reaction",
  "arguments": {
    "path": {
      "workspace_id": 1,
      "message_id": "exemplo-1",
      "reaction": "exemplo-1"
    },
    "confirm": true,
    "account": "produto"
  }
}
```

Consulte o schema antes de compor uma chamada pelo agente:

```bash
clickupfy api describe clickupfy_api_v3_delete_chat_reaction
```

Reproduza pelo CLI a entrada usada pelo agente, sem executar a operação:

```bash
printf '%s' '{"path":{"workspace_id":1,"message_id":"exemplo-1","reaction":"exemplo-1"},"confirm":true}' | clickupfy api v3-delete-chat-reaction --input - --dry-run
```

### `clickupfy api v3-get-chat-message-replies`

A operação `getChatMessageReplies` pertence ao grupo `Chat` e usa
`GET /api/v3/workspaces/{workspace_id}/chat/messages/{message_id}/replies`.

A chamada consulta o recurso sem modificá-lo.

A resposta preserva o JSON da API; respostas sem corpo retornam `{}`.
A API key do perfil precisa ter acesso ao recurso. As permissões e o plano do Workspace podem restringir o endpoint.
Os campos omitidos são tratados pelo servidor do ClickUp, sem padrões adicionais do cliente.

[Referência oficial](https://developer.clickup.com/reference/getchatmessagereplies).

| Entrada | Tipo | Obrigatória |
| --- | --- | --- |
| `path.workspace_id` | `integer` | sim |
| `path.message_id` | `string` | sim |
| `query.cursor` | `string` | não |
| `query.limit` | `integer` | não |
| `query.content_format` | `string` | não |

O comando aceita as flags comuns de `api`: `--input`, `--path`, `--query`,
`--body`, `--body-file`, `--content-type`, `--file`, `--dry-run` e `--yes`.
A referência completa de tipos, campos aninhados e valores permitidos está no comando `describe` abaixo.

Exemplos:

Consulte o contrato antes de preencher os IDs reais:

```bash
clickupfy api describe v3-get-chat-message-replies
```

Valide uma entrada em arquivo sem enviar uma requisição:

```bash
clickupfy api v3-get-chat-message-replies --input entrada.json --dry-run
```

Use um envelope JSON pelo stdin:

```bash
printf '%s' '{"path":{"workspace_id":1,"message_id":"exemplo-1"}}' | clickupfy api v3-get-chat-message-replies --input -
```

Selecione o perfil que tem acesso ao recurso:

```bash
clickupfy --account produto api v3-get-chat-message-replies --input entrada.json
```

Grave a resposta JSON para conferência. O arquivo de entrada usa o envelope do exemplo anterior:

```bash
clickupfy --json api v3-get-chat-message-replies --input entrada.json > resposta.json
```

### `clickupfy_api_v3_get_chat_message_replies`

A operação `getChatMessageReplies` pertence ao grupo `Chat` e usa
`GET /api/v3/workspaces/{workspace_id}/chat/messages/{message_id}/replies`.

A chamada consulta o recurso sem modificá-lo.

A resposta preserva o JSON da API; respostas sem corpo retornam `{}`.
A API key do perfil precisa ter acesso ao recurso. As permissões e o plano do Workspace podem restringir o endpoint.
Os campos omitidos são tratados pelo servidor do ClickUp, sem padrões adicionais do cliente.

[Referência oficial](https://developer.clickup.com/reference/getchatmessagereplies).

| Entrada | Tipo | Obrigatória |
| --- | --- | --- |
| `path.workspace_id` | `integer` | sim |
| `path.message_id` | `string` | sim |
| `query.cursor` | `string` | não |
| `query.limit` | `integer` | não |
| `query.content_format` | `string` | não |

`account` é opcional e usa o perfil ativo ou fixado no MCP. O retorno aparece em
`content` como JSON; recusas retornam `isError: true`. Ferramentas de escrita
ficam ausentes em `--read-only`. IDs explícitos devem respeitar a hierarquia fixada.

Exemplos:

Use o perfil ativo com o envelope mínimo:

```json
{
  "name": "clickupfy_api_v3_get_chat_message_replies",
  "arguments": {
    "path": {
      "workspace_id": 1,
      "message_id": "exemplo-1"
    }
  }
}
```

Direcione a chamada ao perfil de desenvolvimento:

```json
{
  "name": "clickupfy_api_v3_get_chat_message_replies",
  "arguments": {
    "path": {
      "workspace_id": 1,
      "message_id": "exemplo-1"
    },
    "account": "dev"
  }
}
```

Use o perfil do produto, quando o MCP permitir selecionar outro perfil:

```json
{
  "name": "clickupfy_api_v3_get_chat_message_replies",
  "arguments": {
    "path": {
      "workspace_id": 1,
      "message_id": "exemplo-1"
    },
    "account": "produto"
  }
}
```

Consulte o schema antes de compor uma chamada pelo agente:

```bash
clickupfy api describe clickupfy_api_v3_get_chat_message_replies
```

Reproduza pelo CLI a entrada usada pelo agente, sem executar a operação:

```bash
printf '%s' '{"path":{"workspace_id":1,"message_id":"exemplo-1"}}' | clickupfy api v3-get-chat-message-replies --input - --dry-run
```

### `clickupfy api v3-create-reply-message`

A operação `createReplyMessage` pertence ao grupo `Chat` e usa
`POST /api/v3/workspaces/{workspace_id}/chat/messages/{message_id}/replies`.

A chamada altera o recurso indicado pelos parâmetros. Confira o resultado com a consulta correspondente antes de continuar.

A resposta preserva o JSON da API; respostas sem corpo retornam `{}`.
A API key do perfil precisa ter acesso ao recurso. As permissões e o plano do Workspace podem restringir o endpoint.
Os campos omitidos são tratados pelo servidor do ClickUp, sem padrões adicionais do cliente.

[Referência oficial](https://developer.clickup.com/reference/createreplymessage).

| Entrada | Tipo | Obrigatória |
| --- | --- | --- |
| `path.workspace_id` | `integer` | sim |
| `path.message_id` | `string` | sim |
| `body` | objeto conforme `api describe` | sim |

O comando aceita as flags comuns de `api`: `--input`, `--path`, `--query`,
`--body`, `--body-file`, `--content-type`, `--file`, `--dry-run` e `--yes`.
A referência completa de tipos, campos aninhados e valores permitidos está no comando `describe` abaixo.

Exemplos:

Consulte o contrato antes de preencher os IDs reais:

```bash
clickupfy api describe v3-create-reply-message
```

Valide uma entrada em arquivo sem enviar uma requisição:

```bash
clickupfy api v3-create-reply-message --input entrada.json --dry-run
```

Use um envelope JSON pelo stdin:

```bash
printf '%s' '{"path":{"workspace_id":1,"message_id":"exemplo-1"},"body":{"type":"message","content":"exemplo-1"}}' | clickupfy api v3-create-reply-message --input -
```

Selecione o perfil que tem acesso ao recurso:

```bash
clickupfy --account produto api v3-create-reply-message --input entrada.json
```

Grave a resposta JSON para conferência. O arquivo de entrada usa o envelope do exemplo anterior:

```bash
clickupfy --json api v3-create-reply-message --input entrada.json > resposta.json
```

### `clickupfy_api_v3_create_reply_message`

A operação `createReplyMessage` pertence ao grupo `Chat` e usa
`POST /api/v3/workspaces/{workspace_id}/chat/messages/{message_id}/replies`.

A chamada altera o recurso indicado pelos parâmetros. Confira o resultado com a consulta correspondente antes de continuar.

A resposta preserva o JSON da API; respostas sem corpo retornam `{}`.
A API key do perfil precisa ter acesso ao recurso. As permissões e o plano do Workspace podem restringir o endpoint.
Os campos omitidos são tratados pelo servidor do ClickUp, sem padrões adicionais do cliente.

[Referência oficial](https://developer.clickup.com/reference/createreplymessage).

| Entrada | Tipo | Obrigatória |
| --- | --- | --- |
| `path.workspace_id` | `integer` | sim |
| `path.message_id` | `string` | sim |
| `body` | objeto conforme `api describe` | sim |

`account` é opcional e usa o perfil ativo ou fixado no MCP. O retorno aparece em
`content` como JSON; recusas retornam `isError: true`. Ferramentas de escrita
ficam ausentes em `--read-only`. IDs explícitos devem respeitar a hierarquia fixada.

Exemplos:

Use o perfil ativo com o envelope mínimo:

```json
{
  "name": "clickupfy_api_v3_create_reply_message",
  "arguments": {
    "path": {
      "workspace_id": 1,
      "message_id": "exemplo-1"
    },
    "body": {
      "type": "message",
      "content": "exemplo-1"
    }
  }
}
```

Direcione a chamada ao perfil de desenvolvimento:

```json
{
  "name": "clickupfy_api_v3_create_reply_message",
  "arguments": {
    "path": {
      "workspace_id": 1,
      "message_id": "exemplo-1"
    },
    "body": {
      "type": "message",
      "content": "exemplo-1"
    },
    "account": "dev"
  }
}
```

Use o perfil do produto, quando o MCP permitir selecionar outro perfil:

```json
{
  "name": "clickupfy_api_v3_create_reply_message",
  "arguments": {
    "path": {
      "workspace_id": 1,
      "message_id": "exemplo-1"
    },
    "body": {
      "type": "message",
      "content": "exemplo-1"
    },
    "account": "produto"
  }
}
```

Consulte o schema antes de compor uma chamada pelo agente:

```bash
clickupfy api describe clickupfy_api_v3_create_reply_message
```

Reproduza pelo CLI a entrada usada pelo agente, sem executar a operação:

```bash
printf '%s' '{"path":{"workspace_id":1,"message_id":"exemplo-1"},"body":{"type":"message","content":"exemplo-1"}}' | clickupfy api v3-create-reply-message --input - --dry-run
```

### `clickupfy api v3-get-chat-message-tagged-users`

A operação `getChatMessageTaggedUsers` pertence ao grupo `Chat` e usa
`GET /api/v3/workspaces/{workspace_id}/chat/messages/{message_id}/tagged_users`.

A chamada consulta o recurso sem modificá-lo.

A resposta preserva o JSON da API; respostas sem corpo retornam `{}`.
A API key do perfil precisa ter acesso ao recurso. As permissões e o plano do Workspace podem restringir o endpoint.
Os campos omitidos são tratados pelo servidor do ClickUp, sem padrões adicionais do cliente.

[Referência oficial](https://developer.clickup.com/reference/getchatmessagetaggedusers).

| Entrada | Tipo | Obrigatória |
| --- | --- | --- |
| `path.workspace_id` | `integer` | sim |
| `path.message_id` | `string` | sim |
| `query.cursor` | `string` | não |
| `query.limit` | `integer` | não |

O comando aceita as flags comuns de `api`: `--input`, `--path`, `--query`,
`--body`, `--body-file`, `--content-type`, `--file`, `--dry-run` e `--yes`.
A referência completa de tipos, campos aninhados e valores permitidos está no comando `describe` abaixo.

Exemplos:

Consulte o contrato antes de preencher os IDs reais:

```bash
clickupfy api describe v3-get-chat-message-tagged-users
```

Valide uma entrada em arquivo sem enviar uma requisição:

```bash
clickupfy api v3-get-chat-message-tagged-users --input entrada.json --dry-run
```

Use um envelope JSON pelo stdin:

```bash
printf '%s' '{"path":{"workspace_id":1,"message_id":"exemplo-1"}}' | clickupfy api v3-get-chat-message-tagged-users --input -
```

Selecione o perfil que tem acesso ao recurso:

```bash
clickupfy --account produto api v3-get-chat-message-tagged-users --input entrada.json
```

Grave a resposta JSON para conferência. O arquivo de entrada usa o envelope do exemplo anterior:

```bash
clickupfy --json api v3-get-chat-message-tagged-users --input entrada.json > resposta.json
```

### `clickupfy_api_v3_get_chat_message_tagged_users`

A operação `getChatMessageTaggedUsers` pertence ao grupo `Chat` e usa
`GET /api/v3/workspaces/{workspace_id}/chat/messages/{message_id}/tagged_users`.

A chamada consulta o recurso sem modificá-lo.

A resposta preserva o JSON da API; respostas sem corpo retornam `{}`.
A API key do perfil precisa ter acesso ao recurso. As permissões e o plano do Workspace podem restringir o endpoint.
Os campos omitidos são tratados pelo servidor do ClickUp, sem padrões adicionais do cliente.

[Referência oficial](https://developer.clickup.com/reference/getchatmessagetaggedusers).

| Entrada | Tipo | Obrigatória |
| --- | --- | --- |
| `path.workspace_id` | `integer` | sim |
| `path.message_id` | `string` | sim |
| `query.cursor` | `string` | não |
| `query.limit` | `integer` | não |

`account` é opcional e usa o perfil ativo ou fixado no MCP. O retorno aparece em
`content` como JSON; recusas retornam `isError: true`. Ferramentas de escrita
ficam ausentes em `--read-only`. IDs explícitos devem respeitar a hierarquia fixada.

Exemplos:

Use o perfil ativo com o envelope mínimo:

```json
{
  "name": "clickupfy_api_v3_get_chat_message_tagged_users",
  "arguments": {
    "path": {
      "workspace_id": 1,
      "message_id": "exemplo-1"
    }
  }
}
```

Direcione a chamada ao perfil de desenvolvimento:

```json
{
  "name": "clickupfy_api_v3_get_chat_message_tagged_users",
  "arguments": {
    "path": {
      "workspace_id": 1,
      "message_id": "exemplo-1"
    },
    "account": "dev"
  }
}
```

Use o perfil do produto, quando o MCP permitir selecionar outro perfil:

```json
{
  "name": "clickupfy_api_v3_get_chat_message_tagged_users",
  "arguments": {
    "path": {
      "workspace_id": 1,
      "message_id": "exemplo-1"
    },
    "account": "produto"
  }
}
```

Consulte o schema antes de compor uma chamada pelo agente:

```bash
clickupfy api describe clickupfy_api_v3_get_chat_message_tagged_users
```

Reproduza pelo CLI a entrada usada pelo agente, sem executar a operação:

```bash
printf '%s' '{"path":{"workspace_id":1,"message_id":"exemplo-1"}}' | clickupfy api v3-get-chat-message-tagged-users --input - --dry-run
```

### `clickupfy api v3-get-parent-entity-attachments`

A operação `getParentEntityAttachments` pertence ao grupo `Attachments` e usa
`GET /api/v3/workspaces/{workspace_id}/{entity_type}/{entity_id}/attachments`.

A chamada consulta o recurso sem modificá-lo.

A resposta preserva o JSON da API; respostas sem corpo retornam `{}`.
A API key do perfil precisa ter acesso ao recurso. As permissões e o plano do Workspace podem restringir o endpoint.
Os campos omitidos são tratados pelo servidor do ClickUp, sem padrões adicionais do cliente.

[Referência oficial](https://developer.clickup.com/reference/getparententityattachments).

| Entrada | Tipo | Obrigatória |
| --- | --- | --- |
| `path.workspace_id` | `integer` | sim |
| `path.entity_type` | `string` | sim |
| `path.entity_id` | `string` | sim |
| `query.cursor` | `string` | não |
| `query.limit` | `integer` | não |

O comando aceita as flags comuns de `api`: `--input`, `--path`, `--query`,
`--body`, `--body-file`, `--content-type`, `--file`, `--dry-run` e `--yes`.
A referência completa de tipos, campos aninhados e valores permitidos está no comando `describe` abaixo.

Exemplos:

Consulte o contrato antes de preencher os IDs reais:

```bash
clickupfy api describe v3-get-parent-entity-attachments
```

Valide uma entrada em arquivo sem enviar uma requisição:

```bash
clickupfy api v3-get-parent-entity-attachments --input entrada.json --dry-run
```

Use um envelope JSON pelo stdin:

```bash
printf '%s' '{"path":{"workspace_id":1,"entity_type":"attachments","entity_id":"exemplo-1"}}' | clickupfy api v3-get-parent-entity-attachments --input -
```

Selecione o perfil que tem acesso ao recurso:

```bash
clickupfy --account produto api v3-get-parent-entity-attachments --input entrada.json
```

Grave a resposta JSON para conferência. O arquivo de entrada usa o envelope do exemplo anterior:

```bash
clickupfy --json api v3-get-parent-entity-attachments --input entrada.json > resposta.json
```

### `clickupfy_api_v3_get_parent_entity_attachments`

A operação `getParentEntityAttachments` pertence ao grupo `Attachments` e usa
`GET /api/v3/workspaces/{workspace_id}/{entity_type}/{entity_id}/attachments`.

A chamada consulta o recurso sem modificá-lo.

A resposta preserva o JSON da API; respostas sem corpo retornam `{}`.
A API key do perfil precisa ter acesso ao recurso. As permissões e o plano do Workspace podem restringir o endpoint.
Os campos omitidos são tratados pelo servidor do ClickUp, sem padrões adicionais do cliente.

[Referência oficial](https://developer.clickup.com/reference/getparententityattachments).

| Entrada | Tipo | Obrigatória |
| --- | --- | --- |
| `path.workspace_id` | `integer` | sim |
| `path.entity_type` | `string` | sim |
| `path.entity_id` | `string` | sim |
| `query.cursor` | `string` | não |
| `query.limit` | `integer` | não |

`account` é opcional e usa o perfil ativo ou fixado no MCP. O retorno aparece em
`content` como JSON; recusas retornam `isError: true`. Ferramentas de escrita
ficam ausentes em `--read-only`. IDs explícitos devem respeitar a hierarquia fixada.

Exemplos:

Use o perfil ativo com o envelope mínimo:

```json
{
  "name": "clickupfy_api_v3_get_parent_entity_attachments",
  "arguments": {
    "path": {
      "workspace_id": 1,
      "entity_type": "attachments",
      "entity_id": "exemplo-1"
    }
  }
}
```

Direcione a chamada ao perfil de desenvolvimento:

```json
{
  "name": "clickupfy_api_v3_get_parent_entity_attachments",
  "arguments": {
    "path": {
      "workspace_id": 1,
      "entity_type": "attachments",
      "entity_id": "exemplo-1"
    },
    "account": "dev"
  }
}
```

Use o perfil do produto, quando o MCP permitir selecionar outro perfil:

```json
{
  "name": "clickupfy_api_v3_get_parent_entity_attachments",
  "arguments": {
    "path": {
      "workspace_id": 1,
      "entity_type": "attachments",
      "entity_id": "exemplo-1"
    },
    "account": "produto"
  }
}
```

Consulte o schema antes de compor uma chamada pelo agente:

```bash
clickupfy api describe clickupfy_api_v3_get_parent_entity_attachments
```

Reproduza pelo CLI a entrada usada pelo agente, sem executar a operação:

```bash
printf '%s' '{"path":{"workspace_id":1,"entity_type":"attachments","entity_id":"exemplo-1"}}' | clickupfy api v3-get-parent-entity-attachments --input - --dry-run
```

### `clickupfy api v3-post-entity-attachment`

A operação `postEntityAttachment` pertence ao grupo `Attachments` e usa
`POST /api/v3/workspaces/{workspace_id}/{entity_type}/{entity_id}/attachments`.

A chamada altera o recurso indicado pelos parâmetros. Confira o resultado com a consulta correspondente antes de continuar.

A resposta preserva o JSON da API; respostas sem corpo retornam `{}`.
A API key do perfil precisa ter acesso ao recurso. As permissões e o plano do Workspace podem restringir o endpoint.
Os campos omitidos são tratados pelo servidor do ClickUp, sem padrões adicionais do cliente.

[Referência oficial](https://developer.clickup.com/reference/postentityattachment).

| Entrada | Tipo | Obrigatória |
| --- | --- | --- |
| `path.workspace_id` | `integer` | sim |
| `path.entity_type` | `string` | sim |
| `path.entity_id` | `string` | sim |
| `body` | objeto conforme `api describe` | sim |
| `files` | array de arquivos em base64 | sim |

O comando aceita as flags comuns de `api`: `--input`, `--path`, `--query`,
`--body`, `--body-file`, `--content-type`, `--file`, `--dry-run` e `--yes`.
A referência completa de tipos, campos aninhados e valores permitidos está no comando `describe` abaixo.

Exemplos:

Consulte o contrato antes de preencher os IDs reais:

```bash
clickupfy api describe v3-post-entity-attachment
```

Valide uma entrada em arquivo sem enviar uma requisição:

```bash
clickupfy api v3-post-entity-attachment --input entrada.json --dry-run
```

Use um envelope JSON pelo stdin:

```bash
printf '%s' '{"path":{"workspace_id":1,"entity_type":"attachments","entity_id":"exemplo-1"},"body":{},"files":[{"field":"attachment","filename":"exemplo-1.txt","contentBase64":"dGVzdGU=","contentType":"text/plain"}]}' | clickupfy api v3-post-entity-attachment --input -
```

Selecione o perfil que tem acesso ao recurso:

```bash
clickupfy --account produto api v3-post-entity-attachment --input entrada.json
```

Grave a resposta JSON para conferência. O arquivo de entrada usa o envelope do exemplo anterior:

```bash
clickupfy --json api v3-post-entity-attachment --input entrada.json > resposta.json
```

### `clickupfy_api_v3_post_entity_attachment`

A operação `postEntityAttachment` pertence ao grupo `Attachments` e usa
`POST /api/v3/workspaces/{workspace_id}/{entity_type}/{entity_id}/attachments`.

A chamada altera o recurso indicado pelos parâmetros. Confira o resultado com a consulta correspondente antes de continuar.

A resposta preserva o JSON da API; respostas sem corpo retornam `{}`.
A API key do perfil precisa ter acesso ao recurso. As permissões e o plano do Workspace podem restringir o endpoint.
Os campos omitidos são tratados pelo servidor do ClickUp, sem padrões adicionais do cliente.

[Referência oficial](https://developer.clickup.com/reference/postentityattachment).

| Entrada | Tipo | Obrigatória |
| --- | --- | --- |
| `path.workspace_id` | `integer` | sim |
| `path.entity_type` | `string` | sim |
| `path.entity_id` | `string` | sim |
| `body` | objeto conforme `api describe` | sim |
| `files` | array de arquivos em base64 | sim |

`account` é opcional e usa o perfil ativo ou fixado no MCP. O retorno aparece em
`content` como JSON; recusas retornam `isError: true`. Ferramentas de escrita
ficam ausentes em `--read-only`. IDs explícitos devem respeitar a hierarquia fixada.

Exemplos:

Use o perfil ativo com o envelope mínimo:

```json
{
  "name": "clickupfy_api_v3_post_entity_attachment",
  "arguments": {
    "path": {
      "workspace_id": 1,
      "entity_type": "attachments",
      "entity_id": "exemplo-1"
    },
    "body": {},
    "files": [
      {
        "field": "attachment",
        "filename": "exemplo-1.txt",
        "contentBase64": "dGVzdGU=",
        "contentType": "text/plain"
      }
    ]
  }
}
```

Direcione a chamada ao perfil de desenvolvimento:

```json
{
  "name": "clickupfy_api_v3_post_entity_attachment",
  "arguments": {
    "path": {
      "workspace_id": 1,
      "entity_type": "attachments",
      "entity_id": "exemplo-1"
    },
    "body": {},
    "files": [
      {
        "field": "attachment",
        "filename": "exemplo-1.txt",
        "contentBase64": "dGVzdGU=",
        "contentType": "text/plain"
      }
    ],
    "account": "dev"
  }
}
```

Use o perfil do produto, quando o MCP permitir selecionar outro perfil:

```json
{
  "name": "clickupfy_api_v3_post_entity_attachment",
  "arguments": {
    "path": {
      "workspace_id": 1,
      "entity_type": "attachments",
      "entity_id": "exemplo-1"
    },
    "body": {},
    "files": [
      {
        "field": "attachment",
        "filename": "exemplo-1.txt",
        "contentBase64": "dGVzdGU=",
        "contentType": "text/plain"
      }
    ],
    "account": "produto"
  }
}
```

Consulte o schema antes de compor uma chamada pelo agente:

```bash
clickupfy api describe clickupfy_api_v3_post_entity_attachment
```

Reproduza pelo CLI a entrada usada pelo agente, sem executar a operação:

```bash
printf '%s' '{"path":{"workspace_id":1,"entity_type":"attachments","entity_id":"exemplo-1"},"body":{},"files":[{"field":"attachment","filename":"exemplo-1.txt","contentBase64":"dGVzdGU=","contentType":"text/plain"}]}' | clickupfy api v3-post-entity-attachment --input - --dry-run
```

### `clickupfy api v3-public-patch-acl`

A operação `publicPatchAcl` pertence ao grupo `Acls` e usa
`PATCH /api/v3/workspaces/{workspace_id}/{object_type}/{object_id}/acls`.

A chamada altera o recurso indicado pelos parâmetros. Confira o resultado com a consulta correspondente antes de continuar.

A resposta preserva o JSON da API; respostas sem corpo retornam `{}`.
A API key do perfil precisa ter acesso ao recurso. As permissões e o plano do Workspace podem restringir o endpoint.
Os campos omitidos são tratados pelo servidor do ClickUp, sem padrões adicionais do cliente.

[Referência oficial](https://developer.clickup.com/reference/publicpatchacl).

| Entrada | Tipo | Obrigatória |
| --- | --- | --- |
| `path.workspace_id` | `number` | sim |
| `path.object_type` | `string` | sim |
| `path.object_id` | `string` | sim |
| `body` | objeto conforme `api describe` | sim |

O comando aceita as flags comuns de `api`: `--input`, `--path`, `--query`,
`--body`, `--body-file`, `--content-type`, `--file`, `--dry-run` e `--yes`.
A referência completa de tipos, campos aninhados e valores permitidos está no comando `describe` abaixo.

Exemplos:

Consulte o contrato antes de preencher os IDs reais:

```bash
clickupfy api describe v3-public-patch-acl
```

Valide uma entrada em arquivo sem enviar uma requisição:

```bash
clickupfy api v3-public-patch-acl --input entrada.json --dry-run
```

Use um envelope JSON pelo stdin:

```bash
printf '%s' '{"path":{"workspace_id":1,"object_type":"approval","object_id":"exemplo-1"},"body":{}}' | clickupfy api v3-public-patch-acl --input -
```

Selecione o perfil que tem acesso ao recurso:

```bash
clickupfy --account produto api v3-public-patch-acl --input entrada.json
```

Grave a resposta JSON para conferência. O arquivo de entrada usa o envelope do exemplo anterior:

```bash
clickupfy --json api v3-public-patch-acl --input entrada.json > resposta.json
```

### `clickupfy_api_v3_public_patch_acl`

A operação `publicPatchAcl` pertence ao grupo `Acls` e usa
`PATCH /api/v3/workspaces/{workspace_id}/{object_type}/{object_id}/acls`.

A chamada altera o recurso indicado pelos parâmetros. Confira o resultado com a consulta correspondente antes de continuar.

A resposta preserva o JSON da API; respostas sem corpo retornam `{}`.
A API key do perfil precisa ter acesso ao recurso. As permissões e o plano do Workspace podem restringir o endpoint.
Os campos omitidos são tratados pelo servidor do ClickUp, sem padrões adicionais do cliente.

[Referência oficial](https://developer.clickup.com/reference/publicpatchacl).

| Entrada | Tipo | Obrigatória |
| --- | --- | --- |
| `path.workspace_id` | `number` | sim |
| `path.object_type` | `string` | sim |
| `path.object_id` | `string` | sim |
| `body` | objeto conforme `api describe` | sim |

`account` é opcional e usa o perfil ativo ou fixado no MCP. O retorno aparece em
`content` como JSON; recusas retornam `isError: true`. Ferramentas de escrita
ficam ausentes em `--read-only`. IDs explícitos devem respeitar a hierarquia fixada.

Exemplos:

Use o perfil ativo com o envelope mínimo:

```json
{
  "name": "clickupfy_api_v3_public_patch_acl",
  "arguments": {
    "path": {
      "workspace_id": 1,
      "object_type": "approval",
      "object_id": "exemplo-1"
    },
    "body": {}
  }
}
```

Direcione a chamada ao perfil de desenvolvimento:

```json
{
  "name": "clickupfy_api_v3_public_patch_acl",
  "arguments": {
    "path": {
      "workspace_id": 1,
      "object_type": "approval",
      "object_id": "exemplo-1"
    },
    "body": {},
    "account": "dev"
  }
}
```

Use o perfil do produto, quando o MCP permitir selecionar outro perfil:

```json
{
  "name": "clickupfy_api_v3_public_patch_acl",
  "arguments": {
    "path": {
      "workspace_id": 1,
      "object_type": "approval",
      "object_id": "exemplo-1"
    },
    "body": {},
    "account": "produto"
  }
}
```

Consulte o schema antes de compor uma chamada pelo agente:

```bash
clickupfy api describe clickupfy_api_v3_public_patch_acl
```

Reproduza pelo CLI a entrada usada pelo agente, sem executar a operação:

```bash
printf '%s' '{"path":{"workspace_id":1,"object_type":"approval","object_id":"exemplo-1"},"body":{}}' | clickupfy api v3-public-patch-acl --input - --dry-run
```

### `clickupfy api v3-query-audit-log`

A operação `queryAuditLog` pertence ao grupo `Auditlogs` e usa
`POST /api/v3/workspaces/{workspace_id}/auditlogs`.

A chamada consulta o recurso sem modificá-lo.

A resposta preserva o JSON da API; respostas sem corpo retornam `{}`.
A API key do perfil precisa ter acesso ao recurso. As permissões e o plano do Workspace podem restringir o endpoint.
Os campos omitidos são tratados pelo servidor do ClickUp, sem padrões adicionais do cliente.

[Referência oficial](https://developer.clickup.com/reference/queryauditlog).

| Entrada | Tipo | Obrigatória |
| --- | --- | --- |
| `path.workspace_id` | `number` | sim |
| `body` | objeto conforme `api describe` | sim |

O comando aceita as flags comuns de `api`: `--input`, `--path`, `--query`,
`--body`, `--body-file`, `--content-type`, `--file`, `--dry-run` e `--yes`.
A referência completa de tipos, campos aninhados e valores permitidos está no comando `describe` abaixo.

Exemplos:

Consulte o contrato antes de preencher os IDs reais:

```bash
clickupfy api describe v3-query-audit-log
```

Valide uma entrada em arquivo sem enviar uma requisição:

```bash
clickupfy api v3-query-audit-log --input entrada.json --dry-run
```

Use um envelope JSON pelo stdin:

```bash
printf '%s' '{"path":{"workspace_id":1},"body":{}}' | clickupfy api v3-query-audit-log --input -
```

Selecione o perfil que tem acesso ao recurso:

```bash
clickupfy --account produto api v3-query-audit-log --input entrada.json
```

Grave a resposta JSON para conferência. O arquivo de entrada usa o envelope do exemplo anterior:

```bash
clickupfy --json api v3-query-audit-log --input entrada.json > resposta.json
```

### `clickupfy_api_v3_query_audit_log`

A operação `queryAuditLog` pertence ao grupo `Auditlogs` e usa
`POST /api/v3/workspaces/{workspace_id}/auditlogs`.

A chamada consulta o recurso sem modificá-lo.

A resposta preserva o JSON da API; respostas sem corpo retornam `{}`.
A API key do perfil precisa ter acesso ao recurso. As permissões e o plano do Workspace podem restringir o endpoint.
Os campos omitidos são tratados pelo servidor do ClickUp, sem padrões adicionais do cliente.

[Referência oficial](https://developer.clickup.com/reference/queryauditlog).

| Entrada | Tipo | Obrigatória |
| --- | --- | --- |
| `path.workspace_id` | `number` | sim |
| `body` | objeto conforme `api describe` | sim |

`account` é opcional e usa o perfil ativo ou fixado no MCP. O retorno aparece em
`content` como JSON; recusas retornam `isError: true`. Ferramentas de escrita
ficam ausentes em `--read-only`. IDs explícitos devem respeitar a hierarquia fixada.

Exemplos:

Use o perfil ativo com o envelope mínimo:

```json
{
  "name": "clickupfy_api_v3_query_audit_log",
  "arguments": {
    "path": {
      "workspace_id": 1
    },
    "body": {}
  }
}
```

Direcione a chamada ao perfil de desenvolvimento:

```json
{
  "name": "clickupfy_api_v3_query_audit_log",
  "arguments": {
    "path": {
      "workspace_id": 1
    },
    "body": {},
    "account": "dev"
  }
}
```

Use o perfil do produto, quando o MCP permitir selecionar outro perfil:

```json
{
  "name": "clickupfy_api_v3_query_audit_log",
  "arguments": {
    "path": {
      "workspace_id": 1
    },
    "body": {},
    "account": "produto"
  }
}
```

Consulte o schema antes de compor uma chamada pelo agente:

```bash
clickupfy api describe clickupfy_api_v3_query_audit_log
```

Reproduza pelo CLI a entrada usada pelo agente, sem executar a operação:

```bash
printf '%s' '{"path":{"workspace_id":1},"body":{}}' | clickupfy api v3-query-audit-log --input - --dry-run
```

### `clickupfy api v3-get-subtypes`

A operação `getSubtypes` pertence ao grupo `Comments` e usa
`GET /api/v3/workspaces/{workspace_id}/comments/types/{comment_type}/subtypes`.

A chamada consulta o recurso sem modificá-lo.

A resposta preserva o JSON da API; respostas sem corpo retornam `{}`.
A API key do perfil precisa ter acesso ao recurso. As permissões e o plano do Workspace podem restringir o endpoint.
Os campos omitidos são tratados pelo servidor do ClickUp, sem padrões adicionais do cliente.

[Referência oficial](https://developer.clickup.com/reference/getsubtypes).

| Entrada | Tipo | Obrigatória |
| --- | --- | --- |
| `path.workspace_id` | `integer` | sim |
| `path.comment_type` | `string` | sim |

O comando aceita as flags comuns de `api`: `--input`, `--path`, `--query`,
`--body`, `--body-file`, `--content-type`, `--file`, `--dry-run` e `--yes`.
A referência completa de tipos, campos aninhados e valores permitidos está no comando `describe` abaixo.

Exemplos:

Consulte o contrato antes de preencher os IDs reais:

```bash
clickupfy api describe v3-get-subtypes
```

Valide uma entrada em arquivo sem enviar uma requisição:

```bash
clickupfy api v3-get-subtypes --input entrada.json --dry-run
```

Use um envelope JSON pelo stdin:

```bash
printf '%s' '{"path":{"workspace_id":1,"comment_type":"post"}}' | clickupfy api v3-get-subtypes --input -
```

Selecione o perfil que tem acesso ao recurso:

```bash
clickupfy --account produto api v3-get-subtypes --input entrada.json
```

Grave a resposta JSON para conferência. O arquivo de entrada usa o envelope do exemplo anterior:

```bash
clickupfy --json api v3-get-subtypes --input entrada.json > resposta.json
```

### `clickupfy_api_v3_get_subtypes`

A operação `getSubtypes` pertence ao grupo `Comments` e usa
`GET /api/v3/workspaces/{workspace_id}/comments/types/{comment_type}/subtypes`.

A chamada consulta o recurso sem modificá-lo.

A resposta preserva o JSON da API; respostas sem corpo retornam `{}`.
A API key do perfil precisa ter acesso ao recurso. As permissões e o plano do Workspace podem restringir o endpoint.
Os campos omitidos são tratados pelo servidor do ClickUp, sem padrões adicionais do cliente.

[Referência oficial](https://developer.clickup.com/reference/getsubtypes).

| Entrada | Tipo | Obrigatória |
| --- | --- | --- |
| `path.workspace_id` | `integer` | sim |
| `path.comment_type` | `string` | sim |

`account` é opcional e usa o perfil ativo ou fixado no MCP. O retorno aparece em
`content` como JSON; recusas retornam `isError: true`. Ferramentas de escrita
ficam ausentes em `--read-only`. IDs explícitos devem respeitar a hierarquia fixada.

Exemplos:

Use o perfil ativo com o envelope mínimo:

```json
{
  "name": "clickupfy_api_v3_get_subtypes",
  "arguments": {
    "path": {
      "workspace_id": 1,
      "comment_type": "post"
    }
  }
}
```

Direcione a chamada ao perfil de desenvolvimento:

```json
{
  "name": "clickupfy_api_v3_get_subtypes",
  "arguments": {
    "path": {
      "workspace_id": 1,
      "comment_type": "post"
    },
    "account": "dev"
  }
}
```

Use o perfil do produto, quando o MCP permitir selecionar outro perfil:

```json
{
  "name": "clickupfy_api_v3_get_subtypes",
  "arguments": {
    "path": {
      "workspace_id": 1,
      "comment_type": "post"
    },
    "account": "produto"
  }
}
```

Consulte o schema antes de compor uma chamada pelo agente:

```bash
clickupfy api describe clickupfy_api_v3_get_subtypes
```

Reproduza pelo CLI a entrada usada pelo agente, sem executar a operação:

```bash
printf '%s' '{"path":{"workspace_id":1,"comment_type":"post"}}' | clickupfy api v3-get-subtypes --input - --dry-run
```

### `clickupfy api v3-search-docs-public`

A operação `searchDocsPublic` pertence ao grupo `Docs` e usa
`GET /api/v3/workspaces/{workspace_id}/docs`.

A chamada consulta o recurso sem modificá-lo.

A resposta preserva o JSON da API; respostas sem corpo retornam `{}`.
A API key do perfil precisa ter acesso ao recurso. As permissões e o plano do Workspace podem restringir o endpoint.
Os campos omitidos são tratados pelo servidor do ClickUp, sem padrões adicionais do cliente.

[Referência oficial](https://developer.clickup.com/reference/searchdocspublic).

| Entrada | Tipo | Obrigatória |
| --- | --- | --- |
| `path.workspace_id` | `number` | sim |
| `query.id` | `string` | não |
| `query.creator` | `number` | não |
| `query.deleted` | `boolean` | não |
| `query.archived` | `boolean` | não |
| `query.parent_id` | `string` | não |
| `query.parent_type` | `string` | não |
| `query.limit` | `number` | não |
| `query.cursor` | `string` | não |
| `query.next_cursor` | `string` | não |

O comando aceita as flags comuns de `api`: `--input`, `--path`, `--query`,
`--body`, `--body-file`, `--content-type`, `--file`, `--dry-run` e `--yes`.
A referência completa de tipos, campos aninhados e valores permitidos está no comando `describe` abaixo.

Exemplos:

Consulte o contrato antes de preencher os IDs reais:

```bash
clickupfy api describe v3-search-docs-public
```

Valide uma entrada em arquivo sem enviar uma requisição:

```bash
clickupfy api v3-search-docs-public --input entrada.json --dry-run
```

Use um envelope JSON pelo stdin:

```bash
printf '%s' '{"path":{"workspace_id":1}}' | clickupfy api v3-search-docs-public --input -
```

Selecione o perfil que tem acesso ao recurso:

```bash
clickupfy --account produto api v3-search-docs-public --input entrada.json
```

Grave a resposta JSON para conferência. O arquivo de entrada usa o envelope do exemplo anterior:

```bash
clickupfy --json api v3-search-docs-public --input entrada.json > resposta.json
```

### `clickupfy_api_v3_search_docs_public`

A operação `searchDocsPublic` pertence ao grupo `Docs` e usa
`GET /api/v3/workspaces/{workspace_id}/docs`.

A chamada consulta o recurso sem modificá-lo.

A resposta preserva o JSON da API; respostas sem corpo retornam `{}`.
A API key do perfil precisa ter acesso ao recurso. As permissões e o plano do Workspace podem restringir o endpoint.
Os campos omitidos são tratados pelo servidor do ClickUp, sem padrões adicionais do cliente.

[Referência oficial](https://developer.clickup.com/reference/searchdocspublic).

| Entrada | Tipo | Obrigatória |
| --- | --- | --- |
| `path.workspace_id` | `number` | sim |
| `query.id` | `string` | não |
| `query.creator` | `number` | não |
| `query.deleted` | `boolean` | não |
| `query.archived` | `boolean` | não |
| `query.parent_id` | `string` | não |
| `query.parent_type` | `string` | não |
| `query.limit` | `number` | não |
| `query.cursor` | `string` | não |
| `query.next_cursor` | `string` | não |

`account` é opcional e usa o perfil ativo ou fixado no MCP. O retorno aparece em
`content` como JSON; recusas retornam `isError: true`. Ferramentas de escrita
ficam ausentes em `--read-only`. IDs explícitos devem respeitar a hierarquia fixada.

Exemplos:

Use o perfil ativo com o envelope mínimo:

```json
{
  "name": "clickupfy_api_v3_search_docs_public",
  "arguments": {
    "path": {
      "workspace_id": 1
    }
  }
}
```

Direcione a chamada ao perfil de desenvolvimento:

```json
{
  "name": "clickupfy_api_v3_search_docs_public",
  "arguments": {
    "path": {
      "workspace_id": 1
    },
    "account": "dev"
  }
}
```

Use o perfil do produto, quando o MCP permitir selecionar outro perfil:

```json
{
  "name": "clickupfy_api_v3_search_docs_public",
  "arguments": {
    "path": {
      "workspace_id": 1
    },
    "account": "produto"
  }
}
```

Consulte o schema antes de compor uma chamada pelo agente:

```bash
clickupfy api describe clickupfy_api_v3_search_docs_public
```

Reproduza pelo CLI a entrada usada pelo agente, sem executar a operação:

```bash
printf '%s' '{"path":{"workspace_id":1}}' | clickupfy api v3-search-docs-public --input - --dry-run
```

### `clickupfy api v3-create-doc-public`

A operação `createDocPublic` pertence ao grupo `Docs` e usa
`POST /api/v3/workspaces/{workspace_id}/docs`.

A chamada altera o recurso indicado pelos parâmetros. Confira o resultado com a consulta correspondente antes de continuar.

A resposta preserva o JSON da API; respostas sem corpo retornam `{}`.
A API key do perfil precisa ter acesso ao recurso. As permissões e o plano do Workspace podem restringir o endpoint.
Os campos omitidos são tratados pelo servidor do ClickUp, sem padrões adicionais do cliente.

[Referência oficial](https://developer.clickup.com/reference/createdocpublic).

| Entrada | Tipo | Obrigatória |
| --- | --- | --- |
| `path.workspace_id` | `number` | sim |
| `body` | objeto conforme `api describe` | sim |

O comando aceita as flags comuns de `api`: `--input`, `--path`, `--query`,
`--body`, `--body-file`, `--content-type`, `--file`, `--dry-run` e `--yes`.
A referência completa de tipos, campos aninhados e valores permitidos está no comando `describe` abaixo.

Exemplos:

Consulte o contrato antes de preencher os IDs reais:

```bash
clickupfy api describe v3-create-doc-public
```

Valide uma entrada em arquivo sem enviar uma requisição:

```bash
clickupfy api v3-create-doc-public --input entrada.json --dry-run
```

Use um envelope JSON pelo stdin:

```bash
printf '%s' '{"path":{"workspace_id":1},"body":{}}' | clickupfy api v3-create-doc-public --input -
```

Selecione o perfil que tem acesso ao recurso:

```bash
clickupfy --account produto api v3-create-doc-public --input entrada.json
```

Grave a resposta JSON para conferência. O arquivo de entrada usa o envelope do exemplo anterior:

```bash
clickupfy --json api v3-create-doc-public --input entrada.json > resposta.json
```

### `clickupfy_api_v3_create_doc_public`

A operação `createDocPublic` pertence ao grupo `Docs` e usa
`POST /api/v3/workspaces/{workspace_id}/docs`.

A chamada altera o recurso indicado pelos parâmetros. Confira o resultado com a consulta correspondente antes de continuar.

A resposta preserva o JSON da API; respostas sem corpo retornam `{}`.
A API key do perfil precisa ter acesso ao recurso. As permissões e o plano do Workspace podem restringir o endpoint.
Os campos omitidos são tratados pelo servidor do ClickUp, sem padrões adicionais do cliente.

[Referência oficial](https://developer.clickup.com/reference/createdocpublic).

| Entrada | Tipo | Obrigatória |
| --- | --- | --- |
| `path.workspace_id` | `number` | sim |
| `body` | objeto conforme `api describe` | sim |

`account` é opcional e usa o perfil ativo ou fixado no MCP. O retorno aparece em
`content` como JSON; recusas retornam `isError: true`. Ferramentas de escrita
ficam ausentes em `--read-only`. IDs explícitos devem respeitar a hierarquia fixada.

Exemplos:

Use o perfil ativo com o envelope mínimo:

```json
{
  "name": "clickupfy_api_v3_create_doc_public",
  "arguments": {
    "path": {
      "workspace_id": 1
    },
    "body": {}
  }
}
```

Direcione a chamada ao perfil de desenvolvimento:

```json
{
  "name": "clickupfy_api_v3_create_doc_public",
  "arguments": {
    "path": {
      "workspace_id": 1
    },
    "body": {},
    "account": "dev"
  }
}
```

Use o perfil do produto, quando o MCP permitir selecionar outro perfil:

```json
{
  "name": "clickupfy_api_v3_create_doc_public",
  "arguments": {
    "path": {
      "workspace_id": 1
    },
    "body": {},
    "account": "produto"
  }
}
```

Consulte o schema antes de compor uma chamada pelo agente:

```bash
clickupfy api describe clickupfy_api_v3_create_doc_public
```

Reproduza pelo CLI a entrada usada pelo agente, sem executar a operação:

```bash
printf '%s' '{"path":{"workspace_id":1},"body":{}}' | clickupfy api v3-create-doc-public --input - --dry-run
```

### `clickupfy api v3-get-doc-public`

A operação `getDocPublic` pertence ao grupo `Docs` e usa
`GET /api/v3/workspaces/{workspace_id}/docs/{doc_id}`.

A chamada consulta o recurso sem modificá-lo.

A resposta preserva o JSON da API; respostas sem corpo retornam `{}`.
A API key do perfil precisa ter acesso ao recurso. As permissões e o plano do Workspace podem restringir o endpoint.
Os campos omitidos são tratados pelo servidor do ClickUp, sem padrões adicionais do cliente.

[Referência oficial](https://developer.clickup.com/reference/getdocpublic).

| Entrada | Tipo | Obrigatória |
| --- | --- | --- |
| `path.workspace_id` | `number` | sim |
| `path.doc_id` | `string` | sim |

O comando aceita as flags comuns de `api`: `--input`, `--path`, `--query`,
`--body`, `--body-file`, `--content-type`, `--file`, `--dry-run` e `--yes`.
A referência completa de tipos, campos aninhados e valores permitidos está no comando `describe` abaixo.

Exemplos:

Consulte o contrato antes de preencher os IDs reais:

```bash
clickupfy api describe v3-get-doc-public
```

Valide uma entrada em arquivo sem enviar uma requisição:

```bash
clickupfy api v3-get-doc-public --input entrada.json --dry-run
```

Use um envelope JSON pelo stdin:

```bash
printf '%s' '{"path":{"workspace_id":1,"doc_id":"exemplo-1"}}' | clickupfy api v3-get-doc-public --input -
```

Selecione o perfil que tem acesso ao recurso:

```bash
clickupfy --account produto api v3-get-doc-public --input entrada.json
```

Grave a resposta JSON para conferência. O arquivo de entrada usa o envelope do exemplo anterior:

```bash
clickupfy --json api v3-get-doc-public --input entrada.json > resposta.json
```

### `clickupfy_api_v3_get_doc_public`

A operação `getDocPublic` pertence ao grupo `Docs` e usa
`GET /api/v3/workspaces/{workspace_id}/docs/{doc_id}`.

A chamada consulta o recurso sem modificá-lo.

A resposta preserva o JSON da API; respostas sem corpo retornam `{}`.
A API key do perfil precisa ter acesso ao recurso. As permissões e o plano do Workspace podem restringir o endpoint.
Os campos omitidos são tratados pelo servidor do ClickUp, sem padrões adicionais do cliente.

[Referência oficial](https://developer.clickup.com/reference/getdocpublic).

| Entrada | Tipo | Obrigatória |
| --- | --- | --- |
| `path.workspace_id` | `number` | sim |
| `path.doc_id` | `string` | sim |

`account` é opcional e usa o perfil ativo ou fixado no MCP. O retorno aparece em
`content` como JSON; recusas retornam `isError: true`. Ferramentas de escrita
ficam ausentes em `--read-only`. IDs explícitos devem respeitar a hierarquia fixada.

Exemplos:

Use o perfil ativo com o envelope mínimo:

```json
{
  "name": "clickupfy_api_v3_get_doc_public",
  "arguments": {
    "path": {
      "workspace_id": 1,
      "doc_id": "exemplo-1"
    }
  }
}
```

Direcione a chamada ao perfil de desenvolvimento:

```json
{
  "name": "clickupfy_api_v3_get_doc_public",
  "arguments": {
    "path": {
      "workspace_id": 1,
      "doc_id": "exemplo-1"
    },
    "account": "dev"
  }
}
```

Use o perfil do produto, quando o MCP permitir selecionar outro perfil:

```json
{
  "name": "clickupfy_api_v3_get_doc_public",
  "arguments": {
    "path": {
      "workspace_id": 1,
      "doc_id": "exemplo-1"
    },
    "account": "produto"
  }
}
```

Consulte o schema antes de compor uma chamada pelo agente:

```bash
clickupfy api describe clickupfy_api_v3_get_doc_public
```

Reproduza pelo CLI a entrada usada pelo agente, sem executar a operação:

```bash
printf '%s' '{"path":{"workspace_id":1,"doc_id":"exemplo-1"}}' | clickupfy api v3-get-doc-public --input - --dry-run
```

### `clickupfy api v3-get-doc-page-listing-public`

A operação `getDocPageListingPublic` pertence ao grupo `Docs` e usa
`GET /api/v3/workspaces/{workspace_id}/docs/{doc_id}/page_listing`.

A chamada consulta o recurso sem modificá-lo.

A resposta preserva o JSON da API; respostas sem corpo retornam `{}`.
A API key do perfil precisa ter acesso ao recurso. As permissões e o plano do Workspace podem restringir o endpoint.
Os campos omitidos são tratados pelo servidor do ClickUp, sem padrões adicionais do cliente.

[Referência oficial](https://developer.clickup.com/reference/getdocpagelistingpublic).

| Entrada | Tipo | Obrigatória |
| --- | --- | --- |
| `path.workspace_id` | `number` | sim |
| `path.doc_id` | `string` | sim |
| `query.max_page_depth` | `number` | não |

O comando aceita as flags comuns de `api`: `--input`, `--path`, `--query`,
`--body`, `--body-file`, `--content-type`, `--file`, `--dry-run` e `--yes`.
A referência completa de tipos, campos aninhados e valores permitidos está no comando `describe` abaixo.

Exemplos:

Consulte o contrato antes de preencher os IDs reais:

```bash
clickupfy api describe v3-get-doc-page-listing-public
```

Valide uma entrada em arquivo sem enviar uma requisição:

```bash
clickupfy api v3-get-doc-page-listing-public --input entrada.json --dry-run
```

Use um envelope JSON pelo stdin:

```bash
printf '%s' '{"path":{"workspace_id":1,"doc_id":"exemplo-1"}}' | clickupfy api v3-get-doc-page-listing-public --input -
```

Selecione o perfil que tem acesso ao recurso:

```bash
clickupfy --account produto api v3-get-doc-page-listing-public --input entrada.json
```

Grave a resposta JSON para conferência. O arquivo de entrada usa o envelope do exemplo anterior:

```bash
clickupfy --json api v3-get-doc-page-listing-public --input entrada.json > resposta.json
```

### `clickupfy_api_v3_get_doc_page_listing_public`

A operação `getDocPageListingPublic` pertence ao grupo `Docs` e usa
`GET /api/v3/workspaces/{workspace_id}/docs/{doc_id}/page_listing`.

A chamada consulta o recurso sem modificá-lo.

A resposta preserva o JSON da API; respostas sem corpo retornam `{}`.
A API key do perfil precisa ter acesso ao recurso. As permissões e o plano do Workspace podem restringir o endpoint.
Os campos omitidos são tratados pelo servidor do ClickUp, sem padrões adicionais do cliente.

[Referência oficial](https://developer.clickup.com/reference/getdocpagelistingpublic).

| Entrada | Tipo | Obrigatória |
| --- | --- | --- |
| `path.workspace_id` | `number` | sim |
| `path.doc_id` | `string` | sim |
| `query.max_page_depth` | `number` | não |

`account` é opcional e usa o perfil ativo ou fixado no MCP. O retorno aparece em
`content` como JSON; recusas retornam `isError: true`. Ferramentas de escrita
ficam ausentes em `--read-only`. IDs explícitos devem respeitar a hierarquia fixada.

Exemplos:

Use o perfil ativo com o envelope mínimo:

```json
{
  "name": "clickupfy_api_v3_get_doc_page_listing_public",
  "arguments": {
    "path": {
      "workspace_id": 1,
      "doc_id": "exemplo-1"
    }
  }
}
```

Direcione a chamada ao perfil de desenvolvimento:

```json
{
  "name": "clickupfy_api_v3_get_doc_page_listing_public",
  "arguments": {
    "path": {
      "workspace_id": 1,
      "doc_id": "exemplo-1"
    },
    "account": "dev"
  }
}
```

Use o perfil do produto, quando o MCP permitir selecionar outro perfil:

```json
{
  "name": "clickupfy_api_v3_get_doc_page_listing_public",
  "arguments": {
    "path": {
      "workspace_id": 1,
      "doc_id": "exemplo-1"
    },
    "account": "produto"
  }
}
```

Consulte o schema antes de compor uma chamada pelo agente:

```bash
clickupfy api describe clickupfy_api_v3_get_doc_page_listing_public
```

Reproduza pelo CLI a entrada usada pelo agente, sem executar a operação:

```bash
printf '%s' '{"path":{"workspace_id":1,"doc_id":"exemplo-1"}}' | clickupfy api v3-get-doc-page-listing-public --input - --dry-run
```

### `clickupfy api v3-get-doc-pages-public`

A operação `getDocPagesPublic` pertence ao grupo `Docs` e usa
`GET /api/v3/workspaces/{workspace_id}/docs/{doc_id}/pages`.

A chamada consulta o recurso sem modificá-lo.

A resposta preserva o JSON da API; respostas sem corpo retornam `{}`.
A API key do perfil precisa ter acesso ao recurso. As permissões e o plano do Workspace podem restringir o endpoint.
Os campos omitidos são tratados pelo servidor do ClickUp, sem padrões adicionais do cliente.

[Referência oficial](https://developer.clickup.com/reference/getdocpagespublic).

| Entrada | Tipo | Obrigatória |
| --- | --- | --- |
| `path.workspace_id` | `number` | sim |
| `path.doc_id` | `string` | sim |
| `query.max_page_depth` | `number` | não |
| `query.content_format` | `string` | não |

O comando aceita as flags comuns de `api`: `--input`, `--path`, `--query`,
`--body`, `--body-file`, `--content-type`, `--file`, `--dry-run` e `--yes`.
A referência completa de tipos, campos aninhados e valores permitidos está no comando `describe` abaixo.

Exemplos:

Consulte o contrato antes de preencher os IDs reais:

```bash
clickupfy api describe v3-get-doc-pages-public
```

Valide uma entrada em arquivo sem enviar uma requisição:

```bash
clickupfy api v3-get-doc-pages-public --input entrada.json --dry-run
```

Use um envelope JSON pelo stdin:

```bash
printf '%s' '{"path":{"workspace_id":1,"doc_id":"exemplo-1"}}' | clickupfy api v3-get-doc-pages-public --input -
```

Selecione o perfil que tem acesso ao recurso:

```bash
clickupfy --account produto api v3-get-doc-pages-public --input entrada.json
```

Grave a resposta JSON para conferência. O arquivo de entrada usa o envelope do exemplo anterior:

```bash
clickupfy --json api v3-get-doc-pages-public --input entrada.json > resposta.json
```

### `clickupfy_api_v3_get_doc_pages_public`

A operação `getDocPagesPublic` pertence ao grupo `Docs` e usa
`GET /api/v3/workspaces/{workspace_id}/docs/{doc_id}/pages`.

A chamada consulta o recurso sem modificá-lo.

A resposta preserva o JSON da API; respostas sem corpo retornam `{}`.
A API key do perfil precisa ter acesso ao recurso. As permissões e o plano do Workspace podem restringir o endpoint.
Os campos omitidos são tratados pelo servidor do ClickUp, sem padrões adicionais do cliente.

[Referência oficial](https://developer.clickup.com/reference/getdocpagespublic).

| Entrada | Tipo | Obrigatória |
| --- | --- | --- |
| `path.workspace_id` | `number` | sim |
| `path.doc_id` | `string` | sim |
| `query.max_page_depth` | `number` | não |
| `query.content_format` | `string` | não |

`account` é opcional e usa o perfil ativo ou fixado no MCP. O retorno aparece em
`content` como JSON; recusas retornam `isError: true`. Ferramentas de escrita
ficam ausentes em `--read-only`. IDs explícitos devem respeitar a hierarquia fixada.

Exemplos:

Use o perfil ativo com o envelope mínimo:

```json
{
  "name": "clickupfy_api_v3_get_doc_pages_public",
  "arguments": {
    "path": {
      "workspace_id": 1,
      "doc_id": "exemplo-1"
    }
  }
}
```

Direcione a chamada ao perfil de desenvolvimento:

```json
{
  "name": "clickupfy_api_v3_get_doc_pages_public",
  "arguments": {
    "path": {
      "workspace_id": 1,
      "doc_id": "exemplo-1"
    },
    "account": "dev"
  }
}
```

Use o perfil do produto, quando o MCP permitir selecionar outro perfil:

```json
{
  "name": "clickupfy_api_v3_get_doc_pages_public",
  "arguments": {
    "path": {
      "workspace_id": 1,
      "doc_id": "exemplo-1"
    },
    "account": "produto"
  }
}
```

Consulte o schema antes de compor uma chamada pelo agente:

```bash
clickupfy api describe clickupfy_api_v3_get_doc_pages_public
```

Reproduza pelo CLI a entrada usada pelo agente, sem executar a operação:

```bash
printf '%s' '{"path":{"workspace_id":1,"doc_id":"exemplo-1"}}' | clickupfy api v3-get-doc-pages-public --input - --dry-run
```

### `clickupfy api v3-create-page-public`

A operação `createPagePublic` pertence ao grupo `Docs` e usa
`POST /api/v3/workspaces/{workspace_id}/docs/{doc_id}/pages`.

A chamada altera o recurso indicado pelos parâmetros. Confira o resultado com a consulta correspondente antes de continuar.

A resposta preserva o JSON da API; respostas sem corpo retornam `{}`.
A API key do perfil precisa ter acesso ao recurso. As permissões e o plano do Workspace podem restringir o endpoint.
Os campos omitidos são tratados pelo servidor do ClickUp, sem padrões adicionais do cliente.

[Referência oficial](https://developer.clickup.com/reference/createpagepublic).

| Entrada | Tipo | Obrigatória |
| --- | --- | --- |
| `path.workspace_id` | `number` | sim |
| `path.doc_id` | `string` | sim |
| `body` | objeto conforme `api describe` | sim |

O comando aceita as flags comuns de `api`: `--input`, `--path`, `--query`,
`--body`, `--body-file`, `--content-type`, `--file`, `--dry-run` e `--yes`.
A referência completa de tipos, campos aninhados e valores permitidos está no comando `describe` abaixo.

Exemplos:

Consulte o contrato antes de preencher os IDs reais:

```bash
clickupfy api describe v3-create-page-public
```

Valide uma entrada em arquivo sem enviar uma requisição:

```bash
clickupfy api v3-create-page-public --input entrada.json --dry-run
```

Use um envelope JSON pelo stdin:

```bash
printf '%s' '{"path":{"workspace_id":1,"doc_id":"exemplo-1"},"body":{}}' | clickupfy api v3-create-page-public --input -
```

Selecione o perfil que tem acesso ao recurso:

```bash
clickupfy --account produto api v3-create-page-public --input entrada.json
```

Grave a resposta JSON para conferência. O arquivo de entrada usa o envelope do exemplo anterior:

```bash
clickupfy --json api v3-create-page-public --input entrada.json > resposta.json
```

### `clickupfy_api_v3_create_page_public`

A operação `createPagePublic` pertence ao grupo `Docs` e usa
`POST /api/v3/workspaces/{workspace_id}/docs/{doc_id}/pages`.

A chamada altera o recurso indicado pelos parâmetros. Confira o resultado com a consulta correspondente antes de continuar.

A resposta preserva o JSON da API; respostas sem corpo retornam `{}`.
A API key do perfil precisa ter acesso ao recurso. As permissões e o plano do Workspace podem restringir o endpoint.
Os campos omitidos são tratados pelo servidor do ClickUp, sem padrões adicionais do cliente.

[Referência oficial](https://developer.clickup.com/reference/createpagepublic).

| Entrada | Tipo | Obrigatória |
| --- | --- | --- |
| `path.workspace_id` | `number` | sim |
| `path.doc_id` | `string` | sim |
| `body` | objeto conforme `api describe` | sim |

`account` é opcional e usa o perfil ativo ou fixado no MCP. O retorno aparece em
`content` como JSON; recusas retornam `isError: true`. Ferramentas de escrita
ficam ausentes em `--read-only`. IDs explícitos devem respeitar a hierarquia fixada.

Exemplos:

Use o perfil ativo com o envelope mínimo:

```json
{
  "name": "clickupfy_api_v3_create_page_public",
  "arguments": {
    "path": {
      "workspace_id": 1,
      "doc_id": "exemplo-1"
    },
    "body": {}
  }
}
```

Direcione a chamada ao perfil de desenvolvimento:

```json
{
  "name": "clickupfy_api_v3_create_page_public",
  "arguments": {
    "path": {
      "workspace_id": 1,
      "doc_id": "exemplo-1"
    },
    "body": {},
    "account": "dev"
  }
}
```

Use o perfil do produto, quando o MCP permitir selecionar outro perfil:

```json
{
  "name": "clickupfy_api_v3_create_page_public",
  "arguments": {
    "path": {
      "workspace_id": 1,
      "doc_id": "exemplo-1"
    },
    "body": {},
    "account": "produto"
  }
}
```

Consulte o schema antes de compor uma chamada pelo agente:

```bash
clickupfy api describe clickupfy_api_v3_create_page_public
```

Reproduza pelo CLI a entrada usada pelo agente, sem executar a operação:

```bash
printf '%s' '{"path":{"workspace_id":1,"doc_id":"exemplo-1"},"body":{}}' | clickupfy api v3-create-page-public --input - --dry-run
```

### `clickupfy api v3-get-page-public`

A operação `getPagePublic` pertence ao grupo `Docs` e usa
`GET /api/v3/workspaces/{workspace_id}/docs/{doc_id}/pages/{page_id}`.

A chamada consulta o recurso sem modificá-lo.

A resposta preserva o JSON da API; respostas sem corpo retornam `{}`.
A API key do perfil precisa ter acesso ao recurso. As permissões e o plano do Workspace podem restringir o endpoint.
Os campos omitidos são tratados pelo servidor do ClickUp, sem padrões adicionais do cliente.

[Referência oficial](https://developer.clickup.com/reference/getpagepublic).

| Entrada | Tipo | Obrigatória |
| --- | --- | --- |
| `path.workspace_id` | `number` | sim |
| `path.doc_id` | `string` | sim |
| `path.page_id` | `string` | sim |
| `query.content_format` | `string` | não |

O comando aceita as flags comuns de `api`: `--input`, `--path`, `--query`,
`--body`, `--body-file`, `--content-type`, `--file`, `--dry-run` e `--yes`.
A referência completa de tipos, campos aninhados e valores permitidos está no comando `describe` abaixo.

Exemplos:

Consulte o contrato antes de preencher os IDs reais:

```bash
clickupfy api describe v3-get-page-public
```

Valide uma entrada em arquivo sem enviar uma requisição:

```bash
clickupfy api v3-get-page-public --input entrada.json --dry-run
```

Use um envelope JSON pelo stdin:

```bash
printf '%s' '{"path":{"workspace_id":1,"doc_id":"exemplo-1","page_id":"exemplo-1"}}' | clickupfy api v3-get-page-public --input -
```

Selecione o perfil que tem acesso ao recurso:

```bash
clickupfy --account produto api v3-get-page-public --input entrada.json
```

Grave a resposta JSON para conferência. O arquivo de entrada usa o envelope do exemplo anterior:

```bash
clickupfy --json api v3-get-page-public --input entrada.json > resposta.json
```

### `clickupfy_api_v3_get_page_public`

A operação `getPagePublic` pertence ao grupo `Docs` e usa
`GET /api/v3/workspaces/{workspace_id}/docs/{doc_id}/pages/{page_id}`.

A chamada consulta o recurso sem modificá-lo.

A resposta preserva o JSON da API; respostas sem corpo retornam `{}`.
A API key do perfil precisa ter acesso ao recurso. As permissões e o plano do Workspace podem restringir o endpoint.
Os campos omitidos são tratados pelo servidor do ClickUp, sem padrões adicionais do cliente.

[Referência oficial](https://developer.clickup.com/reference/getpagepublic).

| Entrada | Tipo | Obrigatória |
| --- | --- | --- |
| `path.workspace_id` | `number` | sim |
| `path.doc_id` | `string` | sim |
| `path.page_id` | `string` | sim |
| `query.content_format` | `string` | não |

`account` é opcional e usa o perfil ativo ou fixado no MCP. O retorno aparece em
`content` como JSON; recusas retornam `isError: true`. Ferramentas de escrita
ficam ausentes em `--read-only`. IDs explícitos devem respeitar a hierarquia fixada.

Exemplos:

Use o perfil ativo com o envelope mínimo:

```json
{
  "name": "clickupfy_api_v3_get_page_public",
  "arguments": {
    "path": {
      "workspace_id": 1,
      "doc_id": "exemplo-1",
      "page_id": "exemplo-1"
    }
  }
}
```

Direcione a chamada ao perfil de desenvolvimento:

```json
{
  "name": "clickupfy_api_v3_get_page_public",
  "arguments": {
    "path": {
      "workspace_id": 1,
      "doc_id": "exemplo-1",
      "page_id": "exemplo-1"
    },
    "account": "dev"
  }
}
```

Use o perfil do produto, quando o MCP permitir selecionar outro perfil:

```json
{
  "name": "clickupfy_api_v3_get_page_public",
  "arguments": {
    "path": {
      "workspace_id": 1,
      "doc_id": "exemplo-1",
      "page_id": "exemplo-1"
    },
    "account": "produto"
  }
}
```

Consulte o schema antes de compor uma chamada pelo agente:

```bash
clickupfy api describe clickupfy_api_v3_get_page_public
```

Reproduza pelo CLI a entrada usada pelo agente, sem executar a operação:

```bash
printf '%s' '{"path":{"workspace_id":1,"doc_id":"exemplo-1","page_id":"exemplo-1"}}' | clickupfy api v3-get-page-public --input - --dry-run
```

### `clickupfy api v3-edit-page-public`

A operação `editPagePublic` pertence ao grupo `Docs` e usa
`PUT /api/v3/workspaces/{workspace_id}/docs/{doc_id}/pages/{page_id}`.

A chamada altera o recurso indicado pelos parâmetros. Confira o resultado com a consulta correspondente antes de continuar.

A resposta preserva o JSON da API; respostas sem corpo retornam `{}`.
A API key do perfil precisa ter acesso ao recurso. As permissões e o plano do Workspace podem restringir o endpoint.
Os campos omitidos são tratados pelo servidor do ClickUp, sem padrões adicionais do cliente.

[Referência oficial](https://developer.clickup.com/reference/editpagepublic).

| Entrada | Tipo | Obrigatória |
| --- | --- | --- |
| `path.workspace_id` | `number` | sim |
| `path.doc_id` | `string` | sim |
| `path.page_id` | `string` | sim |
| `body` | objeto conforme `api describe` | sim |

O comando aceita as flags comuns de `api`: `--input`, `--path`, `--query`,
`--body`, `--body-file`, `--content-type`, `--file`, `--dry-run` e `--yes`.
A referência completa de tipos, campos aninhados e valores permitidos está no comando `describe` abaixo.

Exemplos:

Consulte o contrato antes de preencher os IDs reais:

```bash
clickupfy api describe v3-edit-page-public
```

Valide uma entrada em arquivo sem enviar uma requisição:

```bash
clickupfy api v3-edit-page-public --input entrada.json --dry-run
```

Use um envelope JSON pelo stdin:

```bash
printf '%s' '{"path":{"workspace_id":1,"doc_id":"exemplo-1","page_id":"exemplo-1"},"body":{}}' | clickupfy api v3-edit-page-public --input -
```

Selecione o perfil que tem acesso ao recurso:

```bash
clickupfy --account produto api v3-edit-page-public --input entrada.json
```

Grave a resposta JSON para conferência. O arquivo de entrada usa o envelope do exemplo anterior:

```bash
clickupfy --json api v3-edit-page-public --input entrada.json > resposta.json
```

### `clickupfy_api_v3_edit_page_public`

A operação `editPagePublic` pertence ao grupo `Docs` e usa
`PUT /api/v3/workspaces/{workspace_id}/docs/{doc_id}/pages/{page_id}`.

A chamada altera o recurso indicado pelos parâmetros. Confira o resultado com a consulta correspondente antes de continuar.

A resposta preserva o JSON da API; respostas sem corpo retornam `{}`.
A API key do perfil precisa ter acesso ao recurso. As permissões e o plano do Workspace podem restringir o endpoint.
Os campos omitidos são tratados pelo servidor do ClickUp, sem padrões adicionais do cliente.

[Referência oficial](https://developer.clickup.com/reference/editpagepublic).

| Entrada | Tipo | Obrigatória |
| --- | --- | --- |
| `path.workspace_id` | `number` | sim |
| `path.doc_id` | `string` | sim |
| `path.page_id` | `string` | sim |
| `body` | objeto conforme `api describe` | sim |

`account` é opcional e usa o perfil ativo ou fixado no MCP. O retorno aparece em
`content` como JSON; recusas retornam `isError: true`. Ferramentas de escrita
ficam ausentes em `--read-only`. IDs explícitos devem respeitar a hierarquia fixada.

Exemplos:

Use o perfil ativo com o envelope mínimo:

```json
{
  "name": "clickupfy_api_v3_edit_page_public",
  "arguments": {
    "path": {
      "workspace_id": 1,
      "doc_id": "exemplo-1",
      "page_id": "exemplo-1"
    },
    "body": {}
  }
}
```

Direcione a chamada ao perfil de desenvolvimento:

```json
{
  "name": "clickupfy_api_v3_edit_page_public",
  "arguments": {
    "path": {
      "workspace_id": 1,
      "doc_id": "exemplo-1",
      "page_id": "exemplo-1"
    },
    "body": {},
    "account": "dev"
  }
}
```

Use o perfil do produto, quando o MCP permitir selecionar outro perfil:

```json
{
  "name": "clickupfy_api_v3_edit_page_public",
  "arguments": {
    "path": {
      "workspace_id": 1,
      "doc_id": "exemplo-1",
      "page_id": "exemplo-1"
    },
    "body": {},
    "account": "produto"
  }
}
```

Consulte o schema antes de compor uma chamada pelo agente:

```bash
clickupfy api describe clickupfy_api_v3_edit_page_public
```

Reproduza pelo CLI a entrada usada pelo agente, sem executar a operação:

```bash
printf '%s' '{"path":{"workspace_id":1,"doc_id":"exemplo-1","page_id":"exemplo-1"},"body":{}}' | clickupfy api v3-edit-page-public --input - --dry-run
```

### `clickupfy api v3-move-task`

A operação `moveTask` pertence ao grupo `Tasks` e usa
`PUT /api/v3/workspaces/{workspace_id}/tasks/{task_id}/home_list/{list_id}`.

A chamada altera o recurso indicado pelos parâmetros. Confira o resultado com a consulta correspondente antes de continuar.

A resposta preserva o JSON da API; respostas sem corpo retornam `{}`.
A API key do perfil precisa ter acesso ao recurso. As permissões e o plano do Workspace podem restringir o endpoint.
Os campos omitidos são tratados pelo servidor do ClickUp, sem padrões adicionais do cliente.

[Referência oficial](https://developer.clickup.com/reference/movetask).

| Entrada | Tipo | Obrigatória |
| --- | --- | --- |
| `path.workspace_id` | `integer` | sim |
| `path.task_id` | `string` | sim |
| `path.list_id` | `string` | sim |
| `body` | objeto conforme `api describe` | sim |

O comando aceita as flags comuns de `api`: `--input`, `--path`, `--query`,
`--body`, `--body-file`, `--content-type`, `--file`, `--dry-run` e `--yes`.
A referência completa de tipos, campos aninhados e valores permitidos está no comando `describe` abaixo.

Exemplos:

Consulte o contrato antes de preencher os IDs reais:

```bash
clickupfy api describe v3-move-task
```

Valide uma entrada em arquivo sem enviar uma requisição:

```bash
clickupfy api v3-move-task --input entrada.json --dry-run
```

Use um envelope JSON pelo stdin:

```bash
printf '%s' '{"path":{"workspace_id":1,"task_id":"exemplo-1","list_id":"exemplo-1"},"body":{}}' | clickupfy api v3-move-task --input -
```

Selecione o perfil que tem acesso ao recurso:

```bash
clickupfy --account produto api v3-move-task --input entrada.json
```

Grave a resposta JSON para conferência. O arquivo de entrada usa o envelope do exemplo anterior:

```bash
clickupfy --json api v3-move-task --input entrada.json > resposta.json
```

### `clickupfy_api_v3_move_task`

A operação `moveTask` pertence ao grupo `Tasks` e usa
`PUT /api/v3/workspaces/{workspace_id}/tasks/{task_id}/home_list/{list_id}`.

A chamada altera o recurso indicado pelos parâmetros. Confira o resultado com a consulta correspondente antes de continuar.

A resposta preserva o JSON da API; respostas sem corpo retornam `{}`.
A API key do perfil precisa ter acesso ao recurso. As permissões e o plano do Workspace podem restringir o endpoint.
Os campos omitidos são tratados pelo servidor do ClickUp, sem padrões adicionais do cliente.

[Referência oficial](https://developer.clickup.com/reference/movetask).

| Entrada | Tipo | Obrigatória |
| --- | --- | --- |
| `path.workspace_id` | `integer` | sim |
| `path.task_id` | `string` | sim |
| `path.list_id` | `string` | sim |
| `body` | objeto conforme `api describe` | sim |

`account` é opcional e usa o perfil ativo ou fixado no MCP. O retorno aparece em
`content` como JSON; recusas retornam `isError: true`. Ferramentas de escrita
ficam ausentes em `--read-only`. IDs explícitos devem respeitar a hierarquia fixada.

Exemplos:

Use o perfil ativo com o envelope mínimo:

```json
{
  "name": "clickupfy_api_v3_move_task",
  "arguments": {
    "path": {
      "workspace_id": 1,
      "task_id": "exemplo-1",
      "list_id": "exemplo-1"
    },
    "body": {}
  }
}
```

Direcione a chamada ao perfil de desenvolvimento:

```json
{
  "name": "clickupfy_api_v3_move_task",
  "arguments": {
    "path": {
      "workspace_id": 1,
      "task_id": "exemplo-1",
      "list_id": "exemplo-1"
    },
    "body": {},
    "account": "dev"
  }
}
```

Use o perfil do produto, quando o MCP permitir selecionar outro perfil:

```json
{
  "name": "clickupfy_api_v3_move_task",
  "arguments": {
    "path": {
      "workspace_id": 1,
      "task_id": "exemplo-1",
      "list_id": "exemplo-1"
    },
    "body": {},
    "account": "produto"
  }
}
```

Consulte o schema antes de compor uma chamada pelo agente:

```bash
clickupfy api describe clickupfy_api_v3_move_task
```

Reproduza pelo CLI a entrada usada pelo agente, sem executar a operação:

```bash
printf '%s' '{"path":{"workspace_id":1,"task_id":"exemplo-1","list_id":"exemplo-1"},"body":{}}' | clickupfy api v3-move-task --input - --dry-run
```

### `clickupfy api v3-replace-time-estimates-by-user`

A operação `replaceTimeEstimatesByUser` pertence ao grupo `Tasks` e usa
`PUT /api/v3/workspaces/{workspace_id}/tasks/{task_id}/time_estimates_by_user`.

A chamada altera o recurso indicado pelos parâmetros. Confira o resultado com a consulta correspondente antes de continuar.

A resposta preserva o JSON da API; respostas sem corpo retornam `{}`.
A API key do perfil precisa ter acesso ao recurso. As permissões e o plano do Workspace podem restringir o endpoint.
Os campos omitidos são tratados pelo servidor do ClickUp, sem padrões adicionais do cliente.

[Referência oficial](https://developer.clickup.com/reference/replacetimeestimatesbyuser).

| Entrada | Tipo | Obrigatória |
| --- | --- | --- |
| `path.workspace_id` | `string` | sim |
| `path.task_id` | `string` | sim |
| `body` | objeto conforme `api describe` | sim |

O comando aceita as flags comuns de `api`: `--input`, `--path`, `--query`,
`--body`, `--body-file`, `--content-type`, `--file`, `--dry-run` e `--yes`.
A referência completa de tipos, campos aninhados e valores permitidos está no comando `describe` abaixo.

Exemplos:

Consulte o contrato antes de preencher os IDs reais:

```bash
clickupfy api describe v3-replace-time-estimates-by-user
```

Valide uma entrada em arquivo sem enviar uma requisição:

```bash
clickupfy api v3-replace-time-estimates-by-user --input entrada.json --dry-run
```

Use um envelope JSON pelo stdin:

```bash
printf '%s' '{"path":{"workspace_id":"exemplo-1","task_id":"exemplo-1"},"body":[{"assignee":1,"time":1}]}' | clickupfy api v3-replace-time-estimates-by-user --input -
```

Selecione o perfil que tem acesso ao recurso:

```bash
clickupfy --account produto api v3-replace-time-estimates-by-user --input entrada.json
```

Grave a resposta JSON para conferência. O arquivo de entrada usa o envelope do exemplo anterior:

```bash
clickupfy --json api v3-replace-time-estimates-by-user --input entrada.json > resposta.json
```

### `clickupfy_api_v3_replace_time_estimates_by_user`

A operação `replaceTimeEstimatesByUser` pertence ao grupo `Tasks` e usa
`PUT /api/v3/workspaces/{workspace_id}/tasks/{task_id}/time_estimates_by_user`.

A chamada altera o recurso indicado pelos parâmetros. Confira o resultado com a consulta correspondente antes de continuar.

A resposta preserva o JSON da API; respostas sem corpo retornam `{}`.
A API key do perfil precisa ter acesso ao recurso. As permissões e o plano do Workspace podem restringir o endpoint.
Os campos omitidos são tratados pelo servidor do ClickUp, sem padrões adicionais do cliente.

[Referência oficial](https://developer.clickup.com/reference/replacetimeestimatesbyuser).

| Entrada | Tipo | Obrigatória |
| --- | --- | --- |
| `path.workspace_id` | `string` | sim |
| `path.task_id` | `string` | sim |
| `body` | objeto conforme `api describe` | sim |

`account` é opcional e usa o perfil ativo ou fixado no MCP. O retorno aparece em
`content` como JSON; recusas retornam `isError: true`. Ferramentas de escrita
ficam ausentes em `--read-only`. IDs explícitos devem respeitar a hierarquia fixada.

Exemplos:

Use o perfil ativo com o envelope mínimo:

```json
{
  "name": "clickupfy_api_v3_replace_time_estimates_by_user",
  "arguments": {
    "path": {
      "workspace_id": "exemplo-1",
      "task_id": "exemplo-1"
    },
    "body": [
      {
        "assignee": 1,
        "time": 1
      }
    ]
  }
}
```

Direcione a chamada ao perfil de desenvolvimento:

```json
{
  "name": "clickupfy_api_v3_replace_time_estimates_by_user",
  "arguments": {
    "path": {
      "workspace_id": "exemplo-1",
      "task_id": "exemplo-1"
    },
    "body": [
      {
        "assignee": 1,
        "time": 1
      }
    ],
    "account": "dev"
  }
}
```

Use o perfil do produto, quando o MCP permitir selecionar outro perfil:

```json
{
  "name": "clickupfy_api_v3_replace_time_estimates_by_user",
  "arguments": {
    "path": {
      "workspace_id": "exemplo-1",
      "task_id": "exemplo-1"
    },
    "body": [
      {
        "assignee": 1,
        "time": 1
      }
    ],
    "account": "produto"
  }
}
```

Consulte o schema antes de compor uma chamada pelo agente:

```bash
clickupfy api describe clickupfy_api_v3_replace_time_estimates_by_user
```

Reproduza pelo CLI a entrada usada pelo agente, sem executar a operação:

```bash
printf '%s' '{"path":{"workspace_id":"exemplo-1","task_id":"exemplo-1"},"body":[{"assignee":1,"time":1}]}' | clickupfy api v3-replace-time-estimates-by-user --input - --dry-run
```

### `clickupfy api v3-update-time-estimates-by-user`

A operação `updateTimeEstimatesByUser` pertence ao grupo `Tasks` e usa
`PATCH /api/v3/workspaces/{workspace_id}/tasks/{task_id}/time_estimates_by_user`.

A chamada altera o recurso indicado pelos parâmetros. Confira o resultado com a consulta correspondente antes de continuar.

A resposta preserva o JSON da API; respostas sem corpo retornam `{}`.
A API key do perfil precisa ter acesso ao recurso. As permissões e o plano do Workspace podem restringir o endpoint.
Os campos omitidos são tratados pelo servidor do ClickUp, sem padrões adicionais do cliente.

[Referência oficial](https://developer.clickup.com/reference/updatetimeestimatesbyuser).

| Entrada | Tipo | Obrigatória |
| --- | --- | --- |
| `path.workspace_id` | `string` | sim |
| `path.task_id` | `string` | sim |
| `body` | objeto conforme `api describe` | sim |

O comando aceita as flags comuns de `api`: `--input`, `--path`, `--query`,
`--body`, `--body-file`, `--content-type`, `--file`, `--dry-run` e `--yes`.
A referência completa de tipos, campos aninhados e valores permitidos está no comando `describe` abaixo.

Exemplos:

Consulte o contrato antes de preencher os IDs reais:

```bash
clickupfy api describe v3-update-time-estimates-by-user
```

Valide uma entrada em arquivo sem enviar uma requisição:

```bash
clickupfy api v3-update-time-estimates-by-user --input entrada.json --dry-run
```

Use um envelope JSON pelo stdin:

```bash
printf '%s' '{"path":{"workspace_id":"exemplo-1","task_id":"exemplo-1"},"body":[{"assignee":1,"time":1}]}' | clickupfy api v3-update-time-estimates-by-user --input -
```

Selecione o perfil que tem acesso ao recurso:

```bash
clickupfy --account produto api v3-update-time-estimates-by-user --input entrada.json
```

Grave a resposta JSON para conferência. O arquivo de entrada usa o envelope do exemplo anterior:

```bash
clickupfy --json api v3-update-time-estimates-by-user --input entrada.json > resposta.json
```

### `clickupfy_api_v3_update_time_estimates_by_user`

A operação `updateTimeEstimatesByUser` pertence ao grupo `Tasks` e usa
`PATCH /api/v3/workspaces/{workspace_id}/tasks/{task_id}/time_estimates_by_user`.

A chamada altera o recurso indicado pelos parâmetros. Confira o resultado com a consulta correspondente antes de continuar.

A resposta preserva o JSON da API; respostas sem corpo retornam `{}`.
A API key do perfil precisa ter acesso ao recurso. As permissões e o plano do Workspace podem restringir o endpoint.
Os campos omitidos são tratados pelo servidor do ClickUp, sem padrões adicionais do cliente.

[Referência oficial](https://developer.clickup.com/reference/updatetimeestimatesbyuser).

| Entrada | Tipo | Obrigatória |
| --- | --- | --- |
| `path.workspace_id` | `string` | sim |
| `path.task_id` | `string` | sim |
| `body` | objeto conforme `api describe` | sim |

`account` é opcional e usa o perfil ativo ou fixado no MCP. O retorno aparece em
`content` como JSON; recusas retornam `isError: true`. Ferramentas de escrita
ficam ausentes em `--read-only`. IDs explícitos devem respeitar a hierarquia fixada.

Exemplos:

Use o perfil ativo com o envelope mínimo:

```json
{
  "name": "clickupfy_api_v3_update_time_estimates_by_user",
  "arguments": {
    "path": {
      "workspace_id": "exemplo-1",
      "task_id": "exemplo-1"
    },
    "body": [
      {
        "assignee": 1,
        "time": 1
      }
    ]
  }
}
```

Direcione a chamada ao perfil de desenvolvimento:

```json
{
  "name": "clickupfy_api_v3_update_time_estimates_by_user",
  "arguments": {
    "path": {
      "workspace_id": "exemplo-1",
      "task_id": "exemplo-1"
    },
    "body": [
      {
        "assignee": 1,
        "time": 1
      }
    ],
    "account": "dev"
  }
}
```

Use o perfil do produto, quando o MCP permitir selecionar outro perfil:

```json
{
  "name": "clickupfy_api_v3_update_time_estimates_by_user",
  "arguments": {
    "path": {
      "workspace_id": "exemplo-1",
      "task_id": "exemplo-1"
    },
    "body": [
      {
        "assignee": 1,
        "time": 1
      }
    ],
    "account": "produto"
  }
}
```

Consulte o schema antes de compor uma chamada pelo agente:

```bash
clickupfy api describe clickupfy_api_v3_update_time_estimates_by_user
```

Reproduza pelo CLI a entrada usada pelo agente, sem executar a operação:

```bash
printf '%s' '{"path":{"workspace_id":"exemplo-1","task_id":"exemplo-1"},"body":[{"assignee":1,"time":1}]}' | clickupfy api v3-update-time-estimates-by-user --input - --dry-run
```
