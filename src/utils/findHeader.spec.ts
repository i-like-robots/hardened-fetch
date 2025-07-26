import assert from 'node:assert'
import { describe, it } from 'node:test'
import { findHeader } from './findHeader.js'

describe('.findHeader()', () => {
  describe('when a header can be found', () => {
    it('returns the header value', () => {
      const names = ['a', 'b', 'c', 'd']

      const headers1 = new Headers({
        B: '123',
      })

      assert.equal(findHeader(headers1, names), '123')

      const headers2 = new Headers({
        D: '456',
      })

      assert.equal(findHeader(headers2, names), '456')
    })
  })

  describe('when a header cannot be found', () => {
    it('returns nothing', () => {
      const names = ['a', 'b', 'c', 'd']

      const headers = new Headers({
        E: '789',
      })

      assert.equal(findHeader(headers, names), undefined)
    })
  })
})
