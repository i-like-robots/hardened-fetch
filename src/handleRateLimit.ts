import type { HeaderFormat, RateLimitOptions } from './options.d.ts'

function getResponseDate(res: Response): number {
  const val = res.headers.get('Date')
  return val ? Date.parse(val) : Date.now()
}

function parseHeaderValue(val: string, format: HeaderFormat) {
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

const defaults: RateLimitOptions = {
  headerName: 'Retry-After',
  headerFormat: 'seconds',
}

// TODO merge with handle failed
export function handleRateLimit(res: Response, options: Partial<RateLimitOptions>): number | void {
  const opts = Object.assign({}, defaults, options)
  const val = res.headers.get(opts.headerName)

  if (val) {
    const ms = parseHeaderValue(val, opts.headerFormat)

    // Assume it's a timestamp if > 1 day
    if (ms > 1000 * 60 * 60 * 24) {
      return ms - getResponseDate(res)
    }

    return ms
  }
}
