import { listVenueBookingMatches } from "@/lib/booking/tmiVenueBookingMatchEngine";

export type BookingStatus = "requested" | "deposit-pending" | "deposit-received" | "confirmed" | "cancelled";

export type BookingRequest = {
  bookingRequestId: string;
  venueId: string;
  venueName: string;
  artistId: string;
  artistName: string;
  genre: string;
  eventTitle: string;
  proposedDateIso: string;
  ticketBasePriceCents: number;
  requestedAtMs: number;
  status: BookingStatus;
};

export type BookingDeposit = {
  bookingDepositId: string;
  bookingRequestId: string;
  subtotalCents: number;
  taxCents: number;
  totalCents: number;
  currency: "USD";
  paidAtMs: number;
  receiptId: string;
};

export type ArtistPlacement = {
  placementId: string;
  bookingRequestId: string;
  artistId: string;
  artistName: string;
  venueId: string;
  venueName: string;
  route: string;
  status: "scheduled" | "live";
};

export type VenueEventSeed = {
  venueEventSeedId: string;
  bookingRequestId: string;
  eventId: string;
  venueId: string;
  venueName: string;
  eventTitle: string;
  eventDateIso: string;
  status: "seeded";
  route: string;
};

export type TicketEventSeed = {
  ticketEventSeedId: string;
  bookingRequestId: string;
  eventId: string;
  venueSlug: string;
  ticketRoute: string;
  printRoute: string;
  seatInventorySeed: {
    floor: number;
    sectionA: number;
    sectionB: number;
    balcony: number;
    vip: number;
  };
  status: "seeded";
};

export type SponsorSlotSeed = {
  sponsorSlotSeedId: string;
  bookingRequestId: string;
  eventId: string;
  placementSlots: Array<"stage-banner" | "pre-roll" | "lobby-wall" | "article-takeover">;
  status: "seeded";
  route: string;
};

export type BookingPayoutSplit = {
  platformCents: number;
  artistCents: number;
  venueCents: number;
};

export type BookingLedgerEntry = {
  ledgerEntryId: string;
  bookingRequestId: string;
  eventId: string;
  entryType: "booking-deposit";
  grossCents: number;
  payoutSplit: BookingPayoutSplit;
  createdAtMs: number;
};

export type BookingMultiplierObject = {
  bookingRequest: BookingRequest;
  bookingDeposit: BookingDeposit;
  artistPlacement: ArtistPlacement;
  venueEventSeed: VenueEventSeed;
  ticketEventSeed: TicketEventSeed;
  sponsorSlotSeed: SponsorSlotSeed;
  ledgerEntry: BookingLedgerEntry;
};

let requestCounter = 0;
let depositCounter = 0;
let placementCounter = 0;
let seedCounter = 0;
let ledgerCounter = 0;

const requests: BookingRequest[] = [];
const deposits: BookingDeposit[] = [];
const placements: ArtistPlacement[] = [];
const venueSeeds: VenueEventSeed[] = [];
const ticketSeeds: TicketEventSeed[] = [];
const sponsorSeeds: SponsorSlotSeed[] = [];
const ledger: BookingLedgerEntry[] = [];

function slugify(value: string): string {
  return value.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/(^-|-$)/g, "");
}

function nextEventId(input: { venueId: string; artistId: string; dateIso: string }): string {
  const day = input.dateIso.slice(0, 10).replace(/-/g, "");
  return `event-${slugify(input.venueId)}-${slugify(input.artistId)}-${day}`;
}

function splitDeposit(totalCents: number): BookingPayoutSplit {
  const artistCents = Math.round(totalCents * 0.5);
  const venueCents = Math.round(totalCents * 0.2);
  const platformCents = totalCents - artistCents - venueCents;
  return {
    platformCents,
    artistCents,
    venueCents,
  };
}

export function createBookingRequest(input: {
  venueId: string;
  venueName: string;
  artistId: string;
  artistName: string;
  genre: string;
  eventTitle: string;
  proposedDateIso: string;
  ticketBasePriceCents: number;
}): BookingRequest {
  const request: BookingRequest = {
    bookingRequestId: `bookreq-${++requestCounter}`,
    requestedAtMs: Date.now(),
    status: "deposit-pending",
    ...input,
  };
  requests.unshift(request);
  return request;
}

export function collectBookingDeposit(bookingRequestId: string, subtotalCents: number): BookingDeposit {
  const request = requests.find((entry) => entry.bookingRequestId === bookingRequestId);
  if (!request) {
    throw new Error("Booking request not found");
  }
  if (request.status === "cancelled") {
    throw new Error("Cannot collect deposit for cancelled booking");
  }

  const taxCents = Math.round(subtotalCents * 0.0825);
  const totalCents = subtotalCents + taxCents;

  const deposit: BookingDeposit = {
    bookingDepositId: `bookdep-${++depositCounter}`,
    bookingRequestId,
    subtotalCents,
    taxCents,
    totalCents,
    currency: "USD",
    paidAtMs: Date.now(),
    receiptId: `rcpt-booking-${Date.now()}-${bookingRequestId}`,
  };

  deposits.unshift(deposit);
  request.status = "deposit-received";
  return deposit;
}

export function confirmBookingFromDeposit(bookingRequestId: string): BookingMultiplierObject {
  const bookingRequest = requests.find((entry) => entry.bookingRequestId === bookingRequestId);
  if (!bookingRequest) {
    throw new Error("Booking request not found");
  }

  const bookingDeposit = deposits.find((entry) => entry.bookingRequestId === bookingRequestId);
  if (!bookingDeposit) {
    throw new Error("Booking deposit is required before confirmation");
  }

  const eventId = nextEventId({
    venueId: bookingRequest.venueId,
    artistId: bookingRequest.artistId,
    dateIso: bookingRequest.proposedDateIso,
  });
  const venueSlug = slugify(bookingRequest.venueName);

  const artistPlacement: ArtistPlacement = {
    placementId: `placement-${++placementCounter}`,
    bookingRequestId,
    artistId: bookingRequest.artistId,
    artistName: bookingRequest.artistName,
    venueId: bookingRequest.venueId,
    venueName: bookingRequest.venueName,
    route: `/bookings/${bookingRequestId}/placement`,
    status: "scheduled",
  };

  const venueEventSeed: VenueEventSeed = {
    venueEventSeedId: `venseed-${++seedCounter}`,
    bookingRequestId,
    eventId,
    venueId: bookingRequest.venueId,
    venueName: bookingRequest.venueName,
    eventTitle: bookingRequest.eventTitle,
    eventDateIso: bookingRequest.proposedDateIso,
    status: "seeded",
    route: `/venues/${venueSlug}`,
  };

  const ticketEventSeed: TicketEventSeed = {
    ticketEventSeedId: `tickseed-${++seedCounter}`,
    bookingRequestId,
    eventId,
    venueSlug,
    ticketRoute: `/venues/${venueSlug}/tickets/${eventId}`,
    printRoute: `/venues/${venueSlug}/tickets/${eventId}/print`,
    seatInventorySeed: {
      floor: 220,
      sectionA: 180,
      sectionB: 180,
      balcony: 90,
      vip: 35,
    },
    status: "seeded",
  };

  const sponsorSlotSeed: SponsorSlotSeed = {
    sponsorSlotSeedId: `sponseed-${++seedCounter}`,
    bookingRequestId,
    eventId,
    placementSlots: ["stage-banner", "pre-roll", "lobby-wall", "article-takeover"],
    status: "seeded",
    route: `/sponsors/marketplace?event=${eventId}`,
  };

  const payoutSplit = splitDeposit(bookingDeposit.totalCents);
  const ledgerEntry: BookingLedgerEntry = {
    ledgerEntryId: `bookled-${++ledgerCounter}`,
    bookingRequestId,
    eventId,
    entryType: "booking-deposit",
    grossCents: bookingDeposit.totalCents,
    payoutSplit,
    createdAtMs: Date.now(),
  };

  placements.unshift(artistPlacement);
  venueSeeds.unshift(venueEventSeed);
  ticketSeeds.unshift(ticketEventSeed);
  sponsorSeeds.unshift(sponsorSlotSeed);
  ledger.unshift(ledgerEntry);
  bookingRequest.status = "confirmed";

  return {
    bookingRequest,
    bookingDeposit,
    artistPlacement,
    venueEventSeed,
    ticketEventSeed,
    sponsorSlotSeed,
    ledgerEntry,
  };
}

export function listBookingMultiplierObjects(): BookingMultiplierObject[] {
  return requests
    .filter((request) => request.status === "confirmed")
    .map((request) => {
      const bookingDeposit = deposits.find((entry) => entry.bookingRequestId === request.bookingRequestId);
      const artistPlacement = placements.find((entry) => entry.bookingRequestId === request.bookingRequestId);
      const venueEventSeed = venueSeeds.find((entry) => entry.bookingRequestId === request.bookingRequestId);
      const ticketEventSeed = ticketSeeds.find((entry) => entry.bookingRequestId === request.bookingRequestId);
      const sponsorSlotSeed = sponsorSeeds.find((entry) => entry.bookingRequestId === request.bookingRequestId);
      const ledgerEntry = ledger.find((entry) => entry.bookingRequestId === request.bookingRequestId);

      if (!bookingDeposit || !artistPlacement || !venueEventSeed || !ticketEventSeed || !sponsorSlotSeed || !ledgerEntry) {
        return null;
      }

      return {
        bookingRequest: request,
        bookingDeposit,
        artistPlacement,
        venueEventSeed,
        ticketEventSeed,
        sponsorSlotSeed,
        ledgerEntry,
      };
    })
    .filter((entry): entry is BookingMultiplierObject => entry !== null);
}

export function listBookingRequests(): BookingRequest[] {
  return [...requests];
}

export function listBookingDeposits(): BookingDeposit[] {
  return [...deposits];
}

export function listBookingLedgerEntries(): BookingLedgerEntry[] {
  return [...ledger];
}

export function seedBookingFromTopMatch(): BookingMultiplierObject | null {
  const [topMatch] = listVenueBookingMatches();
  if (!topMatch) {
    return null;
  }

  const request = createBookingRequest({
    venueId: topMatch.venueId,
    venueName: topMatch.venueName,
    artistId: topMatch.performerId,
    artistName: topMatch.performerName,
    genre: topMatch.genre,
    eventTitle: `${topMatch.performerName} Live at ${topMatch.venueName}`,
    proposedDateIso: new Date(Date.now() + 21 * 24 * 60 * 60 * 1000).toISOString(),
    ticketBasePriceCents: 4500,
  });

  collectBookingDeposit(request.bookingRequestId, 25000);
  return confirmBookingFromDeposit(request.bookingRequestId);
}
