"use client";

import { Suspense } from "react";
import { useParams, useSearchParams } from "next/navigation";
import Link from "next/link";
import VenuePreviewStage from "@/components/venues/VenuePreviewStage";
import {
  buildPreviewRoomId,
  eventTypeFromPreviewQuery,
  listPreviewableSkins,
  parsePreviewViewMode,
  parseTestOccupancyLevel,
} from "@/lib/venues/VenuePreviewCertification";
import type { VenueEnvironmentKind } from "@/lib/venues/EventVenueEnvironment";

function VenuePreviewPageInner() {
  const rawParams = useParams<{ venueId: string }>();
  const searchParams = useSearchParams();
  const search = searchParams ?? new URLSearchParams();

  const venueId = rawParams?.venueId ?? "default";
  const sessionKey = search.get("session") || "shared";
  const roomId = buildPreviewRoomId({ skinId: venueId, sessionKey });

  const skinId = search.get("skin") || venueId;
  const envRaw = (search.get("env") || "indoor").toLowerCase();
  const environment: VenueEnvironmentKind = envRaw === "outdoor" ? "outdoor" : "indoor";
  const eventType = eventTypeFromPreviewQuery(search.get("event"));
  const occupancy = parseTestOccupancyLevel(search.get("occ"));
  const viewMode = parsePreviewViewMode(search.get("view"));
  const isCertification = search.get("cert") === "1";

  const skins = listPreviewableSkins();

  function livePreviewHref(overrides: {
    skin?: string;
    env?: VenueEnvironmentKind;
    event?: string;
    cert?: boolean;
  }): string {
    const p = new URLSearchParams();
    const s = overrides.skin ?? skinId;
    p.set("skin", s);
    p.set("env", overrides.env ?? environment);
    if (overrides.event ?? search.get("event")) p.set("event", overrides.event ?? eventType);
    if (search.get("occ")) p.set("occ", search.get("occ")!);
    if (search.get("view")) p.set("view", search.get("view")!);
    if (overrides.cert ?? isCertification) p.set("cert", "1");
    p.set("session", sessionKey);
    return `/live/venue-preview/${encodeURIComponent(s)}?${p.toString()}`;
  }

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
        <Link href="/hub/performer" style={{ fontSize: 9, color: "rgba(255,255,255,0.45)", textDecoration: "none" }}>
          ← PERFORMER HUB
        </Link>
        <span style={{ fontSize: 10, fontWeight: 900, letterSpacing: "0.16em", color: "#FFD700", border: "1px solid rgba(255,215,0,0.4)", padding: "3px 8px", borderRadius: 6 }}>
          VENUE PREVIEW
        </span>
        <select
          defaultValue={skinId}
          onChange={(e) => { window.location.href = livePreviewHref({ skin: e.target.value }); }}
          style={{ background: "#0a0614", color: "#00FFFF", border: "1px solid rgba(0,255,255,0.35)", borderRadius: 6, padding: "4px 8px", fontSize: 11 }}
        >
          {skins.map((s) => (
            <option key={s.id} value={s.id}>{s.name} ({s.certificationStatus ?? "DRAFT"})</option>
          ))}
        </select>
        <select
          defaultValue={environment}
          onChange={(e) => { window.location.href = livePreviewHref({ env: e.target.value as VenueEnvironmentKind }); }}
          style={{ background: "#0a0614", color: "#fff", border: "1px solid rgba(255,255,255,0.2)", borderRadius: 6, padding: "4px 8px", fontSize: 11 }}
        >
          <option value="indoor">INDOOR</option>
          <option value="outdoor">OUTDOOR</option>
        </select>
        <select
          defaultValue={eventType}
          onChange={(e) => { window.location.href = livePreviewHref({ event: e.target.value }); }}
          style={{ background: "#0a0614", color: "#fff", border: "1px solid rgba(255,255,255,0.2)", borderRadius: 6, padding: "4px 8px", fontSize: 11 }}
        >
          <option value="live-show">LIVE SHOW</option>
          <option value="concert">OUTDOOR CONCERT</option>
          <option value="world-dance-party">WORLD DANCE PARTY</option>
          <option value="slow-jams">SLOW JAMS</option>
          <option value="battle">BATTLE</option>
          <option value="cypher">CYPHER</option>
        </select>
        <Link
          href={livePreviewHref({ cert: !isCertification })}
          style={{ fontSize: 9, fontWeight: 800, color: isCertification ? "#00FF88" : "#AA2DFF", textDecoration: "none", border: "1px solid currentColor", padding: "4px 8px", borderRadius: 6 }}
        >
          {isCertification ? "CERT MODE ON" : "OPEN CERT MODE"}
        </Link>
        <button
          type="button"
          onClick={() => { void navigator.clipboard?.writeText(typeof window !== "undefined" ? `${window.location.origin}${livePreviewHref({})}` : livePreviewHref({})); }}
          style={{ marginLeft: "auto", fontSize: 9, fontWeight: 800, color: "#00FFFF", background: "transparent", border: "1px solid rgba(0,255,255,0.4)", padding: "4px 10px", borderRadius: 6, cursor: "pointer" }}
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

export default function VenuePreviewDynamicPage() {
  return (
    <Suspense fallback={<main style={{ minHeight: "100vh", background: "#050510", color: "#fff", padding: 40 }}>Loading venue preview…</main>}>
      <VenuePreviewPageInner />
    </Suspense>
  );
}
