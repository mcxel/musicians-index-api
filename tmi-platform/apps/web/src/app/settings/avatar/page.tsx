'use client';
import { useState, useRef, useCallback } from 'react';
import Link from 'next/link';

type UploadState = 'idle' | 'uploading' | 'saving' | 'done' | 'error';

const GENRE_OPTIONS = [
  'Hip-Hop', 'R&B', 'Trap', 'Pop', 'Electronic', 'Freestyle',
  'Soul', 'Afrobeat', 'Alternative', 'Gospel', 'Rock', 'Jazz',
];

export default function AvatarSettingsPage() {
  const fileRef = useRef<HTMLInputElement>(null);
  const [preview, setPreview]     = useState<string | null>(null);
  const [uploadState, setUploadState] = useState<UploadState>('idle');
  const [savedUrl, setSavedUrl]   = useState<string | null>(null);
  const [error, setError]         = useState('');
  const [displayName, setDisplayName] = useState('');
  const [selectedGenres, setSelectedGenres] = useState<string[]>([]);
  const [bio, setBio]             = useState('');

  const handleFile = useCallback((file: File) => {
    if (!file.type.startsWith('image/')) {
      setError('Please select an image file (JPG, PNG, or WEBP).');
      return;
    }
    if (file.size > 10 * 1024 * 1024) {
      setError('Image must be under 10 MB.');
      return;
    }
    setError('');
    const reader = new FileReader();
    reader.onload = (e) => setPreview(e.target?.result as string);
    reader.readAsDataURL(file);
  }, []);

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    const file = e.dataTransfer.files[0];
    if (file) handleFile(file);
  }, [handleFile]);

  const handleUpload = async () => {
    const file = fileRef.current?.files?.[0];
    if (!file && !preview) { setError('Please select a photo first.'); return; }

    setUploadState('uploading');
    setError('');

    try {
      // Step 1 — upload image to blob/storage
      let avatarUrl: string;
      if (file) {
        const fd = new FormData();
        fd.append('file', file);
        fd.append('context', 'avatar');
        const uploadRes = await fetch('/api/upload', { method: 'POST', body: fd });
        if (!uploadRes.ok) throw new Error('Image upload failed — please try again.');
        const uploadData = await uploadRes.json() as { url?: string; error?: string };
        if (!uploadData.url) throw new Error(uploadData.error ?? 'Upload returned no URL.');
        avatarUrl = uploadData.url;
      } else {
        avatarUrl = preview!; // base64 fallback in dev
      }

      // Step 2 — save avatarUrl + profile data
      setUploadState('saving');
      const profilePayload: Record<string, unknown> = { avatarUrl };
      if (displayName.trim()) profilePayload.displayName = displayName.trim();
      if (bio.trim()) profilePayload.bio = bio.trim();
      if (selectedGenres.length) profilePayload.genres = selectedGenres;

      const profileRes = await fetch('/api/profile/update', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(profilePayload),
      });
      if (!profileRes.ok) {
        const pd = await profileRes.json().catch(() => ({})) as { error?: string };
        throw new Error(pd.error ?? 'Profile save failed.');
      }

      setSavedUrl(avatarUrl);
      setUploadState('done');
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Something went wrong. Please try again.');
      setUploadState('error');
    }
  };

  const toggleGenre = (g: string) =>
    setSelectedGenres(prev => prev.includes(g) ? prev.filter(x => x !== g) : [...prev, g].slice(0, 3));

  const isWorking = uploadState === 'uploading' || uploadState === 'saving';

  return (
    <main style={{ minHeight: '100vh', background: '#050510', color: '#fff', fontFamily: "'Inter', sans-serif", paddingBottom: 80 }}>
      <style>{`@keyframes pulse{0%,100%{opacity:1}50%{opacity:0.4}} @keyframes spin{to{transform:rotate(360deg)}}`}</style>

      {/* Nav */}
      <nav style={{ background: 'rgba(0,0,0,0.85)', borderBottom: '1px solid rgba(170,45,255,0.2)', padding: '12px 24px', display: 'flex', gap: 20, alignItems: 'center', position: 'sticky', top: 0, zIndex: 50, backdropFilter: 'blur(12px)' }}>
        <Link href="/home/1"       style={{ fontSize: 11, fontWeight: 900, color: '#AA2DFF', textDecoration: 'none', letterSpacing: '0.12em' }}>TMI</Link>
        <span style={{ color: 'rgba(255,255,255,0.15)' }}>›</span>
        <Link href="/settings"     style={{ fontSize: 11, color: 'rgba(255,255,255,0.4)', textDecoration: 'none' }}>Settings</Link>
        <span style={{ color: 'rgba(255,255,255,0.15)' }}>›</span>
        <span style={{ fontSize: 11, color: '#AA2DFF', fontWeight: 700 }}>Profile Photo</span>
        <div style={{ marginLeft: 'auto', display: 'flex', gap: 14 }}>
          <Link href="/leaderboard" style={{ fontSize: 10, color: 'rgba(255,255,255,0.4)', textDecoration: 'none' }}>Leaderboard</Link>
          <Link href="/home/1"      style={{ fontSize: 10, color: 'rgba(255,255,255,0.4)', textDecoration: 'none' }}>Orbit</Link>
        </div>
      </nav>

      <div style={{ maxWidth: 600, margin: '0 auto', padding: '40px 24px' }}>
        <div style={{ textAlign: 'center', marginBottom: 36 }}>
          <div style={{ fontSize: 9, letterSpacing: '0.3em', color: '#AA2DFF', fontWeight: 900, marginBottom: 8 }}>🎭 PROFILE SETUP</div>
          <h1 style={{ fontSize: 'clamp(22px,4vw,34px)', fontWeight: 900, margin: '0 0 10px', background: 'linear-gradient(135deg, #fff, #AA2DFF)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>
            Upload Your Photo
          </h1>
          <p style={{ fontSize: 13, color: 'rgba(255,255,255,0.4)', margin: 0 }}>
            Your face goes on the homepage orbit wheel. Upload now and start appearing to every visitor.
          </p>
        </div>

        {uploadState === 'done' && savedUrl ? (
          /* ── Success state ── */
          <div style={{ textAlign: 'center', padding: '32px 24px', background: 'rgba(0,255,136,0.05)', border: '1px solid rgba(0,255,136,0.25)', borderRadius: 20 }}>
            <div style={{ width: 120, height: 120, borderRadius: '50%', overflow: 'hidden', margin: '0 auto 20px', border: '3px solid #00FF88', boxShadow: '0 0 30px rgba(0,255,136,0.3)' }}>
              <img src={savedUrl} alt="Your photo" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
            </div>
            <div style={{ fontSize: 18, fontWeight: 900, color: '#00FF88', marginBottom: 8 }}>You&apos;re Live on the Orbit!</div>
            <div style={{ fontSize: 12, color: 'rgba(255,255,255,0.5)', marginBottom: 24, lineHeight: 1.6 }}>
              Your photo is now saved. It will appear on the homepage orbit wheel within the next refresh cycle (up to 60 seconds).
            </div>
            <div style={{ display: 'flex', gap: 10, justifyContent: 'center', flexWrap: 'wrap' }}>
              <Link href="/home/1" style={{ padding: '11px 24px', borderRadius: 10, background: '#AA2DFF', color: '#fff', fontWeight: 900, fontSize: 12, textDecoration: 'none' }}>SEE ORBIT →</Link>
              <Link href="/leaderboard" style={{ padding: '11px 24px', borderRadius: 10, background: 'rgba(255,255,255,0.06)', border: '1px solid rgba(255,255,255,0.12)', color: '#fff', fontWeight: 800, fontSize: 12, textDecoration: 'none' }}>LEADERBOARD</Link>
            </div>
          </div>
        ) : (
          <>
            {/* ── Drop zone ── */}
            <div
              onDrop={handleDrop}
              onDragOver={(e) => e.preventDefault()}
              onClick={() => fileRef.current?.click()}
              style={{ borderRadius: 20, border: `2px dashed ${preview ? '#AA2DFF' : 'rgba(170,45,255,0.35)'}`, background: preview ? 'rgba(170,45,255,0.05)' : 'rgba(255,255,255,0.02)', minHeight: 220, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', cursor: 'pointer', marginBottom: 20, transition: 'all .2s ease', position: 'relative', overflow: 'hidden' }}
            >
              {preview ? (
                <img src={preview} alt="Preview" style={{ width: '100%', height: 240, objectFit: 'cover', borderRadius: 18 }} />
              ) : (
                <div style={{ textAlign: 'center', padding: 32 }}>
                  <div style={{ fontSize: 52, marginBottom: 12, opacity: 0.5 }}>📷</div>
                  <div style={{ fontSize: 13, fontWeight: 700, color: '#AA2DFF', marginBottom: 6 }}>Click or drag photo here</div>
                  <div style={{ fontSize: 10, color: 'rgba(255,255,255,0.3)' }}>JPG · PNG · WEBP · Max 10 MB</div>
                </div>
              )}
            </div>
            <input ref={fileRef} type="file" accept="image/jpeg,image/png,image/webp" style={{ display: 'none' }}
              onChange={(e) => { const f = e.target.files?.[0]; if (f) handleFile(f); }} />

            {preview && (
              <button onClick={() => { setPreview(null); if (fileRef.current) fileRef.current.value = ''; }}
                style={{ display: 'block', width: '100%', marginBottom: 16, padding: '8px', borderRadius: 9, background: 'transparent', border: '1px solid rgba(255,255,255,0.1)', color: 'rgba(255,255,255,0.4)', fontSize: 10, fontWeight: 700, cursor: 'pointer' }}>
                REMOVE — choose different photo
              </button>
            )}

            {/* ── Optional profile fields ── */}
            <div style={{ padding: '20px 24px', background: 'rgba(170,45,255,0.04)', border: '1px solid rgba(170,45,255,0.15)', borderRadius: 16, marginBottom: 20 }}>
              <div style={{ fontSize: 9, fontWeight: 800, letterSpacing: '0.2em', color: 'rgba(255,255,255,0.35)', marginBottom: 16 }}>OPTIONAL — COMPLETE YOUR PROFILE</div>
              <div style={{ marginBottom: 12 }}>
                <label style={{ display: 'block', fontSize: 8, color: 'rgba(255,255,255,0.35)', letterSpacing: '0.15em', fontWeight: 700, marginBottom: 5 }}>DISPLAY NAME / ARTIST NAME</label>
                <input value={displayName} onChange={e => setDisplayName(e.target.value)} placeholder="Your name or stage name"
                  style={{ width: '100%', padding: '10px 14px', borderRadius: 9, background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(170,45,255,0.25)', color: '#fff', fontSize: 13, outline: 'none', boxSizing: 'border-box' }} />
              </div>
              <div style={{ marginBottom: 12 }}>
                <label style={{ display: 'block', fontSize: 8, color: 'rgba(255,255,255,0.35)', letterSpacing: '0.15em', fontWeight: 700, marginBottom: 5 }}>BIO (OPTIONAL)</label>
                <textarea value={bio} onChange={e => setBio(e.target.value)} placeholder="Tell the orbit who you are..."
                  rows={2} style={{ width: '100%', padding: '10px 14px', borderRadius: 9, background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(170,45,255,0.25)', color: '#fff', fontSize: 13, outline: 'none', resize: 'none', boxSizing: 'border-box' }} />
              </div>
              <div>
                <label style={{ display: 'block', fontSize: 8, color: 'rgba(255,255,255,0.35)', letterSpacing: '0.15em', fontWeight: 700, marginBottom: 8 }}>YOUR GENRE (PICK UP TO 3) — SHOWN ON ORBIT</label>
                <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap' }}>
                  {GENRE_OPTIONS.map(g => (
                    <button key={g} onClick={() => toggleGenre(g)}
                      style={{ padding: '5px 12px', borderRadius: 20, border: `1px solid ${selectedGenres.includes(g) ? '#FF2DAA' : 'rgba(255,255,255,0.15)'}`, background: selectedGenres.includes(g) ? 'rgba(255,45,170,0.15)' : 'transparent', color: selectedGenres.includes(g) ? '#FF2DAA' : 'rgba(255,255,255,0.45)', fontSize: 10, fontWeight: 700, cursor: 'pointer', letterSpacing: '0.06em' }}>
                      {g}
                    </button>
                  ))}
                </div>
              </div>
            </div>

            {error && (
              <div style={{ padding: '10px 14px', borderRadius: 9, background: 'rgba(255,60,60,0.08)', border: '1px solid rgba(255,60,60,0.25)', color: '#FF6B6B', fontSize: 11, marginBottom: 14 }}>
                {error}
              </div>
            )}

            <button
              onClick={handleUpload}
              disabled={isWorking || (!preview && !fileRef.current?.files?.length)}
              style={{ width: '100%', padding: '14px', borderRadius: 12, background: isWorking ? 'rgba(170,45,255,0.4)' : '#AA2DFF', color: '#fff', fontWeight: 900, fontSize: 13, letterSpacing: '0.1em', border: 'none', cursor: isWorking ? 'not-allowed' : 'pointer', transition: 'all .2s' }}
            >
              {uploadState === 'uploading' ? '⏳ UPLOADING...' : uploadState === 'saving' ? '💾 SAVING TO PROFILE...' : '🚀 GO LIVE ON THE ORBIT'}
            </button>

            <div style={{ marginTop: 24, display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10 }}>
              <Link href="/home/1" style={{ display: 'block', padding: '11px', borderRadius: 10, background: 'rgba(0,255,255,0.05)', border: '1px solid rgba(0,255,255,0.2)', color: '#00FFFF', fontSize: 11, fontWeight: 800, textDecoration: 'none', textAlign: 'center' }}>View Orbit</Link>
              <Link href="/leaderboard" style={{ display: 'block', padding: '11px', borderRadius: 10, background: 'rgba(255,45,170,0.05)', border: '1px solid rgba(255,45,170,0.2)', color: '#FF2DAA', fontSize: 11, fontWeight: 800, textDecoration: 'none', textAlign: 'center' }}>Leaderboard</Link>
            </div>
          </>
        )}
      </div>
    </main>
  );
}
