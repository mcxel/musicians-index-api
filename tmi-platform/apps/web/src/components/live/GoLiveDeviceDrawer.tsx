"use client";

/**
 * GoLiveDeviceDrawer — compact device picker when Instant Go Live
 * permission fails or no prior camera/mic deviceIds exist.
 */

import { useCallback, useEffect, useState, type CSSProperties } from "react";
import { AnimatePresence, motion } from "framer-motion";
import {
  buildLiveMediaConstraints,
  persistDevicesFromStream,
  type PersistedLiveDevices,
} from "@/lib/live/liveDevicePersistence";

interface MediaDeviceOption {
  deviceId: string;
  label: string;
}

interface GoLiveDeviceDrawerProps {
  open: boolean;
  onClose: () => void;
  onStreamReady: (stream: MediaStream) => void;
  onSkip?: () => void;
  contained?: boolean;
}

export default function GoLiveDeviceDrawer({
  open,
  onClose,
  onStreamReady,
  onSkip,
  contained = false,
}: GoLiveDeviceDrawerProps) {
  const [cameras, setCameras] = useState<MediaDeviceOption[]>([]);
  const [mics, setMics] = useState<MediaDeviceOption[]>([]);
  const [cameraId, setCameraId] = useState("");
  const [micId, setMicId] = useState("");
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");

  const refreshDevices = useCallback(async () => {
    try {
      // Enumerate may return empty labels until permission granted once
      const list = await navigator.mediaDevices.enumerateDevices();
      const cams = list
        .filter((d) => d.kind === "videoinput")
        .map((d, i) => ({
          deviceId: d.deviceId,
          label: d.label || `Camera ${i + 1}`,
        }));
      const micList = list
        .filter((d) => d.kind === "audioinput")
        .map((d, i) => ({
          deviceId: d.deviceId,
          label: d.label || `Microphone ${i + 1}`,
        }));
      setCameras(cams);
      setMics(micList);
      if (!cameraId && cams[0]) setCameraId(cams[0].deviceId);
      if (!micId && micList[0]) setMicId(micList[0].deviceId);
    } catch {
      setError("Could not list devices. Check browser permissions.");
    }
  }, [cameraId, micId]);

  useEffect(() => {
    if (!open) return;
    void refreshDevices();
  }, [open, refreshDevices]);

  const handleConnect = useCallback(async () => {
    setBusy(true);
    setError("");
    const preferred: PersistedLiveDevices = {
      cameraDeviceId: cameraId || undefined,
      micDeviceId: micId || undefined,
      updatedAt: Date.now(),
    };
    try {
      const stream = await navigator.mediaDevices.getUserMedia(
        buildLiveMediaConstraints(preferred),
      );
      persistDevicesFromStream(stream);
      await refreshDevices();
      onStreamReady(stream);
      onClose();
    } catch (err) {
      const denied =
        err instanceof Error && (err.name === "NotAllowedError" || err.name === "PermissionDeniedError");
      setError(
        denied
          ? "Camera/mic permission denied. Allow access in the browser, then retry."
          : "Could not open selected devices. Try another camera or mic.",
      );
    } finally {
      setBusy(false);
    }
  }, [cameraId, micId, onClose, onStreamReady, refreshDevices]);

  return (
    <AnimatePresence>
      {open && (
        <motion.aside
          key="golive-device-drawer"
          initial={{ opacity: 0, y: 24 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: 16 }}
          transition={{ duration: 0.18 }}
          style={{
            position: contained ? "absolute" : "fixed",
            right: contained ? 8 : 16,
            bottom: contained ? 8 : 96,
            zIndex: contained ? 80 : 9700,
            width: 300,
            maxWidth: "calc(100vw - 32px)",
            padding: 14,
            borderRadius: 14,
            background: "rgba(8,6,20,0.96)",
            border: "1px solid rgba(255,45,170,0.4)",
            boxShadow: "0 16px 40px rgba(0,0,0,0.55)",
            color: "#fff",
          }}
        >
          <div
            style={{
              display: "flex",
              alignItems: "center",
              justifyContent: "space-between",
              marginBottom: 12,
            }}
          >
            <div style={{ fontSize: 10, fontWeight: 900, letterSpacing: "0.12em", color: "#FF2DAA" }}>
              DEVICE DRAWER
            </div>
            <button
              type="button"
              onClick={onClose}
              style={{
                background: "transparent",
                border: "none",
                color: "rgba(255,255,255,0.5)",
                cursor: "pointer",
                fontSize: 14,
              }}
              aria-label="Close device drawer"
            >
              ×
            </button>
          </div>

          <label style={labelStyle}>
            Camera
            <select
              value={cameraId}
              onChange={(e) => setCameraId(e.target.value)}
              style={selectStyle}
            >
              {cameras.length === 0 && <option value="">No cameras found</option>}
              {cameras.map((c) => (
                <option key={c.deviceId} value={c.deviceId}>
                  {c.label}
                </option>
              ))}
            </select>
          </label>

          <label style={{ ...labelStyle, marginTop: 10 }}>
            Microphone
            <select value={micId} onChange={(e) => setMicId(e.target.value)} style={selectStyle}>
              {mics.length === 0 && <option value="">No microphones found</option>}
              {mics.map((m) => (
                <option key={m.deviceId} value={m.deviceId}>
                  {m.label}
                </option>
              ))}
            </select>
          </label>

          {error ? (
            <div style={{ marginTop: 10, fontSize: 10, color: "#FF8888", lineHeight: 1.4 }}>{error}</div>
          ) : null}

          <div style={{ display: "flex", gap: 8, marginTop: 14 }}>
            <button
              type="button"
              disabled={busy}
              onClick={() => void handleConnect()}
              style={{
                flex: 1,
                padding: "10px 12px",
                borderRadius: 9,
                border: "none",
                background: "#FF2DAA",
                color: "#050510",
                fontSize: 10,
                fontWeight: 900,
                letterSpacing: "0.1em",
                cursor: busy ? "default" : "pointer",
                opacity: busy ? 0.7 : 1,
              }}
            >
              {busy ? "CONNECTING…" : "CONNECT"}
            </button>
            {onSkip ? (
              <button
                type="button"
                disabled={busy}
                onClick={onSkip}
                style={{
                  padding: "10px 12px",
                  borderRadius: 9,
                  border: "1px solid rgba(255,255,255,0.2)",
                  background: "transparent",
                  color: "rgba(255,255,255,0.65)",
                  fontSize: 9,
                  fontWeight: 800,
                  letterSpacing: "0.08em",
                  cursor: busy ? "default" : "pointer",
                }}
              >
                SKIP
              </button>
            ) : null}
          </div>
          <div style={{ marginTop: 10, fontSize: 8, color: "rgba(255,255,255,0.35)", lineHeight: 1.45 }}>
            Venue stays open. Skip continues without camera (honest no-cam mode).
          </div>
        </motion.aside>
      )}
    </AnimatePresence>
  );
}

const labelStyle: CSSProperties = {
  display: "flex",
  flexDirection: "column",
  gap: 5,
  fontSize: 9,
  fontWeight: 800,
  letterSpacing: "0.1em",
  color: "rgba(255,255,255,0.45)",
};

const selectStyle: CSSProperties = {
  padding: "8px 10px",
  borderRadius: 8,
  border: "1px solid rgba(255,255,255,0.15)",
  background: "rgba(255,255,255,0.04)",
  color: "#fff",
  fontSize: 11,
  fontWeight: 600,
};
