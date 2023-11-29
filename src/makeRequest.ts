import { setTimeout } from 'node:timers/promises'
import createHttpError from 'http-errors'
import { getRateLimitWait, isRateLimited } from './utils'

export type MakeRequestProps = {
  url: string
  init?: RequestInit
  retries?: number
  timeout?: number
}

export async function makeRequest({
  url,
  init = {},
  retries = 3,
  timeout = 9000,
}: MakeRequestProps): Promise<Response> {
  const signal = AbortSignal.timeout(timeout)
  const response = await fetch(url, { ...init, signal })

  if (response.ok) {
    return response
  }

  if (retries) {
    if (isRateLimited(response.headers)) {
      const wait = getRateLimitWait(response.headers)
      await setTimeout(wait)
    }

    return makeRequest({ url, init, retries: retries - 1, timeout })
  }

  throw createHttpError(response.status)
}
