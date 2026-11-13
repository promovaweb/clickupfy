/** Spec 0011: the Overview tab shows the resolved ClickUp profile. */
import { afterAll, beforeAll, describe, expect, test } from "bun:test";
import { mkdtempSync, rmSync, writeFileSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { createTestRenderer, type TestRendererSetup } from "@opentui/core/testing";
import { HOME_VARIABLE } from "../src/config/paths.ts";
import { mountTui } from "../src/tui/index.ts";
import { elapsed } from "../src/tui/screens/overview.ts";

let dir: string;
let setup: TestRendererSetup;
let closed: Promise<void>;

beforeAll(async () => {
  dir = mkdtempSync(join(tmpdir(), "clickupfy-tui-"));
  process.env[HOME_VARIABLE] = dir;
  writeFileSync(
    join(dir, "accounts.json"),
    JSON.stringify({
      version: 1,
      activeAccount: "work",
      accounts: {
        work: {
          name: "Work",
          user: { id: 7, username: "Dev Person" },
          workspace: { id: "111", name: "Main" },
          createdAt: "2026-01-01T00:00:00.000Z",
          updatedAt: "2026-01-01T00:00:00.000Z",
        },
      },
    }),
  );
  setup = await createTestRenderer({ width: 120, height: 32 });
  closed = mountTui(setup.renderer, {});
  await setup.renderOnce();
});

afterAll(async () => {
  setup.renderer.destroy();
  await closed.catch(() => undefined);
  rmSync(dir, { recursive: true, force: true });
  delete process.env[HOME_VARIABLE];
});

describe("tui overview", () => {
  test("shows profile, user, workspace and the timer row without the key", async () => {
    await Bun.sleep(50);
    await setup.renderOnce();
    const frame = setup.captureCharFrame();
    expect(frame).toContain("work (active)");
    expect(frame).toContain("Dev Person");
    expect(frame).toContain("Main (111)");
    expect(frame).toContain("Timer");
    expect(frame).toContain("refresh timer");
    expect(frame).not.toContain("pk_");
  });

  test("elapsed formats hours and minutes", () => {
    expect(elapsed(0, 65 * 60_000)).toBe("1h 05m");
    expect(elapsed(undefined)).toBe("-");
  });
});
