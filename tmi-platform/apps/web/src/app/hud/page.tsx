'use client';

import React from 'react';
import HudShell from '../../components/hud/HudShell';

export default function HudPage() {
  return (
    <main style={{ padding: 16 }}>
      <h1 style={{ fontSize: 20, fontWeight: 700, marginBottom: 12 }}>HUD</h1>
      <HudShell />
    </main>
  );
}
