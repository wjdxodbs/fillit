# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

**Fillit** is a React Native/Expo app that displays yearly and goal-range progress as a GitHub-style grass grid. It includes an Android home screen widget with automatic midnight (KST) updates.

- Language: Korean (UI text and comments)
- Platform: Android & iOS (Android widget is Android-only)
- Does NOT work in Expo Go — requires a native Development Build or EAS APK

## Commands

```bash
npm start              # Start Expo dev server
npm run android        # Build & run on Android simulator/device (requires native build)
npm run ios            # Build & run on iOS simulator
npm run build:apk      # Build APK via EAS cloud (eas build --platform android --profile preview)
```

**Regenerate Android native folder after plugin changes:**
```bash
npx expo prebuild --platform android
```

**EAS setup (one-time):**
```bash
eas login
eas build:configure
```

No test runner is configured in this project.

## Architecture

### Entry Points
- [index.ts](index.ts) — Expo root; registers `widgetTaskHandler` and `WidgetConfigurationScreen`
- [App.tsx](App.tsx) — Root component; sets up bottom tab navigation (Home, Goals tabs)

### Screen Flow
- **Home tab** → [HomeScreen.tsx](src/screens/HomeScreen.tsx) — current year grass grid progress
- **Goals tab** → [DatesListScreen.tsx](src/screens/DatesListScreen.tsx) — CRUD for goal date ranges → [DateDetailScreen.tsx](src/screens/DateDetailScreen.tsx) — grass grid for a specific goal range
- Stack navigator for the Goals tab lives in [DatesStackScreen.tsx](src/navigation/DatesStackScreen.tsx)
- Tab bar is hidden on `DateDetail` screen via `getFocusedRouteNameFromRoute` in `App.tsx`
- Header separator line (1px `theme.border`) is rendered as the first child `<View>` inside each screen's root container, not via navigator props

### State Management
No Redux or Context. Goals are managed via the custom hook [useSavedDates.ts](src/hooks/useSavedDates.ts), which reads/writes an array of `SavedDate` objects to AsyncStorage under the key `saved_dates`.

```typescript
interface SavedDate {
  id: string;          // timestamp-based
  title: string;
  baseDate: string;    // YYYY-MM-DD
  targetDate: string;  // YYYY-MM-DD
}
```

Modal form state and logic for adding goals is extracted into [useGoalForm.ts](src/hooks/useGoalForm.ts) (used by DatesListScreen).

### Shared UI Components
- [StatsCard.tsx](src/components/StatsCard.tsx) — stats row (완료% / 경과 일수 / 남은 일수) + progress bar; used by both HomeScreen and DateDetailScreen
- [GoalListItem.tsx](src/components/GoalListItem.tsx) — list row with gradient progress background; used by DatesListScreen
- [SimpleCalendar.tsx](src/components/SimpleCalendar.tsx) — inline month calendar for date picking; used by DatesListScreen modal
- [WeekDateStrip.tsx](src/components/WeekDateStrip.tsx) — horizontal week strip showing today's context; used by HomeScreen
- [YearMonthHeader.tsx](src/components/YearMonthHeader.tsx) — year/month label header; used by HomeScreen

### Grass Grid Components
- [GrassGrid.tsx](src/components/GrassGrid.tsx) — shared grid renderer; accepts `rows: CellState[][]` and `cellSize`, handles all row/cell layout logic
- [YearGrassGrid.tsx](src/components/YearGrassGrid.tsx) — computes `CellState[][]` for the current year (Jan 1 → Dec 31), delegates rendering to `GrassGrid`
- [RangeGrassGrid.tsx](src/components/RangeGrassGrid.tsx) — computes `CellState[][]` for a custom date range, delegates rendering to `GrassGrid`
- [DayCell.tsx](src/components/DayCell.tsx) — individual cell; exports `CellState` type (`"empty" | "filled" | "today" | "highlight"`)
- [gridConstants.ts](src/components/gridConstants.ts) — shared cell size / gap constants

### Android Widget System
- [FillitGrassWidget.tsx](src/widgets/FillitGrassWidget.tsx) — widget UI using `react-native-android-widget` primitives (`FlexWidget`, `TextWidget`, `SvgWidget`); layout mirrors DateDetailScreen (title → stats card → grass grid)
- [widget-task-handler.tsx](src/widgets/widget-task-handler.tsx) — loads config per widget ID from AsyncStorage and renders the appropriate widget data
- [widget-config.ts](src/widgets/widget-config.ts) — `WidgetConfig` type and `widgetConfigKey(widgetId)` storage key helper
- [WidgetConfigurationScreen.tsx](src/widgets/WidgetConfigurationScreen.tsx) — settings UI shown when user adds/configures the widget

Widget supports two modes:
- `"year"` — displays current year progress
- `"date"` — displays a specific saved goal's progress

Widget click navigation uses `clickAction="OPEN_URI"` with a `fillit://` deep link. The `fillit://` scheme is registered in `AndroidManifest.xml` and persisted via `withFillitNative.js`. All widget data helpers (`getYearWidgetData`, `getSavedDateWidgetData`, `getWidgetDataForConfig`) return a `clickUrl` field that must be passed to `FillitGrassWidget`.

### Native Plugin & Midnight Auto-Update
- [plugins/withFillitNative.js](plugins/withFillitNative.js) — Expo config plugin that modifies `AndroidManifest.xml` (adds `SCHEDULE_EXACT_ALARM`, `RECEIVE_BOOT_COMPLETED` permissions and registers the broadcast receiver) and injects `scheduleNextMidnight()` into `MainApplication.onCreate`
- [plugins/templates/MidnightWidgetUpdateReceiver.kt](plugins/templates/MidnightWidgetUpdateReceiver.kt) — Kotlin broadcast receiver that fires at 00:00 KST, calls `RNWidgetJsCommunication.requestWidgetUpdate()`, and reschedules the next midnight alarm; also handles `BOOT_COMPLETED`

After running `npx expo prebuild`, the Kotlin file is copied to the Android package path and the manifest is updated automatically.

### Theme
Single dark theme defined in [src/theme.ts](src/theme.ts). Main accent color: `#00C49A`.

### Build Profiles (eas.json)
| Profile | Output | Use |
|---|---|---|
| `development` | Dev Client | Local development |
| `preview` | APK | Device installation / QA |
| `production` | AAB | Play Store submission |

## Commit Convention
Use conventional commits with Korean or English messages. Common prefixes: `feat:`, `fix:`, `chore:`. Scope examples: `feat(widget):`, `feat(android):`, `fix(widget):`.
