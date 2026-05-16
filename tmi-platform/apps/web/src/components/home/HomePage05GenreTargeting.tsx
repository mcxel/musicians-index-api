"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";

type Genre = {
  id: string;
  label: string;
  accent: string;
  audienceSize: string;
  cpm: string;
};

const GENRES: Genre[] = [
  { id: "hip-hop",     label: "Hip-Hop",     accent: "#FF2DAA", audienceSize: "48K",  cpm: "$4.20" },
  { id: "battle-rap",  label: "Battle Rap",  accent: "#FFD700", audienceSize: "22K",  cpm: "$6.80" },
  { id: "cypher",      label: "Cypher",      accent: "#00FFFF", audienceSize: "31K",  cpm: "$5.10" },
  { id: "afrobeats",   label: "Afrobeats",   accent: "#AA2DFF", audienceSize: "19K",  cpm: "$3.90" },
  { id: "r-and-b",     label: "R&B",         accent: "#FF6B35", audienceSize: "27K",  cpm: "$4.60" },
  { id: "trap",        label: "Trap",        accent: "#00FF88", audienceSize: "35K",  cpm: "$3.70" },
  { id: "all-genres",  label: "All Genres",  accent: "#c4b5fd", audienceSize: "182K", cpm: "$2.90" },
];

export default function HomePage05GenreTargeting() {
  const [selected, setSelected] = useState<string[]>(["hip-hop"]);

  const toggle = (id: string) => {
    if (id === "all-genres") {
      setSelected(selected.includes("all-genres") ? [] : ["all-genres"]);
      return;
    }
    setSelected((prev) => {
      const without = prev.filter((x) => x !== "all-genres");
      return without.includes(id) ? without.filter((x) => x !== id) : [...without, id];
    });
  };

  const active = selected.length > 0
    ? GENRES.filter((g) => selected.includes(g.id))
    : [];

  const totalAudience = selected.includes("all-genres")
    ? "182K"
    : `${active.reduce((sum, g) => sum + parseInt(g.audienceSize.replace("K", "")), 0)}K`;

  const blendedCpm = active.length > 0
    ? `$${(active.reduce((sum, g) => sum + parseFloat(g.cpm.replace("$", "")), 0) / active.length).toFixed(2)}`
    : "—";

  return (
    <div style={{
      borderRadius: 10,
      border: "1px solid rgba(0,255,255,0.12)",
      background: "rgba(0,255,255,0.03)",
      padding: "10px 12px",
    }}>
      <div style={{ fontSize: 6, fontWeight: 900, letterSpacing: "0.24em", color: "#00FFFF", textTransform: "uppercase", marginBottom: 8 }}>
        GENRE TARGETING
      </div>

      {/* Genre pills */}
      <div style={{ display: "flex", gap: 4, flexWrap: "wrap", marginBottom: 10 }}>
        {GENRES.map((g) => {
          const isActive = selected.includes(g.id);
          return (
            <motion.button
              key={g.id}
              type="button"
              onClick={() => toggle(g.id)}
              whileHover={{ scale: 1.06 }}
              whileTap={{ scale: 0.95 }}
              style={{
                padding: "3px 9px", borderRadius: 999, cursor: "pointer",
                border: `1px solid ${isActive ? g.accent : "rgba(255,255,255,0.1)"}`,
                background: isActive ? `${g.accent}18` : "rgba(0,0,0,0.4)",
                fontSize: 6, fontWeight: 900, letterSpacing: "0.1em",
                color: isActive ? g.accent : "rgba(255,255,255,0.45)",
                textTransform: "uppercase",
                transition: "background 0.18s, border-color 0.18s, color 0.18s",
              }}
            >
              {g.label}
            </motion.button>
          );
        })}
      </div>

      {/* Reach summary */}
      <AnimatePresence mode="wait">
        {active.length > 0 && (
          <motion.div
            key={selected.join(",")}
            initial={{ opacity: 0, y: 4 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -4 }}
            transition={{ duration: 0.18 }}
            style={{
              display: "flex", gap: 8,
              borderRadius: 7, border: "1px solid rgba(255,255,255,0.07)",
              background: "rgba(0,0,0,0.35)", padding: "7px 10px",
            }}
          >
            <div style={{ flex: 1 }}>
              <div style={{ fontSize: 6, color: "rgba(255,255,255,0.3)", letterSpacing: "0.12em", textTransform: "uppercase", marginBottom: 2 }}>EST. REACH</div>
              <div style={{ fontSize: 14, fontWeight: 900, color: "#00FFFF", letterSpacing: "-0.01em" }}>{totalAudience}</div>
              <div style={{ fontSize: 5, color: "rgba(255,255,255,0.22)", textTransform: "uppercase", letterSpacing: "0.1em" }}>UNIQUE FANS / WK</div>
            </div>
            <div style={{ flex: 1 }}>
              <div style={{ fontSize: 6, color: "rgba(255,255,255,0.3)", letterSpacing: "0.12em", textTransform: "uppercase", marginBottom: 2 }}>BLENDED CPM</div>
              <div style={{ fontSize: 14, fontWeight: 900, color: "#FFD700" }}>{blendedCpm}</div>
              <div style={{ fontSize: 5, color: "rgba(255,255,255,0.22)", textTransform: "uppercase", letterSpacing: "0.1em" }}>COST PER 1K VIEWS</div>
            </div>
            <div style={{ flex: 1 }}>
              <div style={{ fontSize: 6, color: "rgba(255,255,255,0.3)", letterSpacing: "0.12em", textTransform: "uppercase", marginBottom: 2 }}>SEGMENTS</div>
              <div style={{ fontSize: 14, fontWeight: 900, color: "#FF2DAA" }}>{selected.includes("all-genres") ? "ALL" : active.length}</div>
              <div style={{ fontSize: 5, color: "rgba(255,255,255,0.22)", textTransform: "uppercase", letterSpacing: "0.1em" }}>GENRES TARGETED</div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
