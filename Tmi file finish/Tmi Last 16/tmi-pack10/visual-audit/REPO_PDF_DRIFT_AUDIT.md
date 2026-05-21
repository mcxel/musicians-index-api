# REPO_PDF_DRIFT_AUDIT.md
## Comparing Every Repo Surface Against the Magazine PDF Visual Language

---

## HOW TO READ THIS

Each surface is marked:
- ✅ **MATCHES** — Correct, no work needed
- 🟡 **CLOSE** — Right direction, needs polish
- 🔴 **WRONG STYLE** — Built but drifted from design
- ⬜ **MISSING** — Not yet built
- ⏳ **WAIT** — Post-deploy polish only

Phase tags:
- **[NOW]** — Fix before Copilot wires anything
- **[BUILD]** — After build is green
- **[AUTH]** — After auth proof
- **[ONBOARD]** — After onboarding proof
- **[POLISH]** — Post-launch

---

## HOMEPAGE

| Element | Status | Notes | Phase |
|---|---|---|---|
| Hero portrait panel (6s cinematic) | 🟡 CLOSE | Component exists, timing needs verification | [BUILD] |
| Discovery-first rail ordering | ⬜ MISSING | Discovery engine not yet wired | [BUILD] |
| Magazine spine navigation | 🟡 CLOSE | MagazineNav built, needs binding | [BUILD] |
| Live room preview tiles | ⬜ MISSING | LiveRooms component exists, needs live data | [BUILD] |
| Neon/HUD card framing | 🟡 CLOSE | Tokens exist, need verification across cards | [BUILD] |
| Billboard preview | ⬜ MISSING | BillboardBoard built, not wired to homepage | [BUILD] |
| Player widget visible | ⬜ MISSING | PlayerWidget built, not wired | [BUILD] |
| Artist spotlight rail | 🟡 CLOSE | SpotlightRail component exists | [BUILD] |
| Discovery green accent | ⬜ MISSING | Tier color system not yet applied | [ONBOARD] |
| No dead zones (all space used) | 🔴 WRONG STYLE | Likely white space visible before wiring | [BUILD] |

**Overall homepage drift: MODERATE — components exist but unwired**

---

## MAGAZINE / ARTICLE SURFACES (PDF Pages 1–2)

| Element | Status | Notes | Phase |
|---|---|---|---|
| Promotional Hub (Page 1) | ✅ MATCHES | PromotionalHub component built per PDF | [BUILD] |
| Articles Hub (Page 2) | ✅ MATCHES | ArticlesHub component matches layout | [BUILD] |
| Magazine spread layout (horizontal) | 🟡 CLOSE | MagazinePage2 exists, needs live data | [BUILD] |
| Article editorial renderer | 🟡 CLOSE | JsonContentRenderer exists | [BUILD] |
| Neon-orange title treatment | 🟡 CLOSE | Tokens defined, verification needed | [BUILD] |
| Horoscope/lifestyle tile | 🟡 CLOSE | Defined in spec, needs component check | [ONBOARD] |
| Poll results tile | ⬜ MISSING | Not yet built | [ONBOARD] |
| Sponsor strip in spread | ⬜ MISSING | SponsorSlot not wired to magazine | [ONBOARD] |
| Page turn animation | 🟡 CLOSE | Page motion spec exists, not implemented | [POLISH] |
| Article ↔ profile link | ⬜ MISSING | articleProfileLinker.ts not yet created | [BUILD] |

**Overall magazine drift: LOW — core components match, wiring missing**

---

## ADMIN COMMAND SURFACE (PDF Page 3)

| Element | Status | Notes | Phase |
|---|---|---|---|
| AdminCommandHUD component | ✅ MATCHES | Matches PDF layout and neon framing | [BUILD] |
| Marcel dashboard (analytics only) | 🟡 CLOSE | Designed, needs role guard wired | [AUTH] |
| Jay Paul Sanchez view-only | 🟡 CLOSE | Designed, needs role guard wired | [AUTH] |
| Big Ace full control | 🟡 CLOSE | Designed, needs permission enforcement | [AUTH] |
| System health panel | ⬜ MISSING | Not yet built | [ONBOARD] |
| Bot status panel | ⬜ MISSING | Not yet built | [ONBOARD] |
| Command pipeline UI | ⬜ MISSING | Not yet built | [ONBOARD] |
| HUD frame / dark background | ✅ MATCHES | Admin uses correct dark shell | [BUILD] |

**Overall admin drift: LOW — component correct, control systems not wired**

---

## ARTIST BOOKING DASHBOARD (PDF Pages 4–5)

| Element | Status | Notes | Phase |
|---|---|---|---|
| ArtistBookingDashboard component | ✅ MATCHES | Matches PDF layout | [BUILD] |
| Booking cards/tiles | ✅ MATCHES | Card shell correct | [BUILD] |
| Calendar/schedule view | 🟡 CLOSE | ContentCalendar designed, not wired | [ONBOARD] |
| Earnings visibility | ⬜ MISSING | EarningsDashboard not yet wired | [ONBOARD] |
| Venue selector | ⬜ MISSING | VenueSelector UI not yet built | [ONBOARD] |
| HUD panel framing | ✅ MATCHES | Correct dark HUD with gold accents | [BUILD] |

**Overall booking drift: LOW — main component matches, sub-systems missing**

---

## AUDIENCE ROOM (PDF Pages 7 + 15)

| Element | Status | Notes | Phase |
|---|---|---|---|
| AudienceRoom component | ✅ MATCHES | Matches PDF layout | [BUILD] |
| Seat grid visible | 🟡 CLOSE | SeatGrid designed, needs live room binding | [BUILD] |
| Stage/screen surface | 🟡 CLOSE | StageSurface designed, not wired | [BUILD] |
| Crowd animation layer | ⬜ MISSING | CrowdLayer designed, not implemented | [ONBOARD] |
| Lighting rig effects | ⬜ MISSING | LightingRig designed, not implemented | [POLISH] |
| Energy meter | ⬜ MISSING | TierProgressBar exists, energy version missing | [ONBOARD] |
| Julius overlay | ⬜ MISSING | JuliusOverlay designed, not wired | [ONBOARD] |
| VEX overlay | ⬜ MISSING | VEXOverlay designed, not wired | [ONBOARD] |
| Tier transformation overlay | ⬜ MISSING | TransformationOverlay not implemented | [ONBOARD] |
| Room tier color (green/bronze/gold) | ⬜ MISSING | Color system not yet applied to rooms | [ONBOARD] |

**Overall audience room drift: HIGH — components exist but none wired**

---

## PREMIUM FRONT ROW (PDF Page 8)

| Element | Status | Notes | Phase |
|---|---|---|---|
| VIP seat visual treatment | ⬜ MISSING | Not yet implemented | [ONBOARD] |
| Crystal/diamond seat glow | ⬜ MISSING | Prestige overlay system designed, not built | [POLISH] |
| VIP Box camera angle | ⬜ MISSING | Camera system designed, not implemented | [POLISH] |
| Elite badge above seat | ⬜ MISSING | Tier badge system designed, not built | [ONBOARD] |

**Overall VIP drift: HIGH — all POLISH/ONBOARD phase**

---

## WINNER'S HALL (PDF Page 9)

| Element | Status | Notes | Phase |
|---|---|---|---|
| WinnersHall component | ✅ MATCHES | Component built per PDF | [BUILD] |
| Trophy/award displays | 🟡 CLOSE | Component exists, needs data wiring | [ONBOARD] |
| Gold spotlight treatment | 🟡 CLOSE | Lighting spec exists, not implemented | [ONBOARD] |
| Winner badge on profile | ⬜ MISSING | Tier badge system not yet built | [ONBOARD] |

---

## GAME NIGHT (PDF Page 10)

| Element | Status | Notes | Phase |
|---|---|---|---|
| GameNightHub component | ✅ MATCHES | Component matches PDF layout | [BUILD] |
| Scoreboard UI | 🟡 CLOSE | ScoreboardOverlay designed, not wired | [ONBOARD] |
| Game timer/round UI | ⬜ MISSING | Not yet built | [ONBOARD] |
| Host panel in game | 🟡 CLOSE | HostAvatar designed, not in game context | [ONBOARD] |
| Crowd reaction in game | ⬜ MISSING | CrowdLayer not wired to game events | [ONBOARD] |

---

## DEAL OR FEUD (PDF Pages 12–16)

| Element | Status | Notes | Phase |
|---|---|---|---|
| DealOrFeud component | ✅ MATCHES | Component built per PDF | [BUILD] |
| Prize doors/reveal panels | ⬜ MISSING | RevealEngine designed, not implemented | [ONBOARD] |
| Dual contestant zones | 🟡 CLOSE | Layout correct, live wiring missing | [ONBOARD] |
| Bobby Stanley host presence | ⬜ MISSING | Host avatar not wired to this show | [ONBOARD] |
| VEX elimination sequence | ⬜ MISSING | VEX system designed, not wired | [ONBOARD] |
| Neon-split lighting (left/right) | ⬜ MISSING | Battle lighting system not implemented | [ONBOARD] |

---

## WATCH PARTY / CYPHER / LIVE ROOMS (PDF Pages 17–20)

| Element | Status | Notes | Phase |
|---|---|---|---|
| Watch party room entry | ⬜ MISSING | WatchParty designed, not built | [ONBOARD] |
| Cypher circle stage | ⬜ MISSING | Cypher layout designed, not implemented | [ONBOARD] |
| Neon Cypher Stage aesthetic | 🟡 CLOSE | Color system defined, needs implementation | [ONBOARD] |
| Live cipher room feel | ⬜ MISSING | Raw brick loft room designed, not implemented | [ONBOARD] |
| Camera orbit (cypher) | ⬜ MISSING | Camera system designed, not implemented | [POLISH] |

---

## HUD / CANVAS / CARDS

| Element | Status | Notes | Phase |
|---|---|---|---|
| HUD shell (base) | ✅ MATCHES | hud-runtime package built | [BUILD] |
| Draggable card behavior | 🟡 CLOSE | Layout engine designed, not fully implemented | [ONBOARD] |
| Panel docking | ⬜ MISSING | Zone engine designed, not implemented | [ONBOARD] |
| Widget shell variants | 🟡 CLOSE | Shells designed in contracts, need application | [BUILD] |
| Z-layer system | 🟡 CLOSE | Specified in layout grammar, not enforced | [BUILD] |
| Neon glow borders on cards | 🟡 CLOSE | Tokens defined, need consistency check | [BUILD] |

---

## MOTION / ANIMATION

| Element | Status | Notes | Phase |
|---|---|---|---|
| Page enter/exit transitions | 🟡 CLOSE | Motion spec exists, not implemented | [ONBOARD] |
| Tier transformation (10-step) | ⬜ MISSING | Fully designed, not implemented | [ONBOARD] |
| Curtain open/close | ⬜ MISSING | CurtainEngine designed, not implemented | [ONBOARD] |
| Julius animations | ⬜ MISSING | Julius designed, no animation system yet | [ONBOARD] |
| Crowd wave/energy animations | ⬜ MISSING | CrowdAnimationEngine designed, not built | [ONBOARD] |
| Confetti burst | ⬜ MISSING | TransformationFX designed, not built | [POLISH] |
| Reduced motion fallback | ⬜ MISSING | Specified, not implemented | [ONBOARD] |

---

## TYPOGRAPHY + SPACING

| Element | Status | Notes | Phase |
|---|---|---|---|
| Bold title-first hierarchy | 🟡 CLOSE | tokens.css exists, consistent application TBD | [BUILD] |
| Neon orange headings | 🟡 CLOSE | Color token defined, application inconsistent | [BUILD] |
| Card body text sizing | 🟡 CLOSE | Specified but not enforced | [BUILD] |
| Consistent line heights | 🟡 CLOSE | Defined, consistency check needed | [BUILD] |
| Mobile font scaling | ⬜ MISSING | Not yet specified per component | [ONBOARD] |

---

## DRIFT AUDIT SUMMARY

| Category | Matches | Close | Wrong/Missing | Drift Level |
|---|---|---|---|---|
| Homepage | 0 | 6 | 4 | MODERATE |
| Magazine | 2 | 5 | 3 | LOW |
| Admin | 2 | 3 | 3 | LOW |
| Booking Dashboard | 3 | 2 | 1 | LOW |
| Audience Room | 1 | 2 | 7 | HIGH |
| VIP/Premium | 0 | 0 | 4 | HIGH |
| Game Night | 1 | 2 | 2 | MODERATE |
| Deal or Feud | 1 | 1 | 4 | MODERATE |
| Cypher/Watch Party | 0 | 1 | 4 | HIGH |
| HUD/Cards | 2 | 3 | 1 | LOW |
| Motion | 0 | 1 | 6 | HIGH |
| Typography | 0 | 4 | 1 | LOW |

**OVERALL PLATFORM DRIFT: MODERATE → Manageable if wired in correct order**

Most components exist. Most drift is from unwired systems, not wrong design.

---

*Repo PDF Drift Audit v1.0 — BerntoutGlobal XXL*
