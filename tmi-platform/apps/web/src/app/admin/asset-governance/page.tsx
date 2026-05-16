"use client";

import React, { useState, useEffect } from "react";
import { getLedgerSummary, getConflictLog, getClaimsForClaimant } from "@/lib/registry/AssetAuthorityLedger";
import { getLineageStats } from "@/lib/registry/AssetLineageTracker";
import { getGraphStats } from "@/lib/registry/HydrationDependencyGraph";

function NeonCard({ children, className = "" }: { children: React.ReactNode; className?: string }) {
  return (
    <div className={`rounded-xl border border-yellow-500/30 bg-black/70 backdrop-blur-md p-5 shadow-[0_0_20px_rgba(255,200,0,0.05)] ${className}`}>
      {children}
    </div>
  );
}

const ENGINES = [
  "VisionAuthorityBridge",
  "RuntimeAssetClassifier",
  "VenueSceneDecompiler",
  "PdfVisualDecompiler",
  "MagazineLayoutExtractor",
  "InteractiveSurfaceGenerator",
  "AvatarReconstructionEngine",
  "MotionPortraitHydrator",
  "HostIdentityMesh",
];

export default function AssetGovernancePage() {
  const [tick, setTick] = useState(0);
  useEffect(() => {
    const t = setInterval(() => setTick(n => n + 1), 3000);
    return () => clearInterval(t);
  }, []);

  const ledger = getLedgerSummary();
  const lineage = getLineageStats();
  const graph = getGraphStats();
  const conflicts = getConflictLog(20);

  return (
    <div className="min-h-screen bg-black text-white p-6 space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-yellow-400 tracking-wide">Asset Governance</h1>
        <span className="text-xs text-gray-500 font-mono">TICK {tick} · {new Date().toLocaleTimeString()}</span>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {[
          { label: "Total Assets",     value: ledger.totalAssets,  color: "text-yellow-400" },
          { label: "Active Claims",    value: ledger.totalClaims,  color: "text-cyan-400" },
          { label: "Conflicts",        value: ledger.conflicts,    color: "text-red-400" },
          { label: "Reconstructable",  value: lineage.reconstructable, color: "text-green-400" },
        ].map(({ label, value, color }) => (
          <NeonCard key={label}>
            <div className="text-xs text-gray-400 mb-1">{label}</div>
            <div className={`text-3xl font-bold ${color}`}>{value}</div>
          </NeonCard>
        ))}
      </div>

      <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
        {[
          { label: "Lineage Records", value: lineage.tracked,  color: "text-purple-400" },
          { label: "Dep Graph Nodes", value: graph.nodes,      color: "text-cyan-400" },
          { label: "Dep Graph Edges", value: graph.edges,      color: "text-blue-400" },
        ].map(({ label, value, color }) => (
          <NeonCard key={label}>
            <div className="text-xs text-gray-400 mb-1">{label}</div>
            <div className={`text-2xl font-bold ${color}`}>{value}</div>
          </NeonCard>
        ))}
      </div>

      {/* Engine claim summary */}
      <NeonCard>
        <div className="text-sm text-yellow-300 font-semibold mb-3">Claims by Engine</div>
        <div className="grid grid-cols-2 md:grid-cols-3 gap-2">
          {ENGINES.map(engine => {
            const claims = getClaimsForClaimant(engine);
            return (
              <div key={engine} className="flex items-center justify-between bg-gray-900/60 rounded px-3 py-2 text-xs font-mono">
                <span className="text-gray-300 truncate">{engine}</span>
                <span className="text-cyan-400 ml-2 font-bold">{claims.length}</span>
              </div>
            );
          })}
        </div>
      </NeonCard>

      {/* Conflict log */}
      <NeonCard>
        <div className="text-sm text-red-300 font-semibold mb-3">Recent Authority Conflicts (latest 20)</div>
        {conflicts.length === 0 ? (
          <p className="text-gray-600 text-sm">No conflicts recorded.</p>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-xs font-mono">
              <thead>
                <tr className="text-gray-500 border-b border-gray-800">
                  <th className="text-left py-1 pr-3">Asset</th>
                  <th className="text-left py-1 pr-3">Challenger</th>
                  <th className="text-left py-1 pr-3">Incumbent</th>
                  <th className="text-left py-1">Resolved</th>
                </tr>
              </thead>
              <tbody>
                {conflicts.map((c, i) => (
                  <tr key={i} className="border-b border-gray-900 hover:bg-white/5">
                    <td className="py-1 pr-3 text-gray-300 truncate max-w-[160px]">{c.assetId}</td>
                    <td className="py-1 pr-3 text-fuchsia-400 truncate max-w-[120px]">{c.challenger}</td>
                    <td className="py-1 pr-3 text-yellow-400 truncate max-w-[120px]">{c.incumbent}</td>
                    <td className="py-1 text-gray-500">{new Date(c.resolvedAt).toLocaleTimeString()}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </NeonCard>
    </div>
  );
}
