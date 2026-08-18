---
name: clickupfy-setup
description: Configura o ClickUpfy no projeto, instala skills com npx, cria o MCP e confere perfis, arquivos e permissões locais.
---

# Configurar o ClickUpfy

Use esta skill quando um projeto ainda não tiver a integração do ClickUpfy ou
quando perfis, skills, MCP ou arquivos locais precisarem de revisão.

## Fluxo

1. Leia as instruções do projeto e execute `clickupfy doctor`.
2. Quando não houver perfil válido, execute `clickupfy setup` em terminal
   interativo. Não exponha a API key em arquivos, comandos compartilhados ou
   logs.
3. Instale ou reconcilie as skills pelo gerenciador oficial:

   ```bash
   clickupfy agent skill install
   ```

   O comando usa `npx skills add`, mantém `skills-lock.json` e instala somente
   as skills do ClickUpfy.
4. Com os IDs confirmados de account, workspace, Space e List, inicialize o
   MCP do projeto:

   ```bash
   clickupfy agent init --account <perfil> --workspace <id> --space <id> --list <id>
   ```

5. Execute `clickupfy doctor`, `clickupfy agent skill list` e `npx skills list`
   para conferir a configuração, a origem das skills e o servidor MCP.

## Regras

- Preserve entradas existentes em `.mcp.json` e `.codex/config.toml`.
- Use IDs reais confirmados pelo CLI. Não adivinhe workspace, Space, Folder ou
  List.
- Repita o setup sem substituir perfis, credenciais ou configurações de outro
  projeto.
- Informe arquivos criados, arquivos preservados e qualquer pendência.
