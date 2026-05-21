# ONBOARDING · MOBILE · ACCESSIBILITY · SEO

---

# ARTIST_ONBOARDING_FLOW.md
## Step-by-Step: What Happens When an Artist Joins

---

## ONBOARDING SEQUENCE

```
STEP 1: REGISTRATION
  - Name, email, password
  - OR social auth (Google / Apple)
  - Account type: ARTIST
  - Email verified

STEP 2: PROFILE SETUP
  - Stage name (required)
  - Genre(s) — select up to 3
  - Bio — short intro (max 280 chars)
  - Profile photo — uploaded or skipped (placeholder)
  - Cover image — optional

STEP 3: INDEX REGISTRATION
  - Artist automatically receives a rank number
  - Shown: "You are #[N] on The Musician's Index"
  - Explained: high rank# = most discovery exposure
  - Momentum starts at zero

STEP 4: FIRST ARTICLE
  - Platform auto-creates a "Meet [Artist Name]" article
  - Artist can edit or publish as-is
  - Article slug: /articles/meet-[artist-slug]
  - Published immediately or saved as draft

STEP 5: VENUE UNLOCK
  - Artist explained: "Your first venue is the Living Room"
  - Shown their starting tier (Free)
  - Shown progression path

STEP 6: BILLING (OPTIONAL AT SIGNUP)
  - Skip available
  - Upgrade to Bronze+ shown with benefits
  - Free tier confirmed if skipped

STEP 7: TUTORIAL
  - 4-step mini walkthrough (skippable):
    1. How to go live
    2. How your index works
    3. How fans find you
    4. How you get paid

STEP 8: FIRST LIVE PROMPT
  - "Ready for your first live?"
  - [Go Live Now] or [Schedule Later]
  - Julius appears: "Your stage is waiting."
```

---

## ONBOARDING COMPLETION TRACKING

- Each step tracked in DB
- Incomplete onboarding shown in artist dashboard as % complete
- Reminders sent at 24h, 72h, 7 days if not completed
- Points awarded per completed step

---

# FAN_ONBOARDING_FLOW.md
## Step-by-Step: What Happens When a Fan Joins

---

## ONBOARDING SEQUENCE

```
STEP 1: REGISTRATION
  - Name, email, password OR social auth
  - Account type: FAN

STEP 2: DISCOVER ARTISTS
  - "Who do you like?"
  - Show genre selector
  - Show 6–10 artists from each chosen genre
  - Fan selects favorites to follow

STEP 3: FIRST EVENT
  - Show "Live Now" or "Starting Soon" events
  - Fan enters their first venue
  - Julius welcomes them: "Welcome to the index."

STEP 4: SEAT ASSIGNED
  - Fan gets a seat in the venue
  - Shown their tier (Free)
  - Shown how to react, tip, and vote

STEP 5: UPGRADE PROMPT (GENTLE)
  - At event end: "Enjoyed that? Start earning points."
  - Show points they earned from watching
  - Show what more points unlock

STEP 6: PROFILE (OPTIONAL)
  - Add display name + photo
  - These appear in venues as their avatar
```

---

# MOBILE_SYSTEM.md
## How the Platform Works on Mobile Devices

---

## MOBILE EXPERIENCE RULES

### Layout
- Single-column layout on mobile
- Magazine spreads: vertical scroll (not horizontal flip)
- Rooms: simplified venue view (portrait format)
- Artist avatar: full-height portrait mode default

### Performance
- Auto-detect mobile → lite mode ON
- Crowd: simplified crowd waves (no full 3D)
- Moving lights: reduced to 2 max on mobile
- Transformation FX: simplified color wave + sound
- No confetti on low-power mode

### Touch Controls
- Swipe left/right: page navigation
- Swipe up: scroll in-venue
- Long press: reaction hold (cheer)
- Tap: quick react
- Double-tap: tip shortcut

### Mobile Navigation
- Bottom nav bar: Home / Live / Index / My Account
- Cmd+K → search icon tap on mobile
- Magazine nav: simplified swipe stack

### Offline Handling
- No offline mode for live events (streaming required)
- Articles: cached for offline reading after first load
- Profile: cached for offline viewing

---

## PROGRESSIVE WEB APP (PWA)

Platform supports PWA install:
- "Add to Home Screen" prompt
- App icon on home screen
- Full-screen mode (no browser bar)
- Push notifications via service worker
- Same codebase as web (not a separate app)

---

# ACCESSIBILITY_SYSTEM.md
## Making TMI Work for Everyone

---

## REDUCED MOTION MODE

If user has "Reduce Motion" enabled in OS:
- All transformation animations: instant state switch (no morph)
- Curtain: snap open/close (no sweep)
- Crowd animations: static crowd + count
- Page turns: instant (no flip)
- Julius: static pose only
- VEX: static proximity + audio only

---

## CAPTION SYSTEM

- All live events: auto-caption available (speech-to-text)
- Artist speech: captioned on-screen
- Host speech: captioned on-screen
- Julius: text overlay (what Julius says)
- Caption style: large white text, dark background bar
- Font: min 18px, high contrast
- User can toggle: caption size, position, speed

---

## SCREEN READER SUPPORT

- All interactive elements have ARIA labels
- Room description announced on join: "You are in [Room Name], row [N], seat [N]"
- Live event type announced on join
- Score/energy updates announced periodically
- Julius announcements read aloud

---

## COLOR ACCESSIBILITY

- All tier colors pass WCAG AA contrast
- Colorblind mode: tier indicators use shapes + patterns in addition to color
- Never rely on color alone to convey information

---

## KEYBOARD NAVIGATION

- Full keyboard navigation for web
- Tab order is logical
- Escape closes any overlay
- Enter activates buttons
- Arrow keys: navigate seats, pages

---

# SEO_OG_SYSTEM.md
## How Pages Look When Shared + How Search Engines See Them

---

## PAGE META RULES

### Artist Profile Page
```html
<title>[Artist Name] — The Musician's Index</title>
<meta name="description" content="[Artist name] is indexed at #[N]. [Bio excerpt]">
<meta property="og:title" content="[Artist Name] on TMI">
<meta property="og:image" content="[Artist profile photo]">
<meta property="og:description" content="[Bio excerpt]">
```

### Article Page
```html
<title>[Article Title] — The Musician's Index</title>
<meta property="og:title" content="[Article Title]">
<meta property="og:image" content="[Article hero image]">
<meta property="og:description" content="[First 150 chars of article]">
```

### Event Page
```html
<title>[Event Name] — Live on TMI</title>
<meta property="og:title" content="[Event Name] — Live Now">
<meta property="og:image" content="[Artist photo or event graphic]">
<meta property="og:description" content="Watch [Artist] live on The Musician's Index">
```

---

## SITEMAP

Auto-generated sitemap includes:
- All published artist profiles
- All published articles
- All scheduled/active events
- Genre pages
- Static pages

Excluded from sitemap:
- Draft articles
- Private events
- Admin routes

---

## CANONICAL URLS

All profile and article URLs are canonical:
- `/artists/[slug]`
- `/articles/[slug]`
- `/events/[id]`
- No duplicate URL paths

---

*Onboarding + Mobile + Accessibility + SEO v1.0 — BerntoutGlobal XXL*
