# 0009 Catálogo genérico da API

Status: draft

## Goal

Cobrir endpoints que os commands dedicados não cobrem.

## Behavior

`api list|describe|call` sobre o catálogo gerado de `api/v2.json`, `api/v3.json` e `api/overrides.json`; no MCP, uma tool por operação, respeitando `--read-only`.

## Design

Catálogo em `src/api/` gerado por script Bun. Referência: `legacy/src/api/`, `legacy/scripts/generate-api.mjs`.

## Surface

- Adiciona o command `api` com seus verbos.
- Adiciona as tools de operação do catálogo.

## Tasks

- [ ] Gerador do catálogo `#termfy-api-import`
- [ ] Commands `#termfy-cli`
- [ ] Tools `#termfy-mcp`

## Tests

- [ ] `api describe` de uma operação conhecida
- [ ] Tools de escrita omitidas em `--read-only`

## Notes

- 2026-11-13: criada como draft na entrevista do CLISPEC; options detalhadas na `termfy-spec`.
