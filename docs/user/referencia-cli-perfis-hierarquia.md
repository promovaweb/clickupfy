# Referência do CLI: perfis, autenticação e hierarquia

## Classificação

| Campo | Valor |
| --- | --- |
| Natureza | referência |
| Escopo | comandos globais, perfis locais, autenticação e descoberta da hierarquia do ClickUp |
| Autoridade | `src/cli.ts`, `src/config.ts`, `src/context.ts` e ajuda da versão instalada |

Este capítulo descreve cada comando que prepara uma sessão de trabalho e
localiza os IDs usados pelos demais capítulos. Os exemplos usam IDs fictícios.
Substitua somente os valores entre colchetes ou os números de exemplo. Nunca
cole uma API key em arquivo versionado, conversa pública, comentário de tarefa
ou captura de tela.

## Opções globais

Todas as ações, exceto a configuração inicial, podem receber estas opções
imediatamente depois de `clickupfy`:

| Opção                | Tipo     | Efeito                                                                  |
| -------------------- | -------- | ----------------------------------------------------------------------- |
| `--account <perfil>` | texto    | Seleciona um perfil para esta execução sem trocar o perfil ativo.       |
| `--json`             | booleano | Imprime o payload completo em JSON, adequado para automação e inspeção. |

O perfil ativo só muda com `account use`. A ordem importa: escreva
`clickupfy --account cliente-a task list`, e não coloque `--account` depois do
subcomando.

### `clickupfy upgrade`

Atualiza a instalação global do ClickUpfy pelo npm e relê o launcher global
depois da instalação. Sem alvo, instala `@promovaweb/clickupfy@latest`.

| Parâmetro | Obrigatório | Uso |
| --- | --- | --- |
| `[alvo]` | não | `latest`, `next` ou uma versão SemVer, como `0.5.0`. `latest` é o padrão. |

O comando instala a nova versão com `npm install --global`, sem alterar a
configuração de accounts, e confirma a versão retornada pelo launcher global.
Ele exige o npm disponível no `PATH` e permissões para alterar o prefixo global.
Não substitui executáveis standalone baixados da GitHub Release.

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
clickupfy upgrade 0.5.0
```

```bash
clickupfy upgrade v0.5.0
```

O quinto exemplo normaliza o prefixo `v` antes de chamar o npm. Se o npm falhar
ou o launcher não retornar uma versão SemVer, o comando encerra com erro e não
declara a atualização como concluída.

### `clickupfy doctor`

Verifica o setup local sem fazer chamadas à API do ClickUp. O diagnóstico
confere o caminho `~/clickupfy/config.json` ou o caminho definido por
`PROMOVAWEB_CLICKUPFY_CONFIG`, as permissões `0700` do diretório e `0600` do
arquivo, o JSON, o schema, os accounts e o account ativo. Quando executado na
raiz de um projeto, também verifica o gerenciador `skills`, as quatro skills do
ClickUpfy, o idioma dos arquivos instalados e lê `.mcp.json` e
`.codex/config.toml` se existirem. API keys nunca aparecem na saída.

Os arquivos de projeto são opcionais. A ausência deles gera `skipped` porque o
MCP só é necessário quando o projeto usa agentes. Um arquivo presente, mas
inválido, gera `error`. O comando retorna código `1` quando existe uma
verificação com erro. `warning` e `skipped` não reprovam o diagnóstico.
Se o gerenciador `skills` não estiver instalado, ou se uma skill instalada
estiver fora do padrão de português do Brasil, o diagnóstico registra essa
situação para correção.

Exemplos:

```bash
clickupfy doctor
```

```bash
clickupfy --json doctor
```

```bash
PROMOVAWEB_CLICKUPFY_CONFIG=/tmp/clickupfy-config.json clickupfy doctor
```

```bash
cd ~/projetos/produto && clickupfy doctor
```

```bash
clickupfy --json doctor | jq '.checks[] | select(.estado == "error")'
```

O diagnóstico confirma a configuração local e os arquivos usados pelos
agentes, mas não testa se a API key continua válida no ClickUp. Para essa
verificação remota, use `clickupfy whoami`.

### `clickupfy install`

Cria ou atualiza um perfil local e associa a API key a um workspace autorizado.
Sem `--non-interactive`, o comando pergunta pelos valores ausentes. A API key
fica no arquivo de configuração do usuário, cujo caminho aparece em `status`;
ela não vai para o `.mcp.json` nem para o `.codex/config.toml` do projeto.

| Parâmetro           | Obrigatório | Uso                                                             |
| ------------------- | ----------- | --------------------------------------------------------------- |
| `--api-key <chave>` | não         | API key pessoal do ClickUp. `--token` é um alias compatível.    |
| `--name <nome>`     | não         | Nome legível do perfil local.                                   |
| `--workspace <id>`  | não         | Workspace que será associado ao perfil.                         |
| `--non-interactive` | não         | Recusa prompts; use junto dos dados necessários para automação. |

Exemplos:

```bash
clickupfy install
```

```bash
clickupfy install --name "Produto"
```

```bash
clickupfy install --name "Cliente A" --workspace 123456
```

```bash
clickupfy install --api-key "$CLICKUP_API_KEY" --name "Automação"
```

```bash
clickupfy install \
  --api-key "$CLICKUP_API_KEY" \
  --name "Produto" \
  --workspace 123456 \
  --non-interactive
```

Quando a API key for inválida, execute `whoami` para conferir a autenticação.
Quando o workspace informado não pertencer à chave, selecione um workspace da
lista devolvida pelo ClickUp. O comando nunca deve aparecer em histórico de
shell com uma chave escrita diretamente; prefira uma variável de ambiente
temporária ou a entrada interativa.

### `clickupfy status`

Mostra o caminho de configuração, o perfil resolvido, se ele está ativo, o
usuário e o workspace associado. A chave aparece mascarada. Use este comando
como inspeção local, não como teste definitivo de uma chave recém-revogada.

Exemplos:

```bash
clickupfy status
```

```bash
clickupfy --json status
```

```bash
clickupfy --account produto status
```

```bash
clickupfy --account cliente-a --json status
```

```bash
clickupfy status > /tmp/clickupfy-status.txt
```

O quarto exemplo consulta o perfil `cliente-a` sem alterar o perfil que será
usado pela próxima chamada sem `--account`. A redireção do último exemplo é
segura porque a saída mascara a chave, mas ainda pode conter nomes de pessoas e
workspaces.

## Perfis locais

Um perfil é um conjunto local de API key, identidade autenticada e workspace
selecionado. Cada perfil tem um identificador, como `produto` ou `cliente-a`.
O identificador é usado com `--account` e pelo `--account` do servidor MCP.

### `clickupfy account list`

Lista todos os perfis e marca o perfil ativo com `*`. Não revela API keys.
`clickupfy account ls` é o alias equivalente.

Exemplos:

```bash
clickupfy account list
```

```bash
clickupfy account ls
```

```bash
clickupfy --json account list
```

```bash
clickupfy --account produto account list
```

```bash
clickupfy account list | less
```

Mesmo com `--account`, a lista continua mostrando todos os perfis; a opção só
tem efeito quando uma ação precisa resolver uma conta. Use a tabela para
conferir o identificador exato antes de chamar `account show`, `account use` ou
um comando de trabalho.

### `clickupfy account show [perfil]`

Exibe metadados seguros de um perfil. Sem argumento, resolve o perfil ativo ou
o que foi indicado pela opção global `--account`. O argumento posicional tem
precedência sobre a opção global quando os dois aparecem.

| Parâmetro  | Obrigatório | Uso                            |
| ---------- | ----------- | ------------------------------ |
| `[perfil]` | não         | Identificador local do perfil. |

Exemplos:

```bash
clickupfy account show
```

```bash
clickupfy account show produto
```

```bash
clickupfy --account cliente-a account show
```

```bash
clickupfy --json account show produto
```

```bash
clickupfy --account cliente-a account show produto
```

No último caso, a saída é do perfil `produto`, pois o argumento posicional foi
informado. Se o perfil não existir, o CLI interrompe a chamada sem iniciar uma
requisição ao ClickUp.

### `clickupfy account use <perfil>`

Define o perfil ativo no arquivo de configuração. É uma alteração local e não
muda nada no ClickUp. Evite usar este comando em automações ou quando dois
projetos usam contas diferentes ao mesmo tempo; nesses casos, informe
`--account` em cada chamada ou fixe o perfil no MCP de cada projeto.

| Parâmetro  | Obrigatório | Uso                                 |
| ---------- | ----------- | ----------------------------------- |
| `<perfil>` | sim         | Identificador local já configurado. |

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

O último exemplo confirma a mudança persistida. Quando o comando faz parte de
um script, prefira não depender do perfil ativo: `clickupfy --account produto
...` deixa o destino explícito e não interfere no restante da máquina.

### `clickupfy account remove <perfil>`

Remove somente o perfil local. Não revoga a API key no ClickUp, não remove
usuários e não exclui tarefas. Em terminal interativo, pede confirmação. Em
automação, `--yes` confirma a remoção sem prompt.

| Parâmetro  | Obrigatório | Uso                            |
| ---------- | ----------- | ------------------------------ |
| `<perfil>` | sim         | Identificador local a remover. |
| `--yes`    | não         | Confirma sem interação.        |

Exemplos:

```bash
clickupfy account remove conta-antiga
```

```bash
clickupfy account remove sandbox --yes
```

```bash
clickupfy account remove cliente-encerrado
```

```bash
clickupfy account remove homologacao --yes
```

```bash
clickupfy account remove temporario --yes && clickupfy account list
```

Se você remover o perfil ativo, o ClickUpfy torna ativo o primeiro perfil que
sobrar ou deixa a configuração sem perfil ativo quando não houver outro. Leia
`account list` após a remoção, especialmente em uma máquina compartilhada.

## Workspace e identidade autenticada

O perfil tem um workspace associado, mas uma API key pode ter permissão para
mais de um workspace. `workspace list` descobre as opções; `workspace use`
persiste a escolha no perfil; `whoami` consulta a API e confirma o usuário.

### `clickupfy workspace list`

Lista os workspaces que a API key do perfil consegue acessar. O marcador `*`
indica o workspace atualmente associado ao perfil. `workspace ls` é um alias.

Exemplos:

```bash
clickupfy workspace list
```

```bash
clickupfy workspace ls
```

```bash
clickupfy --account produto workspace list
```

```bash
clickupfy --account cliente-a --json workspace list
```

```bash
clickupfy workspace list | tee /tmp/workspaces.txt
```

O resultado autoritativo vem da API. Caso o workspace esperado não apareça,
verifique a permissão da API key no ClickUp em vez de tentar adivinhar um ID.

### `clickupfy workspace use <workspace-id>`

Associa um workspace autorizado ao perfil resolvido. O CLI consulta a API e só
salva o ID quando ele aparece na lista permitida, portanto um número copiado de
outro perfil é recusado.

| Parâmetro        | Obrigatório | Uso                                |
| ---------------- | ----------- | ---------------------------------- |
| `<workspace-id>` | sim         | ID devolvido por `workspace list`. |

Exemplos:

```bash
clickupfy workspace use 123456
```

```bash
clickupfy --account cliente-a workspace use 987654
```

```bash
clickupfy --account produto workspace use 123456
```

```bash
clickupfy workspace use 654321 && clickupfy status
```

```bash
clickupfy --account suporte workspace use 246810
```

A alteração afeta o perfil indicado, não todos os perfis. Um servidor MCP com
`--workspace` fixo ainda recusará um workspace diferente, mesmo que o perfil
local seja alterado depois.

### `clickupfy whoami`

Valida a API key em uma chamada ao ClickUp e devolve o usuário autenticado
junto do perfil e do workspace resolvidos. Use-o depois de `setup`, após uma
troca de chave ou ao investigar erro de autorização.

Exemplos:

```bash
clickupfy whoami
```

```bash
clickupfy --json whoami
```

```bash
clickupfy --account produto whoami
```

```bash
clickupfy --account cliente-a --json whoami
```

```bash
clickupfy whoami && clickupfy workspace list
```

Uma resposta de `status` não substitui este teste: ela lê a configuração local.
`whoami` é a chamada que confirma se a chave ainda funciona no serviço remoto.

## Descoberta da hierarquia

O ClickUp organiza trabalho em workspace, Space, Folder e List. Uma List pode
existir diretamente dentro de um Space, sem Folder. IDs não são intercambiáveis:
um `space-id` não serve no lugar de `folder-id`, por exemplo. Comece no
workspace selecionado e preserve os IDs retornados em um local seguro.

### `clickupfy space list`

Lista Spaces do workspace associado ao perfil. `--archived` acrescenta Spaces
arquivados; sem a opção, o resultado contém apenas os ativos.

| Parâmetro    | Obrigatório | Uso                       |
| ------------ | ----------- | ------------------------- |
| `--archived` | não         | Inclui Spaces arquivados. |

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
clickupfy --account produto --json space list
```

```bash
clickupfy --account cliente-a space list --archived
```

Escolha o Space pelo ID e pelo nome retornados, não pela posição da linha.
Spaces arquivados podem ser úteis em migração ou consulta histórica, mas não
devem ser usados como destino de novas tarefas sem autorização explícita.

### `clickupfy folder list --space <id>`

Lista Folders de um Space. O parâmetro `--space` é obrigatório; o CLI não usa
um Space implícito porque um perfil pode operar em vários projetos.

| Parâmetro      | Obrigatório | Uso                                     |
| -------------- | ----------- | --------------------------------------- |
| `--space <id>` | sim         | ID do Space retornado por `space list`. |
| `--archived`   | não         | Inclui Folders arquivados.              |

Exemplos:

```bash
clickupfy folder list --space 1001
```

```bash
clickupfy folder ls --space 1001
```

```bash
clickupfy folder list --space 1001 --archived
```

```bash
clickupfy --account produto --json folder list --space 1001
```

```bash
clickupfy --account cliente-a folder list --space 2001 --archived
```

Uma resposta vazia não significa necessariamente falta de acesso: o Space pode
guardar Lists diretamente. Execute `list list --space <id>` para cobrir esse
ramo da hierarquia.

### `clickupfy list list --folder <id> | --space <id>`

Lista Lists dentro de um Folder ou Lists que pertencem diretamente a um Space.
Informe uma das duas opções. O CLI exige pelo menos uma; quando ambas forem
fornecidas, a chamada deve apontar para o nível real que você pretende ler,
mantendo um único destino por consulta.

| Parâmetro       | Obrigatório | Uso                                |
| --------------- | ----------- | ---------------------------------- |
| `--folder <id>` | condicional | ID do Folder que contém as Lists.  |
| `--space <id>`  | condicional | ID do Space para Lists sem Folder. |
| `--archived`    | não         | Inclui Lists arquivadas.           |

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
clickupfy list list --space 1001
```

```bash
clickupfy --account produto --json list list --space 1001 --archived
```

Consulte cada List pelo comando seguinte para obter os status configurados.
Em projetos com MCP, o ID da List escolhido aqui será o valor obrigatório de
`agent install --list` ou de `mcp serve --list`.

### `clickupfy list get <list-id>`

Obtém a List e os status aceitos pelas tarefas dela. A grafia retornada para um
status é a mesma que deve aparecer em `task create --status` e
`task update --status`; não use uma tradução ou suposição local.

| Parâmetro   | Obrigatório | Uso                                   |
| ----------- | ----------- | ------------------------------------- |
| `<list-id>` | sim         | ID da List retornado por `list list`. |

Exemplos:

```bash
clickupfy list get 3001
```

```bash
clickupfy --json list get 3001
```

```bash
clickupfy --account produto list get 3001
```

```bash
clickupfy --account cliente-a --json list get 4001
```

```bash
clickupfy list get 3001 > /tmp/list-3001.json
```

O último exemplo deve incluir `--json` quando o arquivo for consumido por outro
programa. A tabela compacta é adequada para leitura, mas não é uma API estável
de máquina. Continue em [tarefas e checklists](tarefas.md) para usar os status
e IDs encontrados aqui.
