import assert from 'node:assert'
import { after, before, describe, it } from 'node:test'
import Bottleneck from 'bottleneck'
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
      const instance = new HardenedFetch({ requestsPerSecond: 5, retries: 5 })

      assert.equal(instance.options.requestsPerSecond, 5)
      assert.equal(instance.options.retries, 5)
    })

    it('creates a queue with Bottleneck', () => {
      const instance = new HardenedFetch()

      assert.ok(instance.queue instanceof Bottleneck)
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

    it('resolves with the Response object', async () => {
      mockClient.intercept({ path: '/' }).reply(200, 'OK')

      const instance = new HardenedFetch()
      const response = await instance.fetch('http://www.example.com/')

      assert.ok(response instanceof Response)
    })

    it('provides a rate limiter to the request function', async () => {
      const date = new Date()
      const wait = 1

      mockClient.intercept({ path: '/' }).reply(429, 'Rate Limit Exceeded', {
        headers: {
          'X-RateLimit-Reset': String(wait),
          Date: date.toISOString(),
        },
      })

      mockClient.intercept({ path: '/' }).reply(200, 'OK')

      const instance = new HardenedFetch()
      const response = await instance.fetch('http://www.example.com/')

      assert.ok(response.ok)
      assert.ok(Date.now() - date.getTime() >= wait * 1000)
    })

    it('throws an error on failure', async () => {
      mockClient.intercept({ path: '/' }).reply(500)

      const instance = new HardenedFetch({ retries: 0 })

      try {
        await instance.fetch('http://www.example.com/')
      } catch (err) {
        console.error({ err })
      }

      assert.rejects(() => instance.fetch('http://www.example.com/'), Error)
    })
  })
})
