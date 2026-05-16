"use client";

import React, { useState, useEffect } from "react";
import { getRegistryStats, queryAssets } from "@/lib/registry/RuntimeAssetRegistry";
import { getLedgerSummary } from "@/lib/registry/AssetAuthorityLedger";
import { getLineageStats } from "@/lib/registry/AssetLineageTracker";
import { getMotionStats } from "@/lib/motion/UniversalMotionRuntime";

function NeonCard({ children, className = "" }: { children: React.ReactNode; className?: string }) {
  return (
    <div className={`rounded-xl border border-cyan-500/30 bg-black/70 backdrop-blur-md p-5 shadow-[0_0_20px_rgba(0,255,255,0.08)] ${className}`}>
      {children}
    </div>
  );
}

const STATUS_COLOR: Record<string, string> = {
  hydrated:  "text-green-400",
  hydrating: "text-blue-400",
  pending:   "text-yellow-400",
  failed:    "text-red-400",
  degraded:  "text-orange-400",
  evicted:   "text-gray-600",
  unregistered: "text-gray-500",
};

export default function RuntimeObservatoryPage() {
  const [tick, setTick] = useState(0);
  useEffect(() => {
    const t = setInterval(() => setTick(n => n + 1), 2000);
    return () => clearInterval(t);
  }, []);

  const regStats = getRegistryStats();
  const ledger = getLedgerSummary();
  const lineage = getLineageStats();
  const motion = getMotionStats();

  const hydrated   = regStats.byStatus["hydrated"]  ?? 0;
  const failed     = regStats.byStatus["failed"]     ?? 0;
  const degraded   = regStats.byStatus["degraded"]   ?? 0;
  const hydrating  = regStats.byStatus["hydrating"]  ?? 0;

  const recentAssets = queryAssets({}).slice(-20).reverse();

  return (
    <div className="min-h-screen bg-black text-white p-6 space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-cyan-400 tracking-wide">Runtime Asset Observatory</h1>
        <span className="text-xs text-gray-500 font-mono">TICK {tick} · {new Date().toLocaleTimeString()}</span>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {[
          { label: "Total Assets",   value: regStats.total,   color: "text-cyan-400" },
          { label: "Hydrated",       value: hydrated,         color: "text-green-400" },
          { label: "Failed",         value: failed,           color: "text-red-400" },
          { label: "Degraded",       value: degraded,         color: "text-orange-400" },
        ].map(({ label, value, color }) => (
          <NeonCard key={label}>
            <div className="text-xs text-gray-400 mb-1">{label}</div>
            <div className={`text-3xl font-bold ${color}`}>{value}</div>
          </NeonCard>
        ))}
      </div>

      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {[
          { label: "Active Claims",    value: ledger.totalClaims,  color: "text-fuchsia-400" },
          { label: "Conflicts",        value: ledger.conflicts,    color: "text-red-400" },
          { label: "Lineage Records",  value: lineage.tracked,     color: "text-yellow-400" },
          { label: "Motion Elements",  value: motion.totalRegistered, color: "text-purple-400" },
        ].map(({ label, value, color }) => (
          <NeonCard key={label}>
            <div className="text-xs text-gray-400 mb-1">{label}</div>
            <div className={`text-3xl font-bold ${color}`}>{value}</div>
          </NeonCard>
        ))}
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <NeonCard>
          <div className="text-sm text-cyan-300 font-semibold mb-3">Assets by Kind</div>
          <div className="flex flex-wrap gap-2">
            {Object.entries(regStats.byKind).map(([kind, count]) => (
              <span key={kind} className="px-2 py-1 rounded bg-cyan-900/30 text-cyan-300 text-xs font-mono">
                {kind}: <strong>{String(count)}</strong>
              </span>
            ))}
          </div>
        </NeonCard>

        <NeonCard>
          <div className="text-sm text-fuchsia-300 font-semibold mb-3">Status Breakdown</div>
          <div className="space-y-1">
            {Object.entries(regStats.byStatus).map(([status, count]) => (
              <div key={status} className="flex items-center justify-between text-xs font-mono">
                <span className={STATUS_COLOR[status] ?? "text-gray-400"}>{status}</span>
                <div className="flex items-center gap-2">
                  <div className="w-24 h-1.5 bg-gray-800 rounded overflow-hidden">
                    <div
                      className="h-full bg-cyan-500 rounded"
                      style={{ width: `${regStats.total > 0 ? ((count as number) / regStats.total) * 100 : 0}%` }}
                    />
                  </div>
                  <span className="text-gray-300 w-6 text-right">{String(count)}</span>
                </div>
              </div>
            ))}
          </div>
        </NeonCard>
      </div>

      <NeonCard>
        <div className="text-sm text-cyan-300 font-semibold mb-3">Recent Assets (latest 20)</div>
        <div className="overflow-x-auto">
          <table className="w-full text-xs font-mono">
            <thead>
              <tr className="text-gray-500 border-b border-gray-800">
                <th className="text-left py-1 pr-4">Asset ID</th>
                <th className="text-left py-1 pr-4">Kind</th>
                <th className="text-left py-1 pr-4">Owner</th>
                <th className="text-left py-1">Status</th>
              </tr>
            </thead>
            <tbody>
              {recentAssets.map(a => (
                <tr key={a.assetId} className="border-b border-gray-900 hover:bg-white/5">
                  <td className="py-1 pr-4 text-gray-300 truncate max-w-[180px]">{a.assetId}</td>
                  <td className="py-1 pr-4 text-cyan-400">{a.kind}</td>
                  <td className="py-1 pr-4 text-gray-400">{a.ownerId}</td>
                  <td className={`py-1 ${STATUS_COLOR[a.hydrationStatus] ?? "text-gray-400"}`}>{a.hydrationStatus}</td>
                </tr>
              ))}
              {recentAssets.length === 0 && (
                <tr><td colSpan={4} className="py-3 text-center text-gray-600">No assets registered yet</td></tr>
              )}
            </tbody>
          </table>
        </div>
      </NeonCard>
    </div>
  );
}
