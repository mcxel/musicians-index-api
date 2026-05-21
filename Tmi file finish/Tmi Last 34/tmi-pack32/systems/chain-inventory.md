# CHAIN_INVENTORY.md
## Every Platform Chain — Documented and Protected
### BerntoutGlobal XXL / The Musician's Index

These chains are the platform's backbone. Every chain must work end-to-end before launch.

---

## CHAIN 1 — Magazine Entry (PRIMARY)
```
Homepage (star click)
→ /magazine  (WELCOME TO THE MUSICIAN'S INDEX MAGAZINE)
→ Featured Performer Article (/articles/[featured-slug])
→ News Billboard (/magazine/news)
→ Section branches (interviews, reviews, tutorials, trending)

Status: scaffold done → needs wiring
```

## CHAIN 2 — Artist Growth
```
/register → /onboarding/artist
→ /dashboard/artist
→ /profile/create/artist → /artists/[slug]
→ /articles/[slug]  (auto-creates on profile save)
→ /stations/[slug]  (linked from article AND profile)
→ /live/stage
→ /dashboard/artist/clips
→ /dashboard/artist/earnings

Status: scaffold done → needs wiring
```

## CHAIN 3 — Fan Discovery
```
/magazine
→ /articles/[slug]  (reads article)
→ /profile/artist/[slug]  (visits artist)
→ /stations/[slug]  (follows station)
→ /lobby  (joins live room)
→ /contest/[id]  (enters contest)
→ /dashboard/fan  (earns Stream & Win points)

Status: scaffold done → needs wiring
```

## CHAIN 4 — Local Sponsor Loop
```
Local store visits /advertise/packages
→ Creates sponsor campaign
→ Bot: sponsor-matching-bot pairs artist
→ Artist sees coaching sticky: "Thank your sponsor this week"
→ Artist promotes store in article/live/station
→ Store sees analytics at /stores/[slug]/analytics
→ Store renews campaign
→ Artist earnings increase → earnings panel updates

Status: scaffold done → needs wiring
```

## CHAIN 5 — Live → Clip → Share
```
Artist starts live show (/live/stage)
→ Show runs
→ Show ends → clip-generate-bot runs
→ Clip appears in /dashboard/artist/clips
→ Artist shares via ClipSharePanel
→ Share goes to Twitch/YouTube/external
→ New fans find artist via shared clip
→ New fans enter through /magazine (back to Chain 1)

Status: scaffold done → needs wiring
```

## CHAIN 6 — Contest → Crown
```
/contest → register
→ Battle in /live room (battle room)
→ Audience votes
→ leaderboard-bot updates /rankings
→ Weekly winner → cover-generator-bot places on homepage cover
→ Winner's article published → links to their station
→ crown-badge appears on artist profile permanently
→ Winner's earnings spike → renewal opportunity

Status: scaffold done → needs wiring
```

## CHAIN 7 — Advertiser Self-Serve
```
/advertise/packages → choose tier
→ /advertise/[surface] → pick slots
→ Upload creative (image/video)
→ Stripe checkout
→ Creative review queue (24h auto-approve for safe categories)
→ AdRenderer renders paid ad
→ Impression + click tracked
→ /dashboard/advertiser/analytics shows performance
→ renewal-bot sends offer 7 days before end

Status: scaffold done → needs wiring
```

## CHAIN 8 — Owner Profit Distribution
```
All revenue flows into Stripe platform account
→ earnings-calculate-bot runs hourly
→ owner-finance-bot runs Sunday midnight
→ Snapshot saved to OwnerProfitSnapshot
→ Big Ace reviews at /admin/finance/profit
→ Big Ace approves
→ PayPal transfer: berntmusic33@gmail.com (Marcel) + Jay Paul's destination
→ Receipt saved → OwnerPayoutAuditLog updated

Status: fully documented (Pack 26) → needs wiring
```
