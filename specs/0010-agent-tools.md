# 0010 Integração com agentes e manutenção

Status: draft

## Goal

Instalar as skills do ClickUpfy nos agentes, diagnosticar o setup e atualizar o binário.

## Behavior

`agent skill list|show|install` e `agent init`; `doctor` ganha checagens de perfil, chave e workspace; `upgrade` atualiza pelo pacote npm ou pela GitHub Release.

## Design

Skills do ClickUpfy em `.codex/skills/` embutidas no binário. Referência: `legacy/src/agent-assets.ts`, `legacy/src/doctor.ts`, `legacy/src/upgrade.ts`.

## Surface

- Adiciona os commands `agent skill` e `agent init` e `upgrade`.
- Altera o command `doctor` e a tool `doctor`: checagens do ClickUp.

## Tasks

- [ ] `agent` `#termfy-cli`
- [ ] `doctor` `#termfy-cli`
- [ ] `upgrade` `#termfy-cli`

## Tests

- [ ] `doctor --json` sem perfil aponta o problema

## Notes

- 2026-11-13: criada como draft na entrevista do CLISPEC; options detalhadas na `termfy-spec`.
