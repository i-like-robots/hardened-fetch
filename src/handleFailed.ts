import { handleRateLimit } from './handleRateLimit.js'
import type Bottleneck from 'bottleneck'
import type { HttpError } from 'http-errors'
import type { HeaderFormat } from './handleRateLimit.js'

export type HandleFailedOpts = {
  retries: number
  doNotRetry: Set<number>
  resetHeaderFormat: HeaderFormat
}

export function handleFailed(
  opts: Partial<HandleFailedOpts>,
  err: HttpError,
  info: Bottleneck.EventInfoRetryable
): number | void {
  const state: HandleFailedOpts = Object.assign(
    {
      retries: 3,
      doNotRetry: new Set([400, 401, 403, 404, 422, 451]),
      resetHeaderFormat: 'seconds',
    },
    opts
  )

  const { response } = err

  if (info.retryCount < state.retries && !state.doNotRetry.has(response.status)) {
    if (response.status === 429) {
      const reset = handleRateLimit(response, state.resetHeaderFormat)

      if (reset) {
        // Add extra 1 second to account for sub second differences
        return reset + 1000
      }
    }

    // Exponential backoff
    return Math.pow(info.retryCount + 1, 2) * 1000
  }
}
