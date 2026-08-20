"use client";

/**
 * CommandCenterTopNav — platform-wide top bar (logo, primary nav, search,
 * token balance, notifications, messages, profile). Sits above the existing
 * Command Center status bar (live status / shell colors / role switcher),
 * which keeps its own row untouched.
 */

import { useEffect, useState } from "react";
import Link from "next/link";
import { useRouter, usePathname } from "next/navigation";
import TokenBalance from "@/components/hud/TokenBalance";
import { DiamondTierBadge, type TierLevel } from "@/components/profile/DiamondTierBadge";
import { useTheme } from "@/lib/design/ThemeEngine";
import { NotificationEngine } from "@/lib/notifications/NotificationEngine";
import { presentCanonicalWorkspace, openCanonicalWorkspaceQuick } from "@/lib/workspace/universal/openCanonicalPresentation";

interface CommandCenterTopNavProps {
  userId: string;
  displayName: string;
}

const NAV_LINKS = [
  { label: "HOME", href: "/" },
  { label: "DISCOVER", href: null as string | null, liveWall: true },
  { label: "LIVE NOW", href: null as string | null, liveWall: true },
  { label: "MAGAZINE", href: "/magazine" },
  { label: "MARKETPLACE", href: "/marketplace" },
  { label: "ARENA", href: "/arena" },
];

function mapSessionTier(raw: string | null | undefined): TierLevel {
  switch ((raw ?? "").toUpperCase()) {
    case "DIAMOND":
      return "diamond";
    case "PLATINUM":
    case "GOLD":
      return "gold";
    case "RUBY":
    case "SILVER":
      return "RUBY";
    default:
      return "free";
  }
}

export default function CommandCenterTopNav({ userId, displayName }: CommandCenterTopNavProps) {
  const theme = useTheme();
  const router = useRouter();
  const pathname = usePathname() ?? "";
  const [avatarUrl, setAvatarUrl] = useState<string | null>(null);
  const [tier, setTier] = useState<TierLevel>("free");
  const [unreadNotifications, setUnreadNotifications] = useState(0);
  const [unreadMessages, setUnreadMessages] = useState(0);
  const [profileOpen, setProfileOpen] = useState(false);
  const [searchValue, setSearchValue] = useState("");
  const [isMobile, setIsMobile] = useState(true); // mobile-first: nav links collapse on phones

  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        const res = await fetch("/api/auth/session", { cache: "no-store" });
        if (!res.ok || cancelled) return;
        const data = await res.json();
        setAvatarUrl(data.avatarUrl ?? null);
        setTier(mapSessionTier(data.tier));
      } catch {
        /* honest fallback: no avatar, free tier */
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [userId]);

  useEffect(() => {
    let cancelled = false;
    void NotificationEngine.hydrateFromApi().then(() => {
      if (!cancelled) setUnreadNotifications(NotificationEngine.getUnreadCount());
    });
    const refresh = () => setUnreadNotifications(NotificationEngine.getUnreadCount());
    const unsub = NotificationEngine.subscribe(refresh);
    return () => {
      cancelled = true;
      unsub();
    };
  }, [userId]);

  useEffect(() => {
    let cancelled = false;
    async function pollMessages() {
      try {
        const msgRes = await fetch("/api/messages", { cache: "no-store" });
        if (cancelled || !msgRes.ok) return;
        const d = await msgRes.json();
        setUnreadMessages(typeof d.unreadTotal === "number" ? d.unreadTotal : 0);
      } catch {
        /* leave counts at last-known value */
      }
    }
    void pollMessages();
    const id = setInterval(pollMessages, 30_000);
    return () => {
      cancelled = true;
      clearInterval(id);
    };
  }, [userId]);

  useEffect(() => {
    const mql = window.matchMedia("(max-width: 767px)");
    const check = () => setIsMobile(mql.matches);
    check();
    mql.addEventListener("change", check);
    return () => mql.removeEventListener("change", check);
  }, []);

  const submitSearch = (e: React.FormEvent) => {
    e.preventDefault();
    const q = searchValue.trim();
    router.push(q ? `/search?q=${encodeURIComponent(q)}` : "/search");
  };

  const initial = displayName?.trim()?.[0]?.toUpperCase() ?? "?";
  const onHub = pathname.startsWith("/hub/");

  const openNotifications = () => {
    if (onHub) {
      openCanonicalWorkspaceQuick("notifications", "DRAWER");
      return;
    }
    router.push("/notifications");
  };

  const openMessages = () => {
    if (onHub) {
      openCanonicalWorkspaceQuick("messaging", "DRAWER");
      return;
    }
    router.push("/messages");
  };

  return (
    <div
      style={{
        height: 56,
        flexShrink: 0,
        display: "flex",
        alignItems: "center",
        gap: 18,
        padding: "0 16px",
        borderBottom: `1px solid ${theme.primary}18`,
        background: theme.bgGlass,
        backdropFilter: "blur(12px)",
        fontFamily: "'Inter', sans-serif",
      }}
    >
      {/* Logo */}
      <Link
        href="/"
        style={{
          fontSize: 18,
          fontWeight: 900,
          letterSpacing: "0.02em",
          color: theme.primary,
          textDecoration: "none",
          flexShrink: 0,
        }}
      >
        TMI
      </Link>

      {/* Primary nav — hidden on mobile (☰ OPS in status bar handles mobile navigation) */}
      {!isMobile && (
      <nav style={{ display: "flex", alignItems: "center", gap: 14, flexShrink: 0 }}>
        {NAV_LINKS.map((link) =>
          link.href === null || ("liveWall" in link && link.liveWall) ? (
            <button
              key={link.label}
              type="button"
              onClick={() => presentCanonicalWorkspace("lobby", "DRAWER")}
              style={{
                fontSize: 10,
                fontWeight: 800,
                letterSpacing: "0.06em",
                color: "rgba(255,255,255,0.75)",
                background: "transparent",
                border: "none",
                cursor: "pointer",
                whiteSpace: "nowrap",
                padding: 0,
                fontFamily: "inherit",
              }}
            >
              {link.label}
            </button>
          ) : (
            <Link
              key={link.href}
              href={link.href}
              style={{
                fontSize: 10,
                fontWeight: 800,
                letterSpacing: "0.06em",
                color: "rgba(255,255,255,0.75)",
                textDecoration: "none",
                whiteSpace: "nowrap",
              }}
            >
              {link.label}
            </Link>
          ),
        )}
      </nav>
      )}

      {/* Search */}
      <form
        onSubmit={submitSearch}
        style={{
          flex: 1,
          minWidth: 0,
          display: "flex",
          alignItems: "center",
          gap: 8,
          background: "rgba(255,255,255,0.05)",
          border: "1px solid rgba(255,255,255,0.1)",
          borderRadius: 8,
          padding: "6px 12px",
        }}
      >
        <span style={{ fontSize: 12, opacity: 0.5 }}>🔍</span>
        <input
          value={searchValue}
          onChange={(e) => setSearchValue(e.target.value)}
          placeholder="Search performers, rooms, people..."
          style={{
            flex: 1,
            minWidth: 0,
            background: "transparent",
            border: "none",
            outline: "none",
            color: "#fff",
            fontSize: 11,
            fontFamily: "inherit",
          }}
        />
      </form>

      {/* Token balance */}
      <div style={{ flexShrink: 0 }}>
        <TokenBalance userId={userId} accentColor={theme.primary} compact />
      </div>

      {/* Notifications */}
      <button
        type="button"
        onClick={openNotifications}
        aria-label={`Notifications${unreadNotifications > 0 ? `, ${unreadNotifications} unread` : ""}`}
        style={{ position: "relative", flexShrink: 0, fontSize: 16, lineHeight: 1, background: "none", border: "none", cursor: "pointer", padding: 0 }}
      >
        🔔
        {unreadNotifications > 0 ? (
          <span
            style={{
              position: "absolute",
              top: -5,
              right: -7,
              background: "#FF3B5C",
              color: "#fff",
              fontSize: 8,
              fontWeight: 900,
              borderRadius: 999,
              padding: "1px 4px",
              minWidth: 14,
              textAlign: "center",
            }}
          >
            {unreadNotifications > 99 ? "99+" : unreadNotifications}
          </span>
        ) : null}
      </button>

      {/* Messages */}
      <button
        type="button"
        onClick={openMessages}
        aria-label={`Messages${unreadMessages > 0 ? `, ${unreadMessages} unread` : ""}`}
        style={{ position: "relative", flexShrink: 0, fontSize: 16, lineHeight: 1, background: "none", border: "none", cursor: "pointer", padding: 0 }}
      >
        ✉️
        {unreadMessages > 0 ? (
          <span
            style={{
              position: "absolute",
              top: -5,
              right: -7,
              background: "#FF3B5C",
              color: "#fff",
              fontSize: 8,
              fontWeight: 900,
              borderRadius: 999,
              padding: "1px 4px",
              minWidth: 14,
              textAlign: "center",
            }}
          >
            {unreadMessages > 99 ? "99+" : unreadMessages}
          </span>
        ) : null}
      </button>

      {/* Profile */}
      <div style={{ position: "relative", flexShrink: 0 }}>
        <button
          type="button"
          onClick={() => setProfileOpen((v) => !v)}
          style={{
            display: "flex",
            alignItems: "center",
            gap: 8,
            background: "transparent",
            border: "none",
            cursor: "pointer",
            padding: 0,
            fontFamily: "inherit",
          }}
        >
          {avatarUrl ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img
              src={avatarUrl}
              alt={displayName}
              style={{ width: 30, height: 30, borderRadius: "50%", objectFit: "cover", border: `1px solid ${theme.primary}55` }}
            />
          ) : (
            <div
              style={{
                width: 30,
                height: 30,
                borderRadius: "50%",
                background: `linear-gradient(135deg, ${theme.primary}, ${theme.secondary})`,
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                fontSize: 12,
                fontWeight: 900,
                color: "#050510",
              }}
            >
              {initial}
            </div>
          )}
          <div style={{ display: "flex", flexDirection: "column", alignItems: "flex-start", gap: 2 }}>
            <span style={{ fontSize: 10, fontWeight: 900, color: "#fff" }}>{displayName}</span>
            <DiamondTierBadge tier={tier} />
          </div>
          <span style={{ fontSize: 9, color: "rgba(255,255,255,0.5)" }}>{profileOpen ? "▲" : "▼"}</span>
        </button>

        {profileOpen ? (
          <div
            style={{
              position: "absolute",
              top: "calc(100% + 8px)",
              right: 0,
              zIndex: 50,
              minWidth: 160,
              background: "#0d1117",
              border: "1px solid rgba(255,255,255,0.12)",
              borderRadius: 10,
              padding: 6,
              boxShadow: "0 12px 32px rgba(0,0,0,0.6)",
              display: "flex",
              flexDirection: "column",
              gap: 2,
            }}
          >
            <Link
              href="/profile"
              onClick={() => setProfileOpen(false)}
              style={{ padding: "8px 10px", borderRadius: 6, fontSize: 11, color: "#fff", textDecoration: "none" }}
            >
              My Profile
            </Link>
            <Link
              href="/settings"
              onClick={() => setProfileOpen(false)}
              style={{ padding: "8px 10px", borderRadius: 6, fontSize: 11, color: "#fff", textDecoration: "none" }}
            >
              Settings
            </Link>
            <Link
              href="/rewards"
              onClick={() => setProfileOpen(false)}
              style={{ padding: "8px 10px", borderRadius: 6, fontSize: 11, color: "#fff", textDecoration: "none" }}
            >
              Rewards
            </Link>
            <Link
              href="/api/auth/logout"
              onClick={() => setProfileOpen(false)}
              style={{ padding: "8px 10px", borderRadius: 6, fontSize: 11, color: "#FF6666", textDecoration: "none" }}
            >
              Sign Out
            </Link>
          </div>
        ) : null}
      </div>
    </div>
  );
}
