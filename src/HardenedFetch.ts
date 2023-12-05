import Bottleneck from 'bottleneck'
import parseLinkHeader from 'parse-link-header'
import { makeRequest } from './makeRequest.js'
import { createRateLimiter } from './rateLimiter.js'
import type { HeaderFormat, HeaderName } from './rateLimiter.js'

export type HardenedFetchOptions = {
  requestsPerSecond: number
  requestTimeout: number
  requestRetries: number
  rateLimitHeaderName: HeaderName
  rateLimitHeaderFormat: HeaderFormat
}

const defaults: HardenedFetchOptions = {
  requestsPerSecond: 10,
  requestTimeout: 15000,
  requestRetries: 3,
  rateLimitHeaderName: 'X-RateLimit-Reset',
  rateLimitHeaderFormat: 'seconds',
}

export class HardenedFetch {
  public options: HardenedFetchOptions

  public queue: Bottleneck

  constructor(options: Partial<HardenedFetchOptions> = {}) {
    this.options = Object.freeze({ ...defaults, ...options })

    this.queue = new Bottleneck({
      maxConcurrent: this.options.requestsPerSecond,
      minTime: Math.ceil(1000 / this.options.requestsPerSecond),
    })
  }

  fetch(url: string, init: RequestInit = {}): Promise<Response> {
    const rateLimiter = createRateLimiter(
      this.options.rateLimitHeaderName,
      this.options.rateLimitHeaderFormat
    )

    return this.queue.schedule(makeRequest, {
      url,
      init,
      retries: this.options.requestRetries,
      timeout: this.options.requestTimeout,
      rateLimiter,
    })
  }

  async paginatedFetch(
    url: string,
    init: RequestInit = {},
    responses: Response[] = []
  ): Promise<Response[]> {
    const response = await this.fetch(url, init)

    responses.push(response)

    const linkHeader = response.headers.get('Link')
    const links = parseLinkHeader(linkHeader)

    if (links?.next) {
      return this.paginatedFetch(links.next.url, init, responses)
    } else {
      return responses
    }
  }
}
