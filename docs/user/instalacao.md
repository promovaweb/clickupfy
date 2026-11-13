# Instale o ClickUpfy

## Classificação

| Campo | Valor |
| --- | --- |
| Natureza | normativo |
| Escopo | instalação do binário para uso e desenvolvimento |
| Autoridade | pacote npm, GitHub Release e comandos de manutenção |

## Requisitos

Para usar, nenhum runtime: o ClickUpfy é um binário compilado. O pacote npm
serve como launcher e exige Node.js 18.17 ou superior apenas para baixar e
executar o binário da plataforma.

Para desenvolver, use Bun 1.4.4 ou superior.

Você também precisa de uma API key pessoal do ClickUp com acesso a pelo menos
um workspace. A chave só será usada na etapa de
[configuração](configuracao.md).

## Instale pelo npm

O pacote oficial instala o comando global:

```bash
npm install -g @promovaweb/clickupfy
clickupfy --version
clickupfy --help
```

Na primeira execução, o launcher baixa o binário da plataforma, confere o
SHA256 contra o `SHA256SUMS` da release e o mantém em cache. Uma versão válida
na primeira linha confirma que o pacote e o binário foram encontrados. Se o
terminal não localizar `clickupfy`, confira o diretório global do npm:

```bash
npm prefix --global
```

Em Linux e macOS, o diretório de executáveis costuma ser `bin` dentro do
prefixo. No Windows, o prefixo contém `clickupfy.cmd`.

## Atualize a instalação

O próprio comando atualiza as duas formas de instalação:

```bash
clickupfy upgrade
```

O alvo padrão é `latest`. Para fixar uma versão, use
`clickupfy upgrade 1.0.1`. Instalado pelo npm, o comando roda
`npm install -g @promovaweb/clickupfy@<alvo>`. Como binário avulso, baixa o
arquivo da plataforma e o `SHA256SUMS` da GitHub Release, confere o hash e
troca o executável. Rodando direto do código-fonte, o comando sai com exit code
2.

## Instale um binário avulso

Cada GitHub Release publica um binário por plataforma, com o `SHA256SUMS`:

| Arquivo | Plataforma |
| --- | --- |
| `clickupfy-linux-x64` | Linux x64 |
| `clickupfy-linux-arm64` | Linux ARM64 |
| `clickupfy-darwin-x64` | macOS Intel |
| `clickupfy-darwin-arm64` | macOS Apple Silicon |
| `clickupfy-windows-x64.exe` | Windows x64 |

Baixe o arquivo da plataforma, confira o hash e mova para uma pasta presente no
`PATH`.

No Linux ou macOS:

```bash
sha256sum clickupfy-linux-x64        # macOS: shasum -a 256 clickupfy-darwin-arm64
chmod +x clickupfy-linux-x64
mv clickupfy-linux-x64 ~/.local/bin/clickupfy
clickupfy --version
```

Compare o hash impresso com a linha correspondente do `SHA256SUMS`.

Antes de usar um binário baixado, confira o arquivo `SHA256SUMS` da mesma
release. O nome do arquivo precisa corresponder à plataforma escolhida.

No macOS, o Gatekeeper pode impedir a abertura de um executável sem
notarização. Confirme a origem no repositório oficial e siga a política de
segurança da máquina. Não desative proteções globais para contornar o aviso.

## Instale para desenvolvimento

Clone o repositório independente do ClickUpfy e execute:

```bash
bun install
bun run build
./dist/clickupfy --version
```

Para rodar sem compilar:

```bash
bun run dev -- --help
bun run dev -- about --json
bun run dev -- mcp --list
```

Use esse modo apenas quando precisar desenvolver ou validar uma mudança local.
Para voltar ao pacote publicado, instale a versão do npm.

## Confirme a instalação

Execute três leituras sem credenciais:

```bash
clickupfy --version
clickupfy --help
clickupfy agent skill list
```

O catálogo deve listar `clickupfy-setup`, `clickupfy-dev`,
`clickup-issue-create`, `clickup-issue-implement` e `clickupfy-release`. A
presença das skills confirma que os assets foram empacotados junto ao binário.

Ainda não execute comandos remotos. Primeiro
[configure um perfil](configuracao.md).

## Windows: PATH e PowerShell

No Windows, inclua o diretório que contém `clickupfy.cmd` no PATH do seu usuário
e abra outro terminal. Para o binário avulso, extraia `clickupfy-windows-x64.exe`
para uma pasta própria, adicione essa pasta ao PATH em Variáveis de Ambiente e
abra outro terminal.

Se o PowerShell impedir a execução de `npm.ps1`, use `npm.cmd` e
`clickupfy.cmd` explicitamente, ou execute pelo Prompt de Comando. Isso evita
alterar a política de execução da máquina.

Para capturar saída JSON com acentos, prefira PowerShell 7 ou redirecionamento
pelo `cmd.exe`. No PowerShell 5.1, configure UTF-8 na sessão antes de capturar:

```powershell
[Console]::OutputEncoding = New-Object System.Text.UTF8Encoding($false)
clickupfy.cmd task list --list 30 --json | ConvertFrom-Json
```

O ClickUpfy emite UTF-8. Alterar a codepage dentro do processo filho não
corrige a leitura feita pelo PowerShell pai.

As permissões `0700` e `0600` são verificadas apenas em Linux e macOS. No
Windows, o `doctor` marca essas verificações como não aplicáveis; as ACLs NTFS
precisam ser conferidas separadamente.

Se houver erro de escrita, feche programas que mantêm o arquivo aberto e
confira o atributo somente leitura. As gravações usam substituição atômica e
removem o temporário mesmo se a substituição falhar.
