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
npm install sw-builder --save-dev
```

## Quick Start

1. Create a configuration file (e.g., `sw-config.ts`):

```typescript
import { SwSetupConfig } from 'sw-builder';

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
import type { InstallHandler, ActivateHandler, FetchHandler } from 'sw-builder';
import { SW } from 'sw-builder';

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
- `onActivate`: Called when the service worker is activating
- `onFetch`: Called for fetch events
- `onMessage`: Called for message events
- `onPush`: Called for push notifications
- `onSync`: Called for background sync
- `onNotificationClick`: Called when notifications are clicked
- `onNotificationClose`: Called when notifications are closed
- `onBackgroundFetchSuccess`: Called on successful background fetch
- `onBackgroundFetchFail`: Called on failed background fetch
- `onBackgroundFetchAbort`: Called when background fetch is aborted

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
import { SW } from 'sw-builder';

SW.skipWaiting();
SW.clients.claim();
// ... other ServiceWorkerGlobalScope methods
```

### Event Handlers

Event handlers must be exported to be included in the final service worker:
All event handlers are properly typed:

```typescript
import type { FetchHandler } from 'sw-builder';

export const onFetch: FetchHandler = (event) => {
  // event is properly typed as FetchEvent
};
```

## Development

To run the demo:

```bash
# Build the demo service worker
npm run build:demo

# Serve the demo page
npm run serve:demo
```

## License

MIT

## Contributing

Contributions are welcome! Please feel free to submit a Pull Request.
