export type HeaderFormat = 'datetime' | 'seconds' | 'milliseconds'

export function getResponseDate(res: Response): number {
  const val = res.headers.get('Date')
  return val ? Date.parse(val) : Date.now()
}

export function parseHeaderValue(val: string, format: HeaderFormat) {
  let parsed: number

  switch (format) {
    case 'datetime':
      parsed = Date.parse(val)
      break
    case 'seconds':
      parsed = parseInt(val, 10) * 1000
      break
    case 'milliseconds':
      parsed = parseInt(val, 10)
      break
  }

  if (isNaN(parsed) === false) {
    return parsed
  } else {
    throw new Error(`Could not coerce value "${parsed}" to a number`)
  }
}

export function getHeaderValue(res: Response): string | null {
  const name = ['Retry-After', 'RateLimit-Reset', 'X-RateLimit-Reset', 'X-Rate-Limit-Reset'].find(
    (name) => res.headers.has(name)
  )

  return name ? res.headers.get(name) : null
}

export function handleRateLimit(res: Response, format: HeaderFormat): number {
  const val = getHeaderValue(res)

  if (val) {
    const ms = parseHeaderValue(val, format)

    // Assume it's a timestamp if > 1 day
    if (ms > 1000 * 60 * 60 * 24) {
      return ms - getResponseDate(res)
    }

    return ms
  }

  return 0
}
