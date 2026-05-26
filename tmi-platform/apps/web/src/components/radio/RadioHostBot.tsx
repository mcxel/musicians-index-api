"use client";

import { useEffect } from "react";
import { AnimatePresence, motion } from "framer-motion";
import type { RadioLine } from "@/lib/radio/RadioHostEngine";

interface RadioHostBotProps {
  line: RadioLine | null;
  onClear: () => void;
}

export default function RadioHostBot({ line, onClear }: RadioHostBotProps) {
  useEffect(() => {
    if (!line) return;
    const t = setTimeout(onClear, 9000);
    return () => clearTimeout(t);
  }, [line, onClear]);

  return (
    <div style={{
      position: "fixed",
      bottom: 100,
      left: 24,
      zIndex: 8000,
      maxWidth: 320,
      pointerEvents: line ? "auto" : "none",
    }}>
      <AnimatePresence mode="wait">
        {line && (
          <motion.div
            key={line.ts}
            initial={{ opacity: 0, y: 14, scale: 0.93 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 8, scale: 0.96 }}
            transition={{ duration: 0.28, ease: "easeOut" }}
            style={{
              background: "rgba(5,5,16,0.97)",
              border: `1px solid ${line.color}55`,
              backdropFilter: "blur(14px)",
              padding: "12px 16px",
              boxShadow: `0 0 20px ${line.color}20, 0 8px 32px rgba(0,0,0,0.6)`,
              fontFamily: "'Inter',sans-serif",
            }}
          >
            {/* DJ chip */}
            <div style={{
              display: "flex",
              alignItems: "center",
              gap: 7,
              marginBottom: 8,
            }}>
              <span style={{ fontSize: 16 }}>{line.emoji}</span>
              <span style={{
                fontSize: 9, fontWeight: 900, letterSpacing: "0.2em",
                color: line.color, textTransform: "uppercase",
              }}>
                {line.djName}
              </span>
              <span style={{
                width: 5, height: 5, borderRadius: "50%",
                background: "#FF2020", display: "inline-block",
                boxShadow: "0 0 5px #FF2020",
                animation: "djBlink 1s step-end infinite",
              }} />
            </div>

            <style>{`@keyframes djBlink { 0%,49%{opacity:1} 50%,100%{opacity:0} }`}</style>

            {/* Speech text */}
            <div style={{
              fontSize: 12,
              color: "rgba(255,255,255,0.85)",
              lineHeight: 1.5,
              fontWeight: 500,
            }}>
              {line.text}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
