"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import {
  ticketAuthority,
  type TicketRecord,
  type TicketScanResult,
} from "@/engines/TicketAuthorityEngine";
import {
  claimSeat,
  releaseSeat,
} from "@/lib/venue/tmiVenueSeatEngine";
import { getRoomSeatClaims } from "@/lib/lobbies/seatIdentityGuard";

type VenueTicketShellProps = {
  lastScan: string;
  onScan: (ticketCode: string) => void;
  venueId?: string;
};

export default function VenueTicketShell({ lastScan, onScan, venueId = "default" }: VenueTicketShellProps) {
  const [scanInput, setScanInput] = useState("");
  const [scanResult, setScanResult] = useState<TicketScanResult | null>(null);
  const [scanLoading, setScanLoading] = useState(false);
  const [ownedTickets, setOwnedTickets] = useState<TicketRecord[]>([]);
  const [ticketsLoading, setTicketsLoading] = useState(false);
  const [guestList, setGuestList] = useState<Record<string, string>>({});
  const [claimedSeat, setClaimedSeat] = useState<string | null>(null);

  useEffect(() => {
    setTicketsLoading(true);
    ticketAuthority.getOwned().then((tickets) => {
      setOwnedTickets(tickets);
      setTicketsLoading(false);
    });
    setGuestList(getRoomSeatClaims(venueId));
  }, [venueId]);

  async function handleScan(code: string) {
    if (!code.trim()) return;
    setScanLoading(true);
    const result = await ticketAuthority.scan({ token: code, venueId });
    setScanResult(result);
    setScanLoading(false);
    onScan(code);
    setScanInput("");
  }

  function handleClaimSeat(seatId: string, ticketId: string) {
    claimSeat(seatId, "current-user", ticketId);
    setClaimedSeat(seatId);
  }

  function handleReleaseSeat(seatId: string) {
    releaseSeat(seatId);
    setClaimedSeat(null);
  }

  const vipTickets = ownedTickets.filter(
    (t) => t.ticketType.name.toUpperCase().includes("VIP") || t.ticketType.name.toUpperCase().includes("BACKSTAGE"),
  );
  const activeTickets = ownedTickets.filter((t) => t.status === "ACTIVE");

  return (
    <section style={{ borderRadius: 12, border: "1px solid #6b4f2f", background: "#21170e", padding: 12, display: "flex", flexDirection: "column", gap: 10 }}>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
        <h3 style={{ margin: 0, color: "#ffd08a", fontSize: 13 }}>Venue Ticket Authority</h3>
        <Link href="/tickets" style={{ fontSize: 9, color: "#f9c078", textDecoration: "none", fontWeight: 700, letterSpacing: "0.1em" }}>
          VIEW ALL →
        </Link>
      </div>

      {/* Scan Station */}
      <div style={{ background: "#150e05", borderRadius: 8, border: "1px solid #6b4f2f", padding: "8px 10px" }}>
        <div style={{ fontSize: 8, fontWeight: 900, letterSpacing: "0.18em", color: "#f9c078", textTransform: "uppercase", marginBottom: 6 }}>
          Scan Station
        </div>
        <div style={{ display: "flex", gap: 6 }}>
          <input
            value={scanInput}
            onChange={(e) => setScanInput(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && handleScan(scanInput)}
            placeholder="Ticket token or ID..."
            style={{ flex: 1, background: "#0e0905", border: "1px solid #5a3e1a", borderRadius: 6, color: "#ffe2b5", fontSize: 10, padding: "5px 8px" }}
          />
          <button
            onClick={() => handleScan(scanInput)}
            disabled={scanLoading}
            style={{ borderRadius: 6, border: "1px solid #f9c078", background: "#5a3e1a", color: "#ffe2b5", padding: "5px 10px", cursor: "pointer", fontSize: 9, fontWeight: 700 }}
          >
            {scanLoading ? "..." : "SCAN"}
          </button>
        </div>
        <div style={{ display: "flex", gap: 6, marginTop: 6, flexWrap: "wrap" }}>
          {["VIP-1001", "STD-2204", "GUEST-3900"].map((code) => (
            <button
              key={code}
              onClick={() => handleScan(code)}
              style={{ borderRadius: 6, border: "1px solid #f9c078", background: "#5a3e1a", color: "#ffe2b5", padding: "4px 8px", cursor: "pointer", fontSize: 8 }}
            >
              {code}
            </button>
          ))}
        </div>
        {scanResult && (
          <div
            style={{
              marginTop: 6,
              padding: "6px 8px",
              borderRadius: 6,
              border: `1px solid ${scanResult.ok ? "#22c55e55" : "#ef444455"}`,
              background: scanResult.ok ? "#052a0e" : "#2a0505",
              fontSize: 9,
              color: scanResult.ok ? "#86efac" : "#fca5a5",
            }}
          >
            <span style={{ fontWeight: 900 }}>{scanResult.code}</span> · {scanResult.message}
            {scanResult.seat && (
              <span style={{ marginLeft: 6, color: "#fcd34d" }}>{scanResult.seat.label}</span>
            )}
          </div>
        )}
        <div style={{ color: "#c4956a", fontSize: 10, marginTop: 6 }}>
          Last scan: <span style={{ color: "#ffe2b5" }}>{lastScan || "none"}</span>
        </div>
      </div>

      {/* VIP / Backstage Routing */}
      {vipTickets.length > 0 && (
        <div style={{ background: "#150e05", borderRadius: 8, border: "1px solid #FFD70044", padding: "8px 10px" }}>
          <div style={{ fontSize: 8, fontWeight: 900, letterSpacing: "0.18em", color: "#FFD700", textTransform: "uppercase", marginBottom: 6 }}>
            VIP / Backstage Access
          </div>
          {vipTickets.map((t) => (
            <div key={t.id} style={{ display: "flex", alignItems: "center", justifyContent: "space-between", padding: "4px 0", borderBottom: "1px solid #FFD70011" }}>
              <span style={{ fontSize: 9, color: "#fef3c7" }}>{t.ticketType.name}</span>
              <div style={{ display: "flex", gap: 6, alignItems: "center" }}>
                <span style={{ fontSize: 8, color: "#FFD700", fontWeight: 700 }}>{t.status}</span>
                {t.seat ? (
                  <button
                    onClick={() => handleClaimSeat(t.seat!.seat, t.id)}
                    style={{ fontSize: 7, padding: "2px 6px", borderRadius: 4, border: "1px solid #FFD70055", background: "transparent", color: "#FFD700", cursor: "pointer" }}
                  >
                    CLAIM {t.seat.label}
                  </button>
                ) : (
                  <Link href={`/tickets/${t.id}`} style={{ fontSize: 7, color: "#FFD700", textDecoration: "none", fontWeight: 700 }}>
                    VIEW →
                  </Link>
                )}
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Claimed Seat Panel */}
      {claimedSeat && (
        <div style={{ background: "#150e05", borderRadius: 8, border: "1px solid #00FFFF44", padding: "8px 10px" }}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
            <div>
              <div style={{ fontSize: 8, fontWeight: 900, letterSpacing: "0.18em", color: "#00FFFF", textTransform: "uppercase", marginBottom: 2 }}>
                Seat Claimed
              </div>
              <div style={{ fontSize: 10, color: "#d4e0ff", fontWeight: 700 }}>{claimedSeat}</div>
            </div>
            <button
              onClick={() => handleReleaseSeat(claimedSeat)}
              style={{ fontSize: 8, padding: "4px 8px", borderRadius: 5, border: "1px solid #f8717155", background: "transparent", color: "#f87171", cursor: "pointer", fontWeight: 700 }}
            >
              RELEASE
            </button>
          </div>
        </div>
      )}

      {/* Active Ticket Ledger */}
      <div style={{ background: "#150e05", borderRadius: 8, border: "1px solid #5a3e1a", padding: "8px 10px" }}>
        <div style={{ fontSize: 8, fontWeight: 900, letterSpacing: "0.18em", color: "#f9c078", textTransform: "uppercase", marginBottom: 6 }}>
          Ticket Ledger {ticketsLoading ? "·" : `(${activeTickets.length} active)`}
        </div>
        {ticketsLoading ? (
          <div style={{ color: "#c4956a", fontSize: 9 }}>Loading...</div>
        ) : activeTickets.length === 0 ? (
          <div style={{ color: "#8c6a3e", fontSize: 9 }}>
            No active tickets —{" "}
            <Link href="/tickets" style={{ color: "#f9c078" }}>browse events →</Link>
          </div>
        ) : (
          <div style={{ display: "flex", flexDirection: "column", gap: 4 }}>
            {activeTickets.slice(0, 3).map((t) => (
              <div key={t.id} style={{ display: "flex", alignItems: "center", justifyContent: "space-between", padding: "4px 6px", borderRadius: 6, border: "1px solid #6b4f2f", background: "#0e0905" }}>
                <div>
                  <div style={{ fontSize: 9, color: "#ffe2b5", fontWeight: 700 }}>{t.event.title}</div>
                  <div style={{ fontSize: 7, color: "#c4956a" }}>{t.ticketType.name} · {t.seat ? t.seat.label : "GA"}</div>
                </div>
                <div style={{ display: "flex", gap: 4, alignItems: "center" }}>
                  <span style={{ fontSize: 7, padding: "1px 5px", borderRadius: 3, background: "#22c55e22", color: "#86efac", border: "1px solid #22c55e33" }}>
                    {t.status}
                  </span>
                  <Link href={`/tickets/${t.id}`} style={{ fontSize: 7, color: "#f9c078", textDecoration: "none", fontWeight: 700 }}>→</Link>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Guest List / Seat Claims */}
      <div style={{ background: "#150e05", borderRadius: 8, border: "1px solid #5a3e1a", padding: "8px 10px" }}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 6 }}>
          <div style={{ fontSize: 8, fontWeight: 900, letterSpacing: "0.18em", color: "#f9c078", textTransform: "uppercase" }}>
            Guest List
          </div>
          <span style={{ fontSize: 8, color: "#c4956a" }}>{Object.keys(guestList).length} seated</span>
        </div>
        {Object.keys(guestList).length === 0 ? (
          <div style={{ color: "#8c6a3e", fontSize: 9 }}>No active seat claims</div>
        ) : (
          <div style={{ display: "flex", flexDirection: "column", gap: 3 }}>
            {Object.entries(guestList).slice(0, 4).map(([seatId, userId]) => (
              <div key={seatId} style={{ display: "flex", justifyContent: "space-between", alignItems: "center", padding: "3px 6px", borderRadius: 5, border: "1px solid #5a3e1a33", background: "#0e0905" }}>
                <span style={{ fontSize: 8, color: "#ffe2b5" }}>{seatId}</span>
                <span style={{ fontSize: 7, color: "#c4956a", overflow: "hidden", textOverflow: "ellipsis", maxWidth: 80, whiteSpace: "nowrap" }}>{userId}</span>
              </div>
            ))}
          </div>
        )}
      </div>
    </section>
  );
}
