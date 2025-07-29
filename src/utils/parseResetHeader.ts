import { getMillisecondDelta } from './getMillisecondDelta'

const DATE_STRING = /^20[0-9]{2}-[0-1][0-9]-[0-3][0-9]/

export function parseResetHeader(value: string, now: number) {
  const parsed = DATE_STRING.test(value) ? Date.parse(value) : parseInt(value, 10)

  if (!isNaN(parsed)) {
    return getMillisecondDelta(parsed, now)
  }
}
