# MONETIZATION GAP REPORT

The platform has multiple revenue levers, but the "cash register" wires are disconnected.

### 1. Ticketing & Booking (The Main Artery)
*   **Status:** `Order`, `Ticket`, and `BookingRequest` models exist in Prisma.
*   **Gap:** There is no integration with Stripe Connect. A venue cannot currently route a payment to a Performer's wallet, and a Fan cannot check out to buy a ticket.
*   **Action:** Implement `createCheckoutSession` for tickets and escrow routing for Booking Requests.

### 2. The Ad & Sponsor Network
*   **Status:** `AdRenderer.tsx` and `SponsorRegistry.ts` exist.
*   **Gap:** The registries return mock data. `AdRenderer` randomly picks between Internal/Premium/AdSense. 
*   **Action:** Connect `AdRenderer` to query `prisma.adCampaign.findFirst({ where: { slot: zone, status: 'live' } })`. Impressions (`AdImpression`) and Clicks (`AdClick`) must be logged to the DB to justify sponsor ROI.

### 3. The Beat Marketplace
*   **Status:** `Beat` and `BeatLicense` models exist.
*   **Gap:** Producers have no UI to upload tracks, set basic/premium prices, or track their `BeatUsageHistory` during live cyphers.
*   **Action:** Build the Producer Studio route `/producer/studio` for beat uploads and license management.

### 4. Wallet Abstraction
*   **Status:** `Wallet` and `Transaction` models exist.
*   **Gap:** Users cannot see their wallet balance or fan credits. 
*   **Action:** A persistent `WalletBalanceWidget` needs to be added to the `TMIGlobalHUD` so users are constantly aware of their purchasing power.