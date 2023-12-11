import assert from 'node:assert'
import { describe, it } from 'node:test'
import createHttpError from 'http-errors'
import { handleFailed } from './handleFailed.js'
import type Bottleneck from 'bottleneck'
import type { Options } from './options.d.ts'

describe('Handle Failed', () => {
  describe('Retries', () => {
    describe('when retry count is below limit', () => {
      it('returns a wait in milliseconds', () => {
        const response = new Response(null, {
          status: 500,
        })
        const error = createHttpError(response.status, {
          response,
        })
        const info = { retryCount: 0 } as Bottleneck.EventInfoRetryable

        assert.ok(typeof handleFailed({} as Options, error, info) === 'number')
      })

      it('exponentially increases the wait time as retry count increases', () => {
        const response = new Response(null, {
          status: 500,
        })
        const error = createHttpError(response.status, {
          response,
        })
        const info1 = { retryCount: 0 } as Bottleneck.EventInfoRetryable
        const info2 = { retryCount: 1 } as Bottleneck.EventInfoRetryable
        const info3 = { retryCount: 2 } as Bottleneck.EventInfoRetryable

        assert.equal(handleFailed({} as Options, error, info1), 1000)
        assert.equal(handleFailed({} as Options, error, info2), 4000)
        assert.equal(handleFailed({} as Options, error, info3), 9000)
      })
    })

    describe('when retry count reaches the limit', () => {
      it('returns nothing', () => {
        const response = new Response(null, {
          status: 500,
        })
        const error = createHttpError(response.status, {
          response,
        })
        const info = { retryCount: 3 } as Bottleneck.EventInfoRetryable

        assert.equal(handleFailed({} as Options, error, info), undefined)
      })
    })

    describe('when response status is flagged as not to retry', () => {
      it('returns nothing', () => {
        const response = new Response(null, {
          status: 404,
        })
        const error = createHttpError(response.status, {
          response,
        })
        const info = { retryCount: 3 } as Bottleneck.EventInfoRetryable

        assert.equal(handleFailed({} as Options, error, info), undefined)
      })
    })
  })

  describe('Rate limiting', () => {
    it('adds 1 second to the reset time', () => {
      const reset = 12

      const response = new Response(null, {
        status: 429,
        headers: { 'Retry-After': String(reset) },
      })
      const error = createHttpError(response.status, {
        response,
      })
      const info = { retryCount: 0 } as Bottleneck.EventInfoRetryable

      assert.equal(handleFailed({} as Options, error, info), (reset + 1) * 1000)
    })
  })
})
