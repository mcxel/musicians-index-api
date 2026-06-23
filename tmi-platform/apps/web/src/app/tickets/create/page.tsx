"use client";

import Link from "next/link";
import { useEffect, useState } from "react";

// Rule 17: Ticket inventory creation is restricted to Venue, Promoter, and Admin accounts.
// Fans and Performers may only buy/own tickets — they never create or allocate inventory.

const AUTHORIZED_ROLES = new Set(["VENUE", "PROMOTER", "ADMIN", "SUPERADMIN", "OWNER"]);

const TIERS = ["VIP", "STANDARD", "BACKSTAGE", "MEET_AND_GREET", "SPONSOR_GIFT", "SEASON_PASS", "BATTLE_PASS", "RAFFLE_PASS"];

export default function TicketsCreatePage() {
  const [role, setRole] = useState<string | null>(null);
  const [tier, setTier] = useState("STANDARD");
  const [venueSlug, setVenueSlug] = useState("");
  const [eventSlug, setEventSlug] = useState("");
  const [faceValue, setFaceValue] = useState(40);
  const [ticketId, setTicketId] = useState("");
  const [status, setStatus] = useState("");

  // Read role from cookie on mount (client-side only)
  useEffect(() => {
    const match = document.cookie.match(/(?:^|; )tmi_role=([^;]*)/);
    setRole(match ? decodeURIComponent(match[1]).toUpperCase() : "GUEST");
  }, []);

  const isAuthorized = role !== null && AUTHORIZED_ROLES.has(role);

  const create = async () => {
    setStatus("Creating ticket…");
    const priceMap: Record<string, number> = {
      VIP: 120, BACKSTAGE: 220, MEET_AND_GREET: 180, SEASON_PASS: 320,
      BATTLE_PASS: 180, RAFFLE_PASS: 25, SPONSOR_GIFT: 0, STANDARD: 40,
    };
    const resolvedFaceValue = faceValue || priceMap[tier] || 40;
    const response = await fetch("/api/tickets/create", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        venueSlug: venueSlug.trim() || "tmi-venue",
        eventSlug: eventSlug.trim() || "main-event",
        tier,
        faceValue: resolvedFaceValue,
      }),
    });
    const payload = await response.json();
    if (!response.ok) {
      setStatus(payload?.message ?? payload?.error ?? "create_failed");
      return;
    }
    setTicketId(payload.ticket.id);
    setStatus(`Created ${payload.ticket.id}`);
  };

  // Loading state — waiting for role cookie
  if (role === null) {
    return (
      <main style={{ minHeight: "100vh", background: "#080612", color: "#fff", padding: 20, display: "flex", alignItems: "center", justifyContent: "center" }}>
        <div style={{ color: "rgba(255,255,255,0.4)", fontSize: 12 }}>Checking access…</div>
      </main>
    );
  }

  // Not authorized — Fans and Performers see a clear rejection
  if (!isAuthorized) {
    return (
      <main style={{ minHeight: "100vh", background: "#080612", color: "#fff", padding: 20, display: "flex", alignItems: "center", justifyContent: "center", fontFamily: "'Inter', sans-serif" }}>
        <div style={{ maxWidth: 480, textAlign: "center" }}>
          <div style={{ fontSize: 48, marginBottom: 16 }}>🚫</div>
          <div style={{ fontSize: 11, letterSpacing: "0.3em", color: "#FF4444", fontWeight: 900, marginBottom: 12 }}>ACCESS RESTRICTED</div>
          <h1 style={{ fontSize: 22, fontWeight: 900, margin: "0 0 12px" }}>Venue &amp; Promoter Only</h1>
          <p style={{ fontSize: 13, color: "rgba(255,255,255,0.5)", lineHeight: 1.7, marginBottom: 24 }}>
            Ticket inventory can only be created by <strong>Venue</strong>, <strong>Promoter</strong>, or <strong>Admin</strong> accounts.
            As a {role.charAt(0) + role.slice(1).toLowerCase()}, you can browse events and purchase tickets.
          </p>
          <div style={{ display: "flex", gap: 10, justifyContent: "center", flexWrap: "wrap" }}>
            <Link href="/venues" style={{ padding: "10px 22px", background: "#FF2DAA", borderRadius: 8, color: "#fff", fontWeight: 800, fontSize: 12, textDecoration: "none" }}>
              Browse Events
            </Link>
            <Link href="/fan/tickets" style={{ padding: "10px 22px", background: "rgba(255,255,255,0.06)", border: "1px solid rgba(255,255,255,0.15)", borderRadius: 8, color: "rgba(255,255,255,0.7)", fontWeight: 700, fontSize: 12, textDecoration: "none" }}>
              My Tickets
            </Link>
          </div>
        </div>
      </main>
    );
  }

  return (
    <main style={{ minHeight: "100vh", background: "#080612", color: "#fff", padding: 20, fontFamily: "'Inter', sans-serif" }}>
      <section style={{ maxWidth: 860, margin: "0 auto", border: "1px solid #5f4485", borderRadius: 16, background: "#140d22", padding: 20 }}>
        <div style={{ fontSize: 9, letterSpacing: "0.3em", color: "#22c55e", fontWeight: 900, marginBottom: 4 }}>VENUE / PROMOTER / ADMIN</div>
        <h1 style={{ marginTop: 0 }}>Create Ticket Inventory</h1>
        <p style={{ color: "#cbb7e8", fontSize: 13 }}>Create tickets with branding and royalty splits. Only authorized roles see this page.</p>

        <div style={{ marginBottom: 12 }}>
          <label style={{ fontSize: 9, letterSpacing: "0.15em", color: "rgba(255,255,255,0.4)", display: "block", marginBottom: 4 }}>VENUE SLUG</label>
          <input value={venueSlug} onChange={(e) => setVenueSlug(e.target.value)} placeholder="e.g. cypher-arena" style={{ width: "100%", boxSizing: "border-box", background: "rgba(255,255,255,0.05)", border: "1px solid #4c3669", borderRadius: 7, color: "#e7dcfb", fontSize: 12, padding: "7px 10px", marginBottom: 8 }} />
          <label style={{ fontSize: 9, letterSpacing: "0.15em", color: "rgba(255,255,255,0.4)", display: "block", marginBottom: 4 }}>EVENT SLUG</label>
          <input value={eventSlug} onChange={(e) => setEventSlug(e.target.value)} placeholder="e.g. battle-night-s2-finals" style={{ width: "100%", boxSizing: "border-box", background: "rgba(255,255,255,0.05)", border: "1px solid #4c3669", borderRadius: 7, color: "#e7dcfb", fontSize: 12, padding: "7px 10px", marginBottom: 8 }} />
          <label style={{ fontSize: 9, letterSpacing: "0.15em", color: "rgba(255,255,255,0.4)", display: "block", marginBottom: 4 }}>FACE VALUE ($)</label>
          <input type="number" min={0} value={faceValue} onChange={(e) => setFaceValue(Number(e.target.value))} style={{ width: 100, background: "rgba(255,255,255,0.05)", border: "1px solid #4c3669", borderRadius: 7, color: "#FFD700", fontSize: 12, padding: "7px 10px" }} />
        </div>

        <div style={{ display: "flex", gap: 8, flexWrap: "wrap", marginBottom: 12 }}>
          {TIERS.map((entry) => (
            <button key={entry} onClick={() => setTier(entry)} style={{ borderRadius: 18, border: tier === entry ? "1px solid #8cf0ff" : "1px solid #4c3669", background: tier === entry ? "#1f3e57" : "#1a1029", color: "#e7dcfb", fontSize: 12, padding: "6px 10px", cursor: "pointer" }}>
              {entry}
            </button>
          ))}
        </div>
        <button onClick={create} style={{ borderRadius: 10, border: "1px solid #86ffc7", background: "#1a5238", color: "#d1ffea", padding: "8px 12px", cursor: "pointer", fontWeight: 800 }}>
          Create Ticket
        </button>
        <div style={{ marginTop: 12, fontSize: 12, color: "#d9c9f1" }}>{status}</div>
        {ticketId && (
          <div style={{ marginTop: 6, fontSize: 12, color: "#bde6ff" }}>
            Ticket ID: <strong>{ticketId}</strong> —{" "}
            <Link href={`/tickets/print/${encodeURIComponent(ticketId)}`} style={{ color: "#00FFFF", textDecoration: "none", fontWeight: 700 }}>
              View &amp; Print →
            </Link>
          </div>
        )}
      </section>
    </main>
  );
}
