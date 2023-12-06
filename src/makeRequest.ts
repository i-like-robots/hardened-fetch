import createHttpError from 'http-errors'

export type MakeRequestProps = {
  url: string
  init?: RequestInit
  timeout?: number
}

export async function makeRequest({
  url,
  init = {},
  timeout = 9000,
}: MakeRequestProps): Promise<Response> {
  const signal = AbortSignal.timeout(timeout)
  const response = await fetch(url, { ...init, signal })

  if (response.ok) {
    return response
  }

  throw createHttpError(response.status, { response })
}
