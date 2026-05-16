'use client';

import {
  listMemoryMoments,
  saveMemoryMoment,
  shareMemoryMoment,
} from '@/lib/memories/MemoryMomentEngine';
import Link from 'next/link';
import { useMemo, useState } from 'react';

export default function MemoriesPage() {
  const userId = 'loop-user';
  const [tick, setTick] = useState(0);
  const [title, setTitle] = useState('');

  useMemo(() => {
    if (listMemoryMoments(userId).length === 0) {
      saveMemoryMoment(userId, 'First Lobby Moment', 'event', 'tmi-main-lobby');
      saveMemoryMoment(userId, 'Artist Profile Clip', 'profile', 'wavetek');
    }
  }, [userId]);

  const moments = listMemoryMoments(userId);

  const addMemory = () => {
    const value = title.trim();
    if (!value) return;
    saveMemoryMoment(userId, value, 'event', 'live-room-1');
    setTitle('');
    setTick((v) => v + 1);
  };

  return (
    <main
      style={{ minHeight: '100vh', background: '#050510', color: '#fff', padding: '40px 24px' }}
    >
      <div style={{ maxWidth: 920, margin: '0 auto' }}>
        <Link href="/live/lobby" style={{ color: '#AA2DFF', textDecoration: 'none', fontSize: 12 }}>
          ← Return to Lobby
        </Link>
        <h1 style={{ fontSize: 32, margin: '20px 0 8px' }}>My Memories</h1>
        <p style={{ color: 'rgba(255,255,255,0.65)' }}>
          Save moments, view them, share them, and route back to event/profile surfaces.
        </p>

        <div
          style={{
            marginTop: 14,
            border: '1px solid rgba(255,255,255,0.14)',
            borderRadius: 10,
            padding: 12,
            display: 'flex',
            gap: 8,
          }}
        >
          <input
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            placeholder="Save a new memory"
            style={{
              flex: 1,
              background: '#0e1023',
              border: '1px solid rgba(255,255,255,0.18)',
              borderRadius: 8,
              color: '#fff',
              padding: '9px 10px',
            }}
          />
          <button
            onClick={addMemory}
            style={{
              border: 'none',
              background: '#AA2DFF',
              color: '#fff',
              borderRadius: 8,
              padding: '9px 14px',
              fontWeight: 800,
              cursor: 'pointer',
            }}
          >
            Save Moment
          </button>
        </div>

        <div
          style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))',
            gap: 12,
            marginTop: 20,
          }}
        >
          {moments.map((entry) => (
            <div
              key={entry.id}
              style={{
                border: '1px solid rgba(170,45,255,0.25)',
                borderRadius: 10,
                overflow: 'hidden',
                background: 'rgba(170,45,255,0.04)',
              }}
            >
              <div
                style={{
                  aspectRatio: '1/1',
                  background: 'linear-gradient(135deg, rgba(170,45,255,0.2), rgba(0,255,255,0.1))',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                }}
              >
                <span style={{ fontSize: 38 }}>{entry.shared ? '📣' : '🎬'}</span>
              </div>
              <div style={{ padding: '10px 12px' }}>
                <div style={{ fontSize: 12, fontWeight: 700, marginBottom: 4 }}>{entry.title}</div>
                <div style={{ fontSize: 10, color: 'rgba(255,255,255,0.55)', marginBottom: 8 }}>
                  {entry.sourceType}: {entry.sourceId}
                </div>
                <div style={{ display: 'flex', gap: 10, flexWrap: 'wrap' }}>
                  <button
                    onClick={() => {
                      shareMemoryMoment(userId, entry.id);
                      setTick((v) => v + 1);
                    }}
                    style={{
                      fontSize: 10,
                      color: '#00FFFF',
                      border: '1px solid rgba(0,255,255,0.35)',
                      background: 'transparent',
                      borderRadius: 6,
                      padding: '5px 8px',
                      cursor: 'pointer',
                    }}
                  >
                    {entry.shared ? 'Shared' : 'Share'}
                  </button>
                  <Link
                    href={
                      entry.sourceType === 'profile'
                        ? `/artists/${entry.sourceId}`
                        : `/live/rooms/${entry.sourceId}`
                    }
                    style={{ fontSize: 10, color: '#FFD700', textDecoration: 'none' }}
                  >
                    Open Source
                  </Link>
                </div>
              </div>
            </div>
          ))}
        </div>

        <div style={{ marginTop: 16, display: 'flex', gap: 12, flexWrap: 'wrap' }}>
          <Link href="/hub/fan" style={{ color: '#00FFFF', textDecoration: 'none', fontSize: 12 }}>
            Return to Profile
          </Link>
          <Link href="/messages" style={{ color: '#FF2DAA', textDecoration: 'none', fontSize: 12 }}>
            Share via DM
          </Link>
          <Link
            href="/groups/memory-club"
            style={{ color: '#00FF88', textDecoration: 'none', fontSize: 12 }}
          >
            Share in Group
          </Link>
        </div>
      </div>
    </main>
  );
}
