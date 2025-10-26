export function joinBaseUrl(path: string, baseUrl?: string): string {
  if (path.startsWith('http') || typeof baseUrl !== 'string') {
    return path
  }

  return [baseUrl, path].map((part) => part.replace(/^\/|\/$/, '')).join('/')
}
