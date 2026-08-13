"use client";

import React, { useState, useEffect, useRef } from "react";
import CollapsibleCanister from "./CollapsibleCanister";
export type MediaLockerTab = "songs" | "videos" | "images" | "documents";

interface MediaItem {
  id: string;
  title: string;
  type: MediaLockerTab;
  url: string;
  addedAt: string;
  size?: string;
}

interface MediaLockerCanisterProps {
  userId: string;
  role: "fan" | "performer";
  accentColor?: string;
}

/**
 * MediaLockerCanister
 * The user's personal digital backpack. 
 * Replaces BeatLocker for playlist sourcing.
 */
export default function MediaLockerCanister({
  userId,
  role,
  accentColor = "#00FFFF",
}: MediaLockerCanisterProps) {
  const [activeTab, setActiveTab] = useState<MediaLockerTab>("songs");
  const [items, setItems] = useState<MediaItem[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isUploading, setIsUploading] = useState(false);
  const [uploadError, setUploadError] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const reloadLocker = async () => {
    const r = await fetch("/api/media/locker", { credentials: "include" });
    const d = (await r.json()) as { items?: MediaItem[]; error?: string };
    if (!r.ok) {
      setItems([]);
      setUploadError(d.error ?? "Unable to load Media Locker.");
      return;
    }
    setItems(d.items || []);
    setUploadError(null);
  };

  useEffect(() => {
    void reloadLocker().finally(() => setIsLoading(false));
  }, []);

  const ACCEPT_MAP: Record<MediaLockerTab, string> = {
    songs: "audio/mpeg,audio/mp3,audio/wav,audio/ogg,audio/m4a,audio/aac,audio/*",
    videos: "video/mp4,video/webm,video/quicktime,video/*",
    images: "image/jpeg,image/png,image/webp,image/*",
    documents: "application/pdf,text/plain,application/msword,.pdf,.txt,.doc,.docx",
  };

  const handleUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setIsUploading(true);
    setUploadError(null);

    try {
      const isImage = file.type.startsWith("image/");
      const isDocument = activeTab === "documents" || file.type.startsWith("application/") || file.type === "text/plain";

      // Images: blob upload exists, but no Media Locker image row model yet.
      // Documents: no durable locker path — do not pretend success.
      if (isDocument && !isImage) {
        setUploadError("Document locker binding is not available yet. Upload was not saved.");
        return;
      }
      if (isImage) {
        const fd = new FormData();
        fd.append("file", file);
        fd.append("context", "media-locker");
        const res = await fetch("/api/upload", { method: "POST", body: fd, credentials: "include" });
        const data = (await res.json()) as { url?: string; success?: boolean; error?: string };
        if (!res.ok || !data.url) {
          setUploadError(data.error ?? "Image upload failed. Nothing was saved.");
          return;
        }
        setUploadError(
          "Image reached storage, but is not bound into Media Locker yet. Set your Profile photo for canonical identity.",
        );
        return;
      }

      const fd = new FormData();
      fd.append("file", file);
      const res = await fetch("/api/upload/media", { method: "POST", body: fd, credentials: "include" });
      const data = (await res.json()) as {
        ok?: boolean;
        url?: string;
        id?: string;
        error?: string;
      };
      if (!res.ok || !data.ok || !data.id) {
        setUploadError(data.error ?? "Upload failed. Track was not saved.");
        return;
      }
      // Reconstruct list from server truth — never keep optimistic local-only IDs.
      await reloadLocker();
    } catch {
      setUploadError("Upload failed. Check connection and try again.");
    } finally {
      setIsUploading(false);
      if (fileInputRef.current) fileInputRef.current.value = "";
    }
  };

  const tabs: { id: MediaLockerTab; label: string; icon: string }[] = [
    { id: "songs", label: "Audio", icon: "🎵" },
    { id: "videos", label: "Video", icon: "🎬" },
    { id: "images", label: "Images", icon: "🖼️" },
    { id: "documents", label: "Files", icon: "📄" },
  ];

  const activeItems = items.filter((item) => item.type === activeTab);

  if (isLoading) {
    return (
      <CollapsibleCanister icon="🗄️" label={role === "performer" ? "Content Studio (Media Locker)" : "My Media Locker"} summary="Loading..." accentColor={accentColor}>
        <div style={{ padding: 12, textAlign: "center", color: "rgba(255,255,255,0.3)", fontSize: 11 }}>Loading media...</div>
      </CollapsibleCanister>
    );
  }

  return (
    <CollapsibleCanister
      icon="🗄️"
      label={role === "performer" ? "Content Studio (Media Locker)" : "My Media Locker"}
      summary={`${items.length} items`}
      accentColor={accentColor}
    >
      <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
        {uploadError && (
          <div
            role="alert"
            style={{
              padding: "8px 10px",
              borderRadius: 6,
              border: "1px solid rgba(255,80,80,0.45)",
              background: "rgba(255,40,40,0.12)",
              color: "#FFB4B4",
              fontSize: 11,
              fontWeight: 600,
              lineHeight: 1.4,
            }}
          >
            {uploadError}
          </div>
        )}

        {/* Tabs */}
        <div style={{ display: "flex", gap: 6, borderBottom: "1px solid rgba(255,255,255,0.1)", paddingBottom: 8 }}>
          {tabs.map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              style={{
                padding: "6px 12px",
                background: activeTab === tab.id ? `${accentColor}22` : "transparent",
                border: `1px solid ${activeTab === tab.id ? accentColor : "transparent"}`,
                color: activeTab === tab.id ? accentColor : "rgba(255,255,255,0.5)",
                borderRadius: 6,
                fontSize: 11,
                fontWeight: 700,
                cursor: "pointer",
                display: "flex",
                alignItems: "center",
                gap: 4,
              }}
            >
              <span>{tab.icon}</span> {tab.label}
            </button>
          ))}
        </div>

        {/* Content Area */}
        <div style={{ minHeight: 150, background: "rgba(0,0,0,0.2)", borderRadius: 8, padding: 12, border: "1px solid rgba(255,255,255,0.05)" }}>
          {activeItems.length === 0 ? (
            <div style={{ display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", height: "100%", color: "rgba(255,255,255,0.3)", fontSize: 11 }}>
              <span style={{ fontSize: 24, marginBottom: 8 }}>{tabs.find(t => t.id === activeTab)?.icon}</span>
              No {activeTab} in your locker yet.
            </div>
          ) : (
            <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
              {activeItems.map((item) => (
                <div key={item.id} style={{ display: "flex", justifyContent: "space-between", alignItems: "center", padding: "8px 12px", background: "rgba(255,255,255,0.03)", borderRadius: 6, border: "1px solid rgba(255,255,255,0.05)" }}>
                  <div style={{ display: "flex", flexDirection: "column", gap: 2 }}>
                    <span style={{ fontSize: 12, fontWeight: 700, color: "#fff" }}>{item.title}</span>
                    <span style={{ fontSize: 9, color: "rgba(255,255,255,0.4)" }}>{item.addedAt} • {item.size}</span>
                  </div>
                  <div style={{ display: "flex", gap: 6 }}>
                    <button style={{ padding: "4px 8px", fontSize: 9, fontWeight: 800, background: "transparent", color: accentColor, border: `1px solid ${accentColor}55`, borderRadius: 4, cursor: "pointer" }}>+ PLAYLIST</button>
                    <button style={{ padding: "4px 8px", fontSize: 9, fontWeight: 800, background: "transparent", color: "#FFD700", border: `1px solid #FFD70055`, borderRadius: 4, cursor: "pointer" }}>+ MEMORY</button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        <button
          onClick={() => fileInputRef.current?.click()}
          disabled={isUploading}
          style={{ width: "100%", padding: "10px", background: isUploading ? "rgba(0,255,255,0.3)" : accentColor, color: "#000", fontWeight: 900, fontSize: 11, border: "none", borderRadius: 8, cursor: isUploading ? "not-allowed" : "pointer", letterSpacing: "0.1em", opacity: isUploading ? 0.7 : 1 }}>
          {isUploading ? "⏳ UPLOADING…" : `⬆ UPLOAD NEW ${activeTab.toUpperCase().slice(0, -1)}`}
        </button>
        <input
          ref={fileInputRef}
          type="file"
          accept={ACCEPT_MAP[activeTab]}
          style={{ display: "none" }}
          onChange={handleUpload}
        />
      </div>
    </CollapsibleCanister>
  );
}