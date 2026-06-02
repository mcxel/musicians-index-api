"use client";
/**
 * VideoUploadWithProgress — upload tracks, beats, or performance recordings
 * with real-time progress bar. Posts to /api/media/upload.
 */
import { useState, useRef } from "react";

interface Props {
  accept?: string;
  maxSizeMB?: number;
  label?: string;
  accentColor?: string;
  onUploadComplete?: (url: string, filename: string) => void;
  onError?: (msg: string) => void;
}

export default function VideoUploadWithProgress({
  accept = "video/*,audio/*",
  maxSizeMB = 500,
  label = "Upload Video or Audio",
  accentColor = "#AA2DFF",
  onUploadComplete,
  onError,
}: Props) {
  const [progress, setProgress] = useState(0);
  const [status, setStatus] = useState<"idle" | "uploading" | "done" | "error">("idle");
  const [filename, setFilename] = useState<string | null>(null);
  const [dragOver, setDragOver] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  async function handleFile(file: File) {
    if (file.size > maxSizeMB * 1024 * 1024) {
      setStatus("error");
      onError?.(`File too large. Max ${maxSizeMB}MB.`);
      return;
    }

    setFilename(file.name);
    setStatus("uploading");
    setProgress(0);

    const formData = new FormData();
    formData.append("file", file);

    const xhr = new XMLHttpRequest();
    xhr.open("POST", "/api/media/upload");

    xhr.upload.addEventListener("progress", (e) => {
      if (e.lengthComputable) {
        setProgress(Math.round((e.loaded / e.total) * 100));
      }
    });

    xhr.addEventListener("load", () => {
      if (xhr.status >= 200 && xhr.status < 300) {
        setStatus("done");
        setProgress(100);
        try {
          const data = JSON.parse(xhr.responseText);
          onUploadComplete?.(data.url ?? "", file.name);
        } catch {
          onUploadComplete?.("", file.name);
        }
      } else {
        setStatus("error");
        onError?.(`Upload failed: ${xhr.status}`);
      }
    });

    xhr.addEventListener("error", () => {
      setStatus("error");
      onError?.("Network error during upload");
    });

    xhr.send(formData);
  }

  function handleInputChange(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (file) handleFile(file);
  }

  function handleDrop(e: React.DragEvent) {
    e.preventDefault();
    setDragOver(false);
    const file = e.dataTransfer.files?.[0];
    if (file) handleFile(file);
  }

  return (
    <div style={{ fontFamily: "'Inter', sans-serif" }}>
      {/* Drop zone */}
      <div
        onDragOver={(e) => { e.preventDefault(); setDragOver(true); }}
        onDragLeave={() => setDragOver(false)}
        onDrop={handleDrop}
        onClick={() => status !== "uploading" && inputRef.current?.click()}
        style={{
          border: `2px dashed ${dragOver ? accentColor : accentColor + "44"}`,
          borderRadius: 14, padding: "32px 20px",
          textAlign: "center", cursor: status === "uploading" ? "default" : "pointer",
          background: dragOver ? `${accentColor}08` : "rgba(255,255,255,0.02)",
          transition: "all 0.2s",
        }}
      >
        <input
          ref={inputRef}
          type="file"
          accept={accept}
          onChange={handleInputChange}
          style={{ display: "none" }}
        />
        <div style={{ fontSize: 32, marginBottom: 8 }}>
          {status === "done" ? "✅" : status === "error" ? "❌" : "📁"}
        </div>
        <div style={{ fontSize: 11, fontWeight: 800, color: status === "error" ? "#FF4444" : accentColor, marginBottom: 4 }}>
          {status === "done" ? "Upload complete!" :
           status === "error" ? "Upload failed" :
           status === "uploading" ? `Uploading ${filename}…` :
           label}
        </div>
        <div style={{ fontSize: 9, color: "rgba(255,255,255,0.3)" }}>
          {status === "idle" && `Drag & drop or click to browse · Max ${maxSizeMB}MB`}
          {status === "done" && filename}
        </div>
      </div>

      {/* Progress bar */}
      {status === "uploading" && (
        <div style={{ marginTop: 10 }}>
          <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 4 }}>
            <span style={{ fontSize: 9, color: "rgba(255,255,255,0.4)" }}>Uploading…</span>
            <span style={{ fontSize: 9, fontWeight: 900, color: accentColor }}>{progress}%</span>
          </div>
          <div style={{ height: 4, background: "rgba(255,255,255,0.06)", borderRadius: 2, overflow: "hidden" }}>
            <div style={{
              height: "100%", background: accentColor,
              width: `${progress}%`,
              transition: "width 0.2s ease",
              borderRadius: 2,
              boxShadow: `0 0 8px ${accentColor}`,
            }} />
          </div>
        </div>
      )}

      {status === "error" && (
        <button
          onClick={() => { setStatus("idle"); setProgress(0); setFilename(null); }}
          style={{
            marginTop: 8, width: "100%", padding: "8px",
            background: "rgba(255,68,68,0.1)", border: "1px solid rgba(255,68,68,0.3)",
            borderRadius: 8, color: "#FF4444", fontSize: 9, fontWeight: 800, cursor: "pointer",
          }}
        >
          RETRY UPLOAD
        </button>
      )}
    </div>
  );
}
