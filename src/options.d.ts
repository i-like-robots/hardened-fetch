import type { HeaderFormat, HeaderName } from './handleRateLimit.js'

export type HeaderName =
  | 'Retry-After'
  | 'RateLimit-Reset'
  | 'X-RateLimit-Reset'
  | 'X-Rate-Limit-Reset'

export type HeaderFormat = 'datetime' | 'seconds' | 'milliseconds'

export type ThrottleOptions = {
  /** How many requests can be running at the same time. */
  maxConcurrency: number
  /** How long to wait after launching a request before launching another one. */
  minRequestTime: number
}

export type RetryOptions = {
  /** Number of retry attempts for failed requests. */
  maxRetries: number
  /** List of HTTP status codes that should not trigger a retry attempt. */
  doNotRetry: number[]
}

export type RateLimitOptions = {
  /** The name of the rate limit reset header */
  headerName: HeaderName
  /** The expected format of the rate limit reset header */
  headerFormat: HeaderFormat
}

export type Options = {
  throttle: ThrottleOptions
  rateLimits: RateLimitOptions
  retries: RetryOptions
}