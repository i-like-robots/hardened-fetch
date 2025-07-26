export function findHeader(headers: Headers, names: string[]): string | void {
  for (const name of names) {
    const value = headers.get(name)
    if (value) return value
  }
}
