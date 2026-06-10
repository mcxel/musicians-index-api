'use client';

import React, { useState, useRef } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';

const GENRES = ['Trap', 'Hip-Hop', 'R&B', 'EDM', 'Dance', 'Afrobeat', 'Latin', 'Rock', 'Pop', 'House', 'Drill', 'Reggaeton', 'Other'];

export default function BeatSubmissionPage() {
  const router = useRouter();
  const fileRef = useRef<HTMLInputElement>(null);
  const [file, setFile] = useState<File | null>(null);
  const [uploading, setUploading] = useState(false);
  const [phase, setPhase] = useState<'idle' | 'uploading' | 'saving' | 'done' | 'error'>('idle');
  const [errMsg, setErrMsg] = useState('');

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (!file) { setErrMsg('Please select an audio file.'); return; }
    setErrMsg('');
    setUploading(true);
    setPhase('uploading');

    try {
      // Step 1: upload audio to media endpoint
      const fd = new FormData();
      fd.append('file', file);
      const uploadRes = await fetch('/api/upload/media', { method: 'POST', body: fd, credentials: 'include' });
      const uploadData = await uploadRes.json() as { url?: string; error?: string };
      if (!uploadRes.ok || !uploadData.url) {
        throw new Error(uploadData.error ?? 'Upload failed');
      }

      const audioUrl = uploadData.url;
      setPhase('saving');

      // Step 2: register beat in the DB
      const form = e.currentTarget;
      const submitRes = await fetch('/api/beats/submit', {
        method: 'POST',
        headers: { 'content-type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({
          title:       (form.elements.namedItem('title') as HTMLInputElement).value,
          genre:       (form.elements.namedItem('genre') as HTMLSelectElement).value,
          bpm:         (form.elements.namedItem('bpm') as HTMLInputElement).value,
          key:         (form.elements.namedItem('key') as HTMLInputElement).value,
          tags:        (form.elements.namedItem('tags') as HTMLInputElement).value,
          basicPrice:  Math.floor(Number((form.elements.namedItem('basicPrice') as HTMLInputElement).value ?? 29.99) * 100),
          premiumPrice:Math.floor(Number((form.elements.namedItem('premiumPrice') as HTMLInputElement).value ?? 79.99) * 100),
          previewUrl:  audioUrl,
          audioUrl,
        }),
      });
      const saveData = await submitRes.json() as { ok?: boolean; error?: string };
      if (!submitRes.ok || !saveData.ok) throw new Error(saveData.error ?? 'Save failed');

      setPhase('done');
      setTimeout(() => router.push('/beats/marketplace'), 1500);
    } catch (err) {
      setErrMsg(err instanceof Error ? err.message : 'Upload failed — try again.');
      setPhase('error');
      setUploading(false);
    }
  };

  const phaseLabel = phase === 'uploading' ? 'UPLOADING AUDIO…' : phase === 'saving' ? 'SAVING TO VAULT…' : phase === 'done' ? '✓ SUBMITTED!' : 'PUBLISH BEAT';

  return (
    <main style={{ minHeight: '100vh', background: '#050510', color: '#fff', padding: '40px 24px', fontFamily: "'Inter', sans-serif" }}>
      <div style={{ maxWidth: 800, margin: '0 auto' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', borderBottom: '1px solid rgba(170,45,255,0.2)', paddingBottom: 20, marginBottom: 40 }}>
          <div>
            <div style={{ fontSize: 10, letterSpacing: '0.3em', color: '#AA2DFF', fontWeight: 900, marginBottom: 8, textTransform: 'uppercase' }}>PRODUCER SUITE</div>
            <h1 style={{ fontSize: 32, margin: 0, fontFamily: 'var(--font-orbitron, Impact)', letterSpacing: '0.05em' }}>UPLOAD <span style={{ color: '#00FFFF' }}>INSTRUMENTAL</span></h1>
          </div>
          <Link href="/beats/marketplace" style={{ color: 'rgba(255,255,255,0.5)', fontSize: 11, textDecoration: 'none', border: '1px solid rgba(255,255,255,0.2)', padding: '6px 12px', borderRadius: 6 }}>← Marketplace</Link>
        </div>

        <form onSubmit={handleSubmit} style={{ background: 'rgba(255,255,255,0.02)', border: '1px solid rgba(255,255,255,0.05)', borderRadius: 12, padding: 30 }}>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 20, marginBottom: 20 }}>
            <div>
              <label style={{ display: 'block', fontSize: 10, fontWeight: 900, color: 'rgba(255,255,255,0.5)', marginBottom: 8, textTransform: 'uppercase', letterSpacing: '0.1em' }}>Beat Title</label>
              <input required name="title" type="text" placeholder="e.g. Neon Bounce" style={{ width: '100%', background: 'rgba(0,0,0,0.5)', border: '1px solid rgba(0,255,255,0.3)', color: '#fff', padding: '12px', borderRadius: 8, outline: 'none' }} />
            </div>
            <div>
              <label style={{ display: 'block', fontSize: 10, fontWeight: 900, color: 'rgba(255,255,255,0.5)', marginBottom: 8, textTransform: 'uppercase', letterSpacing: '0.1em' }}>Genre</label>
              <select required name="genre" style={{ width: '100%', background: 'rgba(0,0,0,0.5)', border: '1px solid rgba(0,255,255,0.3)', color: '#fff', padding: '12px', borderRadius: 8, outline: 'none' }}>
                {GENRES.map(g => <option key={g}>{g}</option>)}
              </select>
            </div>
            <div>
              <label style={{ display: 'block', fontSize: 10, fontWeight: 900, color: 'rgba(255,255,255,0.5)', marginBottom: 8, textTransform: 'uppercase', letterSpacing: '0.1em' }}>BPM</label>
              <input required name="bpm" type="number" min={60} max={220} placeholder="120" style={{ width: '100%', background: 'rgba(0,0,0,0.5)', border: '1px solid rgba(0,255,255,0.3)', color: '#fff', padding: '12px', borderRadius: 8, outline: 'none' }} />
            </div>
            <div>
              <label style={{ display: 'block', fontSize: 10, fontWeight: 900, color: 'rgba(255,255,255,0.5)', marginBottom: 8, textTransform: 'uppercase', letterSpacing: '0.1em' }}>Key</label>
              <input name="key" type="text" placeholder="C Minor" style={{ width: '100%', background: 'rgba(0,0,0,0.5)', border: '1px solid rgba(0,255,255,0.3)', color: '#fff', padding: '12px', borderRadius: 8, outline: 'none' }} />
            </div>
            <div>
              <label style={{ display: 'block', fontSize: 10, fontWeight: 900, color: 'rgba(255,255,255,0.5)', marginBottom: 8, textTransform: 'uppercase', letterSpacing: '0.1em' }}>Tags (comma-separated)</label>
              <input name="tags" type="text" placeholder="dark, melodic, 808" style={{ width: '100%', background: 'rgba(0,0,0,0.5)', border: '1px solid rgba(0,255,255,0.3)', color: '#fff', padding: '12px', borderRadius: 8, outline: 'none' }} />
            </div>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10 }}>
              <div>
                <label style={{ display: 'block', fontSize: 10, fontWeight: 900, color: 'rgba(255,255,255,0.5)', marginBottom: 8, textTransform: 'uppercase', letterSpacing: '0.1em' }}>Basic Price ($)</label>
                <input name="basicPrice" type="number" min={0.99} step={0.01} defaultValue={29.99} style={{ width: '100%', background: 'rgba(0,0,0,0.5)', border: '1px solid rgba(0,255,255,0.3)', color: '#fff', padding: '12px', borderRadius: 8, outline: 'none' }} />
              </div>
              <div>
                <label style={{ display: 'block', fontSize: 10, fontWeight: 900, color: 'rgba(255,255,255,0.5)', marginBottom: 8, textTransform: 'uppercase', letterSpacing: '0.1em' }}>Premium Price ($)</label>
                <input name="premiumPrice" type="number" min={0.99} step={0.01} defaultValue={79.99} style={{ width: '100%', background: 'rgba(0,0,0,0.5)', border: '1px solid rgba(0,255,255,0.3)', color: '#fff', padding: '12px', borderRadius: 8, outline: 'none' }} />
              </div>
            </div>
          </div>

          {/* File drop zone */}
          <div
            role="button"
            tabIndex={0}
            onClick={() => fileRef.current?.click()}
            onKeyDown={(e) => e.key === 'Enter' && fileRef.current?.click()}
            style={{ marginBottom: 30, padding: 40, border: `2px dashed ${file ? 'rgba(0,255,136,0.6)' : 'rgba(170,45,255,0.5)'}`, borderRadius: 12, textAlign: 'center', background: file ? 'rgba(0,255,136,0.05)' : 'rgba(170,45,255,0.05)', cursor: 'pointer' }}
          >
            <div style={{ fontSize: 32, marginBottom: 10 }}>{file ? '🎵' : '📁'}</div>
            <div style={{ fontSize: 12, fontWeight: 900, color: file ? '#00FF88' : '#AA2DFF', letterSpacing: '0.1em' }}>
              {file ? file.name : 'CLICK TO SELECT AUDIO FILE (.WAV or .MP3)'}
            </div>
            {file && <div style={{ fontSize: 10, color: 'rgba(255,255,255,0.4)', marginTop: 6 }}>{(file.size / 1024 / 1024).toFixed(1)} MB</div>}
            <input
              ref={fileRef}
              type="file"
              accept="audio/*"
              style={{ display: 'none' }}
              onChange={(e) => { setFile(e.target.files?.[0] ?? null); setErrMsg(''); }}
            />
          </div>

          {errMsg && <div style={{ marginBottom: 16, padding: '10px 14px', background: 'rgba(255,68,68,0.1)', border: '1px solid rgba(255,68,68,0.3)', borderRadius: 8, color: '#FF4444', fontSize: 12 }}>{errMsg}</div>}

          <button type="submit" disabled={uploading || phase === 'done'} style={{ width: '100%', background: phase === 'done' ? '#00FF88' : 'linear-gradient(90deg, #00FFFF, #AA2DFF)', color: '#050510', border: 'none', padding: '16px', borderRadius: 8, fontSize: 14, fontWeight: 900, letterSpacing: '0.1em', cursor: uploading ? 'not-allowed' : 'pointer', opacity: uploading ? 0.8 : 1 }}>
            {phaseLabel}
          </button>
        </form>
      </div>
    </main>
  );
}
