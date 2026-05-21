# VENUE BILLBOARD & TICKET NETWORK P0 BOARD

**CRITICAL MANDATE:** 
This is a global ticket marketplace, venue ecosystem, and automated billboard distribution system combined. It thrives on high volume, low pricing ($0.75 - $9.99), and seamless automation.

## 1. EXACT FILES TO CREATE / EDIT

**Venue Side Routes:**
- `tmi-platform/apps/web/src/app/venue/signup/page.tsx`
- `tmi-platform/apps/web/src/app/venue/[slug]/dashboard/page.tsx`
- `tmi-platform/apps/web/src/app/venue/[slug]/events/page.tsx`
- `tmi-platform/apps/web/src/app/venue/[slug]/talent-suggestions/page.tsx`
- `tmi-platform/apps/web/src/app/venue/[slug]/booking-calculator/page.tsx`

**Fan / Billboard Side Routes:**
- `tmi-platform/apps/web/src/app/billboards/venues/page.tsx` (The Global Ticket Board)
- `tmi-platform/apps/web/src/app/billboards/world-concerts/page.tsx`
- `tmi-platform/apps/web/src/app/events/[slug]/page.tsx`

**Admin Side Routes:**
- `tmi-platform/apps/web/src/app/admin/venues/page.tsx`
- `tmi-platform/apps/web/src/app/admin/talent-rotation/page.tsx`

## 2. EXACT ENGINES TO BUILD

**Core Ticketing & Venue:**
- `VenueEngine`: Handles venue accounts, event creation, and event ownership.
- `TicketEngine`: Creates tickets, manages inventory, handles low-cost pricing tiers.
- `OwnershipEngine`: Assigns tickets to users, validates entry.
- `SeatBindingEngine`: Assigns seat/zone, prevents duplicates.
- `AccessEngine`: Checks ticket and subscription tier (Gold bypass) before entry.
- `BillboardEngine`: Pushes events globally, ranks events by proximity and popularity.
- `PayoutEngine`: Splits revenue based on `tmi_booking_defaults.json`, sends payouts.

**Talent Match & Logistics:**
- `PerformerProximityEngine`: Matches artists near the venue by geography, genre, availability.
- `BookingCalculator`: Live calculation of artist pay, platform fee, travel, hotel, and rides.
- `FairRotationEngine`: Enforces exposure cooldowns, prevents repetitive suggestions, mixes talent types.

## 3. EXACT ORDER OF EXECUTION

**Phase 1: Venue Account & Event Foundation**
- Build the venue signup flow and dashboard.
- Implement the `VenueEngine` and `TicketEngine` to allow venues to create events with ticket pricing.

**Phase 2: The Global Venue Billboard**
- Build `/billboards/venues`.
- Implement the `BillboardEngine` to auto-publish new events to the board.
- Add "Near Me" and "Global Live" filters.

**Phase 3: Checkout, Ownership & Ledger**
- Wire up Stripe and the `PayoutEngine`.
- Implement the $1 / Free Gold access rules for World Concerts.
- Ensure all purchases, ticket ownerships, and premium participation credits hit the Ledger.

**Phase 4: Venue Talent Match & Booking**
- Build the Bubble Suggestion UI for `/venue/[slug]/talent-suggestions`.
- Implement the `PerformerProximityEngine` and `BookingCalculator`.
- Enable the venue to send an offer (with optional travel/hotel logistics) to the artist.

**Phase 5: Fair Rotation & Discovery Polish**
- Integrate the `FairRotationEngine` to ensure diverse, multi-genre suggestions.
- Finalize the neon, 80s magazine visual style for the floating talent bubbles.