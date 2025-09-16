import AsyncStorage from "@react-native-async-storage/async-storage";
import type { Style }from '@/types/common'

const styleKey = (userId: string)=> `prefs:${userId}:style`;

export async function saveStyle(userId: string, style: Style) {
    await AsyncStorage.setItem(styleKey(userId), style);
}

export async function loadStyle(userId: string): Promise<Style | null> {
    const v = await AsyncStorage.getItem(styleKey(userId));
    return (v as Style) ?? null;
}

export async function clearStyle(userId: string) {
    await AsyncStorage.removeItem(styleKey(userId));
}