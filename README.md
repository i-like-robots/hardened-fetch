# hardened-fetch

[![GitHub license](https://img.shields.io/badge/license-MIT-blue.svg)](https://github.com/i-like-robots/hardened-fetch/blob/main/LICENSE) ![build status](https://github.com/i-like-robots/hardened-fetch/actions/workflows/test.yml/badge.svg?branch=main) [![npm version](https://img.shields.io/npm/v/hardened-fetch.svg?style=flat)](https://www.npmjs.com/package/hardened-fetch)

Hardened Fetch is a tiny wrapper for `global.fetch` adding request timeouts, request throttling, retries with backoff, rate limit detection, pagination, and descriptive errors. It makes working with APIs without SDKs and web scraping easier.

```js
import HardenedFetch from 'hardened-fetch'

const client = new HardenedFetch()
const response = await client.fetch('https://swapi.dev/api/species/1/')
const data = await response.json()
```

## Installation

This is a [Node.js] module available through the [npm] registry. Node.js 18 or higher is required.

```sh
$ npm install hardened-fetch
```

[Node.js]: https://nodejs.org/en/
[npm]: https://www.npmjs.com/
[npm install]: https://docs.npmjs.com/getting-started/installing-npm-packages-locally

## Features

- Request timeouts 
- Throttle concurrent requests and request rate
- Retries failed requests with exponential back off
- Retries rate-limited requests according to reset time
- Easily step-through paginated API responses

## API

### `new HardenedFetch([options] = {})`

Creates a new Hardened Fetch client.

Constructor Options:

| Name              | Type       | Description                                                                                                              |
| ----------------- | ---------- | ------------------------------------------------------------------------------------------------------------------------ |
| `maxConcurrency`  | `number`   | How many requests can be running at the same time.                                                                       |
| `minRequestTime`  | `number`   | How long to wait after launching a request before launching another one.                                                 |
| `maxRetries`      | `number`   | Number of retry attempts for failed requests.                                                                            |
| `doNotRetry`      | `number[]` | List of HTTP status codes that will not trigger a retry attempt.                                                         |
| `rateLimitHeader` | `string`   | The name of the rate limit reset header, usually one of `"Retry-After"`, `"X-RateLimit-Reset"`, or`"X-Rate-Limit-Reset"` |
| `resetFormat`     | `string`   | The format of the rate limit reset header, must be one of `"datetime"`, `"seconds"` or `"milliseconds"`.                 |

All of the options and their defaults are shown below:

```js
const client = new HardenedFetch({
  // Throttle options
  maxConcurrency: 10,
  minRequestTime: 0,
  // Retry options
  maxRetries: 3,
  doNotRetry: [400, 401, 403, 404, 422, 451],
  // Rate limit options
  rateLimitHeader: 'Retry-After',
  resetFormat: 'seconds',
})
```

### `client.fetch(url, [init] = {}, [timeout] = 9000)`

Expects a `url` to the resource that you wish to fetch and optionally custom [settings](https://developer.mozilla.org/en-US/docs/Web/API/fetch#options) to apply to the request, and a timeout in milliseconds. Returns a promise which will resolve with the [`Response`](https://developer.mozilla.org/en-US/docs/Web/API/Response) object when successful. Rejects with a relevant [HTTP error](https://www.npmjs.com/package/http-errors) on failure.

```js
const response = await client.fetch('https://swapi.dev/api/species/1/')
const json = await response.json()
```

### `client.paginatedFetch(url, [options] = {}, [timeout] = 9000)`

Expects a `url` to the resource that you wish to fetch and optionally custom [settings](https://developer.mozilla.org/en-US/docs/Web/API/fetch#options) to apply to the request, and a timeout in milliseconds. Returns an [`AsyncIterator`](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/AsyncIterator) which will resolve with a [`Response`](https://developer.mozilla.org/en-US/docs/Web/API/Response) object and `done` property on each successful iteration. Rejects with a relevant [HTTP error](https://www.npmjs.com/package/http-errors) on failure.

```js
const pages = client.paginatedFetch('https://swapi.dev/api/species')

for await (const { response, done } of pages) {
  const json = await response.json()

  if (done) {
    console.log('Done!')
  }
}
```

## License

This package is MIT licensed.
