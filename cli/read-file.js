const path = require("path");

/**
 * Reads a configuration file of various types and returns its contents.
 * Supports .js and .ts file types.
 *
 * @param {string} configPath - The path to the configuration file.
 * @returns {object} - The parsed configuration object.
 */
function readConfigFile(configPath) {
  const ext = path.extname(configPath);

  try {
    switch (ext) {
      case ".js":
        return readJavaScriptConfig(configPath);
      case ".ts":
        return readTypeScriptConfig(configPath);
      default:
        throw new Error(
          "Unsupported config file extension. Supported types: .js, .ts",
        );
    }
  } catch (error) {
    console.error("Error reading configuration file:", error);
    process.exit(1);
  }
}

/**
 * Reads a JavaScript configuration file.
 *
 * @param {string} configPath - The path to the .js config file.
 * @returns {object} - The parsed configuration object.
 */
function readJavaScriptConfig(configPath) {
  delete require.cache[require.resolve(configPath)]; // Clear cache to allow fresh read
  return require(configPath).default || require(configPath);
}

/**
 * Reads a TypeScript configuration file using ts-node.
 *
 * @param {string} configPath - The path to the .ts config file.
 * @returns {object} - The parsed configuration object.
 */
function readTypeScriptConfig(configPath) {
  require("ts-node").register(); // Enable TypeScript support at runtime
  delete require.cache[require.resolve(configPath)];
  return require(configPath).default || require(configPath);
}

module.exports = { readConfigFile };
