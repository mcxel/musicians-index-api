"use client";

import { useState, useEffect, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import Link from "next/link";
import {
  pickNextRotationItem,
  getSeasonPassItem,
  getRotationInterval,
  getRecentNotifications,
  type StoreRotationItem,
  type UnlockNotification,
} from "@/lib/gamification/SeasonPassDisplayEngine";
import { getMockProgressionSnapshot } from "@/lib/gamification/SeasonPassProgressionEngine";
import { getActiveSkin } from "@/lib/gamification/SeasonPassSkinEngine";

// ── Sub-components ────────────────────────────────────────────────────────────

function GlowPedestal({ color }: { color: string }) {
  return (
    <>
      {/* Floor pedestal glow */}
      <motion.div
        animate={{ opacity: [0.2, 0.5, 0.2], scaleX: [0.85, 1.1, 0.85] }}
        transition={{ duration: 2.8, repeat: Infinity, ease: "easeInOut" }}
        style={{
          position: "absolute",
          bottom: 8, left: "50%", transform: "translateX(-50%)",
          width: 90, height: 8, borderRadius: "50%",
          background: `radial-gradient(ellipse, ${color}88 0%, transparent 70%)`,
          pointerEvents: "none",
        }}
      />
      {/* Background polygon sparks */}
      {[0, 1, 2, 3].map((i) => (
        <motion.div
          key={i}
          animate={{
            opacity: [0, 0.7, 0],
            scale: [0.4, 1.4, 0.4],
            x: [(i % 2 === 0 ? -1 : 1) * 12, (i % 2 === 0 ? 1 : -1) * 8, (i % 2 === 0 ? -1 : 1) * 12],
            y: [0, -18 - i * 6, 0],
          }}
          transition={{ duration: 1.8 + i * 0.4, repeat: Infinity, delay: i * 0.6, ease: "easeOut" }}
          style={{
            position: "absolute",
            bottom: 14 + i * 12, left: `${22 + i * 18}%`,
            width: 4 + (i % 2) * 2, height: 4 + (i % 2) * 2,
            borderRadius: i % 2 === 0 ? "50%" : 2,
            background: color,
            boxShadow: `0 0 8px ${color}`,
            pointerEvents: "none",
          }}
        />
      ))}
      {/* Lightning streak */}
      <motion.div
        animate={{ opacity: [0, 0.4, 0], x: [-20, 20, -20] }}
        transition={{ duration: 3.2, repeat: Infinity, ease: "easeInOut", delay: 0.8 }}
        style={{
          position: "absolute", bottom: 22, left: "10%",
          width: "80%", height: 1,
          background: `linear-gradient(90deg, transparent, ${color}66, transparent)`,
          pointerEvents: "none",
        }}
      />
    </>
  );
}

function LightSweep({ color }: { color: string }) {
  return (
    <motion.div
      animate={{ x: ["-120%", "120%"] }}
      transition={{ duration: 2.4, repeat: Infinity, repeatDelay: 6, ease: "easeInOut" }}
      style={{
        position: "absolute", top: 0, left: 0,
        width: "50%", height: "100%",
        background: `linear-gradient(90deg, transparent, ${color}18, transparent)`,
        pointerEvents: "none",
        zIndex: 4,
        borderRadius: "inherit",
      }}
    />
  );
}

function LevelUpBurst({ level, color, onDone }: { level: number; color: string; onDone: () => void }) {
  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: [0, 1, 1, 0] }}
      transition={{ duration: 0.8, times: [0, 0.15, 0.7, 1] }}
      onAnimationComplete={onDone}
      style={{
        position: "absolute", inset: 0, zIndex: 20,
        display: "flex", alignItems: "center", justifyContent: "center",
        flexDirection: "column", gap: 4,
        background: `${color}22`,
        borderRadius: "inherit",
        backdropFilter: "blur(2px)",
      }}
    >
      <motion.div
        initial={{ scale: 0.4 }}
        animate={{ scale: [0.4, 1.3, 1.0] }}
        transition={{ duration: 0.5, ease: "easeOut" }}
        style={{ fontSize: 32, lineHeight: 1 }}
      >
        🔓
      </motion.div>
      <motion.div
        initial={{ y: 8, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ delay: 0.2, duration: 0.3 }}
        style={{ fontSize: 9, fontWeight: 900, letterSpacing: "0.22em", color, textTransform: "uppercase" }}
      >
        LEVEL {level} UNLOCKED
      </motion.div>
      {/* Burst rays */}
      {[0, 60, 120, 180, 240, 300].map((deg) => (
        <motion.div
          key={deg}
          initial={{ scale: 0, opacity: 0.8 }}
          animate={{ scale: [0, 1.6], opacity: [0.8, 0] }}
          transition={{ duration: 0.5, delay: 0.05 }}
          style={{
            position: "absolute", top: "50%", left: "50%",
            width: 60, height: 2,
            background: `linear-gradient(90deg, ${color}, transparent)`,
            transformOrigin: "0 50%",
            transform: `rotate(${deg}deg)`,
            pointerEvents: "none",
          }}
        />
      ))}
    </motion.div>
  );
}

function UnlockNotifTicker({ notifs }: { notifs: UnlockNotification[] }) {
  const [idx, setIdx] = useState(0);
  useEffect(() => {
    const t = setInterval(() => setIdx((i) => (i + 1) % notifs.length), 3500);
    return () => clearInterval(t);
  }, [notifs.length]);

  const notif = notifs[idx % notifs.length];
  if (!notif) return null;

  return (
    <AnimatePresence mode="wait">
      <motion.div
        key={idx}
        initial={{ opacity: 0, y: 4 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0, y: -4 }}
        transition={{ duration: 0.28 }}
        style={{
          display: "flex", alignItems: "center", gap: 5,
          padding: "4px 8px",
          borderRadius: 6,
          background: "rgba(0,0,0,0.4)",
          border: "1px solid rgba(255,255,255,0.07)",
        }}
      >
        <span style={{ fontSize: 8, color: "#FFD700" }}>🔔</span>
        <span style={{ fontSize: 7, color: "rgba(255,255,255,0.7)", fontWeight: 600, letterSpacing: "0.04em" }}>
          <strong style={{ color: "#fff" }}>{notif.performerName}</strong> unlocked {notif.rewardLabel}
        </span>
      </motion.div>
    </AnimatePresence>
  );
}

function ProgressBar({ pct, color }: { pct: number; color: string }) {
  return (
    <div style={{ height: 3, borderRadius: 2, background: "rgba(255,255,255,0.08)", overflow: "hidden" }}>
      <motion.div
        initial={{ width: "0%" }}
        animate={{ width: `${pct}%` }}
        transition={{ duration: 0.9, ease: "easeOut" }}
        style={{ height: "100%", borderRadius: 2, background: color, boxShadow: `0 0 6px ${color}` }}
      />
    </div>
  );
}

// ── Main component ────────────────────────────────────────────────────────────

export default function SeasonPassStoreCard() {
  const skin = getActiveSkin();
  const [currentItem, setCurrentItem] = useState<StoreRotationItem>(getSeasonPassItem());
  const [showLevelUp, setShowLevelUp] = useState(false);
  const [levelUpNum, setLevelUpNum] = useState(4);
  const [notifs] = useState<UnlockNotification[]>(getRecentNotifications(4));
  const snapshot = getMockProgressionSnapshot(3, "season-1");

  // Weighted rotation timer
  useEffect(() => {
    let timeoutId: ReturnType<typeof setTimeout>;
    const schedule = () => {
      timeoutId = setTimeout(() => {
        setCurrentItem((prev) => pickNextRotationItem(prev.id));
        schedule();
      }, getRotationInterval());
    };
    schedule();
    return () => clearTimeout(timeoutId);
  }, []);

  // Demo level-up burst every 18s
  useEffect(() => {
    const t = setInterval(() => {
      setLevelUpNum((n) => (n % 10) + 1);
      setShowLevelUp(true);
    }, 18000);
    return () => clearInterval(t);
  }, []);

  const accent = currentItem.type === "season_pass" ? skin.primaryColor : currentItem.accentColor;

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
      {/* Live unlock ticker */}
      {notifs.length > 0 && <UnlockNotifTicker notifs={notifs} />}

      {/* Main card */}
      <AnimatePresence mode="wait">
        <motion.div
          key={currentItem.id}
          initial={{ opacity: 0, scale: 0.92, rotateY: -12 }}
          animate={{ opacity: 1, scale: 1, rotateY: 0 }}
          exit={{ opacity: 0, scale: 0.94, rotateY: 12 }}
          transition={{ duration: 0.35, ease: "easeOut" }}
          whileHover={{ scale: 1.025, rotateZ: 0.8 }}
          style={{
            position: "relative", overflow: "hidden",
            borderRadius: 14,
            border: `1.5px solid ${accent}44`,
            background: `linear-gradient(135deg, ${accent}10 0%, rgba(0,0,0,0) 100%)`,
            minHeight: 130,
          }}
        >
          {/* Level-up burst overlay */}
          <AnimatePresence>
            {showLevelUp && (
              <LevelUpBurst
                level={levelUpNum}
                color={accent}
                onDone={() => setShowLevelUp(false)}
              />
            )}
          </AnimatePresence>

          {/* Ambient background glow */}
          <div style={{
            position: "absolute", inset: 0,
            background: `radial-gradient(ellipse 80% 70% at 50% 30%, ${accent}14 0%, transparent 70%)`,
            pointerEvents: "none",
          }} />

          {/* Confetti dots */}
          {[0, 1, 2, 3, 4].map((i) => (
            <motion.div
              key={i}
              animate={{ opacity: [0, 0.6, 0], y: [-2, -16 - i * 4, -2] }}
              transition={{ duration: 2.2 + i * 0.3, repeat: Infinity, delay: i * 0.5, ease: "easeOut" }}
              style={{
                position: "absolute",
                left: `${12 + i * 18}%`,
                bottom: 8,
                width: 3, height: 3,
                borderRadius: "50%",
                background: i % 2 === 0 ? accent : "#FFD700",
                pointerEvents: "none",
              }}
            />
          ))}

          {/* Light sweep */}
          <LightSweep color={accent} />

          {/* Pedestal */}
          <GlowPedestal color={accent} />

          {/* Content */}
          <div style={{ position: "relative", zIndex: 5, padding: "14px 14px 10px" }}>
            {/* Type badge */}
            <div style={{ fontSize: 6, fontWeight: 900, letterSpacing: "0.24em", color: accent, textTransform: "uppercase", marginBottom: 6 }}>
              {currentItem.type === "season_pass" ? `● SEASON ${skin.seasonNumber} PASS · ${skin.seasonName}` : `● STORE · ${currentItem.type.replace("_", " ").toUpperCase()}`}
            </div>

            <div style={{ display: "flex", alignItems: "flex-start", gap: 12 }}>
              {/* Floating instrument emoji */}
              <motion.div
                animate={{
                  y: [0, -6, 0],
                  rotate: currentItem.type === "season_pass" ? [-2, 2, -2] : [0, 0, 0],
                  filter: [`drop-shadow(0 0 8px ${accent}44)`, `drop-shadow(0 0 18px ${accent}88)`, `drop-shadow(0 0 8px ${accent}44)`],
                }}
                transition={{ duration: 3.6, repeat: Infinity, ease: "easeInOut" }}
                style={{ fontSize: 42, lineHeight: 1, flexShrink: 0, userSelect: "none" }}
              >
                {currentItem.emoji}
              </motion.div>

              <div style={{ flex: 1, minWidth: 0 }}>
                <div style={{ fontSize: 15, fontWeight: 900, color: "#fff", letterSpacing: "0.03em", marginBottom: 2 }}>
                  {currentItem.label}
                </div>
                <div style={{ fontSize: 8, color: "rgba(255,255,255,0.45)", marginBottom: 8 }}>
                  {currentItem.sublabel}
                </div>

                {/* Season pass progress bar (only on season pass item) */}
                {currentItem.type === "season_pass" && (
                  <div style={{ marginBottom: 8 }}>
                    <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 3 }}>
                      <span style={{ fontSize: 6, fontWeight: 900, color: accent, letterSpacing: "0.14em", textTransform: "uppercase" }}>
                        LEVEL {snapshot.currentLevel}
                      </span>
                      <span style={{ fontSize: 6, color: "rgba(255,255,255,0.35)", letterSpacing: "0.08em" }}>
                        {snapshot.xpEarned.toLocaleString()} XP
                      </span>
                    </div>
                    <ProgressBar pct={snapshot.progressPct} color={accent} />
                  </div>
                )}

                {/* Price + CTA */}
                <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                  <span style={{ fontSize: 14, fontWeight: 900, color: accent }}>{currentItem.price}</span>
                  <Link href={currentItem.href} style={{ textDecoration: "none" }}>
                    <motion.span
                      whileHover={{ scale: 1.06 }}
                      whileTap={{ scale: 0.96 }}
                      style={{
                        padding: "4px 12px", borderRadius: 999,
                        background: accent, color: "#000",
                        fontSize: 7, fontWeight: 900, letterSpacing: "0.16em", textTransform: "uppercase",
                        cursor: "pointer",
                      }}
                    >
                      {currentItem.type === "season_pass" ? "Get Pass" : "Shop →"}
                    </motion.span>
                  </Link>
                </div>
              </div>
            </div>
          </div>
        </motion.div>
      </AnimatePresence>

      {/* Season skin row — shows next 3 upcoming seasons */}
      <div style={{ display: "flex", gap: 5, alignItems: "center" }}>
        <span style={{ fontSize: 6, color: "rgba(255,255,255,0.22)", letterSpacing: "0.14em", textTransform: "uppercase", flexShrink: 0 }}>NEXT SEASONS</span>
        {[2, 3, 4].map((n) => {
          const s = ["🎷", "🎺", "🥁"][n - 2]!;
          const c = ["#00FFFF", "#FFD700", "#FF2DAA"][n - 2]!;
          return (
            <div
              key={n}
              style={{
                width: 24, height: 24, borderRadius: 6,
                border: `1px solid ${c}33`, background: `${c}0a`,
                display: "flex", alignItems: "center", justifyContent: "center",
                fontSize: 12,
              }}
            >
              {s}
            </div>
          );
        })}
        <Link href="/shop/season-pass" style={{ textDecoration: "none", marginLeft: "auto" }}>
          <span style={{ fontSize: 6, color: skin.primaryColor, fontWeight: 900, letterSpacing: "0.14em" }}>ALL SEASONS →</span>
        </Link>
      </div>
    </div>
  );
}
