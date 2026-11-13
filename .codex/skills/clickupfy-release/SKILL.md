---
name: clickupfy-release
description: Prepara e valida releases do ClickUpfy com SemVer, changelog, tag, GitHub Release com binários Bun, SHA256SUMS, pacote npm e recuperação de falhas.
---

# Release do ClickUpfy

O ClickUpfy é um binário Bun feito com o Termfy. Cada release sai de uma tag
`vMAJOR.MINOR.PATCH` empurrada para o GitHub. O workflow `release.yml`
valida o projeto, compila os binários, gera o `SHA256SUMS`, publica a GitHub
Release com as notas do `CHANGELOG.md` e publica o pacote npm
`@promovaweb/clickupfy`, que só traz o launcher e baixa o binário da release.
O passo a passo está em `docs/release.md`.

## Cobertura documental da release

Confira se todo command, option, tool MCP e comportamento público da versão
está em `docs/` (documentação embutida, conferida por `bun run docs:check`) e
no manual `docs/user/`. Leia `docs/user/reading-order.txt` para confirmar que
cada capítulo aparece uma vez no PDF e no EPUB.

Quando o manual mudar, atualize `ebook/VERSION`, gere o ebook com
`bash .ebook/build-ebook.sh`, confira com `bash .ebook/build-ebook.sh --check`
e mantenha no repositório os arquivos que o manifesto `ebook/build.json`
declarar.

## Antes de começar

1. Trabalhe dentro do repositório independente `clickupfy/`.
2. Confira `git status --short` e preserve mudanças alheias à release.
3. Rode `bun install` quando as dependências ainda não estiverem instaladas.

## Preparar a versão

1. Escolha a versão SemVer: patch para correção, minor para funcionalidade,
   major para mudança incompatível (commands, options, campos do `--json`,
   nomes de tools ou exit codes).
2. Grave a mesma versão em `package.json` e em `npm/package.json`.
3. Acrescente a seção `## [X.Y.Z](link do compare) (AAAA-MM-DD)` no topo do
   `CHANGELOG.md`, com mudanças incompatíveis, funcionalidades e correções.
4. Rode `bun run validate`: typecheck, testes, skills do Termfy, OpenCLI,
   cobertura da documentação embutida e build. Quando o registry de commands
   mudar, rode `bun run opencli` antes e revise o diff de `docs/opencli.json`.

## Publicar

```bash
git commit -m "release: clickupfy vX.Y.Z"
git tag vX.Y.Z
git push origin main vX.Y.Z
```

Empurre só a tag desta entrega. Acompanhe o workflow `Release` até:

- GitHub Release `vX.Y.Z` com `clickupfy-linux-x64`, `clickupfy-linux-arm64`,
  `clickupfy-darwin-x64`, `clickupfy-darwin-arm64`,
  `clickupfy-windows-x64.exe` e `SHA256SUMS`;
- `@promovaweb/clickupfy@X.Y.Z` no registry npm (`npm view
  @promovaweb/clickupfy version`).

## Validar localmente

```bash
bun run build
./dist/clickupfy --version
./dist/clickupfy mcp --list
bun install --frozen-lockfile --os="*" --cpu="*" --libc="*"
bun run build:all
```

## Diagnosticar falhas

- Workflow recusou a tag: a versão de `package.json` ou de
  `npm/package.json` difere da tag. Corrija numa versão nova.
- Release sem binários: reexecute os jobs falhos da mesma execução.
- Publicação npm falhou: confirme o secret `NPM_TOKEN` e reexecute o job
  `npm`.
- `npm install -g` instalou, mas o primeiro uso falha: confira se a GitHub
  Release da mesma versão tem o binário da plataforma e o `SHA256SUMS`.

## Recuperar uma release

Não mova nem reutilize uma tag publicada. Para erro no código, publique uma
nova patch. Para arquivo ausente ou job interrompido, reexecute o workflow no
commit da tag. Só use operações manuais do GitHub CLI com autorização
explícita e registre no handoff o motivo, a tag, os arquivos e as validações.
