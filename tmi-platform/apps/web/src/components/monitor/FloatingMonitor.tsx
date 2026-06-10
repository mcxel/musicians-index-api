'use client';

import React from 'react';
import type { ActiveMonitor, MonitorMode } from './types';

function modeStyles(mode: MonitorMode): React.CSSProperties {
  switch (mode) {
    case 'full-stage':
      return { inset: 16, width: 'auto', height: 'auto' };
    case 'docked':
      return { right: 12, bottom: 12 };
    case 'mini':
      return { width: 220, height: 120 };
    case 'collapsed':
      return { width: 220, height: 52 };
    default:
      return {};
  }
}

export function FloatingMonitor({
  monitor,
  onClose,
  onPin,
  onDock,
  onCollapse,
  onSetMode,
}: {
  monitor: ActiveMonitor;
  onClose: () => void;
  onPin: (pinned: boolean) => void;
  onDock: (docked: boolean) => void;
  onCollapse: (collapsed: boolean) => void;
  onSetMode: (mode: MonitorMode) => void;
}) {
  const baseStyle: React.CSSProperties = {
    position: 'absolute',
    left: monitor.x,
    top: monitor.y,
    width: monitor.width,
    height: monitor.height,
    zIndex: monitor.pinned ? 999 : 40,
    background: '#11142d',
    border: '1px solid #36406a',
    borderRadius: 12,
    overflow: 'hidden',
    boxShadow: '0 10px 30px rgba(0,0,0,0.35)',
    color: '#fff',
    ...modeStyles(monitor.mode),
  };

  return (
    <div style={baseStyle}>
      <div
        style={{
          display: 'flex',
          gap: 6,
          alignItems: 'center',
          justifyContent: 'space-between',
          padding: '6px 8px',
          borderBottom: '1px solid #303a63',
          background: '#151a3a',
          fontSize: 12,
        }}
      >
        <strong>{monitor.payload.title ?? monitor.payload.sourceType.toUpperCase()} Monitor</strong>
        <div style={{ display: 'flex', gap: 4 }}>
          <button onClick={() => onSetMode('floating')}>Move</button>
          <button onClick={() => onSetMode('mini')}>Resize</button>
          <button onClick={() => onSetMode('floating')}>Rotate</button>
          <button onClick={() => onPin(!monitor.pinned)}>{monitor.pinned ? 'Unpin' : 'Pin'}</button>
          <button onClick={() => onDock(!monitor.docked)}>{monitor.docked ? 'Undock' : 'Dock'}</button>
          <button onClick={() => onCollapse(!monitor.collapsed)}>
            {monitor.collapsed ? 'Expand' : 'Collapse'}
          </button>
          <button onClick={() => onSetMode('full-stage')}>Full</button>
          <button onClick={onClose}>Close</button>
        </div>
      </div>
      {!monitor.collapsed ? (
        <div style={{ padding: 10, fontSize: 13 }}>
          <div>Source: {monitor.payload.sourceType}</div>
          <div>Opened by: {monitor.openedByDisplayName}</div>
          <div>Sync: {monitor.syncState.playing ? 'Playing' : 'Paused'}</div>
          <div>Playhead: {monitor.syncState.playheadSeconds.toFixed(1)}s</div>
          {monitor.payload.text ? <p style={{ marginTop: 8 }}>{monitor.payload.text}</p> : null}
        </div>
      ) : null}
    </div>
  );
}
