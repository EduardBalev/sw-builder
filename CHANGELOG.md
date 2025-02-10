# Changelog

All notable changes to this project will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [1.0.1] - 2024-03-19

### Fixed
- Fixed module bundling issues in output service worker file
- Removed CommonJS/require statements from compiled service worker
- Fixed SW global object initialization

### Changed
- Simplified build process to output pure browser code
- Improved handling of imports and exports
- Enhanced documentation with comprehensive JSDoc comments
- Changed build output to use direct TypeScript transformation

### Added
- Added proper initialization of SW and CONFIG globals
- Added automatic inlining of dependencies
- Added better error handling for imports

## [1.0.0] - 2024-03-18

### Added
- Initial release
- Basic service worker building functionality
- TypeScript support
- Watch mode for development
- Configuration system
- Event handler registration
- Demo project 