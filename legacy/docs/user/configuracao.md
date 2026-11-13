# Configure perfis e credenciais

## Classificação

| Campo | Valor |
| --- | --- |
| Natureza | normativo |
| Escopo | autenticação, accounts e armazenamento local |
| Autoridade | setup, schema de configuração e resolução de accounts |

## Crie a API key

Use uma API key pessoal criada nas configurações do ClickUp. O ClickUpfy
valida a chave antes de salvar, consulta o usuário autenticado e lista os
workspaces permitidos.

Não cole a chave em issue, comentário, arquivo `.env` versionado, `.mcp.json`,
`.codex/config.toml` ou comando compartilhado no histórico da equipe. Em um
terminal interativo,
prefira o setup com prompt oculto:

```bash
clickupfy install
```

Escolha um nome local para o perfil e selecione o workspace. O nome vira um
identificador normalizado, como `promovaweb` ou `cliente-a`.

## Automatize o setup quando necessário

Em uma automação isolada, o setup aceita parâmetros:

```bash
clickupfy install \
  --api-key "pk_..." \
  --name "Promovaweb" \
  --workspace "123456" \
  --non-interactive
```

Evite colocar a chave diretamente em um script. Leia o valor de um secret
manager ou de uma variável protegida e apague o ambiente temporário depois da
execução.

## Entenda o arquivo local

Por padrão, a configuração fica em:

```text
~/clickupfy/config.json
```

O diretório recebe permissão `0700` e o arquivo `0600`. A API key precisa
estar no JSON porque o CLI autentica chamadas futuras. Essa proteção limita a
leitura ao usuário local, mas não substitui os cuidados com backup, malware ou
pastas sincronizadas.

O schema permite vários accounts:

```json
{
  "version": 1,
  "activeAccount": "promovaweb",
  "accounts": {
    "promovaweb": {
      "name": "Promovaweb",
      "apiKey": "pk_...",
      "user": {
        "id": 123,
        "username": "Desenvolvedor"
      },
      "workspace": {
        "id": "456",
        "name": "Engenharia"
      },
      "createdAt": "2026-07-29T12:00:00.000Z",
      "updatedAt": "2026-07-29T12:00:00.000Z"
    }
  }
}
```

## Gerencie accounts

Use comandos que mascaram a API key:

```bash
clickupfy account list
clickupfy account show
clickupfy status
clickupfy whoami
```

`status` mostra o caminho da configuração, o account resolvido e o workspace.
`whoami` faz uma chamada autenticada e confirma se a chave ainda é válida.

Para conferir o setup local, as permissões do arquivo, o schema e os arquivos
de integração do projeto, execute:

```bash
clickupfy doctor
```

Esse diagnóstico não faz uma chamada ao ClickUp. Use `clickupfy whoami` quando
precisar validar a API key remotamente.

Para trocar o perfil ativo:

```bash
clickupfy account use cliente-a
```

Para usar outro account em um único comando, sem alterar o ativo:

```bash
clickupfy --account cliente-a task get 86abc123
```

A variável `PROMOVAWEB_CLICKUPFY_ACCOUNT` oferece a mesma seleção em
automações. A variável `PROMOVAWEB_CLICKUPFY_CONFIG` aponta para outro JSON e
é útil em testes ou ambientes efêmeros.

## Troque o workspace associado

Liste os workspaces autorizados e escolha um deles:

```bash
clickupfy workspace list
clickupfy workspace use 123456
```

Essa ação altera o workspace do account atual. Configurações de projeto que
fixam `--workspace` precisam continuar correspondendo ao perfil.

## Remova um perfil

```bash
clickupfy account remove cliente-antigo
```

O CLI pede confirmação. Em automação, `--yes` confirma sem prompt. A remoção
apaga o perfil local, não revoga a API key no ClickUp. Revogue a chave no
ClickUp quando ela não for mais necessária.

Com o perfil validado, prepare o
[primeiro projeto](primeiro-projeto.md).
