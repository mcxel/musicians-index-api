"use client";

import Link from "next/link";
import type { BillboardPortal } from "@/lib/live/BillboardPortalEngine";
import "@/styles/tmiTypography.css";

interface BillboardPortalCardProps {
  portal: BillboardPortal;
  /** Size variant for grid vs hero layout */
  size?: "sm" | "md" | "lg";
}

const ENERGY_COLORS: Record<string, string> = {
  LEGENDARY: "#FFD700",
  "ON FIRE":  "#FF6B35",
  HOT:        "#FF2DAA",
  WARMING:    "#AA2DFF",
  COLD:       "#00FFFF",
};

export default function BillboardPortalCard({
  portal,
  size = "md",
}: BillboardPortalCardProps) {
  const energyColor = ENERGY_COLORS[portal.energyLabel] ?? "#00FFFF";
  const fillPct = Math.round((portal.occupancy / Math.max(1, portal.capacity)) * 100);

  const cardMinHeight = size === "lg" ? 280 : size === "md" ? 200 : 140;

  return (
    <Link href={portal.joinRoute} style={{ textDecoration: "none", color: "inherit" }}>
      <article
        style={{
          position: "relative",
          minHeight: cardMinHeight,
          borderRadius: 14,
          overflow: "hidden",
          border: `1px solid ${energyColor}44`,
          background: portal.livePreviewUrl
            ? `linear-gradient(180deg, rgba(5,5,16,0.2) 0%, rgba(5,5,16,0.88) 60%), url('${portal.livePreviewUrl}') center/cover`
            : `linear-gradient(135deg, rgba(5,5,16,0.9), rgba(20,10,40,0.95))`,
          boxShadow: `0 0 ${portal.energyScore / 4}px ${energyColor}33`,
          display: "flex",
          flexDirection: "column",
          justifyContent: "flex-end",
          cursor: "pointer",
          transition: "box-shadow 0.2s, border-color 0.2s",
        }}
        onMouseEnter={(e) => {
          (e.currentTarget as HTMLElement).style.boxShadow = `0 0 28px ${energyColor}66`;
          (e.currentTarget as HTMLElement).style.borderColor = `${energyColor}88`;
        }}
        onMouseLeave={(e) => {
          (e.currentTarget as HTMLElement).style.boxShadow = `0 0 ${portal.energyScore / 4}px ${energyColor}33`;
          (e.currentTarget as HTMLElement).style.borderColor = `${energyColor}44`;
        }}
      >
        {/* Corner brackets */}
        <div style={{ position: "absolute", top: 0, left: 0, width: 20, height: 20, borderTop: `2px solid ${energyColor}`, borderLeft: `2px solid ${energyColor}` }} />
        <div style={{ position: "absolute", top: 0, right: 0, width: 20, height: 20, borderTop: `2px solid ${energyColor}`, borderRight: `2px solid ${energyColor}` }} />

        {/* Live badge */}
        {portal.isJoinable && (
          <div
            style={{
              position: "absolute",
              top: 10,
              left: 10,
              display: "flex",
              alignItems: "center",
              gap: 5,
              background: "rgba(0,0,0,0.75)",
              border: `1px solid ${energyColor}66`,
              borderRadius: 6,
              padding: "3px 8px",
            }}
          >
            <span
              style={{
                width: 6,
                height: 6,
                borderRadius: "50%",
                background: "#00FF88",
                boxShadow: "0 0 6px #00FF88",
                display: "inline-block",
                animation: "pulse 1.5s infinite",
              }}
            />
            <span className="tmi-live-chip" style={{ fontSize: 7, color: "#00FF88" }}>LIVE</span>
          </div>
        )}

        {/* Energy label */}
        <div
          className="tmi-sticker-text"
          style={{
            position: "absolute",
            top: 10,
            right: 10,
            fontSize: 8,
            color: energyColor,
            background: `${energyColor}18`,
            border: `1px solid ${energyColor}44`,
            borderRadius: 4,
            padding: "2px 6px",
          }}
        >
          {portal.energyLabel}
        </div>

        {/* Battle status chip */}
        {portal.battleStatus && (
          <div
            className="tmi-hud-label"
            style={{
              position: "absolute",
              top: 30,
              right: 10,
              fontSize: 7,
              color: "#FF2DAA",
              background: "rgba(255,45,170,0.15)",
              border: "1px solid rgba(255,45,170,0.4)",
              borderRadius: 4,
              padding: "2px 6px",
            }}
          >
            {portal.battleStatus}
          </div>
        )}

        {/* Info footer */}
        <div
          style={{
            padding: "12px 12px 10px",
            background: "linear-gradient(0deg, rgba(5,5,16,0.95) 0%, transparent 100%)",
            display: "grid",
            gap: 5,
          }}
        >
          {/* Genre tag */}
          <span
            className="tmi-hud-label"
            style={{ fontSize: 7, color: energyColor }}
          >
            {portal.genre.toUpperCase()} · {portal.roomType.toUpperCase()}
          </span>

          {/* Title */}
          <h3
            className="tmi-battle-headline"
            style={{ margin: 0, fontSize: size === "lg" ? 16 : 12 }}
          >
            {portal.title}
          </h3>

          {/* Host + occupancy row */}
          <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", gap: 8 }}>
            <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
              <div
                style={{
                  width: 20,
                  height: 20,
                  borderRadius: "50%",
                  background: `url('${portal.hostImageUrl}') center/cover`,
                  border: `1px solid ${energyColor}55`,
                  flexShrink: 0,
                  backgroundColor: "#1a1a2e",
                }}
              />
              <span
                className="tmi-body-copy"
                style={{ fontSize: 9, color: "rgba(255,255,255,0.6)" }}
              >
                {portal.hostName}
              </span>
            </div>

            <span
              className="tmi-counter"
              style={{ fontSize: 9, color: energyColor }}
            >
              {portal.occupancy}/{portal.capacity}
            </span>
          </div>

          {/* Occupancy bar */}
          <div
            style={{
              height: 2,
              background: "rgba(255,255,255,0.08)",
              borderRadius: 1,
              overflow: "hidden",
            }}
          >
            <div
              style={{
                height: "100%",
                width: `${fillPct}%`,
                background: energyColor,
                borderRadius: 1,
                transition: "width 0.5s",
              }}
            />
          </div>

          {/* Tips + Join */}
          <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
            {portal.tipsTotal > 0 && (
              <span
                className="tmi-counter"
                style={{ fontSize: 9, color: "#FFD700" }}
              >
                💰 ${portal.tipsTotal.toFixed(0)} tips
              </span>
            )}
            <span
              className="tmi-button-text"
              style={{
                marginLeft: "auto",
                fontSize: 9,
                color: energyColor,
                border: `1px solid ${energyColor}55`,
                borderRadius: 4,
                padding: "3px 8px",
                background: `${energyColor}18`,
              }}
            >
              JOIN →
            </span>
          </div>
        </div>
      </article>
    </Link>
  );
}
