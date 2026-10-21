"use client";

/**
 * YoPhoLivingStage — plays independent layer clocks without flattening to one GIF.
 */

import { useEffect, useState } from "react";
import type { YoPhoLivingProject } from "@/lib/yopho/living/YoPhoLivingProject";
import { sortLayersBackToFront } from "@/lib/yopho/living/YoPhoLivingProject";
import { evaluateCameraAtTime, evaluateLayerAtTime, isActionActive } from "@/lib/yopho/living/YoPhoLivingAuthoring";

export default function YoPhoLivingStage({
  project,
  playing = true,
  loop = true,
  timeSec,
  onTime,
  onEnded,
  compact = false,
}: {
  project: YoPhoLivingProject;
  playing?: boolean;
  loop?: boolean;
  timeSec?: number;
  onTime?: (timeSec: number) => void;
  onEnded?: () => void;
  compact?: boolean;
}) {
  const controlled = typeof timeSec === "number" && typeof onTime === "function";
  const [internal, setInternal] = useState(0);
  const t = controlled ? timeSec : internal;

  useEffect(() => {
    if (!playing) return;
    let raf = 0;
    let stopped = false;
    const origin = performance.now() - t * 1000;
    const publish = (next: number) => {
      if (controlled) onTime(next);
      else setInternal(next);
    };
    const tick = (now: number) => {
      if (stopped) return;
      let elapsed = (now - origin) / 1000;
      if (elapsed >= project.durationSec) {
        if (loop) elapsed = elapsed % project.durationSec;
        else {
          publish(project.durationSec);
          onEnded?.();
          return;
        }
      }
      publish(Math.max(0, elapsed));
      raf = requestAnimationFrame(tick);
    };
    raf = requestAnimationFrame(tick);
    return () => {
      stopped = true;
      cancelAnimationFrame(raf);
    };
    // Resume uses the playhead captured when playback starts. Do not restart on every frame.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [playing, loop, project.projectId, project.durationSec, controlled]);

  const layers = sortLayersBackToFront(project.layers);
  const camera = evaluateCameraAtTime(project, t);
  const h = compact ? 160 : 280;

  return (
    <div
      data-yopho-living-stage="1"
      data-project-id={project.projectId}
      data-time={t.toFixed(2)}
      data-camera-zoom={camera.zoom.toFixed(3)}
      style={{
        position: "relative",
        width: "100%",
        height: h,
        borderRadius: 12,
        overflow: "hidden",
        background: "#050510",
        border: "1px solid rgba(255,45,170,0.35)",
      }}
    >
      <div style={{ position: "absolute", inset: 0, transform: `scale(${camera.zoom})`, transformOrigin: "50% 40%" }}>
      {layers.map((layer) => {
        const bound = (project.actions ?? []).filter((action) => action.enabled && action.targetLayerId === layer.layerId);
        if (bound.length > 0 && !bound.some((action) => isActionActive(action, t))) return null;
        const ev = evaluateLayerAtTime(layer, t, project.durationSec);
        if (!ev.visible) return null;
        const left = `${(layer.transform.position.x + ev.offsetX) * 100}%`;
        const top = `${(layer.transform.position.y + ev.offsetY) * 100}%`;
        const w = `${layer.transform.scale.x * 40}%`;
        const ht = `${layer.transform.scale.y * 40}%`;
        const clip =
          layer.livingRegion
            ? `inset(${layer.livingRegion.rect.y * 100}% ${(1 - layer.livingRegion.rect.x - layer.livingRegion.rect.w) * 100}% ${(1 - layer.livingRegion.rect.y - layer.livingRegion.rect.h) * 100}% ${layer.livingRegion.rect.x * 100}%)`
            : undefined;
        return (
          <div
            key={layer.layerId}
            data-layer-id={layer.layerId}
            data-family={layer.family}
            data-held={ev.held ? "1" : "0"}
            data-preset={layer.motion.preset}
            style={{
              position: "absolute",
              left,
              top,
              width: layer.family === "BACKGROUND" || layer.procedural === "RAIN" ? "100%" : w,
              height: layer.family === "BACKGROUND" || layer.procedural === "RAIN" ? "100%" : ht,
              transform: `translate(-50%, -50%) rotate(${layer.transform.rotation.roll + ev.roll}deg)`,
              opacity: layer.transform.opacity,
              background:
                layer.procedural === "STAR_FIELD"
                  ? "radial-gradient(circle at 20% 30%, #fff 1px, transparent 2px), radial-gradient(circle at 70% 60%, #cff 1px, transparent 2px), #0a0618"
                  : layer.procedural === "SHOOTING_STAR"
                    ? "linear-gradient(120deg, transparent, #fff, transparent)"
                    : layer.procedural === "GLOW"
                      ? `radial-gradient(circle, ${layer.color ?? "#ffd700"}55, transparent 70%)`
                      : layer.procedural === "SHADOW"
                        ? "rgba(0,0,0,0.45)"
                        : layer.procedural === "RAIN"
                          ? "repeating-linear-gradient(115deg, transparent 0 8px, rgba(180,220,255,0.55) 8px 10px)"
                        : layer.color ?? "#333",
              borderRadius: layer.family === "SUBJECT" ? "40% 40% 30% 30%" : layer.mask ? 4 : 8,
              clipPath: clip,
              zIndex: layer.order + 1,
              pointerEvents: "none",
              boxShadow: layer.mask ? "0 0 0 3px rgba(42,26,18,0.9)" : undefined,
            }}
            title={layer.label}
          />
        );
      })}
      </div>
      <div
        style={{
          position: "absolute",
          right: 8,
          bottom: 6,
          fontSize: 9,
          fontWeight: 800,
          color: "rgba(0,255,255,0.8)",
          letterSpacing: "0.06em",
        }}
      >
        {t.toFixed(1)}s / {project.durationSec}s
      </div>
    </div>
  );
}
