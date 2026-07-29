# ClickUpfy da Promovaweb

O ClickUpfy reúne o terminal, a configuração de múltiplos accounts, três
skills para agentes e um servidor MCP no mesmo pacote. O recorte atual atende
o trabalho de desenvolvimento de software: navegação pela hierarquia do
ClickUp, Sprints existentes, tarefas, comentários e time tracking.

## Requisitos

- Node.js `>=22.12.0`;
- uma API key pessoal do ClickUp;
- acesso da API key a pelo menos um workspace.

## Instalação pelo executável

Cada [GitHub Release](https://github.com/promovaweb/clickupfy/releases)
distribui um executável standalone para Linux x64, macOS x64 e Windows x64.
Baixe o archive da sua plataforma, extraia o arquivo `clickupfy` ou
`clickupfy.exe` e coloque-o em uma pasta presente no `PATH`.

No Linux ou macOS, confirme a permissão depois de extrair:

```bash
chmod +x clickupfy
./clickupfy --version
```

O executável já contém o runtime Node.js e as skills. Node.js continua sendo
necessário somente para desenvolver o ClickUpfy ou instalar o pacote npm
disponível como artefato da release.

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
  --list 30
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
        "30"
      ]
    }
  }
}
```

`space` e `list` são obrigatórios em `agent init`. O `--account` global escolhe
o perfil; sem ele, o comando fixa o perfil ativo. Workspace e Folder são
opcionais. O Sprint Folder também é opcional: acrescente
`--sprint-folder <id>` somente nos projetos que usam Sprints. Quando o
workspace for informado, o servidor confirma que ele coincide com o workspace
associado ao perfil.

As ferramentas do agente podem omitir os IDs fixados. Uma tentativa de passar
outro perfil, Space, Folder ou List é rejeitada pelo servidor. Quando o Sprint
Folder estiver configurado, o mesmo isolamento vale para ele. Assim, dois
projetos podem manter MCPs ativos em paralelo sem compartilhar destino:

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
clickupfy task get <task-id> --markdown

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

`task get` inclui a resposta original do ClickUp e uma propriedade `execution`.
Essa propriedade organiza a tarefa principal, as subtarefas de qualquer nível
e cada item de checklist em uma fila plana. Cada entrada possui `key`, `type`,
`parentKey`, `depth`, `done`, `state` e as ações equivalentes para CLI e MCP.
Assim, um agente pode selecionar um item pendente pela chave, executar o
trabalho e registrar a conclusão sem perder a hierarquia.

```json
{
  "execution": {
    "summary": {
      "total": 4,
      "done": 1,
      "pending": 3,
      "tasks": 1,
      "subtasks": 1,
      "checklistItems": 2
    },
    "items": [
      {
        "key": "checklist:check-1:item-1",
        "type": "checklist_item",
        "parentKey": "task:86abc123",
        "done": false,
        "state": "pendente",
        "action": {
          "complete": {
            "cli": "clickupfy checklist set 86abc123 check-1 item-1 --resolved",
            "mcp": {
              "tool": "clickupfy_checklist_item_set"
            }
          }
        }
      }
    ]
  }
}
```

Para obter apenas a resposta original da API, use
`clickupfy task get <task-id> --raw`. A saída compacta, sem `--json`, mostra a
mesma fila em tabela e usa indentação no nome para representar os níveis.

Use `clickupfy task get <task-id> --markdown` quando o contexto precisar ser
consumido como um único texto. O documento concatena metadados, descrição,
resumo e itens executáveis em checkboxes hierárquicos, mantendo as chaves e os
comandos de conclusão. As opções `--raw`, `--markdown` e `--json` são
mutuamente exclusivas.

Marque ou reabra um item de checklist com:

```bash
clickupfy checklist set <task-id> <checklist-id> <item-id> --resolved
clickupfy checklist set <task-id> <checklist-id> <item-id> --open
```

O ClickUpfy confirma primeiro que o item pertence à tarefa informada, grava o
novo estado e relê toda a tarefa. O comando só comunica sucesso quando a nova
leitura confirma o valor de `resolved`.

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
clickupfy mcp serve --list 30
```

Para um agente que só pode consultar o ClickUp:

```bash
clickupfy mcp serve --list 30 --read-only
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
  --list 30
```

O servidor não inicia sem `--list`. O parâmetro `--sprint-folder` é opcional e
pode ser acrescentado ao comando quando o projeto usar Sprints.

As ferramentas cobrem accounts, workspaces, spaces, folders, lists, Sprints,
tarefas, subtarefas, checklists, comentários e time tracking.
`clickupfy_task_get` devolve a fila em `execution`. Com `markdown: true`, a
mesma ferramenta retorna diretamente um único texto Markdown concatenado, sem
codificação JSON. A ferramenta
`clickupfy_checklist_item_set` marca ou reabre um item e confirma o estado
persistido. Consultas de Sprint permanecem disponíveis em read-only;
associação de tarefas, alteração de Points e checklist items aparecem somente
no servidor com escrita. As ferramentas de escrita exigem parâmetros
explícitos, e `clickupfy_task_delete` também exige `confirm: true`.

`clickupfy_mcp_context` mostra o destino fixado sem expor a API key.
`clickupfy_folders_list`, `clickupfy_lists_list`, `clickupfy_tasks_list`,
`clickupfy_tasks_search`, `clickupfy_sprints_list`, `clickupfy_sprint_current` e
`clickupfy_task_create` usam os IDs do MCP quando os argumentos correspondentes
forem omitidos. Se a ferramenta receber um ID diferente, o servidor recusa a
operação. A busca fica sempre restrita à List obrigatória do projeto.

## Skills para agentes

O pacote distribui três skills:

- `clickupfy-dev` orienta consultas e mudanças do trabalho diário de software;
- `clickupfy-executar-tarefa` conduz uma tarefa da leitura até a revisão, com
  plano, comentários e validação;
- `clickupfy-release` prepara e acompanha versões, changelog, tags e artefatos.

Instale as três no projeto atual:

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
  --list 30
```

Cada repositório mantém seu próprio `.mcp.json`, mesmo quando vários projetos
usam o mesmo executável e o mesmo arquivo global de credenciais. Projetos que
usam Sprints podem acrescentar `--sprint-folder <id>` ao comando.

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
| `checklist` | `set` com `--resolved` ou `--open`. |
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
npm run release:check
npm run build:executable
npm run validar
```

Os testes usam uma API HTTP local simulada. Eles não exigem credenciais reais
e comprovam a permissão do arquivo, o setup não interativo, o cliente HTTP e o
handshake MCP read-only, além da descoberta, paginação e medição de Sprints.
Também comprovam que o MCP exige uma List, inicia sem Sprint Folder, mantém a
busca dentro da List e recusa IDs fora do destino configurado. A fila
executável possui testes para subtarefas aninhadas, checklist items, chaves
individuais, renderização Markdown e confirmação do estado depois da escrita.

## Releases

O Release Please abre uma Release PR a partir dos Conventional Commits. O merge
dessa PR atualiza versão e changelog, cria a tag `vMAJOR.MINOR.PATCH` e publica
a GitHub Release. Na mesma execução, o GitHub Actions gera executáveis Linux,
macOS e Windows, o pacote npm para download e `SHA256SUMS`. Em repositórios
públicos, a execução também gera attestations de proveniência.

Não crie tags nem edite a versão manualmente no fluxo normal. A configuração
única do repositório, a convenção dos commits, os comandos de validação e a
recuperação de falhas estão em [`RELEASING.md`](RELEASING.md). A skill
`clickupfy-release` orienta agentes durante esse processo.

## Referência

A sintaxe `recurso ação`, a saída compacta e a presença do MCP no mesmo
executável foram inspiradas no projeto
[`nicholasbester/clickup-cli`](https://github.com/nicholasbester/clickup-cli),
distribuído sob Apache-2.0. Esta implementação foi escrita em TypeScript para a
configuração multi-account e o recorte de desenvolvimento da Promovaweb.

O código e o histórico pertencem ao repositório independente
[`promovaweb/clickupfy`](https://github.com/promovaweb/clickupfy).
