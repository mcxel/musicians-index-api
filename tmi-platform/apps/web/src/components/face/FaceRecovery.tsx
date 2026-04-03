"use client";
import { useState, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import FaceScanner from '@/components/face/FaceScanner';
import {
  checkFaceRecoveryEligibility,
  recoverAccountWithFace,
  resetPasswordWithRecoveryToken,
} from '@/lib/security/faceRecoveryEngine';
import type { FaceScanResult } from '@/lib/face/faceScanEngine';

interface FaceRecoveryProps {
  onSuccess?: () => void;
  onCancel?: () => void;
}

type Step = 'email' | 'scan' | 'newpassword' | 'done' | 'error';

export default function FaceRecovery({ onSuccess, onCancel }: FaceRecoveryProps) {
  const [step, setStep] = useState<Step>('email');
  const [email, setEmail] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [recoveryToken, setRecoveryToken] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleEmailSubmit = useCallback(async () => {
    if (!email.trim()) { setError('Email required'); return; }
    setLoading(true);
    setError('');
    const eligibility = await checkFaceRecoveryEligibility(email.trim());
    setLoading(false);
    if (!eligibility.eligible) {
      setError(eligibility.reason ?? 'Face recovery not available for this account');
      return;
    }
    if (!eligibility.hasEnrolledFace) {
      setError('No face data enrolled on this account. Use email recovery instead.');
      return;
    }
    setStep('scan');
  }, [email]);

  const handleScanComplete = useCallback(async (result: FaceScanResult) => {
    if (result.status !== 'success' || !result.faceToken) {
      setError('Face scan failed');
      setStep('error');
      return;
    }
    setLoading(true);
    const recovery = await recoverAccountWithFace(email, result.faceToken);
    setLoading(false);
    if (!recovery.success) {
      setError(recovery.error ?? 'Recovery failed');
      setStep('error');
      return;
    }
    setRecoveryToken(recovery.recoveryToken!);
    setStep('newpassword');
  }, [email]);

  const handlePasswordReset = useCallback(async () => {
    if (newPassword.length < 8) { setError('Password must be at least 8 characters'); return; }
    if (newPassword !== confirmPassword) { setError('Passwords do not match'); return; }
    setLoading(true);
    setError('');
    const result = await resetPasswordWithRecoveryToken(recoveryToken, newPassword);
    setLoading(false);
    if (!result.success) { setError(result.error ?? 'Reset failed'); return; }
    setStep('done');
    setTimeout(() => onSuccess?.(), 1500);
  }, [newPassword, confirmPassword, recoveryToken, onSuccess]);

  const inputStyle: React.CSSProperties = {
    width: '100%', padding: '12px 16px',
    background: '#0A0A1A', border: '1px solid #333',
    borderRadius: 8, color: '#FFF', fontSize: 14,
    outline: 'none', boxSizing: 'border-box',
  };

  return (
    <div style={{
      minHeight: '100vh', background: '#050510',
      display: 'flex', flexDirection: 'column',
      alignItems: 'center', justifyContent: 'center',
      padding: 24, gap: 20,
    }}>
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        style={{ textAlign: 'center' }}
      >
        <div style={{ fontSize: 36, marginBottom: 8 }}>🔑</div>
        <h2 style={{ color: '#FFD700', fontSize: 22, fontWeight: 700, margin: 0, letterSpacing: 2 }}>
          ACCOUNT RECOVERY
        </h2>
        <p style={{ color: '#888', fontSize: 13, margin: '6px 0 0' }}>
          Recover access using your enrolled face
        </p>
      </motion.div>

      {/* Step progress */}
      <div style={{ display: 'flex', gap: 8 }}>
        {(['email', 'scan', 'newpassword', 'done'] as Step[]).map((s, i) => (
          <div key={s} style={{
            width: 32, height: 4, borderRadius: 2,
            background: ['email', 'scan', 'newpassword', 'done'].indexOf(step) >= i
              ? '#FFD700' : '#222',
            transition: 'background 0.3s',
          }} />
        ))}
      </div>

      <AnimatePresence mode="wait">
        {step === 'email' && (
          <motion.div key="email"
            initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }}
            style={{ width: '100%', maxWidth: 400, display: 'flex', flexDirection: 'column', gap: 14 }}
          >
            <label style={{ color: '#AAA', fontSize: 12, letterSpacing: 1 }}>YOUR EMAIL</label>
            <input
              type="email"
              value={email}
              onChange={e => setEmail(e.target.value)}
              onKeyDown={e => e.key === 'Enter' && handleEmailSubmit()}
              placeholder="you@example.com"
              style={inputStyle}
            />
            {error && <span style={{ color: '#FF4444', fontSize: 13 }}>{error}</span>}
            <motion.button
              whileHover={{ scale: 1.03 }}
              whileTap={{ scale: 0.97 }}
              onClick={handleEmailSubmit}
              disabled={loading}
              style={{
                padding: '12px', background: '#FFD700', border: 'none', borderRadius: 8,
                color: '#050510', fontWeight: 700, cursor: 'pointer', fontSize: 14,
              }}
            >{loading ? 'CHECKING...' : 'CONTINUE →'}</motion.button>
          </motion.div>
        )}

        {step === 'scan' && (
          <motion.div key="scan"
            initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0 }}
          >
            <FaceScanner
              options={{ purpose: 'recovery', userId: email, saveModel: false }}
              onComplete={handleScanComplete}
              onCancel={() => setStep('email')}
            />
          </motion.div>
        )}

        {step === 'newpassword' && (
          <motion.div key="newpw"
            initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }}
            style={{ width: '100%', maxWidth: 400, display: 'flex', flexDirection: 'column', gap: 14 }}
          >
            <div style={{ color: '#00FF88', fontSize: 13, textAlign: 'center' }}>
              ✅ Face verified — set your new password
            </div>
            <label style={{ color: '#AAA', fontSize: 12, letterSpacing: 1 }}>NEW PASSWORD</label>
            <input
              type="password"
              value={newPassword}
              onChange={e => setNewPassword(e.target.value)}
              placeholder="Min. 8 characters"
              style={inputStyle}
            />
            <label style={{ color: '#AAA', fontSize: 12, letterSpacing: 1 }}>CONFIRM PASSWORD</label>
            <input
              type="password"
              value={confirmPassword}
              onChange={e => setConfirmPassword(e.target.value)}
              onKeyDown={e => e.key === 'Enter' && handlePasswordReset()}
              placeholder="Repeat password"
              style={inputStyle}
            />
            {error && <span style={{ color: '#FF4444', fontSize: 13 }}>{error}</span>}
            <motion.button
              whileHover={{ scale: 1.03 }}
              whileTap={{ scale: 0.97 }}
              onClick={handlePasswordReset}
              disabled={loading}
              style={{
                padding: '12px', background: '#00FF88', border: 'none', borderRadius: 8,
                color: '#050510', fontWeight: 700, cursor: 'pointer', fontSize: 14,
              }}
            >{loading ? 'SAVING...' : 'SET NEW PASSWORD'}</motion.button>
          </motion.div>
        )}

        {step === 'done' && (
          <motion.div key="done"
            initial={{ opacity: 0, scale: 0.8 }} animate={{ opacity: 1, scale: 1 }}
            style={{ textAlign: 'center', padding: 40 }}
          >
            <div style={{ fontSize: 64, marginBottom: 16 }}>🎉</div>
            <div style={{ color: '#00FF88', fontWeight: 700, fontSize: 18, letterSpacing: 2 }}>
              PASSWORD RESET!
            </div>
            <p style={{ color: '#888', fontSize: 13, marginTop: 8 }}>Redirecting to login...</p>
          </motion.div>
        )}

        {step === 'error' && (
          <motion.div key="err"
            initial={{ opacity: 0 }} animate={{ opacity: 1 }}
            style={{
              textAlign: 'center', padding: 32,
              background: '#100000', border: '1px solid #FF444433',
              borderRadius: 12, maxWidth: 380,
            }}
          >
            <div style={{ fontSize: 40, marginBottom: 12 }}>⚠️</div>
            <p style={{ color: '#FF4444', marginBottom: 16, fontSize: 14 }}>{error}</p>
            <motion.button
              whileHover={{ scale: 1.04 }} whileTap={{ scale: 0.97 }}
              onClick={() => { setStep('email'); setError(''); }}
              style={{
                padding: '10px 24px',
                background: '#FFD700', border: 'none', borderRadius: 8,
                color: '#050510', fontWeight: 700, cursor: 'pointer',
              }}
            >START OVER</motion.button>
          </motion.div>
        )}
      </AnimatePresence>

      {onCancel && step !== 'done' && (
        <motion.button
          whileHover={{ color: '#FFD700' }}
          onClick={onCancel}
          style={{ background: 'none', border: 'none', color: '#666', cursor: 'pointer', fontSize: 13 }}
        >← Back to login</motion.button>
      )}
    </div>
  );
}
