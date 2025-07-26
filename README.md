# hardened-fetch

[![GitHub license](https://img.shields.io/badge/license-MIT-blue.svg)](https://github.com/i-like-robots/hardened-fetch/blob/main/LICENSE) ![build status](https://github.com/i-like-robots/hardened-fetch/actions/workflows/test.yml/badge.svg?branch=main) [![npm version](https://img.shields.io/npm/v/hardened-fetch.svg?style=flat)](https://www.npmjs.com/package/hardened-fetch)

Hardened Fetch is a tiny wrapper for `global.fetch` adding request timeouts, throttling, rate limit awareness, retries, and descriptive errors. It makes working with APIs without SDKs and web scraping easier.

```js
import { HardenedFetch } from 'hardened-fetch'

const client = new HardenedFetch({
  baseUrl: 'https://swapi.dev/api/',
  maxRetries: 3,
})

const response = await client.fetch('/species/1/')
```

## Installation

This is a [Node.js] module available through the [npm] registry. Node.js 20 or higher is required.

```sh
$ npm install hardened-fetch
```

[Node.js]: https://nodejs.org/en/
[npm]: https://www.npmjs.com/
[npm install]: https://docs.npmjs.com/getting-started/installing-npm-packages-locally

## Features

- Throttle concurrent requests and request rate
- Retries failed requests with exponential back off
- Retries rate-limited requests according to reset time
- Supports request timeouts and multiple abort controllers

## API

### `new HardenedFetch([options] = {})`

Creates a new Hardened Fetch client.

Constructor Options:

| Name                | Type          | Description                                                                                              |
| ------------------- | ------------- | -------------------------------------------------------------------------------------------------------- |
| `baseUrl`           | `string`      | A base URL to prepend to each request, optional.                                                         |
| `defaultHeaders`    | `HeadersInit` | Default headers to add to each request, optional.                                                        |
| `maxInProgress`     | `number`      | The maximum number of requests to execute per time interval.                                             |
| `maxPerInterval`    | `number`      | The maximum number of concurrent requests in progress.                                                   |
| `intervalLength`    | `number`      | The length of each time interval in milliseconds.                                                        |
| `maxRetries`        | `number`      | Number of retry attempts for failed requests.                                                            |
| `doNotRetryMethods` | `string[]`    | List of HTTP methods that will not trigger a retry attempt.                                              |
| `doNotRetryCodes`   | `number[]`    | List of HTTP status codes that will not trigger a retry attempt.                                         |
| `rateLimitHeaders`  | `string[]`    | The names of the rate limit reset headers to lookup.                                                     |
| `resetFormat`       | `string`      | The format of the rate limit reset header, must be one of `"datetime"`, `"seconds"` or `"milliseconds"`. |

All of the options and their defaults are shown below:

```js
const client = new HardenedFetch({
  // Request options
  baseUrl: undefined,
  defaultHeaders: undefined,
  // Throttle options
  maxInProgress: 20,
  maxPerInterval: 10,
  intervalLength: 1000,
  // Retry options
  maxRetries: 3,
  doNotRetryCodes: [400, 401, 403, 404, 405, 406, 410, 411, 412, 422, 451, 501],
  doNotRetryMethods: ['CONNECT', 'DELETE', 'PATCH', 'POST', 'PUT'],
  // Rate limit options
  rateLimitHeaders: ['Retry-After', 'RateLimit-Reset', 'X-RateLimit-Reset', 'X-Rate-Limit-Reset'],
  resetFormat: 'seconds',
})
```

### `client.fetch(url, [init={}], [timeout=30_000])`

Expects a `url` to the resource that you wish to fetch, optionally [settings](https://developer.mozilla.org/en-US/docs/Web/API/fetch#options) to apply to the request and a timeout in milliseconds. Returns a promise which will resolve with the [`Response`](https://developer.mozilla.org/en-US/docs/Web/API/Response) object when successful or rejects with an `HTTPError` for non-20x responses.

```js
const response = await client.fetch('https://swapi.dev/api/species/1/')
const json = await response.json()
```

## License

This package is MIT licensed.
