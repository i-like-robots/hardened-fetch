import assert from 'node:assert'
import { describe, it } from 'node:test'
import { parseResetHeader } from './parseResetHeader.js'

describe('.parseResetHeader()', () => {
  describe('when given a datetime string', () => {
    it('returns an offset in milliseconds', () => {
      const date = new Date('2023-11-28T22:36:30.000Z')
      const retry = new Date('2023-11-28T22:37:00.000Z')

      assert.equal(parseResetHeader(retry.toISOString(), date.getTime(), 'datetime'), 30_000)
    })
  })

  describe('when given a timestamp in seconds', () => {
    it('returns an offset in milliseconds', () => {
      const date = new Date('2025-07-21T21:37:00.000Z')
      const retry = `${Math.floor(date.getTime() / 1000) + 30}`

      assert.equal(parseResetHeader(retry, date.getTime(), 'seconds'), 30_000)
    })
  })

  describe('when given a timestamp in milliseconds', () => {
    it('returns an offset in milliseconds', () => {
      const date = new Date('2025-07-21T21:37:00.000Z')
      const retry = `${date.getTime() + 30_000}`

      assert.equal(parseResetHeader(retry, date.getTime(), 'milliseconds'), 30_000)
    })
  })

  describe('when given an offset in milliseconds', () => {
    it('returns the offset in milliseconds', () => {
      const date = Date.now()
      const retry = '30000'

      assert.equal(parseResetHeader(retry, date, 'milliseconds'), 30_000)
    })
  })

  describe('when given an offset in seconds', () => {
    it('returns the offset in milliseconds', () => {
      const date = Date.now()
      const retry = '30'

      assert.equal(parseResetHeader(retry, date, 'seconds'), 30_000)
    })
  })

  describe('when no reset value is found', () => {
    it('returns nothing', () => {
      assert.equal(parseResetHeader(undefined, Date.now()), undefined)
    })
  })

  describe('when reset header value is invalid', () => {
    it('returns nothing', () => {
      assert.equal(parseResetHeader('invalid', Date.now()), undefined)
    })
  })
})
