---
name: clickup-issue-create
description: Converte uma solicitação ou histórico em tarefa Markdown no ClickUp, com subtarefas recursivas e checklists de testes, sem executar o trabalho.
---

# Criar Tarefa no ClickUp

Transformar o input atual ou o histórico indicado pelo usuário em uma tarefa
do ClickUp. Criar a estrutura solicitada sem implementar a solução, alterar
arquivos do projeto, iniciar time tracking ou avançar status.

## Documentação contínua

Se a tarefa criada pedir mudança no ClickUpfy, inclua no corpo uma seção de
documentação com os capítulos de `docs/user/` afetados, a referência de CLI ou
MCP afetada, a atualização de `docs/user/reading-order.txt`, a versão do ebook
e os comandos `npm run ebook` e `npm run ebook:verify`. Para cada comando ou
ferramenta MCP acrescentado ou alterado, registre a exigência de explicar todos
os parâmetros, retorno, permissões, limites e cinco exemplos diferentes.

Não trate README, texto de ajuda, changelog ou teste como substituto do manual
do usuário. Quando a alteração não mudar a interface pública, declare esse
limite na tarefa para não gerar documentação especulativa.

## Limites

- Usar somente fatos e requisitos presentes na fonte.
- Preservar o significado, as restrições, os exemplos e as condições de
  aprovação.
- Não inventar prazo, responsável, prioridade, status, teste ou subtarefa.
- Não alterar a fonte recebida nem editar o repositório.
- Não resolver checklist items durante a criação.
- Remover credenciais, tokens, dados pessoais e URLs assinadas da versão que
  será enviada ao ClickUp. Informar a omissão ao usuário.
- Solicitar esclarecimento antes de criar quando faltar o título ou uma
  escolha mudar materialmente a estrutura.

## Ferramentas

Usar o MCP do projeto:

- `clickupfy_mcp_context` para confirmar account e List.
- `clickupfy_tasks_search` para detectar uma possível duplicata.
- `clickupfy_task_create` com `markdownContent` para tarefas e subtarefas.
- `clickupfy_checklist_create` para criar um checklist.
- `clickupfy_checklist_item_create` para acrescentar cada teste.
- `clickupfy_task_get` para validar a árvore criada.

Usar o CLI equivalente apenas quando o MCP não estiver disponível:

```bash
clickupfy task create \
  --list <list-id> \
  --name "<título>" \
  --markdown-content "<markdown>"

clickupfy checklist create <task-id> --name "Testes"
clickupfy checklist item-create <checklist-id> --name "<teste>"
```

## Interpretar a fonte

Usar a mensagem atual, o histórico da conversa ou o material explicitamente
indicado pelo usuário. Se a entrada já for um Markdown completo para a tarefa,
preservá-lo como `markdownContent`. Caso contrário, organizar o conteúdo sem
mudar o sentido:

```markdown
# <título>

## Resultado esperado

<resultado descrito na fonte>

## Escopo

<entregas e limites explícitos>

## Requisitos

- <requisito verificável>

## Condições de aprovação

- <condição informada>

## Referências

- <links e artefatos seguros>
```

O nome da tarefa fica no campo `name`. Não é necessário repetir um H1 quando a
fonte não o trouxer. Manter seções somente quando houver conteúdo real.

Reconhecer uma subtarefa apenas quando a fonte declarar uma unidade separada
de trabalho, uma hierarquia ou uma dependência que deva ter acompanhamento
próprio. Preservar subtarefas aninhadas na mesma relação de parentesco.

Reconhecer testes quando a fonte os nomear como testes, validações automatizadas
ou cenários verificáveis. Criar um checklist `Testes` na tarefa proprietária e
um item por teste. Condições de aprovação que não sejam testes permanecem no
corpo Markdown e não viram checklist por inferência.

## Mostrar o plano de criação

Antes da primeira escrita, apresentar na conversa:

- título e List de destino.
- seções Markdown que serão criadas.
- árvore completa de subtarefas.
- checklists e itens por tarefa.
- campos opcionais que vieram explicitamente da fonte.

Não criar nada enquanto houver ambiguidade material. Se a estrutura for
inequívoca, prosseguir depois de exibir o plano, sem solicitar uma confirmação
redundante.

## Criar e validar

Executar na ordem:

1. Chamar `clickupfy_mcp_context` e confirmar a List.
2. Pesquisar o título exato. Se já existir uma tarefa plausivelmente
   equivalente, mostrar a correspondência e solicitar que o usuário escolha
   entre reutilizar a tarefa ou criar outra.
3. Criar a tarefa principal com `markdownContent`.
4. Criar cada subtarefa em profundidade, na mesma List, passando o ID da tarefa
   pai no campo `parent`.
5. Criar o checklist `Testes` na tarefa correspondente e acrescentar cada item
   ainda aberto.
6. Chamar `clickupfy_task_get` na raiz e comparar a árvore persistida com o
   plano mostrado.
7. Reler individualmente cada subtarefa quando a resposta da raiz não trouxer
   o corpo Markdown completo.

Não compensar uma falha apagando tarefas já criadas. Informar os IDs
persistidos, o ponto exato da falha e o restante que não foi criado.

## Entrega

Responder com:

- ID, nome e link da tarefa principal.
- IDs e hierarquia das subtarefas.
- checklists e quantidade de itens.
- confirmação de que o corpo foi salvo como Markdown.
- qualquer parte omitida por segurança ou deixada pendente por falha.

Não comentar na tarefa, iniciar timer, mudar status ou marcar checklist como
efeito colateral desta skill.
