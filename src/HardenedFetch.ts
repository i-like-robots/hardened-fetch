import Bottleneck from 'bottleneck'
import parseLinkHeader from 'parse-link-header'
import { handleFailed } from './handleFailed.js'
import { makeRequest } from './makeRequest.js'
import type { HandleFailedOpts } from './handleFailed.js'

export type HardenedFetchOpts = Partial<HandleFailedOpts> & {
  requestsPerSecond: number
}

export class HardenedFetch {
  public options: HardenedFetchOpts

  public queue: Bottleneck

  constructor(opts: Partial<HardenedFetchOpts> = {}) {
    this.options = Object.assign(
      {
        requestsPerSecond: 10,
      },
      opts
    )

    this.queue = new Bottleneck({
      maxConcurrent: this.options.requestsPerSecond,
      minTime: Math.ceil(1000 / this.options.requestsPerSecond),
    })

    this.queue.on('failed', handleFailed.bind(null, this.options))
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
