"use client";
import { useState, useEffect, useMemo } from "react";
import { motion } from "framer-motion";
import { useRouter } from "next/navigation";
import PageShell from "@/components/layout/PageShell";
import AudienceScene from "@/components/live/AudienceScene";
import HUDFrame from "@/components/hud/HUDFrame";
import FooterHUD from "@/components/hud/FooterHUD";
import Link from "next/link";
import {
  createSeatingMesh,
  claimSeat,
  releaseFanSeat,
  getFanSeat,
  getSeatGrid,
  getOccupancyRate,
  seatToAvatarPosition,
  type SeatingMeshState,
  type MeshSeat,
} from "@/lib/seats/SeatingMeshEngine";
import type { TicketRecord } from "@/lib/tickets/ticketCore";
import { useSeatSession } from "@/lib/seats/useSeatSession";

type SeatReservation = { fanId: string; seatId: string; displayName: string };

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
  const router = useRouter();
  const [encoreVotes, setEncoreVotes] = useState(1247);
  const [tipped, setTipped] = useState(false);
  const [tipPicking, setTipPicking] = useState(false);
  const [activeLight, setActiveLight] = useState<string | null>(null);

  // ── Seating Mesh ────────────────────────────────────────────────────
  const FAN_ID = "guest-fan"; // placeholder; replace with real auth session id

  const { seatId: persistedSeatId, claim: persistClaim, release: persistRelease } =
    useSeatSession(ROOM_ID, FAN_ID);

  const [mesh, setMesh] = useState<SeatingMeshState>(() =>
    createSeatingMesh(ROOM_ID, SESSION_ID, SEAT_ROWS, SEAT_COLS),
  );
  const [myTicket, setMyTicket] = useState<TicketRecord | null>(null);
  const [loadingReservation, setLoadingReservation] = useState(false);
  const [reservationError, setReservationError] = useState<string | null>(null);

  // Fetch server seat map on mount + poll every 15s
  useEffect(() => {
    let cancelled = false;

    async function syncSeats() {
      try {
        const res = await fetch(`/api/seats/${ROOM_ID}`);
        if (!res.ok || cancelled) return;
        const data = await res.json() as { reservations?: Record<string, SeatReservation> };
        const reservations = data.reservations ?? {};
        setMesh((prev) => {
          let next = prev;
          for (const [seatId, r] of Object.entries(reservations)) {
            const claimed = claimSeat(next, r.fanId, seatId);
            if (claimed) next = claimed;
          }
          // Restore this fan's seat from sessionStorage if still open
          if (persistedSeatId && !reservations[persistedSeatId]) {
            const selfClaimed = claimSeat(next, FAN_ID, persistedSeatId);
            if (selfClaimed) return selfClaimed;
          }
          return next;
        });
      } catch {
        // silently ignore — client-side mesh stays as fallback
      }
    }

    syncSeats();
    const poll = setInterval(syncSeats, 15_000);
    return () => { cancelled = true; clearInterval(poll); };
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const fanSeat: MeshSeat | null = useMemo(() => getFanSeat(mesh, FAN_ID), [mesh]);
  const seatGrid = useMemo(() => getSeatGrid(mesh), [mesh]);
  const occupancy = useMemo(() => Math.round(getOccupancyRate(mesh) * 100), [mesh]);
  const avatarPos = useMemo(
    () => (fanSeat ? seatToAvatarPosition(fanSeat, SEAT_COLS) : null),
    [fanSeat],
  );

  async function handleClaimSeat(seatId: string) {
    setLoadingReservation(true);
    setReservationError(null);
    try {
      const res = await fetch("/api/seats/reserve", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          concertId: ROOM_ID,
          fanId: FAN_ID,
          seatId,
          displayName: "Fan",
          tier: "STANDARD",
          faceValue: 0,
        }),
      });
      const data = await res.json() as { ok: boolean; error?: string; ticket?: TicketRecord };
      if (!data.ok) {
        setReservationError(
          data.error === "seat_taken" ? "That seat was just claimed — pick another." : "Could not reserve seat.",
        );
        return;
      }
      setMyTicket(data.ticket ?? null);
      persistClaim(seatId);
      setMesh((prev) => claimSeat(prev, FAN_ID, seatId) ?? prev);
    } finally {
      setLoadingReservation(false);
    }
  }

  async function handleReleaseSeat() {
    setMyTicket(null);
    persistRelease();
    setMesh((prev) => releaseFanSeat(prev, FAN_ID));
    await fetch("/api/seats/reserve", {
      method: "DELETE",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ concertId: ROOM_ID, fanId: FAN_ID }),
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
              {/* 3D Arena — World Concert uses Arena venue (18,500 cap, stadium wrap) */}
              <div style={{
                background: "#050510", border: "1px solid rgba(255,45,170,0.2)",
                borderRadius: 16, aspectRatio: "16/9",
                marginBottom: 20, position: "relative", overflow: "hidden",
              }}>
                <AudienceScene
                  venue={1}
                  watcherCount={18500}
                  view="fan"
                  accentColor="#FF2DAA"
                  bpm={120}
                  screenLabel="WORLD CONCERT"
                  screenSubLabel="Nova Cipher · LIVE"
                />
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
                {!tipPicking ? (
                  <motion.button whileTap={{ scale: 0.96 }} onClick={() => setTipPicking(true)} style={{
                    width: "100%", padding: "10px 0", borderRadius: 25,
                    background: tipped ? "rgba(0,255,136,0.15)" : "rgba(255,215,0,0.1)",
                    border: `1px solid ${tipped ? "#00FF88" : "rgba(255,215,0,0.3)"}`,
                    color: tipped ? "#00FF88" : "#FFD700",
                    fontWeight: 700, fontSize: 11, letterSpacing: 2, cursor: "pointer",
                  }}>
                    {tipped ? "✓ TIPPED!" : "💰 TIP ARTIST"}
                  </motion.button>
                ) : (
                  <div>
                    <div style={{ fontSize: 9, color: "#FFD700", fontWeight: 700, marginBottom: 8, letterSpacing: 2 }}>CHOOSE TIP AMOUNT</div>
                    <div style={{ display: "flex", flexWrap: "wrap", gap: 6, justifyContent: "center" }}>
                      {[1, 5, 10, 25].map((amt) => (
                        <motion.button key={amt} whileTap={{ scale: 0.95 }}
                          onClick={() => router.push(`/api/stripe/checkout?priceId=price_tip_${amt * 100}&mode=payment&type=tip&roomId=${ROOM_ID}`)}
                          style={{ padding: "7px 14px", borderRadius: 12, border: "1px solid #FFD70044", background: "#FFD70018", color: "#FFD700", fontSize: 12, fontWeight: 800, cursor: "pointer" }}>
                          ${amt}
                        </motion.button>
                      ))}
                    </div>
                    <button onClick={() => setTipPicking(false)} style={{ marginTop: 8, fontSize: 9, color: "#555", background: "none", border: "none", cursor: "pointer", width: "100%" }}>cancel</button>
                  </div>
                )}
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

                {reservationError && (
                  <div style={{ fontSize: 10, color: "#FF4444", marginBottom: 8, padding: "6px 10px", background: "rgba(255,68,68,0.08)", borderRadius: 6 }}>
                    {reservationError}
                  </div>
                )}

                {fanSeat ? (
                  <div style={{ marginBottom: 10 }}>
                    <div style={{ fontSize: 11, color: "#fff", fontWeight: 700 }}>
                      Row {fanSeat.row + 1} · Seat {fanSeat.col + 1}
                    </div>
                    <div style={{
                      fontSize: 9, fontWeight: 800, letterSpacing: 2,
                      color: TIER_COLOR[fanSeat.tier] ?? "#fff", marginBottom: 6,
                    }}>{fanSeat.tier.replace("_", " ")}</div>
                    {myTicket && (
                      <div style={{
                        background: "rgba(0,255,136,0.06)", border: "1px solid rgba(0,255,136,0.3)",
                        borderRadius: 8, padding: "8px 10px", marginBottom: 8,
                      }}>
                        <div style={{ fontSize: 8, color: "#00FF88", fontWeight: 800, letterSpacing: 2, marginBottom: 4 }}>✓ SEAT RESERVED</div>
                        <div style={{ fontSize: 9, color: "rgba(255,255,255,0.6)", fontFamily: "monospace" }}>{myTicket.id}</div>
                        <div style={{ fontSize: 8, color: "#555", marginTop: 3 }}>
                          Section {myTicket.seat.section} · Row {myTicket.seat.row} · Seat {myTicket.seat.seat}
                        </div>
                      </div>
                    )}
                    <motion.button whileTap={{ scale: 0.95 }} onClick={() => void handleReleaseSeat()} style={{
                      width: "100%", padding: "7px 0", borderRadius: 20,
                      background: "rgba(255,45,170,0.08)", border: "1px solid rgba(255,45,170,0.3)",
                      color: "#FF2DAA", fontSize: 9, fontWeight: 700, letterSpacing: 2, cursor: "pointer",
                    }}>LEAVE SEAT</motion.button>
                  </div>
                ) : (
                  <div style={{ fontSize: 10, color: "#555", marginBottom: 10 }}>
                    {loadingReservation ? "Reserving seat…" : "Pick a seat below ↓"}
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
                  <motion.button key={l} whileTap={{ scale: 0.96 }} onClick={() => setActiveLight(activeLight === l ? null : l)} style={{
                    display: "block", width: "100%", padding: "8px 12px", borderRadius: 8, marginBottom: 5,
                    background: activeLight === l ? "rgba(170,45,255,0.22)" : "rgba(170,45,255,0.08)",
                    border: `1px solid ${activeLight === l ? "rgba(170,45,255,0.6)" : "rgba(170,45,255,0.15)"}`,
                    color: activeLight === l ? "#CC60FF" : "#AA2DFF", fontSize: 10, fontWeight: activeLight === l ? 800 : 600, cursor: "pointer", textAlign: "left",
                  }}>{l}{activeLight === l ? " ●" : ""}</motion.button>
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
