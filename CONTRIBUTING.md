# Contribuindo com o ClickUpfy

Este guia é para quem desenvolve, revisa ou mantém o ClickUpfy. Para usar a
ferramenta, leia o [README](README.md).

O ClickUpfy é um binário único em [Bun](https://github.com/oven-sh/bun) com
CLI, TUI e servidor MCP, feito com o framework
[Termfy](https://github.com/promovaweb/termfy) a partir do
[Termfy Starter Kit](https://github.com/promovaweb/termfy-starter-kit). As
skills do Termfy ficam em `.agents/skills/termfy-*` e ensinam um agente a
evoluir o projeto.

## Antes de começar

- Converse no [Discord](https://promovaweb.com/discord) antes de mexer em algo
  grande ou de mudar o comportamento de um command, de uma tool MCP ou da
  TUI.
- Para um bug ou uma ideia, abra uma
  [issue](https://github.com/promovaweb/clickupfy/issues) com a versão, o
  sistema operacional e o passo a passo para reproduzir.
- Uma issue por mudança. Um pull request por issue, salvo quando a mudança
  depende de outra.

## Ambiente

Requisitos: Bun 1.4.4 ou superior e Git. Node.js só é usado pelo pacote npm
em `npm/`.

```bash
git clone https://github.com/promovaweb/clickupfy.git
cd clickupfy
bun install
bun run dev -- --help        # CLI a partir do código-fonte
bun run dev                  # TUI
bun run dev -- mcp --list    # tools, resources e prompts do MCP
```

Para não misturar com os seus perfis reais, aponte os dados para uma pasta
temporária com `CLICKUPFY_HOME=/tmp/clickupfy-dev`. A API do ClickUp pode
ser trocada por um servidor fake com `PROMOVAWEB_CLICKUPFY_API_URL` e
`PROMOVAWEB_CLICKUPFY_API_URL_V3`, como fazem os testes.

## Organização do código

```text
src/
  app/          identidade, exit codes e AppError
  cli/          parser, registry, commands próprios (setup, account, mcp, api, agent, upgrade...)
  clickup/      client HTTP, perfis, migração, escopo e uma família por arquivo
  operations/   camada que transforma cada operação em command e tool MCP
  api/          catálogo das APIs v2 e v3 (gerado) e execução genérica
  agent/        skills do ClickUpfy embutidas no binário
  config/       settings, cofre cifrado e caminhos de ~/.clickupfy
  mcp/          servidor stdio, tools de perfil e escopo, mcp setup
  tui/          OpenTUI, tema e screens
  skill/        documentação embutida (--skill)
docs/           documentação embutida e opencli.json; docs/user é o manual
specs/          specs de cada evolução; a visão macro está em CLISPEC.md
api/            especificações OpenAPI que geram src/api/catalog.json
npm/            pacote @promovaweb/clickupfy (launcher que baixa o binário)
tests/          bun test, com API fake em tests/helpers/clickup.ts
```

A arquitetura completa está em [docs/architecture.md](docs/architecture.md).

## Fluxo de trabalho

Toda mudança de comportamento começa numa spec:

1. Leia o [CLISPEC.md](CLISPEC.md) e as specs de [specs/](specs/).
2. Se nenhuma spec aberta cobrir o pedido, crie a próxima
   (`specs/NNNN-slug.md`) com a skill `termfy-spec`: Goal, Behavior, Design,
   Surface, Tasks e Tests.
3. Implemente seguindo Behavior e Design e marque Tasks e Tests ao concluir.
4. Feche a spec: aplique a Surface às tabelas do `CLISPEC.md`, troque o
   status para `done` e registre a data em Notes.

### Acrescentar uma operação do ClickUp

Commands e tools MCP nascem da mesma declaração. Para uma operação nova:

1. No arquivo da família em `src/clickup/` (ou num arquivo novo), declare um
   `Operation` com `path` (command), `tool` (`clickupfy_<recurso>_<verbo>`),
   `params` em camelCase, `effect` (`read` ou `write`), `destructive` quando
   apagar algo, `examples` e `run`.
2. Registre o array em `src/operations/index.ts`, com a descrição do grupo.
3. Use `pinned()` e `pinnedOptional()` de `src/clickup/scope.ts` para os ids
   que um servidor MCP pode fixar (list, space, folder, Sprint folder).
4. Escreva os testes com `fakeClickUp` e `testEnv` de
   `tests/helpers/clickup.ts`, cobrindo o `--json`, a tool via MCP e os
   exit codes de erro.
5. Documente em `docs/cli.md` e `docs/mcp.md`; o `docs:check` falha se
   faltar algum command ou tool.

## Regras do código

- Código, mensagens, commands, options, tools e campos do `--json` em
  inglês. Documentação (`README.md`, `docs/`, specs, changelog) em
  português do Brasil.
- Cabeçalho em todo arquivo novo explicando o propósito e JSDoc nas funções
  exportadas, em inglês.
- Erros esperados saem como `AppError` com os exit codes de
  `src/app/exit-codes.ts`. Não invente números.
- Segredos só pelo cofre (`getCredential`). Nunca em argumento, log, erro,
  `--json`, tool MCP ou tela da TUI.
- Stdout recebe dados; stderr recebe progresso e avisos. Em `mcp`, stdout é
  do JSON-RPC.
- Não edite `.agents/skills/termfy-*`: elas são atualizadas pelo framework
  com a skill `termfy-init`.
- As skills do ClickUpfy para usuários ficam em `.codex/skills/` e entram no
  binário; ao mudar um command, confira se elas continuam corretas.

## Validar

```bash
bun run validate
```

O comando roda typecheck, testes, conferência das skills do Termfy,
`docs/opencli.json`, cobertura da documentação embutida e build. Quando o
registry de commands mudar, rode `bun run opencli` antes e revise o diff.
Outros comandos úteis:

```bash
bun test tests/tasks.test.ts                 # um arquivo de teste
bun run api:generate                         # regenera o catálogo da API a partir de api/
bun run npm:readme                           # gera npm/README.md a partir do README.md
bash .ebook/build-ebook.sh                   # gera o ebook a partir de docs/user
bun install --frozen-lockfile --os="*" --cpu="*" --libc="*"
bun run build:all                            # binários de todas as plataformas
```

O CI roda `bun run validate` em pull request e em push para `main`
(`.github/workflows/ci.yml`).

## Documentação

- `docs/*.md`: referência embutida no binário (`clickupfy --skill`).
- `docs/user/`: manual do usuário, publicado em
  [promovaweb.com/docs/clickupfy](https://promovaweb.com/docs/clickupfy/) e
  convertido no ebook. Mantenha os nomes dos arquivos e o
  `reading-order.txt`, que o site usa.
- `README.md`: para quem usa a ferramenta. Detalhes de desenvolvimento ficam
  neste arquivo. Ao alterar o README, rode `bun run npm:readme`.

## Commits e pull requests

- Commits em português, no formato convencional (`feat:`, `fix:`, `docs:`,
  `test:`, `chore:`), descrevendo o efeito da mudança.
- Abra o pull request contra `main` com a spec relacionada, o que mudou e o
  resultado do `bun run validate`.

## Releases

A publicação segue [docs/release.md](docs/release.md): mesma versão em
`package.json` e `npm/package.json`, entrada no `CHANGELOG.md`, commit
`release: clickupfy vX.Y.Z`, tag `vX.Y.Z` e push da tag. O workflow publica a
GitHub Release com os binários. O pacote npm é publicado depois, só pela
máquina local, com `npm pack` e `npm publish` dentro de `npm/`. Tags
publicadas nunca são movidas.

## Licença

O ClickUpfy é distribuído sob a [GNU AGPL 3.0](LICENSE). Ao enviar uma
contribuição, você concorda que ela entra sob a mesma licença do projeto.
