# MISSING WIRING REPORT

### 1. The Global Audio Bus Disconnect
**Location:** `apps/web/src/app/streamwin/page.tsx` vs `AudioProvider.tsx`
**Issue:** `streamwin` is managing audio state locally. If a user navigates to `/magazine` while a track is playing, the audio will die or desync because the global `useAudio()` hook isn't driving the stream.
**Required Fix:** Strip local `useState` for audio in `/streamwin` and bind strictly to `useAudio().play()`.

### 2. The Permission Black Hole
**Location:** `MaskedVideoTile.tsx` and `WebRTCBroadcast.tsx`
**Issue:** If a performer clicks "Go Live" but their browser denies camera access, the UI fails silently or shows a black tile. 
**Required Fix:** Implement `navigator.mediaDevices.getUserMedia` error catching. Add UI states: `Permission_Denied`, `Hardware_In_Use`, and a "Request Access" CTA overlay.

### 3. Missing Profile Routing (The Infinity Loop Breaker)
**Location:** `NewsArticleModel.ts` and `/magazine/article/[slug]/page.tsx`
**Issue:** Articles feature `relatedSponsorSlug` and `writerSlug`. Neither of these are clickable `<Link>` tags in the UI. 
**Required Fix:** Wrap author bylines and sponsor callouts in `<Link href="/profile/writer/[slug]">` and `/sponsor/[slug]`. 

### 4. The Phantom Points Issue
**Location:** `AudienceScene.jsx` (Wave, Jump, Hype buttons)
**Issue:** The interaction buttons fire local `setState` animations, but they do not hit `POST /api/participation/record`. 
**Required Fix:** Wire `onReaction` callbacks in `AudienceScene` to the `ParticipationLedger` service so users actually earn their engagement XP.

### 5. Commerce Registries stuck in Mock
**Location:** `SponsorRegistry.ts` & `BookingRegistry.ts`
**Issue:** The mock arrays are blocking the real economy. 
**Required Fix:** Since the Prisma schema now has `SponsorSlot` and `BookingRequest` (or is ready for them), the APIs (`/api/sponsors/slots`) must be refactored to `await prisma.sponsorSlot.findMany({ where: { status: 'AVAILABLE' } })`.