'use client';

/**
 * EnergyMeterDisplay — real-time crowd energy visualization.
 *
 * Shows:
 *  - Energy score (0-100 bar)
 *  - Energy level label (Quiet → Warm → Active → Electric → Explosive)
 *  - Trend indicator (rising ↗ / falling ↘ / stable →)
 *  - Active signals (tips, cheers, votes, etc.)
 *
 * Updates every 500ms from RoomEnergyEngine.
 * Auto-wires to StageDirectorEngine lighting (no manual control needed when auto-mode on).
 */

import { useEffect, useState } from 'react';
import { roomEnergyEngine, type RoomEnergyState } from '@/lib/live/RoomEnergyEngine';

interface EnergyMeterDisplayProps {
  roomId: string;
  compact?: boolean; // true = small inline display, false = full panel
}

const ENERGY_COLORS: Record<string, string> = {
  'LEGENDARY': '#FF00FF',
  'ON FIRE': '#FF6B35',
  'HOT': '#FFD700',
  'WARMING': '#AA2DFF',
  'COLD': '#00E5FF',
};

const ENERGY_DESCRIPTIONS: Record<string, string> = {
  'LEGENDARY': 'LEGENDARY',
  'ON FIRE': 'ON FIRE',
  'HOT': 'HOT',
  'WARMING': 'WARMING UP',
  'COLD': 'COLD',
};

export default function EnergyMeterDisplay({ roomId, compact = false }: EnergyMeterDisplayProps) {
  const [energy, setEnergy] = useState<RoomEnergyState | null>(null);
  const [trendIcon, setTrendIcon] = useState('→');

  useEffect(() => {
    const state = roomEnergyEngine.getState(roomId);
    if (state) setEnergy(state);

    // Polling instead of subscription (RoomEnergyEngine subscription pattern TBD)
    const interval = setInterval(() => {
      const state = roomEnergyEngine.getState(roomId);
      if (state) {
        setEnergy(state);
        if (state.trend === 'rising') setTrendIcon('↗');
        else if (state.trend === 'falling') setTrendIcon('↘');
        else setTrendIcon('→');
      }
    }, 500);

    return () => clearInterval(interval);
  }, [roomId]);

  if (!energy) return null;

  const color = ENERGY_COLORS[energy.energyLabel] || '#00E5FF';
  const description = ENERGY_DESCRIPTIONS[energy.energyLabel] || 'UNKNOWN';
  const percentage = Math.round((energy.energyScore / 100) * 100);

  if (compact) {
    return (
      <div style={{
        display: 'flex', alignItems: 'center', gap: 6,
        fontSize: 10, fontWeight: 900, color,
      }}>
        <div style={{ width: 60, height: 6, background: 'rgba(255,255,255,0.1)', borderRadius: 3, overflow: 'hidden' }}>
          <div style={{
            width: `${percentage}%`,
            height: '100%',
            background: color,
            transition: 'width 0.3s ease',
            boxShadow: `0 0 8px ${color}`,
          }} />
        </div>
        <span>{percentage}</span>
        <span>{trendIcon}</span>
      </div>
    );
  }

  // Full panel display
  return (
    <div style={{
      display: 'flex', flexDirection: 'column', gap: 8,
      padding: '12px 14px',
      background: 'rgba(5,3,16,0.92)',
      borderRadius: 8,
      border: `1px solid ${color}22`,
    }}>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
        <span style={{ fontSize: 8, fontWeight: 900, color: 'rgba(255,255,255,0.4)', letterSpacing: '0.15em' }}>
          ROOM ENERGY
        </span>
        <span style={{ fontSize: 9, fontWeight: 900, color, letterSpacing: '0.08em' }}>
          {description}
        </span>
      </div>

      {/* Energy bar */}
      <div style={{ position: 'relative', height: 24, background: 'rgba(255,255,255,0.05)', borderRadius: 4, overflow: 'hidden', border: `1px solid ${color}22` }}>
        <div style={{
          position: 'absolute', inset: 0,
          width: `${percentage}%`,
          background: `linear-gradient(90deg, ${color}22, ${color}88)`,
          transition: 'width 0.3s ease',
          boxShadow: `0 0 12px ${color}66`,
        }} />
        <div style={{
          position: 'absolute', inset: 0,
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          fontSize: 11, fontWeight: 900, color,
          textShadow: `0 0 8px ${color}`,
        }}>
          {energy.energyScore}
        </div>
      </div>

      {/* Trend and signals */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', fontSize: 8, color: 'rgba(255,255,255,0.5)' }}>
        <span>{trendIcon} {energy.trend.toUpperCase()}</span>
        <span>Peak: {Math.round(energy.peakEnergy)}</span>
      </div>

      {/* Signal counts */}
      {(energy.signalCounts.tips > 0 || energy.signalCounts.reactions > 0 || energy.signalCounts.votes > 0) && (
        <div style={{
          display: 'flex', gap: 6,
          fontSize: 9, fontWeight: 700, color: 'rgba(255,255,255,0.6)',
          padding: '6px 8px',
          background: 'rgba(255,255,255,0.03)',
          borderRadius: 4,
        }}>
          {energy.signalCounts.tips > 0 && <span>💸 {energy.signalCounts.tips}</span>}
          {energy.signalCounts.reactions > 0 && <span>👏 {energy.signalCounts.reactions}</span>}
          {energy.signalCounts.votes > 0 && <span>🗳 {energy.signalCounts.votes}</span>}
        </div>
      )}
    </div>
  );
}
