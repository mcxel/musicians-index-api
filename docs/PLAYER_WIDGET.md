# PLAYER WIDGET SPECIFICATION

## Overview

The Player Widget is the primary video/media player component used across the BerntoutGlobal XXL platform. It supports live streams, VOD, and interactive media experiences.

---

## Widget Modes

### 1. Live Mode
- Real-time streaming playback
- Latency indicator
- Live badge overlay
- Viewer count display
- Quality selector (auto, 1080p, 720p, 480p, 360p)
- Fullscreen toggle

### 2. VOD Mode
- On-demand playback
- Progress bar with thumbnails
- Chapter markers
- Resume from last position
- Playback speed (0.5x, 1x, 1.25x, 1.5x, 2x)

### 3. Interactive Mode
- Real-time reactions overlay
- Emote carousel integration
- Tip jar integration
- Poll overlays
- Chat integration (sidebar/embedded)

---

## Widget States

| State | Visual | Behavior |
|-------|--------|----------|
| loading | spinner, skeleton | buffering, asset loading |
| playing | play icon hidden | media playing |
| paused | play icon visible | media paused |
| buffering | spinner overlay | rebuffering |
| error | error overlay, retry button | playback failed |
| ended | replay button, next up | VOD complete |

---

## Widget Layers (Bottom to Top)

1. **Video Layer** - Main media playback
2. **Overlay Layer** - Subtitles, captions
3. **UI Layer** - Controls, progress
4. **Interaction Layer** - Emotes, reactions
5. **Chat Layer** - Embedded chat (optional)

---

## Controls

### Always Visible
- Play/Pause toggle
- Volume slider + mute toggle
- Fullscreen toggle
- Settings gear

### Video Player Only
- Progress bar (seekable)
- Current time / Duration
- Quality selector
- Picture-in-Picture toggle

### Live Player Only
- Live badge
- Viewer count
- Latency indicator
- DVR toggle (rewind live)

---

## Emote Integration

When emote carousel is active:
- Emotes appear in designated zone (configurable)
- Animation duration: 2s fade-out
- Max concurrent emotes: 15
- Sound effects: optional

---

## Tip Jar Integration

- Tip jar button overlay (corner)
- Tip animation: spark + sound effect
- Leaderboard sidebar integration
- Tip notifications in chat

---

## Responsive Behavior

| Breakpoint | Layout |
|------------|--------|
| mobile (<640px) | controls bottom, chat hidden |
| tablet (640-1024) | controls overlay on hover |
| desktop (>1024) | full controls, chat sidebar option |

---

## Accessibility

- Keyboard navigation (space=play/pause, arrows=seek)
- Screen reader labels
- Closed captions support
- Audio descriptions track

---

## Files Reference

- `data/player/modes.json` - Player modes config
- `data/player/overlays.json` - Overlay positions
- `data/emotes/registry.json` - Emote definitions
- `data/tipping/effects.json` - Tip effects
