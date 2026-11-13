/**
 * ClickUp Docs and their pages (spec 0008).
 *
 * Docs live in the v3 API under the workspace bound to the profile
 * (`/workspaces/{id}/docs`). The operations below list, read and create
 * Docs and list, read, create and update their pages, with page content in
 * Markdown (`text/md`, the API default) or plain text. In the CLI the page
 * content can come from `--content`, from a file with `--file <path>` or
 * from stdin with `--file -`. Same calls as ClickUpfy 0.9.0.
 */
import { readFile } from "node:fs/promises";
import { classifyFsError, error } from "../app/errors.ts";
import { ExitCode } from "../app/exit-codes.ts";
import { manifest } from "../app/manifest.ts";
import { readStdin } from "../cli/input.ts";
import { renderRows } from "../operations/render.ts";
import type { Operation, OperationContext, Param } from "../operations/types.ts";
import type { ClickUpClient } from "./client.ts";

/** ClickUp Doc metadata (v3). */
export interface ClickUpDoc {
  id: string;
  name?: string;
  date_created?: string | number;
  date_updated?: string | number;
  creator?: number | string;
  workspace_id?: number | string;
  public?: boolean;
  parent?: { id?: string; type?: number };
  [key: string]: unknown;
}

/** Node of the page tree of a Doc, without content. */
export interface DocPageListingItem {
  id: string;
  doc_id?: string;
  name?: string;
  orderindex?: number | string;
  pages?: DocPageListingItem[];
  [key: string]: unknown;
}

/** Doc page with content. */
export interface DocPage {
  id: string;
  doc_id?: string;
  parent_page_id?: string | null;
  name?: string;
  sub_title?: string;
  content?: string;
  orderindex?: number | string;
  pages?: DocPage[];
  [key: string]: unknown;
}

/** Filters of `listDocs`. */
export interface DocFilters {
  query?: string;
  parentId?: string;
  parentType?: number;
  deleted?: boolean;
  archived?: boolean;
  creator?: number;
  maxPages?: number;
}

function clean<T extends Record<string, unknown>>(obj: T): Partial<T> {
  return Object.fromEntries(Object.entries(obj).filter(([, v]) => v !== undefined)) as Partial<T>;
}

/**
 * Lists the Docs of a workspace following the cursor up to `maxPages`
 * (1 to 50, default 50). `query` filters by id or name locally.
 */
export async function listDocs(client: ClickUpClient, workspaceId: string, filters: DocFilters = {}): Promise<ClickUpDoc[]> {
  const docs: ClickUpDoc[] = [];
  const maxPages = Math.min(Math.max(filters.maxPages ?? 50, 1), 50);
  let cursor: string | undefined;
  for (let page = 0; page < maxPages; page += 1) {
    const data = await client.requestV3<{ docs?: ClickUpDoc[]; next_cursor?: string | null }>("GET", `/workspaces/${workspaceId}/docs`, {
      query: {
        cursor,
        deleted: filters.deleted,
        archived: filters.archived,
        parent_id: filters.parentId,
        parent_type: filters.parentType,
        creator: filters.creator,
      },
    });
    docs.push(...(data.docs ?? []));
    if (!data.next_cursor) break;
    cursor = data.next_cursor;
  }
  const query = filters.query?.trim().toLowerCase();
  if (!query) return docs;
  return docs.filter((d) => [d.id, d.name].some((v) => v?.toString().toLowerCase().includes(query)));
}

/** Gets the metadata of a Doc. */
export function getDoc(client: ClickUpClient, workspaceId: string, docId: string): Promise<ClickUpDoc> {
  return client.requestV3<ClickUpDoc>("GET", `/workspaces/${workspaceId}/docs/${docId}`);
}

/** Creates a Doc, optionally under a Space, Folder, List or task. */
export function createDoc(
  client: ClickUpClient,
  workspaceId: string,
  data: { name: string; parent?: { id: string; type: number }; visibility?: string; createPage?: boolean },
): Promise<ClickUpDoc> {
  return client.requestV3<ClickUpDoc>("POST", `/workspaces/${workspaceId}/docs`, {
    body: clean({ name: data.name, parent: data.parent, visibility: data.visibility, create_page: data.createPage }),
  });
}

/** Returns the page tree of a Doc, without content. */
export async function getPageTree(client: ClickUpClient, workspaceId: string, docId: string): Promise<DocPageListingItem[]> {
  return (await client.requestV3<DocPageListingItem[] | null>("GET", `/workspaces/${workspaceId}/docs/${docId}/pageListing`)) ?? [];
}

/** Returns the pages of a Doc with content. */
export async function listPages(
  client: ClickUpClient,
  workspaceId: string,
  docId: string,
  options: { maxPageDepth?: number; contentFormat?: string } = {},
): Promise<DocPage[]> {
  return (
    (await client.requestV3<DocPage[] | null>("GET", `/workspaces/${workspaceId}/docs/${docId}/pages`, {
      query: { max_page_depth: options.maxPageDepth, content_format: options.contentFormat },
    })) ?? []
  );
}

/** Returns one page of a Doc with content. */
export function getPage(client: ClickUpClient, workspaceId: string, docId: string, pageId: string, contentFormat?: string): Promise<DocPage> {
  return client.requestV3<DocPage>("GET", `/workspaces/${workspaceId}/docs/${docId}/pages/${pageId}`, {
    query: { content_format: contentFormat },
  });
}

/** Creates a page, or a sub-page when `parentPageId` is set. */
export function createPage(
  client: ClickUpClient,
  workspaceId: string,
  docId: string,
  data: { name: string; content?: string; subTitle?: string; parentPageId?: string; orderindex?: number; contentFormat?: string },
): Promise<DocPage> {
  return client.requestV3<DocPage>("POST", `/workspaces/${workspaceId}/docs/${docId}/pages`, {
    body: clean({
      name: data.name,
      content: data.content,
      sub_title: data.subTitle,
      parent_page_id: data.parentPageId,
      orderindex: data.orderindex,
      content_format: data.contentFormat,
    }),
  });
}

/**
 * Updates the title, subtitle and/or content of a page. `contentEditMode`
 * replaces (default), appends or prepends the content. Raises USAGE when
 * nothing is given.
 */
export function updatePage(
  client: ClickUpClient,
  workspaceId: string,
  docId: string,
  pageId: string,
  data: { name?: string; subTitle?: string; content?: string; contentEditMode?: string; contentFormat?: string },
): Promise<DocPage> {
  const body = clean({
    name: data.name,
    sub_title: data.subTitle,
    content: data.content,
    content_edit_mode: data.contentEditMode,
    content_format: data.contentFormat,
  });
  if (body.name === undefined && body.sub_title === undefined && body.content === undefined) {
    throw error.usage("Provide at least one field to update: name, subTitle or content (--name, --sub-title, --content or --file).");
  }
  return client.requestV3<DocPage>("PUT", `/workspaces/${workspaceId}/docs/${docId}/pages/${pageId}`, { body });
}

/**
 * Resolves the page content from `content` or, in the CLI, from `file`
 * (`-` reads stdin). Both together raise USAGE.
 */
export async function resolveContent(input: Record<string, unknown>): Promise<string | undefined> {
  const content = input.content as string | undefined;
  const file = input.file as string | undefined;
  if (file === undefined) return content;
  if (content !== undefined) throw error.usage("Use --content or --file, not both.");
  if (file === "-") return readStdin();
  try {
    return (await readFile(file, "utf8")).replace(/^﻿/, "");
  } catch (e) {
    throw classifyFsError(e, ExitCode.GENERIC_ERROR, `Reading ${file}`);
  }
}

const bin = manifest.bin;

function workspaceOf(ctx: OperationContext): string {
  return ctx.account.account.workspace.id;
}

const PARENT_TYPE = "Location type: 4 Space, 5 Folder, 6 List, 7 Everything, 12 Task.";
const docIdParam: Param = { key: "docId", type: "string", positional: true, required: true, description: "Doc id." };
const pageIdParam: Param = { key: "pageId", type: "string", positional: true, required: true, description: "Page id." };
const formatParam: Param = { key: "contentFormat", type: "string", description: "Content format: text/md (default) or text/plain." };
const fileParam: Param = {
  key: "file",
  type: "string",
  only: "cli",
  description: "Read the page content from a file; use - for stdin. Replaces --content.",
};
const DOC_COLUMNS = ["id", "name", "parent", "public", "date_updated"];
const PAGE_COLUMNS = ["id", "name", "parent_page_id", "orderindex"];

function renderTree(nodes: DocPageListingItem[], depth = 0): string[] {
  return nodes.flatMap((n) => [`${"  ".repeat(depth)}${n.name ?? "(untitled)"} (${n.id})`, ...renderTree(n.pages ?? [], depth + 1)]);
}

export const docOperations: Operation[] = [
  {
    path: ["doc", "list"],
    aliases: ["ls"],
    tool: "clickupfy_docs_list",
    title: "Search Docs",
    description: "Search the Docs of the workspace bound to the profile.",
    params: [
      { key: "query", type: "string", description: "Text in the Doc name or id." },
      { key: "parentId", type: "string", description: "Only Docs created under this location." },
      { key: "parentType", type: "integer", description: PARENT_TYPE },
      { key: "deleted", type: "boolean", description: "Include deleted Docs." },
      { key: "archived", type: "boolean", description: "Include archived Docs." },
      { key: "creator", type: "integer", description: "Numeric id of the creator." },
      { key: "maxPages", type: "integer", description: "Maximum cursor pages read, 1 to 50 (default 50)." },
    ],
    effect: "read",
    examples: [`${bin} doc list`, `${bin} doc ls --query roadmap --json`],
    text: (data) => renderRows((data as { docs: ClickUpDoc[] }).docs, DOC_COLUMNS),
    run: async (input, ctx) => ({
      docs: await listDocs(ctx.client, workspaceOf(ctx), {
        query: input.query as string | undefined,
        parentId: input.parentId as string | undefined,
        parentType: input.parentType as number | undefined,
        deleted: input.deleted as boolean | undefined,
        archived: input.archived as boolean | undefined,
        creator: input.creator as number | undefined,
        maxPages: input.maxPages as number | undefined,
      }),
    }),
  },
  {
    path: ["doc", "get"],
    tool: "clickupfy_doc_get",
    title: "Get Doc",
    description: "Get the metadata of a Doc.",
    params: [docIdParam],
    effect: "read",
    examples: [`${bin} doc get 8cdu8-123`],
    run: async (input, ctx) => getDoc(ctx.client, workspaceOf(ctx), input.docId as string),
  },
  {
    path: ["doc", "create"],
    tool: "clickupfy_doc_create",
    title: "Create Doc",
    description: "Create a Doc in the bound workspace, optionally under a Space, Folder, List or task.",
    params: [
      { key: "name", type: "string", required: true, description: "Doc name." },
      { key: "parentId", type: "string", description: "Id of the location where the Doc is created. Requires parentType." },
      { key: "parentType", type: "integer", description: PARENT_TYPE },
      { key: "visibility", type: "string", description: "Doc visibility: PRIVATE or PUBLIC." },
      { key: "createPage", type: "boolean", description: "Also create the first blank page." },
    ],
    effect: "write",
    exitCodes: [ExitCode.USAGE],
    examples: [`${bin} doc create --name "Project notes"`, `${bin} doc create --name Specs --parent-id 90070363783 --parent-type 4 --create-page`],
    run: async (input, ctx) => {
      const parentId = input.parentId as string | undefined;
      const parentType = input.parentType as number | undefined;
      if (parentId && parentType === undefined) throw error.usage("Provide --parent-type (parentType) with --parent-id (parentId).");
      return createDoc(ctx.client, workspaceOf(ctx), {
        name: input.name as string,
        ...(parentId ? { parent: { id: parentId, type: parentType as number } } : {}),
        ...(input.visibility ? { visibility: input.visibility as string } : {}),
        ...(input.createPage !== undefined ? { createPage: input.createPage as boolean } : {}),
      });
    },
  },
  {
    path: ["doc", "page", "list"],
    aliases: ["ls"],
    tool: "clickupfy_doc_pages_list",
    title: "List Doc pages",
    description: "List the pages of a Doc with their content.",
    params: [docIdParam, { key: "maxPageDepth", type: "integer", description: "Maximum depth of sub-pages." }, formatParam],
    effect: "read",
    examples: [`${bin} doc page list 8cdu8-123 --json`],
    text: (data) => renderRows((data as { pages: DocPage[] }).pages, PAGE_COLUMNS),
    run: async (input, ctx) => ({
      pages: await listPages(ctx.client, workspaceOf(ctx), input.docId as string, {
        maxPageDepth: input.maxPageDepth as number | undefined,
        contentFormat: input.contentFormat as string | undefined,
      }),
    }),
  },
  {
    path: ["doc", "page", "get"],
    tool: "clickupfy_doc_page_get",
    title: "Get Doc page",
    description: "Get one page of a Doc with its content.",
    longDescription: "In text mode the CLI prints only the page content.",
    params: [docIdParam, pageIdParam, formatParam],
    effect: "read",
    examples: [`${bin} doc page get 8cdu8-123 8cdu8-456`, `${bin} doc page get 8cdu8-123 8cdu8-456 --json`],
    text: (data) => (data as DocPage).content ?? "",
    run: async (input, ctx) =>
      getPage(ctx.client, workspaceOf(ctx), input.docId as string, input.pageId as string, input.contentFormat as string | undefined),
  },
  {
    path: ["doc", "page", "tree"],
    tool: "clickupfy_doc_page_tree",
    title: "Get Doc page tree",
    description: "Show the page tree of a Doc, without content.",
    params: [docIdParam],
    effect: "read",
    examples: [`${bin} doc page tree 8cdu8-123`],
    text: (data) => {
      const lines = renderTree((data as { pages: DocPageListingItem[] }).pages);
      return lines.length ? lines.join("\n") : "nothing found";
    },
    run: async (input, ctx) => ({ pages: await getPageTree(ctx.client, workspaceOf(ctx), input.docId as string) }),
  },
  {
    path: ["doc", "page", "create"],
    tool: "clickupfy_doc_page_create",
    title: "Create Doc page",
    description: "Create a page, or a sub-page, in an existing Doc.",
    params: [
      docIdParam,
      { key: "name", type: "string", required: true, description: "Page title." },
      { key: "content", type: "string", description: "Initial content." },
      fileParam,
      { key: "subTitle", type: "string", description: "Page subtitle." },
      { key: "parentPageId", option: "parent-page", type: "string", description: "Create as a sub-page of this page id." },
      { key: "orderindex", type: "number", description: "Position among the sibling pages." },
      formatParam,
    ],
    effect: "write",
    exitCodes: [ExitCode.USAGE],
    examples: [
      `${bin} doc page create 8cdu8-123 --name Overview --content "# Overview"`,
      `${bin} doc page create 8cdu8-123 --name Plan --file plan.md`,
      `cat notes.md | ${bin} doc page create 8cdu8-123 --name Notes --file -`,
    ],
    run: async (input, ctx) =>
      createPage(ctx.client, workspaceOf(ctx), input.docId as string, {
        name: input.name as string,
        content: await resolveContent(input),
        subTitle: input.subTitle as string | undefined,
        parentPageId: input.parentPageId as string | undefined,
        orderindex: input.orderindex as number | undefined,
        contentFormat: input.contentFormat as string | undefined,
      }),
  },
  {
    path: ["doc", "page", "update"],
    tool: "clickupfy_doc_page_update",
    title: "Update Doc page",
    description: "Update the title, subtitle and/or content of an existing page.",
    params: [
      docIdParam,
      pageIdParam,
      { key: "name", type: "string", description: "New title." },
      { key: "subTitle", type: "string", description: "New subtitle." },
      { key: "content", type: "string", description: "New content." },
      fileParam,
      { key: "contentEditMode", type: "string", values: ["replace", "append", "prepend"], description: "replace (default), append or prepend." },
      formatParam,
    ],
    effect: "write",
    exitCodes: [ExitCode.USAGE],
    examples: [
      `${bin} doc page update 8cdu8-123 8cdu8-456 --name "New title"`,
      `cat log.md | ${bin} doc page update 8cdu8-123 8cdu8-456 --file - --content-edit-mode append`,
    ],
    run: async (input, ctx) =>
      updatePage(ctx.client, workspaceOf(ctx), input.docId as string, input.pageId as string, {
        name: input.name as string | undefined,
        subTitle: input.subTitle as string | undefined,
        content: await resolveContent(input),
        contentEditMode: input.contentEditMode as string | undefined,
        contentFormat: input.contentFormat as string | undefined,
      }),
  },
];
