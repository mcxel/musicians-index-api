"use client";

/**
 * FanSubmissionCanister — §11183–§11186 classification: C HIDDEN UNTIL EXPLICIT PRODUCT AUTHORITY
 * (consumption surface only).
 *
 * Standing law: Stream & Win / Video Shuffle may be *consumed* by Fans.
 * Creator-owned media submission belongs to authorized Performers/artists
 * (`isSubmissionAuthorized` in SubmissionEntitlementAuthority — Fans = false).
 *
 * This component MUST NOT POST /api/submissions and MUST NOT expose
 * SubmissionManagementDrawer / BeatLocker / Stream & Win creator submit.
 */

import Link from "next/link";
import type { CSSProperties } from "react";
import DrawerBezelChrome from "@/components/drawers/DrawerBezelChrome";

interface FanSubmissionCanisterProps {
  userId: string;
  displayName?: string;
  accentColor?: string;
}

export default function FanSubmissionCanister({
  userId: _userId,
  displayName = "Fan",
  accentColor = "#FF2DAA",
}: FanSubmissionCanisterProps) {
  void _userId;

  return (
    <DrawerBezelChrome variant="chrome" seriesLabel="Fan · Listen & Join" accentColor={accentColor}>
      <div
        data-testid="fan-submission-consume-only"
        data-fan-creator-submit="blocked"
        style={{ padding: 14, display: "flex", flexDirection: "column", gap: 12 }}
      >
        <div style={{ fontSize: 9, letterSpacing: "0.2em", fontWeight: 800, color: accentColor }}>
          LISTEN & JOIN · CREATOR SUBMIT = PERFORMER ONLY
        </div>
        <p style={{ fontSize: 12, color: "rgba(255,255,255,0.7)", margin: 0, lineHeight: 1.5 }}>
          Hi {displayName}. You can listen to Stream &amp; Win Radio and join Video Shuffle as an
          audience member. Submitting your own tracks into those creator queues requires a Performer
          profile.
        </p>
        <p style={{ fontSize: 11, color: "rgba(255,255,255,0.45)", margin: 0, lineHeight: 1.45 }}>
          Fan-specific entry products (challenges, lobby contributions) stay hidden until an explicit
          product authority ships — this surface does not invent one.
        </p>
        <div style={{ display: "flex", flexWrap: "wrap", gap: 8 }}>
          <Link href="/live/lobby" style={linkStyle(accentColor)} data-testid="fan-listen-stream-win">
            Stream &amp; Win rooms →
          </Link>
          <Link href="/hub/fan" style={linkStyle("#00FFFF")} data-testid="fan-video-shuffle-consume">
            Fan Hub / shuffle →
          </Link>
          <Link href="/home/5" style={linkStyle("#FFD700")}>
            Arena →
          </Link>
        </div>
      </div>
    </DrawerBezelChrome>
  );
}

function linkStyle(color: string): CSSProperties {
  return {
    fontSize: 10,
    fontWeight: 800,
    letterSpacing: "0.08em",
    textTransform: "uppercase",
    color,
    textDecoration: "none",
    padding: "8px 12px",
    borderRadius: 8,
    border: `1px solid ${color}55`,
    background: `${color}14`,
  };
}
