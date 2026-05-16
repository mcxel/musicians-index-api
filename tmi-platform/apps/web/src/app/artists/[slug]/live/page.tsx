import Link from "next/link";
import { ARTIST_SEED } from "@/lib/artists/artistSeed";

type ArtistLivePageProps = {
  params: Promise<{ slug: string }>;
};

export default async function ArtistLivePage({ params }: ArtistLivePageProps) {
  const { slug } = await params;
  const artist = ARTIST_SEED.find((entry) => entry.id === slug);

  return (
    <main className="min-h-screen bg-[#04040c] px-6 py-10 text-white">
      <div className="mx-auto max-w-4xl rounded-3xl border border-fuchsia-400/30 bg-fuchsia-400/5 p-6">
        <p className="text-xs uppercase tracking-[0.18em] text-fuchsia-200">Artist Live Surface</p>
        <h1 className="mt-2 text-3xl font-black tracking-[0.04em]">{artist?.name ?? slug} Live Portal</h1>
        <p className="mt-3 text-sm text-slate-300">
          Live route contract destination for Home 1 portal face actions.
        </p>

        <div className="mt-6 flex flex-wrap gap-3 text-xs uppercase tracking-[0.15em]">
          <Link href={`/live/room/${slug}`} className="rounded-full border border-white/20 px-3 py-2">Open Room</Link>
          <Link href={`/artists/${slug}`} className="rounded-full border border-white/20 px-3 py-2">Profile</Link>
          <Link href={`/artists/${slug}/article`} className="rounded-full border border-white/20 px-3 py-2">Article</Link>
        </div>
      </div>
    </main>
  );
}
