"use client";

import { useState, useEffect } from "react";
import type { MediaType, MediaAsset } from "@/lib/media/MediaAssetEngine";
import MediaUploadWidget from "@/components/media/MediaUploadWidget";
import MediaProcessingStatusBar from "@/components/media/MediaProcessingStatusBar";

interface Props {
  ownerId: string;
  ownerName?: string;
  accentColor?: string;
  showUpload?: boolean;
}

const TABS: { key: MediaType | "all"; label: string; emoji: string }[] = [
  { key: "all",             label: "All",        emoji: "📦" },
  { key: "song",            label: "Songs",      emoji: "🎵" },
  { key: "beat",            label: "Beats",      emoji: "🎛️" },
  { key: "video",           label: "Videos",     emoji: "🎬" },
  { key: "battle_entry",    label: "Battles",    emoji: "⚔️" },
  { key: "challenge_entry", label: "Challenges", emoji: "⚡" },
  { key: "cypher_entry",    label: "Cyphers",    emoji: "🎤" },
];

const TYPE_COLOR: Partial<Record<MediaType, string>> = {
  song:            "#FF2DAA",
  beat:            "#AA2DFF",
  video:           "#00FFFF",
  battle_entry:    "#FF6B35",
  challenge_entry: "#FFD700",
  cypher_entry:    "#00FF88",
};

// Seed with demo assets so the library isn't empty on first visit
function seedDemoAssets(ownerId: string, ownerName: string): MediaAsset[] {
  const base = {
    ownerId, ownerName, ownerRole: "performer" as const,
    plays: 0, downloads: 0, revenue: 0, tags: [], metadata: {},
    status: "ready" as const, format: "mp3" as const, sizeBytes: 4_200_000,
    createdAt: new Date().toISOString(), updatedAt: new Date().toISOString(),
  };
  return [
    { ...base, id: `demo-song-1-${ownerId}`,  type: "song",            title: "Neon Frequency",     genre: "Hip-Hop",  bpm: 142, durationSecs: 214, url: "#" },
    { ...base, id: `demo-song-2-${ownerId}`,  type: "song",            title: "Crown Season",       genre: "Trap",     bpm: 138, durationSecs: 187, url: "#", plays: 3200 },
    { ...base, id: `demo-beat-1-${ownerId}`,  type: "beat",            title: "Dark Matter Loop",   genre: "Trap",     bpm: 145, durationSecs: 180, url: "#" },
    { ...base, id: `demo-vid-1-${ownerId}`,   type: "video",           title: "Stage Recap — May",  format: "mp4", sizeBytes: 22_000_000, durationSecs: 312, url: "#" },
    { ...base, id: `demo-battle-1-${ownerId}`,type: "battle_entry",    title: "vs. Wave Tek",       genre: "Hip-Hop",  bpm: 95,  durationSecs: 160, url: "#", plays: 840 },
    { ...base, id: `demo-cypher-1-${ownerId}`,type: "cypher_entry",    title: "Friday Cypher Verse",genre: "Hip-Hop",  durationSecs: 92,  url: "#" },
    { ...base, id: `demo-chal-1-${ownerId}`,  type: "challenge_entry", title: "Arena Challenge #4", genre: "EDM",      durationSecs: 128, url: "#" },
  ] as MediaAsset[];
}

export default function PerformerMediaLibrary({ ownerId, ownerName = "Performer", accentColor = "#AA2DFF", showUpload = true }: Props) {
  const [activeTab, setActiveTab] = useState<MediaType | "all">("all");
  const [assets, setAssets] = useState<MediaAsset[]>([]);
  const [showUploadPanel, setShowUploadPanel] = useState(false);
  const [processingIds, setProcessingIds] = useState<string[]>([]);

  useEffect(() => {
    async function load() {
      try {
        const res = await fetch(`/api/media/library?ownerId=${ownerId}`);
        if (res.ok) {
          const data = await res.json();
          const fetched: MediaAsset[] = data.assets ?? [];
          // Merge with demo seeds; prefer real assets, deduplicate by id
          const ids = new Set(fetched.map((a: MediaAsset) => a.id));
          const seeds = seedDemoAssets(ownerId, ownerName).filter(a => !ids.has(a.id));
          setAssets([...fetched, ...seeds]);
        } else {
          setAssets(seedDemoAssets(ownerId, ownerName));
        }
      } catch {
        setAssets(seedDemoAssets(ownerId, ownerName));
      }
    }
    load();
  }, [ownerId, ownerName]);

  const filtered = activeTab === "all" ? assets : assets.filter(a => a.type === activeTab);

  const uploadTypeMap: Record<string, MediaType> = {
    song: "song", beat: "beat", video: "video",
    battle_entry: "battle_entry", challenge_entry: "challenge_entry", cypher_entry: "cypher_entry",
  };
  const uploadType: MediaType = (activeTab !== "all" && uploadTypeMap[activeTab]) ? uploadTypeMap[activeTab] : "song";

  return (
    <div style={{ background: "rgba(255,255,255,0.015)", border: `1px solid ${accentColor}22`, borderRadius: 20, overflow: "hidden" }}>
      {/* Header */}
      <div style={{ padding: "16px 20px 0", borderBottom: `1px solid rgba(255,255,255,0.06)` }}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 14 }}>
          <div style={{ fontSize: 9, letterSpacing: "0.3em", color: accentColor, fontWeight: 800 }}>MEDIA LIBRARY</div>
          <div style={{ display: "flex", gap: 8, alignItems: "center" }}>
            <span style={{ fontSize: 9, color: "rgba(255,255,255,0.3)", fontWeight: 600 }}>{assets.length} assets</span>
            {showUpload && (
              <button
                onClick={() => setShowUploadPanel(v => !v)}
                style={{ padding: "5px 12px", borderRadius: 7, background: showUploadPanel ? `${accentColor}25` : `${accentColor}14`, border: `1px solid ${accentColor}44`, color: accentColor, fontSize: 9, fontWeight: 800, cursor: "pointer", letterSpacing: "0.06em" }}
              >
                {showUploadPanel ? "✕ CLOSE" : "+ UPLOAD"}
              </button>
            )}
          </div>
        </div>

        {/* Tab bar */}
        <div style={{ display: "flex", gap: 4, overflowX: "auto", paddingBottom: 12 }}>
          {TABS.map(t => (
            <button
              key={t.key}
              onClick={() => setActiveTab(t.key)}
              style={{
                padding: "5px 12px", borderRadius: 20, border: "none", cursor: "pointer", whiteSpace: "nowrap",
                fontSize: 9, fontWeight: 800, letterSpacing: "0.06em",
                background: activeTab === t.key ? accentColor : "rgba(255,255,255,0.05)",
                color: activeTab === t.key ? "#000" : "rgba(255,255,255,0.45)",
              }}
            >
              {t.emoji} {t.label}
            </button>
          ))}
        </div>
      </div>

      {/* Upload panel */}
      {showUploadPanel && (
        <div style={{ padding: "20px", borderBottom: `1px solid rgba(255,255,255,0.06)` }}>
          <MediaUploadWidget
            mediaType={uploadType}
            ownerId={ownerId}
            ownerName={ownerName}
            ownerRole="performer"
            accentColor={accentColor}
            onSuccess={result => {
              setShowUploadPanel(false);
              const newId = result.assetId ?? `new-${Date.now()}`;
              // Track in processing pipeline
              setProcessingIds(prev => [...prev, newId]);
              // Optimistic add — will be replaced on next load
              setAssets(prev => [{
                id: newId,
                ownerId, ownerName, ownerRole: "performer",
                type: uploadType,
                status: "processing",
                title: result.title,
                format: "mp3",
                sizeBytes: 0,
                url: result.url ?? "#",
                plays: 0, downloads: 0, revenue: 0, tags: [], metadata: {},
                createdAt: new Date().toISOString(),
                updatedAt: new Date().toISOString(),
              } as MediaAsset, ...prev]);
            }}
          />
        </div>
      )}

      {/* Processing status bar — visible when uploads are in-flight */}
      {processingIds.length > 0 && (
        <div style={{ padding: "0 20px 12px" }}>
          <MediaProcessingStatusBar
            assetIds={processingIds}
            accentColor={accentColor}
            onAllReady={() => setProcessingIds([])}
          />
        </div>
      )}

      {/* Asset grid */}
      <div style={{ padding: "16px 20px 20px" }}>
        {filtered.length === 0 ? (
          <div style={{ textAlign: "center", padding: "40px 0", color: "rgba(255,255,255,0.2)", fontSize: 12 }}>
            No {activeTab === "all" ? "media" : activeTab.replace("_", " ")} yet.
            {showUpload && <span> Hit + UPLOAD to add your first.</span>}
          </div>
        ) : (
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(200px, 1fr))", gap: 10 }}>
            {filtered.map(asset => (
              <AssetCard key={asset.id} asset={asset} />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

function AssetCard({ asset }: { asset: MediaAsset }) {
  const color = TYPE_COLOR[asset.type as MediaType] ?? "#00FFFF";
  const fmtDuration = (s?: number) => {
    if (!s) return "";
    const m = Math.floor(s / 60);
    const sec = s % 60;
    return `${m}:${String(sec).padStart(2, "0")}`;
  };

  return (
    <div style={{ background: "rgba(255,255,255,0.02)", border: `1px solid ${color}22`, borderRadius: 12, padding: "12px 14px", display: "flex", flexDirection: "column", gap: 6, transition: "border-color 0.15s" }}>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start" }}>
        <span style={{ fontSize: 9, fontWeight: 800, color, letterSpacing: "0.1em" }}>
          {asset.type.replace("_", " ").toUpperCase()}
        </span>
        {asset.status === "processing" && (
          <span style={{ fontSize: 8, color: "#FFD700", fontWeight: 700 }}>PROCESSING</span>
        )}
        {asset.status === "ready" && asset.plays > 0 && (
          <span style={{ fontSize: 8, color: "rgba(255,255,255,0.3)" }}>▶ {asset.plays.toLocaleString()}</span>
        )}
      </div>
      <div style={{ fontSize: 12, fontWeight: 700, color: "#fff", lineHeight: 1.3 }}>{asset.title}</div>
      <div style={{ display: "flex", gap: 6, flexWrap: "wrap", marginTop: 2 }}>
        {asset.genre && <span style={{ fontSize: 8, color: "rgba(255,255,255,0.35)" }}>{asset.genre}</span>}
        {asset.bpm && <span style={{ fontSize: 8, color: "rgba(255,255,255,0.25)" }}>{asset.bpm} BPM</span>}
        {asset.durationSecs && <span style={{ fontSize: 8, color: "rgba(255,255,255,0.25)" }}>{fmtDuration(asset.durationSecs)}</span>}
      </div>
    </div>
  );
}
