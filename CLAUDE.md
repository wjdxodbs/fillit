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
- [App.tsx](App.tsx) — Root component; only wraps `SafeAreaProvider` + `AppContent`
- [src/AppContent.tsx](src/AppContent.tsx) — Initializes notifications, triggers widget update on mount, builds `NavigationContainer` theme from `useTheme`, renders `RootTabNavigator`
- [src/navigation/RootTabNavigator.tsx](src/navigation/RootTabNavigator.tsx) — Bottom tab navigator + `linking` config for `fillit://` deep links; tab bar hidden on `DateDetail` via `getFocusedRouteNameFromRoute`

### Screen Flow
- **Home tab** → [HomeScreen.tsx](src/screens/HomeScreen.tsx) — current year grass grid progress
- **Goals tab** → [DatesListScreen.tsx](src/screens/DatesListScreen.tsx) — CRUD for goal date ranges → [DateDetailScreen.tsx](src/screens/DateDetailScreen.tsx) — grass grid for a specific goal range
- Stack navigator for the Goals tab lives in [DatesStackScreen.tsx](src/navigation/DatesStackScreen.tsx)
- Header separator (1px `theme.border`) is rendered via `<ScreenSeparator />` as the first child inside each screen's root container

### State Management
No Redux or Context. Goals are managed via [useSavedDates.ts](src/hooks/useSavedDates.ts), which delegates AsyncStorage read/write to [savedDatesStorage.ts](src/utils/savedDatesStorage.ts) under the key `saved_dates`. Exposes `add`, `update`, `remove`.

```typescript
interface SavedDate {
  id: string;          // timestamp-based
  title: string;
  baseDate: string;    // YYYY-MM-DD
  targetDate: string;  // YYYY-MM-DD
}
```

`savedDatesStorage` performs a migration on load: legacy items with a single `date` field are mapped to `baseDate`/`targetDate`.

Modal form state and logic for adding/editing goals is in [hooks/goals/useGoalForm.ts](src/hooks/goals/useGoalForm.ts). Date picker state and month navigation are in [hooks/goals/useDatePickerState.ts](src/hooks/goals/useDatePickerState.ts).

### Hooks

**공통** (`src/hooks/`)
- [useTodayStr.ts](src/hooks/useTodayStr.ts) — returns `todayStr: string` (`YYYY-MM-DD`), refreshes via `useFocusEffect` on screen focus
- [useSavedDates.ts](src/hooks/useSavedDates.ts) — goal CRUD + AsyncStorage
- [useBottomSheet.ts](src/hooks/useBottomSheet.ts) — animated bottom sheet open/close state
- [useCellSize.ts](src/hooks/useCellSize.ts) — computes grass cell pixel size from screen width

**목표 도메인** (`src/hooks/goals/`)
- [useGoalProgress.ts](src/hooks/goals/useGoalProgress.ts) — derives `{ totalDays, elapsedDays, isCompleted, progressPercent }`; used by `DateDetailScreen` and `GoalListItem`
- [useGoalForm.ts](src/hooks/goals/useGoalForm.ts) — add/edit modal state, tracks `editingId`
- [useDatePickerState.ts](src/hooks/goals/useDatePickerState.ts) — picker `show/viewYear/viewMonth` + prev/next month navigation
- [useCalendarGrid.ts](src/hooks/goals/useCalendarGrid.ts) — calendar grid logic for `SimpleCalendar`; exposes `weeks`, `dateStr`, `isSelectable`, `isSelected`

### Components

**공통** (`src/components/common/`)
- [BottomSheet.tsx](src/components/common/BottomSheet.tsx) — reusable animated bottom sheet modal
- [ScreenSeparator.tsx](src/components/common/ScreenSeparator.tsx) — 1px `theme.border` separator
- [StatsCard.tsx](src/components/common/StatsCard.tsx) — stats row (완료% / 경과 일수 / 남은 일수) + progress bar; used by `HomeScreen` and `DateDetailScreen`
- [GrassGrid.tsx](src/components/common/GrassGrid.tsx) — shared grid renderer; accepts `rows: CellState[][]` and `cellSize`
- [DayCell.tsx](src/components/common/DayCell.tsx) — individual grass cell; exports `CellState` type (`"empty" | "filled" | "today" | "highlight"`)

**홈 탭** (`src/components/home/`)
- [YearGrassGrid.tsx](src/components/home/YearGrassGrid.tsx) — computes `CellState[][]` for the current year; useMemo deps are `[year, endDate]`
- [WeekDateStrip.tsx](src/components/home/WeekDateStrip.tsx) — horizontal 7-day strip showing today's context
- [YearMonthHeader.tsx](src/components/home/YearMonthHeader.tsx) — `React.memo` year/month label

**목표 탭** (`src/components/goals/`)
- [RangeGrassGrid.tsx](src/components/goals/RangeGrassGrid.tsx) — computes `CellState[][]` for a custom date range; completed goals fill all cells with `filled`
- [GoalListItem.tsx](src/components/goals/GoalListItem.tsx) — `React.memo` list row with gradient progress background; uses `useGoalProgress` and `GoalItemMenu`
- [GoalItemMenu.tsx](src/components/goals/GoalItemMenu.tsx) — bottom sheet with 수정/삭제 actions
- [AddEditGoalModal.tsx](src/components/goals/AddEditGoalModal.tsx) — modal form UI (title input + date pickers + save button)
- [SimpleCalendar.tsx](src/components/goals/SimpleCalendar.tsx) — inline month calendar; uses `useCalendarGrid`
- [SkeletonGoalList.tsx](src/components/goals/SkeletonGoalList.tsx) — skeleton loading animation

**루트** (`src/components/`)
- [ThemeSelector.tsx](src/components/ThemeSelector.tsx) — theme picker trigger + bottom sheet; used by `HomeScreen`

### Constants & Utilities

- [src/constants/gridConstants.ts](src/constants/gridConstants.ts) — `COLUMNS` (16), `CELL_GAP`, `GRID_HORIZONTAL_PADDING`, `WEEKDAYS`, `resolveCellState`
- [src/utils/dateUtils.ts](src/utils/dateUtils.ts) — all date/array helpers: `toDateStr`, `formatDate`, `formatDateRange`, `formatDateComponents`, `parseDateStr` (returns `{ year, month(0-indexed), day }`), `getDaysBetween`, `getElapsedDays`, `getDayOfYear`, `isLeapYear`, `isSameDay`, `calcProgress`, `chunkArray`

### Android Widget System
- [FillitGrassWidget.tsx](src/widgets/FillitGrassWidget.tsx) — widget UI using `react-native-android-widget` primitives
- [widgetDataHelpers.ts](src/widgets/widgetDataHelpers.ts) — `getYearWidgetData`, `getSavedDateWidgetData`, `getWidgetDataForConfig`; all return a `clickUrl` field
- [widget-task-handler.tsx](src/widgets/widget-task-handler.tsx) — exports `renderFillitWidget(data)` and `resetWidgetsForGoal(id)`; loads config and renders on widget update events
- [widget-config.ts](src/widgets/widget-config.ts) — `WidgetConfig` type, `widgetConfigKey(widgetId)`, `readWidgetConfig(widgetId)`
- [WidgetConfigurationScreen.tsx](src/widgets/WidgetConfigurationScreen.tsx) — settings UI when user adds/configures the widget
- [useWidgetConfiguration.ts](src/widgets/useWidgetConfiguration.ts) — `finishWith` logic

Widget supports two modes: `"year"` (current year progress) and `"date"` (specific saved goal).

Widget click uses `clickAction="OPEN_URI"` with `fillit://` deep links. Deep link to `DateDetail` requires `initialRouteName: "DatesList"` in the linking config (set in `RootTabNavigator`).

### Native Plugin & Midnight Auto-Update
- [plugins/withFillitNative.js](plugins/withFillitNative.js) — Expo config plugin; adds `SCHEDULE_EXACT_ALARM`, `RECEIVE_BOOT_COMPLETED` permissions and registers the broadcast receiver; injects `scheduleNextMidnight()` into `MainApplication.onCreate`
- [plugins/templates/MidnightWidgetUpdateReceiver.kt](plugins/templates/MidnightWidgetUpdateReceiver.kt) — Kotlin receiver that fires at 00:00 KST, calls `RNWidgetJsCommunication.requestWidgetUpdate()`, reschedules; also handles `BOOT_COMPLETED`

After `npx expo prebuild`, the Kotlin file is copied to the Android package path and the manifest is updated automatically.

### Theme
Dark and light themes defined in [src/theme.ts](src/theme.ts). Main accent color: `#00C49A`. `theme.danger` = `#ef4444`. Theme is managed via [src/stores/themeStore.ts](src/stores/themeStore.ts) (Zustand).

### Build Profiles (eas.json)
| Profile | Output | Use |
|---|---|---|
| `development` | Dev Client | Local development |
| `preview` | APK | Device installation / QA |
| `production` | AAB | Play Store submission |

## Code Guidelines

- Before creating a new utility, component, or hook, check if an equivalent already exists in the codebase.
- Always use `useTodayStr()` instead of `new Date()` directly in components — it refreshes on screen focus and keeps date state consistent across screens.
- `parseDateStr(str)` returns `month` as **0-indexed**. Pass it directly to `new Date(year, month, day)` without subtracting 1.
- Do not add `useMemo`, `useCallback`, or `React.memo` preemptively. Use them only when there is a clear reason: expensive computation, stable reference required by a memoized child, or a list item rendered by `FlatList`.
- Notification scheduling is handled automatically inside `useSavedDates` (`add` → scheduleGoalReminder, `update` → reschedule, `remove` → cancel). Do not call notification functions directly from screens or components.

## Commit Convention
Use conventional commits with Korean or English messages. Common prefixes: `feat:`, `fix:`, `chore:`. Scope examples: `feat(widget):`, `feat(android):`, `fix(widget):`.
