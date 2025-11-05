# 🥊 Box XP Plus

**Box XP Plus** is a full-featured boxing training companion built with **Expo SDK 54** and **React 19**.  
It guides athletes from **sign-in** to **skill libraries**, **drag-and-drop combo building**, and **interval timing** — all within a cohesive, polished UI.

Soon to be deployed on the official Apple **App Store** for **iOS**.

---

## 🚀 Features

### 🧭 End-to-End Training Flow
- Secure **authentication** and **session handling** via Supabase (or offline mocks).
- Curated **Skill Library** for storing and tagging training techniques.
- **Combo Builder** with drag-and-drop editing and linked-list sequencing.
- Integrated **Interval Timer** that plays bells and clacks during active sessions.

### 🎨 Modern, Polished UI
- Built on **React Native + Expo** with **TypeScript 5.9**.
- Smooth navigation via **React Navigation 7** and motion powered by **Reanimated**.
- Global design system: colors, typography, and haptics in `/src/theme/`.
- Custom modals, timeline previews, adaptive theming, and saved user preferences.

### 🧩 Data & Architecture
- **Repo Provider Pattern** — hot-swap between Supabase and mock data layers.
- **Auth Provider** — secure token management with automatic persistence.
- **AsyncStorage** caching for offline continuity.
- **Zod** validation and strong TypeScript typing for domain safety.

### 🔔 Audio & Timing Feedback
  - Foreground playback powered by **expo-audio** with haptic feedback for realism.
- Intelligent phase syncing ensures timer recovery on app resume.

---

## 🏗️ Tech Stack

| Layer | Tools |
|-------|-------|
| **Core** | React 19 • Expo SDK 54 • TypeScript 5.9 |
| **Navigation** | React Navigation v7 |
| **State & Animation** | Zustand • Reanimated |
| **Backend** | Supabase (Auth + Storage) |
| **Audio & Haptics** | Expo Audio - Expo Haptics |
| **Persistence** | AsyncStorage |
| **Validation & Testing** | Zod • Jest |
| **Design System** | Custom fonts, icons, and colors in `/src/theme/` |

---

## Environment Setup
- Duplicate `.env.example` as `.env` and populate `EXPO_PUBLIC_SUPABASE_URL`, `EXPO_PUBLIC_SUPABASE_ANON_KEY`, `EXPO_PUBLIC_USE_SUPABASE`, and `IOS_BUILD_NUMBER` for local runs.
- When building with EAS, set the same variables as project-scoped secrets, for example:
  - `eas secret:create --scope project --name EXPO_PUBLIC_SUPABASE_URL --value https://your-project.supabase.co`
  - `eas secret:create --scope project --name EXPO_PUBLIC_SUPABASE_ANON_KEY --value <anon-key>`
  - `eas secret:create --scope project --name EXPO_PUBLIC_USE_SUPABASE --value true`
  - `eas secret:create --scope project --name IOS_BUILD_NUMBER --value 1.0.0`
- Expo automatically exposes variables prefixed with `EXPO_PUBLIC_` at runtime; update them per environment before creating a build.
