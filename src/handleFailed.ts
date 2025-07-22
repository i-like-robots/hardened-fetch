import { getResetHeader } from './utils.js'
import { HTTPError } from './errors.js'
import type { RateLimitOptions, RetryOptions } from './options.d.ts'

export interface Options extends RetryOptions, RateLimitOptions {}

const backoff = (retries: number) => Math.pow(retries + 1, 2) * 1000

export function handleFailed(options: Options, error: unknown, retries: number): number | void {
  if (retries >= options.maxRetries) {
    return
  }

  if (error instanceof Error) {
    if (error instanceof HTTPError) {
      if (options.doNotRetryMethods.includes(error.request.method)) {
        return
      }

      if (options.doNotRetry.includes(error.response.status)) {
        return
      }

      if (error.response.status === 429) {
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

    // TODO: network errors
  }
}
