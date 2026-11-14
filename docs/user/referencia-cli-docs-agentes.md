# Referência do CLI: Docs, skills e servidor MCP

## Classificação

| Campo | Valor |
| --- | --- |
| Natureza | referência |
| Escopo | comandos de Docs do ClickUp, skills distribuídas, inicialização de projeto e servidor MCP |
| Autoridade | `src/operations/cli.ts`, `src/clickup/docs.ts`, `src/agent/skills.ts`, `src/mcp/setup.ts` e a ajuda da versão instalada |

Os Docs do ClickUp pertencem ao workspace do perfil. Eles não usam a List,
Space ou Folder fixados pelo MCP, porque a API de Docs trabalha em outro ramo da
plataforma. Os IDs abaixo são fictícios. Use `doc list`, `doc get` e
`doc page tree` para descobrir IDs reais antes de criar ou alterar conteúdo.

O conteúdo das páginas sai em Markdown (`text/md`, o padrão) ou em texto puro com
`--content-format text/plain`. Em `doc page create` e `doc page update`, o
conteúdo entra por `--content <texto>`, por um arquivo com `--file <caminho>` ou
pelo `stdin` com `--file -`. `--content` e `--file` juntos saem com `2`.

## Docs

### `clickupfy doc list`

Busca Docs no workspace associado ao perfil, seguindo o cursor da API.
`--max-pages` controla quantas páginas de cursor são lidas e aceita inteiros de
`1` a `50`; o padrão é `50`.

| Parâmetro | Obrigatório | Uso |
| --- | --- | --- |
| `--query <texto>` | não | Filtro pelo nome ou ID do Doc. |
| `--parent-id <id>` | não | Local pai do Doc. |
| `--parent-type <n>` | não | `4` Space, `5` Folder, `6` List, `7` Everything, `12` tarefa. |
| `--deleted` | não | Inclui Docs excluídos. |
| `--archived` | não | Inclui Docs arquivados. |
| `--creator <id>` | não | ID numérico da pessoa criadora. |
| `--max-pages <n>` | não | Cursor de `1` a `50`; padrão `50`. |

Exemplos:

```bash
clickupfy doc list
```

```bash
clickupfy doc list --query "API"
```

```bash
clickupfy doc list --parent-id 901328052926 --parent-type 6
```

```bash
clickupfy doc list --archived --deleted --creator 42 --max-pages 10
```

```bash
clickupfy doc list --query "Manual" --max-pages 5 --account produto --json
```

`--parent-type` sem `--parent-id` não cria uma consulta útil, pois não há local
para classificar. Com `--json`, `data` traz `{ docs: [] }`, com os metadados
necessários para chamar `doc get` ou navegar pelas páginas.

### `clickupfy doc get <doc-id>`

Obtém os metadados de um Doc no workspace atual. O comando não devolve o conteúdo
das páginas; use `doc page list` para o conteúdo completo ou `doc page get` para
uma página determinada.

Exemplos:

```bash
clickupfy doc get 8cdu8-123
```

```bash
clickupfy doc get 8cdu8-123 --json
```

```bash
clickupfy doc get 8cdu8-123 --account produto
```

```bash
clickupfy doc get 8cdu8-456 --account cliente-a --json
```

```bash
clickupfy doc get 8cdu8-123 --json > /tmp/doc-8cdu8-123.json
```

O último exemplo guarda o objeto completo. Para processamento por outro
programa, use `--json` e trate o conteúdo do workspace como informação interna.
Doc inexistente sai com `6`.

### `clickupfy doc create --name <nome>`

Cria um Doc no workspace. Quando `--parent-id` é informado, `--parent-type` é
obrigatório. Os tipos são `4` Space, `5` Folder, `6` List, `7` Everything e `12`
tarefa. `--visibility` aceita `PRIVATE` ou `PUBLIC`; `--create-page` cria a
primeira página em branco.

| Parâmetro | Obrigatório | Uso |
| --- | --- | --- |
| `--name <nome>` | sim | Nome do Doc. |
| `--parent-id <id>` | não | Local onde o Doc será criado. |
| `--parent-type <n>` | condicional | Tipo do local quando há `--parent-id`. |
| `--visibility <valor>` | não | Visibilidade, `PRIVATE` ou `PUBLIC`. |
| `--create-page` | não | Cria uma primeira página vazia. |

Exemplos:

```bash
clickupfy doc create --name "Manual da API"
```

```bash
clickupfy doc create --name "Guia do produto" --create-page
```

```bash
clickupfy doc create --name "Notas da List" --parent-id 901328052926 --parent-type 6
```

```bash
clickupfy doc create --name "Documento interno" --parent-id 2001 --parent-type 5 --visibility PRIVATE
```

```bash
clickupfy doc create --name "Plano de release" --parent-id 86abc123 --parent-type 12 --create-page --account produto --json
```

Uma criação bem-sucedida devolve o Doc com o novo ID. Releia seus metadados e
crie as páginas pelo grupo `doc page`. A API pública usada pelo ClickUpfy não
expõe exclusão de Docs, mudança de permissões ou reordenação da árvore.

### `clickupfy doc page tree <doc-id>`

Mostra somente a árvore de páginas, sem o corpo, indentada no terminal. É a
leitura mais econômica para descobrir um `page-id` e a relação pai-filho antes de
criar uma subpágina ou atualizar conteúdo.

Exemplos:

```bash
clickupfy doc page tree 8cdu8-123
```

```bash
clickupfy doc page tree 8cdu8-123 --json
```

```bash
clickupfy doc page tree 8cdu8-123 --account produto
```

```bash
clickupfy doc page tree 8cdu8-456 --account cliente-a --json
```

```bash
clickupfy doc page tree 8cdu8-123 > /tmp/doc-8cdu8-123-tree.txt
```

Com `--json`, `data` traz `{ pages: [] }` com as páginas aninhadas. O retorno não
é cópia de segurança do conteúdo. Use `doc page list` quando o objetivo for ler
todas as páginas em Markdown.

### `clickupfy doc page list <doc-id>`

Lista as páginas com conteúdo. `--max-page-depth` limita a profundidade de
subpáginas retornada. `--content-format` aceita `text/md`, o padrão, ou
`text/plain` para texto sem a representação Markdown da API.

| Parâmetro | Obrigatório | Uso |
| --- | --- | --- |
| `<doc-id>` | sim | Doc cujas páginas serão lidas. |
| `--max-page-depth <n>` | não | Profundidade máxima de subpáginas. |
| `--content-format <valor>` | não | `text/md` ou `text/plain`. |

Exemplos:

```bash
clickupfy doc page list 8cdu8-123
```

```bash
clickupfy doc page ls 8cdu8-123 --max-page-depth 1
```

```bash
clickupfy doc page list 8cdu8-123 --max-page-depth 3
```

```bash
clickupfy doc page list 8cdu8-123 --content-format text/plain
```

```bash
clickupfy doc page list 8cdu8-123 --content-format text/md --account produto --json
```

Use uma profundidade pequena quando só precisa dos capítulos principais. Para uma
página conhecida, `doc page get` reduz a resposta e evita transmitir o conteúdo
de outras páginas a um agente.

### `clickupfy doc page get <doc-id> <page-id>`

Obtém uma página específica e seu conteúdo. Em modo texto, o comando imprime
somente o conteúdo. `--content-format` tem os mesmos valores de `doc page list`:
`text/md` por padrão e `text/plain` como opção.

Exemplos:

```bash
clickupfy doc page get 8cdu8-123 8cdu8-456
```

```bash
clickupfy doc page get 8cdu8-123 8cdu8-456 --content-format text/plain
```

```bash
clickupfy doc page get 8cdu8-123 8cdu8-456 --json
```

```bash
clickupfy doc page get 8cdu8-123 8cdu8-789 --content-format text/md --account produto
```

```bash
clickupfy doc page get 8cdu8-456 8cdu8-999 --account cliente-a --json
```

O ID da página deve pertencer ao Doc informado. Localize-o com `doc page tree` ou
`doc page list`, não com tentativa e erro. Página inexistente sai com `6`.

### `clickupfy doc page create <doc-id> --name <nome>`

Cria página ou subpágina em um Doc. `--parent-page` indica uma página pai;
`--orderindex` escolhe a posição entre páginas irmãs. O conteúdo inicial e o
subtítulo são opcionais. Não use `--orderindex` como substituto de uma revisão da
árvore existente: leia a árvore antes de inserir conteúdo.

| Parâmetro | Obrigatório | Uso |
| --- | --- | --- |
| `<doc-id>` | sim | Doc proprietário. |
| `--name <nome>` | sim | Título da página. |
| `--content <texto>` | não | Conteúdo inicial. |
| `--file <caminho>` | não | Lê o conteúdo de um arquivo; use `-` para o stdin. Substitui `--content`. |
| `--sub-title <texto>` | não | Subtítulo. |
| `--parent-page <id>` | não | Página pai de uma subpágina. |
| `--orderindex <n>` | não | Posição entre páginas irmãs. |
| `--content-format <valor>` | não | `text/md` ou `text/plain`. |

Exemplos:

```bash
clickupfy doc page create 8cdu8-123 --name "Introdução"
```

```bash
clickupfy doc page create 8cdu8-123 --name "Autenticação" --content "Use uma API key pessoal."
```

```bash
clickupfy doc page create 8cdu8-123 --name "Plano" --file plan.md
```

```bash
clickupfy doc page create 8cdu8-123 --name "Erros" --parent-page 8cdu8-456 --orderindex 2
```

```bash
clickupfy doc page create 8cdu8-123 --name "Integração" --content "# MCP" --content-format text/md --account produto --json
```

Leia a página criada com `doc page get` e a árvore com `doc page tree` para
confirmar conteúdo e posição. A criação não atualiza outras páginas nem cria um
Doc novo.

### `clickupfy doc page update <doc-id> <page-id>`

Atualiza título, subtítulo e/ou conteúdo de uma página. Pelo menos um campo é
necessário, senão o comando sai com `2`. `--content-edit-mode` controla o
conteúdo: `replace` substitui, `append` acrescenta ao fim e `prepend` insere no
começo. Sem a opção, o modo é `replace`.

| Parâmetro | Obrigatório | Uso |
| --- | --- | --- |
| `<doc-id>`, `<page-id>` | sim | Doc e página a atualizar. |
| `--name <nome>` | não | Novo título. |
| `--sub-title <texto>` | não | Novo subtítulo. |
| `--content <texto>` | não | Novo conteúdo. |
| `--file <caminho>` | não | Lê o conteúdo de um arquivo; use `-` para o stdin. Substitui `--content`. |
| `--content-edit-mode <modo>` | não | `replace`, `append` ou `prepend`. |
| `--content-format <valor>` | não | `text/md` ou `text/plain`. |

Exemplos:

```bash
clickupfy doc page update 8cdu8-123 8cdu8-456 --name "Visão geral"
```

```bash
clickupfy doc page update 8cdu8-123 8cdu8-456 --sub-title "Instalação e configuração"
```

```bash
clickupfy doc page update 8cdu8-123 8cdu8-456 --content "# Novo conteúdo"
```

```bash
clickupfy doc page update 8cdu8-123 8cdu8-456 --content "\n## Changelog" --content-edit-mode append
```

```bash
clickupfy doc page update 8cdu8-123 8cdu8-789 --content "# Aviso\n\n" --content-edit-mode prepend --content-format text/md --account produto --json
```

Leia a página depois da escrita para confirmar o modo aplicado. Também é possível
enviar o conteúdo pelo stdin:

```bash
cat log.md | clickupfy doc page update 8cdu8-123 8cdu8-456 --file - --content-edit-mode append
```

A API pública usada pelo ClickUpfy não oferece exclusão de página nem
movimentação na árvore.

## Skills e projeto de agente

### `clickupfy agent skill list`

Lista as skills embutidas no binário: `clickupfy-setup`, `clickupfy-dev`,
`clickup-issue-create`, `clickup-issue-implement` e `clickupfy-release`. O comando
não instala nada e não precisa de perfil configurado. Com `--json`, `data` traz
`{ skills: [] }` com `name` e `description`.

Exemplos:

```bash
clickupfy agent skill list
```

```bash
clickupfy agent skill list | sort
```

```bash
clickupfy agent skill list > /tmp/clickupfy-skills.txt
```

```bash
clickupfy agent skill list | wc -l
```

```bash
clickupfy agent skill list && clickupfy agent skill show clickupfy-dev
```

O catálogo é incorporado ao binário em tempo de build. `list` não verifica se uma
skill já está instalada no projeto; ele mostra o que a versão instalada do
ClickUpfy pode distribuir. As instruções e os metadados distribuídos estão em
português do Brasil.

### `clickupfy agent skill show <skill>`

Imprime o `SKILL.md` de uma skill embutida. Use o comando para revisar instruções
e permissões antes da instalação. O argumento precisa ser um dos cinco nomes do
catálogo. Com `--json`, `data` traz `{ name, content }`.

Exemplos:

```bash
clickupfy agent skill show clickupfy-dev
```

```bash
clickupfy agent skill show clickupfy-setup
```

```bash
clickupfy agent skill show clickup-issue-create
```

```bash
clickupfy agent skill show clickupfy-release
```

```bash
clickupfy agent skill show clickupfy-dev > /tmp/clickupfy-dev-skill.md
```

Uma skill desconhecida é recusada com `2`. O comando só lê o asset distribuído;
ele não abre uma cópia local já instalada, que pode ter sido alterada pelo
projeto.

### `clickupfy agent skill install [skills...]`

Instala todas as skills quando nenhum nome é informado, ou somente as skills
posicionais escolhidas, chamando `npx skills add promovaweb/clickupfy`. Sem
`--global`, o destino é o catálogo de skills do projeto atual. O gerenciador
atualiza o `skills-lock.json`. `--global` instala no catálogo do usuário.

O comando roda `npx --yes skills add promovaweb/clickupfy --yes --copy --agent
codex --skill <nome>...` e confere o resultado com `npx skills list --json`.
`--force` existe apenas por compatibilidade com o 0.9.0, porque o comando
permite reinstalar sem essa opção.

| Parâmetro | Obrigatório | Uso |
| --- | --- | --- |
| `[skills...]` | não | Uma ou mais skills do catálogo. |
| `--global` | não | Instala no catálogo global do usuário. |
| `--force` | não | Mantido por compatibilidade. |

Exemplos:

```bash
clickupfy agent skill install
```

```bash
clickupfy agent skill install clickupfy-dev
```

```bash
clickupfy agent skill install clickup-issue-create clickup-issue-implement
```

```bash
clickupfy agent skill install --global clickupfy-dev
```

```bash
clickupfy agent skill install clickupfy-release --force
```

Skill desconhecida sai com `6`. Falha do `npx skills` ou `npx` ausente do `PATH`
sai com `1`. Os caminhos canônicos pertencem ao gerenciador `npx skills`, por
isso o ClickUpfy não aceita um `--target` próprio. Revise a fonte com
`agent skill show` e consulte `npx skills list` antes de atualizar as
instruções de um projeto.

### `clickupfy agent install`

Instala todas as skills e grava um servidor `promovaweb-clickupfy` no `.mcp.json`
e no `.codex/config.toml` do projeto atual. `--space` e `--list` são
obrigatórias. `clickupfy agent init` é um alias compatível.

A entrada usa `mcp serve --account <perfil> --space <id> --list <id>` e
acrescenta os IDs opcionais informados. Os arquivos recebem só o identificador
do perfil, sem a API key. Uma entrada `promovaweb-clickupfy` já
existente é substituída e as demais configurações são preservadas.

| Parâmetro | Obrigatório | Uso |
| --- | --- | --- |
| `--global` | não | Instala as skills globalmente. |
| `--workspace <id>` | não | Workspace esperado pelo MCP; precisa ser o do perfil. |
| `--space <id>` | sim | Space fixado para o projeto. |
| `--folder <id>` | não | Folder fixado. |
| `--list <id>` | sim | List fixa do projeto. |
| `--sprint-folder <id>` | não | Sprint Folder do projeto. |
| `--force` | não | Mantido por compatibilidade; as skills existentes são atualizadas. |

Exemplos:

```bash
clickupfy agent install --space 90070363783 --list 901328052926
```

```bash
clickupfy agent install --space 90070363783 --folder 2001 --list 901328052926 --account produto
```

```bash
clickupfy agent install --space 90070363783 --list 901328052926 --sprint-folder 4001
```

```bash
clickupfy agent install --global --space 90070363783 --list 901328052926 --force
```

```bash
clickupfy agent init --account cliente-a --workspace 9007154145 --space 901328060001 --list 901328060002 --sprint-folder 4002 --force
```

O `data` do `--json` traz `{ account, name, args, skills, files }`. Falta de
`--space` ou `--list` e um `--workspace` diferente do perfil saem com `2`.
Perfil inexistente sai com `6`. Reabra o cliente MCP e chame
`clickupfy_mcp_context` para conferir o destino.

### `clickupfy mcp serve --list <id>`

Inicia o servidor MCP em stdio. A saída padrão é reservada ao protocolo JSON-RPC;
mensagens operacionais vão para o stderr. `--list` fixa a List do projeto e os
outros IDs fixam os níveis superiores. `--read-only` remove as tools de escrita de
`tools/list` e `--describe` lista as tools do escopo e encerra.

| Parâmetro | Obrigatório | Uso |
| --- | --- | --- |
| `--account <perfil>` | não | Perfil fixado. |
| `--workspace <id>` | não | Workspace esperado. |
| `--space <id>` | não | Space fixado. |
| `--folder <id>` | não | Folder fixado. |
| `--list <id>` | não | List fixa do projeto. |
| `--sprint-folder <id>` | não | Sprint Folder fixado. |
| `--read-only` | não | Expõe somente ferramentas de leitura. |
| `--describe` | não | Lista as tools do escopo e sai. |

Exemplos:

```bash
clickupfy mcp serve --list 901328052926
```

```bash
clickupfy mcp serve --account produto --list 901328052926
```

```bash
clickupfy mcp serve --workspace 90070363783 --space 90070363783 --folder 2001 --list 901328052926
```

```bash
clickupfy mcp serve --list 901328052926 --sprint-folder 4001 --read-only
```

```bash
clickupfy mcp serve --account cliente-a --space 901328060001 --list 901328060002 --describe
```

Normalmente o cliente MCP executa esse comando a partir do `.mcp.json` ou do
`.codex/config.toml`; não o inicie em um terminal que também precise de saída
humana. A referência MCP detalha cada ferramenta exposta pelo servidor e as
diferenças entre leitura e escrita.

### `clickupfy mcp setup`

Configura um MCP nomeado no diretório atual. Com terminal interativo, pergunta
nome, clientes, perfil, espaço e lista. Use setas e Enter nos seletores; no
seletor de clientes, Espaço marca ou desmarca uma opção. Ctrl+C cancela antes da
gravação. As listas incluem pastas e listas sem pasta. O workspace é o associado
ao perfil escolhido; cadastre o perfil antes com `clickupfy setup`.

| Parâmetro | Tipo | Obrigatoriedade e padrão |
| --- | --- | --- |
| `--name` | texto | Perguntado; obrigatório sem interação. |
| `--account` | texto | Perguntado; obrigatório sem interação; perfil já cadastrado. |
| `--space` | ID | Perguntado; obrigatório sem interação; pertence ao workspace do perfil. |
| `--list` | ID | Perguntado; obrigatório sem interação; pertence ao espaço escolhido. |
| `--clients` | CSV | Os quatro clientes por padrão: `claude-code`, `codex`, `gemini`, `opencode`. |
| `--project` | caminho | Diretório atual. |
| `--read-only` | booleano | Desativado; quando presente, expõe somente ferramentas de leitura. |
| `--force` | booleano | Desativado; substitui uma entrada com o mesmo nome. |
| `--non-interactive` | booleano | Desativado; exige escolhas por flags. |

| Cliente | Arquivo local | Seção |
| --- | --- | --- |
| Claude Code | `.mcp.json` | `mcpServers` |
| Codex | `.codex/config.toml` | `mcp_servers` |
| Gemini CLI | `.gemini/settings.json` | `mcpServers` |
| OpenCode | `opencode.json`, ou `opencode.jsonc` quando existir | `mcp` |

Cada entrada inicia `clickupfy mcp serve` com perfil, workspace, espaço e lista
fixos. A pasta da lista é acrescentada quando existe. A API key permanece na
configuração pessoal; o setup não troca o perfil ativo nem modifica recursos no
ClickUp. O binário `clickupfy` precisa estar disponível no `PATH` do cliente.

Exemplos:

```bash
clickupfy mcp setup
```

```bash
clickupfy mcp setup --name produto
```

```bash
clickupfy mcp setup --name suporte --clients claude-code,gemini
```

```bash
clickupfy mcp setup --name dev --account empresa --space 90070363783 --list 901328052926 --non-interactive
```

```bash
clickupfy mcp setup --name dev --account empresa --space 90070363783 --list 901328060001 --clients codex,opencode --project ./app --read-only --force --non-interactive --json
```

Repita com outro nome para manter vários MCPs no mesmo projeto. Nome repetido
sem `--force` é recusado. Fora de um TTY, sem as flags obrigatórias, o comando
sai com `2`. Um ID fora da hierarquia, nenhuma opção acessível, falha da API ou
configuração inválida encerram o comando antes da gravação. Todos os arquivos são
analisados antes de escrever; cada substituição é atômica, mas uma falha de disco
pode deixar parte dos clientes atualizada. Os demais servidores e ajustes são
preservados. O TOML é reserializado e perde comentários; comentários do JSONC do
OpenCode são preservados.

O escopo segue o comportamento de `mcp serve`: Docs continuam no workspace e as
permissões da API key continuam sendo as concedidas pelo ClickUp. O setup não
cria uma credencial com permissões reduzidas. Em JSON, o `data` traz
`{ name, account, workspace, space, list, args, files }`.

Formatos conferidos nas documentações oficiais de
[Claude Code](https://code.claude.com/docs/en/mcp),
[Codex](https://developers.openai.com/codex/mcp),
[Gemini CLI](https://geminicli.com/docs/tools/mcp-server/) e
[OpenCode](https://opencode.ai/docs/mcp-servers/).
