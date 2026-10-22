"use client";

/**
 * AvatarFaceScanPanel — Capture → quality → parametric fit → SAME Creation Center Avatar.
 */

import { useCallback, useEffect, useRef, useState } from "react";
import {
  faceScanIdentityEngine,
  approveFaceIdentityFit,
  type FaceScanFitResult,
} from "@/lib/engines/runtime/FaceScanIdentityEngine";
import { readPersistedFaceIdentityProfile } from "@/lib/avatars/BobbleheadRuntimeCharacter";
import {
  recordFaceScanCorrection,
  recordFaceScanErrorFamily,
  setFaceScanLearningConsent,
  readFaceScanLearningConsent,
} from "@/lib/avatar/FaceScanLearningLedger";
import {
  commitCanonicalDraftToFanWorld,
  patchCanonicalAvatarDraft,
} from "@/lib/avatars/CanonicalAvatarDraft";
import type { FaceIdentityShapeCoefficients } from "@/lib/avatar/AvatarFaceIdentityContract";

const FACE_SCAN_LS = "tmi_avatar_face_scan";

export interface AvatarFaceScanPanelProps {
  scanActive: boolean;
  setScanActive: (active: boolean) => void;
  onFitted?: (result: FaceScanFitResult) => void;
  onApproved?: () => void;
}

export default function AvatarFaceScanPanel({
  scanActive,
  setScanActive,
  onFitted,
  onApproved,
}: AvatarFaceScanPanelProps) {
  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const fileRef = useRef<HTMLInputElement>(null);
  const initialShapeRef = useRef<FaceIdentityShapeCoefficients | null>(null);
  const sessionIdRef = useRef("scan_" + Date.now().toString(36));
  const [stream, setStream] = useState<MediaStream | null>(null);
  const [portraitUrl, setPortraitUrl] = useState<string | null>(null);
  const [note, setNote] = useState("");
  const [busy, setBusy] = useState(false);
  const [camError, setCamError] = useState("");
  const [fit, setFit] = useState<FaceScanFitResult | null>(null);
  const [consentAgg, setConsentAgg] = useState(false);

  useEffect(() => {
    setConsentAgg(readFaceScanLearningConsent().aggregateCorrectionStats);
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

  const runFit = useCallback(
    async (dataUrl: string) => {
      setBusy(true);
      setPortraitUrl(dataUrl);
      try {
        window.localStorage.setItem(FACE_SCAN_LS, dataUrl);
      } catch {
        /* quota */
      }
      const result = await faceScanIdentityEngine.processScan(dataUrl, {
        userId: "fan_local",
        captureSource: "GUIDED_SCAN",
      });
      setFit(result);
      if (result.status === "quality_failed") {
        recordFaceScanErrorFamily("QUALITY_FAIL");
        setNote(result.feedbackMessage);
      } else if (result.status === "fitted" && result.profile) {
        initialShapeRef.current = { ...result.profile.shapeCoefficients };
        setNote(result.feedbackMessage);
        onFitted?.(result);
        try {
          await fetch("/api/avatar/config", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            credentials: "include",
            body: JSON.stringify({
              faceScanUrl: dataUrl,
              previewImageUrl: dataUrl,
              bobbleheadConfig: {
                faceFitStatus: "fitted",
                faceIdentityId: result.profile.identityId,
                skinHex: result.profile.appearance.skinHex,
                shapeRevision: result.profile.revision,
              },
              isComplete: false,
            }),
          });
        } catch {
          /* local draft still holds */
        }
      } else {
        setNote(result.feedbackMessage);
        recordFaceScanErrorFamily("OTHER");
      }
      setScanActive(false);
      setBusy(false);
    },
    [onFitted, setScanActive],
  );

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
    await runFit(canvas.toDataURL("image/jpeg", 0.85));
  };

  const onFile = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = async (ev) => {
      const result = ev.target?.result;
      if (typeof result === "string") await runFit(result);
    };
    reader.readAsDataURL(file);
  };

  const handleAcceptEquip = () => {
    const profile = fit?.profile ?? readPersistedFaceIdentityProfile();
    if (!profile) {
      setNote("No fitted likeness yet — capture first.");
      return;
    }
    const approved = approveFaceIdentityFit(profile);
    if (initialShapeRef.current) {
      recordFaceScanCorrection({
        scanSessionId: sessionIdRef.current,
        initial: initialShapeRef.current,
        approved: approved.shapeCoefficients,
      });
    }
    patchCanonicalAvatarDraft({ skinT: fit?.skinT ?? 0.5 });
    const commit = commitCanonicalDraftToFanWorld();
    if (!commit.ok) {
      setNote(commit.reason ?? "Equip blocked — check wearables.");
      return;
    }
    if (typeof window !== "undefined") {
      window.dispatchEvent(
        new CustomEvent("tmi:avatar:equipped", {
          detail: {
            identityId: approved.identityId,
            faceFit: true,
            skinHex: approved.appearance.skinHex,
          },
        }),
      );
    }
    setNote("Likeness approved, saved, and equipped on your Avatar.");
    onApproved?.();
  };

  return (
    <div
      data-face-scan-panel="1"
      style={{
        borderRadius: 16,
        border: "2px solid " + (scanActive ? "#ff6b9d" : "#6a4b96"),
        background: "#0f0818",
        padding: 16,
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
      }}
    >
      <div
        style={{
          color: "#9f7dd6",
          fontSize: 11,
          letterSpacing: 1,
          textTransform: "uppercase",
          marginBottom: 12,
        }}
      >
        Face Scan → Same Avatar
      </div>
      <div
        style={{
          width: 180,
          height: 180,
          border: "2px solid " + (scanActive ? "#ff6b9d" : "#6a4b96"),
          borderRadius: 8,
          background: "#1a1029",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          marginBottom: 16,
          overflow: "hidden",
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
          <img
            src={portraitUrl}
            alt="Face capture"
            style={{ width: "100%", height: "100%", objectFit: "cover" }}
          />
        ) : (
          <span style={{ fontSize: 48 }}>{"\u{1F4F8}"}</span>
        )}
      </div>
      <canvas ref={canvasRef} style={{ display: "none" }} />
      <div style={{ color: "#f3eaff", fontSize: 13, fontWeight: 700, marginBottom: 8, textAlign: "center" }}>
        {busy
          ? "Fitting likeness…"
          : scanActive
            ? "Camera live — center your face"
            : fit?.status === "fitted"
              ? "Likeness fitted — inspect Avatar, then Accept"
              : portraitUrl
                ? "Ready to re-fit"
                : "Ready to Scan"}
      </div>
      {fit?.profile && (
        <div style={{ fontSize: 10, color: "#00FFFF", marginBottom: 8 }}>
          Skin {fit.profile.appearance.skinHex} · lips{" "}
          {fit.profile.shapeCoefficients.lowerLipFullness.toFixed(2)} · jaw{" "}
          {fit.profile.shapeCoefficients.jawWidth.toFixed(2)}
        </div>
      )}
      <div style={{ display: "flex", flexWrap: "wrap", gap: 8, justifyContent: "center", marginBottom: 12 }}>
        <button
          type="button"
          onClick={() => setScanActive(!scanActive)}
          style={{
            padding: "8px 14px",
            borderRadius: 8,
            border: "1px solid #FF2DAA",
            background: scanActive ? "rgba(255,45,170,0.25)" : "rgba(255,45,170,0.1)",
            color: "#fff",
            fontWeight: 800,
            fontSize: 11,
            cursor: "pointer",
          }}
        >
          {scanActive ? "Stop Camera" : "Start Camera"}
        </button>
        <button
          type="button"
          disabled={!scanActive || busy}
          onClick={snap}
          style={{
            padding: "8px 14px",
            borderRadius: 8,
            border: "1px solid #00FFFF",
            background: "rgba(0,255,255,0.12)",
            color: "#00FFFF",
            fontWeight: 800,
            fontSize: 11,
            cursor: scanActive ? "pointer" : "not-allowed",
            opacity: scanActive ? 1 : 0.5,
          }}
        >
          Capture & Fit
        </button>
        <button
          type="button"
          onClick={() => fileRef.current?.click()}
          style={{
            padding: "8px 14px",
            borderRadius: 8,
            border: "1px solid rgba(255,255,255,0.25)",
            background: "rgba(255,255,255,0.06)",
            color: "#fff",
            fontWeight: 700,
            fontSize: 11,
            cursor: "pointer",
          }}
        >
          Upload Photo
        </button>
        <input ref={fileRef} type="file" accept="image/*" hidden onChange={onFile} />
      </div>
      {fit?.status === "fitted" && (
        <button
          type="button"
          onClick={handleAcceptEquip}
          data-face-scan-accept="1"
          style={{
            width: "100%",
            padding: "10px 14px",
            borderRadius: 10,
            border: "1px solid #FFD700",
            background: "linear-gradient(90deg, rgba(255,215,0,0.2), rgba(255,45,170,0.2))",
            color: "#FFD700",
            fontWeight: 900,
            fontSize: 12,
            letterSpacing: "0.06em",
            cursor: "pointer",
            marginBottom: 10,
          }}
        >
          ACCEPT · SAVE · EQUIP
        </button>
      )}
      <label
        style={{
          display: "flex",
          gap: 8,
          alignItems: "flex-start",
          fontSize: 9,
          color: "rgba(255,255,255,0.55)",
          maxWidth: 280,
          marginBottom: 8,
        }}
      >
        <input
          type="checkbox"
          checked={consentAgg}
          onChange={(e) => {
            setConsentAgg(e.target.checked);
            setFaceScanLearningConsent(e.target.checked);
          }}
        />
        <span>
          Allow anonymized correction stats (shape deltas only — never raw face images) to improve
          future fitting after QA. Separate from creating your Avatar.
        </span>
      </label>
      {camError && <div style={{ color: "#FF2DAA", fontSize: 11, marginBottom: 6 }}>{camError}</div>}
      {note && (
        <div style={{ color: "rgba(255,255,255,0.7)", fontSize: 11, textAlign: "center", lineHeight: 1.4 }}>
          {note}
        </div>
      )}
    </div>
  );
}
