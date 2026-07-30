# Resolva falhas comuns

## Classificação

| Campo | Valor |
| --- | --- |
| Natureza | referência |
| Escopo | diagnóstico de instalação, autenticação, escopo e API |
| Autoridade | mensagens de erro e contratos públicos do ClickUpfy |

## O comando não foi encontrado

Execute:

```bash
npm prefix --global
```

Confirme se a pasta de executáveis globais está no `PATH`. Em instalação
standalone, confira permissão de execução e o nome do arquivo.

## A API key foi recusada

Use:

```bash
clickupfy whoami
```

Se falhar, gere ou confira a chave no ClickUp e execute `clickupfy setup`
novamente. Uma chave revogada não pode ser recuperada pelo ClickUpfy.

Nunca publique a chave para pedir suporte. Informe apenas o account, o
workspace mascarado quando necessário e a mensagem de erro sem headers.

## O workspace está incorreto

```bash
clickupfy workspace list
clickupfy workspace use <workspace-id>
clickupfy status
```

Se o MCP fixa `--workspace`, atualize a configuração do projeto para o mesmo
ID ou selecione o account correto.

## Folder ou List não aparece

Confirme o Space e tente incluir arquivados:

```bash
clickupfy folder list --space <space-id> --archived
clickupfy list list --folder <folder-id> --archived
```

Para List sem Folder, use `--space`. Permissões da API key também podem ocultar
recursos.

## O status foi rejeitado

```bash
clickupfy list get <list-id>
```

Copie a grafia de um status retornado. Status são configuráveis por List.

## O MCP não inicia

Execute manualmente o comando registrado no `.mcp.json`. Os motivos mais
comuns são:

- `clickupfy` ausente no `PATH` do cliente
- JSON inválido
- account inexistente
- `--list` sem valor
- workspace fixado diferente do perfil
- cliente não reiniciado depois da edição.

## O MCP recusou um ID

Essa recusa é esperada quando a ferramenta recebe um ID diferente do escopo do
projeto. Consulte:

```text
clickupfy_mcp_context
```

Use o destino fixado ou altere o `.mcp.json` conscientemente. Não contorne a
proteção repetindo a chamada com outro recurso.

## Uma ferramenta de escrita não aparece

O servidor pode estar em read-only. Confira os argumentos. Remover
`--read-only` amplia as permissões do cliente e deve ser uma decisão explícita.

## A Sprint atual não foi encontrada

Liste o Folder com períodos:

```bash
clickupfy sprint list --folder <sprint-folder-id> --include-regular
```

Confirme se existe exatamente uma Sprint cujo período inclui a data atual.
Corrija datas ou sobreposição na interface do ClickUp.

## O item de checklist não mudou

Releia a tarefa:

```bash
clickupfy task get <task-id> --json
```

Confirme task ID, checklist ID e item ID. O comando `checklist set` rejeita um
item que não pertença à tarefa informada.

## O time entry já está em execução

```bash
clickupfy time current
clickupfy time stop
```

Confira o item antes de encerrar. Depois inicie o registro correto.

## A saída compacta não mostra um campo

Repita com `--json`:

```bash
clickupfy --json task get <task-id>
```

Para uma tarefa longa consumida por agente, prefira `--markdown`.

## Diagnóstico seguro

Ao relatar um problema, inclua:

- versão de `clickupfy --version`
- plataforma e forma de instalação
- grupo e ação executados
- mensagem de erro
- se o modo era CLI ou MCP
- escopo sem credenciais.

Remova API keys, tokens, headers, conteúdo de clientes e dados pessoais.

Volte ao [início do guia](README.md) ou consulte a
[referência do CLI](cli.md).
