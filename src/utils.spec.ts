import assert from 'node:assert'
import { describe, it } from 'node:test'
import { getResponseDate, getResetHeader, joinBaseUrl } from './utils.js'

describe('Utils', () => {
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

  describe('.getResetHeader()', () => {
    describe('when given a date string', () => {
      it('returns an offset in milliseconds', () => {
        const date = new Date('2023-11-28T22:36:49.000Z')
        const retry = new Date('2023-11-28T22:37:19.000Z')

        const res = new Response(null, {
          headers: {
            Date: date.toISOString(),
            'Retry-After': retry.toISOString(),
          },
        })

        assert.equal(getResetHeader(res, 'Retry-After', 'datetime'), 30000)
      })
    })

    describe('when given a timestamp', () => {
      it('returns an offset in milliseconds', () => {
        const date = new Date('2023-11-28T22:36:49.000Z')

        const res = new Response(null, {
          headers: {
            Date: date.toISOString(),
            'Retry-After': String(date.getTime() + 30000),
          },
        })

        assert.equal(getResetHeader(res, 'Retry-After', 'milliseconds'), 30000)
      })
    })

    describe('when given an offset in seconds', () => {
      it('returns the offset in milliseconds', () => {
        const res = new Response(null, {
          headers: {
            'Retry-After': String(30),
          },
        })

        assert.equal(getResetHeader(res, 'Retry-After', 'seconds'), 30000)
      })
    })

    describe('when no reset header is found', () => {
      it('returns nothing', () => {
        const res = new Response()

        assert.equal(getResetHeader(res, 'Retry-After', 'seconds'), undefined)
      })
    })

    describe('when reset header value is invalid', () => {
      it('throws an error', () => {
        const res = new Response(null, {
          headers: {
            'Retry-After': 'invalid',
          },
        })

        assert.throws(() => getResetHeader(res, 'Retry-After', 'seconds'), Error)
      })
    })
  })

  describe('.joinBaseUrl()', () => {
    it('returns path if no base URL is set', () => {
      assert.equal(joinBaseUrl('/v1/api'), '/v1/api')
    })

    it('returns path when it is a complete URL', () => {
      assert.equal(joinBaseUrl('http://example.com'), 'http://example.com')
    })

    it('joins path to base URL', () => {
      assert.equal(joinBaseUrl('/v1/api', 'http://example.com'), 'http://example.com/v1/api')
    })

    it('does not create double slashes', () => {
      assert.equal(joinBaseUrl('/v1/api', 'http://example.com/'), 'http://example.com/v1/api')
    })

    it('maintains the path of base URL', () => {
      assert.equal(
        joinBaseUrl('/resource/1', 'http://example.com/v1/api'),
        'http://example.com/v1/api/resource/1'
      )
    })
  })
})
