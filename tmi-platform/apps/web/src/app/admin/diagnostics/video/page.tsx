'use client';

import React, { useEffect, useRef, useState } from 'react';

type CameraSource =
  | 'webcam'
  | 'obs-virtual'
  | 'screen-share'
  | 'capture-card'
  | 'broadcast-feed';

type FrameStatus = 'ok' | 'frozen' | 'black' | 'disconnected' | 'idle';

interface CameraSlot {
  id: string;
  label: string;
  source: CameraSource;
  status: FrameStatus;
  lastFrameTs: number | null;
  reconnectAttempts: number;
  bandwidth: 'high' | 'medium' | 'low' | 'unknown';
  resolution: string | null;
}

const INIT_SLOTS: CameraSlot[] = [
  { id: 'webcam-primary', label: 'Webcam (Primary)', source: 'webcam', status: 'idle', lastFrameTs: null, reconnectAttempts: 0, bandwidth: 'unknown', resolution: null },
  { id: 'obs-virtual', label: 'OBS Virtual Camera', source: 'obs-virtual', status: 'idle', lastFrameTs: null, reconnectAttempts: 0, bandwidth: 'unknown', resolution: null },
  { id: 'screen-share', label: 'Screen Share', source: 'screen-share', status: 'idle', lastFrameTs: null, reconnectAttempts: 0, bandwidth: 'unknown', resolution: null },
  { id: 'capture-card', label: 'DSLR / Capture Card', source: 'capture-card', status: 'idle', lastFrameTs: null, reconnectAttempts: 0, bandwidth: 'unknown', resolution: null },
  { id: 'broadcast-feed', label: 'Broadcast Feed', source: 'broadcast-feed', status: 'idle', lastFrameTs: null, reconnectAttempts: 0, bandwidth: 'unknown', resolution: null },
];

const STATUS_COLOR: Record<FrameStatus, string> = {
  ok:           'text-emerald-400 border-emerald-700/40 bg-emerald-900/20',
  frozen:       'text-amber-400 border-amber-700/40 bg-amber-900/20',
  black:        'text-red-400 border-red-700/40 bg-red-900/20',
  disconnected: 'text-red-500 border-red-700/40 bg-red-900/20',
  idle:         'text-gray-400 border-gray-700/40 bg-gray-800/20',
};

const STATUS_LABEL: Record<FrameStatus, string> = {
  ok:           'OK',
  frozen:       'FROZEN',
  black:        'BLACK FRAME',
  disconnected: 'DISCONNECTED',
  idle:         'NOT TESTED',
};

export default function VideoDiagnosticsPage() {
  const [slots, setSlots] = useState<CameraSlot[]>(INIT_SLOTS);
  const [activeSlotId, setActiveSlotId] = useState<string | null>(null);
  const [log, setLog] = useState<string[]>([]);
  const videoRef = useRef<HTMLVideoElement>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const analysisRef = useRef<ReturnType<typeof setInterval> | null>(null);

  function emit(msg: string) {
    setLog((prev) => [`[${new Date().toLocaleTimeString('en-US', { hour12: false })}] ${msg}`, ...prev.slice(0, 49)]);
  }

  function updateSlot(id: string, patch: Partial<CameraSlot>) {
    setSlots((prev) => prev.map((s) => (s.id === id ? { ...s, ...patch } : s)));
  }

  async function testWebcam(slotId: string) {
    setActiveSlotId(slotId);
    emit(`Testing ${slotId}...`);
    updateSlot(slotId, { status: 'idle' });

    try {
      const stream = await navigator.mediaDevices.getUserMedia({ video: true, audio: false });
      streamRef.current = stream;

      const track = stream.getVideoTracks()[0];
      const settings = track.getSettings();
      const resolution = settings.width && settings.height
        ? `${settings.width}×${settings.height}`
        : 'unknown';

      if (videoRef.current) {
        videoRef.current.srcObject = stream;
        await videoRef.current.play().catch(() => {});
      }

      updateSlot(slotId, {
        status: 'ok',
        lastFrameTs: Date.now(),
        resolution,
        bandwidth: settings.width && settings.width >= 1280 ? 'high' : settings.width && settings.width >= 640 ? 'medium' : 'low',
      });
      emit(`${slotId}: OK — ${resolution} @ ${settings.frameRate ?? '?'}fps`);

      // Frozen-frame detection via canvas analysis
      const canvas = document.createElement('canvas');
      const ctx = canvas.getContext('2d');
      let lastHash = '';
      let frozenCount = 0;

      analysisRef.current = setInterval(() => {
        if (!videoRef.current || !ctx) return;
        canvas.width = 4;
        canvas.height = 4;
        ctx.drawImage(videoRef.current, 0, 0, 4, 4);
        const data = ctx.getImageData(0, 0, 4, 4).data;

        // Black-frame detection
        const avg = Array.from(data).reduce((a, b) => a + b, 0) / data.length;
        if (avg < 4) {
          updateSlot(slotId, { status: 'black' });
          emit(`${slotId}: BLACK FRAME DETECTED`);
          return;
        }

        // Frozen-frame detection
        const hash = data.slice(0, 12).join(',');
        if (hash === lastHash) {
          frozenCount++;
          if (frozenCount >= 3) {
            updateSlot(slotId, { status: 'frozen' });
            emit(`${slotId}: FROZEN FRAME DETECTED after ${frozenCount} identical frames`);
          }
        } else {
          frozenCount = 0;
          updateSlot(slotId, { status: 'ok', lastFrameTs: Date.now() });
        }
        lastHash = hash;
      }, 1000);

    } catch (err) {
      const reason = err instanceof Error ? err.message : String(err);
      updateSlot(slotId, { status: 'disconnected', reconnectAttempts: 1 });
      emit(`${slotId}: FAILED — ${reason}`);
    }
  }

  async function testScreenShare(slotId: string) {
    setActiveSlotId(slotId);
    emit(`Testing ${slotId}...`);
    try {
      const stream = await (navigator.mediaDevices as MediaDevices & {
        getDisplayMedia(c?: MediaStreamConstraints): Promise<MediaStream>;
      }).getDisplayMedia({ video: true });
      streamRef.current = stream;
      const track = stream.getVideoTracks()[0];
      const settings = track.getSettings();
      const resolution = settings.width && settings.height ? `${settings.width}×${settings.height}` : 'unknown';
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
        await videoRef.current.play().catch(() => {});
      }
      updateSlot(slotId, { status: 'ok', lastFrameTs: Date.now(), resolution });
      emit(`${slotId}: OK — ${resolution}`);
      stream.getVideoTracks()[0].addEventListener('ended', () => {
        updateSlot(slotId, { status: 'disconnected' });
        emit(`${slotId}: Screen share ended by user`);
      });
    } catch (err) {
      const reason = err instanceof Error ? err.message : String(err);
      updateSlot(slotId, { status: 'disconnected' });
      emit(`${slotId}: FAILED — ${reason}`);
    }
  }

  function stopActive() {
    if (analysisRef.current) clearInterval(analysisRef.current);
    if (streamRef.current) {
      streamRef.current.getTracks().forEach((t) => t.stop());
      streamRef.current = null;
    }
    if (videoRef.current) videoRef.current.srcObject = null;
    if (activeSlotId) emit(`${activeSlotId}: stream stopped`);
    setActiveSlotId(null);
  }

  useEffect(() => () => stopActive(), []);

  function handleTest(slot: CameraSlot) {
    stopActive();
    if (slot.source === 'screen-share') {
      void testScreenShare(slot.id);
    } else if (slot.source === 'webcam' || slot.source === 'obs-virtual') {
      void testWebcam(slot.id);
    } else {
      emit(`${slot.id}: Manual test required (DSLR/capture card/broadcast)`);
      updateSlot(slot.id, { status: 'idle' });
    }
  }

  return (
    <div className="min-h-screen bg-gray-950 text-gray-100 p-6 font-mono">
      <div className="max-w-5xl mx-auto">

        <div className="mb-6">
          <h1 className="text-xl font-bold text-white">Video / Camera Diagnostics</h1>
          <p className="text-xs text-gray-400 mt-1">
            Test webcam, OBS virtual camera, screen share, and capture card inputs. Validates frozen-frame and black-frame detection.
          </p>
        </div>

        {/* Camera source slots */}
        <div className="grid grid-cols-1 gap-3 mb-6">
          {slots.map((slot) => (
            <div key={slot.id} className={`border rounded p-4 flex items-center gap-4 ${STATUS_COLOR[slot.status]}`}>
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 mb-1">
                  <span className="text-sm font-semibold text-white">{slot.label}</span>
                  <span className={`text-xs px-1.5 py-0.5 rounded border font-bold ${STATUS_COLOR[slot.status]}`}>
                    {STATUS_LABEL[slot.status]}
                  </span>
                  {slot.id === activeSlotId && (
                    <span className="text-xs text-cyan-400 animate-pulse">● ACTIVE</span>
                  )}
                </div>
                <div className="text-xs text-gray-400 flex gap-4">
                  {slot.resolution && <span>Resolution: {slot.resolution}</span>}
                  {slot.bandwidth !== 'unknown' && <span>Bandwidth: {slot.bandwidth}</span>}
                  {slot.reconnectAttempts > 0 && <span>Reconnects: {slot.reconnectAttempts}</span>}
                  {slot.lastFrameTs && (
                    <span>Last frame: {new Date(slot.lastFrameTs).toLocaleTimeString('en-US', { hour12: false })}</span>
                  )}
                </div>
              </div>
              <div className="flex gap-2 shrink-0">
                <button
                  onClick={() => handleTest(slot)}
                  className="text-xs px-3 py-1.5 rounded bg-cyan-900/30 border border-cyan-700/40 text-cyan-400 hover:bg-cyan-900/50 transition-colors"
                >
                  {slot.id === activeSlotId ? 'Restart' : 'Test'}
                </button>
                {slot.id === activeSlotId && (
                  <button
                    onClick={stopActive}
                    className="text-xs px-3 py-1.5 rounded bg-red-900/30 border border-red-700/40 text-red-400 hover:bg-red-900/50 transition-colors"
                  >
                    Stop
                  </button>
                )}
              </div>
            </div>
          ))}
        </div>

        {/* Live preview */}
        {activeSlotId && (
          <div className="mb-6 bg-gray-900 border border-gray-800 rounded overflow-hidden">
            <div className="px-4 py-2 border-b border-gray-800 text-xs text-gray-400">Live Preview</div>
            <video
              ref={videoRef}
              autoPlay
              playsInline
              muted
              className="w-full max-h-[320px] object-contain bg-black"
            />
          </div>
        )}

        {/* Multiview guide */}
        <div className="grid grid-cols-3 gap-3 mb-6">
          {(['performer', 'lobby', 'admin'] as const).map((view) => (
            <div key={view} className="bg-gray-900 border border-gray-800 rounded p-3">
              <div className="text-xs text-gray-400 capitalize mb-2">{view} multiview</div>
              <div className="text-xs text-gray-600">Routed from active camera stream</div>
              <div className={`mt-2 text-xs font-bold ${activeSlotId ? 'text-emerald-400' : 'text-gray-500'}`}>
                {activeSlotId ? '● LIVE' : '○ NO STREAM'}
              </div>
            </div>
          ))}
        </div>

        {/* Event log */}
        <div className="bg-gray-900 border border-gray-800 rounded">
          <div className="px-4 py-2 border-b border-gray-800 text-xs text-gray-400">Event Log</div>
          <div className="px-4 py-2 max-h-[200px] overflow-y-auto divide-y divide-gray-800/40">
            {log.length === 0 ? (
              <div className="py-4 text-center text-xs text-gray-600">No events yet. Click Test on a camera source.</div>
            ) : (
              log.map((line, i) => (
                <div key={i} className="py-1 text-xs text-gray-400">{line}</div>
              ))
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
