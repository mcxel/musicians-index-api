'use client';

/**
 * LaunchReadinessPanel.tsx
 *
 * Single operational view of platform readiness for soft launch.
 * Shows the four launch gates: Build, Revenue, Discovery, Audience.
 *
 * Locked by Marcel Dickels, 2026-06-29
 */

import { useEffect, useState } from 'react';

interface GateStatus {
  name: string;
  status: 'PASS' | 'FAIL' | 'PENDING';
  lastCertified?: string;
  evidence?: string;
}

export default function LaunchReadinessPanel() {
  const [gates, setGates] = useState<GateStatus[]>([
    { name: 'Build', status: 'PASS', lastCertified: '2026-06-29 TypeScript exit 0' },
    { name: 'Revenue Loop', status: 'PENDING', evidence: 'Awaiting authenticated payment' },
    { name: 'Creator Discovery', status: 'PENDING', evidence: 'Awaiting performer Go Live' },
    { name: 'Audience Presence', status: 'PENDING', evidence: 'Awaiting fan avatar seating' },
  ]);

  const passCount = gates.filter(g => g.status === 'PASS').length;
  const readyToLaunch = gates.every(g => g.status === 'PASS');

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'PASS': return '#00FF88';
      case 'FAIL': return '#FF2020';
      case 'PENDING': return '#FFB800';
      default: return '#999';
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'PASS': return '✅';
      case 'FAIL': return '❌';
      case 'PENDING': return '⏳';
      default: return '❓';
    }
  };

  return (
    <div style={{
      border: '2px solid rgba(255,255,255,0.1)',
      borderRadius: 12,
      padding: 24,
      background: 'rgba(5,5,16,0.5)',
      marginBottom: 24,
    }}>
      {/* Header */}
      <div style={{ marginBottom: 20 }}>
        <h2 style={{ fontSize: 18, fontWeight: 700, margin: '0 0 8px 0' }}>
          🚀 Launch Readiness
        </h2>
        <p style={{ margin: 0, color: 'rgba(255,255,255,0.6)', fontSize: 13 }}>
          {passCount}/4 gates certified
          {readyToLaunch && (
            <span style={{ marginLeft: 12, color: '#00FF88', fontWeight: 700 }}>
              • READY FOR SOFT LAUNCH
            </span>
          )}
        </p>
      </div>

      {/* Progress Bar */}
      <div style={{
        height: 6,
        background: 'rgba(255,255,255,0.1)',
        borderRadius: 3,
        marginBottom: 20,
        overflow: 'hidden',
      }}>
        <div style={{
          height: '100%',
          width: `${(passCount / gates.length) * 100}%`,
          background: 'linear-gradient(90deg, #00FF88, #00E5FF)',
          transition: 'width 0.3s ease',
        }} />
      </div>

      {/* Gates */}
      <div style={{ display: 'grid', gap: 12 }}>
        {gates.map((gate, idx) => (
          <div
            key={idx}
            style={{
              display: 'flex',
              alignItems: 'flex-start',
              gap: 12,
              padding: 12,
              background: 'rgba(255,255,255,0.02)',
              border: `1px solid ${getStatusColor(gate.status)}22`,
              borderRadius: 8,
            }}
          >
            {/* Status Icon */}
            <div style={{
              fontSize: 18,
              flexShrink: 0,
              color: getStatusColor(gate.status),
            }}>
              {getStatusIcon(gate.status)}
            </div>

            {/* Details */}
            <div style={{ flex: 1 }}>
              <div style={{ fontWeight: 600, fontSize: 13, color: '#fff' }}>
                {gate.name}
              </div>
              {gate.lastCertified && (
                <div style={{
                  fontSize: 11,
                  color: 'rgba(255,255,255,0.5)',
                  marginTop: 2,
                }}>
                  {gate.lastCertified}
                </div>
              )}
              {gate.evidence && (
                <div style={{
                  fontSize: 11,
                  color: getStatusColor(gate.status),
                  marginTop: 2,
                  fontStyle: 'italic',
                }}>
                  {gate.evidence}
                </div>
              )}
            </div>

            {/* Status Badge */}
            <div style={{
              padding: '4px 8px',
              background: getStatusColor(gate.status) + '22',
              border: `1px solid ${getStatusColor(gate.status)}44`,
              borderRadius: 4,
              fontSize: 10,
              fontWeight: 700,
              color: getStatusColor(gate.status),
              flexShrink: 0,
            }}>
              {gate.status}
            </div>
          </div>
        ))}
      </div>

      {/* Footer */}
      <div style={{
        marginTop: 20,
        paddingTop: 12,
        borderTop: '1px solid rgba(255,255,255,0.1)',
        fontSize: 11,
        color: 'rgba(255,255,255,0.4)',
      }}>
        Last updated: {new Date().toLocaleString()}
        {readyToLaunch && (
          <div style={{ marginTop: 8, color: '#00FF88', fontWeight: 600 }}>
            Platform is operationally validated. Soft launch authorized.
          </div>
        )}
      </div>
    </div>
  );
}
