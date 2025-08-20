/*
Simple fetcher for GET requests (e.g., used with SWR)
Only supports JSON responses
*/
export const fetcher = (url: string) => fetch(url).then((res) => res.json());

/**
 * Use this to make API requests that send and receive JSON.
 * Automatically sets Content-Type to application/json.
 * Use for: POST, PUT, DELETE requests with JSON bodies
 */
export async function apiFetch<T>(
  url: string,
  options?: RequestInit,
): Promise<T> {
  console.log('apiFetch', url, options);
  const res = await fetch(url, {
    ...options,
    headers: {
      'Content-Type': 'application/json',
      ...(options?.headers || {}),
    },
  });
  console.log('apiFetch res', res);

  if (!res.ok) {
    const errorText = await res.text();
    throw new Error(
      `API error ${res.status} on ${url}: ${errorText || res.statusText}`,
    );
  }
  if (res.status === 204) return null as unknown as T;

  return res.json() as T;
}

/**
 * Use this to send FormData (e.g., file uploads) to an API.
 * Does NOT set Content-Type (let the browser handle it).
 * Uploads a FormData object and returns a JSON response.
 * Use for: POST requests with FormData body
 */
export async function apiFormFetch<T>(
  url: string,
  formData: FormData,
  headers?: Record<string, string>,
): Promise<T> {
  const res = await fetch(url, {
    method: 'POST',
    body: formData,
    headers,
  });

  if (!res.ok) {
    const errorText = await res.text();
    throw new Error(
      `API error ${res.status} on ${url}: ${errorText || res.statusText}`,
    );
  }
  if (res.status === 204) return null as unknown as T;

  return res.json() as T;
}
