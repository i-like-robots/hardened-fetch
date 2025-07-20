export class NetworkError extends Error {
  code: string

  constructor(error: Error, code: string) {
    super(`Network error: ${error.message}`)
    this.name = 'NetworkError'
    this.code = code
  }
}

export class HTTPError extends Error {
  code: number
  request: Request
  response: Response

  constructor(request: Request, response: Response) {
    super(`HTTP error: ${response.status} (${response.statusText})`)
    this.name = 'HTTPError'
    this.code = response.status
    this.request = request
    this.response = response
  }
}
