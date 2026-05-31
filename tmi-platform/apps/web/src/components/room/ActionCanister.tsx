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
      borderRadius: 14, padding: 8, backdropFilter: 'blur(16px)',
      boxShadow: '0 10px 30px rgba(0,0,0,0.6)',
      position: 'fixed', left: 16, top: '50%', transform: 'translateY(-50%)',
      zIndex: 90
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
              padding: '12px 14px', borderRadius: 10, cursor: 'pointer',
              fontSize: 10, fontWeight: 800, textTransform: 'uppercase',
              display: 'flex', alignItems: 'center', gap: 12, transition: 'all 0.2s',
              letterSpacing: '0.08em'
            }}
          >
            <span style={{ fontSize: 20 }}>{a.icon}</span>
            <span className="hidden md:inline-block">{a.label}</span>
          </button>
        )
      })}
    </div>
  );
}