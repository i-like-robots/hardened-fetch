import Bottleneck from 'bottleneck'
import { handleFailed } from './handleFailed.js'
import { handlePagination } from './handlePagination.js'
import { makeRequest } from './makeRequest.js'
import type { Options } from './options.d.ts'

const defaults: Options = {
  // Throttle options
  maxConcurrency: 10,
  minRequestTime: 0,
  // Retry options
  maxRetries: 3,
  doNotRetry: [400, 401, 403, 404, 422, 451],
  // Rate limit options
  headerName: 'Retry-After',
  headerFormat: 'seconds',
}

export class HardenedFetch {
  public options: Options

  public queue: Bottleneck

  constructor(options: Partial<Options> = {}) {
    this.options = {
      ...defaults,
      ...options,
    }

    this.queue = new Bottleneck({
      maxConcurrent: this.options.maxConcurrency,
      minTime: this.options.minRequestTime,
    })

    this.queue.on('failed', handleFailed.bind(null, this.options))
  }

  fetch(url: string, init: RequestInit = {}, timeout: number = 9000) {
    return this.queue.schedule(makeRequest, url, init, timeout)
  }

  async *paginatedFetch(url: string, init: RequestInit = {}, timeout: number = 9000) {
    let count = 0
    let nextUrl: string | void = url

    while (nextUrl) {
      const response = await this.fetch(nextUrl, init, timeout)

      nextUrl = handlePagination(response)
      count++

      yield { response, count, done: !!nextUrl }
    }
  }
}
