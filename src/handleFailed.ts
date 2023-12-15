import { getResetHeader } from './utils.js'
import type Bottleneck from 'bottleneck'
import { HttpError } from 'http-errors'
import type { RateLimitOptions, RetryOptions } from './options.d.ts'

export function handleFailed(
  options: RetryOptions & RateLimitOptions,
  error: Error | HttpError,
  info: Bottleneck.EventInfoRetryable
): number | void {
  if (error instanceof HttpError && error?.response instanceof Response) {
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
        // Exponential backoff
        return Math.pow(info.retryCount + 1, 2) * 1000
      }
    }
  }
}
