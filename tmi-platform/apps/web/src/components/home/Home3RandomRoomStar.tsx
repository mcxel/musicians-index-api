"use client";

import { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import Link from "next/link";

const RANDOM_ROOMS = ["/cypher", "/battles", "/lobbies"];

export default function Home3RandomRoomStar({ accentColor = "#FF2DAA" }: { accentColor?: string }) {
  const [popped, setPopped] = useState(false);
  const [roomIndex, setRoomIndex] = useState(0);

  useEffect(() => {
    setRoomIndex(Math.floor(Math.random() * RANDOM_ROOMS.length));
  }, []);

  function handleClick() {
    setPopped(true);
    setTimeout(() => setPopped(false), 700);
  }

  const href = RANDOM_ROOMS[roomIndex]!;

  return (
    <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 4, padding: "4px 0" }}>
      <Link href={href} style={{ textDecoration: "none" }} onClick={handleClick}>
        <div style={{ position: "relative", display: "flex", alignItems: "center", justifyContent: "center" }}>
          {/* Burst rays */}
          {[0, 45, 90, 135, 180, 225, 270, 315].map((deg) => (
            <motion.div
              key={deg}
              animate={{ scale: [0.7, 1.15, 0.7], opacity: [0.25, 0.65, 0.25] }}
              transition={{ duration: 2.4, repeat: Infinity, delay: deg / 1440, ease: "easeInOut" }}
              style={{
                position: "absolute",
                width: 32, height: 2, borderRadius: 1,
                background: `linear-gradient(90deg, ${accentColor}, transparent)`,
                transformOrigin: "0 50%",
                transform: `rotate(${deg}deg)`,
                left: "50%", top: "50%",
              }}
            />
          ))}

          {/* Outer ring */}
          <motion.div
            animate={{ scale: [1, 1.18, 1], opacity: [0.3, 0.6, 0.3] }}
            transition={{ duration: 1.8, repeat: Infinity, ease: "easeInOut" }}
            style={{
              position: "absolute",
              width: 58, height: 58, borderRadius: "50%",
              border: `1.5px solid ${accentColor}55`,
            }}
          />

          {/* Core star button */}
          <motion.div
            animate={{ scale: [1, 1.06, 1], boxShadow: [`0 0 12px ${accentColor}44`, `0 0 24px ${accentColor}88`, `0 0 12px ${accentColor}44`] }}
            whileHover={{ scale: 1.12 }}
            whileTap={{ scale: 0.92 }}
            transition={{ duration: 1.6, repeat: Infinity, ease: "easeInOut" }}
            style={{
              position: "relative", zIndex: 2,
              width: 46, height: 46, borderRadius: "50%",
              background: `radial-gradient(circle, ${accentColor}44 0%, ${accentColor}1a 100%)`,
              border: `2px solid ${accentColor}88`,
              display: "flex", alignItems: "center", justifyContent: "center",
              cursor: "pointer",
            }}
          >
            <span style={{ fontSize: 18, lineHeight: 1 }}>⭐</span>
          </motion.div>

          {/* Pop burst */}
          <AnimatePresence>
            {popped && (
              <motion.div
                initial={{ scale: 0.6, opacity: 0.9 }}
                animate={{ scale: 2.2, opacity: 0 }}
                exit={{}}
                transition={{ duration: 0.55, ease: "easeOut" }}
                style={{
                  position: "absolute", inset: -4, borderRadius: "50%",
                  border: `1.5px solid ${accentColor}`,
                  pointerEvents: "none",
                }}
              />
            )}
          </AnimatePresence>
        </div>
      </Link>
      <span style={{ fontSize: 6, fontWeight: 900, letterSpacing: "0.2em", color: accentColor, textTransform: "uppercase", textAlign: "center" }}>
        JOIN RANDOM ROOM
      </span>
    </div>
  );
}
