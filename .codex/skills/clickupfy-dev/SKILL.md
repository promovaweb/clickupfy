---
name: clickupfy-dev
description: Opera o MCP específico de cada projeto e o ClickUpfy global para tarefas, Sprints e trabalho paralelo de desenvolvimento de software.
---

# ClickUpfy para Desenvolvimento

Usar o ClickUpfy da Promovaweb ou suas ferramentas MCP para consultar e
atualizar trabalho de engenharia. Manter as respostas compactas e preservar a
rastreabilidade das mudanças.

## Escolher a interface

1. Usar ferramentas `clickupfy_*` quando o servidor MCP estiver disponível.
2. Usar `clickupfy` pelo terminal quando as ferramentas MCP não estiverem
   disponíveis.
3. Executar primeiro `clickupfy_mcp_context` para conhecer o destino fixado pelo
   MCP do projeto.
4. Usar `clickupfy account list` quando o MCP não estiver disponível.
5. Informar `--account <perfil>` ou o argumento `account` sem trocar o perfil
   ativo apenas para uma consulta pontual.

Nunca ler, imprimir, comentar ou copiar o campo `apiKey` de
`~/.promovaweb-clickupfy/config.json`. Não incluir credenciais em comandos,
logs, commits ou respostas.

## Preservar o isolamento dos projetos

Tratar o `.mcp.json` da pasta de trabalho como o destino do agente. Ele fixa o
perfil, workspace, Space, Folder e a List obrigatória nos argumentos de
`clickupfy mcp serve`, sem armazenar a API key. O Sprint Folder só aparece
quando o projeto usa Sprints.

Não executar `account use` para alternar entre projetos paralelos. Cada projeto
deve manter seu próprio servidor. Conferir `clickupfy_mcp_context` antes da
primeira escrita e omitir IDs já fixados. O servidor rejeita perfil ou
hierarquia diferentes dos argumentos recebidos na inicialização.

O CLI não lê o `.mcp.json`. Quando o MCP não estiver disponível, informar o
perfil e os IDs explicitamente:

```bash
clickupfy --account <perfil> task list --list <list-id>
```

## Navegar pelo trabalho

Quando houver um nome ou trecho da descrição, buscar no workspace:

```bash
clickupfy task search --query "<texto>"
```

No MCP, usar `clickupfy_tasks_search`. Se a busca retornar mais de uma tarefa
plausível, mostrar as opções e pedir uma escolha antes de escrever no ClickUp.

Descobrir IDs pela hierarquia quando a busca não for suficiente:

```bash
clickupfy workspace list
clickupfy space list
clickupfy folder list --space <space-id>
clickupfy list list --folder <folder-id>
clickupfy list get <list-id>
clickupfy task list --list <list-id>
```

Usar `--space <space-id>` em `list list` quando a list não pertencer a um
folder. Acrescentar `--json` quando os campos compactos não forem suficientes.

No MCP, seguir a mesma ordem com:

- `clickupfy_workspaces_list`;
- `clickupfy_spaces_list`;
- `clickupfy_folders_list`;
- `clickupfy_lists_list`;
- `clickupfy_list_get`;
- `clickupfy_tasks_list`.

Não adivinhar IDs de workspace, space, folder, list, tarefa ou usuário.

## Planejar com Sprints

Aplicar esta seção somente quando `clickupfy_mcp_context` informar um Sprint
Folder ou quando o usuário fornecer uma Sprint no escopo.

Localizar o Sprint Folder pela hierarquia e consultar a Sprint ativa antes de
alterar o planejamento:

```bash
clickupfy sprint list --folder <sprint-folder-id>
clickupfy sprint current --folder <sprint-folder-id>
clickupfy sprint get <sprint-id>
clickupfy sprint tasks <sprint-id> --open-only
```

No MCP, usar `clickupfy_sprints_list`, `clickupfy_sprint_current`,
`clickupfy_sprint_get` e `clickupfy_sprint_tasks`. Uma Sprint é uma List com
`start_date` e `due_date`; não tratar uma List comum do Sprint Folder como
Sprint. O CLI não cria Sprints porque a API pública do ClickUp não oferece essa
operação.

Associar ou remover uma tarefa somente quando o usuário tiver incluído o
planejamento da Sprint no escopo:

```bash
clickupfy sprint add-task <sprint-id> <task-id>
clickupfy sprint remove-task <sprint-id> <task-id>
clickupfy sprint set-points <task-id> <points>
```

No MCP, as operações equivalentes são `clickupfy_sprint_add_task`,
`clickupfy_sprint_remove_task` e `clickupfy_sprint_set_points`. Reler a Sprint e a
tarefa depois de cada alteração.

## Ler antes de alterar

1. Obter a tarefa completa com `clickupfy task get <id> --json` ou
   `clickupfy_task_get`.
2. Ler `execution.summary` e percorrer `execution.items` na ordem retornada.
3. Tratar cada `key` pendente como uma unidade individual de trabalho,
   preservando `parentKey` e `depth`.
4. Ler os comentários com `clickupfy comment list --task <id> --json` ou
   `clickupfy_comments_list`.
5. Conferir status, descrição, responsáveis, datas, subtarefas e dependências
   relevantes.
6. Confirmar que a tarefa e o perfil pertencem ao escopo solicitado.

`clickupfy_task_get` já reúne a tarefa principal, subtarefas aninhadas e itens
de checklist. Não reconstruir essa hierarquia por nome. Usar a chave
`task:<id>` para tarefas e `checklist:<checklist-id>:<item-id>` para checklist
items.

Quando o agente precisar da tarefa inteira como um único contexto textual,
usar `clickupfy task get <id> --markdown` ou chamar `clickupfy_task_get` com
`markdown: true`. Usar a resposta JSON sem essa opção quando a fila estruturada
for necessária para selecionar e atualizar itens.

Depois de concluir um checklist item, executar a ação `complete` fornecida no
próprio item. Para marcar ou reabrir manualmente:

```bash
clickupfy checklist set <task-id> <checklist-id> <item-id> --resolved
clickupfy checklist set <task-id> <checklist-id> <item-id> --open
```

No MCP, usar `clickupfy_checklist_item_set`. A ferramenta relê a tarefa depois
da escrita e só retorna o item quando `done` corresponde ao estado solicitado.

Para criar checklists e seus itens:

```bash
clickupfy checklist create <task-id> --name "Testes"
clickupfy checklist item-create <checklist-id> --name "<teste>"
```

No MCP, usar `clickupfy_checklist_create` e
`clickupfy_checklist_item_create`. Manter cada item aberto durante a criação.

## Atualizar tarefas

Usar apenas os campos autorizados pelo pedido:

```bash
clickupfy task create \
  --list <list-id> \
  --name "<nome>" \
  --markdown-content "<markdown>" \
  --parent "<task-id>" \
  --start-date <AAAA-MM-DD> \
  --due-date <AAAA-MM-DD>

clickupfy task update <task-id> --status "<status exato>"
clickupfy task update <task-id> --start-date <AAAA-MM-DD>
clickupfy task update <task-id> --priority 2
clickupfy task update <task-id> --points 5
clickupfy comment create --task <task-id> --text "<progresso>"
```

No MCP, usar `clickupfy_task_create`, `clickupfy_task_update` e
`clickupfy_comment_create`. Usar `markdownContent`, `parent`, `startDate` e
`dueDate` para os campos equivalentes. Status são nomes configurados pela List;
ler `clickupfy_list_get` e usar a grafia real.

Antes de `task delete` ou `clickupfy_task_delete`, obter autorização explícita e
confirmar o ID. A ferramenta MCP exige `confirm: true`; o CLI exige `--yes`.

## Registrar tempo

Consultar primeiro se já existe um time entry:

```bash
clickupfy time current
clickupfy time start --task <task-id> --description "<atividade>"
clickupfy time stop
```

Usar `clickupfy_time_current`, `clickupfy_time_start` e `clickupfy_time_stop` no MCP.
Não iniciar outro time entry quando houver um em execução sem confirmar o que
deve acontecer com o registro atual. Essa conferência é obrigatória quando
processos paralelos usam o mesmo perfil e workspace.

## Validar mudanças

Depois de cada escrita:

1. Ler novamente a tarefa ou o recurso alterado.
2. Comparar o valor persistido com o valor solicitado.
3. Informar o ID, a mudança confirmada e qualquer pendência real.
4. Nunca declarar sucesso usando apenas a ausência de erro do comando.
