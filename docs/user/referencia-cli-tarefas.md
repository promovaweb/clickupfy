# Referência do CLI: tarefas, checklists, comentários e tempo

## Classificação

| Campo | Valor |
| --- | --- |
| Natureza | referência |
| Escopo | comandos de consulta e alteração de tarefas, checklists, comentários, time tracking e tags |
| Autoridade | `src/operations/cli.ts`, `src/clickup/tasks.ts`, `src/clickup/checklists.ts`, `src/clickup/comments.ts`, `src/clickup/time.ts`, `src/clickup/tags.ts` e a ajuda da versão instalada |

Os IDs deste capítulo são fictícios. Use `list get` para obter a grafia dos
status e `task get --json` para encontrar IDs de checklist items. Uma chamada de
escrita deve ser seguida por uma nova leitura do recurso alterado; a ausência de
erro não confirma que o ClickUp persistiu o valor esperado.

Duas convenções valem para todos os comandos abaixo. Valores múltiplos de
`--status` e `--assignee` são separados por vírgula, sem espaço, como em
`--status "to do,review"` e `--assignee 42,57`. E o `--json` devolve sempre o
envelope `{ ok, command, data }`, com listas dentro de um objeto, como
`{ "tasks": [] }`.

## Leitura de tarefas

### `clickupfy task list --list <id>`

Lista uma página de até 100 tarefas de uma List. `--list` é obrigatório porque o
CLI não lê o `.mcp.json` do projeto. `--status` aceita um ou mais nomes de
status, `--assignee` recebe um ou mais IDs de responsáveis e `--page` começa em
zero.

| Parâmetro | Obrigatório | Uso |
| --- | --- | --- |
| `--list <id>` | sim | List consultada. |
| `--status <valores>` | não | Restringe aos status informados, separados por vírgula. |
| `--assignee <valores>` | não | Restringe aos responsáveis, separados por vírgula. |
| `--include-closed` | não | Inclui tarefas concluídas. |
| `--page <n>` | não | Página, iniciando em `0`. |

Exemplos:

```bash
clickupfy task list --list 901328052926
```

```bash
clickupfy task list --list 901328052926 --status "in progress"
```

```bash
clickupfy task list --list 901328052926 --status "to do,in progress" --assignee 42
```

```bash
clickupfy task list --list 901328052926 --include-closed --page 0
```

```bash
clickupfy task list --list 901328052926 --page 2 --account produto --json
```

A saída comum é uma tabela com ID, nome, status, prioridade, pontos, pessoas e
link. Com `--json`, `data` traz `{ tasks: [] }` e o CLI devolve as tarefas
completas da API. Para encontrar uma tarefa fora de uma List conhecida, use
`task search`.

### `clickupfy task get <task-id>`

Obtém uma tarefa e monta uma fila chamada `execution`, que inclui a tarefa, suas
subtarefas e seus checklist items em uma ordem estável. Sem opção de formato,
imprime uma tabela compacta da fila. Com `--json`, `data` traz
`{ task, execution: { summary, items[] } }`. `--markdown` junta metadados,
descrição e itens em um documento; `--raw` devolve apenas a resposta original da
API.

| Parâmetro | Obrigatório | Uso |
| --- | --- | --- |
| `<task-id>` | sim | Tarefa raiz a consultar. |
| `--raw` | não | Retorna somente a resposta original do ClickUp. |
| `--markdown` | não | Renderiza descrição e fila em Markdown. |

Exemplos:

```bash
clickupfy task get 86abc123
```

```bash
clickupfy task get 86abc123 --markdown
```

```bash
clickupfy task get 86abc123 --raw
```

```bash
clickupfy task get 86abc123 --json
```

```bash
clickupfy task get 86abc123 --markdown --account produto
```

Cada item de `execution.items` traz `key` estável (`task:<id>` ou
`checklist:<checklist-id>:<item-id>`), `type`, `parentKey`, `depth`, `name`,
`done`, `state` (`done` ou `pending`) e `action.complete` com o comando do CLI e
a chamada MCP que conclui o item. A ordem segue a tarefa, seus checklists e as
subtarefas, pelo `orderindex`. `--raw` junto de `--markdown` sai com `2`.

### `clickupfy task search`

Busca tarefas em todo o workspace associado ao perfil. É uma consulta paginada,
limitada por `--max-pages`, que aceita de `1` a `100` páginas de 100 tarefas e
usa `100` como padrão. O texto de `--query` procura ID, ID personalizado, nome
ou descrição.

| Parâmetro | Obrigatório | Uso |
| --- | --- | --- |
| `--query <texto>` | não | Termo de busca em ID, nome ou descrição. |
| `--status <valores>` | não | Filtra por status, separados por vírgula. |
| `--assignee <valores>` | não | Filtra por responsáveis, separados por vírgula. |
| `--include-closed` | não | Inclui tarefas concluídas. |
| `--max-pages <n>` | não | Limite entre `1` e `100`; o padrão é `100`. |

Exemplos:

```bash
clickupfy task search --query "autenticação"
```

```bash
clickupfy task search --query 86abc123
```

```bash
clickupfy task search --query "API" --status "in progress"
```

```bash
clickupfy task search --assignee 42 --include-closed --max-pages 5
```

```bash
clickupfy task search --query "checkout" --max-pages 10 --account cliente-a --json
```

Se mais de uma tarefa corresponder ao pedido, apresente os IDs e nomes para a
pessoa escolher a correta antes de executar uma escrita. Em um MCP de projeto, a
tool `clickupfy_tasks_search` percorre somente a List fixada; sem List fixada,
percorre o workspace, como o CLI.

## Criação e atualização de tarefas

### `clickupfy task create`

Cria tarefa ou subtarefa na List indicada. `--name` é obrigatório e `--list` é
obrigatória no CLI; no MCP a List fixada é o padrão. Use `--description` para
texto simples ou `--markdown-content` quando a descrição precisa preservar
Markdown. O comando não impõe uma regra de prioridade, status ou pontos do seu
time; ele transmite valores válidos para a API.

| Parâmetro | Obrigatório | Uso |
| --- | --- | --- |
| `--list <id>` | condicional | List de destino. |
| `--name <nome>` | sim | Nome da tarefa. |
| `--description <texto>` | não | Descrição em texto simples. |
| `--markdown-content <markdown>` | não | Descrição em Markdown. |
| `--status <status>` | não | Status inicial existente na List. |
| `--priority <n>` | não | `1` urgente, `2` alta, `3` normal, `4` baixa. |
| `--assignee <valores>` | não | IDs numéricos das pessoas responsáveis, separados por vírgula. |
| `--parent <task-id>` | não | Cria como subtarefa da tarefa informada. |
| `--start-date <AAAA-MM-DD>` | não | Data de início, gravada no começo do dia no fuso local. |
| `--due-date <AAAA-MM-DD>` | não | Data de entrega, gravada no começo do dia no fuso local. |
| `--points <n>` | não | Sprint Points iguais ou maiores que zero. |

Exemplos:

```bash
clickupfy task create --list 901328052926 --name "Corrigir retorno da API"
```

```bash
clickupfy task create \
  --list 901328052926 \
  --name "Documentar autenticação" \
  --description "Explicar o fluxo de login."
```

```bash
clickupfy task create \
  --list 901328052926 \
  --name "Criar testes" \
  --markdown-content "## Casos\n\n- Login válido\n- Senha inválida"
```

```bash
clickupfy task create \
  --list 901328052926 \
  --name "Implementar refresh token" \
  --status "in progress" \
  --priority 2 \
  --assignee 42,57 \
  --start-date 2026-11-16 \
  --due-date 2026-11-20 \
  --points 5
```

```bash
clickupfy task create \
  --list 901328052926 \
  --parent 86abc123 \
  --name "Cobrir expiração de sessão" \
  --markdown-content "Adicionar casos de teste para sessão expirada." \
  --account produto
```

As datas `--start-date` e `--due-date` viram o início do dia no fuso local da
máquina e são enviadas com `start_date_time` e `due_date_time` iguais a `false`,
para o ClickUp mostrar só a data. A versão 0.9.0 gravava meia-noite UTC, então
uma tarefa criada agora pode aparecer com um horário diferente do que aparecia
antes.

Consulte `clickupfy list get <list-id>` para copiar o status exato. Depois da
criação, guarde o `id` devolvido e chame `task get` para confirmar pai, datas,
responsáveis e conteúdo. `--parent` só define o pai na criação; ele não move uma
tarefa existente.

### `clickupfy task update <task-id>`

Atualiza campos de uma tarefa existente. Pelo menos um campo é obrigatório.
`--clear-start-date` e `--clear-due-date` removem as respectivas datas; informar
a flag de remoção e a data nova na mesma chamada sai com `2`.

| Parâmetro | Obrigatório | Uso |
| --- | --- | --- |
| `<task-id>` | sim | Tarefa a alterar. |
| `--name <nome>` | não | Novo nome. |
| `--description <texto>` | não | Nova descrição em texto simples. |
| `--markdown-content <markdown>` | não | Nova descrição em Markdown. |
| `--status <status>` | não | Status existente na List. |
| `--priority <n>` | não | Prioridade de `1` a `4`. |
| `--start-date <AAAA-MM-DD>` | não | Nova data de início, no começo do dia local. |
| `--clear-start-date` | não | Remove a data de início. |
| `--due-date <AAAA-MM-DD>` | não | Nova data de entrega, no começo do dia local. |
| `--clear-due-date` | não | Remove a data de entrega. |
| `--points <n>` | não | Sprint Points não negativos. |

Exemplos:

```bash
clickupfy task update 86abc123 --status "in progress"
```

```bash
clickupfy task update 86abc123 --name "Corrigir autenticação por token"
```

```bash
clickupfy task update 86abc123 --priority 1 --points 8
```

```bash
clickupfy task update 86abc123 --start-date 2026-11-16 --due-date 2026-11-20
```

```bash
clickupfy task update 86abc123 \
  --markdown-content "## Entrega\n\nPublicar a documentação atualizada." \
  --clear-due-date \
  --account produto
```

`--description` e `--markdown-content` representam alternativas de conteúdo;
envie apenas a forma que você quer persistir. Uma atualização de status precisa
usar a grafia devolvida por `list get`. Releia a tarefa depois da escrita e
compare cada campo solicitado com o estado devolvido.

### `clickupfy task delete <task-id>`

Exclui permanentemente uma tarefa. Em terminal interativo, pede confirmação; em
automação, exige `--yes`, senão sai com `2`. Leia nome, List e relação com
Sprint antes de executar. A exclusão não é uma forma de retirar a tarefa de uma
Sprint: use `sprint remove-task` para remover apenas a associação. Em JSON,
`data` traz `{ deleted, taskId }`.

| Parâmetro | Obrigatório | Uso |
| --- | --- | --- |
| `<task-id>` | sim | Tarefa a excluir. |
| `--yes` | não | Confirma a exclusão sem prompt. |

Exemplos:

```bash
clickupfy task delete 86abc123
```

```bash
clickupfy task delete 86abc123 --yes
```

```bash
clickupfy task delete 86abc123 --account produto --yes
```

```bash
clickupfy task delete 77def456 --yes --account cliente-a
```

```bash
clickupfy task get 86abc123 && clickupfy task delete 86abc123 --yes
```

O último exemplo lê a tarefa no mesmo terminal, mas ainda exige que você
compare o resultado e tenha autorização explícita. Recusar a confirmação sai com
`130`. No MCP, a tool equivalente exige o campo literal `confirm: true`.

## Checklists e comentários

### `clickupfy checklist create <task-id> --name <nome>`

Cria um checklist vazio em uma tarefa. Os itens são criados pelo comando
seguinte. Use um nome que indique a finalidade, como `Testes`, `Publicação` ou
`Revisão manual`.

| Parâmetro | Obrigatório | Uso |
| --- | --- | --- |
| `<task-id>` | sim | Tarefa proprietária. |
| `--name <nome>` | sim | Nome do checklist. |

Exemplos:

```bash
clickupfy checklist create 86abc123 --name "Testes"
```

```bash
clickupfy checklist create 86abc123 --name "Revisão de segurança"
```

```bash
clickupfy checklist create 77def456 --name "Publicação"
```

```bash
clickupfy checklist create 86abc123 --name "Aceite" --account produto
```

```bash
clickupfy checklist create 86abc123 --name "Regressão" --json
```

Guarde o ID retornado em `{ checklist }`: `item-create` usa o ID do checklist,
não o ID da tarefa. Crie o checklist na tarefa que realmente possui os itens;
uma subtarefa pode ter checklist próprio e não deve receber os itens da tarefa
pai por acidente.

### `clickupfy checklist item-create <checklist-id> --name <nome>`

Acrescenta um item aberto a um checklist. `--assignee` é opcional e recebe um ID
numérico. O comando não aceita o ID da tarefa porque o checklist já define seu
proprietário.

| Parâmetro | Obrigatório | Uso |
| --- | --- | --- |
| `<checklist-id>` | sim | Checklist que receberá o item. |
| `--name <nome>` | sim | Texto do item. |
| `--assignee <id>` | não | ID numérico da pessoa responsável. |

Exemplos:

```bash
clickupfy checklist item-create b955c4dc --name "Executar testes unitários"
```

```bash
clickupfy checklist item-create b955c4dc --name "Executar build"
```

```bash
clickupfy checklist item-create b955c4dc --name "Revisar documentação" --assignee 42
```

```bash
clickupfy checklist item-create 3f1a7c22 --name "Conferir changelog" --account produto
```

```bash
clickupfy checklist item-create 3f1a7c22 --name "Validar publicação" --assignee 57 --json
```

Um item deve descrever uma verificação observável, não uma promessa genérica.
Depois de criar itens, execute `task get --json` para localizar o `item-id` e
confirmar que todos começam abertos. `--assignee` que não é inteiro sai com `2`.

### `clickupfy checklist set <task-id> <checklist-id> <item-id>`

Marca um item como concluído com `--resolved` ou o reabre com `--open`. Escolha
exatamente uma flag. O ClickUpfy primeiro confirma que o item pertence à tarefa
raiz informada ou a uma subtarefa dela, grava o estado e relê a tarefa para
confirmar o resultado.

| Parâmetro | Obrigatório | Uso |
| --- | --- | --- |
| `<task-id>` | sim | Tarefa raiz usada para validar a associação. |
| `<checklist-id>` | sim | Checklist proprietário. |
| `<item-id>` | sim | Item a alterar. |
| `--resolved` | condicional | Marca como concluído. |
| `--open` | condicional | Reabre o item. |

Exemplos:

```bash
clickupfy checklist set 86abc123 b955c4dc 21e08dc8 --resolved
```

```bash
clickupfy checklist set 86abc123 b955c4dc 21e08dc8 --open
```

```bash
clickupfy checklist set 86abc123 3f1a7c22 8b2d7e10 --resolved --account produto
```

```bash
clickupfy checklist set 77def456 3f1a7c22 8b2d7e10 --resolved --json
```

```bash
clickupfy checklist set 77def456 3f1a7c22 8b2d7e10 --open
```

O `data` do `--json` traz o item na forma da fila de `task get`: `key`, `type`,
`taskId`, `parentKey`, `depth`, `name`, `done`, `state`, `checklistId`,
`checklistName` e `action`. Não use `--resolved --open` nem omita as duas: o
comando sai com `2`. Item que não pertence ao checklist da tarefa sai com `6`, e
estado não confirmado na releitura sai com `5`.

### `clickupfy comment list --task <id>`

Lista os comentários de uma tarefa com autoria, data e texto, percorrendo todas
as páginas da API. O ClickUpfy normaliza o conteúdo para o campo `text` da
tabela compacta. Com `--json`, `data` traz `{ comments: [] }` com `id`, `user`,
`date` e `text`.

| Parâmetro | Obrigatório | Uso |
| --- | --- | --- |
| `--task <id>` | sim | Tarefa cujos comentários serão lidos. |

Exemplos:

```bash
clickupfy comment list --task 86abc123
```

```bash
clickupfy comment ls --task 86abc123
```

```bash
clickupfy comment list --task 86abc123 --json
```

```bash
clickupfy comment list --task 86abc123 --account produto
```

```bash
clickupfy comment list --task 77def456 --account cliente-a --json
```

Leia os comentários antes de atualizar status ou publicar outro progresso, pois
podem conter uma orientação nova. Nunca publique credenciais, dados pessoais,
URLs assinadas ou logs extensos em um comentário.

### `clickupfy comment create --task <id> --text <texto>`

Publica um comentário em uma tarefa. `--notify-all` pede ao ClickUp que notifique
todos os participantes. Use o comando para registrar início, resultado de teste,
mudança de escopo ou conclusão, sempre com informação verificável.

| Parâmetro | Obrigatório | Uso |
| --- | --- | --- |
| `--task <id>` | sim | Tarefa que receberá o comentário. |
| `--text <texto>` | sim | Conteúdo do comentário. |
| `--notify-all` | não | Notifica os participantes da tarefa. |

Exemplos:

```bash
clickupfy comment create --task 86abc123 --text "Iniciei a análise da tarefa."
```

```bash
clickupfy comment create --task 86abc123 --text "Os testes unitários passaram."
```

```bash
clickupfy comment create --task 86abc123 --text "Aguardando acesso ao ambiente de homologação." --notify-all
```

```bash
clickupfy comment create --task 86abc123 --text "Documentação e ebook foram atualizados." --account produto
```

```bash
clickupfy comment create --task 77def456 --text "Validação final concluída." --notify-all --json
```

O `data` do `--json` traz `{ id, hist_id, date }`. Reler `comment list` confirma
que o comentário ficou na tarefa pretendida e que o texto chegou completo. O
comando não modifica status, timer ou checklist. Obrigatória ausente sai com
`2`.

## Time tracking

### `clickupfy time current`

Consulta o time entry em execução no workspace associado ao perfil. Chame este
comando antes de `time start` para não iniciar outro registro sem saber qual
tarefa já está em andamento. Sem cronômetro ativo, `data` traz `{ entry: null }`
com exit code `0`.

Exemplos:

```bash
clickupfy time current
```

```bash
clickupfy time current --json
```

```bash
clickupfy time current --account produto
```

```bash
clickupfy time current --account cliente-a --json
```

```bash
clickupfy time current && clickupfy task get 86abc123
```

Se houver entrada ativa para outra tarefa, pare e peça orientação antes de usar
`time stop`. O comando é somente leitura e não altera status ou comentários.

### `clickupfy time start --task <id>`

Inicia um time entry associado à tarefa. A descrição é opcional e deve dizer o
trabalho em curso. O registro pertence ao usuário autenticado pelo perfil e ao
workspace desse perfil.

O ClickUp mantém um cronômetro por pessoa. Quando já existe um em outra tarefa,
o ClickUp troca o cronômetro; antes de iniciar, o comando consulta o atual,
avisa no stderr e devolve a tarefa anterior em `previous`, sem impedir a troca.
`previous` traz `id`, `taskId`, `taskName`, `description` e `start`.

| Parâmetro | Obrigatório | Uso |
| --- | --- | --- |
| `--task <id>` | sim | Tarefa associada ao tempo. |
| `--description <texto>` | não | Descrição curta do trabalho. |

Exemplos:

```bash
clickupfy time start --task 86abc123
```

```bash
clickupfy time start --task 86abc123 --description "Implementação"
```

```bash
clickupfy time start --task 86abc123 --description "Testes de regressão"
```

```bash
clickupfy time start --task 86abc123 --description "Revisão de documentação" --account produto
```

```bash
clickupfy time start --task 77def456 --description "Correção da integração" --account cliente-a
```

Em JSON, `data` traz `{ entry, previous? }`. Depois da chamada, execute
`time current` para confirmar o item ativo. Iniciar um cronômetro não muda o
status da tarefa nem avisa participantes; essas ações usam `task update` e
`comment create` separadamente. `--task` ausente sai com `2`.

### `clickupfy time stop`

Encerra o time entry em execução no workspace do perfil. Não recebe argumento de
tarefa: ele para o registro atual. Por isso a consulta anterior é necessária em
trabalhos paralelos ou quando mais de uma pessoa usa o mesmo perfil local.

Exemplos:

```bash
clickupfy time stop
```

```bash
clickupfy time stop --account produto
```

```bash
clickupfy time stop --account cliente-a
```

```bash
clickupfy time stop && clickupfy time current
```

```bash
clickupfy time stop --json
```

O quarto exemplo verifica que não há entrada em execução após o encerramento.
Sem cronômetro ativo, o comando sai com `5` e a mensagem do ClickUp. Parar o
tempo não fecha tarefa, não altera seus pontos e não resolve checklist items.
Registre a conclusão do trabalho nas interfaces próprias se elas também forem
autorizadas.

## Tags de tarefas

### `clickupfy task add-tag <task-id> <tag>`

Adiciona uma tag a uma tarefa existente pela API do ClickUp. As demais tags
permanecem na tarefa. Cada execução adiciona um único nome; coloque nomes com
espaços entre aspas. O comando não gerencia as cores ou o catálogo de tags do
Space.

| Parâmetro | Tipo | Obrigatório | Padrão e uso |
| --- | --- | --- | --- |
| `<task-id>` | string | sim | ID da tarefa ou subtarefa. |
| `<tag>` | string | sim | Nome exato da tag, sem valor padrão; nomes vazios são recusados. |
| `--custom-task-id` | booleano | não | Desativado; quando presente, usa o workspace do perfil para resolver o ID personalizado. |
| `--account <perfil>` | string | não | Perfil ativo por padrão. |

Exemplos:

Adicione uma tag pelo ID interno:

```bash
clickupfy task add-tag 86abc123 bug
```

Preserve um nome com espaço e acento:

```bash
clickupfy task add-tag 86abc123 "em revisão"
```

Use o workspace do perfil ativo com um ID personalizado:

```bash
clickupfy task add-tag DEV-42 backend --custom-task-id
```

Selecione o perfil para uma tarefa de outro workspace:

```bash
clickupfy task add-tag 77def456 documentação --account produto
```

Capture o resultado em um script e consulte a tarefa:

```bash
clickupfy --json task add-tag 86abc123 "QA / revisão"
```

O `data` do `--json` traz `{ added, taskId, tagName }`. Essa confirmação indica
que a API aceitou a chamada; confira as tags persistidas com
`task get --raw`. Para IDs personalizados, use o ID interno retornado pela
tarefa nessa leitura. Erros de permissão, tarefa inexistente e outras recusas do
ClickUp são propagados sem imprimir sucesso.

O endpoint usado é [Add Tag To Task](https://developer.clickup.com/reference/addtagtotask),
com `POST /task/{task_id}/tag/{tag_name}`. Nomes e IDs são codificados na URL;
IDs personalizados enviam `custom_task_ids=true` e `team_id` na query.

## Gestão do catálogo de tags

As operações usam o perfil ativo ou `--account` no CLI e `account` no MCP. A API
key precisa ter acesso ao Space ou à tarefa. Falhas do ClickUp são propagadas;
no MCP, retornam `isError: true`. Ferramentas de escrita não ficam disponíveis em
modo somente leitura. O MCP aceita `spaceId` ou usa o Space fixado na
configuração; o CLI exige `--space` nos comandos `tag`.

### `clickupfy tag list --space <id>`

Lista nomes e cores das tags de um Space. Com `--json`, `data` traz
`{ tags: [] }` com `name`, `tag_fg` e `tag_bg`; o terminal mostra uma tabela. A
consulta não altera tags.

`spaceId` é string, opcional quando o MCP fixa o Space. No CLI, `--space` é
obrigatória.

Exemplos:

```bash
clickupfy tag list --space 90070363783
```

```bash
clickupfy tag list --space 90070363783 --json
```

```bash
clickupfy tag list --space 90070363783 --account dev
```

```bash
clickupfy tag list --space 9007154145 --account produto --json
```

```bash
clickupfy tag list --space 9007154145 --json > tags.json
```

Após uma escrita, consulte `tag list --space <id>` para conferir o catálogo ou
`task get <task-id> --raw` para conferir as associações da tarefa.

### `clickupfy tag create <name> --space <id>`

Cria uma tag no catálogo do Space com nome e cores. O `data` traz
`{ created, spaceId, name }`. A associação a tarefas é feita separadamente com
`task add-tag`.

`name`, `foreground` e `background` são obrigatórios. As cores usam `#RRGGBB`.
No CLI, use `--foreground` e `--background`. Nome vazio e cor fora do formato são
recusados com `2`.

Exemplos:

```bash
clickupfy tag create bug --space 90070363783 --foreground "#ffffff" --background "#cc0000"
```

```bash
clickupfy tag create "em revisão" --space 90070363783 --foreground "#000000" --background "#ffcc00"
```

```bash
clickupfy tag create backend --space 90070363783 --foreground "#ffffff" --background "#112233" --json
```

```bash
clickupfy tag create documentação --space 9007154145 --foreground "#ffffff" --background "#336699" --account produto
```

```bash
clickupfy tag create "QA / revisão" --space 90070363783 --foreground "#ffffff" --background "#663399"
```

Sem `--space` no CLI, o comando sai com `2`. Após uma escrita, consulte
`tag list --space <id>` para conferir o catálogo ou `task get <task-id> --raw`
para conferir as associações da tarefa.

### `clickupfy tag update <tag> --space <id>`

Renomeia a tag ou altera suas cores no Space. O comando consulta a definição
atual e preserva os campos omitidos. O `data` traz `{ updated, spaceId, name }`.
Tag ausente sai com `6`; atualização sem nenhum campo de alteração sai com `2`.

`tagName` é o nome atual obrigatório; no CLI, é o argumento `<tag>`. `name`,
`foreground` e `background` são opcionais, com pelo menos um campo informado. No
CLI, use `--name`, `--foreground` e `--background`.

Exemplos:

```bash
clickupfy tag update bug --space 90070363783 --name defeito
```

```bash
clickupfy tag update bug --space 90070363783 --foreground "#ffffff"
```

```bash
clickupfy tag update bug --space 90070363783 --background "#cc0000"
```

```bash
clickupfy tag update "em revisão" --space 90070363783 --name revisada --background "#00aa00"
```

```bash
clickupfy tag update backend --space 9007154145 --foreground "#ffffff" --background "#112233" --account produto --json
```

Após uma escrita, consulte `tag list --space <id>` para conferir o catálogo ou
`task get <task-id> --raw` para conferir as associações da tarefa.

### `clickupfy tag delete <tag> --space <id>`

Exclui a tag do Space e de todas as tarefas que a usavam. Consulte as tarefas que
a utilizam antes de executar essa alteração. O `data` traz
`{ deleted, spaceId, name }`. Para remover somente a associação a uma tarefa, use
`task remove-tag`.

`tagName` é obrigatório. No MCP, `confirm: true` é obrigatório. No CLI, `--yes`
dispensa o prompt; sem terminal interativo, a confirmação precisa ser explícita.
Recusar a confirmação sai com `130`. O cliente consulta a definição da tag para
enviar o corpo DELETE exigido pela API.

Exemplos:

```bash
clickupfy tag delete bug --space 90070363783 --yes
```

```bash
clickupfy tag delete "em revisão" --space 90070363783 --yes
```

```bash
clickupfy tag delete backend --space 90070363783 --yes --json
```

```bash
clickupfy tag delete documentação --space 9007154145 --yes --account produto
```

```bash
clickupfy tag delete "QA / revisão" --space 90070363783 --yes
```

Após uma escrita, consulte `tag list --space <id>` para conferir o catálogo ou
`task get <task-id> --raw` para conferir as associações da tarefa.

### `clickupfy task remove-tag <task-id> <tag>`

Remove uma tag da tarefa e mantém a definição no Space. O `data` traz
`{ removed, taskId, tagName }`. As outras associações da tarefa permanecem
intactas.

`taskId` e `tagName` são obrigatórios. `customTaskId` é booleano opcional,
desativado por padrão; no CLI, use `--custom-task-id`. IDs personalizados usam o
workspace do perfil.

Exemplos:

```bash
clickupfy task remove-tag 86abc123 bug
```

```bash
clickupfy task remove-tag 86abc123 "em revisão"
```

```bash
clickupfy task remove-tag DEV-42 backend --custom-task-id
```

```bash
clickupfy task remove-tag 77def456 documentação --account produto --json
```

```bash
clickupfy task remove-tag sub-1 "QA / revisão"
```

Após uma escrita, consulte `tag list --space <id>` para conferir o catálogo ou
`task get <task-id> --raw` para conferir as associações da tarefa.
