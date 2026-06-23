# TOP DEAD CLICKS & AUDIENCE BYPASSES
**Sorted by: Revenue Impact > Retention Impact > Blueprint Impact**

## I. CRITICAL REVENUE IMPACT (Access Check Bypasses)
*These clicks skip the `UniversalLobbyEntry` flow, meaning users bypass ticket gates, VIP checks, and Stripe triggers.*

1. **Billboard Live Wall (`MaskedVideoTile.tsx`)**
   *   **Current Route:** `window.location.href = /live/rooms/${p.id}`
   *   **Issue:** Hardcoded redirect bypasses the Access Check. Users enter directly.
   *   **Impact:** Destroys gating for Paid/Diamond rooms.
2. **Performer Profile "ENTER ROOM" (`performer/profile/page.tsx`)**
   *   **Current Route:** `<Link href="/live/rooms/...">`
   *   **Issue:** Fans on an artist's page bypass the lobby and seat assignment.
   *   **Impact:** Loss of ticket revenue and immersion.
3. **Magazine Article "WATCH LIVE" (`articles/performer/[slug]/page.tsx`)**
   *   **Current Route:** `<Link href="/live/rooms/...">`
   *   **Issue:** Readers bypass the lobby when acting on an editorial CTA.
   *   **Impact:** Loss of impulse ticket conversions.
4. **Home 1-2 "JOIN LOBBY" (`BillboardLiveWall.tsx`)**
   *   **Current Route:** `<Link href="/live/lobby">`
   *   **Issue:** Goes to a generic grid instead of triggering the specific room's entry flow.
   *   **Impact:** Funnel drop-off.
5. **Marketplace "BUY NOW" (`marketplace/page.tsx`)**
   *   **Current Route:** Hardcoded Stripe test links or Dead Clicks.
   *   **Issue:** Cannot dynamically purchase actual Beats, Tickets, or Merch.
   *   **Impact:** Total block on marketplace revenue.

## II. CRITICAL RETENTION IMPACT (Immersion Breaks & Dead Ends)
*These clicks break the "Infinity Loop" or dump users into unstyled, non-3D fallback states.*

6. **Home 1 Orbital Nodes (`Home1CoverPage.tsx`)**
   *   **Current Route:** `<Link href="/articles/performer/[slug]">`
   *   **Issue:** Clicking a live artist in the hero orbital wheel takes you to an *article*, not their *live room*.
   *   **Impact:** Breaks the primary live discovery expectation.
7. **Stream & Win Radio (`streamwin/page.tsx`)**
   *   **Current Route:** Server redirect to `/rooms/live-concert`
   *   **Issue:** No lobby, no access check, instantly forces navigation.
   *   **Impact:** Breaks state, loses previous page context.
8. **Fan Theater Cosmetic Shop (`fan/theater/page.tsx`)**
   *   **Current Route:** Dead Buttons / `href="/upgrade"`
   *   **Issue:** Clicking to buy a skin does nothing or 404s.
   *   **Impact:** Destroys cosmetic economy retention loop.
9. **"ENTER THE ARENA" CTAs (`performer/profile/page.tsx`)**
   *   **Current Route:** `<Link href="/battles">`
   *   **Issue:** Navigates to a generic list instead of the universal entry flow for a specific battle.
   *   **Impact:** Extra clicks required to actually participate.
10. **Memory Wall Item Links (`fan/theater/page.tsx`)**
    *   **Current Route:** `href="/fan/memories"` (Redirects)
    *   **Issue:** Fails to load the specific memory in a modal.
    *   **Impact:** Breaks social proof and sharing loops.

## III. BLUEPRINT IMPACT (Orphaned Concepts)
*These clicks point to systems that the Claude Blueprint demands, but which are totally un-wired.*

11. **Home 1 "CLAIM FREE SLOT" (`Home1CoverPage.tsx`)** → Dead Click (Sponsor Onboarding bypass).
12. **Home 1 "BOOST" Buttons (`Home1CoverPage.tsx`)** → Dead Click (No ad-spend wallet attached).
13. **Article "Sponsor Byline" (`articles/performer/[slug]`)** → Dead Click (Sponsor profiles don't exist).
14. **Article "Author Byline" (`articles/performer/[slug]`)** → Dead Click (Writer profiles don't exist).
15. **Venue Booking "Book" Button (`Home1CoverPage.tsx`)** → Dead Click (Venue registry bypass).