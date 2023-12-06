import assert from 'node:assert'
import { describe, it } from 'node:test'
import { getResponseDate, getResetValue, parseResetValue } from './utils.js'

describe('Utils', () => {
  describe('.getResponseDate()', () => {
    describe('with a date header', () => {
      it('returns the response date as a timestamp', () => {
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

  describe('.getResetValue()', () => {
    describe('and there is a retry or reset header', () => {
      it('finds the retry header', () => {
        const response = new Response(null, {
          headers: {
            'Retry-After': '12',
          },
        })

        assert.equal(getResetValue(response), '12')
      })

      it('finds the reset header', () => {
        const response = new Response(null, {
          headers: {
            'X-Rate-Limit-Reset': '12',
          },
        })

        assert.equal(getResetValue(response), '12')
      })
    })

    describe('and there is no retry header', () => {
      it('returns null', () => {
        const response = new Response(null, {})

        assert.equal(getResetValue(response), null)
      })
    })
  })
})
