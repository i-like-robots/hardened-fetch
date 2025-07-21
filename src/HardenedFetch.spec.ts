import assert from 'node:assert'
import { after, before, describe, it } from 'node:test'
import { MockAgent, setGlobalDispatcher } from 'undici'
import { HardenedFetch } from './HardenedFetch.js'

describe('Hardened Fetch', () => {
  const mockAgent = new MockAgent()
  const mockClient = mockAgent.get('http://www.example.com')

  before(() => {
    mockAgent.disableNetConnect()
    setGlobalDispatcher(mockAgent)
  })

  after(async () => {
    mockAgent.enableNetConnect()
    await mockAgent.close()
  })

  describe('.constructor()', () => {
    it('merges given options with defaults', () => {
      const instance = new HardenedFetch({
        maxRetries: 5,
        resetFormat: 'datetime',
      })

      assert.equal(instance.options.maxRetries, 5)
      assert.equal(instance.options.resetFormat, 'datetime')
    })
  })

  describe('.fetch()', () => {
    it('adds a job to the queue', async () => {
      mockClient.intercept({ path: '/' }).reply(200, 'OK')

      const instance = new HardenedFetch()

      instance.queue.pause()

      const promise = instance.fetch('http://www.example.com/')

      assert.equal(instance.queue.pending, 1)

      instance.queue.resume()

      await promise
    })

    it('resolves with the Response object', async () => {
      mockClient.intercept({ path: '/' }).reply(200, 'OK')

      const instance = new HardenedFetch()
      const response = await instance.fetch('http://www.example.com/')

      assert.ok(response instanceof Response)
    })

    it('rejects with a HTTP error on failure', async () => {
      mockClient.intercept({ path: '/' }).reply(404, 'Not Found')

      const instance = new HardenedFetch()

      await assert.rejects(() => instance.fetch('http://www.example.com/'), /HTTP error: 404/)
    })

    it('appends base URL when defined', async () => {
      mockClient.intercept({ path: '/path' }).reply(200, 'OK')

      const instance = new HardenedFetch({ baseUrl: 'http://www.example.com/' })

      const response = await instance.fetch('/path')

      assert.equal(response.url, 'http://www.example.com/path')
    })

    it('appends default headers when defined', async () => {
      mockClient.intercept({ path: '/', headers: { 'x-header': 'foo' } }).reply(200, 'OK')

      const instance = new HardenedFetch({ defaultHeaders: { 'x-header': 'foo' } })

      const response = await instance.fetch('http://www.example.com/')

      assert.ok(response.ok)
    })
  })

  describe('.paginatedFetch()', () => {
    it('returns an async iterator', async () => {
      mockClient.intercept({ path: '/1' }).reply(200, 'OK', {
        headers: { link: '<http://www.example.com/2>; rel="next"' },
      })
      mockClient.intercept({ path: '/2' }).reply(200, 'OK', {
        headers: { link: '<http://www.example.com/3>; rel="next"' },
      })
      mockClient.intercept({ path: '/3' }).reply(200, 'OK')

      const instance = new HardenedFetch()

      const pages = instance.paginatedFetch('http://www.example.com/1')

      const responses: boolean[] = []

      for await (const { response, done } of pages) {
        assert.ok(response instanceof Response)
        responses.push(done)
      }

      assert.deepEqual(responses, [false, false, true])
    })

    it('rejects with an HTTP error on failure', async () => {
      mockClient.intercept({ path: '/1' }).reply(200, 'OK', {
        headers: { link: '<http://www.example.com/2>; rel="next"' },
      })
      mockClient.intercept({ path: '/2' }).reply(404, 'Not Found')

      const instance = new HardenedFetch()

      const pages = instance.paginatedFetch('http://www.example.com/1')

      await pages.next()

      await assert.rejects(() => pages.next(), /HTTP error: 404/)
    })
  })
})
