"use client";

/**
 * §20979 compact living magazine window:
 * COMMUNITY GOSSIP (20s) ↔ HAPPY DAYS (20s)
 * Half footprint · no "Global Community" · click → full specialty page
 * Auto-rotation never navigates. Manual select resets 20s dwell.
 */

import React, { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import type { CommunityWallNote } from "@/lib/communityWall/CommunityWallContracts";
import {
  magazineArticleGossipSeeds,
  magazineHappyDaysSeeds,
} from "@/lib/communityWall/CommunityWallEngine";
import {
  destinationFullPageHref,
  destinationLabel,
  MAGAZINE_PUBLISH_ROTATION_MS,
  readStagedNotes,
  type MagazinePublishDestination,
} from "@/lib/communityWall/MessagingCanisterMagazinePublishAuthority";

type Props = {
  gossipNotes?: CommunityWallNote[];
  happyNotes?: CommunityWallNote[];
  /**
   * When set, show only this department — no 20s A↔B rotation.
   * Used by MagazineExtendedHybridReel for occasional single-feature pages.
   */
  lockedDestination?: MagazinePublishDestination;
};

export default function CommunityGossipHappyDaysRotatingPreview({
  gossipNotes,
  happyNotes,
  lockedDestination,
}: Props) {
  const [dest, setDest] = useState<MagazinePublishDestination>(
    lockedDestination ?? "COMMUNITY_GOSSIP",
  );
  const [dwellKey, setDwellKey] = useState(0);
  const [stagedGossip, setStagedGossip] = useState<CommunityWallNote[]>([]);
  const [stagedHappy, setStagedHappy] = useState<CommunityWallNote[]>([]);

  useEffect(() => {
    if (lockedDestination) setDest(lockedDestination);
  }, [lockedDestination]);

  useEffect(() => {
    setStagedGossip(readStagedNotes("COMMUNITY_GOSSIP"));
    setStagedHappy(readStagedNotes("HAPPY_DAYS"));
  }, [dwellKey, dest]);

  useEffect(() => {
    if (lockedDestination) return;
    const id = window.setInterval(() => {
      setDest((d) => (d === "COMMUNITY_GOSSIP" ? "HAPPY_DAYS" : "COMMUNITY_GOSSIP"));
    }, MAGAZINE_PUBLISH_ROTATION_MS);
    return () => window.clearInterval(id);
  }, [dwellKey, lockedDestination]);

  const gossip = useMemo(
    () => [...(gossipNotes ?? magazineArticleGossipSeeds()), ...stagedGossip],
    [gossipNotes, stagedGossip],
  );
  const happy = useMemo(
    () => [...(happyNotes ?? magazineHappyDaysSeeds()), ...stagedHappy],
    [happyNotes, stagedHappy],
  );

  const notes = dest === "COMMUNITY_GOSSIP" ? gossip : happy;
  const lead = notes[0];
  const accent = dest === "HAPPY_DAYS" ? "#ea580c" : "#db2777";
  const href = destinationFullPageHref(dest);
  const bg =
    dest === "HAPPY_DAYS"
      ? "linear-gradient(135deg, #FFE566 0%, #7CFF4F 45%, #7dd3fc 100%)"
      : "linear-gradient(135deg, #FFD6EC 0%, #FF6B9D 50%, #AA2DFF 100%)";
  const ink = dest === "HAPPY_DAYS" ? "#0a1a10" : "#2a0430";

  function selectDest(next: MagazinePublishDestination) {
    setDest(next);
    setDwellKey((k) => k + 1);
  }

  return (
    <aside
      data-testid="gossip-happy-rotating-preview"
      data-active-destination={dest}
      data-rotation-ms={MAGAZINE_PUBLISH_ROTATION_MS}
      data-global-community="0"
      data-half-footprint="1"
      style={{
        marginTop: 8,
        maxWidth: 420,
        width: "100%",
      }}
    >
      <div
        style={{
          display: "flex",
          gap: 6,
          marginBottom: 6,
          flexWrap: "wrap",
          alignItems: "center",
        }}
      >
        {(lockedDestination
          ? ([lockedDestination] as const)
          : (["COMMUNITY_GOSSIP", "HAPPY_DAYS"] as const)
        ).map((id) => {
          const active = dest === id;
          const a = id === "HAPPY_DAYS" ? "#ea580c" : "#db2777";
          return (
            <button
              key={id}
              type="button"
              aria-pressed={active}
              onClick={() => selectDest(id)}
              disabled={Boolean(lockedDestination)}
              style={{
                padding: "4px 8px",
                borderRadius: 6,
                border: active ? `1px solid ${a}` : "1px solid rgba(0,0,0,0.2)",
                background: active ? `${a}22` : "rgba(255,255,255,0.35)",
                color: active ? a : "rgba(0,0,0,0.65)",
                fontSize: 8,
                fontWeight: 900,
                letterSpacing: "0.1em",
                cursor: lockedDestination ? "default" : "pointer",
              }}
            >
              {destinationLabel(id)}
            </button>
          );
        })}
        <span style={{ fontSize: 7, opacity: 0.55 }}>
          {lockedDestination
            ? "occasional department · card opens full page"
            : "20s · hold resets · card opens full page"}
        </span>
      </div>

      <Link
        href={href}
        data-testid={`rotating-preview-open-${dest === "HAPPY_DAYS" ? "happy-days" : "community-gossip"}`}
        style={{ textDecoration: "none", color: ink }}
      >
        <div
          style={{
            borderRadius: 8,
            border: `2px solid #061028`,
            background: bg,
            padding: "8px 10px",
            minHeight: 64,
            maxHeight: 96,
            boxShadow: "2px 3px 0 #061028",
            transition: "background 0.45s ease, color 0.45s ease",
            overflow: "hidden",
          }}
        >
          <div
            style={{
              fontSize: 8,
              fontWeight: 900,
              letterSpacing: "0.14em",
              color: accent,
              marginBottom: 4,
            }}
          >
            {destinationLabel(dest)} · PREVIEW
          </div>
          {lead ? (
            <>
              <div style={{ fontSize: 11, fontWeight: 700, lineHeight: 1.35 }}>
                “{lead.body.slice(0, 90)}
                {lead.body.length > 90 ? "…" : ""}”
              </div>
              <div style={{ marginTop: 6, fontSize: 9, fontWeight: 800, opacity: 0.75 }}>
                — {lead.authorLabel} · open full page →
              </div>
            </>
          ) : (
            <div style={{ fontSize: 11, opacity: 0.7 }}>
              No posts yet. Open full page to contribute via Messaging Canister.
            </div>
          )}
        </div>
      </Link>
    </aside>
  );
}
