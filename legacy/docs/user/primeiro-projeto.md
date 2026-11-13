# Prepare o primeiro projeto

## Classificação

| Campo | Valor |
| --- | --- |
| Natureza | normativo |
| Escopo | primeira integração de um repositório com ClickUpfy e MCP |
| Autoridade | agent install, escopo MCP e ferramentas públicas |

## O que você vai preparar

Neste percurso, um repositório será ligado a uma List do ClickUp. O resultado
são `.mcp.json` e `.codex/config.toml`, cada um no formato do cliente que os
consome, iniciando o ClickUpfy com um account e IDs fixos, além das quatro
skills instaladas no projeto.

Antes de escrever qualquer tarefa, você vai:

1. validar o perfil
2. descobrir Space, Folder e List
3. instalar o MCP em read-only para conferir o destino
4. liberar escrita somente depois da revisão.

## Valide o perfil

```bash
clickupfy status
clickupfy whoami
```

Confirme o nome do account, o usuário e o workspace. Se qualquer dado estiver
errado, volte à [configuração](configuracao.md).

## Descubra a hierarquia

```bash
clickupfy workspace list
clickupfy space list
clickupfy folder list --space <space-id>
clickupfy list list --folder <folder-id>
```

Uma List pode pertencer diretamente ao Space. Nesse caso:

```bash
clickupfy list list --space <space-id>
```

Guarde os IDs confirmados. Se o projeto usa Sprints, localize também o Sprint
Folder que contém as Lists temporais.

## Inicialize o agente

Na raiz do repositório:

```bash
clickupfy --account promovaweb agent install \
  --workspace 123 \
  --space 10 \
  --folder 20 \
  --list 30
```

`space` e `list` são obrigatórios. Workspace e Folder podem ser omitidos
quando não forem necessários ao escopo. Acrescente
`--sprint-folder <id>` se o projeto usa Sprints.

O comando instala as skills e mescla o servidor no `.mcp.json` e no
`.codex/config.toml` existentes sem remover outros servidores ou configurações.
No JSON, a entrada fica assim:

```json
{
  "mcpServers": {
    "promovaweb-clickupfy": {
      "command": "clickupfy",
      "args": [
        "mcp",
        "serve",
        "--account",
        "promovaweb",
        "--workspace",
        "123",
        "--space",
        "10",
        "--folder",
        "20",
        "--list",
        "30"
      ]
    }
  }
}
```

No Codex, a entrada equivalente fica na tabela `mcp_servers`:

```toml
[mcp_servers."promovaweb-clickupfy"]
command = "clickupfy"
args = ["mcp", "serve", "--account", "promovaweb", "--workspace", "123", "--space", "10", "--folder", "20", "--list", "30"]
```

Antes de abrir o cliente MCP pela primeira vez, acrescente `--read-only` ao
fim de `args`. O `agent install` prepara o servidor completo. Essa edição
consciente reduz a superfície durante a conferência inicial.

## Confira no agente

Reinicie ou recarregue o cliente MCP para que ele leia a nova configuração.
Peça uma consulta ao contexto:

```text
Use clickupfy_mcp_context e mostre o perfil, o workspace e a hierarquia deste
projeto.
```

Compare o resultado com os IDs anotados. Depois liste as tarefas:

```text
Use clickupfy_tasks_list sem informar listId.
```

O servidor deve aplicar a List configurada. Uma tentativa de consultar outra
List deve ser recusada.

## Libere escrita

Quando o destino estiver correto, remova apenas `--read-only` da entrada
gerenciada. Reabra o cliente MCP e confirme que as ferramentas de escrita
aparecem em `tools/list`.

Crie uma tarefa de teste somente se o projeto e a equipe autorizarem a
mutação. Caso contrário, use uma tarefa real já existente para validar leitura,
comentários e checklists.

## Primeira leitura de uma tarefa

No terminal:

```bash
clickupfy task get <task-id> --markdown
```

No agente:

```text
Leia <task-id> com clickupfy_task_get usando markdown: true. Não altere a
tarefa.
```

Confira descrição, subtarefas, checklists e fila executável. Agora você já pode
aprofundar a [hierarquia](hierarquia.md) ou começar a
[trabalhar com tarefas](tarefas.md).
