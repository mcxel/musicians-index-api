# TMI SCENES + AUDIO + VISUAL ARCHITECTURE
## Every Scene, Background, Audio Layer, and Fallback State

---

## SCENE ENGINE FOLDER STRUCTURE
```
apps/web/src/lib/scenes/
  scene-registry.ts         — 18 scenes with tokens
  scene-loader.ts           — loads scene by ID
  scene-transitions.ts      — page flip, fade, zoom transitions
  scene-audio.ts            — audio profile per scene
  scene-backgrounds.ts      — background layer configs

apps/web/src/components/scenes/
  SceneBackdrop.tsx         — wraps page with scene layers
  SceneBackground.tsx       — background layer (gradient/texture/video)
  SceneOverlay.tsx          — VHS scanlines, CRT flicker, glow
  SceneParticles.tsx        — floating particles, confetti
  SceneLighting.tsx         — neon light beams, stage spill
  SceneTransition.tsx       — between-world animation
  SceneAudio.tsx            — ambient audio manager (autoplay-safe)
```

---

## ALL 18 SCENES (from Pack 32 scene registry)

| Scene ID | Used In | Background | Audio Profile |
|---|---|---|---|
| magazine | Home 1 | Paper grain + amber gradients | Vinyl crackle + soft editorial |
| dashboard | Home 2 | Neon grid + synthwave | Dashboard hum |
| live-stage | Home 3 | Stage lights + concert haze | Crowd murmur + applause ready |
| sponsor-showcase | Home 4 | Clean premium + amber spotlight | Sponsor showroom neutral |
| lobby | Waiting rooms | Purple-cyan gradient | Lobby ambient |
| underground-cypher | Dirty Dozens | Dark + battle red | Beat loop + tension |
| game-night | Deal or Feud + Trivia | Rainbow lights | Game show music |
| concert-arena | Large events | Stadium lights | Full crowd |
| neon-club | Afterparty | Pink-purple club | DJ ambience |
| rooftop-city | Outdoor events | City skyline silhouette | Wind + distant city |
| backstage | Green room / backstage | Warm dim tungsten | Backstage quiet |
| space-dome | Special events | Starfield | Ambient space |
| beach-festival | Outdoor summer | Warm gradient | Festival crowd |
| virtual-grid | Avatar Lab / tech | Wireframe cyan | Synthwave pad |
| admin-command | Admin HUD | Dark neon orange | System hum |
| studio | Broadcast booth | Studio warm | Studio silence |
| archive | Past issues | Sepia + hologram | Archive rewind |
| hall-of-fame | Hall of Fame | Gold gallery | Triumphant ambient |

---

## AUDIO LAYER ARCHITECTURE
```
apps/web/public/audio/
  ui/
    click.mp3               — button click (synth)
    hover.mp3               — card hover (soft neon)
    page-flip.mp3           — between-world flip
    vhs-insert.mp3          — site load entrance
    success.mp3             — form success
    error.mp3               — form error
    notification.mp3        — notification pop
    reward-unlock.mp3       — reward granted
    badge-unlock.mp3        — badge earned
    crown-reveal.mp3        — crown pop-on
    level-up.mp3            — tier upgrade

  ambience/
    lobby.mp3               — Home 3 lobby murmur
    magazine.mp3            — Home 1/2 paper quiet
    venue-crowd.mp3         — event crowd
    studio.mp3              — studio silence + hum
    afterparty.mp3          — DJ club ambience
    archive.mp3             — archive hologram hum

  game/
    round-start.mp3         — game begins
    buzzer.mp3              — time's up
    applause.mp3            — crowd reaction
    winner-fanfare.mp3      — winner reveal
    elimination.mp3         — player out
    score-tick.mp3          — points counting up
    countdown.mp3           — final seconds
    deal-accepted.mp3       — sponsor deal signed

  music/
    lobby-lofi.mp3          — Home 3 waiting music
    editorial-chill.mp3     — Home 2 browsing music
    sponsor-neutral.mp3     — Home 4 showroom
    standby-lofi.mp3        — off-air waiting
    game-show-cue.mp3       — game show loop
    cypher-beat.mp3         — cypher beat loop
    victory.mp3             — post-win celebration

  sponsor/
    sponsor-sting.mp3       — sponsor bumper
    ad-break.mp3            — commercial break
    spotlight-sting.mp3     — sponsor spotlight entry
```

---

## VISUAL EFFECT LAYERS
```
apps/web/src/components/effects/
  NeonGlow.tsx              — CSS text/border glow
  ScanlineOverlay.tsx       — VHS scanlines (toggleable)
  CRTFlicker.tsx            — CRT flicker effect (toggleable)
  FilmGrain.tsx             — paper/film grain overlay
  ConfettiSystem.tsx        — confetti on win events
  FireFlame.tsx             — Top 10 flame animations
  CrownAnimation.tsx        — crown pop-on/pop-off (3000ms)
  LivePulse.tsx             — red recording dot pulse
  HypeMeter.tsx             — crowd hype visual meter
  StageSpotlight.tsx        — stage spotlight sweep
  NeonBeams.tsx             — floating light beams
  ParticleField.tsx         — ambient particle system
  WinnerReveal.tsx          — winner announcement burst

apps/web/src/components/states/
  LoadingState.tsx          — skeleton cards + TMI branded spinner
  EmptyState.tsx            — no content (per zone)
  ErrorState.tsx            — retry UI
  OffAirState.tsx           — test pattern + standby message
  ReconnectingState.tsx     — stream reconnecting
  MaintenanceState.tsx      — scheduled maintenance

```

---

## FALLBACK CHAIN (all visual states)
1. Load from CDN
2. If CDN fails → load from /public fallback
3. If that fails → show EmptyState or OffAirState
4. Ads: house-ad-fallback chain (5 internal options) → Platform Law #7
5. Livestream: fail-safe.bot → pre-recorded standby content
6. Audio: if autoplay blocked → show mute button, don't error

---

## REDUCED MOTION / AUDIO RULES
- `prefers-reduced-motion: reduce` → disable all animations, use instant transitions
- Reduced audio mode → disable all ambient + music, keep UI feedback sounds
- TV mode → larger cards, DPAD focus indicators, no hover effects
- Low bandwidth mode → disable video backgrounds, use gradient fallback
- Mobile mode → reduced particle count, no CRT overlay, simplified effects
