const defaultBaseUrl =
  process.env.NEXT_PUBLIC_API_BASE || "http://localhost:8000";

type RequestOptions = {
  method?: "GET" | "POST";
  body?: unknown;
  token?: string | null;
};

export async function request<T>(
  path: string,
  { method = "GET", body, token }: RequestOptions = {},
  baseUrl: string = defaultBaseUrl,
): Promise<T> {
  const headers: Record<string, string> = {
    "Content-Type": "application/json",
  };
  if (token) {
    headers.Authorization = `Bearer ${token}`;
  }

  const res = await fetch(`${baseUrl}${path}`, {
    method,
    headers,
    body: body ? JSON.stringify(body) : undefined,
  });

  if (!res.ok) {
    const err = await res.text().catch(() => res.statusText);
    throw new Error(err || "Request failed");
  }

  return res.json();
}
