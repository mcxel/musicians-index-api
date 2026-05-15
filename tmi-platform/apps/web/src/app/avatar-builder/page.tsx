"use client";
import { useState } from 'react';
import { motion } from 'framer-motion';
import { useRouter } from 'next/navigation';
import PageShell from '@/components/layout/PageShell';
import HUDFrame from '@/components/layout/HUDFrame';
import FooterHUD from '@/components/layout/FooterHUD';
import AvatarGenerator from '@/components/avatar/AvatarGenerator';
import AvatarCustomizer from '@/components/avatar/AvatarCustomizer';
import type { AvatarConfig } from '@/lib/avatar/avatarEngine';

export default function AvatarBuilderPage() {
  const router = useRouter();
  const [avatar, setAvatar] = useState<AvatarConfig | null>(null);
  const [saved, setSaved] = useState(false);

  function handleGenerated(av: AvatarConfig) {
    setAvatar(av);
  }

  function handleCustomized(av: AvatarConfig) {
    setAvatar(av);
  }

  async function handleSave() {
    if (!avatar) return;
    const { saveAvatar } = await import('@/lib/avatar/avatarEngine');
    await saveAvatar(avatar);
    setSaved(true);
    setTimeout(() => router.push('/bubble-builder'), 1200);
  }

  return (
    <PageShell>
      <HUDFrame>
        <div style={{ minHeight: '100vh', background: '#050510', padding: '24px 20px' }}>
          {/* Header */}
          <div style={{ textAlign: 'center', marginBottom: 32 }}>
            <motion.h1
              initial={{ opacity: 0, y: -20 }}
              animate={{ opacity: 1, y: 0 }}
              style={{ fontSize: 28, fontWeight: 900, letterSpacing: 3, color: '#00FFFF', margin: 0 }}
            >
              AVATAR BUILDER
            </motion.h1>
            <p style={{ color: '#888', fontSize: 13, marginTop: 8 }}>
              Design your identity — customize every detail
            </p>
            {!avatar && (
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.97 }}
                onClick={() => router.push('/face-scan')}
                style={{
                  marginTop: 12, padding: '8px 20px', background: 'transparent',
                  border: '1px solid #FF2DAA', borderRadius: 6, color: '#FF2DAA',
                  fontSize: 12, letterSpacing: 2, cursor: 'pointer',
                }}
              >
                SCAN FACE FIRST
              </motion.button>
            )}
          </div>

          {/* Main layout */}
          <div style={{ display: 'flex', gap: 20, flexWrap: 'wrap', maxWidth: 1000, margin: '0 auto' }}>
            {/* Generator panel */}
            <div style={{ flex: '1 1 340px', minWidth: 300 }}>
              <AvatarGenerator onComplete={handleGenerated} userId="me" />
            </div>

            {/* Customizer panel — only shown after base avatar created */}
            {avatar && (
              <motion.div
                initial={{ opacity: 0, x: 40 }}
                animate={{ opacity: 1, x: 0 }}
                style={{ flex: '1 1 340px', minWidth: 300 }}
              >
                <AvatarCustomizer avatar={avatar} onChange={handleCustomized} />
              </motion.div>
            )}
          </div>

          {/* Save CTA */}
          {avatar && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              style={{ textAlign: 'center', marginTop: 32 }}
            >
              <motion.button
                whileHover={{ scale: 1.04 }}
                whileTap={{ scale: 0.96 }}
                onClick={handleSave}
                style={{
                  padding: '14px 48px', background: saved ? '#00FF88' : 'linear-gradient(135deg,#00FFFF,#AA2DFF)',
                  border: 'none', borderRadius: 10, color: saved ? '#050510' : '#fff',
                  fontSize: 15, fontWeight: 800, letterSpacing: 3, cursor: 'pointer',
                }}
              >
                {saved ? '✓ SAVED — GOING TO BUBBLE BUILDER' : 'SAVE AVATAR'}
              </motion.button>
              <p style={{ color: '#555', fontSize: 12, marginTop: 10 }}>
                You can always update your avatar from Profile settings
              </p>
            </motion.div>
          )}
        </div>
      </HUDFrame>
      <FooterHUD />
    </PageShell>
  );
}
