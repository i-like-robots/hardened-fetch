import createHttpError from 'http-errors'

export async function makeRequest(
  url: string,
  init: RequestInit = {},
  timeout = 9000
): Promise<Response> {
  const signal = AbortSignal.timeout(timeout)
  const response = await fetch(url, { ...init, signal })

  if (response.ok) {
    return response
  }

  throw createHttpError(response.status, { response })
}
