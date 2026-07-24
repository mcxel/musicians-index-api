"use client";

import React, { useState, useEffect } from "react";
import { getHostById } from "@/lib/hosts/HostIdentityRegistry";
import MotionPortraitEngine from "@/components/avatar/MotionPortraitEngine";
import { motion, AnimatePresence } from "framer-motion";

interface HostPresenterProps {
  hostSlug: string;
  accentColor?: string;
  announcement?: string;
  mode?: "booth" | "hud" | "bubble-only";
}

export default function HostPresenter({
  hostSlug,
  accentColor = "#00FFFF",
  announcement,
  mode = "booth",
}: HostPresenterProps) {
  const host = getHostById(hostSlug);
  const [speechText, setSpeechText] = useState("");

  useEffect(() => {
    if (!host) return;
    setSpeechText(announcement || host.description);
  }, [hostSlug, announcement, host]);

  if (!host) {
    return (
      <div style={{ color: "#ff4444", fontSize: 10, fontWeight: "bold" }}>
        [Error: Host '{hostSlug}' not found in registry]
      </div>
    );
  }

  const encodedPortraitUrl = host.portraitUrl ? encodeURI(host.portraitUrl) : "/assets/hosts/bebo.webp";

  if (mode === "bubble-only") {
    return (
      <AnimatePresence mode="wait">
        {speechText && (
          <motion.div
            initial={{ opacity: 0, scale: 0.9, y: 10 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.9, y: 10 }}
            style={{
              background: "rgba(0, 0, 0, 0.9)",
              border: `1px solid ${accentColor}`,
              borderRadius: 12,
              padding: "10px 16px",
              boxShadow: `0 0 15px ${accentColor}33`,
              maxWidth: 240,
            }}
          >
            <div style={{ fontSize: 7, fontWeight: 900, color: accentColor, letterSpacing: "0.15em", textTransform: "uppercase", marginBottom: 3 }}>
              🎤 {host.name}
            </div>
            <p style={{ fontSize: 11, color: "#fff", lineHeight: 1.4, margin: 0 }}>
              "{speechText}"
            </p>
          </motion.div>
        )}
      </AnimatePresence>
    );
  }

  return (
    <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 14 }}>
      {/* Motion Avatar Frame */}
      <div style={{ transform: "translateY(0)" }}>
        <MotionPortraitEngine
          name={host.name}
          accent={accentColor}
          mode="circle"
          imageSrc={encodedPortraitUrl}
          showStatusLabel={false}
        />
      </div>

      {/* Speech dialogue bubble */}
      {speechText && (
        <motion.div
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          style={{
            background: "rgba(10, 10, 20, 0.92)",
            border: `1px solid ${accentColor}44`,
            borderRadius: 14,
            padding: "12px 18px",
            boxShadow: `0 4px 20px rgba(0,0,0,0.6)`,
            position: "relative",
            maxWidth: 320,
            textAlign: "center",
          }}
        >
          {/* Arrow pointing up to the avatar */}
          <div
            style={{
              position: "absolute",
              top: -6,
              left: "50%",
              transform: "translateX(-50%) rotate(45deg)",
              width: 10,
              height: 10,
              background: "rgba(10, 10, 20, 0.92)",
              borderTop: `1px solid ${accentColor}44`,
              borderLeft: `1px solid ${accentColor}44`,
            }}
          />

          <span style={{ fontSize: 7.5, fontWeight: 950, color: accentColor, letterSpacing: "0.2em", textTransform: "uppercase", display: "block", marginBottom: 4 }}>
            {host.name}
          </span>
          
          <p style={{ fontSize: 11, color: "rgba(255,255,255,0.9)", lineHeight: 1.4, margin: 0, fontStyle: "italic" }}>
            "{speechText}"
          </p>

          <span style={{ fontSize: 6.5, color: "rgba(255,255,255,0.25)", display: "block", marginTop: 6, textTransform: "uppercase", letterSpacing: "0.1em" }}>
            ROLE: {host.role}
          </span>
        </motion.div>
      )}
    </div>
  );
}
