# Navegue pela hierarquia do ClickUp

## Classificação

| Campo | Valor |
| --- | --- |
| Natureza | normativo |
| Escopo | descoberta de IDs e navegação entre recursos do ClickUp |
| Autoridade | comandos workspace, space, folder, list e task |

## A ordem dos recursos

O ClickUp organiza o trabalho nesta cadeia:

```text
Workspace
└── Space
    ├── List sem Folder
    └── Folder
        └── List
```

Sprints também são Lists, mas vivem normalmente dentro de um Sprint Folder e
possuem `start_date` e `due_date`.

O account já conhece um workspace. Por isso, `space list` não exige esse ID. A
partir do Space, os comandos precisam do pai para evitar uma busca ambígua.

## Liste workspaces e Spaces

```bash
clickupfy workspace list
clickupfy space list
clickupfy space list --archived
```

O asterisco na saída compacta indica o workspace associado ao account. Use
`--archived` somente quando precisar localizar uma estrutura antiga.

## Liste Folders e Lists

```bash
clickupfy folder list --space <space-id>
clickupfy list list --folder <folder-id>
```

Para Lists que pertencem diretamente ao Space:

```bash
clickupfy list list --space <space-id>
```

Folder e Space são alternativas no comando de Lists. Não informe os dois ao
mesmo tempo.

## Confira os status da List

```bash
clickupfy list get <list-id>
```

Essa leitura é importante antes de atualizar uma tarefa. Os nomes e tipos de
status são configuráveis no ClickUp. Uma equipe pode usar `feito`, outra
`concluído`, e uma terceira pode manter mais de um estado terminal.

Registre o ID da List e escolha um status terminal existente. Não assuma que
`done` ou `complete` será aceito.

## Liste e busque tarefas

```bash
clickupfy task list --list <list-id>
clickupfy task search --query "autenticação"
```

`task list` consulta uma List conhecida. `task search` procura no workspace,
mas o MCP de projeto restringe a busca à List fixada para impedir vazamento de
contexto entre projetos.

Use `--json` quando precisar inspecionar campos não exibidos na tabela:

```bash
clickupfy --json task list --list <list-id>
```

A opção global vem antes do grupo do comando.

## Escolha o menor escopo suficiente

Um MCP de projeto sempre exige List. Space e Folder ajudam as ferramentas de
navegação, mas não ampliam o destino de criação. Sprint Folder só deve ser
configurado quando as Sprints do projeto estiverem dentro dele.

Para um projeto com List diretamente no Space:

```bash
clickupfy --account produto agent install \
  --space 10 \
  --list 30
```

Para um projeto com Folder e Sprints:

```bash
clickupfy --account produto agent install \
  --space 10 \
  --folder 20 \
  --list 30 \
  --sprint-folder 40
```

Continue em [tarefas e checklists](tarefas.md).
