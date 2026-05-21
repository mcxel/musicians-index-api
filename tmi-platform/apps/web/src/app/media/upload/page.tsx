"use client";
import { useState } from "react";
import Link from "next/link";

const ACCEPTED_TYPES = ["Video (MP4, MOV)", "Audio (MP3, WAV, FLAC)", "Image (JPG, PNG, WebP)", "Beat Pack (ZIP)"];

export default function MediaUploadPage() {
  const [dragging, setDragging] = useState(false);
  const [file, setFile] = useState<File | null>(null);
  const [title, setTitle] = useState("");
  const [type, setType] = useState("Video");
  const [uploaded, setUploaded] = useState(false);

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setDragging(false);
    const dropped = e.dataTransfer.files[0];
    if (dropped) { setFile(dropped); setTitle(dropped.name.replace(/\.[^.]+$/, "")); }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const f = e.target.files?.[0];
    if (f) { setFile(f); setTitle(f.name.replace(/\.[^.]+$/, "")); }
  };

  if (uploaded) {
    return (
      <main style={{ minHeight: "100vh", background: "#060410", color: "#fff", display: "flex", alignItems: "center", justifyContent: "center", fontFamily: "'Inter', sans-serif" }}>
        <div style={{ textAlign: "center", padding: 40 }}>
          <div style={{ fontSize: 56, marginBottom: 16 }}>✅</div>
          <h1 style={{ fontSize: 28, fontWeight: 900, margin: "0 0 10px" }}>Upload Queued!</h1>
          <p style={{ color: "rgba(255,255,255,0.5)", marginBottom: 24 }}>{title} is being processed and will appear in your library shortly.</p>
          <div style={{ display: "flex", gap: 12, justifyContent: "center" }}>
            <Link href="/media/library" style={{ padding: "12px 24px", borderRadius: 10, background: "#00FFAA", color: "#060410", fontWeight: 800, fontSize: 13, textDecoration: "none" }}>View Library</Link>
            <Link href="/media/upload" style={{ padding: "12px 24px", borderRadius: 10, background: "rgba(255,255,255,0.08)", color: "#fff", fontWeight: 700, fontSize: 13, textDecoration: "none" }}>Upload Another</Link>
          </div>
        </div>
      </main>
    );
  }

  return (
    <main style={{ minHeight: "100vh", background: "#060410", color: "#fff", fontFamily: "'Inter', sans-serif", paddingBottom: 80 }}>
      <div style={{ padding: "32px 24px 0", display: "flex", justifyContent: "space-between" }}>
        <Link href="/media" style={{ fontSize: 9, fontWeight: 700, letterSpacing: "0.14em", color: "rgba(255,255,255,0.3)", textDecoration: "none" }}>← MEDIA</Link>
      </div>
      <div style={{ maxWidth: 600, margin: "40px auto", padding: "0 24px" }}>
        <div style={{ fontSize: 9, fontWeight: 800, letterSpacing: "0.2em", color: "#00FFAA", textTransform: "uppercase", marginBottom: 8 }}>MEDIA</div>
        <h1 style={{ fontSize: "clamp(22px,4vw,36px)", fontWeight: 900, margin: "0 0 6px" }}>Upload Content</h1>
        <p style={{ fontSize: 13, color: "rgba(255,255,255,0.4)", margin: "0 0 28px" }}>Share your music, video, and artwork on TMI.</p>

        <div
          onDragOver={(e) => { e.preventDefault(); setDragging(true); }}
          onDragLeave={() => setDragging(false)}
          onDrop={handleDrop}
          style={{ border: `2px dashed ${dragging ? "#00FFAA" : "rgba(255,255,255,0.15)"}`, borderRadius: 16, padding: "40px 24px", textAlign: "center", marginBottom: 20, background: dragging ? "rgba(0,255,170,0.05)" : "rgba(255,255,255,0.02)", transition: "all 0.2s", cursor: "pointer" }}
          onClick={() => document.getElementById("file-input")?.click()}
        >
          <div style={{ fontSize: 36, marginBottom: 12 }}>📤</div>
          {file ? (
            <div>
              <div style={{ fontSize: 14, fontWeight: 700, color: "#00FFAA", marginBottom: 4 }}>{file.name}</div>
              <div style={{ fontSize: 12, color: "rgba(255,255,255,0.4)" }}>{(file.size / 1024 / 1024).toFixed(1)} MB</div>
            </div>
          ) : (
            <div>
              <div style={{ fontSize: 14, fontWeight: 600, marginBottom: 6 }}>Drop file here or click to browse</div>
              <div style={{ fontSize: 11, color: "rgba(255,255,255,0.35)" }}>{ACCEPTED_TYPES.join(" · ")}</div>
            </div>
          )}
          <input id="file-input" type="file" style={{ display: "none" }} onChange={handleFileChange} accept="video/*,audio/*,image/*,.zip" />
        </div>

        <div style={{ marginBottom: 16 }}>
          <label style={{ display: "block", fontSize: 11, fontWeight: 700, color: "rgba(255,255,255,0.5)", marginBottom: 6, letterSpacing: "0.1em" }}>TITLE</label>
          <input value={title} onChange={(e) => setTitle(e.target.value)} placeholder="Name your content" style={{ width: "100%", background: "rgba(255,255,255,0.06)", border: "1px solid rgba(255,255,255,0.12)", borderRadius: 10, padding: "12px 16px", color: "#fff", fontSize: 13, outline: "none", boxSizing: "border-box" }} />
        </div>

        <div style={{ marginBottom: 24 }}>
          <label style={{ display: "block", fontSize: 11, fontWeight: 700, color: "rgba(255,255,255,0.5)", marginBottom: 6, letterSpacing: "0.1em" }}>TYPE</label>
          <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
            {["Video", "Audio", "Image", "Beat Pack"].map((t) => (
              <button key={t} onClick={() => setType(t)} style={{ padding: "8px 16px", borderRadius: 8, fontSize: 12, fontWeight: 700, background: type === t ? "rgba(0,255,170,0.15)" : "rgba(255,255,255,0.05)", border: `1px solid ${type === t ? "#00FFAA" : "rgba(255,255,255,0.1)"}`, color: type === t ? "#00FFAA" : "rgba(255,255,255,0.5)", cursor: "pointer" }}>{t}</button>
            ))}
          </div>
        </div>

        <button onClick={() => { if (file && title) setUploaded(true); }} disabled={!file || !title}
          style={{ width: "100%", padding: "14px", borderRadius: 12, background: file && title ? "#00FFAA" : "rgba(255,255,255,0.08)", color: file && title ? "#060410" : "rgba(255,255,255,0.3)", fontWeight: 900, fontSize: 15, cursor: file && title ? "pointer" : "not-allowed", border: "none" }}>
          Upload {type} →
        </button>
      </div>
    </main>
  );
}
