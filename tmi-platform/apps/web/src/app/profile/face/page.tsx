"use client";
import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useRouter } from 'next/navigation';
import PageShell from '@/components/layout/PageShell';
import HUDFrame from '@/components/layout/HUDFrame';
import FooterHUD from '@/components/layout/FooterHUD';

type FaceStatus = 'enrolled' | 'not-enrolled' | 'loading';

export default function ProfileFacePage() {
  const router = useRouter();
  const [status, setStatus] = useState<FaceStatus>('enrolled');
  const [lastScan] = useState('2025-01-15 · 11:42 AM');
  const [qualityScore] = useState(94);
  const [confirm, setConfirm] = useState<'delete' | 'revoke' | null>(null);
  const [actionDone, setActionDone] = useState<string | null>(null);

  async function handleRevoke() {
    const { revokeFaceLogin } = await import('@/lib/face/faceLoginEngine');
    await revokeFaceLogin('me');
    setStatus('not-enrolled');
    setConfirm(null);
    setActionDone('Face login disabled.');
    setTimeout(() => setActionDone(null), 3000);
  }

  async function handleDelete() {
    const { deleteFaceModel } = await import('@/lib/face/faceScanEngine');
    await deleteFaceModel('me');
    setStatus('not-enrolled');
    setConfirm(null);
    setActionDone('Face data deleted from all servers.');
    setTimeout(() => setActionDone(null), 3000);
  }

  return (
    <PageShell>
      <HUDFrame>
        <div style={{ minHeight: '100vh', background: '#050510', padding: '24px 20px', maxWidth: 560, margin: '0 auto' }}>
          {/* Header */}
          <div style={{ marginBottom: 32 }}>
            <button
              onClick={() => router.back()}
              style={{ background: 'none', border: 'none', color: '#555', fontSize: 13, cursor: 'pointer', marginBottom: 16 }}
            >
              ← Back
            </button>
            <motion.h1
              initial={{ opacity: 0, y: -20 }}
              animate={{ opacity: 1, y: 0 }}
              style={{ fontSize: 24, fontWeight: 900, letterSpacing: 3, color: '#00FFFF', margin: 0 }}
            >
              FACE IDENTITY
            </motion.h1>
            <p style={{ color: '#555', fontSize: 13, marginTop: 6 }}>
              Manage your biometric data and face login settings
            </p>
          </div>

          {/* Status card */}
          <motion.div
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            style={{
              background: status === 'enrolled'
                ? 'rgba(0,255,136,0.06)'
                : 'rgba(255,34,0,0.06)',
              border: `1px solid ${status === 'enrolled' ? 'rgba(0,255,136,0.3)' : 'rgba(255,34,0,0.3)'}`,
              borderRadius: 12, padding: 20, marginBottom: 24,
            }}
          >
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <div>
                <div style={{ color: status === 'enrolled' ? '#00FF88' : '#FF2200', fontSize: 13, fontWeight: 700, letterSpacing: 2 }}>
                  {status === 'enrolled' ? '● FACE LOGIN ACTIVE' : '○ FACE LOGIN DISABLED'}
                </div>
                {status === 'enrolled' && (
                  <>
                    <div style={{ color: '#555', fontSize: 12, marginTop: 6 }}>
                      Last scanned: <span style={{ color: '#888' }}>{lastScan}</span>
                    </div>
                    <div style={{ color: '#555', fontSize: 12, marginTop: 2 }}>
                      Quality score: <span style={{ color: qualityScore >= 90 ? '#00FF88' : '#FF9500' }}>{qualityScore}/100</span>
                    </div>
                  </>
                )}
              </div>
              <div style={{ fontSize: 36 }}>
                {status === 'enrolled' ? '🔐' : '🔓'}
              </div>
            </div>
          </motion.div>

          {/* Action notification */}
          <AnimatePresence>
            {actionDone && (
              <motion.div
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                style={{
                  background: 'rgba(0,255,136,0.1)', border: '1px solid rgba(0,255,136,0.3)',
                  borderRadius: 8, padding: '10px 16px', marginBottom: 20,
                  color: '#00FF88', fontSize: 13,
                }}
              >
                ✓ {actionDone}
              </motion.div>
            )}
          </AnimatePresence>

          {/* Action buttons */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: 12, marginBottom: 32 }}>
            <motion.button
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              onClick={() => router.push('/face-scan')}
              style={{
                padding: '13px 20px', background: 'linear-gradient(135deg,#00FFFF,#AA2DFF)',
                border: 'none', borderRadius: 10, color: '#fff',
                fontSize: 13, fontWeight: 700, letterSpacing: 2, cursor: 'pointer', textAlign: 'left',
              }}
            >
              🔄 RE-ENROLL FACE
              <div style={{ fontSize: 11, fontWeight: 400, opacity: 0.8, marginTop: 2 }}>
                Rescan to improve accuracy or update your face data
              </div>
            </motion.button>

            {status === 'enrolled' && (
              <motion.button
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                onClick={() => setConfirm('revoke')}
                style={{
                  padding: '13px 20px',
                  background: 'rgba(255,149,0,0.1)', border: '1px solid rgba(255,149,0,0.4)',
                  borderRadius: 10, color: '#FF9500',
                  fontSize: 13, fontWeight: 700, letterSpacing: 2, cursor: 'pointer', textAlign: 'left',
                }}
              >
                ⚠️ DISABLE FACE LOGIN
                <div style={{ fontSize: 11, fontWeight: 400, opacity: 0.8, marginTop: 2 }}>
                  Keep face data stored but disable biometric login
                </div>
              </motion.button>
            )}

            <motion.button
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              onClick={() => setConfirm('delete')}
              style={{
                padding: '13px 20px',
                background: 'rgba(255,34,0,0.08)', border: '1px solid rgba(255,34,0,0.3)',
                borderRadius: 10, color: '#FF2200',
                fontSize: 13, fontWeight: 700, letterSpacing: 2, cursor: 'pointer', textAlign: 'left',
              }}
            >
              🗑 DELETE ALL FACE DATA
              <div style={{ fontSize: 11, fontWeight: 400, opacity: 0.8, marginTop: 2 }}>
                Permanently removes all biometric data from our servers
              </div>
            </motion.button>
          </div>

          {/* Privacy notice */}
          <div style={{
            background: 'rgba(255,255,255,0.02)', border: '1px solid #1a1a1a',
            borderRadius: 10, padding: 16,
          }}>
            <h3 style={{ color: '#444', fontSize: 11, letterSpacing: 3, margin: '0 0 10px' }}>
              PRIVACY & DATA NOTICE
            </h3>
            {[
              'Your face data is encrypted and stored as a mathematical model — never as a photo.',
              'Raw face images are discarded immediately after processing.',
              'Face data is never shared with third parties or advertisers.',
              'You can delete your face data at any time under your rights.',
              'Compliant with GDPR, CCPA, and BIPA biometric privacy regulations.',
            ].map((point, i) => (
              <div key={i} style={{ color: '#444', fontSize: 12, marginBottom: 6, display: 'flex', gap: 8 }}>
                <span style={{ color: '#2a2a2a' }}>•</span>
                <span>{point}</span>
              </div>
            ))}
          </div>

          {/* Confirm modals */}
          <AnimatePresence>
            {confirm && (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                style={{
                  position: 'fixed', inset: 0, background: 'rgba(5,5,16,0.9)',
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  zIndex: 1000, padding: 20,
                }}
              >
                <motion.div
                  initial={{ scale: 0.9, opacity: 0 }}
                  animate={{ scale: 1, opacity: 1 }}
                  exit={{ scale: 0.9, opacity: 0 }}
                  style={{
                    background: '#0a0a20', border: `1px solid ${confirm === 'delete' ? '#FF2200' : '#FF9500'}`,
                    borderRadius: 14, padding: 28, maxWidth: 380, width: '100%',
                  }}
                >
                  <h3 style={{
                    color: confirm === 'delete' ? '#FF2200' : '#FF9500',
                    fontSize: 16, fontWeight: 800, letterSpacing: 2, marginBottom: 12,
                  }}>
                    {confirm === 'delete' ? 'DELETE FACE DATA?' : 'DISABLE FACE LOGIN?'}
                  </h3>
                  <p style={{ color: '#888', fontSize: 13, lineHeight: 1.6, marginBottom: 20 }}>
                    {confirm === 'delete'
                      ? 'This permanently removes all your biometric data from our servers. This action cannot be undone. You will need to re-enroll your face to use biometric features again.'
                      : 'Face login will be disabled. Your face data remains stored so you can re-enable it without re-scanning. You can still log in with your password.'}
                  </p>
                  <div style={{ display: 'flex', gap: 12 }}>
                    <motion.button
                      whileHover={{ scale: 1.04 }}
                      whileTap={{ scale: 0.96 }}
                      onClick={confirm === 'delete' ? handleDelete : handleRevoke}
                      style={{
                        flex: 1, padding: '11px 0',
                        background: confirm === 'delete' ? '#FF2200' : '#FF9500',
                        border: 'none', borderRadius: 8, color: '#fff',
                        fontSize: 13, fontWeight: 700, cursor: 'pointer',
                      }}
                    >
                      CONFIRM
                    </motion.button>
                    <motion.button
                      whileHover={{ scale: 1.04 }}
                      whileTap={{ scale: 0.96 }}
                      onClick={() => setConfirm(null)}
                      style={{
                        flex: 1, padding: '11px 0',
                        background: 'transparent', border: '1px solid #333',
                        borderRadius: 8, color: '#666',
                        fontSize: 13, fontWeight: 700, cursor: 'pointer',
                      }}
                    >
                      CANCEL
                    </motion.button>
                  </div>
                </motion.div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </HUDFrame>
      <FooterHUD />
    </PageShell>
  );
}
