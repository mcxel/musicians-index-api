import type { Metadata } from 'next';

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

function getTierLabel(slug: string) {
  const diamondSlugs = new Set(['marcel-dickens', 'b-j-m', 'bjm', 'b-j-m-beats', 'bjm-beats']);
  if (diamondSlugs.has(slug)) return 'Diamond';
  return 'Tier Pending';
}

export async function generateMetadata({ params }: ArtistSlugPageProps): Promise<Metadata> {
  const { slug } = await params;
  const normalizedSlug = normalizeSlug(slug);
  const artistName = toDisplayName(normalizedSlug);

  return {
    title: `${artistName} | Artist Hub | The Musician's Index`,
    description: `${artistName} artist hub on The Musician's Index. Profile identity, media, articles, booking, and stats surfaces live here.`,
  };
}

export default async function ArtistSlugPage({ params }: ArtistSlugPageProps) {
  const { slug } = await params;
  const normalizedSlug = normalizeSlug(slug);
  const artistName = toDisplayName(normalizedSlug);
  const tierLabel = getTierLabel(normalizedSlug);
  const initials = toInitials(artistName);
  const isDiamond = tierLabel === 'Diamond';

  return (
    <main className="min-h-screen bg-black px-6 py-12 text-white">
      <div className="mx-auto max-w-6xl space-y-6">
        <section className="overflow-hidden rounded-[28px] border border-cyan-400/30 bg-gradient-to-br from-cyan-500/10 via-black to-fuchsia-500/10 shadow-[0_0_32px_rgba(34,211,238,0.18)]">
          <div className="grid gap-6 px-6 py-8 md:grid-cols-[180px_minmax(0,1fr)] md:px-8">
            <div className="flex h-40 w-40 items-center justify-center rounded-[32px] border border-white/15 bg-gradient-to-br from-cyan-400/20 to-fuchsia-500/20 text-5xl font-black tracking-[0.2em] text-cyan-100 shadow-[0_0_24px_rgba(217,70,239,0.18)]">
              {initials}
            </div>

            <div className="space-y-4">
              <div className="flex flex-wrap items-center gap-3">
                <span className="rounded-full border border-cyan-300/30 bg-cyan-300/10 px-3 py-1 text-[11px] uppercase tracking-[0.25em] text-cyan-200">
                  Artist Hub
                </span>
                <span
                  className={`rounded-full border px-3 py-1 text-[11px] uppercase tracking-[0.25em] ${
                    isDiamond
                      ? 'border-amber-300/40 bg-amber-300/10 text-amber-200'
                      : 'border-fuchsia-300/30 bg-fuchsia-300/10 text-fuchsia-200'
                  }`}
                >
                  {tierLabel}
                </span>
              </div>

              <div>
                <h1 className="text-4xl font-black tracking-[0.04em] text-white md:text-5xl">{artistName}</h1>
                <p className="mt-2 text-sm uppercase tracking-[0.28em] text-slate-400">/{normalizedSlug}</p>
              </div>

              <p className="max-w-3xl text-sm leading-7 text-slate-300 md:text-base">
                Canonical artist hub scaffold. This surface is the future home for identity, Diamond tier display, media locker,
                booking entry, article linkage, stats, and sponsor modules. Runtime wiring is intentionally narrow in this slice.
              </p>

              <div className="grid gap-3 sm:grid-cols-3">
                <div className="rounded-2xl border border-white/10 bg-white/5 p-4">
                  <p className="text-[11px] uppercase tracking-[0.22em] text-slate-400">Profile State</p>
                  <p className="mt-2 text-lg font-semibold text-white">Identity Live</p>
                  <p className="mt-1 text-sm text-slate-300">Slug surface is now the canonical route.</p>
                </div>
                <div className="rounded-2xl border border-white/10 bg-white/5 p-4">
                  <p className="text-[11px] uppercase tracking-[0.22em] text-slate-400">Article Linkage</p>
                  <p className="mt-2 text-lg font-semibold text-white">Pending Wire</p>
                  <p className="mt-1 text-sm text-slate-300">Profile article hook connects in the next editorial pass.</p>
                </div>
                <div className="rounded-2xl border border-white/10 bg-white/5 p-4">
                  <p className="text-[11px] uppercase tracking-[0.22em] text-slate-400">Booking Entry</p>
                  <p className="mt-2 text-lg font-semibold text-white">Reserved</p>
                  <p className="mt-1 text-sm text-slate-300">Booking, sponsors, and stats all anchor here later.</p>
                </div>
              </div>
            </div>
          </div>
        </section>

        <section className="grid gap-4 lg:grid-cols-2">
          <div className="rounded-[24px] border border-fuchsia-400/25 bg-gradient-to-br from-fuchsia-500/10 to-black p-5 shadow-[0_0_22px_rgba(217,70,239,0.12)]">
            <div className="mb-3 flex items-center justify-between">
              <h2 className="text-lg font-bold uppercase tracking-[0.18em] text-fuchsia-200">Media Locker</h2>
              <span className="text-xs text-slate-400">placeholder</span>
            </div>
            <p className="text-sm leading-7 text-slate-300">
              Approved artist-linked media, preview source selection, and future shared preview hooks land in this panel.
            </p>
          </div>

          <div className="rounded-[24px] border border-cyan-400/25 bg-gradient-to-br from-cyan-500/10 to-black p-5 shadow-[0_0_22px_rgba(34,211,238,0.12)]">
            <div className="mb-3 flex items-center justify-between">
              <h2 className="text-lg font-bold uppercase tracking-[0.18em] text-cyan-200">Article Linkage</h2>
              <span className="text-xs text-slate-400">placeholder</span>
            </div>
            <p className="text-sm leading-7 text-slate-300">
              Profile article, event recap, and magazine spread references connect here once editorial routing is wired.
            </p>
          </div>

          <div className="rounded-[24px] border border-emerald-400/25 bg-gradient-to-br from-emerald-500/10 to-black p-5 shadow-[0_0_22px_rgba(16,185,129,0.12)]">
            <div className="mb-3 flex items-center justify-between">
              <h2 className="text-lg font-bold uppercase tracking-[0.18em] text-emerald-200">Booking Entry</h2>
              <span className="text-xs text-slate-400">placeholder</span>
            </div>
            <p className="text-sm leading-7 text-slate-300">
              Booking requests, venue history, and operator controls will attach to this surface in the booking engine slice.
            </p>
          </div>

          <div className="rounded-[24px] border border-amber-400/25 bg-gradient-to-br from-amber-500/10 to-black p-5 shadow-[0_0_22px_rgba(245,158,11,0.12)]">
            <div className="mb-3 flex items-center justify-between">
              <h2 className="text-lg font-bold uppercase tracking-[0.18em] text-amber-200">Stats + Reputation</h2>
              <span className="text-xs text-slate-400">placeholder</span>
            </div>
            <p className="text-sm leading-7 text-slate-300">
              Reputation, battle stats, points, venue history, and sponsor-facing profile metrics are reserved here.
            </p>
          </div>
        </section>
      </div>
    </main>
  );
}
