import { getResetValue, getResponseDate, parseResetValue } from './utils.js'
import type Bottleneck from 'bottleneck'
import type { HttpError } from 'http-errors'
import type { HeaderFormat } from './utils.js'

export type OnRequestFailOptions = {
  retries: number
  // doNotRetry: number[]
  // fallbackRetryAfter: number
  // rateLimitRemaining: HeaderName
  resetFormat: HeaderFormat
}

export function onRequestFail(
  options: Partial<OnRequestFailOptions>,
  error: HttpError,
  info: Bottleneck.EventInfoRetryable
): number | void {
  const state: OnRequestFailOptions = Object.assign(
    {
      retries: 3,
      resetFormat: 'seconds',
    },
    options
  )

  const { response } = error

  if (info.retryCount < state.retries) {
    if (response.status === 429) {
      const value = getResetValue(response)

      if (value) {
        let reset = parseResetValue(value, state.resetFormat)

        if (['datetime', 'epoch'].includes(state.resetFormat)) {
          reset = reset - getResponseDate(response)
        }

        // Add extra 1 second to account for sub second differences
        return Math.max(reset, 0) + 1000
      }
    }

    // Exponential backoff
    return Math.pow(info.retryCount + 1, 2) * 1000
  }
}
