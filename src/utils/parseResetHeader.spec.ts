import assert from 'node:assert'
import { describe, it } from 'node:test'
import { parseResetHeader } from './parseResetHeader.js'

describe('.parseResetHeader()', () => {
  describe('when given a datetime string', () => {
    it('returns a delta in milliseconds', () => {
      const date = new Date('2023-11-28T22:36:30.000Z')
      const retry = new Date('2023-11-28T22:37:00.000Z')

      assert.equal(parseResetHeader(retry.toISOString(), date.getTime()), 30_000)
    })
  })

  describe('when given a timestamp in seconds', () => {
    it('returns a delta in milliseconds', () => {
      const date = new Date('2025-07-21T21:37:00.000Z')
      const retry = `${Math.floor(date.getTime() / 1000) + 30}`

      assert.equal(parseResetHeader(retry, date.getTime()), 30_000)
    })
  })

  describe('when given a timestamp in milliseconds', () => {
    it('returns a delta in milliseconds', () => {
      const date = new Date('2025-07-21T21:37:00.000Z')
      const retry = `${date.getTime() + 30_000}`

      assert.equal(parseResetHeader(retry, date.getTime()), 30_000)
    })
  })

  describe('when given a delta in seconds', () => {
    it('returns a delta in milliseconds', () => {
      const date = Date.now()
      const retry = '30'

      assert.equal(parseResetHeader(retry, date), 30_000)
    })
  })

  describe('when given a delta in milliseconds', () => {
    it('returns a delta in milliseconds', () => {
      const date = Date.now()
      const retry = '30000'

      assert.equal(parseResetHeader(retry, date), 30_000)
    })
  })

  describe('when reset header value is invalid', () => {
    it('returns nothing', () => {
      assert.equal(parseResetHeader('invalid', Date.now()), undefined)
    })
  })
})
