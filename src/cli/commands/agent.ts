/**
 * `agent` command: integration with coding agents (spec 0010).
 *
 * - `agent skill list` lists the ClickUpfy skills embedded in the binary.
 * - `agent skill show <skill>` prints the `SKILL.md` of one skill.
 * - `agent skill install [skills...]` installs skills with `npx skills add`.
 * - `agent install` (alias `init`) installs every skill and writes the pinned
 *   MCP server `promovaweb-clickupfy` to `.mcp.json` and `.codex/config.toml`
 *   of the current directory, as ClickUpfy 0.9.0 did.
 */
import { error } from "../../app/errors.ts";
import { ExitCode } from "../../app/exit-codes.ts";
import { manifest } from "../../app/manifest.ts";
import { installSkills, readSkill, skillDescription, skillName, SKILL_NAMES } from "../../agent/skills.ts";
import { resolveAccount } from "../../clickup/accounts.ts";
import { writeClientEntries } from "../../mcp/setup.ts";
import { renderRows } from "../../operations/render.ts";
import type { Command, Context } from "../registry.ts";

const bin = manifest.bin;

/** MCP server name written by `agent install`, the same as ClickUpfy 0.9.0. */
export const AGENT_MCP_SERVER = "promovaweb-clickupfy";

function value(ctx: Context, key: string): string | undefined {
  const v = ctx.options[key];
  return typeof v === "string" && v.trim() ? v.trim() : undefined;
}

const skillCommand: Command = {
  name: "skill",
  description: "Manage the ClickUpfy skills for coding agents.",
  examples: [`${bin} agent skill list`, `${bin} agent skill install --global`],
  subcommands: [
    {
      name: "list",
      aliases: ["ls"],
      description: "List the skills embedded in the binary.",
      examples: [`${bin} agent skill list --json`],
      run: () => {
        const skills = SKILL_NAMES.map((name) => ({ name, description: skillDescription(name) }));
        return { data: { skills }, text: () => renderRows(skills, ["name", "description"]) };
      },
    },
    {
      name: "show",
      description: "Print the instructions (SKILL.md) of one skill.",
      arguments: [{ name: "skill", description: "Skill name, as shown by agent skill list.", required: true, values: SKILL_NAMES }],
      examples: [`${bin} agent skill show clickupfy-dev`],
      run: (ctx) => {
        const name = skillName(ctx.args[0] as string);
        const content = readSkill(name);
        return { data: { name, content }, text: content.trimEnd() };
      },
    },
    {
      name: "install",
      description: "Install skills with the official manager (npx skills add).",
      arguments: [{ name: "skills", description: "Skills to install; omit to install all.", variadic: true }],
      options: [
        { name: "--global", description: "Install in the user's global catalog instead of the current project." },
        { name: "--force", description: "Kept for compatibility with 0.9.0; reinstalling is always allowed." },
      ],
      exitCodes: [ExitCode.NOT_FOUND],
      examples: [`${bin} agent skill install`, `${bin} agent skill install clickupfy-dev --global`],
      run: async (ctx) => {
        const names = ctx.args.map(skillName);
        const installed = await installSkills({ names, global: ctx.options.global === true });
        return { data: { skills: installed }, text: installed.map((s) => s.path).join("\n") };
      },
    },
  ],
};

const installCommand: Command = {
  name: "install",
  aliases: ["init"],
  description: "Install the skills and add the pinned MCP server to .mcp.json and .codex/config.toml.",
  longDescription:
    `Writes the entry ${AGENT_MCP_SERVER} (replacing an existing one) with "mcp serve --account <profile> --space <id> --list <id>" plus the optional pins. Only the profile id goes to the files, never the API key.`,
  options: [
    { name: "--global", description: "Install the skills globally." },
    { name: "--workspace", argument: { name: "id" }, description: "Workspace expected by the MCP server; must be the profile's workspace." },
    { name: "--space", argument: { name: "id" }, description: "Space pinned by the project MCP server. Required." },
    { name: "--folder", argument: { name: "id" }, description: "Folder pinned by the project MCP server." },
    { name: "--list", argument: { name: "id" }, description: "List pinned by the project MCP server. Required." },
    { name: "--sprint-folder", argument: { name: "id" }, description: "Sprint folder pinned by the MCP server." },
    { name: "--force", description: "Kept for compatibility with 0.9.0; existing skills are updated." },
  ],
  exitCodes: [ExitCode.CONFIG, ExitCode.CREDENTIALS, ExitCode.NOT_FOUND, ExitCode.PERMISSION],
  examples: [`${bin} agent install --space 901 --list 902`, `${bin} agent init --account work --space 901 --list 902 --sprint-folder 903`],
  run: async (ctx) => {
    const space = value(ctx, "space");
    const list = value(ctx, "list");
    if (!space || !list) throw error.usage("Pass --space <id> and --list <id>.");
    const workspace = value(ctx, "workspace");
    const folder = value(ctx, "folder");
    const sprintFolder = value(ctx, "sprint-folder");
    const resolved = await resolveAccount(ctx.options.account as string | undefined);
    if (workspace && workspace !== resolved.account.workspace.id) {
      throw error.usage(`Profile "${resolved.id}" is bound to workspace ${resolved.account.workspace.id}.`, { workspace });
    }
    const skills = await installSkills({ global: ctx.options.global === true });
    const args = [
      "mcp",
      "serve",
      "--account",
      resolved.id,
      ...(workspace ? ["--workspace", workspace] : []),
      "--space",
      space,
      ...(folder ? ["--folder", folder] : []),
      "--list",
      list,
      ...(sprintFolder ? ["--sprint-folder", sprintFolder] : []),
    ];
    const files = writeClientEntries({ project: process.cwd(), name: AGENT_MCP_SERVER, clients: ["claude-code", "codex"], args, force: true });
    const data = { account: resolved.id, name: AGENT_MCP_SERVER, args, skills: skills.map((s) => s.path), files };
    return {
      data,
      text: [...data.skills.map((p) => `Skill: ${p}`), ...files.map((f) => `MCP: ${f}`)].join("\n"),
    };
  },
};

export const agentCommand: Command = {
  name: "agent",
  description: "Integrate ClickUpfy with coding agents: skills and project MCP server.",
  subcommands: [skillCommand, installCommand],
  examples: [`${bin} agent skill list`, `${bin} agent install --space 901 --list 902`],
};
