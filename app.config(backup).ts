import type { ExpoConfig } from "expo/config";

function requiredEnv(name: string): string {
    const value = process.env[name];
    // if (!value) {
    //   throw new Error(`Missing environment variable ${name}. Update your EAS secrets or local .env file.`);
    // }
    return value;
}

const config: ExpoConfig = {
    name: "Boxxp",
    slug: "boxxp",
    scheme: "boxxp",
    owner: "dominickbioc",
    platforms: ["ios"],
    version: "1.0.0",
    orientation: "portrait",
    icon: "./assets/appStoreLogo1.png",
    userInterfaceStyle: "dark",
    newArchEnabled: true,
    splash: {
        image: "./assets/appStoreSplash.png",
        resizeMode: "contain",
        backgroundColor: "#120B17",
    },
    assetBundlePatterns: ["assets/sounds/*", "assets/fonts/*", "assets/*"],
    ios: {
        supportsTablet: true,
        bundleIdentifier: "com.dominickbioc.boxxp",
        usesAppleSignIn: true,
        infoPlist: {
            CFBundleDisplayName: "BoxXP+",
            ITSAppUsesNonExemptEncryption: false,
        },
    },
    web: {
        favicon: "./assets/favicon.png",
    },
    plugins: [
        "expo-font",
        "expo-build-properties",
        "expo-apple-authentication",
        "expo-audio",
        "expo-web-browser",
        "expo-asset"
    ],
    extra: {
        EXPO_PUBLIC_SUPABASE_URL: requiredEnv("EXPO_PUBLIC_SUPABASE_URL"),
        EXPO_PUBLIC_SUPABASE_ANON_KEY: requiredEnv("EXPO_PUBLIC_SUPABASE_ANON_KEY"),
        eas: {
            projectId: "76c6e858-658e-4a4e-9d3e-15a972307f8f",
        },
    },
};

export default config;
