"use client";

import { useEffect, useState } from "react";
import { useDrawer } from "./DrawerContext";

export interface CanisterAction {
  id: string;
  label: string;
  icon: string;
}

export default function ActionCanister({
  actions,
  side = "left",
  initialCollapsed = true,
  containerStyle,
}: {
  actions: CanisterAction[];
  side?: "left" | "right";
  initialCollapsed?: boolean;
  containerStyle?: React.CSSProperties;
}) {
  const { activeDrawer, toggleDrawer } = useDrawer();
  const [collapsed, setCollapsed] = useState(initialCollapsed);

  useEffect(() => {
    if (typeof window === "undefined") return;
    const saved = window.localStorage.getItem(`tmi.actionCanister.${side}.collapsed`);
    if (saved === "true" || saved === "false") {
      setCollapsed(saved === "true");
    }
  }, [side]);

  useEffect(() => {
    if (typeof window === "undefined") return;
    window.localStorage.setItem(`tmi.actionCanister.${side}.collapsed`, String(collapsed));
  }, [collapsed, side]);

  // Collapsed state renders only a slim, flush-to-edge tab — not the full
  // padded/backdrop-blurred rail container — so there's nothing floating or
  // obstructing the view when the rail isn't in use.
  if (collapsed) {
    return (
      <button
        onClick={() => setCollapsed(false)}
        title="Open menu"
        aria-label="Open menu"
        style={{
          position: 'fixed',
          left: side === 'left' ? 0 : undefined,
          right: side === 'right' ? 0 : undefined,
          top: '50%',
          transform: 'translateY(-50%)',
          zIndex: 9999,
          background: 'rgba(5, 8, 15, 0.45)',
          border: 'none',
          borderRadius: side === 'left' ? '0 8px 8px 0' : '8px 0 0 8px',
          color: 'rgba(255,255,255,0.35)',
          width: 14,
          height: 48,
          cursor: 'pointer',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          fontSize: 10,
          padding: 0,
          transition: 'all 0.2s ease',
          ...containerStyle,
        }}
      >
        {side === 'left' ? '▶' : '◀'}
      </button>
    );
  }

  return (
    <div style={{
      display: 'flex', flexDirection: 'column', gap: 6,
      background: 'rgba(5, 8, 15, 0.65)',
      border: '1px solid rgba(255,255,255,0.1)',
      borderRadius: 14, padding: 'clamp(4px, 1vw, 8px)', backdropFilter: 'blur(16px)',
      boxShadow: '0 10px 30px rgba(0,0,0,0.6)',
      position: 'fixed',
      left: side === 'left' ? 'clamp(4px, 2vw, 16px)' : undefined,
      right: side === 'right' ? 'clamp(4px, 2vw, 16px)' : undefined,
      top: '50%',
      transform: 'translateY(-50%)',
      zIndex: 9999, /* Bumped z-index to ensure it never gets trapped under canvas layers */
      transition: 'all 0.2s ease',
      ...containerStyle,
    }}>
      <button
        onClick={() => setCollapsed(true)}
        title="Collapse menu"
        aria-label="Collapse menu"
        style={{
          background: 'transparent',
          border: '1px solid rgba(255,255,255,0.15)',
          color: 'rgba(255,255,255,0.5)',
          borderRadius: 8,
          padding: '6px',
          cursor: 'pointer',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          fontSize: 12,
          marginBottom: 2,
        }}
      >
        {side === 'left' ? '◀' : '▶'}
      </button>

      {actions.map(a => {
        const isActive = activeDrawer === a.id;
        return (
          <button
            key={a.id}
            onClick={() => toggleDrawer(a.id)}
            title={a.label}
            style={{
              background: isActive ? 'rgba(0,255,255,0.15)' : 'transparent',
              border: `1px solid ${isActive ? '#00FFFF' : 'transparent'}`,
              color: isActive ? '#00FFFF' : 'rgba(255,255,255,0.5)',
              padding: 'clamp(8px, 1.5vw, 12px) clamp(8px, 2vw, 14px)', borderRadius: 10, cursor: 'pointer',
              fontSize: 10, fontWeight: 800, textTransform: 'uppercase',
              display: 'flex', alignItems: 'center', gap: 'clamp(6px, 1vw, 12px)', transition: 'all 0.2s',
              letterSpacing: '0.08em'
            }}
          >
            <span style={{ fontSize: 'clamp(16px, 4vw, 20px)' }}>{a.icon}</span>
            <span className="hidden md:inline-block">{a.label}</span>
          </button>
        )
      })}
    </div>
  );
}