# Releases do ClickUpfy

O ClickUpfy usa Release Please, Conventional Commits e GitHub Actions para
manter a versão, o changelog, a tag, a GitHub Release e os artefatos
publicados. O fluxo normal não exige criar tags ou editar versões manualmente.

## O que a automação publica

Cada release concluída possui:

- tag `vMAJOR.MINOR.PATCH`;
- notas geradas a partir do `CHANGELOG.md`;
- executável Linux x64 em `.tar.gz`;
- executável macOS x64 em `.tar.gz`;
- executável macOS arm64 em `.tar.gz`;
- executável Windows x64 em `.zip`;
- pacote `@promovaweb/clickupfy` publicado no registry npm e anexado em `.tgz`;
- arquivo `SHA256SUMS`;
- attestations de proveniência geradas pelo GitHub quando o repositório for
  público.

O executável é produzido com Node.js Single Executable Applications. As três
skills distribuídas pelo projeto são incorporadas ao binário e continuam
disponíveis por `clickupfy agent skill install`.

O pacote npm contém os executáveis Linux x64, macOS x64 e macOS arm64. O
launcher `bin/clickupfy.cjs` escolhe o arquivo nativo conforme
`process.platform` e `process.arch`; plataformas sem binário usam o build
JavaScript.

## Configuração única do repositório

Em `Settings > Actions > General`, habilite:

1. `Read and write permissions` para o `GITHUB_TOKEN`;
2. `Allow GitHub Actions to create and approve pull requests`.

O workflow funciona com o `GITHUB_TOKEN`. Recursos criados por esse token não
disparam outros workflows; por isso, a criação da release e o build dos
artefatos pertencem ao mesmo arquivo `.github/workflows/release.yml`.

Se a organização impedir `GITHUB_TOKEN` com escrita ou exigir que a Release PR
dispare o workflow de CI, crie o secret `RELEASE_PLEASE_TOKEN` com um
fine-grained personal access token limitado ao repositório e com acesso de
escrita a contents e pull requests. A automação usa esse secret para o Release
Please e para anexar os arquivos à release; nos demais casos, recorre ao
`GITHUB_TOKEN`.

Para publicar no registry npm, crie no mesmo repositório o secret `NPM_TOKEN`
com um token granular autorizado a publicar o pacote
`@promovaweb/clickupfy`. Como o repositório GitHub é privado, o npm não permite
proveniência pública; a automação acrescenta `--provenance` somente quando a
visibilidade mudar para pública.

Proteja `main` exigindo a verificação `Validar Node.js` do workflow `CI`. A
Release PR deve passar por revisão e merge como qualquer outra mudança.

## Convenção de commits

O Release Please calcula a versão seguinte a partir dos Conventional Commits:

| Commit | Efeito SemVer | Changelog |
| --- | --- | --- |
| `fix: corrige autenticação` | patch | Correções |
| `feat: adiciona comando` | minor | Funcionalidades |
| `feat!: altera contrato` | major | Funcionalidades |
| corpo com `BREAKING CHANGE:` | major | Mudanças incompatíveis |
| `perf: reduz chamadas` | conforme o conjunto | Desempenho |
| `refactor: separa cliente` | conforme o conjunto | Refatorações |
| `docs: documenta setup` | conforme o conjunto | Documentação |
| `build:` ou `ci:` | conforme o conjunto | Build ou integração contínua |
| `test:` ou `chore:` | não aparece | seção oculta |

Como o projeto ainda está antes da versão `1.0.0`,
`bump-minor-pre-major: true` mantém funcionalidades novas em versões minor.

## Fluxo de publicação

1. Integre os Conventional Commits em `main`.
2. O job `release-please` abre ou atualiza uma Release PR.
3. O workflow normaliza o Markdown do changelog e registra a correção na PR.
4. Revise a versão em `package.json`, `package-lock.json` e
   `.release-please-manifest.json`.
5. Revise as notas adicionadas ao `CHANGELOG.md`.
6. Faça merge da Release PR.
7. O Release Please cria a tag e a GitHub Release.
8. A matrix compila Linux x64, macOS x64, macOS arm64 e Windows x64.
9. O job final incorpora os três binários Unix ao pacote npm.
10. O pacote instalado é validado exigindo o executável nativo Linux.
11. Executáveis, pacote npm e checksums são anexados à release.
12. O mesmo `.tgz` validado é publicado no registry npm.

Não crie a tag antes da Release PR. O merge dessa PR é o evento que publica a
versão.

## Validação local

Instale as dependências e execute o gate completo:

```bash
npm ci
npm run validar
```

Valide uma tag contra a versão atual:

```bash
npm run release:check -- v0.1.0
```

Gere o executável para a plataforma e arquitetura locais:

```bash
npm run build:executable
```

O script:

1. transpila e reúne o CLI em um único arquivo CommonJS;
2. incorpora as skills como assets do SEA;
3. injeta o blob no binário da versão atual do Node.js;
4. valida `clickupfy --version`;
5. instala uma skill em uma pasta temporária;
6. gera o archive em `artifacts/`.

Use no desenvolvimento uma versão de Node.js compatível com `engines`. O
workflow oficial fixa Node.js `22.23.1` para tornar os builds reproduzíveis.

Para reproduzir o pacote npm, reúna em `release-assets/` os archives de Linux
x64, macOS x64 e macOS arm64 da mesma versão:

```bash
npm run npm:stage -- release-assets
npm pack --pack-destination release-assets
npm run npm:validate-package -- \
  release-assets/promovaweb-clickupfy-X.Y.Z.tgz
```

O teste do pacote define `CLICKUPFY_REQUIRE_NATIVE=1`, instala o tarball em uma
pasta temporária e recusa um fallback JavaScript acidental.

## Verificação dos downloads

Em Linux, confira o checksum a partir da pasta que contém todos os downloads:

```bash
sha256sum --check SHA256SUMS
```

No macOS:

```bash
shasum --algorithm 256 --check SHA256SUMS
```

Em um repositório público, confira a attestation com GitHub CLI:

```bash
gh attestation verify clickupfy-v0.1.0-linux-x64.tar.gz \
  --repo promovaweb/clickupfy
```

Substitua versão e plataforma pelo arquivo baixado.

## Recuperação

Uma tag publicada é imutável. Não mova nem reutilize a tag para corrigir
código; envie um commit `fix:` e publique uma patch release.

Quando somente um job ou upload falhar:

1. abra a execução do workflow `Release` associada à tag;
2. reexecute os jobs com falha;
3. confirme os quatro archives, o `.tgz` e `SHA256SUMS` na GitHub Release;
4. valide ao menos o checksum e a versão do executável afetado.

O upload final usa `--clobber`, portanto uma reexecução da mesma tag substitui
somente arquivos com o mesmo nome naquela release. Não use esse mecanismo para
publicar conteúdo produzido por outro commit.

## Arquivos responsáveis

| Arquivo | Responsabilidade |
| --- | --- |
| `.github/workflows/ci.yml` | Gate de testes e build standalone em PRs e `main`. |
| `.github/workflows/release.yml` | Release PR, tag, release, matrix e publicação. |
| `release-please-config.json` | Política SemVer e seções do changelog. |
| `.release-please-manifest.json` | Versão conhecida pelo Release Please. |
| `CHANGELOG.md` | Histórico público mantido pela Release PR. |
| `scripts/validate-release.mjs` | Coerência local de versão e configuração. |
| `scripts/normalize-changelog.mjs` | Normalização automática do Markdown da Release PR. |
| `scripts/build-executable.mjs` | Build e teste do Node.js SEA. |
| `scripts/stage-npm-binaries.mjs` | Incorporação dos executáveis Unix ao pacote npm. |
| `scripts/validate-npm-package.mjs` | Instalação isolada e validação do binário nativo. |
| `scripts/publish-npm-package.mjs` | Publicação npm idempotente. |
| `scripts/generate-checksums.mjs` | Geração determinística de `SHA256SUMS`. |

Referências técnicas:

- [Release Please](https://github.com/googleapis/release-please);
- [Release Please Action](https://github.com/googleapis/release-please-action);
- [Node.js Single Executable Applications](https://nodejs.org/api/single-executable-applications.html);
- [GitHub Artifact Attestations](https://docs.github.com/en/actions/concepts/security/artifact-attestations).
