# Universal Profile Runtime Architecture (LOCKED 2026-06-25)

**Authority**: Build Director (Marcel Dickens)  
**Status**: Replaces "Phase 2A/2B CRM" approach — architectural refinement  
**Impact**: Reduces duplicate code by ~60%, improves consistency, cleaner maintenance

---

## The Pattern

Instead of building six separate CRM systems (Performer, Fan, Venue, Promoter, Writer, Sponsor), build ONE Universal Profile Runtime with:

1. **Shared Core Layers** (every profile has these)
2. **Role-Specific Modules** (attach to the core)

```
┌─────────────────────────────────────────────────┐
│    UNIVERSAL PROFILE RUNTIME                    │
│  (One implementation used by all 6 roles)       │
├─────────────────────────────────────────────────┤
│                                                 │
│  Shared Layer 1: IDENTITY                       │
│  ├─ Avatar + Verification                       │
│  ├─ Rank, XP, Membership                        │
│  ├─ Badges, Achievements                        │
│  ├─ Followers, Following                        │
│  └─ Basic Stats                                 │
│                                                 │
│  Shared Layer 2: SOCIAL                         │
│  ├─ Activity Timeline                           │
│  ├─ Friends/Network                             │
│  ├─ Notifications                               │
│  └─ AI Assistant                                │
│                                                 │
│  Shared Layer 3: MEDIA                          │
│  ├─ Media Locker                                │
│  ├─ Playlists                                   │
│  ├─ Memory Wall                                 │
│  └─ Gallery                                     │
│                                                 │
│  Shared Layer 4: COMMERCE                       │
│  ├─ Inventory                                   │
│  ├─ Chat/Messaging                              │
│  ├─ Settings                                    │
│  └─ Billing/Account                             │
│                                                 │
│  Shared Layer 5: LIVE PRESENCE                  │
│  ├─ Live Status                                 │
│  ├─ Current Room                                │
│  ├─ Real-time Activity                          │
│  └─ Viewers/Followers Online                    │
│                                                 │
└─────────────────────────────────────────────────┘
         ↓
    Role Modules Attach Here
         ↓
┌─────────────────────────────────────────────────┐
│  ROLE-SPECIFIC MODULES (Only differ by role)   │
├─────────────────────────────────────────────────┤
│                                                 │
│  Performer Module          Fan Module            │
│  ├─ Revenue Center        ├─ Collections       │
│  ├─ Bookings              ├─ Support History   │
│  ├─ Concerts              ├─ Upcoming Tickets  │
│  ├─ Music                 ├─ Reward Progress   │
│  ├─ Sponsors              ├─ Purchase History  │
│  ├─ Analytics             ├─ Groups/Friends    │
│  ├─ Contracts             └─ Statistics        │
│  └─ Payout Center                              │
│                                                 │
│  Venue Module              Writer Module        │
│  ├─ Event Calendar        ├─ Drafts            │
│  ├─ Booking Mgmt          ├─ Published         │
│  ├─ Capacity              ├─ Scheduled         │
│  ├─ Staff Roster          ├─ Assignments       │
│  ├─ Equipment             ├─ Analytics         │
│  ├─ Tickets               └─ Royalties         │
│  └─ Financials                                 │
│                                                 │
│  Promoter Module           Sponsor Module       │
│  ├─ Campaigns             ├─ Ad Campaigns      │
│  ├─ Artist Roster         ├─ Performance       │
│  ├─ Venues                ├─ Creative Assets   │
│  ├─ Contracts             ├─ Partnerships      │
│  ├─ Budget Tools          ├─ Billing           │
│  └─ Settlements           └─ ROI Dashboard     │
│                                                 │
│  Admin Module                                   │
│  ├─ Platform Revenue                           │
│  ├─ Active Rooms                               │
│  ├─ User Management                            │
│  ├─ Moderation                                 │
│  ├─ Fraud Detection                            │
│  ├─ Reports                                    │
│  ├─ System Health                              │
│  └─ Predictions                                │
│                                                 │
└─────────────────────────────────────────────────┘
```

---

## Shared Core: What Every Profile Has

These 16 elements appear on EVERY profile (Performer, Fan, Venue, Promoter, Writer, Sponsor, Admin):

### Identity
```tsx
<IdentityModule
  avatar={user.avatar}
  name={user.displayName}
  verified={user.isVerified}
  rank={user.rank}
  xp={user.xp}
  membership={user.tier}
  badges={user.badges}
  followers={user.followerCount}
  following={user.followingCount}
/>
```

### Social
```tsx
<SocialModule
  activityTimeline={user.activity}
  friends={user.friends}
  notifications={user.notifications}
  aiAssistant={user.aiHelper}
/>
```

### Media
```tsx
<MediaModule
  mediaLocker={user.mediaLocker}
  playlists={user.playlists}
  memoryWall={user.memories}
  gallery={user.gallery}
/>
```

### Live Presence
```tsx
<LivePresenceModule
  isLive={user.isLiveNow}
  currentRoom={user.currentRoom}
  viewerCount={user.liveViewers}
  followersOnline={user.followersOnline}
/>
```

### Settings
```tsx
<SettingsModule
  privacy={user.privacySettings}
  billing={user.billingInfo}
  notifications={user.notificationPrefs}
  connected={user.connectedApps}
/>
```

---

## Role-Specific Modules: Architecture Pattern

Each role gets dedicated modules. Here's the pattern:

### Example: Performer Module

```tsx
<PerformerModule user={performer}>
  <RevenueCenter
    tips={today.tips}
    merchandise={today.merch}
    ticketSales={today.tickets}
    subscriptions={today.subs}
    sponsorships={today.sponsors}
    analytics={analyticsData}
  />
  <BookingsManager
    requests={bookingRequests}
    scheduled={scheduledEvents}
    completed={pastEvents}
  />
  <ConcertsModule
    upcoming={upcomingShows}
    past={pastShows}
    statistics={showStats}
  />
  <MusicModule
    uploads={tracks}
    albums={albums}
    releases={releases}
    streams={streamingStats}
  />
  <SponsorsModule
    active={activeDealsList}
    revenue={sponsorRevenue}
    brands={sponsorBrands}
  />
  <AnalyticsModule {...deepAnalytics} />
  <ContractsModule {...contracts} />
  <PayoutCenter {...payouts} />
</PerformerModule>
```

---

## Deep Analytics: Business Intelligence

This is the biggest missing system. Instead of:

```
Revenue: $6,320
```

Every role-specific profile should show:

### Performer Analytics

```
┌─────────────────────────────────────────┐
│  REVENUE INTELLIGENCE                   │
├─────────────────────────────────────────┤
│                                         │
│  Today's Tips                 $245      │
│  Today's Merchandise          $89       │
│  Today's Ticket Sales         $0        │
│  Today's Sponsors             $120      │
│  Today's Memberships          $50       │
│                                         │
│  Total Today                  $504      │
│                                         │
│  This Week                    $3,120    │
│  This Month                   $12,450   │
│  Projected This Year          $152,200  │
│                                         │
├─────────────────────────────────────────┤
│  AUDIENCE INTELLIGENCE                  │
├─────────────────────────────────────────┤
│                                         │
│  Returning Fans               342 (68%) │
│  New Fans                     162 (32%) │
│  Average Watch Time           18 min    │
│  Peak Viewers                 542       │
│  Concurrent Now               187       │
│  Countries Watching           24        │
│  Top Country                  USA (42%) │
│                                         │
├─────────────────────────────────────────┤
│  CONVERSION INTELLIGENCE                │
├─────────────────────────────────────────┤
│                                         │
│  View → Tip Rate              12.3%     │
│  View → Subscribe Rate        3.4%      │
│  View → Purchase Rate         5.8%      │
│  Average Gift Value           $22.50    │
│  Average Subscriber Lifetime  $156      │
│  Most Valuable Fan Gift       $500      │
│                                         │
├─────────────────────────────────────────┤
│  GROWTH INTELLIGENCE                    │
├─────────────────────────────────────────┤
│                                         │
│  New Followers This Week      +87       │
│  Follower Growth (30-day)     +340 (+8%)|
│  Engagement Growth (30-day)   +15%      │
│  Revenue Growth (YoY)         +127%     │
│  Watch Time Growth (30-day)   +22%      │
│                                         │
├─────────────────────────────────────────┤
│  BOOKING INTELLIGENCE                   │
├─────────────────────────────────────────┤
│                                         │
│  Pending Requests             3         │
│  Scheduled Bookings           2         │
│  Cancellation Rate (30-day)   2.1%      │
│  Average Booking Value        $450      │
│  Next Booking                 2026-07-15│
│                                         │
└─────────────────────────────────────────┘
```

### Fan Analytics

```
┌─────────────────────────────────────────┐
│  YOUR STATS                             │
├─────────────────────────────────────────┤
│                                         │
│  Level                        Silver    │
│  XP Progress                  8,420/10K │
│  Badges Earned                12/25     │
│  Days on Platform             247       │
│                                         │
├─────────────────────────────────────────┤
│  SUPPORT INTELLIGENCE                   │
├─────────────────────────────────────────┤
│                                         │
│  Total Tips Given             $445      │
│  Favorite Artist Tips         $180      │
│  Artists Supported            12        │
│  Total Subscriptions          3         │
│  Monthly Spend                $67       │
│                                         │
├─────────────────────────────────────────┤
│  WATCH INTELLIGENCE                     │
├─────────────────────────────────────────┤
│                                         │
│  Shows Attended               42        │
│  Total Watch Time             87 hours  │
│  Favorite Genre               Hip-Hop   │
│  Most-Watched Artist          John Doe  │
│  Rooms Joined This Month      24        │
│  Average Session Length       2.1 hrs   │
│                                         │
├─────────────────────────────────────────┤
│  COLLECTION INTELLIGENCE                │
├─────────────────────────────────────────┤
│                                         │
│  Favorite Artists             18        │
│  Saved Playlists              7         │
│  Memory Wall Captures         156       │
│  Items in Inventory           42        │
│  Purchases This Month         $89       │
│                                         │
└─────────────────────────────────────────┘
```

### Sponsor Analytics

```
┌─────────────────────────────────────────┐
│  CAMPAIGN PERFORMANCE                   │
├─────────────────────────────────────────┤
│                                         │
│  Active Campaigns              2        │
│  Total Spend (Month)           $4,500   │
│  Total Impressions             287K     │
│  Total Clicks                  2,340    │
│  Total Conversions             156      │
│  CTR                           0.82%    │
│  Conversion Rate               6.7%     │
│  Cost Per Click                $1.92    │
│  Cost Per Conversion           $28.85   │
│                                         │
├─────────────────────────────────────────┤
│  AUDIENCE INTELLIGENCE                  │
├─────────────────────────────────────────┤
│                                         │
│  Age 18-24                     34%      │
│  Age 25-34                     45%      │
│  Age 35-44                     18%      │
│  Age 45+                       3%       │
│  Female                        52%      │
│  Male                          46%      │
│  Non-binary                    2%       │
│  Top Location                  USA (68%)│
│  Top Genre Interest            Hip-Hop  │
│                                         │
├─────────────────────────────────────────┤
│  TOP PERFORMING                         │
├─────────────────────────────────────────┤
│                                         │
│  Top Room                     Arena     │
│  Top Artist                   John Doe  │
│  Top Placement                Billboard │
│  Best Conversion Time         8-10pm    │
│  Best Conversion Day          Friday    │
│                                         │
├─────────────────────────────────────────┤
│  HEAT MAP VISUALIZATION                 │
├─────────────────────────────────────────┤
│                                         │
│  Homepage                     High      │
│  Artist Profiles              Very High │
│  Live Rooms                   Medium    │
│  Billboards                   Very High │
│  Discovery                    Low       │
│                                         │
└─────────────────────────────────────────┘
```

### Executive/Admin Analytics

```
┌─────────────────────────────────────────┐
│  PLATFORM HEALTH (REAL-TIME)            │
├─────────────────────────────────────────┤
│                                         │
│  Servers                      12/12 ✓   │
│  CPU Average                  34%       │
│  Memory Average               61%       │
│  Database                     Health ✓  │
│  CDN                          All Up ✓  │
│  Active Connections           12,340    │
│                                         │
├─────────────────────────────────────────┤
│  REVENUE (TODAY)                        │
├─────────────────────────────────────────┤
│                                         │
│  Tips                         $2,450    │
│  Memberships                  $5,600    │
│  Tickets                      $12,300   │
│  Sponsors                     $3,200    │
│  Merchandise                  $1,890    │
│  Bookings                     $4,500    │
│  Ads                          $890      │
│                                         │
│  TOTAL TODAY                  $30,830   │
│  Projected Week               $215,810  │
│  Projected Month              $924,900  │
│                                         │
├─────────────────────────────────────────┤
│  PLATFORM ACTIVITY                      │
├─────────────────────────────────────────┤
│                                         │
│  Active Users                 8,420     │
│  Live Rooms                   42        │
│  People Live Now              2,340     │
│  Avg Session Length           1.8 hrs   │
│  New Users (24h)              234       │
│  Retention (Day 1)            68%       │
│  Retention (Day 7)            42%       │
│                                         │
├─────────────────────────────────────────┤
│  MODERATION                             │
├─────────────────────────────────────────┤
│                                         │
│  Reports Pending              7         │
│  Avg Resolution Time          2.3 hrs   │
│  False Positives (30-day)     0.3%      │
│  Ban Rate (30-day)            0.12%     │
│  Chat Violations              45        │
│  Behavior Violations          12        │
│                                         │
├─────────────────────────────────────────┤
│  GROWTH PREDICTIONS                     │
├─────────────────────────────────────────┤
│                                         │
│  Projected Day 30 Users       18,450    │
│  Projected Day 90 Users       42,300    │
│  Trending Genres              Hip-Hop   │
│  Trending Artists             12 Rising │
│  Breakout Rooms               5 This Wk │
│                                         │
└─────────────────────────────────────────┘
```

---

## Implementation Strategy

### 1. Build Universal Core (Week 1-2)

Create ONE implementation used by all roles:

```
lib/profiles/universal/
├── IdentityModule.tsx          (Shared)
├── SocialModule.tsx             (Shared)
├── MediaModule.tsx              (Shared)
├── LivePresenceModule.tsx       (Shared)
├── SettingsModule.tsx           (Shared)
└── AnalyticsModule.tsx          (Base, customized per role)
```

### 2. Attach Role Modules (Week 3-5)

Each role gets specialized modules that use the shared core:

```
lib/profiles/roles/
├── performer/
│   ├── RevenueCenter.tsx
│   ├── BookingsManager.tsx
│   ├── ConcertsModule.tsx
│   ├── MusicModule.tsx
│   ├── SponsorsModule.tsx
│   ├── AnalyticsModule.tsx      (Extends base with performer-specific BI)
│   ├── ContractsModule.tsx
│   └── PayoutCenter.tsx
├── fan/
│   ├── CollectionsModule.tsx
│   ├── SupportHistoryModule.tsx
│   ├── UpcomingTicketsModule.tsx
│   ├── RewardProgressModule.tsx
│   ├── PurchaseHistoryModule.tsx
│   ├── GroupsModule.tsx
│   └── AnalyticsModule.tsx      (Extends base with fan-specific BI)
├── venue/
│   ├── EventCalendar.tsx
│   ├── BookingsMgmt.tsx
│   ├── CapacityManager.tsx
│   ├── StaffRoster.tsx
│   ├── EquipmentInventory.tsx
│   ├── TicketsDashboard.tsx
│   ├── FinancialReports.tsx
│   └── AnalyticsModule.tsx      (Extends base with venue-specific BI)
├── promoter/
│   ├── CampaignManager.tsx
│   ├── ArtistRoster.tsx
│   ├── VenueManager.tsx
│   ├── ContractsManager.tsx
│   ├── BudgetTools.tsx
│   ├── SettlementsModule.tsx
│   └── AnalyticsModule.tsx      (Extends base with promoter-specific BI)
├── writer/
│   ├── DraftsModule.tsx
│   ├── PublishedModule.tsx
│   ├── ScheduledModule.tsx
│   ├── AssignmentsModule.tsx
│   ├── RoyaltiesModule.tsx
│   └── AnalyticsModule.tsx      (Extends base with writer-specific BI)
├── sponsor/
│   ├── CampaignBuilder.tsx
│   ├── CreativeAssets.tsx
│   ├── PerformanceMetrics.tsx
│   ├── PartnershipManager.tsx
│   ├── BillingModule.tsx
│   └── AnalyticsModule.tsx      (Extends base with sponsor-specific BI)
└── admin/
    ├── RevenueIntelligence.tsx
    ├── ActivityDashboard.tsx
    ├── UserManagement.tsx
    ├── ModerationQueue.tsx
    ├── FraudDetection.tsx
    ├── ReportsCenter.tsx
    ├── SystemHealth.tsx
    └── PredictionsModule.tsx
```

### 3. Result

One profile pattern used by seven role types:

```tsx
<UniversalProfile
  user={user}
  role={user.role}
>
  <SharedIdentity />
  <SharedSocial />
  <SharedMedia />
  <SharedLivePresence />
  <SharedSettings />
  
  <RoleModule role={user.role} />  // Performer? Fan? Venue? etc.
</UniversalProfile>
```

---

## Benefits

✅ **~60% less code** — One shared implementation, not six separate systems  
✅ **Consistent UX** — Identity/Social/Media identical across all roles  
✅ **Easier maintenance** — Bug fixes in shared module fix it for all roles  
✅ **Faster development** — Build shared core once, then attach modules  
✅ **Better data integrity** — No duplicate sources of truth  
✅ **Scalable** — Easy to add new roles (Admin, Coach, etc.)

---

## Timeline Impact

- **Week 1-2**: Build shared core + Phase 1 Live Session Chain
- **Week 3-5**: Attach role modules (Performer, Fan, Venue, Promoter, Writer, Sponsor)
- **Same modules used** by Admin dashboard with executive-specific analytics

---

## Lockdown

This Universal Profile Runtime pattern replaces the previous "Phase 2A + 2B" approach.

It is the canonical architecture for all profile work.

No profile should be built outside this pattern.

**This is locked.**
