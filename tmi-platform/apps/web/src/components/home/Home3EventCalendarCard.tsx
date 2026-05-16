"use client";

import { motion } from "framer-motion";
import Link from "next/link";

type CalendarEvent = {
  day: string;
  date: string;
  title: string;
  type: "battle" | "cypher" | "stage" | "venue";
  accent: string;
  href: string;
  isFeatured?: boolean;
};

const THIS_WEEK: CalendarEvent[] = [
  { day: "MON", date: "5",  title: "Monday Night Stage", type: "stage",  accent: "#FF2DAA", href: "/events/monday-night-stage", isFeatured: true },
  { day: "TUE", date: "6",  title: "Open Cypher Night", type: "cypher", accent: "#AA2DFF", href: "/cypher" },
  { day: "WED", date: "7",  title: "Beat Battle Qualifier", type: "battle", accent: "#FFD700", href: "/battles" },
  { day: "THU", date: "8",  title: "Venue Showcase",     type: "venue",  accent: "#00FFFF", href: "/venues" },
  { day: "FRI", date: "9",  title: "Genre Drop Show",    type: "stage",  accent: "#FF6B35", href: "/events/genre-drop" },
  { day: "SAT", date: "10", title: "Crown Duel Night",   type: "battle", accent: "#FF2DAA", href: "/events/crown-duel" },
  { day: "SUN", date: "11", title: "Producer Jam Session", type: "cypher", accent: "#00FF88", href: "/cypher" },
];

const TYPE_ICONS: Record<CalendarEvent["type"], string> = {
  battle: "⚔️", cypher: "⬤", stage: "🎤", venue: "🏛️",
};

export default function Home3EventCalendarCard() {
  return (
    <div style={{ borderRadius: 12, overflow: "hidden", border: "1px solid rgba(255,255,255,0.08)", background: "rgba(255,255,255,0.02)" }}>
      {/* Header */}
      <div style={{ padding: "8px 12px 6px", borderBottom: "1px solid rgba(255,255,255,0.07)" }}>
        <div style={{ fontSize: 6, fontWeight: 900, letterSpacing: "0.24em", color: "rgba(255,255,255,0.35)", textTransform: "uppercase" }}>
          THIS WEEK · MAY 5–11
        </div>
      </div>

      {/* Event rows */}
      <div style={{ display: "flex", flexDirection: "column" }}>
        {THIS_WEEK.map((ev, i) => (
          <Link key={ev.day} href={ev.href} style={{ textDecoration: "none" }}>
            <motion.div
              initial={{ opacity: 0, x: -8 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.22, delay: i * 0.04 }}
              whileHover={{ background: `${ev.accent}0c` }}
              style={{
                display: "flex", alignItems: "center", gap: 8,
                padding: "6px 12px",
                borderBottom: i < THIS_WEEK.length - 1 ? "1px solid rgba(255,255,255,0.04)" : "none",
                background: ev.isFeatured ? `${ev.accent}0a` : "transparent",
                cursor: "pointer",
              }}
            >
              {/* Day column */}
              <div style={{ minWidth: 30, flexShrink: 0, textAlign: "center" }}>
                <div style={{ fontSize: 6, fontWeight: 900, color: ev.isFeatured ? ev.accent : "rgba(255,255,255,0.3)", letterSpacing: "0.1em" }}>{ev.day}</div>
                <div style={{
                  fontSize: 12, fontWeight: 900,
                  color: ev.isFeatured ? ev.accent : "rgba(255,255,255,0.55)",
                  lineHeight: 1,
                  textShadow: ev.isFeatured ? `0 0 8px ${ev.accent}` : "none",
                }}>{ev.date}</div>
              </div>

              {/* Type icon */}
              <span style={{ fontSize: 10, flexShrink: 0 }}>{TYPE_ICONS[ev.type]}</span>

              {/* Event info */}
              <div style={{ flex: 1, minWidth: 0 }}>
                <div style={{
                  fontSize: ev.isFeatured ? 10 : 9, fontWeight: ev.isFeatured ? 900 : 700,
                  color: ev.isFeatured ? "#fff" : "rgba(255,255,255,0.7)",
                  overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap",
                }}>{ev.title}</div>
                {ev.isFeatured && (
                  <div style={{ fontSize: 6, color: ev.accent, fontWeight: 700, marginTop: 1, letterSpacing: "0.08em" }}>
                    FEATURED · EVERY WEEK
                  </div>
                )}
              </div>

              {/* Type badge */}
              <div style={{
                padding: "2px 5px", borderRadius: 4,
                background: `${ev.accent}14`, border: `1px solid ${ev.accent}2a`,
                fontSize: 5, fontWeight: 900, color: ev.accent, letterSpacing: "0.12em",
                textTransform: "uppercase", flexShrink: 0,
              }}>
                {ev.type}
              </div>
            </motion.div>
          </Link>
        ))}
      </div>
    </div>
  );
}
