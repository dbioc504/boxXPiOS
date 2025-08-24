// ... existing code ...

const { getDefaultConfig } = require("@expo/metro-config");

module.exports = (async () => {
    const defaultConfig = await getDefaultConfig(__dirname);

    // Ensure svg is treated as a React component
    defaultConfig.resolver.sourceExts.push("svg");
    const assetExts = defaultConfig.resolver.assetExts;
    defaultConfig.resolver.assetExts = assetExts.filter((ext) => ext !== "svg");
    defaultConfig.resolver.assetExts.push("png", "jpg", "jpeg"); // keep other assets

    // Use react-native-svg-transformer for svg files
    defaultConfig.transformer.babelTransformerPath = require.resolve("react-native-svg-transformer");

    return defaultConfig;
})();