"use client";
import { useRef, useState, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { captureFrameFromVideo, processFaceScan } from '@/lib/face/faceScanEngine';
import type { FaceScanOptions, FaceScanResult } from '@/lib/face/faceScanEngine';

interface FaceScannerProps {
  options: FaceScanOptions;
  onComplete: (result: FaceScanResult) => void;
  onCancel?: () => void;
}

const SCAN_LINE_COLORS = ['#00FFFF', '#FF2DAA', '#AA2DFF'];

export default function FaceScanner({ options, onComplete, onCancel }: FaceScannerProps) {
  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const [phase, setPhase] = useState<'init' | 'scanning' | 'processing' | 'done' | 'error'>('init');
  const [error, setError] = useState('');
  const [progress, setProgress] = useState(0);
  const [scanLineY, setScanLineY] = useState(0);
  const [colorIdx, setColorIdx] = useState(0);
  const [detected, setDetected] = useState(false);

  // Animate scan line
  useEffect(() => {
    if (phase !== 'scanning') return;
    let dir = 1;
    let y = 0;
    const id = setInterval(() => {
      y += dir * 3;
      if (y >= 100) dir = -1;
      if (y <= 0) dir = 1;
      setScanLineY(y);
    }, 20);
    const cid = setInterval(() => setColorIdx(i => (i + 1) % SCAN_LINE_COLORS.length), 600);
    const pid = setInterval(() => {
      setProgress(p => {
        if (p >= 90) { setDetected(true); clearInterval(pid); return 90; }
        return p + Math.random() * 8;
      });
    }, 200);
    return () => { clearInterval(id); clearInterval(cid); clearInterval(pid); };
  }, [phase]);

  const startCamera = useCallback(async () => {
    setPhase('init');
    setError('');
    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        video: { width: 640, height: 480, facingMode: 'user' },
      });
      streamRef.current = stream;
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
        await videoRef.current.play();
      }
      setPhase('scanning');
    } catch (e) {
      setError('Camera access denied. Please allow camera to scan your face.');
      setPhase('error');
    }
  }, []);

  useEffect(() => {
    startCamera();
    return () => { streamRef.current?.getTracks().forEach(t => t.stop()); };
  }, [startCamera]);

  const handleCapture = useCallback(async () => {
    if (!videoRef.current || !canvasRef.current) return;
    setPhase('processing');
    setProgress(90);

    const frame = captureFrameFromVideo(videoRef.current, canvasRef.current);
    if (!frame) {
      setError('Frame capture failed. Try again.');
      setPhase('error');
      return;
    }

    // Stop camera
    streamRef.current?.getTracks().forEach(t => t.stop());

    const result = await processFaceScan(frame, options);
    setProgress(100);
    setPhase('done');
    setTimeout(() => onComplete(result), 600);
  }, [options, onComplete]);

  const purposeLabel: Record<string, string> = {
    registration: 'FACE ENROLLMENT',
    login:        'FACE LOGIN',
    recovery:     'ACCOUNT RECOVERY',
    avatar:       'AVATAR GENERATION',
  };

  return (
    <div style={{
      position: 'relative',
      width: '100%', maxWidth: 480,
      margin: '0 auto',
      background: '#050510',
      border: `2px solid ${SCAN_LINE_COLORS[colorIdx]}`,
      borderRadius: 16,
      overflow: 'hidden',
      boxShadow: `0 0 40px ${SCAN_LINE_COLORS[colorIdx]}55`,
    }}>
      {/* Header */}
      <div style={{
        padding: '12px 20px',
        borderBottom: `1px solid ${SCAN_LINE_COLORS[colorIdx]}44`,
        display: 'flex', justifyContent: 'space-between', alignItems: 'center',
      }}>
        <span style={{ color: SCAN_LINE_COLORS[colorIdx], fontWeight: 700, fontSize: 13, letterSpacing: 2 }}>
          {purposeLabel[options.purpose] ?? 'FACE SCAN'}
        </span>
        <AnimatePresence>
          {phase === 'scanning' && (
            <motion.span
              animate={{ opacity: [1, 0.3, 1] }}
              transition={{ repeat: Infinity, duration: 1.2 }}
              style={{ color: '#00FF88', fontSize: 11, letterSpacing: 1 }}
            >● LIVE</motion.span>
          )}
        </AnimatePresence>
      </div>

      {/* Camera view */}
      <div style={{ position: 'relative', width: '100%', aspectRatio: '4/3', background: '#000' }}>
        <video ref={videoRef} muted playsInline style={{
          width: '100%', height: '100%', objectFit: 'cover', display: 'block',
          transform: 'scaleX(-1)', // mirror effect
        }} />
        <canvas ref={canvasRef} style={{ display: 'none' }} />

        {/* Face oval overlay */}
        {phase === 'scanning' && (
          <div style={{
            position: 'absolute', inset: 0,
            display: 'flex', alignItems: 'center', justifyContent: 'center',
          }}>
            <div style={{
              width: '55%', aspectRatio: '3/4',
              border: `3px solid ${detected ? '#00FF88' : SCAN_LINE_COLORS[colorIdx]}`,
              borderRadius: '50%',
              boxShadow: `0 0 20px ${detected ? '#00FF88' : SCAN_LINE_COLORS[colorIdx]}88`,
              transition: 'border-color 0.4s, box-shadow 0.4s',
            }} />
          </div>
        )}

        {/* Scan line */}
        {phase === 'scanning' && (
          <motion.div style={{
            position: 'absolute', left: 0, right: 0,
            height: 2,
            background: `linear-gradient(to right, transparent, ${SCAN_LINE_COLORS[colorIdx]}, transparent)`,
            top: `${scanLineY}%`,
            opacity: 0.8,
          }} />
        )}

        {/* Processing overlay */}
        <AnimatePresence>
          {phase === 'processing' && (
            <motion.div
              initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
              style={{
                position: 'absolute', inset: 0,
                background: 'rgba(5,5,16,0.85)',
                display: 'flex', flexDirection: 'column',
                alignItems: 'center', justifyContent: 'center', gap: 16,
              }}
            >
              <motion.div
                animate={{ rotate: 360 }}
                transition={{ repeat: Infinity, duration: 1, ease: 'linear' }}
                style={{
                  width: 56, height: 56,
                  border: `3px solid #00FFFF44`,
                  borderTop: `3px solid #00FFFF`,
                  borderRadius: '50%',
                }}
              />
              <span style={{ color: '#00FFFF', fontSize: 13, letterSpacing: 2 }}>PROCESSING FACE...</span>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Done overlay */}
        <AnimatePresence>
          {phase === 'done' && (
            <motion.div
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              style={{
                position: 'absolute', inset: 0,
                background: 'rgba(0,16,8,0.9)',
                display: 'flex', flexDirection: 'column',
                alignItems: 'center', justifyContent: 'center', gap: 12,
              }}
            >
              <div style={{ fontSize: 48 }}>✅</div>
              <span style={{ color: '#00FF88', fontWeight: 700, fontSize: 16, letterSpacing: 2 }}>FACE CAPTURED</span>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Error overlay */}
        <AnimatePresence>
          {phase === 'error' && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              style={{
                position: 'absolute', inset: 0,
                background: 'rgba(16,0,0,0.92)',
                display: 'flex', flexDirection: 'column',
                alignItems: 'center', justifyContent: 'center', gap: 14, padding: 24,
              }}
            >
              <div style={{ fontSize: 40 }}>⚠️</div>
              <span style={{ color: '#FF4444', textAlign: 'center', fontSize: 14 }}>{error}</span>
              <motion.button
                whileHover={{ scale: 1.04 }}
                whileTap={{ scale: 0.97 }}
                onClick={startCamera}
                style={{
                  marginTop: 8, padding: '10px 24px',
                  background: '#FF2200', border: 'none', borderRadius: 8,
                  color: '#FFF', fontWeight: 700, cursor: 'pointer',
                }}
              >RETRY</motion.button>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* Progress strip */}
      <div style={{ height: 4, background: '#0A0A1A' }}>
        <motion.div
          animate={{ width: `${progress}%` }}
          transition={{ duration: 0.4 }}
          style={{ height: '100%', background: detected ? '#00FF88' : SCAN_LINE_COLORS[colorIdx] }}
        />
      </div>

      {/* Footer controls */}
      <div style={{ padding: '14px 20px', display: 'flex', gap: 10, justifyContent: 'flex-end' }}>
        {onCancel && (
          <motion.button
            whileHover={{ scale: 1.03 }}
            whileTap={{ scale: 0.97 }}
            onClick={onCancel}
            style={{
              padding: '9px 20px', background: 'transparent',
              border: '1px solid #444', borderRadius: 8,
              color: '#888', cursor: 'pointer', fontSize: 13,
            }}
          >CANCEL</motion.button>
        )}
        {phase === 'scanning' && detected && (
          <motion.button
            initial={{ opacity: 0, y: 6 }}
            animate={{ opacity: 1, y: 0 }}
            whileHover={{ scale: 1.04 }}
            whileTap={{ scale: 0.97 }}
            onClick={handleCapture}
            style={{
              padding: '9px 24px',
              background: `linear-gradient(135deg, #00FFFF, #00FF88)`,
              border: 'none', borderRadius: 8,
              color: '#050510', fontWeight: 700, cursor: 'pointer', fontSize: 13,
            }}
          >CAPTURE</motion.button>
        )}
        {phase === 'scanning' && !detected && (
          <span style={{ color: '#888', fontSize: 12, lineHeight: '36px' }}>
            Align face in oval...
          </span>
        )}
      </div>
    </div>
  );
}
