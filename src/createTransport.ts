import Bottleneck from 'bottleneck'
import { makeRequest } from './makeRequest.js'

export type CreateTransportProps = {
  concurrency: number
}

export function createTransport({ concurrency }: CreateTransportProps) {
  const limiter = new Bottleneck({
    maxConcurrent: concurrency,
    minTime: Math.ceil(1000 / concurrency),
  })

  return limiter.wrap(makeRequest)
}
