# TMI Mobile Release Notes v2.0

## Release Information
- **App Name**: The Musician's Index (TMI)
- **Version**: 2.0.0 (Build 2026.07.19)
- **App Bundle ID**: `com.themusiciansindex.app`
- **Target OS**: iOS 15.0+ | Android 8.0+ (API Level 26+)
- **Framework**: Capacitor 6.0 Native Shell with WebRTC & PBR Shader Runtime

---

## What's New in Version 2.0.0

### 1. Photorealistic 3D Venue Engine
- Real-time PBR material rendering for seating, walls, and stage floors.
- Global Illumination reflection probes capturing dynamic room colors.
- Seated 3D audience zones with spatial voice chat and mic lip-sync.

### 2. Star-Field Hyperspace Venue Travel
- Floating Venue Swipe Panel for instant horizontal room discovery.
- Atomic seat reservation locks with hyper-speed star-field warp animation.
- Zero duplicate ghost avatar presence on room transition.

### 3. Flight Deck OS Navigation & Mobile Session Guard
- Two-row mobile header with isolated auth/account controls preventing touch collisions.
- Session persistence (`tmi_session_id` 7-day maxAge) preventing login redirect loops during cellular/Wi-Fi network switches.

### 4. Group Avatar Video-Chat Canister
- Controlled lower slot swap wrapper mounted beneath live broadcast monitors.
- Opening group chat preserves main video playback state without reflowing layout.

---

## Production Configuration
```typescript
// capacitor.config.ts
export default {
  appId: 'com.themusiciansindex.app',
  appName: "The Musician's Index",
  webDir: 'public',
  server: {
    url: 'https://themusiciansindex.com',
    cleartext: false,
  },
};
```
