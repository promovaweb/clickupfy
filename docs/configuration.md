# Configuração e credenciais

Tudo que o binário persiste fica em `~/.{{bin}}/`:

| Arquivo | Conteúdo | Permissão |
| --- | --- | --- |
| `settings.json` | preferências em texto claro | 0600 |
| `credentials.json` | envelope AES-256-GCM com os segredos | 0600 |
| `master.key` | master key em hexadecimal, criada na primeira gravação | 0600 |
| `accounts.json` | perfis do ClickUp, sem segredos | 0600 |

A pasta é criada com 0700. A variável `{{BIN}}_HOME` troca a raiz, útil em
testes e CI.

## settings.json

Keys em notação de ponto. O schema do esqueleto:

| Key | Tipo | Padrão | Função |
| --- | --- | --- | --- |
| `output.format` | `text` ou `json` | `text` | formato padrão da saída do CLI |
| `output.colors` | boolean | `true` | cores ANSI na saída de texto |
| `tui.initialTab` | `overview` ou `about` | `overview` | aba aberta ao iniciar a TUI |
| `tui.theme` | `night` ou `day` | `night` | paleta da TUI |
| `telemetry.enabled` | boolean | `false` | reservado para projetos derivados |

Commands:

```bash
{{bin}} config list
{{bin}} config get tui.theme
{{bin}} config set output.format json
{{bin}} config unset telemetry.enabled
{{bin}} config path
{{bin}} config schema
```

Keys fora do schema são aceitas como texto. Para que uma key nova ganhe tipo,
padrão e documentação, acrescente-a a `SETTINGS_SCHEMA` em
`src/config/settings.ts`.

## credentials.json

O arquivo guarda um envelope:

```json
{ "version": 1, "algorithm": "aes-256-gcm", "iv": "<base64>", "tag": "<base64>", "data": "<base64>" }
```

`data` é o JSON `{ "name": "value" }` cifrado. Names seguem
`[a-z0-9][a-z0-9_.-]{0,63}`, por exemplo `openai.api_key` ou `github.token`.

A master key tem 32 bytes e vem, nesta ordem:

1. da variável `{{BIN}}_MASTER_KEY` (64 caracteres hexadecimais);
2. do arquivo `master.key`, gerado automaticamente.

Gere uma chave para a variável com `openssl rand -hex 32`. Quando a variável
está definida, `master.key` é ignorado.

Commands:

```bash
{{bin}} credentials set openai.api_key            # digita sem eco
printf '%s' "$TOKEN" | {{bin}} credentials set github.token --stdin
{{bin}} credentials get openai.api_key            # mascarado
{{bin}} credentials get openai.api_key --reveal   # em claro
{{bin}} credentials list
{{bin}} credentials remove github.token
{{bin}} credentials status
{{bin}} credentials clear --yes
```

## O que a cifra protege

A cifra protege o arquivo contra leitura casual, cópia em backup e varredura
do disco por outras ferramentas. Quem tem acesso à mesma conta do sistema
consegue ler `master.key` e decifrar o conteúdo. Para um nível acima, injete a
chave por `{{BIN}}_MASTER_KEY` a partir de um gerenciador de segredos e não
grave `master.key` em disco.

## Usar uma credencial no código

```ts
import { getCredential } from "../config/credentials.ts";

const token = getCredential("github.token"); // lança AppError(4) quando não existe
```

Nunca escreva o valor em log, em erro, em `data` do `--json` nem em
resposta de tool MCP.

## Perfis do ClickUp

Cada perfil do ClickUp reúne um nome local, o usuário, um workspace e a API
key. Os metadados ficam em `accounts.json`, gravado com modo 0600 por
substituição atômica, no formato:

```json
{
  "version": 1,
  "activeAccount": "work",
  "accounts": {
    "work": {
      "name": "work",
      "user": { "id": 1234, "username": "luiz", "email": "luiz@example.com" },
      "workspace": { "id": "9007154145", "name": "Promovaweb" },
      "createdAt": "2026-11-13T12:00:00.000Z",
      "updatedAt": "2026-11-13T12:00:00.000Z"
    }
  }
}
```

`version` é `1`, `activeAccount` é o id do perfil ativo (ou `null`) e
`accounts` mapeia o id de cada perfil para seus metadados. O arquivo não
guarda segredo nenhum: a API key de cada perfil fica no cofre como
`clickup.<perfil>.api_key` e é lida com `getCredential()`. Por isso
`accounts.json` pode ser lido e copiado sem expor a chave, e o cofre continua
sendo o único lugar que exige a master key.

### Migração do arquivo antigo

Na primeira execução de um command que lê perfis, quando `accounts.json`
ainda não existe e o config antigo existe (`PROMOVAWEB_CLICKUPFY_CONFIG` ou
`~/clickupfy/config.json`), o binário importa cada perfil: os metadados vão
para `accounts.json` e cada API key para o cofre como
`clickup.<perfil>.api_key`.

- O arquivo antigo só é lido. Ele não é alterado nem apagado, então o
  ClickUpfy 0.9.0 continua funcionando durante a transição.
- O stderr mostra `Imported N profile(s) from <caminho> into the vault.` uma
  única vez, na importação automática.
- Config antigo inválido sai com 3 (`CONFIG`) e informa o caminho.
- Sem o arquivo antigo, o binário grava um `accounts.json` vazio e não repete
  a checagem.

Para repetir a importação sob demanda use `{{bin}} account import`. Sem
`--force`, perfis que já existem são pulados e aparecem em `skipped`; com
`--force`, eles são substituídos pelos dados do arquivo antigo. Em JSON, o
command devolve `{ source, imported, skipped, activeAccount }`, sem chaves.

## Variáveis de ambiente

| Variável | Efeito |
| --- | --- |
| `{{BIN}}_HOME` | troca `~/.{{bin}}/` por outra pasta |
| `{{BIN}}_MASTER_KEY` | master key em hex; dispensa `master.key` |
| `PROMOVAWEB_CLICKUPFY_ACCOUNT` | perfil usado quando `--account` não é passado; tem prioridade sobre o perfil ativo |
| `PROMOVAWEB_CLICKUPFY_CONFIG` | caminho do config antigo do ClickUpfy 0.9.0 lido na migração; padrão `~/clickupfy/config.json` |
| `PROMOVAWEB_CLICKUPFY_API_URL` | base da API v2 do ClickUp; padrão `https://api.clickup.com/api/v2` |
| `PROMOVAWEB_CLICKUPFY_API_URL_V3` | base da API v3 do ClickUp; padrão `https://api.clickup.com/api/v3` |
| `NO_COLOR` | desliga cores na saída de texto |

## Rotação da master key

| Command ou option | Efeito |
| --- | --- |
| `credentials rotate-key` | Gera chave aleatória, recifra o cofre e grava `master.key` com 0600. |
| `credentials rotate-key --from-env` | Lê a chave atual de `master.key` e usa `{{BIN}}_MASTER_KEY` como chave nova. |

`{{bin}} credentials rotate-key` abre o cofre com a chave atual e preserva
seus valores ao recifrar. A opção `--from-env` exige a chave atual em disco
e uma chave nova de 64 caracteres hexadecimais na variável. A chave nova
também é gravada em `master.key` com 0600. Sem cofre ou chave atual, o command
retorna exit code 4 (`CREDENTIALS`). Em JSON, retorna `{ rotated, source }`,
sem o conteúdo das chaves.

Sem `--from-env`, se a chave anterior veio da variável, remova essa variável
do shell após a rotação: `unset {{BIN}}_MASTER_KEY`. Ela tem prioridade sobre
o arquivo nas próximas execuções. Não execute gravações no cofre durante a
rotação. Os dois arquivos são preparados antes da substituição; falhas de
gravação comuns restauram a chave anterior por substituição atômica. Se essa
restauração também falhar, os arquivos de recuperação ficam na pasta
`.rotate-*` indicada pelo erro; a cópia `previous.key` mantém permissão 0600. Como são dois arquivos, uma
interrupção do processo entre as substituições exige recuperação de backup.
