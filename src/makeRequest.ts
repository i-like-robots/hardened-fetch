import createHttpError from 'http-errors'

export async function makeRequest(
  url: string,
  init: RequestInit = {},
  timeout = 9000
): Promise<Response> {
  const signal = AbortSignal.timeout(timeout)
  const request = new Request(url, { ...init, signal })
  const response = await fetch(request)

  if (response.ok) {
    return response
  }

  throw createHttpError(response.status, { request, response })
}
