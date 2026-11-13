/**
 * Generates npm/README.md from README.md.
 *
 * The npm page shows the README of the published `npm/` folder. It is the
 * repository README with relative links turned into absolute GitHub URLs,
 * which npmjs.com cannot resolve. Developer instructions live in
 * CONTRIBUTING.md, not in the README.
 *
 * Usage: `bun run npm:readme` writes the file; `--check` exits with 1 when
 * npm/README.md is out of date (used by tests/npm-wrapper.test.ts).
 */
import { readFileSync, writeFileSync } from "node:fs";

const REPO = "https://github.com/promovaweb/clickupfy/blob/main/";

/** Builds the npm README text from the repository README text. */
export function buildNpmReadme(source: string): string {
  return source.replace(/\]\((?!https?:|#)([^)]+)\)/g, (_m, path: string) => `](${REPO}${path})`);
}

if (import.meta.main) {
  const expected = buildNpmReadme(readFileSync("README.md", "utf8"));
  if (process.argv.includes("--check")) {
    const current = (() => {
      try {
        return readFileSync("npm/README.md", "utf8");
      } catch {
        return "";
      }
    })();
    if (current !== expected) {
      console.error("✗ npm/README.md is out of date. Run: bun run npm:readme");
      process.exit(1);
    }
    console.log("✓ npm/README.md matches README.md");
  } else {
    writeFileSync("npm/README.md", expected);
    console.log("✓ npm/README.md");
  }
}
