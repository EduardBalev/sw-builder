# SW Builder

A powerful TypeScript library that simplifies service worker development by solving common challenges:

- Eliminates runtime errors with fully type-safe event handlers and configuration
- Removes boilerplate code and complex setup typically needed for service workers
- Provides a streamlined development experience with watch mode and hot reloading
- Handles the complexity of service worker registration and lifecycle management
- Makes debugging easier with built-in debug mode and sourcemap support
- Bundles and optimizes your service worker code automatically

## Features

- 🛠 **Type-Safe Event Handlers**: Built-in TypeScript types for all service worker events
- 🔄 **Watch Mode**: Automatic rebuilding when source files change
- ⚙️ **Configurable**: Flexible configuration for build settings
- 🐛 **Debug Support**: Built-in debug mode for easier development
- 📦 **Zero Runtime Dependencies**: Only development dependencies needed

## Installation

```bash
npm install @simple_js/sw-builder --save-dev
```

## Command Line Interface

The library provides a CLI tool for easy usage:

```bash
# Using npx
npx @simple_js/sw-builder --config=<path> [options]

# Or if installed globally
npm install -g @simple_js/sw-builder
sw-builder --config=<path> [options]
```

### CLI Options

| Option | Description |
|--------|-------------|
| `--config=<path>` | Path to config file (required) |
| `--watch` | Watch mode - rebuild on changes |
| `--help` | Show help message |

### Examples

```bash
# Basic usage
wf-builder --config=sw-config.ts

# Watch mode
wf-builder --config=sw-config.ts --watch

# Show help
wf-builder --help
```

## Quick Start

1. Create a configuration file (e.g., `sw-config.ts`):

```typescript
import { SwSetupConfig } from '@simple_js/sw-builder';

const config: SwSetupConfig = {
  target: './public/service-worker.js',
  sourcePath: './src/sw-handlers.ts',
  minify: true,
  sourcemap: false,
  debug: false,
};

export default config;
```

2. Create your service worker handlers (e.g., `src/sw-handlers.ts`):

```typescript
import type { InstallHandler, ActivateHandler, FetchHandler } from '@simple_js/sw-builder';
import { SW } from '@simple_js/sw-builder';

export const onInstall: InstallHandler = (event) => {
  console.log('Service Worker installing');
  SW.skipWaiting();
};

export const onActivate: ActivateHandler = (event) => {
  console.log('Service Worker activating');
  event.waitUntil(SW.clients.claim());
};

export const onFetch: FetchHandler = (event) => {
  console.log('Handling fetch event');
};
```

3. Build your service worker:

```bash
sw-builder --config=sw-config.ts
```

Or with watch mode:

```bash
sw-builder --config=sw-config.ts --watch
```

## Configuration

The `SwSetupConfig` interface supports the following options:

| Option | Type | Description |
|--------|------|-------------|
| `target` | `string` | Output path for the built service worker |
| `sourcePath` | `string` | Path to your handlers source file |
| `minify` | `boolean` | Whether to minify the output |
| `sourcemap` | `boolean` | Whether to generate source maps |
| `debug` | `boolean` | Enable debug mode for additional logging |

## Supported Events

SW Builder supports all standard service worker events with type-safe handlers:

- `onInstall`: Called when the service worker is installing
  - Interface: `(event: ExtendableEvent) => void`

- `onActivate`: Called when the service worker is activating
  - Interface: `(event: ExtendableEvent) => void`

- `onFetch`: Called for fetch events
  - Interface: `(event: FetchEvent) => void | Promise<Response>`

- `onMessage`: Called for message events
  - Interface: `(event: ExtendableMessageEvent) => void`

- `onPush`: Called for push notifications
  - Interface: `(event: PushEvent) => void`

- `onSync`: Called for background sync
  - Interface: `(event: SyncEvent) => void`

- `onNotificationClick`: Called when notifications are clicked
  - Interface: `(event: NotificationEvent) => void`

- `onNotificationClose`: Called when notifications are closed
  - Interface: `(event: NotificationEvent) => void`

- `onBackgroundFetchSuccess`: Called on successful background fetch
  - Interface: `(event: BackgroundFetchEvent) => void`

- `onBackgroundFetchFail`: Called on failed background fetch
  - Interface: `(event: BackgroundFetchEvent) => void`

- `onBackgroundFetchAbort`: Called when background fetch is aborted
  - Interface: `(event: BackgroundFetchEvent) => void`

## Debug Mode

When debug mode is enabled (`debug: true` in config), the service worker will log:
- Event registrations
- Event triggers
- Additional debugging information

## Example Project Structure

```
your-project/
├── src/
│   └── sw-handlers.ts     # Your service worker handlers
├── public/
│   └── service-worker.js  # Built service worker
├── sw-config.ts           # SW Builder configuration
└── package.json
```

## API Reference

### SW Object

The `SW` object provides type-safe access to the ServiceWorkerGlobalScope:

```typescript
import { SW } from '@simple_js/sw-builder';

SW.skipWaiting();
SW.clients.claim();
// ... other ServiceWorkerGlobalScope methods
```

### Event Handlers

Event handlers must be exported to be included in the final service worker:
All event handlers are properly typed:

```typescript
import type { FetchHandler } from '@simple_js/sw-builder';

export const onFetch: FetchHandler = (event) => {
  // event is properly typed as FetchEvent
};
```

## Development

The project includes several npm scripts for development:

```bash
# Development mode (uses source TypeScript files)
npm run dev         # Runs the builder in watch mode using TypeScript source
npm run serve       # Starts the demo server

# Combined development
npm run demo        # Runs both dev and serve in parallel

# Production mode (uses built JavaScript files)
npm run build       # Builds the library
npm run start       # Runs the built version in watch mode
```

### Development vs Production Scripts

- Development scripts (`dev`, `serve`, `demo`):
  - Run directly from TypeScript source
  - Better for development with source maps
  - Faster feedback cycle
  - Used when developing the library

- Production scripts (`build`, `start`):
  - Use the built JavaScript files
  - Test the actual published package behavior
  - Used to verify the built package works correctly

## License

MIT

## Contributing

Contributions are welcome! Please feel free to submit a Pull Request.
