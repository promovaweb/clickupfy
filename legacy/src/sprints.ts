/**
 * Regras de domínio para consultar Sprints existentes e medir seu progresso.
 */

import type { ClickUpList, ClickUpTask } from "./clickup.js";
import { CliError } from "./errors.js";

export type SprintStatus = "planejada" | "ativa" | "concluída" | "regular";

export interface SprintResumo {
  id: string;
  name: string;
  startDate: string | null;
  dueDate: string | null;
  status: SprintStatus;
  taskCount: number;
  isSprint: boolean;
}

export interface SprintRelatorio extends SprintResumo {
  totalTasks: number;
  completedTasks: number;
  openTasks: number;
  totalPoints: number;
  completedPoints: number;
  unestimatedTasks: number;
  taskCompletionPercent: number;
  pointsCompletionPercent: number | null;
  tasksByStatus: Record<string, number>;
}

export interface SprintClient {
  listarLists(
    escopo: { folderId?: string; spaceId?: string },
    archived?: boolean,
  ): Promise<ClickUpList[]>;
  obterList(listId: string): Promise<ClickUpList>;
  listarTodasTarefas(
    listId: string,
    filtros?: { archived?: boolean; includeClosed?: boolean; maxPages?: number },
  ): Promise<ClickUpTask[]>;
  adicionarTarefaAList(
    listId: string,
    taskId: string,
  ): Promise<Record<string, never>>;
  removerTarefaDaList(
    listId: string,
    taskId: string,
  ): Promise<Record<string, never>>;
  atualizarTarefa(
    taskId: string,
    dados: Record<string, unknown>,
  ): Promise<ClickUpTask>;
}

/** Identifica uma Sprint pelos campos de período fornecidos pelo ClickUp. */
export function isSprint(list: ClickUpList): boolean {
  return timestamp(list.start_date) !== null && timestamp(list.due_date) !== null;
}

/** Converte uma List em resumo de Sprint para CLI e agentes. */
export function resumirSprint(
  list: ClickUpList,
  referencia = Date.now(),
): SprintResumo {
  const inicio = timestamp(list.start_date);
  const fim = timestamp(list.due_date);
  const candidata = inicio !== null && fim !== null;

  let status: SprintStatus = "regular";
  if (candidata) {
    status =
      referencia < inicio
        ? "planejada"
        : referencia > fim
          ? "concluída"
          : "ativa";
  }

  return {
    id: list.id,
    name: list.name,
    startDate: list.start_date ?? null,
    dueDate: list.due_date ?? null,
    status,
    taskCount: list.task_count ?? 0,
    isSprint: candidata,
  };
}

/** Lista as Sprints de um Sprint Folder, com Lists comuns apenas sob pedido. */
export async function listarSprints(
  client: SprintClient,
  folderId: string,
  options: {
    archived?: boolean;
    includeRegular?: boolean;
    referencia?: number;
  } = {},
): Promise<SprintResumo[]> {
  const lists = await client.listarLists(
    { folderId },
    options.archived ?? false,
  );
  const candidatas = options.includeRegular
    ? lists
    : lists.filter((list) => isSprint(list));
  return candidatas.map((list) =>
    resumirSprint(list, options.referencia ?? Date.now()),
  );
}

/** Localiza a única Sprint ativa de um Sprint Folder. */
export async function obterSprintAtual(
  client: SprintClient,
  folderId: string,
  referencia = Date.now(),
): Promise<SprintResumo> {
  const ativas = (
    await listarSprints(client, folderId, { referencia })
  ).filter((sprint) => sprint.status === "ativa");

  if (ativas.length === 0) {
    throw new CliError("Nenhuma Sprint ativa foi encontrada nesse folder.");
  }
  if (ativas.length > 1) {
    throw new CliError(
      "Mais de uma Sprint está ativa nesse folder; consulte `sprint list`.",
    );
  }
  return ativas[0] as SprintResumo;
}

/** Obtém todas as tarefas de uma Sprint, incluindo concluídas. */
export async function listarTarefasSprint(
  client: SprintClient,
  sprintId: string,
  openOnly = false,
): Promise<ClickUpTask[]> {
  await obterListSprint(client, sprintId);
  const tarefas = await client.listarTodasTarefas(sprintId, {
    includeClosed: true,
  });
  return openOnly
    ? tarefas.filter((tarefa) => tarefa.status?.type !== "closed")
    : tarefas;
}

/** Produz métricas de tarefas e Sprint Points para uma Sprint existente. */
export async function obterRelatorioSprint(
  client: SprintClient,
  sprintId: string,
  referencia = Date.now(),
): Promise<SprintRelatorio> {
  const list = await obterListSprint(client, sprintId);
  const tarefas = await client.listarTodasTarefas(sprintId, {
    includeClosed: true,
  });
  const concluidas = tarefas.filter(
    (tarefa) => tarefa.status?.type === "closed",
  );
  const totalPoints = somarPontos(tarefas);
  const completedPoints = somarPontos(concluidas);
  const tasksByStatus = tarefas.reduce<Record<string, number>>(
    (grupos, tarefa) => {
      const status = tarefa.status?.status ?? "sem status";
      grupos[status] = (grupos[status] ?? 0) + 1;
      return grupos;
    },
    {},
  );

  return {
    ...resumirSprint(list, referencia),
    totalTasks: tarefas.length,
    completedTasks: concluidas.length,
    openTasks: tarefas.length - concluidas.length,
    totalPoints,
    completedPoints,
    unestimatedTasks: tarefas.filter((tarefa) => tarefa.points == null).length,
    taskCompletionPercent: percentual(concluidas.length, tarefas.length),
    pointsCompletionPercent:
      totalPoints === 0 ? null : percentual(completedPoints, totalPoints),
    tasksByStatus,
  };
}

/** Adiciona uma tarefa à Sprint sem alterar sua List principal. */
export async function adicionarTarefaASprint(
  client: SprintClient,
  sprintId: string,
  taskId: string,
): Promise<{ sprintId: string; taskId: string; added: true }> {
  await obterListSprint(client, sprintId);
  await client.adicionarTarefaAList(sprintId, taskId);
  return { sprintId, taskId, added: true };
}

/** Remove somente a associação entre uma tarefa e a Sprint. */
export async function removerTarefaDaSprint(
  client: SprintClient,
  sprintId: string,
  taskId: string,
): Promise<{ sprintId: string; taskId: string; removed: true }> {
  await obterListSprint(client, sprintId);
  await client.removerTarefaDaList(sprintId, taskId);
  return { sprintId, taskId, removed: true };
}

/** Define os Sprint Points de uma tarefa. */
export async function definirSprintPoints(
  client: SprintClient,
  taskId: string,
  points: number,
): Promise<ClickUpTask> {
  if (!Number.isFinite(points) || points < 0) {
    throw new CliError("Sprint Points deve ser um número maior ou igual a zero.");
  }
  return client.atualizarTarefa(taskId, { points });
}

async function obterListSprint(
  client: SprintClient,
  sprintId: string,
): Promise<ClickUpList> {
  const list = await client.obterList(sprintId);
  if (!isSprint(list)) {
    throw new CliError(
      `A List "${list.name}" não possui start_date e due_date de Sprint.`,
    );
  }
  return list;
}

function timestamp(valor: string | null | undefined): number | null {
  if (!valor) return null;
  const numero = Number(valor);
  return Number.isFinite(numero) ? numero : null;
}

function somarPontos(tarefas: ClickUpTask[]): number {
  return tarefas.reduce(
    (total, tarefa) =>
      total + (typeof tarefa.points === "number" ? tarefa.points : 0),
    0,
  );
}

function percentual(parte: number, total: number): number {
  if (total === 0) return 0;
  return Math.round((parte / total) * 10_000) / 100;
}
