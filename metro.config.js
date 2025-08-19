const { getDefaultConfig } = require("expo/metro-config");

module.exports = (() => {
  const defaultConfig = getDefaultConfig(__dirname);

  defaultConfig.resolver.resolverMainFields = ["sbmodern", "browser", "main"];

  return defaultConfig;
})();