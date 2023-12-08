import parseLinkHeader from 'parse-link-header'

export function handlePagination(response: Response): string {
  const linkHeader = response.headers.get('Link')
  const links = parseLinkHeader(linkHeader)

  if (links?.next) {
    return links.next.url
  }

  return ''
}
