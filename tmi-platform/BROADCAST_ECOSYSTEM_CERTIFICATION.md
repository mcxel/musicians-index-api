# BROADCAST ECOSYSTEM CERTIFICATION
**Date:** 2026-06-15 | **Phase:** Phase B (Data Wiring & Ecosystem Unification)

**The Golden Standard:** `See ↓ Click ↓ Learn ↓ Join ↓ Support ↓ Share ↓ Return` within two clicks from anywhere.

## 1. Broadcast Network Verification
*   **Status:** 🟡 PARTIAL
*   **Current Reality:** `Home 1 → 1-2 → 2 → 3 → 4 → 5` navigation flows correctly via the top nav. Home 1-2 is visually locked and responsive.
*   **The Gap:** Dead clicks still exist on Home 4 (Sponsor/Marketplace buttons) and Home 2 (Magazine tabs). Mobile responsiveness for the 3D `AudienceScene` causes horizontal scroll overflow on smaller devices.

## 2. Live Wall Integration
*   **Status:** 🟡 PARTIAL
*   **Current Reality:** Home 1-2 now correctly renders the `BillboardLiveWall` from a unified performer object. 
*   **The Gap:** Home 1 (Cover), Home 3 (Live World), and Home 5 (Arena) still use their own localized, hardcoded `[SEED_DATA]` arrays. A performer going live right now only populates automatically on Home 1-2.
*   **Requirement:** Connect `GlobalLiveSessionRegistry` to all surfaces.

## 3. Unified Profile Registry
*   **Status:** 🟡 PARTIAL
*   **Current Reality:** The Prisma schema correctly structures this: `User` is the root, branching into `ArtistProfile`, `FanProfile`, `VenueProfile`, etc.
*   **The Gap:** The UI does not consistently fetch from this unified schema. The Billboard wall relies on mock data, and the Magazine relies on static strings.

## 4. AI Avatar & Image Creation
*   **Status:** 🔴 MISSING
*   **Current Reality:** The `Visual Approval Queue` exists in `/admin/visual-queue` for bot-generated assets, but there is no user-facing upload/enhance pipeline.
*   **The Gap:** Users cannot upload a base photo, have AI enhance it into a "Magazine-Ready Portrait" or "Billboard-Ready Portrait", and automatically propagate it to their profile.

## 5. Magazine Certification
*   **Status:** 🔴 MISSING
*   **Current Reality:** `NewsArticleModel.ts` defines `relatedArtistSlug`, `relatedPerformerSlug`, and `writerSlug`. 
*   **The Gap:** The UI components do not render these slugs as clickable `<Link>` tags. If a fan reads an article about *Nova Cipher*, they cannot click her name to route to `/performers/nova-cipher` or enter her live room. The loop is broken at the reading phase.

## 6. Observatory Certification
*   **Status:** 🟡 PARTIAL
*   **Current Reality:** `OmniDashboards.tsx` is built and renders a beautiful UI for the Admin Hub.
*   **The Gap:** It uses hardcoded strings (`12,841 Users`, `$8,940 Revenue`). It is not wired to `prisma.user.count()` or the `LedgerEntry` sum.

---

## Strategic Action Plan

To achieve the **Connected Broadcast Ecosystem**, we must stop building UI and execute the following wiring passes:

1. **The Live Pipeline (Claude / Gemini):** Strip all remaining `SEED_DATA` from Home 1, Home 3, and Home 5. Wire them to a single `useLiveSync()` hook so one live broadcast propagates everywhere instantly.
2. **The Magazine Bridge (Gemini):** Wire the `NewsArticleModel` slugs into active `<Link>` components so articles naturally route readers to Performer Profiles and Live Rooms.
3. **The Revenue & Admin Pipe (BlackBox):** Wire `OmniDashboards` to the real Prisma models to certify the platform's financial telemetry.