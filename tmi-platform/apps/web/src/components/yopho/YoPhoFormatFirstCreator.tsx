"use client";

/**
 * YoPhoFormatFirstCreator.tsx — format-first starter experience (§5560–§5601).
 *
 * Flow (§5588):
 *   CREATE YOPHO
 *   → CHOOSE FORMAT   (Trading Card 5:7 / Album Cover 1:1)  — front and center
 *   → CHOOSE LAYOUT   (format-specific gallery — §5563/§5564)
 *   → LARGE LIVE PREVIEW (real owner content — §5568/§5569)
 *   → USE THIS LAYOUT → seeds the canonical YoPho editor (§5570)
 *
 * ONE canonical YoPho identity (§5572). Format = geometry; layout = arrangement
 * inside that geometry (§5592). The starter is a base, not a lock (§5571).
 *
 * This component is self-contained and framework-light: it renders its own
 * preview from the starter's canvas geometry + owner content, and calls
 * `onApply(composition, format)` to hand the seed to the canonical editor.
 * It does NOT persist, publish, or export — that stays in the editor/save
 * authority (§5593, §5610).
 */

import { useMemo, useState } from "react";
import {
  YOPHO_FORMATS,
  getYoPhoFormat,
  type YoPhoFormat,
} from "@/lib/yopho/YoPhoFormatAuthority";
import {
  applyStarterToComposition,
  listStartersForFormat,
  type YoPhoStarterLayout,
} from "@/lib/yopho/YoPhoStarterRegistry";
import type { YoPhoCardComposition } from "@/lib/yopho/YoPhoCardComposition";
import { resolveVisual } from "@/lib/yopho/YoPhoVisualRuntime";
import YoPhoMagicEffectOverlay from "@/components/yopho/YoPhoMagicEffectOverlay";

const GOLD = "#FFD700";
const CYAN = "#00FFFF";
const FUCHSIA = "#FF2DAA";

export interface YoPhoOwnerContent {
  /** Real creator content (§5569) — never fake sample identities. */
  displayName?: string;
  artistImageUrl?: string | null;
  artworkUrl?: string | null;
  title?: string;
}

export interface YoPhoFormatFirstCreatorProps {
  ownerContent?: YoPhoOwnerContent;
  /** Called when the creator applies a layout — seeds the canonical editor. */
  onApply: (composition: YoPhoCardComposition, format: YoPhoFormat, starter: YoPhoStarterLayout) => void;
  onClose?: () => void;
}

function FormatCard({
  format,
  selected,
  onSelect,
}: {
  format: YoPhoFormat;
  selected: boolean;
  onSelect: () => void;
}) {
  const spec = getYoPhoFormat(format);
  const isCard = format === "TRADING_CARD";
  return (
    <button
      type="button"
      data-testid={`yopho-format-${format.toLowerCase()}`}
      onClick={onSelect}
      aria-pressed={selected}
      style={{
        flex: 1,
        minWidth: 0,
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        gap: 8,
        padding: 16,
        borderRadius: 12,
        border: `2px solid ${selected ? CYAN : "rgba(255,255,255,0.18)"}`,
        background: selected ? "rgba(0,255,255,0.08)" : "rgba(255,255,255,0.03)",
        cursor: "pointer",
        fontFamily: "inherit",
      }}
    >
      {/* Visual shape preview — not merely text (§5561/§5562). */}
      <div
        data-testid={`yopho-format-shape-${format.toLowerCase()}`}
        style={{
          width: isCard ? 70 : 92,
          height: isCard ? 98 : 92,
          borderRadius: isCard ? 8 : 4,
          border: `2px solid ${selected ? CYAN : "rgba(255,255,255,0.4)"}`,
          background: `linear-gradient(160deg, ${isCard ? FUCHSIA : GOLD}33, rgba(0,0,0,0.5))`,
          boxShadow: selected ? `0 0 18px ${CYAN}66` : "none",
        }}
      />
      <div style={{ fontSize: 12, fontWeight: 900, letterSpacing: "0.08em", color: "#fff", textTransform: "uppercase" }}>
        {spec.label}
      </div>
      <div style={{ fontSize: 10, color: CYAN, fontWeight: 800 }}>
        {spec.aspectRatio} · {isCard ? "PORTRAIT" : "SQUARE"}
      </div>
      <div style={{ fontSize: 9, color: "rgba(255,255,255,0.5)", textAlign: "center" }}>
        {spec.targetWidth}×{spec.targetHeight}px
      </div>
    </button>
  );
}

function LayoutThumb({
  starterLayout,
  selected,
  owner,
  onSelect,
}: {
  starterLayout: YoPhoStarterLayout;
  selected: boolean;
  owner?: YoPhoOwnerContent;
  onSelect: () => void;
}) {
  const spec = getYoPhoFormat(starterLayout.format);
  const isCard = starterLayout.format === "TRADING_CARD";
  const image = owner?.artworkUrl ?? owner?.artistImageUrl ?? null;
  return (
    <button
      type="button"
      data-testid={`yopho-layout-${starterLayout.id}`}
      onClick={onSelect}
      aria-pressed={selected}
      style={{
        display: "flex",
        flexDirection: "column",
        gap: 6,
        padding: 8,
        borderRadius: 10,
        border: `2px solid ${selected ? GOLD : "rgba(255,255,255,0.15)"}`,
        background: selected ? "rgba(255,215,0,0.08)" : "rgba(255,255,255,0.03)",
        cursor: "pointer",
        fontFamily: "inherit",
        minWidth: 0,
      }}
    >
      <div
        style={{
          position: "relative",
          width: "100%",
          aspectRatio: isCard ? "5 / 7" : "1 / 1",
          borderRadius: 6,
          overflow: "hidden",
          border: "1px solid rgba(255,255,255,0.2)",
          background: starterLayout.isBlank
            ? "rgba(0,0,0,0.5)"
            : `linear-gradient(160deg, ${CYAN}22, ${FUCHSIA}22)`,
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
        }}
      >
        {image && !starterLayout.isBlank ? (
          <img src={image} alt="" style={{ width: "100%", height: "100%", objectFit: "cover" }} />
        ) : (
          <span style={{ fontSize: 9, color: "rgba(255,255,255,0.4)", fontWeight: 700 }}>
            {starterLayout.isBlank ? "BLANK" : starterLayout.family}
          </span>
        )}
        {starterLayout.textOverlay.text ? (
          <span
            style={{
              position: "absolute",
              bottom: 6,
              left: 0,
              right: 0,
              textAlign: "center",
              fontSize: 9,
              fontWeight: 900,
              color: starterLayout.textOverlay.color,
              textShadow: "0 1px 4px rgba(0,0,0,0.9)",
            }}
          >
            {starterLayout.textOverlay.text}
          </span>
        ) : null}
      </div>
      <div style={{ fontSize: 10, fontWeight: 800, color: "#fff" }}>{starterLayout.label}</div>
      <div style={{ fontSize: 8, color: "rgba(255,255,255,0.45)", lineHeight: 1.3 }}>
        {spec.aspectRatio} · {starterLayout.family}
      </div>
    </button>
  );
}

export default function YoPhoFormatFirstCreator({
  ownerContent,
  onApply,
  onClose,
}: YoPhoFormatFirstCreatorProps) {
  const [format, setFormat] = useState<YoPhoFormat>("TRADING_CARD");
  const starters = useMemo(() => listStartersForFormat(format), [format]);
  const [starterId, setStarterId] = useState<string>(starters[0]?.id ?? "");
  const selectedStarter = useMemo(
    () => starters.find((s) => s.id === starterId) ?? starters[0],
    [starters, starterId],
  );
  const spec = getYoPhoFormat(format);

  const handleFormat = (next: YoPhoFormat) => {
    setFormat(next);
    // Reset selection to the new format's first (BLANK) starter — §5567.
    const nextStarters = listStartersForFormat(next);
    setStarterId(nextStarters[0]?.id ?? "");
  };

  const handleApply = () => {
    if (!selectedStarter) return;
    const composition = applyStarterToComposition(selectedStarter, { canvasWidth: 360 });
    onApply(composition, format, selectedStarter);
  };

  const previewImage = ownerContent?.artworkUrl ?? ownerContent?.artistImageUrl ?? null;
  const previewName = ownerContent?.displayName ?? "Your Name";
  const previewTitle = ownerContent?.title ?? selectedStarter?.textOverlay.text ?? "";

  return (
    <div
      data-testid="yopho-format-first-creator"
      style={{ display: "flex", flexDirection: "column", gap: 16, fontFamily: "inherit" }}
    >
      <div style={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between", gap: 12 }}>
        <div>
          <div style={{ fontSize: 14, fontWeight: 900, letterSpacing: "0.08em", color: GOLD, textTransform: "uppercase" }}>
            What kind of YoPho do you want to start with?
          </div>
          <div style={{ fontSize: 11, color: "rgba(255,255,255,0.55)" }}>
            Choose a format, then a layout built for that shape. One YoPho — both formats stay exportable.
          </div>
        </div>
        {onClose ? (
          <button type="button" onClick={onClose} aria-label="Close" style={{ background: "none", border: "none", color: "#9aa", cursor: "pointer", fontSize: 18 }}>
            ✕
          </button>
        ) : null}
      </div>

      {/* STEP 1 — CHOOSE FORMAT (§5561/§5562 front and center) */}
      <div data-testid="yopho-format-choice" style={{ display: "flex", gap: 12 }}>
        {YOPHO_FORMATS.map((f) => (
          <FormatCard key={f.format} format={f.format} selected={format === f.format} onSelect={() => handleFormat(f.format)} />
        ))}
      </div>

      {/* STEP 2 + 3 — layout gallery + large preview side-by-side on desktop */}
      <div
        style={{
          display: "grid",
          gridTemplateColumns: "repeat(auto-fit, minmax(240px, 1fr))",
          gap: 16,
          alignItems: "start",
        }}
      >
        <div>
          <div style={{ fontSize: 10, fontWeight: 900, letterSpacing: "0.12em", color: CYAN, textTransform: "uppercase", marginBottom: 8 }}>
            Choose your layout — {spec.label}
          </div>
          <div
            data-testid="yopho-layout-gallery"
            style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(96px, 1fr))", gap: 10 }}
          >
            {starters.map((s) => (
              <LayoutThumb
                key={s.id}
                starterLayout={s}
                selected={selectedStarter?.id === s.id}
                owner={ownerContent}
                onSelect={() => setStarterId(s.id)}
              />
            ))}
          </div>
        </div>

        {/* LARGE LIVE PREVIEW (§5568) with real owner content (§5569) */}
        <div>
          <div style={{ fontSize: 10, fontWeight: 900, letterSpacing: "0.12em", color: CYAN, textTransform: "uppercase", marginBottom: 8 }}>
            Preview
          </div>
          <div
            data-testid="yopho-layout-preview"
            style={{
              position: "relative",
              width: "100%",
              maxWidth: format === "TRADING_CARD" ? 260 : 320,
              aspectRatio: format === "TRADING_CARD" ? "5 / 7" : "1 / 1",
              margin: "0 auto",
              borderRadius: 12,
              overflow: "hidden",
              border: `2px solid ${GOLD}66`,
              background: selectedStarter?.isBlank
                ? "rgba(0,0,0,0.6)"
                : `linear-gradient(165deg, ${CYAN}2b, ${FUCHSIA}2b 55%, rgba(0,0,0,0.7))`,
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
            }}
          >
            {previewImage && !selectedStarter?.isBlank ? (
              <img src={previewImage} alt="" style={{ position: "absolute", inset: 0, width: "100%", height: "100%", objectFit: "cover" }} />
            ) : null}
            {selectedStarter?.visual ? (
              <YoPhoMagicEffectOverlay
                resolved={resolveVisual(selectedStarter.visual, format)}
                lighting={selectedStarter.visual.lighting}
                paused={false}
              />
            ) : null}
            <div style={{ position: "relative", zIndex: 1, textAlign: "center", padding: 12 }}>
              {previewTitle ? (
                <div style={{ fontSize: 18, fontWeight: 900, color: selectedStarter?.textOverlay.color ?? "#fff", textShadow: "0 2px 8px rgba(0,0,0,0.9)" }}>
                  {previewTitle}
                </div>
              ) : null}
              <div style={{ fontSize: 12, fontWeight: 800, color: "#fff", textShadow: "0 1px 6px rgba(0,0,0,0.9)", marginTop: 4 }}>
                {previewName}
              </div>
            </div>
            <div
              style={{
                position: "absolute",
                bottom: 0,
                left: 0,
                right: 0,
                height: `${(selectedStarter ? 10 : 10)}%`,
                background: "rgba(0,0,0,0.55)",
                borderTop: "1px solid rgba(255,255,255,0.15)",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                fontSize: 8,
                fontWeight: 800,
                color: GOLD,
                letterSpacing: "0.1em",
              }}
            >
              TMI × YOPHO
            </div>
          </div>
          <div style={{ fontSize: 9, color: "rgba(255,255,255,0.45)", textAlign: "center", marginTop: 6 }}>
            {spec.label} · {spec.aspectRatio} · exports {spec.targetWidth}×{spec.targetHeight}px
          </div>
        </div>
      </div>

      {/* STEP 4 — USE THIS LAYOUT (§5570) */}
      <div style={{ display: "flex", gap: 10, alignItems: "center" }}>
        <button
          type="button"
          data-testid="yopho-use-this-layout"
          onClick={handleApply}
          disabled={!selectedStarter}
          style={{
            padding: "12px 22px",
            borderRadius: 10,
            border: `1px solid ${GOLD}`,
            background: GOLD,
            color: "#050510",
            fontSize: 12,
            fontWeight: 900,
            letterSpacing: "0.08em",
            cursor: selectedStarter ? "pointer" : "not-allowed",
            fontFamily: "inherit",
            opacity: selectedStarter ? 1 : 0.5,
          }}
        >
          USE THIS LAYOUT
        </button>
        <span style={{ fontSize: 10, color: "rgba(255,255,255,0.5)" }}>
          {selectedStarter?.isBlank
            ? "Start from a blank canvas with correct dimensions."
            : `Start from the ${selectedStarter?.label} ${spec.label.toLowerCase()} layout — then customize it as your base.`}
        </span>
      </div>
    </div>
  );
}
