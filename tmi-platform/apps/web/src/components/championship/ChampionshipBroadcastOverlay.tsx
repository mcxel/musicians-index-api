"use client";

/**
 * Championship Broadcast Overlay — Phase 2C.
 * Shows ACTIVE_PERFORMER or battle participant crowns/belts/trophy count/level
 * for ~3–5s then dismisses.
 *
 * Mount points:
 *   1. Preferred: battle/cypher entry surface (none certified yet — see note below)
 *   2. Live Destinations host card (wired)
 *   3. Command Center / Active Performer preview (wired via prop trigger)
 */

import { useEffect, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { listTitlesForHolder } from "@/lib/championship";
import { getProgressionSnapshot } from "@/lib/progression/ProgressionEngine";
import { getPerformerById } from "@/lib/performers/PerformerRegistry";
import { getChampionVisualIdentity } from "@/lib/championship/championVisualIdentity";

export interface ChampionshipBroadcastOverlayProps {
  performerId: string | null | undefined;
  /** Auto-show when performerId changes. Default true. */
  autoShow?: boolean;
  /** Display duration ms (3–5s). Default 4000. */
  durationMs?: number;
  /** External trigger key — bump to re-show. */
  triggerKey?: string | number;
}

/**
 * MOUNT POINT DOC
 * ───────────────
 * Battle/cypher dedicated entry surface: not certified as a single mount in this pass.
 * Wired mounts:
 *   - LiveDestinationsDrawerPanel host cards (on ACTIVE_PERFORMER bind)
 *   - Championship Center / Achievement surfaces can pass performerId + triggerKey
 * Future battle/cypher entry: import and mount `<ChampionshipBroadcastOverlay performerId={...} />`
 * at LobbyEntryFlow / battle lobby once that surface is the canonical entry.
 */

export default function ChampionshipBroadcastOverlay({
  performerId,
  autoShow = true,
  durationMs = 4000,
  triggerKey,
}: ChampionshipBroadcastOverlayProps) {
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    if (!autoShow || !performerId) {
      setVisible(false);
      return;
    }
    setVisible(true);
    const t = window.setTimeout(() => setVisible(false), durationMs);
    return () => window.clearTimeout(t);
  }, [performerId, autoShow, durationMs, triggerKey]);

  if (!performerId) return null;

  const performer = getPerformerById(performerId);
  const titles = listTitlesForHolder(performerId);
  const crowns = titles.filter((t) => t.assetType === "CROWN" && t.status === "ACTIVE");
  const belts = titles.filter((t) => t.assetType === "BELT" && t.status === "ACTIVE");
  const trophies = titles.filter((t) => t.assetType === "TROPHY");
  const snap = getProgressionSnapshot(performerId);
  const visual = getChampionVisualIdentity(performerId);
  const name = performer?.name ?? performerId;

  const hasAnything =
    crowns.length > 0 || belts.length > 0 || trophies.length > 0 || snap.level > 1;

  return (
    <AnimatePresence>
      {visible && hasAnything ? (
        <motion.div
          key={`cbo_${performerId}_${triggerKey ?? ""}`}
          className={visual.className || undefined}
          initial={{ opacity: 0, y: -12, scale: 0.96 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          exit={{ opacity: 0, y: -8 }}
          transition={{ duration: 0.35 }}
          style={{
            position: "relative",
            margin: "0 0 10px",
            padding: "12px 14px",
            borderRadius: 12,
            border: `1px solid ${visual.borderColor ?? "rgba(255,215,0,0.45)"}`,
            background: "linear-gradient(135deg, rgba(255,215,0,0.14), rgba(0,0,0,0.55))",
            boxShadow: "0 0 24px rgba(255,215,0,0.2)",
            zIndex: 20,
          }}
        >
          <div
            style={{
              fontSize: 8,
              fontWeight: 900,
              letterSpacing: "0.16em",
              color: "#FFD700",
              marginBottom: 4,
            }}
          >
            CHAMPIONSHIP BROADCAST
          </div>
          <div style={{ fontSize: 14, fontWeight: 900, color: "#fff" }}>{name}</div>
          <div
            style={{
              display: "flex",
              flexWrap: "wrap",
              gap: 8,
              marginTop: 8,
              fontSize: 11,
              fontWeight: 800,
            }}
          >
            <span style={{ color: "#FFD700" }}>👑 {crowns.length}</span>
            <span style={{ color: "#FF6B35" }}>🥋 {belts.length}</span>
            <span style={{ color: "#00FFFF" }}>🏆 {trophies.length}</span>
            <span style={{ color: "#AA2DFF" }}>Lv {snap.level}</span>
          </div>
          {crowns[0] || belts[0] ? (
            <div style={{ fontSize: 10, color: "rgba(255,255,255,0.5)", marginTop: 6 }}>
              {(crowns[0] ?? belts[0])!.label}
              {titles.length > 1 ? ` · +${titles.length - 1} more` : ""}
            </div>
          ) : null}
        </motion.div>
      ) : null}
    </AnimatePresence>
  );
}
