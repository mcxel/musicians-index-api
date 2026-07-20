# Google Play Store Submission Checklist (Android)

## 1. App Identity & Store Listing
- [ ] **App Name**: The Musician's Index
- [ ] **Short Description** (80 chars): Global 3D live music venues, performance cyphers, and fan avatar lobbies.
- [ ] **Full Description**: The Musician's Index (TMI) is the premiere 3D broadcast ecosystem connecting independent performers, beat producers, and fans. Watch live concerts, travel through hyperspace venues, sit in 3D audience seating, and socialize in real-time.
- [ ] **App Icon**: 512×512 px PNG (32-bit with alpha).
- [ ] **Feature Graphic**: 1024×500 px JPG or 24-bit PNG.
- [ ] **Phone Screenshots**: Minimum 2 screenshots (16:9 or 9:16 aspect ratio).
- [ ] **7-Inch & 10-Inch Tablet Screenshots**: Minimum 1 screenshot each.

## 2. Technical & Signing Verification
- [ ] **Package Name**: `com.themusiciansindex.app`
- [ ] **Release Format**: Android App Bundle (`.aab`) signed with release keystore.
- [ ] **Target API Level**: Android 14 (API level 34) or higher.
- [ ] **Permissions**: Camera (`android.permission.CAMERA`), Microphone (`android.permission.RECORD_AUDIO`), Internet (`android.permission.INTERNET`).
- [ ] **Android TV Support**: Declared `android.hardware.touchscreen` required=false and `android.intent.category.LEANBACK_LAUNCHER`.
- [ ] **Android TV Remote Testing**: D-pad navigation verified for TV remote (Up/Down/Left/Right/Select/Back).

## 3. Privacy & Compliance
- [ ] **Privacy Policy URL**: `https://themusiciansindex.com/privacy`
- [ ] **Data Safety Form**: Declare collection of email, display name, and in-app purchase history.
- [ ] **App Content Rating**: Complete IARC content rating questionnaire.
- [ ] **Target Audience**: 13+ (Teens & Adults).
- [ ] **AdSense / App-Ads**: Verify `app-ads.txt` is present at `https://themusiciansindex.com/app-ads.txt`.
