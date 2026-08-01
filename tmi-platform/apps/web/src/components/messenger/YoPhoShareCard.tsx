"use client";

import Link from "next/link";

export interface YoPhoShareMessageLike {
  text?: string;
  body?: string;
  shareSlug?: string;
  shareId?: string;
  cardId?: string;
  type?: string;
  messageType?: string;
}

/**
 * In-thread preview for interactive YoPho card shares.
 */
export function YoPhoShareCard({ message }: { message: YoPhoShareMessageLike }) {
  const cardId = message.cardId?.trim() || message.shareId?.trim();
  const slug = message.shareSlug?.trim();
  const isInteractive =
    message.type === "yopho_card" ||
    message.messageType === "yopho-share" ||
    Boolean(cardId && (message.type === "yopho_card" || message.messageType === "yopho_card"));

  const href = cardId
    ? `/yopho/card/${encodeURIComponent(cardId)}`
    : slug
      ? `/performers/${encodeURIComponent(slug)}?card=yopho`
      : "/performers";

  const label = message.text ?? message.body ?? "This is me right now.";

  return (
    <div
      style={{
        border: "1px solid rgba(0,229,255,0.4)",
        borderRadius: 10,
        padding: 10,
        background: "linear-gradient(160deg, #14101f 0%, #0a0614 100%)",
        boxShadow: "0 0 16px rgba(0,229,255,0.12)",
      }}
    >
      <div
        style={{
          fontSize: 10,
          fontWeight: 900,
          letterSpacing: "0.14em",
          color: "#00E5FF",
          marginBottom: 6,
          textTransform: "uppercase",
        }}
      >
        {isInteractive || cardId ? "✦ Interactive YoPho Card" : "YoPho Card"}
      </div>
      <div style={{ fontWeight: 700, marginBottom: 8, fontSize: 13, color: "#fff" }}>{label}</div>
      {cardId ? (
        <div style={{ fontSize: 11, color: "rgba(255,255,255,0.45)", marginBottom: 8 }}>
          Card · {cardId}
        </div>
      ) : slug ? (
        <div style={{ fontSize: 11, color: "rgba(255,255,255,0.45)", marginBottom: 8 }}>@{slug}</div>
      ) : null}
      <Link
        href={href}
        style={{
          display: "inline-block",
          background: "linear-gradient(90deg, #00E5FF, #FF2DAA)",
          color: "#050510",
          borderRadius: 6,
          padding: "6px 12px",
          fontWeight: 800,
          fontSize: 11,
          textDecoration: "none",
          letterSpacing: "0.06em",
        }}
      >
        OPEN INTERACTIVE CARD →
      </Link>
    </div>
  );
}
