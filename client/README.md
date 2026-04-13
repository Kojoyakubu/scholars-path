# Scholars Path Client (Web + Mobile)

This client remains a standard React + Vite web app and now also supports native Android and iOS builds using Capacitor.

## What Changed

- Added Capacitor config in `capacitor.config.json`
- Added native platform folders:
  - `android/`
  - `ios/`
- Added npm scripts for build/sync/open mobile projects

Your website still works normally with the same Vite commands.

## Web Workflow

Install dependencies:

```bash
npm install
```

Run web dev server:

```bash
npm run dev
```

Build web app:

```bash
npm run build
```

## Mobile Workflow (Capacitor)

Build web assets and sync to native projects:

```bash
npm run build:mobile
```

Sync native projects without rebuilding web:

```bash
npm run cap:sync
```

Copy web assets only:

```bash
npm run cap:copy
```

Open Android project in Android Studio:

```bash
npm run cap:open:android
```

Open iOS project in Xcode:

```bash
npm run cap:open:ios
```

Run on Android device/emulator from CLI:

```bash
npm run cap:run:android
```

## Notes for iOS

- You can keep the `ios/` project folder in git on any OS.
- Building/running iOS requires macOS + Xcode.
- On a Mac, run:

```bash
npm install
npm run build:mobile
npm run cap:open:ios
```

## API Base URL for Mobile

Your app already uses:

- `VITE_API_URL` when provided
- fallback: `https://scholars-path-backend.onrender.com`

For production mobile builds, keep an HTTPS backend URL. Avoid localhost for device builds unless you specifically configure a reachable LAN URL.
