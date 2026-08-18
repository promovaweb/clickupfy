# Use as skills para agentes

## Classificação

| Campo | Valor |
| --- | --- |
| Natureza | normativo |
| Escopo | instalação e responsabilidades das skills distribuídas |
| Autoridade | assets empacotados e contrato de agent init |

## O catálogo incluído

O pacote distribui quatro skills:

| Skill | Responsabilidade |
| --- | --- |
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

`list` apresenta o catálogo. `show` imprime a fonte empacotada da skill, útil
para revisar permissões e fluxo antes da instalação. As quatro skills são
mantidas em português do Brasil.

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

Prefira a instalação local quando projetos usam versões ou regras diferentes.
Consulte a instalação efetiva com:

```bash
npx skills list
npx skills list --global
```

`--force` é aceito por compatibilidade. A atualização passa pelo próprio
`npx skills add`, que mantém o lockfile e os caminhos canônicos:

```bash
clickupfy agent skill install --force
```

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

O fluxo lê a tarefa inteira, monta um plano visível, registra início, datas e
time tracking quando aplicável, percorre subtarefas e checklist items e publica
checkpoints. Um item de teste só é resolvido depois do comando correspondente
passar.

A conclusão exige releitura do estado remoto, regressão aplicável e um status
terminal existente na List.

## Use a skill diária

`clickupfy-dev` é adequada para consultas e mutações pontuais:

```text
Use $clickupfy-dev para ler a tarefa <task-id>, publicar o resultado dos testes
e marcar apenas o checklist correspondente.
```

Escopo e autorização continuam limitados pelo pedido. A skill não transforma
uma consulta em implementação completa.

## Prepare uma release

`clickupfy-release` lê a documentação de release do próprio repositório e
acompanha versão, changelog, validações e artefatos. Ela não deve ser instalada
como regra genérica em projetos que apenas consomem o CLI.

Agora veja como essas skills acessam o ClickUp pelo
[servidor MCP](mcp.md).
