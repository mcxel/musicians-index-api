# EVENT FLOW: TICKET PURCHASE
## From Browse to QR Code in Wallet

```
TRIGGER: Fan visits /events/[eventId]/tickets

STEP 1 — LOAD EVENT PAGE
  → GET /api/events/:id → event detail, venue, lineup
  → GET /api/events/:id/ticket-tiers → available tiers + prices
  → Render: tier cards (GA, Reserved, VIP, Sponsor Box)
  → Each tier shows: price, section, features, remaining quantity

STEP 2 — SELECT TIER + QUANTITY
  → Fan selects tier, quantity (max 8 per buyer — Platform Law #4)
  → Frontend: quantity picker enforces max 8
  → "Sold Out" shown if soldQuantity >= totalQuantity

STEP 3 — CHECKOUT INITIATION
  → POST /api/tickets/purchase-intent
    body: { eventId, tierId, quantity, sectionId? }
  → API: validates max 8 per buyer per event
  → API: creates temporary hold (30-min lock on seats)
  → API: creates Stripe PaymentIntent
  → Returns: { clientSecret, holdExpiry, heldSeats }

STEP 4 — STRIPE PAYMENT
  → Frontend: Stripe Elements renders payment form
  → Fan enters card (or uses Apple Pay / Google Pay)
  → Stripe confirms payment → calls webhook

STEP 5 — STRIPE WEBHOOK: payment_intent.succeeded
  → POST /api/webhooks/stripe
  → Validates webhook signature
  → Creates Order: { status: PAID, totalCents }
  → Creates Tickets: one per quantity
    { status: CONFIRMED, ticketCode: cuid(), orderId }
  → Creates Transactions: { type: PURCHASE, amountCents }
  → Artist/Venue wallet: revenue attributed
  → EarningsRecord updated

STEP 6 — QR CODE GENERATION
  → media-pipeline generates QR code for ticketCode
  → QR code stored: cdn_upload → cdnUrl on Ticket.qrCodeUrl
  → Email sent: "Your tickets for [Event]" with QR codes

STEP 7 — TICKET IN WALLET
  → GET /api/tickets/mine → fan sees tickets
  → /tickets page renders: event name, date, section, QR
  → Ticket status: CONFIRMED

STEP 8 — EVENT DAY: QR SCAN CHECK-IN
  → Scanner operator opens /scanner/checkin
  → Scans QR with camera
  → POST /api/tickets/:code/scan
  → Validates: status === CONFIRMED, not expired, correct event
  → Updates: Ticket.status → USED, Ticket.usedAt, Ticket.checkedInById
  → Returns: { success, holderName, section, seatNumber }
  → Scanner shows green confirmation

STEP 9 — VR STADIUM INTEGRATION
  → If event is VR Stadium:
  → Ticket scan triggers: VR engine assigns avatar to section
  → Diamond/Platinum users → front_row section (AVATAR_PLACEMENT_RULES)
  → Avatar spawned in correct 3D seat position
  → SponsorBoards activated for event sponsor

STEP 10 — POST-EVENT
  → All unused tickets: status → CANCELLED (if applicable)
  → Transaction receipts available at /tickets/history
  → Event analytics updated: attendance count, revenue
```

**Engines:** venue, economy, media-pipeline, vr-engine
**DB models:** Event, TicketTier, Ticket, Order, Transaction, Wallet, EarningsRecord
**Max per buyer:** 8 (Platform Law #4 — enforced in API, frontend, and DB constraint)
