/// <reference lib="webworker" />

import { SwSetupConfig } from './src/config';

const config: SwSetupConfig = {
  target: 'example/service-worker.js',
  sourcePath: 'demo-source.ts',
  minify: false,
  sourcemap: false,
  debug: true,
};

export default config;
