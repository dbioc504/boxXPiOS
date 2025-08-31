const { getDefaultConfig } = require("@expo/metro-config");

module.exports = (async () => {
    const defaultConfig = await getDefaultConfig(__dirname);

    // --- Force Metro to advertise your LAN IP ---
    defaultConfig.server = {
        ...defaultConfig.server,
        port: 8081, // or 8082 if Expo chooses that
        host: "192.168.1.156", // <-- replace with your actual IPv4 from ipconfig
    };

    // --- SVG support ---
    defaultConfig.resolver.sourceExts.push("svg");
    const assetExts = defaultConfig.resolver.assetExts;
    defaultConfig.resolver.assetExts = assetExts.filter((ext) => ext !== "svg");
    defaultConfig.resolver.assetExts.push("png", "jpg", "jpeg");

    defaultConfig.transformer.babelTransformerPath = require.resolve(
        "react-native-svg-transformer"
    );

    return defaultConfig;
})();
