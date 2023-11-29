export function isRateLimited(headers: Headers): boolean {
  const remaining = parseInt(headers.get('X-Rate-Limit-Remaining'), 10)
  return remaining === 0
}

export function getRateLimitWait(headers: Headers): number {
  const rateLimitReset = headers.get('X-Rate-Limit-Reset') // UTC epoch time
  const responseDate = headers.get('Date')

  // Add extra 1 second to account for sub second differences
  return parseInt(rateLimitReset, 10) * 1000 - new Date(responseDate).getTime() + 1000
}
