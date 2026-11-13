/** Atalhos de terminal para gestão de tags e remoção de associações a tarefas. */
import { Command } from "commander";
import { confirm } from "@inquirer/prompts";
import { criarContexto } from "./context.js";
import { imprimirJson, imprimirTabela } from "./output.js";
import {
  createSpaceTag,
  deleteSpaceTag,
  listSpaceTags,
  removeTaskTag,
  updateSpaceTag,
} from "./tags.js";

/** Mantém o padrão de confirmação das exclusões já existentes no CLI. */
export function registerTagCli(program: Command): void {
  const tag = program
    .command("tag")
    .description("gerencia o catálogo de tags de um Space");
  tag
    .command("list")
    .requiredOption("--space <id>", "ID do Space")
    .description("lista nomes e cores das tags")
    .action(async function (this: Command, options) {
      const globals = this.optsWithGlobals();
      const tags = await listSpaceTags(
        (await criarContexto(globals.account)).client,
        options.space,
      );
      globals.json
        ? imprimirJson(tags)
        : imprimirTabela(
            tags.map((item) => ({
              nome: item.name,
              texto: item.tag_fg,
              fundo: item.tag_bg,
            })),
          );
    });
  tag
    .command("create")
    .argument("<name>")
    .requiredOption("--space <id>", "ID do Space")
    .requiredOption("--foreground <cor>", "cor do texto em #RRGGBB")
    .requiredOption("--background <cor>", "cor do fundo em #RRGGBB")
    .description("cria uma tag no Space")
    .action(async function (this: Command, name: string, options) {
      await createSpaceTag(
        (await criarContexto(this.optsWithGlobals().account)).client,
        options.space,
        {
          name,
          foreground: options.foreground,
          background: options.background,
        },
      );
      imprimirJson({ created: true, spaceId: options.space, name });
    });
  tag
    .command("update")
    .argument("<tag>")
    .requiredOption("--space <id>", "ID do Space")
    .option("--name <nome>", "novo nome")
    .option("--foreground <cor>", "nova cor do texto em #RRGGBB")
    .option("--background <cor>", "nova cor do fundo em #RRGGBB")
    .description("renomeia uma tag ou altera suas cores")
    .action(async function (this: Command, name: string, options) {
      const changes = Object.fromEntries(
        ["name", "foreground", "background"]
          .filter((key) => options[key] !== undefined)
          .map((key) => [key, options[key]]),
      );
      await updateSpaceTag(
        (await criarContexto(this.optsWithGlobals().account)).client,
        options.space,
        name,
        changes,
      );
      imprimirJson({
        updated: true,
        spaceId: options.space,
        name: options.name ?? name,
      });
    });
  tag
    .command("delete")
    .argument("<tag>")
    .requiredOption("--space <id>", "ID do Space")
    .option("--yes", "confirma a exclusão sem prompt")
    .description("exclui a tag do Space")
    .action(async function (this: Command, name: string, options) {
      if (
        !options.yes &&
        !(
          process.stdin.isTTY &&
          (await confirm({
            message: `Excluir a tag "${name}" do Space ${options.space}?`,
            default: false,
          }))
        )
      )
        throw new Error("Exclusão cancelada. Use --yes para confirmar.");
      await deleteSpaceTag(
        (await criarContexto(this.optsWithGlobals().account)).client,
        options.space,
        name,
      );
      imprimirJson({ deleted: true, spaceId: options.space, name });
    });
  const task = program.commands.find((command) => command.name() === "task");
  if (!task) throw new Error("Grupo task não registrado.");
  task
    .command("remove-tag")
    .argument("<task-id>")
    .argument("<tag>")
    .option("--custom-task-id", "usa ID personalizado no workspace do perfil")
    .description("remove uma tag da tarefa, preservando o catálogo do Space")
    .action(async function (
      this: Command,
      taskId: string,
      tagName: string,
      options,
    ) {
      const ctx = await criarContexto(this.optsWithGlobals().account);
      await removeTaskTag(
        ctx.client,
        taskId,
        tagName,
        options.customTaskId ? ctx.account.workspace.id : undefined,
      );
      imprimirJson({ removed: true, taskId, tagName });
    });
}
