import type { Metadata } from 'next';
import Link from 'next/link';
import { ARTIST_SEED } from '@/lib/artists/artistSeed';
import BackButton from '@/components/navigation/BackButton';

type ArtistSlugPageProps = {
  params: Promise<{
    slug: string;
  }>;
};

function normalizeSlug(rawSlug: string) {
  return rawSlug.trim().toLowerCase();
}

function toDisplayName(slug: string) {
  return slug
    .split('-')
    .filter(Boolean)
    .map((segment) => segment.charAt(0).toUpperCase() + segment.slice(1))
    .join(' ');
}

function toInitials(name: string) {
  const segments = name.split(' ').filter(Boolean);
  return segments.slice(0, 2).map((segment) => segment.charAt(0)).join('').toUpperCase() || 'AR';
}

/** Derive a pseudo-rank from seed index (1–10 for top slots, else null) */
function getRankFromSeed(slug: string): number | null {
  const TOP_10_LIVE: Record<string, number> = {
    "onyx-lyric": 1,
    "big-a": 2,
    "ray-journey": 3,
    "kai-drift": 4,
    "velvet-lane": 5,
    "circuit-halo": 6,
    "afro-reign": 7,
    "pop-crown": 8,
    "lyra-sky": 9,
    "kira-bloom": 10,
  };
  return TOP_10_LIVE[slug] ?? null;
}

function getTierLabel(slug: string): string {
  const diamondSlugs = new Set(['marcel-dickens', 'b-j-m', 'bjm', 'b-j-m-beats', 'bjm-beats']);
  if (diamondSlugs.has(slug)) return 'Diamond';
  const seed = ARTIST_SEED.find((a) => a.id === slug);
  if (!seed) return 'Pending';
  const map: Record<string, string> = {
    FREE: 'Free', PRO: 'Pro', BRONZE: 'Bronze', SILVER: 'Silver',
    GOLD: 'Gold', PLATINUM: 'Platinum', DIAMOND: 'Diamond',
  };
  return map[seed.tier] ?? 'Pending';
}

export async function generateMetadata({ params }: ArtistSlugPageProps): Promise<Metadata> {
  const { slug } = await params;
  const normalizedSlug = normalizeSlug(slug);
  const seed = ARTIST_SEED.find((a) => a.id === normalizedSlug);
  const artistName = seed?.name ?? toDisplayName(normalizedSlug);

  return {
    title: `${artistName} | Artist Hub | The Musician's Index`,
    description: `${artistName} on The Musician's Index — live stats, ranking, booking, and media.`,
    alternates: { canonical: `/artists/${normalizedSlug}` },
  };
}

export default async function ArtistSlugPage({ params }: ArtistSlugPageProps) {
  const { slug } = await params;
  const normalizedSlug = normalizeSlug(slug);
  const seed = ARTIST_SEED.find((a) => a.id === normalizedSlug);
  const artistName = seed?.name ?? toDisplayName(normalizedSlug);
  const genre = seed?.genre ?? 'Unknown';
  const tierLabel = getTierLabel(normalizedSlug);
  const initials = toInitials(artistName);
  const rank = getRankFromSeed(normalizedSlug);
  const isDiamond = tierLabel === 'Diamond';
  const isGold = tierLabel === 'Gold';
  const isPlatinum = tierLabel === 'Platinum';

  const tierColors =
    isDiamond   ? 'border-amber-400/60 text-amber-200 bg-amber-400/10 shadow-[0_0_18px_rgba(251,191,36,0.3)]'
    : isPlatinum ? 'border-violet-400/60 text-violet-200 bg-violet-400/10 shadow-[0_0_14px_rgba(167,139,250,0.25)]'
    : isGold     ? 'border-yellow-400/60 text-yellow-200 bg-yellow-400/10'
    :              'border-fuchsia-400/40 text-fuchsia-200 bg-fuchsia-400/8';

  // Pseudo live stats from seed slot
  const seedIndex = ARTIST_SEED.findIndex((a) => a.id === normalizedSlug);
  const votes = seedIndex >= 0 ? 1000 + seedIndex * 347 : 0;
  const streams = seedIndex >= 0 ? 4200 + seedIndex * 892 : 0;
  const battles = seedIndex >= 0 ? 3 + (seedIndex % 7) : 0;

  return (
    <main className="artist-profile min-h-screen bg-[#06040f] text-white">
      {/* ── Neon scanline background ── */}
      <div
        aria-hidden
        className="pointer-events-none fixed inset-0 z-0"
        style={{
          background: 'radial-gradient(ellipse 120% 80% at 50% -10%, rgba(34,211,238,0.08) 0%, transparent 65%), radial-gradient(ellipse 80% 60% at 90% 100%, rgba(217,70,239,0.07) 0%, transparent 60%)',
        }}
      />
      <div
        aria-hidden
        className="pointer-events-none fixed inset-0 z-0 opacity-[0.035]"
        style={{ backgroundImage: 'repeating-linear-gradient(0deg, transparent, transparent 2px, rgba(255,255,255,0.4) 2px, rgba(255,255,255,0.4) 3px)', backgroundSize: '100% 3px' }}
      />

      <div className="relative z-10 mx-auto max-w-6xl px-4 py-10 space-y-6">

        {/* ── Back nav ── */}
        <nav className="flex items-center gap-3">
          <BackButton fallback="/home/1" label="← Back" />
        </nav>

        {/* ── Hero ── */}
        <section className="relative overflow-hidden rounded-[28px] border border-cyan-400/20 bg-gradient-to-br from-[#0f0c1e] via-[#0a0816] to-[#060410] shadow-[0_0_60px_rgba(34,211,238,0.1),0_0_120px_rgba(217,70,239,0.06)]">
          {/* corner glow */}
          <div aria-hidden className="pointer-events-none absolute -top-24 -right-24 h-64 w-64 rounded-full bg-cyan-400/10 blur-3xl" />
          <div aria-hidden className="pointer-events-none absolute -bottom-16 -left-16 h-48 w-48 rounded-full bg-fuchsia-500/10 blur-3xl" />

          <div className="relative z-10 flex flex-col gap-6 p-6 md:flex-row md:items-start md:p-8">

            {/* Avatar / Portrait */}
            <div className="relative flex-shrink-0">
              <div
                className="flex h-44 w-44 items-center justify-center rounded-[28px] border-2 border-cyan-400/30 bg-gradient-to-br from-cyan-400/15 to-fuchsia-500/20 text-6xl font-black tracking-[0.15em] text-white shadow-[0_0_32px_rgba(34,211,238,0.2),inset_0_0_24px_rgba(217,70,239,0.08)]"
                style={{ fontFamily: 'monospace' }}
              >
                {initials}
              </div>
              {rank !== null && (
                <div className="absolute -top-3 -right-3 flex h-10 w-10 items-center justify-center rounded-full border-2 border-yellow-400 bg-[#0f0c1e] text-[13px] font-black text-yellow-400 shadow-[0_0_12px_rgba(251,191,36,0.6)]">
                  #{rank}
                </div>
              )}
              {/* LIVE pulse indicator */}
              <div className="absolute -bottom-2 left-1/2 -translate-x-1/2 flex items-center gap-1 rounded-full border border-emerald-400/40 bg-emerald-400/10 px-3 py-0.5">
                <span className="h-1.5 w-1.5 animate-pulse rounded-full bg-emerald-400" />
                <span className="text-[9px] uppercase tracking-[0.2em] text-emerald-300">Live</span>
              </div>
            </div>

            {/* Identity */}
            <div className="flex-1 space-y-4">
              <div className="flex flex-wrap items-center gap-2">
                <span className="rounded-full border border-cyan-300/30 bg-cyan-300/8 px-3 py-0.5 text-[10px] uppercase tracking-[0.25em] text-cyan-300">
                  Artist Hub
                </span>
                <span className={`rounded-full border px-3 py-0.5 text-[10px] uppercase tracking-[0.25em] ${tierColors}`}>
                  {tierLabel}
                </span>
                <span className="rounded-full border border-fuchsia-300/25 bg-fuchsia-300/8 px-3 py-0.5 text-[10px] uppercase tracking-[0.25em] text-fuchsia-300">
                  {genre}
                </span>
              </div>

              <div>
                <h1
                  className="text-5xl font-black leading-none tracking-[0.03em] text-white md:text-6xl"
                  style={{ textShadow: '0 0 40px rgba(34,211,238,0.3), 0 0 80px rgba(217,70,239,0.15)' }}
                >
                  {artistName}
                </h1>
                <p className="mt-1.5 font-mono text-xs uppercase tracking-[0.3em] text-slate-500">
                  tmi/{normalizedSlug}
                </p>
              </div>

              {/* Live Stats Row */}
              <div className="grid grid-cols-3 gap-3">
                <div className="rounded-2xl border border-cyan-400/15 bg-cyan-400/5 p-3 text-center">
                  <p className="text-[10px] uppercase tracking-[0.2em] text-slate-500">Votes</p>
                  <p className="mt-1 text-2xl font-black text-cyan-300" style={{ textShadow: '0 0 12px rgba(34,211,238,0.5)' }}>
                    {votes.toLocaleString()}
                  </p>
                  <p className="text-[9px] text-slate-600 uppercase tracking-widest">MOM +12%</p>
                </div>
                <div className="rounded-2xl border border-fuchsia-400/15 bg-fuchsia-400/5 p-3 text-center">
                  <p className="text-[10px] uppercase tracking-[0.2em] text-slate-500">Streams</p>
                  <p className="mt-1 text-2xl font-black text-fuchsia-300" style={{ textShadow: '0 0 12px rgba(217,70,239,0.5)' }}>
                    {(streams / 1000).toFixed(1)}K
                  </p>
                  <p className="text-[9px] text-slate-600 uppercase tracking-widest">7-day live</p>
                </div>
                <div className="rounded-2xl border border-amber-400/15 bg-amber-400/5 p-3 text-center">
                  <p className="text-[10px] uppercase tracking-[0.2em] text-slate-500">Battles</p>
                  <p className="mt-1 text-2xl font-black text-amber-300" style={{ textShadow: '0 0 12px rgba(251,191,36,0.4)' }}>
                    {battles}W
                  </p>
                  <p className="text-[9px] text-slate-600 uppercase tracking-widest">Cypher record</p>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="flex flex-wrap gap-2 pt-1">
                <Link
                  href={`/artists/${normalizedSlug}/article`}
                  className="rounded-xl border border-cyan-400/40 bg-cyan-400/10 px-5 py-2.5 text-[11px] font-bold uppercase tracking-[0.2em] text-cyan-200 shadow-[0_0_12px_rgba(34,211,238,0.15)] transition-all hover:bg-cyan-400/20 hover:shadow-[0_0_20px_rgba(34,211,238,0.3)]"
                >
                  Article
                </Link>
                <Link
                  href={`/vote?artist=${normalizedSlug}`}
                  className="rounded-xl border border-fuchsia-400/40 bg-fuchsia-400/10 px-5 py-2.5 text-[11px] font-bold uppercase tracking-[0.2em] text-fuchsia-200 shadow-[0_0_12px_rgba(217,70,239,0.15)] transition-all hover:bg-fuchsia-400/20 hover:shadow-[0_0_20px_rgba(217,70,239,0.3)]"
                >
                  Vote
                </Link>
                <Link
                  href={`/artists/${normalizedSlug}/live`}
                  className="rounded-xl border border-emerald-400/40 bg-emerald-400/10 px-5 py-2.5 text-[11px] font-bold uppercase tracking-[0.2em] text-emerald-200 shadow-[0_0_12px_rgba(16,185,129,0.15)] transition-all hover:bg-emerald-400/20 hover:shadow-[0_0_20px_rgba(16,185,129,0.3)]"
                >
                  Live
                </Link>
                <Link
                  href={`/booking/artists/${normalizedSlug}`}
                  className="rounded-xl border border-amber-400/40 bg-amber-400/10 px-5 py-2.5 text-[11px] font-bold uppercase tracking-[0.2em] text-amber-200 shadow-[0_0_12px_rgba(251,191,36,0.15)] transition-all hover:bg-amber-400/20 hover:shadow-[0_0_20px_rgba(251,191,36,0.3)]"
                >
                  Book
                </Link>
                <Link
                  href={`/artists/${normalizedSlug}/analytics`}
                  className="rounded-xl border border-violet-400/40 bg-violet-400/10 px-5 py-2.5 text-[11px] font-bold uppercase tracking-[0.2em] text-violet-200 shadow-[0_0_12px_rgba(167,139,250,0.15)] transition-all hover:bg-violet-400/20 hover:shadow-[0_0_20px_rgba(167,139,250,0.3)]"
                >
                  Stats
                </Link>
              </div>
            </div>
          </div>
        </section>

        {/* ── Media + Article Row ── */}
        <section className="grid gap-4 lg:grid-cols-2">

          {/* Media Locker */}
          <div className="group relative overflow-hidden rounded-[22px] border border-fuchsia-400/20 bg-gradient-to-br from-[#110a1e] to-[#06040f] p-5 shadow-[0_0_22px_rgba(217,70,239,0.08)]">
            <div aria-hidden className="pointer-events-none absolute -top-12 -right-12 h-32 w-32 rounded-full bg-fuchsia-500/10 blur-2xl" />
            <div className="relative z-10">
              <div className="mb-4 flex items-center justify-between">
                <h2 className="text-sm font-bold uppercase tracking-[0.2em] text-fuchsia-200">Media Locker</h2>
                <span className="rounded-full border border-fuchsia-400/20 px-2 py-0.5 text-[9px] uppercase tracking-[0.15em] text-fuchsia-400">
                  {genre}
                </span>
              </div>
              <div className="space-y-2">
                {['Latest Track', 'Music Video', 'Studio Session', 'Live Clip'].map((label, i) => (
                  <div
                    key={label}
                    className="flex items-center gap-3 rounded-xl border border-white/5 bg-white/3 p-3 transition-colors hover:border-fuchsia-400/30"
                  >
                    <div className="flex h-8 w-8 flex-shrink-0 items-center justify-center rounded-lg bg-fuchsia-400/10 text-fuchsia-300 text-xs font-bold">
                      {String(i + 1).padStart(2, '0')}
                    </div>
                    <span className="flex-1 text-xs text-slate-300">{label}</span>
                    <span className="text-[9px] text-slate-600 uppercase tracking-widest">Preview</span>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Article Linkage */}
          <div className="group relative overflow-hidden rounded-[22px] border border-cyan-400/20 bg-gradient-to-br from-[#0a101e] to-[#06040f] p-5 shadow-[0_0_22px_rgba(34,211,238,0.08)]">
            <div aria-hidden className="pointer-events-none absolute -top-12 -left-12 h-32 w-32 rounded-full bg-cyan-500/10 blur-2xl" />
            <div className="relative z-10">
              <div className="mb-4 flex items-center justify-between">
                <h2 className="text-sm font-bold uppercase tracking-[0.2em] text-cyan-200">Editorial</h2>
                <Link href="/home/2" className="text-[9px] uppercase tracking-[0.15em] text-cyan-500 hover:text-cyan-300 transition-colors">
                  Browse →
                </Link>
              </div>
              <div className="space-y-2">
                {[
                  { label: 'Artist Feature', badge: 'FEATURE', href: `/artists/${normalizedSlug}/article` },
                  { label: 'Genre Deep Dive', badge: 'EDITORIAL', href: '/home/2' },
                  { label: 'Live Recap', badge: 'RECAP', href: '/home/3' },
                  { label: 'Culture Story', badge: 'CULTURE', href: '/home/2' },
                ].map(({ label, badge, href }) => (
                  <Link
                    key={label}
                    href={href}
                    className="flex items-center gap-3 rounded-xl border border-white/5 bg-white/3 p-3 transition-colors hover:border-cyan-400/30"
                  >
                    <span className="rounded border border-cyan-400/25 px-1.5 py-0.5 text-[8px] font-bold uppercase tracking-[0.12em] text-cyan-400">
                      {badge}
                    </span>
                    <span className="flex-1 text-xs text-slate-300">{label}</span>
                  </Link>
                ))}
              </div>
            </div>
          </div>
        </section>

        {/* ── Booking + Stats Row ── */}
        <section className="grid gap-4 lg:grid-cols-2">

          {/* Booking Entry */}
          <div className="relative overflow-hidden rounded-[22px] border border-emerald-400/20 bg-gradient-to-br from-[#091410] to-[#06040f] p-5 shadow-[0_0_22px_rgba(16,185,129,0.08)]">
            <div aria-hidden className="pointer-events-none absolute -bottom-12 -right-12 h-32 w-32 rounded-full bg-emerald-500/10 blur-2xl" />
            <div className="relative z-10">
              <h2 className="mb-4 text-sm font-bold uppercase tracking-[0.2em] text-emerald-200">Booking Entry</h2>
              <div className="grid grid-cols-2 gap-3">
                {[
                  { label: 'Private Event', desc: 'Venue + fee', href: `/booking/artists/${normalizedSlug}` },
                  { label: 'Live Room', desc: 'Stream slot', href: '/rooms/lobby' },
                  { label: 'Collab Request', desc: 'Artist sync', href: `/artists/${normalizedSlug}` },
                  { label: 'Sponsor Deck', desc: 'Brand package', href: '/advertise' },
                ].map(({ label, desc, href }) => (
                  <Link
                    key={label}
                    href={href}
                    className="rounded-xl border border-emerald-400/15 bg-emerald-400/5 p-3 transition-colors hover:border-emerald-400/35 hover:bg-emerald-400/10"
                  >
                    <p className="text-xs font-semibold text-emerald-200">{label}</p>
                    <p className="mt-0.5 text-[10px] text-slate-500">{desc}</p>
                  </Link>
                ))}
              </div>
            </div>
          </div>

          {/* Stats + Reputation */}
          <div className="relative overflow-hidden rounded-[22px] border border-amber-400/20 bg-gradient-to-br from-[#12100a] to-[#06040f] p-5 shadow-[0_0_22px_rgba(245,158,11,0.08)]">
            <div aria-hidden className="pointer-events-none absolute -top-12 right-0 h-32 w-32 rounded-full bg-amber-500/10 blur-2xl" />
            <div className="relative z-10">
              <div className="mb-4 flex items-center justify-between">
                <h2 className="text-sm font-bold uppercase tracking-[0.2em] text-amber-200">Stats + Reputation</h2>
                {rank !== null && (
                  <span className="rounded-full border border-yellow-400/40 bg-yellow-400/10 px-3 py-0.5 text-[10px] font-bold text-yellow-400">
                    Global #{rank}
                  </span>
                )}
              </div>
              <div className="space-y-2">
                {[
                  { label: 'Weekly Votes', value: votes.toLocaleString(), bar: Math.min(100, (votes / 5000) * 100), color: 'bg-cyan-400' },
                  { label: 'Stream Count', value: `${(streams / 1000).toFixed(1)}K`, bar: Math.min(100, (streams / 20000) * 100), color: 'bg-fuchsia-400' },
                  { label: 'Battle Wins', value: `${battles}`, bar: Math.min(100, (battles / 10) * 100), color: 'bg-amber-400' },
                  { label: 'Crown Points', value: `${(votes + battles * 50).toLocaleString()}`, bar: Math.min(100, ((votes + battles * 50) / 8000) * 100), color: 'bg-emerald-400' },
                ].map(({ label, value, bar, color }) => (
                  <div key={label} className="space-y-1">
                    <div className="flex items-center justify-between">
                      <span className="text-[10px] uppercase tracking-[0.15em] text-slate-500">{label}</span>
                      <span className="text-xs font-bold text-slate-300">{value}</span>
                    </div>
                    <div className="h-1.5 w-full overflow-hidden rounded-full bg-white/5">
                      <div className={`h-full rounded-full ${color} opacity-70 transition-all`} style={{ width: `${bar}%` }} />
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </section>

        {/* ── Footer nav ── */}
        <footer className="flex items-center justify-between border-t border-white/5 pt-4">
          <Link href="/home/5" className="text-[10px] uppercase tracking-[0.2em] text-slate-600 hover:text-slate-400 transition-colors">
            ← Back to Rankings
          </Link>
          <div className="flex gap-4">
            <Link href="/home/1" className="text-[10px] uppercase tracking-[0.2em] text-slate-600 hover:text-slate-400 transition-colors">Home</Link>
            <Link href="/home/2" className="text-[10px] uppercase tracking-[0.2em] text-slate-600 hover:text-slate-400 transition-colors">Editorial</Link>
            <Link href="/leaderboards" className="text-[10px] uppercase tracking-[0.2em] text-slate-600 hover:text-slate-400 transition-colors">All Rankings</Link>
          </div>
        </footer>

      </div>
    </main>
  );
}