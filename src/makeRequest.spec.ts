import assert from 'node:assert'
import { after, before, describe, it, mock } from 'node:test'
import { MockAgent, setGlobalDispatcher } from 'undici'
import { makeRequest } from './makeRequest.js'

describe('Make request', () => {
  const mockAgent = new MockAgent()
  const mockClient = mockAgent.get('http://example.com')

  before(() => {
    mockAgent.disableNetConnect()
    setGlobalDispatcher(mockAgent)
  })

  after(async () => {
    mockAgent.enableNetConnect()
    await mockAgent.close()
  })

  describe('Good responses', async () => {
    it('resolves with the HTTP response', async () => {
      mockClient.intercept({ path: '/ok' }).reply(200, 'OK')

      const response = await makeRequest({
        url: 'http://example.com/ok',
        retries: 0,
        rateLimiter: () => 0,
      })

      assert.ok(response instanceof Response)
      assert.ok(response.ok)
    })
  })

  describe('Bad responses', () => {
    it('rejects with a 404 errors', async () => {
      mockClient.intercept({ path: '/404' }).reply(404, 'Not Found')

      await assert.rejects(
        async () =>
          makeRequest({
            url: 'http://example.com/404',
            retries: 0,
            rateLimiter: () => 0,
          }),
        'NotFound'
      )
    })

    it('rejects with 500 errors', async () => {
      mockClient.intercept({ path: '/500' }).reply(500, 'Internal Server Error')

      await assert.rejects(
        () =>
          makeRequest({
            url: 'http://example.com/500',
            retries: 0,
            rateLimiter: () => 0,
          }),
        'InternalServerError'
      )
    })
  })

  describe('Request timeouts', () => {
    it('throws when timeout is exceeded', async () => {
      mockClient.intercept({ path: '/timeout' }).reply(200, 'OK').delay(200)

      await assert.rejects(
        () =>
          makeRequest({
            url: 'http://example.com/timeout',
            timeout: 100,
            rateLimiter: () => 0,
          }),
        'TimeoutError'
      )
    })
  })

  describe('Retries', () => {
    it('repeats a request after receiving a non-successful response', async () => {
      const mockedFetch = mock.method(globalThis, 'fetch')

      // Initial request + X retries
      mockClient.intercept({ path: '/retries' }).reply(503, 'Unavailable').times(4)

      try {
        await makeRequest({
          url: 'http://example.com/retries',
          retries: 3,
          rateLimiter: () => 0,
        })
      } catch {
        assert.equal(mockedFetch.mock.callCount(), 4)
      }

      mock.reset()
    })
  })

  describe('Rate limiting', () => {
    it('waits until the rate limit timeout', async () => {
      const wait = 500

      mockClient.intercept({ path: '/ratelimit' }).reply(429, 'Rate Limit Exceeded')
      mockClient.intercept({ path: '/ratelimit' }).reply(200, 'OK')

      const now = Date.now()
      const response = await makeRequest({
        url: 'http://example.com/ratelimit',
        retries: 1,
        rateLimiter: () => wait,
      })

      assert.ok(response.ok)
      assert.ok(Date.now() - now > wait)
    })
  })
})
