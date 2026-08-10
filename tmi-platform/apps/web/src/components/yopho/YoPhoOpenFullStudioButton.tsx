"use client";

import type { CSSProperties } from "react";
import type { CommandCenterRole } from "@/components/commandCenter/commandCenterRegistry";
import { openYoPhoUniversalWorkspace } from "@/lib/yopho/openYoPhoStudio";

interface YoPhoOpenFullStudioButtonProps {
  role: CommandCenterRole;
  userId?: string;
  label?: string;
  style?: CSSProperties;
}

export default function YoPhoOpenFullStudioButton({
  role,
  userId,
  label = "FULL STUDIO →",
  style,
}: YoPhoOpenFullStudioButtonProps) {
  const baseStyle: CSSProperties = {
    fontSize: 10,
    fontWeight: 800,
    color: "#00FFFF",
    textDecoration: "none",
    border: "1px solid rgba(0,255,255,0.35)",
    borderRadius: 8,
    padding: "6px 12px",
    cursor: "pointer",
    background: "transparent",
    fontFamily: "inherit",
    letterSpacing: "0.06em",
    ...style,
  };

  return (
    <button
      type="button"
      style={baseStyle}
      onClick={() => openYoPhoUniversalWorkspace(role, userId)}
    >
      {label}
    </button>
  );
}
