'use client';

import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';

interface Song {
  id: string;
  title: string;
  duration: number;
  uploadedAt: string;
  genre?: string;
  submitted?: boolean;
}

interface MusicStudioBrowserProps {
  performerId: string;
  onSelectSong: (songId: string) => void;
}

const C = {
  panel: 'rgba(8,14,38,.95)',
  card: 'rgba(12,20,50,.9)',
  border: '#1a1a3a',
  cyan: '#00E5FF',
  gold: '#FFD700',
  green: '#00FF88',
  accent: '#FF2DAA',
  muted: 'rgba(255,255,255,0.45)',
  text: '#FFFFFF',
};

export default function MusicStudioBrowser({ performerId, onSelectSong }: MusicStudioBrowserProps) {
  const [songs, setSongs] = useState<Song[]>([
    {
      id: 'song-001',
      title: 'Neon Dreams',
      duration: 243,
      uploadedAt: '2026-06-28T10:30:00Z',
      genre: 'Hip-Hop',
    },
    {
      id: 'song-002',
      title: 'Golden Hour',
      duration: 221,
      uploadedAt: '2026-06-27T14:15:00Z',
      genre: 'R&B',
      submitted: true,
    },
    {
      id: 'song-003',
      title: 'Midnight City',
      duration: 198,
      uploadedAt: '2026-06-25T09:45:00Z',
      genre: 'Pop',
    },
  ]);
  const [loading, setLoading] = useState(false);

  const formatDuration = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  const formatDate = (dateStr: string) => {
    return new Date(dateStr).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
    });
  };

  return (
    <div>
      {/* Upload Section */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        style={{
          background: C.card,
          border: `1px solid ${C.border}`,
          borderRadius: 8,
          padding: 16,
          marginBottom: 20,
          textAlign: 'center',
        }}
      >
        <div style={{ fontSize: 28, marginBottom: 8 }}>📤</div>
        <h3 style={{ margin: 0, fontSize: 14, fontWeight: 700, color: C.cyan }}>
          Upload New Song
        </h3>
        <p style={{ margin: '4px 0 0 0', fontSize: 11, color: C.muted }}>
          MP3, WAV, or FLAC (max 50MB)
        </p>
        <motion.button
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          style={{
            marginTop: 12,
            padding: '8px 16px',
            background: `${C.cyan}22`,
            border: `1px solid ${C.cyan}`,
            borderRadius: 6,
            color: C.cyan,
            fontSize: 12,
            fontWeight: 600,
            cursor: 'pointer',
            transition: 'all 0.2s ease',
          }}
        >
          Choose File
        </motion.button>
      </motion.div>

      {/* Songs List */}
      <div>
        <h3 style={{ margin: '0 0 12px 0', fontSize: 12, fontWeight: 700, color: C.muted, letterSpacing: '0.1em' }}>
          YOUR SONGS ({songs.length})
        </h3>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
          {songs.map((song, idx) => (
            <motion.div
              key={song.id}
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: idx * 0.05 }}
              onClick={() => onSelectSong(song.id)}
              style={{
                background: C.card,
                border: `1px solid ${C.border}`,
                borderRadius: 8,
                padding: 12,
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                gap: 12,
                justifyContent: 'space-between',
                transition: 'all 0.2s ease',
              }}
              whileHover={{ background: 'rgba(12,20,50,1)', borderColor: C.cyan + '44' }}
            >
              <div style={{ flex: 1, minWidth: 0 }}>
                <div style={{ fontSize: 12, fontWeight: 600, color: C.text, marginBottom: 2 }}>
                  🎵 {song.title}
                </div>
                <div style={{ fontSize: 10, color: C.muted, display: 'flex', gap: 12 }}>
                  <span>{formatDuration(song.duration)}</span>
                  <span>{song.genre}</span>
                  <span>Uploaded {formatDate(song.uploadedAt)}</span>
                </div>
              </div>
              <div style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
                {song.submitted && (
                  <span
                    style={{
                      fontSize: 10,
                      background: C.green + '22',
                      border: `1px solid ${C.green}`,
                      color: C.green,
                      padding: '2px 6px',
                      borderRadius: 4,
                      fontWeight: 600,
                    }}
                  >
                    ✓ Submitted
                  </span>
                )}
                <span style={{ fontSize: 18 }}>→</span>
              </div>
            </motion.div>
          ))}
        </div>
      </div>

      {songs.length === 0 && (
        <div
          style={{
            textAlign: 'center',
            padding: 40,
            color: C.muted,
          }}
        >
          <div style={{ fontSize: 32, marginBottom: 12 }}>🎵</div>
          <div style={{ fontSize: 12 }}>No songs yet. Upload your first track to get started!</div>
        </div>
      )}
    </div>
  );
}
