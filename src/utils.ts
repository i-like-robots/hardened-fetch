export type HeaderFormat = 'datetime' | 'epoch' | 'seconds' | 'milliseconds'

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

export function getResetValue(response: Response): string | null {
  const name = ['Retry-After', 'RateLimit-Reset', 'X-RateLimit-Reset', 'X-Rate-Limit-Reset'].find(
    (name) => response.headers.has(name)
  )

  return name ? response.headers.get(name) : null
}
