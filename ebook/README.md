# Ebook do guia do usuário

<!-- markdownlint-disable MD033 -->
<p align="center">
  <picture>
    <source srcset="../brand/logo/icon.svg" type="image/svg+xml">
    <img src="../brand/logo/icon.png" alt="Logo do ClickUpfy" width="128">
  </picture>
</p>
<!-- markdownlint-enable MD033 -->

Esta pasta publica o conteúdo completo de `docs/user/` em PDF e EPUB. Os
arquivos Markdown são a única fonte editorial; não edite os artefatos gerados.

O sistema visual, Inter no corpo, Manrope nos títulos, a composição da capa, o
sumário e os
tratamentos de código, tabela e navegação reutilizam o mesmo design do ebook do
Specsfy.

## Idioma obrigatório

Todo o conteúdo editorial do ebook e do PDF do ClickUpfy usa Português do
Brasil. Termos técnicos em inglês permanecem quando são a forma adotada pelo
ecossistema.

O build recusa a publicação quando `.ebook/metadata.yaml` não declara
`lang: "pt-BR"` ou quando o template HTML não usa `lang="pt-BR"`.

## Edição vigente

A versão está em [`VERSION`](VERSION) e segue SemVer:

- `PATCH`: correção de texto, link, exemplo ou apresentação.
- `MINOR`: novo capítulo, percurso ou ampliação material.
- `MAJOR`: reorganização incompatível da jornada documental.

Os artefatos usam o padrão:

```text
ClickUpfy-Guia-do-Usuario-v<versão>.pdf
ClickUpfy-Guia-do-Usuario-v<versão>.epub
```

Cada build mantém somente as cinco edições SemVer mais recentes.
[`build.json`](build.json) registra versão, ordem, digest das fontes e hashes
dos dois formatos.

As tabelas `## Classificação` continuam no Markdown. O build registra seus
campos no manifesto e as remove dos formatos de leitura.

## Gerar

Na raiz do repositório ClickUpfy:

```bash
npm run ebook
```

O build exige que `docs/user/reading-order.txt` inclua cada página Markdown de
`docs/user/` exatamente uma vez.

## Verificar

```bash
npm run ebook:verify
```

A verificação confere digest das fontes, hashes, estrutura XML do EPUB, links
internos e navegação do PDF.

## Regra de atualização

Toda alteração em `docs/user/`, inclusive imagens, exige:

1. ajustar `VERSION` conforme o impacto editorial;
2. atualizar `reading-order.txt` quando uma página mudar de lugar;
3. executar `npm run ebook`;
4. executar `npm run ebook:verify`.
