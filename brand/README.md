# Marca ClickUpfy

O ClickUpfy organiza execução rastreável no ClickUp. Sua identidade combina o
petróleo e o turquesa da Promovaweb com azul, cor funcional associada a
tarefas, progresso e confirmação.

## Conceito visual

O símbolo reúne um **prompt de terminal** e uma **marca de conclusão**. A
composição comunica trabalho iniciado por comando, executado com método e
registrado como concluído.

## Arquivos oficiais

| Arquivo | Uso |
| --- | --- |
| `logo/icon.svg` | ícone principal com placa petróleo |
| `logo/icon-light.svg` | ícone transparente sobre fundo claro |
| `logo/icon-dark.svg` | ícone transparente sobre fundo escuro |
| `logo/logo-light.svg` | assinatura horizontal sobre fundo claro |
| `logo/logo-dark.svg` | assinatura horizontal sobre fundo escuro |
| `logo/icon.png` | fallback raster de 512 × 512 px |

Use a variante correspondente ao fundo. Preserve 12,5% de área livre ao redor
do ativo. O tamanho mínimo é 24 px para o ícone e 140 px para a assinatura.

## Sistema digital

- `colors/palette.json`: fonte editável da paleta;
- `tokens.json`: tokens agnósticos;
- `global.css`: webfontes, variáveis CSS e troca de tema;
- `tailwind-theme.js`: extensão para Tailwind CSS;
- `accessibility.md`: relatório de contraste;
- `typography/README.md`: hierarquia tipográfica.

## Regras para agentes

1. Use os ativos desta pasta sem redesenhá-los.
2. Azul indica ação, progresso ou conclusão; turquesa identifica a família.
3. Estado nunca depende apenas de cor: inclua texto, ícone ou posição.
4. Use tokens semânticos e a variante correta para light ou dark mode.
5. Não aplique filtros, gradientes, sombras, rotações ou deformações.

A assinatura verbal canônica continua sendo **Planeje. Execute. Comprove.**
