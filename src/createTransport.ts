import Bottleneck from 'bottleneck'
import { makeRequest } from './makeRequest.js'
import { createRateLimiter } from './rateLimiter.js'
import type { HeaderFormat, HeaderName } from './rateLimiter.js'

export type CreateTransportProps = {
  requestsPerSecond?: number
  requestTimeout?: number
  rateLimitHeaderName?: HeaderName
  rateLimitHeaderFormat?: HeaderFormat
}

export function createTransport({
  requestsPerSecond = 10,
  rateLimitHeaderName = 'X-Rate-Limit-Reset',
  rateLimitHeaderFormat = 'date',
}: CreateTransportProps) {
  const queue = new Bottleneck({
    maxConcurrent: requestsPerSecond,
    minTime: Math.ceil(1000 / requestsPerSecond),
  })

  const rateLimiter = createRateLimiter(rateLimitHeaderName, rateLimitHeaderFormat)

  return queue.wrap((url: string, init: RequestInit, retries: number, timeout: number) => {
    return makeRequest({
      url,
      init,
      retries,
      timeout,
      rateLimiter,
    })
  })
}
