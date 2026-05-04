import { Suspense } from "react";
import Link from "next/link";
import type { Metadata } from "next";
import VenueWorldShell from "@/components/venues/VenueWorldShell";

export function generateMetadata({ params }: { params: { slug: string } }): Metadata {
  const venueName = params.slug
    .split("-")
    .map((w) => w.charAt(0).toUpperCase() + w.slice(1))
    .join(" ");
  return {
    title: `${venueName} | Venue | The Musician's Index`,
    description: `${venueName} on The Musician's Index — stage schedule, bookings, and live access.`,
    alternates: { canonical: `/venues/${params.slug}` },
  };
}

export default function VenueProfilePage({ params }: { params: { slug: string } }) {
  const venueName = params.slug
    .split("-")
    .map((w) => w.charAt(0).toUpperCase() + w.slice(1))
    .join(" ");

  return (
    <main className="min-h-screen bg-[#0a0a0f] text-white">
      <div className="h-48 bg-gradient-to-br from-[#ff6b35]/30 to-purple-900/30 relative">
        <div className="absolute inset-0 flex items-end px-8 pb-6">
          <div className="flex items-end gap-5">
            <div className="w-20 h-20 rounded-2xl bg-[#ff6b35]/20 border border-[#ff6b35]/30 flex items-center justify-center text-3xl">🎧</div>
            <div>
              <h1 className="text-2xl font-bold">{venueName}</h1>
              <p className="text-gray-400 text-sm">Venue World Shell</p>
            </div>
          </div>
        </div>
      </div>

      <div className="px-8 py-8 max-w-6xl mx-auto space-y-6">
        <div className="bg-white/5 border border-white/10 rounded-2xl p-4 flex flex-wrap gap-2">
          <Link href={`/venues/${params.slug}/stage`} className="text-xs px-3 py-2 rounded-lg bg-[#ff6b35]/20 text-[#ffb287] border border-[#ff6b35]/40">Stage</Link>
          <Link href={`/venues/${params.slug}/backstage`} className="text-xs px-3 py-2 rounded-lg bg-[#ff6b35]/20 text-[#ffb287] border border-[#ff6b35]/40">Backstage</Link>
          <Link href={`/venues/${params.slug}/green-room`} className="text-xs px-3 py-2 rounded-lg bg-[#ff6b35]/20 text-[#ffb287] border border-[#ff6b35]/40">Green Room</Link>
          <Link href={`/venues/${params.slug}/tickets`} className="text-xs px-3 py-2 rounded-lg bg-[#ff6b35]/20 text-[#ffb287] border border-[#ff6b35]/40">Tickets</Link>
          <Link href={`/venues/${params.slug}/lobby`} className="text-xs px-3 py-2 rounded-lg bg-[#ff6b35]/20 text-[#ffb287] border border-[#ff6b35]/40">Lobby</Link>
          <Link href={`/venues/${params.slug}/booking`} className="text-xs px-3 py-2 rounded-lg bg-[#ff6b35]/20 text-[#ffb287] border border-[#ff6b35]/40">Booking</Link>
        </div>

        <Suspense fallback={<div className="h-96 animate-pulse rounded-2xl bg-white/5" />}>
          <VenueWorldShell slug={params.slug} focus="world" />
        </Suspense>
      </div>
    </main>
  );
}
