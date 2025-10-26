import { HTTPError } from './errors'

export async function makeRequest(
  url: string | URL,
  init: RequestInit = {},
  timeout = 30_000
): Promise<Response> {
  const signals = [AbortSignal.timeout(timeout)]

  if ('signal' in init && init.signal instanceof AbortSignal) {
    signals.push(init.signal)
  }

  const request = new Request(url, { ...init, signal: AbortSignal.any(signals) })
  const response = await fetch(request)

  if (response.ok) {
    return response
  }

  throw new HTTPError(request, response)
}
