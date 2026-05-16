"use client";

import { useState } from "react";

export default function TicketsValidatePage() {
  const [ticketId, setTicketId] = useState("");
  const [result, setResult] = useState("");

  const validate = async () => {
    setResult("Validating...");
    const response = await fetch("/api/tickets/validate", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ ticketId }),
    });
    const payload = await response.json();
    if (!response.ok) {
      setResult(payload?.error ?? "validation_failed");
      return;
    }
    setResult(payload.valid ? "Valid ticket" : `Invalid: ${payload.reason}`);
  };

  return (
    <main style={{ minHeight: "100vh", background: "#080612", color: "#fff", padding: 20 }}>
      <section style={{ maxWidth: 760, margin: "0 auto", border: "1px solid #5f4485", borderRadius: 16, background: "#140d22", padding: 20 }}>
        <h1 style={{ marginTop: 0 }}>Ticket Validate</h1>
        <input value={ticketId} onChange={(event) => setTicketId(event.target.value)} placeholder="ticket id" style={{ width: "100%", borderRadius: 8, border: "1px solid #614687", background: "#0f0919", color: "#efe4ff", padding: "8px 10px", marginBottom: 10 }} />
        <button onClick={validate} style={{ borderRadius: 10, border: "1px solid #8dd5ff", background: "#204e71", color: "#d8f0ff", padding: "8px 12px", cursor: "pointer" }}>Validate Ticket</button>
        <div style={{ marginTop: 10, color: "#d5c2ef", fontSize: 12 }}>{result}</div>
      </section>
    </main>
  );
}
