'use client';

import { useCallback, useEffect, useRef, useState } from 'react';

export type SignalingState = 'IDLE' | 'CONNECTING' | 'CONNECTED' | 'DESTROYED';

interface UseWebRtcSignalingReturn {
  localStream: MediaStream | null;
  remoteStream: MediaStream | null;
  signalingState: SignalingState;
}

const ICE: RTCConfiguration = {
  iceServers: [{ urls: 'stun:stun.l.google.com:19302' }],
};

export function useWebRtcSignaling(allowConnection: boolean): UseWebRtcSignalingReturn {
  const [localStream, setLocalStream]   = useState<MediaStream | null>(null);
  const [remoteStream, setRemoteStream] = useState<MediaStream | null>(null);
  const [signalingState, setSignalingState] = useState<SignalingState>('IDLE');

  const lpcRef = useRef<RTCPeerConnection | null>(null);
  const rpcRef = useRef<RTCPeerConnection | null>(null);
  const mediaRef = useRef<MediaStream | null>(null);

  const teardown = useCallback(() => {
    console.log('💥 TEARDOWN FORCED // DESTROYING CONNECTION INSTANCES');
    mediaRef.current?.getTracks().forEach((t) => t.stop());
    lpcRef.current?.close();
    rpcRef.current?.close();
    mediaRef.current = null;
    lpcRef.current = null;
    rpcRef.current = null;
    setLocalStream(null);
    setRemoteStream(null);
    setSignalingState('DESTROYED');
  }, []);

  useEffect(() => {
    if (!allowConnection) {
      console.log('🚫 SIGNALING ABORTED // NO CUSTODIAN PERMISSION');
      if (lpcRef.current || rpcRef.current) teardown();
      return;
    }

    let alive = true;

    (async () => {
      console.log('🚀 HARDWARE PROMOTED // INITIALIZING RTCPEERCONNECTION');
      setSignalingState('CONNECTING');

      let stream: MediaStream;
      try {
        stream = await navigator.mediaDevices.getUserMedia({ video: true, audio: true });
      } catch {
        // Fallback for environments without a camera (test / demo)
        const canvas = document.createElement('canvas');
        canvas.width = 320;
        canvas.height = 240;
        const ctx = canvas.getContext('2d');
        if (ctx) {
          ctx.fillStyle = '#060410';
          ctx.fillRect(0, 0, 320, 240);
          ctx.fillStyle = '#00FFFF';
          ctx.font = '14px monospace';
          ctx.fillText('NO CAMERA — LOOPBACK TEST', 30, 120);
        }
        stream = canvas.captureStream(10);
      }

      if (!alive) { stream.getTracks().forEach((t) => t.stop()); return; }

      mediaRef.current = stream;
      setLocalStream(stream);

      // Loopback: lpc (local) ↔ rpc (remote) — full SDP handshake in memory
      const lpc = new RTCPeerConnection(ICE);
      const rpc = new RTCPeerConnection(ICE);
      lpcRef.current = lpc;
      rpcRef.current = rpc;

      lpc.onicecandidate = (e) => { if (e.candidate) rpc.addIceCandidate(e.candidate).catch(() => null); };
      rpc.onicecandidate = (e) => { if (e.candidate) lpc.addIceCandidate(e.candidate).catch(() => null); };

      // Remote peer receives incoming tracks → build remoteStream
      rpc.ontrack = (e) => {
        setRemoteStream((prev) => {
          const tracks = prev ? [...prev.getTracks(), e.track] : [e.track];
          return new MediaStream(tracks);
        });
        setSignalingState('CONNECTED');
      };

      stream.getTracks().forEach((t) => lpc.addTrack(t, stream));

      // SDP offer → answer exchange (no network needed — both peers in same process)
      const offer = await lpc.createOffer();
      await lpc.setLocalDescription(offer);
      await rpc.setRemoteDescription(offer);
      const answer = await rpc.createAnswer();
      await rpc.setLocalDescription(answer);
      await lpc.setRemoteDescription(answer);
    })().catch((err) => console.error('[useWebRtcSignaling] init error:', err));

    return () => {
      alive = false;
      teardown();
    };
  }, [allowConnection, teardown]);

  return { localStream, remoteStream, signalingState };
}
