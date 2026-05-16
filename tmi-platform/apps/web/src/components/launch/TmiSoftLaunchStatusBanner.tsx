import { DEFAULT_FEATURE_FLAGS } from "@/lib/flags/tmiFeatureFlags";

export default function TmiSoftLaunchStatusBanner() {
  const live = Object.entries(DEFAULT_FEATURE_FLAGS)
    .filter(([, enabled]) => enabled)
    .map(([key]) => key);

  const shell = Object.entries(DEFAULT_FEATURE_FLAGS)
    .filter(([, enabled]) => !enabled)
    .map(([key]) => key);

  return (
    <section className="rounded-2xl border border-cyan-300/35 bg-black/45 p-4 text-zinc-100">
      <p className="text-[10px] font-black uppercase tracking-[0.18em] text-cyan-100">Soft Launch</p>
      <h2 className="text-lg font-black uppercase">Launch Status</h2>
      <p className="mt-1 text-xs text-zinc-300">Live systems vs shell systems for staged rollout visibility.</p>
      <div className="mt-3 grid gap-3 lg:grid-cols-2">
        <div className="rounded border border-emerald-300/35 bg-emerald-500/10 p-3">
          <p className="text-[10px] font-black uppercase tracking-[0.14em] text-emerald-100">Live</p>
          <p className="mt-1 text-xs uppercase text-emerald-50">{live.join(", ") || "none"}</p>
        </div>
        <div className="rounded border border-amber-300/35 bg-amber-500/10 p-3">
          <p className="text-[10px] font-black uppercase tracking-[0.14em] text-amber-100">Shell / Coming Next</p>
          <p className="mt-1 text-xs uppercase text-amber-50">{shell.join(", ") || "none"}</p>
        </div>
      </div>
    </section>
  );
}
