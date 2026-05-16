"use client";

import React, { useState, useEffect } from "react";
import { getAllActiveEscalations, type EscalationTrigger, type EscalationLevel } from "@/lib/personality/HostEscalationLogic";
import { getAllCrowdSnapshots, type CrowdMood } from "@/lib/personality/CrowdReactionEngine";
import { getAllEnergyStates } from "@/lib/personality/AudienceEnergyEngine";

function NeonCard({ children, className = "" }: { children: React.ReactNode; className?: string }) {
  return (
    <div className={`rounded-xl border border-fuchsia-500/30 bg-black/70 backdrop-blur-md p-5 shadow-[0_0_20px_rgba(200,0,255,0.06)] ${className}`}>
      {children}
    </div>
  );
}

const LEVEL_COLOR: Record<EscalationLevel, string> = {
  baseline: "text-gray-400",
  elevated: "text-yellow-400",
  intense:  "text-orange-400",
  climax:   "text-red-400",
  cooldown: "text-blue-400",
};

const MOOD_COLOR: Record<CrowdMood, string> = {
  dead:     "text-gray-600",
  warming:  "text-blue-400",
  engaged:  "text-cyan-400",
  hyped:    "text-yellow-400",
  frenzy:   "text-orange-400",
  riot:     "text-red-400",
};

export default function LiveEscalationsPage() {
  const [tick, setTick] = useState(0);
  useEffect(() => {
    const t = setInterval(() => setTick(n => n + 1), 1500);
    return () => clearInterval(t);
  }, []);

  const escalations = getAllActiveEscalations();
  const crowds = getAllCrowdSnapshots();
  const energyStates = getAllEnergyStates();

  return (
    <div className="min-h-screen bg-black text-white p-6 space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-fuchsia-400 tracking-wide">Live Escalations</h1>
        <span className="text-xs text-gray-500 font-mono">TICK {tick} · {new Date().toLocaleTimeString()}</span>
      </div>

      {/* Summary KPIs */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {[
          { label: "Active Escalations", value: escalations.length,  color: "text-red-400" },
          { label: "Rooms Monitored",    value: crowds.length,        color: "text-cyan-400" },
          { label: "At Peak",            value: energyStates.filter(e => e.tier === "peak" || e.tier === "overflow").length, color: "text-orange-400" },
          { label: "Building",           value: energyStates.filter(e => e.tier === "building").length, color: "text-yellow-400" },
        ].map(({ label, value, color }) => (
          <NeonCard key={label}>
            <div className="text-xs text-gray-400 mb-1">{label}</div>
            <div className={`text-3xl font-bold ${color}`}>{value}</div>
          </NeonCard>
        ))}
      </div>

      {/* Active escalations */}
      <NeonCard>
        <div className="text-sm text-red-300 font-semibold mb-3">Active Host Escalations</div>
        {escalations.length === 0 ? (
          <p className="text-gray-600 text-sm">No active escalations.</p>
        ) : (
          <div className="space-y-3">
            {escalations.map(esc => (
              <div key={esc.triggerId} className="bg-gray-900/60 rounded-lg p-3 border border-gray-800">
                <div className="flex items-center justify-between mb-1">
                  <span className="text-xs font-mono text-gray-300">{esc.entityId}</span>
                  <span className={`text-xs font-bold uppercase ${LEVEL_COLOR[esc.level]}`}>{esc.level}</span>
                </div>
                <div className="text-xs text-gray-400 mb-1">{esc.reason}</div>
                {esc.suggestedLine && (
                  <div className="text-xs italic text-fuchsia-300 border-l-2 border-fuchsia-700 pl-2">
                    &ldquo;{esc.suggestedLine}&rdquo;
                  </div>
                )}
                <div className="text-xs text-gray-600 mt-1 font-mono">
                  expires {new Date(esc.expiresAt).toLocaleTimeString()}
                </div>
              </div>
            ))}
          </div>
        )}
      </NeonCard>

      {/* Crowd energy per room */}
      <NeonCard>
        <div className="text-sm text-cyan-300 font-semibold mb-3">Room Energy & Crowd Mood</div>
        {crowds.length === 0 ? (
          <p className="text-gray-600 text-sm">No rooms monitored.</p>
        ) : (
          <div className="space-y-2">
            {crowds.map(crowd => {
              const energy = energyStates.find(e => e.roomId === crowd.roomId);
              return (
                <div key={crowd.roomId} className="flex items-center gap-3 bg-gray-900/40 rounded px-3 py-2 text-xs font-mono">
                  <span className="text-gray-300 w-32 truncate">{crowd.roomId}</span>
                  <span className={MOOD_COLOR[crowd.mood]}>{crowd.mood}</span>
                  <div className="flex-1 h-1.5 bg-gray-800 rounded overflow-hidden">
                    <div
                      className="h-full bg-fuchsia-500 rounded transition-all"
                      style={{ width: `${crowd.energyScore}%` }}
                    />
                  </div>
                  <span className="text-white w-8 text-right">{crowd.energyScore.toFixed(0)}</span>
                  {energy && (
                    <span className="text-gray-500 w-14 text-right">{energy.tier}</span>
                  )}
                </div>
              );
            })}
          </div>
        )}
      </NeonCard>
    </div>
  );
}
