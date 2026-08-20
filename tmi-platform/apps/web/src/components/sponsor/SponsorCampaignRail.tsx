"use client";

import { useCallback, useEffect, useMemo, useState } from "react";

type Campaign = {
  id: string;
  name: string;
  budget: number;
  assignedSurface: string;
  progress: number;
  status?: string;
};

type ApiCampaign = {
  id: string;
  name: string;
  slot?: string;
  placement?: string;
  budget?: number;
  budgetCents?: number;
  status?: string;
  impressions?: number;
  clicks?: number;
};

export default function SponsorCampaignRail() {
  const [campaigns, setCampaigns] = useState<Campaign[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const [name, setName] = useState("Weekend Exposure Burst");
  const [budget, setBudget] = useState(5000);
  const [surface, setSurface] = useState("magazine");

  const loadCampaigns = useCallback(async () => {
    setLoading(true);
    setError("");
    try {
      const res = await fetch("/api/campaigns", { credentials: "include", cache: "no-store" });
      const data = await res.json() as { campaigns?: ApiCampaign[] };
      const mapped = (data.campaigns ?? []).map((c) => ({
        id: c.id,
        name: c.name,
        budget: c.budget ?? (c.budgetCents ?? 0) / 100,
        assignedSurface: c.placement ?? c.slot ?? "—",
        progress: c.impressions && c.budget ? Math.min(100, Math.round((c.impressions / 1000) % 100)) : 0,
        status: c.status,
      }));
      setCampaigns(mapped);
    } catch {
      setError("Unable to load campaigns.");
    }
    setLoading(false);
  }, []);

  useEffect(() => {
    void loadCampaigns();
  }, [loadCampaigns]);

  const totalBudget = useMemo(() => campaigns.reduce((acc, c) => acc + c.budget, 0), [campaigns]);

  const createCampaign = async () => {
    setSaving(true);
    setError("");
    try {
      const res = await fetch("/api/campaigns", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({
          name: name.trim() || "Untitled Campaign",
          placement: surface,
          budget: Math.max(100, budget),
          launch: true,
        }),
      });
      const data = await res.json() as { ok?: boolean; error?: string };
      if (!res.ok || !data.ok) {
        setError(data.error ?? "Failed to create campaign.");
        setSaving(false);
        return;
      }
      await loadCampaigns();
    } catch {
      setError("Network error while saving campaign.");
    }
    setSaving(false);
  };

  return (
    <section className="rounded-xl border border-cyan-400/35 bg-black/45 p-4 backdrop-blur">
      <header className="mb-3">
        <p className="text-[10px] font-black uppercase tracking-[0.28em] text-cyan-300">Campaign Rail</p>
        <h2 className="text-lg font-black uppercase tracking-wide text-white">Sponsor Campaign Runtime</h2>
      </header>

      <div className="mb-3 grid gap-2 sm:grid-cols-3">
        <div className="rounded-lg border border-cyan-300/25 bg-cyan-950/20 p-2">
          <p className="text-[10px] uppercase tracking-[0.12em] text-zinc-400">Campaigns</p>
          <p className="text-xl font-black text-cyan-200">{campaigns.length}</p>
        </div>
        <div className="rounded-lg border border-amber-300/25 bg-amber-950/20 p-2">
          <p className="text-[10px] uppercase tracking-[0.12em] text-zinc-400">Total Budget</p>
          <p className="text-xl font-black text-amber-200">${totalBudget.toLocaleString()}</p>
        </div>
        <div className="rounded-lg border border-fuchsia-300/25 bg-fuchsia-950/20 p-2">
          <p className="text-[10px] uppercase tracking-[0.12em] text-zinc-400">Persistence</p>
          <p className="text-xl font-black text-fuchsia-200">{loading ? "…" : "DB"}</p>
        </div>
      </div>

      <div className="mb-3 grid gap-2 md:grid-cols-4">
        <input className="rounded border border-white/20 bg-black/40 px-2 py-1.5 text-xs text-white" value={name} onChange={(e) => setName(e.target.value)} />
        <input type="number" className="rounded border border-white/20 bg-black/40 px-2 py-1.5 text-xs text-white" value={budget} onChange={(e) => setBudget(Number(e.target.value))} />
        <input className="rounded border border-white/20 bg-black/40 px-2 py-1.5 text-xs text-white" value={surface} onChange={(e) => setSurface(e.target.value)} />
        <button type="button" onClick={() => void createCampaign()} disabled={saving} className="rounded border border-cyan-300/40 bg-cyan-400/10 px-3 py-1.5 text-xs font-black uppercase tracking-[0.12em] text-cyan-100 disabled:opacity-50">
          {saving ? "Saving…" : "Create Campaign →"}
        </button>
      </div>

      {error && <p className="mb-2 text-xs text-red-400">{error}</p>}
      {loading && campaigns.length === 0 && (
        <p className="text-xs text-zinc-400">Loading campaigns…</p>
      )}
      {!loading && campaigns.length === 0 && (
        <p className="text-xs text-zinc-400">No campaigns yet. Create your first campaign above.</p>
      )}

      <div className="space-y-2">
        {campaigns.map((c) => (
          <article key={c.id} className="rounded-lg border border-white/10 bg-zinc-950/60 p-3">
            <div className="flex items-center justify-between gap-2">
              <p className="text-sm font-black uppercase tracking-[0.12em] text-white">{c.name}</p>
              <span className="text-xs text-zinc-300">${c.budget.toLocaleString()}</span>
            </div>
            <p className="mt-1 text-xs text-zinc-400">
              Assignment: {c.assignedSurface}
              {c.status ? ` · ${c.status}` : ""}
            </p>
            <div className="mt-1 h-1.5 overflow-hidden rounded-full bg-zinc-800">
              <div className="h-full bg-[linear-gradient(90deg,#22d3ee,#f472b6)]" style={{ width: `${c.progress}%` }} />
            </div>
          </article>
        ))}
      </div>
    </section>
  );
}
