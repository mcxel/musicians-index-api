"use client";
/**
 * MediaUploadWidget — Universal upload component for all TMI media types.
 *
 * Drop-in for: Challenge Arena · Beat Vault · Artist Profile · Magazine · Venues
 *
 * Props:
 *   mediaType   — what kind of content (song, beat, video, challenge_entry, etc.)
 *   ownerId     — uploader's user ID
 *   ownerName   — display name
 *   ownerRole   — their role on the platform
 *   onSuccess   — called with { assetId, url } after upload
 *   linkedEntityId/Type — connect upload to a specific challenge, battle, room, etc.
 *   accentColor — theme color
 *   compact     — small inline version
 */

import { useState, useRef, useCallback } from "react";
import type { MediaType, UploadResult } from "@/lib/media/MediaAssetEngine";
import { MEDIA_TYPE_META } from "@/lib/media/MediaAssetEngine";
import { uploadCanonicalMediaFile } from "@/lib/media/clientMediaUpload";

interface Props {
  mediaType:        MediaType;
  ownerId?:         string;
  ownerName?:       string;
  ownerRole?:       "performer" | "fan" | "venue" | "sponsor" | "advertiser" | "promoter";
  onSuccess?:       (result: UploadResult & { title: string }) => void;
  onError?:         (error: string) => void;
  linkedEntityId?:  string;
  linkedEntityType?: string;
  accentColor?:     string;
  compact?:         boolean;
  placeholder?:     string;
}

const ACCEPTED: Record<MediaType, string> = {
  song:            ".mp3,.wav,.aac,.mp4",
  beat:            ".mp3,.wav,.aac",
  video:           ".mp4,.webm",
  livestream:      ".mp4,.webm",
  interview:       ".mp4,.webm",
  challenge_entry: ".mp3,.wav,.aac,.mp4",
  battle_entry:    ".mp3,.wav,.aac,.mp4,.webm",
  cypher_entry:    ".mp3,.wav,.mp4,.webm",
  article_media:   ".mp4,.jpg,.jpeg,.png,.gif",
  sponsor_asset:   ".mp4,.jpg,.jpeg,.png",
  venue_promo:     ".mp4,.jpg,.jpeg,.png",
  nft_asset:       ".jpg,.jpeg,.png,.gif,.mp4",
};

export default function MediaUploadWidget({
  mediaType,
  onSuccess, onError, linkedEntityId, linkedEntityType,
  accentColor = "#FF2DAA", compact = false, placeholder,
}: Props) {
  const [title, setTitle] = useState("");
  const [genre, setGenre] = useState("");
  const [bpm, setBpm] = useState("");
  const [fileName, setFileName] = useState("");
  const [fileSize, setFileSize] = useState(0);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [uploading, setUploading] = useState(false);
  const [progress, setProgress] = useState(0);
  const [done, setDone] = useState(false);
  const [error, setError] = useState("");
  const [dragging, setDragging] = useState(false);
  const fileRef = useRef<HTMLInputElement>(null);

  const meta = MEDIA_TYPE_META[mediaType];
  const isBeat = mediaType === "beat";

  const handleFile = useCallback((file: File) => {
    setSelectedFile(file);
    setFileName(file.name);
    setFileSize(file.size);
    setError("");
    if (!title) setTitle(file.name.replace(/\.[^/.]+$/, "").replace(/[-_]/g, " "));
  }, [title]);

  const onDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setDragging(false);
    const file = e.dataTransfer.files[0];
    if (file) handleFile(file);
  }, [handleFile]);

  async function handleUpload() {
    if (!selectedFile || !title.trim()) {
      setError("Add a title and select a file.");
      return;
    }
    setUploading(true);
    setProgress(10);
    setError("");

    try {
      const extra: Record<string, string> = { type: mediaType };
      if (genre) extra.genre = genre;
      if (bpm) extra.bpm = bpm;
      if (linkedEntityId) extra.linkedEntityId = linkedEntityId;
      if (linkedEntityType) extra.linkedEntityType = linkedEntityType;

      const result = await uploadCanonicalMediaFile(selectedFile, {
        title: title.trim(),
        persistVia: "/api/media/upload",
        extraForm: extra,
      });

      setProgress(95);

      if (!result.ok) {
        throw new Error(result.error);
      }

      setProgress(100);
      setDone(true);
      if (onSuccess) {
        onSuccess({
          ok: true,
          assetId: result.id,
          url: result.url,
          status: "ready",
          title: title.trim(),
        });
      }
    } catch (e) {
      const msg = e instanceof Error ? e.message : "Upload failed";
      setError(msg);
      if (onError) onError(msg);
    } finally {
      setUploading(false);
    }
  }

  if (compact) {
    return (
      <div style={{ display: "flex", gap: 8, alignItems: "center", flexWrap: "wrap" }}>
        <label style={{ cursor: "pointer", padding: "7px 14px", borderRadius: 8, background: `${accentColor}18`, border: `1px solid ${accentColor}44`, color: accentColor, fontSize: 10, fontWeight: 800, letterSpacing: "0.06em", whiteSpace: "nowrap" }}>
          {meta.emoji} {fileName || (placeholder ?? `Upload ${meta.label}`)}
          <input ref={fileRef} type="file" accept={ACCEPTED[mediaType]} style={{ display: "none" }} onChange={e => e.target.files?.[0] && handleFile(e.target.files[0])} />
        </label>
        {fileName && (
          <button onClick={handleUpload} disabled={uploading || !title} style={{ padding: "7px 14px", borderRadius: 8, background: accentColor, color: "#000", fontSize: 10, fontWeight: 900, border: "none", cursor: "pointer" }}>
            {uploading ? `${progress}%` : done ? "✓ DONE" : "SUBMIT"}
          </button>
        )}
        {error && <span style={{ fontSize: 9, color: "#FF2020" }}>{error}</span>}
      </div>
    );
  }

  return (
    <div style={{ background: "rgba(255,255,255,0.02)", border: `1px solid ${accentColor}22`, borderRadius: 18, padding: "24px" }}>
      <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 20 }}>
        <span style={{ fontSize: 28 }}>{meta.emoji}</span>
        <div>
          <div style={{ fontSize: 10, letterSpacing: "0.18em", color: accentColor, fontWeight: 800 }}>UPLOAD {meta.label.toUpperCase()}</div>
          <div style={{ fontSize: 11, color: "rgba(255,255,255,0.4)", marginTop: 2 }}>
            Accepted: {ACCEPTED[mediaType]} · Max {mediaType === "video" ? "500" : "50"} MB
          </div>
        </div>
      </div>

      {/* Drop zone */}
      <div
        onDragOver={e => { e.preventDefault(); setDragging(true); }}
        onDragLeave={() => setDragging(false)}
        onDrop={onDrop}
        onClick={() => fileRef.current?.click()}
        style={{ border: `2px dashed ${dragging ? accentColor : accentColor + "44"}`, borderRadius: 12, padding: "28px 20px", textAlign: "center", cursor: "pointer", background: dragging ? `${accentColor}08` : "transparent", transition: "all 0.15s", marginBottom: 16 }}
      >
        <input ref={fileRef} type="file" accept={ACCEPTED[mediaType]} style={{ display: "none" }} onChange={e => e.target.files?.[0] && handleFile(e.target.files[0])} />
        {fileName ? (
          <>
            <div style={{ fontSize: 24, marginBottom: 6 }}>✓</div>
            <div style={{ fontSize: 12, fontWeight: 700, color: accentColor }}>{fileName}</div>
            <div style={{ fontSize: 10, color: "rgba(255,255,255,0.4)", marginTop: 2 }}>{(fileSize / 1024 / 1024).toFixed(2)} MB · Click to change</div>
          </>
        ) : (
          <>
            <div style={{ fontSize: 32, marginBottom: 8 }}>📁</div>
            <div style={{ fontSize: 12, fontWeight: 700, color: "rgba(255,255,255,0.6)", marginBottom: 4 }}>Drop your {meta.label.toLowerCase()} here</div>
            <div style={{ fontSize: 10, color: "rgba(255,255,255,0.3)" }}>or click to browse · {ACCEPTED[mediaType]}</div>
          </>
        )}
      </div>

      {/* Metadata fields */}
      <div style={{ display: "flex", flexDirection: "column", gap: 10, marginBottom: 16 }}>
        <input
          placeholder={`${meta.label} title *`}
          value={title}
          onChange={e => setTitle(e.target.value)}
          style={{ padding: "10px 12px", background: "rgba(255,255,255,0.05)", border: `1px solid ${title ? accentColor + "44" : "rgba(255,255,255,0.1)"}`, borderRadius: 8, color: "#fff", fontSize: 13, outline: "none" }}
        />
        <div style={{ display: "flex", gap: 10 }}>
          <input
            placeholder="Genre (optional)"
            value={genre}
            onChange={e => setGenre(e.target.value)}
            style={{ flex: 1, padding: "9px 12px", background: "rgba(255,255,255,0.04)", border: "1px solid rgba(255,255,255,0.08)", borderRadius: 8, color: "#fff", fontSize: 12, outline: "none" }}
          />
          {(isBeat || mediaType === "song") && (
            <input
              placeholder="BPM"
              type="number"
              value={bpm}
              onChange={e => setBpm(e.target.value)}
              style={{ width: 80, padding: "9px 12px", background: "rgba(255,255,255,0.04)", border: "1px solid rgba(255,255,255,0.08)", borderRadius: 8, color: "#fff", fontSize: 12, outline: "none" }}
            />
          )}
        </div>
      </div>

      {/* Progress bar */}
      {uploading && (
        <div style={{ marginBottom: 12 }}>
          <div style={{ height: 4, background: "rgba(255,255,255,0.08)", borderRadius: 2, overflow: "hidden" }}>
            <div style={{ height: "100%", background: accentColor, borderRadius: 2, width: `${progress}%`, transition: "width 0.3s ease" }} />
          </div>
          <div style={{ fontSize: 9, color: "rgba(255,255,255,0.4)", marginTop: 4, textAlign: "center" }}>Uploading… {progress}%</div>
        </div>
      )}

      {error && <div style={{ fontSize: 11, color: "#FF2020", marginBottom: 10, padding: "6px 10px", background: "rgba(255,32,32,0.08)", borderRadius: 6 }}>{error}</div>}

      <button
        onClick={handleUpload}
        disabled={uploading || done || !fileName || !title.trim()}
        style={{ width: "100%", padding: "13px 0", borderRadius: 10, border: "none", background: done ? "#00FF88" : (uploading || !fileName || !title.trim()) ? "rgba(255,255,255,0.08)" : `linear-gradient(90deg, ${accentColor}, ${accentColor}88)`, color: done ? "#000" : (uploading || !fileName || !title.trim()) ? "rgba(255,255,255,0.3)" : "#000", fontWeight: 900, fontSize: 12, cursor: (uploading || done || !fileName || !title.trim()) ? "not-allowed" : "pointer", letterSpacing: "0.1em", transition: "all 0.15s" }}
      >
        {done ? "✓ UPLOADED SUCCESSFULLY" : uploading ? `UPLOADING ${progress}%…` : `UPLOAD ${meta.label.toUpperCase()}`}
      </button>

      {done && (
        <div style={{ marginTop: 10, textAlign: "center", fontSize: 10, color: "#00FF88" }}>
          Saved with a playable source. Open Media Locker and press Play — refresh should still hear it.
        </div>
      )}
    </div>
  );
}
