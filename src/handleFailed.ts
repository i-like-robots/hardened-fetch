import { handleRateLimit } from './handleRateLimit.js'
import type Bottleneck from 'bottleneck'
import type { HttpError } from 'http-errors'
import type { Options, RetryOptions } from './options.d.ts'

const defaults: RetryOptions = {
  maxRetries: 3,
  doNotRetry: [400, 401, 403, 404, 422, 451],
}

export function handleFailed(
  options: Options,
  error: HttpError,
  info: Bottleneck.EventInfoRetryable
): number | void {
  const opts = Object.assign({}, defaults, options.retries)

  const res = error.response as Response

  if (info.retryCount < opts.maxRetries) {
    if (res.status === 429) {
      const reset = handleRateLimit(res, options.rateLimits)

      if (reset) {
        // Add extra 1 second to account for sub second differences
        return reset + 1000
      }
    }

    if (!opts.doNotRetry.includes(res.status)) {
      // Exponential backoff
      return Math.pow(info.retryCount + 1, 2) * 1000
    }
  }
}
