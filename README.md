# ClickUpfy da Promovaweb

O ClickUpfy reúne o terminal, a configuração de múltiplos accounts, duas
skills para agentes e um servidor MCP no mesmo pacote. O recorte atual atende
o trabalho de desenvolvimento de software: navegação pela hierarquia do
ClickUp, Sprints existentes, tarefas, comentários e time tracking.

## Requisitos

- Node.js `>=22.12.0`;
- uma API key pessoal do ClickUp;
- acesso da API key a pelo menos um workspace.

## Instalação para desenvolvimento

```bash
npm install
npm run build
npm link
```

O `npm link` disponibiliza `clickupfy` no terminal. Para conferir:

```bash
clickupfy --version
clickupfy --help
```

## Setup

O setup valida a API key, consulta os workspaces autorizados e associa um deles
ao account local:

```bash
clickupfy setup
```

Um terminal interativo oculta a API key e abre a escolha do workspace. A mesma
configuração pode ser feita sem prompts:

```bash
clickupfy setup \
  --api-key "pk_..." \
  --name "Promovaweb" \
  --workspace "123456" \
  --non-interactive
```

O arquivo fica em:

```text
~/.promovaweb-clickupfy/config.json
```

O diretório recebe permissão `0700` e o arquivo recebe `0600`. A API key é
armazenada no JSON porque o CLI precisa autenticar chamadas futuras; não
adicione esse arquivo ao Git, não envie seu conteúdo em comentários e não use
uma pasta sincronizada como destino.

O schema inicial permite vários accounts:

```json
{
  "version": 1,
  "activeAccount": "promovaweb",
  "accounts": {
    "promovaweb": {
      "name": "Promovaweb",
      "apiKey": "pk_...",
      "user": {
        "id": 123,
        "username": "Desenvolvedor"
      },
      "workspace": {
        "id": "456",
        "name": "Engenharia"
      },
      "createdAt": "2026-07-29T12:00:00.000Z",
      "updatedAt": "2026-07-29T12:00:00.000Z"
    }
  }
}
```

## Gerenciamento de accounts

Cada account combina uma API key, o usuário autenticado e um workspace. O
setup acrescenta ou atualiza um account sem apagar os demais.

```bash
clickupfy account list
clickupfy account show
clickupfy account use promovaweb
clickupfy account remove outro-account
clickupfy status
clickupfy whoami
```

A opção global `--account <nome>` escolhe outro account durante um único
comando. Ela não altera o account ativo:

```bash
clickupfy --account cliente-a task get 86abc123
```

O account também pode ser definido pela variável
`PROMOVAWEB_CLICKUPFY_ACCOUNT`. A variável
`PROMOVAWEB_CLICKUPFY_CONFIG` troca o caminho do JSON para testes e automações
isoladas.

## MCP específico por projeto

O `clickupfy` é único na máquina e recebe perfil e IDs por parâmetros. O uso
agêntico fica isolado no `.mcp.json` de cada projeto, que fixa o perfil e a
hierarquia permitida sem armazenar a API key.

Na raiz de cada projeto, execute:

```bash
clickupfy agent init \
  --account promovaweb \
  --workspace 123 \
  --space 10 \
  --folder 20 \
  --list 30 \
  --sprint-folder 40
```

O comando instala as skills e mescla o servidor no `.mcp.json` existente:

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
        "30",
        "--sprint-folder",
        "40"
      ]
    }
  }
}
```

`space` e `list` são obrigatórios em `agent init`. O `--account` global escolhe
o perfil; sem ele, o comando fixa o perfil ativo. Workspace, Folder e Sprint
Folder são opcionais. Quando o workspace for informado, o servidor confirma
que ele coincide com o workspace associado ao perfil.

As ferramentas do agente podem omitir os IDs fixados. Uma tentativa de passar
outro perfil, Space, Folder, List ou Sprint Folder é rejeitada pelo servidor.
Assim, dois projetos podem manter MCPs ativos em paralelo sem compartilhar
destino:

```text
projeto-a/.mcp.json -> account dev-a, List 30
projeto-b/.mcp.json -> account cliente-b, List 70
```

A API key continua somente em
`~/.promovaweb-clickupfy/config.json`. O `.mcp.json` guarda nomes de perfis e
IDs da hierarquia, mas nenhuma credencial.

## Hierarquia do ClickUp

O fluxo abaixo encontra os IDs antes de consultar as tarefas:

```bash
clickupfy workspace list
clickupfy space list
clickupfy folder list --space <space-id>
clickupfy list list --folder <folder-id>
clickupfy task list --list <list-id>
clickupfy task search --query "autenticação"
```

Use `clickupfy list list --space <space-id>` para uma list que não pertence a
um folder. A opção global `--json` imprime a resposta completa da API; sem ela,
listas e tarefas usam uma tabela menor.

## Tarefas de desenvolvimento

```bash
clickupfy task get <task-id> --json

clickupfy task create \
  --list <list-id> \
  --name "Implementar autenticação" \
  --description "Adicionar o fluxo de login e os testes."

clickupfy task update <task-id> --status "em andamento"
clickupfy task update <task-id> --priority 2
clickupfy task update <task-id> --due-date 2026-08-05

clickupfy comment list --task <task-id>
clickupfy comment create \
  --task <task-id> \
  --text "A implementação passou nos testes locais."
```

As prioridades seguem a API do ClickUp: `1` urgente, `2` alta, `3` normal e
`4` baixa. A exclusão exige confirmação:

```bash
clickupfy task delete <task-id> --yes
```

## Sprints e Sprint Points

No ClickUp, cada Sprint funciona como uma List dentro de um Sprint Folder. O
CLI reconhece como Sprint uma List que tenha `start_date` e `due_date`; Lists
comuns do mesmo folder ficam fora do resultado, salvo quando
`--include-regular` for informado.

```bash
clickupfy sprint list --folder <sprint-folder-id>
clickupfy sprint current --folder <sprint-folder-id>
clickupfy sprint get <sprint-id>
clickupfy sprint tasks <sprint-id> --open-only
```

O relatório de `sprint get` percorre todas as páginas, inclui tarefas
concluídas e calcula avanço por quantidade de tarefas e por Sprint Points. Uma
tarefa pode ser associada a uma Sprint sem perder sua List principal:

```bash
clickupfy sprint add-task <sprint-id> <task-id>
clickupfy sprint remove-task <sprint-id> <task-id>
clickupfy sprint set-points <task-id> 5
clickupfy task update <task-id> --points 8
```

A API pública do ClickUp não oferece um endpoint próprio para criar uma Sprint
ou configurar o Sprint ClickApp. Crie o Sprint Folder e as Sprints na
interface do ClickUp; depois use o CLI para consulta, planejamento e
associação de tarefas.

## Time tracking

```bash
clickupfy time current
clickupfy time start \
  --task <task-id> \
  --description "Implementação e testes"
clickupfy time stop
```

Consulte o registro atual antes de iniciar outro time entry.

## Servidor MCP

O servidor usa o transporte stdio e lê a configuração global de perfis do CLI:

```bash
clickupfy mcp serve
```

Para um agente que só pode consultar o ClickUp:

```bash
clickupfy mcp serve --read-only
```

O modo read-only remove as ferramentas de escrita de `tools/list` e rejeita
seu uso porque elas não são registradas. Para iniciar manualmente um MCP
específico:

```bash
clickupfy mcp serve \
  --account promovaweb \
  --workspace 123 \
  --space 10 \
  --folder 20 \
  --list 30 \
  --sprint-folder 40
```

As ferramentas cobrem accounts, workspaces, spaces, folders, lists, Sprints,
tarefas, comentários e time tracking. Consultas de Sprint permanecem
disponíveis em read-only; associação de tarefas e alteração de Points aparecem
somente no servidor com escrita. As ferramentas de escrita exigem parâmetros
explícitos, e `clickupfy_task_delete` também exige `confirm: true`.

`clickupfy_mcp_context` mostra o destino fixado sem expor a API key.
`clickupfy_folders_list`, `clickupfy_lists_list`, `clickupfy_tasks_list`,
`clickupfy_tasks_search`, `clickupfy_sprints_list`, `clickupfy_sprint_current` e
`clickupfy_task_create` usam os IDs do MCP quando os argumentos correspondentes
forem omitidos. Se a ferramenta receber um ID diferente, o servidor recusa a
operação. A busca fica restrita à List quando ela estiver fixada.

## Skills para agentes

O pacote distribui duas skills:

- `clickupfy-dev` orienta consultas e mudanças do trabalho diário de software;
- `clickupfy-executar-tarefa` conduz uma tarefa da leitura até a revisão, com
  plano, comentários e validação.

Instale as duas no projeto atual:

```bash
clickupfy agent skill install
```

Para instalar em `~/.codex/skills`:

```bash
clickupfy agent skill install --global
```

O comando abaixo instala as skills na pasta atual e acrescenta seu servidor ao
`.mcp.json` sem remover outros servidores:

```bash
clickupfy agent init \
  --account promovaweb \
  --space 10 \
  --folder 20 \
  --list 30 \
  --sprint-folder 40
```

Cada repositório mantém seu próprio `.mcp.json`, mesmo quando vários projetos
usam o mesmo executável e o mesmo arquivo global de credenciais.

Use `--force` para atualizar uma skill já instalada. Os comandos
`clickupfy agent skill list` e `clickupfy agent skill show <nome>` permitem
inspecionar o material empacotado.

## Comandos

| Grupo | Ações |
| --- | --- |
| `setup` | Configura a API key e o workspace. |
| `account` | `list`, `show`, `use`, `remove`. |
| `workspace` | `list`, `use`. |
| `space` | `list`. |
| `folder` | `list`. |
| `list` | `list`. |
| `sprint` | `list`, `current`, `get`, `tasks`, `add-task`, `remove-task`, `set-points`. |
| `task` | `list`, `search`, `get`, `create`, `update`, `delete`. |
| `comment` | `list`, `create`. |
| `time` | `current`, `start`, `stop`. |
| `mcp` | `serve`. |
| `agent` | Instala skills e configura o MCP. |

Execute `clickupfy <grupo> --help` para conferir argumentos e opções.

## Desenvolvimento e validação

```bash
npm run typecheck
npm test
npm run build
npm run validar
```

Os testes usam uma API HTTP local simulada. Eles não exigem credenciais reais
e comprovam a permissão do arquivo, o setup não interativo, o cliente HTTP e o
handshake MCP read-only, além da descoberta, paginação e medição de Sprints.
Também comprovam a fixação da List por MCP e a recusa de IDs fora do destino
configurado.

## Referência

A sintaxe `recurso ação`, a saída compacta e a presença do MCP no mesmo
executável foram inspiradas no projeto
[`nicholasbester/clickup-cli`](https://github.com/nicholasbester/clickup-cli),
distribuído sob Apache-2.0. Esta implementação foi escrita em TypeScript para a
configuração multi-account e o recorte de desenvolvimento da Promovaweb.

O código e o histórico pertencem ao repositório independente
[`promovaweb/clickupfy`](https://github.com/promovaweb/clickupfy).
