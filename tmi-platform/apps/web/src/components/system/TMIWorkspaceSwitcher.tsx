"use client";

import { useRouter, usePathname } from "next/navigation";
import { useEffect, useState } from "react";

interface SessionData {
  authenticated: boolean;
  user?: {
    id?: string;
    name?: string;
    role?: string;
  };
}

/** Workspace tab definition */
interface WorkspaceEntry {
  label: string;
  icon: string;
  /** Navigation target when NOT on /dashboard */
  path: string;
  /** If set, this tab lives inside /dashboard as an in-place workspace */
  wsId?: "fan" | "performer" | "admin";
}

const LS_KEY = "tmi_last_workspace";

export default function TMIWorkspaceSwitcher() {
  const router = useRouter();
  const pathname = usePathname() ?? "";
  const [session, setSession] = useState<SessionData | null>(null);
  /** Mirrors localStorage so the active tab reflects the current workspace */
  const [localWorkspace, setLocalWorkspace] = useState<string>("fan");

  useEffect(() => {
    fetch("/api/auth/session", { credentials: "include", cache: "no-store" })
      .then((r) => r.json())
      .then((data: SessionData) => setSession(data))
      .catch(() => setSession({ authenticated: false }));
  }, [pathname]);

  // Sync localWorkspace from localStorage and listen for in-page switches
  useEffect(() => {
    const saved = localStorage.getItem(LS_KEY);
    if (saved) setLocalWorkspace(saved);

    const handler = (e: Event) => {
      const ws = (e as CustomEvent<{ workspace: string }>).detail?.workspace;
      if (ws) setLocalWorkspace(ws);
    };
    window.addEventListener("tmi:workspace-switch", handler);
    return () => window.removeEventListener("tmi:workspace-switch", handler);
  }, []);

  if (!session?.authenticated || !session?.user) {
    return null;
  }

  const role = (session.user.role ?? "").toUpperCase();

  // Real session role only. Display name is a self-chosen, user-editable
  // signup field - matching on it (e.g. name.includes("marcel")) would let
  // anyone see the Admin tab just by picking that name. Fans/performers
  // cannot switch to each other's accounts, only administrators can
  // (Marcel Dickens, 2026-07-24).
  const showPerformer = ["PERFORMER", "ARTIST", "BAND", "ADMIN", "SUPERADMIN"].includes(role);
  const showAdmin = ["ADMIN", "SUPERADMIN"].includes(role);

  const workspaces: WorkspaceEntry[] = [
    { label: "Fan",      icon: "🎵", path: "/dashboard", wsId: "fan" },
    ...(showPerformer ? [{ label: "Performer", icon: "🎤", path: "/dashboard", wsId: "performer" as const }] : []),
    ...(showAdmin     ? [{ label: "Admin",     icon: "🛡", path: "/admin/overseer", wsId: "admin" as const }] : []),
  ];

  const isOnDashboard = pathname === "/dashboard" || pathname.startsWith("/dashboard/");

  // Determine which tab is visually active
  const activeLabel = (() => {
    if (isOnDashboard) {
      const wsLabels: Record<string, string> = { fan: "Fan", performer: "Performer", admin: "Admin" };
      return wsLabels[localWorkspace] ?? "Fan";
    }
    if (pathname.startsWith("/admin"))         return "Admin";
    if (pathname.startsWith("/hub/fan"))       return "Fan";
    if (pathname.startsWith("/hub/performer")) return "Performer";
    return "";
  })();

  const handleClick = (w: WorkspaceEntry) => {
    if (w.wsId && w.path === "/dashboard") {
      localStorage.setItem(LS_KEY, w.wsId);
      setLocalWorkspace(w.wsId);
      if (isOnDashboard) {
        // Already on dashboard — switch in-place, no navigation
        window.dispatchEvent(
          new CustomEvent("tmi:workspace-switch", { detail: { workspace: w.wsId } })
        );
      } else {
        // Navigate to dashboard; container will restore from localStorage
        router.push("/dashboard");
      }
      return;
    }
    router.push(w.path);
  };

  return (
    <>
      <style>{`
        .tmi-top-switcher-bar {
          position: sticky; top: 0; left: 0; right: 0;
          height: 48px;
          background: rgba(5, 3, 16, 0.82);
          backdrop-filter: blur(16px);
          border-bottom: 1.5px solid rgba(0, 240, 255, 0.16);
          z-index: 99999;
          display: flex; align-items: center; justify-content: space-between;
          padding: 0 20px;
          box-shadow: 0 4px 20px rgba(0, 0, 0, 0.4);
        }
        .tmi-top-logo {
          font-size: 14px; font-weight: 900; letter-spacing: 0.18em;
          color: #00f0ff; text-shadow: 0 0 8px rgba(0,240,255,0.35);
          text-transform: uppercase;
        }
        .tmi-top-tabs { display: flex; gap: 6px; }
        .tmi-top-tab-btn {
          background: rgba(255,255,255,0.02);
          border: 1px solid rgba(255,255,255,0.08); border-radius: 6px;
          padding: 6px 14px; color: rgba(255,255,255,0.6);
          font-size: 10px; font-weight: 800; letter-spacing: 0.08em;
          text-transform: uppercase; cursor: pointer;
          display: flex; align-items: center; gap: 6px;
          transition: all 0.18s cubic-bezier(0.2,0.8,0.2,1);
        }
        .tmi-top-tab-btn:hover {
          background: rgba(0,240,255,0.06);
          border-color: rgba(0,240,255,0.25); color: #00f0ff;
        }
        .tmi-top-tab-btn[data-active="true"] {
          background: rgba(255,45,170,0.12); border-color: #ff2daa;
          color: #ff2daa; box-shadow: 0 0 10px rgba(255,45,170,0.25);
        }
        @media (max-width: 480px) {
          .tmi-top-switcher-bar { padding: 0 10px; }
          .tmi-top-logo { display: none; }
          .tmi-top-tab-btn { padding: 6px 10px; font-size: 9px; }
        }
      `}</style>
      <div className="tmi-top-switcher-bar" aria-label="Workspace Switcher">
        <div className="tmi-top-logo">TMI</div>
        <div className="tmi-top-tabs">
          {workspaces.map((w) => (
            <button
              key={w.label}
              className="tmi-top-tab-btn"
              data-active={String(activeLabel === w.label)}
              onClick={() => handleClick(w)}
            >
              <span>{w.icon}</span>
              <span>{w.label}</span>
            </button>
          ))}
        </div>
        <div style={{ width: 10 }} />
      </div>
    </>
  );
}
