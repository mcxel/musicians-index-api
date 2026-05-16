"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import Link from "next/link";

const ROUTES = ["/cypher", "/battles", "/lobbies"];

export default function RandomJoinStar({
  mode = "cypher",
  accentColor = "#AA2DFF",
}: {
  mode?: "cypher" | "battle";
  accentColor?: string;
}) {
  const [burst, setBurst] = useState(false);
  const battleColor = "#CC0000";
  const color = mode === "cypher" ? accentColor : battleColor;
  const href = mode === "cypher" ? "/cypher" : "/battles";
  const label = mode === "cypher" ? "JOIN RANDOM CYPHER" : "JOIN RANDOM BATTLE";

  function handleClick() {
    setBurst(true);
    setTimeout(() => setBurst(false), 650);
  }

  return (
    <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 3 }}>
      <Link href={href} style={{ textDecoration: "none" }} onClick={handleClick}>
        <div style={{ position: "relative", display: "flex", alignItems: "center", justifyContent: "center", width: 54, height: 54 }}>
          {/* Rays */}
          {[0, 40, 80, 120, 160, 200, 240, 280, 320].map((deg) => (
            <motion.div
              key={deg}
              animate={{ scale: [0.6, 1.1, 0.6], opacity: [0.2, 0.55, 0.2] }}
              transition={{ duration: 2.2, repeat: Infinity, delay: deg / 1800, ease: "easeInOut" }}
              style={{
                position: "absolute",
                width: 28, height: 1.5, borderRadius: 1,
                background: `linear-gradient(90deg, ${color}, transparent)`,
                transformOrigin: "0 50%", transform: `rotate(${deg}deg)`,
                left: "50%", top: "50%",
              }}
            />
          ))}
          {/* Rings */}
          {[50, 60].map((sz) => (
            <motion.div
              key={sz}
              animate={{ scale: [1, 1.2, 1], opacity: [0.25, 0.5, 0.25] }}
              transition={{ duration: 1.8 + sz / 60, repeat: Infinity, ease: "easeInOut" }}
              style={{ position: "absolute", width: sz, height: sz, borderRadius: "50%", border: `1px solid ${color}44` }}
            />
          ))}
          {/* Core */}
          <motion.div
            animate={{ scale: [1, 1.08, 1], boxShadow: [`0 0 10px ${color}44`, `0 0 22px ${color}88`, `0 0 10px ${color}44`] }}
            whileHover={{ scale: 1.14 }}
            whileTap={{ scale: 0.9 }}
            transition={{ duration: 1.5, repeat: Infinity, ease: "easeInOut" }}
            style={{
              position: "relative", zIndex: 2, width: 42, height: 42, borderRadius: "50%",
              background: `radial-gradient(circle, ${color}44, ${color}1a)`,
              border: `2px solid ${color}88`,
              display: "flex", alignItems: "center", justifyContent: "center",
              cursor: "pointer", fontSize: mode === "cypher" ? 18 : 16,
            }}
          >
            {mode === "cypher" ? "⬤" : "⚔️"}
          </motion.div>
          {/* Burst */}
          <AnimatePresence>
            {burst && (
              <motion.div
                key="burst"
                initial={{ scale: 0.7, opacity: 0.85 }}
                animate={{ scale: 2.4, opacity: 0 }}
                transition={{ duration: 0.5, ease: "easeOut" }}
                style={{ position: "absolute", inset: -4, borderRadius: "50%", border: `1.5px solid ${color}`, pointerEvents: "none" }}
              />
            )}
          </AnimatePresence>
        </div>
      </Link>
      <span style={{ fontSize: 5, fontWeight: 900, letterSpacing: "0.2em", color, textTransform: "uppercase", textAlign: "center" }}>
        {label}
      </span>
    </div>
  );
}
