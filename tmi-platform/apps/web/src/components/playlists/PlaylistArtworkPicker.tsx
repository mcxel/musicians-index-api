"use client";

/**
 * PlaylistArtworkPicker — §20995-X2 artwork sources for playlist/album covers.
 * Device · Media Library · Memory Wall · YoPho Card (real URLs only).
 */

import { useCallback, useEffect, useRef, useState, type CSSProperties } from "react";
import { uploadCanonicalMediaFile } from "@/lib/media/clientMediaUpload";

export type ArtworkSource = "device" | "library" | "memory" | "yopho";

export interface PlaylistArtworkPickerProps {
  accentColor?: string;
  entitySlug?: string | null;
  currentCoverUrl?: string | null;
  onClose?: () => void;
  onSave: (coverUrl: string, meta?: { source: ArtworkSource; sourceId?: string }) => Promise<void> | void;
}

type LibraryImage = { id: string; title: string; url: string };
type MemoryImage = { id: string; title: string; url: string };
type YoPhoImage = { id: string; title: string; url: string };

export default function PlaylistArtworkPicker({
  accentColor = "#FF2DAA",
  entitySlug = null,
  currentCoverUrl = null,
  onClose,
  onSave,
}: PlaylistArtworkPickerProps) {
  const fileRef = useRef<HTMLInputElement>(null);
  const [source, setSource] = useState<ArtworkSource>("device");
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(currentCoverUrl);
  const [previewMeta, setPreviewMeta] = useState<{ source: ArtworkSource; sourceId?: string } | null>(null);
  const [objectPos, setObjectPos] = useState({ x: 50, y: 50 });
  const [zoom, setZoom] = useState(1);

  const [library, setLibrary] = useState<LibraryImage[]>([]);
  const [memories, setMemories] = useState<MemoryImage[]>([]);
  const [yopho, setYopho] = useState<YoPhoImage[]>([]);
  const [loadingSource, setLoadingSource] = useState(false);

  const loadLibrary = useCallback(async () => {
    setLoadingSource(true);
    setError(null);
    try {
      const res = await fetch("/api/user/content", { credentials: "include", cache: "no-store" });
      if (!res.ok) {
        setLibrary([]);
        return;
      }
      const data = (await res.json()) as {
        songs?: Array<{ id: string; title: string; coverUrl?: string | null }>;
        videos?: Array<{ id: string; title: string; thumbnailUrl?: string | null }>;
        playlists?: Array<{ id: string; name: string; coverUrl?: string | null }>;
      };
      const rows: LibraryImage[] = [];
      for (const s of data.songs ?? []) {
        if (s.coverUrl) rows.push({ id: `song-${s.id}`, title: s.title, url: s.coverUrl });
      }
      for (const v of data.videos ?? []) {
        if (v.thumbnailUrl) rows.push({ id: `video-${v.id}`, title: v.title, url: v.thumbnailUrl });
      }
      for (const p of data.playlists ?? []) {
        if (p.coverUrl) rows.push({ id: `pl-${p.id}`, title: p.name, url: p.coverUrl });
      }
      setLibrary(rows);
    } catch {
      setError("Could not load Media Library images.");
    } finally {
      setLoadingSource(false);
    }
  }, []);

  const loadMemory = useCallback(async () => {
    setLoadingSource(true);
    setError(null);
    try {
      const res = await fetch("/api/memory/mine", { credentials: "include", cache: "no-store" });
      if (!res.ok) {
        const fallback =
          entitySlug
            ? await fetch(
                `/api/memory/wall?entitySlug=${encodeURIComponent(entitySlug)}&entityType=fan`,
                { credentials: "include", cache: "no-store" },
              )
            : null;
        if (!fallback?.ok) {
          setMemories([]);
          if (res.status === 401) setError("Sign in to use Memory Wall artwork.");
          return;
        }
        const d = (await fallback.json()) as {
          memories?: Array<{ memoryId: string; title: string; contentUrl?: string; thumbnail?: string; contentType?: string }>;
        };
        setMemories(
          (d.memories ?? [])
            .map((m) => ({
              id: m.memoryId,
              title: m.title,
              url: m.thumbnail || m.contentUrl || "",
            }))
            .filter((m) => Boolean(m.url) && !m.url.startsWith("blob:")),
        );
        return;
      }
      const data = (await res.json()) as {
        memories?: Array<{ memoryId: string; title: string; contentUrl?: string; thumbnail?: string }>;
      };
      setMemories(
        (data.memories ?? [])
          .map((m) => ({
            id: m.memoryId,
            title: m.title,
            url: m.thumbnail || m.contentUrl || "",
          }))
          .filter((m) => Boolean(m.url) && !m.url.startsWith("blob:")),
      );
    } catch {
      setError("Could not load Memory Wall images.");
    } finally {
      setLoadingSource(false);
    }
  }, [entitySlug]);

  const loadYoPho = useCallback(async () => {
    setLoadingSource(true);
    setError(null);
    try {
      const res = await fetch("/api/yopho/cards", { credentials: "include", cache: "no-store" });
      if (!res.ok) {
        setYopho([]);
        return;
      }
      const data = (await res.json()) as {
        cards?: Array<{ cardId: string; displayName: string; subjectUrl?: string; collageUrls?: (string | null)[] }>;
      };
      const rows: YoPhoImage[] = [];
      for (const c of data.cards ?? []) {
        if (c.subjectUrl) {
          rows.push({ id: c.cardId, title: c.displayName, url: c.subjectUrl });
        }
        for (const u of c.collageUrls ?? []) {
          if (u) rows.push({ id: `${c.cardId}-c`, title: `${c.displayName} collage`, url: u });
        }
      }
      setYopho(rows);
    } catch {
      setError("Could not load YoPho cards.");
    } finally {
      setLoadingSource(false);
    }
  }, []);

  useEffect(() => {
    if (source === "library") void loadLibrary();
    if (source === "memory") void loadMemory();
    if (source === "yopho") void loadYoPho();
  }, [source, loadLibrary, loadMemory, loadYoPho]);

  const pickUrl = (url: string, src: ArtworkSource, sourceId?: string) => {
    setPreviewUrl(url);
    setPreviewMeta({ source: src, sourceId });
    setError(null);
  };

  const onDeviceFile = async (file: File) => {
    setBusy(true);
    setError(null);
    try {
      const uploaded = await uploadCanonicalMediaFile(file, {
        title: file.name.replace(/\.[^/.]+$/, ""),
        persistVia: "/api/upload/media",
      });
      if (!uploaded.ok) {
        setError(uploaded.error);
        return;
      }
      pickUrl(uploaded.url, "device", uploaded.id);
    } catch (e) {
      setError(e instanceof Error ? e.message : "Upload failed.");
    } finally {
      setBusy(false);
    }
  };

  const save = async () => {
    if (!previewUrl) {
      setError("Select an image first.");
      return;
    }
    setBusy(true);
    setError(null);
    try {
      await onSave(previewUrl, previewMeta ?? { source });
      onClose?.();
    } catch (e) {
      setError(e instanceof Error ? e.message : "Could not save cover.");
    } finally {
      setBusy(false);
    }
  };

  const gridItems =
    source === "library" ? library : source === "memory" ? memories : source === "yopho" ? yopho : [];

  return (
    <div
      data-testid="playlist-artwork-picker"
      role="dialog"
      aria-label="Choose playlist artwork"
      style={{
        display: "flex",
        flexDirection: "column",
        gap: 12,
        padding: 14,
        borderRadius: 12,
        border: `1px solid ${accentColor}66`,
        background: "rgba(8,5,20,0.98)",
        color: "#fff",
        fontFamily: "inherit",
        maxWidth: 480,
        width: "100%",
      }}
    >
      <div style={{ display: "flex", justifyContent: "space-between", gap: 8, alignItems: "center" }}>
        <div>
          <div style={{ fontSize: 11, fontWeight: 900, letterSpacing: "0.12em", color: accentColor }}>
            PLAYLIST ARTWORK
          </div>
          <div style={{ fontSize: 10, color: "rgba(255,255,255,0.45)", marginTop: 2 }}>
            Device · Library · Memory Wall · YoPho — real images only
          </div>
        </div>
        {onClose ? (
          <button type="button" onClick={onClose} style={chip("rgba(255,255,255,0.4)")}>
            CLOSE
          </button>
        ) : null}
      </div>

      <div style={{ display: "flex", flexWrap: "wrap", gap: 6 }} role="tablist">
        {(
          [
            ["device", "DEVICE"],
            ["library", "MEDIA LIBRARY"],
            ["memory", "MEMORY WALL"],
            ["yopho", "YOPHO"],
          ] as const
        ).map(([id, label]) => (
          <button
            key={id}
            type="button"
            role="tab"
            aria-selected={source === id}
            data-testid={`artwork-source-${id}`}
            onClick={() => setSource(id)}
            style={{
              ...chip(source === id ? accentColor : "rgba(255,255,255,0.35)"),
              background: source === id ? `${accentColor}22` : "transparent",
            }}
          >
            {label}
          </button>
        ))}
      </div>

      <div
        style={{
          width: "100%",
          aspectRatio: "1",
          maxHeight: 220,
          borderRadius: 12,
          overflow: "hidden",
          border: "1px solid rgba(255,255,255,0.12)",
          background: "#0a0614",
          position: "relative",
        }}
      >
        {previewUrl ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            src={previewUrl}
            alt="Cover preview"
            style={{
              width: "100%",
              height: "100%",
              objectFit: "cover",
              objectPosition: `${objectPos.x}% ${objectPos.y}%`,
              transform: `scale(${zoom})`,
              transformOrigin: `${objectPos.x}% ${objectPos.y}%`,
            }}
          />
        ) : (
          <div style={{ height: "100%", display: "grid", placeItems: "center", color: "rgba(255,255,255,0.35)", fontSize: 12 }}>
            No image selected
          </div>
        )}
      </div>

      {previewUrl ? (
        <div style={{ display: "grid", gap: 8 }}>
          <label style={{ fontSize: 9, color: "rgba(255,255,255,0.45)" }}>
            Reposition X
            <input
              type="range"
              min={0}
              max={100}
              value={objectPos.x}
              onChange={(e) => setObjectPos((p) => ({ ...p, x: Number(e.target.value) }))}
              style={{ width: "100%" }}
            />
          </label>
          <label style={{ fontSize: 9, color: "rgba(255,255,255,0.45)" }}>
            Reposition Y
            <input
              type="range"
              min={0}
              max={100}
              value={objectPos.y}
              onChange={(e) => setObjectPos((p) => ({ ...p, y: Number(e.target.value) }))}
              style={{ width: "100%" }}
            />
          </label>
          <label style={{ fontSize: 9, color: "rgba(255,255,255,0.45)" }}>
            Zoom
            <input
              type="range"
              min={1}
              max={2.5}
              step={0.05}
              value={zoom}
              onChange={(e) => setZoom(Number(e.target.value))}
              style={{ width: "100%" }}
            />
          </label>
          <div style={{ fontSize: 9, color: "rgba(255,255,255,0.35)" }}>
            Preview framing only — saved cover stores the image URL (crop bake deferred).
          </div>
        </div>
      ) : null}

      {source === "device" ? (
        <div>
          <input
            ref={fileRef}
            type="file"
            accept="image/jpeg,image/png,image/webp,image/gif"
            hidden
            onChange={(e) => {
              const f = e.target.files?.[0];
              if (f) void onDeviceFile(f);
              e.target.value = "";
            }}
          />
          <button
            type="button"
            data-testid="artwork-device-upload"
            disabled={busy}
            onClick={() => fileRef.current?.click()}
            style={{ ...chip(accentColor), padding: "10px 14px", width: "100%" }}
          >
            {busy ? "Uploading…" : "UPLOAD FROM DEVICE"}
          </button>
        </div>
      ) : (
        <div style={{ maxHeight: 180, overflowY: "auto", display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: 8 }}>
          {loadingSource ? (
            <div style={{ gridColumn: "1 / -1", fontSize: 11, color: "rgba(255,255,255,0.4)", padding: 12 }}>Loading…</div>
          ) : gridItems.length === 0 ? (
            <div
              data-testid={`artwork-${source}-empty`}
              style={{ gridColumn: "1 / -1", fontSize: 11, color: "rgba(255,255,255,0.4)", padding: 12, textAlign: "center" }}
            >
              {source === "memory"
                ? "No Memory Wall images yet."
                : source === "yopho"
                  ? "No YoPho card images yet."
                  : "No Media Library images with artwork yet."}
            </div>
          ) : (
            gridItems.map((item) => (
              <button
                key={item.id}
                type="button"
                onClick={() => pickUrl(item.url, source, item.id)}
                style={{
                  padding: 0,
                  borderRadius: 8,
                  overflow: "hidden",
                  border: previewUrl === item.url ? `2px solid ${accentColor}` : "1px solid rgba(255,255,255,0.1)",
                  background: "#000",
                  cursor: "pointer",
                  aspectRatio: "1",
                }}
                title={item.title}
              >
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img src={item.url} alt="" style={{ width: "100%", height: "100%", objectFit: "cover" }} />
              </button>
            ))
          )}
        </div>
      )}

      {error ? (
        <div role="alert" style={{ fontSize: 10, color: "#ffb0b0" }}>
          {error}
        </div>
      ) : null}

      <button
        type="button"
        data-testid="artwork-save"
        disabled={busy || !previewUrl}
        onClick={() => void save()}
        style={{ ...chip("#00FF88"), padding: "10px 14px", opacity: previewUrl ? 1 : 0.45 }}
      >
        {busy ? "Saving…" : "SAVE COVER"}
      </button>
    </div>
  );
}

function chip(color: string): CSSProperties {
  return {
    fontSize: 9,
    fontWeight: 900,
    letterSpacing: "0.08em",
    padding: "7px 12px",
    borderRadius: 8,
    border: `1px solid ${color}88`,
    background: `${color}18`,
    color,
    cursor: "pointer",
    fontFamily: "inherit",
  };
}
