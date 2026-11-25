"use client";

/**
 * Renders freeform composition layers inside an existing overflow-clipped card.
 * Not a second compositor — only the canvas-layer presentation of YoPhoCardComposition.
 */

import { useEffect, useRef } from "react";
import {
  listCanvasLayers,
  resolveLayerTransform,
  type YoPhoCanvasLayer,
  type YoPhoCardComposition,
} from "@/lib/yopho/YoPhoCardComposition";
import type { YoPhoFormat } from "@/lib/yopho/YoPhoFormatAuthority";

export default function YoPhoCanvasLayerStack({
  composition,
  format,
  selectedId,
  playing = true,
  reducedMotion = false,
  onSelect,
}: {
  composition: YoPhoCardComposition;
  format: YoPhoFormat;
  selectedId?: string | null;
  playing?: boolean;
  reducedMotion?: boolean;
  onSelect?: (layerId: string) => void;
}) {
  const layers = listCanvasLayers(composition);
  if (layers.length === 0) return null;
  return (
    <>
      {layers.map((layer) =>
        layer.visible ? (
          <CanvasLayerNode
            key={layer.id}
            layer={layer}
            format={format}
            selected={selectedId === layer.id}
            playing={playing && !reducedMotion}
            onSelect={onSelect}
          />
        ) : null,
      )}
    </>
  );
}

function CanvasLayerNode({
  layer,
  format,
  selected,
  playing,
  onSelect,
}: {
  layer: YoPhoCanvasLayer;
  format: YoPhoFormat;
  selected: boolean;
  playing: boolean;
  onSelect?: (layerId: string) => void;
}) {
  const transform = resolveLayerTransform(layer, format);
  const videoRef = useRef<HTMLVideoElement | null>(null);
  const src = layer.srcUrl;
  const isVideo = layer.mediaType === "video" && Boolean(src);
  const fit = transform.objectFit === "fill" ? "fill" : transform.objectFit;

  useEffect(() => {
    const video = videoRef.current;
    if (!video || !isVideo || !src) return;
    const start = Math.max(0, layer.playback?.hookStartSec ?? 0);
    const duration = layer.playback?.durationSec ?? 4;
    const end = start + duration;
    video.muted = layer.playback?.muted ?? true;
    video.loop = false;
    video.playsInline = true;
    const onMeta = () => {
      video.currentTime = start;
      if (playing && (layer.playback?.autoplay ?? true)) void video.play().catch(() => {});
      else video.pause();
    };
    const onTime = () => {
      if (!playing) return;
      if (video.currentTime >= end || video.ended) {
        video.currentTime = start;
        if (layer.playback?.loop ?? true) void video.play().catch(() => {});
      }
    };
    video.addEventListener("loadedmetadata", onMeta);
    video.addEventListener("timeupdate", onTime);
    if (playing) void video.play().catch(() => {});
    else video.pause();
    return () => {
      video.removeEventListener("loadedmetadata", onMeta);
      video.removeEventListener("timeupdate", onTime);
    };
  }, [isVideo, src, playing, layer.playback]);

  if (!src && !layer.posterUrl) return null;

  const boxStyle = {
    position: "absolute" as const,
    left: "50%",
    top: "50%",
    width: layer.kind === "base_background" || layer.kind === "background" ? "100%" : "72%",
    height: layer.kind === "base_background" || layer.kind === "background" ? "100%" : "72%",
    transform: `translate(calc(-50% + ${transform.x}%), calc(-50% + ${transform.y}%)) scale(${transform.scale}) rotate(${transform.rotation}deg)`,
    transformOrigin: `${transform.focalX * 100}% ${transform.focalY * 100}%`,
    opacity: transform.opacity,
    zIndex: 4 + layer.zIndex,
    overflow: "hidden" as const,
    pointerEvents: onSelect ? ("auto" as const) : ("none" as const),
    outline: selected ? "2px solid #00FFFF" : "none",
    cursor: onSelect ? "pointer" : "default",
  };

  return (
    <div
      data-testid={`yopho-canvas-layer-${layer.id}`}
      data-layer-kind={layer.kind}
      data-layer-media={layer.mediaType}
      onClick={(event) => {
        if (!onSelect) return;
        event.stopPropagation();
        onSelect(layer.id);
      }}
      style={boxStyle}
    >
      {isVideo ? (
        <video
          ref={videoRef}
          src={src ?? undefined}
          poster={layer.posterUrl ?? undefined}
          muted={layer.playback?.muted ?? true}
          playsInline
          style={{
            width: "100%",
            height: "100%",
            objectFit: fit,
            objectPosition: `${transform.focalX * 100}% ${transform.focalY * 100}%`,
          }}
        />
      ) : (
        // eslint-disable-next-line @next/next/no-img-element
        <img
          src={src ?? layer.posterUrl ?? ""}
          alt={layer.label}
          style={{
            width: "100%",
            height: "100%",
            objectFit: fit,
            objectPosition: `${transform.focalX * 100}% ${transform.focalY * 100}%`,
          }}
        />
      )}
    </div>
  );
}
