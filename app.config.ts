import type { ExpoConfig } from "expo/config";

function requiredEnv(name: string) : string {
  const value = process.env[name];
  return value ?? "";
}

const isDev = process.env.EXPO_PUBLIC_CHANNEL == "dev";

export default (): ExpoConfig => ({
  name: isDev ? "BoxXP+ Dev" : "BoxXP+",

  slug: "boxxp",
  scheme: "boxxp",
  owner: "dominickbioc",
  platforms: ["ios"],

  version: "1.0.2",

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

    bundleIdentifier: isDev
      ? "com.dominickbioc.boxxp.dev"
      : "com.dominickbioc.boxxp",

    ...(isDev ? { buildNumber: "1" } : {}),

    usesAppleSignIn: true,

    infoPlist: {
      CFBundleDisplayName: isDev ? "BoxXP+ Dev" : "BoxXP+",
      ITSAppUsesNonExemptEncryption: false,
      UIBackgroundModes: ["audio"]
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
      projectId:  "76c6e858-658e-4a4e-9d3e-15a972307f8f",
    },
  },
});