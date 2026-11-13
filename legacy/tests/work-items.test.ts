/**
 * Testes da fila executável de tarefas, subtarefas e checklist items.
 */

import { describe, expect, it, vi } from "vitest";
import { ClickUpClient, type ClickUpTask } from "../src/clickup.js";
import {
  criarLeituraTarefa,
  definirEstadoItemChecklist,
  renderizarLeituraMarkdown,
} from "../src/work-items.js";

function tarefaComFilhos(resolved = false): ClickUpTask {
  return {
    id: "task-root",
    name: "Publicar funcionalidade",
    markdown_description: "Entregar a **funcionalidade** completa.",
    status: { status: "em andamento", type: "custom" },
    checklists: [
      {
        id: "check-root",
        name: "Entrega",
        items: [
          {
            id: "item-testes",
            name: "Rodar testes",
            orderindex: 1,
            resolved,
          },
          {
            id: "item-docs",
            name: "Revisar documentação",
            orderindex: 2,
            resolved: false,
            parent: "item-testes",
          },
        ],
      },
    ],
    subtasks: [
      {
        id: "sub-1",
        name: "Implementar endpoint",
        description: "Criar o endpoint e validar a resposta.",
        parent: "task-root",
        orderindex: 1,
        status: { status: "em andamento", type: "custom" },
        checklists: [
          {
            id: "check-sub",
            name: "Implementação",
            items: [
              {
                id: "item-api",
                name: "Cobrir a API",
                resolved: true,
              },
            ],
          },
        ],
        subtasks: [
          {
            id: "sub-2",
            name: "Publicar pacote",
            parent: "sub-1",
            orderindex: 2,
            status: { status: "concluído", type: "closed" },
          },
        ],
      } as ClickUpTask & { orderindex: number },
    ],
  };
}

describe("fila executável", () => {
  it("ordena tarefa, checklist items e subtarefas com chaves individuais", () => {
    const leitura = criarLeituraTarefa(tarefaComFilhos());

    expect(leitura.execution.summary).toEqual({
      total: 6,
      done: 2,
      pending: 4,
      tasks: 1,
      subtasks: 2,
      checklistItems: 3,
    });
    expect(leitura.execution.items.map((item) => item.key)).toEqual([
      "task:task-root",
      "checklist:check-root:item-testes",
      "checklist:check-root:item-docs",
      "task:sub-1",
      "checklist:check-sub:item-api",
      "task:sub-2",
    ]);
    expect(leitura.execution.items[2]).toMatchObject({
      parentKey: "checklist:check-root:item-testes",
      depth: 2,
      done: false,
    });
    expect(leitura.execution.items[1]?.action.complete.mcp).toEqual({
      tool: "clickupfy_checklist_item_set",
      arguments: {
        taskId: "task-root",
        checklistId: "check-root",
        itemId: "item-testes",
        resolved: true,
      },
    });
  });

  it("concatena metadados, descrições e a hierarquia em um Markdown", () => {
    const markdown = renderizarLeituraMarkdown(
      criarLeituraTarefa(tarefaComFilhos()),
    );

    expect(markdown).toContain("# Publicar funcionalidade");
    expect(markdown).toContain("Entregar a **funcionalidade** completa.");
    expect(markdown).toContain("- **Total:** 6");
    expect(markdown).toContain(
      "- [ ] **Checklist · Entrega:** Rodar testes `checklist:check-root:item-testes`",
    );
    expect(markdown).toContain(
      "  - [ ] **Subtarefa:** Implementar endpoint `task:sub-1`",
    );
    expect(markdown).toContain(
      "    > Criar o endpoint e validar a resposta.",
    );
    expect(markdown).toContain(
      "`clickupfy checklist set task-root check-root item-testes --resolved`",
    );
    expect(markdown.endsWith("\n")).toBe(true);
  });

  it("marca um checklist item e confirma o estado em uma nova leitura", async () => {
    const fetchFn = vi
      .fn<typeof fetch>()
      .mockResolvedValueOnce(
        new Response(JSON.stringify(tarefaComFilhos(false)), { status: 200 }),
      )
      .mockResolvedValueOnce(new Response("{}", { status: 200 }))
      .mockResolvedValueOnce(
        new Response(JSON.stringify(tarefaComFilhos(true)), { status: 200 }),
      );
    const client = new ClickUpClient("pk_teste", {
      baseUrl: "https://clickup.test/api/v2",
      fetchFn,
    });

    const item = await definirEstadoItemChecklist(
      client,
      "task-root",
      "check-root",
      "item-testes",
      true,
    );

    expect(item).toMatchObject({
      key: "checklist:check-root:item-testes",
      done: true,
      state: "concluído",
    });
    expect(String(fetchFn.mock.calls[1]?.[0])).toContain(
      "/checklist/check-root/checklist_item/item-testes",
    );
    expect(fetchFn.mock.calls[1]?.[1]).toMatchObject({
      method: "PUT",
      body: JSON.stringify({ resolved: true }),
    });
  });
});
