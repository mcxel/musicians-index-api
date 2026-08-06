'use client';

import { useState, useRef } from 'react';
import { TMI_ONBOARDING_CHECKLIST } from '@/lib/onboarding/tmiOnboardingChecklist';
import AutoPerformerWelcomeMessage from '@/components/onboarding/AutoPerformerWelcomeMessage';

type Step = 'PHOTO' | 'RANK' | 'LAUNCH' | 'DONE';
type UploadState = 'idle' | 'uploading' | 'saving' | 'done' | 'error';

export default function OnboardingPerformerPage() {
  const fileRef = useRef<HTMLInputElement>(null);

  const [step, setStep] = useState<Step>('PHOTO');
  const [done, setDone] = useState(false);
  const [displayName, setDisplayName] = useState('');
  const [bio, setBio] = useState('');
  const [preview, setPreview] = useState<string | null>(null);
  const [uploadState, setUploadState] = useState<UploadState>('idle');
  const [uploadError, setUploadError] = useState('');
  const [rankNumber, setRankNumber] = useState<number | null>(null);

  const markComplete = async () => {
    try {
      await fetch('/api/profile/update', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({ onboardingState: 'COMPLETE', onboardingStep: 'completed' }),
      });
    } catch { /* non-fatal */ }
  };

  const handleSkip = async () => {
    await markComplete();
    setDone(true);
    setTimeout(() => { window.location.href = '/hub/performer'; }, 1500);
  };

  const handleFile = (file: File) => {
    if (!file.type.startsWith('image/')) { setUploadError('Please select a JPG, PNG, or WEBP image.'); return; }
    if (file.size > 10 * 1024 * 1024) { setUploadError('Image must be under 10 MB.'); return; }
    setUploadError('');
    const reader = new FileReader();
    reader.onload = (e) => setPreview(e.target?.result as string);
    reader.readAsDataURL(file);
  };

  const handleSavePhoto = async () => {
    setUploadState('uploading');
    setUploadError('');
    try {
      const file = fileRef.current?.files?.[0];
      let avatarUrl = '';

      if (file) {
        const fd = new FormData();
        fd.append('file', file);
        fd.append('context', 'profile');
        const uploadRes = await fetch('/api/upload', { method: 'POST', body: fd });
        if (uploadRes.ok) {
          const data = await uploadRes.json() as { url?: string };
          avatarUrl = data.url ?? '';
        }
      } else if (preview) {
        avatarUrl = preview;
      }

      setUploadState('saving');
      const payload: Record<string, unknown> = { onboardingStep: 'rank' };
      if (avatarUrl) payload.avatarUrl = avatarUrl;
      if (displayName.trim()) payload.displayName = displayName.trim();
      if (bio.trim()) payload.bio = bio.trim();

      await fetch('/api/profile/update', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify(payload),
      });

      // Fetch current rank position from rankings API
      try {
        const sessRes = await fetch('/api/auth/session', { credentials: 'include', cache: 'no-store' });
        if (sessRes.ok) {
          const sess = await sessRes.json() as { user?: { id?: string } };
          const userId = sess.user?.id;
          if (userId) {
            const rankRes = await fetch('/api/rankings?limit=100', { cache: 'no-store' });
            if (rankRes.ok) {
              const rankData = await rankRes.json() as { rows?: Array<{ userId: string; rank: number }> };
              const myRow = rankData.rows?.find(r => r.userId === userId);
              if (myRow) {
                setRankNumber(myRow.rank);
              } else {
                // New user not yet in XP list — they enter at the total count + 1
                const total = rankData.rows?.length ?? 0;
                setRankNumber(total + 1);
              }
            }
          }
        }
      } catch { /* rank fetch is non-fatal */ }

      setUploadState('done');
      setStep('RANK');
    } catch {
      setUploadError('Something went wrong. Try again or skip for now.');
      setUploadState('error');
    }
  };

  const handleLaunch = async () => {
    await markComplete();
    setDone(true);
    setTimeout(() => { window.location.href = '/hub/performer'; }, 1800);
  };

  const isWorking = uploadState === 'uploading' || uploadState === 'saving';

  if (done) {
    return (
      <main style={{ minHeight: '100vh', background: '#0a0a0f', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '40px 20px' }}>
        <AutoPerformerWelcomeMessage displayName={displayName} />
      </main>
    );
  }

  /* ─────────────────────────────────────────────────────────────
     STEP 1 — Photo + Bio ingestion
     Optional. Completing it places the performer in the magazine
     with their official ranking number.
  ───────────────────────────────────────────────────────────── */
  if (step === 'PHOTO') {
    return (
      <main style={{ minHeight: '100vh', background: '#0a0a0f', color: '#fff', fontFamily: "'Inter', sans-serif", padding: '40px 24px 80px' }}>
        <div style={{ maxWidth: 560, margin: '0 auto' }}>

          <p style={{ fontSize: 11, letterSpacing: '0.35em', color: '#FF2DAA', fontWeight: 800, marginBottom: 8 }}>
            THE MUSICIAN&apos;S INDEX
          </p>
          <h1 style={{ fontSize: 28, fontWeight: 900, marginBottom: 6 }}>Your Performer Profile</h1>
          <p style={{ fontSize: 13, color: 'rgba(255,255,255,0.45)', lineHeight: 1.6, marginBottom: 8 }}>
            Add your photo and bio to appear in the TMI Magazine with your official artist ranking number.
          </p>

          {/* Magazine incentive callout */}
          <div style={{ background: 'rgba(255,215,0,0.07)', border: '1px solid rgba(255,215,0,0.3)', borderRadius: 10, padding: '12px 16px', marginBottom: 28 }}>
            <div style={{ fontSize: 10, letterSpacing: '0.2em', color: '#FFD700', fontWeight: 800, marginBottom: 4 }}>
              📰 WHY COMPLETE THIS NOW
            </div>
            <div style={{ fontSize: 12, color: 'rgba(255,255,255,0.65)', lineHeight: 1.7 }}>
              Your photo + bio places you in the <strong style={{ color: '#fff' }}>TMI Magazine rotation</strong> next to your artist ranking number. Without it you still earn XP and your rank climbs — but you won&apos;t appear in print until this is done.
            </div>
          </div>

          {/* Photo drop zone */}
          <div
            onClick={() => fileRef.current?.click()}
            onDrop={(e) => { e.preventDefault(); const f = e.dataTransfer.files[0]; if (f) handleFile(f); }}
            onDragOver={(e) => e.preventDefault()}
            style={{
              borderRadius: 14, border: `2px dashed ${preview ? '#FF2DAA' : 'rgba(255,45,170,0.35)'}`,
              background: preview ? 'rgba(255,45,170,0.04)' : 'rgba(255,255,255,0.02)',
              minHeight: 200, display: 'flex', alignItems: 'center', justifyContent: 'center',
              cursor: 'pointer', marginBottom: 14, overflow: 'hidden',
            }}
          >
            {preview ? (
              <img src={preview} alt="Preview" style={{ width: '100%', height: 220, objectFit: 'cover' }} />
            ) : (
              <div style={{ textAlign: 'center', padding: 32 }}>
                <div style={{ fontSize: 44, marginBottom: 10, opacity: 0.5 }}>📸</div>
                <div style={{ fontSize: 13, fontWeight: 700, color: '#FF2DAA', marginBottom: 4 }}>
                  Click or drag your real performer photo here
                </div>
                <div style={{ fontSize: 10, color: 'rgba(255,255,255,0.3)' }}>JPG · PNG · WEBP · Max 10 MB</div>
              </div>
            )}
          </div>
          <input ref={fileRef} type="file" accept="image/jpeg,image/png,image/webp" style={{ display: 'none' }}
            onChange={(e) => { const f = e.target.files?.[0]; if (f) handleFile(f); }} />

          {preview && (
            <button onClick={() => { setPreview(null); if (fileRef.current) fileRef.current.value = ''; }}
              style={{ display: 'block', width: '100%', marginBottom: 14, padding: '7px', borderRadius: 7, background: 'transparent', border: '1px solid rgba(255,255,255,0.1)', color: 'rgba(255,255,255,0.35)', fontSize: 10, fontWeight: 700, cursor: 'pointer' }}>
              REMOVE — choose different photo
            </button>
          )}

          {/* Stage name */}
          <div style={{ marginBottom: 12 }}>
            <label style={{ display: 'block', fontSize: 9, letterSpacing: '0.18em', color: 'rgba(255,255,255,0.35)', fontWeight: 800, marginBottom: 6 }}>
              ARTIST / STAGE NAME
            </label>
            <input value={displayName} onChange={e => setDisplayName(e.target.value)}
              placeholder="Your name or stage name"
              style={{ width: '100%', padding: '11px 14px', borderRadius: 9, background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,45,170,0.25)', color: '#fff', fontSize: 13, outline: 'none', boxSizing: 'border-box' }} />
          </div>

          {/* Bio */}
          <div style={{ marginBottom: 20 }}>
            <label style={{ display: 'block', fontSize: 9, letterSpacing: '0.18em', color: 'rgba(255,255,255,0.35)', fontWeight: 800, marginBottom: 6 }}>
              YOUR BIO — APPEARS IN YOUR MAGAZINE ARTICLE
            </label>
            <textarea value={bio} onChange={e => setBio(e.target.value)}
              placeholder="Tell the world who you are, your sound, your story..."
              rows={3}
              style={{ width: '100%', padding: '11px 14px', borderRadius: 9, background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,45,170,0.25)', color: '#fff', fontSize: 13, outline: 'none', resize: 'none', boxSizing: 'border-box' }} />
          </div>

          {uploadError && (
            <div style={{ padding: '10px 14px', borderRadius: 8, background: 'rgba(255,60,60,0.08)', border: '1px solid rgba(255,60,60,0.25)', color: '#FF6B6B', fontSize: 11, marginBottom: 14 }}>
              {uploadError}
            </div>
          )}

          {/* Primary: save & get magazine placement */}
          <button onClick={handleSavePhoto} disabled={isWorking}
            style={{ width: '100%', padding: '14px', borderRadius: 10, background: isWorking ? 'rgba(255,45,170,0.4)' : '#FF2DAA', color: '#fff', fontWeight: 900, fontSize: 13, letterSpacing: '0.1em', border: 'none', cursor: isWorking ? 'not-allowed' : 'pointer', marginBottom: 10 }}>
            {uploadState === 'uploading' ? '⏳ UPLOADING PHOTO...'
              : uploadState === 'saving' ? '💾 SAVING TO YOUR PROFILE...'
              : '📰 SAVE & APPEAR IN THE MAGAZINE →'}
          </button>

          {/* Secondary: skip */}
          <button onClick={handleSkip}
            style={{ width: '100%', padding: '12px', borderRadius: 10, background: 'transparent', border: '1px solid rgba(255,255,255,0.12)', color: 'rgba(255,255,255,0.4)', fontWeight: 700, fontSize: 11, letterSpacing: '0.08em', cursor: 'pointer' }}>
            SKIP FOR NOW — GO TO MY DASHBOARD &amp; FINISH LATER
          </button>

          <p style={{ marginTop: 12, fontSize: 10, color: 'rgba(255,255,255,0.2)', textAlign: 'center', lineHeight: 1.5 }}>
            You can complete your photo and bio anytime from Settings → Profile. Your ranking keeps climbing whether or not you finish this now.
          </p>

        </div>
      </main>
    );
  }

  /* ─────────────────────────────────────────────────────────────
     STEP 2 — Ranking stamp (animated reveal after photo saved)
  ───────────────────────────────────────────────────────────── */
  if (step === 'RANK') {
    const rankDisplay = rankNumber !== null ? `#${rankNumber.toLocaleString()}` : '#—';
    return (
      <main style={{ minHeight: '100vh', background: '#0a0a0f', color: '#fff', fontFamily: "'Inter', sans-serif", display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '40px 24px' }}>
        <style>{`
          @keyframes tmiStampIn {
            0%   { transform: scale(3) rotate(-12deg); opacity: 0; }
            60%  { transform: scale(0.92) rotate(2deg); opacity: 1; }
            80%  { transform: scale(1.06) rotate(-1deg); }
            100% { transform: scale(1) rotate(0deg); opacity: 1; }
          }
          @keyframes tmiStampGlow {
            0%, 100% { box-shadow: 0 0 30px rgba(255,215,0,0.4), 0 0 60px rgba(255,45,170,0.2); }
            50%       { box-shadow: 0 0 60px rgba(255,215,0,0.7), 0 0 100px rgba(255,45,170,0.4); }
          }
          @keyframes tmiRankFadeUp {
            from { opacity: 0; transform: translateY(16px); }
            to   { opacity: 1; transform: translateY(0); }
          }
        `}</style>

        <div style={{ maxWidth: 480, width: '100%', textAlign: 'center' }}>
          <p style={{ fontSize: 11, letterSpacing: '0.35em', color: '#FF2DAA', fontWeight: 800, marginBottom: 24 }}>
            THE MUSICIAN&apos;S INDEX
          </p>

          {/* Animated rank stamp */}
          <div style={{
            display: 'inline-flex', alignItems: 'center', justifyContent: 'center',
            width: 200, height: 200, borderRadius: '50%',
            border: '6px solid #FFD700',
            background: 'radial-gradient(circle, rgba(255,215,0,0.12) 0%, rgba(10,10,15,0.95) 70%)',
            marginBottom: 28,
            animation: 'tmiStampIn 0.7s cubic-bezier(0.34,1.56,0.64,1) forwards, tmiStampGlow 2s ease-in-out 0.7s infinite',
          }}>
            <div>
              <div style={{ fontSize: 11, fontWeight: 900, letterSpacing: '0.3em', color: '#FFD700', marginBottom: 4 }}>TMI RANK</div>
              <div style={{ fontSize: 58, fontWeight: 900, lineHeight: 1, color: '#FFD700', fontVariantNumeric: 'tabular-nums' }}>
                {rankDisplay}
              </div>
              <div style={{ fontSize: 9, color: 'rgba(255,215,0,0.6)', letterSpacing: '0.2em', marginTop: 4 }}>GLOBAL</div>
            </div>
          </div>

          {/* Message */}
          <div style={{ animation: 'tmiRankFadeUp 0.5s ease 0.6s both' }}>
            <h2 style={{ fontSize: 22, fontWeight: 900, marginBottom: 8 }}>
              You&apos;re officially ranked {rankDisplay} in TMI
            </h2>
            <p style={{ fontSize: 13, color: 'rgba(255,255,255,0.5)', lineHeight: 1.7, marginBottom: 8 }}>
              Every battle you win, every cypher you drop, every fan you earn — your number moves. Climb your city. Climb your state. Climb your country. Reach global.
            </p>
            <p style={{ fontSize: 12, color: 'rgba(255,215,0,0.6)', marginBottom: 28 }}>
              Your magazine article is now queued. It publishes when your profile is complete and your ranking is verified.
            </p>

            {/* Ranking tiers explained */}
            <div style={{ background: 'rgba(255,215,0,0.05)', border: '1px solid rgba(255,215,0,0.2)', borderRadius: 12, padding: '14px 18px', marginBottom: 24, textAlign: 'left' }}>
              <div style={{ fontSize: 9, fontWeight: 800, letterSpacing: '0.2em', color: '#FFD700', marginBottom: 10 }}>YOUR RANKING TIERS</div>
              {[
                ['🏙️ City', 'Best in your city'],
                ['🗺️ State / Region', 'Best in your state'],
                ['🌎 Country', 'Best in your country'],
                ['🌍 Global', 'Best on TMI worldwide'],
                ['📰 Magazine #1', 'Global #1 with complete profile — cover artist'],
              ].map(([tier, desc]) => (
                <div key={tier} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '5px 0', borderBottom: '1px solid rgba(255,255,255,0.05)' }}>
                  <span style={{ fontSize: 11, color: '#fff', fontWeight: 700 }}>{tier}</span>
                  <span style={{ fontSize: 10, color: 'rgba(255,255,255,0.4)' }}>{desc}</span>
                </div>
              ))}
            </div>

            <button onClick={() => setStep('LAUNCH')}
              style={{ width: '100%', padding: '14px', borderRadius: 10, background: '#FFD700', color: '#050510', fontWeight: 900, fontSize: 13, letterSpacing: '0.1em', border: 'none', cursor: 'pointer', marginBottom: 10 }}>
              LET&apos;S GO — FINISH SETUP →
            </button>
            <button onClick={handleSkip}
              style={{ width: '100%', padding: '12px', borderRadius: 10, background: 'transparent', border: '1px solid rgba(255,255,255,0.12)', color: 'rgba(255,255,255,0.4)', fontWeight: 700, fontSize: 11, letterSpacing: '0.08em', cursor: 'pointer' }}>
              GO TO MY DASHBOARD NOW
            </button>
          </div>
        </div>
      </main>
    );
  }

  /* ─────────────────────────────────────────────────────────────
     STEP 3 — Launch checklist (after photo + rank reveal)
  ───────────────────────────────────────────────────────────── */
  return (
    <main style={{ minHeight: '100vh', background: '#0a0a0f', color: '#fff', fontFamily: "'Inter', sans-serif", padding: '40px 24px 80px' }}>
      <div style={{ maxWidth: 560, margin: '0 auto' }}>

        <p style={{ fontSize: 11, letterSpacing: '0.35em', color: '#FF2DAA', fontWeight: 800, marginBottom: 8 }}>
          THE MUSICIAN&apos;S INDEX
        </p>
        <h1 style={{ fontSize: 28, fontWeight: 900, color: '#ff6b35', marginBottom: 6 }}>
          Ready to Go Live
        </h1>
        <p style={{ fontSize: 13, color: 'rgba(255,255,255,0.5)', marginBottom: 24, lineHeight: 1.6 }}>
          ✅ Photo saved — you&apos;re queued for the magazine. Complete your launch checklist and step onto your stage.
        </p>

        {/* Invite XP callout */}
        <div style={{ background: 'rgba(255,215,0,0.08)', border: '1px solid rgba(255,215,0,0.25)', borderRadius: 10, padding: '12px 16px', marginBottom: 24 }}>
          <div style={{ fontSize: 10, letterSpacing: '0.2em', color: '#FFD700', fontWeight: 800, marginBottom: 6 }}>
            🚀 LAUNCH BONUS — DOUBLE XP ON ALL INVITES
          </div>
          <div style={{ fontSize: 13, color: 'rgba(255,255,255,0.75)', lineHeight: 1.6 }}>
            Invite a fan or performer who joins free → <strong style={{ color: '#FFD700' }}>1,000 XP</strong> (normally 500)<br />
            They upgrade to a paid tier → up to <strong style={{ color: '#FFD700' }}>5,000 XP</strong> per invite<br />
            5 qualified invites → <strong style={{ color: '#FFD700' }}>+10,000 XP milestone bonus</strong>
          </div>
        </div>

        <ul style={{ listStyle: 'none', padding: 0, margin: '0 0 28px', display: 'flex', flexDirection: 'column', gap: 8 }}>
          {TMI_ONBOARDING_CHECKLIST.map((item) => (
            <li key={item.id} style={{ borderRadius: 8, border: '1px solid rgba(255,255,255,0.12)', background: 'rgba(255,255,255,0.04)', padding: '10px 14px', fontSize: 13 }}>
              {item.label}
            </li>
          ))}
        </ul>

        <button onClick={handleLaunch}
          style={{ width: '100%', padding: '14px', background: '#FF2DAA', color: '#fff', border: 'none', borderRadius: 10, fontSize: 15, fontWeight: 900, cursor: 'pointer', letterSpacing: '0.06em' }}>
          I&apos;m Ready — Show Me My Stage →
        </button>

      </div>
    </main>
  );
}
