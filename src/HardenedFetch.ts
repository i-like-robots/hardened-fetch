import Bottleneck from 'bottleneck'
import parseLinkHeader from 'parse-link-header'
import { handleFailed } from './handleFailed.js'
import { makeRequest } from './makeRequest.js'
import type { HandleFailedOpts } from './handleFailed.js'

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

  fetch(url: string, init: RequestInit = {}, timeout: number = 9000): Promise<Response> {
    return this.queue.schedule(makeRequest, url, init, timeout)
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
