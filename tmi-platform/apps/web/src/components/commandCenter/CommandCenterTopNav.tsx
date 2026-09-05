"use client";

/**
 * CommandCenterTopNav — platform-wide top bar (logo, primary nav, search,
 * token balance, notifications, messages, profile). Sits above the existing
 * Command Center status bar (live status / shell colors / role switcher),
 * which keeps its own row untouched.
 */

import { useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import TokenBalance from "@/components/hud/TokenBalance";
import AccountCommandMenu from "@/components/navigation/AccountCommandMenu";
import { useTheme } from "@/lib/design/ThemeEngine";
import { NotificationEngine } from "@/lib/notifications/NotificationEngine";
import { openCanonicalWorkspaceQuick } from "@/lib/workspace/universal/openCanonicalPresentation";

interface CommandCenterTopNavProps {
  userId: string;
  displayName: string;
}

/** Shell-owned destinations only — no legacy Home/Discover/Live Now/Lobby board. */
const NAV_LINKS = [
  { label: "MAGAZINE", href: "/magazine" },
  { label: "MARKETPLACE", href: "/marketplace" },
  { label: "ARENA", href: "/arena" },
];

export default function CommandCenterTopNav({ userId, displayName }: CommandCenterTopNavProps) {
  const theme = useTheme();
  const router = useRouter();
  const [avatarUrl, setAvatarUrl] = useState<string | null>(null);
  const [unreadNotifications, setUnreadNotifications] = useState(0);
  const [unreadMessages, setUnreadMessages] = useState(0);
  const [cartCount, setCartCount] = useState(0);
  const [searchValue, setSearchValue] = useState("");
  const [isMobile, setIsMobile] = useState(true); // mobile-first: nav links collapse on phones

  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        const res = await fetch("/api/auth/session", { cache: "no-store" });
        if (!res.ok || cancelled) return;
        const data = (await res.json()) as {
          authenticated?: boolean;
          user?: {
            avatarUrl?: string | null;
          };
        };
        if (!data.authenticated) return;
        setAvatarUrl(data.user?.avatarUrl ?? null);
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

  // Cart badge — real count from the persistent server-authoritative cart
  // (GET /api/cart → itemCount), not a client-side/in-memory estimate.
  useEffect(() => {
    let cancelled = false;
    async function pollCart() {
      try {
        const res = await fetch("/api/cart", { cache: "no-store", credentials: "include" });
        if (cancelled || !res.ok) return;
        const d = await res.json();
        setCartCount(typeof d.itemCount === "number" ? d.itemCount : 0);
      } catch {
        /* leave count at last-known value */
      }
    }
    void pollCart();
    const id = setInterval(pollCart, 30_000);
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

  const openNotifications = () => {
    // Canonical single entry: toggle notifications drawer in-shell (never leave Fan/Performer shell).
    openCanonicalWorkspaceQuick("notifications", "DRAWER");
    NotificationEngine.markAllSeen();
    void fetch("/api/notifications", {
      method: "POST",
      headers: { "content-type": "application/json" },
      credentials: "include",
      body: JSON.stringify({ action: "mark_all_seen" }),
    }).catch(() => {});
    setUnreadNotifications(NotificationEngine.getUnreadCount());
  };

  const openMessages = () => {
    openCanonicalWorkspaceQuick("messaging", "DRAWER");
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

      {/* Primary nav — shell secondary destinations only (no legacy Home/Discover/Live Now/Lobby board) */}
      {!isMobile && (
      <nav style={{ display: "flex", alignItems: "center", gap: 14, flexShrink: 0 }}>
        {NAV_LINKS.map((link) => (
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
        ))}
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

      {/* Cart — real persistent count from GET /api/cart, never fabricated */}
      <Link
        href="/cart"
        aria-label={`Cart${cartCount > 0 ? `, ${cartCount} item${cartCount === 1 ? "" : "s"}` : ""}`}
        style={{ position: "relative", flexShrink: 0, fontSize: 16, lineHeight: 1, textDecoration: "none" }}
      >
        🛒
        {cartCount > 0 ? (
          <span
            style={{
              position: "absolute",
              top: -5,
              right: -7,
              background: theme.primary,
              color: "#050510",
              fontSize: 8,
              fontWeight: 900,
              borderRadius: 999,
              padding: "1px 4px",
              minWidth: 14,
              textAlign: "center",
            }}
          >
            {cartCount > 99 ? "99+" : cartCount}
          </span>
        ) : null}
      </Link>

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

      {/* Profile — anchored overlay; identity tier from session hydration */}
      <div style={{ position: "relative", flexShrink: 0 }}>
        <AccountCommandMenu
          userId={userId}
          displayName={displayName}
          avatarUrl={avatarUrl}
          accentColor={theme.primary}
          compact
        />
      </div>
    </div>
  );
}
