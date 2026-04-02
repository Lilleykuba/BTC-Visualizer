export async function fetchJson<T>(
  url: string,
  init?: RequestInit,
  parser?: (value: unknown) => T
): Promise<T> {
  const response = await fetch(url, {
    headers: {
      accept: "application/json",
      ...(init?.headers ?? {})
    },
    ...init
  });

  if (!response.ok) {
    throw new Error(`Request failed with ${response.status} for ${url}`);
  }

  const payload = (await response.json()) as unknown;
  return parser ? parser(payload) : (payload as T);
}
