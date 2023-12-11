import type { HeaderFormat, HeaderName } from './options.d.ts'

const ONE_DAY = 1000 * 60 * 60 * 24

export function getResponseDate(res: Response): number {
  const val = res.headers.get('Date')
  return val ? Date.parse(val) : Date.now()
}

export function getResetHeader(res: Response, name: HeaderName, format: HeaderFormat) {
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
      // Assume it's a timestamp if > 1 day
      if (parsed > ONE_DAY) {
        return parsed - getResponseDate(res)
      }

      return parsed
    } else {
      throw new Error(`Could not coerce value "${parsed}" to a number`)
    }
  }
}
