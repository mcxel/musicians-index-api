"use client";

import { useState } from "react";

export default function BookingProfitRail() {
  const [ticketAdjustment, setTicketAdjustment] = useState(6);

  return (
    <section style={{ border: "1px solid rgba(0,255,255,0.24)", borderRadius: 12, background: "rgba(8,30,39,0.4)", padding: 12 }}>
      <p style={{ margin: "0 0 8px", color: "#67e8f9", fontSize: 10, fontWeight: 800, letterSpacing: "0.15em", textTransform: "uppercase" }}>
        Booking Profit Rail
      </p>
      <div style={{ display: "grid", gridTemplateColumns: "repeat(3, minmax(0,1fr))", gap: 8, marginBottom: 10 }}>
        {[{ k: "Venue split", v: "42%" }, { k: "Attendance", v: "78%" }, { k: "No-show risk", v: "11%" }].map((item) => (
          <div key={item.k} style={{ border: "1px solid rgba(103,232,249,0.2)", borderRadius: 8, padding: "7px 8px", background: "rgba(0,0,0,0.25)" }}>
            <p style={{ margin: 0, color: "#94a3b8", fontSize: 9 }}>{item.k}</p>
            <p style={{ margin: "4px 0 0", color: "#e0f2fe", fontSize: 12, fontWeight: 700 }}>{item.v}</p>
          </div>
        ))}
      </div>
      <label style={{ display: "grid", gap: 4 }}>
        <span style={{ color: "#a5f3fc", fontSize: 11 }}>Dynamic ticket price adjustment: +{ticketAdjustment}%</span>
        <input type="range" min={-10} max={20} value={ticketAdjustment} onChange={(event) => setTicketAdjustment(Number(event.target.value))} style={{ accentColor: "#06b6d4" }} />
      </label>
    </section>
  );
}
