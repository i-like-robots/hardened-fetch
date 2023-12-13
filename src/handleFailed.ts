import { getResetHeader } from './utils.js'
import type Bottleneck from 'bottleneck'
import type { HttpError } from 'http-errors'
import type { RateLimitOptions, RetryOptions } from './options.d.ts'

export function handleFailed(
  options: RetryOptions & RateLimitOptions,
  error: HttpError,
  info: Bottleneck.EventInfoRetryable
): number | void {
  const res = error.response as Response

  if (info.retryCount < options.maxRetries) {
    if (res.status === 429) {
      const reset = getResetHeader(res, options.headerName, options.headerFormat)

      if (reset) {
        // Add extra 1 second to account for sub second differences
        return reset + 1000
      }
    }

    if (!options.doNotRetry?.includes(res.status)) {
      // Exponential backoff
      return Math.pow(info.retryCount + 1, 2) * 1000
    }
  }
}
