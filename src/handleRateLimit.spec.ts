import assert from 'node:assert'
import { describe, it } from 'node:test'
import { handleRateLimit } from './handleRateLimit.js'

describe('Handle Rate Limit', () => {
  describe('when a header is available', () => {
    it('finds any "standard" reset header', () => {
      const res1 = new Response(null, {
        headers: {
          'Retry-After': '12',
        },
      })

      assert.equal(handleRateLimit(res1, 'seconds'), 12000)

      const res2 = new Response(null, {
        headers: {
          'X-Rate-Limit-Reset': '12',
        },
      })

      assert.equal(handleRateLimit(res2, 'seconds'), 12000)
    })

    describe('when reset header is a date time string', () => {
      it('returns an offset in milliseconds', () => {
        const date = new Date('2023-11-28T22:36:49.000Z')

        const res = new Response(null, {
          headers: {
            Date: date.toISOString(),
            'Retry-After': String(date.getTime() + 30000),
          },
        })

        assert.equal(handleRateLimit(res, 'milliseconds'), 30000)
      })
    })

    describe('when reset header is a timestamp in seconds', () => {
      it('returns an offset in milliseconds', () => {
        const date = new Date('2023-11-28T22:36:49.000Z')

        const res = new Response(null, {
          headers: {
            Date: date.toISOString(),
            'Retry-After': String(date.getTime() / 1000 + 30),
          },
        })

        assert.equal(handleRateLimit(res, 'seconds'), 30000)
      })
    })

    describe('when reset header is a timestamp in milliseconds', () => {
      it('returns an offset in milliseconds', () => {
        const date = new Date('2023-11-28T22:36:49.000Z')

        const res = new Response(null, {
          headers: {
            Date: date.toISOString(),
            'Retry-After': String(date.getTime() + 30000),
          },
        })

        assert.equal(handleRateLimit(res, 'milliseconds'), 30000)
      })
    })

    describe('when reset header is an offset in seconds', () => {
      it('returns the offset in milliseconds', () => {
        const res = new Response(null, {
          headers: {
            'Retry-After': String(30),
          },
        })

        assert.equal(handleRateLimit(res, 'seconds'), 30000)
      })
    })

    describe('when reset header is an offset in milliseconds', () => {
      it('returns the offset in milliseconds', () => {
        const res = new Response(null, {
          headers: {
            'Retry-After': String(30000),
          },
        })

        assert.equal(handleRateLimit(res, 'milliseconds'), 30000)
      })
    })
  })

  describe('when no reset header has an invalid value', () => {
    it('returns zero', () => {
      const res = new Response(null, {
        headers: {
          'Retry-After': 'unknown',
        },
      })

      assert.throws(() => handleRateLimit(res, 'seconds'), Error)
    })
  })

  describe('when no reset header is found', () => {
    it('returns zero', () => {
      const res = new Response(null, {})

      assert.equal(handleRateLimit(res, 'seconds'), 0)
    })
  })
})
