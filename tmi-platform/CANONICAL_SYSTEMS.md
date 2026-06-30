# Canonical Systems Registry (LOCKED 2026-06-25)

**Authority**: Build Director (Marcel Dickens)  
**Purpose**: Single source of truth for every major subsystem  
**Rule**: If a second implementation appears, it becomes a cleanup task

---

## What This Is

This document names the ONE authoritative system for every major feature on the platform.

Every developer and every AI checks this before creating a new system.

If you need "followers," you use the Social Graph system. You don't build a second one.

If you need "live sessions," you use GlobalLiveSessionRegistry. You don't build another.

---

## Canonical Systems (LOCKED)

| System | Canonical Implementation | Location | Owner | Status |
|--------|--------------------------|----------|-------|--------|
| **Live Sessions** | GlobalLiveSessionRegistry | `lib/engines/live/GlobalLiveSessionRegistry.ts` | Claude | Verify exists, no duplicates |
| **User Profiles** | Universal Profile Runtime | `lib/profiles/universal/` | Claude | Being built (Phase 2A) |
| **Revenue** | Unified Revenue Engine | `lib/engines/business/UnifiedRevenueEngine.ts` | Claude | Being built (Phase 3) |
| **Inventory** | Inventory Runtime | `lib/engines/inventory/InventoryRuntime.ts` | Claude | Verify exists, consolidate |
| **Memory Wall** | Memory Runtime | `lib/engines/memory/MemoryRuntime.ts` | Claude | Verify exists, consolidate |
| **Notifications** | Notification Engine | `lib/engines/notifications/NotificationEngine.ts` | Claude | Verify exists, consolidate |
| **Chat/Messaging** | Messaging Runtime | `lib/engines/messaging/MessagingRuntime.ts` | Claude | Verify exists, consolidate |
| **Analytics** | Analytics Runtime | `lib/engines/analytics/AnalyticsRuntime.ts` | Claude | Verify exists, consolidate |
| **Social Graph** | Social Graph Engine | `lib/engines/social/SocialGraphEngine.ts` | Claude | Verify exists (followers/following) |
| **Avatar** | Avatar Runtime | `lib/engines/avatar/AvatarRuntime.ts` | Claude | Being built (Phase 4) |
| **Audience** | Audience Runtime | `lib/engines/audience/AudienceRuntime.ts` | Claude | Verify exists, consolidate |
| **Venue** | Venue Life Engine | `lib/engines/venue/VenueLifeEngine.ts` | Claude | Being built (Phase 5) |
| **CRM Modules** | Role-Specific Modules | `lib/profiles/roles/[role]/` | Claude | Being built (Phase 2B) |
| **Authentication** | Auth System | `lib/auth/` | Claude | Verify exists |
| **Payments/Stripe** | Stripe Engine | `lib/payments/StripeEngine.ts` | Claude | Verify exists |
| **Search** | Search Engine | `lib/search/SearchEngine.ts` | Claude | Verify exists |
| **Discovery** | Discovery Engine | `lib/discovery/DiscoveryEngine.ts` | Claude | Verify exists |
| **XP/Rankings** | XP Registry | `lib/xp/XpActionRegistry.ts` | Claude | Verify exists |

---

## How to Use This Document

### Before Building a New System

1. **Check this document first**
2. **Does it already exist?**
   - YES → Use the existing system, don't build a new one
   - NO → Get approval from Build Director before creating

### If You Find a Duplicate

1. **Report it immediately** (don't fix it yourself)
2. **Build Director assigns to Blackbox** for consolidation
3. **Mark old system LEGACY** (don't delete until replacement verified)
4. **Migrate code to canonical system**
5. **Delete old system only after verified working**

### If Canonical System is Missing

1. **Report to Build Director**
2. **Assign to Claude** to build it
3. **Add to this document** once built

---

## Verification Checklist (Pre-Certification Audit)

Before running Level 1 & 2 certifications, verify:

### Live Sessions (CRITICAL)
- [ ] GlobalLiveSessionRegistry exists
- [ ] It is the ONLY source of truth for live sessions
- [ ] No other "liveSession" or "activeRoom" systems exist
- [ ] All GO LIVE entry points write to it
- [ ] All consumers (Home, Discovery, Admin, Mobile) read from it

### User Profiles
- [ ] Universal Profile Runtime is being built
- [ ] No duplicate Performer/Fan/Venue profile systems exist
- [ ] Shared Identity module is planned

### Revenue
- [ ] Unified Revenue Engine is being built
- [ ] No duplicate payment/revenue systems exist
- [ ] Stripe integration is centralized

### Inventory
- [ ] Inventory Runtime exists
- [ ] No duplicate inventory systems
- [ ] Used by Avatar, Store, Memory Wall

### Memory Wall
- [ ] Memory Runtime exists
- [ ] No duplicate memory/clip systems
- [ ] Integrated with profiles and discovery

### Notifications
- [ ] Notification Engine exists
- [ ] No duplicate notification systems
- [ ] Used by all surfaces that notify users

### Chat/Messaging
- [ ] Messaging Runtime exists
- [ ] No duplicate chat/DM systems
- [ ] Integrated with profiles and rooms

### Analytics
- [ ] Analytics Runtime exists
- [ ] No duplicate analytics/reporting systems
- [ ] Feeds Business Intelligence dashboards

### Social Graph
- [ ] Social Graph Engine exists
- [ ] No duplicate followers/following systems
- [ ] Used by profiles and discovery

### Avatar
- [ ] Avatar Runtime exists
- [ ] No duplicate avatar systems
- [ ] Used in profiles, lobbies, audiences

### Audience
- [ ] Audience Runtime exists
- [ ] No duplicate seat/presence systems
- [ ] Consolidated from any divergent versions

### Venue
- [ ] Venue Life Engine exists (being built)
- [ ] No duplicate venue/room systems
- [ ] Integrated with events and live sessions

---

## Adding New Systems

If you need to create a system NOT on this list:

1. **Document it here first** (before building)
2. **Get Build Director approval**
3. **Follow naming convention**: `[Name]Runtime.ts` or `[Name]Engine.ts`
4. **Place in canonical location**: `lib/engines/[category]/`
5. **Add to this registry** once locked

---

## Status Symbols

| Symbol | Meaning |
|--------|---------|
| ✅ | System exists, verified, no duplicates |
| 🔨 | System being built, not yet complete |
| ⚠️ | System exists but may have duplicates (needs audit) |
| ❌ | System missing (needs to be built) |
| 🗑️ | System marked LEGACY (being migrated) |

---

## Locked & Immutable

This registry is LOCKED.

Do not add systems to it without Build Director approval.

Do not create parallel systems outside this registry.

Consult this document every time you build something.

If you see a duplicate, report it. Don't create more.

This is how you prevent five different "followers" systems from evolving in parallel.

This is how you keep the codebase clean.

This is how you launch on time.
