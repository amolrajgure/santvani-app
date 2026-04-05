# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Commands

### Development
```bash
npx expo start              # Start dev server (scan QR with Expo Go)
npx expo start --clear      # Start with cleared Metro cache (use after data file changes)
npx expo run:android        # Build and run on connected Android device/emulator
npx expo run:ios            # Build and run on iOS simulator
```

### EAS Cloud Builds
```bash
eas build --profile preview --platform android    # APK for internal testing
eas build --profile production --platform android # Production AAB for Play Store
eas build --profile production --platform ios     # Production IPA for App Store
eas submit --platform android                     # Submit latest build to Play Store
```
EAS project ID: `2cdc0825-9fa2-4fbb-8e44-3de76fa4e8a2`  
Android package: `com.santvani.app` | iOS bundle: `com.santvani.app`

No lint or test scripts are configured.

---

## Architecture

**State management** uses React Context + hooks only (no Redux/Zustand):
- `src/navigation/AppContext.tsx` — root provider; composes three hooks and exposes them via context
- `src/navigation/ThemeContext.tsx` — dark/light theme provider; `useTheme()` returns `{ colors, isDark, toggleTheme }`
- Screens receive hooks as **props** (not via `useAppContext` directly), injected by their stack navigator

**Navigation** is three native stacks inside a bottom tab navigator:
- `HomeStack` — Home → Browse → AbhangDetail. `Home` has `headerShown: false` (custom top bar). `Browse` has standard header.
- `FavoritesStack` — Favorites → AbhangDetail
- `UserStack` — UserAbhangs → AddAbhang → AbhangDetail
- `AbhangDetailScreen` is instantiated separately in each stack; only `UserStack` passes `useUserAbhangsHook`, enabling the delete button

**Data flow**:
- `src/data/abhangas.ts` — ~8 400 built-in abhangs (auto-generated, do not edit)
- `src/data/dnyandev_abhangas.ts` — 1 015 संत ज्ञानेश्वर abhangs (auto-generated from `dnyandev_gatha.txt`, do not edit)
- `useAbhangas` merges built-in + dnyandev + user abhangs, handles debounced search (300 ms), saint filtering, and pagination (PAGE_SIZE = 25)
- `useFavorites` and `useUserAbhangas` persist to AsyncStorage using keys in `src/constants/storage.ts`

**Theming**: All components call `useTheme()` and derive a `StyleSheet` via `useMemo(() => makeStyles(colors), [colors])`. Never use the static `src/constants/colors.ts` `COLORS` export in components — it exists only as a reference. `makeStyles(C: AppColors)` lives at the bottom of each file.

**Saints**: Defined in `src/constants/saints.ts` as a readonly tuple. The saint filter uses `Set<string>` membership checks against `item.saint`. User-added abhangs with custom saint names won't appear under built-in saint filters unless the string matches exactly.

---

## Home Screen Layout

The home screen (`src/screens/HomeScreen.tsx`) has a custom top bar (no native header) and three sections:

```
┌─────────────────────────────────┐
│ ☰   दैनिक अभंग             🔍  │  ← custom TopBar (headerShown: false)
├─────────────────────────────────┤
│  ← [ Abhang Card ][ Card ] →   │  ← horizontal snap-scroll FlatList
│     text preview...             │    cards from curated daily_abhangas.ts list
│     — Saint Name    ❤️  📤     │
├─────────────────────────────────┤
│  संत निवडा                     │
│  ┌──────────┐  ┌──────────┐    │  ← 2-column flexWrap grid
│  │ 🌼       │  │ 🪷       │    │
│  │संत तुकाराम│  │संत नामदेव│    │
│  └──────────┘  └──────────┘    │
│  ┌──────────┐  ┌──────────┐    │
│  │ 🌺       │  │ 📿       │    │
│  │संत एकनाथ │  │संत ज्ञानेश्वर│   │
│  └──────────┘  └──────────┘    │
├─────────────────────────────────┤
│  आवडते अभंग  (if favorites > 0) │  ← compact list cards
└─────────────────────────────────┘
```

- Tapping a saint card navigates to `Browse` screen with `{ saint: '...' }` param
- Tapping 🔍 navigates to `Browse` with no filter
- ☰ opens `SaintDrawer` (animated left slide-in panel)

### Daily Abhang Logic

Curated list lives in **`src/data/daily_abhangas.ts`**:
```ts
export const DAILY_ABHANG_IDS: string[] = [
  'bt-0',      // संत तुकाराम
  'bt-4079',   // संत नामदेव
  'bt-4844',   // संत एकनाथ
  'gyan-१',    // संत ज्ञानेश्वर
];
```

**How rotation works** (`src/screens/HomeScreen.tsx`):
```ts
const dayOffset = Math.floor(Date.now() / 86400000) % DAILY_ABHANG_IDS.length;
const rotated = [
  ...DAILY_ABHANG_IDS.slice(dayOffset),
  ...DAILY_ABHANG_IDS.slice(0, dayOffset),
];
return rotated.map(id => getById(id)).filter(Boolean);
```
- `Date.now() / 86400000` = days since Unix epoch
- `% DAILY_ABHANG_IDS.length` = index into the curated list, wraps after list is exhausted
- The list is rotated so today's starting abhang is first; all remaining entries follow as swipeable cards
- Changes at **midnight UTC** each day
- Adding user abhangs has **no effect** on daily picks (unlike the old logic which used total abhang count)

**To change which abhangs appear daily** — edit `src/data/daily_abhangas.ts`:
- Add more IDs to increase variety (longer list = slower rotation cycle)
- IDs come from `src/data/abhangas.ts` (`bt-*`) or `src/data/dnyandev_abhangas.ts` (`gyan-*`)
- Order matters: the list rotates in the order written, so put preferred abhangs first

### SaintDrawer (`src/components/SaintDrawer.tsx`)
Animated left-slide drawer. Lists all saints, "सर्व अभंग शोधा", and a theme toggle. Opens from the ☰ button on the home top bar. Uses `Animated.spring` on open, `Animated.timing` on close, and mounts/unmounts via `useState(mounted)` to avoid rendering off-screen.

### BrowseScreen (`src/screens/BrowseScreen.tsx`)
Full search + filter list (the old HomeScreen content). Receives an optional `saint` route param; on mount calls `filterBySaint(saint)` or `selectAllSaints()`. Resets to all saints on unmount.

---

## Adding a New Saint + Abhangs

### 1. Register the saint — `src/constants/saints.ts`
```ts
export const SAINTS = [
  'संत तुकाराम',
  'संत नामदेव',
  'संत एकनाथ',
  'संत ज्ञानेश्वर',
  'संत चोखामेळा',  // ← new
] as const;
```

### 2. Add abhang data — create `src/data/<saint>_abhangas.ts`
```ts
import type { Abhang } from '../types';
export const CHOKHA_ABHANGAS: Abhang[] = [
  { id: 'cho-1', saint: 'संत चोखामेळा', title: '१', content: '...', meaning: '', isUserAdded: false },
];
```
ID prefix must be unique across all data files (`tuk-`, `nam-`, `eka-`, `gyan-` are taken).

### 3. Merge into hook — `src/hooks/useAbhangas.ts`
```ts
import { CHOKHA_ABHANGAS } from '../data/chokha_abhangas';
// inside useMemo:
const mergedAbhangas = useMemo(
  () => [...BUILTIN_ABHANGAS, ...DNYANDEV_ABHANGAS, ...CHOKHA_ABHANGAS, ...userAbhangas],
  [userAbhangas],
);
```

### 4. Add icon — `src/components/SaintDrawer.tsx` and `src/screens/HomeScreen.tsx`
Both files have a `SAINT_ICONS` map at the top. Add an entry:
```ts
const SAINT_ICONS: Record<string, string> = {
  'संत तुकाराम': '🌼',
  'संत नामदेव': '🪷',
  'संत एकनाथ': '🌺',
  'संत ज्ञानेश्वर': '📿',
  'संत चोखामेळा': '🪘',  // ← new
};
```
The fallback is `'🙏'` if an entry is missing.

Run `npx expo start --clear` after data file changes.

---

## Changing Saint Card Icons

Icons are plain Unicode emoji strings in `SAINT_ICONS` maps in two files:
- `src/screens/HomeScreen.tsx` (home grid cards)
- `src/components/SaintDrawer.tsx` (drawer list rows)

Change the emoji value for whichever saint you want. Both maps must be kept in sync.

---

## App Icons & Splash Screen

All image assets live in `assets/`:

| File | Used for |
|---|---|
| `assets/icon.png` | iOS app icon + default |
| `assets/adaptive-icon.png` | Android adaptive icon foreground |
| `assets/splash-icon.png` | Splash screen image |
| `assets/favicon.png` | Web favicon |

Configured in `app.json`:
- Android adaptive icon background color: `#ff9800` (saffron)
- Splash background color: `#f4f4f9`
- To change splash background: edit `"backgroundColor"` under `"splash"` in `app.json`
- After replacing image files, run `npx expo start --clear`; for EAS builds the new images are picked up automatically

---

## Adding / Updating Abhangs for an Existing Saint

### Which file to edit

| Saint | Data file |
|---|---|
| संत तुकाराम, संत नामदेव, संत एकनाथ | `src/data/abhangas.ts` |
| संत ज्ञानेश्वर | `src/data/dnyandev_abhangas.ts` |
| Any new saint you added | `src/data/<saint>_abhangas.ts` |

### Abhang object format
```ts
{
  id: 'tuk-500',           // unique string — use the saint prefix + number
  saint: 'संत तुकाराम',    // must match the string in src/constants/saints.ts exactly
  title: '५००',            // abhang number (Devanagari or Arabic)
  content: 'पंढरीचा वारी...\nओवी दुसरी ॥१॥\n...', // full text, lines separated by \n
  meaning: 'अर्थ येथे...',  // Marathi meaning; use '' if unknown
  isUserAdded: false,      // always false for built-in data
}
```

### Adding a new abhang
Open the relevant data file and append to the exported array:
```ts
export const BUILTIN_ABHANGAS: Abhang[] = [
  // ... existing entries ...
  { id: 'tuk-500', saint: 'संत तुकाराम', title: '५००', content: '...', meaning: '...', isUserAdded: false },
];
```
Run `npx expo start --clear` after saving.

### Updating an existing abhang
Find the entry by `id` (use editor search) and edit `content` or `meaning` in place. The `id` and `saint` fields must not be changed — favorites and user data reference abhang IDs.

### Updating in bulk from a text file
Use a Python script similar to the one used for `dnyandev_gatha.txt`:
1. Parse the source text into a list of `{ id, title, content, meaning }` dicts
2. Write out a `.ts` file with `export const X: Abhang[] = [...]`
3. Import and merge in `src/hooks/useAbhangas.ts`

Key parsing notes from the ज्ञानेश्वर import:
- Headings are Devanagari numerals followed by optional `.` — regex: `^[०-९]+\.?\s*$`
- `अर्थ:-` marks the start of the meaning block
- Skip section-header lines matching `अभंग.*ते` (e.g. "अभंग १ ते ५०")
- IDs use the same Devanagari numeral as the title: `gyan-१`, `gyan-२`, …

---

## Adding Abhangs at Runtime (No Code Change)

Use the **"माझे"** tab → **+** button. Select "इतर" to type a custom sant name. Data is saved to AsyncStorage and merged into the search index automatically.

---

## Theme Colors

Palette defined in `src/navigation/ThemeContext.tsx` as `LIGHT_COLORS` and `DARK_COLORS`. Key tokens:

| Token | Light | Dark | Used for |
|---|---|---|---|
| `background` | `#FFF8F0` | `#1A1008` | screen backgrounds |
| `surface` | `#FFF3E0` | `#2D1A08` | cards, saint tiles |
| `primary` | `#FF9800` | `#FF9800` | accents, icons |
| `primaryDark` | `#E65100` | `#FFB74D` | headers, titles |
| `text` | `#3E2000` | `#F5E6D0` | body text |
| `textMuted` | `#8D6E63` | `#C4956A` | subtitles, counts |
| `danger` | `#D84315` | `#EF5350` | favorite heart (active) |

To add a new color token: add it to both `LIGHT_COLORS` and `DARK_COLORS` objects with the same key. `AppColors` type is derived automatically.
