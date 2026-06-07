"use client";

import Link from "next/link";
import { useSceneVisible } from "@/components/magazine/MagazinePageFlipRuntime";
import { useEffect, useMemo, useRef, useState } from "react";
import Home2EditorialRail from "./Home2EditorialRail";
import Home2TrendingIssueRail from "./Home2TrendingIssueRail";

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
  { key: "best_song",          title: "Digital Hip-Hop Night",  accent: "#00FFFF", shadow: "rgba(0,255,255,0.55)",   speedSec: 40 },
  { key: "best_hooks",         title: "Digital Comedy Night",   accent: "#FF2DAA", shadow: "rgba(255,45,170,0.55)", speedSec: 44 },
  { key: "best_horns",         title: "Digital Country Night",  accent: "#FFD700", shadow: "rgba(255,215,0,0.55)",  speedSec: 48 },
  { key: "best_battle",        title: "Digital DJ Night",       accent: "#AA2DFF", shadow: "rgba(170,45,255,0.55)", speedSec: 42 },
  { key: "fan_crown",          title: "Digital Dance Night",    accent: "#00FF88", shadow: "rgba(0,255,136,0.5)",   speedSec: 46 },
  { key: "rising_performer",   title: "Digital Gospel Night",   accent: "#5EE1FF", shadow: "rgba(94,225,255,0.5)",  speedSec: 50 },
] as const;

// Country flags cycle by artist index so each name gets a consistent flag
const FLAGS = ["🇺🇸", "🇯🇲", "🇬🇧", "🇨🇦", "🇧🇷", "🇳🇬", "🇿🇦", "🇲🇽", "🇫🇷", "🇯🇵", "🇩🇪", "🇦🇺"];

// Gradient colors for avatar chips
const AVATAR_GRADIENTS = [
  "from-cyan-600 to-indigo-800",
  "from-rose-600 to-purple-800",
  "from-amber-500 to-orange-700",
  "from-emerald-600 to-teal-800",
  "from-fuchsia-600 to-pink-800",
  "from-blue-600 to-cyan-800",
  "from-red-600 to-rose-800",
  "from-violet-600 to-purple-800",
  "from-lime-600 to-green-800",
  "from-yellow-500 to-amber-700",
  "from-sky-500 to-blue-700",
  "from-pink-500 to-rose-700",
];

const NAMES = [
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
      completionRate: Math.round(Math.max(45, Math.min(99, 55 + base / 2)) * 10) / 10,
      likeRate: Math.round(Math.max(20, Math.min(95, 24 + base / 1.3)) * 10) / 10,
      newFanConversion: Math.round(Math.max(4, Math.min(55, 6 + base / 2.4)) * 10) / 10,
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

interface LiveRankRow { id: string; name: string; wins: number; losses: number; fans: number; winRate: number; }

function toRankRow(r: LiveRankRow, col: ColumnKey): RankRow {
  const fanTruth =
    col === 'fan_crown'    ? Math.min(140, Math.max(20, Math.round(r.fans / 500))) :
    col === 'best_battle'  ? Math.min(140, Math.max(20, r.wins * 10)) :
                             Math.min(140, Math.max(20, r.wins * 8 + Math.floor(r.fans / 200)));
  return {
    id:              r.id,
    name:            r.name,
    movement:        'flat',
    fanTruth,
    completionRate:  r.winRate,
    likeRate:        Math.min(99, Math.round(r.fans / 200)),
    newFanConversion: Math.min(70, r.wins * 2),
    movementReason:  `W: ${r.wins}  L: ${r.losses}  Fans: ${r.fans.toLocaleString()}`,
  };
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

  // Fetch real challenge-win + fan-count rankings; keep seeded data as fallback
  useEffect(() => {
    fetch(`/api/billboard/rankings?column=${config.key}&limit=8`)
      .then(r => r.json())
      .then((data: { ok: boolean; rows?: LiveRankRow[] }) => {
        if (!data.ok || !Array.isArray(data.rows) || data.rows.length === 0) return;
        setRows(sortRows(data.rows.map(r => toRankRow(r, config.key))));
      })
      .catch(() => {});
  }, [config.key]);

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
                <div style={{ display: "flex", alignItems: "center", gap: 5 }}>
                  <span style={{ fontSize: 10, fontWeight: 900, color: config.accent, minWidth: 14 }}>{(i % rows.length) + 1}</span>
                  {/* Avatar chip with gradient fallback */}
                  <div
                    className={`bg-gradient-to-br ${AVATAR_GRADIENTS[(i % rows.length) % AVATAR_GRADIENTS.length]}`}
                    style={{
                      width: 20, height: 20, borderRadius: 4, flexShrink: 0,
                      display: "flex", alignItems: "center", justifyContent: "center",
                      fontSize: 7, fontWeight: 900, color: "rgba(255,255,255,0.9)",
                    }}
                  >
                    {row.name.substring(0, 2).toUpperCase()}
                  </div>
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
                  <span style={{ fontSize: 8, flexShrink: 0 }}>{FLAGS[(i % rows.length) % FLAGS.length]}</span>
                  <span style={{ fontSize: 8, fontWeight: 800, color: config.accent, flexShrink: 0 }}>{row.fanTruth}</span>
                  <MovementGlyph movement={row.movement} color={config.accent} />
                </div>
                <div style={{ marginTop: 3, fontSize: 7, color: "rgba(255,255,255,0.62)", letterSpacing: "0.05em" }}>
                  {row.movementReason}
                </div>
                <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: 6, marginTop: 4 }}>
                  <span style={{ fontSize: 7, color: "rgba(255,255,255,0.48)" }}>C {Number(row.completionRate).toFixed(1)}%</span>
                  <span style={{ fontSize: 7, color: "rgba(255,255,255,0.48)" }}>L {Number(row.likeRate).toFixed(1)}%</span>
                  <span style={{ fontSize: 7, color: "rgba(255,255,255,0.48)" }}>N {Number(row.newFanConversion).toFixed(1)}%</span>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}

const CHALLENGE_PAIRS = [
  "Singer vs Singer",        "Rapper vs Rapper",         "Country Singer vs Country Singer",
  "Opera Singer vs Opera Singer", "Beatboxer vs Beatboxer",  "Guitar vs Guitar",
  "Bass vs Bass",            "Acoustic vs Acoustic",     "Lead vs Lead",
  "Trumpet vs Trumpet",      "Saxophone vs Saxophone",   "Trombone vs Trombone",
  "Tuba vs Tuba",            "French Horn vs French Horn","Drummer vs Drummer",
  "Percussionist vs Percussionist","Violin vs Violin",   "Cello vs Cello",
  "Harp vs Harp",            "Sitar vs Sitar",           "Ukulele vs Ukulele",
  "Banjo vs Banjo",          "Mandolin vs Mandolin",     "Piano vs Piano",
  "Keyboardist vs Keyboardist","Beat Producer vs Beat Producer","DJ vs DJ",
  "Remix Artist vs Remix Artist","Comedian vs Comedian",  "Magician vs Magician",
  "Dancer vs Dancer",        "Poet vs Poet",             "Spoken Word vs Spoken Word",
  "Choir vs Choir",          "Band vs Band",             "Dance Crew vs Dance Crew",
  "Cypher vs Cypher",        "Battle vs Battle",         "Song Challenge vs Song Challenge",
] as const;

const PAIR_COLORS = ["#00FFFF","#FF2DAA","#FFD700","#AA2DFF","#00FF88","#FF6B35"];

export default function BillboardColumnPulse() {
  const isVisible = useSceneVisible();
  const [pairIdx, setPairIdx] = useState(0);
  const deckArticles = [
    "WHO TOOK THE CROWN THIS WEEK?",
    "CYPHER ARENA OPEN FOR WILD-CARD ENTRY",
    "BATTLE RING VOTES SPIKE 31% IN FINAL MINUTES",
  ] as const;
  const sponsorInserts = ["CROWN AUDIO", "BASSLINE ENERGY", "NEON THREADS"] as const;

  useEffect(() => {
    const t = setInterval(() => setPairIdx((i) => (i + 1) % CHALLENGE_PAIRS.length), 3500);
    return () => clearInterval(t);
  }, []);

  const activePair = CHALLENGE_PAIRS[pairIdx] ?? CHALLENGE_PAIRS[0]!;
  const pairColor  = PAIR_COLORS[pairIdx % PAIR_COLORS.length]!;

  return (
    <div
      style={{
        minHeight: "100svh",
        background:
          "radial-gradient(ellipse at 18% 24%, rgba(0,255,255,0.14) 0%, transparent 55%), radial-gradient(ellipse at 84% 76%, rgba(255,45,170,0.14) 0%, transparent 56%), linear-gradient(165deg, #050510 0%, #060718 48%, #040412 100%)",
        display: "flex",
        flexDirection: "column",
        color: "#fff",
        position: "relative",
        overflow: "hidden",
      }}
    >
      <div
        aria-hidden
        style={{
          position: "absolute",
          inset: 0,
          pointerEvents: "none",
          backgroundImage:
            "radial-gradient(circle at 1px 1px, rgba(255,255,255,0.14) 1px, transparent 1.5px)",
          backgroundSize: "14px 14px",
          opacity: 0.14,
          mixBlendMode: "soft-light",
        }}
      />

      {/* ── Challenge Rotation Ticker ── */}
      <div style={{
        position: "relative", zIndex: 5,
        display: "flex", alignItems: "center", justifyContent: "center", gap: 14,
        padding: "10px 16px",
        background: "rgba(5,5,16,0.97)",
        borderBottom: `1px solid ${pairColor}40`,
      }}>
        <span style={{ fontSize: 8, fontWeight: 900, letterSpacing: "0.2em", color: "rgba(255,255,255,0.3)", flexShrink: 0 }}>OPEN CHALLENGE</span>
        <div style={{
          fontSize: "clamp(11px,2vw,16px)", fontWeight: 900, letterSpacing: "0.06em",
          color: pairColor, textAlign: "center", transition: "color 0.4s ease",
          textShadow: `0 0 18px ${pairColor}60`,
        }}>
          ⚔️ {activePair}
        </div>
        <a href="/battles/new" style={{ flexShrink: 0, fontSize: 8, fontWeight: 900, letterSpacing: "0.18em", color: pairColor, textDecoration: "none", border: `1px solid ${pairColor}50`, borderRadius: 4, padding: "3px 8px" }}>
          ENTER →
        </a>
      </div>

      {/* ── Editorial spread header — no card grid, collage layout ── */}
      <section
        style={{
          position: "relative",
          zIndex: 2,
          overflow: "hidden",
          background: "linear-gradient(145deg, rgba(10,4,28,0.97), rgba(4,4,18,0.98))",
          borderBottom: "1px solid rgba(255,215,0,0.18)",
          minHeight: 148,
        }}
      >
        {/* Neon wash behind the spread */}
        <div aria-hidden style={{ position:"absolute", inset:0, pointerEvents:"none", background:"radial-gradient(ellipse 70% 90% at 10% 50%, rgba(170,45,255,0.18) 0%, transparent 60%), radial-gradient(ellipse 50% 80% at 90% 50%, rgba(0,255,255,0.1) 0%, transparent 60%)" }} />

        {/* Cover story block — skewed left anchor */}
        <div style={{
          position: "absolute",
          left: 0, top: 0, bottom: 0,
          width: "clamp(190px, 38%, 340px)",
          background: "linear-gradient(140deg, rgba(255,215,0,0.16) 0%, rgba(170,45,255,0.08) 100%)",
          clipPath: "polygon(0 0, calc(100% - 28px) 0, 100% 50%, calc(100% - 28px) 100%, 0 100%)",
          borderRight: "2px solid rgba(255,215,0,0.55)",
          padding: "14px 52px 14px 16px",
          display: "flex",
          flexDirection: "column",
          justifyContent: "center",
        }}>
          <div style={{ fontSize: 7, letterSpacing: "0.26em", fontWeight: 900, color: "#FFD700", marginBottom: 6, textTransform:"uppercase" }}>◆ COVER STORY</div>
          <div style={{ fontSize: "clamp(14px,2.2vw,20px)", lineHeight: 1.0, fontWeight: 900, letterSpacing: "0.03em", textTransform:"uppercase" }}>
            LIVE<br/>EDITION
          </div>
          <div style={{ marginTop: 6, fontSize: 8, color: "rgba(255,255,255,0.62)", fontStyle: "italic", lineHeight: 1.5 }}>
            Rank volatility, crowd surge & who makes the jump tonight.
          </div>
        </div>

        {/* Mid deck — stacked skewed headlines */}
        <div style={{ position:"absolute", left:"34%", top:0, bottom:0, width:"clamp(180px,38%,300px)", display:"flex", flexDirection:"column", justifyContent:"center", gap:0 }}>
          {deckArticles.map((title, idx) => (
            <div
              key={title}
              style={{
                padding: "8px 14px",
                background: idx === 0
                  ? "rgba(0,255,255,0.06)"
                  : idx === 1
                    ? "rgba(255,45,170,0.06)"
                    : "rgba(255,215,0,0.05)",
                borderLeft: `3px solid ${idx === 0 ? "#00FFFF" : idx === 1 ? "#FF2DAA" : "#FFD700"}`,
                borderBottom: idx < deckArticles.length - 1 ? "1px solid rgba(255,255,255,0.06)" : "none",
                fontSize: "clamp(8px, 1.1vw, 10px)",
                fontWeight: 800,
                letterSpacing: "0.07em",
                color: idx === 0 ? "#00FFFF" : idx === 1 ? "#FF2DAA" : "#FFD700",
                textTransform: "uppercase",
                lineHeight: 1.3,
              }}
            >
              {title}
            </div>
          ))}
        </div>

        {/* Right block — week issue stamp, overlapping */}
        <div style={{
          position: "absolute",
          right: 12,
          top: "50%",
          transform: "translateY(-50%) rotate(-6deg)",
          border: "2px solid rgba(255,215,0,0.5)",
          background: "rgba(28,10,62,0.92)",
          padding: "8px 14px",
          clipPath: "polygon(0 0, calc(100% - 10px) 0, 100% 10px, 100% 100%, 10px 100%, 0 calc(100% - 10px))",
          textAlign: "center",
          minWidth: 88,
        }}>
          <div style={{ fontSize: 7, fontWeight: 900, letterSpacing: "0.22em", color: "#FFD700" }}>
            {(() => { const w = Math.floor(Date.now() / (7 * 24 * 60 * 60 * 1000)); return `WK ${(w % 52) + 1}`; })()}
          </div>
          <div style={{ fontSize: 11, fontWeight: 900, color: "#fff", letterSpacing: "0.08em" }}>ISSUE</div>
          <div style={{ fontSize: 20, fontWeight: 900, color: "#FFD700", lineHeight: 1 }}>
            {(() => { const w = Math.floor(Date.now() / (7 * 24 * 60 * 60 * 1000)); return (w % 52) + 1; })()}
          </div>
        </div>
      </section>

      {/* ── Rankings viewport — fills first screen ── */}
      <div style={{ height: "100svh", display: "flex", flexDirection: "column", overflow: "hidden" }}>
        <div
          style={{
            padding: "11px 14px 9px",
            borderBottom: "1px solid rgba(0,255,255,0.16)",
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            gap: 10,
            flexShrink: 0,
          }}
        >
          <div>
            <div style={{ fontSize: 10, fontWeight: 900, color: "#FFFFFF", letterSpacing: "0.14em", textTransform: "uppercase" }}>
              TMI Digital Nights — Live Rankings
            </div>
            <div style={{ fontSize: 7, color: "rgba(0,255,255,0.65)", letterSpacing: "0.16em", textTransform: "uppercase", marginTop: 2 }}>
              Fan-Truth Billboard · Cover Spread · Live Rank Motion
            </div>
          </div>
          <div style={{ fontSize: 7, color: "rgba(255,255,255,0.34)", letterSpacing: "0.12em", textTransform: "uppercase" }}>
            {(() => { const w = Math.floor(Date.now() / (7 * 24 * 60 * 60 * 1000)); return `Issue ${(w % 52) + 1} · Week ${(w % 52) + 1}`; })()}
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
            flexShrink: 0,
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
          <span style={{ marginLeft: "auto", fontSize: 7, color: "rgba(255,255,255,0.2)", letterSpacing: "0.1em" }}>
            ↓ scroll for editorial
          </span>
        </div>
      </div>

      {/* ── Second section — editorial collage below the fold ── */}
      <div style={{ borderTop: "1px solid rgba(0,255,255,0.12)", background: "rgba(2,2,14,0.96)", position: "relative" }}>

        {/* Editorial collage spread — no card grid */}
        <section
          style={{
            position: "relative",
            padding: "0",
            borderBottom: "1px solid rgba(255,255,255,0.07)",
            minHeight: 200,
            overflow: "hidden",
          }}
        >
          {/* Dark wash */}
          <div aria-hidden style={{ position:"absolute", inset:0, background:"radial-gradient(ellipse 80% 100% at 20% 50%, rgba(170,45,255,0.12) 0%, transparent 55%), radial-gradient(ellipse 60% 100% at 85% 50%, rgba(0,255,255,0.08) 0%, transparent 55%)", pointerEvents:"none" }} />

          {/* Dominant left strip — artist spotlight */}
          <div style={{
            position: "absolute",
            left: 0, top: 0, bottom: 0,
            width: "clamp(160px, 32%, 280px)",
            background: "linear-gradient(160deg, rgba(170,45,255,0.22) 0%, rgba(0,255,255,0.08) 100%)",
            borderRight: "2px solid rgba(170,45,255,0.44)",
            padding: "16px 14px",
            display: "flex",
            flexDirection: "column",
            gap: 8,
          }}>
            <div style={{ fontSize: 7, fontWeight: 900, letterSpacing: "0.22em", color: "#AA2DFF", textTransform:"uppercase" }}>◆ Artist Spotlight</div>
            {/* Abstract portrait block */}
            <div style={{
              width: "100%",
              aspectRatio: "4/3",
              background: "linear-gradient(135deg, rgba(0,255,255,0.25) 0%, rgba(255,45,170,0.2) 50%, rgba(170,45,255,0.3) 100%)",
              clipPath: "polygon(0 0, 100% 0, 92% 100%, 8% 100%)",
              border: "1px solid rgba(255,255,255,0.18)",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              fontSize: 32,
            }}>
              🎤
            </div>
            <div style={{ fontSize: 14, fontWeight: 900, lineHeight: 1.1, letterSpacing: "0.02em" }}>Neon Verse</div>
            <div style={{ fontSize: 8, color: "rgba(255,255,255,0.6)", lineHeight: 1.5, fontStyle:"italic" }}>From wildcard to crown contention in one rotation cycle.</div>
          </div>

          {/* Center — sponsor editorial features, stacked with skew */}
          <div style={{ position:"absolute", left:"30%", right:"28%", top:0, bottom:0, display:"flex", flexDirection:"column", justifyContent:"center", gap:0 }}>
            {sponsorInserts.map((sponsor, idx) => (
              <div
                key={sponsor}
                style={{
                  padding: "10px 16px",
                  background: idx % 2 === 0 ? "rgba(255,215,0,0.06)" : "rgba(0,255,255,0.04)",
                  borderLeft: `3px solid ${idx % 2 === 0 ? "#FFD700" : idx === 1 ? "#FF2DAA" : "#00FFFF"}`,
                  borderBottom: idx < sponsorInserts.length - 1 ? "1px solid rgba(255,255,255,0.06)" : "none",
                  display: "flex",
                  flexDirection: "column",
                  gap: 3,
                  transform: idx === 1 ? "translateX(8px)" : idx === 2 ? "translateX(-6px)" : "none",
                }}
              >
                <div style={{ fontSize: 6, fontWeight: 900, letterSpacing: "0.22em", color: idx % 2 === 0 ? "#FFD700" : "#FF2DAA", textTransform:"uppercase" }}>SPONSORED FEATURE</div>
                <div style={{ fontSize: 13, fontWeight: 900, lineHeight: 1.05, letterSpacing: "0.04em" }}>{sponsor}</div>
                <div style={{ fontSize: 8, color: "rgba(255,255,255,0.45)", letterSpacing: "0.08em" }}>Ad Feature · Weekly Issue</div>
              </div>
            ))}
          </div>

          {/* Right edge — vertical sponsor CTA strip */}
          <div style={{
            position: "absolute",
            right: 0, top: 0, bottom: 0,
            width: "clamp(90px, 26%, 200px)",
            background: "linear-gradient(160deg, rgba(255,215,0,0.08), rgba(255,45,170,0.06))",
            borderLeft: "1px solid rgba(255,215,0,0.2)",
            display: "flex",
            flexDirection: "column",
            justifyContent: "center",
            alignItems: "center",
            padding: "16px 10px",
            gap: 10,
          }}>
            <div style={{ fontSize: 6, fontWeight: 900, letterSpacing: "0.22em", color: "#FFD700", textTransform:"uppercase", textAlign:"center" }}>YOUR BRAND<br/>IN THE INDEX</div>
            <div style={{ fontSize: 10, fontWeight: 900, color: "#fff", textAlign:"center", lineHeight: 1.3 }}>Sponsor a<br/>performer</div>
            <div style={{ fontSize: 8, color: "rgba(255,215,0,0.8)", fontWeight:700, textAlign:"center" }}>from $25/mo</div>
            <Link
              href="/hub/sponsor"
              style={{
                display: "block",
                padding: "6px 12px",
                background: "rgba(255,215,0,0.15)",
                border: "1px solid rgba(255,215,0,0.5)",
                color: "#FFD700",
                fontSize: 7,
                fontWeight: 900,
                letterSpacing: "0.14em",
                textDecoration: "none",
                textTransform: "uppercase",
                clipPath: "polygon(4px 0,100% 0,calc(100% - 4px) 100%,0 100%)",
                textAlign: "center",
              }}
            >
              Get Started →
            </Link>
          </div>

          {/* Invisible height sentinel */}
          <div style={{ height: 200, visibility: "hidden" }} />
        </section>

        <Home2EditorialRail title="FEATURED EDITORIAL" accentColor="#00FFFF" />
        <Home2TrendingIssueRail />
      </div>
    </div>
  );
}
