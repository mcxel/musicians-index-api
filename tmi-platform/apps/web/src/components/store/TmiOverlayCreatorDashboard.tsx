"use client";

import { useMemo } from "react";
import { listCreatorDrafts } from "@/lib/store/tmiOverlayCreatorEngine";
import { calculateSaleRevenue } from "@/lib/store/tmiOverlayCreatorRevenueEngine";
import { listCreatorRoyaltyLedger, payoutReadinessState } from "@/lib/store/tmiOverlayCreatorRoyaltyEngine";

export default function TmiOverlayCreatorDashboard({ creatorId = "creator-demo" }: { creatorId?: string }) {
  const drafts = useMemo(() => listCreatorDrafts(creatorId), [creatorId]);
  const royalties = useMemo(() => listCreatorRoyaltyLedger(creatorId), [creatorId]);
  const payout = useMemo(() => payoutReadinessState(creatorId), [creatorId]);
  const monthly = useMemo(() => calculateSaleRevenue({ grossCoins: 42000, sponsorBoostCoins: 2400, seasonBonusCoins: 1800, eventBonusCoins: 1200 }), []);

  const by = (status: string) => drafts.filter((d) => d.status === status).length;

  return (
    <section className="rounded-2xl border border-fuchsia-300/30 bg-black/60 p-4 shadow-[0_0_36px_rgba(217,70,239,0.2)] backdrop-blur-sm">
      <h3 className="mb-3 text-sm font-black uppercase tracking-[0.14em] text-fuchsia-100">Creator Dashboard</h3>

      <div className="mb-3 grid grid-cols-2 gap-2 md:grid-cols-5">
        <Stat label="drafts" value={by("draft")} />
        <Stat label="submitted" value={by("submitted")} />
        <Stat label="approved" value={by("approved")} />
        <Stat label="rejected" value={by("rejected")} />
        <Stat label="published" value={by("published")} />
      </div>

      <div className="mb-3 grid grid-cols-1 gap-2 md:grid-cols-3">
        <Stat label="sales gross" value={monthly.gross} suffix="coins" />
        <Stat label="net creator" value={monthly.netCreatorPayout} suffix="coins" />
        <Stat label="royalty entries" value={royalties.length} />
      </div>

      <div className="mb-3 rounded-xl border border-white/15 bg-black/35 p-3">
        <p className="mb-1 text-[10px] font-black uppercase tracking-[0.14em] text-zinc-300">Payout readiness</p>
        <p className="text-xs uppercase tracking-[0.12em] text-white">
          {payout.ready ? "READY" : "NOT_READY"} · {payout.reason} · balance {Math.round(payout.balance)} coins
        </p>
        <p className="text-[10px] uppercase tracking-[0.12em] text-zinc-300">Simulated until payment provider setup</p>
      </div>

      <div className="grid grid-cols-1 gap-2 md:grid-cols-2">
        <Card title="Votes">LOCKED / NEEDS JULIUS POLL INTEGRATION</Card>
        <Card title="Returns">LOCKED / NEEDS MONTHLY RETURN ENGINE</Card>
        <Card title="Monthly performance">Revenue + royalty trends available (simulated)</Card>
        <Card title="Admin review">Creator overlays require approval before sale</Card>
      </div>
    </section>
  );
}

function Stat({ label, value, suffix }: { label: string; value: string | number; suffix?: string }) {
  return (
    <div className="rounded-xl border border-white/15 bg-black/35 p-2">
      <p className="text-[10px] font-black uppercase tracking-[0.14em] text-zinc-300">{label}</p>
      <p className="text-sm font-black uppercase text-white">
        {value} {suffix ?? ""}
      </p>
    </div>
  );
}

function Card({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div className="rounded-xl border border-white/15 bg-black/35 p-3">
      <p className="mb-1 text-[10px] font-black uppercase tracking-[0.14em] text-zinc-300">{title}</p>
      <p className="text-xs uppercase tracking-[0.12em] text-zinc-100">{children}</p>
    </div>
  );
}
