export type RateLimitHeader =
  | 'Retry-After'
  | 'RateLimit-Reset'
  | 'X-RateLimit-Reset'
  | 'X-Rate-Limit-Reset'
  | string

export type ResetFormat = 'datetime' | 'seconds' | 'milliseconds'

export type RequestOptions = {
  /** A base URL to prepend to each request. */
  baseUrl?: string
}

export type ThrottleOptions = {
  /** How many requests can be running at the same time. */
  maxConcurrency: number
  /** How long to wait after launching a request before launching another one. */
  minRequestTime: number
}

export type RetryOptions = {
  /** Number of retry attempts for failed requests. */
  maxRetries: number
  /** List of HTTP status codes that will not trigger a retry attempt. */
  doNotRetry: number[]
}

export type RateLimitOptions = {
  /** The name of the rate limit reset header */
  rateLimitHeader: RateLimitHeader
  /** The format of the rate limit reset header */
  resetFormat: ResetFormat
}

export type Options = RequestOptions & ThrottleOptions & RetryOptions & RateLimitOptions
