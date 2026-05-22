'use client';
import { useEffect, useRef, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

type WebRTCVideoCaptureProps = {
  roomId: string;
  displayName: string;
  autoJoin?: boolean;
  onJoined?: () => void;
  onLeft?: () => void;
  style?: React.CSSProperties;
};

type MediaState = 'idle' | 'requesting' | 'live' | 'error' | 'denied';

export default function WebRTCVideoCapture({
  roomId, displayName, autoJoin = false, onJoined, onLeft, style,
}: WebRTCVideoCaptureProps) {
  const videoRef = useRef<HTMLVideoElement>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const [state, setState] = useState<MediaState>('idle');
  const [micOn, setMicOn] = useState(true);
  const [camOn, setCamOn] = useState(true);
  const [errorMsg, setErrorMsg] = useState('');

  async function startCapture() {
    setState('requesting');
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ video: { facingMode: 'user', width: { ideal: 1280 }, height: { ideal: 720 } }, audio: true });
      streamRef.current = stream;
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
        await videoRef.current.play().catch(() => {});
      }
      setState('live');
      onJoined?.();
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : String(err);
      if (msg.includes('Permission denied') || msg.includes('NotAllowed')) {
        setState('denied');
        setErrorMsg('Camera/mic access denied. Allow in browser settings.');
      } else {
        setState('error');
        setErrorMsg(msg);
      }
    }
  }

  function stopCapture() {
    streamRef.current?.getTracks().forEach((t) => t.stop());
    streamRef.current = null;
    if (videoRef.current) videoRef.current.srcObject = null;
    setState('idle');
    onLeft?.();
  }

  function toggleMic() {
    const track = streamRef.current?.getAudioTracks()[0];
    if (track) { track.enabled = !micOn; setMicOn((v) => !v); }
  }

  function toggleCam() {
    const track = streamRef.current?.getVideoTracks()[0];
    if (track) { track.enabled = !camOn; setCamOn((v) => !v); }
  }

  useEffect(() => {
    if (autoJoin) void startCapture();
    return () => { streamRef.current?.getTracks().forEach((t) => t.stop()); };
  }, [autoJoin]);

  return (
    <div style={{ position: 'relative', borderRadius: 12, overflow: 'hidden', background: '#0a0a1a', border: '1px solid rgba(0,255,255,0.25)', ...style }}>
      {/* Video element */}
      <video
        ref={videoRef}
        muted
        playsInline
        style={{ width: '100%', display: state === 'live' ? 'block' : 'none', borderRadius: 12, background: '#000' }}
      />

      {/* Not-live placeholder */}
      {state !== 'live' && (
        <div style={{ aspectRatio: '16/9', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: 12, padding: 24 }}>
          <div style={{ fontSize: 36 }}>{state === 'denied' ? '🚫' : state === 'error' ? '⚠️' : state === 'requesting' ? '📡' : '📷'}</div>
          <div style={{ fontSize: 13, color: state === 'error' || state === 'denied' ? '#FF3B5C' : '#fff', textAlign: 'center' }}>
            {state === 'requesting' ? 'Requesting camera access...' : state === 'denied' ? errorMsg : state === 'error' ? errorMsg : `Room: ${roomId}`}
          </div>
          {(state === 'idle' || state === 'denied' || state === 'error') && (
            <button onClick={() => void startCapture()} style={{ padding: '10px 22px', background: '#00FFFF', color: '#000', border: 'none', borderRadius: 8, fontWeight: 800, fontSize: 13, cursor: 'pointer' }}>
              {state === 'idle' ? 'Join Live' : 'Retry'}
            </button>
          )}
        </div>
      )}

      {/* Live controls overlay */}
      {state === 'live' && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          style={{ position: 'absolute', bottom: 0, left: 0, right: 0, padding: '32px 16px 12px', background: 'linear-gradient(transparent, rgba(0,0,0,0.8))' }}
        >
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
            <div style={{ display: 'flex', gap: 8 }}>
              <button onClick={toggleMic} title={micOn ? 'Mute' : 'Unmute'} style={{ width: 36, height: 36, borderRadius: '50%', background: micOn ? 'rgba(0,255,136,0.25)' : 'rgba(255,59,92,0.4)', border: `1px solid ${micOn ? '#00FF88' : '#FF3B5C'}`, color: '#fff', cursor: 'pointer', fontSize: 14 }}>
                {micOn ? '🎤' : '🔇'}
              </button>
              <button onClick={toggleCam} title={camOn ? 'Hide cam' : 'Show cam'} style={{ width: 36, height: 36, borderRadius: '50%', background: camOn ? 'rgba(0,255,136,0.25)' : 'rgba(255,59,92,0.4)', border: `1px solid ${camOn ? '#00FF88' : '#FF3B5C'}`, color: '#fff', cursor: 'pointer', fontSize: 14 }}>
                {camOn ? '📹' : '📷'}
              </button>
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
              <motion.div animate={{ opacity: [1, 0.2, 1] }} transition={{ duration: 1.2, repeat: Infinity }} style={{ width: 8, height: 8, borderRadius: '50%', background: '#FF3B5C' }} />
              <span style={{ fontSize: 11, color: '#fff', fontWeight: 800 }}>LIVE</span>
              <span style={{ fontSize: 10, color: 'rgba(255,255,255,0.55)' }}>{displayName}</span>
            </div>
            <button onClick={stopCapture} style={{ padding: '6px 14px', background: 'rgba(255,59,92,0.3)', color: '#FF3B5C', border: '1px solid rgba(255,59,92,0.5)', borderRadius: 6, fontWeight: 800, fontSize: 11, cursor: 'pointer' }}>
              END
            </button>
          </div>
        </motion.div>
      )}
    </div>
  );
}
