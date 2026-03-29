# AUDIO_ENGINE_SYSTEM.md
## Live Audio in Rooms — Complete Architecture
### BerntoutGlobal XXL / The Musician's Index

---

## AUDIO STACK

```
Artist microphone input
     ↓
Browser Web Audio API (getUserMedia)
     ↓
AudioProvider (singleton — ONE instance, never duplicated)
     ↓
WebRTC peer connections (for < 8 participants)
OR
SFU media server (for > 8 participants / broadcast rooms)
     ↓
Other participants receive audio
     ↓
Volume control per participant
```

---

## AUDIOPROVIDIER RESPONSIBILITIES

AudioProvider is the single audio authority. It owns:
- `currentStream: MediaStream | null` — active mic stream
- `isAudioEnabled: boolean` — mic on/off
- `isSpeaking: boolean` — voice activity detection (VAD)
- `audioLevel: number` — current volume level (0–100)
- `unlock(): void` — iOS audio context unlock
- `acquireMic(): Promise<MediaStream>` — request mic permission
- `releaseMic(): void` — stop all tracks

## BEAT AUDIO (PRODUCER ROOMS)

Beat audio is a separate audio node in the audio graph:
- Beat plays from producer's BeatCastPanel
- Beat is mixed server-side into room audio channel
- Room participants hear beat through room audio, not a separate stream
- Beat volume is independently controllable by producer

## ROOM AUDIO MODES

| Mode | Participants | Audio Path |
|---|---|---|
| Voice Room | 2–8 | WebRTC mesh |
| Battle | 2 performers + audience | WebRTC for performers, audience listens |
| Cypher | Queue-based | Only current turn speaks |
| Broadcast/Radio | 1 host + many listeners | Host → SFU → all listeners |
| Watch Party | Shared media | Media audio synced, no mic |

## TURN-BASED AUDIO RULE

In Cypher and Battle rooms:
- Only the artist whose turn it is has an active mic
- All other artists are auto-muted during others' turns
- TurnQueueProvider signals AudioProvider to mute/unmute on turn change

## PLATFORM LAW

ONE AudioProvider instance.
Never create AudioContext outside AudioProvider.
Never access MediaStream outside AudioProvider.
