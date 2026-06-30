'use client';

import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

interface SubmissionFlowProps {
  performerId: string;
  performerName: string;
  selectedSongId: string | null;
  onSongSelected: (songId: string) => void;
}

type Step = 1 | 2 | 3 | 4;

interface SubmissionData {
  songId: string;
  title: string;
  genre: string;
  mood: string;
  bpm: string;
  key: string;
  destinations: string[];
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

const GENRES = [
  'Hip-Hop',
  'R&B',
  'Pop',
  'Rock',
  'Country',
  'Electronic',
  'Gospel',
  'Jazz',
  'Latin',
];

const MOODS = ['Energetic', 'Chill', 'Melancholic', 'Happy', 'Aggressive', 'Peaceful'];

const KEYS = ['C', 'C#', 'D', 'D#', 'E', 'F', 'F#', 'G', 'G#', 'A', 'A#', 'B'];

const DESTINATIONS = [
  { id: 'stream-radio', label: 'Stream Radio', icon: '📻', description: 'All genres, all listeners' },
  { id: 'one-prayer', label: 'One Prayer Radio', icon: '🙏', description: 'Gospel & Christian content' },
  { id: 'magazine', label: 'Magazine Feature', icon: '📰', description: 'Artist spotlight article' },
];

export default function SubmissionFlow({
  performerId,
  performerName,
  selectedSongId,
  onSongSelected,
}: SubmissionFlowProps) {
  const [step, setStep] = useState<Step>(1);
  const [data, setData] = useState<SubmissionData>({
    songId: selectedSongId || '',
    title: 'Neon Dreams',
    genre: '',
    mood: '',
    bpm: '',
    key: '',
    destinations: [],
  });
  const [submitted, setSubmitted] = useState(false);

  const handleDestinationToggle = (destId: string) => {
    setData((prev) => ({
      ...prev,
      destinations: prev.destinations.includes(destId)
        ? prev.destinations.filter((d) => d !== destId)
        : [...prev.destinations, destId],
    }));
  };

  const handleSubmit = async () => {
    console.log('Submitting:', data);
    setSubmitted(true);
    setTimeout(() => {
      setStep(1);
      setData((prev) => ({ ...prev, songId: '', destinations: [] }));
      setSubmitted(false);
    }, 3000);
  };

  const stepContent = {
    1: (
      <div>
        <h3 style={{ margin: '0 0 12px 0', fontSize: 12, fontWeight: 700, color: C.muted }}>
          STEP 1: SELECT SONG
        </h3>
        <div
          style={{
            background: C.card,
            border: `1px solid ${C.border}`,
            borderRadius: 8,
            padding: 12,
          }}
        >
          <label style={{ fontSize: 11, color: C.muted, display: 'block', marginBottom: 8 }}>
            Which song do you want to submit?
          </label>
          <select
            value={data.songId}
            onChange={(e) => {
              setData((prev) => ({ ...prev, songId: e.target.value }));
              onSongSelected(e.target.value);
            }}
            style={{
              width: '100%',
              padding: '8px 12px',
              background: C.card,
              border: `1px solid ${C.border}`,
              borderRadius: 6,
              color: C.text,
              fontSize: 12,
              cursor: 'pointer',
            }}
          >
            <option value="">Select a song...</option>
            <option value="song-001">🎵 Neon Dreams (2:43)</option>
            <option value="song-002">🎵 Golden Hour (3:41)</option>
            <option value="song-003">🎵 Midnight City (3:18)</option>
          </select>
        </div>
      </div>
    ),
    2: (
      <div>
        <h3 style={{ margin: '0 0 12px 0', fontSize: 12, fontWeight: 700, color: C.muted }}>
          STEP 2: ADD METADATA
        </h3>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
          <div>
            <label style={{ fontSize: 11, color: C.muted, display: 'block', marginBottom: 4 }}>
              Genre
            </label>
            <select
              value={data.genre}
              onChange={(e) => setData((prev) => ({ ...prev, genre: e.target.value }))}
              style={{
                width: '100%',
                padding: '8px',
                background: C.card,
                border: `1px solid ${C.border}`,
                borderRadius: 6,
                color: C.text,
                fontSize: 11,
              }}
            >
              <option value="">Select genre...</option>
              {GENRES.map((g) => (
                <option key={g} value={g}>
                  {g}
                </option>
              ))}
            </select>
          </div>
          <div>
            <label style={{ fontSize: 11, color: C.muted, display: 'block', marginBottom: 4 }}>
              Mood
            </label>
            <select
              value={data.mood}
              onChange={(e) => setData((prev) => ({ ...prev, mood: e.target.value }))}
              style={{
                width: '100%',
                padding: '8px',
                background: C.card,
                border: `1px solid ${C.border}`,
                borderRadius: 6,
                color: C.text,
                fontSize: 11,
              }}
            >
              <option value="">Select mood...</option>
              {MOODS.map((m) => (
                <option key={m} value={m}>
                  {m}
                </option>
              ))}
            </select>
          </div>
          <div>
            <label style={{ fontSize: 11, color: C.muted, display: 'block', marginBottom: 4 }}>
              BPM
            </label>
            <input
              type="number"
              placeholder="e.g. 92"
              value={data.bpm}
              onChange={(e) => setData((prev) => ({ ...prev, bpm: e.target.value }))}
              style={{
                width: '100%',
                padding: '8px',
                background: C.card,
                border: `1px solid ${C.border}`,
                borderRadius: 6,
                color: C.text,
                fontSize: 11,
              }}
            />
          </div>
          <div>
            <label style={{ fontSize: 11, color: C.muted, display: 'block', marginBottom: 4 }}>
              Key
            </label>
            <select
              value={data.key}
              onChange={(e) => setData((prev) => ({ ...prev, key: e.target.value }))}
              style={{
                width: '100%',
                padding: '8px',
                background: C.card,
                border: `1px solid ${C.border}`,
                borderRadius: 6,
                color: C.text,
                fontSize: 11,
              }}
            >
              <option value="">Select key...</option>
              {KEYS.map((k) => (
                <option key={k} value={k}>
                  {k}
                </option>
              ))}
            </select>
          </div>
        </div>
      </div>
    ),
    3: (
      <div>
        <h3 style={{ margin: '0 0 12px 0', fontSize: 12, fontWeight: 700, color: C.muted }}>
          STEP 3: CHOOSE DESTINATION
        </h3>
        <div style={{ display: 'grid', gap: 8 }}>
          {DESTINATIONS.map((dest) => (
            <motion.div
              key={dest.id}
              onClick={() => handleDestinationToggle(dest.id)}
              style={{
                background: C.card,
                border: `1px solid ${
                  data.destinations.includes(dest.id) ? C.cyan : C.border
                }`,
                borderRadius: 8,
                padding: 12,
                cursor: 'pointer',
                display: 'flex',
                gap: 12,
                alignItems: 'flex-start',
              }}
              whileHover={{ borderColor: C.cyan + '88' }}
            >
              <div
                style={{
                  width: 20,
                  height: 20,
                  border: `2px solid ${
                    data.destinations.includes(dest.id) ? C.cyan : C.border
                  }`,
                  borderRadius: 4,
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  background: data.destinations.includes(dest.id)
                    ? C.cyan + '22'
                    : 'transparent',
                  flexShrink: 0,
                }}
              >
                {data.destinations.includes(dest.id) && (
                  <span style={{ color: C.cyan, fontSize: 12, fontWeight: 700 }}>
                    ✓
                  </span>
                )}
              </div>
              <div style={{ flex: 1 }}>
                <div style={{ fontSize: 12, fontWeight: 600, color: C.text }}>
                  {dest.icon} {dest.label}
                </div>
                <div style={{ fontSize: 10, color: C.muted, marginTop: 2 }}>
                  {dest.description}
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    ),
    4: (
      <div style={{ textAlign: 'center', padding: '20px 0' }}>
        <div style={{ fontSize: 32, marginBottom: 12 }}>✅</div>
        <h3 style={{ margin: '0 0 8px 0', fontSize: 14, fontWeight: 700, color: C.green }}>
          Submission Received!
        </h3>
        <p style={{ margin: 0, fontSize: 11, color: C.muted }}>
          We'll review your submission within 24-48 hours.
        </p>
        <p style={{ margin: '12px 0 0 0', fontSize: 10, color: C.muted }}>
          Check your email for updates. While you wait, consider going live to build
          momentum!
        </p>
      </div>
    ),
  };

  const isStepValid = {
    1: !!data.songId,
    2: !!data.genre && !!data.mood,
    3: data.destinations.length > 0,
    4: true,
  };

  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
      {/* Progress */}
      <div style={{ marginBottom: 20 }}>
        <div style={{ display: 'flex', gap: 8, marginBottom: 8 }}>
          {([1, 2, 3, 4] as const).map((s) => (
            <div
              key={s}
              style={{
                flex: 1,
                height: 4,
                background: s <= step ? C.cyan : C.border,
                borderRadius: 2,
                transition: 'all 0.3s ease',
              }}
            />
          ))}
        </div>
        <div style={{ fontSize: 10, color: C.muted }}>
          Step {step} of 4
        </div>
      </div>

      {/* Content */}
      <AnimatePresence mode="wait">
        <motion.div
          key={step}
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          exit={{ opacity: 0, x: -20 }}
          transition={{ duration: 0.3 }}
          style={{
            background: C.card,
            border: `1px solid ${C.border}`,
            borderRadius: 8,
            padding: 16,
            marginBottom: 16,
          }}
        >
          {stepContent[step]}
        </motion.div>
      </AnimatePresence>

      {/* Actions */}
      <div style={{ display: 'flex', gap: 8, justifyContent: 'space-between' }}>
        <motion.button
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          onClick={() => setStep((prev) => Math.max(1, prev - 1) as Step)}
          disabled={step === 1}
          style={{
            padding: '8px 12px',
            background: step === 1 ? C.border : C.card,
            border: `1px solid ${C.border}`,
            borderRadius: 6,
            color: step === 1 ? C.muted : C.text,
            fontSize: 11,
            fontWeight: 600,
            cursor: step === 1 ? 'default' : 'pointer',
            opacity: step === 1 ? 0.5 : 1,
          }}
        >
          ← Back
        </motion.button>

        <motion.button
          whileHover={{ scale: isStepValid[step] ? 1.05 : 1 }}
          whileTap={{ scale: isStepValid[step] ? 0.95 : 1 }}
          onClick={() => {
            if (step === 4) {
              handleSubmit();
            } else if (isStepValid[step]) {
              setStep((prev) => Math.min(4, prev + 1) as Step);
            }
          }}
          disabled={!isStepValid[step]}
          style={{
            padding: '8px 16px',
            background: isStepValid[step] ? `${C.cyan}22` : C.card,
            border: isStepValid[step]
              ? `1px solid ${C.cyan}`
              : `1px solid ${C.border}`,
            borderRadius: 6,
            color: isStepValid[step] ? C.cyan : C.muted,
            fontSize: 11,
            fontWeight: 600,
            cursor: isStepValid[step] ? 'pointer' : 'default',
            opacity: isStepValid[step] ? 1 : 0.5,
          }}
        >
          {step === 4 ? 'Done' : 'Next →'}
        </motion.button>
      </div>
    </motion.div>
  );
}
