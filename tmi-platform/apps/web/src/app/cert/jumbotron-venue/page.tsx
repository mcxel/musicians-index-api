"use client";

/**
 * /cert/jumbotron-venue — lightweight public LOOK UP cert surface.
 * Mounts the same VenueAutomatedJumbotronMount used by ArenaEventShell,
 * without pulling UniversalVenueRenderer (avoids OOM/compile starvation).
 */

import { useMemo } from "react";
import { useSearchParams } from "next/navigation";
import { Suspense } from "react";
import VenueAutomatedJumbotronMount from "@/components/jumbotron/VenueAutomatedJumbotronMount";

const ALLOWED = [
  "battle",
  "cypher",
  "world-dance-party",
  "monday-stage",
  "live-show",
  "concert",
] as const;

function CertInner() {
  const search = useSearchParams();
  const rawEvent = search?.get("event") || "battle";
  const eventType = (ALLOWED as readonly string[]).includes(rawEvent)
    ? rawEvent
    : "battle";
  const lookUpRaw = search?.get("lookUp") ?? "1";
  const jumbotronLookUpActive = lookUpRaw !== "0" && lookUpRaw !== "false";
  const sessionToken = useMemo(
    () => `jumbotron-presence-cert-${eventType}`,
    [eventType],
  );

  const stageHref = `/cert/jumbotron-venue?event=${encodeURIComponent(eventType)}&lookUp=0`;
  const lookUpHref = `/cert/jumbotron-venue?event=${encodeURIComponent(eventType)}&lookUp=1`;

  return (
    <main
      data-cert-jumbotron-venue="true"
      data-presence-session={sessionToken}
      style={{
        minHeight: "100vh",
        background: "#050510",
        color: "#fff",
        position: "relative",
      }}
    >
      <div
        style={{
          display: "flex",
          flexWrap: "wrap",
          gap: 8,
          alignItems: "center",
          padding: "10px 14px",
          borderBottom: "1px solid rgba(255,255,255,0.08)",
        }}
      >
        <span
          style={{
            fontSize: 10,
            fontWeight: 900,
            letterSpacing: "0.16em",
            color: "#FFD700",
          }}
        >
          JUMBOTRON VENUE CERT
        </span>
        <span style={{ fontSize: 9, color: "rgba(255,255,255,0.45)" }}>
          event={eventType} · LOOK UP {jumbotronLookUpActive ? "ON" : "OFF"}
        </span>
        <a
          href={jumbotronLookUpActive ? stageHref : lookUpHref}
          data-testid="btn-venue-look-up-jumbotron"
          style={{
            marginLeft: "auto",
            padding: "6px 12px",
            fontSize: 9,
            fontWeight: 900,
            letterSpacing: "0.12em",
            textDecoration: "none",
            borderRadius: 6,
            border: jumbotronLookUpActive ? "1px solid #FF2DAA" : "1px solid #00FFFF",
            color: jumbotronLookUpActive ? "#FF2DAA" : "#00FFFF",
            background: jumbotronLookUpActive
              ? "rgba(255,45,170,0.18)"
              : "rgba(0,255,255,0.1)",
          }}
        >
          {jumbotronLookUpActive ? "RETURN TO STAGE" : "LOOK UP / FOCUS JUMBOTRON"}
        </a>
        <span
          data-testid="venue-look-up-focus-indicator"
          data-session-token={sessionToken}
          style={{ fontSize: 8, color: "rgba(255,255,255,0.5)", fontWeight: 700 }}
        >
          {jumbotronLookUpActive ? "JUMBOTRON FOCUS" : "STAGE VIEW"}
        </span>
      </div>

      <div
        style={{
          position: "relative",
          minHeight: "70vh",
          background:
            "radial-gradient(ellipse at 50% 30%, rgba(0,255,255,0.08), transparent 55%), #050510",
        }}
      >
        <div
          style={{
            position: "absolute",
            inset: 0,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            opacity: 0.35,
            fontSize: 11,
            letterSpacing: "0.2em",
            fontWeight: 800,
            color: "#00FFFF",
            pointerEvents: "none",
          }}
        >
          STAGE PLANE · LOOK UP REVEALS WORLD JUMBOTRON
        </div>
        <VenueAutomatedJumbotronMount
          roomId={`cert-jumbo-${eventType}`}
          eventType={eventType}
          venueId={`cert-venue-${eventType}`}
          lookUpActive={jumbotronLookUpActive}
        />
      </div>
    </main>
  );
}

export default function JumbotronVenueCertPage() {
  return (
    <Suspense
      fallback={
        <main style={{ minHeight: "100vh", background: "#050510", color: "#fff", padding: 40 }}>
          Loading jumbotron venue cert…
        </main>
      }
    >
      <CertInner />
    </Suspense>
  );
}
