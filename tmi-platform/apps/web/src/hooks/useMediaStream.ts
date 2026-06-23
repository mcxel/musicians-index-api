'use client';

import { useState, useCallback, useRef } from 'react';

type StreamStatus = 'idle' | 'requesting' | 'active' | 'error';

interface MediaStreamState {
  stream: MediaStream | null;
  status: StreamStatus;
  error: Error | null;
}

export function useMediaStream(constraints: MediaStreamConstraints) {
  const [state, setState] = useState<MediaStreamState>({
    stream: null,
    status: 'idle',
    error: null,
  });

  const streamRef = useRef<MediaStream | null>(null);

  const startStream = useCallback(async () => {
    setState(s => ({ ...s, status: 'requesting', error: null }));
    try {
      if (!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) {
        throw new Error('getUserMedia is not supported in this browser.');
      }
      const mediaStream = await navigator.mediaDevices.getUserMedia(constraints);
      streamRef.current = mediaStream;
      setState({ stream: mediaStream, status: 'active', error: null });
    } catch (err) {
      setState(s => ({ ...s, status: 'error', error: err instanceof Error ? err : new Error(String(err)) }));
    }
  }, [constraints]);

  const stopStream = useCallback(() => {
    if (streamRef.current) {
      streamRef.current.getTracks().forEach(track => track.stop());
      streamRef.current = null;
    }
    setState({ stream: null, status: 'idle', error: null });
  }, []);

  return {
    stream: state.stream,
    status: state.status,
    error: state.error,
    startStream,
    stopStream,
  };
}