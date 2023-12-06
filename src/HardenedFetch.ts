import Bottleneck from 'bottleneck'
import parseLinkHeader from 'parse-link-header'
import { onRequestFail } from './onRequestFail.js'
import { makeRequest } from './makeRequest.js'
import type { HeaderFormat, HeaderName } from './rateLimiter.js'

export type HardenedFetchOptions = {
  requestsPerSecond: number
  requestRetries: number
  requestRetryAfter: number
  // doNotRetry: number[]
  // fallbackRetryAfter: number
  // rateLimitRemaining: HeaderName
  rateLimitHeaderName: HeaderName
  rateLimitHeaderFormat: HeaderFormat
}

const defaults: HardenedFetchOptions = {
  requestsPerSecond: 10,
  requestRetries: 3,
  requestRetryAfter: 1000,
  // responseCodesRateLimited: [429], // TODO
  // doNotRetry: [400, 401, 403, 404, 422, 451], // TODO
  // fallbackRetryAfter: 5000, // TODO
  // rateLimitRemaining: 'X-RateLimit-Remaining', // TODO
  rateLimitHeaderName: 'X-RateLimit-Reset',
  rateLimitHeaderFormat: 'seconds',
}

export class HardenedFetch {
  public options: HardenedFetchOptions

  public queue: Bottleneck

  constructor(options: Partial<HardenedFetchOptions> = {}) {
    this.options = { ...defaults, ...options }

    this.queue = new Bottleneck({
      maxConcurrent: this.options.requestsPerSecond,
      minTime: Math.ceil(1000 / this.options.requestsPerSecond),
    })

    // TODO: clean up
    const onRequestFailOptions = {
      retries: this.options.requestRetries,
      retryAfter: this.options.requestRetryAfter,
      resetFormat: this.options.rateLimitHeaderFormat,
    }
    this.queue.on('failed', onRequestFail.bind(null, onRequestFailOptions))
  }

  fetch(url: string, init: RequestInit = {}, timeout: number = 9000): Promise<Response> {
    return this.queue.schedule(makeRequest, {
      url,
      init,
      timeout,
    })
  }

  async paginatedFetch(
    url: string,
    init: RequestInit = {},
    timeout: number = 9000,
    _responses: Response[] = []
  ): Promise<Response[]> {
    const response = await this.fetch(url, init, timeout)

    _responses.push(response)

    const linkHeader = response.headers.get('Link')
    const links = parseLinkHeader(linkHeader)

    if (links?.next) {
      return this.paginatedFetch(links.next.url, init, timeout, _responses)
    } else {
      return _responses
    }
  }
}
