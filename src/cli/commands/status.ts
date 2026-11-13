/**
 * `status` command: shows the resolved ClickUp profile and its configuration.
 *
 * Resolution follows `--account`, `PROMOVAWEB_CLICKUPFY_ACCOUNT` and the
 * active profile. The API key is shown masked; no request reaches ClickUp.
 */
import { manifest } from "../../app/manifest.ts";
import { ExitCode } from "../../app/exit-codes.ts";
import { paths } from "../../config/paths.ts";
import { apiKeyFor, maskApiKey, resolveAccount } from "../../clickup/accounts.ts";
import { table } from "../format.ts";
import type { Command } from "../registry.ts";

export const statusCommand: Command = {
  name: "status",
  description: "Show the resolved profile and its configuration.",
  exitCodes: [ExitCode.CONFIG, ExitCode.CREDENTIALS, ExitCode.NOT_FOUND],
  examples: [`${manifest.bin} status`, `${manifest.bin} status --account work --json`],
  run: async (ctx) => {
    const { id, account, active } = await resolveAccount(ctx.options.account as string | undefined);
    const data = {
      config: paths.accounts(),
      account: id,
      active,
      name: account.name,
      apiKey: maskApiKey(apiKeyFor(id)),
      user: account.user,
      workspace: account.workspace,
    };
    return {
      data,
      text: () =>
        table([
          ["config", data.config],
          ["account", `${id}${active ? " (active)" : ""}`],
          ["name", account.name],
          ["api key", data.apiKey],
          ["user", account.user.username ?? account.user.email ?? String(account.user.id)],
          ["workspace", `${account.workspace.name} (${account.workspace.id})`],
        ]),
    };
  },
};
