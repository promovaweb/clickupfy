# Instale o ClickUpfy

## Classificação

| Campo | Valor |
| --- | --- |
| Natureza | normativo |
| Escopo | instalação do CLI para uso e desenvolvimento |
| Autoridade | package.json, launcher npm e pipeline de executáveis |

## Requisitos

Para instalar pelo npm ou desenvolver, use Node.js `22.12.0` ou superior. Para
usar um executável standalone, o Node.js não é necessário porque o runtime já
está incorporado.

Você também precisa de uma API key pessoal do ClickUp com acesso a pelo menos
um workspace. A chave só será usada na etapa de
[configuração](configuracao.md).

## Instale pelo npm

O pacote oficial instala o comando global:

```bash
npm install --global @promovaweb/clickupfy
clickupfy --version
clickupfy --help
```

O launcher seleciona o executável compilado em Linux x64, macOS Intel e macOS
Apple Silicon. Em outras plataformas, inclusive Windows, usa o build
JavaScript incluído no pacote.

Uma versão válida na primeira linha confirma que o pacote e o launcher foram
encontrados. Se o terminal não localizar `clickupfy`, confira o diretório
global do npm:

```bash
npm prefix --global
npm bin --global
```

O segundo comando pode não existir em versões novas do npm. Nesse caso, o
diretório de executáveis costuma ser `bin` dentro do prefixo em Linux e macOS.

## Atualize a instalação npm

Quando o ClickUpfy foi instalado globalmente pelo npm, o próprio comando inicia
a instalação da versão nova e confirma o launcher que ficará disponível no
terminal:

```bash
clickupfy upgrade
```

O alvo padrão é `latest`. Para testar um canal ou fixar uma versão, use
`clickupfy upgrade next` ou `clickupfy upgrade 0.5.0`. O comando não substitui um
executável standalone; nesse caso, baixe o archive correspondente na GitHub
Release, confira `SHA256SUMS` e substitua o arquivo no `PATH`.

## Instale um executável standalone

Cada GitHub Release distribui archives para Linux x64, macOS Intel, macOS
Apple Silicon e Windows x64. Baixe o archive da plataforma, extraia
`clickupfy` ou `clickupfy.exe` e mova o arquivo para uma pasta presente no
`PATH`.

No Linux ou macOS:

```bash
chmod +x clickupfy
./clickupfy --version
```

Antes de usar um binário baixado, confira o arquivo `SHA256SUMS` da mesma
release. O nome e a versão do archive precisam corresponder à plataforma
escolhida.

No macOS, o Gatekeeper pode impedir a abertura de um executável sem notarização. Confirme a
origem no repositório oficial e siga a política de segurança da máquina. Não
desative proteções globais para contornar o aviso.

## Instale para desenvolvimento

Clone o repositório independente do ClickUpfy e execute:

```bash
npm install
npm run build
npm link
clickupfy --version
```

`npm link` aponta o comando global para o checkout atual. Use esse modo apenas
quando precisar desenvolver ou validar uma mudança local. Para voltar ao pacote
publicado, remova o link e reinstale a versão do npm.

## Confirme a instalação

Execute três leituras sem credenciais:

```bash
clickupfy --version
clickupfy --help
clickupfy agent skill list
```

O catálogo deve listar `clickupfy-dev`, `clickup-issue-create`,
`clickup-issue-implement` e `clickupfy-release`. A presença das skills confirma
que os assets foram empacotados junto ao CLI.

Ainda não execute comandos remotos. Primeiro
[configure um perfil](configuracao.md).
