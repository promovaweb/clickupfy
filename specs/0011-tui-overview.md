# 0011 Overview do ClickUp na TUI

Status: draft

## Goal

Ver de relance o perfil, o contexto e o cronômetro.

## Behavior

A aba Overview mostra perfil ativo, workspace, space e list do contexto e o cronômetro em execução, só leitura; sem perfil, orienta `clickupfy setup`.

## Design

Screen `overview` alterada em `src/tui/screens/overview.ts`, lendo os módulos de `src/clickup/`.

## Surface

- Altera a screen `overview`: perfil, contexto e cronômetro.

## Tasks

- [ ] Overview `#termfy-tui`

## Tests

- [ ] Frame de teste com perfil fake

## Notes

- 2026-11-13: criada como draft na entrevista do CLISPEC; options detalhadas na `termfy-spec`.
