'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';

const GENRES = ['Hip-Hop', 'Trap', 'R&B', 'Dancehall', 'Afrobeats', 'Pop', 'Rock', 'Jazz', 'Soul', 'Reggae', 'Electronic', 'Other'];

export default function BandSignupPage() {
  const router = useRouter();
  const [form, setForm] = useState({ name: '', genre: '', bio: '', city: '' });
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  function set(field: string, value: string) {
    setForm(prev => ({ ...prev, [field]: value }));
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!form.name.trim()) { setError('Band name is required'); return; }
    setSubmitting(true);
    setError(null);

    try {
      const res = await fetch('/api/bands', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(form),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error ?? 'Failed to register band');
      router.push(`/bands/${data.slug ?? form.name.toLowerCase().replace(/\s+/g, '-')}`);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <main style={{ minHeight: '100vh', background: '#060410', color: '#fff', padding: '48px 24px 80px' }}>
      <div style={{ maxWidth: 540, margin: '0 auto' }}>
        <Link href="/bands" style={{ fontSize: 10, color: 'rgba(255,255,255,0.3)', textDecoration: 'none', letterSpacing: '0.12em', fontWeight: 700 }}>
          ← BANDS
        </Link>

        <h1 style={{ fontSize: 24, fontWeight: 900, margin: '20px 0 4px' }}>🎸 Register Your Band</h1>
        <p style={{ fontSize: 12, color: 'rgba(255,255,255,0.4)', marginBottom: 36 }}>
          Crews, collectives, groups — get your band on the platform and perform together.
        </p>

        <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
          {/* Band Name */}
          <div>
            <label style={{ fontSize: 9, fontWeight: 800, letterSpacing: '0.15em', color: 'rgba(255,255,255,0.4)', display: 'block', marginBottom: 6 }}>
              BAND NAME *
            </label>
            <input
              type="text"
              value={form.name}
              onChange={e => set('name', e.target.value)}
              placeholder="e.g. The Frequency Collective"
              maxLength={80}
              style={{
                width: '100%', background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.12)',
                borderRadius: 10, padding: '12px 16px', color: '#fff', fontSize: 14,
                outline: 'none', boxSizing: 'border-box',
              }}
            />
          </div>

          {/* Genre */}
          <div>
            <label style={{ fontSize: 9, fontWeight: 800, letterSpacing: '0.15em', color: 'rgba(255,255,255,0.4)', display: 'block', marginBottom: 6 }}>
              GENRE
            </label>
            <select
              value={form.genre}
              onChange={e => set('genre', e.target.value)}
              style={{
                width: '100%', background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.12)',
                borderRadius: 10, padding: '12px 16px', color: form.genre ? '#fff' : 'rgba(255,255,255,0.4)',
                fontSize: 14, outline: 'none', boxSizing: 'border-box',
              }}
            >
              <option value="">Select genre...</option>
              {GENRES.map(g => <option key={g} value={g}>{g}</option>)}
            </select>
          </div>

          {/* City */}
          <div>
            <label style={{ fontSize: 9, fontWeight: 800, letterSpacing: '0.15em', color: 'rgba(255,255,255,0.4)', display: 'block', marginBottom: 6 }}>
              CITY / REGION
            </label>
            <input
              type="text"
              value={form.city}
              onChange={e => set('city', e.target.value)}
              placeholder="e.g. Atlanta, GA"
              maxLength={60}
              style={{
                width: '100%', background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.12)',
                borderRadius: 10, padding: '12px 16px', color: '#fff', fontSize: 14,
                outline: 'none', boxSizing: 'border-box',
              }}
            />
          </div>

          {/* Bio */}
          <div>
            <label style={{ fontSize: 9, fontWeight: 800, letterSpacing: '0.15em', color: 'rgba(255,255,255,0.4)', display: 'block', marginBottom: 6 }}>
              BIO
            </label>
            <textarea
              value={form.bio}
              onChange={e => set('bio', e.target.value)}
              placeholder="Tell the world about your band..."
              rows={4}
              maxLength={400}
              style={{
                width: '100%', background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.12)',
                borderRadius: 10, padding: '12px 16px', color: '#fff', fontSize: 14,
                outline: 'none', resize: 'vertical', boxSizing: 'border-box',
              }}
            />
          </div>

          {error && (
            <p style={{ fontSize: 12, color: '#FF8080', margin: 0 }}>{error}</p>
          )}

          <button
            type="submit"
            disabled={submitting}
            style={{
              padding: '14px', borderRadius: 26,
              background: submitting ? 'rgba(255,45,170,0.06)' : 'rgba(255,45,170,0.14)',
              border: '1px solid rgba(255,45,170,0.4)',
              color: '#FF2DAA', fontWeight: 900, fontSize: 14,
              cursor: submitting ? 'not-allowed' : 'pointer', letterSpacing: '0.05em',
            }}
          >
            {submitting ? 'Registering…' : '🎸 Register Band'}
          </button>
        </form>
      </div>
    </main>
  );
}
