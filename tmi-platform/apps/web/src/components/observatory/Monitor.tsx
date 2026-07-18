'use client';

import React, { ReactNode } from 'react';
import { getComponentStyle, ObservatoryRole } from '@/theme/ObservatoryDesignTokens';

export interface MonitorProps {
  role: ObservatoryRole;
  children?: ReactNode;
  src?: string;
  title?: string;
  alt?: string;
}

export function Monitor({ role, children, src, title, alt }: MonitorProps) {
  const style = getComponentStyle('monitor', role);

  return (
    <div style={{ position: 'relative', width: '100%', aspectRatio: '16 / 9', borderRadius: style.borderRadius, border: `${style.borderWidth} solid var(--border-color, rgba(255,215,0,0.3))`, backgroundColor: style.backgroundColor, overflow: 'hidden' }} title={title}>
      {src ? (
        <img src={src} alt={alt || 'Monitor content'} style={{ width: '100%', height: '100%', objectFit: style.objectFit as any, display: 'block' }} />
      ) : (
        <div style={{ width: '100%', height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
          {children}
        </div>
      )}
    </div>
  );
}

export default Monitor;
