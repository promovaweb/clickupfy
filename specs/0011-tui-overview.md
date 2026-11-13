# 0011 Overview do ClickUp na TUI

Status: done

## Goal

Ver de relance o perfil, o workspace e o cronômetro em execução.

## Behavior

A aba `overview` abre por padrão. O painel ClickUp mostra o perfil resolvido
(`PROMOVAWEB_CLICKUPFY_ACCOUNT` ou o ativo), o usuário, o workspace e a linha
Timer, carregada ao abrir a aba e de novo com `r`: tarefa, id e tempo
decorrido, `no timer running` ou `unavailable: <motivo>`. O painel State traz
`accounts.json`, o cofre, a master key e a versão; Profiles lista os perfis
com o ativo marcado; Next steps sugere commands. Sem perfil, o painel ClickUp
orienta `clickupfy setup`. A tela não grava nada e nunca mostra a API key.

## Design

- `tui/screens/overview.ts`: monta os painéis com `readAccountsFile()` e
  `vaultStatus()`; `refreshTimer()` chama
  `currentTimeEntry()` da spec 0007 com `clientFor()` e atualiza
  um `TextRenderable`; `elapsed()` formata o tempo.
- A tecla `r` entra em `keys` da screen e é tratada em `onKey`.

## Surface

- Altera a screen `overview`: perfil, workspace, cronômetro, estado local e
  perfis; teclas `r`, `←` `→`, `1`-`9`, `?`, `q`.

## Tasks

- [x] Overview com perfil, workspace e cronômetro `#termfy-tui`
- [x] Documentação em `docs/tui.md` `#termfy-docs`

## Tests

- [x] Frame de teste com `accounts.json` fake mostra perfil, usuário,
  workspace e a linha Timer, sem chave
- [x] Frame sem perfil orienta `clickupfy setup`
- [x] `elapsed()` formata horas e minutos

## Notes

- 2026-11-13: criada como draft na entrevista do CLISPEC.
- 2026-11-13: o cronômetro vem de `currentTimeEntry` (`clickup/time.ts`,
  spec 0007).
