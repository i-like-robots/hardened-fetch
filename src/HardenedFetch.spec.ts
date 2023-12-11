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
    it('merges user options with defaults', () => {
      const instance = new HardenedFetch({
        throttle: {
          maxConcurrency: 5,
        },
        retries: {
          maxRetries: 5,
        },
        rateLimits: {
          headerFormat: 'datetime',
        },
      })

      assert.equal(instance.opts.throttle.maxConcurrency, 5)
      assert.equal(instance.opts.retries.maxRetries, 5)
      assert.equal(instance.opts.rateLimits.headerFormat, 'datetime')
    })
  })

  describe('.fetch()', () => {
    it('adds a job to the queue', async () => {
      mockClient.intercept({ path: '/' }).reply(200, 'OK')

      const instance = new HardenedFetch()

      instance.fetch('http://www.example.com/')

      assert.equal(instance.queue.jobs().length, 1)

      await new Promise((resolve) => {
        instance.queue.on('done', resolve)
      })
    })

    it('resolves with the Response object', async () => {
      mockClient.intercept({ path: '/' }).reply(200, 'OK')

      const instance = new HardenedFetch()
      const response = await instance.fetch('http://www.example.com/')

      assert.ok(response instanceof Response)
    })

    it('rejects with an error on failure', async () => {
      mockClient.intercept({ path: '/' }).reply(404)

      const instance = new HardenedFetch()
      assert.rejects(() => instance.fetch('http://www.example.com/'), 'NotFound')
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
      mockClient.intercept({ path: '/3' }).reply(200, 'OK', {
        headers: {},
      })

      const instance = new HardenedFetch()

      const pages = instance.paginatedFetch('http://www.example.com/1')

      const responses: Response[] = []

      for await (const { response, count } of pages) {
        assert.equal(response.url, `http://www.example.com/${count}`)
        assert.ok(response instanceof Response)

        responses.push(response)
      }

      assert.equal(responses.length, 3)
    })

    it('rejects with an error on failure', async () => {
      mockClient.intercept({ path: '/1' }).reply(200, 'OK', {
        headers: { link: '<http://www.example.com/2>; rel="next"' },
      })
      mockClient.intercept({ path: '/2' }).reply(404, 'Not Found')

      const instance = new HardenedFetch()

      const pages = instance.paginatedFetch('http://www.example.com/1')

      await pages.next()

      assert.rejects(() => pages.next(), 'NotFound')
    })
  })
})
