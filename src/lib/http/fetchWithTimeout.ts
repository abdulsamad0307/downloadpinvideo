export class FetchTimeoutError extends Error {
  constructor(message = "Request timed out") {
    super(message);
    this.name = "FetchTimeoutError";
  }
}

export const DEFAULT_FETCH_TIMEOUT_MS = 12_000;

export interface FetchWithTimeoutOptions extends RequestInit {
  timeoutMs?: number;
}

export async function fetchWithTimeout(
  url: string,
  options: FetchWithTimeoutOptions = {},
): Promise<Response> {
  const { timeoutMs = DEFAULT_FETCH_TIMEOUT_MS, signal, ...init } = options;
  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), timeoutMs);

  const abortFromParent = () => controller.abort();
  if (signal) {
    if (signal.aborted) {
      clearTimeout(timeoutId);
      controller.abort();
    } else {
      signal.addEventListener("abort", abortFromParent, { once: true });
    }
  }

  try {
    const response = await fetch(url, {
      ...init,
      signal: controller.signal,
      redirect: init.redirect ?? "follow",
    });
    return response;
  } catch (error) {
    if (error instanceof Error && error.name === "AbortError") {
      throw new FetchTimeoutError();
    }
    throw error;
  } finally {
    clearTimeout(timeoutId);
    if (signal) {
      signal.removeEventListener("abort", abortFromParent);
    }
  }
}
