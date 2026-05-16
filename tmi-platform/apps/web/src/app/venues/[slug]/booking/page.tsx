import Link from "next/link";

interface VenueBookingPageProps {
  params: { slug: string };
}

export default function VenueBookingPage({ params }: VenueBookingPageProps) {
  return (
    <main className="min-h-screen bg-[#07040a] px-6 py-10 text-white">
      <div className="mx-auto max-w-4xl rounded-3xl border border-amber-400/30 bg-amber-400/5 p-6">
        <p className="text-xs uppercase tracking-[0.18em] text-amber-200">Venue Booking Surface</p>
        <h1 className="mt-2 text-3xl font-black tracking-[0.04em]">{params.slug} Booking</h1>
        <p className="mt-3 text-sm text-slate-300">Venue profile booking route for artist offers and booking confirmation workflows.</p>
        <div className="mt-6 flex flex-wrap gap-3 text-xs uppercase tracking-[0.15em]">
          <Link href="/booking/venues" className="rounded-full border border-white/20 px-3 py-2">Booking Venues Hub</Link>
          <Link href={`/venues/${params.slug}`} className="rounded-full border border-white/20 px-3 py-2">Back to Venue</Link>
        </div>
      </div>
    </main>
  );
}
