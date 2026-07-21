'use client';

import React, { useState, Suspense } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import { submitEventEntry, type SubmissionCategory } from '@/lib/events/EventSubmissionEngine';

function ProducerSubmissionContent() {
  const searchParams = useSearchParams();
  const router = useRouter();

  const initialType = searchParams?.get('type') ?? 'battle';
  const initialTitle = searchParams?.get('title') ?? '';
  const initialTrackId = searchParams?.get('trackId') ?? '';

  const [title, setTitle] = useState(initialTitle || 'My Original Producer Master Track');
  const [bpm, setBpm] = useState('95');
  const [genre, setGenre] = useState('Hip-Hop / Trap');
  const [audioUrl, setAudioUrl] = useState('/yopho/Yoho Canvas base 2.mp4');
  const [videoUrl, setVideoUrl] = useState('');
  const [category, setCategory] = useState<SubmissionCategory>(
    initialType === 'dance' ? 'WORLD_DANCE_PARTY' : 'PRODUCER_BEAT_BATTLE'
  );
  const [rightsAttested, setRightsAttested] = useState(true);
  const [sampleCleared, setSampleCleared] = useState(true);
  const [submittedStatus, setSubmittedStatus] = useState<string | null>(null);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!title) return;

    submitEventEntry({
      userId: 'user_active_creator',
      userName: 'Active Producer',
      category,
      title,
      bpm: parseInt(bpm, 10) || 95,
      genre,
      audioUrl,
      videoUrl: videoUrl || undefined,
      rightsAttested,
      sampleClearanceDeclared: sampleCleared,
    });

    setSubmittedStatus('Submission Accepted & Queued into Live Rotation (+200 XP)');
    setTimeout(() => {
      if (category === 'WORLD_DANCE_PARTY') {
        router.push('/live/rooms/world-dance-party');
      } else {
        router.push('/live/rooms/beat-battle-arena');
      }
    }, 2000);
  };

  return (
    <div style={{ minHeight: '100vh', background: '#050310', color: '#fff', padding: '40px 20px' }}>
      <div style={{ maxWidth: 720, margin: '0 auto', background: '#09061a', border: '1px solid rgba(0,229,255,0.3)', borderRadius: 20, padding: 32, boxShadow: '0 0 40px rgba(0,229,255,0.2)' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 24 }}>
          <div>
            <div style={{ fontSize: 10, fontWeight: 900, color: '#00E5FF', letterSpacing: '0.15em' }}>
              TMI PRODUCER & EVENT SUBMISSION PORTAL
            </div>
            <h1 style={{ fontSize: 24, fontWeight: 900, margin: '4px 0 0' }}>
              Submit Track to Live Competitions
            </h1>
          </div>
          <Link href="/hub/performer" style={{ color: '#00E5FF', fontSize: 11, textDecoration: 'none', fontWeight: 900 }}>
            ← Back to Hub
          </Link>
        </div>

        {submittedStatus ? (
          <div style={{ padding: 24, background: 'rgba(0,255,136,0.15)', border: '1px solid #00FF88', borderRadius: 12, textAlign: 'center', color: '#00FF88', fontWeight: 900, fontSize: 14 }}>
            ✨ {submittedStatus}
          </div>
        ) : (
          <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
            {/* Category */}
            <div>
              <label style={{ fontSize: 11, fontWeight: 900, color: '#fff', display: 'block', marginBottom: 6 }}>
                SUBMISSION DESTINATION
              </label>
              <select
                value={category}
                onChange={(e) => setCategory(e.target.value as SubmissionCategory)}
                style={{ width: '100%', background: '#04020a', color: '#fff', padding: 12, borderRadius: 8, border: '1px solid rgba(255,255,255,0.2)' }}
              >
                <option value="PRODUCER_BEAT_BATTLE">⚔️ Producer Beat Battle Arena</option>
                <option value="WORLD_DANCE_PARTY">💃 World Dance Party (Song & Choreography Video)</option>
                <option value="CYPHER_ROTATION">🎙️ Cypher Arena Background Track</option>
                <option value="MONDAY_NIGHT_STAGE">⭐ Marcel's Monday Night Stage Showcase</option>
              </select>
            </div>

            {/* Title */}
            <div>
              <label style={{ fontSize: 11, fontWeight: 900, color: '#fff', display: 'block', marginBottom: 6 }}>TRACK TITLE</label>
              <input
                type="text"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                style={{ width: '100%', background: '#04020a', color: '#fff', padding: 12, borderRadius: 8, border: '1px solid rgba(255,255,255,0.2)' }}
              />
            </div>

            {/* BPM & Genre */}
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
              <div>
                <label style={{ fontSize: 11, fontWeight: 900, color: '#fff', display: 'block', marginBottom: 6 }}>BPM</label>
                <input
                  type="text"
                  value={bpm}
                  onChange={(e) => setBpm(e.target.value)}
                  style={{ width: '100%', background: '#04020a', color: '#fff', padding: 12, borderRadius: 8, border: '1px solid rgba(255,255,255,0.2)' }}
                />
              </div>
              <div>
                <label style={{ fontSize: 11, fontWeight: 900, color: '#fff', display: 'block', marginBottom: 6 }}>GENRE</label>
                <input
                  type="text"
                  value={genre}
                  onChange={(e) => setGenre(e.target.value)}
                  style={{ width: '100%', background: '#04020a', color: '#fff', padding: 12, borderRadius: 8, border: '1px solid rgba(255,255,255,0.2)' }}
                />
              </div>
            </div>

            {/* Video URL (Optional for Dance Party) */}
            {category === 'WORLD_DANCE_PARTY' && (
              <div>
                <label style={{ fontSize: 11, fontWeight: 900, color: '#fff', display: 'block', marginBottom: 6 }}>CHOREOGRAPHY VIDEO URL (OPTIONAL)</label>
                <input
                  type="text"
                  placeholder="https://..."
                  value={videoUrl}
                  onChange={(e) => setVideoUrl(e.target.value)}
                  style={{ width: '100%', background: '#04020a', color: '#fff', padding: 12, borderRadius: 8, border: '1px solid rgba(255,255,255,0.2)' }}
                />
              </div>
            )}

            {/* Rights Attestation Checkboxes */}
            <div style={{ background: 'rgba(255,255,255,0.03)', padding: 16, borderRadius: 10, display: 'flex', flexDirection: 'column', gap: 10 }}>
              <label style={{ display: 'flex', alignItems: 'center', gap: 10, fontSize: 11, cursor: 'pointer' }}>
                <input type="checkbox" checked={rightsAttested} onChange={(e) => setRightsAttested(e.target.checked)} />
                <span>I attest that I own or control all rights to this beat / track.</span>
              </label>
              <label style={{ display: 'flex', alignItems: 'center', gap: 10, fontSize: 11, cursor: 'pointer' }}>
                <input type="checkbox" checked={sampleCleared} onChange={(e) => setSampleCleared(e.target.checked)} />
                <span>All samples are cleared for commercial competition & live broadcast.</span>
              </label>
            </div>

            <button
              type="submit"
              style={{
                padding: 16,
                borderRadius: 10,
                background: 'linear-gradient(135deg, #00E5FF, #FF2DAA)',
                border: 'none',
                color: '#000',
                fontSize: 13,
                fontWeight: 900,
                cursor: 'pointer',
                boxShadow: '0 0 20px rgba(0,229,255,0.5)',
              }}
            >
              🚀 SUBMIT TO LIVE COMPETITION ROTATION
            </button>
          </form>
        )}
      </div>
    </div>
  );
}

export default function ProducerSubmissionPage() {
  return (
    <Suspense fallback={<div style={{ padding: 40, color: '#fff', textAlign: 'center' }}>Loading Portal...</div>}>
      <ProducerSubmissionContent />
    </Suspense>
  );
}
