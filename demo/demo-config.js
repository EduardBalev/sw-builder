const path = require('path');

module.exports = {
  target: path.resolve(__dirname, './service-worker.js'),
  sourcePath: path.resolve(__dirname, './demo-source.ts'),
  minify: false,
  sourcemap: true,
  debug: true,
};
