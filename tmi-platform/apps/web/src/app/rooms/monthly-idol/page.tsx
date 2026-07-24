"use client";
import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import PageShell from "@/components/layout/PageShell";
import HUDFrame from "@/components/hud/HUDFrame";
import FooterHUD from "@/components/hud/FooterHUD";
import Link from "next/link";
import ArenaEventShell from "@/components/live/ArenaEventShell";

const PHASES = ["AUDITIONS", "ROUND 1", "QUARTERFINALS", "SEMIFINALS", "FINALE", "CROWNED"] as const;
type Phase = typeof PHASES[number];

const CONTESTANTS: { id: number; name: string; genre: string; score: number; qualified: boolean; city: string }[] = [];

const SPONSOR_GIFTS = [
  { sponsor: "Crown Audio", prize: "Pro Studio Time (4hrs)", icon: "🎙️" },
  { sponsor: "Glow Apparel", prize: "Full Outfit Collection", icon: "👗" },
  { sponsor: "Power Boost Energy", prize: "$500 + Year Supply", icon: "⚡" },
];

interface OrchestratedHostInfo {
  name: string;
  emoji: string;
}

export default function MonthlyIdolPage() {
  const [phase, setPhase] = useState<Phase>("ROUND 1");
  const [watching, setWatching] = useState(0);

  // Real host/announcer state from EventOrchestrator (lib/competition/
  // EventOrchestrator.ts, /api/rooms/orchestrated) instead of the
  // hardcoded "Gregory Marcel" + fixed quote that used to be here.
  const [host, setHost] = useState<OrchestratedHostInfo | null>(null);
  const [paLine, setPaLine] = useState<string | null>(null);
  const [hostLoadState, setHostLoadState] = useState<"loading" | "ready" | "error">("loading");

  useEffect(() => {
    let cancelled = false;

    async function loadOrchestratedEvent() {
      try {
        let res = await fetch("/api/rooms/orchestrated?roomId=monthly-idol");
        if (res.status === 404) {
          // No LobbyEvent exists yet for this room - compile one via the
          // real orchestrator (validates format, resolves hosts/sponsor).
          await fetch("/api/rooms/orchestrated", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
              roomId: "monthly-idol",
              showId: "monthly-idol",
              format: "open-performer-challenge",
              countdownSeconds: 0,
              title: "Monthly Idol",
            }),
          });
          res = await fetch("/api/rooms/orchestrated?roomId=monthly-idol");
        }

        const data = await res.json();
        if (cancelled) return;

        if (data.success && data.event) {
          setHost(
            data.event.mainHost
              ? { name: data.event.mainHost.name, emoji: data.event.mainHost.emoji || "🎩" }
              : null
          );
          setPaLine(data.paLine ?? null);
          setWatching(data.event.viewerCount ?? 0);
          setHostLoadState("ready");
        } else {
          setHostLoadState("error");
        }
      } catch {
        if (!cancelled) setHostLoadState("error");
      }
    }

    loadOrchestratedEvent();
    return () => { cancelled = true; };
  }, []);

  return (
    <PageShell>
      <HUDFrame>
        <div style={{ minHeight: "100vh", background: "#050510", color: "#fff", paddingBottom: 80 }}>

          {/* Header */}
          <div style={{ padding: "28px 32px 0", borderBottom: "1px solid rgba(255,215,0,0.15)" }}>
            <div style={{ display: "flex", alignItems: "center", gap: 16, marginBottom: 20 }}>
              <Link href="/rooms" style={{ color: "#FFD700", fontSize: 11, fontWeight: 700, textDecoration: "none" }}>← ROOMS</Link>
              <div style={{ flex: 1 }}>
                <div style={{ fontSize: 9, letterSpacing: 5, color: "#FFD700", fontWeight: 800 }}>
                  {host ? `HOSTED BY ${host.name.toUpperCase()}` : hostLoadState === "loading" ? "LOADING HOST…" : "HOST UNAVAILABLE"}
                </div>
                <h1 style={{ fontSize: "clamp(22px,4vw,40px)", fontWeight: 900, letterSpacing: 3, margin: "2px 0 0" }}>
                  MONTHLY IDOL
                </h1>
              </div>
              <div>
                <div style={{ fontSize: 18, fontWeight: 900, color: "#00FFFF" }}>{watching.toLocaleString()}</div>
                <div style={{ fontSize: 8, letterSpacing: 3, color: "#888" }}>WATCHING</div>
              </div>
              <motion.div animate={{ opacity: [1, 0.3, 1] }} transition={{ repeat: Infinity, duration: 1 }}
                style={{ background: "#FFD700", borderRadius: 20, padding: "4px 14px", fontSize: 9, fontWeight: 900, letterSpacing: 3, color: "#050510" }}>
                LIVE
              </motion.div>
            </div>

            {/* Phase nav */}
            <div style={{ display: "flex", gap: 8, paddingBottom: 20, overflowX: "auto" }}>
              {PHASES.map(p => (
                <button key={p} onClick={() => setPhase(p)} style={{
                  padding: "6px 14px", borderRadius: 20, cursor: "pointer", flexShrink: 0,
                  background: phase === p ? "rgba(255,215,0,0.2)" : "transparent",
                  border: `1px solid ${phase === p ? "#FFD700" : "rgba(255,255,255,0.1)"}`,
                  color: phase === p ? "#FFD700" : "#666", fontSize: 9, fontWeight: 700, letterSpacing: 2,
                }}>{p}</button>
              ))}
            </div>
          </div>

          <ArenaEventShell roomId="monthly-idol" eventType="challenge" mode="audience" />
          <div style={{ display: "grid", gridTemplateColumns: "1fr 320px", gap: 20, padding: "24px 32px" }}>

            {/* Contestant grid */}
            <div>
              <div style={{ fontSize: 9, letterSpacing: 4, color: "#FFD700", fontWeight: 800, marginBottom: 16 }}>CONTESTANTS — {phase}</div>
              <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(200px, 1fr))", gap: 14 }}>
                {CONTESTANTS.length === 0 && (
                  <div style={{ gridColumn: "1/-1", padding: "32px 16px", textAlign: "center", background: "rgba(255,215,0,0.04)", border: "1px solid rgba(255,215,0,0.12)", borderRadius: 12, color: "rgba(255,255,255,0.3)", fontSize: 12 }}>
                    No contestants registered yet for this round.
                  </div>
                )}
                {CONTESTANTS.map((c, i) => (
                  <motion.div key={c.id}
                    initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }}
                    transition={{ delay: i * 0.06 }}
                    style={{
                      background: "rgba(255,215,0,0.04)", border: `1px solid ${c.qualified ? "rgba(255,215,0,0.2)" : "rgba(255,255,255,0.07)"}`,
                      borderRadius: 12, padding: 18,
                    }}
                  >
                    <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 10 }}>
                      <div style={{
                        width: 48, height: 48, borderRadius: "50%",
                        background: `rgba(255,215,0,0.15)`, display: "flex", alignItems: "center", justifyContent: "center",
                        fontSize: 22,
                      }}>🎤</div>
                      {c.qualified && <div style={{
                        background: "rgba(0,255,136,0.15)", border: "1px solid #00FF88",
                        borderRadius: 20, padding: "2px 8px", fontSize: 7, color: "#00FF88", fontWeight: 800, letterSpacing: 2, height: "fit-content",
                      }}>QUALIFIED</div>}
                    </div>
                    <div style={{ fontSize: 13, fontWeight: 700, marginBottom: 2 }}>{c.name}</div>
                    <div style={{ fontSize: 10, color: "#888", marginBottom: 8 }}>{c.genre} · {c.city}</div>
                    <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                      <div style={{ fontSize: 18, fontWeight: 900, color: "#FFD700" }}>{c.score}</div>
                      <motion.button whileTap={{ scale: 0.93 }} style={{
                        padding: "5px 14px", borderRadius: 20,
                        background: "rgba(255,215,0,0.1)", border: "1px solid rgba(255,215,0,0.3)",
                        color: "#FFD700", fontSize: 9, fontWeight: 700, cursor: "pointer",
                      }}>VOTE</motion.button>
                    </div>
                  </motion.div>
                ))}
              </div>
            </div>

            {/* Right column */}
            <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>

              {/* Host card */}
              <div style={{
                background: "rgba(255,215,0,0.06)", border: "1px solid rgba(255,215,0,0.2)",
                borderRadius: 12, padding: 20, textAlign: "center",
              }}>
                <div style={{ fontSize: 42, marginBottom: 8 }}>{host?.emoji ?? "🎩"}</div>
                <div style={{ fontSize: 13, fontWeight: 800, color: "#FFD700", marginBottom: 3 }}>
                  {host ? host.name : hostLoadState === "loading" ? "Loading…" : "Host unavailable"}
                </div>
                <div style={{ fontSize: 9, letterSpacing: 3, color: "#888", marginBottom: 12 }}>MAIN HOST</div>
                {paLine && (
                  <div style={{
                    padding: "8px 12px", borderRadius: 8,
                    background: "rgba(0,0,0,0.3)", fontSize: 11, color: "#ccc", lineHeight: 1.5, textAlign: "left",
                  }}>
                    "{paLine.replace(/^\[[^\]]+\]\s*/, "")}"
                  </div>
                )}
              </div>

              {/* Sponsor gifts */}
              <div style={{
                background: "rgba(170,45,255,0.04)", border: "1px solid rgba(170,45,255,0.15)",
                borderRadius: 12, padding: 20,
              }}>
                <div style={{ fontSize: 9, letterSpacing: 4, color: "#AA2DFF", fontWeight: 800, marginBottom: 14 }}>🎁 SPONSOR PRIZES</div>
                {SPONSOR_GIFTS.map(g => (
                  <div key={g.sponsor} style={{
                    display: "flex", alignItems: "center", gap: 10,
                    padding: "10px 0", borderBottom: "1px solid rgba(170,45,255,0.1)",
                  }}>
                    <div style={{ fontSize: 20 }}>{g.icon}</div>
                    <div>
                      <div style={{ fontSize: 11, fontWeight: 700 }}>{g.prize}</div>
                      <div style={{ fontSize: 9, color: "#AA2DFF" }}>by {g.sponsor}</div>
                    </div>
                  </div>
                ))}
              </div>

              {/* Qualification rules */}
              <div style={{
                background: "rgba(0,255,255,0.03)", border: "1px solid rgba(0,255,255,0.12)",
                borderRadius: 12, padding: 20,
              }}>
                <div style={{ fontSize: 9, letterSpacing: 4, color: "#00FFFF", fontWeight: 800, marginBottom: 12 }}>QUALIFICATION RULES</div>
                {[
                  "Top 50% advance to next round",
                  "Audience vote = 60% of score",
                  "Judge vote = 40% of score",
                  "Min 500 votes to qualify",
                  "1 vote per account per round",
                ].map(r => (
                  <div key={r} style={{ fontSize: 10, color: "#aaa", marginBottom: 6, paddingLeft: 12, borderLeft: "2px solid rgba(0,255,255,0.2)" }}>
                    {r}
                  </div>
                ))}
              </div>

            </div>
          </div>

        </div>
        <FooterHUD />
      </HUDFrame>
    </PageShell>
  );
}
