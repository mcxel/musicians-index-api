# MINIMUM_LAUNCH_CONTENT_PACK.md
## Minimum Real Content Required Before Launch
### BerntoutGlobal XXL / The Musician's Index

Platform must not launch empty. Seed this content before first user onboarding.

---

## EDITORIAL CONTENT (Minimum)

```
[ ] 5 published music news articles (breaking, tabloid, artist spotlight mix)
[ ] 3 platform introduction articles ("What is TMI?", "For Artists", "For Fans")
[ ] 1 "How to use the lobby wall" help article
[ ] 1 "How the cypher works" help article
[ ] 1 "Community Guidelines" article (linked from signup)
[ ] 1 "Privacy Policy" page (linked from footer)
[ ] 1 "Terms of Service" page (linked from footer)
```

## ARTIST PROFILES (Minimum)

```
[ ] Marcel Dickens profile (Diamond — verified and hardcoded)
[ ] B.J. M Beat's profile (Diamond — verified and hardcoded)
[ ] 3–5 founding artist profiles from launch cohort
[ ] At least 1 DJ profile (for world dance party demo)
[ ] At least 1 producer/beat maker profile (for beat marketplace demo)
```

## BEATS (Minimum)

```
[ ] 5 published beats in Beat Marketplace from real producers
[ ] Genres covered: Hip Hop, Trap, R&B minimum
```

## ROOMS (Minimum for launch)

```
[ ] 1 active cypher room seeded (or confirmed launch event)
[ ] Default scenes loaded for all room types
[ ] Test: all room types can be created and joined
```

## FAN PROFILES (Minimum)

```
[ ] 2–3 test fan accounts (used for proof testing only, not public)
```

## EVENTS (Minimum)

```
[ ] 1 announced upcoming event (with ticket link)
[ ] 1 past event (for results/replay demo)
```

## HELP + SUPPORT (Minimum)

```
[ ] /help page renders with at least 3 FAQ items
[ ] Support email or form confirmed working
[ ] /status page confirmed reachable
```

## AVATAR STORE (Minimum)

```
[ ] At least 10 avatar items seeded (clothing, emotes, icons)
[ ] Points pack bundles configured in Stripe
```

## ADMIN VERIFICATION BEFORE LAUNCH

```
[ ] Marcel Dickens Diamond badge visible on /artists/berntmusic33
[ ] B.J. M Beat's Diamond badge visible on their profile
[ ] Lobby wall 0-viewer sort verified (pnpm test:discovery passes)
[ ] billing-integrity-bot manually triggered → both Diamond verified
[ ] Feature flags confirmed in correct state for launch
[ ] Big Ace (/admin/command-center) confirmed accessible
[ ] Owner profit dashboard accessible at /admin/finance/profit
```
