```ts

const hardenedFetch = new HardenedFetchClient({
    requestsPerSecond: 4,
    rateLimitHeaderName: 'Retry-After' | 'RateLimit-Reset' | 'X-Rate-Limit-Reset' | 'X-RateLimit-Reset' | ,
    resetHeaderFormat: 'date' | 'seconds' | 'milliseconds',
})


const hardenedFetch = new HardenedFetchClient({
    baseUrl: 'http://api.example.com',
    requestsPerSecond: 4,
    rateLimitHeaderName: 'Retry-After',
    rateLimitHeaderFormat: 'date',
})

hardenedFetch.fetch('/groups/list')
```
