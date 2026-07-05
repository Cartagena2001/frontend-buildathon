import { getFindyToken } from "./token";

/**
 * Base URL for findy-core API calls from server actions.
 * Calls findy-core directly — the Next.js rewrite proxy is unreliable for
 * server-side fetch when the frontend runs on a different port (e.g. :3001).
 */
export function getFindyApiBaseUrl(): string {
  if (process.env.FINDY_CORE_API_URL?.startsWith("http")) {
    return process.env.FINDY_CORE_API_URL.replace(/\/$/, "");
  }

  if (process.env.FINDY_CORE_INTERNAL_URL?.startsWith("http")) {
    return process.env.FINDY_CORE_INTERNAL_URL.replace(/\/$/, "");
  }

  return "http://localhost:3000";
}

export class FindyApiError extends Error {
  constructor(
    message: string,
    public status: number,
    public url?: string,
  ) {
    super(message);
    this.name = "FindyApiError";
  }
}

interface RequestOptions extends Omit<RequestInit, "body"> {
  body?: unknown;
  token?: string | null;
}

export async function findyFetch<T>(
  path: string,
  options: RequestOptions = {},
): Promise<T> {
  const { body, token: explicitToken, headers: extraHeaders, ...init } = options;
  const token = explicitToken !== undefined ? explicitToken : await getFindyToken();
  const url = `${getFindyApiBaseUrl()}${path}`;

  const headers: Record<string, string> = {
    ...(extraHeaders as Record<string, string>),
  };

  if (body !== undefined) {
    headers["Content-Type"] = "application/json";
  }

  if (token) {
    headers.Authorization = `Bearer ${token}`;
  }

  let res: Response;
  try {
    res = await fetch(url, {
      ...init,
      headers,
      body: body !== undefined ? JSON.stringify(body) : undefined,
      cache: "no-store",
    });
  } catch (err) {
    const hint =
      err instanceof Error ? err.message : "network error";
    throw new FindyApiError(
      `Cannot reach findy-core at ${url} (${hint}). Is findy-core running? Set FINDY_CORE_INTERNAL_URL.`,
      0,
      url,
    );
  }

  if (res.status === 204) {
    return undefined as T;
  }

  const data = await res.json().catch(() => ({}));

  if (!res.ok) {
    const apiMsg = (data as { error?: string }).error;
    const message =
      apiMsg ??
      (res.status === 404
        ? `findy-core route not found — check FINDY_CORE_INTERNAL_URL (tried ${url})`
        : `Request failed (${res.status})`);
    throw new FindyApiError(message, res.status, url);
  }

  return data as T;
}

/** Public fetch — no auth header. */
export async function findyFetchPublic<T>(
  path: string,
  init?: RequestInit,
): Promise<T> {
  const url = `${getFindyApiBaseUrl()}${path}`;

  let res: Response;
  try {
    res = await fetch(url, { ...init, cache: "no-store" });
  } catch (err) {
    const hint = err instanceof Error ? err.message : "network error";
    throw new FindyApiError(
      `Cannot reach findy-core at ${url} (${hint})`,
      0,
      url,
    );
  }

  const data = await res.json().catch(() => ({}));

  if (!res.ok) {
    throw new FindyApiError(
      (data as { error?: string }).error ?? `Request failed (${res.status})`,
      res.status,
      url,
    );
  }

  return data as T;
}
