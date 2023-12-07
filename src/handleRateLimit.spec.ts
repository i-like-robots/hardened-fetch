import assert from 'node:assert'
import { describe, it } from 'node:test'
import { getHeaderValue, getResponseDate, handleRateLimit, parseHeaderValue } from './handleRateLimit.js'

describe('Handle Rate Limit', () => {
  describe('.getResponseDate()', () => {
    describe('with a date header', () => {
      it('returns the response date as a timestamp', () => {
        const date = new Date('2023-11-28T22:36:49.000Z')

        const res = new Response(null, {
          headers: {
            date: date.toISOString(),
          },
        })

        assert.equal(getResponseDate(res), date.getTime())
      })
    })

    describe('without a date header', () => {
      it('returns the current timestamp', () => {
        const res = new Response(null)

        assert.equal(getResponseDate(res), Date.now())
      })
    })
  })

  describe('.parseHeaderValue()', () => {
    describe('when given a date string', () => {
      it('returns a timestamp in milliseconds', () => {
        const date = new Date('2023-11-28T22:36:49.000Z')
        const value = date.toISOString()

        assert.equal(parseHeaderValue(value, 'datetime'), date.getTime())
      })
    })

    describe('when given UTC epoch timestamp in milliseconds', () => {
      it('returns a timestamp in milliseconds', () => {
        const date = new Date('2023-11-28T22:36:49.000Z')
        const value = String(date.getTime())

        assert.equal(parseHeaderValue(value, 'milliseconds'), date.getTime())
      })
    })

    describe('when given UTC epoch timestamp in seconds', () => {
      it('returns a timestamp in milliseconds', () => {
        const date = new Date('2023-11-28T22:36:49.000Z')
        const value = String(date.getTime() / 1000)

        assert.equal(parseHeaderValue(value, 'seconds'), date.getTime())
      })
    })

    describe('when given an offset in seconds', () => {
      it('returns a number in milliseconds', () => {
        const value = '12'

        assert.equal(parseHeaderValue(value, 'seconds'), 12000)
      })
    })

    describe('when given an offset in milliseconds', () => {
      it('returns a number in milliseconds', () => {
        const value = '12000'

        assert.equal(parseHeaderValue(value, 'milliseconds'), 12000)
      })
    })

    describe('when given an an invalid value', () => {
      it('throws an error', () => {
        assert.throws(() => parseHeaderValue('NaN', 'datetime'), Error)
      })
    })
  })

  describe('.getHeaderValue()', () => {
    describe('when a header is available', () => {
      it('returns the header value', () => {
        const res1 = new Response(null, {
          headers: {
            'Retry-After': '12',
          },
        })

        assert.equal(getHeaderValue(res1), '12')

        const res2 = new Response(null, {
          headers: {
            'X-Rate-Limit-Reset': '12',
          },
        })

        assert.equal(getHeaderValue(res2), '12')
      })
    })

    describe('when no header is available', () => {
      it('returns null', () => {
        const res = new Response(null, {})

        assert.equal(getHeaderValue(res), null)
      })
    })
  })

  describe('.handleRateLimit()', () => {
    describe('when given a date', () => {
      it('returns an offset in milliseconds', () => {
        const date = new Date('2023-11-28T22:36:49.000Z')

        const res = new Response(null, {
          headers: {
            Date: date.toISOString(),
            'X-Rate-Limit-Reset': String(date.getTime() + 30000),
          },
        })

        assert.equal(handleRateLimit(res, 'milliseconds'), 30000)
      })
    })

    describe('when given an offset', () => {
      it('returns the offset in milliseconds', () => {
        const res = new Response(null, {
          headers: {
            'X-Rate-Limit-Reset': String(30),
          },
        })

        assert.equal(handleRateLimit(res, 'seconds'), 30000)
      })
    })

    describe('when no reset header is found', () => {
      it('returns zero', () => {
        const res = new Response(null, {})

        assert.equal(handleRateLimit(res, 'seconds'), 0)
      })
    })
  })
})
