"use client";

import { useEffect, useMemo, useState } from "react";
import HomeFeedObserver from "@/components/admin/HomeFeedObserver";
import { getSystemEventLog, subscribeSystemEvent, type SystemEvent } from "@/lib/systemEventBus";

export default function AdminLiveFeedExplorer() {
  const [events, setEvents] = useState<SystemEvent[]>(() => getSystemEventLog());

  useEffect(() => {
    return subscribeSystemEvent(() => {
      setEvents(getSystemEventLog());
    });
  }, []);

  const recentEvents = useMemo(() => events.slice(0, 14), [events]);

  return (
    <section
      style={{
        border: "1px solid rgba(45,212,191,0.45)",
        borderRadius: 14,
        background: "linear-gradient(180deg, rgba(2,20,23,0.86), rgba(2,6,23,0.95))",
        padding: 10,
        display: "grid",
        gridTemplateRows: "auto auto",
        gap: 10,
      }}
    >
      <div>
        <h3 style={{ margin: 0, color: "#5eead4", fontSize: 11, letterSpacing: "0.16em", textTransform: "uppercase" }}>
          Live Feed Explorer
        </h3>
        <p style={{ margin: "4px 0 8px", color: "#99f6e4", fontSize: 10 }}>
          Action log + feed state from systemEventBus and home feed observer
        </p>
        <div style={{ maxHeight: 160, overflow: "auto", display: "grid", gap: 6 }}>
          {recentEvents.length ? (
            recentEvents.map((event) => (
              <article
                key={event.id}
                style={{ border: "1px solid rgba(45,212,191,0.3)", borderRadius: 8, padding: "6px 8px", background: "rgba(15,118,110,0.12)" }}
              >
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", fontSize: 9, color: "#99f6e4" }}>
                  <span>{event.type}</span>
                  <span>{new Date(event.timestamp).toLocaleTimeString()}</span>
                </div>
                <div style={{ color: "#e6fffb", fontSize: 10, marginTop: 2 }}>{event.message}</div>
                <div style={{ color: "#99f6e4", fontSize: 9, marginTop: 2 }}>
                  actor: {event.actor} · section: {event.sectionId ?? "n/a"} · route: {event.route ?? "n/a"}
                </div>
                {(event.eventName || event.artistId || event.performerId || event.sourceHomepage || event.sourceFrame) ? (
                  <div style={{ color: "#5eead4", fontSize: 9, marginTop: 2 }}>
                    event: {event.eventName ?? "n/a"} · artistId: {event.artistId ?? "n/a"} · performerId: {event.performerId ?? "n/a"} · homepage: {event.sourceHomepage ?? "n/a"} · frame: {event.sourceFrame ?? "n/a"}
                  </div>
                ) : null}
              </article>
            ))
          ) : (
            <div style={{ color: "#99f6e4", fontSize: 10 }}>No events yet.</div>
          )}
        </div>
      </div>

      <HomeFeedObserver title="HOME1-5 FEED SNAPSHOT" />
    </section>
  );
}
