"use client";

import { useState, useRef, ChangeEvent, DragEvent } from "react";
import { motion, AnimatePresence } from "framer-motion";
import MotionPhotoPreview from "@/components/media/MotionPhotoPreview";

export interface YoPhoStudioDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  role?: "fan" | "performer" | "artist";
  initialImageUrl?: string;
  initialMotionUrl?: string;
  onSaveSuccess?: (data: { profileImageUrl: string; motionUrl?: string; bannerUrl?: string }) => void;
}

export default function YoPhoStudioDrawer({
  isOpen,
  onClose,
  role = "fan",
  initialImageUrl,
  initialMotionUrl,
  onSaveSuccess,
}: YoPhoStudioDrawerProps) {
  const [imageSrc, setImageSrc] = useState<string | null>(initialImageUrl ?? null);
  const [motionSrc, setMotionSrc] = useState<string | null>(initialMotionUrl ?? null);
  const [dragActive, setDragActive] = useState(false);
  const [focusX, setFocusX] = useState(50); // percentage 0..100
  const [focusY, setFocusY] = useState(50); // percentage 0..100
  const [activeTab, setActiveTab] = useState<"1:1" | "16:9" | "4:3">("1:1");
  const [isUploading, setIsUploading] = useState(false);
  const [statusMessage, setStatusMessage] = useState("");
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFile = (file: File) => {
    if (!file.type.startsWith("image/")) {
      setStatusMessage("Please upload a valid image file (PNG, JPG, WebP).");
      return;
    }
    const reader = new FileReader();
    reader.onload = (e) => {
      if (e.target?.result) {
        setImageSrc(e.target.result as string);
        setStatusMessage("");
      }
    };
    reader.readAsDataURL(file);
  };

  const handleDrop = (e: DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setDragActive(false);
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      handleFile(e.dataTransfer.files[0]);
    }
  };

  const handleDragOver = (e: DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setDragActive(true);
  };

  const handleDragLeave = (e: DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setDragActive(false);
  };

  const handleSave = async () => {
    if (!imageSrc) return;
    setIsUploading(true);
    setStatusMessage("Saving to YOphO Studio...");

    try {
      // /api/profile/update only exports a PUT handler — POST silently 405'd
      // here, matching the same bug already fixed in both onboarding flows
      // this session (2026-07-19/20).
      const res = await fetch("/api/profile/update", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({
          avatarUrl: imageSrc,
          profileImageUrl: imageSrc,
          focusX,
          focusY,
        }),
      });

      if (res.ok) {
        setStatusMessage("Profile updated successfully!");
        if (onSaveSuccess) {
          onSaveSuccess({ profileImageUrl: imageSrc });
        }
        setTimeout(() => {
          onClose();
        }, 1200);
      } else {
        setStatusMessage("Failed to save image. Please try again.");
      }
    } catch {
      setStatusMessage("Network error during save.");
    } finally {
      setIsUploading(false);
    }
  };

  if (!isOpen) return null;

  return (
    <AnimatePresence>
      {/* Full viewport studio takeover — replaces the previous 480px side
          drawer. Nothing behind it stays visible or interactive while open. */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        style={{
          position: "fixed",
          inset: 0,
          zIndex: 9999,
          background: "#050510",
          color: "#fff",
          fontFamily: "'Inter', sans-serif",
          display: "flex",
          flexDirection: "column",
        }}
      >
        <style>{`
          @media (max-width: 860px) {
            [data-yopho-studio-body] { grid-template-columns: 1fr !important; }
          }
        `}</style>

        {/* Top bar */}
        <div style={{ padding: "16px 24px", borderBottom: "1px solid rgba(255,255,255,0.08)", display: "flex", alignItems: "center", justifyContent: "space-between", gap: 16, flexShrink: 0 }}>
          <div>
            <span style={{ fontSize: 9, letterSpacing: "0.25em", color: "#FF2DAA", fontWeight: 800, textTransform: "uppercase" }}>
              YOphO CANVAS STUDIO
            </span>
            <h2 style={{ fontSize: 20, fontWeight: 900, margin: "2px 0 0", color: "#fff" }}>
              {role === "performer" || role === "artist" ? "Performer Identity Studio" : "Fan YOphO Studio"}
            </h2>
          </div>
          <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
            {statusMessage && (
              <div style={{ fontSize: 12, color: statusMessage.includes("success") ? "#00FF88" : "#FFD700", fontWeight: 700 }}>
                {statusMessage}
              </div>
            )}
            <button
              onClick={onClose}
              style={{ background: "rgba(255,255,255,0.06)", border: "1px solid rgba(255,255,255,0.12)", color: "#fff", borderRadius: 8, padding: "10px 14px", cursor: "pointer", fontSize: 12, fontWeight: 800 }}
            >
              Cancel
            </button>
            <button
              onClick={handleSave}
              disabled={!imageSrc || isUploading}
              style={{
                padding: "10px 20px",
                background: !imageSrc || isUploading ? "rgba(255,45,170,0.3)" : "linear-gradient(135deg, #FF2DAA, #AA2DFF)",
                border: "none",
                color: "#fff",
                borderRadius: 8,
                fontSize: 12,
                fontWeight: 900,
                letterSpacing: "0.08em",
                textTransform: "uppercase",
                cursor: !imageSrc || isUploading ? "not-allowed" : "pointer",
                boxShadow: "0 0 15px rgba(255,45,170,0.3)",
              }}
            >
              {isUploading ? "Saving..." : "Save & Return →"}
            </button>
          </div>
        </div>

        {/* Studio body: controls column + center stage preview */}
        <div data-yopho-studio-body style={{ flex: 1, minHeight: 0, display: "grid", gridTemplateColumns: "360px 1fr", overflow: "hidden" }}>
          {/* Controls column */}
          <div style={{ overflowY: "auto", padding: 24, display: "flex", flexDirection: "column", gap: 20, borderRight: "1px solid rgba(255,255,255,0.08)" }}>
            {/* Drag & Drop Upload Zone */}
            <div
              onDrop={handleDrop}
              onDragOver={handleDragOver}
              onDragLeave={handleDragLeave}
              onClick={() => fileInputRef.current?.click()}
              style={{
                border: `2px dashed ${dragActive ? "#00FFFF" : "rgba(255,45,170,0.4)"}`,
                borderRadius: 14,
                padding: "28px 20px",
                textAlign: "center",
                background: dragActive ? "rgba(0,255,255,0.05)" : "rgba(255,255,255,0.02)",
                cursor: "pointer",
                transition: "all 0.2s ease",
              }}
            >
              <input
                type="file"
                ref={fileInputRef}
                accept="image/*"
                onChange={(e: ChangeEvent<HTMLInputElement>) => {
                  if (e.target.files?.[0]) handleFile(e.target.files[0]);
                }}
                style={{ display: "none" }}
              />
              <div style={{ fontSize: 32, marginBottom: 8 }}>📷</div>
              <div style={{ fontSize: 13, fontWeight: 800, color: "#fff", marginBottom: 4 }}>
                Drag & Drop Profile Photo or Click to Upload
              </div>
              <div style={{ fontSize: 10, color: "rgba(255,255,255,0.45)" }}>
                Supports PNG, JPG, WebP. Auto-converts for 1:1, 16:9, and 4:3 surfaces.
              </div>
            </div>

            {imageSrc && (
              <>
                {/* Aspect Ratio Tabs */}
                <div style={{ display: "flex", gap: 8, background: "rgba(255,255,255,0.04)", borderRadius: 10, padding: 4 }}>
                  {(["1:1", "16:9", "4:3"] as const).map((tab) => (
                    <button
                      key={tab}
                      onClick={() => setActiveTab(tab)}
                      style={{
                        flex: 1,
                        padding: "8px 0",
                        fontSize: 11,
                        fontWeight: 800,
                        borderRadius: 8,
                        border: "none",
                        cursor: "pointer",
                        background: activeTab === tab ? "linear-gradient(135deg,#FF2DAA,#AA2DFF)" : "transparent",
                        color: activeTab === tab ? "#fff" : "rgba(255,255,255,0.5)",
                      }}
                    >
                      {tab} {tab === "1:1" ? "Lobby Tile" : tab === "16:9" ? "Broadcast Banner" : "Bio Card"}
                    </button>
                  ))}
                </div>

                {/* Focus Position Sliders */}
                <div style={{ background: "rgba(255,255,255,0.03)", borderRadius: 12, padding: 16, border: "1px solid rgba(255,255,255,0.06)", display: "flex", flexDirection: "column", gap: 12 }}>
                  <div style={{ fontSize: 10, letterSpacing: "0.15em", color: "#FFD700", fontWeight: 900, textTransform: "uppercase" }}>
                    🎯 Focus Crop Alignment
                  </div>
                  <div>
                    <div style={{ display: "flex", justifyContent: "space-between", fontSize: 10, color: "rgba(255,255,255,0.6)", marginBottom: 4 }}>
                      <span>Horizontal Focus (X)</span>
                      <span>{focusX}%</span>
                    </div>
                    <input
                      type="range"
                      min="0"
                      max="100"
                      value={focusX}
                      onChange={(e) => setFocusX(parseInt(e.target.value))}
                      style={{ width: "100%", accentColor: "#FF2DAA" }}
                    />
                  </div>
                  <div>
                    <div style={{ display: "flex", justifyContent: "space-between", fontSize: 10, color: "rgba(255,255,255,0.6)", marginBottom: 4 }}>
                      <span>Vertical Focus (Y)</span>
                      <span>{focusY}%</span>
                    </div>
                    <input
                      type="range"
                      min="0"
                      max="100"
                      value={focusY}
                      onChange={(e) => setFocusY(parseInt(e.target.value))}
                      style={{ width: "100%", accentColor: "#FF2DAA" }}
                    />
                  </div>
                </div>
              </>
            )}
          </div>

          {/* Center stage preview */}
          <div style={{ overflowY: "auto", padding: 32, display: "flex", alignItems: "center", justifyContent: "center" }}>
            {imageSrc ? (
              <div style={{ width: "100%", maxWidth: 720, background: "#000", borderRadius: 16, overflow: "hidden", border: "1px solid rgba(255,255,255,0.12)", boxShadow: "0 20px 60px rgba(0,0,0,0.6)" }}>
                <div
                  style={{
                    width: "100%",
                    aspectRatio: activeTab === "1:1" ? "1 / 1" : activeTab === "16:9" ? "16 / 9" : "4 / 3",
                    position: "relative",
                    overflow: "hidden",
                  }}
                >
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img
                    src={imageSrc}
                    alt="YOphO Preview"
                    style={{
                      width: "100%",
                      height: "100%",
                      objectFit: "cover",
                      objectPosition: `${focusX}% ${focusY}%`,
                      transition: "object-position 0.1s ease",
                    }}
                  />
                  <div style={{ position: "absolute", bottom: 12, right: 12, background: "rgba(0,0,0,0.75)", padding: "4px 10px", borderRadius: 6, fontSize: 10, color: "#00FFFF", fontWeight: 800 }}>
                    LIVE PREVIEW ({activeTab})
                  </div>
                </div>
              </div>
            ) : (
              <div style={{ textAlign: "center", color: "rgba(255,255,255,0.35)", fontSize: 13, fontWeight: 700 }}>
                Upload a photo to see the live YOphO preview
              </div>
            )}
          </div>
        </div>
      </motion.div>
    </AnimatePresence>
  );
}
