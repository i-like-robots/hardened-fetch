# Changelog

## v2.0.0

- Node v20 is now the minimum supported version
- Remove `.paginatedFetch()` method as there are too many variants to reasonably support
- Renamed `doNotRetry` option to `doNotRetryCodes` to differentiate from new options
- Added support for `doNotRetryMethods` to skip retrying specific request methods
- Added support for abort signal/s passed via `.fetch()` options 
- Added support for retrying some, possibly temporary, network errors
- Switched `bottleneck` dependency to `simple-rate-limited-queue` as bottleneck is not maintained
- Refactored options to support `simple-rate-limited-queue`

## v1.2.3

- Refactored URL joining to allow path on `baseUrl` option

## v1.2.2

- Reduced number of external dependencies
- Refactored URL joining to use native URL constructor

## v1.2.1

- Fixed max retries not being applied to timeout errors

## v1.2.0

- Added support for retrying requests which timeout
- Increased default request timeout for 9 seconds to 30 seconds

## v1.1.1

- Switched `url-join` dependency to `proper-url-join` for CommonJS compatibility

## v1.1.0

- Added `baseUrl` and `defaultHeaders` options
- Fixed CommonJS/ESM default export type definition incompatibility

## v1.0.0

- Initial release
