# VOICE MEDIA MIX ARCHITECTURE
## BerntoutGlobal XXL — TMI Platform
## Effective: 2026-03-23 | Status: LOCKED

---

## PURPOSE

Keep room conversation and shared media playback independent and controllable.

---

## TWO-CHANNEL MODEL

### Channel A: Voice
- Artist mics
- Producer/host/mod mics
- Optional audience speak lanes

### Channel B: Shared Media
- Approved linked source playback
- One active source per room

Both channels must be independently adjustable per client.

---

## REQUIRED USER CONTROLS

Each participant gets:
- Master volume
- Voice channel volume
- Media channel volume
- Voice mute
- Media mute
- Optional focus mode

---

## DUCKING RULES

Default when media starts:
- voice remains live
- voice auto-ducks to configured level (e.g., 75%)
- users may override locally
- host may apply battle focus mode for stricter ducking

---

## PROVIDER CONTRACT

A room runtime should expose:
- `RoomVoiceProvider`
- `SharedMediaProvider`
- `AudioMixerProvider`

HUD must be able to read:
- current media owner
- media status
- mixer mode
- active room audio state

---

## FAILURE / FALLBACK

- If media source fails, keep voice channel active.
- Show fallback frame and error toast.
- Preserve turn lock state until host release or timeout.

---

## PROOF GATE

Minimum proof requires:
1. media starts while voice stays active
2. both sliders affect only intended channel
3. route/navigation does not reset mixer unexpectedly
