# 0012 Distribuição, documentação e merge

Status: done

## Goal

Publicar o novo binário no lugar do CLI Node sem quebrar quem instala pelo
npm, com documentação, ebook e skills alinhados, e levar a branch `termfy`
para a `main` como release 1.0.0.

## Behavior

`npm install -g @promovaweb/clickupfy` instala só o launcher
`bin/clickupfy.cjs`. Na primeira execução ele baixa `clickupfy-<plataforma>`
e o `SHA256SUMS` da GitHub Release da mesma versão, confere o hash, guarda o
binário em `~/.clickupfy/bin/v<versão>/` e o executa com os mesmos
argumentos e stdio herdado; o exit code e o sinal são repassados. O
`postinstall` tenta baixar antes, sem falhar a instalação.
`CLICKUPFY_BINARY_PATH`, `CLICKUPFY_BINARY_DIR` e
`CLICKUPFY_RELEASE_BASE_URL` trocam o binário, a pasta e a origem. Hash
divergente sai com 1 e não grava nada. Quem baixa o binário avulso da
release confere o `SHA256SUMS` e usa direto.

A tag `vX.Y.Z` dispara o workflow: confere a versão de `package.json` e de
`npm/package.json`, roda `bun run validate`, compila os cinco alvos, publica
a GitHub Release e depois o pacote npm.

## Design

- `npm/`: `package.json` (`@promovaweb/clickupfy`, sem dependências),
  `bin/clickupfy.cjs` (launcher) e `lib/binary.cjs` (`assetName`,
  `ensureBinary`). É Node porque roda pelo npm; o binário segue só Bun.
- `.github/workflows/release.yml`: conferência da versão da tag e job `npm`
  com `NPM_TOKEN`.
- `docs/release.md`, `README.md` e `CHANGELOG.md` da 1.0.0.
- `docs/user/`: o manual do 0.9.0 portado para o binário novo, com os
  mesmos arquivos e o mesmo `reading-order.txt`, que o Hub sincroniza com o
  site; ebook 2.0.0 gerado de `docs/user/`.
- `.codex/skills/`: skills do ClickUpfy atualizadas (release, setup, dev,
  issues).
- `legacy/` removido antes do merge.
- No Hub: `scripts/omarchy-plugins.mjs` e `AGENTS-FUNDAMENTOS.md` passam a
  ler `.data` do envelope `--json`.

## Surface

Nenhuma mudança de superfície.

## Tasks

- [x] Wrapper npm com download e conferência do SHA256 `#termfy-release`
- [x] Job npm e conferência de versão no workflow de release `#termfy-release`
- [x] Scripts e skills do Hub leem `.data` do envelope `--json` `#termfy-docs`
- [x] README, CHANGELOG 1.0.0 e `docs/release.md` `#termfy-docs`
- [x] Skills do ClickUpfy atualizadas `#termfy-docs`
- [x] Manual `docs/user/` portado e ebook 2.0.0 `#termfy-docs`
- [x] Remover `legacy/` `#termfy-docs`
- [x] Merge na `main` e release 1.0.0 `#termfy-release`
- [x] Pacote `@promovaweb/clickupfy` 1.x publicado no npm `#termfy-release`

## Tests

- [x] Launcher baixa, confere, guarda em cache e executa, repassando o exit
  code (`tests/npm-wrapper.test.ts`)
- [x] Hash divergente sai com 1 sem gravar o binário
- [x] Versões de `package.json` e `npm/package.json` iguais
- [x] `bun run validate` verde sem `legacy/`
- [x] `npm install @promovaweb/clickupfy@1.0.1` instala, baixa o binário e
  roda `clickupfy --version`

## Notes

- 2026-11-13: criada como draft na entrevista do CLISPEC.
- 2026-11-13: o binário compilado tem cerca de 124 MB; o pacote npm baixa só
  o da plataforma em vez de embutir os cinco.
- 2026-11-13: o Release Please do 0.9.0 sai; a versão passa a ser definida à
  mão em `package.json` e `npm/package.json`, com tag e workflow do Termfy.
- 2026-11-13: manual portado pelo OpenCode em duas abas e revisado; os 285
  exemplos `clickupfy ...` de `docs/user/` passam pelo parser e as 47 tools
  citadas existem. Ebook 2.0.0 gerado. `legacy/` removido.
- 2026-11-13: v1.0.0 publicada na GitHub Release; o job npm falhou com 404
  no PUT (o `NPM_TOKEN` do repositório parece vencido). A 1.0.1 limpa o
  `dist/` antes do build cruzado (a 1.0.0 levou um asset `clickupfy` a mais)
  e publica com `--provenance` e OIDC, de forma idempotente.
- 2026-11-13: com o `NPM_TOKEN` renovado, a 1.0.1 e depois a 1.0.2 foram
  publicadas no npm; a 1.0.2 traz o README próprio do pacote e o
  `CONTRIBUTING.md`. Spec fechada.
