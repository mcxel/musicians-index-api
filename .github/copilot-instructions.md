# TMI BUILD DIRECTOR OVERRIDE — CANON RECONSTRUCTION LAW

Read this fully before touching any UI, profile, admin page, hub, room, venue, magazine page, or homepage.

---

## SOURCE OF TRUTH

The `TMI PDFs` folder is the canonical source.

**Allowed references:**
- PDFs
- Extracted images
- Converted assets

**Skip:**
- Zip files
- Archives
- Temp exports
- Duplicates

Do not build until the scan is complete.

---

## IMAGES ARE BASE REFERENCES ONLY — NOT FINAL UI

Treat all images and PDF pages as **BASE REFERENCES ONLY**.

**Do NOT:**
- Paste them in as flat images
- Use them as backgrounds pretending the UI is done
- Use them as screenshots

**Deconstruct every reference into real systems.**

Break each reference into:

### STRUCTURE
- Shell / frame
- Card layout
- Walls / floors / seats / stage / billboards

### INTERACTION
- Buttons / chevrons / sliders / tabs / toggles

### CONTENT
- Stats / text / headlines / rankings / rewards / tickets / ads

### MOTION
- Hover states
- Page turns
- Live pulses
- Moving strips
- Animated counters

### LOGIC
- Routes / purchases / bookings / analytics / rewards / ranking

---

## REBUILD AS REAL ARTIFACTS

Every reference becomes a real component. Examples:

**Magazine:**
- `MagazineShell.tsx`
- `MagazineCover.tsx`
- `MagazinePages.tsx`
- `PageTurnEngine.ts`

**Profiles:**
- `ProfileShell.tsx`
- `ProfileStatsRail.tsx`
- `ProfileMediaRail.tsx`
- `ProfileBookingRail.tsx`

**Admin:**
- `AdminShell.tsx`
- `AdminControlRail.tsx`
- `AdminObservatory.tsx`

**Venue:**
- `VenueShell.tsx`
- `VenueSeatRenderer.tsx`
- `VenueStageShell.tsx`
- `VenueTicketRail.tsx`

---

## PROFILE SURFACE AUDIT — REQUIRED

Go back over and repair:
- `/hub/performer`
- `/hub/fan`
- `/administration`
- `/admin`
- `/profile/artist/*`
- `/profile/performer/*`

**Fix on each surface:**
- Flat image dependencies
- Fake cards
- Placeholder surfaces
- Incorrect spacing
- Missing shells
- Missing rails
- Missing visual hierarchy

---

## HUB SPECIFICATIONS

### Performer Hub `/hub/performer`
Must be a **stage-center identity hub** — NOT a generic profile card.

Required rails:
- Performance rail
- Battle rail
- Booking rail
- Article rail
- Stats rail

### Fan Hub `/hub/fan`
Must be a **lounge/social/reward hub**.

Required rails:
- Wallet rail
- Social rail
- Rewards rail
- Achievements rail
- Store rail

### Admin Hub `/admin`
Must be an **overseer deck**.

Required rails:
- Observatory rail
- Threat rail
- Revenue rail
- Bot rail
- Launch rail

---

## TMI VISUAL CANON — REQUIRED

| Required | Forbidden |
|---|---|
| Neon accents | Generic dashboard |
| Layered cards | Plain gray SaaS layouts |
| 1980s editorial style | Minimal flat layouts |
| Glowing borders | Screenshot UI |
| Animated strips | Image-copy UI |
| Bright colors | |
| Magazine aesthetic | |

**Color palette:** cyan `#00FFFF` / fuchsia `#FF2DAA` / gold `#FFD700` / purple `#AA2DFF` / dark-space `#050510`

---

## VENUE ENVIRONMENT TRUTH

Every room and venue must have:
- Walls
- Floor
- Seats
- Stage
- Screens
- Lighting
- Spawn points
- Crowd zones

---

## RETURN AUDIT REPORT

After any scan or rebuild, report:
1. What files were scanned
2. What references were used
3. What was rebuilt
4. What still needs conversion
5. What profile/admin surfaces were repaired

---

## FINAL LAW

> **Build from canon only. No screenshot UI. No image-copy UI. Artifact reconstruction only.**
