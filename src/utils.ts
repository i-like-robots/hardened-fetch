import type { ResetFormat, RateLimitHeader } from './options.d.ts'

const ONE_YEAR = 1000 * 60 * 60 * 24 * 365

export function getResponseDate(res: Response): number {
  const val = res.headers.get('Date')
  return val ? Date.parse(val) : Date.now()
}

export function getResetHeader(
  res: Response,
  name: RateLimitHeader = 'Retry-After',
  format: ResetFormat = 'seconds'
) {
  const val = res.headers.get(name)

  if (val) {
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
      // Assume it's a timestamp if > 1 year
      if (parsed > ONE_YEAR) {
        return parsed - getResponseDate(res)
      }

      return parsed
    } else {
      throw new Error(`Could not coerce value "${parsed}" to a number`)
    }
  }
}
