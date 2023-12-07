import { handleRateLimit } from './handleRateLimit.js'
import type Bottleneck from 'bottleneck'
import type { HttpError } from 'http-errors'
import type { HeaderFormat } from './handleRateLimit.js'

export type HandleFailedOpts = {
  retries: number
  doNotRetry: Set<number>
  headerFormat: HeaderFormat
}

const defaults: HandleFailedOpts = {
  retries: 3,
  doNotRetry: new Set([400, 401, 403, 404, 422, 451]),
  headerFormat: 'seconds',
}

export function handleFailed(
  options: Partial<HandleFailedOpts>,
  error: HttpError,
  info: Bottleneck.EventInfoRetryable
): number | void {
  const opts: HandleFailedOpts = Object.assign({}, defaults, options)

  const res = error.response as Response

  if (info.retryCount < opts.retries && !opts.doNotRetry.has(res.status)) {
    if (res.status === 429) {
      const reset = handleRateLimit(res, opts.headerFormat)

      if (reset) {
        // Add extra 1 second to account for sub second differences
        return reset + 1000
      }
    }

    // Exponential backoff
    return Math.pow(info.retryCount + 1, 2) * 1000
  }
}
