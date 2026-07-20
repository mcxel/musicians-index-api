"use client";

import Link from "next/link";

export interface StandardizedPortalCardProps {
  id: string;
  title: string;
  category: string;
  categoryColor?: string;
  icon?: string;
  imageUrl: string;
  isLive?: boolean;
  viewerCount?: number;
  href: string;
  aspectRatio?: "16/9" | "3/4" | "1/1";
}

export default function StandardizedPortalCard({
  title,
  category,
  categoryColor = "#00FFFF",
  icon = "🎤",
  imageUrl,
  isLive = false,
  viewerCount,
  href,
  aspectRatio = "16/9",
}: StandardizedPortalCardProps) {
  return (
    <Link
      href={href}
      style={{
        display: "block",
        textDecoration: "none",
        position: "relative",
        borderRadius: 12,
        overflow: "hidden",
        background: "rgba(8, 8, 22, 0.95)",
        border: `1.5px solid ${categoryColor}44`,
        boxShadow: `0 4px 20px ${categoryColor}18`,
        padding: 8, // 8-12px thin frame padding as required by user spec
        transition: "all 0.2s ease",
      }}
    >
      {/* Artwork container filling 85-90% of card */}
      <div
        style={{
          width: "100%",
          aspectRatio,
          borderRadius: 8,
          overflow: "hidden",
          position: "relative",
          background: "#000",
        }}
      >
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src={imageUrl}
          alt={title}
          style={{
            width: "100%",
            height: "100%",
            objectFit: "cover",
            display: "block",
          }}
        />

        {/* Live Badge */}
        {isLive && (
          <div
            style={{
              position: "absolute",
              top: 6,
              left: 6,
              background: "#FF2DAA",
              color: "#fff",
              fontSize: 7,
              fontWeight: 900,
              padding: "2px 6px",
              borderRadius: 4,
              letterSpacing: "0.08em",
            }}
          >
            ● LIVE
          </div>
        )}

        {/* Category Icon Badge */}
        <div
          style={{
            position: "absolute",
            top: 6,
            right: 6,
            background: "rgba(0,0,0,0.65)",
            backdropFilter: "blur(4px)",
            color: "#fff",
            fontSize: 10,
            padding: "2px 6px",
            borderRadius: 6,
            border: `1px solid ${categoryColor}66`,
          }}
        >
          {icon}
        </div>
      </div>

      {/* Card Metadata Footer */}
      <div style={{ padding: "8px 4px 2px", display: "flex", alignItems: "center", justifyContent: "space-between" }}>
        <div>
          <div style={{ fontSize: 11, fontWeight: 900, color: "#fff", whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>
            {title}
          </div>
          <div style={{ fontSize: 8, fontWeight: 800, color: categoryColor, letterSpacing: "0.05em", marginTop: 2 }}>
            {category.toUpperCase()}
          </div>
        </div>

        {viewerCount !== undefined && (
          <div style={{ fontSize: 9, fontWeight: 800, color: "#FFD700" }}>
            👁 {viewerCount.toLocaleString()}
          </div>
        )}
      </div>
    </Link>
  );
}
