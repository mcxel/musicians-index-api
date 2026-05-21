# MULTI-WINNER REVEAL SPEC
# TMI Platform — BerntoutGlobal XXL
# Full specification for the contest/game winner reveal system

---

## OVERVIEW

The winner reveal system supports three modes based on game type:

| Mode | Winners | Games |
|---|---|---|
| `single` | 1 winner | Quick polls, trivia |
| `small_game` | 1–5 winners | Talent shows, small contests |
| `big_contest` | 5–10 winners | Platform contest, grand finals, season finale |

The August 8 contest season rule applies to any reveal tied to a contest season.

---

## REVEAL SEQUENCE (All Modes)

```
IDLE
  ↓  (host triggers or auto-start)
LINEUP
  ↓  (winners appear one by one, staggered 350ms apart)
GROUP_REACTION
  ↓  (all winners visible, hold for groupHoldSeconds, allow reactions/chatter)
HERO_ZOOM
  ↓  (featured winner fills screen, other winners visible but smaller)
COMPLETE
  ↓  (replay/archive export, analytics logged)
```

---

## PHASE DETAILS

### LINEUP Phase
- Winners appear one at a time, staggered
- Each winner card shows: avatar, rank medal, name, category
- Camera preset: `group_celebration` or `podium_pan`
- Duration: (winner count × 350ms) + 600ms settle

### GROUP_REACTION Phase
- All winners visible simultaneously
- Hold for `groupHoldSeconds` (default 3, configurable 2–5)
- Winners can show reaction emojis (configured per winner or randomized)
- If `allowVoiceChatter = true`: winner mic bars animate, voice mix active
- Audio mode controls overlap behavior:
  - `chaotic`: all mics live simultaneously (fun/funny)
  - `balanced`: mic ducking when more than 2 active (cleaner)
  - `broadcast_safe`: one mic at a time, queue-based (safest)
- Countdown timer visible in corner (holdTimer → 0)
- Camera: stays on group shot

### HERO_ZOOM Phase
- Featured winner (rank 1 by default) zooms to fill screen
- Other top winners remain visible in smaller strip below
- Winner name in large type with category
- Prize description shown if configured
- Sponsor names shown in small line if configured
- Camera preset: `hero_zoom` → `winner_isolation`
- Duration: 3000ms, then → COMPLETE

### COMPLETE Phase
- Replay/archive data captured
- Analytics event emitted
- onComplete callback fires with winner array
- Close button visible

---

## VOICE CHATTER SYSTEM

### When enabled (`allowVoiceChatter = true`)
- Visual: animated mic bars on each winner card during GROUP_REACTION
- Audio: WebRTC/voice channel opens between winners (future implementation)
- All winners can hear each other
- Voices may overlap intentionally
- Mix feels chaotic but fun, not broken

### Audio guardrails
```
maxSimultaneousMics:  max 3–5 at once (configurable)
ducking:              when featuredWinner speaks → others at -12dB
limiter:              hard ceiling at -3dBFS to prevent clipping
crowd_bed_vol:        0.3–0.6 relative to voice
profanity_pass:       TODO: wire to moderation if public clips saved
```

### Modes
- `chaotic`: all mics active, fun chaos, small games / comedy events
- `balanced`: smart ducking, most common mode
- `broadcast_safe`: queue-based, one at a time — platform finals/formal events

---

## CAMERA PRESET SYSTEM

### Approved Preset Pool (admin-managed)
All presets defined in `apps/web/src/config/reveal.presets.ts`.
Never create presets outside this file.

| Preset ID | Use Case |
|---|---|
| `hero_zoom` | Final featured winner reveal |
| `group_celebration` | Group lineup, reaction phase |
| `podium_pan` | Panning across ranked winners |
| `winner_isolation` | Featured winner in focus, others blurred |
| `chaotic_reaction_sweep` | Quick cuts between winners reacting |
| `crowd_bounce_shot` | High energy bounce effect |
| `sponsor_overlay_cut` | Sponsor brand moment during transition |
| `final_goodbye_orbit` | Closing orbit — season finales only |

### Adaptive Weighting Rules
1. Track which transitions get highest `watchCompletionRate` and `adminRating`
2. Increase weight for high-performers (max +20 per cycle)
3. Decrease weight for low-performers (min weight = 10, never 0)
4. Never create new presets — only adjust weights
5. All weight changes logged with timestamp + adminId
6. Admin can reset all weights to defaults at any time
7. Season lock prevents any weight changes during active season
8. Cooldown period: 7 days minimum between rotation cycles

---

## FALLBACK RULES

If `winnerRevealConfig` is null or missing:
- Fall back to `fallbackSingleWinnerMode = true`
- Show only rank-1 winner
- Camera: `hero_zoom` only
- No voice chatter
- No group hold phase
- Display should never be blank

---

## ANALYTICS TO TRACK (per reveal event)

```typescript
{
  seasonId: string,
  entryId?: string,
  transitionUsed: string,
  cameraPresetUsed: string,
  winnerCount: number,
  revealMode: string,
  watchCompletionRate: number,   // 0–1: did viewer watch full reveal?
  replayCount: number,
  adminRating?: 1|2|3|4|5,      // host/admin rates the reveal
  audienceFavoriteTag?: string,  // audience reaction label
  groupHoldSeconds: number,      // actual hold used
  voiceChatActive: boolean,
  audioMode: string,
}
```

---

## ADMIN CONTROLS (contest/admin/reveal/page.tsx)

Admin panel must expose:
- [ ] Winner count mode (single / small_game / big_contest)
- [ ] Min/max winner count sliders (1–10)
- [ ] Group hold duration (2–5 seconds)
- [ ] Voice chatter toggle
- [ ] Audio mode selector (chaotic / balanced / broadcast_safe)
- [ ] Camera preset pool enable/disable per preset
- [ ] Transition weight sliders
- [ ] Adaptive weighting on/off toggle
- [ ] Season lock toggle
- [ ] Reset weights to default button
- [ ] Fallback mode toggle
- [ ] Host controlled toggle
- [ ] Analytics readout (last 10 reveals)
- [ ] Audit log (all weight changes)

---

## PLAYWRIGHT SMOKE COVERAGE

Add to `tests/e2e/contest.smoke.spec.ts`:

```typescript
test('WinnerRevealPanel renders with single winner', async ({ page }) => {
  // Navigate to a page that renders WinnerRevealPanel
  // Verify: "Start Reveal" button visible in idle phase
  // Click Start Reveal
  // Verify: lineup phase renders winner card
  // Verify: hero zoom phase renders winner name
});

test('WinnerRevealPanel fallback works with no config', async ({ page }) => {
  // Render without config
  // Verify: single winner mode activates
});

test('Admin reveal config page guarded', async ({ page }) => {
  await page.goto('http://localhost:3001/contest/admin/reveal');
  await expect(page).toHaveURL(/\/auth|\/login/i);
});
```

---

## DONE DEFINITION FOR THIS FEATURE

Winner Reveal is DONE when:
- [ ] `single` mode: idle → lineup → hero_zoom → complete
- [ ] `small_game` mode: 1–5 winners in group, then hero zoom
- [ ] `big_contest` mode: 5–10 winners in group, then hero zoom
- [ ] Group hold countdown visible
- [ ] Voice chatter toggle works (even if WebRTC is placeholder)
- [ ] Camera director runs (even if visual is CSS only)
- [ ] Adaptive weights save and restore
- [ ] Fallback single-winner mode works if config missing
- [ ] Reveal analytics logged to API
- [ ] Admin controls save correctly
- [ ] Season lock prevents weight changes
- [ ] Playwright smoke passes

---

*BerntoutGlobal XXL | TMI Platform | Multi-Winner Reveal Spec | Phase 19*
