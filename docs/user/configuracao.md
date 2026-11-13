# Configure perfis e credenciais

## Classificação

| Campo | Valor |
| --- | --- |
| Natureza | normativo |
| Escopo | autenticação, perfis e armazenamento local |
| Autoridade | setup, schema de configuração, cofre e resolução de perfis |

## Crie a API key

Use uma API key pessoal criada nas configurações do ClickUp. O ClickUpfy
valida a chave antes de salvar, consulta o usuário autenticado e lista os
workspaces permitidos.

Não cole a chave em issue, comentário, arquivo `.env` versionado, `.mcp.json`,
`.codex/config.toml` ou comando compartilhado no histórico da equipe. Em um
terminal interativo, prefira o setup com prompt oculto:

```bash
clickupfy setup
```

Escolha um nome local para o perfil e selecione o workspace. O nome vira um
identificador normalizado, como `promovaweb` ou `cliente-a`. `install` continua
aceito como alias de `setup`.

A chave fica no cofre cifrado como `clickup.<perfil>.api_key`. Nenhum comando,
tool ou tela mostra o valor: `status` e `account show` exibem a versão
mascarada e `account list` a omite.

## Automatize o setup quando necessário

Em uma automação isolada, o setup aceita parâmetros:

```bash
clickupfy setup \
  --api-key "$CLICKUP_API_KEY" \
  --name "promovaweb" \
  --workspace "9007154145" \
  --non-interactive
```

Evite colocar a chave diretamente em um script. Leia o valor de um secret
manager ou de uma variável protegida e apague o ambiente temporário depois da
execução. `--token` continua aceito como alias de `--api-key`.

## Entenda os arquivos locais

Por padrão, os arquivos ficam em `~/.clickupfy/`:

| Arquivo | Conteúdo | Permissão |
| --- | --- | --- |
| `accounts.json` | perfis, sem segredos | 0600 |
| `credentials.json` | envelope AES-256-GCM com as API keys | 0600 |
| `master.key` | master key em hexadecimal | 0600 |
| `settings.json` | preferências em texto claro | 0600 |

A pasta é criada com `0700`. O `accounts.json` permite vários perfis:

```json
{
  "version": 1,
  "activeAccount": "promovaweb",
  "accounts": {
    "promovaweb": {
      "name": "promovaweb",
      "user": {
        "id": 123,
        "username": "Desenvolvedor",
        "email": "dev@example.com"
      },
      "workspace": {
        "id": "456",
        "name": "Engenharia"
      },
      "createdAt": "2026-11-13T12:00:00.000Z",
      "updatedAt": "2026-11-13T12:00:00.000Z"
    }
  }
}
```

Esse arquivo pode ser lido e copiado sem expor a chave. A API key de cada perfil
fica no cofre e exige a master key, que vem de `CLICKUPFY_MASTER_KEY` ou de
`~/.clickupfy/master.key`.

## Venha do ClickUpfy 0.9.0

Na primeira execução de um comando que lê perfis, quando o `accounts.json`
ainda não existe e o config antigo existe (`PROMOVAWEB_CLICKUPFY_CONFIG` ou
`~/clickupfy/config.json`), o binário importa cada perfil: os metadados vão para
`accounts.json` e cada API key para o cofre.

O arquivo antigo só é lido. Ele não é alterado nem apagado, então o ClickUpfy
0.9.0 continua funcionando durante a transição. O stderr mostra
`Imported N profile(s) from <caminho> into the vault.` uma única vez.

Para repetir a importação sob demanda:

```bash
clickupfy account import
clickupfy account import --force
```

Sem `--force`, perfis que já existem são pulados e aparecem em `skipped`; com
`--force`, eles são substituídos pelos dados do arquivo antigo. Em JSON, o
comando devolve `{ source, imported, skipped, activeAccount }`, sem chaves.

## Gerencie perfis

Use comandos que mascaram a API key:

```bash
clickupfy account list
clickupfy account show
clickupfy status
clickupfy whoami
```

`status` mostra o caminho do `accounts.json`, o perfil resolvido, se ele é o
ativo, a chave mascarada, o usuário e o workspace. Não chama a API. `whoami`
faz uma chamada autenticada e confirma se a chave ainda é válida.

Para conferir o setup local, as permissões dos arquivos, o schema, o cofre e os
arquivos de integração do projeto, execute:

```bash
clickupfy doctor
```

Esse diagnóstico não faz uma chamada ao ClickUp. Use `clickupfy doctor --online`
para validar a API key remotamente e ler as skills instaladas com
`npx skills list`.

Para trocar o perfil ativo:

```bash
clickupfy account use cliente-a
```

Para usar outro perfil em um único comando, sem alterar o ativo:

```bash
clickupfy --account cliente-a task get 86abc123
```

A variável `PROMOVAWEB_CLICKUPFY_ACCOUNT` oferece a mesma seleção em
automações. A ordem de resolução é `--account`, a variável e o perfil ativo. A
variável `PROMOVAWEB_CLICKUPFY_CONFIG` aponta para outro config antigo e é útil
em testes ou ambientes efêmeros.

## Troque o workspace associado

Liste os workspaces autorizados e escolha um deles:

```bash
clickupfy workspace list
clickupfy workspace use 9007154145
```

Essa ação altera o workspace do perfil resolvido. Configurações de projeto que
fixam `--workspace` precisam continuar correspondendo ao perfil.

## Remova um perfil

```bash
clickupfy account remove cliente-antigo
```

O comando pede confirmação e apaga os metadados e a credencial do perfil. Em
automação, `--yes` confirma sem prompt. A remoção apaga o perfil local, não
revoga a API key no ClickUp. Revogue a chave no ClickUp quando ela não for mais
necessária.

Com o perfil validado, prepare o [primeiro projeto](primeiro-projeto.md).
