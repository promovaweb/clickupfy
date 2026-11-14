# Use as skills para agentes

## Classificação

| Campo | Valor |
| --- | --- |
| Natureza | normativo |
| Escopo | instalação e responsabilidades das skills distribuídas |
| Autoridade | assets embutidos no binário e contrato de agent install |

## O catálogo incluído

O binário distribui cinco skills:

| Skill | Responsabilidade |
| --- | --- |
| `clickupfy-setup` | Configuração de perfil, skills e MCP do projeto. |
| `clickupfy-dev` | Consulta e atualização do trabalho diário de software. |
| `clickup-issue-create` | Criação de tarefa, subtarefas e checklists sem executar a implementação. |
| `clickup-issue-implement` | Execução acompanhada por plano, comentários, tempo, testes e status. |
| `clickupfy-release` | Preparação e acompanhamento de versões e artefatos. |

As skills são instruções. Elas usam o CLI ou o MCP disponível, mas não contêm
credenciais.

## Inspecione antes de instalar

```bash
clickupfy agent skill list
clickupfy agent skill show clickupfy-dev
```

`list` apresenta o catálogo com nome e descrição. `show` imprime a fonte
embutida da skill, útil para revisar permissões e fluxo antes da instalação. As
cinco skills são mantidas em português do Brasil.

## Configure o projeto

Use `$clickupfy-setup` para preparar um repositório novo ou revisar uma
integração existente. A skill executa `clickupfy doctor`, orienta o perfil com
`clickupfy setup` quando necessário, instala as skills por `npx skills add` e
cria o MCP somente depois de confirmar os IDs do ClickUp.

## Instale no projeto

Na raiz do repositório, o ClickUpfy delega a instalação ao gerenciador
`skills`:

```bash
clickupfy agent skill install
```

As skills entram em `.agents/skills/` e o gerenciador registra a origem em
`skills-lock.json`. Esse modo mantém a configuração próxima ao projeto e
permite versionar as instruções.

Para instalar no catálogo global do usuário, em `~/.codex/skills/`:

```bash
clickupfy agent skill install --global
```

Para instalar só algumas skills, informe os nomes:

```bash
clickupfy agent skill install clickupfy-dev clickup-issue-implement
```

Prefira a instalação local quando os projetos usam versões ou instruções diferentes.
Consulte a instalação efetiva com:

```bash
npx skills list
npx skills list --global
```

`--force` é aceito por compatibilidade. A atualização passa pelo próprio
`npx skills add`, que mantém o lockfile e os caminhos canônicos.

Para instalar as skills e, no mesmo passo, gravar o servidor MCP do projeto:

```bash
clickupfy agent install --space 10 --list 30
```

`agent init` é o alias do mesmo comando.

## Crie uma issue sem implementá-la

Peça explicitamente a skill de criação:

```text
Use $clickup-issue-create para transformar esta solicitação em uma tarefa no
ClickUp. Crie subtarefas e checklists de teste, mas não implemente o trabalho.
```

A skill deve obter os status da List, redigir a descrição em Markdown, criar a
tarefa principal e materializar subtarefas e checklists recursivos. A criação
não autoriza editar código nem marcar validações como concluídas.

## Implemente uma issue existente

```text
Use $clickup-issue-implement para executar a tarefa <task-id> até a validação
final.
```

O fluxo lê a tarefa inteira e monta um plano visível. Depois registra o início
e as datas (com time tracking quando aplicável), percorre subtarefas e
checklist items e publica checkpoints. Um item de teste só é resolvido depois
que o comando correspondente passa.

A conclusão exige releitura do estado remoto, regressão aplicável e um status
terminal existente na List.

## Use a skill diária

`clickupfy-dev` é adequada para consultas e mutações pontuais:

```text
Use $clickupfy-dev para ler a tarefa <task-id>, publicar o resultado dos testes
e marcar apenas o checklist correspondente.
```

Escopo e autorização continuam limitados pela instrução recebida, sem que a
skill transforme uma consulta em implementação completa.

## Prepare uma release

`clickupfy-release` lê a documentação de release do próprio repositório e
acompanha versão, changelog, validações e artefatos. Ela não deve ser instalada
como instrução genérica em projetos que apenas consomem o CLI.

## Leia a documentação embutida

Um agente sem acesso ao repositório pode ler a documentação pelo próprio
binário:

```bash
clickupfy --skill
clickupfy --skill mcp
clickupfy skill cli
```

Agora veja como essas skills acessam o ClickUp pelo
[servidor MCP](mcp.md).
