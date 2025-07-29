const Y2K_SECONDS = 946_684_800

const Y2K_MILLISECONDS = 946_684_800_000

const ONE_HOUR_SECONDS = 3_600

function isTimestampInMilliseconds(value: number) {
  return value >= Y2K_MILLISECONDS
}

function isTimestampInSeconds(value: number) {
  return value >= Y2K_SECONDS && value < Y2K_MILLISECONDS
}

function isDeltaMilliseconds(value: number) {
  return value >= ONE_HOUR_SECONDS && value < Y2K_SECONDS
}

function isDeltaSeconds(value: number) {
  return value < ONE_HOUR_SECONDS
}

export function getMillisecondDelta(value: number, now: number) {
  if (isTimestampInMilliseconds(value)) {
    return value - now
  }

  if (isTimestampInSeconds(value)) {
    return value * 1000 - now
  }

  if (isDeltaMilliseconds(value)) {
    return value
  }

  if (isDeltaSeconds(value)) {
    return value * 1000
  }
}
