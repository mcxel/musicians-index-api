"use client";
import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { useRouter } from 'next/navigation';
import PageShell from '@/components/layout/PageShell';
import HUDFrame from '@/components/layout/HUDFrame';
import FooterHUD from '@/components/layout/FooterHUD';
import AvatarCustomizer from '@/components/avatar/AvatarCustomizer';
import type { AvatarConfig } from '@/lib/avatar/avatarEngine';

export default function AvatarCustomizePage() {
  const router = useRouter();
  const [avatar, setAvatar] = useState<AvatarConfig | null>(null);
  const [loading, setLoading] = useState(true);
  const [saved, setSaved] = useState(false);

  useEffect(() => {
    async function load() {
      const { loadAvatar } = await import('@/lib/avatar/avatarEngine');
      const av = await loadAvatar('me');
      setAvatar(av);
      setLoading(false);
    }
    load();
  }, []);

  async function handleSave() {
    if (!avatar) return;
    const { saveAvatar } = await import('@/lib/avatar/avatarEngine');
    await saveAvatar(avatar);
    setSaved(true);
    setTimeout(() => setSaved(false), 2000);
  }

  return (
    <PageShell>
      <HUDFrame>
        <div style={{ minHeight: '100vh', background: '#050510', padding: '24px 20px' }}>
          <div style={{ textAlign: 'center', marginBottom: 28 }}>
            <motion.h1
              initial={{ opacity: 0, y: -20 }}
              animate={{ opacity: 1, y: 0 }}
              style={{ fontSize: 26, fontWeight: 900, letterSpacing: 3, color: '#AA2DFF', margin: 0 }}
            >
              CUSTOMIZE AVATAR
            </motion.h1>
            <p style={{ color: '#888', fontSize: 13, marginTop: 6 }}>
              Glasses · Accessories · Animation style
            </p>
          </div>

          {loading && (
            <p style={{ color: '#555', textAlign: 'center', marginTop: 60 }}>Loading avatar…</p>
          )}

          {!loading && !avatar && (
            <div style={{ textAlign: 'center', marginTop: 60 }}>
              <p style={{ color: '#888' }}>No avatar found.</p>
              <motion.button
                whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.97 }}
                onClick={() => router.push('/avatar-builder')}
                style={{
                  marginTop: 16, padding: '10px 28px', background: 'linear-gradient(135deg,#00FFFF,#AA2DFF)',
                  border: 'none', borderRadius: 8, color: '#fff', fontWeight: 700,
                  fontSize: 13, letterSpacing: 2, cursor: 'pointer',
                }}
              >
                BUILD AVATAR FIRST
              </motion.button>
            </div>
          )}

          {!loading && avatar && (
            <div style={{ maxWidth: 480, margin: '0 auto' }}>
              <AvatarCustomizer avatar={avatar} onChange={setAvatar} />

              <motion.button
                whileHover={{ scale: 1.04 }} whileTap={{ scale: 0.96 }}
                onClick={handleSave}
                style={{
                  width: '100%', marginTop: 24, padding: '13px 0',
                  background: saved ? '#00FF88' : 'linear-gradient(135deg,#AA2DFF,#FF2DAA)',
                  border: 'none', borderRadius: 10, color: saved ? '#050510' : '#fff',
                  fontSize: 14, fontWeight: 800, letterSpacing: 3, cursor: 'pointer',
                }}
              >
                {saved ? '✓ SAVED' : 'SAVE CHANGES'}
              </motion.button>

              <div style={{ textAlign: 'center', marginTop: 16 }}>
                <button
                  onClick={() => router.push('/avatar-builder')}
                  style={{
                    background: 'none', border: 'none', color: '#555',
                    fontSize: 12, cursor: 'pointer', textDecoration: 'underline',
                  }}
                >
                  ← Back to full builder
                </button>
              </div>
            </div>
          )}
        </div>
      </HUDFrame>
      <FooterHUD />
    </PageShell>
  );
}
