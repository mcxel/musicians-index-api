'use client';

import React, { useRef, useState, useEffect, useCallback } from 'react';

export type VideoResolution = 'sd' | 'hd' | 'fhd';

const RESOLUTIONS: Record<VideoResolution, { width: number; height: number; label: string }> = {
  sd:  { width: 640,  height: 480,  label: 'SD (640×480)' },
  hd:  { width: 1280, height: 720,  label: 'HD (1280×720)' },
  fhd: { width: 1920, height: 1080, label: 'Full HD (1920×1080)' },
};

export interface WebRTCCaptureProps {
  onStream?: (stream: MediaStream) => void;
  onError?: (msg: string) => void;
  autoStart?: boolean;
  accentColor?: string;
  showResolutionSelector?: boolean;
  showRecordingControls?: boolean;
}

type PermissionState = 'idle' | 'requesting' | 'granted' | 'denied' | 'unsupported';

function formatTime(seconds: number): string {
  const m = Math.floor(seconds / 60).toString().padStart(2, '0');
  const s = (seconds % 60).toString().padStart(2, '0');
  return `${m}:${s}`;
}

export default function WebRTCCapture({
  onStream,
  onError,
  autoStart = false,
  accentColor = '#00FFFF',
  showResolutionSelector = true,
  showRecordingControls = true,
}: WebRTCCaptureProps) {
  const videoRef      = useRef<HTMLVideoElement>(null);
  const recorderRef   = useRef<MediaRecorder | null>(null);
  const chunksRef     = useRef<Blob[]>([]);
  const timerRef      = useRef<ReturnType<typeof setInterval> | null>(null);

  const [stream,      setStream]      = useState<MediaStream | null>(null);
  const [permission,  setPermission]  = useState<PermissionState>('idle');
  const [muted,       setMuted]       = useState(false);
  const [cameraOn,    setCameraOn]    = useState(true);
  const [resolution,  setResolution]  = useState<VideoResolution>('hd');
  const [recording,   setRecording]   = useState(false);
  const [recSeconds,  setRecSeconds]  = useState(0);
  const [error,       setError]       = useState<string | null>(null);

  // Check browser support
  const isSupported = typeof navigator !== 'undefined' &&
    typeof navigator.mediaDevices !== 'undefined' &&
    typeof navigator.mediaDevices.getUserMedia === 'function';

  const stopStream = useCallback(() => {
    if (stream) {
      stream.getTracks().forEach((t) => t.stop());
      setStream(null);
      if (videoRef.current) videoRef.current.srcObject = null;
    }
  }, [stream]);

  const startCapture = useCallback(async (res: VideoResolution = resolution) => {
    if (!isSupported) {
      const msg = 'WebRTC is not supported in this browser.';
      setPermission('unsupported');
      setError(msg);
      onError?.(msg);
      return;
    }

    setPermission('requesting');
    setError(null);

    const { width, height } = RESOLUTIONS[res];

    try {
      const mediaStream = await navigator.mediaDevices.getUserMedia({
        video: { width: { ideal: width }, height: { ideal: height }, facingMode: 'user' },
        audio: true,
      });

      setStream(mediaStream);
      setPermission('granted');

      if (videoRef.current) {
        videoRef.current.srcObject = mediaStream;
        videoRef.current.muted = true; // prevent echo feedback
      }

      onStream?.(mediaStream);
    } catch (err: unknown) {
      const e = err as { name?: string; message?: string };
      let msg = 'Could not access camera/microphone.';
      if (e.name === 'NotAllowedError' || e.name === 'PermissionDeniedError') {
        msg = 'Camera/microphone access was denied. Please allow access in your browser settings and try again.';
        setPermission('denied');
      } else if (e.name === 'NotFoundError') {
        msg = 'No camera or microphone found on this device.';
        setPermission('denied');
      } else if (e.name === 'NotReadableError') {
        msg = 'Camera or microphone is in use by another application.';
        setPermission('denied');
      } else {
        setPermission('idle');
      }
      setError(msg);
      onError?.(msg);
    }
  }, [isSupported, resolution, onStream, onError]);

  // Auto-start
  useEffect(() => {
    if (autoStart) startCapture();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      stream?.getTracks().forEach((t) => t.stop());
      if (timerRef.current) clearInterval(timerRef.current);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const toggleMute = useCallback(() => {
    if (!stream) return;
    stream.getAudioTracks().forEach((t) => { t.enabled = muted; });
    setMuted((prev) => !prev);
  }, [stream, muted]);

  const toggleCamera = useCallback(() => {
    if (!stream) return;
    stream.getVideoTracks().forEach((t) => { t.enabled = !cameraOn; });
    setCameraOn((prev) => !prev);
  }, [stream, cameraOn]);

  const handleResolutionChange = useCallback((res: VideoResolution) => {
    setResolution(res);
    if (stream) {
      stopStream();
      setTimeout(() => startCapture(res), 200);
    }
  }, [stream, stopStream, startCapture]);

  const startRecording = useCallback(() => {
    if (!stream || recording) return;

    const mimeType = MediaRecorder.isTypeSupported('video/webm;codecs=vp9')
      ? 'video/webm;codecs=vp9'
      : 'video/webm';

    try {
      const recorder = new MediaRecorder(stream, { mimeType });
      chunksRef.current = [];

      recorder.ondataavailable = (e) => {
        if (e.data.size > 0) chunksRef.current.push(e.data);
      };

      recorder.onstop = () => {
        const blob = new Blob(chunksRef.current, { type: mimeType });
        const url  = URL.createObjectURL(blob);
        const a    = document.createElement('a');
        a.href     = url;
        a.download = `tmi-recording-${Date.now()}.webm`;
        a.click();
        URL.revokeObjectURL(url);
      };

      recorder.start(1000);
      recorderRef.current = recorder;
      setRecording(true);
      setRecSeconds(0);

      timerRef.current = setInterval(() => {
        setRecSeconds((prev) => prev + 1);
      }, 1000);
    } catch (err) {
      console.error('[WebRTCCapture] MediaRecorder error:', err);
    }
  }, [stream, recording]);

  const stopRecording = useCallback(() => {
    if (!recording || !recorderRef.current) return;
    recorderRef.current.stop();
    recorderRef.current = null;
    setRecording(false);
    if (timerRef.current) {
      clearInterval(timerRef.current);
      timerRef.current = null;
    }
  }, [recording]);

  // ─── Render ───────────────────────────────────────────────────────────────

  if (!isSupported) {
    return (
      <div style={containerStyle}>
        <p style={{ color: '#FF4444', textAlign: 'center', padding: '24px' }}>
          WebRTC is not supported in this browser.<br />
          <span style={{ color: '#888', fontSize: '13px' }}>Use Chrome, Firefox, or Safari.</span>
        </p>
      </div>
    );
  }

  return (
    <div style={containerStyle}>
      {/* Video preview */}
      <div style={previewWrapStyle}>
        <video
          ref={videoRef}
          autoPlay
          playsInline
          muted
          style={{
            width:      '100%',
            height:     '100%',
            objectFit:  'cover',
            borderRadius: '8px',
            background: '#000',
            display:    stream && cameraOn ? 'block' : 'none',
          }}
        />
        {(!stream || !cameraOn) && (
          <div style={noVideoStyle}>
            <span style={{ fontSize: '48px' }}>
              {!stream ? '📷' : '🚫'}
            </span>
            <p style={{ margin: '8px 0 0', color: '#888', fontSize: '13px' }}>
              {!stream ? 'Camera not started' : 'Camera is off'}
            </p>
          </div>
        )}
        {recording && (
          <div style={recBadgeStyle}>
            <span style={{ color: '#FF4444', fontWeight: 700 }}>● REC</span>
            <span style={{ marginLeft: '8px', color: '#E0E0E0', fontSize: '13px' }}>
              {formatTime(recSeconds)}
            </span>
          </div>
        )}
      </div>

      {/* Error state */}
      {error && (
        <div style={errorBoxStyle}>
          <p style={{ margin: 0, fontSize: '14px', color: '#FF6666' }}>{error}</p>
          {permission === 'denied' && (
            <p style={{ margin: '8px 0 0', fontSize: '12px', color: '#888' }}>
              To allow access: click the camera icon in your browser's address bar → Allow.
            </p>
          )}
          <button
            onClick={() => startCapture()}
            style={{ ...btnStyle, marginTop: '12px', background: accentColor, color: '#000' }}
          >
            Retry
          </button>
        </div>
      )}

      {/* Controls */}
      <div style={controlsRowStyle}>
        {!stream ? (
          <button
            onClick={() => startCapture()}
            disabled={permission === 'requesting'}
            style={{ ...btnStyle, background: accentColor, color: '#000', fontWeight: 700 }}
          >
            {permission === 'requesting' ? 'Starting...' : 'Start Camera'}
          </button>
        ) : (
          <>
            <button
              onClick={toggleMute}
              style={{ ...btnStyle, background: muted ? '#333' : '#1a1a2e' }}
              title={muted ? 'Unmute' : 'Mute'}
            >
              {muted ? '🔇 Muted' : '🎙 Mic On'}
            </button>
            <button
              onClick={toggleCamera}
              style={{ ...btnStyle, background: cameraOn ? '#1a1a2e' : '#333' }}
              title={cameraOn ? 'Turn camera off' : 'Turn camera on'}
            >
              {cameraOn ? '📹 Cam On' : '📷 Cam Off'}
            </button>
            {showRecordingControls && (
              recording ? (
                <button
                  onClick={stopRecording}
                  style={{ ...btnStyle, background: '#FF4444', color: '#fff' }}
                >
                  ⏹ Stop Recording
                </button>
              ) : (
                <button
                  onClick={startRecording}
                  style={{ ...btnStyle, background: '#1a1a2e', border: `1px solid #FF4444` }}
                >
                  ⏺ Record Clip
                </button>
              )
            )}
            <button
              onClick={stopStream}
              style={{ ...btnStyle, background: '#1a0a0a', border: '1px solid #333' }}
            >
              ✕ Stop
            </button>
          </>
        )}
      </div>

      {/* Resolution selector */}
      {showResolutionSelector && (
        <div style={resSelectorStyle}>
          <span style={{ fontSize: '12px', color: '#666', marginRight: '8px' }}>Resolution:</span>
          {(Object.keys(RESOLUTIONS) as VideoResolution[]).map((res) => (
            <button
              key={res}
              onClick={() => handleResolutionChange(res)}
              style={{
                ...resOptionStyle,
                background:   resolution === res ? accentColor : '#1a1a2e',
                color:        resolution === res ? '#000' : '#888',
                fontWeight:   resolution === res ? 700 : 400,
              }}
            >
              {RESOLUTIONS[res].label}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}

// ─── Styles ──────────────────────────────────────────────────────────────────

const containerStyle: React.CSSProperties = {
  background:   '#0D0D1A',
  border:       '1px solid #222240',
  borderRadius: '12px',
  overflow:     'hidden',
  display:      'flex',
  flexDirection:'column',
  gap:          '0',
};

const previewWrapStyle: React.CSSProperties = {
  position:     'relative',
  width:        '100%',
  aspectRatio:  '16/9',
  background:   '#000',
  display:      'flex',
  alignItems:   'center',
  justifyContent:'center',
};

const noVideoStyle: React.CSSProperties = {
  display:      'flex',
  flexDirection:'column',
  alignItems:   'center',
  justifyContent:'center',
  width:        '100%',
  height:       '100%',
};

const recBadgeStyle: React.CSSProperties = {
  position:     'absolute',
  top:          '12px',
  left:         '12px',
  background:   'rgba(0,0,0,0.7)',
  borderRadius: '6px',
  padding:      '4px 10px',
  fontSize:     '13px',
  display:      'flex',
  alignItems:   'center',
};

const errorBoxStyle: React.CSSProperties = {
  background:   '#1a0a0a',
  borderTop:    '1px solid #FF4444',
  padding:      '16px 20px',
};

const controlsRowStyle: React.CSSProperties = {
  display:      'flex',
  gap:          '8px',
  padding:      '12px 16px',
  flexWrap:     'wrap',
  background:   '#0D0D1A',
  borderTop:    '1px solid #1a1a30',
};

const resSelectorStyle: React.CSSProperties = {
  display:      'flex',
  alignItems:   'center',
  padding:      '8px 16px 12px',
  flexWrap:     'wrap',
  gap:          '6px',
};

const btnStyle: React.CSSProperties = {
  padding:      '8px 16px',
  borderRadius: '6px',
  border:       'none',
  cursor:       'pointer',
  fontSize:     '13px',
  color:        '#E0E0E0',
  background:   '#1a1a2e',
  transition:   'opacity 0.15s',
};

const resOptionStyle: React.CSSProperties = {
  padding:      '4px 10px',
  borderRadius: '4px',
  border:       'none',
  cursor:       'pointer',
  fontSize:     '12px',
};
