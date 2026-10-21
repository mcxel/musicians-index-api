"use client";

/**
 * VenueChromaCompositeLayer — canvas key + stage underlay composite.
 * Consumes the SAME MediaStream as HD panel — never opens a second WebRTC session.
 * When runtime not ready / not entitled → renders nothing (parent keeps video panel).
 */

import { useEffect, useRef } from "react";
import {
  applyChromaKeyToRgba,
  type ChromaGroundingParams,
  type ChromaKeyParams,
  type ChromaRuntimeSnapshot,
  DEFAULT_CHROMA_GROUNDING,
  DEFAULT_CHROMA_KEY_PARAMS,
  measureGroundingLayout,
} from "@/lib/venue/ChromaSegmentationRuntime";

type Props = {
  mediaStream: MediaStream | null | undefined;
  runtime: ChromaRuntimeSnapshot;
  /** When false, layer hidden — HD panel remains the source of truth. */
  active: boolean;
  className?: string;
  underlayCssColor?: string;
  "data-slot-id"?: string;
};

export default function VenueChromaCompositeLayer({
  mediaStream,
  runtime,
  active,
  className = "",
  underlayCssColor = "#0a0614",
  "data-slot-id": slotId,
}: Props) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const videoRef = useRef<HTMLVideoElement | null>(null);
  const rafRef = useRef<number>(0);

  useEffect(() => {
    if (!active || !mediaStream || !runtime.runtimeReady) return;

    const video = document.createElement("video");
    video.muted = true;
    video.playsInline = true;
    video.autoplay = true;
    video.srcObject = mediaStream;
    videoRef.current = video;
    void video.play().catch(() => {
      /* autoplay policy — parent video may already be playing same tracks */
    });

    const keyParams: ChromaKeyParams = runtime.keyParams ?? DEFAULT_CHROMA_KEY_PARAMS;
    const grounding: ChromaGroundingParams = runtime.grounding ?? DEFAULT_CHROMA_GROUNDING;

    const tick = () => {
      const canvas = canvasRef.current;
      if (!canvas || video.readyState < 2) {
        rafRef.current = requestAnimationFrame(tick);
        return;
      }
      const w = canvas.width || 640;
      const h = canvas.height || 360;
      const ctx = canvas.getContext("2d", { willReadFrequently: true });
      if (!ctx) {
        rafRef.current = requestAnimationFrame(tick);
        return;
      }

      // Draw source frame → key → composite with grounding
      const off = document.createElement("canvas");
      off.width = w;
      off.height = h;
      const octx = off.getContext("2d", { willReadFrequently: true });
      if (!octx) {
        rafRef.current = requestAnimationFrame(tick);
        return;
      }
      octx.drawImage(video, 0, 0, w, h);
      const frame = octx.getImageData(0, 0, w, h);
      applyChromaKeyToRgba(frame.data, keyParams);
      octx.putImageData(frame, 0, 0);

      const layout = measureGroundingLayout(w, h, grounding, runtime.fullBody);
      ctx.fillStyle = underlayCssColor;
      ctx.fillRect(0, 0, w, h);

      ctx.save();
      ctx.filter = `blur(${grounding.contactShadowBlurPx}px)`;
      ctx.fillStyle = `rgba(0,0,0,${grounding.contactShadowOpacity})`;
      ctx.beginPath();
      ctx.ellipse(
        layout.shadowCenterX,
        layout.footlineY,
        layout.shadowWidth / 2,
        Math.max(4, h * 0.025),
        0,
        0,
        Math.PI * 2,
      );
      ctx.fill();
      ctx.restore();

      ctx.drawImage(off, 0, layout.subjectDrawTop, w, layout.subjectDrawHeight);

      if (grounding.lightMatchStrength > 0) {
        ctx.save();
        ctx.globalCompositeOperation = "source-atop";
        const warmth = grounding.lightMatchWarmth;
        ctx.fillStyle = `rgba(255, ${Math.round(220 - warmth * 40)}, ${Math.round(180 - warmth * 60)}, ${grounding.lightMatchStrength * 0.35})`;
        ctx.fillRect(0, layout.subjectDrawTop, w, layout.subjectDrawHeight);
        ctx.globalCompositeOperation = "source-over";
        ctx.restore();
      }

      rafRef.current = requestAnimationFrame(tick);
    };

    rafRef.current = requestAnimationFrame(tick);

    return () => {
      cancelAnimationFrame(rafRef.current);
      video.pause();
      video.srcObject = null;
      videoRef.current = null;
    };
  }, [active, mediaStream, runtime, underlayCssColor]);

  if (!active || !runtime.runtimeReady) return null;

  return (
    <canvas
      ref={canvasRef}
      width={640}
      height={360}
      className={className}
      data-venue-chroma-composite="1"
      data-venue-chroma-backend={runtime.backend}
      data-venue-chroma-layout={runtime.layout}
      data-venue-chroma-method={runtime.cutoutMethod}
      data-venue-chroma-preserves-webrtc="1"
      data-slot-id={slotId}
      style={{
        width: "100%",
        height: "100%",
        objectFit: "contain",
        background: underlayCssColor,
        display: "block",
      }}
    />
  );
}
