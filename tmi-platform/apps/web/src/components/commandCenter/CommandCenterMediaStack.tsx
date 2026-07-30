"use client";

/**
 * Command Center media stack — dual 16:9 → Quad → Octo grid.
 * Reuses real video URLs / AudienceScene; no fake viewer counts.
 */

import { useMemo, useState, type ReactNode } from "react";
import AudienceScene from "@/components/live/AudienceScene";

export type MediaGridMode = 2 | 4 | 8;

export interface CommandCenterMediaSlot {
  id: string;
  label: string;
  videoUrl?: string | null;
  imageUrl?: string | null;
  kind?: "video" | "audience" | "empty";
}

interface CommandCenterMediaStackProps {
  slots: CommandCenterMediaSlot[];
  mode?: MediaGridMode;
  onModeChange?: (mode: MediaGridMode) => void;
  footer?: ReactNode;
}

function MonitorTile({
  slot,
  aspect = "16 / 9",
}: {
  slot: CommandCenterMediaSlot;
  aspect?: string;
}) {
  return (
    <div
      style={{
        position: "relative",
        aspectRatio: aspect,
        background: "#010308",
        borderRadius: 10,
        overflow: "hidden",
        border: "1px solid rgba(0,255,255,0.18)",
        boxShadow: "0 0 18px rgba(0,255,255,0.06)",
        minHeight: 0,
      }}
    >
      <div
        style={{
          position: "absolute",
          top: 6,
          left: 8,
          zIndex: 2,
          fontSize: 7,
          fontWeight: 900,
          letterSpacing: "0.14em",
          color: "rgba(255,215,0,0.8)",
          textShadow: "0 1px 4px rgba(0,0,0,0.9)",
        }}
      >
        {slot.label}
      </div>
      {slot.kind === "audience" ? (
        <div style={{ position: "absolute", inset: 0 }}>
          <AudienceScene view="fan" />
        </div>
      ) : slot.videoUrl ? (
        <video
          key={slot.videoUrl}
          autoPlay
          loop
          muted
          playsInline
          src={slot.videoUrl}
          style={{ position: "absolute", inset: 0, width: "100%", height: "100%", objectFit: "cover" }}
        />
      ) : slot.imageUrl ? (
        // eslint-disable-next-line @next/next/no-img-element
        <img
          src={slot.imageUrl}
          alt={slot.label}
          style={{ position: "absolute", inset: 0, width: "100%", height: "100%", objectFit: "cover" }}
        />
      ) : (
        <div
          style={{
            position: "absolute",
            inset: 0,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            flexDirection: "column",
            gap: 6,
            background: "radial-gradient(circle at 50% 30%, rgba(255,45,170,0.08), #010308 70%)",
          }}
        >
          <span style={{ fontSize: 22, opacity: 0.35 }}>📡</span>
          <span style={{ fontSize: 9, fontWeight: 800, letterSpacing: "0.12em", color: "rgba(255,255,255,0.35)" }}>
            NO MEDIA
          </span>
        </div>
      )}
    </div>
  );
}

export default function CommandCenterMediaStack({
  slots,
  mode: controlledMode,
  onModeChange,
  footer,
}: CommandCenterMediaStackProps) {
  const [internalMode, setInternalMode] = useState<MediaGridMode>(2);
  const mode = controlledMode ?? internalMode;
  const setMode = (m: MediaGridMode) => {
    setInternalMode(m);
    onModeChange?.(m);
  };

  const filled = useMemo(() => {
    const base = [...slots];
    while (base.length < mode) {
      base.push({ id: `empty-${base.length}`, label: `MONITOR ${base.length + 1}`, kind: "empty" });
    }
    return base.slice(0, mode);
  }, [slots, mode]);

  const cols = mode === 2 ? 1 : mode === 4 ? 2 : 4;

  return (
    <div style={{ display: "flex", flexDirection: "column", height: "100%", minHeight: 0, background: "#010308" }}>
      <div
        style={{
          flexShrink: 0,
          display: "flex",
          alignItems: "center",
          gap: 6,
          padding: "6px 10px",
          borderBottom: "1px solid rgba(255,255,255,0.06)",
          background: "rgba(0,0,0,0.35)",
        }}
      >
        <span style={{ fontSize: 8, fontWeight: 900, letterSpacing: "0.14em", color: "rgba(255,255,255,0.4)" }}>
          MEDIA GRID
        </span>
        {([2, 4, 8] as MediaGridMode[]).map((m) => (
          <button
            key={m}
            type="button"
            onClick={() => setMode(m)}
            style={{
              fontSize: 8,
              fontWeight: 900,
              letterSpacing: "0.08em",
              padding: "3px 8px",
              borderRadius: 6,
              cursor: "pointer",
              border: mode === m ? "1px solid #00FFFF" : "1px solid rgba(255,255,255,0.12)",
              background: mode === m ? "rgba(0,255,255,0.15)" : "transparent",
              color: mode === m ? "#00FFFF" : "rgba(255,255,255,0.5)",
              fontFamily: "inherit",
            }}
          >
            {m === 2 ? "DUAL" : m === 4 ? "QUAD" : "OCTO"}
          </button>
        ))}
      </div>

      <div
        style={{
          flex: 1,
          minHeight: 0,
          overflow: "auto",
          padding: 8,
          display: "grid",
          gridTemplateColumns: `repeat(${cols}, minmax(0, 1fr))`,
          gap: 8,
          alignContent: "start",
        }}
      >
        {filled.map((slot) => (
          <MonitorTile key={slot.id} slot={slot} />
        ))}
      </div>

      {footer ? <div style={{ flexShrink: 0 }}>{footer}</div> : null}
    </div>
  );
}
