# Changelog

All notable changes to this project will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [1.0.8] - 2025-02-12

### Fixed
- Enhance content merger to handle circular imports and complex import scenarios

## [1.0.5-1.0.7] - 2025-02-11

### Fixed
- Fixed import handling in content merger (#4)

## [1.0.4] - 2025-02-11

### Fixed
- Fixed error handling in watch mode to prevent process exit
- Improved error messages for missing configuration
- Fixed build process to continue on non-critical errors
- Improved test coverage for CLI functionality

### Changed
- Removed process.exit from build.ts to allow better error handling
- Refactored CLI code for better maintainability
- Updated error handling in watch mode to be more resilient

## [1.0.3] - 2025-02-11

### Fixed
- Added webworker reference to output d.ts files
- Improved TypeScript type definitions

## [1.0.2] - 2025-02-10

### Changed
- Simplified global declarations
- Improved SW and CONFIG initialization

## [1.0.1] - 2025-02-10

### Fixed
- Fixed module bundling issues in output service worker file
- Removed CommonJS/require statements from compiled service worker
- Fixed SW global object initialization

### Changed
- Simplified build process to output pure browser code
- Improved handling of imports and exports
- Changed build output to use direct TypeScript transformation

### Added
- Added proper initialization of SW and CONFIG globals
- Added automatic inlining of dependencies
- Added better error handling for imports

## [1.0.0] - 2025-02-09

### Added
- Initial release
- Basic service worker building functionality
- TypeScript support
- Watch mode for development
- Configuration system
- Event handler registration
- Demo project 