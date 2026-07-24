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

export default function TMIWorkspaceSwitcher() {
  const router = useRouter();
  const pathname = usePathname() ?? "";
  const [session, setSession] = useState<SessionData | null>(null);

  useEffect(() => {
    fetch("/api/auth/session", { credentials: "include", cache: "no-store" })
      .then((r) => r.json())
      .then((data: SessionData) => setSession(data))
      .catch(() => setSession({ authenticated: false }));
  }, [pathname]);

  if (!session?.authenticated || !session?.user) {
    return null;
  }

  const role = (session.user.role ?? "").toUpperCase();
  const name = (session.user.name ?? "").toLowerCase();

  // Permissions matrices
  const showPerformer = ["PERFORMER", "ARTIST", "BAND", "ADMIN", "SUPERADMIN"].includes(role);
  const showAdmin =
    ["ADMIN", "SUPERADMIN"].includes(role) ||
    name.includes("marcel") ||
    name.includes("justin") ||
    name.includes("jay paul sanchez");

  const workspaces = [
    { label: "Dashboard", icon: "🏠", path: "/dashboard" },
    { label: "Fan", icon: "🎵", path: "/hub/fan" },
    ...(showPerformer ? [{ label: "Performer", icon: "🎤", path: "/hub/performer" }] : []),
    ...(showAdmin ? [{ label: "Admin", icon: "🛡", path: "/admin/overview" }] : []),
  ];

  const activeWorkspace = workspaces.find((w) => {
    if (w.path === "/dashboard") return pathname === "/dashboard";
    return pathname.startsWith(w.path);
  })?.label ?? "Dashboard";

  return (
    <>
      <style>{`
        .tmi-top-switcher-bar {
          position: sticky;
          top: 0;
          left: 0;
          right: 0;
          height: 48px;
          background: rgba(5, 3, 16, 0.82);
          backdrop-filter: blur(16px);
          border-bottom: 1.5px solid rgba(0, 240, 255, 0.16);
          z-index: 99999;
          display: flex;
          align-items: center;
          justify-content: space-between;
          padding: 0 20px;
          box-shadow: 0 4px 20px rgba(0, 0, 0, 0.4);
        }
        .tmi-top-logo {
          font-size: 14px;
          font-weight: 900;
          letter-spacing: 0.18em;
          color: #00f0ff;
          text-shadow: 0 0 8px rgba(0, 240, 255, 0.35);
          text-transform: uppercase;
        }
        .tmi-top-tabs {
          display: flex;
          gap: 6px;
        }
        .tmi-top-tab-btn {
          background: rgba(255, 255, 255, 0.02);
          border: 1px solid rgba(255, 255, 255, 0.08);
          border-radius: 6px;
          padding: 6px 14px;
          color: rgba(255, 255, 255, 0.6);
          font-size: 10px;
          font-weight: 800;
          letter-spacing: 0.08em;
          text-transform: uppercase;
          cursor: pointer;
          display: flex;
          align-items: center;
          gap: 6px;
          transition: all 0.18s cubic-bezier(0.2, 0.8, 0.2, 1);
        }
        .tmi-top-tab-btn:hover {
          background: rgba(0, 240, 255, 0.06);
          border-color: rgba(0, 240, 255, 0.25);
          color: #00f0ff;
        }
        .tmi-top-tab-btn[data-active="true"] {
          background: rgba(255, 45, 170, 0.12);
          border-color: #ff2daa;
          color: #ff2daa;
          box-shadow: 0 0 10px rgba(255, 45, 170, 0.25);
        }
        @media (max-width: 480px) {
          .tmi-top-switcher-bar {
            padding: 0 10px;
          }
          .tmi-top-logo {
            display: none;
          }
          .tmi-top-tab-btn {
            padding: 6px 10px;
            font-size: 9px;
          }
        }
      `}</style>
      <div className="tmi-top-switcher-bar" aria-label="Workspace Switcher">
        <div className="tmi-top-logo">TMI Workspace</div>
        <div className="tmi-top-tabs">
          {workspaces.map((w) => (
            <button
              key={w.label}
              className="tmi-top-tab-btn"
              data-active={String(activeWorkspace === w.label)}
              onClick={() => router.push(w.path)}
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
