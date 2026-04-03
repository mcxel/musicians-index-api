"use client";
import { useState, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import FaceScanner from '@/components/face/FaceScanner';
import { loginWithFace } from '@/lib/face/faceLoginEngine';
import type { FaceScanResult } from '@/lib/face/faceScanEngine';

interface FaceLoginProps {
  onSuccess: (userId: string, sessionToken: string) => void;
  onFallback?: () => void;  // redirect to password login
  onCancel?: () => void;
}

type Phase = 'scan' | 'authenticating' | 'success' | 'failed';

export default function FaceLogin({ onSuccess, onFallback, onCancel }: FaceLoginProps) {
  const [phase, setPhase] = useState<Phase>('scan');
  const [error, setError] = useState('');

  const handleScanComplete = useCallback(async (result: FaceScanResult) => {
    if (result.status !== 'success' || !result.faceToken) {
      setError('Face scan failed. Try again or use password.');
      setPhase('failed');
      return;
    }

    setPhase('authenticating');
    const loginResult = await loginWithFace(result.faceToken, {
      allowFallback: true,
      minConfidence: 0.82,
    });

    if (!loginResult.success) {
      setError(loginResult.error ?? 'Authentication failed');
      setPhase('failed');
      return;
    }

    setPhase('success');
    setTimeout(() => onSuccess(loginResult.userId!, loginResult.sessionToken!), 800);
  }, [onSuccess]);

  return (
    <div style={{
      minHeight: '100vh',
      background: '#050510',
      display: 'flex', flexDirection: 'column',
      alignItems: 'center', justifyContent: 'center',
      padding: 24, gap: 24,
    }}>
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        style={{ textAlign: 'center', marginBottom: 8 }}
      >
        <div style={{ fontSize: 36, marginBottom: 8 }}>🔐</div>
        <h2 style={{ color: '#00FFFF', fontSize: 22, fontWeight: 700, margin: 0, letterSpacing: 2 }}>
          FACE LOGIN
        </h2>
        <p style={{ color: '#888', fontSize: 13, margin: '6px 0 0' }}>
          Scan your face to sign in instantly
        </p>
      </motion.div>

      <AnimatePresence mode="wait">
        {phase === 'scan' && (
          <motion.div key="scan" initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0 }}>
            <FaceScanner
              options={{ purpose: 'login', saveModel: false }}
              onComplete={handleScanComplete}
              onCancel={onCancel}
            />
          </motion.div>
        )}

        {phase === 'authenticating' && (
          <motion.div
            key="auth"
            initial={{ opacity: 0 }} animate={{ opacity: 1 }}
            style={{
              textAlign: 'center', padding: 40, display: 'flex', flexDirection: 'column',
              alignItems: 'center', gap: 16,
            }}
          >
            <motion.div
              animate={{ rotate: 360 }}
              transition={{ repeat: Infinity, duration: 1, ease: 'linear' }}
              style={{
                width: 56, height: 56,
                border: '3px solid #00FFFF44',
                borderTop: '3px solid #00FFFF',
                borderRadius: '50%',
              }}
            />
            <span style={{ color: '#00FFFF', letterSpacing: 2, fontSize: 13 }}>AUTHENTICATING...</span>
          </motion.div>
        )}

        {phase === 'success' && (
          <motion.div
            key="success"
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            style={{ textAlign: 'center', padding: 40 }}
          >
            <div style={{ fontSize: 64, marginBottom: 16 }}>✅</div>
            <div style={{ color: '#00FF88', fontWeight: 700, fontSize: 18, letterSpacing: 2 }}>
              AUTHENTICATED
            </div>
          </motion.div>
        )}

        {phase === 'failed' && (
          <motion.div
            key="failed"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            style={{
              textAlign: 'center', padding: 24,
              background: '#100000',
              border: '1px solid #FF444433',
              borderRadius: 12, maxWidth: 380,
            }}
          >
            <div style={{ fontSize: 40, marginBottom: 12 }}>⚠️</div>
            <p style={{ color: '#FF4444', marginBottom: 16, fontSize: 14 }}>{error}</p>
            <div style={{ display: 'flex', gap: 10, justifyContent: 'center', flexWrap: 'wrap' }}>
              <motion.button
                whileHover={{ scale: 1.04 }}
                whileTap={{ scale: 0.97 }}
                onClick={() => { setPhase('scan'); setError(''); }}
                style={{
                  padding: '10px 20px',
                  background: '#00FFFF', border: 'none', borderRadius: 8,
                  color: '#050510', fontWeight: 700, cursor: 'pointer', fontSize: 13,
                }}
              >TRY AGAIN</motion.button>
              {onFallback && (
                <motion.button
                  whileHover={{ scale: 1.04 }}
                  whileTap={{ scale: 0.97 }}
                  onClick={onFallback}
                  style={{
                    padding: '10px 20px',
                    background: 'transparent',
                    border: '1px solid #888', borderRadius: 8,
                    color: '#AAA', cursor: 'pointer', fontSize: 13,
                  }}
                >USE PASSWORD</motion.button>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {phase === 'scan' && onFallback && (
        <motion.button
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          whileHover={{ color: '#00FFFF' }}
          onClick={onFallback}
          style={{
            background: 'none', border: 'none',
            color: '#666', cursor: 'pointer', fontSize: 13,
          }}
        >Use password instead →</motion.button>
      )}
    </div>
  );
}
