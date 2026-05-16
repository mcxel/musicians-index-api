"use client";

import Link from "next/link";
import HoverPreviewLayer from "@/components/homepage/density/HoverPreviewLayer";
import VenuePreviewWindow from "@/components/homepage/density/VenuePreviewWindow";
import type { DensityVenueItem } from "@/components/homepage/density/useHomeDensityData";

const VENUES: DensityVenueItem[] = [
  { id: "v-1", name: "Neon Forum", occupancy: 94, href: "/venues/neon-forum" },
  { id: "v-2", name: "Crown Ring", occupancy: 88, href: "/venues/crown-ring" },
  { id: "v-3", name: "Drift Hall", occupancy: 76, href: "/venues/drift-hall" },
  { id: "v-4", name: "Pulse District", occupancy: 69, href: "/venues/pulse-district" },
];

interface LiveVenueStripProps {
  venues?: DensityVenueItem[];
}

export default function LiveVenueStrip({ venues }: LiveVenueStripProps) {
  const currentVenues = venues && venues.length > 0 ? venues : VENUES;

  return (
    <section className="rounded-xl border border-emerald-300/30 bg-black/45 p-3">
      <div className="mb-2 flex items-center justify-between">
        <p className="text-[10px] font-black uppercase tracking-[0.16em] text-emerald-100">Live Venue Strip</p>
        <Link href="/venues" className="text-[10px] font-bold uppercase tracking-[0.12em] text-emerald-200 hover:text-emerald-100">All Venues</Link>
      </div>
      <div className="grid gap-2 sm:grid-cols-2 lg:grid-cols-4">
        {currentVenues.map((venue) => (
          <Link key={venue.id} href={venue.href} className="group relative rounded-lg border border-emerald-300/25 bg-emerald-500/10 p-2 hover:border-emerald-100/50">
            <p className="text-[11px] font-black uppercase text-white">{venue.name}</p>
            <p className="mt-1 text-[10px] uppercase tracking-[0.1em] text-zinc-300">Occupancy {venue.occupancy}%</p>
            <HoverPreviewLayer className="hidden lg:block">
              <VenuePreviewWindow name={venue.name} occupancy={venue.occupancy} />
            </HoverPreviewLayer>
          </Link>
        ))}
      </div>
    </section>
  );
}
