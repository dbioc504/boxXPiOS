// lib/supabase.ts
import "react-native-url-polyfill/auto";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { createClient } from "@supabase/supabase-js";
import Constants from "expo-constants";

function getExtra() {
    const expoConfig = Constants.expoConfig ?? null;
    const manifestExtra = (Constants.manifest as any)?.extra ?? null;
    return expoConfig?.extra ?? manifestExtra ?? {};
}

const extra = getExtra();

const supabaseUrl = extra?.EXPO_PUBLIC_SUPABASE_URL as string | undefined;
const supabaseAnonKey = extra?.EXPO_PUBLIC_SUPABASE_ANON_KEY as string | undefined;

if (!supabaseUrl || !supabaseAnonKey) {
    throw new Error("Supabase configuration missing. Ensure EXPO_PUBLIC_SUPABASE_URL and EXPO_PUBLIC_SUPABASE_ANON_KEY are set via .env or EAS secrets.");
}

export const supabase = createClient(supabaseUrl, supabaseAnonKey, {
    auth: {
        storage: AsyncStorage,
        persistSession: true,
        autoRefreshToken: true,
        detectSessionInUrl: false,
    },
});
