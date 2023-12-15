import assert from 'node:assert'
import { describe, it } from 'node:test'
import createHttpError from 'http-errors'
import { handleFailed } from './handleFailed.js'
import type Bottleneck from 'bottleneck'

const options = {
  // Retry options
  maxRetries: 3,
  doNotRetry: [404],
  // Rate limit options
  rateLimitHeader: 'Retry-After' as const,
  resetFormat: 'seconds' as const,
}

const createError = (status: number, headers = {}) => {
  const response = new Response(null, { status, headers })
  return createHttpError(response.status, { response })
}

describe('Handle Failed', () => {
  describe('with an HttpError', () => {
    describe('Retries', () => {
      it('exponentially increases the wait time as retry count increases', () => {
        const error = createError(500)
        const info1 = { retryCount: 0 } as Bottleneck.EventInfoRetryable
        const info2 = { retryCount: 1 } as Bottleneck.EventInfoRetryable
        const info3 = { retryCount: 2 } as Bottleneck.EventInfoRetryable

        assert.equal(handleFailed(options, error, info1), 1000)
        assert.equal(handleFailed(options, error, info2), 4000)
        assert.equal(handleFailed(options, error, info3), 9000)
      })

      describe('when retry count reaches the limit', () => {
        it('returns nothing', () => {
          const error = createError(500)
          const info = { retryCount: 3 } as Bottleneck.EventInfoRetryable

          assert.equal(handleFailed(options, error, info), undefined)
        })
      })

      describe('when response status is flagged as do not retry', () => {
        it('returns nothing', () => {
          const error = createError(404)
          const info = { retryCount: 3 } as Bottleneck.EventInfoRetryable

          assert.equal(handleFailed(options, error, info), undefined)
        })
      })
    })

    describe('Rate limiting', () => {
      it('adds 1 second to the reset time', () => {
        const error = createError(429, { 'Retry-After': '12' })
        const info = { retryCount: 0 } as Bottleneck.EventInfoRetryable

        assert.equal(handleFailed(options, error, info), 13000)
      })

      describe('when no reset header is found', () => {
        it('returns default retry value', () => {
          const error = createError(429)
          const info = { retryCount: 0 } as Bottleneck.EventInfoRetryable

          assert.equal(handleFailed(options, error, info), 1000)
        })
      })
    })
  })

  describe('with a non-HttpError', () => {
    it('returns nothing', () => {
      const error = new Error()
      const info = { retryCount: 0 } as Bottleneck.EventInfoRetryable

      assert.equal(handleFailed(options, error, info), undefined)
    })
  })
})
