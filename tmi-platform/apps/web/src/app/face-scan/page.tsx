"use client";
import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import PageShell from '@/components/layout/PageShell';
import HUDFrame from '@/components/layout/HUDFrame';
import FooterHUD from '@/components/layout/FooterHUD';
import FaceScanner from '@/components/face/FaceScanner';
import AvatarGenerator from '@/components/avatar/AvatarGenerator';
import { storeFaceModel } from '@/lib/face/faceScanEngine';
import type { FaceScanResult } from '@/lib/face/faceScanEngine';
import type { AvatarConfig } from '@/lib/avatar/avatarEngine';

type Step = 'intro' | 'scan' | 'preview' | 'avatar' | 'done';

export default function FaceScanPage() {
  const [step, setStep] = useState<Step>('intro');
  const [scanResult, setScanResult] = useState<FaceScanResult | null>(null);
  const [avatar, setAvatar] = useState<AvatarConfig | null>(null);

  const handleScanComplete = async (result: FaceScanResult) => {
    setScanResult(result);
    if (result.status === 'success' && result.faceToken) {
      await storeFaceModel(result.faceToken, 'current_user');
    }
    setStep('preview');
  };

  const STEPS = ['intro', 'scan', 'preview', 'avatar', 'done'] as Step[];
  const stepIdx = STEPS.indexOf(step);

  return (
    <PageShell>
      <HUDFrame>
        <div style={{ minHeight: '100vh', background: '#050510', padding: '80px 24px 100px' }}>
          {/* Header */}
          <div style={{ maxWidth: 600, margin: '0 auto 32px', textAlign: 'center' }}>
            <motion.div
              initial={{ opacity: 0, y: -20 }}
              animate={{ opacity: 1, y: 0 }}
              style={{ display: 'inline-block', padding: '4px 14px', background: '#00FFFF22', borderRadius: 6, marginBottom: 12 }}
            >
              <span style={{ color: '#00FFFF', fontSize: 11, letterSpacing: 2 }}>IDENTITY SYSTEM</span>
            </motion.div>
            <h1 style={{ color: '#FFFFFF', fontSize: 32, fontWeight: 900, margin: '0 0 8px', letterSpacing: 1 }}>
              FACE SCAN
            </h1>
            <p style={{ color: '#888', fontSize: 14 }}>
              Enroll your face to enable face login, avatar generation, and world identity
            </p>
          </div>

          {/* Step progress */}
          <div style={{ maxWidth: 480, margin: '0 auto 32px', display: 'flex', gap: 8, alignItems: 'center' }}>
            {STEPS.map((s, i) => (
              <div key={s} style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 4 }}>
                <div style={{
                  width: '100%', height: 4, borderRadius: 2,
                  background: i <= stepIdx ? '#00FFFF' : '#222',
                  transition: 'background 0.4s',
                }} />
                <span style={{ color: i <= stepIdx ? '#00FFFF' : '#444', fontSize: 9, letterSpacing: 1 }}>
                  {s.toUpperCase()}
                </span>
              </div>
            ))}
          </div>

          {/* Content */}
          <div style={{ maxWidth: 560, margin: '0 auto', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 24 }}>
            <AnimatePresence mode="wait">
              {step === 'intro' && (
                <motion.div key="intro"
                  initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }}
                  style={{ width: '100%', maxWidth: 440, textAlign: 'center' }}
                >
                  <div style={{ fontSize: 72, marginBottom: 20 }}>🫡</div>
                  <div style={{ background: '#0A0A1A', border: '1px solid #1A1A3A', borderRadius: 14, padding: 24, marginBottom: 20 }}>
                    {[
                      { icon: '🔐', text: 'Log in instantly with your face — no password needed' },
                      { icon: '🎨', text: 'Auto-generate your personal avatar from your face scan' },
                      { icon: '🌐', text: 'Your bubble character enters rooms with your face identity' },
                      { icon: '🔑', text: 'Use face scan to recover your account if locked out' },
                    ].map((item, i) => (
                      <div key={i} style={{ display: 'flex', gap: 12, alignItems: 'flex-start', marginBottom: 12 }}>
                        <span style={{ fontSize: 20 }}>{item.icon}</span>
                        <span style={{ color: '#CCC', fontSize: 13, textAlign: 'left' }}>{item.text}</span>
                      </div>
                    ))}
                  </div>
                  <div style={{ color: '#666', fontSize: 11, marginBottom: 20 }}>
                    Your facial data is stored securely and never shared.
                    You can delete it at any time from your profile.
                  </div>
                  <motion.button
                    whileHover={{ scale: 1.04 }} whileTap={{ scale: 0.97 }}
                    onClick={() => setStep('scan')}
                    style={{
                      padding: '14px 40px',
                      background: 'linear-gradient(135deg, #00FFFF, #00FF88)',
                      border: 'none', borderRadius: 10,
                      color: '#050510', fontWeight: 900, fontSize: 15, cursor: 'pointer', letterSpacing: 1,
                    }}
                  >START FACE SCAN →</motion.button>
                </motion.div>
              )}

              {step === 'scan' && (
                <motion.div key="scan"
                  initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0 }}
                  style={{ width: '100%' }}
                >
                  <FaceScanner
                    options={{ purpose: 'registration', saveModel: true }}
                    onComplete={handleScanComplete}
                    onCancel={() => setStep('intro')}
                  />
                </motion.div>
              )}

              {step === 'preview' && scanResult && (
                <motion.div key="preview"
                  initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0 }}
                  style={{
                    width: '100%', maxWidth: 440, textAlign: 'center',
                    background: '#070718', border: '1px solid #00FF8844',
                    borderRadius: 16, padding: 28,
                  }}
                >
                  <div style={{ fontSize: 48, marginBottom: 12 }}>✅</div>
                  <div style={{ color: '#00FF88', fontWeight: 700, fontSize: 18, marginBottom: 8 }}>FACE ENROLLED</div>
                  <div style={{ color: '#888', fontSize: 13, marginBottom: 6 }}>
                    Quality score: <span style={{ color: '#FFD700' }}>{scanResult.quality ?? 87}%</span>
                  </div>
                  <div style={{ color: '#666', fontSize: 12, marginBottom: 24 }}>
                    Face token: {scanResult.faceToken?.slice(0, 16)}...
                  </div>
                  <div style={{ display: 'flex', gap: 10, justifyContent: 'center', flexWrap: 'wrap' }}>
                    <motion.button
                      whileHover={{ scale: 1.04 }} whileTap={{ scale: 0.97 }}
                      onClick={() => setStep('avatar')}
                      style={{
                        padding: '12px 24px',
                        background: 'linear-gradient(135deg, #AA2DFF, #FF2DAA)',
                        border: 'none', borderRadius: 8,
                        color: '#FFF', fontWeight: 700, cursor: 'pointer', fontSize: 13,
                      }}
                    >🎨 GENERATE AVATAR</motion.button>
                    <motion.button
                      whileHover={{ scale: 1.04 }} whileTap={{ scale: 0.97 }}
                      onClick={() => setStep('done')}
                      style={{
                        padding: '12px 24px',
                        background: 'transparent',
                        border: '1px solid #444', borderRadius: 8,
                        color: '#888', cursor: 'pointer', fontSize: 13,
                      }}
                    >SKIP FOR NOW</motion.button>
                  </div>
                </motion.div>
              )}

              {step === 'avatar' && scanResult && (
                <motion.div key="avatar"
                  initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }}
                  style={{ width: '100%' }}
                >
                  <AvatarGenerator
                    avatarSeed={scanResult.avatarSeed}
                    onComplete={a => { setAvatar(a); setStep('done'); }}
                  />
                </motion.div>
              )}

              {step === 'done' && (
                <motion.div key="done"
                  initial={{ opacity: 0, scale: 0.8 }} animate={{ opacity: 1, scale: 1 }}
                  style={{ textAlign: 'center', padding: '40px 20px' }}
                >
                  <div style={{ fontSize: 72, marginBottom: 16 }}>🎉</div>
                  <h2 style={{ color: '#00FF88', fontWeight: 900, fontSize: 24, marginBottom: 8 }}>ALL SET!</h2>
                  <p style={{ color: '#888', fontSize: 14, marginBottom: 24 }}>
                    Face enrolled · Avatar created · You&apos;re ready to enter the world
                  </p>
                  <div style={{ display: 'flex', gap: 10, justifyContent: 'center', flexWrap: 'wrap' }}>
                    {[
                      { href: '/rooms/lobby', label: '🚪 Enter Lobby' },
                      { href: '/avatar-builder', label: '🎨 Customize Avatar' },
                      { href: '/bubble-builder', label: '🌐 Build Bubble' },
                      { href: '/profile/face', label: '⚙️ Face Settings' },
                    ].map(({ href, label }) => (
                      <a key={href} href={href}
                        style={{
                          padding: '10px 18px',
                          background: '#0A0A1A', border: '1px solid #333',
                          borderRadius: 8, color: '#CCC', textDecoration: 'none', fontSize: 13,
                        }}
                      >{label}</a>
                    ))}
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </div>
      </HUDFrame>
      <FooterHUD />
    </PageShell>
  );
}
