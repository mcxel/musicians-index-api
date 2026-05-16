"use client";

import { useEffect, useRef, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  generateCeremonyScript,
  getCeremonyTiming,
  type WinnerCeremonyData,
  type CeremonyScript,
} from "@/lib/winners/WinnerCeremonyEngine";

interface Props {
  winner: WinnerCeremonyData;
  onClose?: () => void;
  autoClose?: boolean;
}

type Phase =
  | "idle"
  | "opening"
  | "crown"
  | "hype"
  | "celebration"
  | "camera-pick"
  | "closing"
  | "fade-out";

// Confetti particle system
function ConfettiParticles({ style }: { style: CeremonyScript["confettiStyle"] }) {
  const colors: Record<CeremonyScript["confettiStyle"], string[]> = {
    "gold-burst":     ["#FFD700", "#FFA500", "#FFE066", "#FF8C00"],
    "rainbow-fall":   ["#FF2DAA", "#00FFFF", "#FFD700", "#AA2DFF", "#FF6B35"],
    "neon-spray":     ["#00FFFF", "#FF2DAA", "#00FF88", "#AA2DFF"],
    "cyan-firework":  ["#00FFFF", "#8FFFFF", "#00D4CC", "#AFFFFF"],
    "purple-rain":    ["#AA2DFF", "#CC77FF", "#7B00FF", "#E077FF"],
  };
  const palette = colors[style];

  return (
    <div className="pointer-events-none absolute inset-0 overflow-hidden">
      {Array.from({ length: 60 }).map((_, i) => {
        const color = palette[i % palette.length];
        const left = `${(i * 17.3) % 100}%`;
        const delay = (i * 0.07) % 1.4;
        const size = 6 + (i % 5) * 3;
        const duration = 2.2 + (i % 4) * 0.4;
        return (
          <motion.div
            key={i}
            initial={{ y: -20, x: 0, opacity: 1, rotate: 0 }}
            animate={{
              y: ["0%", "100vh"],
              x: [0, ((i % 2 === 0 ? 1 : -1) * (30 + (i % 40)))],
              opacity: [1, 1, 0],
              rotate: [0, 360 * (i % 2 === 0 ? 1 : -1)],
            }}
            transition={{ duration, delay, ease: "easeIn", repeat: Infinity, repeatDelay: 0.8 }}
            style={{
              position: "absolute",
              left,
              top: 0,
              width: size,
              height: size * 0.4,
              background: color,
              borderRadius: 2,
            }}
          />
        );
      })}
    </div>
  );
}

// Camera pick spotlight effect
function CameraPickEffect({ effect }: { effect: CeremonyScript["cameraEffect"] }) {
  const gradients: Record<CeremonyScript["cameraEffect"], string> = {
    "spotlight":    "radial-gradient(ellipse 45% 55% at 50% 40%, rgba(0,255,255,0.18) 0%, transparent 70%)",
    "zoom-in":      "radial-gradient(circle 35% at 50% 50%, rgba(255,215,0,0.22) 0%, transparent 70%)",
    "pan-reveal":   "linear-gradient(90deg, transparent 0%, rgba(170,45,255,0.15) 50%, transparent 100%)",
    "orbit":        "radial-gradient(ellipse 60% 40% at 50% 50%, rgba(255,45,170,0.18) 0%, transparent 70%)",
    "flash-reveal": "radial-gradient(circle 50% at 50% 45%, rgba(255,255,255,0.12) 0%, transparent 60%)",
  };

  return (
    <motion.div
      className="pointer-events-none absolute inset-0"
      initial={{ opacity: 0 }}
      animate={{ opacity: [0, 1, 0.7, 1, 0.5, 0] }}
      transition={{ duration: 3.5, ease: "easeInOut" }}
      style={{ background: gradients[effect] }}
    />
  );
}

export default function WinnerCeremonyOverlay({ winner, onClose, autoClose = true }: Props) {
  const [script, setScript] = useState<CeremonyScript | null>(null);
  const [phase, setPhase] = useState<Phase>("idle");
  const [hypeIndex, setHypeIndex] = useState(0);
  const [showCamera, setShowCamera] = useState(false);
  const [visible, setVisible] = useState(true);
  const timers = useRef<ReturnType<typeof setTimeout>[]>([]);

  useEffect(() => {
    const s = generateCeremonyScript(winner);
    const t = getCeremonyTiming(s);
    setScript(s);

    const add = (fn: () => void, ms: number) => {
      timers.current.push(setTimeout(fn, ms));
    };

    add(() => setPhase("opening"), t.openAt);
    add(() => setPhase("crown"), t.crownAt);
    add(() => setPhase("hype"), t.hypeLinesAt);
    add(() => { setHypeIndex(1); }, t.hypeLinesAt + 1100);
    add(() => { setHypeIndex(2); }, t.hypeLinesAt + 2200);
    add(() => setPhase("celebration"), t.celebrationAt);
    add(() => { setShowCamera(true); setPhase("camera-pick"); }, t.cameraPickAt);
    add(() => { setShowCamera(false); }, t.cameraPickEnd);
    add(() => setPhase("closing"), t.closingAt);

    if (autoClose) {
      add(() => { setPhase("fade-out"); }, t.fadeOutAt);
      add(() => { setVisible(false); onClose?.(); }, t.totalDurationMs);
    }

    return () => { timers.current.forEach(clearTimeout); };
  }, []);

  if (!visible || !script) return null;

  const timing = getCeremonyTiming(script);

  return (
    <AnimatePresence>
      <motion.div
        key="ceremony"
        initial={{ opacity: 0 }}
        animate={{ opacity: phase === "fade-out" ? 0 : 1 }}
        exit={{ opacity: 0 }}
        transition={{ duration: 1.2 }}
        className="fixed inset-0 z-[9999] flex flex-col items-center justify-center overflow-hidden"
        style={{ background: "rgba(5,5,16,0.96)" }}
      >
        {/* Confetti */}
        <AnimatePresence>
          {(phase === "celebration" || phase === "camera-pick" || phase === "closing") && (
            <ConfettiParticles style={script.confettiStyle} />
          )}
        </AnimatePresence>

        {/* Camera pick effect */}
        <AnimatePresence>
          {showCamera && <CameraPickEffect effect={script.cameraEffect} />}
        </AnimatePresence>

        {/* Ambient glow ring */}
        <motion.div
          className="absolute rounded-full pointer-events-none"
          style={{
            width: 600, height: 600,
            background: "radial-gradient(circle, rgba(0,255,255,0.06) 0%, rgba(255,45,170,0.04) 50%, transparent 70%)",
          }}
          animate={{ scale: [1, 1.08, 1], rotate: [0, 360] }}
          transition={{ duration: 8, repeat: Infinity, ease: "linear" }}
        />

        <div className="relative z-10 flex flex-col items-center text-center px-8 max-w-2xl w-full gap-6">

          {/* Opening line */}
          <AnimatePresence>
            {(phase === "opening" || phase === "crown" || phase === "hype" || phase === "celebration" || phase === "camera-pick" || phase === "closing") && (
              <motion.p
                key="opening"
                initial={{ opacity: 0, y: -20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.7 }}
                className="text-xs font-mono tracking-[0.3em] uppercase"
                style={{ color: "#00FFFF" }}
              >
                {script.openingLine}
              </motion.p>
            )}
          </AnimatePresence>

          {/* Crown line + winner name */}
          <AnimatePresence>
            {(phase === "crown" || phase === "hype" || phase === "celebration" || phase === "camera-pick" || phase === "closing") && (
              <motion.div
                key="crown-block"
                initial={{ opacity: 0, scale: 0.8 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ duration: 0.8, type: "spring", stiffness: 160 }}
                className="flex flex-col items-center gap-2"
              >
                <p className="text-sm text-white/60">{script.crownLine}</p>
                <motion.h1
                  className="font-black leading-none"
                  style={{
                    fontSize: "clamp(2.4rem, 7vw, 5rem)",
                    background: "linear-gradient(135deg, #FFD700 0%, #FF6B35 40%, #FF2DAA 70%, #00FFFF 100%)",
                    WebkitBackgroundClip: "text",
                    WebkitTextFillColor: "transparent",
                  }}
                  animate={{ scale: [1, 1.03, 1] }}
                  transition={{ duration: 2, repeat: Infinity }}
                >
                  {winner.winnerName}
                </motion.h1>
                <motion.div
                  className="flex items-center gap-3"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ delay: 0.4 }}
                >
                  <span className="text-sm text-white/50">{winner.contestName}</span>
                  <span className="text-base">{winner.badge ?? "🏆"}</span>
                  <span
                    className="text-xs px-3 py-1 rounded-full font-bold"
                    style={{ background: "rgba(255,215,0,0.15)", color: "#FFD700", border: "1px solid rgba(255,215,0,0.4)" }}
                  >
                    {winner.prize}
                  </span>
                </motion.div>
              </motion.div>
            )}
          </AnimatePresence>

          {/* Hype lines */}
          <AnimatePresence mode="wait">
            {(phase === "hype" || phase === "celebration" || phase === "camera-pick") && (
              <motion.p
                key={`hype-${hypeIndex}`}
                initial={{ opacity: 0, x: -30 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: 30 }}
                transition={{ duration: 0.5 }}
                className="text-base font-semibold text-white/80"
              >
                {script.hypeLines[hypeIndex]}
              </motion.p>
            )}
          </AnimatePresence>

          {/* Celebration burst */}
          <AnimatePresence>
            {(phase === "celebration" || phase === "camera-pick" || phase === "closing") && (
              <motion.div
                key="celebration"
                initial={{ opacity: 0, scale: 0.6 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0 }}
                transition={{ duration: 0.5, type: "spring", stiffness: 200 }}
                className="flex flex-wrap gap-2 justify-center"
              >
                {script.celebrationPhrases.map((phrase, i) => (
                  <motion.span
                    key={phrase}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: i * 0.15 }}
                    className="text-sm font-black px-4 py-2 rounded-full"
                    style={{
                      background: i === 0
                        ? "rgba(255,215,0,0.2)"
                        : i === 1
                          ? "rgba(0,255,255,0.15)"
                          : "rgba(255,45,170,0.15)",
                      color: i === 0 ? "#FFD700" : i === 1 ? "#00FFFF" : "#FF2DAA",
                      border: `1px solid ${i === 0 ? "#FFD70050" : i === 1 ? "#00FFFF50" : "#FF2DAA50"}`,
                    }}
                  >
                    {phrase}
                  </motion.span>
                ))}
              </motion.div>
            )}
          </AnimatePresence>

          {/* Camera pick indicator */}
          <AnimatePresence>
            {showCamera && (
              <motion.div
                key="camera"
                initial={{ opacity: 0, y: 20, scale: 0.8 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                exit={{ opacity: 0, scale: 0.8, y: -20 }}
                transition={{ duration: 0.5 }}
                className="flex items-center gap-3 px-5 py-3 rounded-2xl"
                style={{
                  background: "rgba(0,255,255,0.08)",
                  border: "1px solid rgba(0,255,255,0.35)",
                }}
              >
                <motion.span
                  className="text-lg"
                  animate={{ scale: [1, 1.3, 1] }}
                  transition={{ duration: 0.8, repeat: Infinity }}
                >
                  📸
                </motion.span>
                <span className="text-xs font-mono tracking-widest" style={{ color: "#00FFFF" }}>
                  RECORDING · FINISH STRONG
                </span>
                <motion.div
                  className="w-2 h-2 rounded-full"
                  style={{ background: "#FF2DAA" }}
                  animate={{ opacity: [1, 0, 1] }}
                  transition={{ duration: 0.7, repeat: Infinity }}
                />
              </motion.div>
            )}
          </AnimatePresence>

          {/* Closing line */}
          <AnimatePresence>
            {phase === "closing" && (
              <motion.p
                key="closing"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.8 }}
                className="text-xs text-white/40 font-mono"
              >
                {script.closingLine}
              </motion.p>
            )}
          </AnimatePresence>

          {/* Manual close button */}
          {!autoClose && (
            <motion.button
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 2 }}
              onClick={() => { setVisible(false); onClose?.(); }}
              className="text-xs font-mono text-white/30 hover:text-white/60 transition-colors mt-4"
            >
              close ceremony
            </motion.button>
          )}
        </div>

        {/* Bottom genre badge */}
        <AnimatePresence>
          {(phase === "crown" || phase === "hype" || phase === "celebration" || phase === "camera-pick" || phase === "closing") && (
            <motion.div
              key="genre-badge"
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3, duration: 0.6 }}
              className="absolute bottom-8 left-1/2 -translate-x-1/2 flex items-center gap-3"
            >
              <span className="text-xs font-mono tracking-[0.2em] text-white/30">
                THE MUSICIAN&apos;S INDEX
              </span>
              <span
                className="text-xs px-3 py-1 rounded-full"
                style={{ background: "rgba(255,255,255,0.05)", color: "rgba(255,255,255,0.4)", border: "1px solid rgba(255,255,255,0.1)" }}
              >
                {winner.genre}
              </span>
            </motion.div>
          )}
        </AnimatePresence>
      </motion.div>
    </AnimatePresence>
  );
}
