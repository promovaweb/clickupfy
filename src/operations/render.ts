/**
 * Generic text rendering of operation results for the CLI.
 *
 * Arrays of objects become a column table with the scalar fields of the
 * first rows; plain objects become a key/value table, with nested values as
 * compact JSON; scalars print as they are. Operations with a better human
 * view pass their own `text` function instead.
 */
import { color, grid, table } from "../cli/format.ts";

const MAX_COLUMNS = 6;
const MAX_CELL = 60;

function cell(value: unknown): string {
  if (value === null || value === undefined) return "-";
  if (typeof value === "object") {
    const record = value as Record<string, unknown>;
    if (typeof record.status === "string") return record.status;
    if (typeof record.name === "string") return record.name;
    if (typeof record.username === "string") return record.username;
    return truncate(JSON.stringify(value));
  }
  return truncate(String(value));
}

function truncate(text: string): string {
  const single = text.replace(/\s+/g, " ");
  return single.length > MAX_CELL ? `${single.slice(0, MAX_CELL - 1)}…` : single;
}

/** Renders a list of records as a table, choosing up to six columns. */
export function renderRows(rows: ReadonlyArray<Record<string, unknown>>, preferred?: readonly string[]): string {
  if (rows.length === 0) return color.dim("nothing found");
  const keys =
    preferred ??
    Object.keys(rows[0] ?? {})
      .filter((k) => rows.some((r) => r[k] !== undefined && (typeof r[k] !== "object" || r[k] === null || "name" in (r[k] as object) || "status" in (r[k] as object))))
      .slice(0, MAX_COLUMNS);
  return grid(
    keys.map((k) => k.toUpperCase()),
    rows.map((r) => keys.map((k) => cell(r[k]))),
  );
}

/** Default renderer used when an operation has no `text` function. */
export function renderDefault(data: unknown): string {
  if (data === null || data === undefined) return color.dim("nothing to show");
  if (Array.isArray(data)) {
    if (data.every((d) => d && typeof d === "object" && !Array.isArray(d))) return renderRows(data as Array<Record<string, unknown>>);
    return data.map((d) => cell(d)).join("\n");
  }
  if (typeof data === "object") {
    const record = data as Record<string, unknown>;
    const lists = Object.entries(record).filter(([, v]) => Array.isArray(v) && v.length > 0 && typeof v[0] === "object");
    if (lists.length === 1 && Object.keys(record).length <= 3) {
      const [, rows] = lists[0] as [string, Array<Record<string, unknown>>];
      return renderRows(rows);
    }
    return table(Object.entries(record).map(([k, v]) => [k, cell(v)]));
  }
  return String(data);
}
