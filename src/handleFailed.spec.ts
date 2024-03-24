import assert from 'node:assert'
import { describe, it } from 'node:test'
import createHttpError from 'http-errors'
import { handleFailed } from './handleFailed.js'
import type { Options } from './options.js'

const options: Options = {
  // Throttle options
  maxConcurrency: 0,
  minRequestTime: 100,
  // Retry options
  maxRetries: 3,
  doNotRetry: [404],
  // Rate limit options
  rateLimitHeader: 'Retry-After',
  resetFormat: 'seconds',
}

const createError = (status: number, headers = {}) => {
  const response = new Response(null, { status, headers })
  return createHttpError(response.status, { response })
}

const createTimeout = () => {
  class TimeoutError extends Error {
    constructor() {
      super('The operation was aborted due to timeout')
      this.name = 'TimeoutError'
    }
  }

  return new TimeoutError()
}

describe('Handle Failed', () => {
  describe('Retries', () => {
    it('exponentially increases the wait time as retry count increases', () => {
      const httpError = createError(500)
      assert.equal(handleFailed(options, httpError, 0), 1000)
      assert.equal(handleFailed(options, httpError, 1), 4000)
      assert.equal(handleFailed(options, httpError, 2), 9000)

      const timeoutError = createTimeout()
      assert.equal(handleFailed(options, timeoutError, 0), 1000)
      assert.equal(handleFailed(options, timeoutError, 1), 4000)
      assert.equal(handleFailed(options, timeoutError, 2), 9000)
    })

    describe('when retry count reaches the limit', () => {
      it('returns nothing', () => {
        const httpError = createError(500)
        const timeoutError = createTimeout()

        assert.equal(handleFailed(options, httpError, 3), undefined)
        assert.equal(handleFailed(options, timeoutError, 3), undefined)
      })
    })

    describe('when response status is flagged as do not retry', () => {
      it('returns nothing', () => {
        const error = createError(404)

        assert.equal(handleFailed(options, error, 3), undefined)
      })
    })
  })

  describe('Rate limiting', () => {
    it('adds 1 second to the reset time', () => {
      const error = createError(429, { 'Retry-After': '12' })
      assert.equal(handleFailed(options, error, 0), 13000)
    })

    describe('when no reset header is found', () => {
      it('returns default retry value', () => {
        const error = createError(429)
        assert.equal(handleFailed(options, error, 0), 1000)
      })
    })
  })

  describe('with an unsupported error', () => {
    it('returns nothing', () => {
      const error = new Error()
      assert.equal(handleFailed(options, error, 0), undefined)
    })
  })
})
