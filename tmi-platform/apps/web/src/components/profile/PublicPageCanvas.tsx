"use client";

import { useEffect, useRef, useState } from "react";

import type { DocumentPreviewPresentation, PublicPagePresentationEntry } from "@/lib/publicPage/presentPublicPageDocument";
import { HEART_CLIP_ID, HEART_CONTOUR_PATH, publicPageShape, rectangularCardFrameAllowed } from "@/lib/publicPage/publicPageShapes";
import { WRITING_UNIT_PX, writingContentPx } from "@/lib/publicPage/pageStudio";
import type { MediaTile, PublicPagePerformanceTier, PublicPageSectionLayout } from "@/lib/publicPage/publicPageDocument";
import { governPlayback, patternBackgroundImage, previewEmbed, previewHref, sceneBackground } from "@/lib/publicPage/publicPageComposition";
import type { PublicPageSectionHeight } from "@/lib/publicPage/publicPageDocument";

function gridFor(layout: PublicPageSectionLayout, construction: boolean): React.CSSProperties {
  const grid = unscopedGrid(layout);
  if (construction || grid.minHeight == null) return grid;
  const rest = { ...grid };
  delete rest.minHeight;
  return rest;
}

function unscopedGrid(layout: PublicPageSectionLayout): React.CSSProperties {
  switch (layout) {
    case "SPLIT_V_50":
    case "TWO_COLUMN":
      return { display: "grid", gridTemplateColumns: "1fr 1fr", gap: 16 };
    case "SPLIT_V_35_65":
    case "ASYMMETRIC":
      return { display: "grid", gridTemplateColumns: "minmax(280px, 0.4fr) 1fr", gap: 16 };
    case "SPLIT_V_65_35":
      return { display: "grid", gridTemplateColumns: "1fr minmax(280px, 0.4fr)", gap: 16 };
    case "SIDEBAR_LEFT":
      return { display: "grid", gridTemplateColumns: "minmax(280px, 360px) 1fr", gap: 16 };
    case "SIDEBAR_RIGHT":
      return { display: "grid", gridTemplateColumns: "1fr minmax(280px, 360px)", gap: 16 };
    case "THREE_COLUMN":
      return { display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: 12 };
    case "SPLIT_H_50":
      return { display: "grid", gridTemplateRows: "1fr 1fr", gap: 12, minHeight: 720 };
    case "SPLIT_H_35_65":
    case "HERO_STRIP":
      return { display: "grid", gridTemplateRows: "0.4fr 1fr", gap: 12, minHeight: 720 };
    case "SPLIT_H_65_35":
      return { display: "grid", gridTemplateRows: "1fr 0.4fr", gap: 12, minHeight: 720 };
    case "QUAD":
    case "MOSAIC":
      return { display: "grid", gridTemplateColumns: "1fr 1fr", gridTemplateRows: "1fr 1fr", gap: 12, minHeight: 720 };
    case "GALLERY":
      return { display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(180px, 1fr))", gap: 12 };
    case "COLLAGE":
    case "FREEFORM":
      return { position: "relative", minHeight: 720 };
    case "CENTER_STAGE":
      return { display: "grid", justifyItems: "center" };
    default:
      return { display: "grid", gridTemplateColumns: "1fr", gap: 12 };
  }
}

function mediaFrame(tile: MediaTile, picture?: string): React.CSSProperties {
  const fit = tile.fit ?? "COVER";
  const pattern = tile.source === "PATTERN" ? patternBackgroundImage(tile.assetId ?? "") : null;
  const paint: React.CSSProperties = {
    position: "absolute",
    backgroundColor: tile.colorHex ?? "transparent",
    backgroundPosition: `${tile.focalX ?? 50}% ${tile.focalY ?? 50}%`,
    opacity: (tile.opacity ?? 100) / 100,
    filter: `blur(${tile.blur ?? 0}px) brightness(${tile.brightness ?? 1}) contrast(${tile.contrast ?? 1}) saturate(${tile.saturation ?? 1})`,
    borderRadius: tile.mask === "CIRCLE" ? "50%" : tile.mask === "ROUNDED" || tile.mask === "POLAROID" ? 24 : 0,
    mixBlendMode: tile.blend === "MULTIPLY" ? "multiply" : tile.blend === "SCREEN" ? "screen" : tile.blend === "OVERLAY" ? "overlay" : tile.blend === "LUMINOSITY" ? "luminosity" : "normal",
  };
  if (pattern) {
    const cell = Math.max(8, Math.round((tile.speed ?? 0.8) * 40));
    const repeat = fit === "REPEAT_X" ? "repeat-x" : fit === "REPEAT_Y" ? "repeat-y" : "repeat";
    const size = pattern.size === "auto"
      ? "auto"
      : pattern.image.includes("), linear-gradient")
        ? `${cell}px ${cell}px, ${cell}px ${cell}px`
        : `${cell}px ${cell}px`;
    return { ...paint, inset: 0, backgroundImage: pattern.image, backgroundRepeat: repeat, backgroundSize: size };
  }
  if (fit === "TILE" || fit === "REPEAT_X" || fit === "REPEAT_Y") {
    return {
      ...paint,
      inset: 0,
      backgroundImage: picture ? `url("${picture.replace(/"/g, "")}")` : undefined,
      backgroundRepeat: fit === "REPEAT_X" ? "repeat-x" : fit === "REPEAT_Y" ? "repeat-y" : "repeat",
      backgroundSize: "auto",
    };
  }
  if (fit === "COVER" || fit === "STRETCH") return { ...paint, inset: 0 };
  const frameW = tile.frameW ?? (fit === "ORIGINAL" ? 42 : 72);
  const frameH = tile.frameH ?? (fit === "ORIGINAL" ? 56 : 84);
  const frameX = tile.frameX ?? Math.max(0, (100 - frameW) / 2);
  const frameY = tile.frameY ?? Math.max(0, (100 - frameH) / 2);
  return { ...paint, left: `${frameX}%`, top: `${frameY}%`, width: `${frameW}%`, height: `${frameH}%` };
}

function objectFitFor(tile: MediaTile): React.CSSProperties["objectFit"] {
  if (tile.fit === "CONTAIN" || tile.fit === "CUSTOM" || tile.fit === "ORIGINAL") return "contain";
  if (tile.fit === "STRETCH") return "fill";
  return "cover";
}

function LoopSurface({ tile, tier, resolvedSrc }: { tile: MediaTile; tier: PublicPagePerformanceTier; resolvedSrc?: string }) {
  const ref = useRef<HTMLVideoElement>(null);
  const [inView, setInView] = useState(false);
  const [reduced, setReduced] = useState(false);
  useEffect(() => {
    const media = window.matchMedia("(prefers-reduced-motion: reduce)");
    const apply = () => setReduced(media.matches);
    apply();
    media.addEventListener("change", apply);
    return () => media.removeEventListener("change", apply);
  }, []);
  useEffect(() => {
    const node = ref.current;
    if (!node) return;
    const observer = new IntersectionObserver(([entry]) => setInView(entry.isIntersecting), { rootMargin: "160px" });
    observer.observe(node);
    return () => observer.disconnect();
  }, []);
  const decision = governPlayback({
    tier: tier ?? "RICH",
    inView,
    reducedMotion: reduced,
    activeLoops: inView ? 0 : 1,
    source: tile.source,
  });
  useEffect(() => {
    const node = ref.current;
    if (!node) return;
    if (decision.decode) {
      void node.play().catch(() => undefined);
    } else {
      node.pause();
    }
  }, [decision.decode]);
  const picture = tile.deliveryPath || resolvedSrc;
  const showVideo = tile.source === "VIDEO_LOOP" && picture && decision.decode;
  const repeating = tile.fit === "TILE" || tile.fit === "REPEAT_X" || tile.fit === "REPEAT_Y";
  return (
    <div data-testid={`media-tile-${tile.tileId}`} data-bg-fit={tile.fit ?? "COVER"} data-bg-asset={tile.assetId ?? ""} data-source={tile.source} data-decoding={decision.decode ? "true" : "false"} data-poster-fallback={decision.usePoster ? "true" : "false"} style={mediaFrame(tile, picture)}>
      {showVideo ? (
        <video
          ref={ref}
          muted
          loop
          playsInline
          poster={tile.posterPath}
          src={picture}
          style={{ width: "100%", height: "100%", objectFit: objectFitFor(tile), objectPosition: `${tile.focalX ?? 50}% ${tile.focalY ?? 50}%` }}
        />
      ) : !repeating && picture && (tile.source === "IMAGE" || tile.source === "ANIMATED_IMAGE") ? (
        <img alt="" src={picture} style={{ width: "100%", height: "100%", objectFit: objectFitFor(tile), objectPosition: `${tile.focalX ?? 50}% ${tile.focalY ?? 50}%` }} />
      ) : repeating ? null : (
        <div
          data-testid={`media-poster-${tile.tileId}`}
          style={{
            position: "absolute",
            inset: 0,
            background:
              tile.source === "COLOR" || tile.source === "PATTERN"
                ? "transparent"
                : "linear-gradient(160deg, rgba(255,255,255,0.08), rgba(5,5,16,0.2))",
          }}
        />
      )}
      {tile.overlayHex && tile.overlayOpacity ? (
        <div style={{ position: "absolute", inset: 0, background: tile.overlayHex, opacity: (tile.overlayOpacity ?? 0) / 100, pointerEvents: "none" }} />
      ) : null}
    </div>
  );
}

function fontStack(token: string | undefined): string {
  if (token === "EDITORIAL") return "Georgia, 'Times New Roman', serif";
  if (token === "MONO") return "ui-monospace, Consolas, monospace";
  if (token === "DISPLAY") return "Impact, 'Arial Black', sans-serif";
  if (token === "GROTESK") return "Arial, 'Helvetica Neue', sans-serif";
  if (token === "SCRIPT") return "'Segoe Script', 'Brush Script MT', cursive";
  if (token === "CONDENSED") return "'Arial Narrow', 'Franklin Gothic Medium', sans-serif";
  if (token === "ROUNDED") return "Verdana, 'Segoe UI', sans-serif";
  return "system-ui, sans-serif";
}

function typeSize(entry: PublicPagePresentationEntry): number {
  const scale = entry.style.sizeScale;
  if (scale === "XL") return 64;
  if (scale === "LG") return 36;
  if (scale === "SM") return 16;
  if (scale === "XS") return 13;
  if (scale === "MD") return 22;
  if (entry.kind === "HEADING") return 56;
  if (entry.kind === "QUOTE" || entry.kind === "POEM") return 32;
  if (entry.kind === "LONG_FORM_WRITING") return 22;
  return 18;
}

function motionName(entry: PublicPagePresentationEntry, flickerPlace: "MOTTO" | "OFF"): string {
  if (entry.style.motionPreset) return entry.style.motionPreset;
  if (flickerPlace === "MOTTO" && (entry.kind === "STATUS_LINE" || entry.kind === "QUOTE")) return "flicker";
  return "none";
}

const SERVICE_LABEL: Record<string, string> = {
  SPOTIFY: "Spotify",
  APPLE_MUSIC: "Apple Music",
  PANDORA: "Pandora",
  YOUTUBE: "YouTube",
  TMI_PLAYLIST: "TMI playlist",
  INSTAGRAM: "Instagram",
  FACEBOOK: "Facebook",
  TIKTOK: "TikTok",
  SNAPCHAT: "Snapchat",
  KICK: "Kick",
  TWITCH: "Twitch",
};

const MAGNET_UNITS = 96;

const DECORATION_KINDS = new Set([
  "SHAPE", "STICKER", "FRAME", "DIVIDER", "BADGE", "PATTERN", "TEXTURE", "SPARKLE", "LIGHT", "ORNAMENT",
]);

const CONNECTED_MEDIA = new Set([
  "PHOTO", "PHOTO_GALLERY", "TRACK", "PLAYLIST", "VIDEO_SNIP", "YOPHO", "MEMBER_SPOTLIGHT", "LIVE_PRESENCE",
]);

const HONEST_MEDIA: Record<string, string> = {
  PHOTO: "Photo · not connected",
  PHOTO_GALLERY: "Gallery · not connected",
  TRACK: "Song · not connected",
  PLAYLIST: "Playlist · not connected",
  VIDEO_SNIP: "Snip · not connected",
  YOPHO: "YoPho · not connected",
  MEMBER_SPOTLIGHT: "My People · not connected",
  LIVE_PRESENCE: "Live · not connected",
};

function magnetFrame(entry: PublicPagePresentationEntry, contentGrid = false): React.CSSProperties {
  const auto = entry.style.textFit === "AUTO";
  if (!contentGrid) {
    return {
      position: "absolute",
      left: `${(entry.bounds.x / MAGNET_UNITS) * 100}%`,
      top: `${(entry.bounds.y / MAGNET_UNITS) * 100}%`,
      width: `${(entry.bounds.w / MAGNET_UNITS) * 100}%`,
      height: `${(entry.bounds.h / MAGNET_UNITS) * 100}%`,
      zIndex: entry.bounds.z + 2,
    };
  }
  return {
    position: "absolute",
    left: `${(entry.bounds.x / MAGNET_UNITS) * 100}%`,
    top: entry.bounds.y * WRITING_UNIT_PX,
    width: `${(entry.bounds.w / MAGNET_UNITS) * 100}%`,
    height: auto ? "auto" : entry.bounds.h * WRITING_UNIT_PX,
    minHeight: auto ? writingContentPx(entry.plainText ?? "", entry.bounds.w) : undefined,
    zIndex: entry.bounds.z + 2,
  };
}

function frameStroke(preset: string | undefined): number {
  if (preset === "THIN") return 3;
  if (preset === "HEAVY") return 10;
  if (preset === "NEON") return 4;
  return 0;
}

function shapeOutline(mask: string | undefined): { kind: "polygon" | "ellipse" | "rect" | "path"; points?: string; d?: string } {
  const clip = publicPageShape(mask)?.clipPath;
  if (clip === `url(#${HEART_CLIP_ID})`) return { kind: "path", d: HEART_CONTOUR_PATH };
  if (clip?.startsWith("polygon(") && clip.endsWith(")")) {
    const points = clip.slice("polygon(".length, -1).split(",").map((pair) => pair.trim().replace(/%/g, "")).join(" ");
    return { kind: "polygon", points };
  }
  if (mask === "CIRCLE" || mask === "OVAL" || mask === "PILL") return { kind: "ellipse" };
  return { kind: "rect" };
}

function safeLibraryUrl(url: string): string | null {
  if (/^https?:\/\//i.test(url)) return url;
  if (/^\/(?!\/)(?!.*\.\.)[A-Za-z0-9_./ -]+$/.test(url)) return url;
  if (/^data:image\/(jpeg|png|webp|gif);base64,[A-Za-z0-9+/=\s]+$/i.test(url) && url.length < 14_000_000) return url;
  return null;
}

function maskPaint(mask: string | undefined): React.CSSProperties {
  const shape = mask ? publicPageShape(mask) : null;
  if (shape) {
    return {
      borderRadius: shape.clipPath ? undefined : shape.radius,
      clipPath: shape.clipPath,
    };
  }
  switch (mask) {
    case "CIRCLE":
    case "RECORD":
      return { borderRadius: "50%" };
    case "OVAL":
      return { borderRadius: "50% / 42%" };
    case "RECTANGLE":
      return { borderRadius: 0 };
    case "ARCH":
      return { borderRadius: "999px 999px 8px 8px" };
    case "POSTER":
      return { borderRadius: 2 };
    case "POLAROID":
      return { borderRadius: 4, padding: "6% 6% 18%" };
    case "HEART":
      return { clipPath: `url(#${HEART_CLIP_ID})` };
    case "STAR":
      return { clipPath: "polygon(50% 0%, 61% 35%, 98% 35%, 68% 57%, 79% 91%, 50% 70%, 21% 91%, 32% 57%, 2% 35%, 39% 35%)" };
    default:
      return { borderRadius: 16 };
  }
}

function PreviewWindow({ entry, accent, construction }: { entry: PublicPagePresentationEntry; accent: string; construction: boolean }) {
  const link = entry.mediaLink;
  if (!link) return null;
  const embed = previewEmbed(link);
  const href = previewHref(link);
  if (!construction && !embed && !href) return null;
  const label = SERVICE_LABEL[link.service] ?? link.service;
  const free = entry.placement === "MAGNET";
  const frame: React.CSSProperties = {
    ...(free ? magnetFrame(entry) : { position: "relative", width: "100%", minHeight: 120, margin: "12px 0" }),
    overflow: "hidden",
    border: `1px solid ${accent}`,
    background: "rgba(5,5,16,0.72)",
    boxShadow: `0 0 22px ${accent}`,
    ...maskPaint(entry.style.mask),
  };
  return (
    <div
      data-testid={`preview-window-${entry.blockId}`}
      data-block-id={entry.blockId}
      data-kind={entry.kind}
      data-magnet={free ? "true" : "false"}
      data-service={link.service}
      data-shape={entry.style.mask ?? "ROUNDED"}
      data-w={entry.bounds.w}
      data-h={entry.bounds.h}
      style={frame}
    >
      {embed ? (
        <iframe
          title={label}
          src={embed}
          style={{ width: "100%", height: "100%", border: 0 }}
          sandbox="allow-scripts allow-same-origin allow-popups allow-presentation"
          referrerPolicy="strict-origin-when-cross-origin"
          loading="lazy"
        />
      ) : href ? (
        <a href={href} target="_blank" rel="noreferrer" style={{ display: "grid", placeItems: "center", width: "100%", height: "100%", color: "#f4f1ff", textDecoration: "none" }}>
          {label}
        </a>
      ) : (
        <p style={{ margin: 0, display: "grid", placeItems: "center", width: "100%", height: "100%", color: accent }}>{label}</p>
      )}
    </div>
  );
}

function BlockFace({
  entry,
  accent,
  flickerPlace,
  construction,
  selected,
  onSelectBlock,
  onMagnetPointerDown,
  onMagnetPointerMove,
  onMagnetPointerUp,
  contentGrid = false,
  mediaUrl,
  adjusting = false,
  onBeginAdjust,
  editingBlockId,
  onUpdateBlockText,
  onSetEditingBlockId,
  surfaceColorHex,
}: {
  entry: PublicPagePresentationEntry;
  accent: string;
  flickerPlace: "MOTTO" | "OFF";
  construction: boolean;
  selected?: boolean;
  onSelectBlock?: (blockId: string) => void;
  onMagnetPointerDown?: (blockId: string, mode: "move" | "resize" | "rotate", event: React.PointerEvent<HTMLElement>) => void;
  onMagnetPointerMove?: (event: React.PointerEvent<HTMLElement>) => void;
  onMagnetPointerUp?: () => void;
  contentGrid?: boolean;
  mediaUrl?: string;
  adjusting?: boolean;
  onBeginAdjust?: (blockId: string) => void;
  editingBlockId?: string | null;
  onUpdateBlockText?: (blockId: string, text: string) => void;
  onSetEditingBlockId?: (blockId: string | null) => void;
  surfaceColorHex?: string | null;
}) {
  if (entry.disposition === "CAPABILITY_DENIED" || entry.disposition === "SUPPRESSED_UNSAFE_TEXT") return null;
  if (entry.mediaLink) return <PreviewWindow entry={entry} accent={accent} construction={construction} />;
  const text = (entry.plainText ?? "").trim();
  const decoration = DECORATION_KINDS.has(entry.kind);
  const connected = CONNECTED_MEDIA.has(entry.kind);
  if (!construction && text.length === 0 && !decoration && !connected) return null;
  const motion = motionName(entry, flickerPlace);
  const free = entry.placement === "MAGNET";
  const boxed = construction || decoration || connected || (entry.style.backgroundTreatment != null && entry.style.backgroundTreatment !== "NONE");
  const edge = entry.style.borderWidthPx ?? 0;
  const solidLight = entry.style.backgroundTreatment === "SOLID" && entry.style.skinRef === "card_light";
  const glass = entry.style.backgroundTreatment === "GLASS";
  const fill = decoration && entry.style.colorHex
    ? entry.style.colorHex
    : solidLight
      ? "#F4F1FF"
      : entry.style.backgroundTreatment === "SOLID"
        ? "rgba(8,8,12,0.92)"
        : entry.style.backgroundTreatment === "GRADIENT"
          ? `linear-gradient(145deg, ${entry.style.colorHex ?? accent}, transparent)`
          : glass
            ? "rgba(8,10,18,0.46)"
            : boxed
              ? "rgba(5,5,16,0.72)"
              : "transparent";
  const isSurfaceLight = (surfaceColorHex ?? "#FFFFFF").toUpperCase() === "#FFFFFF";
  const defaultTextInk = isSurfaceLight ? "#111111" : "#f4f1ff";
  const ink = solidLight && (entry.style.colorHex == null || entry.style.colorHex.toUpperCase() === "#F4F1FF" || entry.style.colorHex.toUpperCase() === "#FFFFFF")
    ? "#140018"
    : (entry.style.colorHex ?? (solidLight ? "#140018" : defaultTextInk));
  const style: React.CSSProperties = {
    ...(free ? magnetFrame(entry, contentGrid) : { position: "relative", margin: "12px 0" }),
    color: ink,
    backdropFilter: glass ? "blur(12px)" : undefined,
    fontFamily: fontStack(entry.style.fontPairingId),
    fontSize: typeSize(entry),
    fontWeight: entry.style.weight === "BOLD" || entry.kind === "HEADING" ? 700 : entry.style.weight === "MEDIUM" ? 500 : 500,
    textAlign: entry.style.align === "CENTER" ? "center" : entry.style.align === "END" ? "right" : "left",
    letterSpacing: entry.style.letterSpacingEm ? `${entry.style.letterSpacingEm}em` : entry.kind === "HEADING" ? "0.04em" : undefined,
    lineHeight: entry.style.lineHeight ?? 1.25,
    maxWidth: free ? undefined : entry.style.maxWidthCh ? `${entry.style.maxWidthCh}ch` : entry.kind === "LONG_FORM_WRITING" ? "65ch" : undefined,
    padding: boxed ? (free ? 8 : "16px 18px") : 0,
    border: selected
      ? "2px solid #FFD700"
      : edge > 0
        ? `${edge}px solid ${entry.style.colorHex ?? accent}`
        : boxed
          ? `1px solid ${accent}`
          : "none",
    background: fill,
    opacity: entry.style.opacity ?? 1,
    boxShadow: entry.style.textGlow || motion === "flicker" || edge > 0
      ? `0 0 12px ${entry.style.colorHex ?? accent}, 0 0 28px ${entry.style.colorHex ?? accent}`
      : boxed
        ? "0 10px 30px rgba(0,0,0,0.28)"
        : undefined,
    textShadow: entry.style.backgroundTreatment === "SOLID" ? undefined : entry.style.textGlow || motion === "flicker" ? `0 0 18px ${entry.style.colorHex ?? accent}` : entry.style.textShadow ? "0 2px 0 #000" : undefined,
    WebkitTextStroke: entry.style.outline ? "1px #fff" : undefined,
    transform: entry.style.rotationDeg ? `rotate(${entry.style.rotationDeg}deg)` : undefined,
    overflow: entry.style.textFit === "FIXED" ? "auto" : entry.style.textFit === "AUTO" ? "visible" : "hidden",
    pointerEvents: construction ? "auto" : "none",
    ...maskPaint(boxed || entry.style.mask ? entry.style.mask : undefined),
  };
  const gesture = construction ? {
    onClick: (event: React.MouseEvent<HTMLElement>) => {
      event.stopPropagation();
      onSelectBlock?.(entry.blockId);
    },
    onPointerDown: (event: React.PointerEvent<HTMLElement>) => {
      event.stopPropagation();
      onSelectBlock?.(entry.blockId);
      onMagnetPointerDown?.(entry.blockId, "move", event);
    },
    onPointerMove: onMagnetPointerMove,
    onPointerUp: onMagnetPointerUp,
    onDoubleClick: (event: React.MouseEvent<HTMLElement>) => {
      event.stopPropagation();
      if (mediaUrl) {
        onBeginAdjust?.(entry.blockId);
      } else if (construction) {
        onSetEditingBlockId?.(entry.blockId);
      }
    },
  } : {};
  const fit = entry.style.mediaFit ?? "FILL";
  const zoom = entry.style.mediaZoom ?? 1;
  const focalX = entry.style.mediaFocalX ?? 0.5;
  const focalY = entry.style.mediaFocalY ?? 0.5;
  const frame = entry.style.framePreset ?? "NONE";
  const stroke = frameStroke(frame);
  const outline = shapeOutline(entry.style.mask);
  const rectangularFrame = rectangularCardFrameAllowed(entry.style.mask);
  const cardChrome = rectangularFrame && (frame === "POLAROID" || frame === "CARD");
  const contourFollows = outline.kind === "path" || outline.kind === "polygon" || outline.kind === "ellipse";
  const contourStroke = !rectangularFrame && contourFollows && (frame === "POLAROID" || frame === "CARD")
    ? (frame === "POLAROID" ? 8 : 6)
    : stroke;
  const chromeInset = frame === "POLAROID" ? "8px 8px 36px" : frame === "CARD" ? "8px" : "0";
  const mediaPaint: React.CSSProperties = mediaUrl
    ? {
        ...style,
        clipPath: undefined,
        overflow: "visible",
        ...(cardChrome
          ? { background: "#f4f1ff", padding: chromeInset, borderRadius: 4, boxShadow: "0 12px 28px rgba(0,0,0,0.38)" }
          : contourFollows
            ? { background: "transparent", border: "none", boxShadow: "none", padding: 0 }
            : {}),
      }
    : style;
  const honest = connected && !mediaUrl && text.length === 0 ? (HONEST_MEDIA[entry.kind] ?? `${entry.kind} · not connected`) : null;
  const writing = entry.kind === "LONG_FORM_WRITING" || entry.kind === "NOTE" || entry.kind === "QUOTE" || entry.kind === "POEM";
  const title = writing && entry.a11y.label && entry.a11y.label !== entry.kind ? entry.a11y.label : "";
  const body = text || honest || (decoration || writing ? "" : entry.kind);
  const inset = publicPageShape(entry.style.mask)?.inset;
  if ((free || decoration || connected) && entry.kind !== "DIVIDER") {
    return (
      <div
        data-testid={`published-magnet-${entry.blockId}`}
        data-block-id={entry.blockId}
        data-magnet={free ? "true" : "false"}
        data-kind={entry.kind}
        data-role={entry.kind === "FRAME" ? "CONTAINER" : decoration ? "DECORATION" : "CONTENT"}
        data-shape={entry.style.mask ?? "ROUNDED"}
        data-text-fit={entry.style.textFit ?? ""}
        data-title={title}
        data-x={entry.bounds.x}
        data-y={entry.bounds.y}
        data-w={entry.bounds.w}
        data-h={entry.bounds.h}
        data-z={entry.bounds.z}
        data-authority={entry.binding?.authority ?? ""}
        data-record-id={entry.binding?.recordId ?? ""}
        data-connected={mediaUrl ? "true" : honest ? "false" : "true"}
        data-fit={mediaUrl ? fit : ""}
        data-zoom={mediaUrl ? zoom : ""}
        data-focal-x={mediaUrl ? focalX : ""}
        data-focal-y={mediaUrl ? focalY : ""}
        data-frame={mediaUrl ? frame : ""}
        data-adjusting={adjusting ? "true" : "false"}
        style={mediaPaint}
        {...gesture}
      >
        <div style={{ padding: mediaUrl ? 0 : (inset ?? (boxed ? 8 : 0)), minHeight: "100%", boxSizing: "border-box", height: mediaUrl ? "100%" : undefined, position: "relative" }}>
          {mediaUrl && adjusting ? (
            <img alt="" src={mediaUrl} data-ghost="true" style={{ position: "absolute", inset: 0, width: "100%", height: "100%", objectFit: "contain", opacity: 0.3 }} />
          ) : null}
          {mediaUrl ? (
            <div
              data-cookie-cutter="true"
              data-testid={`media-mask-${entry.blockId}`}
              style={{ position: "absolute", inset: cardChrome ? chromeInset : 0, overflow: "hidden", ...maskPaint(entry.style.mask) }}
            >
              {entry.kind === "VIDEO_SNIP" ? (
                <video
                  src={mediaUrl}
                  muted
                  playsInline
                  style={{ width: "100%", height: "100%", objectFit: fit === "FIT" ? "contain" : "cover", objectPosition: `${focalX * 100}% ${focalY * 100}%`, transform: `scale(${zoom}) rotate(${entry.style.mediaRotationDeg ?? 0}deg) scaleX(${entry.style.mediaFlipX ? -1 : 1})`, transformOrigin: `${focalX * 100}% ${focalY * 100}%` }}
                />
              ) : (
                <img
                  alt={title || "Photo"}
                  src={mediaUrl}
                  style={{ width: "100%", height: "100%", objectFit: fit === "FIT" ? "contain" : "cover", objectPosition: `${focalX * 100}% ${focalY * 100}%`, transform: `scale(${zoom}) rotate(${entry.style.mediaRotationDeg ?? 0}deg) scaleX(${entry.style.mediaFlipX ? -1 : 1})`, transformOrigin: `${focalX * 100}% ${focalY * 100}%` }}
                />
              )}
            </div>
          ) : null}
          {mediaUrl && contourStroke > 0 ? (
            <svg viewBox="0 0 100 100" preserveAspectRatio="none" aria-hidden="true" style={{ position: "absolute", inset: 0, width: "100%", height: "100%", pointerEvents: "none", overflow: "visible", filter: frame === "NEON" ? `drop-shadow(0 0 8px ${entry.style.colorHex ?? accent})` : frame === "POLAROID" && !rectangularFrame ? "drop-shadow(0 0 6px #f4f1ff)" : undefined }}>
              {outline.kind === "path" ? (
                <path d={outline.d} fill="none" stroke={frame === "POLAROID" || frame === "CARD" ? "#f4f1ff" : (entry.style.colorHex ?? accent)} strokeWidth={contourStroke} vectorEffect="non-scaling-stroke" />
              ) : outline.kind === "polygon" ? (
                <polygon points={outline.points} fill="none" stroke={frame === "POLAROID" || frame === "CARD" ? "#f4f1ff" : (entry.style.colorHex ?? accent)} strokeWidth={contourStroke} vectorEffect="non-scaling-stroke" />
              ) : outline.kind === "ellipse" ? (
                <ellipse cx="50" cy="50" rx="48" ry={entry.style.mask === "OVAL" ? 36 : 48} fill="none" stroke={frame === "POLAROID" || frame === "CARD" ? "#f4f1ff" : (entry.style.colorHex ?? accent)} strokeWidth={contourStroke} vectorEffect="non-scaling-stroke" />
              ) : (
                <rect x="2" y="2" width="96" height="96" rx={entry.style.mask === "ROUNDED" ? 12 : 0} fill="none" stroke={frame === "POLAROID" || frame === "CARD" ? "#f4f1ff" : (entry.style.colorHex ?? accent)} strokeWidth={contourStroke} vectorEffect="non-scaling-stroke" />
              )}
            </svg>
          ) : null}
          {title ? <div data-testid={`writing-title-${entry.blockId}`} style={{ fontWeight: 800, marginBottom: 8 }}>{title}</div> : null}
          {mediaUrl ? null : construction && selected && editingBlockId === entry.blockId ? (
            <textarea
              autoFocus
              data-testid={`writing-inline-editor-${entry.blockId}`}
              value={entry.plainText ?? ""}
              onChange={(e) => onUpdateBlockText?.(entry.blockId, e.target.value)}
              onBlur={() => onSetEditingBlockId?.(null)}
              onKeyDown={(e) => {
                if (e.key === "Escape") {
                  e.stopPropagation();
                  onSetEditingBlockId?.(null);
                }
              }}
              placeholder="T"
              style={{
                width: "100%",
                minHeight: 48,
                background: "transparent",
                color: "inherit",
                fontFamily: "inherit",
                fontSize: "inherit",
                fontWeight: "inherit",
                letterSpacing: "inherit",
                lineHeight: "inherit",
                textAlign: "inherit",
                border: "none",
                outline: "none",
                resize: "none",
                padding: 0,
                margin: 0,
                whiteSpace: "pre-wrap",
                wordBreak: "break-word",
                overflow: "hidden",
              }}
            />
          ) : (
            <div data-testid={`writing-body-${entry.blockId}`} style={{ whiteSpace: "pre-wrap" }}>
              {body || "T"}
            </div>
          )}
        </div>
        {construction && selected && free ? (
          <div
            data-testid={`bounding-box-${entry.blockId}`}
            style={{
              position: "absolute",
              inset: -4,
              border: "2px solid #00FFFF",
              boxShadow: "0 0 12px rgba(0, 255, 255, 0.45)",
              pointerEvents: "none",
              borderRadius: entry.style.mask === "CIRCLE" ? "50%" : 6,
              zIndex: 100,
            }}
          >
            {/* Top Rotation Stem */}
            <div
              style={{
                position: "absolute",
                top: -16,
                left: "50%",
                width: 2,
                height: 16,
                background: "#00FFFF",
                transform: "translateX(-50%)",
                pointerEvents: "none",
              }}
            />
            {/* Top Rotation Handle */}
            <button
              type="button"
              data-testid={`rotate-handle-${entry.blockId}`}
              aria-label={`Rotate ${entry.blockId}`}
              onPointerDown={(event) => {
                event.stopPropagation();
                onMagnetPointerDown?.(entry.blockId, "rotate", event);
              }}
              onPointerMove={onMagnetPointerMove}
              onPointerUp={onMagnetPointerUp}
              style={{
                position: "absolute",
                top: -38,
                left: "50%",
                transform: "translateX(-50%)",
                width: 26,
                height: 26,
                borderRadius: "50%",
                background: "#050510",
                border: "2px solid #00FFFF",
                color: "#00FFFF",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                fontSize: 12,
                cursor: "grab",
                pointerEvents: "auto",
                touchAction: "none",
              }}
            >
              ⟳
            </button>

            {/* 4 Corner Scale Handles */}
            <button
              type="button"
              data-testid={`resize-handle-tl-${entry.blockId}`}
              aria-label={`Resize Top Left ${entry.blockId}`}
              onPointerDown={(event) => {
                event.stopPropagation();
                onMagnetPointerDown?.(entry.blockId, "resize", event);
              }}
              onPointerMove={onMagnetPointerMove}
              onPointerUp={onMagnetPointerUp}
              style={{
                position: "absolute",
                top: -12,
                left: -12,
                width: 24,
                height: 24,
                borderRadius: "50%",
                border: "2px solid #00FFFF",
                background: "#050510",
                cursor: "nwse-resize",
                pointerEvents: "auto",
                touchAction: "none",
              }}
            />
            <button
              type="button"
              data-testid={`resize-handle-tr-${entry.blockId}`}
              aria-label={`Resize Top Right ${entry.blockId}`}
              onPointerDown={(event) => {
                event.stopPropagation();
                onMagnetPointerDown?.(entry.blockId, "resize", event);
              }}
              onPointerMove={onMagnetPointerMove}
              onPointerUp={onMagnetPointerUp}
              style={{
                position: "absolute",
                top: -12,
                right: -12,
                width: 24,
                height: 24,
                borderRadius: "50%",
                border: "2px solid #00FFFF",
                background: "#050510",
                cursor: "nesw-resize",
                pointerEvents: "auto",
                touchAction: "none",
              }}
            />
            <button
              type="button"
              data-testid={`resize-handle-bl-${entry.blockId}`}
              aria-label={`Resize Bottom Left ${entry.blockId}`}
              onPointerDown={(event) => {
                event.stopPropagation();
                onMagnetPointerDown?.(entry.blockId, "resize", event);
              }}
              onPointerMove={onMagnetPointerMove}
              onPointerUp={onMagnetPointerUp}
              style={{
                position: "absolute",
                bottom: -12,
                left: -12,
                width: 24,
                height: 24,
                borderRadius: "50%",
                border: "2px solid #00FFFF",
                background: "#050510",
                cursor: "nesw-resize",
                pointerEvents: "auto",
                touchAction: "none",
              }}
            />
            <button
              type="button"
              data-testid={`resize-handle-${entry.blockId}`}
              aria-label={`Resize ${entry.blockId}`}
              onPointerDown={(event) => {
                event.stopPropagation();
                onMagnetPointerDown?.(entry.blockId, "resize", event);
              }}
              onPointerMove={onMagnetPointerMove}
              onPointerUp={onMagnetPointerUp}
              style={{
                position: "absolute",
                bottom: -12,
                right: -12,
                width: 24,
                height: 24,
                borderRadius: "50%",
                border: "2px solid #00FFFF",
                background: "#050510",
                cursor: "nwse-resize",
                pointerEvents: "auto",
                touchAction: "none",
              }}
            />
          </div>
        ) : null}
      </div>
    );
  }
  if (entry.disposition === "PRESENTABLE_TEXT" || entry.disposition === "HERO_PRESENTATION") {
    const Tag = entry.disposition === "HERO_PRESENTATION" ? "h1" : "p";
    return (
      <Tag data-testid={entry.disposition === "HERO_PRESENTATION" ? "published-hero" : `published-text-${entry.blockId}`} data-kind={entry.kind} data-motion={motion} style={style}>
        {entry.plainText ?? ""}
      </Tag>
    );
  }
  if (entry.kind === "DIVIDER") {
    return (
      <div
        data-testid={`published-decoration-${entry.blockId}`}
        data-kind="DIVIDER"
        style={{ height: 10, margin: "18px 0", borderRadius: 999, background: accent, boxShadow: `0 0 18px ${accent}` }}
      />
    );
  }
  if (entry.kind === "PHOTO" || entry.kind === "VIDEO_SNIP") {
    return (
      <figure data-testid={`published-media-${entry.blockId}`} data-record-id={entry.binding?.recordId ?? ""} style={{ ...style, minHeight: 180, margin: 0 }}>
        <figcaption style={{ fontSize: 13, letterSpacing: "0.06em", textTransform: "uppercase" }}>
          No media file attached · {entry.binding?.recordId ?? entry.kind}
        </figcaption>
      </figure>
    );
  }
  if (entry.kind === "MEMBER_SPOTLIGHT") {
    return (
      <div data-testid={`published-person-${entry.blockId}`} data-people={entry.style.peoplePresentation ?? "GRID"} data-record-id={entry.binding?.recordId ?? ""} style={{ ...style, width: 120, height: 120, borderRadius: "50%", display: "grid", placeItems: "center", fontSize: 12 }}>
        {entry.binding?.recordId ?? ""}
      </div>
    );
  }
  return (
    <div data-testid={`published-decoration-${entry.blockId}`} data-kind={entry.kind} style={style}>
      {entry.kind}
    </div>
  );
}

function entryVisible(entry: PublicPagePresentationEntry | undefined, construction: boolean): boolean {
  if (!entry) return false;
  if (entry.disposition === "CAPABILITY_DENIED" || entry.disposition === "SUPPRESSED_UNSAFE_TEXT") return false;
  if (construction) return true;
  if (entry.mediaLink && (previewEmbed(entry.mediaLink) || previewHref(entry.mediaLink))) return true;
  if (entry.mediaLink) return false;
  if (DECORATION_KINDS.has(entry.kind)) return true;
  if (CONNECTED_MEDIA.has(entry.kind) && entry.binding) return true;
  if (entry.kind === "DIVIDER") return true;
  return (entry.plainText ?? "").trim().length > 0;
}

function sectionMinHeight(mode: PublicPageSectionHeight | null, minHeightPx: number, contentBottomPx = 0): React.CSSProperties {
  const floor = minHeightPx > 0 ? minHeightPx : 0;
  let base: React.CSSProperties;
  if (mode === "FULL_SCREEN") base = { minHeight: floor > 0 ? `max(100vh, ${floor}px)` : "100vh" };
  else if (mode === "STANDARD") base = { minHeight: floor > 0 ? `max(70vh, ${floor}px)` : "70vh" };
  else if (mode === "COMPACT") base = { minHeight: Math.max(320, floor) };
  else if (floor > 0) base = { minHeight: floor };
  else base = {};
  if (contentBottomPx <= 0) return base;
  const content = `${Math.ceil(contentBottomPx)}px`;
  if (base.minHeight == null) return { minHeight: content };
  if (typeof base.minHeight === "number") return { minHeight: Math.max(base.minHeight, contentBottomPx) };
  return { minHeight: `max(${base.minHeight}, ${content})` };
}

export default function PublicPageCanvas({
  presentation,
  selectedSectionId,
  onSelectSection,
  selectedBlockId,
  onSelectBlock,
  onMagnetPointerDown,
  onMagnetPointerMove,
  onMagnetPointerUp,
  ownerUserId,
  adjustingBlockId,
  onBeginAdjust,
  onCanvasPlace,
  editingBlockId,
  onUpdateBlockText,
  onSetEditingBlockId,
}: {
  presentation: DocumentPreviewPresentation;
  selectedSectionId?: string | null;
  onSelectSection?: (sectionId: string) => void;
  selectedBlockId?: string | null;
  onSelectBlock?: (blockId: string) => void;
  onMagnetPointerDown?: (blockId: string, mode: "move" | "resize" | "rotate", event: React.PointerEvent<HTMLElement>) => void;
  onMagnetPointerMove?: (event: React.PointerEvent<HTMLElement>) => void;
  onMagnetPointerUp?: () => void;
  ownerUserId?: string;
  adjustingBlockId?: string | null;
  onBeginAdjust?: (blockId: string) => void;
  onCanvasPlace?: (detail: {
    sectionId: string;
    clientX: number;
    clientY: number;
    rect: { left: number; top: number; width: number; height: number };
    blockId: string | null;
    kind: string | null;
  }) => void;
  editingBlockId?: string | null;
  onUpdateBlockText?: (blockId: string, text: string) => void;
  onSetEditingBlockId?: (blockId: string | null) => void;
}) {
  const canvas = presentation.canvas;
  const [library, setLibrary] = useState<Record<string, string>>({});
  const holdRef = useRef<{ timer: number; x: number; y: number } | null>(null);
  useEffect(() => {
    if (!ownerUserId) return;
    let cancelled = false;
    void fetch(`/api/media/images?userId=${encodeURIComponent(ownerUserId)}`, { credentials: "include" })
      .then((response) => response.json())
      .then((data: { ok?: boolean; items?: Array<{ id?: string; imageUrl?: string }> }) => {
        if (cancelled || !data.ok || !Array.isArray(data.items)) return;
        const next: Record<string, string> = {};
        for (const item of data.items) {
          const url = typeof item.imageUrl === "string" ? safeLibraryUrl(item.imageUrl) : null;
          if (item.id && url) next[item.id] = url;
        }
        setLibrary(next);
      })
      .catch(() => undefined);
    return () => {
      cancelled = true;
    };
  }, [ownerUserId]);
  if (!canvas) return null;
  const construction = Boolean(onSelectSection);
  function openPlace(sectionEl: HTMLElement, sectionId: string, clientX: number, clientY: number, target: EventTarget | null) {
    if (!onCanvasPlace) return;
    const hit = target instanceof Element ? target.closest("[data-magnet='true']") : null;
    const layer = sectionEl.querySelector("[data-magnet-layer]");
    const rect = (layer ?? sectionEl).getBoundingClientRect();
    onCanvasPlace({
      sectionId,
      clientX,
      clientY,
      rect: { left: rect.left, top: rect.top, width: rect.width, height: rect.height },
      blockId: hit?.getAttribute("data-block-id") ?? null,
      kind: hit?.getAttribute("data-kind") ?? null,
    });
  }
  const byId = new Map(presentation.entries.map((entry) => [entry.blockId, entry]));
  const resolved = (assetId: string | undefined) => (assetId ? library[assetId] : undefined);
  return (
    <article
      data-testid="public-page-canvas"
      data-opening={canvas.opening}
      data-tier={canvas.performanceTier}
      data-atmosphere={canvas.atmosphere}
      data-sections={canvas.sections.length}
      data-construction={construction ? "true" : "false"}
      data-surface={canvas.surfaceColorHex ?? ""}
      style={{ position: "relative", width: "100%", color: "#f4f1ff", height: "auto", background: canvas.surfaceGradientHex && canvas.surfaceColorHex ? `linear-gradient(180deg, ${canvas.surfaceColorHex}, ${canvas.surfaceGradientHex})` : (canvas.surfaceColorHex ?? "#050510") }}
    >
      <svg width="0" height="0" aria-hidden="true" style={{ position: "absolute" }}>
        <defs>
          <clipPath id={HEART_CLIP_ID} clipPathUnits="objectBoundingBox">
            <path d="M 0.5 0.86 C 0.22 0.64 0.04 0.48 0.16 0.32 C 0.26 0.18 0.4 0.22 0.5 0.36 C 0.6 0.22 0.74 0.18 0.84 0.32 C 0.96 0.48 0.78 0.64 0.5 0.86 Z" />
          </clipPath>
        </defs>
      </svg>
      <style data-canvas-motion="1" suppressHydrationWarning dangerouslySetInnerHTML={{ __html: `
        @keyframes tmi-glitter { from { background-position: 0 0; } to { background-position: 90px 140px; } }
        @keyframes tmi-rise { from { opacity: 0; transform: translateY(18px); } to { opacity: 1; transform: none; } }
        @keyframes tmi-float { from { transform: translateY(0); } to { transform: translateY(-8px); } }
        @keyframes tmi-flicker {
          0%, 76%, 100% { opacity: 1; }
          80% { opacity: 0.28; }
          84% { opacity: 1; }
          89% { opacity: 0.62; }
          93% { opacity: 1; }
        }
        [data-atmosphere="GLITTER"] { background-image: radial-gradient(circle, rgba(255,255,255,0.85) 1px, transparent 1.6px); background-size: 22px 26px; animation: tmi-glitter 9s linear infinite; }
        [data-motion="rise"] { animation: tmi-rise 0.9s ease both; }
        [data-motion="float"] { animation: tmi-float 3.5s ease-in-out infinite alternate; }
        [data-motion="flicker"] { animation: tmi-flicker 4.8s ease-in-out infinite; }
        @media (max-width: 760px) {
          [data-composition-grid] { grid-template-columns: 1fr !important; grid-template-rows: none !important; }
          [data-magnet-layer] { position: relative !important; inset: auto !important; display: flex; flex-direction: column; gap: 12px; }
          [data-magnet="true"] { position: relative !important; left: auto !important; top: auto !important; width: 100% !important; height: auto !important; min-height: 72px; transform: none !important; }
          [data-bg-fit="CONTAIN"], [data-bg-fit="CUSTOM"], [data-bg-fit="ORIGINAL"] { left: 0 !important; top: 0 !important; width: 100% !important; height: 70% !important; }
        }
        @media (prefers-reduced-motion: reduce) {
          [data-atmosphere], [data-motion] { animation: none !important; }
        }
      ` }} />
      {/* Subtle editor-only EMPTY PAGE watermark on white canvas (clears immediately on first object) */}
      {(() => {
        const totalMagnets = presentation.entries.filter((entry) => entry.placement === "MAGNET").length;
        const hasContent = presentation.entries.some((entry) =>
          entry.placement === "MAGNET" ||
          (entry.plainText && entry.plainText.trim().length > 0 && entry.kind !== "STATUS_LINE") ||
          Boolean(entry.binding?.recordId)
        );
        const isEmptyPage = totalMagnets === 0 && !hasContent;
        if (!isEmptyPage) return null;
        const isWhite = (canvas.surfaceColorHex ?? "#FFFFFF").toUpperCase() === "#FFFFFF";
        return (
          <div
            data-testid="canvas-empty-watermark"
            style={{
              position: "absolute",
              inset: 0,
              display: "flex",
              flexDirection: "column",
              alignItems: "center",
              justifyContent: "center",
              minHeight: 380,
              pointerEvents: "none",
              zIndex: 10,
              color: isWhite ? "rgba(0, 0, 0, 0.28)" : "rgba(255, 255, 255, 0.28)",
              userSelect: "none",
              transition: "opacity 0.2s ease-out",
            }}
          >
            <div style={{ fontSize: 13, fontWeight: 900, letterSpacing: "0.22em", textTransform: "uppercase" }}>
              EMPTY PAGE
            </div>
            <div style={{ fontSize: 10, fontWeight: 600, letterSpacing: "0.08em", opacity: 0.75, marginTop: 4 }}>
              Tap + ADD or Text to place your first object
            </div>
          </div>
        );
      })()}
      {canvas.sections.filter((section) => !section.hidden).map((section, index) => {
        const scene = sceneBackground(section.background, index, canvas.world);
        const magnets = presentation.entries.filter((entry) => entry.sectionId === section.sectionId && entry.placement === "MAGNET" && (construction || entryVisible(entry, false)));
        const contentGrid = magnets.some((entry) => entry.style.textFit === "AUTO");
        const contentBottom = contentGrid
          ? magnets.reduce((max, entry) => {
              const top = entry.bounds.y * WRITING_UNIT_PX;
              const height = entry.style.textFit === "AUTO"
                ? writingContentPx(entry.plainText ?? "", entry.bounds.w)
                : entry.bounds.h * WRITING_UNIT_PX;
              return Math.max(max, top + height + 64);
            }, 0)
          : 0;
        const panes = section.panes.filter((pane) => {
          if (construction) return true;
          const ownTile = pane.tile != null && pane.tile.tileId !== scene?.tileId;
          const hasFlow = pane.blockIds.some((blockId) => {
            const entry = byId.get(blockId);
            return Boolean(entry && entry.placement !== "MAGNET" && entryVisible(entry, false));
          });
          return ownTile || hasFlow;
        });
        if (!construction && !scene && !section.overlay && panes.length === 0 && magnets.length === 0) return null;
        return (
        <section
          key={section.sectionId}
          data-testid={`page-section-${section.sectionId}`}
          data-layout={section.layout}
          data-height={section.heightMode ?? "CUSTOM"}
          data-auto-grow={contentGrid ? "true" : "false"}
          data-scene={scene?.tileId ?? "solid"}
          data-selected={selectedSectionId === section.sectionId ? "true" : "false"}
          data-transition={section.transition}
          data-atmosphere={section.atmosphere}
          onClick={onSelectSection ? () => onSelectSection(section.sectionId) : undefined}
          onContextMenu={onCanvasPlace ? (event) => {
            event.preventDefault();
            event.stopPropagation();
            openPlace(event.currentTarget, section.sectionId, event.clientX, event.clientY, event.target);
          } : undefined}
          onPointerDown={onCanvasPlace ? (event) => {
            if (event.pointerType === "mouse") return;
            if (event.target instanceof Element && event.target.closest("[data-magnet='true']")) return;
            const sectionEl = event.currentTarget;
            const x = event.clientX;
            const y = event.clientY;
            const sectionId = section.sectionId;
            const timer = window.setTimeout(() => {
              holdRef.current = null;
              openPlace(sectionEl, sectionId, x, y, null);
            }, 500);
            holdRef.current = { timer, x, y };
          } : undefined}
          onPointerMove={onCanvasPlace ? (event) => {
            const hold = holdRef.current;
            if (!hold) return;
            if (Math.hypot(event.clientX - hold.x, event.clientY - hold.y) > 12) {
              window.clearTimeout(hold.timer);
              holdRef.current = null;
            }
          } : undefined}
          onPointerUp={onCanvasPlace ? () => {
            if (!holdRef.current) return;
            window.clearTimeout(holdRef.current.timer);
            holdRef.current = null;
          } : undefined}
          onPointerCancel={onCanvasPlace ? () => {
            if (!holdRef.current) return;
            window.clearTimeout(holdRef.current.timer);
            holdRef.current = null;
          } : undefined}
          style={{
            position: "relative",
            zIndex: 1,
            width: "100%",
            ...sectionMinHeight(section.heightMode, section.minHeightPx, contentBottom),
            overflow: contentGrid ? "visible" : "hidden",
            padding: construction ? 28 : "4vh 4vw",
            background: scene?.source === "COLOR" && scene.colorHex
              ? scene.colorHex
              : canvas.surfaceGradientHex && canvas.surfaceColorHex
                ? `linear-gradient(180deg, ${canvas.surfaceColorHex}, ${canvas.surfaceGradientHex})`
                : (canvas.surfaceColorHex ?? (index === 0 ? "#07010f" : "#0a0614")),
            boxShadow: construction ? `inset 0 0 0 1px ${canvas.accentColorHex}66` : undefined,
          }}
        >
          {scene ? (
            <div data-testid={index === 0 && !section.background ? "page-background" : `page-underlay-${section.sectionId}`} data-layer={index === 0 && !section.background ? "background" : "underlay"} style={{ position: "absolute", inset: 0, zIndex: 0, pointerEvents: "none" }}>
              <LoopSurface tile={scene} tier={canvas.performanceTier} resolvedSrc={resolved(scene.assetId)} />
            </div>
          ) : null}
          {section.overlay ? (
            <div data-testid={`page-overlay-${section.sectionId}`} data-layer="overlay" style={{ position: "absolute", inset: 0, zIndex: 1, pointerEvents: "none" }}>
              <LoopSurface tile={{ ...section.overlay, blend: undefined }} tier={canvas.performanceTier} resolvedSrc={resolved(section.overlay.assetId)} />
            </div>
          ) : null}
          <div data-composition-grid={section.layout} style={{ position: "relative", zIndex: 2, height: "100%", ...gridFor(section.layout, construction) }}>
            {panes.map((pane) => {
              const duplicateUnderlay = pane.tile != null && pane.tile.tileId === scene?.tileId;
              const showTile = pane.tile != null && (construction || !duplicateUnderlay);
              return (
              <div key={pane.paneId} data-testid={`page-pane-${pane.paneId}`} style={{ position: "relative", minHeight: construction ? 220 : showTile ? "32vh" : undefined, overflow: "hidden", borderRadius: construction ? 18 : 0, boxShadow: construction ? `inset 0 0 0 1px ${canvas.accentColorHex}55` : undefined }}>
                {showTile && pane.tile ? <LoopSurface tile={pane.tile} tier={canvas.performanceTier} resolvedSrc={resolved(pane.tile.assetId)} /> : null}
                <div style={{ position: "relative", zIndex: 2, padding: construction ? 8 : 0 }}>
                  {pane.blockIds.map((blockId) => {
                    const entry = byId.get(blockId);
                    if (!entry || entry.placement === "MAGNET") return null;
                    return (
                      <BlockFace
                        key={blockId}
                        entry={entry}
                        accent={canvas.accentColorHex}
                        flickerPlace={canvas.flickerPlace}
                        construction={construction}
                        selected={selectedBlockId === blockId}
                        onSelectBlock={onSelectBlock}
                        surfaceColorHex={canvas.surfaceColorHex}
                      />
                    );
                  })}
                </div>
              </div>
              );
            })}
          </div>
          {(magnets.length > 0 || construction) ? (
            <div data-testid={`magnet-layer-${section.sectionId}`} data-magnet-layer="" style={{ position: "absolute", inset: 0, zIndex: 3 }}>
              {magnets.map((entry) => (
                <BlockFace
                  key={entry.blockId}
                  entry={entry}
                  accent={canvas.accentColorHex}
                  flickerPlace={canvas.flickerPlace}
                  construction={construction}
                  selected={selectedBlockId === entry.blockId}
                  onSelectBlock={onSelectBlock}
                  onMagnetPointerDown={onMagnetPointerDown}
                  onMagnetPointerMove={onMagnetPointerMove}
                  onMagnetPointerUp={onMagnetPointerUp}
                  contentGrid={contentGrid}
                  mediaUrl={resolved(entry.binding?.recordId)}
                  adjusting={adjustingBlockId === entry.blockId}
                  onBeginAdjust={onBeginAdjust}
                  editingBlockId={editingBlockId}
                  onUpdateBlockText={onUpdateBlockText}
                  onSetEditingBlockId={onSetEditingBlockId}
                  surfaceColorHex={canvas.surfaceColorHex}
                />
              ))}
            </div>
          ) : null}
        </section>
        );
      })}
    </article>
  );
}
