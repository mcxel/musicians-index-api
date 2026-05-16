"use client";

import { useState } from "react";

const tiers = ["VIP", "STANDARD", "BACKSTAGE", "MEET_AND_GREET", "SPONSOR_GIFT", "SEASON_PASS", "BATTLE_PASS", "RAFFLE_PASS"];

export default function TicketsCreatePage() {
  const [tier, setTier] = useState("STANDARD");
  const [ticketId, setTicketId] = useState("");
  const [status, setStatus] = useState("");

  const create = async () => {
    setStatus("Creating ticket...");
    const faceValue = tier === "VIP" ? 120 : tier === "BACKSTAGE" ? 220 : 40;
    const response = await fetch("/api/tickets/create", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        ownerId: "demo-user",
        venueSlug: "test-venue",
        eventSlug: "night-battle",
        tier,
        faceValue,
        venueLogo: "TEST_VENUE",
        sponsorLogo: "SPONSOR_ONE",
        eventBranding: "NIGHT_BATTLE",
      }),
    });
    const payload = await response.json();
    if (!response.ok) {
      setStatus(payload?.error ?? "create_failed");
      return;
    }
    setTicketId(payload.ticket.id);
    setStatus(`Created ${payload.ticket.id}`);
  };

  return (
    <main style={{ minHeight: "100vh", background: "#080612", color: "#fff", padding: 20 }}>
      <section style={{ maxWidth: 860, margin: "0 auto", border: "1px solid #5f4485", borderRadius: 16, background: "#140d22", padding: 20 }}>
        <h1 style={{ marginTop: 0 }}>Ticket Create</h1>
        <p style={{ color: "#cbb7e8", fontSize: 13 }}>Create production-grade tickets with branding and royalty splits.</p>
        <div style={{ display: "flex", gap: 8, flexWrap: "wrap", marginBottom: 12 }}>
          {tiers.map((entry) => (
            <button key={entry} onClick={() => setTier(entry)} style={{ borderRadius: 18, border: tier === entry ? "1px solid #8cf0ff" : "1px solid #4c3669", background: tier === entry ? "#1f3e57" : "#1a1029", color: "#e7dcfb", fontSize: 12, padding: "6px 10px", cursor: "pointer" }}>
              {entry}
            </button>
          ))}
        </div>
        <button onClick={create} style={{ borderRadius: 10, border: "1px solid #86ffc7", background: "#1a5238", color: "#d1ffea", padding: "8px 12px", cursor: "pointer" }}>Create Ticket</button>
        <div style={{ marginTop: 12, fontSize: 12, color: "#d9c9f1" }}>{status}</div>
        {ticketId ? <div style={{ marginTop: 6, fontSize: 12, color: "#bde6ff" }}>Use ticket ID in print/scan/validate: {ticketId}</div> : null}
      </section>
    </main>
  );
}
