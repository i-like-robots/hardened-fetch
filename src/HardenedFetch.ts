import Bottleneck from 'bottleneck'
import { handleFailed } from './handleFailed.js'
import { handlePagination } from './handlePagination.js'
import { makeRequest } from './makeRequest.js'
import type { Options, RateLimitOptions, RetryOptions, ThrottleOptions } from './options.js'

export type HardenedFetchOpts = Partial<{
  throttle: Partial<ThrottleOptions>
  rateLimits: Partial<RateLimitOptions>
  retries: Partial<RetryOptions>
}>

const defaults: Options = {
  throttle: {
    maxConcurrency: 10,
    minRequestTime: 0,
  },
  retries: {
    maxRetries: 3,
    doNotRetry: [400, 401, 403, 404, 422, 451],
  },
  rateLimits: {
    headerName: 'Retry-After',
    headerFormat: 'seconds',
  },
}

export class HardenedFetch {
  public opts: Options

  public queue: Bottleneck

  constructor(opts: HardenedFetchOpts = {}) {
    this.opts = {
      throttle: { ...defaults.throttle, ...opts.throttle },
      rateLimits: { ...defaults.rateLimits, ...opts.rateLimits },
      retries: { ...defaults.retries, ...opts.retries },
    }

    this.queue = new Bottleneck({
      maxConcurrent: this.opts.throttle.maxConcurrency,
      minTime: this.opts.throttle.minRequestTime,
    })

    // this.queue.on('failed', () => { console.log('Fail 1') })
    // this.queue.on('failed', () => { console.log('Fail 2') })
    this.queue.on('failed', handleFailed.bind(null, this.opts))
  }

  fetch(url: string, init: RequestInit = {}, timeout: number = 9000) {
    return this.queue.schedule(makeRequest, url, init, timeout)
  }

  async *paginatedFetch(url: string, init: RequestInit = {}, timeout: number = 9000) {
    let count = 0
    let nextUrl: string | null = url

    while (nextUrl) {
      const response = await this.fetch(nextUrl, init, timeout)

      nextUrl = handlePagination(response)
      count++

      yield { response, count, done: !!nextUrl }
    }
  }
}
