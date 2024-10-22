# Caching Strategies for Service Workers

This NPM package provides a flexible caching solution for service workers, supporting both API and static resource caching. It includes two main caching strategies, APICacheStrategy and StaticCacheStrategy, that allow for efficient caching of resources using customizable patterns and configurations.

## Features

- __API and Static Caching Strategies__: Separate strategies for handling API requests and static resources, each with customizable caching behavior.
- __Flexible Configuration__: Support for configuring cache patterns, exclusion rules, and cache strategies via an extensible `SWConfig`.
- __Cache Management__: Includes functionality to handle cache expiration, update cache entries, and clear caches when necessary.
- __Modular Design__: Both `APICacheStrategy` and `StaticCacheStrategy` are implemented as classes, providing clean, maintainable, and reusable code.
- __Detailed Logging__: Logging integrated into the package for better debugging and monitoring of cache behavior.

## Installation

Install the package via NPM:

```bash
npm install caching-strategies-service-worker
```

## Usage

--

### Configuration Properties

- `CACHE_NAME_API`: The name of the cache for API requests.
- `CACHE_NAME_STATIC`: The name of the cache for static resources.
- `CACHE_IGNORE_NAME`: The request header name used to determine if a request should be ignored.
- `CACHE_HEADER_NAME`: The request header name used to specify a custom cache name.
- `DISABLE_STATIC_CACHE`: Boolean flag to disable static caching.
- `DISABLE_DYNAMIC_CACHE`: Boolean flag to disable dynamic (API) caching.
- `STATIC_RESOURCE_PATTERN`: An array of patterns (string or RegExp) to match URLs of static resources for caching.
- `EXCLUDE_PATTERNS`: An array of patterns (string or RegExp) to exclude specific URLs from caching.
- `API_PATTERNS`: An array of patterns (string or RegExp) to identify API requests for dynamic caching.


## License

This project is licensed under the [MIT License](https://en.wikipedia.org/wiki/MIT_License) - see the LICENSE file for details.

## Contributing

Contributions are welcome! If you have suggestions for improvements or find bugs, please open an issue or submit a pull request.

- Fork the repository.
- Create your feature branch: `git checkout -b feature/AmazingFeature`
- Commit your changes: `git commit -m 'Add some amazing feature'`
- Push to the branch: `git push origin feature/AmazingFeature`
- Open a pull request.

Thank you for considering contributing to this project!
