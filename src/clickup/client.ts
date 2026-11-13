/**
 * HTTP client for the ClickUp REST APIs v2 and v3.
 *
 * Every command, MCP tool and TUI screen that talks to ClickUp goes through
 * `ClickUpClient`. It sends the personal API key in the `Authorization`
 * header, retries HTTP 429 honoring `Retry-After` and turns failures into
 * `AppError` with the exit codes of `src/app/exit-codes.ts`:
 *
 * - 401 and 403 become CREDENTIALS (4);
 * - 404 becomes NOT_FOUND (6);
 * - network failures, timeouts and other statuses become NETWORK_OR_API (5).
 *
 * The base URLs can be redirected with `PROMOVAWEB_CLICKUPFY_API_URL` and
 * `PROMOVAWEB_CLICKUPFY_API_URL_V3`, the same variables used by ClickUpfy
 * 0.9.0, which the tests use to point at a fake server.
 */
import { AppError } from "../app/errors.ts";
import { ExitCode } from "../app/exit-codes.ts";

/** Default base URL of the v2 API. */
export const DEFAULT_API_URL = "https://api.clickup.com/api/v2";
/** Default base URL of the v3 API. */
export const DEFAULT_API_URL_V3 = "https://api.clickup.com/api/v3";

/** Scalar accepted as a query-string value. */
export type QueryValue = string | number | boolean | undefined;

/** Options of a single request. */
export interface RequestOptions {
  query?: Record<string, QueryValue | QueryValue[]>;
  body?: unknown;
  rawBody?: FormData | Blob | string;
  headers?: Record<string, string>;
  /** Set to `false` for endpoints that must not receive the API key. */
  authenticated?: boolean;
}

/** Constructor options, mostly for tests. */
export interface ClientOptions {
  baseUrl?: string;
  baseUrlV3?: string;
  fetchFn?: typeof fetch;
  timeoutMs?: number;
  /** Maximum number of retries after HTTP 429. */
  maxRetries?: number;
  /** Upper bound for a single wait after 429, in milliseconds. */
  maxRetryDelayMs?: number;
}

/** Authenticated ClickUp user returned by `GET /user`. */
export interface ClickUpUser {
  id: number | string;
  username?: string;
  email?: string;
  color?: string;
  profilePicture?: string;
}

/** Workspace (called "team" in the v2 API). */
export interface ClickUpWorkspace {
  id: string;
  name: string;
  color?: string;
}

/** Maps an HTTP status to the exit code family of the binary. */
export function exitCodeForStatus(status: number): ExitCode {
  if (status === 401 || status === 403) return ExitCode.CREDENTIALS;
  if (status === 404) return ExitCode.NOT_FOUND;
  return ExitCode.NETWORK_OR_API;
}

export class ClickUpClient {
  readonly #apiKey: string;
  readonly #baseUrl: string;
  readonly #baseUrlV3: string;
  readonly #fetch: typeof fetch;
  readonly #timeoutMs: number;
  readonly #maxRetries: number;
  readonly #maxRetryDelayMs: number;

  constructor(apiKey: string, options: ClientOptions = {}) {
    this.#apiKey = apiKey;
    this.#baseUrl = options.baseUrl ?? process.env.PROMOVAWEB_CLICKUPFY_API_URL ?? DEFAULT_API_URL;
    this.#baseUrlV3 = options.baseUrlV3 ?? process.env.PROMOVAWEB_CLICKUPFY_API_URL_V3 ?? DEFAULT_API_URL_V3;
    this.#fetch = options.fetchFn ?? fetch;
    this.#timeoutMs = options.timeoutMs ?? 30_000;
    this.#maxRetries = options.maxRetries ?? 3;
    this.#maxRetryDelayMs = options.maxRetryDelayMs ?? 60_000;
  }

  /** Sends a request to the v2 API and returns the parsed JSON body. */
  request<T>(method: string, path: string, options: RequestOptions = {}): Promise<T> {
    return this.#execute<T>(this.#baseUrl, method, path, options);
  }

  /** Sends a request to the v3 API (Docs and other v3-only endpoints). */
  requestV3<T>(method: string, path: string, options: RequestOptions = {}): Promise<T> {
    return this.#execute<T>(this.#baseUrlV3, method, path, options);
  }

  /** Returns the user that owns the API key. */
  async getUser(): Promise<ClickUpUser> {
    const data = await this.request<{ user: ClickUpUser }>("GET", "/user");
    return data.user;
  }

  /** Lists the workspaces the API key can reach. */
  async listWorkspaces(): Promise<ClickUpWorkspace[]> {
    const data = await this.request<{ teams?: ClickUpWorkspace[] }>("GET", "/team");
    return (data.teams ?? []).map((t) => ({ id: String(t.id), name: t.name, ...(t.color ? { color: t.color } : {}) }));
  }

  async #execute<T>(baseUrl: string, method: string, path: string, options: RequestOptions): Promise<T> {
    const url = new URL(`${baseUrl.replace(/\/$/, "")}/${path.replace(/^\//, "")}`);
    for (const [key, value] of Object.entries(options.query ?? {})) {
      for (const item of Array.isArray(value) ? value : [value]) {
        if (item !== undefined) url.searchParams.append(key, String(item));
      }
    }

    const init: RequestInit = {
      method,
      headers: {
        ...(options.authenticated === false ? {} : { Authorization: this.#apiKey }),
        ...(options.rawBody instanceof FormData ? {} : { "Content-Type": "application/json" }),
        ...options.headers,
      },
      ...(options.rawBody !== undefined
        ? { body: options.rawBody }
        : options.body === undefined
          ? {}
          : { body: JSON.stringify(options.body) }),
      redirect: "error",
    };

    for (let attempt = 0; ; attempt += 1) {
      let response: Response;
      try {
        response = await this.#fetch(url, { ...init, signal: AbortSignal.timeout(this.#timeoutMs) });
      } catch (e) {
        throw new AppError(
          ExitCode.NETWORK_OR_API,
          `Could not reach the ClickUp API: ${e instanceof Error ? e.message : String(e)}`,
          { url: url.origin + url.pathname },
        );
      }

      if (response.status === 429 && attempt < this.#maxRetries) {
        await Bun.sleep(this.#retryDelay(response, attempt));
        continue;
      }

      const text = await response.text();
      const data = text ? parseJson(text) : {};
      if (!response.ok) {
        const message = extractError(data) || `The ClickUp API answered HTTP ${response.status}.`;
        throw new AppError(exitCodeForStatus(response.status), message, {
          status: response.status,
          path: url.pathname,
        });
      }
      return data as T;
    }
  }

  #retryDelay(response: Response, attempt: number): number {
    const header = response.headers.get("retry-after");
    const seconds = header === null ? Number.NaN : Number(header);
    const ms = Number.isFinite(seconds) ? seconds * 1000 : 1000 * 2 ** attempt;
    return Math.min(Math.max(ms, 0), this.#maxRetryDelayMs);
  }
}

function parseJson(text: string): unknown {
  try {
    return JSON.parse(text);
  } catch {
    return { raw: text };
  }
}

/** Pulls a readable message out of the ClickUp error body (`err`, `error`, `message`). */
function extractError(data: unknown): string | undefined {
  if (!data || typeof data !== "object") return undefined;
  const record = data as Record<string, unknown>;
  for (const key of ["err", "error", "message"]) {
    const value = record[key];
    if (typeof value === "string" && value.trim()) return value;
  }
  return undefined;
}
