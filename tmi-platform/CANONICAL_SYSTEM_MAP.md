# Canonical System Map (Reference Document)
**Date**: 2026-06-25  
**Authority**: Build Director (Marcel Dickens)  
**Purpose**: Single source of truth for every major subsystem — prevents accidental duplicate implementations  
**Update Frequency**: Daily during audit phase, weekly thereafter

---

## How to Use This Map

**Before you build anything**, check this map:

1. **New feature idea**: "I want to track followers" → Check map → SocialGraphEngine already exists
2. **Bug fix**: "Followers aren't updating" → Check map → Shows canonical location + who uses it
3. **Refactoring**: "Should we move this system?" → Check map → See all dependents before moving

**Three questions every subsystem answers**:
- **Where is it?** (Canonical File)
- **Who uses it?** (Used By)
- **Are there duplicates?** (Yes/No + notes)

---

## The Map

### **Live Sessions** (Most Critical)

| Property | Value |
|----------|-------|
| **Canonical File** | `apps/web/src/lib/live/GlobalLiveSessionRegistry.ts` |
| **Status** | 🔄 Active Development |
| **Purpose** | Central registry of all active live streams, all room types, all performers |
| **Used By** | Homepage, Discovery, Billboards, Followers notifications, Venue screens, Admin dashboard, Analytics, Mobile |
| **Duplicate Exists?** | ⚠️ YES — Multiple implementations found: |
| | • `GoLiveRuntime.ts` (newer, feature-rich) |
| | • `LiveSessionEngine.ts` (legacy?) |
| | • Per-room registries (Battle, Cypher, Dance Party, Concert, etc.) |
| **Action Required** | Audit all 15 entry points. Consolidate onto one. Redirect old surfaces. |
| **Audit Status** | ⏳ Pending P1 Live Session Chain audit |

---

### **Revenue Engine** (Core Monetization)

| Property | Value |
|----------|-------|
| **Canonical File** | `apps/web/src/lib/stripe/UnifiedRevenueEngine.ts` |
| **Status** | 🔴 BLOCKED — Stripe price IDs missing (P0-A blocker) |
| **Purpose** | Single source of truth for all revenue streams: subscriptions, tips, tickets, merch, sponsors, bookings, ads, royalties |
| **Used By** | Checkout, Admin Revenue Dashboard, Analytics, Settlement Scheduler |
| **Duplicate Exists?** | ⚠️ YES — Fragmented across: |
| | • `StripeCheckoutEngine.ts` |
| | • `CheckoutPaymentEngine.ts` |
| | • `UniversalCheckoutEngine.ts` |
| | • Per-product checkout routes (`/api/*/checkout/`) |
| **Action Required** | Consolidate checkout paths. All routes should defer to UnifiedRevenueEngine. |
| **Audit Status** | 🔴 Cannot audit until Stripe keys fixed (P0-A) |

---

### **User Profiles & Identity** (Universal Layer)

| Property | Value |
|----------|-------|
| **Canonical File** | `apps/web/src/lib/profiles/universal/` (directory) |
| **Status** | 🔄 Active Development |
| **Purpose** | Shared identity/profile layer for all 7 roles. One profile = identity + social + media + live + settings. |
| **Used By** | All 7 role dashboards (performer, fan, venue, promoter, writer, sponsor, admin) |
| **Duplicate Exists?** | ⚠️ YES — Per-role profiles exist but should inherit from universal: |
| | • `/profile/performer` (specific) |
| | • `/profile/fan` (specific) |
| | • `/profile/venue` (specific) |
| | • `/profile/[slug]` (generic) |
| **Action Required** | Build universal runtime. Per-role pages should extend, not duplicate. |
| **Audit Status** | ⏳ Pending (not yet included in P0-C onboarding audit) |

---

### **Notifications** (Cross-System)

| Property | Value |
|----------|-------|
| **Canonical File** | `apps/web/src/lib/notifications/NotificationEngine.ts` |
| **Status** | ⚠️ Needs Audit |
| **Purpose** | Single notification system: email, push, in-app, DMs. All user types, all event types. |
| **Used By** | Signup (welcome email), payments (receipts), cancellations, livestream alerts, follow notifications, messages |
| **Duplicate Exists?** | ⚠️ YES — Multiple notification systems suspected: |
| | • Email system: `TMIEmailSystem.ts` |
| | • Push system: (likely) |
| | • In-app system: (likely) |
| **Action Required** | Inventory all notification sources. Consolidate onto one NotificationEngine. |
| **Audit Status** | ⏳ Pending P1 audit (item #3: Notifications) |

---

### **Social Graph** (Followers/Following)

| Property | Value |
|----------|-------|
| **Canonical File** | `apps/web/src/lib/social/SocialGraphEngine.ts` |
| **Status** | ⚠️ Needs Audit |
| **Purpose** | Followers, following, blocking, recommendations. Single source of social state. |
| **Used By** | Profile pages, Discovery, Recommendations, Settings (block list) |
| **Duplicate Exists?** | ⚠️ YES — Likely: |
| | • Followers in UserProfile model |
| | • Following as relation in User model |
| | • Block list (separate?) |
| **Action Required** | Verify SocialGraphEngine is canonical. Audit UserProfile + User relations for consistency. |
| **Audit Status** | ⏳ Pending P1 audit (item #5: Canonical Systems) |

---

### **Chat & Messaging** (Direct Messages)

| Property | Value |
|----------|-------|
| **Canonical File** | `apps/web/src/lib/messaging/MessagingRuntime.ts` |
| **Status** | ⚠️ Needs Audit |
| **Purpose** | Direct messages, group threads, voice notes, message history. |
| **Used By** | DM panels in lobbies, Profile pages, Notifications on new message |
| **Duplicate Exists?** | ⚠️ YES — Likely: |
| | • Per-room chat (live rooms) |
| | • DM system (separate?) |
| | • Group threads (separate?) |
| **Action Required** | Consolidate all messaging onto one runtime. Live room chat should use same engine as DMs. |
| **Audit Status** | ⏳ Pending P1 audit (item #3: Chat/Messaging) |

---

### **Memory Wall** (Captures/Moments)

| Property | Value |
|----------|-------|
| **Canonical File** | `apps/web/src/lib/memory/MemoryRuntime.ts` |
| **Status** | ⚠️ Needs Audit |
| **Purpose** | Captures, moments, timeline, sharing. Follow-along records of user activity. |
| **Used By** | Profile pages, Discovery, Notifications (new capture), Analytics |
| **Duplicate Exists?** | ⚠️ YES — Likely: |
| | • Moments system |
| | • Captures system |
| | • Timeline persistence |
| **Action Required** | Consolidate moments/captures/timeline onto one MemoryRuntime. |
| **Audit Status** | ⏳ Pending (not yet audited) |

---

### **Inventory System** (Avatar Items, Cosmetics, Equipment)

| Property | Value |
|----------|-------|
| **Canonical File** | `apps/web/src/lib/inventory/InventoryRuntime.ts` |
| **Status** | ⚠️ Needs Audit |
| **Purpose** | User-owned items: avatar cosmetics, emotes, props, equipment, merch, playlist skins. |
| **Used By** | Avatar customization, Avatar workspace, Equip UI, Store purchases |
| **Duplicate Exists?** | ⚠️ YES — Likely: |
| | • Avatar customizer items |
| | • Equipment (separate?) |
| | • Cosmetics (separate?) |
| | • Playlist skins (PlaylistArtifactEngine.ts) |
| **Action Required** | Consolidate all item types onto one InventoryRuntime. Playlist skins should use inventory. |
| **Audit Status** | ⏳ Pending P1 audit (item #5: Canonical Systems) |

---

### **XP & Achievements** (Progression)

| Property | Value |
|----------|-------|
| **Canonical File** | `apps/web/src/lib/xp/XpActionRegistry.ts` |
| **Status** | 🔄 Active Development |
| **Purpose** | All platform activities earn XP. Achievements, rankings, leaderboards, progression tiers. |
| **Used By** | Every action (signup, login, go live, tip, battle, cypher, read article, etc.) |
| **Duplicate Exists?** | ⏳ Unlikely — appears well-centralized |
| **Action Required** | Verify all activities call `grantXP()`. Audit no hardcoded XP elsewhere. |
| **Audit Status** | ⏳ Pending P1 audit (item #6: Canonical Systems) |

---

### **Avatar Runtime** (3D Characters)

| Property | Value |
|----------|-------|
| **Canonical File** | `apps/web/src/lib/avatar/UnifiedAvatarRuntime.ts` |
| **Status** | 🔄 Active Development |
| **Purpose** | Avatar creation, customization, animation, seat binding, face scan pipeline (future). |
| **Used By** | Avatar customization pages, Audience scene, Lobby walls, Profile pages, All rooms |
| **Duplicate Exists?** | ⚠️ YES — Multiple avatar systems: |
| | • `AvatarCreator.tsx` |
| | • `AvatarWorkspace.tsx` |
| | • `AvatarCustomizer.tsx` (variations) |
| **Action Required** | Consolidate all avatar customizers onto UnifiedAvatarRuntime. No separate creators. |
| **Audit Status** | 🔄 Ongoing (Phase C2 recently completed per memory) |

---

### **Audience Runtime** (Seating, Presence, Reactions)

| Property | Value |
|----------|-------|
| **Canonical File** | `apps/web/src/lib/live/audienceRuntimeEngine.ts` |
| **Status** | 🔄 Active Development |
| **Purpose** | Audience seat assignment, presence tracking, reactions (claps, cheers, emotes). Unified for all room types. |
| **Used By** | All live rooms (concert, battle, cypher, challenge, fan lobby, dance party) |
| **Duplicate Exists?** | ⚠️ YES (4 seat systems found, 2 converged per memory): |
| | • `audienceRuntimeEngine.ts` ← **CANONICAL** |
| | • `SeatingMeshEngine.ts` (capabilities inherited 2026-06-20) |
| | • `tmiFanAvatarSeatAssignment.ts` (converged) |
| | • `tmiAudienceSeatPresenceEngine.ts` (converged) |
| | • Monthly Idol custom occupancy (lowest priority) |
| **Action Required** | Verify all rooms use audienceRuntimeEngine. Mark others LEGACY. Do NOT delete yet. |
| **Audit Status** | ⚠️ Partial convergence complete. Final consolidation pending. |

---

### **Venue Runtime** (Stage, Lighting, Camera, Environment)

| Property | Value |
|----------|-------|
| **Canonical File** | `apps/web/src/components/venue/UniversalVenueRenderer.tsx` |
| **Status** | 🔄 Active Development |
| **Purpose** | One runtime for all event types: concerts, battles, cyphers, challenges, fan lobbies, dance parties. Mode-driven, not separate systems. |
| **Used By** | All live rooms (Go Live, Mini Concert, Battle, Cypher, etc.) |
| **Duplicate Exists?** | ⚠️ YES — Multiple venue implementations: |
| | • `ArenaEventShell.tsx` (newer, feature-rich) |
| | • `BattleArena.tsx` |
| | • `CypherStage.tsx` |
| | • `ConcertStage.tsx` |
| | • Per-room-type stage components |
| **Action Required** | Consolidate all stage types onto UniversalVenueRenderer. Use mode parameter, not separate components. |
| **Audit Status** | 🔄 Ongoing convergence (Rule 21 lock in place) |

---

### **Discovery Engine** (Content Recommendations)

| Property | Value |
|----------|-------|
| **Canonical File** | `apps/web/src/lib/discovery/DiscoveryEngine.ts` |
| **Status** | ⚠️ Needs Audit |
| **Purpose** | Recommendation algorithm: performers, articles, live rooms, battles, sponsors. Content freshness priority. |
| **Used By** | Homepage rails, DiscoveryRail component, Mobile feed, Admin content tools |
| **Duplicate Exists?** | ⚠️ YES — Likely: |
| | • Per-rail discovery logic |
| | • Different ranking algorithms |
| **Action Required** | Centralize ranking. One algorithm for all discovery surfaces. |
| **Audit Status** | ⏳ Pending P1 audit (item #4: Discovery audit) |

---

### **Analytics Engine** (Business Intelligence)

| Property | Value |
|----------|-------|
| **Canonical File** | `apps/web/src/lib/analytics/AnalyticsRuntime.ts` |
| **Status** | ⚠️ Needs Audit |
| **Purpose** | User engagement tracking, revenue analytics, performer rankings, audience insights. One event stream. |
| **Used By** | Admin dashboard, Revenue dashboard, Performer dashboard, Discovery ranking |
| **Duplicate Exists?** | ⚠️ YES — Likely: |
| | • Per-dashboard analytics |
| | • Different tracking implementations |
| | • Separate ranking calculations |
| **Action Required** | Consolidate event tracking. One canonical analytics stream. |
| **Audit Status** | ⏳ Pending (not yet audited) |

---

### **Beat System** (Submissions, Marketplace, Competition)

| Property | Value |
|----------|-------|
| **Canonical File** | **THREE intentional separate engines** (not a duplicate error): |
| | • `BeatSubmissionRouter.ts` (intake) |
| | • `BeatStoreCommerceEngine.ts` (marketplace) |
| | • `CompetitionMusicEngine.ts` (battle/cypher/challenge runtime) |
| **Status** | ⚠️ Needs Audit |
| **Purpose** | Producer submissions, beat sales/leases, competition background music. **These are intentionally separate.** |
| **Used By** | Producer hub, Beat marketplace, Live battles/cyphers/challenges |
| **Duplicate Exists?** | ✅ NO — This is designed three-engine separation per Rule 19 |
| **Action Required** | Verify exclusivity enforcement: beat sold in marketplace cannot be used in competition. Check `isBeatExclusivelySold()`. |
| **Audit Status** | ⏳ Pending (Rule 19 implementation audit) |

---

### **Ticket System** (Events, Venues, Promoters)

| Property | Value |
|----------|-------|
| **Canonical File** | `apps/web/src/lib/tickets/ticketEngine.ts` |
| **Status** | ⚠️ AUTHORITY UNCLEAR — Rule 17 violation possible |
| **Purpose** | Event tickets: creation, allocation, sales, redemption. **Authority: Venue/Promoter ONLY, never Performer.** |
| **Used By** | Venue event creation, Ticket sales, Attendee check-in, Admin oversight |
| **Duplicate Exists?** | ⚠️ YES — Possible: |
| | • Per-room ticket logic |
| | • Performer-facing "distribute tickets" code (should be removed per Rule 17) |
| **Action Required** | Audit ticket authority. If performers can create/allocate tickets, violates Rule 17. Remove. |
| **Audit Status** | 🔴 CRITICAL — Not yet audited against Rule 17 authority matrix |

---

### **Battle System** (Real-time Competition)

| Property | Value |
|----------|-------|
| **Canonical File** | `apps/web/src/lib/battles/BattleFormatRulesEngine.ts` |
| **Status** | ⚠️ Needs Audit |
| **Purpose** | 1v1 battles: round management, scoring, winner detection, tie-breaking. |
| **Used By** | Battle arenas, Battle results, Leaderboards |
| **Duplicate Exists?** | ⚠️ YES — Likely per-battle-type implementations |
| **Action Required** | Consolidate battle logic. One rules engine for all battle variants. |
| **Audit Status** | ⏳ Pending (not yet audited) |

---

### **Host System** (Automated Hosts & Judges)

| Property | Value |
|----------|-------|
| **Canonical File** | `apps/web/src/lib/hosts/HostCanonicalRegistry.ts` (created 2026-06-20) |
| **Status** | 🔄 Active Development |
| **Purpose** | Host identity (Julius, Record Ralph, Tiana, Bebo), host assignments, judging system. |
| **Used By** | Official events (Monday Night Stage, Monthly Idol), Battle/Cypher hosting, Commentary |
| **Duplicate Exists?** | ⚠️ YES (copy-paste bug fixed 2026-06-20 per memory): |
| | • `HostShowAssignmentEngine.ts` |
| | • `HostIdentityRegistry.ts` |
| | • `ShowHostRegistry.ts` |
| | • `hostEngine.ts` |
| **Action Required** | Use HostCanonicalRegistry as authority. All host lookups should defer to it. Mark others LEGACY. |
| **Audit Status** | 🔄 Recent consolidation (Phase C1 completed 2026-06-24 per memory) |

---

### **Settlement & Payouts** (Revenue Distribution)

| Property | Value |
|----------|-------|
| **Canonical File** | `apps/web/src/lib/settlement/SettlementScheduler.ts` |
| **Status** | ⚠️ Needs Audit |
| **Purpose** | Consolidates payouts from all revenue sources. Calculates splits, handles hold periods, schedules disbursement. |
| **Used By** | Automated settlement runs (weekly?), Revenue dashboard, Creator payouts |
| **Duplicate Exists?** | ⚠️ YES — Likely: |
| | • Per-product settlement logic |
| | • Different payout calculations |
| **Action Required** | Consolidate onto one SettlementScheduler. All revenue types should use same engine. |
| **Audit Status** | ⏳ Pending (not yet audited) |

---

### **Merchandise System** (Creator Inventory & Sales)

| Property | Value |
|----------|-------|
| **Canonical File** | `apps/web/src/lib/commerce/MerchandiseEngine.ts` |
| **Status** | ⚠️ Needs Audit |
| **Purpose** | Creator-uploaded merch: inventory, pricing, sales, shipping. Different from beat licensing. |
| **Used By** | Creator merch stores, Fan purchases, Settlement payouts |
| **Duplicate Exists?** | ⏳ Unclear |
| **Action Required** | Verify separated from ticket system and beat system. Each is independent revenue stream. |
| **Audit Status** | ⏳ Pending (not yet audited) |

---

### **Sponsor System** (Ad Placements & Deals)

| Property | Value |
|----------|-------|
| **Canonical File** | `apps/web/src/lib/commerce/SponsorRegistry.ts` |
| **Status** | ⚠️ Needs Audit |
| **Purpose** | Sponsor inventory, placements, billing, ad content delivery. Rule 12 fallback chain. |
| **Used By** | Homepage sponsor slots, Intermission director, Revenue dashboard, Advertiser portal |
| **Duplicate Exists?** | ⏳ Unclear |
| **Action Required** | Verify SponsorRegistry is authoritative. All sponsor slots should pull from it. Audit fallback chain. |
| **Audit Status** | ⏳ Pending (not yet audited) |

---

### **Search System** (Full-Text Search)

| Property | Value |
|----------|-------|
| **Canonical File** | `apps/web/src/lib/search/SearchEngine.ts` |
| **Status** | ⚠️ Needs Audit |
| **Purpose** | Full-text search: performers, articles, battles, venues, live rooms. |
| **Used By** | Search page, Homepage search bar, Mobile search |
| **Duplicate Exists?** | ⏳ Likely |
| **Action Required** | Consolidate search implementations. One index for all content types. |
| **Audit Status** | ⏳ Pending (not yet audited) |

---

## Quick Reference: All Systems Status

| System | Canonical File | Status | Duplicates? |
|--------|---|---|---|
| Live Sessions | GlobalLiveSessionRegistry.ts | 🔄 | ⚠️ YES |
| Revenue | UnifiedRevenueEngine.ts | 🔴 BLOCKED | ⚠️ YES |
| Profiles | lib/profiles/universal/ | 🔄 | ⚠️ YES |
| Notifications | NotificationEngine.ts | ⚠️ | ⚠️ YES |
| Social Graph | SocialGraphEngine.ts | ⚠️ | ⚠️ YES |
| Chat/Messaging | MessagingRuntime.ts | ⚠️ | ⚠️ YES |
| Memory Wall | MemoryRuntime.ts | ⚠️ | ⚠️ YES |
| Inventory | InventoryRuntime.ts | ⚠️ | ⚠️ YES |
| XP/Achievements | XpActionRegistry.ts | 🔄 | ✅ NO |
| Avatar | UnifiedAvatarRuntime.ts | 🔄 | ⚠️ YES |
| Audience | audienceRuntimeEngine.ts | 🔄 | ⚠️ YES (converging) |
| Venue | UniversalVenueRenderer.tsx | 🔄 | ⚠️ YES |
| Discovery | DiscoveryEngine.ts | ⚠️ | ⚠️ YES |
| Analytics | AnalyticsRuntime.ts | ⚠️ | ⚠️ YES |
| Beat System | 3 separate (intentional) | ⚠️ | ✅ DESIGNED |
| Tickets | ticketEngine.ts | ⚠️ | ⚠️ YES |
| Battle | BattleFormatRulesEngine.ts | ⚠️ | ⚠️ YES |
| Host | HostCanonicalRegistry.ts | 🔄 | ⚠️ YES |
| Settlement | SettlementScheduler.ts | ⚠️ | ⚠️ YES |
| Merchandise | MerchandiseEngine.ts | ⚠️ | ⏳ ? |
| Sponsor | SponsorRegistry.ts | ⚠️ | ⏳ ? |
| Search | SearchEngine.ts | ⚠️ | ⏳ ? |

---

## Rules for Using This Map

### Rule 1: Check Before You Build
Before implementing any new feature, search this map. If the system exists, use it.

### Rule 2: Never Duplicate Silently
If you find duplicates, consolidate them. Don't create a third.

### Rule 3: Update This Map Daily
Mark new findings. Mark resolutions. This map lives.

### Rule 3: Mark LEGACY, Never Delete Immediately
When consolidating, mark old systems `LEGACY` in comments. Delete only after replacement is verified.

---

## Next Steps (Week 1 Audit)

- [ ] Audit all entries marked ⚠️ for actual duplicates
- [ ] Document which surfaces use which canonical system
- [ ] Flag rule violations (e.g., Performer ticket creation per Rule 17)
- [ ] Plan consolidation order (easy wins first, high-risk last)
- [ ] Update daily as audit progresses

---

**Map Created**: 2026-06-25 11:15 AM UTC  
**Authority**: Build Director (Marcel Dickens)  
**Last Updated**: 2026-06-25 11:15 AM UTC  
**Next Review**: Tomorrow (2026-06-26)
