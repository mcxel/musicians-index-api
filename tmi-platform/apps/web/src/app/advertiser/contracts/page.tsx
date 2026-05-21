import Link from "next/link";

const CONTRACTS = [
  { name: "Homepage Burst Pack", term: "Monthly", status: "Active", value: "$4,200", route: "/billing" },
  { name: "Magazine Header Rotation", term: "Quarterly", status: "Renewing", value: "$8,900", route: "/support" },
  { name: "Venue Screen Takeover", term: "Event-based", status: "Pending", value: "$1,750", route: "/advertiser/placements" },
];

export default function Page() {
  return (
    <main className="min-h-screen bg-[radial-gradient(circle_at_top,rgba(255,45,170,0.08),transparent_35%),linear-gradient(180deg,#050510_0%,#090916_100%)] px-6 py-12 text-white">
      <div className="mx-auto max-w-6xl space-y-6">
        <header className="rounded-3xl border border-amber-400/20 bg-white/5 p-8 backdrop-blur">
          <p className="text-[10px] font-black uppercase tracking-[0.4em] text-amber-300/80">Advertiser Contracts</p>
          <h1 className="mt-3 text-4xl font-black tracking-tight sm:text-5xl">Track agreements, renewals, and value.</h1>
          <p className="mt-3 max-w-3xl text-sm leading-6 text-white/65">
            Contracts are tied directly to billing, placements, and support so every revenue path points somewhere real.
          </p>
        </header>

        <section className="grid gap-4 lg:grid-cols-3">
          {CONTRACTS.map((contract) => (
            <article key={contract.name} className="rounded-2xl border border-white/10 bg-white/5 p-5">
              <div className="flex items-center justify-between gap-3">
                <h2 className="text-lg font-bold text-white">{contract.name}</h2>
                <span className="rounded-full border border-white/15 px-2 py-1 text-[10px] uppercase tracking-[0.18em] text-white/60">
                  {contract.status}
                </span>
              </div>
              <p className="mt-2 text-sm text-white/60">Term: {contract.term}</p>
              <p className="mt-1 text-sm text-white/60">Value: {contract.value}</p>
              <Link
                href={contract.route}
                className="mt-4 inline-flex rounded-xl border border-amber-300/30 bg-amber-400/10 px-4 py-2 text-sm font-semibold text-amber-100 transition hover:border-amber-300/60"
              >
                Open route →
              </Link>
            </article>
          ))}
        </section>
      </div>
    </main>
  );
}