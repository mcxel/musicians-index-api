import Link from "next/link";

interface ArtistBookingAliasProps {
  params: { slug: string };
}

export default function ArtistBookingAliasPage({ params }: ArtistBookingAliasProps) {
  return (
    <main className="min-h-screen bg-[#07040a] px-6 py-10 text-white">
      <div className="mx-auto max-w-4xl rounded-3xl border border-amber-400/30 bg-amber-400/5 p-6">
        <p className="text-xs uppercase tracking-[0.18em] text-amber-200">Artist Booking Alias</p>
        <h1 className="mt-2 text-3xl font-black tracking-[0.04em]">Artist Profile Booking Route</h1>
        <p className="mt-3 text-sm text-slate-300">This route is wired for profile-based booking links and maps to booking workflows for {params.slug}.</p>
        <div className="mt-6 flex flex-wrap gap-3 text-xs uppercase tracking-[0.15em]">
          <Link href={`/booking/artists/${params.slug}`} className="rounded-full border border-white/20 px-3 py-2">Open Booking Flow</Link>
          <Link href={`/profile/artist/${params.slug}`} className="rounded-full border border-white/20 px-3 py-2">Back to Artist</Link>
        </div>
      </div>
    </main>
  );
}
