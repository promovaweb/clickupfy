# 0012 Distribuição, documentação e merge

Status: draft

## Goal

Publicar o novo binário no lugar do CLI Node sem quebrar quem instala pelo npm.

## Behavior

Binários por plataforma na GitHub Release; o pacote `@promovaweb/clickupfy` vira wrapper que baixa e roda o binário certo. `legacy/` sai, docs, ebook e README são atualizados, a branch `termfy` entra na `main` e sai a release 1.0.0.

## Design

`scripts/build.ts --all`, workflow de release do starter kit adaptado e pacote npm em `npm/`.

## Surface

- Nenhuma mudança de superfície.

## Tasks

- [ ] Wrapper npm `#termfy-release`
- [ ] Remover `legacy/` e atualizar docs `#termfy-docs`
- [ ] Scripts e skills do Hub leem `.data` do envelope `--json` `#termfy-docs`
- [ ] Release 1.0.0 `#termfy-release`

## Tests

- [ ] `npm i -g` instala e roda `clickupfy --version`
- [ ] `bun run validate` verde sem `legacy/`

## Notes

- 2026-11-13: criada como draft na entrevista do CLISPEC; options detalhadas na `termfy-spec`.
