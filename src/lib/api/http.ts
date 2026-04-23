export async function fetchJson<T>(
  url: string,
  init?: RequestInit,
  parser?: (value: unknown) => T
): Promise<T> {
  const { headers, signal: requestSignal, ...requestInit } = init ?? {};
  const requestHeaders = new Headers(headers);
  const signal = requestSignal ?? AbortSignal.timeout(10_000);

  if (!requestHeaders.has("accept")) {
    requestHeaders.set("accept", "application/json");
  }

  const response = await fetch(url, {
    ...requestInit,
    headers: requestHeaders,
    signal
  });

  if (!response.ok) {
    throw new Error(`Request failed with ${response.status} for ${url}`);
  }

  const payload = (await response.json()) as unknown;
  return parser ? parser(payload) : (payload as T);
}
