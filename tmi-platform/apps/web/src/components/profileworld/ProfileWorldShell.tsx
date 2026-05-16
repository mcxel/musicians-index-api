"use client";

import type { ReactNode } from "react";
import ProfileConfettiLayer from "./ProfileConfettiLayer";
import type { ProfileTierSkin } from "./ProfileTierSkinEngine";

type ProfileWorldShellProps = {
  skin: ProfileTierSkin;
  title: string;
  subtitle: string;
  topControls?: ReactNode;
  children?: ReactNode;
  zones?: {
    headerZone?: ReactNode;
    stageZone?: ReactNode;
    reactionZone?: ReactNode;
    tipZone?: ReactNode;
    playlistZone?: ReactNode;
    botStripZone?: ReactNode;
    rightTowerZone?: ReactNode;
    bottomActionZone?: ReactNode;
    engineLogZone?: ReactNode;
  };
};

function ZoneSlot({ label, children }: { label: string; children?: ReactNode }) {
  if (!children) return null;

  return (
    <section
      style={{
        borderRadius: 14,
        border: "1px solid rgba(90,215,255,0.14)",
        background: "rgba(4,10,24,0.6)",
        padding: 8,
        position: "relative",
      }}
    >
      <div
        style={{
          fontSize: 9,
          letterSpacing: "0.16em",
          textTransform: "uppercase",
          color: "#7bb3d4",
          marginBottom: 6,
          fontWeight: 800,
        }}
      >
        {label}
      </div>
      {children}
    </section>
  );
}

export default function ProfileWorldShell({ skin, title, subtitle, topControls, children, zones }: ProfileWorldShellProps) {
  const hasZones = Boolean(zones);

  return (
    <main style={{ minHeight: "100vh", background: skin.background, color: "#d9f2ff", paddingBottom: 24, position: "relative" }}>
      <ProfileConfettiLayer />
      <div style={{ position: "relative", zIndex: 1, maxWidth: 1380, margin: "0 auto", padding: "0 14px" }}>
        <header style={{ borderRadius: "0 0 22px 22px", border: `1px solid ${skin.panelBorder}`, borderTop: "none", background: "linear-gradient(160deg, rgba(8,18,39,0.95), rgba(4,9,20,0.97))", boxShadow: skin.panelGlow, padding: "12px 18px" }}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", flexWrap: "wrap", gap: 10 }}>
            <div>
              <div style={{ fontSize: 11, letterSpacing: "0.2em", textTransform: "uppercase", color: skin.titleColor, fontWeight: 900 }}>{title}</div>
              <div style={{ fontSize: 12, color: "#9ec7e8" }}>{subtitle}</div>
            </div>
            {topControls}
          </div>
        </header>
        <div style={{ marginTop: 12 }}>
          {!hasZones ? (
            children
          ) : (
            <section style={{ display: "grid", gap: 10, alignItems: "start" }}>
              <div style={{ gridArea: "header" }}>
                <ZoneSlot label="Header Zone">{zones?.headerZone}</ZoneSlot>
              </div>

              <div
                style={{
                  display: "grid",
                  gap: 10,
                  gridTemplateColumns: "repeat(auto-fit, minmax(260px, 1fr))",
                }}
              >
                <div style={{ minWidth: 0 }}>
                  <ZoneSlot label="Stage Zone">{zones?.stageZone}</ZoneSlot>
                </div>
                <div style={{ minWidth: 0 }}>
                  <ZoneSlot label="Reaction Zone">{zones?.reactionZone}</ZoneSlot>
                </div>
                <div style={{ minWidth: 0 }}>
                  <ZoneSlot label="Tip Zone">{zones?.tipZone}</ZoneSlot>
                </div>
                <div style={{ minWidth: 0 }}>
                  <ZoneSlot label="Playlist Zone">{zones?.playlistZone}</ZoneSlot>
                </div>
                <div style={{ minWidth: 0 }}>
                  <ZoneSlot label="Bot Strip Zone">{zones?.botStripZone}</ZoneSlot>
                </div>
                <div style={{ minWidth: 0 }}>
                  <ZoneSlot label="Right Tower Zone">{zones?.rightTowerZone}</ZoneSlot>
                </div>
              </div>

              <div>
                <ZoneSlot label="Bottom Action Zone">{zones?.bottomActionZone}</ZoneSlot>
              </div>

              <div>
                <ZoneSlot label="Engine Log Zone">{zones?.engineLogZone}</ZoneSlot>
              </div>
            </section>
          )}
        </div>
      </div>
    </main>
  );
}
