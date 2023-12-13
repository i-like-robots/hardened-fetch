import assert from 'node:assert'
import { describe, it } from 'node:test'
import { handlePagination } from './handlePagination'

describe('Handle Pagination', () => {
  describe('when a response has a link header with next value', () => {
    it('returns a URL', () => {
      const response = new Response(null, {
        headers: {
          link: `<http://www.example.com/2>; rel="next"`,
        },
      })

      assert.equal(handlePagination(response), 'http://www.example.com/2')
    })
  })

  describe('when a response has a link header with no next value', () => {
    it('returns nothing', () => {
      const response = new Response(null, {
        headers: {
          link: `<http://www.example.com/2>; rel="prev"`,
        },
      })

      assert.equal(handlePagination(response), undefined)
    })
  })
})
