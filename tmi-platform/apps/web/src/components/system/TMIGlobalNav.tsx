"use client";

import { useRouter, usePathname } from "next/navigation";
import { useEffect, useState, useCallback } from "react";
import { NotificationEngine } from "@/lib/notifications/NotificationEngine";
import { launchDockStore } from "@/lib/dock/launchDockStore";
import { triggerCanonicalGoLive } from "@/lib/dock/presentInstantGoLiveInPlace";
import { liveDiscoveryOverlayStore } from "@/lib/discovery/liveDiscoveryOverlayStore";
import {
  openCanonicalWorkspaceQuick,
  presentCanonicalWorkspace,
} from "@/lib/workspace/universal/openCanonicalPresentation";
import styles from "./TMIGlobalNav.module.css";

interface SessionState {
  authenticated: boolean;
  user?: { id?: string; name?: string; role?: string; tier?: string; avatarUrl?: string | null };
}

const ROLE_COLOR: Record<string, string> = {
  superadmin: "#FF2DAA",
  admin: "#FF2DAA",
  artist: "#FFD700",
  performer: "#00FFFF",
  fan: "#AA2DFF",
  venue: "#FF6B35",
  promoter: "#00FF88",
  advertiser: "#5CE1E6",
  sponsor: "#FFD700",
  default: "#ffffff",
};

const ROLE_PROFILE: Record<string, string> = {
  artist: "/profile/artist",
  performer: "/profile/performer",
  fan: "/profile/fan",
  venue: "/profile/venue",
  promoter: "/profile/promoter",
  advertiser: "/profile/advertiser",
  sponsor: "/profile/sponsor",
  admin: "/admin/overview",
  superadmin: "/admin/overview",
};

const ROLE_DASHBOARD: Record<string, string> = {
  fan: "/hub/fan",
  performer: "/hub/performer",
  artist: "/hub/artist",
  promoter: "/hub/promoter",
  advertiser: "/hub/advertiser",
  sponsor: "/hub/sponsor",
  venue: "/hub/venue",
  admin: "/admin/overview",
  superadmin: "/admin/overview",
};

const NAV_ITEMS = [
  { icon: "🏠", label: "Home", href: "/home/1" },
  { icon: "🧭", label: "Discover", href: "/discover" },
  { icon: "🔴", label: "Live Now", href: "/live" },
  { icon: "🎪", label: "Lobby", href: "/live/lobby" },
  { icon: "🌐", label: "Explore", href: "/explore" },
  { icon: "🔎", label: "Search", href: "/search" },
];

const LIVE_ROLES = new Set(["artist", "performer", "admin", "superadmin", "venue"]);

export default function TMIGlobalNav() {
  const router = useRouter();
  const pathname = usePathname() ?? "";

  const [mounted, setMounted] = useState(false);
  const [session, setSession] = useState<SessionState | null>(null);
  const [loggingOut, setLoggingOut] = useState(false);
  const [unreadCount, setUnreadCount] = useState(0);
  const [goLivePhase, setGoLivePhase] = useState<"idle" | "launching" | "error">("idle");
  const [goLiveError, setGoLiveError] = useState("");
  const [searchOpen, setSearchOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");

  const isHubPath =
    pathname === "/hub" ||
    pathname.startsWith("/hub/") ||
    pathname.startsWith("/dashboard");
  // Immersive PREVIEW VENUE — no legacy bottom dock over ArenaEventShell.
  const isVenuePreviewPath =
    pathname === "/venue/preview" || pathname.startsWith("/venue/preview/");

  useEffect(() => {
    setMounted(true);
    const refresh = () => setUnreadCount(NotificationEngine.getUnreadCount());
    refresh();
    const unsub = NotificationEngine.subscribe(refresh);
    return unsub;
  }, []);

  const fetchSession = useCallback(() => {
    fetch("/api/auth/session", { credentials: "include", cache: "no-store" })
      .then((r) => r.json())
      .then((data: SessionState) => setSession(data))
      .catch(() => setSession({ authenticated: false }));
  }, []);

  useEffect(() => {
    if (!mounted) return;
    fetchSession();

    const refresh = () => fetchSession();
    window.addEventListener("tmi:golive", refresh);
    window.addEventListener("tmi:endbroadcast", refresh);
    window.addEventListener("tmi:session_change", refresh);
    return () => {
      window.removeEventListener("tmi:golive", refresh);
      window.removeEventListener("tmi:endbroadcast", refresh);
      window.removeEventListener("tmi:session_change", refresh);
    };
  }, [fetchSession, mounted]);

  async function handleLogout() {
    setLoggingOut(true);
    try {
      await fetch("/api/auth/logout", { method: "POST", credentials: "include" });
      setSession({ authenticated: false });
      window.dispatchEvent(new CustomEvent("tmi:session_change"));
      router.push("/home/1");
    } catch {
      setLoggingOut(false);
    }
  }

  const isAuthenticated = session?.authenticated === true;
  const user = session?.user;
  const role = (user?.role ?? "default").toLowerCase();
  const userId = user?.id ?? "";
  // P0 Identity/Entitlement Integrity: derive the fallback circle from the
  // person's own registered name, never their database ID — a CUID's first
  // character (e.g. "c" from "cmoq0bpst0000...") is not their initial and
  // reads as a random letter unrelated to who they actually are.
  const userInitial = (user?.name ?? "").trim().charAt(0).toUpperCase() || "?";
  const avatarUrl = user?.avatarUrl ?? null;
  const roleColor = ROLE_COLOR[role] ?? ROLE_COLOR.default!;
  const profileBase = ROLE_PROFILE[role] ?? "/profile";
  const profileHref = isAuthenticated ? `${profileBase}/${userId}` : "/auth/signin";
  const isFlightDeck =
    pathname === "/admin/overseer" ||
    pathname.startsWith("/admin/overseer/") ||
    pathname === "/admin/observatory" ||
    pathname.startsWith("/admin/observatory/");
  const canGoLive = isAuthenticated && LIVE_ROLES.has(role) && !pathname.startsWith("/admin");
  const dashboardHref = isAuthenticated ? ROLE_DASHBOARD[role] ?? "/hub/fan" : "/home/1";
  const safeBottomInset = "max(8px, env(safe-area-inset-bottom, 0px))";

  // Command Center owns MONITORS / GPS / CHAT. Unmount this dock on hub —
  // do not leave a competing Discover / Live Now / Lobby bar or empty spacer.
  // Venue preview is immersive (ArenaEventShell + Venue HUD) — same rule.
  if (isFlightDeck || isHubPath || isVenuePreviewPath) {
    return null;
  }

  if (!mounted) {
    return (
      <nav
        suppressHydrationWarning
        style={{
          position: "fixed",
          bottom: 0,
          left: 0,
          right: 0,
          zIndex: 99999,
          display: "flex",
          gap: 2,
          alignItems: "center",
          background: "rgba(5,3,16,0.96)",
          backdropFilter: "blur(20px)",
          borderTop: "1px solid rgba(0,255,255,0.16)",
          boxShadow: "0 -4px 24px rgba(0,0,0,0.7)",
          padding: `6px 10px calc(6px + ${safeBottomInset})`,
          overflowX: "auto",
          flexWrap: "nowrap",
        }}
        aria-label="Global navigation"
      />
    );
  }

  return (
    <nav
      suppressHydrationWarning
      style={{
        position: "fixed",
        bottom: 0,
        left: 0,
        right: 0,
        zIndex: 99999,
        display: "flex",
        gap: 2,
        alignItems: "center",
        background: "rgba(5,3,16,0.96)",
        backdropFilter: "blur(20px)",
        borderTop: "1px solid rgba(0,255,255,0.16)",
        boxShadow: "0 -4px 24px rgba(0,0,0,0.7)",
        padding: `6px 10px calc(6px + ${safeBottomInset})`,
        overflowX: "auto",
        flexWrap: "nowrap",
      }}
      aria-label="Global navigation"
    >
      {/* User avatar / profile link */}
      {isAuthenticated ? (
        <button
          title={`My Profile (${role})`}
          onClick={() => router.push(profileHref)}
          className={styles.dockItem}
          style={{ padding: "4px 6px" }}
        >
          <span
            style={{
              width: 28,
              height: 28,
              borderRadius: "50%",
              border: `2px solid ${roleColor}`,
              background: avatarUrl ? "#000" : `${roleColor}22`,
              fontSize: 11,
              fontWeight: 900,
              color: roleColor,
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              boxShadow: `0 0 10px ${roleColor}44`,
              overflow: "hidden",
            }}
          >
            {avatarUrl ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img
                src={avatarUrl}
                alt=""
                style={{ width: "100%", height: "100%", objectFit: "cover", borderRadius: "50%" }}
              />
            ) : (
              userInitial
            )}
          </span>
          <span className={styles.dockLabel}>Profile</span>
        </button>
      ) : (
        <button title="Sign In" onClick={() => router.push("/auth/signin")} className={styles.dockItem}>
          <span className={styles.dockIcon} style={{ color: "#FFD700" }}>
            👤
          </span>
          <span className={styles.dockLabel} style={{ color: "#FFD700" }}>
            Sign In
          </span>
        </button>
      )}

      <div
        style={{
          width: 1,
          height: 26,
          background: "rgba(255,255,255,0.08)",
          flexShrink: 0,
          margin: "0 2px",
        }}
      />

      {/* Core nav items */}
      {NAV_ITEMS.map(({ icon, label, href }) => {
        const targetHref = label === "Home" ? dashboardHref : href;
        const opensLobbyDrawer =
          label === "Lobby" || label === "Live Now" || label === "Discover";
        const active =
          !opensLobbyDrawer &&
          (pathname === targetHref || (targetHref !== "/" && pathname.startsWith(targetHref + "/")));
        return (
          <button
            key={label}
            title={opensLobbyDrawer ? "Open lobby / live destinations in drawer" : label}
            onClick={() => {
              if (isHubPath && opensLobbyDrawer) {
                presentCanonicalWorkspace(
                  label === "Live Now" ? "live-destinations" : "lobby",
                  "DRAWER",
                );
                return;
              }
              if (label === "Lobby" || label === "Live Now") {
                liveDiscoveryOverlayStore.open();
                return;
              }
              if (label === "Search") {
                setSearchOpen(true);
                return;
              }
              router.push(targetHref);
            }}
            className={styles.dockItem}
            data-active={String(active)}
          >
            <span className={styles.dockIcon}>{icon}</span>
            <span className={styles.dockLabel}>{label}</span>
          </button>
        );
      })}

      {/* Notifications */}
      <button
        title="Notifications"
        onClick={() => {
          if (isHubPath) {
            openCanonicalWorkspaceQuick("notifications", "DRAWER");
            return;
          }
          router.push("/notifications");
        }}
        className={styles.dockItem}
        data-active={String(pathname.startsWith("/notifications"))}
      >
        <span className={styles.dockIcon}>
          🔔
          {unreadCount > 0 && (
            <span className={styles.dockBadge}>
              {unreadCount > 99 ? "99+" : unreadCount}
            </span>
          )}
        </span>
        <span className={styles.dockLabel}>Alerts</span>
      </button>

      {/* Messages */}
      <button
        title="Messages"
        onClick={() => {
          if (isHubPath) {
            openCanonicalWorkspaceQuick("messaging", "DRAWER");
            return;
          }
          router.push("/messages");
        }}
        className={styles.dockItem}
        data-active={String(pathname.startsWith("/messages"))}
      >
        <span className={styles.dockIcon}>✉️</span>
        <span className={styles.dockLabel}>Messages</span>
      </button>

      <div style={{ flex: 1, minWidth: 8 }} />

      {/* Go Live */}
      {canGoLive && (
        <button
          title="Go Live"
          disabled={goLivePhase === "launching"}
          onClick={() => {
            if (goLivePhase === "launching") return;
            const dockRole = (role || "performer").toUpperCase();
            launchDockStore.setRole(dockRole);
            setGoLivePhase("launching");
            setGoLiveError("");
            // Instant Go Live — calls executeInstantGoLive() directly, same
            // as QuickLiveButton/InstantGoLiveLauncher. Previously gated on
            // launchDockStore.isReady() and fell back to
            // launchDockStore.open(), which is a dead end wherever
            // LaunchDock excludes itself (/admin, /hub, /dashboard) — the
            // store flag flipped but nothing on screen could render it.
            void triggerCanonicalGoLive({
              role: dockRole,
              preferredExperience: "live",
              publishSession: true,
            }).then((r) => {
              if (r.ok) {
                setGoLivePhase("idle");
                return;
              }
              setGoLivePhase("error");
              setGoLiveError(r.error ?? "Failed to start broadcast.");
            });
          }}
          style={{
            padding: "0 12px",
            height: 34,
            borderRadius: 20,
            flexShrink: 0,
            border: pathname.startsWith("/live/go")
              ? "1.5px solid #FF2DAA"
              : "1.5px solid rgba(255,45,170,0.5)",
            background: pathname.startsWith("/live/go")
              ? "rgba(255,45,170,0.22)"
              : "rgba(255,45,170,0.1)",
            cursor: goLivePhase === "launching" ? "default" : "pointer",
            opacity: goLivePhase === "launching" ? 0.6 : 1,
            fontSize: 10,
            fontWeight: 900,
            color: "#FF2DAA",
            letterSpacing: "0.08em",
            display: "flex",
            alignItems: "center",
            gap: 4,
            whiteSpace: "nowrap",
            boxShadow: pathname.startsWith("/live/go") ? "0 0 12px rgba(255,45,170,0.4)" : "none",
            transition: "all 0.2s",
          }}
        >
          <span
            style={{
              width: 6,
              height: 6,
              borderRadius: "50%",
              background: "#FF2DAA",
              display: "inline-block",
            }}
          />
          <span>{goLivePhase === "launching" ? "GOING LIVE…" : "LIVE"}</span>
        </button>
      )}
      {goLivePhase === "error" && goLiveError && (
        <span style={{ fontSize: 9, color: "#FF4444", fontWeight: 700, whiteSpace: "nowrap" }}>
          {goLiveError}
        </span>
      )}

      {/* Logout */}
      {isAuthenticated && (
        <button
          title="Log Out"
          onClick={handleLogout}
          disabled={loggingOut}
          style={{
            width: 30,
            height: 30,
            borderRadius: "50%",
            flexShrink: 0,
            border: "1.5px solid rgba(255,255,255,0.18)",
            background: "transparent",
            cursor: loggingOut ? "not-allowed" : "pointer",
            fontSize: 11,
            color: "rgba(255,255,255,0.45)",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            transition: "all 0.2s",
            opacity: loggingOut ? 0.5 : 1,
            marginLeft: 6,
          }}
        >
          ⏻
        </button>
      )}

      {/* ── Global search modal ─────────────────────────────────────── */}
      {searchOpen && (
        <div
          role="dialog"
          aria-label="Search TMI"
          style={{
            position: "fixed", inset: 0, zIndex: 200000,
            background: "rgba(5,5,16,0.92)", backdropFilter: "blur(18px)",
            display: "flex", flexDirection: "column", alignItems: "center",
            padding: "env(safe-area-inset-top, 0px) 16px 120px",
          }}
          onClick={e => { if (e.target === e.currentTarget) setSearchOpen(false); }}
        >
          {/* Search input bar */}
          <div style={{ width: "100%", maxWidth: 580, marginTop: 52, position: "relative" }}>
            <span style={{ position: "absolute", left: 14, top: "50%", transform: "translateY(-50%)", fontSize: 18, pointerEvents: "none" }}>🔎</span>
            <input
              autoFocus
              type="search"
              value={searchQuery}
              onChange={e => setSearchQuery(e.target.value)}
              onKeyDown={e => {
                if (e.key === "Escape") { setSearchOpen(false); setSearchQuery(""); }
                if (e.key === "Enter" && searchQuery.trim()) {
                  router.push(`/search?q=${encodeURIComponent(searchQuery.trim())}`);
                  setSearchOpen(false); setSearchQuery("");
                }
              }}
              placeholder="Search artists, tracks, venues, magazine…"
              style={{
                width: "100%", padding: "14px 44px 14px 44px", fontSize: 15,
                background: "rgba(255,255,255,0.07)", border: "1.5px solid rgba(0,255,255,0.35)",
                borderRadius: 12, color: "#fff", outline: "none", boxSizing: "border-box",
                boxShadow: "0 0 24px rgba(0,255,255,0.15)",
              }}
            />
            {searchQuery && (
              <button
                onClick={() => setSearchQuery("")}
                style={{ position: "absolute", right: 12, top: "50%", transform: "translateY(-50%)", background: "none", border: "none", color: "rgba(255,255,255,0.4)", cursor: "pointer", fontSize: 18 }}
                aria-label="Clear"
              >✕</button>
            )}
          </div>

          {/* Quick category chips */}
          <div style={{ display: "flex", gap: 8, marginTop: 16, flexWrap: "wrap", justifyContent: "center", maxWidth: 580 }}>
            {[["🎤","Artists","/performers"],["🎵","Tracks","/discover"],["🏟️","Venues","/venues"],["📰","Magazine","/magazine"],["🔴","Live Now","/live"],["🏆","Rankings","/rankings"]].map(([icon,label,href]) => (
              <button key={label} onClick={() => { router.push(href); setSearchOpen(false); }}
                style={{ display: "flex", alignItems: "center", gap: 6, padding: "8px 14px", borderRadius: 20, fontSize: 11, fontWeight: 700, cursor: "pointer", background: "rgba(255,255,255,0.06)", border: "1px solid rgba(255,255,255,0.12)", color: "rgba(255,255,255,0.7)", whiteSpace: "nowrap" }}>
                {icon} {label}
              </button>
            ))}
          </div>

          {/* Go button when query entered */}
          {searchQuery.trim() && (
            <button
              onClick={() => { router.push(`/search?q=${encodeURIComponent(searchQuery.trim())}`); setSearchOpen(false); setSearchQuery(""); }}
              style={{ marginTop: 20, padding: "12px 32px", background: "#00FFFF", color: "#050510", fontWeight: 900, fontSize: 12, letterSpacing: "0.12em", border: "none", borderRadius: 8, cursor: "pointer" }}
            >
              SEARCH TMI →
            </button>
          )}

          <button onClick={() => { setSearchOpen(false); setSearchQuery(""); }}
            style={{ position: "absolute", top: 16, right: 20, background: "none", border: "none", color: "rgba(255,255,255,0.4)", fontSize: 22, cursor: "pointer", padding: "4px 8px" }}
            aria-label="Close search"
          >✕</button>
        </div>
      )}
    </nav>
  );
}
