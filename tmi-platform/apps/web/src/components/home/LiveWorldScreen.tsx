"use client";
import { motion } from "framer-motion";
import { useState, useEffect } from "react";
import Link from "next/link";
import SectionTitle from "@/components/ui/SectionTitle";

interface LiveRoom {
  id: string;
  name: string;
  host: string;
  viewers: number;
  genre: string;
  type: string;
}

interface UpcomingShow {
  id: string;
  title: string;
  artist: string;
  date: string;
  venue: string;
  ticketsLeft: number;
}

const LIVE_STUBS: LiveRoom[] = [
  { id: "1", name: "Midnight Cypher Session", host: "Jaylen Cross", viewers: 842, genre: "Hip-Hop", type: "CYPHER" },
  { id: "2", name: "R&B Vibes After Dark", host: "Amirah Wells", viewers: 1204, genre: "R&B", type: "LIVE" },
  { id: "3", name: "Trap Producers Arena", host: "Traxx Monroe", viewers: 609, genre: "Trap", type: "ARENA" },
  { id: "4", name: "Neo-Soul Collective", host: "DESTINED", viewers: 477, genre: "Neo-Soul", type: "SHOWCASE" },
];

const SHOW_STUBS: UpcomingShow[] = [
  { id: "1", title: "Crown Season Finale", artist: "Jaylen Cross", date: "Apr 12", venue: "TMI Live Arena", ticketsLeft: 43 },
  { id: "2", title: "Midnight Sessions Vol. 6", artist: "Amirah Wells", date: "Apr 19", venue: "Studio Stage", ticketsLeft: 112 },
  { id: "3", title: "Underground Battle Night", artist: "Various Artists", date: "Apr 26", venue: "Cypher Arena", ticketsLeft: 7 },
];

const TYPE_COLORS: Record<string, string> = { CYPHER: "#AA2DFF", LIVE: "#FF4444", ARENA: "#FFD700", SHOWCASE: "#00FFFF" };

export default function LiveWorldScreen() {
  const [rooms, setRooms] = useState<LiveRoom[]>(LIVE_STUBS);
  const [shows, setShows] = useState<UpcomingShow[]>(SHOW_STUBS);

  useEffect(() => {
    fetch("/api/homepage/events?limit=3")
      .then((r) => (r.ok ? r.json() : null))
      .then((data: unknown) => {
        if (!Array.isArray(data) || data.length === 0) return;
        setShows(
          (data as Array<{ id: string; title: string; artistName: string; date: string; venue: string; ticketsAvailable: number }>)
            .slice(0, 3).map((e) => ({
              id: e.id, title: e.title, artist: e.artistName ?? "TBA",
              date: e.date ? new Date(e.date).toLocaleDateString("en-US", { month: "short", day: "numeric" }) : "TBA",
              venue: e.venue ?? "TMI Arena", ticketsLeft: e.ticketsAvailable ?? 0,
            }))
        );
      })
      .catch(() => {});
  }, []);

  return (
    <div style={{ minHeight: "calc(100vh - 52px)", background: "#050510", padding: "0 0 40px" }}>

      {/* Live Now Hero Banner */}
      <div style={{
        background: "linear-gradient(135deg, #0A0010 0%, #1A0510 100%)",
        borderBottom: "1px solid rgba(255,68,68,0.2)",
        padding: "24px 24px 20px",
      }}>
        <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 4 }}>
          <motion.div
            animate={{ opacity: [1, 0.3, 1] }}
            transition={{ duration: 1.2, repeat: Infinity }}
            style={{ width: 10, height: 10, borderRadius: "50%", background: "#FF4444", boxShadow: "0 0 10px #FF4444" }}
          />
          <span style={{ fontSize: 11, fontWeight: 900, color: "#FF4444", letterSpacing: "0.2em" }}>
            LIVE NOW — {rooms.length} ACTIVE ROOMS
          </span>
        </div>
        <h2 style={{ fontSize: 22, fontWeight: 900, color: "white", margin: 0 }}>
          Live World
        </h2>
      </div>

      <div style={{ padding: "24px", maxWidth: 1200, margin: "0 auto", display: "grid", gap: 32 }}>

        {/* ── LIVE ROOMS ── */}
        <div>
          <SectionTitle title="Live Rooms" accent="cyan" badge="Now" />
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(220px, 1fr))", gap: 12 }}>
            {rooms.map((room, i) => (
              <motion.div
                key={room.id}
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: i * 0.06 }}
                whileHover={{ y: -4 }}
                style={{
                  background: "#0D0A14",
                  border: `1px solid ${TYPE_COLORS[room.type] ?? "#00FFFF"}30`,
                  borderRadius: 10, padding: "14px 16px",
                  cursor: "pointer", position: "relative", overflow: "hidden",
                }}
              >
                <div style={{
                  position: "absolute", top: 8, right: 8,
                  background: TYPE_COLORS[room.type] ?? "#00FFFF",
                  color: "#000", fontSize: 8, fontWeight: 900,
                  letterSpacing: "0.12em", padding: "2px 6px", borderRadius: 3,
                }}>
                  {room.type}
                </div>
                <div style={{ fontSize: 13, fontWeight: 800, color: "white", marginBottom: 4, paddingRight: 48 }}>
                  {room.name}
                </div>
                <div style={{ fontSize: 10, color: "rgba(255,255,255,0.5)", marginBottom: 8 }}>
                  Host: {room.host}
                </div>
                <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
                  <span style={{ fontSize: 9, color: "rgba(255,255,255,0.35)", letterSpacing: "0.08em" }}>{room.genre}</span>
                  <span style={{ fontSize: 10, fontWeight: 700, color: "#FF4444" }}>
                    👁 {room.viewers.toLocaleString()}
                  </span>
                </div>
              </motion.div>
            ))}
          </div>
          <div style={{ textAlign: "right", marginTop: 12 }}>
            <Link href="/rooms" style={{ fontSize: 10, color: "#00FFFF", textDecoration: "none", fontWeight: 700, letterSpacing: "0.1em" }}>
              All Live Rooms →
            </Link>
          </div>
        </div>

        {/* ── UPCOMING SHOWS ── */}
        <div>
          <SectionTitle title="Upcoming Shows" accent="gold" badge="This Month" />
          <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
            {shows.map((show, i) => (
              <motion.div
                key={show.id}
                initial={{ opacity: 0, x: -16 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: i * 0.08 }}
                style={{
                  background: "#0D0A14",
                  border: "1px solid rgba(255,215,0,0.12)",
                  borderRadius: 10, padding: "14px 18px",
                  display: "flex", alignItems: "center", gap: 16,
                }}
              >
                <div style={{
                  minWidth: 52, textAlign: "center",
                  background: "rgba(255,215,0,0.08)",
                  border: "1px solid rgba(255,215,0,0.2)",
                  borderRadius: 8, padding: "8px 4px",
                }}>
                  <div style={{ fontSize: 16, fontWeight: 900, color: "#FFD700", lineHeight: 1 }}>
                    {show.date.split(" ")[1]}
                  </div>
                  <div style={{ fontSize: 8, color: "rgba(255,255,255,0.4)", letterSpacing: "0.1em", textTransform: "uppercase" }}>
                    {show.date.split(" ")[0]}
                  </div>
                </div>
                <div style={{ flex: 1 }}>
                  <div style={{ fontSize: 13, fontWeight: 800, color: "white" }}>{show.title}</div>
                  <div style={{ fontSize: 10, color: "rgba(255,255,255,0.4)", marginTop: 2 }}>
                    {show.artist} · {show.venue}
                  </div>
                </div>
                <div style={{ textAlign: "right" }}>
                  {show.ticketsLeft <= 10 && (
                    <div style={{ fontSize: 9, color: "#FF4444", fontWeight: 900, marginBottom: 4, letterSpacing: "0.1em" }}>
                      {show.ticketsLeft} LEFT
                    </div>
                  )}
                  <Link href="/events" style={{
                    fontSize: 9, fontWeight: 700, letterSpacing: "0.12em",
                    color: "#FFD700", textDecoration: "none",
                    border: "1px solid rgba(255,215,0,0.3)",
                    padding: "4px 12px", borderRadius: 3,
                  }}>
                    TICKETS
                  </Link>
                </div>
              </motion.div>
            ))}
          </div>
        </div>

        {/* ── CYPHER ARENA + STREAM & WIN ── */}
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 16 }}>
          <motion.div
            whileHover={{ scale: 1.02 }}
            style={{
              background: "linear-gradient(135deg, #100020 0%, #1A0040 100%)",
              border: "1px solid rgba(170,45,255,0.3)",
              borderRadius: 12, padding: "24px",
              cursor: "pointer",
            }}
          >
            <div style={{ fontSize: 28, marginBottom: 8 }}>⚔️</div>
            <div style={{ fontSize: 15, fontWeight: 900, color: "white", marginBottom: 6 }}>Cypher Arena</div>
            <div style={{ fontSize: 11, color: "rgba(255,255,255,0.5)", marginBottom: 16, lineHeight: 1.5 }}>
              Battle mode is LIVE. Enter the arena and claim your verse.
            </div>
            <Link href="/cypher" style={{
              fontSize: 10, fontWeight: 700, color: "#AA2DFF",
              textDecoration: "none", letterSpacing: "0.12em",
              border: "1px solid rgba(170,45,255,0.4)", padding: "6px 16px", borderRadius: 4,
            }}>
              ENTER ARENA →
            </Link>
          </motion.div>

          <motion.div
            whileHover={{ scale: 1.02 }}
            style={{
              background: "linear-gradient(135deg, #001020 0%, #002030 100%)",
              border: "1px solid rgba(0,255,255,0.3)",
              borderRadius: 12, padding: "24px",
              cursor: "pointer",
            }}
          >
            <div style={{ fontSize: 28, marginBottom: 8 }}>📻</div>
            <div style={{ fontSize: 15, fontWeight: 900, color: "white", marginBottom: 6 }}>Stream & Win Radio</div>
            <div style={{ fontSize: 11, color: "rgba(255,255,255,0.5)", marginBottom: 16, lineHeight: 1.5 }}>
              Listen, earn points, and win prizes while you stream.
            </div>
            <Link href="/stream-win" style={{
              fontSize: 10, fontWeight: 700, color: "#00FFFF",
              textDecoration: "none", letterSpacing: "0.12em",
              border: "1px solid rgba(0,255,255,0.4)", padding: "6px 16px", borderRadius: 4,
            }}>
              TUNE IN →
            </Link>
          </motion.div>
        </div>
      </div>
    </div>
  );
}
