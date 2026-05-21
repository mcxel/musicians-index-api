import { useState, useEffect, useCallback } from 'react';

interface MediaStreamState {
  stream: MediaStream | null;
  error: string | null;
  isLoading: boolean;
}

/**
 * TMI Platform - Core WebRTC Media hook for Venues & Performance stages.
 * Safely hooks into navigator.mediaDevices with fallbacks for WKWebView and embedded WebKit.
 */
export const useVenueMediaStream = (videoEnabled: boolean = true, audioEnabled: boolean = true) => {
  const [state, setState] = useState<MediaStreamState>({
    stream: null,
    error: null,
    isLoading: false,
  });

  const initializeStream = useCallback(async () => {
    setState((prev) => ({ ...prev, isLoading: true, error: null }));

    try {
      // Check for browser support (safeguard for older embedded WebKit / WPE WebKit)
      if (!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) {
        throw new Error('MediaDevices API not supported in this environment (Check WKWebView permissions).');
      }

      const mediaStream = await navigator.mediaDevices.getUserMedia({
        video: videoEnabled ? {
          width: { ideal: 1920 }, // HD Video requested in spec
          height: { ideal: 1080 },
          facingMode: 'user'
        } : false,
        audio: audioEnabled ? {
          echoCancellation: true,
          noiseSuppression: true,
          autoGainControl: true
        } : false,
      });

      setState({ stream: mediaStream, error: null, isLoading: false });
    } catch (err: any) {
      console.error('[TMI Media Engine] Failed to acquire stream:', err);
      setState({ stream: null, error: err.message || 'Permission denied or device missing.', isLoading: false });
    }
  }, [videoEnabled, audioEnabled]);

  const stopStream = useCallback(() => {
    if (state.stream) {
      state.stream.getTracks().forEach((track) => {
        track.stop();
        state.stream?.removeTrack(track);
      });
      setState((prev) => ({ ...prev, stream: null }));
    }
  }, [state.stream]);

  useEffect(() => {
    // Auto-init logic can be toggled based on room rules
    return () => {
      // Cleanup on unmount (prevent loose connections / memory leaks)
      stopStream();
    };
  }, [stopStream]);

  return {
    ...state,
    startStream: initializeStream,
    stopStream,
    toggleVideo: () => {
      state.stream?.getVideoTracks().forEach(track => track.enabled = !track.enabled);
    },
    toggleAudio: () => {
      state.stream?.getAudioTracks().forEach(track => track.enabled = !track.enabled);
    }
  };
};