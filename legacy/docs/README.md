# Documentação do ClickUpfy

A documentação pública do ClickUpfy é organizada por público e por
responsabilidade.

- [`user/`](user/README.md) contém o percurso completo para instalar,
  configurar e usar o CLI, as skills e o servidor MCP.
- [`../README.md`](../README.md) apresenta o projeto e sua referência rápida.
- [`../RELEASING.md`](../RELEASING.md) documenta o processo técnico de release
  para mantenedores.

O conteúdo de `docs/user/` é a fonte editorial do
[guia portátil](../ebook/README.md). PDF e EPUB são gerados na ordem declarada
em `docs/user/reading-order.txt`.

As referências em `user/referencia-*.md` detalham todos os comandos públicos e
todas as ferramentas MCP, incluindo parâmetros, efeitos, limites e cinco
exemplos por interface. O teste
[`tests/documentation-coverage.test.ts`](../tests/documentation-coverage.test.ts)
confere essa obrigação contra a lista de comandos e contra as ferramentas
registradas em `src/mcp.ts`.
