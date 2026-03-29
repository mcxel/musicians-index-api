# PDF_VISUAL_DRIFT_CHECKLIST.md
# PDF Visual Drift Checklist
# Run this checklist against every UI slice before committing.
# Authority: tmi-platform/docs/system/PDF_PAGE_AUTHORITY_INDEX.md

## What Is Visual Drift

Visual drift occurs when new UI departs from the TMI/Berntout visual DNA defined in the PDF magazine pages.
Common drift patterns:
- White or light backgrounds replacing near-black
- Generic rounded card shapes replacing TMI sharp-edge tiles
- System sans-serif fonts replacing TMI display fonts
- Placeholder/generic icons instead of TMI-styled icons
- Generic admin dashboard UI instead of TMI control surface layout
- Missing live indicators (pulsing neon dot)
- Missing tier/Diamond theming on artist surfaces

---

## Slice-Level Drift Check

After building any UI slice, answer each question. Any NO = fix before committing.

### Background & Color
- [ ] Background is near-black (`#0a0a0a` to `#111` range)? Or intentional exception?
- [ ] White backgrounds only appear inside explicit content "paper" zones (article body text area)?
- [ ] Neon accent color matches brand palette (not arbitrary blue/green/purple)?
- [ ] Card/tile backgrounds are dark (NOT white or light grey)?

### Typography
- [ ] Headers use TMI display font (not system sans-serif)?
- [ ] Body text is readable contrast on near-black background?
- [ ] No lorem ipsum or placeholder text?
- [ ] Brand names spelled correctly (Berntout / BerntoutGlobal / Berntout Perductions)?

### Card and Tile Shape
- [ ] Cards have sharp or slightly rounded corners (4–8px max)?
- [ ] No `rounded-2xl` or `rounded-full` patterns on content cards (exception: avatar images)?
- [ ] Card border is either none, very subtle, or neon accent?
- [ ] Card shadows are minimal or neon glow (NOT heavy drop shadows)?

### Live Indicators
- [ ] Live rooms/sessions show pulsing neon dot indicator?
- [ ] Live badge is NOT a generic "LIVE" text pill (unless explicitly designed as such in PDF)?
- [ ] Countdown timers are visible and prominent when active?

### Artist / Tier Identity
- [ ] Diamond artists (Marcel, B.J.M.) show Diamond tier badge on profile?
- [ ] Diamond badge is animated (pulsing/shimmering) per PDF page 6–7?
- [ ] Tier color propagates into article card headers when listing articles by a tier-ed artist?
- [ ] No artist uses the same uniform card style regardless of tier?

### Module-Specific Checks

#### Homepage Belts
- [ ] Check against PDF page 1 (Promo) and page 2 (Live/Sponsor)?
- [ ] Belt sections are clearly separated (neon strip, background shift, or visible divider)?
- [ ] Belts are full-width sections (NOT narrow center-column cards)?

#### Magazine Reader
- [ ] Check against PDF pages 4–8?
- [ ] Layout is horizontal page-flip (NOT vertical scroll/blog)?
- [ ] Spread shows both pages (left + right) on tablet/desktop?
- [ ] Page number indicator is in corner (TMI style)?

#### Admin Command Center
- [ ] Check against PDF page 3?
- [ ] Layout is dense grid of status tiles (NOT generic data table)?
- [ ] Status tiles show color-coded state (green/yellow/red)?

#### Booking
- [ ] Check against PDF pages 4–5?
- [ ] Calendar view exists (NOT list-only)?
- [ ] Booking map attempt made (with list fallback)?

#### Cypher Stage
- [ ] Check against PDF pages 18–20?
- [ ] Stage area is full-screen surface (NOT small panel)?
- [ ] Performer queue is visible alongside stage?
- [ ] Audience reaction rail is at bottom?

#### Game Night
- [ ] Check against PDF pages 10–16?
- [ ] Timer bar is prominent and animated?
- [ ] Answer reveal shows correct/incorrect color coding?

### Functional States
- [ ] Loading state exists (skeleton or shimmer, NOT empty page)?
- [ ] Empty state exists and matches `EMPTY_STATE_LIBRARY.md` wording?
- [ ] Error state exists (does NOT show raw error to user)?
- [ ] Fallback behavior defined if API fails?

### Asset Policy
- [ ] No asset paths pointing to Downloads/, Desktop/, or OS user folders?
- [ ] All images reference repo-relative paths or approved CDN?
- [ ] External images have `onerror` fallback handler?

---

## Escalation Decision

| Outcome | Action |
|---------|--------|
| All ✅ | Approve slice — commit allowed |
| 1–2 ❌ | Fix before commit (same slice) |
| 3+ ❌ | Stop — do not commit — return to slice root cause |
| Unsure about PDF interpretation | Open PDF page and compare directly |

---

## Anti-Drift Reference (Quick Recall)

| Wrong | Right |
|-------|-------|
| White card background | Near-black tile background |
| `rounded-2xl` card | `rounded` or `rounded-md` (4–8px) |
| Generic icon | TMI/Berntout styled icon |
| Static grey dot | Pulsing neon live indicator |
| System font for header | TMI display font |
| Lorem ipsum | Real copy or approved empty state |
| Same card style all artists | Tier-differentiated artist cards |
| Blog-style article layout | Horizontal spread layout |
| Plain admin table | Dense control surface layout |
