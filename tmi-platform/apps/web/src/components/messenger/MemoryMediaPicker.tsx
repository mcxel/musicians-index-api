'use client';

import React from 'react';

export interface MemoryArtifact {
  id: string;
  label: string;
}

export function MemoryMediaPicker({
  open,
  artifacts,
  onClose,
  onSelect,
}: {
  open: boolean;
  artifacts: MemoryArtifact[];
  onClose: () => void;
  onSelect: (artifactId: string) => void;
}) {
  if (!open) return null;

  return (
    <div
      role="button"
      tabIndex={0}
      onClick={onClose}
      onKeyDown={(e) => {
        if (e.key === 'Escape') onClose();
      }}
      style={{
        position: 'fixed',
        inset: 0,
        background: 'rgba(0,0,0,0.72)',
        display: 'grid',
        placeItems: 'center',
        zIndex: 1000,
      }}
    >
      <div
        onClick={(e) => e.stopPropagation()}
        style={{
          width: 420,
          maxWidth: '92vw',
          background: '#0f1030',
          border: '1px solid #2b2b52',
          borderRadius: 12,
          padding: 14,
        }}
      >
        <div style={{ fontWeight: 800, marginBottom: 10 }}>Memory Picker</div>
        {artifacts.length === 0 ? (
          <div style={{ color: '#9aa0c2', fontSize: 12 }}>No memory artifacts found.</div>
        ) : (
          <div style={{ display: 'grid', gap: 8 }}>
            {artifacts.map((a) => (
              <button
                key={a.id}
                onClick={() => onSelect(a.id)}
                style={{
                  textAlign: 'left',
                  padding: '8px 10px',
                  borderRadius: 8,
                  border: '1px solid #343466',
                  background: '#17173a',
                  color: '#fff',
                  cursor: 'pointer',
                }}
              >
                {a.label}
              </button>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
