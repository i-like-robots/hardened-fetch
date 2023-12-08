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
      const instance = new HardenedFetch({ maxRequests: 5, retries: 5 })

      assert.equal(instance.opts.maxRequests, 5)
      assert.equal(instance.opts.retries, 5)
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

    it('throws an error on failure', async () => {
      mockClient.intercept({ path: '/' }).reply(500)

      const instance = new HardenedFetch({ retries: 0 })
      assert.rejects(() => instance.fetch('http://www.example.com/'), 'InternalServerError')
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
  })
})
