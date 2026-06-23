"use client";

import { useState, useRef, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import type { MemoryItem } from "@/lib/profiles/MemoryWallEngine";

// ── Types ──────────────────────────────────────────────────────────────────────

interface MediaItem {
  id: string;
  name: string;
  url: string;        // objectURL or remote URL
  size?: number;      // bytes
  addedAt: number;
  caption?: string;
}

type MemoryTab = "photos" | "videos" | "audio" | "moments" | "achievements" | "sponsors" | "orbit" | "booking";

const TAB_CONFIG: { id: MemoryTab; icon: string; label: string; color: string }[] = [
  { id: "photos",       icon: "📸", label: "Photos",       color: "#00FFFF" },
  { id: "videos",       icon: "🎬", label: "Videos",       color: "#FF2DAA" },
  { id: "audio",        icon: "🎵", label: "Audio",        color: "#AA2DFF" },
  { id: "moments",      icon: "✨", label: "Moments",      color: "#FFD700" },
  { id: "achievements", icon: "🏆", label: "Badges",       color: "#22c55e" },
  { id: "sponsors",     icon: "🏷️", label: "Sponsors",     color: "#FF6B35" },
  { id: "orbit",        icon: "🌀", label: "Orbit",        color: "#9B59FF" },
  { id: "booking",      icon: "📍", label: "Booking Map",  color: "#00FF88" },
];

const SEED_ACHIEVEMENTS = [
  { icon: "🏆", label: "Battle Fan",      desc: "Watched 10 battles" },
  { icon: "💎", label: "Diamond Fan",     desc: "Reached Diamond tier" },
  { icon: "🎵", label: "Playlist Master", desc: "Added 50 tracks" },
  { icon: "🔥", label: "Hot Streak",      desc: "7 days in a row" },
  { icon: "🤝", label: "Connector",       desc: "Invited 5 friends" },
];

function fmtSize(bytes: number): string {
  if (bytes < 1024) return `${bytes}B`;
  if (bytes < 1048576) return `${(bytes / 1024).toFixed(0)}KB`;
  return `${(bytes / 1048576).toFixed(1)}MB`;
}

// ── Upload drop zone ──────────────────────────────────────────────────────────

function UploadZone({ accept, label, icon, color, onFiles }: {
  accept: string; label: string; icon: string; color: string;
  onFiles: (files: FileList) => void;
}) {
  const inputRef = useRef<HTMLInputElement>(null);
  const [dragging, setDragging] = useState(false);

  return (
    <div
      onClick={() => inputRef.current?.click()}
      onDragOver={(e) => { e.preventDefault(); setDragging(true); }}
      onDragLeave={() => setDragging(false)}
      onDrop={(e) => {
        e.preventDefault();
        setDragging(false);
        if (e.dataTransfer.files.length) onFiles(e.dataTransfer.files);
      }}
      style={{
        border: `1px dashed ${dragging ? color : color + "55"}`,
        borderRadius: 10,
        padding: "14px 16px",
        textAlign: "center",
        cursor: "pointer",
        background: dragging ? `${color}08` : "rgba(255,255,255,0.02)",
        transition: "all 0.15s",
        marginBottom: 12,
      }}
    >
      <div style={{ fontSize: 20, marginBottom: 4 }}>{icon}</div>
      <div style={{ fontSize: 10, fontWeight: 700, color, letterSpacing: "0.1em" }}>{label}</div>
      <div style={{ fontSize: 9, color: "rgba(255,255,255,0.25)", marginTop: 2 }}>
        Click to browse or drag & drop
      </div>
      <input
        ref={inputRef}
        type="file"
        accept={accept}
        multiple
        style={{ display: "none" }}
        onChange={(e) => { if (e.target.files?.length) onFiles(e.target.files); }}
      />
    </div>
  );
}

// ── Photo section ─────────────────────────────────────────────────────────────

function PhotoSection({ accentColor, entityId, entityType }: { accentColor: string; entityId?: string; entityType?: string }) {
  const [items, setItems] = useState<MediaItem[]>([]);
  const [lightbox, setLightbox] = useState<MediaItem | null>(null);
  const [uploading, setUploading] = useState(false);

  const handleFiles = async (files: FileList) => {
    setUploading(true);
    for (const f of Array.from(files)) {
      const localId = `photo-${Date.now()}-${Math.random()}`;
      const localUrl = URL.createObjectURL(f);
      // Show local preview immediately for snappy UX
      setItems((p) => [{ id: localId, name: f.name, url: localUrl, size: f.size, addedAt: Date.now() }, ...p]);

      try {
        const fd = new FormData();
        fd.append('file', f);
        fd.append('context', 'memory');
        const res = await fetch('/api/upload', { method: 'POST', body: fd, credentials: 'include' });
        if (res.ok) {
          const data = await res.json() as { success?: boolean; url?: string };
          if (data.url) {
            // Swap local blob URL for the persisted remote URL
            setItems((p) => p.map((x) => x.id === localId ? { ...x, url: data.url! } : x));
            URL.revokeObjectURL(localUrl);
            // Persist to Memory Wall if we have entity context
            if (entityId) {
              await fetch('/api/memory/wall', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                credentials: 'include',
                body: JSON.stringify({
                  entityId,
                  entityType: entityType ?? 'performer',
                  contentType: 'photo',
                  contentUrl: data.url,
                  title: f.name.replace(/\.[^.]+$/, ''),
                  isPublic: true,
                }),
              }).catch(() => {});
            }
          }
        }
      } catch {
        // Keep local blob preview on upload failure — user can still see it this session
      }
    }
    setUploading(false);
  };

  return (
    <div>
      <UploadZone
        accept="image/*"
        label={uploading ? "UPLOADING…" : "UPLOAD PHOTOS"}
        icon="📸"
        color="#00FFFF"
        onFiles={(files) => { void handleFiles(files); }}
      />
      {items.length === 0 ? (
        <div style={{ textAlign: "center", color: "rgba(255,255,255,0.2)", fontSize: 11, padding: "16px 0" }}>
          No photos yet. Capture memories from live events.
        </div>
      ) : (
        <div style={{ display: "grid", gridTemplateColumns: "repeat(3,1fr)", gap: 6 }}>
          {items.map((item) => (
            <div
              key={item.id}
              onClick={() => setLightbox(item)}
              style={{ position: "relative", aspectRatio: "1/1", borderRadius: 8, overflow: "hidden", cursor: "zoom-in", border: "1px solid rgba(255,255,255,0.08)" }}
            >
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src={item.url} alt={item.name} style={{ width: "100%", height: "100%", objectFit: "cover" }} />
              <button
                onClick={(e) => { e.stopPropagation(); URL.revokeObjectURL(item.url); setItems((p) => p.filter((x) => x.id !== item.id)); }}
                style={{ position: "absolute", top: 4, right: 4, background: "rgba(0,0,0,0.7)", border: "none", color: "#fff", borderRadius: "50%", width: 18, height: 18, fontSize: 11, cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center" }}
              >×</button>
            </div>
          ))}
        </div>
      )}

      {/* Lightbox */}
      <AnimatePresence>
        {lightbox && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => setLightbox(null)}
            style={{ position: "fixed", inset: 0, background: "rgba(0,0,0,0.92)", zIndex: 200, display: "flex", alignItems: "center", justifyContent: "center", padding: 20 }}
          >
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src={lightbox.url} alt={lightbox.name} style={{ maxWidth: "90vw", maxHeight: "85vh", borderRadius: 10, objectFit: "contain" }} />
            <div style={{ position: "absolute", bottom: 24, left: "50%", transform: "translateX(-50%)", fontSize: 10, color: "rgba(255,255,255,0.5)" }}>
              {lightbox.name}{lightbox.size ? ` · ${fmtSize(lightbox.size)}` : ""}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

// ── Video section ─────────────────────────────────────────────────────────────

function VideoSection({ accentColor, entityId, entityType }: { accentColor: string; entityId?: string; entityType?: string }) {
  const [items, setItems] = useState<MediaItem[]>([]);
  const [active, setActive] = useState<MediaItem | null>(null);
  const [uploading, setUploading] = useState(false);

  const handleFiles = async (files: FileList) => {
    setUploading(true);
    for (const f of Array.from(files)) {
      const localId = `video-${Date.now()}-${Math.random()}`;
      const localUrl = URL.createObjectURL(f);
      setItems((p) => [{ id: localId, name: f.name, url: localUrl, size: f.size, addedAt: Date.now() }, ...p]);

      try {
        const fd = new FormData();
        fd.append('file', f);
        const res = await fetch('/api/upload/media', { method: 'POST', body: fd, credentials: 'include' });
        if (res.ok) {
          const data = await res.json() as { url?: string; isVideo?: boolean };
          if (data.url) {
            setItems((p) => p.map((x) => x.id === localId ? { ...x, url: data.url! } : x));
            URL.revokeObjectURL(localUrl);
            if (entityId) {
              await fetch('/api/memory/wall', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                credentials: 'include',
                body: JSON.stringify({
                  entityId,
                  entityType: entityType ?? 'performer',
                  contentType: 'video-clip',
                  contentUrl: data.url,
                  title: f.name.replace(/\.[^.]+$/, ''),
                  isPublic: true,
                }),
              }).catch(() => {});
            }
          }
        }
      } catch {
        // Keep local blob preview on failure
      }
    }
    setUploading(false);
  };

  return (
    <div>
      <UploadZone
        accept="video/mp4,video/webm,video/quicktime,video/*"
        label={uploading ? "UPLOADING…" : "UPLOAD VIDEOS"}
        icon="🎬"
        color="#FF2DAA"
        onFiles={(files) => { void handleFiles(files); }}
      />
      {items.length === 0 ? (
        <div style={{ textAlign: "center", color: "rgba(255,255,255,0.2)", fontSize: 11, padding: "16px 0" }}>
          No videos yet. Record performances and live moments.
        </div>
      ) : (
        <div style={{ display: "grid", gridTemplateColumns: "repeat(2,1fr)", gap: 8 }}>
          {items.map((item) => (
            <div
              key={item.id}
              style={{ position: "relative", borderRadius: 9, overflow: "hidden", border: "1px solid rgba(255,45,170,0.18)", background: "#050510" }}
            >
              <video
                src={item.url}
                style={{ width: "100%", aspectRatio: "16/9", display: "block", objectFit: "cover" }}
                controls={active?.id === item.id}
                onClick={() => setActive(active?.id === item.id ? null : item)}
              />
              {active?.id !== item.id && (
                <div
                  onClick={() => setActive(item)}
                  style={{ position: "absolute", inset: 0, display: "flex", alignItems: "center", justifyContent: "center", cursor: "pointer", background: "rgba(0,0,0,0.35)" }}
                >
                  <div style={{ width: 36, height: 36, borderRadius: "50%", background: "rgba(255,45,170,0.85)", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 14 }}>▶</div>
                </div>
              )}
              <div style={{ padding: "6px 8px", background: "rgba(0,0,0,0.5)", display: "flex", alignItems: "center", gap: 6 }}>
                <span style={{ flex: 1, fontSize: 10, color: "rgba(255,255,255,0.6)", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{item.name}</span>
                <button
                  onClick={() => { URL.revokeObjectURL(item.url); setItems((p) => p.filter((x) => x.id !== item.id)); if (active?.id === item.id) setActive(null); }}
                  style={{ background: "none", border: "none", color: "rgba(255,255,255,0.3)", fontSize: 13, cursor: "pointer", flexShrink: 0 }}
                >×</button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

// ── Audio section ─────────────────────────────────────────────────────────────

function AudioSection({ accentColor, entityId, entityType }: { accentColor: string; entityId?: string; entityType?: string }) {
  const [items, setItems] = useState<MediaItem[]>([]);
  const [uploading, setUploading] = useState(false);

  const handleFiles = async (files: FileList) => {
    setUploading(true);
    for (const f of Array.from(files)) {
      const localId = `audio-${Date.now()}-${Math.random()}`;
      const localUrl = URL.createObjectURL(f);
      setItems((p) => [{ id: localId, name: f.name.replace(/\.[^.]+$/, ''), url: localUrl, size: f.size, addedAt: Date.now() }, ...p]);

      try {
        const fd = new FormData();
        fd.append('file', f);
        const res = await fetch('/api/upload/media', { method: 'POST', body: fd, credentials: 'include' });
        if (res.ok) {
          const data = await res.json() as { url?: string; isAudio?: boolean };
          if (data.url) {
            setItems((p) => p.map((x) => x.id === localId ? { ...x, url: data.url! } : x));
            URL.revokeObjectURL(localUrl);
            if (entityId) {
              await fetch('/api/memory/wall', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                credentials: 'include',
                body: JSON.stringify({
                  entityId,
                  entityType: entityType ?? 'performer',
                  contentType: 'photo', // nearest available type for audio clips
                  contentUrl: data.url,
                  title: f.name.replace(/\.[^.]+$/, ''),
                  isPublic: true,
                }),
              }).catch(() => {});
            }
          }
        }
      } catch {
        // Keep local blob preview on failure
      }
    }
    setUploading(false);
  };

  return (
    <div>
      <UploadZone
        accept="audio/mp3,audio/mpeg,audio/wav,audio/flac,audio/aac,audio/*"
        label={uploading ? "UPLOADING…" : "UPLOAD AUDIO"}
        icon="🎵"
        color="#AA2DFF"
        onFiles={(files) => { void handleFiles(files); }}
      />
      {items.length === 0 ? (
        <div style={{ textAlign: "center", color: "rgba(255,255,255,0.2)", fontSize: 11, padding: "16px 0" }}>
          No audio yet. Add your freestyle recordings or demos.
        </div>
      ) : (
        <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
          {items.map((item, i) => (
            <div
              key={item.id}
              style={{ background: "rgba(170,45,255,0.06)", border: "1px solid rgba(170,45,255,0.18)", borderRadius: 9, padding: "10px 12px" }}
            >
              <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 6 }}>
                <span style={{ fontSize: 10, color: "rgba(255,255,255,0.2)", width: 16, textAlign: "right", flexShrink: 0 }}>{i + 1}</span>
                <span style={{ flex: 1, fontSize: 11, fontWeight: 700, color: "#e2e8f0", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{item.name}</span>
                {item.size && <span style={{ fontSize: 9, color: "rgba(255,255,255,0.25)", flexShrink: 0 }}>{fmtSize(item.size)}</span>}
                <button
                  onClick={() => { URL.revokeObjectURL(item.url); setItems((p) => p.filter((x) => x.id !== item.id)); }}
                  style={{ background: "none", border: "none", color: "rgba(255,255,255,0.25)", fontSize: 14, cursor: "pointer", flexShrink: 0 }}
                >×</button>
              </div>
              {/* Waveform placeholder + native audio player */}
              <div style={{ height: 24, borderRadius: 4, background: "rgba(170,45,255,0.1)", marginBottom: 6, position: "relative", overflow: "hidden" }}>
                {Array.from({ length: 48 }).map((_, j) => (
                  <div
                    key={j}
                    style={{
                      position: "absolute",
                      bottom: 0,
                      left: `${(j / 48) * 100}%`,
                      width: "1.5%",
                      height: `${20 + Math.sin(j * 0.9 + i) * 15 + Math.random() * 10}%`,
                      background: "rgba(170,45,255,0.5)",
                      borderRadius: 1,
                    }}
                  />
                ))}
              </div>
              <audio controls src={item.url} style={{ width: "100%", height: 28, accentColor: "#AA2DFF" }} />
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

// ── Moments section — Memory Wall social-proof feed (real data, Rule 14) ───────

const MOMENT_ICONS: Record<string, string> = {
  photo: "📸", video: "🎬", screenshot: "🖼️", achievement: "🏆",
  "ticket-stub": "🎟️", "battle-win": "⚔️", "cypher-moment": "🎤",
  "meet-and-greet": "🤝", "event-attendance": "🎫", merchandise: "🛍️",
  nft: "💎", sponsored: "🏷️",
};

function MomentsSection({ accentColor, entityId, entityType }: { accentColor: string; entityId?: string; entityType?: string }) {
  const [memories, setMemories] = useState<MemoryItem[] | null>(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (!entityId) { setMemories(null); return; }
    let cancelled = false;
    setLoading(true);
    fetch(`/api/memory/wall?entitySlug=${encodeURIComponent(entityId)}&entityType=${encodeURIComponent(entityType ?? "fan")}`)
      .then((r) => r.json())
      .then((d: { memories?: MemoryItem[] }) => { if (!cancelled) setMemories(d.memories ?? []); })
      .catch(() => { if (!cancelled) setMemories([]); })
      .finally(() => { if (!cancelled) setLoading(false); });
    return () => { cancelled = true; };
  }, [entityId, entityType]);

  if (!entityId) {
    return (
      <div style={{ padding: 20, textAlign: "center", fontSize: 11, color: "rgba(255,255,255,0.35)" }}>
        Memory Wall needs a profile to load — no entity context provided.
      </div>
    );
  }

  if (loading) {
    return <div style={{ padding: 20, textAlign: "center", fontSize: 11, color: "rgba(255,255,255,0.35)" }}>Loading memories…</div>;
  }

  if (!memories || memories.length === 0) {
    return (
      <div style={{ padding: 20, textAlign: "center" }}>
        <div style={{ fontSize: 24, marginBottom: 8 }}>✨</div>
        <div style={{ fontSize: 11, fontWeight: 700, color: "rgba(255,255,255,0.5)" }}>No memories captured yet</div>
        <div style={{ fontSize: 10, color: "rgba(255,255,255,0.3)", marginTop: 4 }}>Battle wins, live moments, and milestones will appear here automatically.</div>
      </div>
    );
  }

  return (
    <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 6 }}>
      {memories.map((m) => (
        <div
          key={m.memoryId}
          style={{ padding: "10px", borderRadius: 8, background: "rgba(255,215,0,0.06)", border: "1px solid rgba(255,215,0,0.14)", fontSize: 10, fontWeight: 700, color: "#e2e8f0", display: "flex", alignItems: "center", gap: 6 }}
        >
          <span>{MOMENT_ICONS[m.contentType] ?? "✨"}</span>
          <span style={{ flex: 1, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{m.title}</span>
        </div>
      ))}
    </div>
  );
}

// ── Achievements section ──────────────────────────────────────────────────────

function AchievementsSection({ accentColor }: { accentColor: string }) {
  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 7 }}>
      {SEED_ACHIEVEMENTS.map((a) => (
        <div
          key={a.label}
          style={{ display: "flex", gap: 12, alignItems: "center", padding: "10px 12px", borderRadius: 9, background: "rgba(34,197,94,0.05)", border: "1px solid rgba(34,197,94,0.14)" }}
        >
          <span style={{ fontSize: 22, flexShrink: 0 }}>{a.icon}</span>
          <div>
            <div style={{ fontSize: 12, fontWeight: 700, color: "#e2e8f0" }}>{a.label}</div>
            <div style={{ fontSize: 9, color: "rgba(255,255,255,0.35)" }}>{a.desc}</div>
          </div>
          <div style={{ marginLeft: "auto", fontSize: 9, fontWeight: 800, color: "#22c55e", letterSpacing: "0.1em" }}>EARNED</div>
        </div>
      ))}
    </div>
  );
}

// ── Sponsor Stamp Wall ─────────────────────────────────────────────────────────

const SEED_SPONSORS = [
  { id: 's1', name: 'BeatDrop Audio',   logo: '🎧', tier: 'GOLD',     amount: '$500/mo',  color: '#FFD700' },
  { id: 's2', name: 'FreshFit Apparel', logo: '👕', tier: 'SILVER',   amount: '$200/mo',  color: '#C0C0C0' },
  { id: 's3', name: 'Neon Studios',     logo: '🎬', tier: 'BRONZE',   amount: '$100/mo',  color: '#FF6B35' },
  { id: 's4', name: 'Mic Republic',     logo: '🎤', tier: 'PLATINUM', amount: '$1000/mo', color: '#00FFFF' },
];

function SponsorStampWall({ accentColor }: { accentColor: string }) {
  return (
    <div>
      <div style={{ fontSize: 9, color: 'rgba(255,255,255,.35)', marginBottom: 14, letterSpacing: '0.06em' }}>
        Brands backing this artist. Sponsor slots are available.
      </div>
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10, marginBottom: 14 }}>
        {SEED_SPONSORS.map(s => (
          <div key={s.id} style={{
            background: `${s.color}0A`,
            border: `1.5px solid ${s.color}44`,
            borderRadius: 10, padding: '14px 12px',
            display: 'flex', flexDirection: 'column', gap: 4,
          }}>
            <div style={{ fontSize: 28 }}>{s.logo}</div>
            <div style={{ fontSize: 11, fontWeight: 900, color: '#fff' }}>{s.name}</div>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <span style={{ fontSize: 8, fontWeight: 800, color: s.color, letterSpacing: '0.1em' }}>{s.tier}</span>
              <span style={{ fontSize: 9, color: 'rgba(255,255,255,.4)' }}>{s.amount}</span>
            </div>
          </div>
        ))}
      </div>
      <a
        href="/sponsor"
        style={{
          display: 'block', textAlign: 'center', padding: '10px 0',
          background: `${accentColor}18`, border: `1px solid ${accentColor}44`,
          borderRadius: 8, fontSize: 9, fontWeight: 900, color: accentColor,
          textDecoration: 'none', letterSpacing: '0.1em',
        }}
      >
        + BECOME A SPONSOR
      </a>
    </div>
  );
}

// ── Sponsor Orbit ──────────────────────────────────────────────────────────────

function SponsorOrbit({ accentColor }: { accentColor: string }) {
  const orbitSponsors = [
    { name: 'BeatDrop',    logo: '🎧', deg: 0   },
    { name: 'FreshFit',    logo: '👕', deg: 45  },
    { name: 'Neon Studios',logo: '🎬', deg: 90  },
    { name: 'Mic Republic',logo: '🎤', deg: 135 },
    { name: 'TMI Media',   logo: '📰', deg: 180 },
    { name: 'HypeLabel',   logo: '🏷️', deg: 225 },
    { name: 'StreamHD',    logo: '📡', deg: 270 },
    { name: 'GlobalAV',    logo: '🌍', deg: 315 },
  ];

  return (
    <div style={{ textAlign: 'center' }}>
      <div style={{ fontSize: 9, color: 'rgba(255,255,255,.35)', marginBottom: 16, letterSpacing: '0.06em' }}>
        Sponsors in orbit around this profile
      </div>
      <div style={{ position: 'relative', width: 220, height: 220, margin: '0 auto 20px' }}>
        {/* Center */}
        <div style={{
          position: 'absolute', top: '50%', left: '50%',
          transform: 'translate(-50%,-50%)',
          width: 56, height: 56, borderRadius: '50%',
          background: `${accentColor}22`, border: `2px solid ${accentColor}`,
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          fontSize: 22,
        }}>🌟</div>
        {/* Outer ring */}
        <div style={{
          position: 'absolute', inset: 0, borderRadius: '50%',
          border: `1px dashed ${accentColor}22`,
        }} />
        {/* Sponsor nodes */}
        {orbitSponsors.map((s) => {
          const rad = (s.deg * Math.PI) / 180;
          const x = 50 + 44 * Math.cos(rad);
          const y = 50 + 44 * Math.sin(rad);
          return (
            <div key={s.name} style={{
              position: 'absolute',
              left: `${x}%`, top: `${y}%`,
              transform: 'translate(-50%,-50%)',
            }}>
              <div
                title={s.name}
                style={{
                  width: 36, height: 36, borderRadius: '50%',
                  background: `${accentColor}18`,
                  border: `1.5px solid ${accentColor}44`,
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  fontSize: 16, cursor: 'pointer',
                }}
              >
                {s.logo}
              </div>
            </div>
          );
        })}
      </div>
      <div style={{ fontSize: 8, color: 'rgba(255,255,255,.25)', letterSpacing: '0.1em' }}>
        {orbitSponsors.length} active sponsors in orbit
      </div>
      <a href="/sponsor" style={{
        display: 'inline-block', marginTop: 12, padding: '8px 20px',
        background: `${accentColor}18`, border: `1px solid ${accentColor}44`,
        borderRadius: 8, fontSize: 9, fontWeight: 900, color: accentColor,
        textDecoration: 'none', letterSpacing: '0.1em',
      }}>JOIN ORBIT →</a>
    </div>
  );
}

// ── Booking Map ────────────────────────────────────────────────────────────────

const BOOKING_SLOTS = [
  { id: 'b1', city: 'New York, NY',     venue: 'Club Nova',       date: '2026-07-04', status: 'OPEN',   price: '$2,500', emoji: '🗽' },
  { id: 'b2', city: 'Atlanta, GA',      venue: 'Sound Haven',     date: '2026-07-12', status: 'OPEN',   price: '$1,800', emoji: '🍑' },
  { id: 'b3', city: 'Los Angeles, CA',  venue: 'Neon Amphitheater',date: '2026-07-19',status: 'BOOKED', price: '$3,200', emoji: '🌴' },
  { id: 'b4', city: 'Chicago, IL',      venue: 'Midwest Arena',   date: '2026-08-01', status: 'OPEN',   price: '$2,100', emoji: '🌆' },
  { id: 'b5', city: 'Houston, TX',      venue: 'Lone Star Stage',  date: '2026-08-15', status: 'OPEN',   price: '$1,600', emoji: '⭐' },
];

function BookingMap({ accentColor }: { accentColor: string }) {
  return (
    <div>
      <div style={{ fontSize: 9, color: 'rgba(255,255,255,.35)', marginBottom: 14, letterSpacing: '0.06em' }}>
        Available booking dates and confirmed shows
      </div>
      <div style={{ display: 'flex', flexDirection: 'column', gap: 8, marginBottom: 14 }}>
        {BOOKING_SLOTS.map(slot => (
          <div key={slot.id} style={{
            display: 'flex', alignItems: 'center', gap: 12,
            padding: '12px 14px',
            background: slot.status === 'BOOKED' ? 'rgba(255,215,0,0.05)' : `${accentColor}08`,
            border: `1px solid ${slot.status === 'BOOKED' ? 'rgba(255,215,0,0.2)' : accentColor + '22'}`,
            borderRadius: 9,
          }}>
            <span style={{ fontSize: 24, flexShrink: 0 }}>{slot.emoji}</span>
            <div style={{ flex: 1, minWidth: 0 }}>
              <div style={{ fontSize: 11, fontWeight: 800, color: '#fff', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                {slot.venue}
              </div>
              <div style={{ fontSize: 9, color: 'rgba(255,255,255,.4)', marginTop: 2 }}>
                {slot.city} · {new Date(slot.date).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
              </div>
            </div>
            <div style={{ textAlign: 'right', flexShrink: 0 }}>
              <div style={{ fontSize: 9, fontWeight: 700, color: slot.status === 'BOOKED' ? '#FFD700' : accentColor }}>
                {slot.status}
              </div>
              <div style={{ fontSize: 8, color: 'rgba(255,255,255,.3)', marginTop: 2 }}>{slot.price}</div>
            </div>
          </div>
        ))}
      </div>
      <a href="/booking" style={{
        display: 'block', textAlign: 'center', padding: '10px 0',
        background: `${accentColor}18`, border: `1px solid ${accentColor}44`,
        borderRadius: 8, fontSize: 9, fontWeight: 900, color: accentColor,
        textDecoration: 'none', letterSpacing: '0.1em',
      }}>
        REQUEST A BOOKING DATE →
      </a>
    </div>
  );
}

// ── MemoryWall (main export) ──────────────────────────────────────────────────

interface MemoryWallProps {
  accentColor?: string;
  title?: string;
  entityId?: string;
  entityType?: string;
}

export default function MemoryWall({ accentColor = "#00FFFF", title = "Memory Wall", entityId, entityType }: MemoryWallProps) {
  const [activeTab, setActiveTab] = useState<MemoryTab>("photos");
  const isFanSurface = entityType === "fan";
  const visibleTabs = TAB_CONFIG.filter((tab) => !(isFanSurface && (tab.id === "orbit" || tab.id === "booking")));
  const activeConfig = visibleTabs.find((t) => t.id === activeTab) ?? visibleTabs[0]!;

  useEffect(() => {
    if (!visibleTabs.some((tab) => tab.id === activeTab)) {
      setActiveTab(visibleTabs[0]?.id ?? "photos");
    }
  }, [activeTab, visibleTabs]);

  const counts: Partial<Record<MemoryTab, number>> = {};

  return (
    <div style={{
      border: `1px solid ${accentColor}22`,
      borderRadius: 14,
      background: "rgba(5,5,18,0.88)",
      overflow: "hidden",
    }}>
      {/* Header */}
      <div style={{
        display: "flex", alignItems: "center", gap: 8,
        padding: "12px 16px",
        borderBottom: `1px solid ${accentColor}18`,
        background: "rgba(255,255,255,0.02)",
      }}>
        <span style={{ fontSize: 15 }}>💾</span>
        <span style={{ fontSize: 11, fontWeight: 900, color: accentColor, letterSpacing: "0.14em", textTransform: "uppercase" }}>
          {title}
        </span>
        <motion.div
          animate={{ opacity: [1, 0.3, 1] }}
          transition={{ repeat: Infinity, duration: 2 }}
          style={{ marginLeft: "auto", width: 6, height: 6, borderRadius: "50%", background: accentColor }}
        />
      </div>

      {/* Tab bar */}
      <div style={{
        display: "flex",
        borderBottom: `1px solid rgba(255,255,255,0.06)`,
        background: "rgba(0,0,0,0.2)",
        overflowX: "auto",
      }}>
        {visibleTabs.map((tab) => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id)}
            style={{
              flex: 1, minWidth: 64, padding: "9px 4px",
              border: "none", cursor: "pointer",
              borderBottom: activeTab === tab.id ? `2px solid ${tab.color}` : "2px solid transparent",
              background: activeTab === tab.id ? `${tab.color}0A` : "transparent",
              display: "flex", flexDirection: "column", alignItems: "center", gap: 2,
              transition: "all 0.15s",
            }}
          >
            <span style={{ fontSize: 14 }}>{tab.icon}</span>
            <span style={{ fontSize: 8, fontWeight: 800, letterSpacing: "0.08em", textTransform: "uppercase", color: activeTab === tab.id ? tab.color : "rgba(255,255,255,0.3)" }}>
              {tab.label}
            </span>
          </button>
        ))}
      </div>

      {/* Tab content */}
      <div style={{ padding: 14 }}>
        <AnimatePresence mode="wait">
          <motion.div
            key={activeTab}
            initial={{ opacity: 0, y: 6 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -4 }}
            transition={{ duration: 0.15 }}
          >
            {activeTab === "photos"       && <PhotoSection accentColor={activeConfig.color} entityId={entityId} entityType={entityType} />}
            {activeTab === "videos"       && <VideoSection accentColor={activeConfig.color} entityId={entityId} entityType={entityType} />}
            {activeTab === "audio"        && <AudioSection accentColor={activeConfig.color} entityId={entityId} entityType={entityType} />}
            {activeTab === "moments"      && <MomentsSection accentColor={activeConfig.color} entityId={entityId} entityType={entityType} />}
            {activeTab === "achievements" && <AchievementsSection accentColor={activeConfig.color} />}
            {activeTab === "sponsors"     && <SponsorStampWall accentColor={activeConfig.color} />}
            {activeTab === "orbit"        && <SponsorOrbit accentColor={activeConfig.color} />}
            {activeTab === "booking"      && <BookingMap accentColor={activeConfig.color} />}
          </motion.div>
        </AnimatePresence>
      </div>
    </div>
  );
}
