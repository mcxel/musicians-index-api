"use client";

import { useDrawer } from "./DrawerContext";

export interface CanisterAction {
  id: string;
  label: string;
  icon: string;
}

export default function ActionCanister({ actions }: { actions: CanisterAction[] }) {
  const { activeDrawer, toggleDrawer } = useDrawer();

  return (
    <div style={{
      display: 'flex', flexDirection: 'column', gap: 6,
      background: 'rgba(5, 8, 15, 0.65)',
      border: '1px solid rgba(255,255,255,0.1)',
      borderRadius: 14, padding: 'clamp(4px, 1vw, 8px)', backdropFilter: 'blur(16px)',
      boxShadow: '0 10px 30px rgba(0,0,0,0.6)',
      position: 'fixed', left: 'clamp(4px, 2vw, 16px)', top: '50%', transform: 'translateY(-50%)',
      zIndex: 9999 /* Bumped z-index to ensure it never gets trapped under canvas layers */
    }}>
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