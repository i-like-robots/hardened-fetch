import { RateLimitedQueue, withRetry } from 'simple-rate-limited-queue'
import { joinBaseUrl } from './utils/joinBaseUrl.js'
import { handleFailed } from './handleFailed.js'
import { makeRequest } from './makeRequest.js'
import type { Options } from './options.d.ts'

const defaults: Options = {
  // Throttle options
  maxInProgress: Infinity,
  maxPerInterval: 10,
  intervalLength: 1_000,
  // Retry options
  maxRetries: 3,
  doNotRetryMethods: ['CONNECT', 'DELETE', 'PATCH', 'POST', 'PUT'],
  doNotRetryCodes: [400, 401, 403, 404, 405, 406, 410, 411, 412, 422, 451, 501],
  // Rate limit options
  rateLimitHeaders: ['Retry-After', 'RateLimit-Reset', 'X-RateLimit-Reset', 'X-Rate-Limit-Reset'],
}

export class HardenedFetch {
  public options: Options

  public queue: RateLimitedQueue

  constructor(options: Partial<Options> = {}) {
    this.options = Object.assign({}, defaults, options)

    this.queue = new RateLimitedQueue({
      maxInProgress: this.options.maxInProgress,
      maxPerInterval: this.options.maxPerInterval,
      intervalLength: this.options.intervalLength,
    })
  }

  fetch(url: string, init: RequestInit = {}, timeout: number = 30_000) {
    if (this.options.baseUrl) {
      url = joinBaseUrl(url, this.options.baseUrl)
    }

    if (this.options.defaultHeaders) {
      const headers = Object.assign({}, this.options.defaultHeaders, init.headers)
      init = Object.assign({}, init, { headers })
    }

    const operation = () => {
      return makeRequest(url, init, timeout)
    }

    const canRetry = (error: unknown, executions: number) => {
      return handleFailed(this.options, error, executions)
    }

    return this.queue.schedule(withRetry(operation, canRetry))
  }
}
