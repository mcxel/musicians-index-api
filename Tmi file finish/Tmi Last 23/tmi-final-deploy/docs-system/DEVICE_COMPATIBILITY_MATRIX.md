# DEVICE_COMPATIBILITY_MATRIX.md
## Every Device, Every Browser, Every OS — Compatibility Matrix
### BerntoutGlobal XXL / The Musician's Index

---

## BROWSER SUPPORT MATRIX

| Browser | Min Version | Support Level | Notes |
|---|---|---|---|
| Chrome | 100+ | ✅ Full | Primary target |
| Safari | 15+ | ✅ Full | iOS requires specific audio handling |
| Firefox | 100+ | ✅ Full | |
| Edge | 100+ | ✅ Full | |
| Samsung Internet | 19+ | ✅ Full | |
| Chrome Android | 100+ | ✅ Full | |
| Safari iOS | 15+ | ✅ Full | Web Audio API quirks |
| Opera | 86+ | 🟡 Partial | Best effort |

---

## DEVICE SUPPORT MATRIX

| Device | Render Mode | Audio | Video | WebSocket | Status |
|---|---|---|---|---|---|
| Desktop Chrome | Full | ✅ | ✅ | ✅ | Primary |
| Desktop Safari | Full | ✅ (user gesture req) | ✅ | ✅ | Primary |
| iPhone (iOS 15+) | Compact | ✅ (user gesture) | ✅ | ✅ | Primary |
| Android Phone | Compact | ✅ | ✅ | ✅ | Primary |
| iPad | Hybrid | ✅ | ✅ | ✅ | Supported |
| Android Tablet | Hybrid | ✅ | ✅ | ✅ | Supported |
| Apple TV (tvOS) | Watch | ✅ | ✅ | ✅ | Phase 2 |
| Android TV | Watch | ✅ | ✅ | ✅ | Phase 2 |
| Roku | Watch | ✅ | ✅ | Limited | Phase 3 |
| Venue Screen | Display | ✅ | ✅ | Read-only | Phase 2 |

---

## iOS AUDIO REQUIREMENTS

iOS Safari requires a user gesture (tap) before any audio plays.
Implementation:
```typescript
// AudioProvider must handle iOS unlock
const unlockAudio = async () => {
  const audioContext = new AudioContext();
  await audioContext.resume();
  setAudioUnlocked(true);
};
// Call unlockAudio() on first user interaction
```

This is a platform law — audio cannot autoplay on iOS.

---

## TV NAVIGATION (D-PAD)

All TV-mode pages must support:
- D-pad navigation (arrow keys)
- Enter/Select button (Return key)
- Back button (Escape key)
- No hover-only interactions
- No small click targets (min 44×44px touch target)

---

## LOW-BANDWIDTH TARGETS

Target connectivity: 3G (1.5 Mbps minimum for audio streaming)
- Audio: 128kbps MP3 — requires ~16 KB/s = fine on 3G
- Video thumbnails: Progressive JPEG — load fast even on slow connections
- Room list: Paginated, max 8 items per load
- Full HD video preview: Requires 5+ Mbps — show poster on slower connections
