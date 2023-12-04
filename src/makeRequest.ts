import { setTimeout } from 'node:timers/promises'
import createHttpError from 'http-errors'

export type MakeRequestProps = {
  url: string
  init?: RequestInit
  retries?: number
  timeout?: number
  rateLimiter: (response: Response) => number
}

export async function makeRequest({
  url,
  init = {},
  retries = 3,
  timeout = 9000,
  rateLimiter,
}: MakeRequestProps): Promise<Response> {
  const signal = AbortSignal.timeout(timeout)
  const response = await fetch(url, { ...init, signal })

  if (response.ok) {
    return response
  }

  if (retries) {
    const wait = rateLimiter(response)

    if (wait) {
      await setTimeout(wait)
    }

    return makeRequest({ url, init, retries: retries - 1, timeout, rateLimiter })
  }

  throw createHttpError(response.status)
}
