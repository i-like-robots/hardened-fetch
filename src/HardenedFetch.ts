import Bottleneck from 'bottleneck'
import { handleFailed } from './handleFailed.js'
import { makeRequest } from './makeRequest.js'
import type { HandleFailedOpts } from './handleFailed.js'
import { handlePagination } from './handlePagination.js'

export type HardenedFetchOpts = Partial<HandleFailedOpts> & {
  maxRequests: number
  perMilliseconds: number
}

const defaults: HardenedFetchOpts = {
  maxRequests: 10,
  perMilliseconds: 1000,
}

export class HardenedFetch {
  public opts: HardenedFetchOpts

  public queue: Bottleneck

  constructor(opts: Partial<HardenedFetchOpts> = {}) {
    this.opts = Object.assign({}, defaults, opts)

    this.queue = new Bottleneck({
      maxConcurrent: this.opts.maxRequests,
      minTime: Math.ceil(this.opts.perMilliseconds / this.opts.maxRequests),
    })

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
