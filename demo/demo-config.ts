import { SwSetupConfig } from 'sw-builder';

const config: SwSetupConfig = {
  target: 'example/service-worker.js',
  sourcePath: 'demo-source.ts',
  minify: false,
  sourcemap: false,
  debug: true,
};

export default config;
