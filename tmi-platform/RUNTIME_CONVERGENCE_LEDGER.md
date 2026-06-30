# Runtime Convergence Ledger (LOCKED 2026-06-25)

**Authority**: Build Director (Marcel Dickens)  
**Purpose**: Visibility into status of every major runtime  
**Update Frequency**: Weekly (every Friday)  
**Audience**: All teams, all stakeholders

---

## What This Is

Instead of wondering "is this runtime done?", this ledger shows the status of every major system on the platform.

One glance answers:
- Which runtimes are stable?
- Which are under development?
- Which need consolidation?
- Which have duplicates?

---

## Status Symbols

| Symbol | Meaning |
|--------|---------|
| ✅ | Stable and frozen (no changes except bugs) |
| 🔄 | Active development (Weeks 1-8) |
| ⚠️ | Needs audit or consolidation |
| 🗑️ | Legacy (being replaced) |
| ❌ | Missing or broken |

---

## The Ledger (LIVE — Updated Weekly)

| Runtime | Canonical Location | Status | Notes | Owner | ETA |
|---------|-------------------|--------|-------|-------|-----|
| **Live Sessions** | `GlobalLiveSessionRegistry.ts` | 🔄 | Verify exists, consolidate duplicates, audit all 15 entry points | Claude | Week 2 |
| **User Profiles** | `lib/profiles/universal/` | 🔄 | Building shared core + role modules | Claude | Week 5 |
| **Identity** | `IdentityModule.tsx` | 🔄 | Shared across all 7 roles | Claude | Week 4 |
| **Social Graph** | `SocialGraphEngine.ts` | ⚠️ | Needs audit (followers, following, blocking) | Claude | Week 3 |
| **Revenue** | `UnifiedRevenueEngine.ts` | 🔄 | Consolidating: tips, merch, sponsors, tickets, bookings, ads, subscriptions, royalties, digital products | Claude | Week 6 |
| **Settlement** | `SettlementScheduler.ts` | 🔄 | Consolidating payouts from all revenue sources | Claude | Week 6 |
| **Tax Compliance** | `TaxComplianceEngine.ts` | 🔄 | Building tax withholding and form generation | Claude | Week 6 |
| **Inventory** | `InventoryRuntime.ts` | ⚠️ | Needs audit (avatar items, cosmetics, equipment) | Claude | Week 3 |
| **Memory Wall** | `MemoryRuntime.ts` | ⚠️ | Needs consolidation (moments, captures, timeline, sharing) | Claude | Week 4 |
| **Notifications** | `NotificationEngine.ts` | ⚠️ | Needs verification (email, push, in-app, DMs) | Claude | Week 3 |
| **Chat/Messaging** | `MessagingRuntime.ts` | ⚠️ | Needs verification (DMs, group threads, voice notes) | Claude | Week 3 |
| **Analytics** | `AnalyticsRuntime.ts` | 🔄 | Building business intelligence dashboards for all roles | Claude | Week 6 |
| **Live Audience** | `AudienceRuntime.ts` | ⚠️ | Needs consolidation (seating, presence, reactions) | Claude | Week 3 |
| **Avatar** | `AvatarRuntime.ts` | 🔄 | Active development (creation, customization, animation) | Claude | Week 7 |
| **Venue Life** | `VenueLifeEngine.ts` | 🔄 | Building stage staff, NPC behavior, operational realism | Claude | Week 7 |
| **Discovery** | `DiscoveryEngine.ts` | ⚠️ | Needs verification (ranking, freshness, personalization) | Claude | Week 3 |
| **Search** | `SearchEngine.ts` | ⚠️ | Needs verification (performers, rooms, articles, venues) | Claude | Week 3 |
| **XP/Rankings** | `XpActionRegistry.ts` | ⚠️ | Needs verification (all platform activities earning XP) | Claude | Week 2 |
| **Authentication** | `lib/auth/` | ✅ | Stable (verify exists, no changes needed) | Claude | Done |
| **Payments/Stripe** | `StripeEngine.ts` | ✅ | Stable (verify integration, no major changes) | Claude | Done |
| **CRM Performer** | `lib/profiles/roles/performer/` | 🔄 | Revenue, Bookings, Music, Sponsors, Analytics, Contracts, Payout | Claude | Week 5 |
| **CRM Fan** | `lib/profiles/roles/fan/` | 🔄 | Collections, Memories, Playlists, History, Purchases, Rewards | Claude | Week 5 |
| **CRM Venue** | `lib/profiles/roles/venue/` | 🔄 | Calendar, Bookings, Capacity, Staff, Equipment, Tickets, Financials | Claude | Week 5 |
| **CRM Promoter** | `lib/profiles/roles/promoter/` | 🔄 | Campaigns, Roster, Venues, Budget, Contracts, Settlements | Claude | Week 5 |
| **CRM Writer** | `lib/profiles/roles/writer/` | 🔄 | Drafts, Publishing, Assignments, Analytics, Royalties | Claude | Week 5 |
| **CRM Sponsor** | `lib/profiles/roles/sponsor/` | 🔄 | Campaigns, Assets, Partnerships, Billing, ROI | Claude | Week 5 |
| **CRM Admin** | `lib/profiles/roles/admin/` | 🔄 | Revenue, Activity, Users, Moderation, Reports, System Health | Claude | Week 5 |

---

## Status Definitions

### ✅ Stable
- System exists and works
- No major changes planned
- Frozen except for bug fixes
- Ready for production

### 🔄 Active Development
- System is being built or enhanced
- Work in progress (Weeks 1-8)
- Expect changes and refinements
- Will stabilize by end of week listed

### ⚠️ Needs Audit
- System exists but may have issues
- Duplicate implementations suspected
- Needs verification it works correctly
- Scheduled for audit in Pre-Cert phase

### 🗑️ Legacy
- Being replaced by canonical version
- Don't use for new work
- Old implementation, migration in progress
- Delete after migration verified

### ❌ Missing
- System doesn't exist
- Needs to be built
- Blocking other work if critical

---

## Weekly Update Process

**Every Friday (4pm)**:

1. Claude updates status for Track A runtimes
2. Copilot updates status for UI-related items
3. Blackbox updates status for performance/quality
4. Build Director reviews and confirms
5. Ledger published to team

**Example update**:

```
Live Sessions
Before: 🔄 "Verify exists, consolidate duplicates"
After:  ✅ "Verified canonical. Audit complete. 15 destinations wired. Certified Week 2. Freezing."
```

---

## How Teams Use This

### Claude
"Which runtimes need work this week?"
→ Check ledger for 🔄 items in current week

### Copilot
"Is the Avatar API stable for UI development?"
→ Check ledger: Avatar = 🔄 active development, so use mock data until stable

### Blackbox
"Which systems should I audit?"
→ Check ledger for ⚠️ items, prioritize by P0/P1

### Build Director
"What's the status of everything?"
→ One glance at the ledger shows the whole platform

---

## Launch Criteria

Before soft launch, every runtime must be:
- ✅ **Status**: ✅ (Stable) or 🔄 (Complete, ready to freeze)
- ✅ **Duplicates**: Zero (consolidated or confirmed single)
- ✅ **Wiring**: Connected to canonical systems
- ✅ **Certified**: Passes Level 1 + Level 2 + Level 3
- ✅ **Real data**: No mock/fake data
- ✅ **Complete**: All roles served (if not role-specific)

---

## Example: Week 2 Convergence Ledger

```
LIVE SESSIONS
Before: 🔄 Building Live Session Chain
After:  ✅ Canonical registry verified. All 15 destinations wired. Level 1+2 certs pass. FROZEN.

SOCIAL GRAPH
Before: ⚠️ Needs audit
After:  ✅ Audited. Single canonical SocialGraphEngine. No duplicates. Ready.

REVENUE
Before: ⚠️ Fragmented across tips/merch/tickets/sponsors
After:  🔄 UnifiedRevenueEngine consolidating. Week 6 target.

INVENTORY
Before: ⚠️ Needs audit
After:  ⚠️ Audit found 2 implementations. Plan: merge into canonical. Schedule Week 4.
```

---

## What This Prevents

❌ **Multiple people building the same system simultaneously**
❌ **Wondering if something's done**
❌ **Duplicate implementations evolving in parallel**
❌ **Missing a critical runtime at launch**
❌ **Forgetting to consolidate systems**

---

## What This Enables

✅ **Everyone sees system status at a glance**
✅ **Prevents duplicate work**
✅ **Makes progress visible**
✅ **Identifies consolidation needs early**
✅ **Ensures nothing is forgotten**

---

## Locked

This ledger is updated every Friday.

It is the source of truth for runtime status.

If something isn't on this ledger, it doesn't exist (yet).

If a runtime is 🔄, it's still being built—don't depend on it yet.

If a runtime is ✅, it's frozen—no changes except bugs.

This is how the team stays aligned on what's done, what's in progress, and what's coming next.
