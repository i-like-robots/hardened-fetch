import { parseResetValue } from './rateLimiter.js'
import type Bottleneck from 'bottleneck'
import type { HttpError } from 'http-errors'
import type { HeaderFormat } from './rateLimiter.js'

// TODO: move to utils
function getRateLimitReset(response: Response): string | null {
  const name = ['Retry-After', 'RateLimit-Reset', 'X-RateLimit-Reset', 'X-Rate-Limit-Reset'].find(
    (name) => response.headers.has(name)
  )

  return name ? response.headers.get(name) : null
}

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
      const rateLimitReset = getRateLimitReset(response)
  
      if (rateLimitReset) {
        const wait = parseResetValue(rateLimitReset, state.resetFormat)
  
        // Add extra 1 second to account for sub second differences
        return Math.max(wait, 0) + 1000
      }
    }

    // Basic exponential backoff
    return Math.pow(info.retryCount + 1, 2) * 1000
  }
}
