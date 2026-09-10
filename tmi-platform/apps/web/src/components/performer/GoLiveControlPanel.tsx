'use client';

// LEGACY (2026-07-18): unreachable from any real navigation — only mounted
// by HeadquartersV2Preview.tsx at /preview/performer-hq-v2, which has no
// inbound links anywhere in the app.
// Step 4 Slice 1: retired duplicate POST /api/live/go — calls triggerCanonicalGoLive.
import React, { useState } from 'react';
import { LiveCameraPreview } from '@/components/media/LiveCameraPreview';
import { triggerCanonicalGoLive } from '@/lib/dock/presentInstantGoLiveInPlace';

const C = {
  bg: 'rgba(10, 10, 25, 0.9)',
  border: '1px solid rgba(255, 215, 0, 0.2)',
  text: '#fff',
  accent: '#FFD700',
};

export function GoLiveControlPanel() {
  const [title, setTitle] = useState('');
  const [isStarting, setIsStarting] = useState(false);
  const [error, setError] = useState('');

  const handleGoLive = async () => {
    if (!title.trim()) {
      setError('Please enter a stream title.');
      return;
    }
    setIsStarting(true);
    setError('');
    try {
      const result = await triggerCanonicalGoLive({
        role: 'PERFORMER',
        preferredExperience: 'live',
        publishSession: true,
      });
      if (!result.ok) {
        setError(result.error ?? 'Failed to start session.');
        return;
      }
      // Off-hub: navigates to hub; in-place returns roomId.
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Unknown error');
    } finally {
      setIsStarting(false);
    }
  };

  return (
    <div className="flex flex-col gap-4 p-4 rounded-lg" style={{ background: C.bg, border: C.border }}>
      <div style={{ fontSize: 12, letterSpacing: '0.2em', fontWeight: 900, color: C.accent, textAlign: 'center' }}>
        BROADCAST CONTROL
      </div>
      <LiveCameraPreview />
      <div className="flex flex-col gap-2">
        <input
          type="text"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          placeholder="Stream Title (e.g., Live from the Studio)"
          className="w-full bg-black/30 border border-white/20 rounded-md px-3 py-2 text-sm"
        />
        <button
          onClick={() => void handleGoLive()}
          disabled={isStarting}
          className="w-full px-4 py-3 rounded-lg text-sm font-bold text-black"
          style={{
            background: C.accent,
            boxShadow: `0 0 20px ${C.accent}55`,
            transition: 'background 0.2s',
          }}
        >
          {isStarting ? 'Starting...' : 'GO LIVE NOW'}
        </button>
        {error ? (
          <span style={{ fontSize: 11, color: '#FF6666' }}>{error}</span>
        ) : null}
      </div>
    </div>
  );
}
