# ARTIST_CREATION_CHAIN.md
## Every Step When an Artist Joins the Platform
### BerntoutGlobal XXL / The Musician's Index

---

## TRIGGER: User registers with role=artist

```
Step 1: AUTH
  POST /api/auth/register { email, password, role:'artist' }
  → User record created
  → Session created
  → JWT issued
  → Redirect → /onboarding/artist

Step 2: ONBOARDING
  /onboarding/artist → artist fills: stageName, genre, city
  POST /api/onboarding { stageName, genre, city }
  → OnboardingComplete = true
  → Redirect → /dashboard/artist

Step 3: PROFILE AUTO-CREATE
  Triggered by: onboarding completion
  pipeline: artist-creation-pipeline
  Actions:
    → CREATE Profile { userId, slug: slugify(stageName), displayName: stageName }
    → CREATE ArtistProfile { profileId, genre, city }
    → CREATE Wallet { userId, availableBalance:0, fanCredits:0 }
    → CREATE StreamWinScore { userId, weeklyScore:0 }
    → CREATE UserSettings { userId, defaults }
    → CREATE Station { artistId, name: stageName + " Station", slug: profileSlug }
    → ADD to rankingPool (season-management-bot picks up)
    → ADD to discoveryPool (viewers:0 → position 1 in lobby wall)
    → NOTIFY: editorial-assembly-bot (new artist available for magazine rotation)

Step 4: ARTICLE AUTO-CREATE
  Triggered by: Profile.status = 'active'
  pipeline: article-auto-create-pipeline
  Actions:
    → CREATE Article { authorId: userId, title: stageName + " — Artist Profile", status: 'draft' }
    → SET article.slug = profileSlug + '-official'
    → SET article.artistStationLink = '/stations/' + stationSlug
    → ADD ART_INLINE_1 slot to article
    → SET article.status = 'published' (if auto-publish enabled for tier)
    → ADD to search index
    → ADD to magazine rotation pool

Step 5: MEDIA FOLDER INIT
  → CREATE media library entry for artist
  → SET storage quota based on tier (1GB free, 5GB starter, etc.)

Step 6: RANKING INIT
  → season-management-bot adds artist to current season leaderboard
  → Initial rank: last position (discovery-first law)
  → ranking-bot schedules first ranking calculation

Step 7: BILLING INTEGRITY CHECK
  → billing-integrity-bot checks if email matches PERMANENT_DIAMOND_USERS
  → If yes: set tier = diamond, set permanentDiamond = true
  → Logs: "Diamond status verified for [email]"
  → billing-integrity-bot will re-verify every 4 hours forever

Step 8: COACHING NOTES INIT
  → coaching engine evaluates initial conditions
  → First note: "Complete Your Artist Profile" (profile_completeness < 80%)
  → Second note: "Go Live This Week" (no_live_session_this_week)
  → Notes appear on /dashboard/artist immediately

Step 9: NOTIFICATION
  → Welcome email sent via Resend (welcome.template)
  → In-app notification: "Your artist profile is live!"
  → Station is live at /stations/[slug]

TOTAL TIME: < 2 seconds (all steps except email are synchronous or fast async)
```

---

## WHAT MUST EXIST IN CODE FOR THIS CHAIN

```
✅ POST /api/auth/register
✅ POST /api/onboarding
→  artist-creation-pipeline.ts
→  article-auto-create-pipeline.ts
→  Prisma models: User, Profile, ArtistProfile, Wallet, StreamWinScore, UserSettings, Station, Article
→  billing-integrity-bot (runs every 4h, must be running before first artist registers)
→  ranking-bot
→  session-management
```
