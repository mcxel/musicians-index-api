import { redirect } from 'next/navigation';

// VENUE_ITEMS is not sellable (Dead Venue Product Revenue Guard, Lane D
// Phase 2, 2026-09-02 — see StoreItemEngine.ts's header comment on that
// export): no runtime consumes a VENUE_ITEMS purchase, while a real,
// already-wired equivalent exists for each one at /store/venue-skins.
export default function VenueStorePage() {
  redirect('/store/venue-skins');
}
