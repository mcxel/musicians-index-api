# TMI Native Mobile Developer Build Guide (For Justin)

## Overview
This guide provides complete instructions for Justin to compile, sign, and submit **The Musician's Index (TMI)** native mobile apps to the **Google Play Store (Android)** and **Apple App Store (iOS)**.

---

## 1. Environment & Prerequisites

- **Node.js**: v18.x or v20.x
- **Package Manager**: pnpm (`pnpm install`)
- **Android**: Android Studio Hedgehog (2023.1.1+) or JDK 17
- **iOS**: macOS Sonoma + Xcode 15.0+ (requires active Apple Developer Account)

---

## 2. Native Project Synchronization

1. Unzip `TMI-Mobile-Handoff-v2.0.zip`.
2. Open terminal in the `apps/web` root directory:
   ```bash
   pnpm install
   pnpm run build
   npx cap sync
   ```

---

## 3. Google Play Store & Android TV Build Instructions

### Android TV Manifest & Remote Control Support
- **Touchscreen Not Required**: `<uses-feature android:name="android.hardware.touchscreen" android:required="false" />`
- **Leanback Launcher**: Enables TMI app icon on Android TV home screen grids (`android.intent.category.LEANBACK_LAUNCHER`).
- **D-Pad Remote Control Navigation**: Full support for D-pad directional keys (Up, Down, Left, Right, Select, Back).

### How to Test & Side-Load on Android TV
1. Build debug/release APK in Android Studio or via CLI:
   ```bash
   npx cap copy android
   cd android && ./gradlew assembleDebug
   ```
   *Output APK*: `android/app/build/outputs/apk/debug/app-debug.apk`
2. **Install to Android TV via ADB (Wi-Fi or USB)**:
   - On Android TV: Go to **Settings > Device Preferences > About**, tap **Build** 7 times to enable Developer Options.
   - Turn on **Network Debugging** (note IP address, e.g. `192.168.1.150:5555`).
   - Connect from your computer:
     ```bash
     adb connect 192.168.1.150:5555
     adb install android/app/build/outputs/apk/debug/app-debug.apk
     ```
3. **Alternatively (USB Flash Drive)**:
   - Copy `app-release.apk` to a USB flash drive.
   - Plug into Android TV and install via "File Commander" or "AnDi" installer app.

---

## 4. Apple App Store Submission (iOS)

1. Open Xcode on macOS:
   ```bash
   npx cap open ios
   ```
2. In Xcode:
   - Select **App target > Signing & Capabilities**.
   - Select **Team** (BerntoutGlobal Media Inc.).
   - Set Scheme to **Any iOS Device (arm64)**.
   - Select **Product > Archive**.
   - When build finishes, click **Distribute App > App Store Connect > Upload**.
3. Open [App Store Connect](https://appstoreconnect.apple.com):
   - Select the uploaded build.
   - Complete the [APPLE_APP_STORE_CHECKLIST.md](file:///c:/Users/Admin/Documents/BerntoutGlobal%20XXL/tmi-platform/APPLE_APP_STORE_CHECKLIST.md).
   - Enter demo review credentials (`terry@themusiciansindex.com` / `jerome@themusiciansindex.com`).
