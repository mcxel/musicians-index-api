"use client";

/**
 * RoleHubAccountMenu — canonical account header for non-fan/performer role hubs.
 * Letter/avatar toggles AccountCommandMenu popover (hubs · notifications · settings · logout).
 * One sign-in, one session, one logout via /api/auth/logout.
 */

import { useEffect, useState } from "react";
import AccountCommandMenu from "@/components/navigation/AccountCommandMenu";

export interface RoleHubAccountMenuProps {
  accentColor?: string;
}

export default function RoleHubAccountMenu({ accentColor = "#00FFFF" }: RoleHubAccountMenuProps) {
  const [userId, setUserId] = useState("session");
  const [displayName, setDisplayName] = useState("Account");
  const [avatarUrl, setAvatarUrl] = useState<string | null>(null);

  useEffect(() => {
    let active = true;
    fetch("/api/auth/session", { cache: "no-store", credentials: "include" })
      .then((r) => (r.ok ? r.json() : null))
      .then((data) => {
        if (!active || !data?.authenticated || !data?.user) return;
        setUserId(data.user.id ?? "session");
        setDisplayName(data.user.name ?? data.user.email?.split("@")[0] ?? "Account");
        setAvatarUrl(data.user.avatarUrl ?? null);
      })
      .catch(() => {});
    return () => {
      active = false;
    };
  }, []);

  return (
    <div data-tmi-role-hub-account-menu="1" style={{ position: "relative", flexShrink: 0, zIndex: 50 }}>
      <AccountCommandMenu
        userId={userId}
        displayName={displayName}
        avatarUrl={avatarUrl}
        accentColor={accentColor}
        compact
      />
    </div>
  );
}
