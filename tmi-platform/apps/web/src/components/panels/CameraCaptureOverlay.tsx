'use client';

/**
 * CameraCaptureOverlay — the dock's dedicated Camera button. Separate from
 * Go Live on purpose (per direction 2026-07-22): Go Live means "broadcast
 * now," Camera means "capture a memory." Take a real photo with the device
 * camera (or upload one) and save it to the real Memory Wall via
 * /api/memory/capture — reuses the same getUserMedia/canvas-snapshot
 * pattern already proven in the onboarding flows.
 *
 * Video capture isn't wired here: /api/memory/capture (MemoryCaptureEngine)
 * only accepts an image today, no video field exists yet on that API. Photo
 * only until that's extended — not stubbing a fake "record video" button.
 */

import { useState, useRef, useCallback, useEffect } from 'react';

export interface CameraCaptureOverlayProps {
  isOpen: boolean;
  onClose: () => void;
}

type Mode = 'choice' | 'camera' | 'preview';
type SaveState = 'idle' | 'saving' | 'saved' | 'error';

export default function CameraCaptureOverlay({ isOpen, onClose }: CameraCaptureOverlayProps) {
  const [userId, setUserId] = useState<string | null>(null);

  useEffect(() => {
    if (!isOpen || userId) return;
    fetch('/api/auth/session', { cache: 'no-store', credentials: 'include' })
      .then((r) => r.json())
      .then((data) => { if (data?.user?.id) setUserId(data.user.id); })
      .catch(() => {});
  }, [isOpen, userId]);
  const [mode, setMode] = useState<Mode>('choice');
  const [imageSrc, setImageSrc] = useState<string | null>(null);
  const [caption, setCaption] = useState('');
  const [saveState, setSaveState] = useState<SaveState>('idle');
  const [error, setError] = useState('');

  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [stream, setStream] = useState<MediaStream | null>(null);

  const reset = useCallback(() => {
    if (stream) stream.getTracks().forEach((t) => t.stop());
    setStream(null);
    setMode('choice');
    setImageSrc(null);
    setCaption('');
    setSaveState('idle');
    setError('');
  }, [stream]);

  const handleClose = useCallback(() => {
    reset();
    onClose();
  }, [reset, onClose]);

  const startCamera = async () => {
    try {
      const mediaStream = await navigator.mediaDevices.getUserMedia({ video: { facingMode: 'user' } });
      setStream(mediaStream);
      setMode('camera');
      setError('');
      // Attach on next tick once the <video> element is mounted (mode change re-render).
      setTimeout(() => {
        if (videoRef.current) videoRef.current.srcObject = mediaStream;
      }, 0);
    } catch {
      setError('Could not access camera. Try uploading a photo instead.');
    }
  };

  const stopCamera = () => {
    if (stream) stream.getTracks().forEach((t) => t.stop());
    setStream(null);
  };

  const snapPhoto = () => {
    if (!videoRef.current) return;
    const video = videoRef.current;
    const canvas = canvasRef.current || document.createElement('canvas');
    const ctx = canvas.getContext('2d');
    if (!ctx) return;
    canvas.width = video.videoWidth || 640;
    canvas.height = video.videoHeight || 480;
    ctx.translate(canvas.width, 0);
    ctx.scale(-1, 1);
    ctx.drawImage(video, 0, 0, canvas.width, canvas.height);
    setImageSrc(canvas.toDataURL('image/jpeg', 0.85));
    stopCamera();
    setMode('preview');
  };

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (ev) => {
      if (ev.target?.result) {
        setImageSrc(ev.target.result as string);
        setMode('preview');
      }
    };
    reader.readAsDataURL(file);
  };

  const handleSave = async () => {
    if (!imageSrc || !userId) return;
    setSaveState('saving');
    try {
      const res = await fetch('/api/memory/capture', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          userId,
          imageData: imageSrc,
          captureType: 'group_photo',
          roomLabel: caption || undefined,
        }),
      });
      const data = await res.json();
      if (data.success) {
        setSaveState('saved');
        setTimeout(handleClose, 1400);
      } else {
        setSaveState('error');
      }
    } catch {
      setSaveState('error');
    }
  };

  if (!isOpen) return null;

  return (
    <div
      style={{
        position: 'fixed',
        left: 140,
        bottom: 110,
        zIndex: 9500,
        width: 320,
        background: 'rgba(10, 10, 26, 0.95)',
        backdropFilter: 'blur(20px)',
        border: '1px solid rgba(255, 45, 170, 0.35)',
        borderRadius: 16,
        padding: 18,
        boxShadow: '0 10px 40px rgba(0, 0, 0, 0.8), 0 0 30px rgba(255, 45, 170, 0.2)',
        fontFamily: "'Inter', sans-serif",
        color: '#fff',
      }}
    >
      <canvas ref={canvasRef} style={{ display: 'none' }} />

      {/* Header */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 14 }}>
        <h3 style={{ fontSize: 13, fontWeight: 900, letterSpacing: '0.12em', color: '#fff', margin: 0 }}>
          📷 CAMERA
        </h3>
        <button
          onClick={handleClose}
          style={{ background: 'rgba(255,255,255,0.06)', border: '1px solid rgba(255,255,255,0.12)', color: '#fff', borderRadius: 6, width: 26, height: 26, cursor: 'pointer', fontSize: 12 }}
        >
          ✕
        </button>
      </div>

      {mode === 'choice' && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
          <button onClick={startCamera} style={choiceButtonStyle}>📸 Take Photo</button>
          <button onClick={() => fileInputRef.current?.click()} style={{ ...choiceButtonStyle, background: 'rgba(255,45,170,0.15)', border: '1px solid #FF2DAA' }}>
            🖼 Upload From Device
          </button>
          <input type="file" ref={fileInputRef} accept="image/*" onChange={handleFileSelect} style={{ display: 'none' }} />
          {error && <p style={{ fontSize: 11, color: '#fbbf24', margin: 0 }}>{error}</p>}
        </div>
      )}

      {mode === 'camera' && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 10, alignItems: 'center' }}>
          <div style={{ width: '100%', aspectRatio: '1/1', borderRadius: 12, overflow: 'hidden', border: '2px solid #FF2DAA' }}>
            <video ref={videoRef} autoPlay playsInline style={{ width: '100%', height: '100%', objectFit: 'cover', transform: 'scaleX(-1)' }} />
          </div>
          <div style={{ display: 'flex', gap: 8 }}>
            <button onClick={snapPhoto} style={choiceButtonStyle}>📸 Snap</button>
            <button onClick={() => { stopCamera(); setMode('choice'); }} style={{ ...choiceButtonStyle, background: 'rgba(255,255,255,0.05)' }}>Cancel</button>
          </div>
        </div>
      )}

      {mode === 'preview' && imageSrc && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 10, alignItems: 'center' }}>
          <div style={{ width: '100%', aspectRatio: '1/1', borderRadius: 12, overflow: 'hidden', border: '2px solid #FF2DAA' }}>
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src={imageSrc} alt="Capture preview" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
          </div>
          <input
            type="text"
            value={caption}
            onChange={(e) => setCaption(e.target.value)}
            placeholder="Add a caption (optional)"
            style={{ width: '100%', padding: '8px 12px', background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.15)', borderRadius: 8, color: '#fff', fontSize: 12, outline: 'none', boxSizing: 'border-box' }}
          />
          {saveState === 'error' && <p style={{ fontSize: 11, color: '#FF6B6B', margin: 0 }}>Failed to save — try again.</p>}
          <div style={{ display: 'flex', gap: 8, width: '100%' }}>
            <button onClick={() => { setImageSrc(null); setMode('choice'); }} style={{ ...choiceButtonStyle, flex: 1, background: 'rgba(255,255,255,0.05)' }}>Retake</button>
            <button
              onClick={handleSave}
              disabled={saveState === 'saving' || saveState === 'saved' || !userId}
              style={{ ...choiceButtonStyle, flex: 1, opacity: saveState === 'saving' || !userId ? 0.6 : 1 }}
            >
              {!userId ? 'Loading…' : saveState === 'saving' ? '⌛ Saving…' : saveState === 'saved' ? '✅ Saved!' : '🖼 Save to Memory Wall'}
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

const choiceButtonStyle: React.CSSProperties = {
  padding: '12px 16px',
  borderRadius: 10,
  border: 'none',
  background: 'linear-gradient(135deg, #FF2DAA, #AA2DFF)',
  color: '#fff',
  fontSize: 12,
  fontWeight: 800,
  letterSpacing: '0.04em',
  cursor: 'pointer',
  textAlign: 'center',
};
