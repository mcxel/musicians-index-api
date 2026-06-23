"use client";

/**
 * PlaylistCanister — Rule 15 canonical canister.
 * Embeds the TMI playlist engine (PlaylistArtifact) for any surface.
 * Shows real tracks from the artifact engine with add/play controls.
 * Empty state: "No tracks yet."
 */

import dynamic from "next/dynamic";
import Link from "next/link";

const PlaylistArtifact = dynamic(
  () => import("@/components/artifacts/PlaylistArtifact"),
  { ssr: false, loading: () => <PlaceholderShell label="Loading playlist…" accentColor="#AA2DFF" /> },
);

function PlaceholderShell({ label, accentColor }: { label: string; accentColor: string }) {
  return (
    <div style={{
      background: "rgba(255,255,255,0.02)",
      border: `1px solid ${accentColor}22`,
      borderRadius: 14,
      padding: "24px",
      textAlign: "center",
      color: "rgba(255,255,255,0.3)",
      fontSize: 12,
    }}>
      {label}
    </div>
  );
}

interface PlaylistCanisterProps {
  /** Slug or userId for the entity whose playlist this is. */
  entityId: string;
  /** Display name of the entity, shown in the header. */
  entityName?: string;
  accentColor?: string;
  /** When true, shows an "Add Track" link pointing to the entity's dashboard. */
  isOwner?: boolean;
}

export function PlaylistCanister({
  entityId,
  entityName,
  accentColor = "#AA2DFF",
  isOwner = false,
}: PlaylistCanisterProps) {
  return (
    <div style={{ background: "rgba(255,255,255,0.015)", border: `1px solid ${accentColor}22`, borderRadius: 14, overflow: "hidden" }}>
      {/* Header */}
      <div style={{
        padding: "12px 18px",
        borderBottom: `1px solid ${accentColor}18`,
        display: "flex",
        alignItems: "center",
        justifyContent: "space-between",
      }}>
        <div style={{ fontSize: 9, letterSpacing: "0.3em", color: accentColor, fontWeight: 800 }}>
          🎵 PLAYLIST {entityName ? `— ${entityName.toUpperCase()}` : ""}
        </div>
        {isOwner && (
          <Link
            href={`/hub/performer?tab=uploads`}
            style={{
              fontSize: 9, color: accentColor, fontWeight: 700,
              textDecoration: "none", letterSpacing: "0.08em",
              border: `1px solid ${accentColor}44`,
              borderRadius: 6, padding: "3px 10px",
            }}
          >
            + ADD TRACK
          </Link>
        )}
      </div>

      {/* PlaylistArtifact renders the full interactive player with localStorage-backed tracks */}
      <div style={{ padding: "0 0 4px" }}>
        <PlaylistArtifact />
      </div>
    </div>
  );
}

export default PlaylistCanister;
