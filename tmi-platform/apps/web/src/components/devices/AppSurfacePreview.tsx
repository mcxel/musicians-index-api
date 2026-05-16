"use client";

import React, { useMemo } from "react";
import { responsiveSurfacePolicy } from "@/lib/devices/ResponsiveSurfacePolicy";
import type { DeviceClass } from "@/lib/devices/DeviceCapabilityRegistry";
import type { SessionRole, TeenRestrictions } from "@/lib/devices/DeviceSessionBridge";

interface Props {
  deviceClass: DeviceClass;
  role?: SessionRole;
  teenRestrictions?: TeenRestrictions;
  routePath?: string;
  className?: string;
}

const FRAME_DIMENSIONS: Record<DeviceClass, { w: number; h: number; label: string }> = {
  phone:          { w: 120, h: 210, label: "Phone" },
  tablet:         { w: 180, h: 240, label: "Tablet" },
  desktop:        { w: 280, h: 175, label: "Desktop" },
  "smart-tv":     { w: 280, h: 165, label: "Smart TV" },
  "venue-screen": { w: 280, h: 105, label: "Venue Screen" },
  kiosk:          { w: 120, h: 200, label: "Kiosk" },
  controller:     { w: 160, h: 90, label: "Controller" },
  remote:         { w: 80,  h: 200, label: "Remote" },
  webview:        { w: 160, h: 220, label: "WebView" },
  "mobile-app":   { w: 120, h: 210, label: "Mobile App" },
  "desktop-app":  { w: 280, h: 175, label: "Desktop App" },
};

const NAV_COLORS: Record<string, string> = {
  "bottom-tab":   "#22d3ee",
  "side-rail":    "#a855f7",
  "side-drawer":  "#818cf8",
  "top-bar":      "#f59e0b",
  "dpad-focus":   "#ef4444",
  "remote-focus": "#f97316",
  hidden:         "#374151",
};

const DENSITY_BG: Record<string, string> = {
  minimal:  "#111827",
  compact:  "#1f2937",
  standard: "#1e1b4b",
  rich:     "#0f172a",
};

const DEFAULT_TEEN: TeenRestrictions = {
  active: false,
  blockDMs: false,
  blockVoiceRooms: false,
  blockVideoRooms: false,
  blockAdultSpaces: false,
  blockUnverifiedPerformerContact: false,
  requireGuardianForPurchase: false,
};

export function AppSurfacePreview({
  deviceClass,
  role = "fan",
  teenRestrictions = DEFAULT_TEEN,
  routePath,
  className = "",
}: Props) {
  const policy = useMemo(
    () => responsiveSurfacePolicy.resolvePolicy(deviceClass, role, teenRestrictions),
    [deviceClass, role, teenRestrictions],
  );

  const frame = FRAME_DIMENSIONS[deviceClass];
  const navColor = NAV_COLORS[policy.navigationMode] ?? "#374151";
  const bgColor = DENSITY_BG[policy.contentDensity] ?? "#1a1a2e";

  return (
    <div className={`inline-flex flex-col items-center gap-2 ${className}`}>
      {/* Device frame */}
      <div
        style={{
          width: frame.w,
          height: frame.h,
          borderRadius: deviceClass === "phone" || deviceClass === "mobile-app" ? 16 : 8,
          border: "2px solid rgba(255,255,255,0.15)",
          backgroundColor: bgColor,
          position: "relative",
          overflow: "hidden",
          fontSize: "8px",
          color: "rgba(255,255,255,0.6)",
          display: "flex",
          flexDirection: "column",
        }}
      >
        {/* Top bar nav */}
        {policy.navigationMode === "top-bar" && (
          <div
            style={{
              height: 14,
              backgroundColor: navColor + "33",
              borderBottom: `1px solid ${navColor}44`,
              display: "flex",
              alignItems: "center",
              paddingLeft: 6,
              gap: 4,
            }}
          >
            {["•", "•", "•", "•"].map((d, i) => (
              <span key={i} style={{ color: navColor, fontSize: 10 }}>{d}</span>
            ))}
          </div>
        )}

        {/* Side rail */}
        {(policy.navigationMode === "side-rail" || policy.navigationMode === "side-drawer") && (
          <div
            style={{
              position: "absolute",
              left: 0,
              top: 0,
              bottom: 0,
              width: 18,
              backgroundColor: navColor + "22",
              borderRight: `1px solid ${navColor}33`,
              display: "flex",
              flexDirection: "column",
              alignItems: "center",
              paddingTop: 8,
              gap: 6,
            }}
          >
            {["■", "■", "■"].map((d, i) => (
              <span key={i} style={{ color: navColor, opacity: 0.6 }}>{d}</span>
            ))}
          </div>
        )}

        {/* Content area */}
        <div
          style={{
            flex: 1,
            marginLeft:
              policy.navigationMode === "side-rail" || policy.navigationMode === "side-drawer"
                ? 18
                : 0,
            marginBottom: policy.navigationMode === "bottom-tab" ? 14 : 0,
            padding: 6,
            display: "grid",
            gridTemplateColumns: `repeat(${Math.min(policy.maxGridColumns, 3)}, 1fr)`,
            gap: 3,
            alignContent: "start",
          }}
        >
          {Array.from({ length: policy.maxGridColumns * 2 }).map((_, i) => (
            <div
              key={i}
              style={{
                height: 20,
                backgroundColor: "rgba(255,255,255,0.05)",
                borderRadius: 3,
              }}
            />
          ))}
        </div>

        {/* Bottom tab nav */}
        {policy.navigationMode === "bottom-tab" && (
          <div
            style={{
              position: "absolute",
              bottom: 0,
              left: 0,
              right: 0,
              height: 14,
              backgroundColor: navColor + "33",
              borderTop: `1px solid ${navColor}44`,
              display: "flex",
              justifyContent: "space-around",
              alignItems: "center",
            }}
          >
            {["⌂", "♪", "★", "👤"].map((icon, i) => (
              <span key={i} style={{ fontSize: 8, color: navColor }}>{icon}</span>
            ))}
          </div>
        )}

        {/* Feature indicators */}
        <div
          style={{
            position: "absolute",
            top: 4,
            right: 4,
            display: "flex",
            flexDirection: "column",
            gap: 2,
          }}
        >
          {policy.showHUD && (
            <span style={{ color: "#22d3ee", fontSize: 6 }}>HUD</span>
          )}
          {policy.showChat && (
            <span style={{ color: "#a855f7", fontSize: 6 }}>CHAT</span>
          )}
        </div>

        {/* Route badge */}
        {routePath && (
          <div
            style={{
              position: "absolute",
              bottom: policy.navigationMode === "bottom-tab" ? 16 : 4,
              left: "50%",
              transform: "translateX(-50%)",
              backgroundColor: "rgba(0,0,0,0.6)",
              borderRadius: 4,
              padding: "1px 4px",
              fontSize: 6,
              color: "rgba(255,255,255,0.5)",
              whiteSpace: "nowrap",
            }}
          >
            {routePath}
          </div>
        )}

        {/* Restricted overlay */}
        {(policy.teenOverrides.showHUD === false || policy.teenOverrides.showReactions === false) && (
          <div
            style={{
              position: "absolute",
              inset: 0,
              backgroundColor: "rgba(239,68,68,0.08)",
              border: "1px solid rgba(239,68,68,0.2)",
              borderRadius: "inherit",
              pointerEvents: "none",
            }}
          />
        )}
      </div>

      {/* Label */}
      <div className="text-center">
        <div className="text-[10px] font-semibold text-white/70">{frame.label}</div>
        <div className="text-[9px] text-white/30">{policy.layoutMode}</div>
        <div
          className="mt-0.5 text-[9px]"
          style={{ color: navColor }}
        >
          {policy.navigationMode}
        </div>
        {policy.reducedMotion && (
          <div className="text-[8px] text-amber-400/70">reduced-motion</div>
        )}
      </div>
    </div>
  );
}

export default AppSurfacePreview;
