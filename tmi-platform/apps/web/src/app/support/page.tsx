import Link from "next/link";

const SUPPORT_ROUTES = [
  { label: "FAQ", href: "/faq", description: "Common billing, login, and account questions." },
  { label: "Account Recovery", href: "/support/account-recovery", description: "Restore access to your account or session." },
  { label: "Billing", href: "/billing", description: "Review subscription, checkout, and payment flows." },
  { label: "Security", href: "/auth/device-trust", description: "Device trust and access protection tools." },
  { label: "Admin Support", href: "/admin/support", description: "Operations and escalations for internal teams." },
  { label: "Login", href: "/auth/signin", description: "Return to sign in if you are locked out." },
];

export default function SupportPage() {
  return (
    <main className="min-h-screen bg-[radial-gradient(circle_at_top,rgba(0,255,255,0.08),transparent_35%),linear-gradient(180deg,#050510_0%,#090916_100%)] px-6 py-12 text-white">
      <div className="mx-auto flex max-w-6xl flex-col gap-8">
        <header className="rounded-3xl border border-cyan-400/20 bg-white/5 p-8 backdrop-blur">
          <p className="text-[10px] font-black uppercase tracking-[0.4em] text-cyan-300/80">Support Center</p>
          <h1 className="mt-3 text-4xl font-black tracking-tight sm:text-5xl">Get help without leaving the system.</h1>
          <p className="mt-3 max-w-3xl text-sm leading-6 text-white/65">
            This landing page routes users to the live support surfaces already in the platform: recovery, billing, security, and operational support.
          </p>
        </header>

        <section className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
          {SUPPORT_ROUTES.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              className="group rounded-2xl border border-white/10 bg-white/5 p-5 transition hover:border-cyan-300/40 hover:bg-white/8"
            >
              <div className="flex items-center justify-between gap-4">
                <h2 className="text-lg font-bold text-white">{item.label}</h2>
                <span className="text-cyan-300 transition group-hover:translate-x-0.5">→</span>
              </div>
              <p className="mt-2 text-sm leading-6 text-white/60">{item.description}</p>
            </Link>
          ))}
        </section>

        <section className="rounded-2xl border border-fuchsia-400/20 bg-fuchsia-500/8 p-6">
          <p className="text-[10px] font-black uppercase tracking-[0.3em] text-fuchsia-200/80">Priority Paths</p>
          <div className="mt-4 grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
            <Link href="/checkout" className="rounded-xl border border-white/10 bg-black/20 px-4 py-3 text-sm font-semibold text-white/85 hover:border-fuchsia-300/40">
              Payments
            </Link>
            <Link href="/tickets/scan" className="rounded-xl border border-white/10 bg-black/20 px-4 py-3 text-sm font-semibold text-white/85 hover:border-fuchsia-300/40">
              Ticketing
            </Link>
            <Link href="/hub/fan" className="rounded-xl border border-white/10 bg-black/20 px-4 py-3 text-sm font-semibold text-white/85 hover:border-fuchsia-300/40">
              Fan Hub
            </Link>
            <Link href="/hub/advertiser" className="rounded-xl border border-white/10 bg-black/20 px-4 py-3 text-sm font-semibold text-white/85 hover:border-fuchsia-300/40">
              Advertiser Hub
            </Link>
          </div>
        </section>
      </div>
    </main>
  );
}
