"use client";

import Link from "next/link";

const EVENTS = [
  { name: "Friday Battle Finals", when: "Fri 8:00 PM" },
  { name: "Saturday Cypher Open", when: "Sat 10:00 PM" },
  { name: "Sunday Premiere Block", when: "Sun 7:00 PM" },
];

export default function Home3EventCalendarStrip() {
  return (
    <section style={{ maxWidth: 1100, margin: "0 auto", padding: "26px 24px 12px" }}>
      <div style={{ border: "1px solid rgba(0,255,255,0.35)", borderRadius: 10, background: "rgba(0,255,255,0.08)", padding: "10px 12px", display: "grid", gap: 8 }}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
          <strong style={{ fontSize: 10, textTransform: "uppercase", letterSpacing: "0.12em", color: "#00ffff" }}>Event Calendar Strip</strong>
          <Link href="/events" style={{ color: "#ffffff", fontSize: 10, textDecoration: "none" }}>All Events</Link>
        </div>
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(180px, 1fr))", gap: 8 }}>
          {EVENTS.map((event) => (
            <div key={event.name} style={{ border: "1px solid rgba(255,255,255,0.2)", borderRadius: 8, padding: "8px 10px" }}>
              <div style={{ fontSize: 11, color: "#fff", fontWeight: 700 }}>{event.name}</div>
              <div style={{ fontSize: 10, color: "rgba(255,255,255,0.75)" }}>{event.when}</div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}