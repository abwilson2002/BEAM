/** Base URL of the FastAPI backend. Set NEXT_PUBLIC_API_URL in Vercel for production. */
const API_BASE_URL = (
  process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:8000"
).replace(/\/$/, "");

async function request<T>(
  method: "GET" | "POST",
  path: string,
  body?: unknown,
): Promise<T> {
  const response = await fetch(`${API_BASE_URL}${path}`, {
    method,
    headers: body === undefined ? undefined : { "Content-Type": "application/json" },
    body: body === undefined ? undefined : JSON.stringify(body),
  });
  if (!response.ok) {
    throw new Error(await describeFailure(method, path, response));
  }
  return (await response.json()) as T;
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
  return request<T>("GET", path);
}

export function apiPost<T>(path: string, body: unknown): Promise<T> {
  return request<T>("POST", path, body);
}
