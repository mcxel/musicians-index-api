"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import type { CSSProperties } from "react";

export interface WorkspaceDockNavItem {
  id: string;
  label: string;
  icon: string;
  href: string;
  badge?: number;
  primary?: boolean;
}

export interface WorkspaceDockButton {
  id: string;
  label: string;
  icon: string;
  onClick?: () => void;
  disabled?: boolean;
  active?: boolean;
  emphasis?: boolean;
}

export interface WorkspaceControlDockProps {
  roleLabel: string;
  playlistLabel: string;
  accentColor: string;
  nowPlayingTitle: string;
  nowPlayingSubtitle: string;
  progressLabel: string;
  isPlaying: boolean;
  waveTick: number;
  workspaceOpen: boolean;
  online: boolean;
  statusLabel: string;
  statusDetail: string;
  controls: readonly WorkspaceDockButton[];
  navItems: readonly WorkspaceDockNavItem[];
  quickActions: readonly WorkspaceDockButton[];
  onToggleWorkspace: () => void;
  onOpenPlaylist: () => void;
  onPrev: () => void;
  onTogglePlay: () => void;
  onNext: () => void;
}

export default function WorkspaceControlDock({
  roleLabel,
  playlistLabel,
  accentColor,
  nowPlayingTitle,
  nowPlayingSubtitle,
  progressLabel,
  isPlaying,
  waveTick,
  workspaceOpen,
  online,
  statusLabel,
  statusDetail,
  controls,
  navItems,
  quickActions,
  onToggleWorkspace,
  onOpenPlaylist,
  onPrev,
  onTogglePlay,
  onNext,
}: WorkspaceControlDockProps) {
  const [isMobile, setIsMobile] = useState(true);

  useEffect(() => {
    const mql = window.matchMedia("(max-width: 768px)");
    const sync = () => setIsMobile(mql.matches);
    sync();
    mql.addEventListener("change", sync);
    return () => mql.removeEventListener("change", sync);
  }, []);

  const dockGridStyle: CSSProperties = isMobile
    ? {
        display: "grid",
        gridTemplateColumns: "minmax(0, 1fr)",
        gap: 10,
        width: "100%",
        alignItems: "stretch",
      }
    : {
        display: "grid",
        gridTemplateColumns: "minmax(220px, 1fr) minmax(360px, 1.5fr) minmax(220px, 1fr)",
        gap: 12,
        width: "100%",
        alignItems: "stretch",
      };

  const controlsGridStyle: CSSProperties = {
    display: "grid",
    gridTemplateColumns: isMobile ? "repeat(2, minmax(0, 1fr))" : "repeat(3, minmax(0, 1fr))",
    gap: 8,
    width: "100%",
  };

  const quickActionsGridStyle: CSSProperties = {
    display: "grid",
    gridTemplateColumns: "repeat(2, minmax(0, 1fr))",
    gap: 8,
    marginTop: 10,
    width: "100%",
  };

  return (
    <div style={dockGridStyle}>
      <section style={cardStyle(accentColor)}>
        <div style={titleStyle}>{playlistLabel.toUpperCase()}</div>
        <button type="button" onClick={onOpenPlaylist} style={coverButtonStyle(accentColor)} aria-label="Open playlist drawer">
          🎵
        </button>
        <div style={{ minWidth: 0, flex: 1 }}>
          <div style={trackTitleStyle}>{nowPlayingTitle}</div>
          <div style={trackSubtitleStyle}>{nowPlayingSubtitle}</div>
          <div style={{ display: "flex", alignItems: "center", gap: 8, marginTop: 8 }}>
            <button type="button" onClick={onPrev} style={transportBtnStyle} aria-label="Previous track">⏮</button>
            <button type="button" onClick={onTogglePlay} style={{ ...transportBtnStyle, color: accentColor }} aria-label={isPlaying ? "Pause" : "Play"}>
              {isPlaying ? "⏸" : "▶"}
            </button>
            <button type="button" onClick={onNext} style={transportBtnStyle} aria-label="Next track">⏭</button>
            <span style={progressStyle}>{progressLabel}</span>
          </div>
        </div>
        <div style={eqStyle} aria-hidden>
          {[0, 1, 2, 3, 4, 5].map((index) => {
            const height = isPlaying
              ? 4 + ((Math.sin(waveTick * 0.7 + index * 0.9) + 1) * 0.5) * 14
              : 3;
            return (
              <span
                key={index}
                style={{
                  width: 3,
                  height,
                  borderRadius: 1,
                  background: `linear-gradient(180deg, ${accentColor}, rgba(255,255,255,0.45))`,
                  transition: "height 0.1s ease",
                }}
              />
            );
          })}
        </div>
      </section>

      <section style={cardStyle(accentColor)}>
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", gap: 8, marginBottom: 8, flexWrap: "wrap" }}>
          <div style={titleStyle}>{roleLabel.toUpperCase()} CONTROL DRAWER</div>
          <button type="button" onClick={onToggleWorkspace} style={workspaceToggleStyle(workspaceOpen, accentColor)}>
            {workspaceOpen ? "▼ WORKSPACE" : "▲ WORKSPACE"}
          </button>
        </div>
        <div style={controlsGridStyle}>
          {controls.map((control) => (
            <button
              key={control.id}
              type="button"
              onClick={control.onClick}
              disabled={control.disabled}
              style={actionButtonStyle(control, accentColor)}
            >
              <span>{control.icon}</span>
              <span>{control.label}</span>
            </button>
          ))}
        </div>
        <div style={navRowStyle}>
          {navItems.map((item) => (
            <Link key={item.id} href={item.href} style={navLinkStyle(item.primary)}>
              <span>{item.icon}</span>
              <span>{item.label}</span>
              {item.badge && item.badge > 0 ? <Badge count={item.badge} /> : null}
            </Link>
          ))}
        </div>
      </section>

      <section style={cardStyle(accentColor)}>
        <div style={titleStyle}>SYSTEM STATUS</div>
        <div style={{ fontSize: 12, fontWeight: 900, color: online ? "#00FF88" : "#FF6666" }}>{statusLabel}</div>
        <div style={{ fontSize: 10, color: "rgba(255,255,255,0.5)" }}>{statusDetail}</div>
        <div style={quickActionsGridStyle}>
          {quickActions.map((action) => (
            <button
              key={action.id}
              type="button"
              onClick={action.onClick}
              disabled={action.disabled}
              style={quickActionStyle(action, accentColor)}
            >
              <span>{action.icon}</span>
              <span>{action.label}</span>
            </button>
          ))}
        </div>
      </section>
    </div>
  );
}

function cardStyle(accentColor: string): CSSProperties {
  return {
    background: "rgba(7, 10, 24, 0.92)",
    border: `1px solid ${accentColor}33`,
    boxShadow: `0 10px 28px rgba(0,0,0,0.45), 0 0 12px ${accentColor}18`,
    borderRadius: 14,
    padding: 12,
    display: "flex",
    alignItems: "center",
    gap: 10,
    minHeight: 122,
    minWidth: 0,
    width: "100%",
    flexWrap: "wrap",
  };
}

const titleStyle: CSSProperties = {
  width: "100%",
  fontSize: 10,
  fontWeight: 900,
  letterSpacing: "0.16em",
  color: "rgba(255,255,255,0.48)",
};

function coverButtonStyle(accentColor: string): CSSProperties {
  return {
    width: 42,
    height: 42,
    borderRadius: 10,
    border: `1px solid ${accentColor}88`,
    background: `linear-gradient(135deg, ${accentColor}, rgba(255,255,255,0.18))`,
    color: "#050510",
    fontSize: 16,
    fontWeight: 900,
    cursor: "pointer",
    flexShrink: 0,
  };
}

const trackTitleStyle: CSSProperties = {
  fontSize: 12,
  fontWeight: 900,
  color: "#fff",
  whiteSpace: "nowrap",
  overflow: "hidden",
  textOverflow: "ellipsis",
};

const trackSubtitleStyle: CSSProperties = {
  fontSize: 10,
  color: "rgba(255,255,255,0.48)",
  whiteSpace: "nowrap",
  overflow: "hidden",
  textOverflow: "ellipsis",
};

const transportBtnStyle: CSSProperties = {
  background: "transparent",
  border: "none",
  color: "rgba(255,255,255,0.78)",
  fontSize: 11,
  cursor: "pointer",
  lineHeight: 1,
  padding: 0,
};

const progressStyle: CSSProperties = {
  fontSize: 9,
  color: "rgba(255,255,255,0.38)",
  fontWeight: 700,
};

const eqStyle: CSSProperties = {
  display: "flex",
  alignItems: "flex-end",
  gap: 2,
  height: 20,
  marginLeft: "auto",
};

function actionButtonStyle(action: WorkspaceDockButton, accentColor: string): CSSProperties {
  return {
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    gap: 6,
    minHeight: 34,
    borderRadius: 10,
    border: action.emphasis
      ? `1px solid ${accentColor}`
      : action.active
        ? `1px solid ${accentColor}`
        : "1px solid rgba(255,255,255,0.14)",
    background: action.emphasis
      ? `linear-gradient(135deg, ${accentColor}, rgba(255,255,255,0.14))`
      : action.active
        ? `${accentColor}22`
        : "rgba(255,255,255,0.05)",
    color: action.emphasis ? "#050510" : action.active ? accentColor : "#fff",
    fontSize: 10,
    fontWeight: 900,
    cursor: action.disabled ? "not-allowed" : "pointer",
    opacity: action.disabled ? 0.42 : 1,
    fontFamily: "inherit",
    whiteSpace: "nowrap",
  };
}

const navRowStyle: CSSProperties = {
  display: "flex",
  alignItems: "center",
  gap: 10,
  width: "100%",
  marginTop: 10,
  paddingTop: 10,
  borderTop: "1px solid rgba(255,255,255,0.08)",
  flexWrap: "wrap",
  overflowX: "hidden",
};

function navLinkStyle(primary?: boolean): CSSProperties {
  return {
    position: "relative",
    display: "inline-flex",
    alignItems: "center",
    gap: 4,
    fontSize: 10,
    fontWeight: 800,
    color: primary ? "#00FFFF" : "rgba(255,255,255,0.86)",
    textDecoration: "none",
    padding: "2px 0",
    whiteSpace: "nowrap",
  };
}

function workspaceToggleStyle(workspaceOpen: boolean, accentColor: string): CSSProperties {
  return {
    border: `1px solid ${workspaceOpen ? accentColor : "rgba(255,255,255,0.18)"}`,
    background: workspaceOpen ? `${accentColor}22` : "rgba(255,255,255,0.05)",
    color: workspaceOpen ? accentColor : "#d6b5ff",
    borderRadius: 8,
    fontSize: 10,
    fontWeight: 900,
    cursor: "pointer",
    padding: "4px 8px",
  };
}

function quickActionStyle(action: WorkspaceDockButton, accentColor: string): CSSProperties {
  return {
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    gap: 5,
    minHeight: 32,
    borderRadius: 10,
    border: `1px solid ${action.active ? accentColor : "rgba(255,255,255,0.14)"}`,
    background: action.active ? `${accentColor}22` : "rgba(255,255,255,0.05)",
    color: action.active ? accentColor : "rgba(255,255,255,0.86)",
    fontSize: 10,
    fontWeight: 800,
    cursor: action.disabled ? "not-allowed" : "pointer",
    opacity: action.disabled ? 0.42 : 1,
    fontFamily: "inherit",
  };
}

function Badge({ count }: { count: number }) {
  return (
    <span
      style={{
        position: "absolute",
        top: -6,
        right: -10,
        background: "#FF0055",
        color: "#fff",
        fontSize: 7,
        fontWeight: 900,
        padding: "1px 4px",
        borderRadius: 4,
        minWidth: 14,
        textAlign: "center",
      }}
    >
      {count > 99 ? "99+" : count}
    </span>
  );
}