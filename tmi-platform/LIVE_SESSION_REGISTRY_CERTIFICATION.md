# LIVE SESSION REGISTRY CERTIFICATION
**Date:** 2026-06-15 | **Phase:** P0.5 Architectural Verification

**The Golden Standard:** One Live Session → Many Surfaces.
Every discovery surface must derive its "Live Now" state from the `GlobalLiveSessionRegistry` (typically via the `/api/live` endpoint and the `useLiveSync` hook). Local hardcoded arrays for live state are considered architectural violations.

## Surface Certification Matrix

| Surface | Data Source for "Live" State | Status | Risk / Issue |
| :--- | :--- | :--- | :--- |
| **Home 3 (Live World)** | `useLiveSync` → `/api/live` | 🟢 **VERIFIED** | Acting as the reference implementation. Properly consumes the global sync. |
| **Admin Observatory** | `getActiveSessions()` direct | 🟢 **VERIFIED** | Server-side read directly from the global registry. |
| **Performer Profiles** | DB `isLive` flag via Auth Session | 🟡 **PARTIAL** | Accurate to the user's DB state, but doesn't consume the websocket/polling feed for real-time updates without refresh. |
| **Home 1 (Cover)** | `GENRE_DATA` array (`Home1CoverPage.tsx`) | 🔴 **FRAGMENTED** | Hardcoded 10-performer arrays per genre. Does not react to actual users going live. |
| **Home 1-2 (Billboard)** | `seedPerformers()` array (`BillboardLiveWall.tsx`) | 🔴 **FRAGMENTED** | Uses a local static array of 18 performers. Needs to be wired to `useLiveSync`. |
| **Games Discovery** | `GAMES` array (`GameNightHub.tsx`) | 🔴 **FRAGMENTED** | Hardcoded `status: 'live'` and `viewers: 2284` values. Fails to reflect actual game session states. |
| **Magazine Inserts** | `LAUNCH_ARTICLES` (`NewsArticleModel.ts`) | 🔴 **FRAGMENTED** | Completely static. Cannot currently swap static images for WebRTC feeds when an interviewed artist goes live. |
| **Home 5 (Arena)** | UI-level mocked states | 🔴 **FRAGMENTED** | Battle/Cypher cards are hardcoded. Does not query `GlobalLiveSessionRegistry` for active arena matches. |

---

## Architectural Diagnosis

The platform is suffering from **State Fragmentation**.

The infrastructure exists: `GlobalLiveSessionRegistry` is capable of tracking streams, and `useLiveSync` works perfectly on Home 3. However, because surfaces were built in isolation, they are almost all relying on local `const SEED_DATA = []` arrays. 

If a performer goes live right now:
1. It correctly registers in the `GlobalLiveSessionRegistry`.
2. It appears on **Home 3**.
3. It **DOES NOT** appear on Home 1, Home 1-2, or the Magazine, because those surfaces are blind to the global state.

## Recommended Next Action for Claude (Blueprint Lead)
Claude must execute a **Registry Unification Pass**. 
* Strip `seedPerformers()` out of `BillboardLiveWall.tsx` and inject `useLiveSync()`.
* Strip `GENRE_DATA` out of `Home1CoverPage.tsx` and replace it with filtered global feeds.
* Strip `GAMES` out of `GameNightHub.tsx` and map it to `GlobalLiveSessionRegistry` categories.