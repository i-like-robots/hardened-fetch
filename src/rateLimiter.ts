export type HeaderName =
  | 'Retry-After'
  | 'RateLimit-Reset'
  | 'X-RateLimit-Reset'
  | 'X-Rate-Limit-Reset'
  | string

export type HeaderFormat = 'date' | 'seconds' | 'milliseconds'

const RESPONSE_CODES = new Set([403, 422, 429, 503])

export function getResponseDate(response: Response): number {
  return Date.parse(response.headers.get('Date')) || Date.now()
}

export function parseHeaderValue(value: string, format: HeaderFormat) {
  let parsed: number

  switch (format) {
    case 'date':
      parsed = new Date(value).getTime()
      break
    case 'seconds':
      parsed = parseInt(value, 10) * 1000
      break
    case 'milliseconds':
      parsed = parseInt(value, 10)
      break
  }

  if (isNaN(parsed) === false) {
    return parsed
  } else {
    throw new Error(`Could not coerce header value "${parsed}" to a number`)
  }
}

export function rateLimiter(
  response: Response,
  headerName: HeaderName,
  headerFormat: HeaderFormat
): number {
  if (RESPONSE_CODES.has(response.status)) {
    const value = response.headers.get(headerName)

    if (value) {
      const ms = parseHeaderValue(value, headerFormat)
      const date = getResponseDate(response)

      // Add extra 1 second to account for sub second differences
      if (ms > date) {
        return ms - date + 1000
      } else {
        return ms
      }
    }

    throw new Error(`No rate limiting header found named ${headerName}`)
  }

  return 0
}

export function createRateLimiter(headerName: HeaderName, headerFormat: HeaderFormat) {
  return (response: Response) => rateLimiter(response, headerName, headerFormat)
}
