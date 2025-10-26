import assert from 'node:assert'
import { describe, it } from 'node:test'
import { joinBaseUrl } from './joinBaseUrl.js'

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
