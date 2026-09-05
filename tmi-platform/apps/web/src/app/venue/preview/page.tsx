"use client";

/**
 * /venue/preview — Canonical PREVIEW VENUE / VENUE TEST entry.
 * Same ArenaEventShell → UniversalVenueRenderer path as GO LIVE.
 * Shareable roomId query so PC + phone open the same session.
 */

import { Suspense, useMemo } from "react";
import { useSearchParams } from "next/navigation";
import Link from "next/link";
import VenuePreviewStage from "@/components/venues/VenuePreviewStage";
import {
  buildPreviewRoomId,
  eventTypeFromPreviewQuery,
  listPreviewableSkins,
  parsePreviewViewMode,
  parseTestOccupancyLevel,
  previewRouteHref,
} from "@/lib/venues/VenuePreviewCertification";
import type { VenueEnvironmentKind } from "@/lib/venues/EventVenueEnvironment";

function VenuePreviewInner() {
  const searchParams = useSearchParams();
  const search = searchParams ?? new URLSearchParams();

  const skinId = search.get("skin") || "red-theater";
  const sessionKey = search.get("session") || "shared";
  const roomId =
    search.get("roomId") || buildPreviewRoomId({ skinId, sessionKey });
  const envRaw = (search.get("env") || "indoor").toLowerCase();
  const environment: VenueEnvironmentKind =
    envRaw === "outdoor" ? "outdoor" : "indoor";
  const eventType = eventTypeFromPreviewQuery(search.get("event"));
  const occupancy = parseTestOccupancyLevel(search.get("occ"));
  const viewMode = parsePreviewViewMode(search.get("view"));
  const isCertification = search.get("cert") === "1";

  const skins = useMemo(() => listPreviewableSkins(), []);

  const shareHref = previewRouteHref({
    roomId,
    skinId,
    environment,
    eventType,
    occupancy,
    viewMode,
    cert: isCertification,
    sessionKey,
  });

  return (
    <main style={{ minHeight: "100vh", background: "#050510", color: "#fff" }}>
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
        <Link
          href="/hub/performer"
          style={{ fontSize: 9, color: "rgba(255,255,255,0.45)", textDecoration: "none" }}
        >
          ← PERFORMER HUB
        </Link>
        <span style={{ fontSize: 10, fontWeight: 900, letterSpacing: "0.16em", color: "#FFD700" }}>
          VENUE PREVIEW
        </span>
        <select
          value={skinId}
          onChange={(e) => {
            const next = previewRouteHref({
              skinId: e.target.value,
              environment,
              eventType,
              occupancy,
              viewMode,
              cert: isCertification,
              sessionKey,
            });
            window.location.href = next;
          }}
          style={{
            background: "#0a0614",
            color: "#00FFFF",
            border: "1px solid rgba(0,255,255,0.35)",
            borderRadius: 6,
            padding: "4px 8px",
            fontSize: 11,
          }}
        >
          {skins.map((s) => (
            <option key={s.id} value={s.id}>
              {s.name} ({s.certificationStatus ?? "DRAFT"})
            </option>
          ))}
        </select>
        <select
          value={environment}
          onChange={(e) => {
            window.location.href = previewRouteHref({
              roomId,
              skinId,
              environment: e.target.value as VenueEnvironmentKind,
              eventType,
              occupancy,
              viewMode,
              cert: isCertification,
              sessionKey,
            });
          }}
          style={{
            background: "#0a0614",
            color: "#fff",
            border: "1px solid rgba(255,255,255,0.2)",
            borderRadius: 6,
            padding: "4px 8px",
            fontSize: 11,
          }}
        >
          <option value="indoor">INDOOR</option>
          <option value="outdoor">OUTDOOR</option>
        </select>
        <select
          value={eventType}
          onChange={(e) => {
            window.location.href = previewRouteHref({
              roomId,
              skinId,
              environment,
              eventType: eventTypeFromPreviewQuery(e.target.value),
              occupancy,
              viewMode,
              cert: isCertification,
              sessionKey,
            });
          }}
          style={{
            background: "#0a0614",
            color: "#fff",
            border: "1px solid rgba(255,255,255,0.2)",
            borderRadius: 6,
            padding: "4px 8px",
            fontSize: 11,
          }}
        >
          <option value="live-show">LIVE SHOW (theater)</option>
          <option value="concert">OUTDOOR CONCERT</option>
          <option value="world-dance-party">WORLD DANCE PARTY / FESTIVAL</option>
          <option value="slow-jams">SLOW JAMS (Under the Stars)</option>
          <option value="battle">BATTLE</option>
          <option value="cypher">CYPHER</option>
        </select>
        <Link
          href={previewRouteHref({
            roomId,
            skinId,
            environment,
            eventType,
            occupancy,
            viewMode,
            cert: !isCertification,
            sessionKey,
          })}
          style={{
            fontSize: 9,
            fontWeight: 800,
            color: isCertification ? "#00FF88" : "#AA2DFF",
            textDecoration: "none",
            border: "1px solid currentColor",
            padding: "4px 8px",
            borderRadius: 6,
          }}
        >
          {isCertification ? "CERT MODE ON" : "OPEN CERT MODE"}
        </Link>
        <button
          type="button"
          onClick={() => {
            void navigator.clipboard?.writeText(
              typeof window !== "undefined"
                ? `${window.location.origin}${shareHref}`
                : shareHref,
            );
          }}
          style={{
            marginLeft: "auto",
            fontSize: 9,
            fontWeight: 800,
            color: "#00FFFF",
            background: "transparent",
            border: "1px solid rgba(0,255,255,0.4)",
            padding: "4px 10px",
            borderRadius: 6,
            cursor: "pointer",
          }}
        >
          COPY SHARE URL
        </button>
      </div>

      <VenuePreviewStage
        roomId={roomId}
        eventType={eventType}
        venueEnvironment={environment}
        venueSkinId={skinId}
        isCertification={isCertification}
        initialOccupancy={occupancy}
        initialViewMode={viewMode}
      />
    </main>
  );
}

export default function VenuePreviewPage() {
  return (
    <Suspense
      fallback={
        <main style={{ minHeight: "100vh", background: "#050510", color: "#fff", padding: 40 }}>
          Loading venue preview…
        </main>
      }
    >
      <VenuePreviewInner />
    </Suspense>
  );
}
