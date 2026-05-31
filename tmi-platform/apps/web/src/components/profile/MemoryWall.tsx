"use client";

/**
 * MemoryWall — Profile media wall with separated sections:
 *   - 📹 Videos
 *   - 🎵 Audio / Tracks
 *   - 🖼️ Photos
 *   - 🏆 Achievements / Moments
 *
 * Each section is its own isolated container with its own upload trigger.
 * Upload: drag & drop or file picker per section.
 * Playback: inline video/audio player.
 */

import { useState, useRef, useCallback, useEffect } from "react";

// ─── Types ────────────────────────────────────────────────────────────────────
export type MediaType = "video" | "audio" | "image" | "achievement";

export interface MemoryItem {
  id:          string;
  type:        MediaType;
  url:         string;
  thumbnailUrl?: string;
  title:       string;
  caption?:    string;
  timestamp:   number;
  duration?:   number;    // seconds (video/audio)
  size?:       number;    // bytes
  isPublic:    boolean;
}

interface MemoryWallProps {
  userId:    string;
  isOwner:   boolean;
  accent?:   string;
  items?:    MemoryItem[];
  onUpload?: (file: File, type: MediaType) => Promise<MemoryItem>;
  onDelete?: (itemId: string) => void;
  onToggleVisibility?: (itemId: string, pub: boolean) => void;
}

// ─── Section config ───────────────────────────────────────────────────────────
const SECTIONS: { type: MediaType; label: string; icon: string; accept: string; color: string }[] = [
  { type: "video",       label: "Videos",       icon: "📹", accept: "video/*",                                color: "#FF2DAA" },
  { type: "audio",       label: "Tracks & Audio",icon: "🎵", accept: "audio/*",                                color: "#AA2DFF" },
  { type: "image",       label: "Photos",        icon: "🖼️", accept: "image/*",                               color: "#00FFFF" },
  { type: "achievement", label: "Moments",       icon: "🏆", accept: "image/*,video/*",                        color: "#FFD700" },
];

// ─── Mini inline player ───────────────────────────────────────────────────────
function VideoPlayer({ url, thumbnail }: { url: string; thumbnail?: string }) {
  const [playing, setPlaying] = useState(false);
  const ref = useRef<HTMLVideoElement>(null);

  const toggle = () => {
    if (!ref.current) return;
    if (playing) { ref.current.pause(); setPlaying(false); }
    else { void ref.current.play(); setPlaying(true); }
  };

  return (
    <div style={{ position: "relative", borderRadius: 8, overflow: "hidden", background: "#000", aspectRatio: "16/9", cursor: "pointer" }} onClick={toggle}>
      <video ref={ref} src={url} poster={thumbnail} style={{ width: "100%", height: "100%", objectFit: "cover" }} />
      {!playing && (
        <div style={{ position: "absolute", inset: 0, display: "flex", alignItems: "center", justifyContent: "center", background: "rgba(0,0,0,0.4)" }}>
          <div style={{ width: 44, height: 44, borderRadius: "50%", background: "rgba(255,255,255,0.9)", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 18 }}>▶</div>
        </div>
      )}
    </div>
  );
}

function AudioPlayer({ url, title }: { url: string; title: string }) {
  const [playing, setPlaying] = useState(false);
  const [progress, setProgress] = useState(0);
  const [duration, setDuration] = useState(0);
  const ref = useRef<HTMLAudioElement>(null);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const onTime = () => setProgress(el.currentTime);
    const onMeta = () => setDuration(el.duration);
    const onEnd  = () => setPlaying(false);
    el.addEventListener("timeupdate", onTime);
    el.addEventListener("loadedmetadata", onMeta);
    el.addEventListener("ended", onEnd);
    return () => { el.removeEventListener("timeupdate", onTime); el.removeEventListener("loadedmetadata", onMeta); el.removeEventListener("ended", onEnd); };
  }, []);

  const toggle = async () => {
    if (!ref.current) return;
    if (playing) { ref.current.pause(); setPlaying(false); }
    else { await ref.current.play(); setPlaying(true); }
  };

  const seek = (e: React.MouseEvent<HTMLDivElement>) => {
    if (!ref.current || !duration) return;
    const rect = e.currentTarget.getBoundingClientRect();
    const pct = (e.clientX - rect.left) / rect.width;
    ref.current.currentTime = pct * duration;
  };

  const fmt = (s: number) => `${Math.floor(s / 60)}:${String(Math.floor(s % 60)).padStart(2, "0")}`;

  return (
    <div style={{ padding: "10px 12px", background: "rgba(170,45,255,0.08)", border: "1px solid rgba(170,45,255,0.2)", borderRadius: 9 }}>
      <audio ref={ref} src={url} preload="metadata" />
      <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
        <button type="button" onClick={() => void toggle()}
          style={{ width: 36, height: 36, borderRadius: "50%", background: "#AA2DFF", border: "none", cursor: "pointer", fontSize: 14, display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
          {playing ? "⏸" : "▶"}
        </button>
        <div style={{ flex: 1, minWidth: 0 }}>
          <div style={{ fontSize: 11, fontWeight: 700, marginBottom: 4, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{title}</div>
          <div style={{ height: 4, background: "rgba(255,255,255,0.1)", borderRadius: 2, cursor: "pointer" }} onClick={seek}>
            <div style={{ width: `${duration ? (progress / duration) * 100 : 0}%`, height: "100%", background: "#AA2DFF", borderRadius: 2, transition: "width 0.1s" }} />
          </div>
        </div>
        <div style={{ fontSize: 9, color: "rgba(255,255,255,0.35)", fontVariantNumeric: "tabular-nums" }}>
          {fmt(progress)}{duration ? ` / ${fmt(duration)}` : ""}
        </div>
      </div>
    </div>
  );
}

// ─── Media card ───────────────────────────────────────────────────────────────
function MediaCard({
  item,
  isOwner,
  onDelete,
  onToggleVisibility,
}: {
  item: MemoryItem;
  isOwner: boolean;
  onDelete?: (id: string) => void;
  onToggleVisibility?: (id: string, pub: boolean) => void;
}) {
  const [menu, setMenu] = useState(false);

  return (
    <div style={{ position: "relative", background: "rgba(255,255,255,0.02)", border: "1px solid rgba(255,255,255,0.06)", borderRadius: 10, overflow: "hidden" }}>
      {/* Media */}
      {item.type === "video" || item.type === "achievement" && item.url.includes("video") ? (
        <VideoPlayer url={item.url} thumbnail={item.thumbnailUrl} />
      ) : item.type === "audio" ? (
        <div style={{ padding: 8 }}><AudioPlayer url={item.url} title={item.title} /></div>
      ) : (
        <div style={{ aspectRatio: "1/1", overflow: "hidden" }}>
          <img src={item.url} alt={item.title} style={{ width: "100%", height: "100%", objectFit: "cover" }} />
        </div>
      )}

      {/* Caption */}
      {(item.title || item.caption) && (
        <div style={{ padding: "8px 10px" }}>
          {item.title && <div style={{ fontSize: 11, fontWeight: 700, marginBottom: 2 }}>{item.title}</div>}
          {item.caption && <div style={{ fontSize: 10, color: "rgba(255,255,255,0.4)" }}>{item.caption}</div>}
        </div>
      )}

      {/* Privacy indicator */}
      {!item.isPublic && (
        <div style={{ position: "absolute", top: 6, left: 6, padding: "2px 6px", background: "rgba(0,0,0,0.7)", borderRadius: 4, fontSize: 8, color: "rgba(255,255,255,0.5)" }}>
          🔒 Private
        </div>
      )}

      {/* Owner menu */}
      {isOwner && (
        <div style={{ position: "absolute", top: 6, right: 6 }}>
          <button type="button" onClick={() => setMenu((m) => !m)}
            style={{ width: 24, height: 24, borderRadius: 5, background: "rgba(0,0,0,0.6)", border: "none", cursor: "pointer", fontSize: 12 }}>
            ⋮
          </button>
          {menu && (
            <div style={{ position: "absolute", top: 28, right: 0, background: "#0e0e1a", border: "1px solid rgba(255,255,255,0.1)", borderRadius: 8, overflow: "hidden", zIndex: 20, minWidth: 130 }}>
              <button type="button" onClick={() => { onToggleVisibility?.(item.id, !item.isPublic); setMenu(false); }}
                style={{ display: "block", width: "100%", padding: "9px 14px", background: "none", border: "none", cursor: "pointer", fontSize: 11, color: "#fff", textAlign: "left" }}>
                {item.isPublic ? "🔒 Make Private" : "🌐 Make Public"}
              </button>
              <button type="button" onClick={() => { onDelete?.(item.id); setMenu(false); }}
                style={{ display: "block", width: "100%", padding: "9px 14px", background: "none", border: "none", cursor: "pointer", fontSize: 11, color: "#ff6666", textAlign: "left" }}>
                🗑️ Delete
              </button>
            </div>
          )}
        </div>
      )}
    </div>
  );
}

// ─── Section container ────────────────────────────────────────────────────────
function MemorySection({
  type, label, icon, accept, color, items, isOwner, onUpload, onDelete, onToggleVisibility,
}: {
  type: MediaType; label: string; icon: string; accept: string; color: string;
  items: MemoryItem[]; isOwner: boolean;
  onUpload?: (file: File, type: MediaType) => Promise<MemoryItem>;
  onDelete?: (id: string) => void;
  onToggleVisibility?: (id: string, pub: boolean) => void;
}) {
  const fileRef = useRef<HTMLInputElement>(null);
  const [dragging, setDragging] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [localItems, setLocalItems] = useState<MemoryItem[]>(items);
  const [collapsed, setCollapsed] = useState(false);

  const handleFile = useCallback(async (file: File) => {
    if (!onUpload) return;
    setUploading(true);
    try {
      const item = await onUpload(file, type);
      setLocalItems((prev) => [item, ...prev]);
    } finally {
      setUploading(false);
    }
  }, [onUpload, type]);

  return (
    <div
      style={{
        background: "rgba(255,255,255,0.015)",
        border: `1px solid ${color}18`,
        borderRadius: 14,
        overflow: "hidden",
        marginBottom: 16,
      }}
    >
      {/* Section header */}
      <div
        style={{ display: "flex", alignItems: "center", justifyContent: "space-between", padding: "12px 16px", background: `${color}08`, borderBottom: `1px solid ${color}14`, cursor: "pointer" }}
        onClick={() => setCollapsed((c) => !c)}
      >
        <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
          <span style={{ fontSize: 18 }}>{icon}</span>
          <span style={{ fontSize: 13, fontWeight: 800, color }}>{label}</span>
          <span style={{ fontSize: 10, color: "rgba(255,255,255,0.3)", fontWeight: 600 }}>({localItems.length})</span>
        </div>
        <div style={{ display: "flex", gap: 8 }}>
          {isOwner && !collapsed && (
            <button
              type="button"
              onClick={(e) => { e.stopPropagation(); fileRef.current?.click(); }}
              style={{ padding: "5px 12px", background: `${color}22`, border: `1px solid ${color}44`, borderRadius: 7, cursor: "pointer", fontSize: 10, fontWeight: 800, color, letterSpacing: "0.06em" }}
            >
              {uploading ? "Uploading…" : "+ Upload"}
            </button>
          )}
          <span style={{ fontSize: 14, color: "rgba(255,255,255,0.3)" }}>{collapsed ? "▶" : "▼"}</span>
        </div>
      </div>

      {/* Hidden file input */}
      <input ref={fileRef} type="file" accept={accept} style={{ display: "none" }}
        onChange={(e) => { const f = e.target.files?.[0]; if (f) void handleFile(f); e.target.value = ""; }} />

      {!collapsed && (
        <div style={{ padding: 16 }}>
          {/* Drop zone (owner only, no items) */}
          {isOwner && localItems.length === 0 && (
            <div
              onDragOver={(e) => { e.preventDefault(); setDragging(true); }}
              onDragLeave={() => setDragging(false)}
              onDrop={(e) => { e.preventDefault(); setDragging(false); const f = e.dataTransfer.files[0]; if (f) void handleFile(f); }}
              onClick={() => fileRef.current?.click()}
              style={{ border: `2px dashed ${dragging ? color : "rgba(255,255,255,0.1)"}`, borderRadius: 10, padding: "32px 24px", textAlign: "center", cursor: "pointer", background: dragging ? `${color}06` : "none", transition: "all 0.15s" }}
            >
              <div style={{ fontSize: 28, marginBottom: 6 }}>{icon}</div>
              <div style={{ fontSize: 12, color: "rgba(255,255,255,0.35)" }}>Drop {label.toLowerCase()} here or click to upload</div>
            </div>
          )}

          {localItems.length === 0 && !isOwner && (
            <div style={{ textAlign: "center", padding: "24px 0", fontSize: 12, color: "rgba(255,255,255,0.2)" }}>No {label.toLowerCase()} yet.</div>
          )}

          {/* Grid */}
          {localItems.length > 0 && (
            <div style={{ display: "grid", gridTemplateColumns: type === "audio" ? "1fr" : "repeat(auto-fill, minmax(160px, 1fr))", gap: 12 }}>
              {localItems.map((item) => (
                <MediaCard
                  key={item.id}
                  item={item}
                  isOwner={isOwner}
                  onDelete={onDelete}
                  onToggleVisibility={onToggleVisibility}
                />
              ))}
              {/* Upload tile at end of grid (owner) */}
              {isOwner && type !== "audio" && (
                <div
                  onClick={() => fileRef.current?.click()}
                  style={{ aspectRatio: "1/1", border: `2px dashed ${color}33`, borderRadius: 10, cursor: "pointer", display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", gap: 6, background: `${color}06`, transition: "all 0.15s" }}
                >
                  <span style={{ fontSize: 22, opacity: 0.5 }}>+</span>
                  <span style={{ fontSize: 9, color: "rgba(255,255,255,0.25)", letterSpacing: "0.08em" }}>ADD</span>
                </div>
              )}
            </div>
          )}
        </div>
      )}
    </div>
  );
}

// ─── MemoryWall ───────────────────────────────────────────────────────────────
export default function MemoryWall({
  userId,
  isOwner,
  accent    = "#FF2DAA",
  items     = [],
  onUpload,
  onDelete,
  onToggleVisibility,
}: MemoryWallProps) {
  const byType = (type: MediaType) => items.filter((i) => i.type === type);

  return (
    <div style={{ fontFamily: "'Inter', sans-serif", color: "#fff" }}>
      {/* Wall header */}
      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 16 }}>
        <div>
          <div style={{ fontSize: 14, fontWeight: 900 }}>Memory Wall</div>
          <div style={{ fontSize: 10, color: "rgba(255,255,255,0.3)", marginTop: 2 }}>{items.length} items</div>
        </div>
        {isOwner && (
          <div style={{ fontSize: 10, color: "rgba(255,255,255,0.25)" }}>
            Click a section to expand · Upload per type
          </div>
        )}
      </div>

      {/* Sections */}
      {SECTIONS.map((s) => (
        <MemorySection
          key={s.type}
          {...s}
          items={byType(s.type)}
          isOwner={isOwner}
          onUpload={onUpload}
          onDelete={onDelete}
          onToggleVisibility={onToggleVisibility}
        />
      ))}
    </div>
  );
}
