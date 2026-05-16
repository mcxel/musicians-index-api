"use client";
import { motion, AnimatePresence } from "framer-motion";
import { useState } from "react";

type ShowStatus = "LIVE NOW" | "UPCOMING" | "SOLD OUT" | "REPLAY";

interface Show {
  id: string;
  title: string;
  venue: string;
  city: string;
  date: string;
  time: string;
  status: ShowStatus;
  ticketsSold: number;
  capacity: number;
  price: number;
  color: string;
}

const SHOWS: Show[] = [
  {
    id: "s1", title: "TMI Crown Night",       venue: "Cypher Arena",       city: "Atlanta, GA",
    date: "APR 30", time: "9:00 PM",  status: "LIVE NOW",  ticketsSold: 820, capacity: 820,  price: 45,  color: "#FF2DAA",
  },
  {
    id: "s2", title: "Underground Sessions",  venue: "The Vault",          city: "New York, NY",
    date: "MAY 10", time: "8:00 PM",  status: "UPCOMING",  ticketsSold: 490, capacity: 600,  price: 35,  color: "#00FFFF",
  },
  {
    id: "s3", title: "Neo-Soul Weekend",      venue: "Frequency Hall",     city: "Los Angeles, CA",
    date: "MAY 22", time: "7:30 PM",  status: "UPCOMING",  ticketsSold: 210, capacity: 1200, price: 55,  color: "#FFD700",
  },
  {
    id: "s4", title: "Neon Exchange Vol.4",   venue: "Signal Warehouse",   city: "Chicago, IL",
    date: "JUN 07", time: "10:00 PM", status: "UPCOMING",  ticketsSold: 85,  capacity: 400,  price: 30,  color: "#AA2DFF",
  },
];

const STATUS_COLOR: Record<ShowStatus, string> = {
  "LIVE NOW":  "#FF2DAA",
  "UPCOMING":  "#00FFFF",
  "SOLD OUT":  "#FF4444",
  "REPLAY":    "#666",
};

export default function ArtistShowRail() {
  const [activeId, setActiveId] = useState<string | null>(null);
  const active = SHOWS.find(s => s.id === activeId);

  return (
    <div
      style={{
        background: "linear-gradient(135deg, rgba(0,255,255,0.03) 0%, rgba(0,0,0,0) 100%)",
        border: "1px solid rgba(0,255,255,0.1)",
        borderLeft: "3px solid #00FFFF",
        borderRadius: 10,
        padding: "20px 24px",
        marginBottom: 20,
      }}
    >
      {/* Header */}
      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 18 }}>
        <div style={{ fontSize: 9, fontWeight: 800, letterSpacing: "0.22em", textTransform: "uppercase", color: "#00FFFF" }}>
          🎤 SHOWS
        </div>
        <div style={{ fontSize: 9, color: "rgba(255,255,255,0.3)", letterSpacing: "0.1em" }}>
          {SHOWS.filter(s => s.status === "UPCOMING" || s.status === "LIVE NOW").length} ACTIVE
        </div>
      </div>

      {/* Show cards */}
      <div style={{ display: "flex", flexDirection: "column", gap: 8, marginBottom: activeId ? 16 : 0 }}>
        {SHOWS.map((show, i) => {
          const soldPct = Math.round((show.ticketsSold / show.capacity) * 100);
          const isActive = activeId === show.id;
          return (
            <motion.div
              key={show.id}
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.06 }}
              onClick={() => setActiveId(isActive ? null : show.id)}
              style={{
                padding: "14px 16px", borderRadius: 8, cursor: "pointer",
                background: isActive ? `rgba(${show.color === "#FF2DAA" ? "255,45,170" : show.color === "#00FFFF" ? "0,255,255" : show.color === "#FFD700" ? "255,215,0" : "170,45,255"},0.07)` : "rgba(255,255,255,0.025)",
                border: isActive ? `1px solid ${show.color}40` : `1px solid ${show.color}12`,
                transition: "all 0.2s",
              }}
            >
              <div style={{ display: "flex", alignItems: "center", gap: 14 }}>
                {/* Date badge */}
                <div style={{
                  width: 44, flexShrink: 0, textAlign: "center",
                  fontSize: 8, fontWeight: 900, lineHeight: 1.3,
                  color: show.color, letterSpacing: "0.05em",
                }}>
                  {show.date.split(" ")[0]}
                  <br />
                  {show.date.split(" ")[1]}
                </div>
                <div style={{ width: 1, height: 32, background: `${show.color}25`, flexShrink: 0 }} />

                {/* Info */}
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div style={{ fontSize: 12, fontWeight: 700, color: "rgba(255,255,255,0.9)", marginBottom: 2, whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>
                    {show.title}
                  </div>
                  <div style={{ fontSize: 10, color: "rgba(255,255,255,0.4)" }}>
                    {show.venue} · {show.city}
                  </div>
                </div>

                {/* Status */}
                <div style={{
                  fontSize: 7, fontWeight: 900, letterSpacing: "0.15em",
                  color: STATUS_COLOR[show.status],
                  border: `1px solid ${STATUS_COLOR[show.status]}40`,
                  borderRadius: 4, padding: "2px 7px", flexShrink: 0,
                }}>
                  {show.status}
                </div>
              </div>

              {/* Ticket progress bar */}
              <div style={{ marginTop: 10 }}>
                <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 4 }}>
                  <span style={{ fontSize: 9, color: "rgba(255,255,255,0.3)" }}>{show.ticketsSold}/{show.capacity} tickets</span>
                  <span style={{ fontSize: 9, color: show.color, fontWeight: 700 }}>{soldPct}% sold</span>
                </div>
                <div style={{ height: 3, borderRadius: 2, background: "rgba(255,255,255,0.06)", overflow: "hidden" }}>
                  <motion.div
                    initial={{ width: "0%" }}
                    animate={{ width: `${soldPct}%` }}
                    transition={{ delay: 0.3 + i * 0.07, duration: 0.7, ease: "easeOut" }}
                    style={{ height: "100%", background: show.color, borderRadius: 2, opacity: 0.85 }}
                  />
                </div>
              </div>
            </motion.div>
          );
        })}
      </div>

      {/* Expanded detail */}
      <AnimatePresence>
        {active && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: "auto" }}
            exit={{ opacity: 0, height: 0 }}
            style={{ overflow: "hidden" }}
          >
            <div style={{
              padding: "14px 16px", borderRadius: 8,
              background: `rgba(${active.color === "#FF2DAA" ? "255,45,170" : active.color === "#00FFFF" ? "0,255,255" : active.color === "#FFD700" ? "255,215,0" : "170,45,255"},0.05)`,
              border: `1px solid ${active.color}25`,
            }}>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 12 }}>
                <div style={{ fontSize: 10, fontWeight: 800, color: "rgba(255,255,255,0.7)" }}>{active.title}</div>
                <div style={{ fontSize: 11, fontWeight: 900, color: active.color }}>${active.price} / ticket</div>
              </div>
              <div style={{ display: "flex", gap: 8 }}>
                <button
                  style={{
                    flex: 1, padding: "8px 0", borderRadius: 6, cursor: "pointer",
                    background: `${active.color}18`, border: `1px solid ${active.color}40`,
                    color: active.color, fontSize: 9, fontWeight: 900, letterSpacing: "0.15em",
                    textTransform: "uppercase",
                  }}
                >
                  GET TICKETS
                </button>
                <button
                  style={{
                    flex: 1, padding: "8px 0", borderRadius: 6, cursor: "pointer",
                    background: "rgba(255,255,255,0.03)", border: "1px solid rgba(255,255,255,0.1)",
                    color: "rgba(255,255,255,0.45)", fontSize: 9, fontWeight: 800, letterSpacing: "0.15em",
                    textTransform: "uppercase",
                  }}
                >
                  SHARE
                </button>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
