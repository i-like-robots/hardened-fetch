import createHttpError from 'http-errors'

export async function makeRequest(
  url: string,
  init: RequestInit = {},
  timeout = 9000
): Promise<Response> {
  const signal = AbortSignal.timeout(timeout)
  const res = await fetch(url, { ...init, signal })

  if (res.ok) {
    return res
  }

  throw createHttpError(res.status, { response: res })
}
