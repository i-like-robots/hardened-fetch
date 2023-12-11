import { getResetHeader } from './utils.js'
import type Bottleneck from 'bottleneck'
import type { HttpError } from 'http-errors'
import type { Options, RateLimitOptions, RetryOptions } from './options.d.ts'

const retryDefaults: RetryOptions = {
  maxRetries: 3,
  doNotRetry: [400, 401, 403, 404, 422, 451],
}

const rateLimitDefaults: RateLimitOptions = {
  headerName: 'Retry-After',
  headerFormat: 'seconds',
}

export function handleFailed(
  options: Options,
  error: HttpError,
  info: Bottleneck.EventInfoRetryable
): number | void {
  const retryOpts = Object.assign({}, retryDefaults, options.retries)
  const rateLimitOpts = Object.assign({}, rateLimitDefaults, options.rateLimits)

  const res = error.response as Response

  if (info.retryCount < retryOpts.maxRetries) {
    if (res.status === 429) {
      const reset = getResetHeader(res, rateLimitOpts.headerName, rateLimitOpts.headerFormat)

      if (reset) {
        // Add extra 1 second to account for sub second differences
        return reset + 1000
      }
    }

    if (!retryOpts.doNotRetry.includes(res.status)) {
      // Exponential backoff
      return Math.pow(info.retryCount + 1, 2) * 1000
    }
  }
}
