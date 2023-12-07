export type HeaderFormat = 'datetime' | 'seconds' | 'milliseconds'

export function getResponseDate(response: Response): number {
  const value = response.headers.get('Date')
  return value ? Date.parse(value) : Date.now()
}

export function parseHeaderValue(value: string, format: HeaderFormat) {
  let parsed: number

  switch (format) {
    case 'datetime':
      parsed = Date.parse(value)
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

export function getHeaderValue(response: Response): string | null {
  const name = ['Retry-After', 'RateLimit-Reset', 'X-RateLimit-Reset', 'X-Rate-Limit-Reset'].find(
    (name) => response.headers.has(name)
  )

  return name ? response.headers.get(name) : null
}

export function handleRateLimit(response: Response, headerFormat: HeaderFormat): number {
  const value = getHeaderValue(response)

  if (value) {
    const reset = parseHeaderValue(value, headerFormat)

    // Assume it's a timestamp if > 1 day
    if (reset > 1000 * 60 * 60 * 24) {
      return reset - getResponseDate(response)
    }

    return reset
  }

  return 0
}
