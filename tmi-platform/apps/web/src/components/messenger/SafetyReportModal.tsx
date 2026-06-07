'use client';

import React from 'react';
import { useConversationStore } from './ConversationStore';

export function SafetyReportModal() {
  const { safetyReport, setSafetyReport } = useConversationStore();

  if (!safetyReport.open) return null;

  return (
    <div
      onClick={() => setSafetyReport({ open: false })}
      style={{
        position: 'fixed',
        inset: 0,
        background: 'rgba(0,0,0,0.72)',
        display: 'grid',
        placeItems: 'center',
        zIndex: 1001,
      }}
    >
      <div
        onClick={(e) => e.stopPropagation()}
        style={{
          width: 420,
          maxWidth: '92vw',
          background: '#141432',
          border: '1px solid #343466',
          borderRadius: 12,
          padding: 14,
          color: '#fff',
        }}
      >
        <div style={{ fontWeight: 800, marginBottom: 8 }}>Safety Report</div>
        <div style={{ fontSize: 13, color: '#b8bdd9', marginBottom: 10 }}>
          Report message ID: {safetyReport.messageId ?? 'N/A'}
        </div>
        <div style={{ fontSize: 12, color: '#9aa0c2', marginBottom: 12 }}>
          This is a P0 placeholder modal for report/block entry.
        </div>
        <button
          onClick={() => setSafetyReport({ open: false })}
          style={{
            background: '#ff8fa3',
            color: '#2b0a14',
            border: 'none',
            borderRadius: 8,
            padding: '7px 12px',
            fontWeight: 700,
            cursor: 'pointer',
          }}
        >
          Close
        </button>
      </div>
    </div>
  );
}
