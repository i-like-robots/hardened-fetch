import type { ResetFormat } from '../options'

const ONE_YEAR = 1000 * 60 * 60 * 24 * 365

export function parseResetHeader(
  value: unknown,
  timestamp: number,
  format: ResetFormat = 'seconds'
) {
  if (typeof value === 'string') {
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
        return parsed - timestamp
      }

      return parsed
    }
  }
}
