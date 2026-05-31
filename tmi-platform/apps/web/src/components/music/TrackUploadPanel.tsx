"use client";

import { useState, useRef, useCallback, type ChangeEvent, type DragEvent } from "react";

export interface TrackMeta {
  title: string;
  genre: string;
  bpm?: number;
  key?: string;
  mood?: string;
  tags: string[];
  isInstrumental: boolean;
  forSale: boolean;
  price?: number;
  licenseType: "free" | "basic" | "exclusive";
  externalLinks: ExternalLink[];
  duration?: number;
  file?: File;
  coverUrl?: string;
}

export interface ExternalLink {
  platform: "spotify" | "apple_music" | "soundcloud" | "youtube" | "bandcamp" | "tidal" | "other";
  url: string;
}

const GENRES = [
  "Hip-Hop/Rap","R&B/Soul","Pop","Electronic","Jazz","Classical",
  "Rock","Afrobeats","Gospel","Country","Reggae","Latin","Dance","Funk",
  "Blues","Indie","Metal","Folk","Alternative","World",
];

const MOODS = ["Energetic","Chill","Hype","Romantic","Dark","Uplifting","Melancholic","Aggressive","Peaceful","Groovy"];

const LICENSE_INFO = {
  free:      { label: "Free Download",   desc: "Fan can download for free",         color: "#00FF88" },
  basic:     { label: "Basic License",   desc: "Non-exclusive rights for use",       color: "#00FFFF" },
  exclusive: { label: "Exclusive Rights",desc: "Full exclusive ownership transfer",  color: "#FF2DAA" },
};

const PLATFORMS: ExternalLink["platform"][] = ["spotify","apple_music","soundcloud","youtube","bandcamp","tidal","other"];
const PLATFORM_ICONS: Record<string, string> = {
  spotify: "🎵", apple_music: "🍎", soundcloud: "🔊", youtube: "▶️", bandcamp: "🎸", tidal: "🌊", other: "🔗",
};

interface TrackUploadPanelProps {
  onUpload?: (meta: TrackMeta) => void;
  onCancel?: () => void;
  accent?: string;
}

export default function TrackUploadPanel({ onUpload, onCancel, accent = "#FF2DAA" }: TrackUploadPanelProps) {
  const fileRef = useRef<HTMLInputElement>(null);
  const [dragging, setDragging] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [progress, setProgress]   = useState(0);
  const [step, setStep]           = useState<"drop" | "meta">("drop");
  const [tag, setTag]             = useState("");
  const [linkPlatform, setLinkPlatform] = useState<ExternalLink["platform"]>("spotify");
  const [linkUrl, setLinkUrl]     = useState("");

  const [meta, setMeta] = useState<TrackMeta>({
    title: "", genre: "", tags: [], isInstrumental: false,
    forSale: false, licenseType: "basic", externalLinks: [],
  });

  const set = <K extends keyof TrackMeta>(k: K, v: TrackMeta[K]) =>
    setMeta((m) => ({ ...m, [k]: v }));

  const handleFile = useCallback((file: File) => {
    if (!file.type.startsWith("audio/")) return;
    set("file", file);
    set("title", file.name.replace(/\.[^.]+$/, "").replace(/_/g, " "));
    // Get audio duration
    const url = URL.createObjectURL(file);
    const audio = new Audio(url);
    audio.onloadedmetadata = () => { set("duration", Math.round(audio.duration)); URL.revokeObjectURL(url); };
    setStep("meta");
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  const onDrop = (e: DragEvent) => {
    e.preventDefault(); setDragging(false);
    const f = e.dataTransfer.files[0];
    if (f) handleFile(f);
  };

  const addTag = () => {
    if (tag.trim() && !meta.tags.includes(tag.trim())) {
      set("tags", [...meta.tags, tag.trim()]);
      setTag("");
    }
  };

  const addLink = () => {
    if (!linkUrl.trim()) return;
    set("externalLinks", [...meta.externalLinks, { platform: linkPlatform, url: linkUrl.trim() }]);
    setLinkUrl("");
  };

  const submit = useCallback(async () => {
    if (!meta.title.trim()) return;
    setUploading(true);
    // Simulate progress
    for (let p = 0; p <= 100; p += 10) {
      await new Promise((r) => setTimeout(r, 80));
      setProgress(p);
    }
    onUpload?.(meta);
    setUploading(false);
  }, [meta, onUpload]);

  const BG = "#06080f";
  const BORDER = "rgba(255,255,255,0.08)";

  const Input = ({ label, value, onChange, placeholder, type = "text" }: { label: string; value: string; onChange: (v: string) => void; placeholder?: string; type?: string }) => (
    <div style={{ marginBottom: 14 }}>
      <label style={{ display: "block", fontSize: 9, fontWeight: 800, color: "rgba(255,255,255,0.4)", letterSpacing: "0.12em", marginBottom: 5 }}>{label}</label>
      <input type={type} value={value} onChange={(e: ChangeEvent<HTMLInputElement>) => onChange(e.target.value)} placeholder={placeholder ?? label}
        style={{ width: "100%", padding: "9px 12px", background: BG, border: `1px solid ${BORDER}`, borderRadius: 8, color: "#fff", fontSize: 12, outline: "none", fontFamily: "inherit", boxSizing: "border-box" }} />
    </div>
  );

  if (step === "drop") {
    return (
      <div style={{ fontFamily: "'Inter', sans-serif", color: "#fff" }}>
        <input ref={fileRef} type="file" accept="audio/*" style={{ display: "none" }} onChange={(e) => { const f = e.target.files?.[0]; if (f) handleFile(f); }} />
        <div
          onDragOver={(e) => { e.preventDefault(); setDragging(true); }}
          onDragLeave={() => setDragging(false)}
          onDrop={onDrop}
          onClick={() => fileRef.current?.click()}
          style={{
            border: `2px dashed ${dragging ? accent : "rgba(255,255,255,0.1)"}`,
            borderRadius: 14, padding: "48px 24px", textAlign: "center", cursor: "pointer",
            background: dragging ? `${accent}08` : "rgba(255,255,255,0.02)",
            transition: "all 0.2s",
          }}
        >
          <div style={{ fontSize: 44, marginBottom: 12 }}>🎵</div>
          <div style={{ fontSize: 15, fontWeight: 800, marginBottom: 6 }}>Drop your track here</div>
          <div style={{ fontSize: 12, color: "rgba(255,255,255,0.3)", marginBottom: 20 }}>MP3, WAV, FLAC, AAC — up to 500MB</div>
          <div style={{ display: "inline-block", padding: "10px 24px", background: accent, borderRadius: 8, fontSize: 11, fontWeight: 900, color: "#fff", letterSpacing: "0.08em" }}>
            Choose File
          </div>
        </div>

        {/* Song link shortcut */}
        <div style={{ marginTop: 16, padding: "14px", background: "rgba(255,255,255,0.02)", border: `1px solid ${BORDER}`, borderRadius: 10 }}>
          <div style={{ fontSize: 9, fontWeight: 800, color: "rgba(255,255,255,0.35)", letterSpacing: "0.12em", marginBottom: 10 }}>OR ADD A STREAMING LINK</div>
          <div style={{ display: "flex", gap: 8 }}>
            <select value={linkPlatform} onChange={(e) => setLinkPlatform(e.target.value as ExternalLink["platform"])}
              style={{ padding: "8px 10px", background: BG, border: `1px solid ${BORDER}`, borderRadius: 7, color: "#fff", fontSize: 11, outline: "none" }}>
              {PLATFORMS.map((p) => <option key={p} value={p}>{PLATFORM_ICONS[p]} {p.replace("_", " ")}</option>)}
            </select>
            <input type="url" value={linkUrl} onChange={(e) => setLinkUrl(e.target.value)} placeholder="Paste link…"
              style={{ flex: 1, padding: "8px 12px", background: BG, border: `1px solid ${BORDER}`, borderRadius: 7, color: "#fff", fontSize: 11, outline: "none", fontFamily: "inherit" }} />
            <button type="button" onClick={() => { addLink(); setStep("meta"); }}
              style={{ padding: "8px 14px", background: accent, border: "none", borderRadius: 7, cursor: "pointer", fontSize: 11, fontWeight: 900, color: "#fff" }}>
              Add →
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div style={{ fontFamily: "'Inter', sans-serif", color: "#fff", maxHeight: "80vh", overflowY: "auto" }}>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 18 }}>
        <div>
          <div style={{ fontSize: 14, fontWeight: 900 }}>Track Details</div>
          {meta.file && <div style={{ fontSize: 10, color: "rgba(255,255,255,0.35)", marginTop: 2 }}>{meta.file.name}</div>}
          {meta.duration && <div style={{ fontSize: 10, color: "rgba(255,255,255,0.35)" }}>{Math.floor(meta.duration / 60)}:{String(meta.duration % 60).padStart(2, "0")}</div>}
        </div>
        <button type="button" onClick={() => setStep("drop")} style={{ background: "none", border: "none", color: "rgba(255,255,255,0.3)", cursor: "pointer", fontSize: 11 }}>← Back</button>
      </div>

      <Input label="TITLE" value={meta.title} onChange={(v) => set("title", v)} />

      {/* Genre */}
      <div style={{ marginBottom: 14 }}>
        <label style={{ display: "block", fontSize: 9, fontWeight: 800, color: "rgba(255,255,255,0.4)", letterSpacing: "0.12em", marginBottom: 5 }}>GENRE</label>
        <select value={meta.genre} onChange={(e) => set("genre", e.target.value)}
          style={{ width: "100%", padding: "9px 12px", background: BG, border: `1px solid ${BORDER}`, borderRadius: 8, color: "#fff", fontSize: 12, outline: "none" }}>
          <option value="">Select genre…</option>
          {GENRES.map((g) => <option key={g} value={g}>{g}</option>)}
        </select>
      </div>

      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10, marginBottom: 14 }}>
        <Input label="BPM" value={String(meta.bpm ?? "")} onChange={(v) => set("bpm", parseInt(v) || undefined)} type="number" placeholder="120" />
        <div>
          <label style={{ display: "block", fontSize: 9, fontWeight: 800, color: "rgba(255,255,255,0.4)", letterSpacing: "0.12em", marginBottom: 5 }}>MOOD</label>
          <select value={meta.mood ?? ""} onChange={(e) => set("mood", e.target.value)}
            style={{ width: "100%", padding: "9px 12px", background: BG, border: `1px solid ${BORDER}`, borderRadius: 8, color: "#fff", fontSize: 12, outline: "none" }}>
            <option value="">Select mood…</option>
            {MOODS.map((m) => <option key={m} value={m}>{m}</option>)}
          </select>
        </div>
      </div>

      {/* Tags */}
      <div style={{ marginBottom: 14 }}>
        <label style={{ display: "block", fontSize: 9, fontWeight: 800, color: "rgba(255,255,255,0.4)", letterSpacing: "0.12em", marginBottom: 5 }}>TAGS</label>
        <div style={{ display: "flex", gap: 6, flexWrap: "wrap", marginBottom: 6 }}>
          {meta.tags.map((t) => (
            <div key={t} style={{ display: "flex", alignItems: "center", gap: 4, padding: "3px 10px", background: `${accent}18`, border: `1px solid ${accent}44`, borderRadius: 20, fontSize: 10, color: accent }}>
              {t}
              <button type="button" onClick={() => set("tags", meta.tags.filter((x) => x !== t))} style={{ background: "none", border: "none", cursor: "pointer", color: "inherit", fontSize: 10, padding: 0 }}>✕</button>
            </div>
          ))}
        </div>
        <div style={{ display: "flex", gap: 6 }}>
          <input type="text" value={tag} onChange={(e) => setTag(e.target.value)} onKeyDown={(e) => e.key === "Enter" && addTag()} placeholder="Add tag…"
            style={{ flex: 1, padding: "7px 12px", background: BG, border: `1px solid ${BORDER}`, borderRadius: 7, color: "#fff", fontSize: 11, outline: "none", fontFamily: "inherit" }} />
          <button type="button" onClick={addTag} style={{ padding: "7px 12px", background: `${accent}22`, border: `1px solid ${accent}44`, borderRadius: 7, cursor: "pointer", fontSize: 11, fontWeight: 700, color: accent }}>+ Add</button>
        </div>
      </div>

      {/* License */}
      <div style={{ marginBottom: 14 }}>
        <label style={{ display: "block", fontSize: 9, fontWeight: 800, color: "rgba(255,255,255,0.4)", letterSpacing: "0.12em", marginBottom: 8 }}>LICENSE TYPE</label>
        <div style={{ display: "flex", gap: 8 }}>
          {(Object.entries(LICENSE_INFO) as [TrackMeta["licenseType"], typeof LICENSE_INFO[keyof typeof LICENSE_INFO]][]).map(([k, v]) => (
            <button key={k} type="button" onClick={() => set("licenseType", k)}
              style={{ flex: 1, padding: "10px 6px", background: meta.licenseType === k ? `${v.color}18` : "rgba(255,255,255,0.02)", border: `1px solid ${meta.licenseType === k ? v.color + "55" : BORDER}`, borderRadius: 8, cursor: "pointer", textAlign: "center" }}>
              <div style={{ fontSize: 10, fontWeight: 800, color: meta.licenseType === k ? v.color : "rgba(255,255,255,0.5)", marginBottom: 2 }}>{v.label}</div>
              <div style={{ fontSize: 8, color: "rgba(255,255,255,0.25)" }}>{v.desc}</div>
            </button>
          ))}
        </div>
      </div>

      {/* Toggles */}
      <div style={{ display: "flex", gap: 10, marginBottom: 18 }}>
        {[
          { label: "Instrumental", key: "isInstrumental" as const },
          { label: "For Sale",     key: "forSale"         as const },
        ].map(({ label, key }) => (
          <button key={key} type="button" onClick={() => set(key, !meta[key])}
            style={{ flex: 1, padding: "9px", background: meta[key] ? `${accent}18` : "rgba(255,255,255,0.02)", border: `1px solid ${meta[key] ? accent + "44" : BORDER}`, borderRadius: 8, cursor: "pointer", fontSize: 11, fontWeight: 700, color: meta[key] ? accent : "rgba(255,255,255,0.4)" }}>
            {meta[key] ? "✓ " : ""}{label}
          </button>
        ))}
      </div>

      {meta.forSale && (
        <Input label="PRICE (USD)" value={String(meta.price ?? "")} onChange={(v) => set("price", parseFloat(v) || undefined)} type="number" placeholder="9.99" />
      )}

      {/* External links */}
      {meta.externalLinks.length > 0 && (
        <div style={{ marginBottom: 14 }}>
          <label style={{ display: "block", fontSize: 9, fontWeight: 800, color: "rgba(255,255,255,0.4)", letterSpacing: "0.12em", marginBottom: 6 }}>STREAMING LINKS</label>
          {meta.externalLinks.map((l, i) => (
            <div key={i} style={{ display: "flex", alignItems: "center", gap: 8, padding: "6px 10px", background: "rgba(255,255,255,0.02)", border: `1px solid ${BORDER}`, borderRadius: 7, marginBottom: 4 }}>
              <span style={{ fontSize: 13 }}>{PLATFORM_ICONS[l.platform]}</span>
              <span style={{ flex: 1, fontSize: 10, color: "rgba(255,255,255,0.4)", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{l.url}</span>
              <button type="button" onClick={() => set("externalLinks", meta.externalLinks.filter((_, j) => j !== i))} style={{ background: "none", border: "none", color: "rgba(255,68,68,0.5)", cursor: "pointer", fontSize: 13 }}>✕</button>
            </div>
          ))}
        </div>
      )}

      {/* Upload progress */}
      {uploading && (
        <div style={{ marginBottom: 14 }}>
          <div style={{ height: 4, background: "rgba(255,255,255,0.06)", borderRadius: 2, overflow: "hidden" }}>
            <div style={{ width: `${progress}%`, height: "100%", background: accent, borderRadius: 2, transition: "width 0.1s" }} />
          </div>
          <div style={{ fontSize: 10, color: "rgba(255,255,255,0.3)", marginTop: 4, textAlign: "center" }}>Uploading… {progress}%</div>
        </div>
      )}

      {/* Actions */}
      <div style={{ display: "flex", gap: 10 }}>
        {onCancel && (
          <button type="button" onClick={onCancel}
            style={{ flex: 1, padding: "11px", background: "rgba(255,255,255,0.04)", border: `1px solid ${BORDER}`, borderRadius: 9, cursor: "pointer", fontSize: 11, fontWeight: 700, color: "rgba(255,255,255,0.5)" }}>
            Cancel
          </button>
        )}
        <button type="button" onClick={() => void submit()} disabled={!meta.title.trim() || uploading}
          style={{ flex: 2, padding: "11px", background: meta.title.trim() ? accent : "rgba(255,255,255,0.06)", border: "none", borderRadius: 9, cursor: meta.title.trim() ? "pointer" : "not-allowed", fontSize: 12, fontWeight: 900, color: "#fff", letterSpacing: "0.06em", opacity: uploading ? 0.6 : 1 }}>
          {uploading ? `Uploading… ${progress}%` : "Publish Track"}
        </button>
      </div>
    </div>
  );
}
