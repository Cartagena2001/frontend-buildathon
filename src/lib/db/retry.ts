/** Returns true for transient Neon/network errors worth retrying. */
export function isTransientDbError(err: unknown): boolean {
  const message = err instanceof Error ? err.message : String(err);
  const cause =
    err instanceof Error && err.cause instanceof Error
      ? err.cause.message
      : String((err as { cause?: unknown })?.cause ?? "");

  const combined = `${message} ${cause}`.toLowerCase();
  return (
    combined.includes("fetch failed") ||
    combined.includes("econnrefused") ||
    combined.includes("etimedout") ||
    combined.includes("enotfound") ||
    combined.includes("connect timeout") ||
    combined.includes("network")
  );
}

/** Retries a DB operation on transient network failures (Neon cold start, etc.). */
export async function withDbRetry<T>(
  fn: () => Promise<T>,
  retries = 3,
): Promise<T> {
  let lastError: unknown;

  for (let attempt = 0; attempt < retries; attempt++) {
    try {
      return await fn();
    } catch (err) {
      lastError = err;
      if (!isTransientDbError(err) || attempt === retries - 1) {
        throw err;
      }
      // Back off: 500ms, 1000ms
      await new Promise((r) => setTimeout(r, 500 * (attempt + 1)));
    }
  }

  throw lastError;
}
