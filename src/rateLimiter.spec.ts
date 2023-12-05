import assert from 'node:assert'
import { describe, it } from 'node:test'
import { getResponseDate, parseResetValue, rateLimiter } from './rateLimiter.js'

describe('Rate Limiter', () => {
  describe('.getResponseDate()', () => {
    describe('with a date header', () => {
      it('parses the header value and returns a timestamp', () => {
        const date = new Date('2023-11-28T22:36:49.000Z')

        const response = new Response(null, {
          headers: {
            date: date.toISOString(),
          },
        })

        assert.equal(getResponseDate(response), date.getTime())
      })
    })

    describe('without a date header', () => {
      it('returns the current timestamp', () => {
        const response = new Response(null)

        assert.equal(getResponseDate(response), Date.now())
      })
    })
  })

  describe('.parseResetValue()', () => {
    describe('with a value in datetime format', () => {
      it('returns a timestamp', () => {
        const date = new Date('2023-11-28T22:36:49.000Z')
        const value = date.toISOString()

        assert.equal(parseResetValue(value, 'datetime'), date.getTime())
      })
    })

    describe('with a value in UTC epoch timestamp format', () => {
      it('returns a timestamp', () => {
        const date = new Date('2023-11-28T22:36:49.000Z')
        const value = String(date.getTime())

        assert.equal(parseResetValue(value, 'epoch'), date.getTime())
      })
    })

    describe('with a value as an offset in seconds', () => {
      it('returns a number in milliseconds', () => {
        const value = '12'

        assert.equal(parseResetValue(value, 'seconds'), 12000)
      })
    })

    describe('with a value in as an offset in milliseconds', () => {
      it('returns a number in milliseconds', () => {
        const value = '12000'

        assert.equal(parseResetValue(value, 'milliseconds'), 12000)
      })
    })

    describe('with an an invalid value', () => {
      it('throws an error', () => {
        assert.throws(() => parseResetValue('NaN', 'datetime'), Error)
      })
    })
  })

  describe('.rateLimiter()', () => {
    describe('when a request receives a relevant response code', () => {
      describe('and there is a retry offset', () => {
        it('returns the wait time in milliseconds', () => {
          const response = new Response(null, {
            status: 429,
            headers: {
              'x-rate-limit-retry': '12',
            },
          })

          assert.equal(rateLimiter(response, 'x-rate-limit-retry', 'seconds'), 12000)
        })
      })

      describe('and there is a retry date', () => {
        it('returns the wait time relative to the response date in milliseconds', () => {
          const date = new Date('2023-11-28T22:36:49.000Z')

          const response = new Response(null, {
            status: 429,
            headers: {
              'x-rate-limit-retry': String(date.getTime() + 12000),
              date: date.toISOString(),
            },
          })

          assert.equal(rateLimiter(response, 'x-rate-limit-retry', 'epoch'), 13000)
        })
      })

      describe('and there is no retry date', () => {
        it('throws an error', () => {
          const response = new Response(null, {
            status: 429,
          })

          assert.throws(() => rateLimiter(response, 'x-rate-limit-retry', 'epoch'), Error)
        })
      })
    })

    describe('when a request does not receive a relevant response code', () => {
      it('returns zero', () => {
        const response = new Response(null, {
          status: 404,
        })

        assert.equal(rateLimiter(response, 'x-rate-limit-retry', 'seconds'), 0)
      })
    })
  })
})
