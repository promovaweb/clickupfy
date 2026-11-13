/**
 * Builds registry commands from operations.
 *
 * Operations that share the first path segment become one group command
 * (`task`, `sprint`, `doc`...), and three-segment paths create a nested
 * group (`doc page get`). Positional params become arguments; the other
 * params become options named in kebab-case. Values are converted from text
 * to the declared type, and `strings` params accept a comma-separated list.
 * Destructive operations gain `--yes` and confirm on a terminal.
 */
import { manifest } from "../app/manifest.ts";
import { ExitCode } from "../app/exit-codes.ts";
import { error } from "../app/errors.ts";
import { connect } from "../clickup/accounts.ts";
import { confirm } from "../cli/input.ts";
import type { Command, OptionDefinition, ArgumentDefinition, Context } from "../cli/registry.ts";
import { renderDefault } from "./render.ts";
import { kebab, type Operation, type Param } from "./types.ts";

const BASE_CODES = [ExitCode.CONFIG, ExitCode.CREDENTIALS, ExitCode.NETWORK_OR_API, ExitCode.NOT_FOUND] as const;

function optionName(p: Param): string {
  return `--${p.option ?? kebab(p.key)}`;
}

/** Converts one CLI value to the param type, raising USAGE on bad input. */
export function convert(p: Param, raw: string | boolean | undefined): unknown {
  if (raw === undefined) return undefined;
  const flag = optionName(p);
  switch (p.type) {
    case "boolean":
      if (raw === true) return true;
      if (raw === "true" || raw === "1") return true;
      if (raw === "false" || raw === "0") return false;
      throw error.usage(`${flag} accepts true or false.`);
    case "number":
    case "integer": {
      const n = Number(raw);
      if (raw === true || !Number.isFinite(n) || (p.type === "integer" && !Number.isInteger(n))) {
        throw error.usage(`${flag} must be ${p.type === "integer" ? "an integer" : "a number"}.`);
      }
      return n;
    }
    case "strings":
      if (typeof raw !== "string") throw error.usage(`${flag} requires a value.`);
      return raw
        .split(",")
        .map((s) => s.trim())
        .filter(Boolean);
    default:
      if (typeof raw !== "string") throw error.usage(`${flag} requires a value.`);
      if (p.values && !p.values.includes(raw)) throw error.usage(`Invalid value for ${flag}: "${raw}". Accepted: ${p.values.join(", ")}.`);
      return raw;
  }
}

function toCommand(op: Operation, name: string): Command {
  const params = op.params.filter((p) => p.only !== "mcp");
  const positional = params.filter((p) => p.positional);
  const named = params.filter((p) => !p.positional);
  const args: ArgumentDefinition[] = positional.map((p) => ({
    name: kebab(p.key),
    description: p.description,
    required: p.required === true,
    ...(p.values ? { values: p.values } : {}),
  }));
  const options: OptionDefinition[] = named.map((p) => ({
    name: optionName(p),
    description: `${p.description}${p.required ? " Required." : ""}${p.type === "strings" ? " Comma-separated." : ""}`,
    ...(p.type === "boolean" ? {} : { argument: { name: p.type === "strings" ? "values" : kebab(p.key), ...(p.values ? { values: p.values } : {}) } }),
  }));
  if (op.destructive) options.push({ name: "--yes", description: "Confirm without a prompt. Required off a TTY." });

  return {
    name,
    ...(op.aliases ? { aliases: op.aliases } : {}),
    description: op.description,
    ...(op.longDescription ? { longDescription: op.longDescription } : {}),
    ...(args.length ? { arguments: args } : {}),
    ...(options.length ? { options } : {}),
    exitCodes: [...new Set([...BASE_CODES, ...(op.exitCodes ?? []), ...(op.destructive ? [ExitCode.INTERRUPTED] : [])])],
    ...(op.examples ? { examples: op.examples } : {}),
    run: async (ctx: Context) => {
      const input: Record<string, unknown> = {};
      positional.forEach((p, i) => {
        const value = convert(p, ctx.args[i]);
        if (value !== undefined) input[p.key] = value;
      });
      for (const p of named) {
        const value = convert(p, ctx.options[p.option ?? kebab(p.key)]);
        if (value !== undefined) input[p.key] = value;
        else if (p.required) throw error.usage(`Missing required option ${optionName(p)}.`);
      }
      if (op.destructive && ctx.options.yes !== true) {
        if (!ctx.interactive) throw error.usage("Pass --yes to confirm without an interactive terminal.");
        if (!(await confirm(`${op.description} Continue?`))) throw error.interrupted("Cancelled.");
      }
      const { client, ...account } = await connect(ctx.options.account as string | undefined);
      const data = await op.run(input, { account, client, scope: {}, source: "cli", warn: ctx.stderr });
      return { data, text: () => (op.text ? op.text(data, input) : renderDefault(data)) };
    },
  };
}

/** Descriptions of the group commands created from operation paths. */
export interface GroupInfo {
  description: string;
  examples?: readonly string[];
}

/**
 * Builds the group commands for every operation with a path. `groups` maps a
 * group path (`"task"`, `"doc page"`) to its description.
 */
export function buildCommands(ops: readonly Operation[], groups: Record<string, GroupInfo>): Command[] {
  const roots = new Map<string, Command & { subcommands: Command[] }>();
  const group = (key: string, name: string, parent?: Command & { subcommands: Command[] }) => {
    const existing = parent ? (parent.subcommands.find((c) => c.name === name) as (Command & { subcommands: Command[] }) | undefined) : roots.get(name);
    if (existing) return existing;
    const info = groups[key] ?? { description: `${name} commands.` };
    const created: Command & { subcommands: Command[] } = {
      name,
      description: info.description,
      subcommands: [],
      examples: info.examples ?? [`${manifest.bin} ${key} --help`],
    };
    if (parent) parent.subcommands.push(created);
    else roots.set(name, created);
    return created;
  };
  for (const op of ops) {
    if (!op.path) continue;
    const segments = [...op.path];
    const leaf = segments.pop() as string;
    if (segments.length === 0) throw new Error(`Operation path needs a group: ${leaf}`);
    let parent = group(segments[0] as string, segments[0] as string);
    for (let i = 1; i < segments.length; i += 1) parent = group(segments.slice(0, i + 1).join(" "), segments[i] as string, parent);
    parent.subcommands.push(toCommand(op, leaf));
  }
  return [...roots.values()];
}
