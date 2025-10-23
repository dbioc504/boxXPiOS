# 🥊 Box XP Plus

**Box XP Plus** is a full-featured boxing training companion built with **Expo SDK 54** and **React 19**.  
It guides athletes from **sign-in** to **skill libraries**, **drag-and-drop combo building**, and **interval timing** — all within a cohesive, polished UI.

---

## 🚀 Features

### 🧭 End-to-End Training Flow
- Secure **authentication** and **session handling** via Supabase (or offline mocks).
- Curated **Skill Library** for storing and tagging training techniques.
- **Combo Builder** with drag-and-drop editing and linked-list sequencing.
- Integrated **Interval Timer** that plays bells and clacks, both in-app and in the background.

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

### 🔔 Background Audio & Notifications
- Local notifications play short bell/clack sounds even when the app is locked.
- Time-sensitive cues scheduled through **expo-notifications**.
- In-app playback powered by **expo-audio** with haptic feedback for realism.
- Intelligent phase syncing ensures timer recovery on app resume.

### 🧠 AI-Friendly Design
- Modular structure and strong typing make the codebase approachable for AI copilots.
- Schema-driven validation enables safe code generation and refactoring.
- Built-in unit tests and type safety keep development predictable and fast.

---

## 🏗️ Tech Stack

| Layer | Tools |
|-------|-------|
| **Core** | React 19 • Expo SDK 54 • TypeScript 5.9 |
| **Navigation** | React Navigation v7 |
| **State & Animation** | Zustand • Reanimated |
| **Backend** | Supabase (Auth + Storage) |
| **Audio & Notifications** | Expo Audio • Expo Notifications • Expo Haptics |
| **Persistence** | AsyncStorage |
| **Validation & Testing** | Zod • Jest |
| **Design System** | Custom fonts, icons, and colors in `/src/theme/` |

