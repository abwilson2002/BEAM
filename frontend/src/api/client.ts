/** Base URL of the FastAPI backend. Set NEXT_PUBLIC_API_URL in Vercel for production. */
const API_BASE_URL = (
  process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:8000"
).replace(/\/$/, "");

const DEFAULT_TIMEOUT_MS = 15_000;

async function request<T>(
  method: "GET" | "POST",
  path: string,
  body: unknown,
  timeoutMs: number,
): Promise<T> {
  let response: Response;
  try {
    response = await fetch(`${API_BASE_URL}${path}`, {
      method,
      headers: body === undefined ? undefined : { "Content-Type": "application/json" },
      body: body === undefined ? undefined : JSON.stringify(body),
      signal: AbortSignal.timeout(timeoutMs),
    });
  } catch (error) {
    throw new Error(describeNetworkFailure(path, timeoutMs, error), { cause: error });
  }
  if (!response.ok) {
    throw new Error(await describeFailure(method, path, response));
  }
  return (await response.json()) as T;
}

function describeNetworkFailure(path: string, timeoutMs: number, error: unknown): string {
  if (error instanceof DOMException && error.name === "TimeoutError") {
    return `${path} did not respond within ${timeoutMs / 1000}s. The backend is stuck or its database is slow.`;
  }
  return `Cannot reach the backend at ${API_BASE_URL}. Is it running?`;
}

/** Prefers FastAPI's `detail` message so the UI can show the real cause. */
async function describeFailure(
  method: string,
  path: string,
  response: Response,
): Promise<string> {
  try {
    const payload = await response.json();
    if (typeof payload?.detail === "string") return payload.detail;
  } catch {
    // Body wasn't JSON; fall through to the generic message.
  }
  return `${method} ${path} failed with status ${response.status}`;
}

export function apiGet<T>(path: string): Promise<T> {
  return request<T>("GET", path, undefined, DEFAULT_TIMEOUT_MS);
}

export function apiPost<T>(
  path: string,
  body: unknown,
  timeoutMs: number = DEFAULT_TIMEOUT_MS,
): Promise<T> {
  return request<T>("POST", path, body, timeoutMs);
}
