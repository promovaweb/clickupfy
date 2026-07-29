/**
 * Testes das regras de Sprint sem acessar o ClickUp.
 */

import { describe, expect, it, vi } from "vitest";
import type { ClickUpList, ClickUpTask } from "../src/clickup.js";
import {
  adicionarTarefaASprint,
  definirSprintPoints,
  listarSprints,
  obterRelatorioSprint,
  obterSprintAtual,
  removerTarefaDaSprint,
  type SprintClient,
} from "../src/sprints.js";

const inicio = String(Date.UTC(2026, 6, 1));
const fim = String(Date.UTC(2026, 6, 14, 23, 59, 59));
const referencia = Date.UTC(2026, 6, 7, 12);

function criarClient(
  lists: ClickUpList[],
  tarefas: ClickUpTask[] = [],
): SprintClient {
  return {
    listarLists: vi.fn().mockResolvedValue(lists),
    obterList: vi.fn().mockImplementation(async (listId: string) => {
      const list = lists.find((item) => item.id === listId);
      if (!list) throw new Error("List não encontrada.");
      return list;
    }),
    listarTodasTarefas: vi.fn().mockResolvedValue(tarefas),
    adicionarTarefaAList: vi.fn().mockResolvedValue({}),
    removerTarefaDaList: vi.fn().mockResolvedValue({}),
    atualizarTarefa: vi
      .fn()
      .mockImplementation(async (taskId: string, dados) => ({
        id: taskId,
        name: "Tarefa",
        ...dados,
      })),
  };
}

describe("Sprints", () => {
  it("distingue Sprints de Lists comuns e encontra a Sprint ativa", async () => {
    const client = criarClient([
      {
        id: "sprint-1",
        name: "Sprint 1",
        start_date: inicio,
        due_date: fim,
        task_count: 3,
      },
      { id: "backlog", name: "Backlog", task_count: 10 },
    ]);

    const sprints = await listarSprints(client, "folder-1", { referencia });
    const todas = await listarSprints(client, "folder-1", {
      referencia,
      includeRegular: true,
    });
    const atual = await obterSprintAtual(client, "folder-1", referencia);

    expect(sprints).toHaveLength(1);
    expect(sprints[0]).toMatchObject({ id: "sprint-1", status: "ativa" });
    expect(todas[1]).toMatchObject({ id: "backlog", status: "regular" });
    expect(atual.id).toBe("sprint-1");
  });

  it("calcula progresso por tarefas, status e Sprint Points", async () => {
    const client = criarClient(
      [
        {
          id: "sprint-1",
          name: "Sprint 1",
          start_date: inicio,
          due_date: fim,
        },
      ],
      [
        {
          id: "1",
          name: "Concluída",
          status: { status: "done", type: "closed" },
          points: 3,
        },
        {
          id: "2",
          name: "Em andamento",
          status: { status: "in progress", type: "custom" },
          points: 5,
        },
        {
          id: "3",
          name: "Sem estimativa",
          status: { status: "backlog", type: "open" },
          points: null,
        },
      ],
    );

    const relatorio = await obterRelatorioSprint(
      client,
      "sprint-1",
      referencia,
    );

    expect(relatorio).toMatchObject({
      totalTasks: 3,
      completedTasks: 1,
      openTasks: 2,
      totalPoints: 8,
      completedPoints: 3,
      unestimatedTasks: 1,
      taskCompletionPercent: 33.33,
      pointsCompletionPercent: 37.5,
      tasksByStatus: { done: 1, "in progress": 1, backlog: 1 },
    });
  });

  it("valida a Sprint antes de alterar associações e pontos", async () => {
    const client = criarClient([
      {
        id: "sprint-1",
        name: "Sprint 1",
        start_date: inicio,
        due_date: fim,
      },
    ]);

    await adicionarTarefaASprint(client, "sprint-1", "task-1");
    await removerTarefaDaSprint(client, "sprint-1", "task-1");
    const tarefa = await definirSprintPoints(client, "task-1", 8);

    expect(client.adicionarTarefaAList).toHaveBeenCalledWith(
      "sprint-1",
      "task-1",
    );
    expect(client.removerTarefaDaList).toHaveBeenCalledWith(
      "sprint-1",
      "task-1",
    );
    expect(client.atualizarTarefa).toHaveBeenCalledWith("task-1", {
      points: 8,
    });
    expect(tarefa.points).toBe(8);
  });

  it("recusa uma List comum como Sprint", async () => {
    const client = criarClient([{ id: "backlog", name: "Backlog" }]);

    await expect(
      obterRelatorioSprint(client, "backlog", referencia),
    ).rejects.toThrow("não possui start_date e due_date");
  });
});
