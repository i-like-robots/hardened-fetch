import type { Options as RateLimitedQueueOptions } from 'simple-rate-limited-queue'

export type RateLimitHeader =
  | 'Retry-After'
  | 'RateLimit-Reset'
  | 'X-RateLimit-Reset'
  | 'X-Rate-Limit-Reset'
  | string

export type ResetFormat = 'datetime' | 'seconds' | 'milliseconds'

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

export interface RequestOptions {
  /** A base URL to prepend to each request. */
  baseUrl?: string
  /** Default headers to add to each request. */
  defaultHeaders?: RequestInit['headers']
  // TODO: defaultTimeout?: number
}

export interface ThrottleOptions extends RateLimitedQueueOptions {}

export interface RetryOptions {
  /** Number of retry attempts for failed requests. */
  maxRetries: number
  /** List of HTTP status codes that will not trigger a retry attempt. */
  doNotRetry: number[]
  // TODO: doNotRetryMethods: HTTPMethods[]
}

export interface RateLimitOptions {
  /** The name of the rate limit reset header */
  rateLimitHeader: RateLimitHeader
  /** The format of the rate limit reset header */
  resetFormat: ResetFormat
}

export interface Options extends RequestOptions, ThrottleOptions, RetryOptions, RateLimitOptions {}
