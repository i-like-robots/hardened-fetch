import assert from 'node:assert'
import { after, before, describe, it } from 'node:test'
import { MockAgent, setGlobalDispatcher } from 'undici'
import { makeRequest } from './makeRequest.js'

describe('Make Request', () => {
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

      const response = await makeRequest('http://example.com/ok')

      assert.ok(response instanceof Response)
      assert.ok(response.ok)
    })
  })

  describe('Bad responses', () => {
    it('rejects with an HTTP error', async () => {
      mockClient.intercept({ path: '/404' }).reply(404, 'Not Found')

      await assert.rejects(() => makeRequest('http://example.com/404'), 'NotFound')
    })

    it('appends request and response to the error', async () => {
      try {
        mockClient.intercept({ path: '/500' }).reply(500, 'Internal Server Error')

        await makeRequest('http://example.com/500')
      } catch (err) {
        assert.ok(err.request instanceof Request)
        assert.ok(err.response instanceof Response)
      }
    })
  })

  describe('Request timeouts', () => {
    it('throws when timeout is exceeded', async () => {
      mockClient.intercept({ path: '/timeout' }).reply(200, 'OK').delay(200)

      await assert.rejects(() => makeRequest('http://example.com/timeout', {}, 100), 'TimeoutError')
    })
  })
})
