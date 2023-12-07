import createHttpError from 'http-errors'

export async function makeRequest(
  url: string,
  init: RequestInit = {},
  timeout = 9000
): Promise<Response> {
  const signal = AbortSignal.timeout(timeout)
  const req = new Request(url, { ...init, signal })
  const res = await fetch(req)

  if (res.ok) {
    return res
  }

  throw createHttpError(res.status, { request: req, response: res })
}
