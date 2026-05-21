# ROOM_SYSTEM_FAMILY_MAP.md
## All Room Types — Design, Rules, and Monetization
### BerntoutGlobal XXL / The Musician's Index

---

## ROOM FAMILIES

Every room inherits from the base room runtime.
Room families add specific UI layers, rules, and capabilities.

### 1. ARENA ROOM
```
Purpose: Main live performance stage
Scene: Concert/club backgrounds (selectable by host)
Audio: Full audio for current performer
Queue: Turn-based, host manages
Features: Tips, reactions, audience chat, scene picker
Monetization: SHOW_LOWER_THIRD, SHOW_SIDE_PANEL, SHOW_TIP_MATCH
Max audience: 500
```

### 2. BATTLE ROOM (Cypher)
```
Purpose: 1v1 and 1v1v1 rap/music battles
Scene: Underground cypher walls, street art (urban scene)
Audio: Turn-based battle rounds
Queue: 2 or 3 performers + bracket
Features: Voting, tip battle, battle record, crown transfer on win
Monetization: ROOM_CYPHER_PANEL, CONTEST_VOTING (if linked to contest)
Max audience: 200
```

### 3. CYPHER ROOM (Group)
```
Purpose: Open group cypher, multiple performers flowing
Scene: Urban/cypher aesthetic
Audio: Hot-potato mic passing
Queue: Rotation order, auto-advance
Features: BPM display, beat casting (producer can cast beats), tips, reactions
Monetization: ROOM_CYPHER_PANEL
Max audience: 300
```

### 4. PRODUCER ROOM
```
Purpose: Beat showcase and producer performance
Scene: Studio aesthetic (gold lighting)
Audio: Beat playback + producer mic
Queue: Beat rotation if multiple producers
Features: Beat marketplace integration (purchase beat from room), tips, BPM display
Monetization: Beat sales (80% producer), ROOM_CYPHER_PANEL
Max audience: 200
```

### 5. WATCH PARTY ROOM
```
Purpose: Friends watching content together (event replay, premiere)
Scene: Theater/venue aesthetic
Video: Synchronized video player (external embed or uploaded replay)
Audio: Shared synchronized audio
Features: Reactions, chat, skip ad button, optional "Host Mic"
Monetization: ROOM_WATCHPARTY_STICKY, SHOW_REPLAY_SPONSOR
Max audience: 100
```

### 6. GAME ROOM
```
Purpose: In-room game sessions (Name That Tune, Deal or Feud, trivia)
Scene: Game night aesthetic (hot pink/yellow/purple)
Audio: Game sounds + host mic
Queue: Player seats (2-8 players + audience)
Features: Score display, timer, branded questions, intermission ads
Monetization: Full game slot registry (GAME_LOBBY through GAME_END_SCREEN)
Max players: 8
Max audience: 200
```

### 7. AUDIENCE ROOM (Live Concert View)
```
Purpose: Watching a live concert/performance as an audience member
Layout: Front/Mid/Back row seating sections
Video: Main stage view + optional camera switching
Features: Premium front row (paid), tips, merch QR, shop button, pause/break
Monetization: SHOW_LOWER_THIRD, SHOW_TIP_MATCH, ART_STICKY_MOBILE
Max front row: 20 (premium, paid)
Max total: unlimited viewing
```

### 8. VIP LOUNGE
```
Purpose: Premium/paid exclusive artist access
Scene: Upscale venue aesthetic
Admission: Ticket, fan club membership, or token-gated
Features: Intimate chat, exclusive content, artist Q&A
Monetization: ROOM_VIP_SPONSOR (prestige only)
Max: 50
```

### 9. VENUE ROOM
```
Purpose: Virtual representation of a real venue
Scene: Venue-specific branded scene
Features: Upcoming event calendar for venue, booking portal link
Monetization: ROOM_VENUE_BRANDED (venue can pay for branded experience)
Max: 100
```

### 10. REPLAY ROOM
```
Purpose: Past event replay/VOD
Scene: Same as original event
Features: Synchronized playback, bookmark moments, share clip
Monetization: SHOW_REPLAY_SPONSOR
Max: unlimited
```

### 11. BACKSTAGE ROOM (Artist-Only)
```
Purpose: Behind-the-scenes artist hangout
Scene: Backstage/green room aesthetic
Access: Artist + approved guests + fan club VIP tier
Features: Casual chat, exclusive preview, informal session
Monetization: None (prestige member benefit)
Max: 25
```

### 12. PARTY LOBBY ROOM (the social layer)
```
Purpose: Pre-destination social hangout
Scene: Configurable by party host
Features: Video tiles, voice, text, shared preview, destination picker
Monetization: None (social zone — no ads in party lobbies)
Max: 12 (intimate party size)
```

---

## ROOM TRANSITION FLOW

```
Party Lobby → [JOIN TOGETHER] → Any destination room type
Any room → [BACK TO PARTY] → Returns to party lobby in background mode
Any room → [LEAVE] → Returns to home or previous page
Home Lobby Wall → [JOIN ROOM] → Arena/Cypher/Battle/etc.
```
