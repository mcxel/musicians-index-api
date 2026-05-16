"use client";

import React, { useState, useEffect } from "react";
import { getRegistryStats } from "@/lib/registry/RuntimeAssetRegistry";
import { getLedgerSummary } from "@/lib/registry/AssetAuthorityLedger";
import { getLineageStats } from "@/lib/registry/AssetLineageTracker";
import { getGraphStats } from "@/lib/registry/HydrationDependencyGraph";
import { getMotionStats } from "@/lib/motion/UniversalMotionRuntime";
import { getAllVenues } from "@/lib/venue/VenueStateEngine";
import { getAllCrowdSnapshots } from "@/lib/personality/CrowdReactionEngine";
import { getAllEnergyStates } from "@/lib/personality/AudienceEnergyEngine";
import { getAllActiveEscalations } from "@/lib/personality/HostEscalationLogic";
import { getVisionBridgeStats } from "@/lib/vision/VisionAuthorityBridge";
import { getPdfRegistryStats } from "@/lib/pdf/PdfAssetRegistry";
import { getAmbientStats } from "@/lib/motion/AmbientAnimationEngine";
import { getPriorityStats } from "@/lib/motion/MotionPriorityEngine";
import { getIdleStats } from "@/lib/personality/IdleEngagementEngine";

function NeonCard({ children, className = "" }: { children: React.ReactNode; className?: string }) {
  return (
    <div className={`rounded-xl border border-purple-500/30 bg-black/70 backdrop-blur-md p-5 shadow-[0_0_20px_rgba(120,0,255,0.07)] ${className}`}>
      {children}
    </div>
  );
}

function StatRow({ label, value, color = "text-white" }: { label: string; value: string | number; color?: string }) {
  return (
    <div className="flex items-center justify-between text-xs font-mono py-1 border-b border-gray-900">
      <span className="text-gray-400">{label}</span>
      <span className={`font-bold ${color}`}>{value}</span>
    </div>
  );
}

function SystemBlock({ title, color, children }: { title: string; color: string; children: React.ReactNode }) {
  return (
    <NeonCard>
      <div className={`text-sm font-semibold mb-3 ${color}`}>{title}</div>
      {children}
    </NeonCard>
  );
}

export default function WorldStatePage() {
  const [tick, setTick] = useState(0);
  useEffect(() => {
    const t = setInterval(() => setTick(n => n + 1), 2000);
    return () => clearInterval(t);
  }, []);

  const reg         = getRegistryStats();
  const ledger      = getLedgerSummary();
  const lineage     = getLineageStats();
  const graph       = getGraphStats();
  const motion      = getMotionStats();
  const venues      = getAllVenues();
  const crowds      = getAllCrowdSnapshots();
  const energies    = getAllEnergyStates();
  const escalations = getAllActiveEscalations();
  const vision      = getVisionBridgeStats();
  const pdf         = getPdfRegistryStats();
  const ambient     = getAmbientStats();
  const priority    = getPriorityStats();
  const idle        = getIdleStats();

  const hydrated  = reg.byStatus["hydrated"]  ?? 0;
  const failed    = reg.byStatus["failed"]     ?? 0;
  const liveVenues = venues.filter(v => v.isLive).length;
  const peakRooms  = energies.filter(e => e.tier === "peak" || e.tier === "overflow").length;

  return (
    <div className="min-h-screen bg-black text-white p-6 space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-purple-400 tracking-wide">World State</h1>
        <span className="text-xs text-gray-500 font-mono">TICK {tick} · {new Date().toLocaleTimeString()}</span>
      </div>

      {/* Top-level health */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {[
          { label: "Live Venues",      value: liveVenues,    color: "text-green-400" },
          { label: "Peak Energy Rooms",value: peakRooms,     color: "text-red-400" },
          { label: "Active Escalations",value: escalations.length, color: "text-orange-400" },
          { label: "Failed Assets",    value: failed,        color: "text-red-500" },
        ].map(({ label, value, color }) => (
          <NeonCard key={label}>
            <div className="text-xs text-gray-400 mb-1">{label}</div>
            <div className={`text-3xl font-bold ${color}`}>{value}</div>
          </NeonCard>
        ))}
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        <SystemBlock title="Asset Registry" color="text-cyan-400">
          <StatRow label="Total"       value={reg.total}    color="text-cyan-400" />
          <StatRow label="Hydrated"    value={hydrated}     color="text-green-400" />
          <StatRow label="Failed"      value={failed}       color="text-red-400" />
          <StatRow label="Hydration %" value={`${(reg.hydrationRate * 100).toFixed(1)}%`} />
        </SystemBlock>

        <SystemBlock title="Authority Ledger" color="text-yellow-400">
          <StatRow label="Total Assets"  value={ledger.totalAssets} />
          <StatRow label="Active Claims" value={ledger.totalClaims} color="text-yellow-400" />
          <StatRow label="Conflicts"     value={ledger.conflicts}   color="text-red-400" />
        </SystemBlock>

        <SystemBlock title="Lineage & Graph" color="text-purple-400">
          <StatRow label="Lineage Records"  value={lineage.tracked}        />
          <StatRow label="Reconstructable"  value={lineage.reconstructable} color="text-green-400" />
          <StatRow label="Graph Nodes"      value={graph.nodes}            />
          <StatRow label="Graph Edges"      value={graph.edges}            />
        </SystemBlock>

        <SystemBlock title="Vision Bridge" color="text-blue-400">
          <StatRow label="Total Jobs"    value={vision.total}    />
          <StatRow label="Pending"       value={vision.pending}  color="text-yellow-400" />
          <StatRow label="Complete"      value={vision.complete} color="text-green-400" />
          <StatRow label="Failed"        value={vision.failed}   color="text-red-400" />
        </SystemBlock>

        <SystemBlock title="PDF Pipeline" color="text-orange-400">
          <StatRow label="Total PDFs"       value={pdf.totalPdfs}        />
          <StatRow label="Complete"         value={pdf.completePipelines} color="text-green-400" />
          <StatRow label="Shards"           value={pdf.totalShards}      />
          <StatRow label="Surfaces"         value={pdf.totalSurfaces}    />
          <StatRow label="Live Ads"         value={pdf.liveAds}          color="text-fuchsia-400" />
        </SystemBlock>

        <SystemBlock title="Motion Layer" color="text-fuchsia-400">
          <StatRow label="Registered"       value={motion.totalRegistered}        />
          <StatRow label="Energy Reactive"  value={motion.energyReactiveCount}    color="text-yellow-400" />
          <StatRow label="Ambient Active"   value={ambient.active}                color="text-green-400" />
          <StatRow label="Ambient Frozen"   value={ambient.frozen}                color="text-gray-500" />
          <StatRow label="Critical Slots"   value={priority.critical?.active ?? 0} color="text-red-400" />
        </SystemBlock>

        <SystemBlock title="Personality / Hosts" color="text-green-400">
          <StatRow label="Rooms (Crowd)"    value={crowds.length}        />
          <StatRow label="Energy States"    value={energies.length}      />
          <StatRow label="Active Escl."     value={escalations.length}   color="text-orange-400" />
          <StatRow label="Idle Engines"     value={idle.activeEngines}   />
          <StatRow label="Idle Events"      value={idle.totalEvents}     />
        </SystemBlock>

        <SystemBlock title="Venues" color="text-teal-400">
          <StatRow label="Total Venues"     value={venues.length}        />
          <StatRow label="Live Now"         value={liveVenues}           color="text-green-400" />
          <StatRow label="Total Occupancy"  value={venues.reduce((s, v) => s + v.capacity.occupied, 0)} />
        </SystemBlock>
      </div>
    </div>
  );
}
