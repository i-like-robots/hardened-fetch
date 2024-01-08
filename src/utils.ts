import type { ResetFormat, RateLimitHeader } from './options.d.ts'

const ONE_YEAR = 1000 * 60 * 60 * 24 * 365

export function getResponseDate(res: Response): number {
  const val = res.headers.get('Date')
  return val ? Date.parse(val) : Date.now()
}

export function getResetHeader(
  response: Response,
  name: RateLimitHeader = 'Retry-After',
  format: ResetFormat = 'seconds'
) {
  const value = response.headers.get(name)

  if (value) {
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
      // Assume it's a timestamp if > 1 year
      if (parsed > ONE_YEAR) {
        return parsed - getResponseDate(response)
      }

      return parsed
    } else {
      throw new Error(`Could not coerce value "${value}" to a number`)
    }
  }
}

export function joinBaseUrl(path: string, baseUrl?: string): string {
  if (path.startsWith('http') || typeof baseUrl !== 'string') {
    return path
  }

  return [baseUrl, path].map((part) => part.replace(/^\/|\/$/, '')).join('/')
}
