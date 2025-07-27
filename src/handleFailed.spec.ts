import assert from 'node:assert'
import { describe, it } from 'node:test'
import { handleFailed, type Options } from './handleFailed.js'
import { HTTPError } from './errors.js'

const options: Options = {
  // Retry options
  maxRetries: 3,
  doNotRetryMethods: ['POST'],
  doNotRetryCodes: [404],
  // Rate limit options
  rateLimitHeaders: ['Retry-After'],
}

const createHttpError = (status: number, headers = {}, method = 'GET') => {
  const request = new Request('http://www.example.com', { method })
  const response = new Response(null, { status, headers })

  return new HTTPError(request, response)
}

const createTimeoutError = () => {
  class TimeoutError extends TypeError {
    constructor() {
      super('The operation was aborted due to timeout')
      this.name = 'TimeoutError'
    }
  }

  return new TimeoutError()
}

const createNetworkError = (code: string) => {
  class NetworkError extends TypeError {
    public code: string

    constructor(code) {
      super('fetch failed')
      this.name = 'NetworkError'
      this.code = code
    }
  }

  return new NetworkError(code)
}

describe('Handle Failed', () => {
  describe('Retries', () => {
    it('exponentially increases the wait time as retry count increases', () => {
      const httpError = createHttpError(500)
      assert.equal(handleFailed(options, httpError, 0), 1000)
      assert.equal(handleFailed(options, httpError, 1), 4000)
      assert.equal(handleFailed(options, httpError, 2), 9000)

      const timeoutError = createTimeoutError()
      assert.equal(handleFailed(options, timeoutError, 0), 1000)
      assert.equal(handleFailed(options, timeoutError, 1), 4000)
      assert.equal(handleFailed(options, timeoutError, 2), 9000)

      const networkError = createNetworkError('ECONNRESET')
      assert.equal(handleFailed(options, networkError, 0), 1000)
      assert.equal(handleFailed(options, networkError, 1), 4000)
      assert.equal(handleFailed(options, networkError, 2), 9000)
    })

    describe('when retry count reaches the limit', () => {
      it('returns nothing', () => {
        const httpError = createHttpError(500)
        const timeoutError = createTimeoutError()

        assert.equal(handleFailed(options, httpError, 3), undefined)
        assert.equal(handleFailed(options, timeoutError, 3), undefined)
      })
    })

    describe('when response status is flagged as do not retry', () => {
      it('returns nothing', () => {
        const error = createHttpError(404)

        assert.equal(handleFailed(options, error, 3), undefined)
      })
    })

    describe('when request method is flagged as do not retry', () => {
      it('returns nothing', () => {
        const error = createHttpError(500, {}, 'POST')

        assert.equal(handleFailed(options, error, 3), undefined)
      })
    })
  })

  describe('Rate limiting', () => {
    it('adds 1 second to the reset time', () => {
      const error = createHttpError(429, { 'Retry-After': '12' })
      assert.equal(handleFailed(options, error, 0), 13000)
    })

    describe('when no reset header is found', () => {
      it('returns default retry value', () => {
        const error = createHttpError(429)
        assert.equal(handleFailed(options, error, 0), 1000)
      })
    })
  })

  describe('with any other error', () => {
    it('returns nothing', () => {
      const error = new Error()
      assert.equal(handleFailed(options, error, 0), undefined)
    })
  })
})
