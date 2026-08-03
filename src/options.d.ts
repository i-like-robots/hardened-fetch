import type { Options as RateLimitedQueueOptions } from 'simple-rate-limited-queue'

export type RateLimitHeader =
  | 'Retry-After'
  | 'RateLimit-Reset'
  | 'X-RateLimit-Reset'
  | 'X-Rate-Limit-Reset'
  | string

export type HTTPMethods =
  | 'CONNECT'
  | 'DELETE'
  | 'GET'
  | 'HEAD'
  | 'OPTIONS'
  | 'PATCH'
  | 'POST'
  | 'PUT'
  | 'TRACE'
  | string

export interface RequestOptions {
  /** A base URL to prepend to each request. */
  baseUrl?: string
  /** Default headers to add to each request. */
  defaultHeaders?: RequestInit['headers']
  // TODO: defaultTimeout?: number
}

export interface ThrottleOptions extends RateLimitedQueueOptions {
  /** The maximum number of concurrent requests in progress */
  maxInProgress: Infinity
  /** The maximum number of requests to execute per time interval. */
  maxPerInterval: 10
  /** The length of each time interval in milliseconds. */
  intervalLength: 1_000
}

export interface RetryOptions {
  /** Number of retry attempts for failed requests. */
  maxRetries: number
  /** List of HTTP methods that will not trigger a retry attempt. */
  doNotRetryMethods: HTTPMethods[]
  /** List of HTTP status codes that will not trigger a retry attempt. */
  doNotRetryCodes: number[]
}

export interface RateLimitOptions {
  /** The names of the rate limit reset headers to lookup */
  rateLimitHeaders: RateLimitHeader[]
}

export interface Options extends RequestOptions, ThrottleOptions, RetryOptions, RateLimitOptions {}
