/**
 * Overview tab: ClickUp profile, workspace and running timer at a glance
 * (spec 0011).
 *
 * The top row shows the resolved profile with its user and workspace, and
 * the local state (accounts.json, vault, master key). The bottom row lists
 * the local profiles and the next steps. The running time entry is loaded
 * asynchronously when the tab is shown and again with `r`; the screen is
 * read-only and never prints the API key. The timer comes from
 * `currentTimeEntry` (spec 0007). Without a profile it points to
 * `clickupfy setup`.
 */
import { BoxRenderable, TextRenderable } from "@opentui/core";
import { manifest } from "../../app/manifest.ts";
import { paths, exists } from "../../config/paths.ts";
import { vaultStatus } from "../../config/credentials.ts";
import { clientFor, readAccountsFile, type AccountsFile } from "../../clickup/accounts.ts";
import { currentTimeEntry } from "../../clickup/time.ts";
import { spacer, list, panel, dim, keyValueTable, heading } from "../components.ts";
import { glyphs } from "../theme.ts";
import type { Screen } from "../screen.ts";

/** Formats elapsed time since a millisecond timestamp as `1h 05m`. */
export function elapsed(start: string | number | undefined, now = Date.now()): string {
  const ms = now - Number(start);
  if (!Number.isFinite(ms) || ms < 0) return "-";
  const minutes = Math.floor(ms / 60_000);
  return `${Math.floor(minutes / 60)}h ${String(minutes % 60).padStart(2, "0")}m`;
}

function resolvedId(file: AccountsFile): string | null {
  const fromEnv = process.env.PROMOVAWEB_CLICKUPFY_ACCOUNT?.trim();
  return fromEnv || file.activeAccount;
}

let timerText: TextRenderable | undefined;
let loading = false;

async function refreshTimer(): Promise<void> {
  if (!timerText || loading) return;
  let file: AccountsFile;
  try {
    file = readAccountsFile();
  } catch {
    return;
  }
  const id = resolvedId(file);
  const account = id ? file.accounts[id] : undefined;
  if (!id || !account) {
    timerText.content = "no profile";
    return;
  }
  loading = true;
  timerText.content = "loading…";
  try {
    const entry = await currentTimeEntry(clientFor(id), account.workspace.id);
    timerText.content = entry?.task
      ? `${glyphs.ok} ${entry.task.custom_id ?? entry.task.id ?? ""} ${entry.task.name ?? ""}  ${elapsed(entry.start)}`.trim()
      : "no timer running";
  } catch (e) {
    timerText.content = `unavailable: ${e instanceof Error ? e.message : String(e)}`;
  } finally {
    loading = false;
  }
}

export const overviewScreen: Screen = {
  id: "overview",
  title: "Overview",
  description: "ClickUp profile, workspace and running timer at a glance",
  keys: [{ key: "r", action: "refresh timer" }],
  mount: ({ renderer, theme }) => {
    const rootBox = new BoxRenderable(renderer, { flexDirection: "column", flexGrow: 1 });
    const topRow = new BoxRenderable(renderer, { flexDirection: "row", flexShrink: 0 });

    let file: AccountsFile | undefined;
    let fileError: string | undefined;
    try {
      file = readAccountsFile();
    } catch (e) {
      fileError = e instanceof Error ? e.message : String(e);
    }
    const id = file ? resolvedId(file) : null;
    const account = file && id ? file.accounts[id] : undefined;

    const clickup = panel(renderer, theme, { title: "ClickUp", flexGrow: 1, active: true });
    if (account && id) {
      clickup.add(
        keyValueTable(renderer, theme, [
          ["Profile", `${id}${file?.activeAccount === id ? " (active)" : ""}`, theme.textStrong],
          ["User", account.user.username ?? account.user.email ?? String(account.user.id)],
          ["Workspace", `${account.workspace.name} (${account.workspace.id})`],
        ]),
      );
      const row = new BoxRenderable(renderer, { flexDirection: "row", height: 1 });
      row.add(new TextRenderable(renderer, { content: "Timer    ", fg: theme.textDim, selectable: false }));
      row.add(new TextRenderable(renderer, { content: "  " }));
      timerText = new TextRenderable(renderer, { content: "press r to load", fg: theme.text, wrapMode: "none" });
      row.add(timerText);
      clickup.add(row);
    } else {
      timerText = undefined;
      clickup.add(dim(renderer, theme, fileError ?? `No profile yet. Run "${manifest.bin} setup".`));
    }
    topRow.add(clickup);

    const vault = vaultStatus();
    const state = panel(renderer, theme, { title: "State", width: 46 });
    state.add(
      keyValueTable(renderer, theme, [
        ["accounts.json", exists(paths.accounts()) ? `${glyphs.ok} ${Object.keys(file?.accounts ?? {}).length} profile(s)` : `${glyphs.bullet} none`, exists(paths.accounts()) ? theme.ok : theme.textDim],
        ["credentials.json", vault.exists ? `${glyphs.ok} ${vault.count} credential(s)` : `${glyphs.bullet} empty`, vault.exists ? theme.ok : theme.textDim],
        ["master key", vault.masterKeySource === "none" ? "not created" : vault.masterKeySource, vault.masterKeySource === "env" ? theme.accentSecondary : theme.text],
        ["Binary", `${manifest.bin} v${manifest.version}`, theme.text],
      ]),
    );
    topRow.add(state);
    rootBox.add(topRow);

    const bottomRow = new BoxRenderable(renderer, { flexDirection: "row", flexGrow: 1 });
    const profiles = panel(renderer, theme, { title: "Profiles", flexGrow: 1 });
    const entries = Object.entries(file?.accounts ?? {});
    if (entries.length) {
      profiles.add(
        keyValueTable(
          renderer,
          theme,
          entries.map(([pid, a]) => [`${file?.activeAccount === pid ? "*" : " "} ${pid}`, `${a.workspace.name} (${a.workspace.id})`, file?.activeAccount === pid ? theme.textStrong : theme.text]),
        ),
      );
    } else {
      profiles.add(dim(renderer, theme, "none"));
    }
    bottomRow.add(profiles);

    const actions = panel(renderer, theme, { title: "Next steps", width: 46 });
    actions.add(heading(renderer, theme, "In the terminal"));
    actions.add(
      list(renderer, theme, account ? [`${manifest.bin} task list --list <id>`, `${manifest.bin} time current`, `${manifest.bin} --help`] : [`${manifest.bin} setup`, `${manifest.bin} account import`, `${manifest.bin} --help`], glyphs.arrow),
    );
    actions.add(spacer(renderer));
    actions.add(heading(renderer, theme, "For agents"));
    actions.add(dim(renderer, theme, `${manifest.bin} mcp setup`));
    bottomRow.add(actions);
    rootBox.add(bottomRow);

    return rootBox;
  },
  onEnter: () => {
    void refreshTimer();
  },
  onKey: (name) => {
    if (name !== "r") return false;
    void refreshTimer();
    return true;
  },
};
