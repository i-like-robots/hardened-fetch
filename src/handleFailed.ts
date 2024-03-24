import { getResetHeader } from './utils.js'
import { isHttpError } from 'http-errors'
import type { Options } from './options.d.ts'

const backoff = (retries: number) => Math.pow(retries + 1, 2) * 1000

export function handleFailed(options: Options, error: Error, retries: number): number | void {
  if (retries >= options.maxRetries) {
    return
  }

  if (isHttpError(error) && error?.response instanceof Response) {
    if (options.doNotRetry?.includes(error.status)) {
      return
    }

    if (error.status === 429) {
      const wait = getResetHeader(error.response, options.rateLimitHeader, options.resetFormat)

      if (wait) {
        // Add extra 1 second to account for sub second differences
        return wait + 1000
      }
    }

    return backoff(retries)
  }

  if (error.name === 'TimeoutError') {
    return backoff(retries)
  }
}
