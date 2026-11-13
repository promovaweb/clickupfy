# 0005 Checklists e comentários

Status: draft

## Goal

Agentes publicam plano e progresso por checklist e comentário.

## Behavior

`checklist create|item-create|item-set` e `comment list|create` com as options do 0.9.0.

## Design

Módulo `src/clickup/checklists.ts` e `src/clickup/comments.ts`. Referência: `legacy/src/work-items.ts`.

## Surface

- Adiciona os commands `checklist` e `comment` com seus verbos.
- Adiciona as tools `clickupfy_checklist_create`, `clickupfy_checklist_item_create`, `clickupfy_checklist_item_set`, `clickupfy_comment_create` e `clickupfy_comments_list`.

## Tasks

- [ ] Commands `#termfy-command-set`
- [ ] Tools `#termfy-mcp`

## Tests

- [ ] `comment create --json` com API fake

## Notes

- 2026-11-13: criada como draft na entrevista do CLISPEC; options detalhadas na `termfy-spec`.
