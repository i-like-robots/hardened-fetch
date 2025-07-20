import { HTTPError } from './errors'

export async function makeRequest(
  url: string | URL,
  init: RequestInit = {},
  timeout = 30_000
): Promise<Response> {
  const signal = AbortSignal.timeout(timeout)
  const request = new Request(url, { ...init, signal })
  const response = await fetch(request)

  if (response.ok) {
    return response
  }

  throw new HTTPError(request, response)
}
