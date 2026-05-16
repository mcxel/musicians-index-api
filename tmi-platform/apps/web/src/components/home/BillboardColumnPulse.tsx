"use client";

import { useSceneVisible } from "@/components/magazine/MagazinePageFlipRuntime";
import { useEffect, useMemo, useRef, useState } from "react";

type ColumnKey =
  | "best_song"
  | "best_hooks"
  | "best_horns"
  | "best_battle"
  | "fan_crown"
  | "rising_performer";

type RankRow = {
  id: string;
  name: string;
  movement: "up" | "down" | "flat";
  fanTruth: number;
  completionRate: number;
  likeRate: number;
  newFanConversion: number;
  movementReason: string;
};

type ColumnDef = {
  key: ColumnKey;
  title: string;
  accent: string;
  shadow: string;
  speedSec: number;
};

const COLUMNS: readonly ColumnDef[] = [
  { key: "best_song", title: "Best Song", accent: "#00FFFF", shadow: "rgba(0,255,255,0.55)", speedSec: 40 },
  { key: "best_hooks", title: "Best Hooks", accent: "#FF2DAA", shadow: "rgba(255,45,170,0.55)", speedSec: 44 },
  { key: "best_horns", title: "Best Horns", accent: "#FFD700", shadow: "rgba(255,215,0,0.55)", speedSec: 48 },
  { key: "best_battle", title: "Best Battle", accent: "#AA2DFF", shadow: "rgba(170,45,255,0.55)", speedSec: 42 },
  { key: "fan_crown", title: "Fan Crown", accent: "#00FF88", shadow: "rgba(0,255,136,0.5)", speedSec: 46 },
  { key: "rising_performer", title: "Rising Performer", accent: "#5EE1FF", shadow: "rgba(94,225,255,0.5)", speedSec: 50 },
] as const;

const NAMES = [
  "Nova Cipher",
  "Wave Tek",
  "Echo Vale",
  "Kira Bloom",
  "Rio Lux",
  "Mira Zen",
  "Atlas Riff",
  "Onyx Lyric",
  "Tessa Glint",
  "Aria Vault",
  "Velvet Lane",
  "Jax Onyx",
];

const STYLE_ID = "home12-billboard-v2-styles";

function ensureStyles() {
  if (typeof document === "undefined") return;
  if (document.getElementById(STYLE_ID)) return;
  const style = document.createElement("style");
  style.id = STYLE_ID;
  style.textContent = `
    @keyframes h12Scroll {
      from { transform: translateY(0); }
      to { transform: translateY(-50%); }
    }

    @keyframes h12Pulse {
      0% { transform: translateY(0) scale(1); box-shadow: 0 0 0 rgba(0,255,255,0); }
      40% { transform: translateY(-3px) scale(1.02); box-shadow: 0 0 24px var(--h12-glow, rgba(0,255,255,0.55)); }
      100% { transform: translateY(0) scale(1); box-shadow: 0 0 0 rgba(0,255,255,0); }
    }

    @keyframes h12Flicker {
      0%, 100% { opacity: 1; }
      50% { opacity: 0.55; }
    }

    @keyframes h12Float {
      0%   { opacity: 0;   transform: translateY(0)     scale(0.88); }
      10%  { opacity: 1;   transform: translateY(-4px)  scale(1.04); }
      100% { opacity: 0;   transform: translateY(-44px) scale(0.92); }
    }

    @keyframes h12CrownDrop {
      0%   { opacity: 0; transform: translateY(-10px) scale(0.7); }
      18%  { opacity: 1; transform: translateY(2px)   scale(1.15); }
      38%  { opacity: 1; transform: translateY(0)     scale(1);    }
      80%  { opacity: 1; transform: translateY(0)     scale(1);    }
      100% { opacity: 0; transform: translateY(-8px)  scale(0.9);  }
    }

    @keyframes h12CrownPulse {
      0%,100% { transform: scale(1)   rotate(0deg);  }
      20%     { transform: scale(1.4) rotate(-12deg); }
      40%     { transform: scale(1.1) rotate(8deg);  }
    }

    @keyframes h12CrownGlow {
      0%,100% { box-shadow: 0 0 0 rgba(255,215,0,0); }
      30%     { box-shadow: 0 0 40px rgba(255,215,0,0.55), 0 0 80px rgba(255,215,0,0.22); }
    }
  `;
  document.head.appendChild(style);
}

function makeRows(seed: number): RankRow[] {
  return Array.from({ length: 8 }).map((_, i) => {
    const base = 100 - i * 7 + ((seed + i) % 3);
    return {
      id: `r-${seed}-${i}`,
      name: NAMES[(seed + i) % NAMES.length]!,
      movement: "flat",
      fanTruth: base,
      completionRate: Math.max(45, Math.min(99, 55 + base / 2)),
      likeRate: Math.max(20, Math.min(95, 24 + base / 1.3)),
      newFanConversion: Math.max(4, Math.min(55, 6 + base / 2.4)),
      movementReason: "Seeded chart position",
    };
  });
}

function sortRows(rows: RankRow[]): RankRow[] {
  return [...rows].sort((a, b) => b.fanTruth - a.fanTruth);
}

function mutateRows(rows: RankRow[]): RankRow[] {
  const next: RankRow[] = rows.map((r) => ({ ...r, movement: "flat" }));
  const pick = Math.floor(Math.random() * next.length);
  const direction = Math.random() > 0.35 ? 1 : -1;
  const change = Math.round((Math.random() * 4 + 2) * direction);

  const row = next[pick];
  if (!row) return rows;

  const prev = row.fanTruth;
  const prevCompletion = row.completionRate;
  const prevLike = row.likeRate;
  const prevNewFans = row.newFanConversion;

  row.fanTruth = Math.max(20, Math.min(140, row.fanTruth + change));
  row.completionRate = Math.max(35, Math.min(99, row.completionRate + Math.round(change / 2)));
  row.likeRate = Math.max(10, Math.min(99, row.likeRate + Math.round(change / 2)));
  row.newFanConversion = Math.max(2, Math.min(70, row.newFanConversion + Math.round(change / 3)));
  row.movement = row.fanTruth > prev ? "up" : row.fanTruth < prev ? "down" : "flat";
  row.movementReason = `${row.fanTruth >= prev ? "+" : ""}${(row.fanTruth - prev).toFixed(1)} Fan-Truth · ${row.completionRate - prevCompletion >= 0 ? "+" : ""}${(row.completionRate - prevCompletion).toFixed(1)} Completion · ${row.likeRate - prevLike >= 0 ? "+" : ""}${(row.likeRate - prevLike).toFixed(1)} Likes · ${row.newFanConversion - prevNewFans >= 0 ? "+" : ""}${(row.newFanConversion - prevNewFans).toFixed(1)} New Fans`;

  return sortRows(next);
}

type FloatLabel = { text: string; positive: boolean };
type FloatEvent = { key: number; labels: FloatLabel[] };

function parseFloatLabels(reason: string): FloatLabel[] {
  return reason
    .split(" · ")
    .slice(1)
    .map((part) => {
      const m = part.match(/^([+-]?\d+\.?\d*)\s+(.+)$/);
      if (!m) return null;
      const val = parseFloat(m[1]!);
      if (Math.abs(val) < 0.4) return null;
      return { text: `${m[1]}% ${m[2]}`, positive: val >= 0 };
    })
    .filter((x): x is FloatLabel => x !== null);
}

function MovementGlyph({ movement, color }: { movement: RankRow["movement"]; color: string }) {
  if (movement === "up") return <span style={{ color }}>▲</span>;
  if (movement === "down") return <span style={{ color: "#FF5D73" }}>▼</span>;
  return <span style={{ color: "rgba(255,255,255,0.35)" }}>•</span>;
}

function BillboardColumn({ config, active }: { config: ColumnDef; active: boolean }) {
  const [rows, setRows] = useState<RankRow[]>(() => sortRows(makeRows(config.title.length * 13)));
  const [hotId, setHotId] = useState<string | null>(null);
  const [floatEvent, setFloatEvent] = useState<FloatEvent | null>(null);
  const [crownEvent, setCrownEvent] = useState<number | null>(null);
  const floatKey = useRef(0);
  const crownKey = useRef(0);
  const prevTopId = useRef<string | null>(null);
  const floatTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const crownTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null);

  useEffect(() => {
    ensureStyles();
  }, []);

  useEffect(() => {
    if (!active) {
      if (timerRef.current) clearInterval(timerRef.current);
      timerRef.current = null;
      return;
    }

    timerRef.current = setInterval(() => {
      setRows((prev) => {
        const next = mutateRows(prev);
        const hotRow = next.find((r) => r.movement !== "flat");
        setHotId(hotRow?.id ?? null);
        if (hotRow) {
          const labels = parseFloatLabels(hotRow.movementReason);
          if (labels.length > 0) {
            floatKey.current++;
            if (floatTimer.current) clearTimeout(floatTimer.current);
            setFloatEvent({ key: floatKey.current, labels });
            floatTimer.current = setTimeout(() => setFloatEvent(null), 2600);
          }
        }
        // Detect #1 breakout
        const newTopId = next[0]?.id ?? null;
        if (prevTopId.current !== null && newTopId !== prevTopId.current) {
          crownKey.current++;
          if (crownTimer.current) clearTimeout(crownTimer.current);
          setCrownEvent(crownKey.current);
          crownTimer.current = setTimeout(() => setCrownEvent(null), 3000);
        }
        prevTopId.current = newTopId;
        return next;
      });
    }, 2100 + Math.round(Math.random() * 1200));

    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
      timerRef.current = null;
      if (floatTimer.current) clearTimeout(floatTimer.current);
      if (crownTimer.current) clearTimeout(crownTimer.current);
    };
  }, [active]);

  const doubled = useMemo(() => [...rows, ...rows], [rows]);

  return (
    <div style={{ display: "flex", flexDirection: "column", minWidth: 0, overflow: "hidden", position: "relative" }}>
      {floatEvent && (
        <div
          key={floatEvent.key}
          style={{
            position: "absolute",
            top: 34,
            left: 0,
            right: 0,
            zIndex: 10,
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            gap: 3,
            pointerEvents: "none",
          }}
        >
          {floatEvent.labels.map((label, i) => (
            <div
              key={i}
              style={{
                background: label.positive ? `${config.accent}22` : "rgba(255,60,60,0.15)",
                border: `1px solid ${label.positive ? config.accent + "77" : "rgba(255,80,80,0.5)"}`,
                borderRadius: 4,
                padding: "2px 7px",
                fontSize: 7,
                fontWeight: 900,
                letterSpacing: "0.08em",
                color: label.positive ? config.accent : "#FF6060",
                textShadow: label.positive ? `0 0 8px ${config.shadow}` : "0 0 8px rgba(255,60,60,0.6)",
                whiteSpace: "nowrap",
                animation: `h12Float 2.6s ease ${i * 85}ms forwards`,
              }}
            >
              {label.text}
            </div>
          ))}
        </div>
      )}
      {crownEvent !== null && (
        <div
          key={crownEvent}
          style={{
            position: "absolute",
            top: 0,
            left: 0,
            right: 0,
            zIndex: 20,
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            paddingTop: 6,
            gap: 2,
            pointerEvents: "none",
            animation: "h12CrownDrop 3s ease forwards",
          }}
        >
          <span style={{ fontSize: 18, animation: "h12CrownPulse 0.7s ease 0.18s 2" }}>👑</span>
          <div
            style={{
              fontSize: 7,
              fontWeight: 900,
              letterSpacing: "0.18em",
              textTransform: "uppercase",
              color: "#FFD700",
              textShadow: "0 0 14px rgba(255,215,0,0.9)",
            }}
          >
            #1 BREAKOUT
          </div>
          <div
            style={{
              position: "absolute",
              inset: 0,
              borderRadius: 0,
              animation: "h12CrownGlow 3s ease forwards",
              pointerEvents: "none",
            }}
          />
        </div>
      )}
      <div
        style={{
          padding: "7px 10px",
          borderBottom: `1px solid ${config.accent}44`,
          display: "flex",
          alignItems: "center",
          gap: 6,
        }}
      >
        <div
          style={{
            width: 6,
            height: 6,
            borderRadius: "50%",
            background: config.accent,
            boxShadow: `0 0 11px ${config.shadow}`,
            animation: active ? "h12Flicker 2.1s ease-in-out infinite" : "none",
          }}
        />
        <span
          style={{
            fontSize: 8,
            fontWeight: 900,
            letterSpacing: "0.18em",
            textTransform: "uppercase",
            color: config.accent,
            textShadow: `0 0 11px ${config.shadow}`,
          }}
        >
          {config.title}
        </span>
      </div>

      <div style={{ position: "relative", overflow: "hidden", minHeight: 0, flex: 1 }}>
        <div
          style={{
            position: "absolute",
            top: 0,
            left: 0,
            right: 0,
            height: 20,
            pointerEvents: "none",
            zIndex: 2,
            background: "linear-gradient(to bottom, rgba(4,4,18,0.95), transparent)",
          }}
        />
        <div
          style={{
            position: "absolute",
            bottom: 0,
            left: 0,
            right: 0,
            height: 20,
            pointerEvents: "none",
            zIndex: 2,
            background: "linear-gradient(to top, rgba(4,4,18,0.95), transparent)",
          }}
        />

        <div
          style={{
            display: "flex",
            flexDirection: "column",
            gap: 5,
            padding: "6px",
            animation: active ? `h12Scroll ${config.speedSec}s linear infinite` : "none",
            willChange: "transform",
          }}
        >
          {doubled.map((row, i) => {
            const hot = row.id === hotId;
            return (
              <div
                key={`${row.id}-${i}`}
                style={{
                  background: hot
                    ? `linear-gradient(140deg, ${config.accent}22 0%, rgba(7,7,24,0.9) 100%)`
                    : "linear-gradient(140deg, rgba(255,255,255,0.05) 0%, rgba(5,5,14,0.88) 100%)",
                  border: `1px solid ${hot ? config.accent + "99" : "rgba(255,255,255,0.08)"}`,
                  borderRadius: 8,
                  padding: "7px 8px",
                  clipPath: "polygon(0 0, 100% 0, 100% 100%, 10px 100%, 0 calc(100% - 10px))",
                  animation: hot ? "h12Pulse 1.2s ease" : "none",
                  ["--h12-glow" as string]: config.shadow,
                }}
              >
                <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
                  <span style={{ fontSize: 10, fontWeight: 900, color: config.accent, minWidth: 14 }}>{(i % rows.length) + 1}</span>
                  <span
                    style={{
                      fontSize: 10,
                      fontWeight: 800,
                      color: "rgba(255,255,255,0.93)",
                      overflow: "hidden",
                      whiteSpace: "nowrap",
                      textOverflow: "ellipsis",
                      flex: 1,
                    }}
                  >
                    {row.name}
                  </span>
                  <span style={{ fontSize: 8, fontWeight: 800, color: config.accent }}>{row.fanTruth}</span>
                  <MovementGlyph movement={row.movement} color={config.accent} />
                </div>
                <div style={{ marginTop: 3, fontSize: 7, color: "rgba(255,255,255,0.62)", letterSpacing: "0.05em" }}>
                  {row.movementReason}
                </div>
                <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: 6, marginTop: 4 }}>
                  <span style={{ fontSize: 7, color: "rgba(255,255,255,0.48)" }}>C {row.completionRate}%</span>
                  <span style={{ fontSize: 7, color: "rgba(255,255,255,0.48)" }}>L {row.likeRate}%</span>
                  <span style={{ fontSize: 7, color: "rgba(255,255,255,0.48)" }}>N {row.newFanConversion}%</span>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}

export default function BillboardColumnPulse() {
  const isVisible = useSceneVisible();

  return (
    <div
      style={{
        height: "100%",
        minHeight: "100%",
        background:
          "radial-gradient(ellipse at 18% 24%, rgba(0,255,255,0.08) 0%, transparent 55%), radial-gradient(ellipse at 84% 76%, rgba(255,45,170,0.08) 0%, transparent 56%), linear-gradient(165deg, #050510 0%, #060718 48%, #040412 100%)",
        display: "flex",
        flexDirection: "column",
        overflow: "hidden",
      }}
    >
      <div
        style={{
          padding: "11px 14px 9px",
          borderBottom: "1px solid rgba(0,255,255,0.16)",
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          gap: 10,
        }}
      >
        <div>
          <div style={{ fontSize: 10, fontWeight: 900, color: "#FFFFFF", letterSpacing: "0.14em", textTransform: "uppercase" }}>
            TMI Fan-Truth Billboard
          </div>
          <div style={{ fontSize: 7, color: "rgba(0,255,255,0.65)", letterSpacing: "0.16em", textTransform: "uppercase", marginTop: 2 }}>
            Cover Spread · Live Rank Motion
          </div>
        </div>
        <div style={{ fontSize: 7, color: "rgba(255,255,255,0.34)", letterSpacing: "0.12em", textTransform: "uppercase" }}>
          Issue 47 · Week 28
        </div>
      </div>

      <div
        style={{
          display: "grid",
          gridTemplateColumns: "repeat(6, minmax(0, 1fr))",
          gap: 0,
          flex: 1,
          minHeight: 0,
        }}
      >
        {COLUMNS.map((column, idx) => (
          <div key={column.key} style={{ borderRight: idx < COLUMNS.length - 1 ? "1px solid rgba(255,255,255,0.07)" : "none", minWidth: 0 }}>
            <BillboardColumn config={column} active={isVisible} />
          </div>
        ))}
      </div>

      <div
        style={{
          borderTop: "1px solid rgba(255,255,255,0.07)",
          padding: "8px 12px",
          display: "flex",
          alignItems: "center",
          gap: 8,
        }}
      >
        <div
          style={{
            width: 5,
            height: 5,
            borderRadius: "50%",
            background: "#00FFFF",
            boxShadow: "0 0 8px rgba(0,255,255,0.8)",
            animation: isVisible ? "h12Flicker 1.8s ease-in-out infinite" : "none",
          }}
        />
        <span style={{ fontSize: 7, color: "rgba(0,255,255,0.62)", letterSpacing: "0.14em", textTransform: "uppercase", fontWeight: 800 }}>
          Scores react to completion, likes, and new-fan conversion
        </span>
      </div>
    </div>
  );
}
