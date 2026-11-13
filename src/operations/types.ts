/**
 * Shared operation model for the ClickUp features.
 *
 * Each ClickUp operation (list tasks, create a comment, start a timer...) is
 * declared once as an `Operation`: its command path, MCP tool name, typed
 * parameters, effect and `run` function. `cli.ts` turns the list into
 * registry commands and `mcp.ts` into MCP tools, so the CLI, the MCP server
 * and the TUI call the same code with the same validation.
 *
 * Parameter keys use camelCase, as the MCP tools of ClickUpfy 0.9.0 did;
 * the CLI option name is derived as kebab-case unless `option` overrides it.
 */
import type { ExitCode } from "../app/exit-codes.ts";
import type { ResolvedAccount } from "../clickup/accounts.ts";
import type { ClickUpClient } from "../clickup/client.ts";
import type { Scope } from "../clickup/scope.ts";

/** Parameter value types. `strings` is a list (comma-separated in the CLI). */
export type ParamType = "string" | "number" | "integer" | "boolean" | "strings";

/** One input of an operation. */
export interface Param {
  /** camelCase key used in MCP and in `run` input. */
  key: string;
  type: ParamType;
  description: string;
  required?: boolean;
  /** CLI: positional argument instead of an option, in declaration order. */
  positional?: boolean;
  /** CLI option name without `--`, when it differs from the kebab-case key. */
  option?: string;
  /** Closed list of accepted values. */
  values?: readonly string[];
  /** Only exposed in the CLI or only in MCP. */
  only?: "cli" | "mcp";
}

/** Runtime context handed to `run`. */
export interface OperationContext {
  account: ResolvedAccount;
  client: ClickUpClient;
  /** Scope pinned by the MCP server flags; empty in the CLI. */
  scope: Scope;
  source: "cli" | "mcp";
  /** Progress and warnings; stderr in the CLI, discarded in MCP. */
  warn: (text: string) => void;
}

/** Declarative operation shared by CLI and MCP. */
export interface Operation {
  /** Command path, e.g. `["task", "create"]`. Absent for MCP-only operations. */
  path?: readonly string[];
  /** Aliases of the last path segment, e.g. `["ls"]`. */
  aliases?: readonly string[];
  /** MCP tool name. Absent for CLI-only operations. */
  tool?: string;
  /** Short title for MCP clients. */
  title: string;
  /** One line, used by `--help` and as the tool description. */
  description: string;
  /** Extra text for the command help and the tool description. */
  longDescription?: string;
  params: readonly Param[];
  /** `write` operations disappear from a `--read-only` MCP server. */
  effect: "read" | "write";
  /** Asks for confirmation: `--yes` in the CLI, `confirm: true` in MCP. */
  destructive?: boolean;
  exitCodes?: readonly ExitCode[];
  examples?: readonly string[];
  run: (input: Record<string, unknown>, ctx: OperationContext) => Promise<unknown>;
  /** Text renderer for the CLI; defaults to a generic table. */
  text?: (data: unknown, input: Record<string, unknown>) => string;
}

/** Converts a camelCase key into a kebab-case option name. */
export function kebab(key: string): string {
  return key.replace(/[A-Z]/g, (c) => `-${c.toLowerCase()}`);
}
