"use client";

import Link from "next/link";
import { useState, useEffect } from "react";

type Event = {
  name: string;
  when: string;
};

export default function Home3EventCalendarStrip() {
  const [events, setEvents] = useState<Event[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch("/api/events/upcoming?limit=3")
      .then((r) => (r.ok ? r.json() : null))
      .then((data: unknown) => {
        if (!Array.isArray(data)) {
          setLoading(false);
          return;
        }
        setEvents(
          (data as Array<any>).map((evt) => ({
            name: evt.name || "Unnamed Event",
            when: evt.when || "TBD",
          }))
        );
        setLoading(false);
      })
      .catch(() => {
        setLoading(false);
      });
  }, []);

  return (
    <section style={{ maxWidth: 1100, margin: "0 auto", padding: "26px 24px 12px" }}>
      <div style={{ border: "1px solid rgba(0,255,255,0.35)", borderRadius: 10, background: "rgba(0,255,255,0.08)", padding: "10px 12px", display: "grid", gap: 8 }}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
          <strong style={{ fontSize: 10, textTransform: "uppercase", letterSpacing: "0.12em", color: "#00ffff" }}>Event Calendar</strong>
          <Link href="/events" style={{ color: "#ffffff", fontSize: 10, textDecoration: "none" }}>All Events</Link>
        </div>
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(180px, 1fr))", gap: 8 }}>
          {loading ? (
            <div style={{ gridColumn: "1 / -1", padding: "12px", textAlign: "center", color: "rgba(255,255,255,0.4)", fontSize: 12 }}>
              Loading events...
            </div>
          ) : events.length === 0 ? (
            <div style={{ gridColumn: "1 / -1", padding: "12px", textAlign: "center", color: "rgba(255,255,255,0.4)", fontSize: 12 }}>
              No events scheduled.
            </div>
          ) : (
            events.map((event) => (
              <div key={event.name} style={{ border: "1px solid rgba(255,255,255,0.2)", borderRadius: 8, padding: "8px 10px" }}>
                <div style={{ fontSize: 11, color: "#fff", fontWeight: 700 }}>{event.name}</div>
                <div style={{ fontSize: 10, color: "rgba(255,255,255,0.75)" }}>{event.when}</div>
              </div>
            ))
          )}
        </div>
      </div>
    </section>
  );
}