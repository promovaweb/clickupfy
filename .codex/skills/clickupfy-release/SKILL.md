---
name: clickupfy-release
description: Prepara e valida releases do ClickUpfy com SemVer, changelog, tags, GitHub Release, executáveis, checksums e recuperação de falhas.
---

# Release do ClickUpfy

Conduza releases reproduzíveis sem criar tags ou alterar versões manualmente.
O Release Please é a fonte da versão, do changelog, da tag e da GitHub
Release. O GitHub Actions compila e publica os artefatos após a criação da
release.

## Cobertura documental da release

Confira se todo comando, parâmetro, ferramenta MCP e comportamento público da
versão está explicado em `docs/user/`. O manual precisa detalhar entradas,
saídas, permissões, efeitos persistentes, limitações da API e cinco exemplos
diferentes por comando ou ferramenta. Leia também `docs/user/reading-order.txt`
para confirmar que cada capítulo aparece uma vez no PDF e no EPUB.

Quando houver mudança documental, confirme `ebook/VERSION`, execute
`npm run ebook`, execute `npm run ebook:verify` e publique os artefatos que o
manifesto resultante declarar. Não libere versão cujo texto de ajuda tenha
mudado sem a referência correspondente no manual.

## Antes de começar

1. Trabalhe dentro do repositório independente `clickupfy/`.
2. Leia `RELEASING.md` e confira `git status --short`.
3. Preserve mudanças locais que não pertençam à release.
4. Execute `npm ci` quando as dependências ainda não estiverem instaladas.
5. Não crie uma tag nem edite a versão diretamente, salvo em uma recuperação
   explicitamente autorizada.

## Preparar mudanças

Use Conventional Commits. O Release Please determina a próxima versão pelo
histórico desde a última release:

- `fix:` propõe patch;
- `feat:` propõe minor;
- `feat!:` ou `BREAKING CHANGE:` propõe major;
- `docs:`, `build:`, `ci:` e `refactor:` entram no changelog sem forçar uma
  versão maior que as mudanças funcionais presentes.

Antes de enviar as mudanças:

```bash
npm run validar
```

O comando verifica tipos, testes, build, versões, manifesto, changelog e
presença do workflow.

## Publicar uma release

1. Faça push dos Conventional Commits para `main`.
2. Aguarde o workflow `Release` criar ou atualizar a Release PR.
3. Revise na PR a versão proposta e o `CHANGELOG.md`.
4. Faça merge da Release PR.
5. Acompanhe a mesma execução do workflow até estes resultados:
   - tag imutável `vMAJOR.MINOR.PATCH`;
   - GitHub Release;
   - executáveis Linux x64, macOS x64, macOS arm64 e Windows x64;
   - pacote `@promovaweb/clickupfy` publicado no registry npm;
   - o mesmo pacote npm em arquivo `.tgz` na GitHub Release;
   - `SHA256SUMS`;
   - attestations de proveniência quando o repositório for público.

Não rode `git tag` nem `gh release create` no fluxo normal.

## Validar localmente

Valide a coerência da versão atual:

```bash
npm run release:check
npm run release:check -- v0.1.0
```

O segundo comando só deve usar a tag correspondente à versão atual. Gere e
teste o executável da plataforma local:

```bash
npm run build:executable
./artifacts/clickupfy-v0.1.0-linux-x64/clickupfy --version
```

Adapte o nome do artefato à versão, plataforma e arquitetura exibidas pelo
script.

## Diagnosticar falhas

- Release PR ausente: confira os gatilhos do workflow, as permissões de Actions
  e se há Conventional Commits depois do `bootstrap-sha` ou da última tag.
- CI não executou na Release PR: configure o secret opcional
  `RELEASE_PLEASE_TOKEN`, conforme `RELEASING.md`.
- Release criada sem binários: reexecute os jobs falhos da mesma execução.
- Publicação npm falhou: confirme o secret `NPM_TOKEN` e reexecute o job; o
  script ignora uma versão que já exista no registry.
- Artefato inválido: reproduza com `npm ci`, `npm run validar` e
  `npm run build:executable` na plataforma afetada.
- Versão divergente: não corrija somente um arquivo. Inspecione
  `package.json`, `package-lock.json`, `.release-please-manifest.json`,
  `CHANGELOG.md` e a tag.

## Recuperar uma release

Não mova nem reutilize uma tag publicada. Para erro no código, envie um
Conventional Commit corretivo e publique uma nova patch release. Para arquivo
ausente ou job interrompido, reexecute o workflow no commit tagueado; o upload
usa substituição idempotente para os nomes daquela mesma release.

Só use operações manuais do GitHub CLI quando a automação não puder ser
recuperada e houver autorização explícita. Registre no handoff o motivo, a tag,
os arquivos substituídos e as validações executadas.
