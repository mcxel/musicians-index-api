# BUTTON AUDIT
**Date:** 2026-06-15 | **Phase 1**

**Goal:** 0 dead buttons, 0 placeholder links, 0 missing routes.

| Page | Button | Destination | API | Database | Status |
| :--- | :--- | :--- | :--- | :--- | :--- |
| **Home 1** | `CLAIM FREE SLOT` | `/sponsor/onboarding` | `None` | `SponsorSlot` | 🔴 **DEAD** |
| **Home 1** | `BOOST` | `/wallet/boost` | `None` | `WalletTransaction` | 🔴 **DEAD** |
| **Home 1** | `BECOME A SPONSOR` | `/advertise` | `/api/sponsors` | `SponsorProfile` | 🔴 **DEAD** |
| **Home 1** | `Book` (Venue) | `/bookings/new` | `/api/bookings` | `BookingRequest` | 🔴 **DEAD** |
| **Home 1-2** | `JOIN LOBBY` | `UniversalLobbyEntry` | `None` | `None` (UI Flow) | 🟢 **PASS** |
| **Home 1-2** | `VIEW ALL →` | `/live/rooms` | `/api/live` | `GlobalLiveSession` | 🟡 **WARNING** |
| **Home 4** | `GET STARTED` (Ads) | `/advertise/new` | `None` | `AdCampaign` | 🔴 **DEAD** |
| **Performer Profile** | `EDIT PROFILE` | Inline Form | `/api/profile/update` | `User` / `Profile` | 🟢 **PASS** |
| **Performer Profile** | `ENTER THE ARENA` | `UniversalLobbyEntry` | `None` | `None` | 🟢 **PASS** |
| **Performer Profile** | `ENTER ROOM` | `UniversalLobbyEntry` | `None` | `None` | 🟢 **PASS** |
| **Performer Profile** | `+ BOOK A SHOW` | `/booking` | `/api/bookings/request` | `BookingRequest` | 🔴 **DEAD** |
| **Performer Profile** | `Mint NFT` | `/nft/mint` | `None` | `VaultDownloadToken` | 🔴 **DEAD** |
| **Performer Profile** | `Beat Vault` | `/beat-vault` | `None` | `Beat` | 🔴 **DEAD** |
| **AudienceScene** | `🌊 WAVE` / `🔥 HYPE` | Inline Animation | `/api/participation` | `ParticipationLedger` | 🟡 **WARNING** (No DB hook) |
| **MaskedVideoTile** | `$ Tip` | `/checkout/tip` | `Stripe Connect` | `Tip` / `Ledger` | 🔴 **DEAD** |
| **Magazine** | `Article Byline` | `/writer/[slug]` | `None` | `User (Role: WRITER)` | 🔴 **DEAD** |

### Summary
Visual navigation (Join Lobby, Edit Profile) largely works. Monetization and action-oriented buttons (Tip, Book, Mint, Sponsor, Boost) are completely disconnected from routing and APIs.