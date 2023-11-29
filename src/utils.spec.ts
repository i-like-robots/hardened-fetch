import assert from 'node:assert'
import { describe, it } from 'node:test'
import { getRateLimitWait, isRateLimited } from './utils.js'

describe('Utils', () => {
  describe('.isRateLimited()', () => {
    it('returns false when there are requests remaining', () => {
      const headers = new Headers({
        'X-Rate-Limit-Remaining': '10',
      })

      assert.equal(isRateLimited(headers), false)
    })

    it('returns true when there are no requests remaining', () => {
      const headers = new Headers({
        'X-Rate-Limit-Remaining': '0',
      })

      assert.equal(isRateLimited(headers), true)
    })
  })

  describe('.getRateLimitWait()', () => {
    it('returns difference between response date and reset time in MS', () => {
      const now = new Date('2023-11-28T22:36:49.000Z')

      const diff = 12000

      const headers = new Headers({
        'X-Rate-Limit-Remaining': '0',
        'X-Rate-Limit-Reset': `${Math.max((now.getTime() + diff) / 1000)}`,
        Date: now.toISOString(),
      })

      assert.equal(getRateLimitWait(headers), 13000)
    })
  })
})
