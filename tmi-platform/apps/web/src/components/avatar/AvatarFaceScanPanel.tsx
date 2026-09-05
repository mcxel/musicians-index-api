"use client";

/**
 * AvatarFaceScanPanel — Fan face capture entry (Rule 18/20 honest).
 * Stores photo + landmark placeholder on profile for a future mesh pipeline.
 * Does NOT claim photoreal facial animation or 3D rebuild works today.
 */

import { useCallback, useEffect, useRef, useState } from "react";
import {
  AVATAR_GLB_HONEST_STATUS,
  resolveCertifiedAvatarGlbUrl,
} from "@/lib/avatars/AvatarGlbRegistry";

const FACE_SCAN_LS = "tmi_avatar_face_scan";
const FACE_LANDMARKS_LS = "tmi_avatar_face_landmarks_placeholder";

interface AvatarFaceScanPanelProps {
  scanActive: boolean;
  setScanActive: (active: boolean) => void;
}

type LandmarkPlaceholder = {
  version: 1;
  capturedAt: string;
  /** Stub grid — real ML landmarks not implemented */
  points: Array<{ x: number; y: number; label: string }>;
  meshStatus: "pending_3d_build";
  certifiedGlb: boolean;
};

function buildLandmarkPlaceholder(): LandmarkPlaceholder {
  return {
    version: 1,
    capturedAt: new Date().toISOString(),
    points: [
      { x: 0.5, y: 0.28, label: "forehead" },
      { x: 0.35, y: 0.42, label: "left_eye" },
      { x: 0.65, y: 0.42, label: "right_eye" },
      { x: 0.5, y: 0.55, label: "nose" },
      { x: 0.5, y: 0.72, label: "mouth" },
    ],
    meshStatus: "pending_3d_build",
    certifiedGlb: Boolean(resolveCertifiedAvatarGlbUrl("face_scan_mesh_v1")),
  };
}

export default function AvatarFaceScanPanel({ scanActive, setScanActive }: AvatarFaceScanPanelProps) {
  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const fileRef = useRef<HTMLInputElement>(null);
  const [stream, setStream] = useState<MediaStream | null>(null);
  const [portraitUrl, setPortraitUrl] = useState<string | null>(null);
  const [note, setNote] = useState("");
  const [busy, setBusy] = useState(false);
  const [camError, setCamError] = useState("");

  useEffect(() => {
    try {
      const stored = window.localStorage.getItem(FACE_SCAN_LS);
      if (stored) setPortraitUrl(stored);
    } catch {
      /* ignore */
    }
  }, []);

  useEffect(() => {
    return () => {
      stream?.getTracks().forEach((t) => t.stop());
    };
  }, [stream]);

  useEffect(() => {
    if (!scanActive) {
      stream?.getTracks().forEach((t) => t.stop());
      setStream(null);
      return;
    }
    let cancelled = false;
    (async () => {
      setCamError("");
      try {
        const media = await navigator.mediaDevices.getUserMedia({ video: { facingMode: "user" } });
        if (cancelled) {
          media.getTracks().forEach((t) => t.stop());
          return;
        }
        setStream(media);
        window.setTimeout(() => {
          if (videoRef.current) videoRef.current.srcObject = media;
        }, 0);
      } catch {
        setCamError("Camera unavailable. Upload a photo instead.");
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [scanActive]);

  const persistCapture = useCallback(async (dataUrl: string) => {
    setBusy(true);
    setPortraitUrl(dataUrl);
    const landmarks = buildLandmarkPlaceholder();
    try {
      window.localStorage.setItem(FACE_SCAN_LS, dataUrl);
      window.localStorage.setItem(FACE_LANDMARKS_LS, JSON.stringify(landmarks));
    } catch {
      /* quota */
    }
    try {
      await fetch("/api/avatar/config", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({
          faceScanUrl: dataUrl,
          previewImageUrl: dataUrl,
          bobbleheadConfig: {
            faceLandmarksPlaceholder: landmarks,
            faceScanPipeline: "photo_stored_mesh_pending",
          },
          isComplete: false,
        }),
      });
    } catch {
      /* local snapshot still holds */
    }
    setNote(
      landmarks.certifiedGlb
        ? "Photo + landmarks saved. Certified face mesh available."
        : "Face scan — 3D build pending. Photo + landmark placeholder stored for future pipeline.",
    );
    setScanActive(false);
    setBusy(false);
  }, [setScanActive]);

  const snap = async () => {
    if (!videoRef.current) return;
    const video = videoRef.current;
    const canvas = canvasRef.current || document.createElement("canvas");
    const ctx = canvas.getContext("2d");
    if (!ctx) return;
    canvas.width = video.videoWidth || 640;
    canvas.height = video.videoHeight || 480;
    ctx.translate(canvas.width, 0);
    ctx.scale(-1, 1);
    ctx.drawImage(video, 0, 0, canvas.width, canvas.height);
    await persistCapture(canvas.toDataURL("image/jpeg", 0.85));
  };

  const onFile = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = async (ev) => {
      const result = ev.target?.result;
      if (typeof result === "string") await persistCapture(result);
    };
    reader.readAsDataURL(file);
  };

  return (
    <div
      style={{
        borderRadius: 16,
        border: `2px solid ${scanActive ? "#ff6b9d" : "#6a4b96"}`,
        background: "#0f0818",
        padding: 16,
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "center",
      }}
    >
      <div style={{ color: "#9f7dd6", fontSize: 11, letterSpacing: 1, textTransform: "uppercase", marginBottom: 12 }}>
        Face Scan Capture
      </div>

      <div
        style={{
          width: 180,
          height: 180,
          border: `2px solid ${scanActive ? "#ff6b9d" : "#6a4b96"}`,
          borderRadius: 8,
          background: "#1a1029",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          marginBottom: 16,
          overflow: "hidden",
          position: "relative",
        }}
      >
        {scanActive && stream ? (
          <video
            ref={videoRef}
            autoPlay
            playsInline
            muted
            style={{ width: "100%", height: "100%", objectFit: "cover", transform: "scaleX(-1)" }}
          />
        ) : portraitUrl ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img src={portraitUrl} alt="Stored face scan" style={{ width: "100%", height: "100%", objectFit: "cover" }} />
        ) : (
          <span style={{ fontSize: 48 }}>📸</span>
        )}
      </div>
      <canvas ref={canvasRef} style={{ display: "none" }} />

      <div style={{ color: "#f3eaff", fontSize: 14, fontWeight: 700, marginBottom: 8 }}>
        {busy ? "Saving…" : scanActive ? "Camera live" : portraitUrl ? "Photo stored" : "Ready to Scan"}
      </div>

      <div style={{ display: "flex", flexWrap: "wrap", gap: 8, justifyContent: "center", marginBottom: 12 }}>
        <button
          type="button"
          onClick={() => setScanActive(!scanActive)}
          style={{
            borderRadius: 8,
            border: `1px solid ${scanActive ? "#ff6b9d" : "#9f7dd6"}`,
            background: scanActive ? "#5a2a3a" : "#5a4525",
            color: scanActive ? "#ffb3c1" : "#f3eaff",
            padding: "10px 16px",
            fontSize: 12,
            fontWeight: 600,
            cursor: "pointer",
          }}
        >
          {scanActive ? "Stop Camera" : "Start Camera"}
        </button>
        {scanActive && stream && (
          <button
            type="button"
            disabled={busy}
            onClick={() => void snap()}
            style={{
              borderRadius: 8,
              border: "1px solid #00FFFF",
              background: "rgba(0,255,255,0.15)",
              color: "#00FFFF",
              padding: "10px 16px",
              fontSize: 12,
              fontWeight: 700,
              cursor: busy ? "wait" : "pointer",
            }}
          >
            Capture
          </button>
        )}
        <button
          type="button"
          onClick={() => fileRef.current?.click()}
          style={{
            borderRadius: 8,
            border: "1px solid #AA2DFF",
            background: "rgba(170,45,255,0.15)",
            color: "#E0B0FF",
            padding: "10px 16px",
            fontSize: 12,
            fontWeight: 600,
            cursor: "pointer",
          }}
        >
          Upload Photo
        </button>
        <input ref={fileRef} type="file" accept="image/*" hidden onChange={onFile} />
      </div>

      {camError && (
        <div style={{ fontSize: 11, color: "#FF8A8A", marginBottom: 8, textAlign: "center" }}>{camError}</div>
      )}

      <div
        style={{
          borderRadius: 8,
          border: "1px solid #6a4b96",
          background: "#1a1029",
          padding: 8,
          fontSize: 10,
          color: "#c8b5e5",
          textAlign: "center",
          width: "100%",
          lineHeight: 1.45,
        }}
      >
        {note || AVATAR_GLB_HONEST_STATUS}
      </div>
    </div>
  );
}
