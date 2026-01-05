export async function apiFetch<T = unknown>(
  path: string,
  opts?: {
    method?: "GET" | "POST" | "PATCH" | "DELETE";
    body?: unknown;
    token?: string;
  }
): Promise<T> {
  const method = opts?.method ?? "GET";
  const headers: Record<string, string> = {
    "content-type": "application/json",
  };
  if (opts?.token) headers.authorization = `Bearer ${opts.token}`;

  const res = await fetch(path, {
    method,
    headers,
    body: opts?.body ? JSON.stringify(opts.body) : undefined,
    cache: "no-store",
  });

  if (!res.ok) {
    const text = await res.text().catch(() => "");
    throw new Error(`${method} ${path} failed: ${res.status} ${text}`);
  }

  return (await res.json()) as T;
}
