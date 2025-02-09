import path from 'path';
import type { SwSetupConfig } from 'sw-builder';

const config: SwSetupConfig = {
  target: path.resolve(__dirname, './service-worker.js'),
  sourcePath: path.resolve(__dirname, './demo-source.ts'),
  minify: false,
  sourcemap: true,
  debug: true,
};
export default config;
