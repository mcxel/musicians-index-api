'use client';

import { useState, useEffect, useRef } from 'react';

interface WebRTCConfig {
  video: boolean;
  audio: boolean;
  hd?: boolean;
}

export function useStageWebRTC({ video, audio, hd = true }: WebRTCConfig) {
  const [stream, setStream] = useState<MediaStream | null>(null);
  const [error, setError] = useState<string | null>(null);
  const videoRef = useRef<HTMLVideoElement>(null);

  useEffect(() => {
    let mounted = true;

    const initStream = async () => {
      try {
        // Enforce HD constraints for premium quality
        const constraints: MediaStreamConstraints = {
          audio: audio ? { echoCancellation: true, noiseSuppression: true } : false,
          video: video ? {
            width: hd ? { ideal: 1920 } : { ideal: 1280 },
            height: hd ? { ideal: 1080 } : { ideal: 720 },
            frameRate: { ideal: 30, max: 60 }
          } : false
        };

        const mediaStream = await navigator.mediaDevices.getUserMedia(constraints);
        
        if (mounted) {
          setStream(mediaStream);
          if (videoRef.current) {
            videoRef.current.srcObject = mediaStream;
          }
        } else {
          // Cleanup if component unmounted before stream resolved
          mediaStream.getTracks().forEach(track => track.stop());
        }
      } catch (err: any) {
        console.error("WebRTC Error: ", err);
        setError(err.message || "Failed to access camera/microphone.");
      }
    };

    initStream();

    return () => {
      mounted = false;
      if (stream) {
        stream.getTracks().forEach(track => track.stop());
      }
    };
  }, [video, audio, hd]);

  return { stream, error, videoRef };
}