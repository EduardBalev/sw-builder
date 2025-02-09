import { SwSetupConfig } from 'sw-builder';
import path from 'path';

const config: SwSetupConfig = {
  target: path.resolve(__dirname, './service-worker.js'),
  sourcePath: path.resolve(__dirname, './demo-source.ts'),
  minify: false,
  sourcemap: true,
  debug: true,
};
export default config;
