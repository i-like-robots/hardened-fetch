import { getResetHeader } from './utils.js'
import { isHttpError } from 'http-errors'
import type Bottleneck from 'bottleneck'
import type { RateLimitOptions, RetryOptions } from './options.d.ts'

const backoff = (retries: number) => Math.pow(retries + 1, 2) * 1000

export function handleFailed(
  options: RetryOptions & RateLimitOptions,
  error: Error,
  info: Bottleneck.EventInfoRetryable
): number | void {
  if (isHttpError(error) && error?.response instanceof Response) {
    const response = error.response

    if (info.retryCount < options.maxRetries) {
      if (response.status === 429) {
        const wait = getResetHeader(response, options.rateLimitHeader, options.resetFormat)

        if (wait) {
          // Add extra 1 second to account for sub second differences
          return wait + 1000
        }
      }

      if (!options.doNotRetry?.includes(response.status)) {
        return backoff(info.retryCount)
      }
    }
  }

  if (error.name === 'TimeoutError') {
    return backoff(info.retryCount)
  }
}
