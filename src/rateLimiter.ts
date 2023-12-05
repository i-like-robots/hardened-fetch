export type HeaderName =
  | 'Retry-After'
  | 'RateLimit-Reset'
  | 'X-RateLimit-Reset'
  | 'X-Rate-Limit-Reset'
  | string

export type HeaderFormat = 'datetime' | 'epoch' | 'seconds' | 'milliseconds'

const RESPONSE_CODES = new Set([403, 422, 429, 503])

export function getResponseDate(response: Response): number {
  const value = response.headers.get('Date')
  return value ? Date.parse(value) : Date.now()
}

export function parseResetValue(value: string, format: HeaderFormat) {
  let parsed: number

  switch (format) {
    case 'datetime':
      parsed = Date.parse(value)
      break
    case 'epoch':
      parsed = new Date(parseInt(value, 10)).getTime()
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
      const ms = parseResetValue(value, headerFormat)

      // Add extra 1 second to account for sub second differences
      if (headerFormat === 'datetime' || headerFormat === 'epoch') {
        const date = getResponseDate(response)
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
