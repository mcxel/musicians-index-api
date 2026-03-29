# GO_LIVE_SIGNOFF_PACK.md
## Final Signoff Checklist — Big Ace Signs Each Section Before Launch
### BerntoutGlobal XXL / The Musician's Index

No launch until all sections signed off.

---

## INFRASTRUCTURE SIGNOFF

```
[ ] API health: /health returns 200 {"status":"ok"}
[ ] API readyz: /api/readyz returns 200 {"db":"ok","redis":"ok"}
[ ] Web app: themusiciansindex.com returns 200
[ ] Cloudflare SSL: Full (Strict) confirmed
[ ] CDN: cdn.themusiciansindex.com serving media
[ ] WebSocket: wss://api.themusiciansindex.com/ws connects
[ ] Stripe webhooks: test events received and processed

Big Ace Signoff: _______________ Date: _______________
```

## AUTH SIGNOFF

```
[ ] New user signup flow works end-to-end
[ ] Login + session persists
[ ] Auth-protected routes redirect to /login
[ ] Admin-only routes reject non-admin users
[ ] Session expiry modal appears and re-login works

Big Ace Signoff: _______________ Date: _______________
```

## DISCOVERY SIGNOFF

```
[ ] pnpm test:discovery PASSES
[ ] Lobby wall: 0-viewer artist at position 1
[ ] Search: live rooms first, artists visible
[ ] Homepage belts: at least 3 active belts loading

Big Ace Signoff: _______________ Date: _______________
```

## PROFILE SIGNOFF

```
[ ] Marcel Dickens Diamond badge shows at /artists/berntmusic33
[ ] B.J. M Beat's Diamond badge shows on their profile
[ ] billing-integrity-bot confirms both Diamond are permanent
[ ] Artist profile auto-creates on signup
[ ] Media upload works on profile

Big Ace Signoff: _______________ Date: _______________
```

## LIVE ROOMS SIGNOFF

```
[ ] Arena room opens, audience joins
[ ] Turn queue advances correctly
[ ] Audio works in room (mic, hear others)
[ ] Scene changes propagate to all participants
[ ] Room closes cleanly
[ ] Empty/left room shows correct state

Big Ace Signoff: _______________ Date: _______________
```

## ECONOMY SIGNOFF

```
[ ] Tip payment: $1 tip completes → TipExplosionEffect fires → artist wallet updated
[ ] Fan credit: 100-credit bundle purchase → balance updates
[ ] Beat license: basic license purchase → download link works
[ ] Artist payout onboarding: Stripe Connect Express completes
[ ] Owner profit snapshot: /admin/finance/profit shows correct calculation

Big Ace Signoff: _______________ Date: _______________
```

## SAFETY SIGNOFF

```
[ ] Kid fan → kid performer: message ALLOWED
[ ] Adult → kid (unrelated): message BLOCKED (403)
[ ] Kid performer creation without parent approval: BLOCKED
[ ] Ticket purchase > 8: BLOCKED (429)
[ ] Bot ticket purchase (no Turnstile): BLOCKED (400)
[ ] Block user: blocked user cannot see profile
[ ] Report flow: report submits → enters moderation queue

Big Ace Signoff: _______________ Date: _______________
```

## CONTENT SIGNOFF

```
[ ] 5+ news articles published
[ ] Marcel Dickens profile published
[ ] B.J. M Beat's profile published  
[ ] 5+ beats in marketplace
[ ] 10+ avatar store items
[ ] Help page has 3+ FAQ items
[ ] Terms and Privacy pages accessible

Big Ace Signoff: _______________ Date: _______________
```

## ADMIN SIGNOFF

```
[ ] /admin/command-center loads with all 6 panels
[ ] /admin/feature-flags: toggle test flag → propagates within 60s
[ ] /admin/finance/profit: gross/fees/reserves/net all display
[ ] /admin/emergency: broadcast test message works
[ ] billing-integrity-bot: manual trigger succeeds

Big Ace Signoff: _______________ Date: _______________
```

## FINAL LAUNCH APPROVAL

```
Marcel Dickens:   _______________ Date: _______________
Big Ace:          _______________ (same person or authorized representative)

Platform launch approved for:
Website: themusiciansindex.com
API:     api.themusiciansindex.com
CDN:     cdn.themusiciansindex.com

"This is your stage, be original." — BerntoutGlobal LLC
```
