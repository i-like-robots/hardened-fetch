const ONE_YEAR = 1000 * 60 * 60 * 24 * 365

const DATE_STRING = /^20[0-9]{2}-[0-1][0-9]-[0-3][0-9]/

const SECONDS = /^\d+/

export function parseResetHeader(value: string, timestamp: number) {
  let parsed: number | void = undefined

  if (DATE_STRING.test(value)) {
    parsed = Date.parse(value)
  }

  if (SECONDS.test(value)) {
    parsed = parseInt(value, 10)
  }

  if (parsed && !isNaN(parsed)) {
    const ms = parsed * 1000

    // Assume it's a unix timestamp if > 1 year
    if (parsed > ONE_YEAR) {
      return ms - timestamp
    }

    return ms
  }
}
