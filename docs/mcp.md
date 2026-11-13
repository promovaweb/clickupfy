# MCP

`{{bin}} mcp` transforma o processo em um servidor Model Context Protocol
sobre stdio. Nada mais é escrito em stdout; diagnósticos vão para stderr.

## Configuração no cliente

```json
{
  "mcpServers": {
    "{{bin}}": { "command": "{{bin}}", "args": ["mcp"] }
  }
}
```

Para o Claude Code: `claude mcp add {{bin}} -- {{bin}} mcp`.
Para desenvolvimento, sem compilar: `"command": "bun", "args": ["run", "src/main.ts", "mcp"]`.

## Tools

| Tool | Entrada | Saída |
| --- | --- | --- |
| `doctor` | nenhuma | `{ checks, ok }`; `isError: true` se houver `fail` |
| `about` | nenhuma | identity, runtime, platform, data directory e credits |
| `exit_codes` | nenhuma | tabela de exit codes |
| `skill` | `topic?` (`cli`, `tui`, `mcp`, `config`, `exit-codes`, `reference`) | documentação em Markdown |
| `config_list` | nenhuma | keys de settings.json em vigor e o schema |
| `config_get` | `key` | valor da key; `isError` quando não existe |
| `credentials_status` | nenhuma | file, master key source, count e names |

Nenhuma dessas tools devolve o valor de uma credencial ou grava arquivos.

## Escopo fixado

`{{bin}} mcp serve --account <perfil> --workspace <id> --space <id> --list <id>`
fixa o perfil e parte da hierarquia, como no ClickUpfy 0.9.0. As tools usam
esses ids como padrão e recusam outro id com `isError`. Toda tool do ClickUp
aceita `account` opcional; num servidor fixado, outro perfil é recusado, e o
workspace fixado precisa ser o do perfil. Com `--read-only`, as tools de
escrita não aparecem em `tools/list`. Falhas esperadas voltam com
`isError: true` e a mensagem, seguida do exit code equivalente do CLI.
Tools destrutivas exigem `confirm: true`.

## Tools de perfil e contexto

| Tool | Entrada | Saída | Efeito |
| --- | --- | --- | --- |
| `clickupfy_mcp_context` | `account?` | `{ account, workspace, readOnly, scope }` com os ids fixados | read |
| `clickupfy_accounts_list` | nenhuma | `{ accounts[] }`, sem API keys | read |
| `clickupfy_whoami` | `account?` | `{ account, workspace, user }` | network |
| `clickupfy_workspaces_list` | `account?` | `{ workspaces[] }` | network |
| `clickupfy_account_use` | `account` | `{ activeAccount }`; só sem perfil fixado | write |
| `clickupfy_workspace_use` | `account?`, `workspaceId` | `{ account, workspace }`; só sem perfil nem workspace fixados | write |

## Tools da hierarquia

| Tool | Entrada | Saída | Efeito |
| --- | --- | --- | --- |
| `clickupfy_spaces_list` | `account?`, `archived?` | `{ spaces[] }` | read |
| `clickupfy_folders_list` | `account?`, `spaceId?` (padrão: space fixado), `archived?` | `{ folders[] }` | read |
| `clickupfy_lists_list` | `account?`, `folderId?`, `spaceId?`, `archived?` | `{ lists[] }` | read |
| `clickupfy_list_get` | `account?`, `listId?` (padrão: list fixada) | a list com `statuses[]` | read |

<!-- clickupfy:families -->

## Resources

| URI | Conteúdo |
| --- | --- |
| `{{bin}}://about` | identity em JSON |
| `{{bin}}://exit-codes` | exit codes em JSON |
| `{{bin}}://skill` | documentação completa em Markdown |
| `{{bin}}://skill/{topic}` | uma seção; o template lista os topics |

## Prompts

| Prompt | Arguments | Função |
| --- | --- | --- |
| `operate` | `task` | instrui o agente a ler `skill cli` e executar a task pelo CLI com `--json` |

## Listar sem iniciar

```bash
{{bin}} mcp --list
{{bin}} mcp --list --json
```

## Testar

```bash
npx @modelcontextprotocol/inspector {{bin}} mcp
```

O Inspector abre uma página local para chamar tools, ler resources e
inspecionar as mensagens JSON-RPC.

## Como adicionar uma tool

1. Copie `template/tool/example.ts` para `src/mcp/tools/<name>.ts`.
2. Declare `inputSchema` com Zod e descreva cada campo com `.describe()`. A
   description da tool diz quando usar e o que ela devolve.
3. Devolva `content` em texto e, quando a saída for estruturada,
   `structuredContent` com o mesmo objeto.
4. Acrescente a tool ao `catalog.tools` para que `mcp --list` a enxergue.
5. Registre a função em `registerAll` em `src/mcp/server.ts`.
6. Teste com o Inspector e com `bun test`.

Nomes de tools usam `snake_case`. Tools que gravam ou chamam APIs externas
precisam dizer isso na description e nunca devem ecoar segredos na resposta.

A tool `doctor` usa a mesma coleta do command CLI: confere runtime, terminal,
permissões da pasta, settings, origem da chave e leitura do cofre. Não grava
arquivos e não retorna valores de credenciais. Cada check traz `name`,
`status` (`ok`, `warn` ou `fail`) e `detail`.
