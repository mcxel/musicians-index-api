import Link from "next/link";

const artists = ["ray-journey", "nova-k", "mc-charlie"];

export default function BookingArtistsPage() {
  return (
    <main className="min-h-screen bg-[#07040a] px-6 py-10 text-white">
      <div className="mx-auto max-w-4xl rounded-3xl border border-amber-400/30 bg-amber-400/5 p-6">
        <h1 className="text-3xl font-black tracking-[0.04em]">Booking Artists</h1>
        <p className="mt-2 text-sm text-slate-300">Artist discovery and offer entry point for booking requests.</p>
        <div className="mt-6 flex flex-wrap gap-2 text-xs uppercase tracking-[0.15em]">
          {artists.map((artist) => (
            <Link key={artist} href={`/booking/artists/${artist}`} className="rounded-full border border-white/20 px-3 py-2">
              {artist}
            </Link>
          ))}
        </div>
      </div>
    </main>
  );
}
