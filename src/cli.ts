#!/usr/bin/env node
/**
 * Entrada do ClickUpfy da Promovaweb e definição de seus comandos públicos.
 */

import { confirm } from "@inquirer/prompts";
import { Command, Option } from "commander";
import packageJson from "../package.json" with { type: "json" };
import {
  configurarMcpProjeto,
  instalarSkills,
  lerSkill,
  SKILL_NAMES,
  type SkillName,
} from "./agent-assets.js";
import { ClickUpClient } from "./clickup.js";
import {
  caminhoConfiguracao,
  lerConfiguracao,
  mascararApiKey,
  resolverAccount,
  salvarConfiguracao,
} from "./config.js";
import { criarContexto } from "./context.js";
import { CliError } from "./errors.js";
import { serveMcp } from "./mcp.js";
import {
  imprimirJson,
  imprimirTabela,
  resumirComentario,
  resumirTarefa,
  resumirWorkItem,
} from "./output.js";
import { executarSetup } from "./setup.js";
import {
  adicionarTarefaASprint,
  definirSprintPoints,
  listarSprints,
  listarTarefasSprint,
  obterRelatorioSprint,
  obterSprintAtual,
  removerTarefaDaSprint,
} from "./sprints.js";
import {
  criarLeituraTarefa,
  definirEstadoItemChecklist,
  renderizarLeituraMarkdown,
} from "./work-items.js";

interface GlobalOptions {
  account?: string;
  json?: boolean;
}

const program = new Command()
  .name("clickupfy")
  .description(
    "Gerencie perfis e trabalho de desenvolvimento no ClickUp pelo terminal.",
  )
  .version(packageJson.version)
  .option("--account <perfil>", "perfil configurado; usa o perfil ativo por padrão")
  .option("--json", "imprime a resposta completa em JSON");

program
  .command("setup")
  .description("configura uma API key e associa o perfil a um workspace")
  .option("--api-key <chave>", "API key pessoal do ClickUp")
  .option("--token <chave>", "alias compatível para --api-key")
  .option("--name <nome>", "nome local do perfil")
  .option("--workspace <id>", "workspace associado")
  .option("--non-interactive", "não abre prompts")
  .action(async (options) => {
    const resultado = await executarSetup(options);
    process.stdout.write(
      `Perfil "${resultado.accountId}" configurado para ${resultado.account.workspace.name}.\n`,
    );
    process.stdout.write(`Configuração: ${resultado.path}\n`);
  });

program
  .command("status")
  .description("mostra o perfil ativo e a configuração atual")
  .action(async function (this: Command) {
    const globals = this.optsWithGlobals() as GlobalOptions;
    const config = await lerConfiguracao();
    const resolvida = resolverAccount(config, globals.account);
    const dados = {
      config: caminhoConfiguracao(),
      account: resolvida.id,
      active: config.activeAccount === resolvida.id,
      name: resolvida.account.name,
      apiKey: mascararApiKey(resolvida.account.apiKey),
      user: resolvida.account.user,
      workspace: resolvida.account.workspace,
    };
    globals.json ? imprimirJson(dados) : imprimirTabela([{ ...dados }]);
  });

const account = program
  .command("account")
  .description("gerencia perfis locais do ClickUp");

account
  .command("list")
  .alias("ls")
  .description("lista perfis sem revelar API keys")
  .action(async function (this: Command) {
    const globals = this.optsWithGlobals() as GlobalOptions;
    const config = await lerConfiguracao();
    const accounts = Object.entries(config.accounts).map(([id, item]) => ({
      id,
      active: config.activeAccount === id ? "*" : "",
      name: item.name,
      user: item.user.username ?? item.user.email ?? item.user.id,
      workspace: item.workspace.name,
      workspace_id: item.workspace.id,
    }));
    globals.json ? imprimirJson(accounts) : imprimirTabela(accounts);
  });

account
  .command("show")
  .argument("[perfil]", "perfil; usa o perfil ativo por padrão")
  .description("mostra metadados seguros de um perfil")
  .action(async function (this: Command, accountId?: string) {
    const globals = this.optsWithGlobals() as GlobalOptions;
    const config = await lerConfiguracao();
    const resolvida = resolverAccount(config, accountId ?? globals.account);
    const dados = {
      id: resolvida.id,
      active: config.activeAccount === resolvida.id,
      name: resolvida.account.name,
      apiKey: mascararApiKey(resolvida.account.apiKey),
      user: resolvida.account.user,
      workspace: resolvida.account.workspace,
      createdAt: resolvida.account.createdAt,
      updatedAt: resolvida.account.updatedAt,
    };
    globals.json ? imprimirJson(dados) : imprimirTabela([{ ...dados }]);
  });

account
  .command("use")
  .argument("<perfil>")
  .description("define o perfil ativo")
  .action(async (accountId: string) => {
    const config = await lerConfiguracao();
    resolverAccount(config, accountId);
    config.activeAccount = accountId;
    await salvarConfiguracao(config);
    process.stdout.write(`Perfil ativo: ${accountId}\n`);
  });

account
  .command("remove")
  .argument("<perfil>")
  .description("remove um perfil da configuração local")
  .option("--yes", "confirma a remoção sem prompt")
  .action(async (accountId: string, options) => {
    const config = await lerConfiguracao();
    resolverAccount(config, accountId);
    const confirmado =
      options.yes ||
      (process.stdin.isTTY &&
        (await confirm({
          message: `Remover o perfil local "${accountId}"?`,
          default: false,
        })));
    if (!confirmado) throw new CliError("Remoção cancelada.");
    delete config.accounts[accountId];
    if (config.activeAccount === accountId) {
      config.activeAccount = Object.keys(config.accounts)[0] ?? null;
    }
    await salvarConfiguracao(config);
    process.stdout.write(`Perfil removido: ${accountId}\n`);
  });

const workspace = program
  .command("workspace")
  .description("consulta e associa workspaces");

workspace
  .command("list")
  .alias("ls")
  .description("lista workspaces autorizados")
  .action(async function (this: Command) {
    const globals = this.optsWithGlobals() as GlobalOptions;
    const ctx = await criarContexto(globals.account);
    const workspaces = await ctx.client.listarWorkspaces();
    const dados = workspaces.map((item) => ({
      id: item.id,
      active: item.id === ctx.account.workspace.id ? "*" : "",
      name: item.name,
    }));
    globals.json ? imprimirJson(workspaces) : imprimirTabela(dados);
  });

workspace
  .command("use")
  .argument("<workspace-id>")
  .description("associa um workspace autorizado ao perfil")
  .action(async function (this: Command, workspaceId: string) {
    const globals = this.optsWithGlobals() as GlobalOptions;
    const config = await lerConfiguracao();
    const resolvida = resolverAccount(config, globals.account);
    const client = new ClickUpClient(resolvida.account.apiKey);
    const item = (await client.listarWorkspaces()).find(
      (workspace) => workspace.id === workspaceId,
    );
    if (!item) throw new CliError("Workspace não autorizado para esse perfil.");
    resolvida.account.workspace = { id: item.id, name: item.name };
    resolvida.account.updatedAt = new Date().toISOString();
    await salvarConfiguracao(config);
    process.stdout.write(
      `Workspace do perfil "${resolvida.id}": ${item.name} (${item.id})\n`,
    );
  });

program
  .command("whoami")
  .description("valida a API key e mostra o usuário autenticado")
  .action(async function (this: Command) {
    const globals = this.optsWithGlobals() as GlobalOptions;
    const ctx = await criarContexto(globals.account);
    const user = await ctx.client.obterUsuario();
    const dados = {
      account: ctx.accountId,
      workspace: ctx.account.workspace,
      user,
    };
    globals.json ? imprimirJson(dados) : imprimirTabela([{ ...dados }]);
  });

const space = program.command("space").description("consulta spaces");
space
  .command("list")
  .alias("ls")
  .option("--archived", "inclui spaces arquivados")
  .description("lista spaces do workspace associado")
  .action(async function (this: Command, options) {
    const globals = this.optsWithGlobals() as GlobalOptions;
    const ctx = await criarContexto(globals.account);
    const dados = await ctx.client.listarSpaces(
      ctx.account.workspace.id,
      options.archived,
    );
    imprimir(dados, globals.json);
  });

const folder = program.command("folder").description("consulta folders");
folder
  .command("list")
  .alias("ls")
  .requiredOption("--space <id>", "ID do space")
  .option("--archived", "inclui folders arquivados")
  .description("lista folders de um space")
  .action(async function (this: Command, options) {
    const globals = this.optsWithGlobals() as GlobalOptions;
    const dados = await (
      await criarContexto(globals.account)
    ).client.listarFolders(options.space, options.archived);
    imprimir(dados, globals.json);
  });

const list = program.command("list").description("consulta lists");
list
  .command("list")
  .alias("ls")
  .option("--folder <id>", "ID do folder")
  .option("--space <id>", "ID do space para lists sem folder")
  .option("--archived", "inclui lists arquivadas")
  .description("lista lists de um folder ou space")
  .action(async function (this: Command, options) {
    if (!options.folder && !options.space) {
      throw new CliError("Informe --folder <id> ou --space <id>.");
    }
    const globals = this.optsWithGlobals() as GlobalOptions;
    const dados = await (
      await criarContexto(globals.account)
    ).client.listarLists(
      {
        ...(options.folder ? { folderId: options.folder } : {}),
        ...(options.space ? { spaceId: options.space } : {}),
      },
      options.archived,
    );
    imprimir(dados, globals.json);
  });

list
  .command("get")
  .argument("<list-id>", "ID da List")
  .description("obtém a List e os status disponíveis para tarefas")
  .action(async function (this: Command, listId: string) {
    const globals = this.optsWithGlobals() as GlobalOptions;
    const dados = await (
      await criarContexto(globals.account)
    ).client.obterList(listId);
    globals.json ? imprimirJson(dados) : imprimirTabela([{ ...dados }]);
  });

const sprint = program
  .command("sprint")
  .description("consulta e planeja Sprints existentes");

sprint
  .command("list")
  .alias("ls")
  .requiredOption("--folder <id>", "ID do Sprint Folder")
  .option("--archived", "inclui Lists arquivadas")
  .option("--include-regular", "inclui Lists comuns do Sprint Folder")
  .option("--at <AAAA-MM-DD>", "data usada para calcular o status da Sprint")
  .description("lista Sprints identificadas pelo período configurado")
  .action(async function (this: Command, options) {
    const globals = this.optsWithGlobals() as GlobalOptions;
    const dados = await listarSprints(
      (await criarContexto(globals.account)).client,
      options.folder,
      {
        ...(options.archived ? { archived: true } : {}),
        ...(options.includeRegular ? { includeRegular: true } : {}),
        ...(options.at ? { referencia: dataDeReferencia(options.at) } : {}),
      },
    );
    imprimir(dados, globals.json);
  });

sprint
  .command("current")
  .requiredOption("--folder <id>", "ID do Sprint Folder")
  .option("--at <AAAA-MM-DD>", "data usada para localizar a Sprint")
  .description("obtém a única Sprint ativa do folder")
  .action(async function (this: Command, options) {
    const globals = this.optsWithGlobals() as GlobalOptions;
    const dados = await obterSprintAtual(
      (await criarContexto(globals.account)).client,
      options.folder,
      options.at ? dataDeReferencia(options.at) : Date.now(),
    );
    globals.json ? imprimirJson(dados) : imprimirTabela([{ ...dados }]);
  });

sprint
  .command("get")
  .argument("<sprint-id>")
  .option("--at <AAAA-MM-DD>", "data usada para calcular o status da Sprint")
  .description("mostra período, progresso e Sprint Points")
  .action(async function (this: Command, sprintId: string, options) {
    const globals = this.optsWithGlobals() as GlobalOptions;
    const dados = await obterRelatorioSprint(
      (await criarContexto(globals.account)).client,
      sprintId,
      options.at ? dataDeReferencia(options.at) : Date.now(),
    );
    globals.json ? imprimirJson(dados) : imprimirTabela([{ ...dados }]);
  });

sprint
  .command("tasks")
  .argument("<sprint-id>")
  .option("--open-only", "omite tarefas concluídas")
  .description("lista todas as tarefas associadas à Sprint")
  .action(async function (this: Command, sprintId: string, options) {
    const globals = this.optsWithGlobals() as GlobalOptions;
    const tarefas = await listarTarefasSprint(
      (await criarContexto(globals.account)).client,
      sprintId,
      options.openOnly,
    );
    globals.json
      ? imprimirJson(tarefas)
      : imprimirTabela(tarefas.map(resumirTarefa));
  });

sprint
  .command("add-task")
  .argument("<sprint-id>")
  .argument("<task-id>")
  .description("adiciona uma tarefa à Sprint sem trocar sua List principal")
  .action(async function (this: Command, sprintId: string, taskId: string) {
    const globals = this.optsWithGlobals() as GlobalOptions;
    const dados = await adicionarTarefaASprint(
      (await criarContexto(globals.account)).client,
      sprintId,
      taskId,
    );
    globals.json ? imprimirJson(dados) : imprimirTabela([dados]);
  });

sprint
  .command("remove-task")
  .argument("<sprint-id>")
  .argument("<task-id>")
  .description("remove a associação da tarefa com a Sprint")
  .action(async function (this: Command, sprintId: string, taskId: string) {
    const globals = this.optsWithGlobals() as GlobalOptions;
    const dados = await removerTarefaDaSprint(
      (await criarContexto(globals.account)).client,
      sprintId,
      taskId,
    );
    globals.json ? imprimirJson(dados) : imprimirTabela([dados]);
  });

sprint
  .command("set-points")
  .argument("<task-id>")
  .argument("<points>", "Sprint Points", numeroNaoNegativo)
  .description("define os Sprint Points de uma tarefa")
  .action(async function (this: Command, taskId: string, points: number) {
    const globals = this.optsWithGlobals() as GlobalOptions;
    const tarefa = await definirSprintPoints(
      (await criarContexto(globals.account)).client,
      taskId,
      points,
    );
    globals.json ? imprimirJson(tarefa) : imprimirTabela([resumirTarefa(tarefa)]);
  });

const task = program.command("task").description("gerencia tarefas");
task
  .command("list")
  .alias("ls")
  .requiredOption("--list <id>", "ID da list")
  .option("--status <status...>", "status aceitos")
  .option("--assignee <ids...>", "IDs dos responsáveis")
  .option("--include-closed", "inclui tarefas concluídas")
  .option("--page <n>", "página, começando em zero", inteiro)
  .description("lista tarefas de uma list")
  .action(async function (this: Command, options) {
    const globals = this.optsWithGlobals() as GlobalOptions;
    const tarefas = await (
      await criarContexto(globals.account)
    ).client.listarTarefas(options.list, {
      ...(options.status ? { status: options.status } : {}),
      ...(options.assignee ? { assignees: options.assignee } : {}),
      ...(options.includeClosed ? { includeClosed: true } : {}),
      ...(options.page !== undefined ? { page: options.page } : {}),
    });
    globals.json
      ? imprimirJson(tarefas)
      : imprimirTabela(tarefas.map(resumirTarefa));
  });

task
  .command("get")
  .argument("<task-id>")
  .option("--raw", "retorna somente a resposta original do ClickUp")
  .option("--markdown", "concatena a tarefa e os itens em um único Markdown")
  .description("obtém a tarefa e sua fila de subtarefas e checklists")
  .action(async function (this: Command, taskId: string, options) {
    const globals = this.optsWithGlobals() as GlobalOptions;
    const formatosSelecionados = [
      Boolean(options.raw),
      Boolean(options.markdown),
      Boolean(globals.json),
    ].filter(Boolean).length;
    if (formatosSelecionados > 1) {
      throw new CliError(
        "Use somente uma saída entre --raw, --markdown e --json.",
      );
    }
    const tarefa = await (
      await criarContexto(globals.account)
    ).client.obterTarefa(taskId);
    const leitura = criarLeituraTarefa(tarefa);
    if (options.raw) {
      imprimirJson(tarefa);
    } else if (options.markdown) {
      process.stdout.write(renderizarLeituraMarkdown(leitura));
    } else if (globals.json) {
      imprimirJson(leitura);
    } else {
      imprimirTabela(leitura.execution.items.map(resumirWorkItem));
    }
  });

task
  .command("search")
  .option("--query <texto>", "texto no nome, descrição ou ID")
  .option("--status <status...>", "status aceitos")
  .option("--assignee <ids...>", "IDs dos responsáveis")
  .option("--include-closed", "inclui tarefas concluídas")
  .option("--max-pages <n>", "limite de páginas consultadas", inteiro, 100)
  .description("busca tarefas em todo o workspace")
  .action(async function (this: Command, options) {
    const globals = this.optsWithGlobals() as GlobalOptions;
    const ctx = await criarContexto(globals.account);
    const tarefas = await ctx.client.buscarTarefasWorkspace(
      ctx.account.workspace.id,
      {
        ...(options.query ? { query: options.query } : {}),
        ...(options.status ? { status: options.status } : {}),
        ...(options.assignee ? { assignees: options.assignee } : {}),
        ...(options.includeClosed ? { includeClosed: true } : {}),
        ...(options.maxPages ? { maxPages: options.maxPages } : {}),
      },
    );
    globals.json
      ? imprimirJson(tarefas)
      : imprimirTabela(tarefas.map(resumirTarefa));
  });

task
  .command("create")
  .requiredOption("--list <id>", "ID da list")
  .requiredOption("--name <nome>", "nome da tarefa")
  .option("--description <texto>", "descrição")
  .option("--markdown-content <markdown>", "descrição preservada como Markdown")
  .option("--status <status>", "status inicial")
  .addOption(
    new Option("--priority <n>", "1 urgente, 2 alta, 3 normal, 4 baixa")
      .argParser(prioridade),
  )
  .option("--assignee <ids...>", "IDs numéricos dos responsáveis")
  .option("--parent <task-id>", "cria a tarefa como subtarefa")
  .option("--start-date <AAAA-MM-DD>", "data de início")
  .option("--due-date <AAAA-MM-DD>", "data de entrega")
  .option("--points <n>", "Sprint Points", numeroNaoNegativo)
  .description("cria uma tarefa de desenvolvimento")
  .action(async function (this: Command, options) {
    const globals = this.optsWithGlobals() as GlobalOptions;
    const tarefa = await (
      await criarContexto(globals.account)
    ).client.criarTarefa(
      options.list,
      limparIndefinidos({
        name: options.name,
        description: options.description,
        markdown_content: options.markdownContent,
        status: options.status,
        priority: options.priority,
        assignees: options.assignee?.map(inteiro),
        parent: options.parent,
        start_date: options.startDate
          ? dataParaTimestamp(options.startDate, false)
          : undefined,
        due_date: options.dueDate ? dataParaTimestamp(options.dueDate) : undefined,
        points: options.points,
      }),
    );
    globals.json ? imprimirJson(tarefa) : imprimirTabela([resumirTarefa(tarefa)]);
  });

task
  .command("update")
  .argument("<task-id>")
  .option("--name <nome>", "novo nome")
  .option("--description <texto>", "nova descrição")
  .option("--markdown-content <markdown>", "nova descrição em Markdown")
  .option("--status <status>", "novo status")
  .option("--priority <n>", "1 urgente, 2 alta, 3 normal, 4 baixa", inteiro)
  .option("--start-date <AAAA-MM-DD>", "nova data de início")
  .option("--clear-start-date", "remove a data de início")
  .option("--due-date <AAAA-MM-DD>", "nova data de entrega")
  .option("--clear-due-date", "remove a data de entrega")
  .option("--points <n>", "Sprint Points", numeroNaoNegativo)
  .description("atualiza uma tarefa")
  .action(async function (this: Command, taskId: string, options) {
    const globals = this.optsWithGlobals() as GlobalOptions;
    const dados = limparIndefinidos({
      name: options.name,
      description: options.description,
      markdown_content: options.markdownContent,
      status: options.status,
      priority: options.priority,
      start_date: options.clearStartDate
        ? null
        : options.startDate
          ? dataParaTimestamp(options.startDate, false)
          : undefined,
      due_date: options.clearDueDate
        ? null
        : options.dueDate
          ? dataParaTimestamp(options.dueDate)
          : undefined,
      points: options.points,
    });
    if (Object.keys(dados).length === 0) {
      throw new CliError("Informe ao menos um campo para atualizar.");
    }
    const tarefa = await (
      await criarContexto(globals.account)
    ).client.atualizarTarefa(taskId, dados);
    globals.json ? imprimirJson(tarefa) : imprimirTabela([resumirTarefa(tarefa)]);
  });

task
  .command("delete")
  .argument("<task-id>")
  .option("--yes", "confirma a exclusão sem prompt")
  .description("exclui permanentemente uma tarefa")
  .action(async function (this: Command, taskId: string, options) {
    const confirmado =
      options.yes ||
      (process.stdin.isTTY &&
        (await confirm({
          message: `Excluir permanentemente a tarefa "${taskId}"?`,
          default: false,
        })));
    if (!confirmado) {
      throw new CliError("Exclusão cancelada. Use --yes para confirmar.");
    }
    const globals = this.optsWithGlobals() as GlobalOptions;
    await (await criarContexto(globals.account)).client.excluirTarefa(taskId);
    process.stdout.write(`Tarefa excluída: ${taskId}\n`);
  });

const checklist = program
  .command("checklist")
  .description("gerencia itens de checklist");

checklist
  .command("create")
  .argument("<task-id>", "ID da tarefa")
  .requiredOption("--name <nome>", "nome do checklist")
  .description("cria um checklist em uma tarefa")
  .action(async function (this: Command, taskId: string, options) {
    const globals = this.optsWithGlobals() as GlobalOptions;
    const dados = await (
      await criarContexto(globals.account)
    ).client.criarChecklist(taskId, options.name);
    imprimir(dados, globals.json);
  });

checklist
  .command("item-create")
  .argument("<checklist-id>", "ID do checklist")
  .requiredOption("--name <nome>", "nome do item")
  .option("--assignee <id>", "ID numérico do responsável", inteiro)
  .description("cria um item em um checklist")
  .action(async function (this: Command, checklistId: string, options) {
    const globals = this.optsWithGlobals() as GlobalOptions;
    const dados = await (
      await criarContexto(globals.account)
    ).client.criarItemChecklist(
      checklistId,
      limparIndefinidos({
        name: options.name,
        assignee: options.assignee,
      }) as { name: string; assignee?: number },
    );
    imprimir(dados, globals.json);
  });

checklist
  .command("set")
  .argument("<task-id>", "tarefa raiz usada para validar o item")
  .argument("<checklist-id>", "ID do checklist")
  .argument("<item-id>", "ID do checklist item")
  .option("--resolved", "marca o item como concluído")
  .option("--open", "reabre o item")
  .description("altera e confirma o estado de um checklist item")
  .action(async function (
    this: Command,
    taskId: string,
    checklistId: string,
    itemId: string,
    options,
  ) {
    if (Boolean(options.resolved) === Boolean(options.open)) {
      throw new CliError("Informe somente --resolved ou --open.");
    }
    const globals = this.optsWithGlobals() as GlobalOptions;
    const item = await definirEstadoItemChecklist(
      (await criarContexto(globals.account)).client,
      taskId,
      checklistId,
      itemId,
      Boolean(options.resolved),
    );
    globals.json ? imprimirJson(item) : imprimirTabela([resumirWorkItem(item)]);
  });

const comment = program.command("comment").description("gerencia comentários");
comment
  .command("list")
  .alias("ls")
  .requiredOption("--task <id>", "ID da tarefa")
  .description("lista comentários de uma tarefa")
  .action(async function (this: Command, options) {
    const globals = this.optsWithGlobals() as GlobalOptions;
    const comentarios = await (
      await criarContexto(globals.account)
    ).client.listarComentarios(options.task);
    globals.json
      ? imprimirJson(comentarios)
      : imprimirTabela(comentarios.map(resumirComentario));
  });

comment
  .command("create")
  .requiredOption("--task <id>", "ID da tarefa")
  .requiredOption("--text <texto>", "texto do comentário")
  .option("--notify-all", "notifica todos os participantes")
  .description("publica um comentário de progresso")
  .action(async function (this: Command, options) {
    const globals = this.optsWithGlobals() as GlobalOptions;
    const dados = await (
      await criarContexto(globals.account)
    ).client.criarComentario(options.task, options.text, options.notifyAll);
    globals.json ? imprimirJson(dados) : imprimirTabela([dados]);
  });

const time = program.command("time").description("gerencia time tracking");
time
  .command("current")
  .description("mostra o time entry em execução")
  .action(async function (this: Command) {
    const globals = this.optsWithGlobals() as GlobalOptions;
    const ctx = await criarContexto(globals.account);
    imprimir(
      await ctx.client.obterTimeEntryAtual(ctx.account.workspace.id),
      globals.json,
    );
  });

time
  .command("start")
  .requiredOption("--task <id>", "ID da tarefa")
  .option("--description <texto>", "descrição do trabalho")
  .description("inicia um time entry")
  .action(async function (this: Command, options) {
    const globals = this.optsWithGlobals() as GlobalOptions;
    const ctx = await criarContexto(globals.account);
    imprimir(
      await ctx.client.iniciarTimeEntry(
        ctx.account.workspace.id,
        limparIndefinidos({
          tid: options.task,
          description: options.description,
        }) as { tid: string; description?: string },
      ),
      globals.json,
    );
  });

time
  .command("stop")
  .description("encerra o time entry em execução")
  .action(async function (this: Command) {
    const globals = this.optsWithGlobals() as GlobalOptions;
    const ctx = await criarContexto(globals.account);
    imprimir(
      await ctx.client.pararTimeEntry(ctx.account.workspace.id),
      globals.json,
    );
  });

const mcp = program.command("mcp").description("integração MCP para agentes");
mcp
  .command("serve")
  .option("--account <perfil>", "fixa um perfil para o servidor")
  .option("--workspace <id>", "fixa o workspace esperado")
  .option("--space <id>", "fixa o Space do projeto")
  .option("--folder <id>", "fixa o Folder do projeto")
  .requiredOption("--list <id>", "fixa a List obrigatória do projeto")
  .option("--sprint-folder <id>", "fixa o Sprint Folder do projeto")
  .option("--read-only", "expõe somente ferramentas de leitura")
  .description("inicia o servidor MCP pelo transporte stdio")
  .action(async function (this: Command, options) {
    const globals = this.optsWithGlobals() as GlobalOptions;
    await serveMcp({
      ...(options.account ?? globals.account
        ? { accountId: options.account ?? globals.account }
        : {}),
      ...(options.workspace ? { workspaceId: options.workspace } : {}),
      ...(options.space ? { spaceId: options.space } : {}),
      ...(options.folder ? { folderId: options.folder } : {}),
      listId: options.list,
      ...(options.sprintFolder
        ? { sprintFolderId: options.sprintFolder }
        : {}),
      ...(options.readOnly ? { readOnly: true } : {}),
    });
  });

const agent = program.command("agent").description("integração com agentes");
const skill = agent.command("skill").description("gerencia skills incluídas");

skill
  .command("list")
  .description("lista as skills disponíveis")
  .action(() => imprimirTabela(SKILL_NAMES.map((name) => ({ name }))));

skill
  .command("show")
  .argument("<skill>", "nome da skill")
  .description("mostra as instruções de uma skill")
  .action(async (name: string) => {
    process.stdout.write(await lerSkill(validarSkillName(name)));
  });

skill
  .command("install")
  .argument("[skills...]", "skills; omita para instalar todas")
  .option("--global", "instala em ~/.codex/skills")
  .option("--target <pasta>", "pasta de skills alternativa")
  .option("--force", "atualiza skills existentes")
  .description("instala skills no projeto ou globalmente")
  .action(async (names: string[], options) => {
    const selecionadas =
      names.length > 0 ? names.map(validarSkillName) : [...SKILL_NAMES];
    const instaladas = await instalarSkills({
      names: selecionadas,
      ...(options.global ? { global: true } : {}),
      ...(options.target ? { target: options.target } : {}),
      ...(options.force ? { force: true } : {}),
    });
    for (const caminho of instaladas) process.stdout.write(`${caminho}\n`);
  });

agent
  .command("init")
  .option("--global", "instala as skills globalmente")
  .option("--workspace <id>", "workspace esperado pelo MCP")
  .requiredOption("--space <id>", "Space fixo do MCP deste projeto")
  .option("--folder <id>", "Folder fixo do MCP deste projeto")
  .requiredOption("--list <id>", "List fixa do MCP deste projeto")
  .option("--sprint-folder <id>", "Sprint Folder fixo do MCP")
  .option("--force", "atualiza skills existentes")
  .description("instala as skills e adiciona o servidor ao .mcp.json")
  .action(async function (this: Command, options) {
    const globals = this.optsWithGlobals() as GlobalOptions;
    const configuracao = await lerConfiguracao();
    const resolvida = resolverAccount(configuracao, globals.account);
    if (
      options.workspace &&
      options.workspace !== resolvida.account.workspace.id
    ) {
      throw new CliError(
        `O perfil "${resolvida.id}" está associado ao workspace ${resolvida.account.workspace.id}.`,
      );
    }
    const skills = await instalarSkills({
      ...(options.global ? { global: true } : {}),
      ...(options.force ? { force: true } : {}),
    });
    const mcpPath = await configurarMcpProjeto({
      account: resolvida.id,
      ...(options.workspace ? { workspace: options.workspace } : {}),
      space: options.space,
      ...(options.folder ? { folder: options.folder } : {}),
      list: options.list,
      ...(options.sprintFolder
        ? { sprintFolder: options.sprintFolder }
        : {}),
    });
    for (const caminho of skills) process.stdout.write(`Skill: ${caminho}\n`);
    process.stdout.write(`MCP: ${mcpPath}\n`);
  });

/** Executa o programa e converte falhas conhecidas em mensagens curtas. */
export async function main(argv = process.argv): Promise<void> {
  try {
    await program.parseAsync(argv);
  } catch (error) {
    const message = error instanceof Error ? error.message : String(error);
    process.stderr.write(`Erro: ${message}\n`);
    process.exitCode = error instanceof CliError ? error.exitCode : 1;
  }
}

function imprimir(valor: unknown, json = false): void {
  if (json || !Array.isArray(valor)) {
    imprimirJson(valor);
    return;
  }
  imprimirTabela(valor as Array<Record<string, unknown>>);
}

function inteiro(valor: string): number {
  const numero = Number.parseInt(valor, 10);
  if (!Number.isInteger(numero)) throw new CliError(`Valor inválido: ${valor}`);
  return numero;
}

function prioridade(valor: string): number {
  const numero = inteiro(valor);
  if (numero < 1 || numero > 4) {
    throw new CliError("A prioridade deve estar entre 1 e 4.");
  }
  return numero;
}

function numeroNaoNegativo(valor: string): number {
  const numero = Number(valor);
  if (!Number.isFinite(numero) || numero < 0) {
    throw new CliError(`Valor inválido: ${valor}. Use um número não negativo.`);
  }
  return numero;
}

function dataParaTimestamp(valor: string, fimDoDia = true): number {
  if (!/^\d{4}-\d{2}-\d{2}$/.test(valor)) {
    throw new CliError(`Data inválida: ${valor}. Use AAAA-MM-DD.`);
  }
  const horario = fimDoDia ? "T23:59:59.999Z" : "T00:00:00.000Z";
  const timestamp = new Date(`${valor}${horario}`).getTime();
  if (Number.isNaN(timestamp)) throw new CliError(`Data inválida: ${valor}.`);
  return timestamp;
}

function dataDeReferencia(valor: string): number {
  if (!/^\d{4}-\d{2}-\d{2}$/.test(valor)) {
    throw new CliError(`Data inválida: ${valor}. Use AAAA-MM-DD.`);
  }
  const data = new Date(`${valor}T12:00:00.000Z`);
  if (Number.isNaN(data.getTime()) || !data.toISOString().startsWith(valor)) {
    throw new CliError(`Data inválida: ${valor}.`);
  }
  return data.getTime();
}

function limparIndefinidos(
  objeto: Record<string, unknown>,
): Record<string, unknown> {
  return Object.fromEntries(
    Object.entries(objeto).filter(([, valor]) => valor !== undefined),
  );
}

function validarSkillName(name: string): SkillName {
  if (!SKILL_NAMES.includes(name as SkillName)) {
    throw new CliError(
      `Skill desconhecida: ${name}. Opções: ${SKILL_NAMES.join(", ")}.`,
    );
  }
  return name as SkillName;
}

void main();
