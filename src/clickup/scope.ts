/**
 * Project scope pinned by an MCP server.
 *
 * `clickupfy mcp serve --account a --workspace w --space s --list l` pins a
 * profile and part of the ClickUp hierarchy. Tools then default to the pinned
 * ids and refuse a different id passed by the agent, the same contract as
 * ClickUpfy 0.9.0. In the CLI the scope is empty and every id comes from the
 * command line.
 */
import { error } from "../app/errors.ts";

/** Pinned ids and flags of an MCP server. */
export interface Scope {
  accountId?: string;
  workspaceId?: string;
  spaceId?: string;
  folderId?: string;
  listId?: string;
  sprintFolderId?: string;
  readOnly?: boolean;
}

/**
 * Returns the pinned id or the received one. When both exist and differ,
 * raises USAGE: the server is pinned to another resource.
 */
export function pinnedOptional(pinned: string | undefined, received: string | undefined, resource: string): string | undefined {
  if (pinned && received && pinned !== received) {
    throw error.usage(`This MCP server is pinned to ${resource} ${pinned}.`, { resource, pinned, received });
  }
  return pinned ?? received;
}

/** Like `pinnedOptional`, but raises USAGE when no id is available. */
export function pinned(pinnedId: string | undefined, received: string | undefined, resource: string, option: string): string {
  const id = pinnedOptional(pinnedId, received, resource);
  if (!id) throw error.usage(`Provide the ${resource} id with ${option}.`, { resource });
  return id;
}
