# FIRST MEMBER ONBOARDING GUIDE
# TMI Platform — BerntoutGlobal XXL
# Step-by-step for onboarding the first members after going live.

---

## PART 1 — ADMIN SETUP (do this before anyone else)

### Create the first admin user

Option A: Direct DB insert via Prisma Studio
```powershell
cd "C:\Users\Admin\Documents\BerntoutGlobal XXL\tmi-platform"
$env:DATABASE_URL = "YOUR_PRODUCTION_DB_URL"
npx prisma studio
```
In Prisma Studio:
1. Open the `User` table
2. Add new record:
   - email: `admin@berntoutglobal.com` (or your admin email)
   - role: `admin`
   - name: `Marcel` (or your name)
   - password: (hashed — use bcrypt hash)
3. Save

Option B: Seed script (if you have one in `packages/db/prisma/seed.ts`)
```powershell
npx prisma db seed
```

Option C: Register normally then elevate to admin
```powershell
# After registering at /auth/register, update role in DB:
# UPDATE users SET role = 'admin' WHERE email = 'youremail@domain.com'
```

### Verify admin access
1. Go to `https://yourdomain.com/auth`
2. Log in with admin credentials
3. Navigate to `https://yourdomain.com/contest/admin`
4. Should load — NOT redirect to /auth
5. Create a test season (confirm August 8 date picker minimum enforced)

---

## PART 2 — FIRST ARTIST ONBOARDING

### What to tell the first artist

Send them this message:
```
Welcome to The Musician's Index!

Here's how to get started:

1. Register at: https://yourdomain.com/auth/register
2. Complete your profile (name, bio, genre, photo)
3. Connect your social links
4. You'll land on your artist dashboard

To enter the contest:
- Go to: https://yourdomain.com/contest/qualify
- You need 10 local sponsors + 10 major sponsors to qualify
- Contest opens August 8 every year
- Browse sponsor packages at: https://yourdomain.com/contest/sponsors

Your profile will show a contest banner once you start building your sponsor roster.
```

### What the artist sees (verify these work)
1. `/auth/register` → registration form
2. Onboarding flow → profile setup → dashboard
3. Artist profile → ContestBanner visible (if eligible)
4. `/contest/qualify` → sponsor progress (0/20)
5. `/contest/sponsors` → package tiers displayed
6. SponsorInvitePanel → can browse/invite sponsors

### What to check after first artist registers
- [ ] User appears in DB with role='artist'
- [ ] Artist profile page renders at `/artists/[id]` or similar
- [ ] Contest banner component visible on profile
- [ ] `/contest/qualify` shows correct 0/10 + 0/10 progress
- [ ] No console errors on any page

---

## PART 3 — FIRST SPONSOR ONBOARDING

### What to tell the first sponsor

```
Welcome to The Musician's Index Sponsor Program!

You can back emerging musicians and get visibility to our audience.

Sponsor packages:
• Local Bronze - $50/season
• Local Silver - $100/season
• Local Gold - $250/season
• Major Bronze - $1,000/season
• Major Silver - $5,000/season
• Major Gold - $10,000/season
• Title Sponsor - $25,000+/season

To get started:
1. Register at: https://yourdomain.com/auth/register
2. Select "Sponsor" as your account type
3. Browse artists at: https://yourdomain.com/contest/leaderboard
4. Back an artist by clicking Sponsor on their profile
5. Select a package and complete payment

Your logo and name appear on the artist's profile and during contest events.
```

### What to check after first sponsor registers
- [ ] Sponsor account created with role='sponsor'
- [ ] Sponsor can view artist profiles
- [ ] Sponsor can view package options
- [ ] Sponsor invitation creates a SponsorContribution record in DB
- [ ] Artist's qualify page updates sponsor count

---

## PART 4 — FIRST FAN ONBOARDING

### What to tell the first fan

```
Welcome to The Musician's Index!

Discover and support local and emerging musicians.

• Browse contest: https://yourdomain.com/contest
• See leaderboard: https://yourdomain.com/contest/leaderboard
• Watch host: https://yourdomain.com/contest/host
• Register to vote: https://yourdomain.com/auth/register

Voting opens when the contest season goes live on August 8!
```

### What to check after first fan registers
- [ ] Fan account created with role='fan'
- [ ] Fan can browse /contest
- [ ] Fan can view /contest/leaderboard
- [ ] Fan can view artist profiles
- [ ] Fan cannot access /contest/admin (redirects to /auth)

---

## PART 5 — FIRST CONTEST SEASON SETUP (Admin)

After admin is set up, create the first season:

1. Go to `/contest/admin/seasons`
2. Click "Create New Season"
3. Fill in:
   - Name: `Grand Platform Contest — Season 1`
   - Registration Start Date: `August 8, [current year]` (enforced by UI)
   - Registration End Date: (set appropriately)
   - Finals Date: (set appropriately)
4. Status: Set to `upcoming` until August 8
5. Save

Verify:
- [ ] Season appears in admin overview
- [ ] SeasonCountdownPanel on /contest shows countdown to August 8
- [ ] `/contest/qualify` references the active season

---

## PART 6 — ONBOARDING CHECKLIST (mark after each first member)

| Role | Name | Email | Date | Status |
|---|---|---|---|---|
| Admin | Marcel | admin@berntoutglobal.com | | |
| Artist 1 | | | | |
| Artist 2 | | | | |
| Sponsor 1 | | | | |
| Fan 1 | | | | |

---

## PART 7 — WHAT TO WATCH FOR (first 24 hours)

Check these every hour after first members join:

**Performance**
- Page load under 3 seconds
- No API timeouts (Render free tier can spin down — consider keeping alive)
- No DB connection errors

**Errors to watch in Render logs**
```
# API errors to watch for:
DATABASE_URL not set → check env vars
Prisma connection error → DB might need migration
JWT_SECRET missing → check env vars
CORS error → check CORS_ORIGIN env var
```

**Common first-day fixes**
| Problem | Fix |
|---|---|
| API returns 502 | Render is cold starting — wait 30 sec, retry |
| Images not loading | Check NEXT_PUBLIC_API_URL is set correctly |
| Login fails with 500 | Check JWT_SECRET is set in Render env vars |
| /contest/admin accessible without login | Check admin/layout.tsx guard is deployed |
| Contest season shows wrong date | Check CONTEST_REGISTRATION_DAY=8 env var |

---

## PART 8 — FIRST WEEK GROWTH PLAN

| Day | Goal |
|---|---|
| Day 1 | Admin + 1 artist + 1 fan live |
| Day 2 | 3 artists registered, first sponsor contacted |
| Day 3 | First sponsor backing confirmed |
| Day 4 | 5 artists, 2 sponsors, 5 fans |
| Day 5 | First contest admin test-run |
| Day 6 | Audio/video test with Ray Journey host |
| Day 7 | Announce official opening with full details |

---

*BerntoutGlobal XXL | TMI Platform | First Member Onboarding Guide | Phase 18*
