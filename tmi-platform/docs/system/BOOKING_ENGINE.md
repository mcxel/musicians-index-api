# BOOKING_ENGINE.md
# Booking System — Engine Architecture
# Visual authority: PDF pages 4–5 (Booking Dashboard, Booking Map)
# Repo paths: apps/web/src/app/tickets/, apps/api/src/modules/tickets/ (existing)
#             apps/web/src/app/admin/booking/, apps/api/src/modules/booking/ (to create)

## What Is The Booking System

The Booking System handles artist bookings, event creation, ticket sales, and venue management.
The existing ticketing module (Event, Ticket, TicketType, Order) covers the data model foundation.
What is missing is the Booking Dashboard and the admin-side booking command interface.

---

## PDF Authority Summary

- **Page 4**: Artist Booking Dashboard — artist sees their requests, calendar, earnings
- **Page 5**: Booking Map — visual map of venues with live/upcoming event pins

---

## System Layers

| Layer | Description | Status |
|-------|-------------|--------|
| Data models | Event, Ticket, TicketType, Order | ✅ EXISTS |
| API (tickets) | `apps/api/src/modules/tickets/` | ✅ EXISTS |
| Artist booking dashboard | `/artists/dashboard/booking` | ❌ MISSING |
| Admin booking command | `/admin/booking` | ❌ MISSING |
| Booking map | `/booking/map` | ❌ MISSING |
| Venue management | `/admin/venues` | ❌ MISSING |
| Booking request flow | POST /api/booking/request | ❌ MISSING |

---

## Engine Architecture

```
BookingEngine
├── BookingRequestService — artist submits booking request for a venue/date
├── BookingApprovalService — admin approves/denies requests
├── EventPublisher        — converts approved booking to live Event
├── TicketSaleService     — manages ticket tiers, pricing, quantity
├── VenueRegistry         — list of known venues with capacity/location
├── BookingCalendar       — calendar view of all booked events
└── BookingMap            — geo-map of venues (PDF page 5)
```

---

## API Routes Needed

| Method | Route | Description |
|--------|-------|-------------|
| POST | `/api/booking/request` | Artist submits booking request |
| GET | `/api/booking/requests` | Admin views all requests |
| GET | `/api/booking/requests/mine` | Artist views their requests |
| PATCH | `/api/booking/requests/:id/approve` | Admin approves |
| PATCH | `/api/booking/requests/:id/deny` | Admin denies |
| GET | `/api/booking/venues` | List venues |
| POST | `/api/booking/venues` | Create venue (Admin) |
| GET | `/api/booking/calendar` | Events calendar feed |

(Ticket sale APIs already exist in `/api/tickets/`)

---

## DB Models Needed (additions to existing schema)

```prisma
model BookingRequest {
  id           String   @id @default(cuid())
  artistUserId String
  venueName    String
  proposedDate DateTime
  notes        String?  @db.Text
  status       String   @default("PENDING")  // PENDING|APPROVED|DENIED
  reviewedById String?
  reviewedAt   DateTime?
  eventId      String?  // set when approved → event is created
  createdAt    DateTime @default(now())
  updatedAt    DateTime @updatedAt
}

model Venue {
  id          String  @id @default(cuid())
  name        String
  city        String
  state       String?
  country     String  @default("US")
  capacity    Int?
  lat         Float?
  lng         Float?
  description String? @db.Text
  imageUrl    String?
  createdAt   DateTime @default(now())
}
```

---

## Frontend Routes

| Route | Description |
|-------|-------------|
| `/tickets` | Event listing + ticket purchase (exists) |
| `/tickets/[eventId]` | Single event page (exists or trivial) |
| `/artists/dashboard/booking` | Artist's own booking calendar + requests |
| `/admin/booking` | Admin booking command center |
| `/admin/booking/requests` | Pending request queue |
| `/booking/map` | Venue map (PDF page 5) |
| `/admin/venues` | Venue management |

---

## Files To Create / Edit

| File | Action |
|------|--------|
| `apps/api/src/modules/booking/booking.module.ts` | CREATE |
| `apps/api/src/modules/booking/booking.controller.ts` | CREATE |
| `apps/api/src/modules/booking/booking.service.ts` | CREATE |
| `apps/web/src/app/admin/booking/page.tsx` | CREATE |
| `apps/web/src/app/admin/venues/page.tsx` | CREATE |
| `apps/web/src/components/booking/BookingRequestForm.tsx` | CREATE |
| `apps/web/src/components/booking/BookingCalendar.tsx` | CREATE |
| `apps/web/src/components/booking/VenueMap.tsx` | CREATE |
| `packages/db/prisma/schema.prisma` | EDIT — add BookingRequest, Venue |

---

## States Required

- Booking dashboard loading: skeleton calendar
- No requests yet: "You haven't submitted a booking request yet"
- Request pending: yellow badge "Under Review"
- Request approved: green badge "Approved — Event Created"
- Request denied: red badge with reason
- Admin queue empty: "No pending booking requests"
- Map loading: skeleton map tiles
- Map error: "Could not load map" with list fallback
