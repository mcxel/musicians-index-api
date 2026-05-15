"use client";
import { useState, useEffect, useMemo } from "react";
import { motion } from "framer-motion";
import PageShell from "@/components/layout/PageShell";
import HUDFrame from "@/components/hud/HUDFrame";
import FooterHUD from "@/components/hud/FooterHUD";
import Link from "next/link";
import {
  createSeatingMesh,
  claimSeat,
  releaseFanSeat,
  checkInFan,
  getFanSeat,
  getSeatGrid,
  getOccupancyRate,
  autoAssignSeat,
  seatToAvatarPosition,
  type SeatingMeshState,
  type MeshSeat,
} from "@/lib/seats/SeatingMeshEngine";
import { useSeatSession } from "@/lib/seats/useSeatSession";

const ROOM_ID = "world-concert";
const SESSION_ID = "session-live-001";
const SEAT_ROWS = 6;
const SEAT_COLS = 10;

const SET_LIST = [
  { num: 1, title: "Opening Fire", duration: "3:42", status: "DONE" },
  { num: 2, title: "Crown City Anthem", duration: "4:18", status: "DONE" },
  { num: 3, title: "Midnight Vision", duration: "3:55", status: "LIVE" },
  { num: 4, title: "World Champion", duration: "4:02", status: "UPCOMING" },
  { num: 5, title: "The Encore (TBA)", duration: "—", status: "ENCORE" },
];

export default function WorldConcertPage() {
  const [encoreVotes, setEncoreVotes] = useState(1247);
  const [tipped, setTipped] = useState(false);

  // ── Seating Mesh ────────────────────────────────────────────────────
  const FAN_ID = "guest-fan"; // placeholder; replace with real auth session id

  const { seatId: persistedSeatId, claim: persistClaim, release: persistRelease } =
    useSeatSession(ROOM_ID, FAN_ID);

  const [mesh, setMesh] = useState<SeatingMeshState>(() =>
    createSeatingMesh(ROOM_ID, SESSION_ID, SEAT_ROWS, SEAT_COLS),
  );

  // On mount: restore prior seat via return-loop, then auto-assign if still empty
  useEffect(() => {
    setMesh((prev) => {
      // 1. If fan has a prior seat in session storage, try to reclaim it
      if (persistedSeatId) {
        const seeded: SeatingMeshState = {
          ...prev,
          fanSeatIndex: { ...prev.fanSeatIndex, [FAN_ID]: persistedSeatId },
        };
        const { state: restored, seat } = checkInFan(seeded, FAN_ID, null);
        if (seat) return restored;
      }
      // 2. No prior seat — auto-assign the best available seat
      const assigned = autoAssignSeat(prev, FAN_ID, null);
      if (assigned) {
        persistClaim(assigned.seat.seatId);
        return assigned.state;
      }
      return prev;
    });
  // persistedSeatId and persistClaim are stable across renders
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const fanSeat: MeshSeat | null = useMemo(() => getFanSeat(mesh, FAN_ID), [mesh]);
  const seatGrid = useMemo(() => getSeatGrid(mesh), [mesh]);
  const occupancy = useMemo(() => Math.round(getOccupancyRate(mesh) * 100), [mesh]);
  const avatarPos = useMemo(
    () => (fanSeat ? seatToAvatarPosition(fanSeat, SEAT_COLS) : null),
    [fanSeat],
  );

  function handleClaimSeat(seatId: string) {
    setMesh((prev) => {
      const next = claimSeat(prev, FAN_ID, seatId);
      if (!next) return prev;
      persistClaim(seatId);
      return next;
    });
  }

  function handleReleaseSeat() {
    setMesh((prev) => {
      persistRelease();
      return releaseFanSeat(prev, FAN_ID);
    });
  }

  const TIER_COLOR: Record<string, string> = {
    FRONT_ROW: "#FFD700",
    STAGE_SIDE: "#FF2DAA",
    VIP: "#AA2DFF",
    PREMIUM: "#00FFFF",
    GENERAL: "#334",
  };

  return (
    <PageShell>
      <HUDFrame>
        <div style={{ minHeight: "100vh", background: "#050510", color: "#fff", paddingBottom: 80 }}>

          {/* Header */}
          <div style={{ padding: "28px 32px 0", borderBottom: "1px solid rgba(255,45,170,0.2)" }}>
            <div style={{ display: "flex", alignItems: "center", gap: 16, marginBottom: 20 }}>
              <Link href="/rooms" style={{ color: "#FF2DAA", fontSize: 11, fontWeight: 700, textDecoration: "none" }}>← ROOMS</Link>
              <div style={{ flex: 1 }}>
                <div style={{ fontSize: 9, letterSpacing: 5, color: "#FF2DAA", fontWeight: 800 }}>FULL CONCERT EXPERIENCE</div>
                <h1 style={{ fontSize: "clamp(22px,4vw,40px)", fontWeight: 900, letterSpacing: 3, margin: "2px 0 0" }}>
                  WORLD CONCERT
                </h1>
              </div>
              <motion.div animate={{ opacity: [1, 0.3, 1] }} transition={{ repeat: Infinity, duration: 1.3 }}
                style={{ background: "#FF2DAA", borderRadius: 20, padding: "4px 14px", fontSize: 9, fontWeight: 900, letterSpacing: 3 }}>
                LIVE
              </motion.div>
            </div>
          </div>

          <div style={{ display: "grid", gridTemplateColumns: "1fr 300px", gap: 20, padding: "24px 32px" }}>

            {/* Main stage */}
            <div>
              {/* Video feed */}
              <div style={{
                background: "rgba(255,45,170,0.06)", border: "1px solid rgba(255,45,170,0.2)",
                borderRadius: 16, aspectRatio: "16/9",
                display: "flex", alignItems: "center", justifyContent: "center",
                marginBottom: 20, position: "relative", overflow: "hidden",
              }}>
                <motion.div
                  animate={{ scale: [1, 1.08, 1] }}
                  transition={{ repeat: Infinity, duration: 2, ease: "easeInOut" }}
                  style={{ fontSize: 80, opacity: 0.4 }}
                >🎤</motion.div>
                <div style={{ position: "absolute", bottom: 16, left: 16, right: 16, display: "flex", justifyContent: "space-between", alignItems: "flex-end" }}>
                  <div>
                    <div style={{ fontSize: 11, color: "#aaa" }}>NOW PLAYING</div>
                    <div style={{ fontSize: 16, fontWeight: 800, color: "#FF2DAA" }}>Midnight Vision</div>
                  </div>
                  <div style={{ fontSize: 11, color: "#888" }}>3:42 / 3:55</div>
                </div>
              </div>

              {/* Set list */}
              <div style={{
                background: "rgba(255,255,255,0.02)", border: "1px solid rgba(255,255,255,0.07)",
                borderRadius: 12, padding: 20, marginBottom: 20,
              }}>
                <div style={{ fontSize: 9, letterSpacing: 4, color: "#888", fontWeight: 800, marginBottom: 16 }}>SET LIST</div>
                {SET_LIST.map(track => (
                  <div key={track.num} style={{
                    display: "flex", alignItems: "center", gap: 12,
                    padding: "10px 0", borderBottom: "1px solid rgba(255,255,255,0.04)",
                  }}>
                    <div style={{ width: 22, fontSize: 12, textAlign: "center", color: "#555" }}>{track.num}</div>
                    <div style={{ flex: 1 }}>
                      <div style={{ fontSize: 12, fontWeight: track.status === "LIVE" ? 700 : 400, color: track.status === "LIVE" ? "#FF2DAA" : track.status === "DONE" ? "#555" : "#fff" }}>
                        {track.title}
                      </div>
                    </div>
                    <div style={{ fontSize: 10, color: "#666" }}>{track.duration}</div>
                    <div style={{
                      padding: "2px 8px", borderRadius: 10,
                      background: track.status === "LIVE" ? "rgba(255,45,170,0.2)" : track.status === "DONE" ? "rgba(255,255,255,0.05)" : "transparent",
                      fontSize: 7, fontWeight: 800, letterSpacing: 2,
                      color: track.status === "LIVE" ? "#FF2DAA" : track.status === "UPCOMING" ? "#888" : track.status === "ENCORE" ? "#FFD700" : "#444",
                    }}>{track.status}</div>
                  </div>
                ))}
              </div>

              {/* Encore vote */}
              <div style={{
                background: "rgba(255,215,0,0.05)", border: "1px solid rgba(255,215,0,0.2)",
                borderRadius: 12, padding: 20, textAlign: "center",
              }}>
                <div style={{ fontSize: 9, letterSpacing: 4, color: "#FFD700", fontWeight: 800, marginBottom: 8 }}>🔁 VOTE FOR ENCORE</div>
                <div style={{ fontSize: 28, fontWeight: 900, color: "#FFD700", marginBottom: 12 }}>{encoreVotes.toLocaleString()}</div>
                <motion.button whileTap={{ scale: 0.95 }}
                  onClick={() => setEncoreVotes((v: number) => v + 1)}
                  style={{
                    padding: "10px 36px", borderRadius: 25,
                    background: "rgba(255,215,0,0.15)", border: "1px solid #FFD700",
                    color: "#FFD700", fontWeight: 800, fontSize: 11, letterSpacing: 3, cursor: "pointer",
                  }}>
                  ENCORE! 🙌
                </motion.button>
              </div>
            </div>

            {/* Right panel */}
            <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
              {/* Artist bio */}
              <div style={{
                background: "rgba(255,45,170,0.04)", border: "1px solid rgba(255,45,170,0.15)",
                borderRadius: 12, padding: 20, textAlign: "center",
              }}>
                <div style={{ fontSize: 44, marginBottom: 8 }}>🎤</div>
                <div style={{ fontSize: 14, fontWeight: 800, marginBottom: 4 }}>Tonight's Artist</div>
                <div style={{ fontSize: 10, color: "#888", marginBottom: 12 }}>R&B / Hip-Hop / Soul</div>
                <motion.button whileTap={{ scale: 0.96 }} onClick={() => setTipped(true)} style={{
                  width: "100%", padding: "10px 0", borderRadius: 25,
                  background: tipped ? "rgba(0,255,136,0.15)" : "rgba(255,215,0,0.1)",
                  border: `1px solid ${tipped ? "#00FF88" : "rgba(255,215,0,0.3)"}`,
                  color: tipped ? "#00FF88" : "#FFD700",
                  fontWeight: 700, fontSize: 11, letterSpacing: 2, cursor: "pointer",
                }}>
                  {tipped ? "✓ TIPPED!" : "💰 TIP ARTIST"}
                </motion.button>
              </div>

              {/* Crowd size */}
              <div style={{
                background: "rgba(0,255,255,0.03)", border: "1px solid rgba(0,255,255,0.12)",
                borderRadius: 12, padding: 20, textAlign: "center",
              }}>
                <div style={{ fontSize: 32, fontWeight: 900, color: "#00FFFF" }}>8,244</div>
                <div style={{ fontSize: 9, letterSpacing: 3, color: "#888", marginBottom: 12 }}>IN ATTENDANCE</div>
                <div style={{ height: 4, borderRadius: 2, background: "rgba(0,255,255,0.15)", overflow: "hidden" }}>
                  <motion.div animate={{ width: ["0%", "72%"] }} transition={{ duration: 1.5 }}
                    style={{ height: "100%", background: "#00FFFF", borderRadius: 2 }} />
                </div>
                <div style={{ fontSize: 9, color: "#666", marginTop: 6 }}>72% arena capacity</div>
              </div>

              {/* Seating Mesh */}
              <div style={{
                background: "rgba(0,255,136,0.03)", border: "1px solid rgba(0,255,136,0.15)",
                borderRadius: 12, padding: 16,
              }}>
                <div style={{ fontSize: 9, letterSpacing: 4, color: "#00FF88", fontWeight: 800, marginBottom: 10 }}>
                  🪑 YOUR SEAT
                </div>

                {fanSeat ? (
                  <div style={{ marginBottom: 10 }}>
                    <div style={{ fontSize: 11, color: "#fff", fontWeight: 700 }}>
                      Row {fanSeat.row + 1} · Seat {fanSeat.col + 1}
                    </div>
                    <div style={{
                      fontSize: 9, fontWeight: 800, letterSpacing: 2,
                      color: TIER_COLOR[fanSeat.tier] ?? "#fff", marginBottom: 4,
                    }}>{fanSeat.tier.replace("_", " ")}</div>
                    {avatarPos && (
                      <div style={{ fontSize: 8, color: "#555", marginBottom: 8, fontFamily: "monospace" }}>
                        x:{avatarPos.x.toFixed(1)} y:{avatarPos.y.toFixed(1)} z:{avatarPos.z.toFixed(1)}
                      </div>
                    )}
                    <motion.button whileTap={{ scale: 0.95 }} onClick={handleReleaseSeat} style={{
                      width: "100%", padding: "7px 0", borderRadius: 20,
                      background: "rgba(255,45,170,0.08)", border: "1px solid rgba(255,45,170,0.3)",
                      color: "#FF2DAA", fontSize: 9, fontWeight: 700, letterSpacing: 2, cursor: "pointer",
                    }}>LEAVE SEAT</motion.button>
                  </div>
                ) : (
                  <div style={{ fontSize: 10, color: "#555", marginBottom: 10 }}>
                    Assigning seat…
                  </div>
                )}

                {/* Mini seat grid */}
                <div style={{ fontSize: 8, color: "#555", marginBottom: 6 }}>
                  STAGE ▲ — {occupancy}% occupied
                </div>
                <div style={{
                  display: "grid",
                  gridTemplateColumns: `repeat(${SEAT_COLS}, 1fr)`,
                  gap: 2,
                }}>
                  {seatGrid.map((seat) => {
                    const isMyeat = seat.seatId === fanSeat?.seatId;
                    const isTaken = seat.status !== "open";
                    return (
                      <motion.button
                        key={seat.seatId}
                        whileTap={{ scale: 0.85 }}
                        disabled={isTaken && !isMyeat}
                        onClick={() => !isTaken && handleClaimSeat(seat.seatId)}
                        style={{
                          width: "100%", aspectRatio: "1",
                          borderRadius: 2,
                          border: isMyeat ? "1px solid #00FF88" : "none",
                          background: isMyeat
                            ? "#00FF88"
                            : isTaken
                            ? "rgba(255,45,170,0.35)"
                            : TIER_COLOR[seat.tier] ?? "#334",
                          cursor: isTaken && !isMyeat ? "not-allowed" : "pointer",
                          padding: 0,
                        }}
                        title={`Row ${seat.row + 1} Seat ${seat.col + 1} (${seat.tier})`}
                      />
                    );
                  })}
                </div>
                <div style={{ display: "flex", gap: 8, marginTop: 8, flexWrap: "wrap" }}>
                  {[
                    { color: "#FFD700", label: "Front Row" },
                    { color: "#FF2DAA", label: "Stage Side" },
                    { color: "#AA2DFF", label: "VIP" },
                    { color: "#00FFFF", label: "Premium" },
                    { color: "#334", label: "General" },
                  ].map(({ color, label }) => (
                    <div key={label} style={{ display: "flex", alignItems: "center", gap: 3 }}>
                      <div style={{ width: 6, height: 6, borderRadius: 1, background: color }} />
                      <span style={{ fontSize: 7, color: "#666" }}>{label}</span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Light modes */}
              <div style={{
                background: "rgba(170,45,255,0.04)", border: "1px solid rgba(170,45,255,0.12)",
                borderRadius: 12, padding: 20,
              }}>
                <div style={{ fontSize: 9, letterSpacing: 4, color: "#AA2DFF", fontWeight: 800, marginBottom: 12 }}>💡 CROWD LIGHTS</div>
                {["🌊 CROWD WASH", "⚡ STROBE (SAFE)", "🔦 BEAM SWEEP", "🎨 COLOR SHIFT"].map(l => (
                  <motion.button key={l} whileTap={{ scale: 0.96 }} style={{
                    display: "block", width: "100%", padding: "8px 12px", borderRadius: 8, marginBottom: 5,
                    background: "rgba(170,45,255,0.08)", border: "1px solid rgba(170,45,255,0.15)",
                    color: "#AA2DFF", fontSize: 10, fontWeight: 600, cursor: "pointer", textAlign: "left",
                  }}>{l}</motion.button>
                ))}
              </div>
            </div>

          </div>

        </div>
        <FooterHUD />
      </HUDFrame>
    </PageShell>
  );
}
