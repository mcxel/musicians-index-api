'use client';
import React from 'react';
import MonitorSlot from './MonitorSlot';

interface TripleMonitorWallProps {
  leftImages: string[];
  centerImages: string[];
  rightImages: string[];
  leftLabel?: string;
  centerLabel?: string;
  rightLabel?: string;
}

export default function TripleMonitorWall({
  leftImages,
  centerImages,
  rightImages,
  leftLabel = 'Left',
  centerLabel = 'Center',
  rightLabel = 'Right',
}: TripleMonitorWallProps) {
  return (
    <div
      style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(3, 1fr)',
        gap: 12,
        width: '100%',
      }}
    >
      <MonitorSlot images={leftImages} label={leftLabel} />
      <MonitorSlot images={centerImages} label={centerLabel} />
      <MonitorSlot images={rightImages} label={rightLabel} />
    </div>
  );
}
