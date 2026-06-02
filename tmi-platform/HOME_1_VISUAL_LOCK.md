# HOME 1 VISUAL LOCK

**STATUS:** Active Sprint
**OBJECTIVE:** Polish the front door. Ensure the visual hierarchy matches the TMI World Architecture. 
**RULE:** No new systems, no new backends. Pure presentation, routing, and styling cleanup.

## Section 1 — Magazine Cover
- [x] **TMI Masthead:** Keep the typewriter color cycle (white → gold → green → red).
- [x] **Magazine Identity:** Ensure the "VOTING LIVE" and "CROWN UPDATING" badges are prominent.
- [x] **Editorial Belt:** Feature "THIS WEEK IN TMI" with real (seeded) articles, not placeholders.
- [x] **Purge:** Remove dead fragments, old test hex cards, and duplicate information.

## Section 2 — Live Billboard Wall
- [x] **Positioning:** Move the "LIVE NOW" billboard wall up, above the fold or immediately below the masthead.
- [x] **Content:** Show live performers, battles, cyphers, challenge arena, and world dance party.
- [x] **Interactivity:** Every tile must be clickable and alive (even if simulated for now).

## Section 3 — Arena Triangle
- [x] **Three Giant Cards:** 
  - ⚔️ BATTLE ARENA (`/battles/live`)
  - 🎤 CYPHER ARENA (`/rooms/cypher-arena`)
  - 🎵 CHALLENGE ARENA (`/rooms/challenge-arena`)
- [x] **Action:** No explanation needed. Click → Enter.

## Section 4 — Trending Venues
- [x] **Display:** Show audience count, performer name, and venue name.
- [x] **Action:** One click -> Auto Seat (`/rooms/[slug]?autoSeat=1`).

## Section 5 — Revenue Layer
- [x] **Action Row:** Clearly display buttons for:
  - Subscribe (`/subscribe`)
  - Sponsor (`/advertise`)
  - Promote Event (`/tickets`)

## Global Polish
- [x] **Underlay:** Verify `TabloidUnderlay` renders correctly behind the orbital wheel.
- [x] **Orbit:** Verify `WeeklyCrownOrbit` renders and spins correctly.
- [x] **Styling:** Unify card styling across the page (glassmorphism, TMI neon borders).
- [x] **Typography:** Use consistent font weights and tracking per `tmiTypography.css`.

---
*After this sprint is complete and verified, we move to P9 (Media Asset Pipeline).*