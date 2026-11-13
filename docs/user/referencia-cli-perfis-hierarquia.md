# Referência do CLI: perfis, autenticação e hierarquia

## Classificação

| Campo | Valor |
| --- | --- |
| Natureza | referência |
| Escopo | comandos globais, perfis locais, autenticação e descoberta da hierarquia do ClickUp |
| Autoridade | `src/cli/commands/setup.ts`, `src/cli/commands/account.ts`, `src/cli/commands/workspace.ts`, `src/clickup/accounts.ts`, `src/clickup/hierarchy.ts` e a ajuda da versão instalada |

Este capítulo descreve cada comando que prepara uma sessão de trabalho e
localiza os IDs usados pelos demais capítulos. Os exemplos usam IDs fictícios.
Substitua somente os valores entre colchetes ou os números de exemplo. Nunca
cole uma API key em arquivo versionado, conversa pública, comentário de tarefa
ou captura de tela.

O binário guarda tudo em `~/.clickupfy/`. Os perfis ficam em `accounts.json`,
sem segredo nenhum, e a API key de cada perfil fica cifrada em
`credentials.json` como `clickup.<perfil>.api_key`. Os dois arquivos são
gravados com permissão `0600`.

## Opções globais

Estas opções valem em qualquer posição, antes ou depois do comando:

| Opção | Tipo | Efeito |
| --- | --- | --- |
| `-h`, `--help` | booleano | Help do comando atual, com exit code `0`. |
| `-V`, `--version` | booleano | Imprime `clickupfy <versão>`, com exit code `0`. |
| `--json` | booleano | Saída em JSON com o envelope `{ ok, command, data }`. |
| `--skill [topic]` | texto | Documentação embutida. Topics: `cli`, `tui`, `mcp`, `config`, `exit-codes` e `reference`. |
| `--opencli` | booleano | Descrição OpenCLI da árvore de comandos em JSON. |
| `--account <perfil>` | texto | Seleciona um perfil para esta execução sem trocar o perfil ativo. |
| `--no-color` | booleano | Desliga cores ANSI. `NO_COLOR=1` tem o mesmo efeito. |

O perfil usado por um comando é resolvido nesta ordem: a opção
`--account <perfil>`, a variável `PROMOVAWEB_CLICKUPFY_ACCOUNT` e o perfil ativo
em `accounts.json`. Sem nenhum deles, o comando sai com o exit code `4` e
sugere `clickupfy setup`. Um perfil inexistente sai com `6`. O perfil ativo só
muda com `account use`.

Como as opções globais valem em qualquer posição, as duas formas abaixo são
equivalentes:

```bash
clickupfy --account cliente-a task list
clickupfy task list --account cliente-a
```

### O envelope do `--json`

Com `--json`, a saída de sucesso é um objeto com `ok`, `command` e `data`:

```json
{
  "ok": true,
  "command": "clickupfy status",
  "data": { "account": "produto", "active": true }
}
```

Em erro, o objeto traz `ok: false`, `command` e `error` com `code`, `name`,
`message` e `details`:

```json
{
  "ok": false,
  "command": "clickupfy account show",
  "error": {
    "code": 6,
    "name": "NOT_FOUND",
    "message": "Profile \"cliente-x\" does not exist.",
    "details": { "account": "cliente-x" }
  }
}
```

O exit code do processo é sempre o mesmo de `error.code`. Um script deve ler os
dois: o envelope para a mensagem e o code para a classe da falha. Listas vêm
dentro de um objeto, como `{ "tasks": [] }` ou `{ "spaces": [] }`, e nunca como
array na raiz de `data`.

### `clickupfy upgrade`

Atualiza o ClickUpfy para a versão mais recente ou para uma versão indicada.
Instalado pelo pacote npm, roda `npm install -g @promovaweb/clickupfy@<alvo>`.
Como binário avulso, baixa `clickupfy-<plataforma>` e o `SHA256SUMS` da GitHub
Release, confere o hash e troca o executável.

| Parâmetro | Obrigatório | Uso |
| --- | --- | --- |
| `[alvo]` | não | `latest`, `next` (só npm) ou uma versão SemVer, como `1.0.1`. `latest` é o padrão. |

Rodando do código-fonte (`bun run src/main.ts`), o comando se recusa a
atualizar e sai com `2`. Alvo inválido sai com `2`; asset ausente para a
plataforma, com `6`; falha de rede ou de checksum, com `5`; falta de permissão
para trocar o arquivo, com `7`.

Exemplos:

```bash
clickupfy upgrade
```

```bash
clickupfy upgrade latest
```

```bash
clickupfy upgrade next
```

```bash
clickupfy upgrade 1.0.1
```

```bash
clickupfy upgrade v1.0.1
```

O quinto exemplo normaliza o prefixo `v` antes de montar a URL da release. O
canal `next` existe apenas no npm: como binário avulso, use `latest` ou uma
versão.

### `clickupfy doctor`

Confere o ambiente local sem alterar arquivos. O diagnóstico valida Bun 1.4.4
ou superior, o TTY de entrada e saída, a pasta de dados com `0700`, a leitura de
`settings.json`, a origem da master key, a decifragem do cofre, a versão e a
plataforma. Em seguida verifica os perfis e os arquivos MCP do projeto atual.

| Check | O que confere |
| --- | --- |
| `accounts` | `~/.clickupfy/accounts.json` existe e segue o schema. |
| `profile` | O perfil resolvido por `--account`, `PROMOVAWEB_CLICKUPFY_ACCOUNT` ou o perfil ativo. |
| `api-key` | A API key do perfil está no cofre, sem mostrar o valor. |
| `legacy-config` | O config do ClickUpfy 0.9.0 ainda existe e guarda API keys em texto puro. |
| `mcp-json`, `codex-config` | Servidores `clickupfy` no `.mcp.json` e no `.codex/config.toml` do diretório atual. |

Cada linha usa `✓`, `!` ou `✗`. Em JSON, `data` traz `{ checks, ok }`, e cada
check tem `name`, `status` (`ok`, `warn` ou `fail`), `detail` e, quando se
refere a um arquivo, `path`. Arquivo ainda não criado e ausência de TTY geram
`warn`. Um check com `fail` produz exit code `3`; os demais retornam `0`.

Com `--online`, o doctor também valida a API key em `GET /user` e lê as skills
instaladas com `npx skills list --json`. Essas verificações chamam a rede e
podem baixar o gerenciador de skills.

Exemplos:

```bash
clickupfy doctor
```

```bash
clickupfy doctor --json
```

```bash
clickupfy doctor --online
```

```bash
cd ~/projetos/produto && clickupfy doctor
```

```bash
clickupfy doctor --json | jq '.data.checks[] | select(.status == "fail")'
```

O diagnóstico confirma a configuração local e os arquivos usados pelos agentes,
mas sem `--online` não testa se a API key continua válida no ClickUp. Para essa
verificação remota, use `clickupfy whoami`.

### `clickupfy setup`

Cria ou atualiza um perfil local e associa a API key a um workspace autorizado.
O comando valida a chave em `GET /user`, lista os workspaces que ela alcança e
grava a chave cifrada no cofre. `clickupfy install` é um alias compatível.

Sem `--non-interactive`, o comando pergunta pelos valores ausentes, inclusive a
chave sem eco. Fora de um terminal interativo, `--api-key` é obrigatória e
`--workspace` também quando a chave alcança mais de um workspace. Repetir o
comando com o mesmo `--name` substitui aquele perfil.

| Parâmetro | Obrigatório | Uso |
| --- | --- | --- |
| `--api-key <chave>` | condicional | API key pessoal do ClickUp (`pk_...`). `--token` é um alias compatível. |
| `--name <nome>` | não | Nome legível do perfil, normalizado para kebab-case. O padrão é o username do ClickUp. |
| `--workspace <id>` | condicional | Workspace associado ao perfil. Obrigatório fora de um TTY quando a chave alcança vários. |
| `--non-interactive` | não | Recusa prompts e sai com `2` quando falta um valor. |

Exemplos:

```bash
clickupfy setup
```

```bash
clickupfy setup --name produto
```

```bash
clickupfy setup --name cliente-a --workspace 90070363783
```

```bash
clickupfy setup --api-key "$CLICKUP_API_KEY" --name automacao
```

```bash
clickupfy setup \
  --api-key "$CLICKUP_API_KEY" \
  --name produto \
  --workspace 90070363783 \
  --non-interactive \
  --json
```

Quando a API key for inválida, execute `whoami` para conferir a autenticação.
Quando o workspace informado não pertencer à chave, o comando sai com `6` e
lista os IDs disponíveis em `error.details.available`. Nunca escreva a chave
diretamente no histórico do shell; prefira uma variável de ambiente temporária
ou a entrada interativa.

### `clickupfy status`

Mostra o perfil resolvido, o caminho do `accounts.json`, se ele é o ativo, a
chave mascarada, o usuário e o workspace associado. O comando não chama a API
do ClickUp.

Em JSON, `data` traz `{ config, account, active, name, apiKey, user, workspace }`.
Use este comando como inspeção local, não como teste definitivo de uma chave
recém-revogada.

Exemplos:

```bash
clickupfy status
```

```bash
clickupfy status --json
```

```bash
clickupfy status --account produto
```

```bash
clickupfy --account cliente-a status --json
```

```bash
clickupfy status > /tmp/clickupfy-status.txt
```

O terceiro exemplo consulta o perfil `produto` sem alterar o perfil que será
usado pela próxima chamada sem `--account`. A redireção do último exemplo é
segura porque a saída mascara a chave, mas ainda pode conter nomes de pessoas e
de workspaces.

## Perfis locais

Um perfil é um conjunto local de API key, identidade autenticada e workspace
selecionado. Cada perfil tem um identificador, como `produto` ou `cliente-a`.
O identificador é usado com `--account` no CLI e pelo `--account` do servidor
MCP.

Os perfis ficam em `~/.clickupfy/accounts.json`, com `version`, `activeAccount`
e o mapa `accounts`. Esse arquivo não guarda segredo: a API key de cada perfil
fica no cofre. Por isso ele pode ser lido e copiado sem expor a chave.

### `clickupfy account list`

Lista todos os perfis e marca o ativo com `*`. Cada linha traz `id`, `active`,
`name`, `user`, `workspace` e `workspace_id`. Nenhuma API key aparece.
`clickupfy account ls` é o alias equivalente.

Exemplos:

```bash
clickupfy account list
```

```bash
clickupfy account ls
```

```bash
clickupfy account list --json
```

```bash
clickupfy account list --account produto
```

```bash
clickupfy account list | less
```

Mesmo com `--account`, a lista continua mostrando todos os perfis; a opção só
tem efeito quando uma ação precisa resolver uma conta. Em JSON, `data` traz
`{ accounts: [] }`. Use a tabela para conferir o identificador exato antes de
chamar `account show`, `account use` ou um comando de trabalho.

### `clickupfy account show [perfil]`

Exibe metadados seguros de um perfil, com a API key mascarada. Sem argumento,
resolve o perfil ativo ou o que foi indicado pela opção global `--account`.

| Parâmetro | Obrigatório | Uso |
| --- | --- | --- |
| `[perfil]` | não | Identificador local do perfil. |

Exemplos:

```bash
clickupfy account show
```

```bash
clickupfy account show produto
```

```bash
clickupfy account show --account cliente-a
```

```bash
clickupfy account show produto --json
```

```bash
clickupfy account show produto --account cliente-a
```

No último caso, a saída é do perfil `produto`, pois o argumento posicional tem
precedência sobre a opção global. Se o perfil não existir, o comando sai com `6`
sem iniciar uma requisição ao ClickUp.

### `clickupfy account use <perfil>`

Define o perfil ativo em `accounts.json`. É uma alteração local e não muda nada
no ClickUp. Evite usar este comando em automações ou quando dois projetos usam
contas diferentes ao mesmo tempo; nesses casos, informe `--account` em cada
chamada ou fixe o perfil no MCP de cada projeto.

| Parâmetro | Obrigatório | Uso |
| --- | --- | --- |
| `<perfil>` | sim | Identificador local já configurado. |

Exemplos:

```bash
clickupfy account use produto
```

```bash
clickupfy account use cliente-a
```

```bash
clickupfy account use homologacao
```

```bash
clickupfy account use suporte
```

```bash
clickupfy account use produto && clickupfy status
```

O último exemplo confirma a mudança persistida. Em JSON, `data` traz
`{ activeAccount }`. Quando o comando faz parte de um script, prefira não
depender do perfil ativo: `clickupfy --account produto ...` deixa o destino
explícito e não interfere no restante da máquina.

### `clickupfy account remove <perfil>`

Remove os metadados do perfil e a API key correspondente do cofre. Não revoga a
API key no ClickUp, não remove usuários e não exclui tarefas. Em terminal
interativo, pede confirmação; fora dele, `--yes` é obrigatório.

| Parâmetro | Obrigatório | Uso |
| --- | --- | --- |
| `<perfil>` | sim | Identificador local a remover. |
| `--yes` | não | Confirma sem interação. |

Exemplos:

```bash
clickupfy account remove conta-antiga
```

```bash
clickupfy account remove sandbox --yes
```

```bash
clickupfy account remove cliente-encerrado --yes
```

```bash
clickupfy account remove homologacao --yes
```

```bash
clickupfy account remove temporario --yes && clickupfy account list
```

Recusar a confirmação sai com `130`. Se você remover o perfil ativo, o ClickUpfy
torna ativo o primeiro perfil que sobrar ou deixa `activeAccount` como `null`
quando não houver outro. Leia `account list` após a remoção, especialmente em
uma máquina compartilhada.

### `clickupfy account import`

Importa os perfis do config do ClickUpfy 0.9.0 para o cofre cifrado. O comando
lê `PROMOVAWEB_CLICKUPFY_CONFIG` ou `~/clickupfy/config.json`, grava os
metadados em `accounts.json` e cada API key como `clickup.<perfil>.api_key`. O
arquivo antigo só é lido: ele não é alterado nem apagado, então o ClickUpfy
0.9.0 continua funcionando durante a transição.

A mesma importação roda automaticamente na primeira execução de um comando que
lê perfis, quando `accounts.json` ainda não existe e o config antigo está no
lugar. O stderr mostra `Imported N profile(s) from <caminho> into the vault.`
uma única vez.

| Parâmetro | Obrigatório | Uso |
| --- | --- | --- |
| `--force` | não | Substitui perfis que já existem em vez de pulá-los. |

Exemplos:

```bash
clickupfy account import
```

```bash
clickupfy account import --force
```

```bash
clickupfy account import --json
```

```bash
PROMOVAWEB_CLICKUPFY_CONFIG=/tmp/clickupfy-config.json clickupfy account import
```

```bash
clickupfy account import --force && clickupfy account list
```

Sem `--force`, os perfis que já existem são pulados e aparecem em `skipped`.
Em JSON, `data` traz `{ source, imported[], skipped[], activeAccount }`, sem
chaves. Config antigo inválido faz o comando sair com `3` e informar o caminho.

## Workspace e identidade autenticada

O perfil tem um workspace associado, mas uma API key pode ter permissão para
mais de um workspace. `workspace list` descobre as opções; `workspace use`
persiste a escolha no perfil; `whoami` consulta a API e confirma o usuário.

### `clickupfy workspace list`

Lista os workspaces que a API key do perfil consegue acessar. O marcador `*`
indica o workspace atualmente associado ao perfil. `workspace ls` é o alias.

Exemplos:

```bash
clickupfy workspace list
```

```bash
clickupfy workspace ls
```

```bash
clickupfy workspace list --account produto
```

```bash
clickupfy --account cliente-a workspace list --json
```

```bash
clickupfy workspace list | tee /tmp/workspaces.txt
```

Em JSON, `data` traz `{ workspaces: [] }`. O resultado autoritativo vem da API.
Caso o workspace esperado não apareça, verifique a permissão da API key no
ClickUp em vez de tentar adivinhar um ID.

### `clickupfy workspace use <workspace-id>`

Associa um workspace autorizado ao perfil resolvido. O comando consulta a API e
só salva o ID quando ele aparece na lista permitida, portanto um número copiado
de outro perfil é recusado com `6`.

| Parâmetro | Obrigatório | Uso |
| --- | --- | --- |
| `<workspace-id>` | sim | ID devolvido por `workspace list`. |

Exemplos:

```bash
clickupfy workspace use 90070363783
```

```bash
clickupfy workspace use 9007154145 --account cliente-a
```

```bash
clickupfy --account produto workspace use 90070363783
```

```bash
clickupfy workspace use 9007154145 && clickupfy status
```

```bash
clickupfy --account suporte workspace use 90070363783
```

A alteração afeta somente o perfil indicado. Um servidor MCP com `--workspace`
fixo ainda recusa um workspace diferente, mesmo que o perfil local seja alterado
depois.

### `clickupfy whoami`

Valida a API key em uma chamada ao ClickUp e devolve o usuário autenticado junto
do perfil e do workspace resolvidos. Em JSON, `data` traz `{ account, user }`.
Use o comando depois de `setup`, após uma troca de chave ou ao investigar erro
de autorização.

Exemplos:

```bash
clickupfy whoami
```

```bash
clickupfy whoami --json
```

```bash
clickupfy whoami --account produto
```

```bash
clickupfy --account cliente-a whoami --json
```

```bash
clickupfy whoami && clickupfy workspace list
```

Uma resposta de `status` não substitui este teste: ela lê a configuração local.
`whoami` é a chamada que confirma se a chave ainda funciona no serviço remoto.

## Descoberta da hierarquia

O ClickUp organiza trabalho em workspace, Space, Folder e List. Uma List pode
existir diretamente dentro de um Space, sem Folder. IDs não são intercambiáveis:
um `space-id` não serve no lugar de um `folder-id`, por exemplo. Comece no
workspace selecionado e preserve os IDs retornados em um local seguro.

Em texto, as listagens saem como tabela. Com `--json`, cada uma vem dentro de um
objeto, como `{ "spaces": [] }`, `{ "folders": [] }` ou `{ "lists": [] }`.

### `clickupfy space list`

Lista Spaces do workspace associado ao perfil. `--archived` acrescenta Spaces
arquivados; sem a opção, o resultado contém apenas os ativos.

| Parâmetro | Obrigatório | Uso |
| --- | --- | --- |
| `--archived` | não | Inclui Spaces arquivados. |

Exemplos:

```bash
clickupfy space list
```

```bash
clickupfy space ls
```

```bash
clickupfy space list --archived
```

```bash
clickupfy space list --account produto --json
```

```bash
clickupfy --account cliente-a space list --archived
```

Escolha o Space pelo ID e pelo nome retornados, não pela posição da linha.
Spaces arquivados podem ser úteis em migração ou consulta histórica, mas não
devem ser usados como destino de novas tarefas sem autorização explícita.

### `clickupfy folder list --space <id>`

Lista Folders de um Space. O parâmetro `--space` é obrigatório no CLI; o comando
não usa um Space implícito porque um perfil pode operar em vários projetos.

| Parâmetro | Obrigatório | Uso |
| --- | --- | --- |
| `--space <id>` | sim | ID do Space retornado por `space list`. |
| `--archived` | não | Inclui Folders arquivados. |

Exemplos:

```bash
clickupfy folder list --space 90070363783
```

```bash
clickupfy folder ls --space 90070363783
```

```bash
clickupfy folder list --space 90070363783 --archived
```

```bash
clickupfy folder list --space 90070363783 --account produto --json
```

```bash
clickupfy --account cliente-a folder list --space 9007154145 --archived
```

Uma resposta vazia não significa necessariamente falta de acesso: o Space pode
guardar Lists diretamente. Execute `list list --space <id>` para cobrir esse
ramo da hierarquia.

### `clickupfy list list --folder <id> | --space <id>`

Lista Lists dentro de um Folder ou Lists que pertencem diretamente a um Space.
Informe uma das duas opções. Quando as duas aparecem, `--folder` tem precedência
e o Space não é enviado à API. Sem nenhuma delas, o comando sai com `2`.

| Parâmetro | Obrigatório | Uso |
| --- | --- | --- |
| `--folder <id>` | condicional | ID do Folder que contém as Lists. |
| `--space <id>` | condicional | ID do Space para Lists sem Folder. |
| `--archived` | não | Inclui Lists arquivadas. |

Exemplos:

```bash
clickupfy list list --folder 2001
```

```bash
clickupfy list ls --folder 2001
```

```bash
clickupfy list list --folder 2001 --archived
```

```bash
clickupfy list list --space 90070363783
```

```bash
clickupfy --account produto list list --space 90070363783 --archived --json
```

Consulte cada List pelo comando seguinte para obter os status configurados. Em
projetos com MCP, o ID da List escolhido aqui será o valor obrigatório de
`agent install --list` ou de `mcp serve --list`.

### `clickupfy list get <list-id>`

Obtém a List e os status aceitos pelas tarefas dela. A grafia retornada para um
status é a mesma que deve aparecer em `task create --status` e
`task update --status`; não use uma tradução ou suposição local.

| Parâmetro | Obrigatório | Uso |
| --- | --- | --- |
| `<list-id>` | sim | ID da List retornado por `list list`. |

Exemplos:

```bash
clickupfy list get 901328052926
```

```bash
clickupfy list get 901328052926 --json
```

```bash
clickupfy list get 901328052926 --account produto
```

```bash
clickupfy --account cliente-a list get 901328060001 --json
```

```bash
clickupfy list get 901328052926 --json > /tmp/list-901328052926.json
```

O `data` do `--json` traz a List da API com `statuses[]`. O último exemplo
guarda o objeto para outro programa; a tabela compacta é adequada para leitura,
mas não é uma API estável de máquina. Continue em
[tarefas e checklists](referencia-cli-tarefas.md) para usar os status e IDs
encontrados aqui.
