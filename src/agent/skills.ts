/**
 * ClickUpfy skills for coding agents (spec 0010).
 *
 * The skills live in `.codex/skills/<name>/` of this repository. Their
 * `SKILL.md` enters the binary as text at build time, so `agent skill list`
 * and `agent skill show` work without the repository. Installation goes
 * through the official skills manager (`npx skills add promovaweb/clickupfy`),
 * the only Node tool the binary calls, exactly as ClickUpfy 0.9.0 did; the
 * manager owns the lockfile and the install paths.
 */
import { AppError, error } from "../app/errors.ts";
import { ExitCode } from "../app/exit-codes.ts";
import setupSkill from "../../.codex/skills/clickupfy-setup/SKILL.md" with { type: "text" };
import devSkill from "../../.codex/skills/clickupfy-dev/SKILL.md" with { type: "text" };
import issueCreateSkill from "../../.codex/skills/clickup-issue-create/SKILL.md" with { type: "text" };
import issueImplementSkill from "../../.codex/skills/clickup-issue-implement/SKILL.md" with { type: "text" };
import releaseSkill from "../../.codex/skills/clickupfy-release/SKILL.md" with { type: "text" };

/** Source repository given to `npx skills add`. */
export const SKILLS_SOURCE = "promovaweb/clickupfy";

const EMBEDDED = {
  "clickupfy-setup": setupSkill,
  "clickupfy-dev": devSkill,
  "clickup-issue-create": issueCreateSkill,
  "clickup-issue-implement": issueImplementSkill,
  "clickupfy-release": releaseSkill,
} as const;

/** Names of the skills shipped with the binary, in display order. */
export const SKILL_NAMES = Object.keys(EMBEDDED) as SkillName[];
export type SkillName = keyof typeof EMBEDDED;

/** Skill as reported by `skills list --json`. */
export interface ManagedSkill {
  name: string;
  path: string;
  scope: "project" | "global";
  agents: string[];
  source?: string | null;
}

/** Validates a skill name. An unknown name raises NOT_FOUND (6). */
export function skillName(name: string): SkillName {
  if (!(name in EMBEDDED)) {
    throw error.notFound(`Unknown skill: ${name}. Available: ${SKILL_NAMES.join(", ")}.`, { skill: name });
  }
  return name as SkillName;
}

/** Description from the front matter of a skill. */
export function skillDescription(name: SkillName): string {
  return /^description:\s*(.+)$/m.exec(EMBEDDED[name])?.[1]?.trim() ?? "";
}

/** Full `SKILL.md` of an embedded skill. */
export function readSkill(name: SkillName): string {
  return EMBEDDED[name];
}

/**
 * Runs `npx --yes skills <args>` in `cwd` and returns stdout. A missing
 * `npx` or a failing manager raises GENERIC_ERROR (1) with the first line of
 * the message, never with the environment.
 */
export async function runSkillsCli(args: string[], cwd = process.cwd()): Promise<string> {
  let proc: Bun.Subprocess<"ignore", "pipe", "pipe">;
  try {
    proc = Bun.spawn(["npx", "--yes", "skills", ...args], { cwd, stdin: "ignore", stdout: "pipe", stderr: "pipe" });
  } catch {
    throw new AppError(ExitCode.GENERIC_ERROR, 'The "npx" command was not found in PATH. Install Node.js and npm to manage skills.');
  }
  const [stdout, stderr, code] = await Promise.all([new Response(proc.stdout).text(), new Response(proc.stderr).text(), proc.exited]);
  if (code !== 0) {
    const line = (stderr.trim() || stdout.trim()).split("\n")[0] || `exit code ${code}`;
    throw new AppError(ExitCode.GENERIC_ERROR, `The "skills" command failed: ${line}`, { exitCode: code });
  }
  return stdout;
}

function isManagedSkill(value: unknown): value is ManagedSkill {
  if (!value || typeof value !== "object") return false;
  const s = value as Record<string, unknown>;
  return typeof s.name === "string" && typeof s.path === "string" && (s.scope === "project" || s.scope === "global") && Array.isArray(s.agents);
}

/** Lists the skills registered by the manager, optionally only some names. */
export async function listManagedSkills(options: { global?: boolean; names?: readonly string[]; cwd?: string } = {}): Promise<ManagedSkill[]> {
  const stdout = await runSkillsCli(["list", "--json", ...(options.global ? ["--global"] : [])], options.cwd);
  let value: unknown;
  try {
    value = JSON.parse(stdout);
  } catch {
    throw new AppError(ExitCode.GENERIC_ERROR, 'The "skills list --json" command did not return valid JSON.');
  }
  if (!Array.isArray(value)) throw new AppError(ExitCode.GENERIC_ERROR, 'The "skills list --json" command returned an invalid structure.');
  const names = options.names ? new Set(options.names) : undefined;
  return value.filter(isManagedSkill).filter((s) => !names || names.has(s.name));
}

/**
 * Installs skills with `npx skills add promovaweb/clickupfy --yes --copy
 * --agent codex --skill <name>...` and confirms each one with `skills list`.
 * Returns the installed paths. A skill missing after the install raises
 * GENERIC_ERROR (1).
 */
export async function installSkills(options: { names?: readonly SkillName[]; global?: boolean; cwd?: string } = {}): Promise<ManagedSkill[]> {
  const names = options.names?.length ? [...options.names] : [...SKILL_NAMES];
  await runSkillsCli(
    ["add", SKILLS_SOURCE, "--yes", "--copy", "--agent", "codex", ...names.flatMap((n) => ["--skill", n]), ...(options.global ? ["--global"] : [])],
    options.cwd,
  );
  const installed = await listManagedSkills({ names, ...(options.global ? { global: true } : {}), ...(options.cwd ? { cwd: options.cwd } : {}) });
  const missing = names.filter((n) => !installed.some((s) => s.name === n));
  if (missing.length) throw new AppError(ExitCode.GENERIC_ERROR, `"skills add" finished without registering: ${missing.join(", ")}.`, { missing });
  return installed;
}
