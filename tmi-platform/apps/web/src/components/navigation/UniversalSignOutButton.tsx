"use client";

/**
 * UniversalSignOutButton — visible, theme-consistent logout for every role shell.
 * Uses canonicalLogout (POST + cache clear + /auth redirect).
 */

import { useState } from "react";
import { canonicalLogout } from "@/lib/auth/canonicalLogout";

export interface UniversalSignOutButtonProps {
  accentColor?: string;
  label?: string;
  compact?: boolean;
}

export default function UniversalSignOutButton({
  accentColor = "#FF5555",
  label = "LOG OUT",
  compact = false,
}: UniversalSignOutButtonProps) {
  const [busy, setBusy] = useState(false);

  return (
    <button
      type="button"
      data-testid="tmi-universal-sign-out"
      disabled={busy}
      onClick={() => {
        if (busy) return;
        setBusy(true);
        void canonicalLogout();
      }}
      style={{
        flexShrink: 0,
        fontSize: compact ? 9 : 10,
        fontWeight: 900,
        letterSpacing: "0.1em",
        padding: compact ? "6px 10px" : "7px 12px",
        borderRadius: 8,
        border: `1px solid ${accentColor}88`,
        background: `${accentColor}18`,
        color: accentColor,
        cursor: busy ? "wait" : "pointer",
        fontFamily: "inherit",
        whiteSpace: "nowrap",
      }}
    >
      {busy ? "…" : label}
    </button>
  );
}
