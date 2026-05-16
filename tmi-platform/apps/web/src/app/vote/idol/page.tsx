import Link from "next/link";

type VoteIdolPageProps = {
  searchParams: Promise<{ artist?: string }>;
};

export default async function VoteIdolPage({ searchParams }: VoteIdolPageProps) {
  const { artist } = await searchParams;

  return (
    <main className="min-h-screen bg-[#03030a] px-6 py-10 text-white">
      <div className="mx-auto max-w-4xl rounded-3xl border border-cyan-400/35 bg-cyan-400/5 p-6">
        <p className="text-xs uppercase tracking-[0.18em] text-cyan-200">Vote Surface</p>
        <h1 className="mt-2 text-3xl font-black tracking-[0.04em]">Idol Voting Portal</h1>
        <p className="mt-3 text-sm text-slate-300">
          Home1 artifact vote chip destination.
          {artist ? ` Current artist: ${artist}.` : ""}
        </p>

        <div className="mt-6 flex flex-wrap gap-3 text-xs uppercase tracking-[0.15em]">
          <Link href={artist ? `/artists/${artist}` : "/artists"} className="rounded-full border border-white/20 px-3 py-2">View Artist</Link>
          <Link href="/home/1" className="rounded-full border border-white/20 px-3 py-2">Back to Home1</Link>
        </div>
      </div>
    </main>
  );
}
