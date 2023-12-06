import assert from 'node:assert'
import { describe, it } from 'node:test'
import createHttpError from 'http-errors'
import Bottleneck from 'bottleneck'
import { onRequestFail } from './onRequestFail.js'

describe('On request fail', () => {
  describe('Retries', () => {
    it('returns a number', () => {
      const response = new Response(null, {
        status: 500,
      })
      const error = createHttpError(500, {
        response,
      })
      const info = { retryCount: 0 } as Bottleneck.EventInfoRetryable

      assert.ok(typeof onRequestFail({}, error, info) === 'number')
    })

    it('exponentially increases the number as retry count increases', () => {
      const response = new Response(null, {
        status: 500,
      })
      const error = createHttpError(500, {
        response,
      })
      const info1 = { retryCount: 0 } as Bottleneck.EventInfoRetryable
      const info2 = { retryCount: 1 } as Bottleneck.EventInfoRetryable
      const info3 = { retryCount: 2 } as Bottleneck.EventInfoRetryable

      assert.equal(onRequestFail({}, error, info1), 1000)
      assert.equal(onRequestFail({}, error, info2), 4000)
      assert.equal(onRequestFail({}, error, info3), 9000)
    })

    it('returns nothing when retry count is exceeded', () => {
      const response = new Response(null, {
        status: 500,
      })
      const error = createHttpError(500, {
        response,
      })
      const info = { retryCount: 3 } as Bottleneck.EventInfoRetryable

      assert.equal(onRequestFail({}, error, info), undefined)
    })
  })

  describe('Rate limiting', () => {
    it('parses the rate limit reset header + 1 second', () => {
      const response = new Response(null, {
        status: 429,
        headers: { 'X-Rate-Limit-Reset': '12' },
      })
      const error = createHttpError(429, { response })
      const info = { retryCount: 0 } as Bottleneck.EventInfoRetryable

      assert.equal(onRequestFail({}, error, info), 13000)
    })
  })
})
