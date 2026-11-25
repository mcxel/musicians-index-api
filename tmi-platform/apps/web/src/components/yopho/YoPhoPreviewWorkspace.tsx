"use client";

/**
 * Five useful preview windows — one large active, four thumbs (§6276–§6279).
 * Each window resolves the same visual through format + motion flags.
 */

import type { CSSProperties, ReactNode } from "react";
import {
  YOPHO_PREVIEW_WINDOWS,
  previewWindowById,
  resolveVisual,
  type YoPhoPreviewWindowId,
  type YoPhoVisualState,
} from "@/lib/yopho/YoPhoVisualRuntime";
import YoPhoMagicEffectOverlay from "@/components/yopho/YoPhoMagicEffectOverlay";
import YoPhoCanvasLayerStack from "@/components/yopho/YoPhoCanvasLayerStack";
import { listCanvasLayers, type YoPhoCardComposition } from "@/lib/yopho/YoPhoCardComposition";

const GOLD = "#FFD700";
const CYAN = "#00FFFF";

export default function YoPhoPreviewWorkspace({
  visual,
  activeId,
  onSelect,
  subjectUrl,
  title,
  backdropCss,
  composition,
  selectedLayerId,
  onSelectLayer,
}: {
  visual: YoPhoVisualState;
  activeId: YoPhoPreviewWindowId;
  onSelect: (id: YoPhoPreviewWindowId) => void;
  subjectUrl?: string | null;
  title?: string;
  backdropCss?: string;
  composition?: YoPhoCardComposition;
  selectedLayerId?: string | null;
  onSelectLayer?: (id: string) => void;
}) {
  const active = previewWindowById(activeId);
  const hasCanvasMedia = Boolean(composition && listCanvasLayers(composition).some((layer) => layer.srcUrl || layer.posterUrl));
  const resolved = resolveVisual(
    { ...visual, motionPlaying: active.motion && visual.motionPlaying },
    active.isFinal ? visual.primaryFormat : active.format,
    { playing: active.motion && visual.motionPlaying },
  );

  return (
    <div data-testid="yopho-preview-workspace" style={{ display: "flex", flexDirection: "column", gap: 10 }}>
      <div
        data-testid={`yopho-preview-active-${active.id}`}
        style={stageStyle(active.format === "TRADING_CARD" ? "5 / 7" : "1 / 1", true)}
      >
        <PreviewArt
          backdropCss={backdropCss}
          subjectUrl={subjectUrl}
          title={title}
          overlay={
            <YoPhoMagicEffectOverlay
              resolved={resolved}
              lighting={resolved.lighting}
              paused={!active.motion || !visual.motionPlaying}
            />
          }
          hasCanvasMedia={hasCanvasMedia}
          layers={
            hasCanvasMedia && composition ? (
              <YoPhoCanvasLayerStack
                composition={composition}
                format={active.isFinal ? visual.primaryFormat : active.format}
                selectedId={selectedLayerId}
                playing={active.motion && visual.motionPlaying}
                onSelect={onSelectLayer}
              />
            ) : null
          }
        />
        <Badge>{active.label}</Badge>
      </div>
      <div
        data-testid="yopho-preview-thumbs"
        style={{ display: "grid", gridTemplateColumns: "repeat(5, minmax(0, 1fr))", gap: 6 }}
      >
        {YOPHO_PREVIEW_WINDOWS.map((win) => {
          const r = resolveVisual(
            { ...visual, motionPlaying: win.motion && visual.motionPlaying },
            win.isFinal ? visual.primaryFormat : win.format,
            { playing: win.motion && visual.motionPlaying },
          );
          const selected = win.id === activeId;
          return (
            <button
              key={win.id}
              type="button"
              data-testid={`yopho-preview-thumb-${win.id}`}
              aria-pressed={selected}
              onClick={() => onSelect(win.id)}
              style={{
                ...stageStyle(win.format === "TRADING_CARD" ? "5 / 7" : "1 / 1", false),
                border: `2px solid ${selected ? CYAN : "rgba(255,255,255,0.18)"}`,
                cursor: "pointer",
                padding: 0,
                fontFamily: "inherit",
              }}
            >
              <PreviewArt
                backdropCss={backdropCss}
                subjectUrl={subjectUrl}
                overlay={
                  <YoPhoMagicEffectOverlay
                    resolved={r}
                    lighting={r.lighting}
                    paused={!win.motion || !visual.motionPlaying}
                  />
                }
                hasCanvasMedia={hasCanvasMedia}
                layers={
                  hasCanvasMedia && composition ? (
                    <YoPhoCanvasLayerStack
                      composition={composition}
                      format={win.isFinal ? visual.primaryFormat : win.format}
                      playing={win.motion && visual.motionPlaying}
                    />
                  ) : null
                }
              />
              <span
                style={{
                  position: "absolute",
                  bottom: 2,
                  left: 2,
                  right: 2,
                  fontSize: 7,
                  fontWeight: 800,
                  color: selected ? CYAN : "rgba(255,255,255,0.7)",
                  textAlign: "center",
                }}
              >
                {win.label}
              </span>
            </button>
          );
        })}
      </div>
    </div>
  );
}

function PreviewArt({
  backdropCss,
  subjectUrl,
  title,
  overlay,
  layers,
  hasCanvasMedia,
}: {
  backdropCss?: string;
  subjectUrl?: string | null;
  title?: string;
  overlay: ReactNode;
  layers?: ReactNode;
  hasCanvasMedia?: boolean;
}) {
  return (
    <>
      <div style={{ position: "absolute", inset: 0, background: backdropCss ?? "linear-gradient(165deg,#1a0b2e,#050510)" }} />
      {layers}
      {!hasCanvasMedia && subjectUrl ? (
        <img
          src={subjectUrl}
          alt=""
          style={{ position: "absolute", inset: 0, width: "100%", height: "100%", objectFit: "cover" }}
        />
      ) : null}
      {!hasCanvasMedia && !subjectUrl ? (
        <div
          style={{
            position: "absolute",
            inset: 0,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            fontSize: 10,
            color: "rgba(255,255,255,0.4)",
            fontWeight: 700,
          }}
        >
          Add your photo
        </div>
      ) : null}
      {overlay}
      {title ? (
        <div
          style={{
            position: "absolute",
            bottom: "12%",
            left: 8,
            right: 8,
            zIndex: 9,
            textAlign: "center",
            fontSize: 12,
            fontWeight: 900,
            color: GOLD,
            textShadow: "0 2px 8px #000",
          }}
        >
          {title}
        </div>
      ) : null}
    </>
  );
}

function Badge({ children }: { children: ReactNode }) {
  return (
    <div
      style={{
        position: "absolute",
        top: 8,
        left: 8,
        zIndex: 10,
        fontSize: 8,
        fontWeight: 900,
        letterSpacing: "0.1em",
        color: CYAN,
        background: "rgba(0,0,0,0.55)",
        border: `1px solid ${CYAN}55`,
        borderRadius: 999,
        padding: "3px 8px",
      }}
    >
      {children}
    </div>
  );
}

function stageStyle(aspect: string, large: boolean): CSSProperties {
  return {
    position: "relative",
    width: "100%",
    maxWidth: large ? 280 : undefined,
    aspectRatio: aspect,
    margin: large ? "0 auto" : undefined,
    borderRadius: large ? 12 : 6,
    overflow: "hidden",
    border: large ? `2px solid ${GOLD}66` : undefined,
    background: "#050510",
  };
}
