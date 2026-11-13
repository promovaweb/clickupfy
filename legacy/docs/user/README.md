# Guia completo do usuário

<!-- markdownlint-disable MD033 -->
<p align="center">
  <picture>
    <source srcset="../../brand/logo/icon.svg" type="image/svg+xml">
    <img src="../../brand/logo/icon.png" alt="Logo do ClickUpfy" width="128">
  </picture>
</p>
<!-- markdownlint-enable MD033 -->

O ClickUpfy conecta o trabalho mantido no ClickUp ao terminal e aos agentes de
código. Um único executável configura vários perfis, percorre a hierarquia do
ClickUp, administra tarefas, checklists, Sprints, comentários e time tracking,
instala skills no projeto e oferece as mesmas operações por MCP.

Este guia ensina essa jornada em sequência. Você começa instalando o CLI e
associando uma API key a um workspace. Depois encontra os IDs do projeto,
executa uma tarefa completa pelo terminal e prepara um MCP restrito para que o
agente trabalhe somente na List autorizada.

## Classificação

| Campo | Valor |
| --- | --- |
| Natureza | normativo |
| Escopo | percurso completo do usuário do ClickUpfy |
| Autoridade | interfaces públicas do CLI, servidor MCP e skills distribuídas |

## Leia online ou como ebook

Estas páginas também formam o **ClickUpfy — Guia completo do usuário**. A
[pasta do ebook](../../ebook/README.md) publica a versão vigente em PDF e EPUB
e registra os hashes que comprovam a origem comum dos formatos.

O PDF favorece leitura, compartilhamento e impressão. O EPUB se adapta ao
tamanho de fonte e ao leitor digital. Os dois são reconstruídos sempre que uma
página desta documentação muda.

## Percurso pedagógico

Siga esta ordem na primeira leitura:

1. [Entenda o ClickUpfy](conceitos.md) e os limites entre ClickUp, CLI, MCP e
   skills.
2. [Instale o CLI](instalacao.md) pelo npm ou por um executável standalone.
3. [Configure perfis e credenciais](configuracao.md) sem colocar a API key no
   repositório.
4. Consulte a [referência de perfis e hierarquia](referencia-cli-perfis-hierarquia.md)
   sempre que precisar de parâmetro, efeito persistente ou variação de comando.
5. [Prepare o primeiro projeto](primeiro-projeto.md) e confira o escopo antes
   de permitir escrita.
6. [Navegue pela hierarquia](hierarquia.md) até encontrar Space, Folder, List
   e Sprint Folder.
7. [Trabalhe com tarefas e checklists](tarefas.md), incluindo subtarefas,
   Markdown, datas e comentários.
8. Consulte a [referência de tarefas, checklists, comentários e tempo](referencia-cli-tarefas.md)
   para parâmetros, formatos e confirmações de escrita.
9. [Planeje Sprints](sprints.md) e acompanhe avanço por tarefas e Sprint
   Points.
10. Consulte a [referência de Sprints](referencia-cli-sprints.md) para os
    parâmetros de relatório, associação e Sprint Points.
11. [Registre tempo](time-tracking.md) no item em execução.
12. [Instale e use as skills](agentes.md) que acompanham criação,
    implementação e release.
13. [Conecte um agente por MCP](mcp.md) com IDs fixos e opção read-only.
14. Consulte a [referência de Docs, skills e servidor MCP](referencia-cli-docs-agentes.md)
    para os recursos de documentação dentro do ClickUp e a integração no projeto.
15. Use a [referência MCP de contexto e hierarquia](referencia-mcp-contexto-hierarquia.md)
    para conhecer cada argumento aceito pelas ferramentas de navegação.
16. Consulte a [referência MCP de Docs e administração](referencia-mcp-docs-administracao.md)
    para o workspace, Docs, páginas e ferramentas condicionais do servidor.
17. Consulte a [referência MCP de trabalho](referencia-mcp-trabalho.md) para
    operações de tarefas, Sprints, checklists, comentários e tempo.
18. [Consulte a referência do CLI](cli.md) para comandos, argumentos e
    formatos de saída.
19. [Resolva falhas comuns](solucao-de-problemas.md) de autenticação, escopo,
    status e integração.

## O modelo mental em uma frase

O arquivo global guarda credenciais. Os arquivos do projeto guardam somente o
perfil e os IDs autorizados. O `.mcp.json` atende clientes que usam JSON; o
`.codex/config.toml` atende o Codex.

Essa divisão permite usar o mesmo ClickUpfy em vários projetos sem duplicar a
API key. Um projeto pode apontar para a List de um produto, enquanto outro
aponta para a List de um cliente. O MCP de cada raiz recusa IDs diferentes dos
que foram fixados.

Comece por [entender o papel de cada camada](conceitos.md).
