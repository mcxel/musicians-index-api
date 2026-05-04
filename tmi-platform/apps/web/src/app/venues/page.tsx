import { Suspense } from "react";
import Link from "next/link";
import TmiLobbyBillboardWall from "@/components/billboards/TmiLobbyBillboardWall";
import JuliusHudDock from "@/components/julius/JuliusHudDock";

const MOCK_VENUES = [
  { id: "1", slug: "the-underground", name: "The Underground", type: "CLUB", city: "Lagos", country: "NG", capacity: 500, verified: true, genres: ["Afrobeats", "Hip-Hop"] },
  { id: "2", slug: "jakarta-arena", name: "Jakarta Arena", type: "ARENA", city: "Jakarta", country: "ID", capacity: 5000, verified: true, genres: ["Pop", "R&B", "EDM"] },
];

const TYPE_ICONS: Record<string, string> = { CLUB: "🎧", ARENA: "🏟️", THEATER: "🎭", BAR: "🍺", FESTIVAL: "🎪", ONLINE: "💻" };

export default function VenuesPage() {
  return (
    <main className="min-h-screen bg-[#0a0a0f] px-6 py-10 text-white">
      <div className="mx-auto mb-8 max-w-6xl">
        <div className="mb-2 flex items-center justify-between">
          <h1 className="text-3xl font-bold text-[#ff6b35]">Venues</h1>
          <Link href="/venues/dashboard" className="rounded-lg bg-[#ff6b35] px-4 py-2 text-sm font-semibold text-white transition-colors hover:bg-[#ff6b35]/80">
            Venue Dashboard
          </Link>
        </div>
        <p className="mb-6 text-gray-400">Discover venues booking artists globally.</p>
        <div className="mb-6 flex flex-wrap gap-2">
          <Link href="/venues/test-venue" className="rounded-lg border border-[#ff6b35]/40 bg-[#ff6b35]/15 px-3 py-2 text-xs text-[#ffb287]">
            Open /venues/test-venue
          </Link>
          <Link href="/venues/test-venue/stage" className="rounded-lg border border-[#ff6b35]/40 bg-[#ff6b35]/15 px-3 py-2 text-xs text-[#ffb287]">
            Open /venues/test-venue/stage
          </Link>
        </div>
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          {MOCK_VENUES.map((venue) => (
            <Link key={venue.id} href={`/venues/${venue.slug}`} className="group rounded-2xl border border-white/10 bg-white/5 p-4 transition-all hover:border-[#ff6b35]/40">
              <p className="text-sm font-bold text-white">{TYPE_ICONS[venue.type]} {venue.name}</p>
              <p className="text-xs text-gray-400">{venue.city}, {venue.country}</p>
            </Link>
          ))}
        </div>
      </div>

      <section className="mx-auto max-w-[1400px]">
        <Suspense fallback={<div className="h-48 animate-pulse rounded-2xl bg-white/5" />}>
          <TmiLobbyBillboardWall />
        </Suspense>
      </section>
      <Suspense fallback={null}>
        <JuliusHudDock surface="venue" />
      </Suspense>
    </main>
  );
}

