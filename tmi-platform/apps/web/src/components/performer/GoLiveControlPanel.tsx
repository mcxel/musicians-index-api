'use client';

// LEGACY (2026-07-18): unreachable from any real navigation — only mounted
// by HeadquartersV2Preview.tsx at /preview/performer-hq-v2, which has no
// inbound links anywhere in the app. GoLiveStudio.tsx at /live/go is the
// canonical Go Live entry point. Left in place, not deleted, per Rule 21.
import React, { useState } from 'react';
import { LiveCameraPreview } from '@/components/media/LiveCameraPreview';

const C = {
  bg: 'rgba(10, 10, 25, 0.9)',
  border: '1px solid rgba(255, 215, 0, 0.2)',
  text: '#fff',
  accent: '#FFD700',
};

export function GoLiveControlPanel() {
  const [title, setTitle] = useState('');
  const [isStarting, setIsStarting] = useState(false);

  const handleGoLive = async () => {
    if (!title.trim()) {
      alert('Please enter a stream title.');
      return;
    }
    setIsStarting(true);
    try {
      const response = await fetch('/api/live/go', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ title }),
      });
      const data = await response.json();
      if (data.ok) {
        alert(`Successfully started live session! Room ID: ${data.roomId}`);
        // Next step: Route user to the live room or update HQ state
      } else {
        throw new Error(data.error || 'Failed to start session.');
      }
    } catch (error) {
      alert(`Error: ${error instanceof Error ? error.message : 'Unknown error'}`);
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
          onClick={handleGoLive}
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
      </div>
    </div>
  );
}