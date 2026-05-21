# TMI PACK 32 — MAGAZINE PORTAL + SCENE SYSTEM + REGISTRIES
## The Complete Visual + System Layer for Blackbox Integration
### BerntoutGlobal XXL / The Musician's Index

---

## WHAT THIS PACK ADDS

| File | What It Does |
|---|---|
| `magazine/homepage/page.tsx` | **Full TMI homepage** — all 6 belts, glowing magazine jump star, lobby wall, editorial belt, discovery belt, genre hexagons, countdown timer, advertiser belt, mobile nav. Matches magazine PDF exactly. |
| `magazine/magazine/page.tsx` | **"Welcome to The Musician's Index Magazine"** entry scene — fade-in headline, featured performer gateway with station link, news billboard grid, 6 section gateway cards. |
| `systems/design-tokens.ts` | Every color, font, spacing, border, glow, and density level as TypeScript constants. One source of truth for the entire visual system. |
| `systems/scene-registry.ts` | 18 named scenes (magazine, station, live-stage, neon-club, game-night, etc.) each with background, accent, audio loop, particle effect, density. |
| `systems/bot-registry.ts` | 35 bots with schedules, triggers, auto-approve limits, and Big Ace requirement flags. |
| `systems/pipeline-registry.ts` | 9 critical pipelines (article-publish, clip-generate, earnings-calculate, payout-process, fraud-score, etc.) with steps, retry rules, timeouts. |
| `systems/component-inventory.ts` | 60+ components organized by family — design system, homepage, magazine, monetization, party/games, clips. Reference for Copilot + Blackbox. |
| `systems/chain-inventory.md` | 8 platform chains documented: Magazine Entry, Artist Growth, Fan Discovery, Local Sponsor Loop, Live→Clip→Share, Contest→Crown, Advertiser Self-Serve, Owner Profit. |
| `routes/MASTER_ROUTE_MAP.md` | Every route (130+) organized by category: public, auth, dashboard, admin. |
| `prompts/BLACKBOX_PACK32_PROMPT.md` | Blackbox integration instructions for homepage + magazine + configs. |
| `prompts/COPILOT_PACK32_WIRING.md` | 5 specific wires: magazine chain, entry scene, article→station link, design tokens, scene system. |

---

## THE HOMEPAGE RULE

```
Homepage is a PORTAL, not a landing page.
Primary CTA = glowing magazine jump star → /magazine
Magazine front = "Welcome to The Musician's Index Magazine"
Next surface = Featured Performer Article
Next surface = News Billboard
Users can jump to any section via header chips at any time.
```

---

## PLATFORM STATS (cumulative across all packs)

| Layer | Count |
|---|---|
| Architecture docs | 90+ files (Packs 25-30) |
| Scaffold pages | 104+ files (Pack 31) |
| Systems/registries | 10 files (Pack 32) |
| Prompt files | 12 files (Packs 27-32) |
| Total routes | 130+ |
| Bots registered | 35 |
| Scenes registered | 18 |
| Platform chains | 8 |
| Components planned | 60+ |

---

## THE PERMANENT PLATFORM LAWS

```
1. Discovery-first: 0 viewers = position 1 in lobby ALWAYS
2. Diamond: Marcel Dickens + B.J. M Beat's — permanent, verified every 4h
3. Kids only talk to kids — canSendMessage() on ALL message flows
4. Max 8 tickets per buyer per event
5. Owner payouts from NET PROFIT only — never gross
6. TMI visual identity: #0D0520, Bebas Neue, cyan/gold/pink — NEVER generic SaaS
7. GET /api/ads/slot/:id ALWAYS returns 200 (never blank)
8. Party persists when members enter/exit rooms
9. Article pages ALWAYS link to artist station
10. Use "Stations" not "Channels" in all public UI
11. Coaching sticky notes on artist dashboard (thank your sponsor!)
12. No system should break another system — isolated modules only
```

*BerntoutGlobal LLC — "This is your stage, be original."*
