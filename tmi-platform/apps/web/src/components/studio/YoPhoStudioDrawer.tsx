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

interface StudioSection {
  field: "avatarUrl" | "articleHeroImageUrl" | "bannerUrl";
  label: string;
  description: string;
  aspect: "1:1" | "16:9" | "4:3";
}

// Ordered so the most important image (what fans see everywhere) comes
// first — later sections are real but optional, always skippable.
const PERFORMER_SECTIONS: StudioSection[] = [
  { field: "avatarUrl", label: "Profile Photo", description: "Shown on your profile, in search, and on the rankings.", aspect: "1:1" },
  { field: "articleHeroImageUrl", label: "Article Hero Image", description: "Used in magazine articles, interviews, and press features — can be a different shot than your profile photo.", aspect: "16:9" },
  { field: "bannerUrl", label: "Promo Banner", description: "Shown on your profile header and event/tour pages.", aspect: "16:9" },
];
const FAN_SECTIONS: StudioSection[] = [
  { field: "avatarUrl", label: "Profile Photo", description: "Shown on your profile and in the fan lobby.", aspect: "1:1" },
];

interface SectionState {
  imageSrc: string | null;
  focusX: number;
  focusY: number;
}
const EMPTY_SECTION_STATE: SectionState = { imageSrc: null, focusX: 50, focusY: 50 };

export default function YoPhoStudioDrawer({
  isOpen,
  onClose,
  role = "fan",
  initialImageUrl,
  initialMotionUrl,
  onSaveSuccess,
}: YoPhoStudioDrawerProps) {
  const sections = role === "performer" || role === "artist" ? PERFORMER_SECTIONS : FAN_SECTIONS;
  const [sectionIndex, setSectionIndex] = useState(0);
  const currentSection = sections[sectionIndex]!;
  const [sectionData, setSectionData] = useState<Record<string, SectionState>>(() => ({
    avatarUrl: { ...EMPTY_SECTION_STATE, imageSrc: initialImageUrl ?? null },
  }));
  const current = sectionData[currentSection.field] ?? EMPTY_SECTION_STATE;
  const imageSrc = current.imageSrc;
  const focusX = current.focusX;
  const focusY = current.focusY;
  const setImageSrc = (src: string | null) => setSectionData((d) => ({ ...d, [currentSection.field]: { ...(d[currentSection.field] ?? EMPTY_SECTION_STATE), imageSrc: src } }));
  const setFocusX = (v: number) => setSectionData((d) => ({ ...d, [currentSection.field]: { ...(d[currentSection.field] ?? EMPTY_SECTION_STATE), focusX: v } }));
  const setFocusY = (v: number) => setSectionData((d) => ({ ...d, [currentSection.field]: { ...(d[currentSection.field] ?? EMPTY_SECTION_STATE), focusY: v } }));

  const [motionSrc, setMotionSrc] = useState<string | null>(initialMotionUrl ?? null);
  const [dragActive, setDragActive] = useState(false);
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

  const isLastSection = sectionIndex === sections.length - 1;

  const advance = () => {
    if (isLastSection) {
      onClose();
    } else {
      setSectionIndex((i) => i + 1);
      setStatusMessage("");
    }
  };

  // Every section is independently skippable — a performer might only ever
  // set a profile photo and never touch Article Hero / Promo Banner, and
  // that's a fully valid, non-blocking choice.
  const handleSkipSection = () => advance();

  const handleSave = async () => {
    if (!imageSrc) { advance(); return; }
    setIsUploading(true);
    setStatusMessage(`Saving ${currentSection.label}...`);

    try {
      const res = await fetch("/api/profile/update", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({
          [currentSection.field]: imageSrc,
          ...(currentSection.field === "avatarUrl" ? { profileImageUrl: imageSrc } : {}),
        }),
      });

      if (res.ok) {
        setStatusMessage(`${currentSection.label} saved!`);
        if (currentSection.field === "avatarUrl" && onSaveSuccess) {
          onSaveSuccess({ profileImageUrl: imageSrc });
        }
        setTimeout(advance, 700);
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

        {/* Top bar — always has a close button so this can be dismissed at
            any point, no matter which section is active. */}
        <div style={{ padding: "16px 24px", borderBottom: "1px solid rgba(255,255,255,0.08)", display: "flex", alignItems: "center", justifyContent: "space-between", gap: 16, flexShrink: 0 }}>
          <div>
            <span style={{ fontSize: 9, letterSpacing: "0.25em", color: "#FF2DAA", fontWeight: 800, textTransform: "uppercase" }}>
              YOphO CANVAS STUDIO
            </span>
            <h2 style={{ fontSize: 20, fontWeight: 900, margin: "2px 0 0", color: "#fff" }}>
              {currentSection.label}
            </h2>
          </div>
          <button
            onClick={onClose}
            aria-label="Close"
            style={{ width: 34, height: 34, borderRadius: "50%", background: "rgba(255,255,255,0.06)", border: "1px solid rgba(255,255,255,0.12)", color: "#fff", cursor: "pointer", fontSize: 16, lineHeight: 1, flexShrink: 0 }}
          >
            ✕
          </button>
        </div>

        {/* Section stepper — shows every section in order, current one
            highlighted. Sections are always skippable (below), never a
            forced gate. */}
        <div style={{ padding: "10px 24px", display: "flex", alignItems: "center", gap: 8, flexShrink: 0, borderBottom: "1px solid rgba(255,255,255,0.06)" }}>
          {sections.map((s, i) => (
            <div key={s.field} style={{ display: "flex", alignItems: "center", gap: 8, flex: i === sectionIndex ? "0 0 auto" : "0 0 auto" }}>
              <div style={{
                fontSize: 10, fontWeight: 800, padding: "4px 10px", borderRadius: 20,
                background: i === sectionIndex ? "linear-gradient(135deg,#FF2DAA,#AA2DFF)" : i < sectionIndex ? "rgba(0,255,136,0.12)" : "rgba(255,255,255,0.05)",
                color: i === sectionIndex ? "#fff" : i < sectionIndex ? "#00FF88" : "rgba(255,255,255,0.4)",
                border: i === sectionIndex ? "none" : "1px solid rgba(255,255,255,0.1)",
              }}>
                {i < sectionIndex ? "✓ " : `${i + 1}. `}{s.label}
              </div>
              {i < sections.length - 1 && <div style={{ width: 14, height: 1, background: "rgba(255,255,255,0.15)" }} />}
            </div>
          ))}
          <div style={{ marginLeft: "auto", fontSize: 10, color: "rgba(255,255,255,0.35)" }}>
            {sectionIndex + 1} of {sections.length} — every step is optional
          </div>
        </div>

        <p style={{ padding: "12px 24px 0", margin: 0, fontSize: 12, color: "rgba(255,255,255,0.5)", flexShrink: 0 }}>
          {currentSection.description}
        </p>

        {/* Action row */}
        <div style={{ padding: "12px 24px 0", display: "flex", alignItems: "center", gap: 12, flexShrink: 0 }}>
          {statusMessage && (
            <div style={{ fontSize: 12, color: statusMessage.includes("saved") || statusMessage.includes("success") ? "#00FF88" : "#FFD700", fontWeight: 700 }}>
              {statusMessage}
            </div>
          )}
          <div style={{ marginLeft: "auto", display: "flex", gap: 10 }}>
            <button
              onClick={handleSkipSection}
              style={{ background: "transparent", border: "1px solid rgba(255,255,255,0.15)", color: "rgba(255,255,255,0.6)", borderRadius: 8, padding: "10px 16px", cursor: "pointer", fontSize: 12, fontWeight: 700 }}
            >
              Skip for now
            </button>
            <button
              onClick={handleSave}
              disabled={isUploading}
              style={{
                padding: "10px 20px",
                background: isUploading ? "rgba(255,45,170,0.3)" : "linear-gradient(135deg, #FF2DAA, #AA2DFF)",
                border: "none",
                color: "#fff",
                borderRadius: 8,
                fontSize: 12,
                fontWeight: 900,
                letterSpacing: "0.08em",
                textTransform: "uppercase",
                cursor: isUploading ? "not-allowed" : "pointer",
                boxShadow: "0 0 15px rgba(255,45,170,0.3)",
              }}
            >
              {isUploading ? "Saving..." : !imageSrc ? "Next →" : isLastSection ? "Save & Finish" : "Save & Next →"}
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
                Supports PNG, JPG, WebP. This step uses a {currentSection.aspect} crop.
              </div>
            </div>

            {imageSrc && (
              <>
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
                    aspectRatio: currentSection.aspect === "1:1" ? "1 / 1" : currentSection.aspect === "16:9" ? "16 / 9" : "4 / 3",
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
                    LIVE PREVIEW ({currentSection.aspect})
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
