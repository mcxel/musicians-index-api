import TmiSoftLaunchStatusBanner from "@/components/launch/TmiSoftLaunchStatusBanner";
import TmiBlockerBoard from "@/components/ops/TmiBlockerBoard";
import { getEnvironmentChecklist } from "@/lib/ops/tmiEnvironmentChecklist";

export default function LaunchObservatoryPage() {
  const envChecklist = getEnvironmentChecklist();

  return (
    <main className="min-h-screen bg-[#070b10] px-4 py-6 text-zinc-100">
      <div className="mx-auto max-w-7xl space-y-4">
        <header className="rounded-2xl border border-cyan-300/35 bg-black/45 p-4">
          <p className="text-[10px] font-black uppercase tracking-[0.2em] text-cyan-100">Admin</p>
          <h1 className="text-2xl font-black uppercase">Launch Observatory</h1>
          <p className="mt-1 text-sm text-zinc-300">Accounts, payments, uploads, messages, rooms, tickets, bookings, ads, reports, errors, blockers.</p>
        </header>

        <TmiSoftLaunchStatusBanner />

        <section className="grid gap-4 xl:grid-cols-[1.2fr_1fr]">
          <TmiBlockerBoard />
          <article className="rounded-2xl border border-cyan-300/30 bg-black/45 p-4">
            <h2 className="text-lg font-black uppercase">Environment Checklist</h2>
            <ul className="mt-3 space-y-2">
              {envChecklist.map((item) => (
                <li key={item.key} className="flex items-center justify-between gap-2 rounded border border-zinc-600/40 bg-zinc-900/60 p-2">
                  <span className="text-sm text-zinc-200">{item.label}</span>
                  <span className={`text-[10px] font-black uppercase tracking-[0.14em] ${item.configured ? "text-emerald-300" : "text-rose-300"}`}>
                    {item.configured ? "configured" : "missing"}
                  </span>
                </li>
              ))}
            </ul>
          </article>
        </section>
      </div>
    </main>
  );
}
