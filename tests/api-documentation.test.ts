/** Exige referência e exemplos para cada comando e ferramenta derivados da API. */
import { readFile } from "node:fs/promises";
import { expect, it } from "vitest";
import { operations } from "../src/api/catalog.js";
it("documenta cada endpoint nos dois canais com cinco exemplos", async () => {
  const reference = await readFile(
    new URL("../docs/api/REFERENCE.md", import.meta.url),
    "utf8",
  );
  for (const operation of operations)
    for (const name of [`clickupfy api ${operation.cli}`, operation.tool]) {
      const heading = `### \`${name}\``;
      const section = reference.split(heading + "\n")[1]?.split("\n### ")[0];
      expect(section, name).toBeDefined();
      expect(section).toContain(
        `${operation.method} /api/${operation.version}${operation.path}`,
      );
      expect(
        (section?.match(/^```(?:bash|json)$/gm) ?? []).length,
        name,
      ).toBeGreaterThanOrEqual(5);
    }
});
