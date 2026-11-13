# Changelog

Todas as mudanças relevantes do ClickUpfy são registradas neste arquivo. O
projeto segue versionamento semântico; o fluxo de publicação está em
`docs/release.md`.

## [1.1.1](https://github.com/promovaweb/clickupfy/compare/v1.1.0...v1.1.1) (2026-11-13)

### Release

- A publicação no npm passa a ser feita só pela máquina local; o workflow de
  release não publica mais no npm.
- `docs/release.md`, `CONTRIBUTING.md` e a skill `clickupfy-release`
  descrevem o fluxo local com `npm pack` e `npm publish`.

## [1.1.0](https://github.com/promovaweb/clickupfy/compare/v1.0.4...v1.1.0) (2026-11-13)

### Licença

- A partir desta versão, o projeto é distribuído sob a GNU AGPL 3.0
  (`AGPL-3.0-only`); versões anteriores continuam sob a licença com que
  foram publicadas.
- `LICENSE` na raiz e cópia em `npm/LICENSE`, incluída no pacote npm.
- Campo `license` de `package.json`, `npm/package.json` e
  `docs/opencli.json` atualizado.
- README ganha o badge e a seção Licença; `CONTRIBUTING.md` registra que as
  contribuições entram sob a mesma licença. `npm/README.md` regenerado.

## [1.0.4](https://github.com/promovaweb/clickupfy/compare/v1.0.3...v1.0.4) (2026-11-13)

### Documentação

- README reorganizado para quem usa: cabeçalho com a Promovaweb, badges,
  banner do Discord e links para a documentação, os planos e o changelog.
  Ganha as seções Feito com, Comunidade e suporte e Promovaweb, com os
  repositórios usados.
- `CONTRIBUTING.md` para quem contribui, com a seção Antes de começar
  (Discord e issues) e o CI que roda `bun run validate`.
- `npm/README.md` regenerado a partir do README.

## [1.0.3](https://github.com/promovaweb/clickupfy/compare/v1.0.2...v1.0.3) (2026-11-13)

### Documentação

- Fecha a spec 0012 (distribuição, documentação e merge) no `CLISPEC.md`,
  com o pacote npm publicado e a instalação conferida.

## [1.0.2](https://github.com/promovaweb/clickupfy/compare/v1.0.1...v1.0.2) (2026-11-13)

### Documentação

- README reescrito para quem usa: instalação, primeiros passos, exemplos por
  área, uso com agentes, saída para scripts, arquivos locais e migração do
  0.9.0.
- `CONTRIBUTING.md` novo, com ambiente, organização do código, fluxo por
  specs, regras, validação e release.
- O pacote npm passa a publicar `npm/README.md`, gerado do README com links
  absolutos por `bun run npm:readme`; a página do npm deixa de mostrar o
  README do 0.9.0.

## [1.0.1](https://github.com/promovaweb/clickupfy/compare/v1.0.0...v1.0.1) (2026-11-13)

### Correções

- **release:** a GitHub Release deixa de levar o `dist/clickupfy` do runner
  junto com os binários nomeados por plataforma e o `SHA256SUMS`.
- **release:** a publicação no npm usa `--provenance` e trusted publishing
  (OIDC) quando disponível, e não falha ao reexecutar uma versão já
  publicada.

## [1.0.0](https://github.com/promovaweb/clickupfy/compare/v0.9.0...v1.0.0) (2026-11-13)

O ClickUpfy foi refeito sobre o framework Termfy: um binário único em Bun
com CLI, TUI e servidor MCP stdio, mantendo os commands e as tools
`clickupfy_*` do 0.9.0.

### Mudanças incompatíveis

- O `--json` passa a usar o envelope `{ ok, command, data }`, e os erros saem
  como `{ ok: false, command, error }`. Scripts que liam o objeto cru passam
  a ler `.data`. Listas vêm dentro de objetos (`{ tasks[] }`, `{ spaces[] }`).
- Mensagens, options e campos do `--json` estão em inglês. Os estados dos
  checklist items são `done` e `pending`, e os das Sprints são `planned`,
  `active`, `completed` e `regular`.
- Os exit codes seguem a tabela do Termfy: 2 para uso, 3 para configuração,
  4 para credenciais, 5 para rede ou API, 6 para recurso inexistente, 7 para
  permissão e 130 para interrupção.
- `--status` e `--assignee` recebem valores separados por vírgula.
- O pacote npm `@promovaweb/clickupfy` passa a ser um launcher que baixa o
  binário da plataforma na primeira execução, conferindo o `SHA256SUMS`.

### Funcionalidades

- **perfis:** API keys cifradas no cofre (`~/.clickupfy/credentials.json`),
  perfis em `~/.clickupfy/accounts.json` e importação automática do
  `~/clickupfy/config.json` sem alterar o arquivo; `account import`.
- **mcp:** escopo fixado por `mcp serve` (inclusive `--sprint-folder` e
  `--read-only`), `mcp --list-id`, `mcp serve --describe` e erros com
  `isError` e o exit code equivalente.
- **tui:** aba Overview com perfil, workspace, cronômetro em execução e
  perfis.
- **time:** `time start` avisa quando troca um cronômetro de outra tarefa e
  devolve `previous`.
- **docs:** `doc page create|update` leem o conteúdo de `--file <path>` ou
  do stdin (`--file -`).
- **api:** `api call <operation>` com `--dry-run` e `--file` repetível; as
  tools do catálogo não exigem mais os ids fixados pelo servidor nem o
  workspace do perfil.
- **doctor:** checagens de perfil, API key, config antigo, `.mcp.json` e
  `.codex/config.toml`; `--online` valida a chave e as skills.
- **upgrade:** atualiza pelo npm ou trocando o binário pela GitHub Release.
- Documentação embutida com `clickupfy --skill` e descrição OpenCLI com
  `clickupfy --opencli`.

### Correções

- `--start-date` e `--due-date` gravam o início do dia no fuso local; o
  0.9.0 gravava meia-noite UTC, que aparecia como o dia anterior no Brasil.
- `clickupfy_tasks_search` sem list fixada busca no workspace em vez de
  chamar `/list/undefined/task`.
- `doc page update` sem nenhum campo para atualizar sai com 2 em vez de
  enviar um PUT vazio.

## [0.9.0](https://github.com/promovaweb/clickupfy/compare/v0.8.1...v0.9.0) (2026-10-26)

### Funcionalidades

- **api:** adiciona API, comandos de tags e documentação gerada ([e09220c](https://github.com/promovaweb/clickupfy/commit/e09220c91395ad5c2c75a7600cde84341a2b7c08))

## [0.8.1](https://github.com/promovaweb/clickupfy/compare/v0.8.0...v0.8.1) (2026-10-19)

### Correções

- Trata lançadores npm/npx e caminhos com espaços no Windows em upgrade e instalação de skills.
- Ajusta o doctor para distinguir permissões POSIX de ACLs Windows e aceita BOM UTF-8.
- Remove temporários quando a gravação falha e informa como conferir arquivos abertos ou somente leitura.

### Testes e documentação

- Acrescenta CI Windows com cinco execuções da suíte, fixtures portáteis, typecheck dos testes e arquivos de texto com LF.
- Documenta PATH, PowerShell e permissões Windows. Agradecimento a @vitorcanoas pelo relato em #8.

## [0.8.0](https://github.com/promovaweb/clickupfy/compare/v0.7.0...v0.8.0) (2026-10-19)

### Funcionalidades

- Adiciona `clickupfy mcp setup` com seleção interativa de conta, espaço, lista e clientes.
- Permite vários MCPs nomeados no mesmo projeto para Claude Code, Codex, Gemini CLI e OpenCode.
- Preserva configurações existentes, aceita JSONC do OpenCode e exige `--force` para substituir nomes existentes.
- Oferece configuração por flags e modo somente leitura, sem copiar API keys para o projeto.

### Documentação

- Documenta parâmetros, arquivos locais, exemplos e limites do setup no manual e README.
- PDF e EPUB permanecem na edição anterior: o gerador legado depende de Python e não foi executado.

### Build

- Incorpora a entrada ESM do parser JSONC ao executável standalone para evitar carregamento dinâmico incompatível com Node.js SEA.

### Validação

- Typecheck, build e 104 testes aprovados, incluindo CLI, seletores e preservação de configurações.

## [0.7.0](https://github.com/promovaweb/clickupfy/compare/v0.6.0...v0.7.0) (2026-08-20)

### Funcionalidades

- adiciona doctor e atualiza config local ([01f47e4](https://github.com/promovaweb/clickupfy/commit/01f47e49af8523858f9a476fac8398add3ce837d))
- gerencia skills pelo skills add e amplia doctor ([659725e](https://github.com/promovaweb/clickupfy/commit/659725e1716980f1df0e14dd0e0bd31c71d6f834))
- **setup:** adiciona skill de configuração do ClickUpfy ([5f37aab](https://github.com/promovaweb/clickupfy/commit/5f37aab89a576b9b7d0c7600d1da6b03f52a6c46))

### Correções

- **sea:** valida skills sem destino legado ([046d063](https://github.com/promovaweb/clickupfy/commit/046d063e195c5b85ea4c40fd8ba16043b21c708f))
- **skills:** usa npx no ClickUpfy ([0923b16](https://github.com/promovaweb/clickupfy/commit/0923b168b82590e740f0dbba456369021d739723))

### Documentação

- publica aliases estaveis do ebook ([67c5974](https://github.com/promovaweb/clickupfy/commit/67c59746839367c86e45696727319726717219b4))
- sincroniza guia e referências do ClickUpfy ([fcd9404](https://github.com/promovaweb/clickupfy/commit/fcd9404032f49ea623b9b580acc78783447e4a49))

## [0.6.0](https://github.com/promovaweb/clickupfy/compare/v0.5.0...v0.6.0) (2026-08-14)

### Funcionalidades

- adiciona upgrade automatico do CLI ([c0d4b0a](https://github.com/promovaweb/clickupfy/commit/c0d4b0a8740757fead8e8a5ca0cbf1d15b03dadb))

## [0.5.0](https://github.com/promovaweb/clickupfy/compare/v0.4.0...v0.5.0) (2026-08-14)

### Funcionalidades

- configura arquivos de agente por projeto ([d59fe59](https://github.com/promovaweb/clickupfy/commit/d59fe591826c7e45ea8c1bbf53a5c9d18680dd6e))

### Documentação

- amplia referências e guias do ClickUpfy ([2ab1271](https://github.com/promovaweb/clickupfy/commit/2ab1271b4794e8b3bb10dbb33d96f637e26a8b59))

## [0.4.0](https://github.com/promovaweb/clickupfy/compare/v0.3.0...v0.4.0) (2026-07-31)

### Funcionalidades

- adiciona gestao completa de Docs do ClickUp ([7095e15](https://github.com/promovaweb/clickupfy/commit/7095e15dd357d72dfea635417434102d6e0c03bd))
- amplia fluxos de issues e documentação ([41c1f27](https://github.com/promovaweb/clickupfy/commit/41c1f2712b1c4ff1b0fc688474164a815f9eee15))
- **brand:** atualiza identidade visual ([5f642b8](https://github.com/promovaweb/clickupfy/commit/5f642b81333ea236642e70867a2046ac64914f93))

### Documentação

- publica guia do usuário v1.1.1 ([ffaf61e](https://github.com/promovaweb/clickupfy/commit/ffaf61e8602afcf19863b23a2754060f4c2bae25))

## [0.3.0](https://github.com/promovaweb/clickupfy/compare/v0.2.0...v0.3.0) (2026-07-29)

### Funcionalidades

- distribui binários nativos pelo npm ([8206a5a](https://github.com/promovaweb/clickupfy/commit/8206a5aa3105d83c4b9aad9e66b09e747b21630e))

### Correções

- inicia launcher antes do build local ([b68b96c](https://github.com/promovaweb/clickupfy/commit/b68b96cafe27fc050c40cc125af2e4aa9d046ea1))

### Integração contínua

- normaliza changelog da release automaticamente ([bec42c3](https://github.com/promovaweb/clickupfy/commit/bec42c3390675dfd446058279b255c941655b55f))

## [0.2.0](https://github.com/promovaweb/clickupfy/compare/v0.1.0...v0.2.0) (2026-07-29)

### Funcionalidades

- automatiza execução de tarefas e releases ([a1d8a62](https://github.com/promovaweb/clickupfy/commit/a1d8a62c3be6181574e913732fcc55e638b1e1a0))

### Correções

- diferencia branches de tags na validação ([613a306](https://github.com/promovaweb/clickupfy/commit/613a3064db00b017cf0afaad3a4464c649b03954))

## 0.1.0 (2026-07-29)

### Funcionalidades

- Adiciona o CLI multi-account para tarefas, comentários, Sprints e time
  tracking do ClickUp.
- Adiciona o servidor MCP específico por projeto e as skills iniciais para
  agentes de desenvolvimento.
