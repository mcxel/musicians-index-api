"use client";

import { useState, useCallback, useRef } from 'react';

interface UseScreenShareOptions {
  onStart?: (stream: MediaStream) => void;
  onStop?: () => void;
}

export function useScreenShare({ onStart, onStop }: UseScreenShareOptions = {}) {
  const [isSharing, setIsSharing] = useState(false);
  const streamRef = useRef<MediaStream | null>(null);

  const stopScreenShare = useCallback(() => {
    if (streamRef.current) {
      streamRef.current.getTracks().forEach(track => track.stop());
      streamRef.current = null;
    }
    setIsSharing(false);
    onStop?.();
  }, [onStop]);

  const startScreenShare = useCallback(async () => {
    if (!('getDisplayMedia' in navigator.mediaDevices)) {
      alert('Screen sharing is not supported by your browser.');
      return;
    }

    try {
      const stream = await (navigator.mediaDevices as any).getDisplayMedia({ video: true, audio: true });
      streamRef.current = stream;
      setIsSharing(true);
      onStart?.(stream);

      const videoTrack = stream.getVideoTracks()[0];
      if (videoTrack) {
        videoTrack.onended = () => stopScreenShare();
      }
    } catch (err) {
      console.error("Screen share failed:", err);
      stopScreenShare(); // Ensure cleanup on error or user cancellation
    }
  }, [onStart, stopScreenShare]);

  const toggleScreenShare = useCallback(() => {
    isSharing ? stopScreenShare() : startScreenShare();
  }, [isSharing, startScreenShare, stopScreenShare]);

  return { isSharing, stream: streamRef.current, toggleScreenShare };
}