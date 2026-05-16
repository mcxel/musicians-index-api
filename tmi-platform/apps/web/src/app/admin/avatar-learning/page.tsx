"use client";

import Link from "next/link";
import { useState } from "react";
import { getAllLearningStates, getFailedSafetyRecords, recordInteraction } from "@/lib/avatar/AvatarLearningEngine";
import { getAllEvolutionStates } from "@/lib/avatar/AvatarVisualEvolutionEngine";
import { getAllSkillSheets } from "@/lib/avatar/AvatarSkillGrowthEngine";
import { getAuditLog, getSafetyFlags } from "@/lib/avatar/AvatarEvolutionAuditEngine";
import { rollbackVisualEvolution } from "@/lib/avatar/AvatarVisualEvolutionEngine";

const TIER_COLORS: Record<string, string> = {
  base:      "#00FFFF",
  developed: "#00FF88",
  refined:   "#FFD700",
  signature: "#FF2DAA",
  iconic:    "#AA2DFF",
};

const SIGNAL_COLORS = { positive: "#00FF88", negative: "#FF2DAA", neutral: "#888" };

export default function AvatarLearningPage() {
  const [activeTab, setActiveTab] = useState<"overview" | "skills" | "audit" | "safety">("overview");
  const [refreshKey, setRefreshKey] = useState(0);

  const learningStates = getAllLearningStates();
  const evolutionStates = getAllEvolutionStates();
  const skillSheets = getAllSkillSheets();
  const safetyFlags = getSafetyFlags();
  const auditEntries = getAuditLog({ limit: 50 });

  function handleSeedInteraction(avatarId: string) {
    recordInteraction(avatarId, "room_joined", "admin_test", "positive");
    setRefreshKey(k => k + 1);
  }

  function handleRollback(avatarId: string) {
    rollbackVisualEvolution(avatarId);
    setRefreshKey(k => k + 1);
  }

  void refreshKey;

  const TAB_STYLE = (active: boolean, color: string) => ({
    padding: "8px 16px",
    borderRadius: 8,
    fontSize: 11,
    fontWeight: 700,
    textTransform: "uppercase" as const,
    letterSpacing: 1.5,
    border: `1px solid ${active ? color : "rgba(255,255,255,0.1)"}`,
    background: active ? `${color}22` : "transparent",
    color: active ? color : "rgba(255,255,255,0.5)",
    cursor: "pointer",
  });

  return (
    <main style={{ minHeight: "100vh", background: "#050510", color: "#fff", padding: "30px 20px" }}>
      <div style={{ maxWidth: 1100, margin: "0 auto" }}>
        <Link href="/admin/directives" style={{ color: "#AA2DFF", textDecoration: "none", fontSize: 12 }}>← Directives</Link>
        <h1 style={{ fontSize: 32, margin: "14px 0 6px", fontWeight: 700 }}>Avatar Learning Observatory</h1>
        <p style={{ fontSize: 12, color: "rgba(255,255,255,0.5)", marginBottom: 24 }}>
          Real-time visibility into avatar evolution, skill growth, safety filters, and audit trail.
        </p>

        {/* Summary Stats */}
        <div style={{ display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: 12, marginBottom: 28 }}>
          {[
            { label: "Avatars Learning", value: learningStates.length, color: "#00FFFF" },
            { label: "Evolved Avatars", value: evolutionStates.filter(e => e.tier !== "base").length, color: "#FFD700" },
            { label: "Safety Flags", value: safetyFlags.length, color: safetyFlags.length > 0 ? "#FF2DAA" : "#00FF88" },
            { label: "Total Audit Events", value: auditEntries.length, color: "#AA2DFF" },
          ].map(stat => (
            <div key={stat.label} style={{ border: `1px solid ${stat.color}33`, borderRadius: 10, padding: "12px 14px", background: `${stat.color}08` }}>
              <div style={{ fontSize: 10, color: "rgba(255,255,255,0.4)", textTransform: "uppercase", letterSpacing: 1.5 }}>{stat.label}</div>
              <div style={{ fontSize: 24, fontWeight: 700, marginTop: 4, color: stat.color }}>{stat.value}</div>
            </div>
          ))}
        </div>

        {/* Tabs */}
        <div style={{ display: "flex", gap: 8, marginBottom: 20, flexWrap: "wrap" }}>
          {(["overview", "skills", "audit", "safety"] as const).map(tab => (
            <button key={tab} style={TAB_STYLE(activeTab === tab, "#00FFFF")} onClick={() => setActiveTab(tab)}>
              {tab}
            </button>
          ))}
        </div>

        {/* Overview Tab */}
        {activeTab === "overview" && (
          <div style={{ display: "grid", gap: 10 }}>
            <div style={{ fontSize: 11, color: "rgba(255,255,255,0.4)", textTransform: "uppercase", letterSpacing: 2, marginBottom: 6 }}>
              Avatar Learning States
            </div>
            {learningStates.length === 0 ? (
              <div style={{ color: "rgba(255,255,255,0.3)", fontSize: 13 }}>
                No avatars have learning records yet. Interactions will appear here automatically.
              </div>
            ) : (
              learningStates.map(s => {
                const evo = evolutionStates.find(e => e.avatarId === s.avatarId);
                return (
                  <div key={s.avatarId} style={{ border: "1px solid rgba(255,255,255,0.08)", borderRadius: 12, padding: "14px 16px", background: "rgba(255,255,255,0.02)" }}>
                    <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", flexWrap: "wrap", gap: 8 }}>
                      <div>
                        <div style={{ fontSize: 13, fontWeight: 600 }}>{s.avatarId}</div>
                        <div style={{ fontSize: 11, color: "rgba(255,255,255,0.5)", marginTop: 3 }}>{s.currentBehaviorSuggestion}</div>
                      </div>
                      <div style={{ display: "flex", gap: 8, alignItems: "center", flexWrap: "wrap" }}>
                        <span style={{ fontSize: 11, color: TIER_COLORS[evo?.tier ?? "base"], background: `${TIER_COLORS[evo?.tier ?? "base"]}22`, borderRadius: 6, padding: "3px 8px" }}>
                          {evo?.tier ?? "base"}
                        </span>
                        <span style={{ fontSize: 11, color: "#00FFFF" }}>
                          confidence: {(s.confidenceLevel * 100).toFixed(0)}%
                        </span>
                        <span style={{ fontSize: 11, color: "#FFD700" }}>{s.totalInteractions} interactions</span>
                      </div>
                    </div>
                    <div style={{ display: "flex", gap: 8, marginTop: 10, flexWrap: "wrap" }}>
                      <div style={{ display: "flex", gap: 12 }}>
                        <span style={{ fontSize: 11, color: SIGNAL_COLORS.positive }}>+{s.positiveSignals} positive</span>
                        <span style={{ fontSize: 11, color: SIGNAL_COLORS.negative }}>{s.negativeSignals} negative</span>
                      </div>
                      <div style={{ display: "flex", gap: 8, marginLeft: "auto" }}>
                        <button
                          style={{ fontSize: 10, color: "#00FFFF", background: "#00FFFF22", border: "1px solid #00FFFF44", borderRadius: 6, padding: "3px 8px", cursor: "pointer" }}
                          onClick={() => handleSeedInteraction(s.avatarId)}
                        >
                          Seed Interaction
                        </button>
                        {evo && evo.tier !== "base" && (
                          <button
                            style={{ fontSize: 10, color: "#FF2DAA", background: "#FF2DAA22", border: "1px solid #FF2DAA44", borderRadius: 6, padding: "3px 8px", cursor: "pointer" }}
                            onClick={() => handleRollback(s.avatarId)}
                          >
                            Rollback Evolution
                          </button>
                        )}
                      </div>
                    </div>
                    {s.recentRecords.slice(0, 3).map(r => (
                      <div key={r.id} style={{ fontSize: 10, color: "rgba(255,255,255,0.35)", marginTop: 6, display: "flex", gap: 8 }}>
                        <span style={{ color: SIGNAL_COLORS[r.signal] }}>{r.signal}</span>
                        <span>{r.interactionType}</span>
                        <span>{r.context}</span>
                        {!r.safetyPassed && <span style={{ color: "#FF2DAA" }}>⚠ SAFETY BLOCK</span>}
                      </div>
                    ))}
                  </div>
                );
              })
            )}
          </div>
        )}

        {/* Skills Tab */}
        {activeTab === "skills" && (
          <div style={{ display: "grid", gap: 14 }}>
            {skillSheets.length === 0 ? (
              <div style={{ color: "rgba(255,255,255,0.3)", fontSize: 13 }}>No skill data yet.</div>
            ) : (
              skillSheets.map(sheet => (
                <div key={sheet.avatarId} style={{ border: "1px solid rgba(255,255,255,0.08)", borderRadius: 12, padding: "14px 16px", background: "rgba(255,255,255,0.02)" }}>
                  <div style={{ fontSize: 13, fontWeight: 600, marginBottom: 10 }}>
                    {sheet.avatarId} · {sheet.overallTier} · {sheet.totalXP} XP
                  </div>
                  <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(200px, 1fr))", gap: 8 }}>
                    {Object.values(sheet.skills).map(skill => (
                      <div key={skill.skill} style={{ background: "rgba(255,255,255,0.04)", borderRadius: 8, padding: "8px 10px" }}>
                        <div style={{ fontSize: 10, color: "rgba(255,255,255,0.5)", textTransform: "uppercase", letterSpacing: 1 }}>{skill.skill.replace(/_/g, " ")}</div>
                        <div style={{ fontSize: 13, fontWeight: 600, color: skill.level >= 7 ? "#FFD700" : skill.level >= 4 ? "#00FFFF" : "#fff" }}>
                          Lv {skill.level}
                        </div>
                        <div style={{ height: 3, background: "rgba(255,255,255,0.1)", borderRadius: 2, marginTop: 4 }}>
                          <div style={{ height: "100%", width: `${skill.xp}%`, background: "#00FFFF", borderRadius: 2 }} />
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              ))
            )}
          </div>
        )}

        {/* Audit Tab */}
        {activeTab === "audit" && (
          <div style={{ display: "grid", gap: 8 }}>
            {auditEntries.length === 0 ? (
              <div style={{ color: "rgba(255,255,255,0.3)", fontSize: 13 }}>No audit events recorded yet.</div>
            ) : (
              auditEntries.map(e => (
                <div key={e.id} style={{ border: "1px solid rgba(255,255,255,0.07)", borderRadius: 10, padding: "10px 14px", background: "rgba(255,255,255,0.02)", display: "flex", gap: 12, alignItems: "flex-start" }}>
                  <div style={{ fontSize: 10, color: "#AA2DFF", background: "#AA2DFF22", borderRadius: 4, padding: "2px 6px", whiteSpace: "nowrap" }}>{e.eventType}</div>
                  <div style={{ flex: 1 }}>
                    <div style={{ fontSize: 12, fontWeight: 500 }}>{e.description}</div>
                    <div style={{ fontSize: 10, color: "rgba(255,255,255,0.35)", marginTop: 3 }}>{e.avatarId} · {new Date(e.timestamp).toLocaleTimeString()}</div>
                  </div>
                  {e.safetyFlag && <span style={{ fontSize: 10, color: "#FF2DAA" }}>⚠ SAFETY</span>}
                </div>
              ))
            )}
          </div>
        )}

        {/* Safety Tab */}
        {activeTab === "safety" && (
          <div>
            <div style={{ fontSize: 13, marginBottom: 16, color: safetyFlags.length === 0 ? "#00FF88" : "#FF2DAA" }}>
              {safetyFlags.length === 0 ? "No safety flags — all systems clean." : `${safetyFlags.length} safety flags detected.`}
            </div>
            <div style={{ display: "grid", gap: 8 }}>
              {safetyFlags.map(e => (
                <div key={e.id} style={{ border: "1px solid #FF2DAA44", borderRadius: 10, padding: "12px 14px", background: "rgba(255,45,170,0.04)" }}>
                  <div style={{ display: "flex", gap: 10 }}>
                    <span style={{ fontSize: 10, color: "#FF2DAA" }}>⚠ {e.eventType}</span>
                    <span style={{ fontSize: 10, color: "rgba(255,255,255,0.4)" }}>{e.avatarId}</span>
                    <span style={{ fontSize: 10, color: "rgba(255,255,255,0.4)" }}>{new Date(e.timestamp).toLocaleTimeString()}</span>
                  </div>
                  <div style={{ fontSize: 12, marginTop: 6 }}>{e.description}</div>
                </div>
              ))}
              {safetyFlags.length === 0 && (
                <div style={{ fontSize: 12, color: "#00FF88", border: "1px solid #00FF8844", borderRadius: 10, padding: "16px", textAlign: "center" }}>
                  All avatar evolution events passed safety filters.
                </div>
              )}
            </div>
          </div>
        )}
      </div>
    </main>
  );
}
