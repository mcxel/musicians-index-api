import Link from "next/link";
import { ARTIST_SEED } from "@/lib/artists/artistSeed";

type ArtistBookingPageProps = {
  params: Promise<{ slug: string }>;
};

export default async function ArtistBookingPage({ params }: ArtistBookingPageProps) {
  const { slug } = await params;
  const artist = ARTIST_SEED.find((entry) => entry.id === slug);

  return (
    <main className="min-h-screen bg-[#07040a] px-6 py-10 text-white">
      <div className="mx-auto max-w-4xl rounded-3xl border border-amber-400/30 bg-amber-400/5 p-6">
        <p className="text-xs uppercase tracking-[0.18em] text-amber-200">Artist Booking Surface</p>
        <h1 className="mt-2 text-3xl font-black tracking-[0.04em]">Book {artist?.name ?? slug}</h1>
        <p className="mt-3 text-sm text-slate-300">
          Booking contract destination used by Home 1 portal actions. Route is live with fallback-safe links.
        </p>

        <div className="mt-6 flex flex-wrap gap-3 text-xs uppercase tracking-[0.15em]">
          <Link href={`/artists/${slug}`} className="rounded-full border border-white/20 px-3 py-2">Artist Profile</Link>
          <Link href="/booking" className="rounded-full border border-white/20 px-3 py-2">Booking Hub</Link>
        </div>
      </div>
    </main>
  );
}
