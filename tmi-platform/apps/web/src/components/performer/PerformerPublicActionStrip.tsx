"use client";

import Link from "next/link";
import { type CSSProperties } from "react";

type Props = {
  slug: string;
  isOwner: boolean;
};

const chipBase: CSSProperties = {
  textDecoration: "none",
  borderRadius: 999,
  border: "1px solid rgba(255,255,255,0.2)",
  background: "rgba(255,255,255,0.05)",
  color: "rgba(255,255,255,0.9)",
  padding: "8px 12px",
  fontSize: 10,
  fontWeight: 900,
  letterSpacing: "0.08em",
  whiteSpace: "nowrap",
  display: "inline-flex",
  alignItems: "center",
  gap: 6,
};

export default function PerformerPublicActionStrip({ slug, isOwner }: Readonly<Props>) {
  return (
    <section
      data-performer-public-action-strip
      style={{
        border: "1px solid rgba(0,229,255,0.25)",
        borderRadius: 12,
        background: "linear-gradient(140deg, rgba(3,15,20,0.85), rgba(17,6,24,0.82))",
        padding: "10px 12px",
      }}
    >
      <div
        style={{
          fontSize: 9,
          fontWeight: 900,
          letterSpacing: "0.16em",
          color: "#00E5FF",
          marginBottom: 8,
        }}
      >
        PERFORMER LIVE ACTIONS
      </div>

      <div
        style={{
          display: "flex",
          gap: 8,
          overflowX: "auto",
          scrollbarWidth: "none",
          paddingBottom: 2,
        }}
      >
        <Link href="/hub/performer" style={chipBase}>🎛 COMMAND CENTER</Link>
        <Link href="/live/go" style={chipBase}>🔴 GO LIVE</Link>
        <Link href={`/booking?performer=${slug}`} style={chipBase}>📅 BOOK</Link>
        <Link href={`/messages?to=${slug}`} style={chipBase}>💬 MESSAGE</Link>
        <Link href={`/performers/${slug}/article`} style={chipBase}>📰 FEATURE</Link>
        {isOwner ? (
          <Link
            href="/hub/performer"
            style={{
              ...chipBase,
              border: "1px solid rgba(255,45,170,0.45)",
              background: "rgba(255,45,170,0.18)",
              color: "#FFD2EE",
            }}
          >
            🛠 CREATOR CONTROLS
          </Link>
        ) : null}
      </div>
    </section>
  );
}
