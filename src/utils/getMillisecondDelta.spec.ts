import assert from 'node:assert'
import { describe, it } from 'node:test'
import { getMillisecondDelta } from './getMillisecondDelta.js'

describe('.getMillisecondDelta()', () => {
  describe('when given a timestamp in seconds', () => {
    it('returns a delta in milliseconds', () => {
      const date = new Date('2025-07-21T21:37:00.000Z')
      const retry = Math.floor(date.getTime() / 1000) + 60

      assert.equal(getMillisecondDelta(retry, date.getTime()), 60_000)
    })
  })

  describe('when given a timestamp in milliseconds', () => {
    it('returns a delta in milliseconds', () => {
      const date = new Date('2025-07-21T21:37:00.000Z')
      const retry = date.getTime() + 60_000

      assert.equal(getMillisecondDelta(retry, date.getTime()), 60_000)
    })
  })

  describe('when given a delta in seconds', () => {
    it('returns a delta in milliseconds', () => {
      const date = Date.now()
      const retry = 60

      assert.equal(getMillisecondDelta(retry, date), 60_000)
    })
  })

  describe('when given a delta in milliseconds', () => {
    it('returns a delta in milliseconds', () => {
      const date = Date.now()
      const retry = 60_000

      assert.equal(getMillisecondDelta(retry, date), 60_000)
    })
  })
})
