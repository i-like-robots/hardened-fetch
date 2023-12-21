import join from 'proper-url-join'
import Bottleneck from 'bottleneck'
import parseLinkHeader from 'parse-link-header'
import { handleFailed } from './handleFailed.js'
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
  rateLimitHeader: 'Retry-After',
  resetFormat: 'seconds',
}

export class HardenedFetch {
  public options: Options

  public queue: Bottleneck

  constructor(options: Partial<Options> = {}) {
    this.options = Object.assign({}, defaults, options)

    this.queue = new Bottleneck({
      maxConcurrent: this.options.maxConcurrency,
      minTime: this.options.minRequestTime,
    })

    this.queue.on('failed', handleFailed.bind(null, this.options))
  }

  fetch(url: string, init: RequestInit = {}, timeout: number = 9000) {
    url = !url.startsWith('http') && this.options.baseUrl ? join(this.options.baseUrl, url) : url
    init = { ...init, headers: { ...this.options.defaultHeaders, ...init.headers } }

    return this.queue.schedule(makeRequest, url, init, timeout)
  }

  async *paginatedFetch(url: string, init: RequestInit = {}, timeout: number = 9000) {
    let nextUrl: string | null = url

    while (nextUrl) {
      const response = await this.fetch(nextUrl, init, timeout)

      const linkHeader = response.headers.get('Link')
      const links = parseLinkHeader(linkHeader)

      nextUrl = links?.next ? links.next.url : null

      yield { response, done: !nextUrl }
    }
  }
}
