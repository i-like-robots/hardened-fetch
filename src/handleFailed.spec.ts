import assert from 'node:assert'
import { describe, it } from 'node:test'
import createHttpError from 'http-errors'
import { handleFailed } from './handleFailed.js'
import type Bottleneck from 'bottleneck'

describe('Handle Failed', () => {
  describe('Retries', () => {
    describe('when retry count is within limits', () => {
      it('returns a number', () => {
        const response = new Response(null, {
          status: 500,
        })
        const error = createHttpError(response.status, {
          response,
        })
        const info = { retryCount: 0 } as Bottleneck.EventInfoRetryable

        assert.ok(typeof handleFailed({}, error, info) === 'number')
      })

      it('exponentially increases the number as retry count increases', () => {
        const response = new Response(null, {
          status: 500,
        })
        const error = createHttpError(response.status, {
          response,
        })
        const info1 = { retryCount: 0 } as Bottleneck.EventInfoRetryable
        const info2 = { retryCount: 1 } as Bottleneck.EventInfoRetryable
        const info3 = { retryCount: 2 } as Bottleneck.EventInfoRetryable

        assert.equal(handleFailed({}, error, info1), 1000)
        assert.equal(handleFailed({}, error, info2), 4000)
        assert.equal(handleFailed({}, error, info3), 9000)
      })
    })

    describe('when retry count is exceeded', () => {
      it('returns nothing', () => {
        const response = new Response(null, {
          status: 500,
        })
        const error = createHttpError(response.status, {
          response,
        })
        const info = { retryCount: 3 } as Bottleneck.EventInfoRetryable

        assert.equal(handleFailed({}, error, info), undefined)
      })
    })

    describe('when response status is flagged as do not retry', () => {
      it('returns nothing', () => {
        const response = new Response(null, {
          status: 404,
        })
        const error = createHttpError(response.status, {
          response,
        })
        const info = { retryCount: 3 } as Bottleneck.EventInfoRetryable

        assert.equal(handleFailed({}, error, info), undefined)
      })
    })
  })

  describe('Rate limiting', () => {
    it('parses the rate limit reset header + 1 second', () => {
      const response = new Response(null, {
        status: 429,
        headers: { 'X-Rate-Limit-Reset': '12' },
      })
      const error = createHttpError(response.status, {
        response,
      })
      const info = { retryCount: 0 } as Bottleneck.EventInfoRetryable

      assert.equal(handleFailed({}, error, info), 13000)
    })
  })
})
