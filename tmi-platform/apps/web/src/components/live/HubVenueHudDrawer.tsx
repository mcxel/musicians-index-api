"use client";

/**
 * Venue HUD drawers — Runtime Inspector, Venue Ready, Room Energy.
 * Controls the SAME canonical world; not separate rooms or floating shell pages.
 */

import { useState } from "react";
import EnergyMeterDisplay from "@/components/live/EnergyMeterDisplay";
import { AttentionDebugOverlay } from "@/components/live/AttentionDebugOverlay";
import { getStageSnapshot } from "@/lib/live/StageLifecycleEngine";

type DrawerId = "inspector" | "venue" | "energy" | null;

export default function HubVenueHudDrawer({
  roomId,
  watching,
  isLivePublished,
}: {
  roomId: string;
  watching: number;
  isLivePublished: boolean;
}) {
  const [openDrawer, setOpenDrawer] = useState<DrawerId>(null);
  const curtainState = getStageSnapshot().state;

  const toggle = (id: DrawerId) => setOpenDrawer((cur) => (cur === id ? null : id));

  return (
    <>
      <div
        style={{
          position: "absolute",
          top: 8,
          right: 8,
          zIndex: 15,
          display: "flex",
          gap: 4,
          pointerEvents: "auto",
        }}
      >
        {(
          [
            { id: "venue" as const, label: "VENUE", icon: "🎭" },
            { id: "energy" as const, label: "ENERGY", icon: "⚡" },
            { id: "inspector" as const, label: "INSPECT", icon: "🔧" },
          ] as const
        ).map((btn) => (
          <button
            key={btn.id}
            type="button"
            onClick={() => toggle(btn.id)}
            style={{
              fontSize: 7,
              fontWeight: 900,
              letterSpacing: "0.1em",
              padding: "4px 7px",
              borderRadius: 6,
              cursor: "pointer",
              fontFamily: "inherit",
              border: openDrawer === btn.id ? "1px solid #00FFFF" : "1px solid rgba(255,255,255,0.18)",
              background: openDrawer === btn.id ? "rgba(0,255,255,0.15)" : "rgba(0,0,0,0.65)",
              color: openDrawer === btn.id ? "#00FFFF" : "rgba(255,255,255,0.75)",
            }}
          >
            {btn.icon} {btn.label}
          </button>
        ))}
      </div>

      {openDrawer ? (
        <div
          style={{
            position: "absolute",
            top: 40,
            right: 8,
            bottom: 8,
            width: 260,
            zIndex: 14,
            overflowY: "auto",
            borderRadius: 10,
            border: "1px solid rgba(170,45,255,0.45)",
            background: "rgba(5,5,16,0.94)",
            backdropFilter: "blur(12px)",
            padding: 10,
            pointerEvents: "auto",
          }}
        >
          {openDrawer === "venue" ? (
            <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
              <div style={{ fontSize: 9, fontWeight: 900, color: "#FFD700", letterSpacing: "0.14em" }}>
                VENUE READY
              </div>
              <div style={{ fontSize: 10, color: "rgba(255,255,255,0.7)" }}>
                Room: <span style={{ color: "#00FFFF" }}>{roomId}</span>
              </div>
              <div style={{ fontSize: 10, color: "rgba(255,255,255,0.7)" }}>
                Curtain: <span style={{ color: "#FF2DAA" }}>{curtainState.replace(/_/g, " ")}</span>
              </div>
              <div style={{ fontSize: 10, color: "rgba(255,255,255,0.7)" }}>
                Publish:{" "}
                <span style={{ color: isLivePublished ? "#00FF88" : "rgba(255,255,255,0.45)" }}>
                  {isLivePublished ? "LIVE (registry)" : "STAGE READY (local)"}
                </span>
              </div>
              <div style={{ fontSize: 10, color: "rgba(255,255,255,0.7)" }}>
                Watching: <span style={{ color: "#00FFFF" }}>{watching}</span>
              </div>
              <div style={{ fontSize: 8, color: "rgba(255,255,255,0.35)", lineHeight: 1.5 }}>
                One canonical world · Fan Avatar Lobby is the fan entry layer · BOH on this monitor · FOH on Monitor A.
                Unlabeled plane venue is still not photoreal. Gate 3 OPEN.
              </div>
            </div>
          ) : null}

          {openDrawer === "energy" ? (
            <div>
              <div style={{ fontSize: 9, fontWeight: 900, color: "#FFD700", letterSpacing: "0.14em", marginBottom: 8 }}>
                ROOM ENERGY
              </div>
              <EnergyMeterDisplay roomId={roomId} compact={false} />
            </div>
          ) : null}

          {openDrawer === "inspector" ? (
            <AttentionDebugOverlay roomId={roomId} enabled contained />
          ) : null}
        </div>
      ) : null}
    </>
  );
}
