'use client';

import { useState } from 'react';

const BEATS = [
  { id: 1,  title: 'Midnight Trap',    producer: 'BeatMaestro',  bpm: 140, key: 'Am',  genre: 'Trap',   price: 30 },
  { id: 2,  title: 'Soul Circuit',     producer: 'DJ Phantom',   bpm: 95,  key: 'Fm',  genre: 'R&B',    price: 20 },
  { id: 3,  title: 'Neon Bounce',      producer: 'Lena Voss',    bpm: 128, key: 'Cm',  genre: 'EDM',    price: 45 },
  { id: 4,  title: 'Crown Cypher',     producer: 'CypherKing',   bpm: 90,  key: 'Gm',  genre: 'Hip-Hop', price: 25 },
  { id: 5,  title: 'Dark Matter',      producer: 'Rhyme Prophet', bpm: 75, key: 'Dm',  genre: 'Lo-Fi',  price: 15 },
  { id: 6,  title: 'Nova Pop',         producer: 'Soulstrike',   bpm: 120, key: 'C',   genre: 'Pop',    price: 35 },
  { id: 7,  title: 'Underground Rail', producer: 'BeatMaestro',  bpm: 85,  key: 'Em',  genre: 'Hip-Hop', price: 22 },
  { id: 8,  title: 'Chrome Waves',     producer: 'DJ Phantom',   bpm: 136, key: 'Abm', genre: 'EDM',    price: 50 },
  { id: 9,  title: 'Velvet Drip',      producer: 'Lena Voss',    bpm: 70,  key: 'Bb',  genre: 'R&B',    price: 18 },
  { id: 10, title: 'Battle Code',      producer: 'CypherKing',   bpm: 100, key: 'Bm',  genre: 'Trap',   price: 28 },
  { id: 11, title: 'Storm Cell',       producer: 'Rhyme Prophet', bpm: 160, key: 'F#m', genre: 'Drill', price: 40 },
  { id: 12, title: 'Stellar Drift',    producer: 'Soulstrike',   bpm: 110, key: 'Eb',  genre: 'Lo-Fi',  price: 12 },
];

const GENRES = ['All', 'Hip-Hop', 'R&B', 'EDM', 'Trap', 'Lo-Fi', 'Pop', 'Drill'];

export default function BeatVaultPage() {
  const [genre, setGenre] = useState('All');
  const [previewing, setPreviewing] = useState<number | null>(null);

  const filtered = genre === 'All' ? BEATS : BEATS.filter(b => b.genre === genre);

  return (
    <div style={{ background: '#07071a', minHeight: '100vh', color: '#fff', padding: '40px 24px' }}>
      <div style={{ maxWidth: 1200, margin: '0 auto' }}>

        {/* Header */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 40, flexWrap: 'wrap', gap: 16 }}>
          <div>
            <h1 style={{ fontSize: 36, fontWeight: 900, letterSpacing: 3, color: '#00FF88', margin: 0 }}>BEAT VAULT</h1>
            <p style={{ color: '#666', margin: '8px 0 0' }}>Buy, sell, and discover exclusive beats from TMI producers.</p>
          </div>
          <a
            href="/beat-vault/sell"
            style={{ background: '#00FF88', color: '#07071a', borderRadius: 8, padding: '10px 22px', fontWeight: 700, fontSize: 14, textDecoration: 'none', letterSpacing: 1, display: 'inline-block' }}
          >
            Sell Your Beat
          </a>
        </div>

        {/* Upload Drop Zone */}
        <div style={{
          background: '#0a1a0f', border: '2px dashed #00FF8833', borderRadius: 12,
          padding: '32px 24px', marginBottom: 36, textAlign: 'center',
        }}>
          <div style={{ fontSize: 36, marginBottom: 8 }}>🎵</div>
          <div style={{ fontWeight: 700, fontSize: 16, marginBottom: 4 }}>Upload a Beat</div>
          <div style={{ color: '#555', fontSize: 13, marginBottom: 16 }}>
            Drag &amp; drop an audio file here, or click to browse. MP3, WAV, FLAC supported.
          </div>
          <button style={{ background: '#00FF88', color: '#07071a', border: 'none', borderRadius: 6, padding: '9px 28px', fontWeight: 700, cursor: 'pointer', fontSize: 14 }}>
            Choose File
          </button>
        </div>

        {/* Genre Filter */}
        <div style={{ display: 'flex', gap: 8, marginBottom: 28, flexWrap: 'wrap' }}>
          {GENRES.map(g => (
            <button
              key={g}
              onClick={() => setGenre(g)}
              style={{
                background: genre === g ? '#00FF88' : '#0d0d2a',
                color: genre === g ? '#07071a' : '#888',
                border: '1px solid #00FF8822',
                borderRadius: 20,
                padding: '6px 18px',
                cursor: 'pointer',
                fontSize: 13,
                fontWeight: genre === g ? 700 : 400,
              }}
            >
              {g}
            </button>
          ))}
        </div>

        {/* Beat Grid */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(260px, 1fr))', gap: 16 }}>
          {filtered.map(beat => (
            <div
              key={beat.id}
              style={{ background: '#0d0d2a', border: '1px solid #0a2a1a', borderRadius: 12, padding: 20 }}
            >
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 12 }}>
                <div>
                  <div style={{ fontWeight: 700, fontSize: 15, marginBottom: 2 }}>{beat.title}</div>
                  <div style={{ fontSize: 12, color: '#666' }}>{beat.producer}</div>
                </div>
                <div style={{ textAlign: 'right' }}>
                  <div style={{ color: '#00FF88', fontWeight: 700, fontSize: 15 }}>${beat.price}</div>
                  <div style={{ fontSize: 11, color: '#444' }}>{beat.genre}</div>
                </div>
              </div>
              <div style={{ display: 'flex', gap: 8, fontSize: 12, marginBottom: 16 }}>
                <span style={{ background: '#0a1a0f', color: '#00FF8899', padding: '3px 10px', borderRadius: 4 }}>
                  {beat.bpm} BPM
                </span>
                <span style={{ background: '#0a1a0f', color: '#00FF8899', padding: '3px 10px', borderRadius: 4 }}>
                  {beat.key}
                </span>
              </div>
              <div style={{ display: 'flex', gap: 8 }}>
                <button
                  onClick={() => setPreviewing(previewing === beat.id ? null : beat.id)}
                  style={{
                    flex: 1, background: '#0a1a0f', color: '#00FF88',
                    border: '1px solid #00FF8822', borderRadius: 6,
                    padding: '8px 0', cursor: 'pointer', fontWeight: 600, fontSize: 13,
                  }}
                >
                  {previewing === beat.id ? '⏹ Stop' : '▶ Preview'}
                </button>
                <button style={{
                  flex: 1, background: '#00FF88', color: '#07071a',
                  border: 'none', borderRadius: 6,
                  padding: '8px 0', cursor: 'pointer', fontWeight: 700, fontSize: 13,
                }}>
                  Buy
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
