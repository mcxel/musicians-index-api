"use client";

/**
 * TMIWinnerCelebration.tsx
 * Winner ceremony animation engine for The Musician's Index.
 *
 * Handles: battles, challenges, daily tournaments, 8-week championships
 *
 * Rules from Marcel:
 *  - Battle winner (daily/computer-generated) → gets a CROWN (tier-colored)
 *  - Challenge winner (gold subscriber, mini-battle) → gets WIN RECORD (no crown)
 *  - 8-week championship → BELT (removable, can be taken by next champion)
 *  - Different celebration themes so they don't look the same
 *  - Limited edition crowns with brand logos (only earned, never shared)
 *  - Record: wins/losses always on performer profile
 *
 * Themes: cold/ice, electric, toxic, fire, gold-metallic, cosmic, rainbow, shadow
 * These rotate so celebrations never repeat back-to-back.
 */

import { useState, useEffect, useRef, useCallback } from "react";

/* ─── Types ─────────────────────────────────────────────────────────────── */
export type CelebType =
  | "battle"           // head-to-head, daily/computer → crown
  | "challenge"        // skill submission, no crown → just record
  | "mini_challenge"   // gold-tier subscriber mini → win/loss record only
  | "championship";    // 8-week → belt

export type SubscriptionTier = "free" | "silver" | "gold" | "platinum" | "diamond";

export type CelebTheme =
  | "cold_ice"
  | "electric"
  | "toxic"
  | "fire"
  | "gold_metallic"
  | "cosmic"
  | "rainbow"
  | "shadow_smoke";

export interface CombatRecord {
  wins: number;
  losses: number;
  lastBattleScore: number;        // crowd vote percentage
  crowdFavoritePeak: number;      // highest crowd approval ever
  currentStreak: number;
  bestRound?: string;             // e.g. "Round 2 — 84% crowd vote"
  hasChampBelt: boolean;
  hasCrown: boolean;
  crownTier?: SubscriptionTier;
  limitedEditionCrowns: string[]; // brand names e.g. ["TMI_Season1_Gold"]
}

export interface FanStakeResult {
  fansGained?: number;
  fansLost?: number;
  message: string;
}

export interface WinnerPayload {
  winnerId: string;
  winnerName: string;
  winnerTier: SubscriptionTier;
  loserId: string;
  loserName: string;
  celebType: CelebType;
  theme?: CelebTheme;
  crowdVotePercent: number;       // winner's share 0–100
  prizePool?: string;
  fansStaked?: FanStakeResult;
  isBotGenerated?: boolean;       // computer-generated events always award crown
  limitedEditionCrownId?: string; // if this event had a branded crown
  winnerRecord: CombatRecord;
  loserRecord: CombatRecord;
}

/* ─── Tier colors ────────────────────────────────────────────────────────── */
const TIER_COLORS: Record<SubscriptionTier, { primary: string; secondary: string; label: string }> = {
  free:     { primary: "#94a3b8", secondary: "#64748b",  label: "Silver" },
  silver:   { primary: "#cbd5e1", secondary: "#94a3b8",  label: "Silver+" },
  gold:     { primary: "#fbbf24", secondary: "#f59e0b",  label: "Gold" },
  platinum: { primary: "#e2e8f0", secondary: "#94a3b8",  label: "Platinum" },
  diamond:  { primary: "#38bdf8", secondary: "#06b6d4",  label: "Diamond" },
};

/* ─── Celebration themes ─────────────────────────────────────────────────── */
const THEMES: Record<CelebTheme, {
  bg: string;
  glow: string;
  particles: string[];
  sound: number[];
  name: string;
  motionDirection: "horizontal" | "vertical" | "radial" | "spiral";
}> = {
  cold_ice: {
    bg: "linear-gradient(135deg, #0c1a2e 0%, #0a2a3d 50%, #062233 100%)",
    glow: "#38bdf8",
    particles: ["❄️","💎","🧊","✨","⭐"],
    sound: [293, 329, 440, 523],
    name: "ICE COLD",
    motionDirection: "vertical",
  },
  electric: {
    bg: "linear-gradient(135deg, #0d0020 0%, #1a0040 50%, #0a001a 100%)",
    glow: "#a855f7",
    particles: ["⚡","🔮","💫","✨","🌟"],
    sound: [440, 554, 659, 880],
    name: "ELECTRIC",
    motionDirection: "horizontal",
  },
  toxic: {
    bg: "linear-gradient(135deg, #001a00 0%, #0a2600 50%, #001200 100%)",
    glow: "#4ade80",
    particles: ["☣️","💚","🌿","✨","⚗️"],
    sound: [220, 277, 349, 415],
    name: "TOXIC",
    motionDirection: "radial",
  },
  fire: {
    bg: "linear-gradient(135deg, #1a0500 0%, #2d0f00 50%, #1a0800 100%)",
    glow: "#f97316",
    particles: ["🔥","⚡","💥","✨","🌟"],
    sound: [349, 440, 523, 659],
    name: "ON FIRE",
    motionDirection: "vertical",
  },
  gold_metallic: {
    bg: "linear-gradient(135deg, #1a1200 0%, #2d2000 50%, #1a1400 100%)",
    glow: "#fbbf24",
    particles: ["👑","🏆","⭐","💛","✨"],
    sound: [523, 659, 784, 1047],
    name: "GOLDEN",
    motionDirection: "spiral",
  },
  cosmic: {
    bg: "linear-gradient(135deg, #050010 0%, #0a0020 50%, #050014 100%)",
    glow: "#c084fc",
    particles: ["🌌","💫","⭐","🌟","✨"],
    sound: [261, 329, 392, 523],
    name: "COSMIC",
    motionDirection: "radial",
  },
  rainbow: {
    bg: "linear-gradient(135deg, #0a0010 0%, #100020 50%, #0a0015 100%)",
    glow: "#ec4899",
    particles: ["🌈","⭐","💫","🎊","✨"],
    sound: [440, 494, 523, 587],
    name: "RAINBOW",
    motionDirection: "horizontal",
  },
  shadow_smoke: {
    bg: "linear-gradient(135deg, #050505 0%, #0f0f0f 50%, #080808 100%)",
    glow: "#6b7280",
    particles: ["💨","🌫️","👁️","⭐","✨"],
    sound: [196, 220, 262, 330],
    name: "SHADOW",
    motionDirection: "vertical",
  },
};

/* ─── Theme rotation tracker (non-repeating) ──────────────────────────── */
const themeHistory: CelebTheme[] = [];
const ALL_THEMES = Object.keys(THEMES) as CelebTheme[];

function getNextTheme(preferred?: CelebTheme): CelebTheme {
  if (preferred) return preferred;
  const available = ALL_THEMES.filter((t) => !themeHistory.slice(-3).includes(t));
  const pick = available[Math.floor(Math.random() * available.length)] ?? ALL_THEMES[0];
  themeHistory.push(pick);
  if (themeHistory.length > 10) themeHistory.shift();
  return pick;
}

/* ─── Sound synthesizer ─────────────────────────────────────────────────── */
function playCelebration(freqs: number[]) {
  if (typeof window === "undefined") return;
  try {
    const ctx = new AudioContext();
    freqs.forEach((freq, i) => {
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.connect(gain);
      gain.connect(ctx.destination);
      osc.type = i % 2 === 0 ? "sine" : "triangle";
      osc.frequency.value = freq;
      gain.gain.setValueAtTime(0, ctx.currentTime + i * 0.15);
      gain.gain.linearRampToValueAtTime(0.15, ctx.currentTime + i * 0.15 + 0.05);
      gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + i * 0.15 + 0.6);
      osc.start(ctx.currentTime + i * 0.15);
      osc.stop(ctx.currentTime + i * 0.15 + 0.7);
    });
    setTimeout(() => ctx.close(), 2000);
  } catch { /* ignore */ }
}

/* ─── Particle system ─────────────────────────────────────────────────────── */
interface Particle {
  id: number;
  x: number;
  y: number;
  vx: number;
  vy: number;
  emoji: string;
  scale: number;
  rotation: number;
  rotSpeed: number;
  life: number;
  maxLife: number;
}

function ParticleCanvas({
  theme,
  running,
}: {
  theme: CelebTheme;
  running: boolean;
}) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const particlesRef = useRef<Particle[]>([]);
  const rafRef = useRef<number | null>(null);
  const themeData = THEMES[theme];

  const spawnParticle = useCallback(() => {
    const id = Date.now() + Math.random();
    const emoji = themeData.particles[Math.floor(Math.random() * themeData.particles.length)];
    const canvas = canvasRef.current;
    if (!canvas) return;

    let x: number, y: number, vx: number, vy: number;

    switch (themeData.motionDirection) {
      case "horizontal":
        x = Math.random() < 0.5 ? -20 : canvas.width + 20;
        y = Math.random() * canvas.height;
        vx = x < 0 ? 2 + Math.random() * 3 : -(2 + Math.random() * 3);
        vy = (Math.random() - 0.5) * 2;
        break;
      case "radial":
        const angle = Math.random() * Math.PI * 2;
        const dist = canvas.width * 0.4;
        x = canvas.width / 2 + Math.cos(angle) * dist;
        y = canvas.height / 2 + Math.sin(angle) * dist;
        vx = -Math.cos(angle) * (2 + Math.random() * 3);
        vy = -Math.sin(angle) * (2 + Math.random() * 3);
        break;
      case "spiral":
        x = canvas.width / 2 + (Math.random() - 0.5) * 40;
        y = canvas.height + 20;
        vx = (Math.random() - 0.5) * 4;
        vy = -(4 + Math.random() * 4);
        break;
      default: // vertical
        x = Math.random() * canvas.width;
        y = -20;
        vx = (Math.random() - 0.5) * 2;
        vy = 2 + Math.random() * 3;
    }

    particlesRef.current.push({
      id, x, y, vx, vy, emoji,
      scale: 0.8 + Math.random() * 0.8,
      rotation: Math.random() * 360,
      rotSpeed: (Math.random() - 0.5) * 8,
      life: 0,
      maxLife: 80 + Math.random() * 60,
    });
  }, [theme]);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d")!;

    let frameCount = 0;

    function tick() {
      ctx.clearRect(0, 0, canvas!.width, canvas!.height);

      if (running && frameCount % 3 === 0) {
        spawnParticle();
        if (frameCount % 6 === 0) spawnParticle();
      }

      particlesRef.current = particlesRef.current.filter((p) => p.life < p.maxLife);

      for (const p of particlesRef.current) {
        p.x += p.vx;
        p.y += p.vy;
        p.vy += 0.06;
        p.rotation += p.rotSpeed;
        p.life++;

        const alpha = Math.min(1, Math.min(p.life / 10, (p.maxLife - p.life) / 10));
        ctx.save();
        ctx.globalAlpha = alpha;
        ctx.translate(p.x, p.y);
        ctx.rotate((p.rotation * Math.PI) / 180);
        ctx.scale(p.scale, p.scale);
        ctx.font = "20px serif";
        ctx.textAlign = "center";
        ctx.textBaseline = "middle";
        ctx.fillText(p.emoji, 0, 0);
        ctx.restore();
      }

      frameCount++;
      rafRef.current = requestAnimationFrame(tick);
    }

    tick();
    return () => { if (rafRef.current) cancelAnimationFrame(rafRef.current); };
  }, [running, spawnParticle]);

  return (
    <canvas
      ref={canvasRef}
      width={400}
      height={500}
      className="absolute inset-0 w-full h-full pointer-events-none"
    />
  );
}

/* ─── Crown SVG ──────────────────────────────────────────────────────────── */
function Crown({ color, size = 48, limited = false }: { color: string; size?: number; limited?: boolean }) {
  return (
    <div className="relative">
      <svg width={size} height={size} viewBox="0 0 48 32" fill="none">
        <polygon
          points="4,28 8,10 16,20 24,4 32,20 40,10 44,28"
          fill={color}
          stroke={color}
          strokeWidth="2"
          strokeLinejoin="round"
        />
        <rect x="4" y="26" width="40" height="6" rx="3" fill={color} />
        {[12, 24, 36].map((cx) => (
          <circle key={cx} cx={cx} cy="19" r="2.5" fill="#fff" fillOpacity="0.6" />
        ))}
      </svg>
      {limited && (
        <span className="absolute -top-1 -right-1 text-[8px] bg-red-600 text-white font-black px-1 rounded">
          LTD
        </span>
      )}
    </div>
  );
}

/* ─── Belt SVG ────────────────────────────────────────────────────────────── */
function Belt({ color }: { color: string }) {
  return (
    <svg width={64} height={40} viewBox="0 0 64 40" fill="none">
      <rect x="2" y="8" width="60" height="24" rx="12" fill={color} />
      <rect x="22" y="10" width="20" height="20" rx="4" fill="#fff" fillOpacity="0.9" />
      <text x="32" y="23" textAnchor="middle" fontSize="7" fontWeight="900" fill={color}>TMI</text>
      <rect x="2" y="16" width="18" height="8" rx="4" fill={color === "#fbbf24" ? "#f59e0b" : color} />
      <rect x="44" y="16" width="18" height="8" rx="4" fill={color === "#fbbf24" ? "#f59e0b" : color} />
    </svg>
  );
}

/* ─── Main component ─────────────────────────────────────────────────────── */
export default function TMIWinnerCelebration({
  payload,
  onClose,
  autoCloseMs = 8000,
}: {
  payload: WinnerPayload;
  onClose?: () => void;
  autoCloseMs?: number;
}) {
  const [phase, setPhase] = useState<"intro" | "reveal" | "stats" | "done">("intro");
  const [particlesRunning, setParticlesRunning] = useState(false);

  const theme = getNextTheme(payload.theme);
  const themeData = THEMES[theme];
  const tierColor = TIER_COLORS[payload.winnerTier];
  const showCrown =
    payload.celebType === "battle" ||
    (payload.celebType === "championship") ||
    payload.isBotGenerated;
  const showBelt = payload.celebType === "championship";
  const showRecordOnly =
    payload.celebType === "challenge" ||
    payload.celebType === "mini_challenge";

  /* Phase sequencing */
  useEffect(() => {
    playCelebration(themeData.sound);
    setParticlesRunning(true);

    const t1 = setTimeout(() => setPhase("reveal"), 800);
    const t2 = setTimeout(() => setPhase("stats"), 3200);
    const t3 = setTimeout(() => {
      setPhase("done");
      setParticlesRunning(false);
    }, autoCloseMs - 500);

    return () => { clearTimeout(t1); clearTimeout(t2); clearTimeout(t3); };
  }, []);

  return (
    <div
      className="fixed inset-0 z-[999] flex items-center justify-center overflow-hidden"
      style={{ background: themeData.bg }}
    >
      <ParticleCanvas theme={theme} running={particlesRunning} />

      {/* Glow backdrop */}
      <div
        className="absolute inset-0 opacity-20 pointer-events-none"
        style={{
          background: `radial-gradient(circle at 50% 50%, ${themeData.glow} 0%, transparent 70%)`,
        }}
      />

      {/* Content */}
      <div className="relative z-10 flex flex-col items-center gap-4 px-6 text-center max-w-sm w-full">

        {/* Theme label */}
        <div
          className={`text-[9px] font-black tracking-[0.3em] uppercase transition-all duration-700 ${phase === "intro" ? "opacity-0 scale-75" : "opacity-60 scale-100"}`}
          style={{ color: themeData.glow }}
        >
          {themeData.name} CEREMONY
        </div>

        {/* Trophy item */}
        <div
          className={`transition-all duration-700 ${phase !== "intro" ? "opacity-100 scale-100" : "opacity-0 scale-50"}`}
        >
          {showBelt ? (
            <div className="flex flex-col items-center gap-2">
              <Belt color={tierColor.primary} />
              <p className="text-[9px] font-black uppercase tracking-wider text-white/50">
                8-Week Championship Belt
              </p>
              <p className="text-[8px] text-white/30">
                (can be taken by next challenger)
              </p>
            </div>
          ) : showCrown ? (
            <div className="flex flex-col items-center gap-2">
              <Crown
                color={tierColor.primary}
                size={64}
                limited={!!payload.limitedEditionCrownId}
              />
              {payload.limitedEditionCrownId && (
                <p className="text-[8px] font-black text-red-400 uppercase">
                  Limited Edition Crown — {payload.limitedEditionCrownId}
                </p>
              )}
              <p className="text-[9px] text-white/40 capitalize">{tierColor.label} Tier Crown</p>
            </div>
          ) : (
            <div className="text-5xl">🏅</div>
          )}
        </div>

        {/* Winner name */}
        <div
          className={`transition-all duration-500 ${phase !== "intro" ? "opacity-100 translate-y-0" : "opacity-0 translate-y-8"}`}
        >
          <p className="text-[10px] text-white/40 uppercase tracking-widest mb-1">Winner</p>
          <h1
            className="text-3xl font-black tracking-tight"
            style={{ color: themeData.glow, textShadow: `0 0 30px ${themeData.glow}` }}
          >
            {payload.winnerName}
          </h1>
          <p className="text-sm text-white/60 mt-1">
            {payload.crowdVotePercent}% crowd vote
          </p>
          {payload.prizePool && (
            <p className="text-xs font-black text-yellow-400 mt-1">
              Prize: {payload.prizePool}
            </p>
          )}
        </div>

        {/* Stats (phase 2) */}
        {phase === "stats" && (
          <div
            className="w-full space-y-3 animate-[fadeIn_0.5s_ease-out]"
          >
            {/* Combat record */}
            <div
              className="border rounded-xl p-3 grid grid-cols-3 gap-2 text-center"
              style={{ borderColor: themeData.glow + "40", background: themeData.glow + "08" }}
            >
              <div>
                <p className="text-lg font-black text-green-400">{payload.winnerRecord.wins}</p>
                <p className="text-[8px] text-white/30 uppercase">Wins</p>
              </div>
              <div>
                <p className="text-lg font-black text-red-400">{payload.winnerRecord.losses}</p>
                <p className="text-[8px] text-white/30 uppercase">Losses</p>
              </div>
              <div>
                <p className="text-lg font-black" style={{ color: tierColor.primary }}>
                  {payload.winnerRecord.currentStreak}
                </p>
                <p className="text-[8px] text-white/30 uppercase">Streak</p>
              </div>
            </div>

            {/* Fan stakes */}
            {payload.fansStaked && (
              <div
                className="border rounded-xl p-2.5 text-[10px]"
                style={{ borderColor: themeData.glow + "30" }}
              >
                <p className="font-black text-white/70">{payload.fansStaked.message}</p>
                {payload.fansStaked.fansGained !== undefined && (
                  <p className="text-green-400 mt-0.5">
                    +{payload.fansStaked.fansGained} fans transferred
                  </p>
                )}
                {payload.fansStaked.fansLost !== undefined && (
                  <p className="text-red-400 mt-0.5 text-[9px]">
                    {payload.loserName} lost {payload.fansStaked.fansLost} fans
                  </p>
                )}
              </div>
            )}

            {showRecordOnly && (
              <p className="text-[9px] text-white/30 text-center">
                Win record updated on profile · No crown for this event type
              </p>
            )}
          </div>
        )}

        {/* Close */}
        {(phase === "stats" || phase === "done") && (
          <button
            onClick={onClose}
            className="text-[9px] font-black uppercase tracking-wider text-white/30 hover:text-white/60 transition-colors mt-2"
          >
            Continue →
          </button>
        )}
      </div>

      <style>{`
        @keyframes fadeIn {
          from { opacity: 0; transform: translateY(12px); }
          to   { opacity: 1; transform: translateY(0); }
        }
      `}</style>
    </div>
  );
}
