const { getDefaultConfig } = require('expo/metro-config');

const config = getDefaultConfig(__dirname);

const { transformer, resolver } = config;

config.transformer = {
  ...transformer,
  babelTransformerPath: require.resolve("react-native-svg-transformer"),
  assetPlugins: ['expo-asset/tools/hashAssetFiles'],
};

config.resolver = {
  ...resolver,
  assetExts: resolver.assetExts.filter((ext) => ext !== "svg"),
  sourceExts: [...resolver.sourceExts, "svg"],
};

if (config.watcher) {
  delete config.watcher.unstable_lazySha1;
  delete config.watcher.unstable_autoSaveCache;
}

module.exports = config;
