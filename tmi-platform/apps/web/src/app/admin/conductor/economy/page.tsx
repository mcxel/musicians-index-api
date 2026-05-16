"use client";

import { useEffect, useState } from "react";

export default function ConductorEconomyPage() {
  const [reconciliations, setReconciliations] = useState<any[]>([]);
  const [approvals, setApprovals] = useState<any[]>([]);
  const [killSwitches, setKillSwitches] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    Promise.all([
      fetch("/api/conductor/reconciliations").then((r) => r.json()),
      fetch("/api/conductor/approvals").then((r) => r.json()),
      fetch("/api/conductor/kill-switches").then((r) => r.json()),
    ]).then(([rec, app, ks]) => {
      setReconciliations(rec.items ?? []);
      setApprovals(app.approvals ?? []);
      setKillSwitches(ks.switches ?? []);
      setLoading(false);
    }).catch(() => setLoading(false));
  }, []);

  const economySwitches = killSwitches.filter((s) =>
    ["rewards", "checkout", "wallet", "tickets", "passes", "subscriptions", "store", "payout"].includes(s.key)
  );

  return (
    <main className="min-h-screen bg-black text-white p-6">
      <div className="max-w-5xl mx-auto">
        <div className="mb-6">
          <a href="/admin/conductor" className="text-white/30 text-xs hover:text-white/60 mb-1 block">← MC Command Center</a>
          <h1 className="text-2xl font-black">Economy Monitor</h1>
          <p className="text-white/40 text-sm">Wallet ledger · Rewards · Revenue · Kill switches · Approvals</p>
        </div>

        {loading ? (
          <div className="text-white/40 text-sm">Loading economy data...</div>
        ) : (
          <div className="space-y-8">
            {/* Kill Switches */}
            <section>
              <div className="text-xs text-white/40 uppercase tracking-wider mb-3">Economy Kill Switches</div>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                {economySwitches.length === 0 ? (
                  <div className="col-span-4 text-xs text-white/30">No kill switches seeded yet.</div>
                ) : (
                  economySwitches.map((sw) => (
                    <div
                      key={sw.id}
                      className={`rounded-lg border p-3 ${sw.isEnabled ? "border-green-500/30 bg-green-950/20" : "border-red-500/30 bg-red-950/20"}`}
                    >
                      <div className="text-xs font-mono font-bold text-white">{sw.key}</div>
                      <div className={`text-sm font-bold mt-1 ${sw.isEnabled ? "text-green-400" : "text-red-400"}`}>
                        {sw.isEnabled ? "ENABLED" : "DISABLED"}
                      </div>
                      {sw.reason && <div className="text-xs text-white/30 mt-1">{sw.reason}</div>}
                    </div>
                  ))
                )}
              </div>
            </section>

            {/* Pending Approvals */}
            <section>
              <div className="text-xs text-white/40 uppercase tracking-wider mb-3">
                Pending Approvals ({approvals.length})
              </div>
              {approvals.length === 0 ? (
                <div className="rounded-lg border border-white/10 bg-white/5 p-4 text-xs text-white/30">
                  No pending approvals.
                </div>
              ) : (
                <div className="space-y-2">
                  {approvals.map((ap) => (
                    <div key={ap.id} className="rounded-lg border border-yellow-500/20 bg-yellow-950/10 p-3">
                      <div className="flex items-center justify-between">
                        <div>
                          <span className="text-xs font-mono text-yellow-300">{ap.actionType}</span>
                          <div className="text-xs text-white/60 mt-0.5">{ap.description}</div>
                        </div>
                        <span className="text-xs text-yellow-400">PENDING</span>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </section>

            {/* Ledger Reconciliation */}
            <section>
              <div className="text-xs text-white/40 uppercase tracking-wider mb-3">Ledger Reconciliation History</div>
              {reconciliations.length === 0 ? (
                <div className="rounded-lg border border-white/10 bg-white/5 p-4 text-xs text-white/30">
                  No reconciliations run yet.
                </div>
              ) : (
                <div className="space-y-2">
                  {reconciliations.map((r) => (
                    <div key={r.id} className="rounded-lg border border-white/10 bg-white/5 p-3">
                      <div className="flex items-center justify-between text-xs">
                        <span className="text-white/60">{new Date(r.reconcileDate).toLocaleDateString()}</span>
                        <span className={r.status === "balanced" ? "text-green-400" : r.status === "discrepancy" ? "text-red-400" : "text-white/40"}>
                          {r.status.toUpperCase()}
                        </span>
                      </div>
                      <div className="grid grid-cols-3 gap-2 mt-2 text-xs text-white/40">
                        <span>Wallet: ${r.walletBalance}</span>
                        <span>Rewards: ${r.rewardsClaimed}</span>
                        <span>Payouts: ${r.payoutsTotal}</span>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </section>
          </div>
        )}
      </div>
    </main>
  );
}
