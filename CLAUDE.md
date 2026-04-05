# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Commands

```bash
npx expo start          # Start dev server (scan QR with Expo Go)
npx expo run:android    # Build and run on Android device/emulator
npx expo run:ios        # Build and run on iOS simulator
```

No lint or test scripts are configured.

## Architecture

**State management** uses React Context + hooks only (no Redux/Zustand):
- `src/navigation/AppContext.tsx` — root provider; composes three hooks and exposes them via context
- `src/navigation/ThemeContext.tsx` — dark/light theme provider; `useTheme()` returns `{ colors, isDark, toggleTheme }`
- Screens receive hooks as **props** (not via `useAppContext` directly), injected by their stack navigator

**Navigation** is three native stacks inside a bottom tab navigator:
- Each stack file (`HomeStack`, `FavoritesStack`, `UserStack`) reads from `AppContext` and injects the right hook props into each screen component
- `AbhangDetailScreen` is instantiated separately in each stack so it can receive the correct `useUserAbhangsHook` (only UserStack passes it, enabling delete)

**Data flow**:
- `src/data/abhangas.ts` — ~8 400 built-in abhangs (auto-generated, do not edit)
- `useAbhangas` merges built-in + user abhangs, handles debounced search (300 ms), saint filtering, and pagination (PAGE_SIZE = 25)
- `useFavorites` and `useUserAbhangas` persist to AsyncStorage using keys in `src/constants/storage.ts`

**Theming**: All components call `useTheme()` and derive a `StyleSheet` via `useMemo(() => makeStyles(colors), [colors])`. Never use the static `src/constants/colors.ts` `COLORS` export in components — it exists only as a reference. The `makeStyles` function lives at the bottom of each file and accepts an `AppColors` argument.

**Saints**: Defined in `src/constants/saints.ts` as a readonly tuple of three values. The saint filter in `useAbhangas` uses `Set<string>` membership checks against `item.saint`; user-added abhangs with custom saints will not appear when a built-in saint filter is active unless they match exactly.

## Adding Abhangas

### At runtime (no code change)
Use the **"माझे"** tab → **+** button. Select "इतर" to type a custom sant name. Data is saved to AsyncStorage.

### As built-in data (3 file changes)

**1. `src/constants/saints.ts`** — add the new sant name to the tuple:
```ts
export const SAINTS = [
  'संत तुकाराम',
  'संत नामदेव',
  'संत एकनाथ',
  'संत ज्ञानेश्वर',  // new
] as const;
```

**2. `src/data/abhangas.ts`** — append entries using the **exact same saint string**:
```ts
{ id: 'gyan-1', saint: 'संत ज्ञानेश्वर', title: '१', content: '...', meaning: '', isUserAdded: false },
```
IDs must be unique. Existing built-in IDs use short prefixes (`tuk-`, `nam-`, `eka-`).

**3. `src/screens/HomeScreen.tsx`** — fix the hardcoded saint count:
```ts
// Before:
const filterActive = selectedSaints.size < 3;
// After:
const filterActive = selectedSaints.size < SAINTS.length;
```
Also add `import { SAINTS } from '../constants/saints';` to that file.

The filter modal, search index, and pagination pick up the new sant automatically.
