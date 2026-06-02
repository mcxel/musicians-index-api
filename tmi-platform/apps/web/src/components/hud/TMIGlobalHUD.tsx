"use client";

import { useState, useEffect } from "react";
import { usePathname, useRouter } from "next/navigation";
import Link from "next/link";
import { PersonaSwitcher } from "@/components/hud/PersonaSwitcher";
import StreakBadge from "@/components/gamification/StreakBadge";
import TokenBalance from "@/components/hud/TokenBalance";

interface SessionUser {
  id: string;
  name?: string;
  email: string;
  role: string;
  xp?: number;
}

interface SubmissionActivity {
  id: string;
  title: string;
  type: string;
  submitterId: string;
  createdAt: number;
}

export function TMIGlobalHUD() {
  const pathname = usePathname();
  const router = useRouter();
  const [user, setUser] = useState<SessionUser | null>(null);
  const [expanded, setExpanded] = useState(false);
  const [notifCount, setNotifCount] = useState(3);
  const [msgCount, setMsgCount] = useState(1);
  const [isLive, setIsLive] = useState(false);
  const [hudHovered, setHudHovered] = useState(false);
  const [submissionToast, setSubmissionToast] = useState<string>('');
  const [arenaToast, setArenaToast] = useState<string>('');
  const isHome = pathname === '/home/1' || pathname === '/';

  const goBackSafe = () => {
    if (typeof window !== 'undefined' && window.history.length > 2) {
      router.back();
      return;
    }
    router.push('/home/1');
  };

  useEffect(() => {
    // Check session
    fetch("/api/auth/session", { credentials: "include", cache: "no-store" })
      .then((r) => r.json())
      .then((data: { authenticated?: boolean; user?: SessionUser }) => {
        if (data.authenticated && data.user) {
          setUser(data.user);
        }
      })
      .catch(() => {});
  }, []);

  useEffect(() => {
    const onArenaStatus = (event: Event) => {
      const detail = (event as CustomEvent<{ message?: string }>).detail;
      if (!detail?.message) return;
      setArenaToast(detail.message);
      window.setTimeout(() => setArenaToast(''), 2600);
    };

    const onArenaMessage = () => {
      setMsgCount((count) => Math.min(99, count + 1));
    };

    if (typeof window !== 'undefined') {
      window.addEventListener('tmi:arena-status', onArenaStatus);
      window.addEventListener('tmi:arena-message', onArenaMessage);
    }

    return () => {
      if (typeof window !== 'undefined') {
        window.removeEventListener('tmi:arena-status', onArenaStatus);
        window.removeEventListener('tmi:arena-message', onArenaMessage);
      }
    };
  }, []);

  useEffect(() => {
    if (typeof window === 'undefined') return;

    const syncLiveState = () => {
      setIsLive(localStorage.getItem('tmi_is_live') === 'true');
    };

    syncLiveState();

    const onGoLive = () => setIsLive(true);
    const onEndBroadcast = () => setIsLive(false);

    window.addEventListener('storage', syncLiveState);
    window.addEventListener('tmi:golive', onGoLive);
    window.addEventListener('tmi:endbroadcast', onEndBroadcast);

    return () => {
      window.removeEventListener('storage', syncLiveState);
      window.removeEventListener('tmi:golive', onGoLive);
      window.removeEventListener('tmi:endbroadcast', onEndBroadcast);
    };
  }, []);

  useEffect(() => {
    if (pathname?.startsWith('/home')) {
      setExpanded(false);
    }
  }, [pathname]);

  useEffect(() => {
    const onSubmissionCreated = (event: Event) => {
      const detail = (event as CustomEvent<SubmissionActivity>).detail;
      if (!detail?.title) return;
      setSubmissionToast(`Uploaded: ${detail.title}`);
      window.setTimeout(() => setSubmissionToast(''), 3600);
    };

    if (typeof window !== 'undefined') {
      window.addEventListener('tmi:submission-created', onSubmissionCreated);
    }

    return () => {
      if (typeof window !== 'undefined') {
        window.removeEventListener('tmi:submission-created', onSubmissionCreated);
      }
    };
  }, []);

  // Only render when logged in
  if (!user) return null;
  if (pathname?.startsWith('/admin')) return null;

  const xp = user.xp ?? 0;
  const xpTier = xp >= 5000 ? "DIAMOND" : xp >= 3000 ? "PLATINUM" : xp >= 2000 ? "GOLD" : xp >= 1000 ? "SILVER" : xp >= 500 ? "PRO" : "FREE";
  const xpMax = 5000;
  const xpPct = Math.min(100, (xp / xpMax) * 100);

  const resolveGoLive = async () => {
    try {
      if (isLive) {
        await fetch('/api/live/go', { method: 'DELETE', credentials: 'include' });
        localStorage.removeItem('tmi_is_live');
        window.dispatchEvent(new CustomEvent('tmi:endbroadcast', {
          detail: {
            userId: user.id,
            displayName: user.name ?? user.email,
            role: user.role,
          },
        }));
        setIsLive(false);
        return;
      }

      window.dispatchEvent(new CustomEvent('tmi:live-syncing', {
        detail: {
          userId: user.id,
          displayName: user.name ?? user.email,
          role: user.role,
          genre: 'Live',
        },
      }));

      const response = await fetch('/api/live/go', {
        method: 'POST',
        credentials: 'include',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          displayName: user.name ?? user.email,
          role: (user.role ?? 'fan').toLowerCase(),
          genre: 'Live',
        }),
      });

      if (response.ok) {
        localStorage.setItem('tmi_is_live', 'true');
        window.dispatchEvent(new CustomEvent('tmi:golive', {
          detail: {
            userId: user.id,
            displayName: user.name ?? user.email,
            role: user.role,
            genre: 'Live',
          },
        }));
        setIsLive(true);
        router.push('/live/lobby');
      }
    } catch {
      router.push('/go-live');
    }
  };

  if (!expanded) {
    return (
      <button
        onClick={() => setExpanded(true)}
        style={{
          position: "fixed",
          bottom: 20,
          right: 16,
          top: "auto",
          zIndex: 1000,
          width: 32,
          height: 32,
          borderRadius: "50%",
          background: "radial-gradient(circle at 35% 35%, rgba(0,255,255,0.9), rgba(170,45,255,0.5) 55%, rgba(0,0,0,0.96) 100%)",
          border: "1px solid rgba(0,255,255,0.55)",
          color: "#00FFFF",
          fontSize: 14,
          cursor: "pointer",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          boxShadow: "0 0 22px rgba(0,255,255,0.3), 0 0 40px rgba(170,45,255,0.18)",
        }}
        aria-label="Open HUD"
      >
        ●
      </button>
    );
  }

  return (
    <div
      onMouseEnter={() => {
        setHudHovered(true);
        setExpanded(true);
      }}
      onMouseLeave={() => {
        setHudHovered(false);
        setExpanded(false);
      }}
      style={{
        position: "fixed",
        bottom: 20,
        right: 16,
        top: "auto",
        zIndex: 1000,
        display: "flex",
        flexDirection: "column",
        gap: 8,
        pointerEvents: "none",
      }}
    >
      {submissionToast && (
        <div
          style={{
            pointerEvents: 'all',
            alignSelf: 'flex-end',
            borderRadius: 10,
            border: '1px solid rgba(0,255,255,0.38)',
            background: 'linear-gradient(135deg, rgba(0,255,255,0.16), rgba(170,45,255,0.18))',
            color: '#fff',
            fontSize: 10,
            fontWeight: 900,
            letterSpacing: '0.08em',
            textTransform: 'uppercase',
            padding: '8px 10px',
            maxWidth: 280,
            boxShadow: '0 0 24px rgba(0,255,255,0.24)',
          }}
        >
          {submissionToast}
        </div>
      )}

      {arenaToast && (
        <div
          style={{
            pointerEvents: 'all',
            alignSelf: 'flex-end',
            borderRadius: 10,
            border: '1px solid rgba(170,45,255,0.45)',
            background: 'linear-gradient(135deg, rgba(170,45,255,0.16), rgba(0,255,255,0.14))',
            color: '#fff',
            fontSize: 10,
            fontWeight: 900,
            letterSpacing: '0.08em',
            textTransform: 'uppercase',
            padding: '8px 10px',
            maxWidth: 280,
            boxShadow: '0 0 24px rgba(170,45,255,0.22)',
          }}
        >
          {arenaToast}
        </div>
      )}

      {/* Main HUD bar */}
      <div
        style={{
          pointerEvents: "all",
          background: "rgba(5,5,16,0.96)",
          border: "1px solid rgba(0,255,255,0.25)",
          borderRadius: 12,
          padding: "8px 12px",
          display: "flex",
          alignItems: "center",
          gap: 10,
          backdropFilter: "blur(12px)",
          boxShadow: "0 4px 24px rgba(0,0,0,0.6)",
          minWidth: 260,
          maxWidth: 320,
        }}
      >
        {/* Back + Home nav */}
        {!isHome && (
          <div style={{ display: "flex", gap: 4, flexShrink: 0 }}>
            <button
              onClick={goBackSafe}
              title="Go back"
              aria-label="Go back"
              style={{
                width: 28, height: 28, borderRadius: 7,
                background: "rgba(255,255,255,0.04)", border: "1px solid rgba(255,255,255,0.08)",
                cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center",
                color: "rgba(255,255,255,0.5)", fontSize: 13, fontWeight: 700,
              }}
            >‹</button>
            <Link
              href="/home/1"
              title="Home"
              aria-label="Home"
              style={{
                width: 28, height: 28, borderRadius: 7,
                background: "rgba(255,255,255,0.04)", border: "1px solid rgba(255,255,255,0.08)",
                display: "flex", alignItems: "center", justifyContent: "center",
                textDecoration: "none", fontSize: 13,
                color: "rgba(255,255,255,0.5)",
              }}
            >⌂</Link>
          </div>
        )}

        {/* Persona Switcher (compact) */}
        <div style={{ flex: 1, minWidth: 0 }}>
          <PersonaSwitcher userId={user.id} currentRole={user.role} compact />
        </div>

        {/* Token balance */}
        <TokenBalance userId={user.id} compact accentColor="#FFD700" />

        {/* Notification bell */}
        <Link
          href="/notifications"
          style={{
            position: "relative",
            width: 32,
            height: 32,
            borderRadius: 8,
            background: notifCount > 0 ? "rgba(255,45,170,0.12)" : "rgba(255,255,255,0.04)",
            border: `1px solid ${notifCount > 0 ? "rgba(255,45,170,0.4)" : "rgba(255,255,255,0.08)"}`,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            fontSize: 14,
            textDecoration: "none",
            flexShrink: 0,
          }}
          onClick={() => setNotifCount(0)}
          aria-label="Notifications"
        >
          🔔
          {notifCount > 0 && (
            <span style={{
              position: "absolute",
              top: -4, right: -4,
              width: 16, height: 16,
              borderRadius: "50%",
              background: "#FF2DAA",
              fontSize: 8,
              fontWeight: 800,
              color: "#fff",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
            }}>
              {notifCount}
            </span>
          )}
        </Link>

        {/* Messages */}
        <Link
          href="/messages"
          style={{
            position: "relative",
            width: 32,
            height: 32,
            borderRadius: 8,
            background: msgCount > 0 ? "rgba(0,255,255,0.1)" : "rgba(255,255,255,0.04)",
            border: `1px solid ${msgCount > 0 ? "rgba(0,255,255,0.3)" : "rgba(255,255,255,0.08)"}`,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            fontSize: 14,
            textDecoration: "none",
            flexShrink: 0,
          }}
          onClick={() => setMsgCount(0)}
          aria-label="Messages"
        >
          💬
          {msgCount > 0 && (
            <span style={{
              position: "absolute",
              top: -4, right: -4,
              width: 16, height: 16,
              borderRadius: "50%",
              background: "#00FFFF",
              fontSize: 8,
              fontWeight: 800,
              color: "#050510",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
            }}>
              {msgCount}
            </span>
          )}
        </Link>

        {/* Live indicator */}
        <button
          onClick={() => { void resolveGoLive(); }}
          style={{
            width: 32,
            height: 32,
            borderRadius: 8,
            background: isLive ? "rgba(255,45,170,0.18)" : "rgba(255,255,255,0.04)",
            border: `1px solid ${isLive ? "rgba(255,45,170,0.65)" : "rgba(255,255,255,0.08)"}`,
            cursor: "pointer",
            fontSize: 10,
            fontWeight: 800,
            color: isLive ? "#FF2DAA" : "rgba(255,255,255,0.3)",
            flexShrink: 0,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            boxShadow: isLive ? "0 0 18px rgba(255,45,170,0.22)" : "none",
          }}
          aria-label="Go live"
        >
          {isLive ? "🔴" : "⚫"}
        </button>

        {/* Collapse */}
        <button
          onClick={() => setExpanded(false)}
          style={{
            width: 28,
            height: 28,
            borderRadius: 6,
            background: "transparent",
            border: "none",
            cursor: "pointer",
            color: "rgba(255,255,255,0.3)",
            fontSize: 10,
            flexShrink: 0,
          }}
          aria-label="Collapse HUD"
        >
          ▶
        </button>
      </div>

      {/* XP bar — hidden by default, visible on HUD hover */}
      <div
        style={{
          pointerEvents: hudHovered ? "all" : "none",
          opacity: hudHovered ? 1 : 0,
          transform: hudHovered ? "translateY(0)" : "translateY(6px)",
          transition: "opacity 200ms ease, transform 200ms ease",
          background: "rgba(5,5,16,0.9)",
          border: "1px solid rgba(255,255,255,0.06)",
          borderRadius: 10,
          padding: "8px 12px",
          backdropFilter: "blur(12px)",
        }}
      >
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 6 }}>
          <span style={{ fontSize: 9, color: "rgba(255,255,255,0.35)", fontWeight: 700, letterSpacing: "0.1em" }}>XP</span>
          <span style={{ fontSize: 9, color: "#FFD700", fontWeight: 800 }}>{xpTier}</span>
        </div>
        <div style={{ height: 3, background: "rgba(255,255,255,0.06)", borderRadius: 2, overflow: "hidden" }}>
          <div style={{ width: `${xpPct}%`, height: "100%", background: "linear-gradient(90deg,#AA2DFF,#FF2DAA)", borderRadius: 2 }} />
        </div>
        <div style={{ fontSize: 8, color: "rgba(255,255,255,0.25)", marginTop: 4, textAlign: "right" }}>{xp.toLocaleString()} / {xpMax.toLocaleString()} XP</div>
      </div>

      {/* Streak chip — compact, sits above XP bar */}
      <div style={{ pointerEvents: 'all', display: 'flex', justifyContent: 'flex-end' }}>
        <StreakBadge />
      </div>

      <div style={{ pointerEvents: 'all', display: 'flex', justifyContent: 'flex-end', marginTop: 6 }}>
        <button
          onClick={() => { void resolveGoLive(); }}
          style={{
            border: '1px solid rgba(255,45,170,0.5)',
            background: isLive ? 'linear-gradient(135deg, rgba(255,45,170,0.2), rgba(170,45,255,0.18))' : 'linear-gradient(135deg, #FF2DAA, #FFD700)',
            color: isLive ? '#FF2DAA' : '#050510',
            borderRadius: 999,
            padding: '10px 14px',
            fontSize: 10,
            fontWeight: 900,
            letterSpacing: '0.14em',
            textTransform: 'uppercase',
            cursor: 'pointer',
            boxShadow: isLive ? '0 0 18px rgba(255,45,170,0.22)' : '0 0 18px rgba(255,45,170,0.32)',
            whiteSpace: 'nowrap',
          }}
        >
          {isLive ? 'End Broadcast' : 'Go Live'}
        </button>
      </div>
    </div>
  );
}

export default TMIGlobalHUD;
