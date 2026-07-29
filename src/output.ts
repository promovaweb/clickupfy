/**
 * Formatação compacta de resultados para pessoas, scripts e agentes.
 */

import type { ClickUpComment, ClickUpTask } from "./clickup.js";

/** Escreve JSON estável no stdout. */
export function imprimirJson(valor: unknown): void {
  process.stdout.write(`${JSON.stringify(valor, null, 2)}\n`);
}

/** Converte valores variados em uma célula curta e legível. */
function celula(valor: unknown): string {
  if (valor === null || valor === undefined) return "";
  if (Array.isArray(valor)) return valor.map(celula).filter(Boolean).join(", ");
  if (typeof valor === "object") return JSON.stringify(valor);
  return String(valor).replaceAll("\n", " ");
}

/**
 * Renderiza uma tabela simples sem caracteres decorativos, adequada para
 * terminais e econômica em tokens para agentes.
 */
export function imprimirTabela(
  linhas: Array<Record<string, unknown>>,
  colunas?: string[],
): void {
  if (linhas.length === 0) {
    process.stdout.write("Nenhum resultado.\n");
    return;
  }

  const chaves = colunas ?? Object.keys(linhas[0] ?? {});
  const valores = linhas.map((linha) => chaves.map((chave) => celula(linha[chave])));
  const larguras = chaves.map((chave, indice) =>
    Math.max(chave.length, ...valores.map((linha) => linha[indice]?.length ?? 0)),
  );
  const montarLinha = (itens: string[]) =>
    itens
      .map((item, indice) => item.padEnd(larguras[indice] ?? item.length))
      .join("  ")
      .trimEnd();

  process.stdout.write(`${montarLinha(chaves)}\n`);
  process.stdout.write(`${montarLinha(larguras.map((largura) => "-".repeat(largura)))}\n`);
  for (const linha of valores) process.stdout.write(`${montarLinha(linha)}\n`);
}

/** Reduz uma tarefa do ClickUp aos campos usados no fluxo de software. */
export function resumirTarefa(tarefa: ClickUpTask): Record<string, unknown> {
  return {
    id: tarefa.id,
    custom_id: tarefa.custom_id ?? "",
    name: tarefa.name,
    status: tarefa.status?.status ?? "",
    priority: tarefa.priority?.priority ?? "",
    points: tarefa.points ?? "",
    assignees: tarefa.assignees?.map((pessoa) => pessoa.username ?? pessoa.email ?? pessoa.id),
    due_date: tarefa.due_date ?? "",
    url: tarefa.url ?? "",
  };
}

/** Reduz um comentário mantendo autoria, data e texto. */
export function resumirComentario(
  comentario: ClickUpComment,
): Record<string, unknown> {
  return {
    id: comentario.id,
    user:
      comentario.user?.username ??
      comentario.user?.email ??
      comentario.user?.id ??
      "",
    date: comentario.date ?? "",
    text:
      comentario.comment_text ??
      comentario.comment?.map((trecho) => trecho.text ?? "").join("") ??
      "",
  };
}
