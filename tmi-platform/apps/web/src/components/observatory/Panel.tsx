'use client';

import React, { ReactNode, useState } from 'react';
import { getObservatoryTokens, ObservatoryRole } from '@/theme/ObservatoryDesignTokens';

export interface PanelProps {
  role: ObservatoryRole;
  title: string;
  icon?: ReactNode;
  children: ReactNode;
  collapsible?: boolean;
  defaultCollapsed?: boolean;
}

export function Panel({
  role,
  title,
  icon,
  children,
  collapsible = true,
  defaultCollapsed = false,
}: PanelProps) {
  const tokens = getObservatoryTokens(role);
  const [collapsed, setCollapsed] = useState(defaultCollapsed);

  return (
    <div style={{ borderRadius: tokens.shared.radius.lg, border: `1px solid ${tokens.variant.borderColor}`, backgroundColor: tokens.variant.panelBackground, overflow: 'hidden' }}>
      <button
        onClick={() => collapsible && setCollapsed(!collapsed)}
        style={{ width: '100%', padding: tokens.shared.spacing.md, display: 'flex', alignItems: 'center', justifyContent: 'space-between', background: 'none', border: 'none', borderBottom: collapsed ? 'none' : `1px solid ${tokens.variant.borderColor}`, color: tokens.variant.accentColor, cursor: collapsible ? 'pointer' : 'default', fontSize: tokens.shared.typography.body.fontSize, fontWeight: 600, transition: tokens.shared.motion.fast }}
        onMouseEnter={(e) => { if (collapsible) (e.currentTarget as HTMLButtonElement).style.backgroundColor = `rgba(${tokens.variant.accentColorRgb}, 0.1)`; }}
        onMouseLeave={(e) => { (e.currentTarget as HTMLButtonElement).style.backgroundColor = 'transparent'; }}
      >
        <span style={{ display: 'flex', alignItems: 'center', gap: tokens.shared.spacing.sm }}>
          {icon && <span>{icon}</span>}
          {title}
        </span>
        {collapsible && <span style={{ fontSize: '14px' }}>{collapsed ? '▼' : '▲'}</span>}
      </button>
      {!collapsed && (
        <div style={{ padding: tokens.shared.spacing.md, maxHeight: '400px', overflowY: 'auto' }}>
          {children}
        </div>
      )}
    </div>
  );
}

export default Panel;
