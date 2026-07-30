"use client";

import { useEffect, useRef, useState } from "react";

const SPEAKING_THRESHOLD = 0.06;
const SAMPLE_INTERVAL_MS = 150;

/**
 * Real local microphone speaking detection via Web Audio's AnalyserNode -
 * no fabricated/random "isSpeaking" state (Rule 20). Only ever reflects the
 * local user's own mic; there is no per-remote-participant audio transport
 * in the Fan Lobby (no Daily.co room wired here), so other participants'
 * speaking state is real too, but only because THEY ran this same hook and
 * broadcast it through lobby-sync - never inferred locally about someone else.
 */
export function useLocalMicLevel(enabled: boolean) {
  const [isSpeaking, setIsSpeaking] = useState(false);
  const [permissionDenied, setPermissionDenied] = useState(false);
  const streamRef = useRef<MediaStream | null>(null);

  useEffect(() => {
    if (!enabled) {
      setIsSpeaking(false);
      return;
    }
    if (typeof navigator === "undefined" || !navigator.mediaDevices?.getUserMedia) {
      setPermissionDenied(true);
      return;
    }

    let audioContext: AudioContext | null = null;
    let analyser: AnalyserNode | null = null;
    let intervalId: ReturnType<typeof setInterval> | null = null;
    let cancelled = false;

    navigator.mediaDevices
      .getUserMedia({ audio: true })
      .then((stream) => {
        if (cancelled) {
          stream.getTracks().forEach((t) => t.stop());
          return;
        }
        streamRef.current = stream;
        audioContext = new AudioContext();
        analyser = audioContext.createAnalyser();
        analyser.fftSize = 512;
        const source = audioContext.createMediaStreamSource(stream);
        source.connect(analyser);

        const data = new Uint8Array(analyser.frequencyBinCount);
        intervalId = setInterval(() => {
          if (!analyser) return;
          analyser.getByteTimeDomainData(data);
          let sumSquares = 0;
          for (let i = 0; i < data.length; i++) {
            const centered = (data[i] - 128) / 128;
            sumSquares += centered * centered;
          }
          const rms = Math.sqrt(sumSquares / data.length);
          setIsSpeaking(rms > SPEAKING_THRESHOLD);
        }, SAMPLE_INTERVAL_MS);
      })
      .catch(() => {
        if (!cancelled) setPermissionDenied(true);
      });

    return () => {
      cancelled = true;
      if (intervalId) clearInterval(intervalId);
      streamRef.current?.getTracks().forEach((t) => t.stop());
      streamRef.current = null;
      audioContext?.close().catch(() => {});
    };
  }, [enabled]);

  return { isSpeaking, permissionDenied };
}
