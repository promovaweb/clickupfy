# Entenda o ClickUpfy

## Classificação

| Campo | Valor |
| --- | --- |
| Natureza | normativo |
| Escopo | conceitos, responsabilidades e limites do produto |
| Autoridade | README, CLI, servidor MCP e cliente HTTP do ClickUpfy |

## O problema que a ferramenta resolve

O ClickUp continua sendo a fonte do trabalho: tarefa, descrição, status,
checklist, comentário, Sprint e registro de tempo permanecem no workspace. O
ClickUpfy não cria um gerenciador paralelo. Ele oferece uma interface previsível
para consultar e alterar essa fonte pelo terminal ou por um agente.

Sem essa camada, cada agente precisa descobrir como autenticar, quais endpoints
usar, em qual List trabalhar e como representar uma tarefa grande. O ClickUpfy
centraliza essas decisões em três contratos:

- o perfil local associa uma API key a um workspace
- o projeto fixa o perfil e a hierarquia autorizada no `.mcp.json` ou no
  `.codex/config.toml`
- as skills descrevem quando ler, planejar, comentar, medir tempo e concluir.

## As quatro camadas

### ClickUp

É o sistema remoto e a fonte de verdade. O ClickUpfy usa a API pública para ler
workspaces, Spaces, Folders, Lists, tarefas, checklists, comentários, Sprints e
time entries. Permissões e ClickApps continuam sendo administrados no ClickUp.

### CLI

É a interface humana e automatizável. A sintaxe segue `recurso ação`, como
`task get`, `sprint current` e `comment create`. Sem `--json`, a saída é
compacta. Com `--json`, o CLI preserva a resposta completa necessária para
scripts e diagnóstico.

### Servidor MCP

É a interface para agentes. Ele usa transporte stdio e expõe ferramentas com
schemas explícitos. Uma configuração por projeto pode fixar account,
workspace, Space, Folder, List e Sprint Folder. A List é obrigatória porque
define o destino das consultas, buscas e criações de tarefa.

### Skills

São instruções operacionais entregues junto ao pacote. Elas não substituem o
MCP: orientam o agente a usar as ferramentas na ordem adequada, preservar
contexto, registrar progresso e comprovar a conclusão.

## Perfis e projetos são coisas diferentes

Um **account** do ClickUpfy é um perfil local. Ele contém um nome, a API key, o
usuário autenticado e o workspace associado. O arquivo vive fora dos
repositórios, em `~/.promovaweb-clickupfy/config.json`.

Um **projeto** é uma raiz de código que pode conter `.mcp.json` e
`.codex/config.toml`. Esses arquivos selecionam um account e fixam IDs da
hierarquia no formato esperado por cada cliente. Eles podem ser versionados
quando os IDs não forem considerados sensíveis pela equipe, pois nunca contêm a
API key.

O mesmo account pode servir mais de um projeto. Ambientes de clientes ou
workspaces diferentes devem receber perfis separados.

## Leitura compacta e leitura executável

`task get` não retorna apenas a tarefa original. O ClickUpfy monta uma
propriedade `execution` que achata a tarefa principal, subtarefas de qualquer
nível e checklist items em uma fila ordenada.

Cada item informa:

- uma `key` estável para a leitura atual
- o tipo do item
- a relação com o pai
- a profundidade na árvore
- o estado aberto ou concluído
- a ação equivalente no CLI e no MCP.

Essa fila ajuda o agente a selecionar um item pendente sem perder a hierarquia.
Quando o contexto precisa ser lido como documento, `task get --markdown`
produz metadados, descrição, resumo e checkboxes em um único texto.

## Limites importantes

O ClickUpfy não cria uma Sprint nem habilita o Sprint ClickApp, porque a API
pública não oferece um endpoint próprio para essas operações. Crie o Sprint
Folder e as Sprints na interface do ClickUp e use o CLI para consulta,
associação de tarefas e Sprint Points.

O CLI também não decide sozinho qual status representa conclusão. Use
`list get <list-id>` para ler os status configurados na List. Skills de
implementação devem escolher um status terminal existente, não inventar uma
grafia.

Agora siga para a [instalação](instalacao.md).
