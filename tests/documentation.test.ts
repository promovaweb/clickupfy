/**
 * Regressão da documentação do usuário e dos artefatos portáteis.
 */

import { createHash } from "node:crypto";
import { readdir, readFile } from "node:fs/promises";
import { join, relative, resolve } from "node:path";
import { describe, expect, it } from "vitest";

const root = resolve(import.meta.dirname, "..");
const docsRoot = join(root, "docs", "user");
const ebookRoot = join(root, "ebook");

/** Calcula o SHA-256 no mesmo formato registrado pelo build do ebook. */
async function sha256(path: string): Promise<string> {
  return createHash("sha256").update(await readFile(path)).digest("hex");
}

/** Lista recursivamente os arquivos Markdown abaixo de um diretório. */
async function markdownFiles(directory: string): Promise<string[]> {
  const entries = await readdir(directory, { withFileTypes: true });
  const nested = await Promise.all(
    entries.map(async (entry) => {
      const path = join(directory, entry.name);
      if (entry.isDirectory()) return markdownFiles(path);
      return entry.isFile() && entry.name.endsWith(".md") ? [path] : [];
    }),
  );
  return nested.flat().sort();
}

describe("documentação do usuário", () => {
  it("ordena cada capítulo exatamente uma vez", async () => {
    const order = (await readFile(join(docsRoot, "reading-order.txt"), "utf8"))
      .split(/\r?\n/)
      .filter(Boolean);
    const pages = (await markdownFiles(docsRoot)).map((path) =>
      relative(root, path).replaceAll("\\", "/"),
    );

    expect(order).toEqual([...new Set(order)]);
    expect(new Set(order)).toEqual(new Set(pages));
    expect(order[0]).toBe("docs/user/README.md");
    expect(order.at(-1)).toBe("docs/user/solucao-de-problemas.md");
  });

  it("mantém classificação documental em cada capítulo", async () => {
    for (const path of await markdownFiles(docsRoot)) {
      const source = await readFile(path, "utf8");
      expect(source, relative(root, path)).toContain("## Classificação");
      expect(source, relative(root, path)).toContain("| Natureza |");
      expect(source, relative(root, path)).toContain("| Autoridade |");
    }
  });

  it("preserva o design compartilhado e o idioma pt-BR", async () => {
    const metadata = await readFile(
      join(root, ".ebook", "metadata.yaml"),
      "utf8",
    );
    const template = await readFile(
      join(root, ".ebook", "template.html"),
      "utf8",
    );
    const pdfCss = await readFile(join(root, ".ebook", "pdf.css"), "utf8");
    const fontStyles = await readFile(
      join(root, "brand", "fonts", "fonts.css"),
      "utf8",
    );

    expect(metadata).toContain('lang: "pt-BR"');
    expect(template).toContain('<html lang="pt-BR">');
    expect(template).toContain("$fontfaces$");
    expect(fontStyles).toContain('font-family: "Inter"');
    expect(fontStyles).toContain('font-family: "Manrope"');
    expect(pdfCss).toContain("pdf-design-system: 1.0.0");
    expect(pdfCss).toContain("--sans: 'Inter'");
    expect(pdfCss).toContain("--title: 'Manrope'");
    expect(pdfCss).toContain("--brand-black: #000000");
    expect(pdfCss).toContain("--brand-white: #FFFFFF");
  });

  it("mantém PDF e EPUB alinhados ao manifesto vigente", async () => {
    const version = (await readFile(join(ebookRoot, "VERSION"), "utf8")).trim();
    const manifest = JSON.parse(
      await readFile(join(ebookRoot, "build.json"), "utf8"),
    ) as {
      version: string;
      artifacts: Record<string, { file: string; sha256: string }>;
    };

    expect(manifest.version).toBe(version);
    expect(Object.keys(manifest.artifacts).sort()).toEqual(["epub", "pdf"]);
    for (const artifact of Object.values(manifest.artifacts)) {
      expect(await sha256(join(ebookRoot, artifact.file))).toBe(
        artifact.sha256,
      );
    }
  });
});
