"use client";

import { useCallback, useEffect, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { SpotlightEventManager } from "@/lib/engine/SpotlightEventManager";
import { updateDistrictEnergy } from "@/lib/arena/BillboardArenaEngine";

export type VibeState = "CHILL" | "WARMING" | "HYPE" | "BATTLE" | "LEGENDARY";

interface CrowdTelemetry {
  energyScore: number;
  viewerCount: number;
  reactionRate: number;
  vibeState: VibeState;
}

const VIBE_COLORS: Record<VibeState, string> = {
  CHILL:     "#64C8FF",
  WARMING:   "#00FF88",
  HYPE:      "#FF2DAA",
  BATTLE:    "#FFD700",
  LEGENDARY: "#AA2DFF",
};

function vibeFromScore(score: number): VibeState {
  if (score >= 95) return "LEGENDARY";
  if (score >= 80) return "BATTLE";
  if (score >= 60) return "HYPE";
  if (score >= 35) return "WARMING";
  return "CHILL";
}

interface ConductorDeckProps {
  roomId?: string;
  onSpotlightSnap?: () => void;
  onEnergyBurst?: (amount: number) => void;
}

export default function ConductorDeck({ roomId = "stage", onSpotlightSnap, onEnergyBurst }: ConductorDeckProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [telemetry, setTelemetry] = useState<CrowdTelemetry>({
    energyScore:  45,
    viewerCount:  0,
    reactionRate: 12,
    vibeState:    "WARMING",
  });
  const [heatSlider, setHeatSlider]  = useState(45);
  const [lastAction, setLastAction]  = useState<string | null>(null);
  const [burstCooldown, setBurstCooldown] = useState(false);

  // Simulate live telemetry ticks
  useEffect(() => {
    if (!isOpen) return;
    const id = setInterval(() => {
      setTelemetry((prev) => {
        const drift  = (Math.random() - 0.48) * 3;
        const score  = Math.max(0, Math.min(100, prev.energyScore + drift));
        const vrate  = Math.max(0, prev.reactionRate + (Math.random() - 0.5) * 4);
        return {
          energyScore:  score,
          viewerCount:  prev.viewerCount,
          reactionRate: Math.round(vrate),
          vibeState:    vibeFromScore(score),
        };
      });
    }, 1800);
    return () => clearInterval(id);
  }, [isOpen]);

  const handleHeatChange = useCallback((val: number) => {
    setHeatSlider(val);
    updateDistrictEnergy(roomId, val - heatSlider);
    onEnergyBurst?.(val - heatSlider);
    setTelemetry((prev) => ({
      ...prev,
      energyScore: val,
      vibeState:   vibeFromScore(val),
    }));
    setLastAction(`Vibe override → ${vibeFromScore(val)}`);
  }, [heatSlider, onEnergyBurst, roomId]);

  const handleBurst = useCallback(() => {
    if (burstCooldown) return;
    setBurstCooldown(true);
    onEnergyBurst?.(25);
    updateDistrictEnergy(roomId, 25);
    setTelemetry((prev) => ({
      ...prev,
      energyScore: Math.min(100, prev.energyScore + 25),
      reactionRate: prev.reactionRate + 18,
    }));
    setLastAction("⚡ Energy BURST fired!");
    setTimeout(() => setBurstCooldown(false), 12_000);
  }, [burstCooldown, onEnergyBurst, roomId]);

  const handleSpotlightSnap = useCallback(() => {
    SpotlightEventManager.lockUntil(0); // release lock
    onSpotlightSnap?.();
    setLastAction("🔦 Spotlight snap triggered");
  }, [onSpotlightSnap]);

  const vibeColor = VIBE_COLORS[telemetry.vibeState];

  return (
    <>
      {/* Toggle button — always visible for PERFORMER role */}
      <button
        onClick={() => setIsOpen((v) => !v)}
        aria-label="Conductor Deck"
        style={{
          position: "fixed", bottom: 24, right: 24,
          width: 52, height: 52, borderRadius: "50%",
          background: isOpen ? "#FF2DAA" : "#050510",
          border: "2px solid #FF2DAA",
          color: isOpen ? "#fff" : "#FF2DAA",
          fontSize: 20, cursor: "pointer",
          boxShadow: "0 0 20px rgba(255,45,170,0.5)",
          zIndex: 1000,
          transition: "background 0.2s, color 0.2s",
        }}
      >
        🎛️
      </button>

      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, x: 80, scale: 0.95 }}
            animate={{ opacity: 1, x: 0,  scale: 1     }}
            exit={{    opacity: 0, x: 80, scale: 0.95  }}
            transition={{ duration: 0.25, ease: "easeOut" }}
            style={{
              position: "fixed", bottom: 88, right: 24,
              width: 320, zIndex: 999,
              background: "#080818",
              border: "1px solid rgba(255,45,170,0.3)",
              borderRadius: 18,
              padding: "22px 20px",
              color: "#fff",
              fontFamily: "'Inter', sans-serif",
              boxShadow: "0 0 40px rgba(255,45,170,0.2), 0 8px 32px rgba(0,0,0,0.8)",
            }}
          >
            {/* Header */}
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 18 }}>
              <div>
                <div style={{ fontSize: 9, fontWeight: 900, letterSpacing: "0.3em", color: "#FF2DAA" }}>PERFORMER</div>
                <div style={{ fontSize: 15, fontWeight: 900 }}>Conductor Deck</div>
              </div>
              <div style={{
                fontSize: 10, fontWeight: 800, padding: "4px 10px",
                borderRadius: 20, background: vibeColor + "20",
                color: vibeColor, border: `1px solid ${vibeColor}50`,
              }}>
                {telemetry.vibeState}
              </div>
            </div>

            {/* Telemetry */}
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10, marginBottom: 18 }}>
              {[
                { label: "ENERGY",    value: `${Math.round(telemetry.energyScore)}%`, color: vibeColor },
                { label: "VIEWERS",   value: telemetry.viewerCount.toLocaleString(),  color: "#00FFFF" },
                { label: "REACTIONS", value: `${telemetry.reactionRate}/min`,         color: "#FF2DAA" },
                { label: "VIBE",      value: telemetry.vibeState,                    color: vibeColor },
              ].map((s) => (
                <div key={s.label} style={{ background: "rgba(255,255,255,0.03)", border: "1px solid rgba(255,255,255,0.06)", borderRadius: 10, padding: "10px 12px" }}>
                  <div style={{ fontSize: 7, letterSpacing: "0.2em", color: "rgba(255,255,255,0.35)", marginBottom: 3 }}>{s.label}</div>
                  <div style={{ fontSize: 16, fontWeight: 900, color: s.color }}>{s.value}</div>
                </div>
              ))}
            </div>

            {/* Energy bar */}
            <div style={{ marginBottom: 18 }}>
              <div style={{ height: 4, background: "rgba(255,255,255,0.06)", borderRadius: 2, overflow: "hidden", marginBottom: 10 }}>
                <div style={{ height: "100%", width: `${telemetry.energyScore}%`, background: `linear-gradient(90deg, ${vibeColor}80, ${vibeColor})`, borderRadius: 2, transition: "width 0.6s ease" }} />
              </div>
            </div>

            {/* Crowd Heat Slider */}
            <div style={{ marginBottom: 20 }}>
              <div style={{ fontSize: 9, fontWeight: 800, letterSpacing: "0.18em", color: "rgba(255,255,255,0.4)", marginBottom: 8 }}>
                CROWD HEAT OVERRIDE
              </div>
              <input
                type="range" min={0} max={100} value={heatSlider}
                onChange={(e) => handleHeatChange(Number(e.target.value))}
                style={{ width: "100%", accentColor: "#FF2DAA", cursor: "pointer" }}
              />
              <div style={{ display: "flex", justifyContent: "space-between", fontSize: 9, color: "rgba(255,255,255,0.3)", marginTop: 4 }}>
                <span>COLD</span><span>HOT</span><span>LEGENDARY</span>
              </div>
            </div>

            {/* Action buttons */}
            <div style={{ display: "flex", gap: 8, marginBottom: 14 }}>
              <button
                onClick={handleBurst}
                disabled={burstCooldown}
                style={{
                  flex: 1, padding: "10px", fontSize: 11, fontWeight: 800,
                  background: burstCooldown ? "rgba(255,215,0,0.1)" : "rgba(255,215,0,0.15)",
                  border: `1px solid ${burstCooldown ? "rgba(255,215,0,0.2)" : "rgba(255,215,0,0.5)"}`,
                  color: burstCooldown ? "rgba(255,215,0,0.4)" : "#FFD700",
                  borderRadius: 8, cursor: burstCooldown ? "not-allowed" : "pointer",
                }}
              >
                ⚡ BURST {burstCooldown ? "(cooldown)" : ""}
              </button>
              <button
                onClick={handleSpotlightSnap}
                style={{
                  flex: 1, padding: "10px", fontSize: 11, fontWeight: 800,
                  background: "rgba(170,45,255,0.12)",
                  border: "1px solid rgba(170,45,255,0.4)",
                  color: "#AA2DFF",
                  borderRadius: 8, cursor: "pointer",
                }}
              >
                🔦 SPOTLIGHT
              </button>
            </div>

            {/* Last action log */}
            {lastAction && (
              <div style={{
                fontSize: 10, color: "rgba(255,255,255,0.45)",
                padding: "8px 12px", background: "rgba(255,255,255,0.03)",
                borderRadius: 6, border: "1px solid rgba(255,255,255,0.06)",
                fontFamily: "monospace",
              }}>
                {lastAction}
              </div>
            )}
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}
