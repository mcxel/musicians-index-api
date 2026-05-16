import Link from "next/link";
import { listVenueBookingMatches } from "@/lib/booking/tmiVenueBookingMatchEngine";

export default function BookingVenuesPage() {
  const matches = listVenueBookingMatches();

  return (
    <main className="min-h-screen bg-[#07040a] px-6 py-10 text-white">
      <div className="mx-auto max-w-5xl rounded-3xl border border-amber-400/30 bg-amber-400/5 p-6">
        <h1 className="text-3xl font-black tracking-[0.04em]">Booking Venues</h1>
        <p className="mt-2 text-sm text-slate-300">Venue matching index for live booking requests.</p>
        <div className="mt-6 grid gap-3">
          {matches.map((match) => (
            <div key={match.id} className="rounded-xl border border-white/10 bg-black/25 p-4 text-sm">
              <div className="font-bold text-amber-200">{match.venueName}</div>
              <div className="text-slate-300">Performer: {match.performerName} | Genre: {match.genre} | Status: {match.status}</div>
            </div>
          ))}
        </div>
        <div className="mt-6 flex gap-3 text-xs uppercase tracking-[0.15em]">
          <Link href="/booking" className="rounded-full border border-white/20 px-3 py-2">Booking Hub</Link>
          <Link href="/booking/offers" className="rounded-full border border-white/20 px-3 py-2">Offers</Link>
        </div>
      </div>
    </main>
  );
}
