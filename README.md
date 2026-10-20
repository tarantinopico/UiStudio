# ComposeStudio — Mobile-First Android Jetpack Compose UI Designer PWA

**ComposeStudio** is an offline-first Progressive Web App (PWA) built with React, TypeScript (strict), TailwindCSS, Zustand (`immer` + `persist`), and Dexie (IndexedDB). It enables developers and product designers to design Android Jetpack Compose UIs on phones and tablets via touch drag-and-drop and export compilable Kotlin `@Composable` code, high-DPI `1x`/`2x`/`3x` PNG renders, or round-trippable `.json` project files.

---

## Core Features

1. **Project Browser & Persistence**
   - Grid & list views with live device wireframe thumbnails
   - Create projects from Android device presets (Pixel 8 Pro, Compact Phone, Foldable, Pixel Tablet) or custom `dp` dimensions
   - Pin, duplicate, rename, search, sort, delete, and `.json` import/export
   - Persistent local storage in IndexedDB via Dexie with debounced autosave

2. **Interactive Touch Canvas Engine**
   - Density-independent pixel (`dp`) coordinate system
   - **Free Mode** (`Modifier.offset` / `Box`) and **Grid Mode** (snap-to-grid, adjustable step & gutter)
   - Multi-touch pinch-zoom & two-finger pan without conflicting with single-finger widget dragging
   - Smart alignment snapping to grid, sibling widgets, screen edges, and user-placed ruler guides with haptic feedback
   - Multi-select (long-press on touch or toolbar toggle), alignment & distribution toolbar, Undo/Redo history stack, and Copy/Paste/Duplicate

3. **29 Jetpack Compose-Native Widgets**
   - **Layout**: `Column`, `Row`, `Box`, `LazyColumn`, `LazyRow`, `ConstraintLayout`, `Spacer`, `Scaffold`
   - **Core & Inputs**: `Text`, `Button`, `IconButton`, `Icon`, `Image`, `TextField`, `Switch`, `Checkbox`, `RadioButton`, `Slider`
   - **Surfaces & Display**: `Card`, `Surface`, `Divider`, `Chip`, `Badge`
   - **Navigation & Bars**: `TopAppBar`, `BottomNavigationBar`, `NavigationRail`, `FAB`, `TabRow`
   - **Progress & Custom**: `LinearProgressIndicator`, `CircularProgressIndicator`, `CustomPlaceholder`

4. **Simple Mode vs. Pro Mode**
   - **Simple Mode**: Essential Material 3 widget palette, streamlined inspector, and one-tap **Auto-Layout** converter
   - **Pro Mode**: Full 29-widget catalog, horizontal/vertical `dp` rulers, interactive guides, container nesting, and exact hex/modifier controls

5. **Kotlin Compose Codegen & High-DPI PNG Export**
   - Emits complete `.kt` files with `@Composable` functions, Material 3/M2 imports, `remember { mutableStateOf(...) }` state holders, and `@Preview` annotations
   - Rasterizes `1x`, `2x`, and `3x` PNG renders with Web Share API support

---

## Setup & Development

```bash
# 1. Install dependencies
npm install

# 2. Run unit tests (Codegen, Grid Math, Store Reducers)
node --test src/**/*.test.ts

# 3. Start local development server on port 3000
npm run dev

# 4. Type-check and build production bundle
npm run lint
npm run build
```

---

## Deploying to Vercel / Cloud Run

1. Push the repository to GitHub/GitLab.
2. Import the project in **Vercel** (Framework Preset: **Vite**).
3. Build command: `npm run build` · Output directory: `dist`.
4. `vite-plugin-pwa` automatically generates the Service Worker (`sw.js`) and `manifest.webmanifest` during build.

---

## Installing as a Mobile PWA

- **Android (Chrome / Edge)**: Open ComposeStudio and tap **Install App** in Settings or the browser prompt to install to your home screen with full offline support.
- **iOS / iPadOS (Safari)**: Tap the **Share** button in Safari and select **Add to Home Screen**.
