/**
 * Normalização de tarefas, subtarefas e checklists em itens executáveis.
 */

import {
  ClickUpClient,
  type ClickUpChecklist,
  type ClickUpChecklistItem,
  type ClickUpTask,
} from "./clickup.js";
import { CliError } from "./errors.js";

export type WorkItemType = "task" | "subtask" | "checklist_item";

/** Comando equivalente para uso humano pelo CLI e uso agêntico pelo MCP. */
export interface WorkItemAction {
  cli: string;
  mcp: {
    tool: string;
    arguments: Record<string, unknown>;
  };
}

/** Unidade individual da fila, com hierarquia, estado e ações de atualização. */
export interface WorkItem {
  key: string;
  type: WorkItemType;
  id: string;
  taskId: string;
  parentKey?: string;
  depth: number;
  name: string;
  done: boolean;
  state: string;
  checklistId?: string;
  checklistName?: string;
  action: {
    complete: WorkItemAction;
    reopen?: WorkItemAction;
  };
}

/** Resposta enriquecida que preserva o payload remoto e acrescenta a fila. */
export interface TaskReading {
  task: ClickUpTask;
  execution: {
    summary: {
      total: number;
      done: number;
      pending: number;
      tasks: number;
      subtasks: number;
      checklistItems: number;
    };
    items: WorkItem[];
  };
}

/**
 * Mantém a resposta completa da API e acrescenta uma fila plana, ordenada e
 * endereçável por `key`, para o agente executar um item por vez.
 */
export function criarLeituraTarefa(tarefa: ClickUpTask): TaskReading {
  const items: WorkItem[] = [];
  const subtarefas = coletarSubtarefas(tarefa.subtasks ?? []);
  const porPai = agruparSubtarefas(subtarefas);
  const visitadas = new Set<string>();

  adicionarTarefa(tarefa, "task", 0, undefined);
  for (const orfa of subtarefas) {
    if (!visitadas.has(orfa.id)) adicionarTarefa(orfa, "subtask", 1, chaveTarefa(tarefa.id));
  }

  const done = items.filter((item) => item.done).length;
  return {
    task: tarefa,
    execution: {
      summary: {
        total: items.length,
        done,
        pending: items.length - done,
        tasks: items.filter((item) => item.type === "task").length,
        subtasks: items.filter((item) => item.type === "subtask").length,
        checklistItems: items.filter(
          (item) => item.type === "checklist_item",
        ).length,
      },
      items,
    },
  };

  function adicionarTarefa(
    atual: ClickUpTask,
    type: "task" | "subtask",
    depth: number,
    parentKey: string | undefined,
  ): void {
    if (visitadas.has(atual.id)) return;
    visitadas.add(atual.id);

    const key = chaveTarefa(atual.id);
    const state = atual.status?.status ?? "";
    const done = tarefaConcluida(atual);
    items.push({
      key,
      type,
      id: atual.id,
      taskId: atual.id,
      ...(parentKey ? { parentKey } : {}),
      depth,
      name: atual.name,
      done,
      state,
      action: {
        complete: {
          cli: `clickupfy task update ${atual.id} --status <status-concluído>`,
          mcp: {
            tool: "clickupfy_task_update",
            arguments: {
              taskId: atual.id,
              status: "<status-concluído>",
            },
          },
        },
      },
    });

    for (const checklist of ordenar(atual.checklists ?? [])) {
      adicionarChecklist(atual.id, checklist, depth + 1, key);
    }
    for (const filha of ordenar(porPai.get(atual.id) ?? [])) {
      adicionarTarefa(filha, "subtask", depth + 1, key);
    }
  }

  function adicionarChecklist(
    taskId: string,
    checklist: ClickUpChecklist,
    depth: number,
    taskKey: string,
  ): void {
    const itens = checklist.items ?? [];
    const ids = new Set(itens.map((item) => item.id));
    const filhos = new Map<string, ClickUpChecklistItem[]>();

    for (const item of itens) {
      const parent = item.parent && ids.has(item.parent) ? item.parent : "";
      const grupo = filhos.get(parent) ?? [];
      grupo.push(item);
      filhos.set(parent, grupo);
    }

    const adicionados = new Set<string>();
    for (const item of ordenar(filhos.get("") ?? [])) {
      adicionarItem(item, depth, taskKey);
    }
    for (const item of ordenar(itens)) {
      if (!adicionados.has(item.id)) adicionarItem(item, depth, taskKey);
    }

    function adicionarItem(
      item: ClickUpChecklistItem,
      itemDepth: number,
      parentKey: string,
    ): void {
      if (adicionados.has(item.id)) return;
      adicionados.add(item.id);
      const key = chaveChecklist(checklist.id, item.id);
      const resolved = Boolean(item.resolved);
      const argumentos = {
        taskId,
        checklistId: checklist.id,
        itemId: item.id,
      };

      items.push({
        key,
        type: "checklist_item",
        id: item.id,
        taskId,
        parentKey,
        depth: itemDepth,
        name: item.name,
        done: resolved,
        state: resolved ? "concluído" : "pendente",
        checklistId: checklist.id,
        checklistName: checklist.name,
        action: {
          complete: {
            cli: `clickupfy checklist set ${taskId} ${checklist.id} ${item.id} --resolved`,
            mcp: {
              tool: "clickupfy_checklist_item_set",
              arguments: { ...argumentos, resolved: true },
            },
          },
          reopen: {
            cli: `clickupfy checklist set ${taskId} ${checklist.id} ${item.id} --open`,
            mcp: {
              tool: "clickupfy_checklist_item_set",
              arguments: { ...argumentos, resolved: false },
            },
          },
        },
      });

      for (const filho of ordenar(filhos.get(item.id) ?? [])) {
        adicionarItem(filho, itemDepth + 1, key);
      }
    }
  }
}

/**
 * Concatena a leitura em um documento Markdown único, com descrições,
 * checkboxes, chaves estáveis e comandos de atualização.
 */
export function renderizarLeituraMarkdown(leitura: TaskReading): string {
  const { task, execution } = leitura;
  const tarefas = new Map(
    [task, ...coletarSubtarefas(task.subtasks ?? [])].map((item) => [
      item.id,
      item,
    ]),
  );
  const linhas = [
    `# ${textoInline(task.name)}`,
    "",
    `- **ID:** \`${codigoInline(task.id)}\``,
    `- **Status:** ${textoInline(task.status?.status ?? "sem status")}`,
  ];

  if (task.priority?.priority) {
    linhas.push(`- **Prioridade:** ${textoInline(task.priority.priority)}`);
  }
  if (task.points !== null && task.points !== undefined) {
    linhas.push(`- **Sprint Points:** ${task.points}`);
  }
  if (task.assignees?.length) {
    linhas.push(
      `- **Responsáveis:** ${task.assignees
        .map((pessoa) =>
          textoInline(pessoa.username ?? pessoa.email ?? String(pessoa.id)),
        )
        .join(", ")}`,
    );
  }
  if (task.start_date) linhas.push(`- **Data de início:** ${task.start_date}`);
  if (task.due_date) linhas.push(`- **Data de entrega:** ${task.due_date}`);
  if (task.url) linhas.push(`- **ClickUp:** [Abrir tarefa](${task.url})`);

  const descricao = descricaoTarefa(task);
  if (descricao) {
    linhas.push("", "## Descrição", "", descricao);
  }

  linhas.push(
    "",
    "## Resumo",
    "",
    `- **Total:** ${execution.summary.total}`,
    `- **Concluídos:** ${execution.summary.done}`,
    `- **Pendentes:** ${execution.summary.pending}`,
    `- **Tarefas:** ${execution.summary.tasks}`,
    `- **Subtarefas:** ${execution.summary.subtasks}`,
    `- **Checklist items:** ${execution.summary.checklistItems}`,
    "",
    "## Itens executáveis",
    "",
  );

  for (const item of execution.items) {
    const indentacao = "  ".repeat(item.depth);
    const rotulo =
      item.type === "task"
        ? "Tarefa"
        : item.type === "subtask"
          ? "Subtarefa"
          : `Checklist · ${textoInline(item.checklistName ?? "Sem nome")}`;
    linhas.push(
      `${indentacao}- [${item.done ? "x" : " "}] **${rotulo}:** ${textoInline(item.name)} \`${codigoInline(item.key)}\``,
      `${indentacao}  - **Estado:** ${textoInline(item.state || "sem status")}`,
    );

    const tarefaDoItem = tarefas.get(item.taskId);
    const descricaoDoItem =
      item.type === "subtask" && tarefaDoItem
        ? descricaoTarefa(tarefaDoItem)
        : undefined;
    if (descricaoDoItem) {
      linhas.push(`${indentacao}  - **Descrição:**`);
      for (const linha of descricaoDoItem.split("\n")) {
        linhas.push(`${indentacao}    > ${linha}`);
      }
    }

    linhas.push(
      `${indentacao}  - **Ação:** \`${codigoInline(item.action.complete.cli)}\``,
    );
  }

  return `${linhas.join("\n").trimEnd()}\n`;
}

/**
 * Altera um checklist item e confirma o estado persistido em uma nova leitura.
 */
export async function definirEstadoItemChecklist(
  client: ClickUpClient,
  taskId: string,
  checklistId: string,
  itemId: string,
  resolved: boolean,
): Promise<WorkItem> {
  const antes = criarLeituraTarefa(await client.obterTarefa(taskId));
  localizarItem(antes, checklistId, itemId);

  await client.atualizarItemChecklist(checklistId, itemId, { resolved });

  const depois = criarLeituraTarefa(await client.obterTarefa(taskId));
  const item = localizarItem(depois, checklistId, itemId);
  if (item.done !== resolved) {
    throw new CliError(
      `O checklist item ${itemId} não confirmou o estado solicitado.`,
      5,
    );
  }
  return item;
}

function localizarItem(
  leitura: TaskReading,
  checklistId: string,
  itemId: string,
): WorkItem {
  const item = leitura.execution.items.find(
    (atual) =>
      atual.type === "checklist_item" &&
      atual.checklistId === checklistId &&
      atual.id === itemId,
  );
  if (!item) {
    throw new CliError(
      `O checklist item ${itemId} não pertence ao checklist ${checklistId} da tarefa consultada.`,
      3,
    );
  }
  return item;
}

function agruparSubtarefas(
  subtarefas: ClickUpTask[],
): Map<string, ClickUpTask[]> {
  const resultado = new Map<string, ClickUpTask[]>();
  for (const tarefa of subtarefas) {
    if (!tarefa.parent) continue;
    const grupo = resultado.get(tarefa.parent) ?? [];
    grupo.push(tarefa);
    resultado.set(tarefa.parent, grupo);
  }
  return resultado;
}

function coletarSubtarefas(subtarefas: ClickUpTask[]): ClickUpTask[] {
  const resultado: ClickUpTask[] = [];
  const visitadas = new Set<string>();
  const fila = [...subtarefas];

  while (fila.length > 0) {
    const tarefa = fila.shift();
    if (!tarefa || visitadas.has(tarefa.id)) continue;
    visitadas.add(tarefa.id);
    resultado.push(tarefa);
    fila.push(...(tarefa.subtasks ?? []));
  }
  return resultado;
}

function tarefaConcluida(tarefa: ClickUpTask): boolean {
  const tipo = tarefa.status?.type?.toLocaleLowerCase("pt-BR");
  return tipo === "closed" || tipo === "done";
}

function chaveTarefa(taskId: string): string {
  return `task:${taskId}`;
}

function chaveChecklist(checklistId: string, itemId: string): string {
  return `checklist:${checklistId}:${itemId}`;
}

function ordenar<T extends { orderindex?: number | string }>(itens: T[]): T[] {
  return [...itens].sort(
    (a, b) => ordem(a.orderindex) - ordem(b.orderindex),
  );
}

function ordem(valor: number | string | undefined): number {
  if (valor === undefined) return Number.MAX_SAFE_INTEGER;
  const numero = Number(valor);
  return Number.isFinite(numero) ? numero : Number.MAX_SAFE_INTEGER;
}

function descricaoTarefa(tarefa: ClickUpTask): string | undefined {
  const descricao =
    tarefa.markdown_description ?? tarefa.description ?? tarefa.text_content;
  return descricao?.trim() || undefined;
}

function textoInline(valor: string): string {
  return valor
    .replaceAll("\\", "\\\\")
    .replaceAll("`", "'")
    .replaceAll("*", "\\*")
    .replaceAll("_", "\\_")
    .replaceAll("[", "\\[")
    .replaceAll("]", "\\]")
    .replace(/\s+/g, " ")
    .trim();
}

function codigoInline(valor: string): string {
  return valor.replaceAll("`", "'").replace(/\s+/g, " ").trim();
}
