"use client";

import { useRef, useCallback, useEffect } from "react";

export interface CrowdAudioEngineHandle {
  triggerCheer: () => void;
  triggerApplause: (density?: number) => void;
  stop: () => void;
}

export interface CrowdAudioEngineProps {
  autoConnect?: boolean;
  onReady?: (handle: CrowdAudioEngineHandle) => void;
}

function buildAudioChain(ctx: AudioContext): {
  gainNode: GainNode;
  compressor: DynamicsCompressorNode;
} {
  const gainNode = ctx.createGain();
  gainNode.gain.setValueAtTime(0.0, ctx.currentTime);

  const compressor = ctx.createDynamicsCompressor();
  compressor.threshold.setValueAtTime(-24, ctx.currentTime);
  compressor.ratio.setValueAtTime(12, ctx.currentTime);
  compressor.attack.setValueAtTime(0.003, ctx.currentTime);
  compressor.release.setValueAtTime(0.25, ctx.currentTime);
  compressor.knee.setValueAtTime(6, ctx.currentTime);

  gainNode.connect(compressor);
  compressor.connect(ctx.destination);

  return { gainNode, compressor };
}

function createWhiteNoiseBuffer(ctx: AudioContext, duration = 0.4): AudioBuffer {
  const sampleRate = ctx.sampleRate;
  const frameCount = Math.floor(sampleRate * duration);
  const buffer = ctx.createBuffer(2, frameCount, sampleRate);
  for (let ch = 0; ch < 2; ch++) {
    const data = buffer.getChannelData(ch);
    for (let i = 0; i < frameCount; i++) {
      data[i] = (Math.random() * 2 - 1) * 0.35;
    }
  }
  return buffer;
}

export default function CrowdAudioEngine({ autoConnect = false, onReady }: CrowdAudioEngineProps) {
  const ctxRef = useRef<AudioContext | null>(null);
  const gainRef = useRef<GainNode | null>(null);
  const cheerCountRef = useRef(0);

  const ensureContext = useCallback((): { ctx: AudioContext; gain: GainNode } | null => {
    if (!ctxRef.current) {
      ctxRef.current = new (window.AudioContext || (window as { webkitAudioContext?: typeof AudioContext }).webkitAudioContext!)();
      const { gainNode } = buildAudioChain(ctxRef.current);
      gainRef.current = gainNode;
    }
    if (ctxRef.current.state === "suspended") {
      void ctxRef.current.resume();
    }
    return ctxRef.current && gainRef.current
      ? { ctx: ctxRef.current, gain: gainRef.current }
      : null;
  }, []);

  const triggerCheer = useCallback(() => {
    const chain = ensureContext();
    if (!chain) return;
    const { ctx, gain } = chain;
    cheerCountRef.current += 1;
    const targetGain = Math.min(0.25 + cheerCountRef.current * 0.04, 0.65);
    gain.gain.exponentialRampToValueAtTime(
      Math.max(targetGain, 0.001),
      ctx.currentTime + 0.08,
    );
    const buffer = createWhiteNoiseBuffer(ctx, 0.35);
    const src = ctx.createBufferSource();
    src.buffer = buffer;
    src.connect(gain);
    src.start();
    src.stop(ctx.currentTime + 0.35);
    // Decay back after 2s
    gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 2.2);
  }, [ensureContext]);

  const triggerApplause = useCallback((density = 0.5) => {
    const chain = ensureContext();
    if (!chain) return;
    const { ctx, gain } = chain;
    const targetGain = Math.min(0.25 + density * 0.4, 0.65);
    gain.gain.exponentialRampToValueAtTime(
      Math.max(targetGain, 0.001),
      ctx.currentTime + 0.15,
    );
    const buffer = createWhiteNoiseBuffer(ctx, 1.8);
    const src = ctx.createBufferSource();
    src.buffer = buffer;
    src.connect(gain);
    src.start();
    src.stop(ctx.currentTime + 1.8);
    gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 2.5);
  }, [ensureContext]);

  const stop = useCallback(() => {
    if (gainRef.current && ctxRef.current) {
      gainRef.current.gain.exponentialRampToValueAtTime(0.001, ctxRef.current.currentTime + 0.3);
    }
    cheerCountRef.current = 0;
  }, []);

  useEffect(() => {
    if (autoConnect) ensureContext();
    if (onReady) onReady({ triggerCheer, triggerApplause, stop });
  }, [autoConnect, ensureContext, onReady, triggerCheer, triggerApplause, stop]);

  useEffect(() => {
    return () => {
      if (ctxRef.current) {
        void ctxRef.current.close();
      }
    };
  }, []);

  // Headless component — no visible UI
  return null;
}
