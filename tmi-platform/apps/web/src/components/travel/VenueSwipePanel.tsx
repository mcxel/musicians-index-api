"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { VENUE_PBR_MANIFESTS } from "@/lib/materials/AssetRegistry";

export interface VenueSwipePanelProps {
  currentVenueId: string;
  onSelectVenue: (venueId: string, venueName: string) => void;
  onOpenAvatarStudio?: () => void;
}

export default function VenueSwipePanel({
  currentVenueId,
  onSelectVenue,
  onOpenAvatarStudio,
}: VenueSwipePanelProps) {
  const [isOpen, setIsOpen] = useState(false);
  const venues = Object.values(VENUE_PBR_MANIFESTS);

  return (
    <>
      {/* Edge Handle Trigger Button */}
      <button
        onClick={() => setIsOpen(true)}
        style={{
          position: "fixed",
          right: 0,
          top: "40%",
          transform: "translateY(-50%)",
          zIndex: 99800,
          background: "linear-gradient(135deg, #FF2DAA, #AA2DFF)",
          color: "#fff",
          border: "none",
          borderTopLeftRadius: 12,
          borderBottomLeftRadius: 12,
          padding: "12px 6px",
          cursor: "pointer",
          boxShadow: "-4px 0 16px rgba(255,45,170,0.5)",
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          gap: 6,
        }}
        title="Open Venue Swipe Directory"
      >
        <span style={{ fontSize: 14 }}>🚀</span>
        <span style={{ fontSize: 8, fontWeight: 900, writingMode: "vertical-rl", letterSpacing: "0.15em" }}>
          SWIPE VENUES
        </span>
      </button>

      {/* Swipe Panel Overlay */}
      <AnimatePresence>
        {isOpen && (
          <div style={{ position: "fixed", inset: 0, zIndex: 99850, display: "flex", justifyContent: "flex-end" }}>
            {/* Backdrop */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setIsOpen(false)}
              style={{ position: "absolute", inset: 0, background: "rgba(5,5,16,0.7)", backdropFilter: "blur(8px)" }}
            />

            {/* Sliding Panel */}
            <motion.div
              initial={{ x: "100%" }}
              animate={{ x: 0 }}
              exit={{ x: "100%" }}
              transition={{ type: "spring", damping: 25, stiffness: 280 }}
              style={{
                position: "relative",
                width: "100%",
                maxWidth: 380,
                height: "100%",
                background: "#060614",
                borderLeft: "1.5px solid rgba(255,45,170,0.3)",
                boxShadow: "-20px 0 50px rgba(0,0,0,0.9)",
                display: "flex",
                flexDirection: "column",
                zIndex: 99851,
                color: "#fff",
                fontFamily: "'Inter', sans-serif",
              }}
            >
              {/* Header */}
              <div style={{ padding: "16px 20px", borderBottom: "1px solid rgba(255,255,255,0.08)", display: "flex", alignItems: "center", justifyContent: "space-between" }}>
                <div>
                  <div style={{ fontSize: 9, letterSpacing: "0.2em", color: "#FF2DAA", fontWeight: 900 }}>FAN VENUE SWIPE DIRECTORY</div>
                  <div style={{ fontSize: 16, fontWeight: 900, color: "#fff", margin: "2px 0 0" }}>Travel to 3D Venue</div>
                </div>
                <button
                  onClick={() => setIsOpen(false)}
                  style={{ background: "rgba(255,255,255,0.06)", border: "1px solid rgba(255,255,255,0.12)", color: "#fff", borderRadius: 8, padding: "6px 12px", cursor: "pointer", fontSize: 14 }}
                >
                  ✕
                </button>
              </div>

              {/* Horizontal / Vertical Discovery List */}
              <div style={{ flex: 1, overflowY: "auto", padding: 16, display: "flex", flexDirection: "column", gap: 12 }}>
                {venues.map((v) => {
                  const isCurrent = v.id === currentVenueId;
                  return (
                    <div
                      key={v.id}
                      onClick={() => {
                        if (!isCurrent) {
                          onSelectVenue(v.id, v.name);
                          setIsOpen(false);
                        }
                      }}
                      style={{
                        padding: 14,
                        borderRadius: 14,
                        background: isCurrent ? "rgba(0,255,255,0.1)" : "rgba(255,255,255,0.03)",
                        border: isCurrent ? "1.5px solid #00FFFF" : "1px solid rgba(255,255,255,0.08)",
                        cursor: isCurrent ? "default" : "pointer",
                        transition: "all 0.15s ease",
                      }}
                    >
                      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
                        <div style={{ fontSize: 13, fontWeight: 900, color: "#fff" }}>{v.name}</div>
                        {isCurrent ? (
                          <span style={{ fontSize: 8, fontWeight: 900, color: "#00FFFF", background: "rgba(0,255,255,0.15)", padding: "2px 6px", borderRadius: 4 }}>
                            CURRENT LOCATION
                          </span>
                        ) : (
                          <span style={{ fontSize: 8, fontWeight: 900, color: "#FFD700", background: "rgba(255,215,0,0.15)", padding: "2px 6px", borderRadius: 4 }}>
                            WARP HERE 🚀
                          </span>
                        )}
                      </div>
                      <div style={{ fontSize: 10, color: "rgba(255,255,255,0.5)", marginTop: 4 }}>
                        {v.description}
                      </div>
                    </div>
                  );
                })}
              </div>

              {/* Footer Actions */}
              <div style={{ padding: "16px", borderTop: "1px solid rgba(255,255,255,0.08)", display: "flex", flexDirection: "column", gap: 8 }}>
                {onOpenAvatarStudio && (
                  <button
                    onClick={() => {
                      setIsOpen(false);
                      onOpenAvatarStudio();
                    }}
                    style={{
                      width: "100%",
                      padding: "10px",
                      borderRadius: 10,
                      background: "linear-gradient(135deg, #FFD700, #FF9500)",
                      border: "none",
                      color: "#050510",
                      fontSize: 11,
                      fontWeight: 900,
                      cursor: "pointer",
                    }}
                  >
                    🎨 Change Outfit / Avatar Studio
                  </button>
                )}
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </>
  );
}
