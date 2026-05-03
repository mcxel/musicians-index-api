import Link from "next/link";

const ENTRYPOINTS = [
  {
    title: "Venue Booking Operations",
    description: "Manage invites, accepted performers, seat planning, and venue-side runtime controls.",
    href: "/hub/venue",
    accent: "border-cyan-400/35 bg-cyan-500/10 text-cyan-100",
  },
  {
    title: "Performer Booking Center",
    description: "Review booking availability, profile readiness, and performer scheduling context.",
    href: "/hub/performer",
    accent: "border-fuchsia-400/35 bg-fuchsia-500/10 text-fuchsia-100",
  },
  {
    title: "Ticket Runtime",
    description: "Open ticket sales, inventory rails, and conversion surfaces for live events.",
    href: "/tickets",
    accent: "border-emerald-400/35 bg-emerald-500/10 text-emerald-100",
  },
  {
    title: "Venue Event Directory",
    description: "Browse venue-level event routes and linked booking destinations.",
    href: "/venues/events",
    accent: "border-amber-400/35 bg-amber-500/10 text-amber-100",
  },
] as const;

export default function BookingsPage() {
  return (
    <main className="min-h-screen bg-zinc-950 p-6 text-white">
      <div className="mx-auto grid max-w-6xl gap-4">
        <header className="rounded-xl border border-white/10 bg-zinc-900/60 p-5">
          <p className="text-[10px] font-black uppercase tracking-[0.3em] text-cyan-300">Bookings</p>
          <h1 className="mt-1 text-3xl font-black uppercase tracking-tight text-white">Booking Command Surface</h1>
          <p className="mt-2 text-xs uppercase tracking-[0.12em] text-zinc-400">
            Deterministic route fallback for booking operations, performer scheduling, and venue runtime links.
          </p>
        </header>

        <section className="grid gap-3 md:grid-cols-2">
          {ENTRYPOINTS.map((entry) => (
            <article key={entry.href} className="rounded-xl border border-white/10 bg-black/40 p-4">
              <h2 className="text-sm font-black uppercase tracking-[0.12em] text-white">{entry.title}</h2>
              <p className="mt-2 text-xs text-zinc-300">{entry.description}</p>
              <Link
                href={entry.href}
                className={`mt-3 inline-flex rounded-lg border px-3 py-1.5 text-xs font-black uppercase tracking-[0.12em] ${entry.accent}`}
              >
                Open →
              </Link>
            </article>
          ))}
        </section>
      </div>
    </main>
  );
}
