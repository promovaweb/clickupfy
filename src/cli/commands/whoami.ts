/**
 * `whoami` command: validates the profile's API key with `GET /user` and
 * shows the authenticated ClickUp user.
 */
import { manifest } from "../../app/manifest.ts";
import { ExitCode } from "../../app/exit-codes.ts";
import { connect } from "../../clickup/accounts.ts";
import { table } from "../format.ts";
import type { Command } from "../registry.ts";

export const whoamiCommand: Command = {
  name: "whoami",
  description: "Validate the API key and show the authenticated user.",
  exitCodes: [ExitCode.CONFIG, ExitCode.CREDENTIALS, ExitCode.NETWORK_OR_API, ExitCode.NOT_FOUND],
  examples: [`${manifest.bin} whoami`, `${manifest.bin} whoami --json`],
  run: async (ctx) => {
    const { id, client } = await connect(ctx.options.account as string | undefined);
    const user = await client.getUser();
    return {
      data: { account: id, user },
      text: () =>
        table([
          ["account", id],
          ["id", String(user.id)],
          ["username", user.username ?? "-"],
          ["email", user.email ?? "-"],
        ]),
    };
  },
};
