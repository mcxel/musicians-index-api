"use client";

import { useState, useCallback } from "react";
import { useDropzone } from "react-dropzone";

interface UniversalUploadProps {
  onUploadComplete: (files: File[]) => void;
}

/**
 * The canonical component for all media uploads on the TMI platform.
 * Supports file selection, drag & drop, and URL pasting.
 *
 * @see User request on 2026-06-26
 */
export function UniversalUpload({ onUploadComplete }: UniversalUploadProps) {
  const [isUploading, setIsUploading] = useState(false);
  const [url, setUrl] = useState("");

  const onDrop = useCallback(
    (acceptedFiles: File[]) => {
      if (acceptedFiles.length > 0) {
        setIsUploading(true);
        console.log("[UniversalUpload] Files accepted:", acceptedFiles);
        // In a real implementation, we would upload to S3 here.
        setTimeout(() => {
          onUploadComplete(acceptedFiles);
          setIsUploading(false);
        }, 1500);
      }
    },
    [onUploadComplete]
  );

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    // accept: { 'image/*': [], 'video/*': [], 'audio/*': [] } // Example accept prop
  });

  const handleUrlPaste = (e: React.ClipboardEvent<HTMLInputElement>) => {
    const pastedText = e.clipboardData.getData("text");
    if (pastedText.startsWith("http")) {
      console.log("[UniversalUpload] URL pasted:", pastedText);
      // Handle URL submission logic here
    }
  };

  const dropzoneStyle: React.CSSProperties = {
    border: `2px dashed ${isDragActive ? "#00FFFF" : "#333"}`,
    borderRadius: "12px",
    padding: "40px",
    textAlign: "center",
    cursor: "pointer",
    transition: "border-color 0.2s ease-in-out",
    backgroundColor: isDragActive ? "rgba(0, 255, 255, 0.05)" : "#111118",
  };

  const inputStyle: React.CSSProperties = {
    width: "100%",
    padding: "12px",
    borderRadius: "6px",
    border: "1px solid #333",
    backgroundColor: "#0A0A0F",
    color: "#E0E0E0",
    marginTop: "20px",
  };

  return (
    <div style={{ color: "#E0E0E0", padding: "20px" }}>
      <div {...getRootProps()} style={dropzoneStyle}>
        <input {...getInputProps()} />
        {isUploading ? (
          <p>Uploading...</p>
        ) : isDragActive ? (
          <p style={{ color: "#00FFFF" }}>Drop the files here ...</p>
        ) : (
          <div>
            <p style={{ margin: 0, fontSize: "16px", fontWeight: "bold" }}>
              Drag & drop media here, or click to select files
            </p>
            <p style={{ margin: "8px 0 0", fontSize: "12px", color: "#888" }}>
              Supports Images, Video, and Audio
            </p>
          </div>
        )}
      </div>

      <div
        style={{
          display: "flex",
          alignItems: "center",
          margin: "20px 0",
          color: "#555",
        }}
      >
        <hr style={{ flexGrow: 1, borderTop: "1px solid #333" }} />
        <span style={{ padding: "0 10px" }}>OR</span>
        <hr style={{ flexGrow: 1, borderTop: "1px solid #333" }} />
      </div>

      <input
        type="text"
        placeholder="Paste a URL (YouTube, Spotify, SoundCloud)"
        value={url}
        onChange={(e) => setUrl(e.target.value)}
        onPaste={handleUrlPaste}
        style={inputStyle}
      />
    </div>
  );
}