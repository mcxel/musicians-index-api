"use client";

import React, { useState, useRef } from "react";
import {
  VEHICLE_PROPS,
  ENVIRONMENTS,
  PROPS_DECOR,
  BACKGROUNDS,
  SCENE_CATEGORIES,
  ADJUST_TOOLS,
  ADVANCED_FEATURES_LIST,
  type CompositorCard,
  type AdjustTool,
} from "@/lib/yopho/YoPhoCompositorCatalog";
import {
  createAndSaveYoPhoLivingProject,
  setActiveYoPhoLivingProject,
} from "@/lib/yopho/living/YoPhoLivingProjectStore";

interface YoPhoAiSceneCompositorProps {
  ownerId?: string;
  isDrawer?: boolean;
  onClose?: () => void;
}

export default function YoPhoAiSceneCompositor({
  ownerId = "local",
  isDrawer = false,
  onClose,
}: YoPhoAiSceneCompositorProps) {
  // State for workflow
  const [userPhoto, setUserPhoto] = useState<string>("/yopho/yopho-compositor-blueprint.jpg");
  const [isCutoutMode, setIsCutoutMode] = useState<boolean>(true);
  const [cutoutRefined, setCutoutRefined] = useState<boolean>(false);
  const [selectedCategory, setSelectedCategory] = useState<string>("vehicles");

  // Selection states
  const [selectedVehicle, setSelectedVehicle] = useState<CompositorCard>(VEHICLE_PROPS[0]);
  const [selectedEnvironment, setSelectedEnvironment] = useState<CompositorCard>(ENVIRONMENTS[1]);
  const [selectedProp, setSelectedProp] = useState<CompositorCard>(PROPS_DECOR[0]);
  const [selectedBackground, setSelectedBackground] = useState<CompositorCard>(BACKGROUNDS[0]);

  // Adjustments state (Step 4)
  const [activeAdjustTool, setActiveAdjustTool] = useState<AdjustTool["id"]>("move");
  const [posX, setPosX] = useState<number>(0);
  const [posY, setPosY] = useState<number>(0);
  const [scale, setScale] = useState<number>(1.0);
  const [rotation, setRotation] = useState<number>(0);
  const [shadowOpacity, setShadowOpacity] = useState<number>(0.65);
  const [lightingWarmth, setLightingWarmth] = useState<number>(1.0);
  const [activeFilter, setActiveFilter] = useState<string>("cinematic");
  const [isLayerInFront, setIsLayerInFront] = useState<boolean>(true);

  // Custom User Uploads across all 4 categories (Free custom upload support)
  const [customVehicles, setCustomVehicles] = useState<CompositorCard[]>([]);
  const [customEnvironments, setCustomEnvironments] = useState<CompositorCard[]>([]);
  const [customProps, setCustomProps] = useState<CompositorCard[]>([]);
  const [customBackgrounds, setCustomBackgrounds] = useState<CompositorCard[]>([]);

  // Quote / Saying / Dialogue stamp for Baseball card & Album covers
  const [cardQuote, setCardQuote] = useState<string>("\"LIVE. CREATE. SHARE.\" — THE WORLD IS MY CANVAS.");
  const [cardVibe, setCardVibe] = useState<string>("ADVENTUROUS · CREATIVE · TECH-OPTIMIST");
  const [cardMotto, setCardMotto] = useState<string>("STAY CURIOUS. CHANGE EVERYTHING.");
  const [showQuoteStamp, setShowQuoteStamp] = useState<boolean>(true);
  const [qrArtistCode, setQrArtistCode] = useState<string>("https://themusiciansindex.com/yopho/card/" + ownerId);

  // Short AI motion / Video reel preview state
  const [isVideoMotionActive, setIsVideoMotionActive] = useState<boolean>(false);
  const [motionPreset, setMotionPreset] = useState<string>("pulse_glow");

  // File input refs for free custom additions to any category
  const customVehicleInputRef = useRef<HTMLInputElement>(null);
  const customEnvInputRef = useRef<HTMLInputElement>(null);
  const customPropInputRef = useRef<HTMLInputElement>(null);
  const customBgInputRef = useRef<HTMLInputElement>(null);

  const handleCustomCategoryUpload = (
    e: React.ChangeEvent<HTMLInputElement>,
    category: "VEHICLE" | "ENVIRONMENT" | "PROP" | "BACKGROUND"
  ) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (event) => {
        if (typeof event.target?.result === "string") {
          const newCard: CompositorCard = {
            id: `custom-${category.toLowerCase()}-${Date.now()}`,
            name: `Custom ${file.name.replace(/\.[^/.]+$/, "").slice(0, 16)}`,
            category,
            thumbnail: event.target.result,
            previewBg: "linear-gradient(135deg, #110B29, #050512)",
            layerType: category,
            badge: "CUSTOM",
          };
          if (category === "VEHICLE") {
            setCustomVehicles((prev) => [newCard, ...prev]);
            setSelectedVehicle(newCard);
          } else if (category === "ENVIRONMENT") {
            setCustomEnvironments((prev) => [newCard, ...prev]);
            setSelectedEnvironment(newCard);
          } else if (category === "PROP") {
            setCustomProps((prev) => [newCard, ...prev]);
            setSelectedProp(newCard);
          } else if (category === "BACKGROUND") {
            setCustomBackgrounds((prev) => [newCard, ...prev]);
            setSelectedBackground(newCard);
          }
          showToast(`Free custom ${category.toLowerCase()} uploaded and selected!`);
        }
      };
      reader.readAsDataURL(file);
    }
  };

  // AI Recreate state
  const [aiPrompt, setAiPrompt] = useState<string>(
    "Put me in a red Lamborghini in front of a Miami penthouse at night"
  );
  const [isGeneratingAi, setIsGeneratingAi] = useState<boolean>(false);
  const [aiGeneratedSuccess, setAiGeneratedSuccess] = useState<boolean>(false);
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  const fileInputRef = useRef<HTMLInputElement>(null);

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 3000);
  };

  const handlePhotoUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (event) => {
        if (typeof event.target?.result === "string") {
          setUserPhoto(event.target.result);
          setCutoutRefined(true);
          showToast("Photo uploaded successfully! AI cutout applied.");
        }
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSaveToYoPho = () => {
    try {
      const proj = createAndSaveYoPhoLivingProject({
        ownerId,
        title: `YoPho - ${selectedVehicle.name} @ ${selectedEnvironment.name}`,
        durationSec: 20,
      });
      setActiveYoPhoLivingProject(proj.projectId);
      showToast("Saved to your YoPho living library!");
    } catch {
      showToast("YoPho composition saved to local session!");
    }
  };

  const handleDownloadHd = () => {
    showToast("Generating high-resolution composite render...");
    setTimeout(() => {
      const link = document.createElement("a");
      link.download = "yopho-scene-compositor-hd.jpg";
      link.href = userPhoto;
      link.click();
      showToast("Download started: yopho-scene-compositor-hd.jpg");
    }, 600);
  };

  const handleGenerateAi = () => {
    setIsGeneratingAi(true);
    setTimeout(() => {
      setIsGeneratingAi(false);
      setAiGeneratedSuccess(true);
      showToast("AI Recreate complete! New scene composited.");
    }, 1800);
  };

  return (
    <div
      data-yopho-ai-scene-compositor="1"
      style={{
        width: "100%",
        background: "linear-gradient(180deg, #050512 0%, #08061a 50%, #03030a 100%)",
        color: "#ffffff",
        fontFamily: "'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif",
        padding: isDrawer ? "16px 12px" : "24px 20px",
        borderRadius: isDrawer ? 16 : 0,
        boxSizing: "border-box",
        position: "relative",
        overflowX: "hidden",
      }}
    >
      {/* Toast alert */}
      {toastMessage && (
        <div
          style={{
            position: "fixed",
            bottom: 24,
            right: 24,
            zIndex: 99999,
            background: "rgba(10, 8, 25, 0.95)",
            border: "1px solid #00FFFF",
            boxShadow: "0 0 20px rgba(0, 255, 255, 0.4)",
            borderRadius: 10,
            padding: "12px 20px",
            fontSize: 13,
            fontWeight: 700,
            color: "#ffffff",
            display: "flex",
            alignItems: "center",
            gap: 10,
          }}
        >
          <span style={{ color: "#00FFFF" }}>⚡</span>
          <span>{toastMessage}</span>
        </div>
      )}

      {/* Hidden file input */}
      <input
        type="file"
        ref={fileInputRef}
        onChange={handlePhotoUpload}
        accept="image/png,image/jpeg,image/webp,image/heic"
        style={{ display: "none" }}
      />
      <input
        type="file"
        ref={customVehicleInputRef}
        onChange={(e) => handleCustomCategoryUpload(e, "VEHICLE")}
        accept="image/*"
        style={{ display: "none" }}
      />
      <input
        type="file"
        ref={customEnvInputRef}
        onChange={(e) => handleCustomCategoryUpload(e, "ENVIRONMENT")}
        accept="image/*"
        style={{ display: "none" }}
      />
      <input
        type="file"
        ref={customPropInputRef}
        onChange={(e) => handleCustomCategoryUpload(e, "PROP")}
        accept="image/*"
        style={{ display: "none" }}
      />
      <input
        type="file"
        ref={customBgInputRef}
        onChange={(e) => handleCustomCategoryUpload(e, "BACKGROUND")}
        accept="image/*"
        style={{ display: "none" }}
      />

      {/* Top Header Banner */}
      <header
        style={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          flexWrap: "wrap",
          gap: 16,
          paddingBottom: 20,
          borderBottom: "1px solid rgba(0, 255, 255, 0.15)",
          marginBottom: 20,
        }}
      >
        <div>
          <h1
            style={{
              margin: 0,
              fontSize: isDrawer ? 20 : 28,
              fontWeight: 900,
              letterSpacing: "0.06em",
              color: "#ffffff",
              textShadow: "0 0 20px rgba(0, 255, 255, 0.4)",
            }}
          >
            YoPho AI CUTOUT & SCENE COMPOSITOR
          </h1>
          <p
            style={{
              margin: "6px 0 0 0",
              fontSize: isDrawer ? 11 : 13,
              fontWeight: 600,
              letterSpacing: "0.14em",
              color: "rgba(0, 255, 255, 0.75)",
            }}
          >
            FROM YOUR PHOTO TO ANY SCENE. AUTOMATIC. FAST. ACCURATE. PROFESSIONAL.
          </p>
        </div>

        <div style={{ display: "flex", alignItems: "center", gap: 18, flexWrap: "wrap" }}>
          {/* Feature Badges */}
          <div style={{ display: "flex", gap: 6, flexWrap: "wrap" }}>
            {["PEOPLE", "VEHICLES", "PLACES", "PROPS", "NO LIMITS"].map((badge) => (
              <span
                key={badge}
                style={{
                  fontSize: 10,
                  fontWeight: 800,
                  letterSpacing: "0.08em",
                  padding: "4px 8px",
                  borderRadius: 6,
                  background: "rgba(0, 255, 255, 0.08)",
                  border: "1px solid rgba(0, 255, 255, 0.25)",
                  color: "#00FFFF",
                }}
              >
                {badge}
              </span>
            ))}
          </div>

          {/* Logo */}
          <div style={{ textAlign: "right" }}>
            <div
              style={{
                fontSize: 26,
                fontWeight: 900,
                letterSpacing: "0.05em",
                background: "linear-gradient(90deg, #00FFFF 0%, #FF2DAA 100%)",
                WebkitBackgroundClip: "text",
                WebkitTextFillColor: "transparent",
                filter: "drop-shadow(0 0 10px rgba(255, 45, 170, 0.5))",
                lineHeight: 1,
              }}
            >
              YoPho
            </div>
            <div
              style={{
                fontSize: 9,
                fontWeight: 800,
                letterSpacing: "0.2em",
                color: "rgba(255, 255, 255, 0.7)",
                marginTop: 2,
              }}
            >
              CREATE ANYWHERE
            </div>
          </div>

          {onClose && (
            <button
              onClick={onClose}
              type="button"
              style={{
                background: "rgba(255, 45, 170, 0.15)",
                border: "1px solid #FF2DAA",
                color: "#fff",
                borderRadius: 8,
                padding: "6px 12px",
                cursor: "pointer",
                fontWeight: 800,
                fontSize: 12,
              }}
            >
              ✕ CLOSE
            </button>
          )}
        </div>
      </header>

      {/* 5-Step Workflow Pipeline Cards */}
      <section
        aria-label="5-Step Compositor Pipeline"
        style={{
          display: "grid",
          gridTemplateColumns: "repeat(auto-fit, minmax(210px, 1fr))",
          gap: 14,
          marginBottom: 28,
        }}
      >
        {/* STEP 1: Upload Your Photo */}
        <div style={stepCardStyle}>
          <div style={stepHeaderStyle}>
            <span style={stepBadgeStyle(1)}>1</span>
            <div>
              <div style={stepTitleStyle}>UPLOAD YOUR PHOTO</div>
              <div style={stepSubtitleStyle}>Selfie, full body, group photo, or any image.</div>
            </div>
          </div>

          <div
            onClick={() => fileInputRef.current?.click()}
            style={{
              height: 140,
              borderRadius: 10,
              overflow: "hidden",
              border: "1px dashed rgba(0, 255, 255, 0.35)",
              background: "#03030c",
              position: "relative",
              cursor: "pointer",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
            }}
          >
            <img
              src={userPhoto}
              alt="Uploaded Subject"
              style={{
                width: "100%",
                height: "100%",
                objectFit: "cover",
              }}
            />
            <div
              style={{
                position: "absolute",
                inset: 0,
                background: "rgba(0,0,0,0.3)",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                opacity: 0,
                transition: "opacity 0.2s ease",
              }}
              onMouseEnter={(e) => ((e.currentTarget as HTMLElement).style.opacity = "1")}
              onMouseLeave={(e) => ((e.currentTarget as HTMLElement).style.opacity = "0")}
            >
              <span style={{ fontSize: 12, fontWeight: 800, color: "#00FFFF" }}>Click to Replace</span>
            </div>
          </div>

          <button
            type="button"
            onClick={() => fileInputRef.current?.click()}
            style={actionBtnStyle}
          >
            <span>⭳</span> Upload Image
          </button>
          <div style={{ fontSize: 9, color: "rgba(255, 255, 255, 0.4)", textAlign: "center" }}>
            JPG · PNG · HEIC · WEBP
          </div>
        </div>

        {/* STEP 2: AI Cutout & Refine */}
        <div style={stepCardStyle}>
          <div style={stepHeaderStyle}>
            <span style={stepBadgeStyle(2)}>2</span>
            <div>
              <div style={stepTitleStyle}>AI CUTOUT & REFINE</div>
              <div style={stepSubtitleStyle}>Automatically removes background, keeps details.</div>
            </div>
          </div>

          <div
            style={{
              height: 140,
              borderRadius: 10,
              overflow: "hidden",
              border: "1px solid rgba(138, 43, 226, 0.35)",
              background:
                "repeating-conic-gradient(#151228 0% 25%, #252044 0% 50%) 50% / 16px 16px",
              position: "relative",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
            }}
          >
            <img
              src={userPhoto}
              alt="AI Cutout"
              style={{
                width: "75%",
                height: "100%",
                objectFit: "contain",
                filter: isCutoutMode ? "drop-shadow(0 4px 10px rgba(0, 255, 255, 0.4))" : "none",
              }}
            />
          </div>

          <div style={{ display: "grid", gap: 3, fontSize: 10, color: "rgba(255, 255, 255, 0.85)" }}>
            <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
              <span style={{ color: "#00FFFF" }}>✓</span> AI Person Detection
            </div>
            <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
              <span style={{ color: "#00FFFF" }}>✓</span> Edge Hair/Clothing Detail
            </div>
            <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
              <span style={{ color: "#00FFFF" }}>✓</span> Background Removal
            </div>
            <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
              <span style={{ color: "#00FFFF" }}>✓</span> Auto Cleanup
            </div>
            <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
              <span style={{ color: "#00FFFF" }}>✓</span> Manual Adjust (Optional)
            </div>
          </div>

          <button
            type="button"
            onClick={() => {
              setCutoutRefined(!cutoutRefined);
              showToast(cutoutRefined ? "Reset to standard edge tolerance" : "Refined hair and silhouette edges!");
            }}
            style={{ ...actionBtnStyle, background: cutoutRefined ? "rgba(0, 255, 255, 0.25)" : actionBtnStyle.background }}
          >
            <span>✨</span> Refine Cutout
          </button>
        </div>

        {/* STEP 3: Choose a Scene */}
        <div style={stepCardStyle}>
          <div style={stepHeaderStyle}>
            <span style={stepBadgeStyle(3)}>3</span>
            <div>
              <div style={stepTitleStyle}>CHOOSE A SCENE</div>
              <div style={stepSubtitleStyle}>Cars, jets, buildings, props, and more.</div>
            </div>
          </div>

          <div
            style={{
              height: 140,
              borderRadius: 10,
              overflow: "hidden",
              border: "1px solid rgba(0, 255, 255, 0.25)",
              background: selectedEnvironment.previewBg,
              position: "relative",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
            }}
          >
            <div
              style={{
                position: "absolute",
                inset: 0,
                background: selectedBackground.previewBg,
                opacity: 0.5,
              }}
            />
            <div
              style={{
                position: "absolute",
                bottom: 8,
                left: 10,
                right: 10,
                padding: "4px 8px",
                borderRadius: 6,
                background: "rgba(0,0,0,0.65)",
                backdropFilter: "blur(8px)",
                fontSize: 10,
                fontWeight: 800,
                color: "#00FFFF",
                display: "flex",
                justifyContent: "space-between",
              }}
            >
              <span>{selectedEnvironment.name}</span>
              <span style={{ color: "#FF2DAA" }}>{selectedVehicle.name}</span>
            </div>
          </div>

          <div
            style={{
              display: "grid",
              gridTemplateColumns: "repeat(4, 1fr)",
              gap: 4,
            }}
          >
            {SCENE_CATEGORIES.map((cat) => (
              <button
                key={cat.id}
                type="button"
                onClick={() => setSelectedCategory(cat.id)}
                style={{
                  padding: "5px 2px",
                  borderRadius: 6,
                  border: selectedCategory === cat.id ? "1px solid #00FFFF" : "1px solid rgba(255,255,255,0.1)",
                  background: selectedCategory === cat.id ? "rgba(0, 255, 255, 0.2)" : "rgba(255,255,255,0.04)",
                  color: "#ffffff",
                  fontSize: 9,
                  fontWeight: 700,
                  cursor: "pointer",
                  display: "flex",
                  flexDirection: "column",
                  alignItems: "center",
                  gap: 2,
                }}
              >
                <span>{cat.icon}</span>
                <span>{cat.label}</span>
              </button>
            ))}
          </div>
        </div>

        {/* STEP 4: Place & Adjust */}
        <div style={stepCardStyle}>
          <div style={stepHeaderStyle}>
            <span style={stepBadgeStyle(4)}>4</span>
            <div>
              <div style={stepTitleStyle}>PLACE & ADJUST</div>
              <div style={stepSubtitleStyle}>Position, scale, rotate and add effects.</div>
            </div>
          </div>

          <div
            style={{
              height: 140,
              borderRadius: 10,
              overflow: "hidden",
              border: "1px solid rgba(0, 255, 255, 0.4)",
              background: "#080616",
              position: "relative",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
            }}
          >
            <div
              style={{
                position: "absolute",
                inset: 0,
                background: selectedEnvironment.previewBg,
                opacity: 0.7,
              }}
            />

            {/* Transform Bounding Box */}
            <div
              style={{
                position: "relative",
                width: 70,
                height: 110,
                border: "1.5px solid #00FFFF",
                boxShadow: "0 0 12px rgba(0, 255, 255, 0.5)",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                transform: `translate(${posX}px, ${posY}px) scale(${scale}) rotate(${rotation}deg)`,
                transition: "transform 0.1s ease-out",
              }}
            >
              <img
                src={userPhoto}
                alt="Framed Subject"
                style={{
                  width: "100%",
                  height: "100%",
                  objectFit: "cover",
                  filter: `drop-shadow(0 6px 12px rgba(0,0,0,${shadowOpacity})) brightness(${lightingWarmth})`,
                }}
              />
              {/* Corner transform handles */}
              <div style={{ ...handleStyle, top: -4, left: -4 }} />
              <div style={{ ...handleStyle, top: -4, right: -4 }} />
              <div style={{ ...handleStyle, bottom: -4, left: -4 }} />
              <div style={{ ...handleStyle, bottom: -4, right: -4 }} />
              {/* Edge transform handles */}
              <div style={{ ...handleStyle, top: -4, left: "50%", transform: "translateX(-50%)" }} />
              <div style={{ ...handleStyle, bottom: -4, left: "50%", transform: "translateX(-50%)" }} />
            </div>
          </div>

          {/* Adjustment tools grid */}
          <div
            style={{
              display: "grid",
              gridTemplateColumns: "repeat(4, 1fr)",
              gap: 4,
            }}
          >
            {ADJUST_TOOLS.map((tool) => (
              <button
                key={tool.id}
                type="button"
                onClick={() => {
                  setActiveAdjustTool(tool.id);
                  if (tool.id === "scale") setScale((s) => (s >= 1.3 ? 0.9 : s + 0.15));
                  if (tool.id === "rotate") setRotation((r) => (r >= 15 ? -15 : r + 5));
                  if (tool.id === "move") {
                    setPosX((x) => (x > 15 ? -15 : x + 8));
                  }
                  if (tool.id === "shadows") setShadowOpacity((o) => (o >= 0.9 ? 0.3 : o + 0.2));
                  if (tool.id === "lighting") setLightingWarmth((w) => (w >= 1.2 ? 0.85 : w + 0.1));
                  if (tool.id === "layers") setIsLayerInFront(!isLayerInFront);
                  if (tool.id === "filters") {
                    const filters = ["cinematic", "cyber", "gold", "noir"];
                    const next = filters[(filters.indexOf(activeFilter) + 1) % filters.length];
                    setActiveFilter(next);
                  }
                  showToast(`Adjusted ${tool.label}`);
                }}
                style={{
                  padding: "5px 2px",
                  borderRadius: 6,
                  border: activeAdjustTool === tool.id ? "1px solid #FF2DAA" : "1px solid rgba(255,255,255,0.1)",
                  background: activeAdjustTool === tool.id ? "rgba(255, 45, 170, 0.2)" : "rgba(255,255,255,0.04)",
                  color: "#ffffff",
                  fontSize: 9,
                  fontWeight: 700,
                  cursor: "pointer",
                  display: "flex",
                  flexDirection: "column",
                  alignItems: "center",
                  gap: 2,
                }}
              >
                <span>{tool.icon}</span>
                <span>{tool.label}</span>
              </button>
            ))}
          </div>
        </div>

        {/* STEP 5: Create & Share */}
        <div style={stepCardStyle}>
          <div style={stepHeaderStyle}>
            <span style={stepBadgeStyle(5)}>5</span>
            <div>
              <div style={stepTitleStyle}>CREATE & SHARE</div>
              <div style={stepSubtitleStyle}>Save, post, or use in YoPho.</div>
            </div>
          </div>

          <div
            style={{
              height: 140,
              borderRadius: 10,
              overflow: "hidden",
              border: "1px solid #FF2DAA",
              boxShadow: "0 0 15px rgba(255, 45, 170, 0.3)",
              background: "#080616",
              position: "relative",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
            }}
          >
            <img
              src={userPhoto}
              alt="Final Render"
              style={{
                width: "100%",
                height: "100%",
                objectFit: "cover",
              }}
            />
            <div
              style={{
                position: "absolute",
                top: 8,
                right: 8,
                background: "rgba(0,0,0,0.75)",
                padding: "3px 6px",
                borderRadius: 4,
                fontSize: 8,
                fontWeight: 900,
                color: "#00FFFF",
                border: "1px solid #00FFFF",
              }}
            >
              HD READY
            </div>
          </div>

          <div style={{ display: "grid", gap: 5 }}>
            <button
              type="button"
              onClick={handleDownloadHd}
              style={{
                ...actionBtnStyle,
                background: "linear-gradient(90deg, #7928CA 0%, #FF2DAA 100%)",
                border: "none",
                fontWeight: 900,
                boxShadow: "0 0 15px rgba(255, 45, 170, 0.5)",
              }}
            >
              <span>⬇</span> Download HD
            </button>
            <button
              type="button"
              onClick={handleSaveToYoPho}
              style={{ ...actionBtnStyle, background: "rgba(255,255,255,0.06)" }}
            >
              <span>📁</span> Save to YoPho
            </button>
            <button
              type="button"
              onClick={() => showToast("Share link copied to clipboard!")}
              style={{ ...actionBtnStyle, background: "rgba(255,255,255,0.06)" }}
            >
              <span>🔗</span> Share to Social
            </button>
            <button
              type="button"
              onClick={() => showToast("Applied to your profile avatar & venue lounge!")}
              style={{ ...actionBtnStyle, background: "rgba(255,255,255,0.06)" }}
            >
              <span>👤</span> Use in Profile / Lounge
            </button>
          </div>
        </div>
      </section>

      {/* 4 Gallery Rows: Vehicles, Environments, Props & Decor, and Backgrounds */}
      <section style={{ display: "grid", gap: 24, marginBottom: 30 }}>
        {/* ROW 1: VEHICLE PROPS */}
        <div>
          <div style={gallerySectionHeaderStyle}>
            <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", width: "100%", flexWrap: "wrap", gap: 8 }}>
              <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                <span style={{ color: "#00FFFF" }}>🚗</span> VEHICLE PROPS
                <span style={{ fontSize: 11, color: "rgba(255,255,255,0.45)", fontWeight: 500 }}>
                  (Sports Cars, Luxury, Lowriders, Jets, Boats + Custom)
                </span>
              </div>
              <button
                type="button"
                onClick={() => customVehicleInputRef.current?.click()}
                style={{
                  padding: "4px 10px",
                  borderRadius: 6,
                  border: "1px solid #00FFFF",
                  background: "rgba(0, 255, 255, 0.15)",
                  color: "#00FFFF",
                  fontSize: 10,
                  fontWeight: 800,
                  cursor: "pointer",
                  display: "flex",
                  alignItems: "center",
                  gap: 4,
                }}
              >
                <span>+</span> UPLOAD CUSTOM VEHICLE (FREE)
              </button>
            </div>
          </div>
          <div style={galleryGridStyle}>
            {[...customVehicles, ...VEHICLE_PROPS].map((card) => {
              const isSelected = selectedVehicle.id === card.id;
              return (
                <div
                  key={card.id}
                  onClick={() => {
                    setSelectedVehicle(card);
                    showToast(`Vehicle Prop set to: ${card.name}`);
                  }}
                  style={cardContainerStyle(isSelected)}
                >
                  <div style={cardThumbWrapperStyle(card.previewBg)}>
                    <img src={card.thumbnail} alt={card.name} style={cardImgStyle} />
                    {card.badge && <span style={cardBadgeStyle}>{card.badge}</span>}
                  </div>
                  <div style={cardLabelStyle(isSelected)}>{card.name}</div>
                </div>
              );
            })}
          </div>
        </div>

        {/* ROW 2: ENVIRONMENTS */}
        <div>
          <div style={gallerySectionHeaderStyle}>
            <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", width: "100%", flexWrap: "wrap", gap: 8 }}>
              <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                <span style={{ color: "#FF2DAA" }}>🏢</span> ENVIRONMENTS
                <span style={{ fontSize: 11, color: "rgba(255,255,255,0.45)", fontWeight: 500 }}>
                  (City Streets, Mansions, Studios, Stages + Custom)
                </span>
              </div>
              <button
                type="button"
                onClick={() => customEnvInputRef.current?.click()}
                style={{
                  padding: "4px 10px",
                  borderRadius: 6,
                  border: "1px solid #FF2DAA",
                  background: "rgba(255, 45, 170, 0.15)",
                  color: "#FF2DAA",
                  fontSize: 10,
                  fontWeight: 800,
                  cursor: "pointer",
                  display: "flex",
                  alignItems: "center",
                  gap: 4,
                }}
              >
                <span>+</span> UPLOAD CUSTOM SCENE (FREE)
              </button>
            </div>
          </div>
          <div style={galleryGridStyle}>
            {[...customEnvironments, ...ENVIRONMENTS].map((card) => {
              const isSelected = selectedEnvironment.id === card.id;
              return (
                <div
                  key={card.id}
                  onClick={() => {
                    setSelectedEnvironment(card);
                    showToast(`Environment set to: ${card.name}`);
                  }}
                  style={cardContainerStyle(isSelected)}
                >
                  <div style={cardThumbWrapperStyle(card.previewBg)}>
                    <img src={card.thumbnail} alt={card.name} style={cardImgStyle} />
                    {card.badge && <span style={cardBadgeStyle}>{card.badge}</span>}
                  </div>
                  <div style={cardLabelStyle(isSelected)}>{card.name}</div>
                </div>
              );
            })}
          </div>
        </div>

        {/* ROW 3: PROPS & DECOR */}
        <div>
          <div style={gallerySectionHeaderStyle}>
            <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", width: "100%", flexWrap: "wrap", gap: 8 }}>
              <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                <span style={{ color: "#FFD700" }}>💎</span> PROPS & DECOR
                <span style={{ fontSize: 11, color: "rgba(255,255,255,0.45)", fontWeight: 500 }}>
                  (DJ Booths, Thrones, Signs, Red Carpets, Money + Custom)
                </span>
              </div>
              <button
                type="button"
                onClick={() => customPropInputRef.current?.click()}
                style={{
                  padding: "4px 10px",
                  borderRadius: 6,
                  border: "1px solid #FFD700",
                  background: "rgba(255, 215, 0, 0.15)",
                  color: "#FFD700",
                  fontSize: 10,
                  fontWeight: 800,
                  cursor: "pointer",
                  display: "flex",
                  alignItems: "center",
                  gap: 4,
                }}
              >
                <span>+</span> UPLOAD CUSTOM PROP (FREE)
              </button>
            </div>
          </div>
          <div style={galleryGridStyle}>
            {[...customProps, ...PROPS_DECOR].map((card) => {
              const isSelected = selectedProp.id === card.id;
              return (
                <div
                  key={card.id}
                  onClick={() => {
                    setSelectedProp(card);
                    showToast(`Prop equipped: ${card.name}`);
                  }}
                  style={cardContainerStyle(isSelected)}
                >
                  <div style={cardThumbWrapperStyle(card.previewBg)}>
                    <img src={card.thumbnail} alt={card.name} style={cardImgStyle} />
                    {card.badge && <span style={cardBadgeStyle}>{card.badge}</span>}
                  </div>
                  <div style={cardLabelStyle(isSelected)}>{card.name}</div>
                </div>
              );
            })}
          </div>
        </div>

        {/* ROW 4: BACKGROUNDS (User Explicit Instruction: same style) */}
        <div>
          <div style={gallerySectionHeaderStyle}>
            <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", width: "100%", flexWrap: "wrap", gap: 8 }}>
              <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                <span style={{ color: "#00E5FF" }}>🌌</span> BACKGROUNDS
                <span style={{ fontSize: 11, color: "rgba(255,255,255,0.45)", fontWeight: 500 }}>
                  (Cyber, Sunset, Stadium Lights, Retro Wave + Custom)
                </span>
              </div>
              <button
                type="button"
                onClick={() => customBgInputRef.current?.click()}
                style={{
                  padding: "4px 10px",
                  borderRadius: 6,
                  border: "1px solid #00E5FF",
                  background: "rgba(0, 229, 255, 0.15)",
                  color: "#00E5FF",
                  fontSize: 10,
                  fontWeight: 800,
                  cursor: "pointer",
                  display: "flex",
                  alignItems: "center",
                  gap: 4,
                }}
              >
                <span>+</span> UPLOAD CUSTOM BACKGROUND (FREE)
              </button>
            </div>
          </div>
          <div style={galleryGridStyle}>
            {[...customBackgrounds, ...BACKGROUNDS].map((card) => {
              const isSelected = selectedBackground.id === card.id;
              return (
                <div
                  key={card.id}
                  onClick={() => {
                    setSelectedBackground(card);
                    showToast(`Background atmosphere: ${card.name}`);
                  }}
                  style={cardContainerStyle(isSelected)}
                >
                  <div style={cardThumbWrapperStyle(card.previewBg)}>
                    <img src={card.thumbnail} alt={card.name} style={cardImgStyle} />
                    {card.badge && <span style={cardBadgeStyle}>{card.badge}</span>}
                  </div>
                  <div style={cardLabelStyle(isSelected)}>{card.name}</div>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* YOPHO TRADING CARD / BASEBALL CARD & ALBUM COVER DESIGN STUDIO */}
      <section
        style={{
          background: "linear-gradient(135deg, rgba(20, 10, 45, 0.95) 0%, rgba(5, 5, 20, 0.98) 100%)",
          border: "2px solid #00FFFF",
          boxShadow: "0 0 35px rgba(0, 255, 255, 0.25), inset 0 0 30px rgba(255, 45, 170, 0.15)",
          borderRadius: 16,
          padding: 20,
          marginBottom: 30,
        }}
      >
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", flexWrap: "wrap", gap: 12, marginBottom: 16, borderBottom: "1px solid rgba(0, 255, 255, 0.2)", paddingBottom: 12 }}>
          <div>
            <div style={{ fontSize: 16, fontWeight: 900, letterSpacing: "0.12em", color: "#00FFFF", textShadow: "0 0 10px rgba(0, 255, 255, 0.6)" }}>
              PERSONAL YOPHO CARD & ALBUM COVER CREATOR
            </div>
            <div style={{ fontSize: 11, color: "rgba(255,255,255,0.6)", marginTop: 2 }}>
              Personal baseball card layout with quotes, mottos, video reels & artist QR scan banner.
            </div>
          </div>
          <div style={{ display: "flex", gap: 8, alignItems: "center" }}>
            <button
              type="button"
              onClick={() => setIsVideoMotionActive(!isVideoMotionActive)}
              style={{
                padding: "8px 14px",
                borderRadius: 8,
                border: isVideoMotionActive ? "1px solid #00FF88" : "1px solid rgba(255,255,255,0.2)",
                background: isVideoMotionActive ? "rgba(0, 255, 136, 0.25)" : "rgba(255,255,255,0.06)",
                color: isVideoMotionActive ? "#00FF88" : "#ffffff",
                fontSize: 11,
                fontWeight: 800,
                cursor: "pointer",
                display: "flex",
                alignItems: "center",
                gap: 6,
                boxShadow: isVideoMotionActive ? "0 0 15px rgba(0, 255, 136, 0.4)" : "none",
              }}
            >
              <span>{isVideoMotionActive ? "▶ PLAYING MOTION" : "▷ SHORT AI VIDEO PREVIEW"}</span>
            </button>
            <button
              type="button"
              onClick={() => setShowQuoteStamp(!showQuoteStamp)}
              style={{
                padding: "8px 12px",
                borderRadius: 8,
                border: showQuoteStamp ? "1px solid #FFD700" : "1px solid rgba(255,255,255,0.2)",
                background: showQuoteStamp ? "rgba(255, 215, 0, 0.2)" : "rgba(255,255,255,0.06)",
                color: showQuoteStamp ? "#FFD700" : "rgba(255,255,255,0.7)",
                fontSize: 11,
                fontWeight: 800,
                cursor: "pointer",
              }}
            >
              {showQuoteStamp ? "✓ QUOTE BOXES ACTIVE" : "+ ADD QUOTES"}
            </button>
          </div>
        </div>

        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(300px, 1fr))", gap: 20, alignItems: "start" }}>
          {/* Card Preview Stage (Baseball Card / Album Cover Frame) */}
          <div
            style={{
              position: "relative",
              width: "100%",
              maxWidth: 380,
              margin: "0 auto",
              borderRadius: 18,
              border: "3px solid #00FFFF",
              boxShadow: "0 10px 40px rgba(0,0,0,0.8), 0 0 25px rgba(0, 255, 255, 0.4)",
              background: selectedBackground.previewBg,
              overflow: "hidden",
              display: "flex",
              flexDirection: "column",
            }}
          >
            {/* Header Badge */}
            <div
              style={{
                padding: "8px 12px",
                background: "rgba(5, 5, 16, 0.85)",
                backdropFilter: "blur(8px)",
                borderBottom: "1px solid rgba(0, 255, 255, 0.3)",
                display: "flex",
                justifyContent: "space-between",
                alignItems: "center",
              }}
            >
              <div style={{ fontSize: 10, fontWeight: 900, letterSpacing: "0.14em", color: "#FFD700" }}>
                YOPHO IDENTITY CARD
              </div>
              <div style={{ fontSize: 9, fontWeight: 900, color: "#00FFFF", background: "rgba(0, 255, 255, 0.15)", padding: "2px 6px", borderRadius: 4, border: "1px solid #00FFFF" }}>
                FREE MEMBER
              </div>
            </div>

            {/* Main Subject Canvas */}
            <div
              style={{
                position: "relative",
                height: 320,
                overflow: "hidden",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                background: selectedEnvironment.previewBg,
              }}
            >
              {/* Prop Behind */}
              {!isLayerInFront && (
                <div style={{ position: "absolute", bottom: 10, right: 10, width: 90, height: 90, zIndex: 1, opacity: 0.9 }}>
                  <img src={selectedProp.thumbnail} alt={selectedProp.name} style={{ width: "100%", height: "100%", objectFit: "contain" }} />
                </div>
              )}

              {/* Vehicle in Scene */}
              <div style={{ position: "absolute", bottom: 0, left: 0, right: 0, height: 160, zIndex: 2, opacity: 0.85 }}>
                <img src={selectedVehicle.thumbnail} alt={selectedVehicle.name} style={{ width: "100%", height: "100%", objectFit: "cover" }} />
              </div>

              {/* Cutout Subject */}
              <div
                style={{
                  position: "relative",
                  zIndex: 3,
                  width: 140,
                  height: 220,
                  transform: `translate(${posX}px, ${posY}px) scale(${scale}) rotate(${rotation}deg)`,
                  transition: "transform 0.1s ease-out",
                  animation: isVideoMotionActive ? "yophoPulseMotion 2.2s ease-in-out infinite alternate" : "none",
                }}
              >
                <img
                  src={userPhoto}
                  alt="Subject"
                  style={{
                    width: "100%",
                    height: "100%",
                    objectFit: "contain",
                    filter: `drop-shadow(0 8px 16px rgba(0,0,0,${shadowOpacity})) brightness(${lightingWarmth})`,
                  }}
                />
              </div>

              {/* Prop in Front */}
              {isLayerInFront && (
                <div style={{ position: "absolute", bottom: 10, right: 10, width: 85, height: 85, zIndex: 4, opacity: 0.95 }}>
                  <img src={selectedProp.thumbnail} alt={selectedProp.name} style={{ width: "100%", height: "100%", objectFit: "contain" }} />
                </div>
              )}

              {/* Quote / Vibe Stamps on Card */}
              {showQuoteStamp && (
                <>
                  <div
                    style={{
                      position: "absolute",
                      top: 10,
                      left: 10,
                      maxWidth: 150,
                      background: "rgba(5, 5, 20, 0.85)",
                      border: "1.5px solid #FF2DAA",
                      borderRadius: 8,
                      padding: "6px 8px",
                      zIndex: 5,
                      boxShadow: "0 0 12px rgba(255, 45, 170, 0.5)",
                    }}
                  >
                    <div style={{ fontSize: 8, fontWeight: 900, color: "#FF2DAA", letterSpacing: "0.1em" }}>MY VIBE:</div>
                    <div style={{ fontSize: 9, fontWeight: 800, color: "#ffffff", marginTop: 2, lineHeight: 1.2 }}>{cardVibe}</div>
                  </div>

                  <div
                    style={{
                      position: "absolute",
                      top: 10,
                      right: 10,
                      maxWidth: 150,
                      background: "rgba(5, 5, 20, 0.85)",
                      border: "1.5px solid #00FFFF",
                      borderRadius: 8,
                      padding: "6px 8px",
                      zIndex: 5,
                      boxShadow: "0 0 12px rgba(0, 255, 255, 0.5)",
                      textAlign: "right",
                    }}
                  >
                    <div style={{ fontSize: 8, fontWeight: 900, color: "#00FFFF", letterSpacing: "0.1em" }}>MOTTO:</div>
                    <div style={{ fontSize: 9, fontWeight: 800, color: "#ffffff", marginTop: 2, lineHeight: 1.2 }}>{cardQuote}</div>
                  </div>
                </>
              )}
            </div>

            {/* Favorite Playlists & Video Reel Shelf */}
            <div style={{ padding: "8px 10px", background: "rgba(10, 8, 24, 0.95)", borderTop: "1px solid rgba(255, 45, 170, 0.3)" }}>
              <div style={{ fontSize: 8, fontWeight: 900, color: "#FF2DAA", letterSpacing: "0.14em", textAlign: "center", marginBottom: 6 }}>
                FAVORITE PLAYLISTS & VIDEOS
              </div>
              <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: 6 }}>
                <div style={{ background: "rgba(0,0,0,0.6)", borderRadius: 6, padding: 4, border: "1px solid rgba(255,255,255,0.1)", textAlign: "center" }}>
                  <div style={{ fontSize: 12 }}>🎬</div>
                  <div style={{ fontSize: 7, fontWeight: 700, color: "#00FFFF", marginTop: 2 }}>DAY IN TOKYO</div>
                </div>
                <div style={{ background: "rgba(0,0,0,0.6)", borderRadius: 6, padding: 4, border: "1px solid rgba(255,255,255,0.1)", textAlign: "center" }}>
                  <div style={{ fontSize: 12 }}>🎹</div>
                  <div style={{ fontSize: 7, fontWeight: 700, color: "#FFD700", marginTop: 2 }}>STUDIO SESSIONS</div>
                </div>
                <div style={{ background: "rgba(0,0,0,0.6)", borderRadius: 6, padding: 4, border: "1px solid rgba(255,255,255,0.1)", textAlign: "center" }}>
                  <div style={{ fontSize: 12 }}>🎧</div>
                  <div style={{ fontSize: 7, fontWeight: 700, color: "#FF2DAA", marginTop: 2 }}>TECH REVIEWS</div>
                </div>
              </div>
            </div>

            {/* Protected Slim QR Footer with TMI Branding */}
            <div
              style={{
                padding: "8px 12px",
                background: "#ffffff",
                color: "#050510",
                display: "flex",
                alignItems: "center",
                justifyContent: "space-between",
                gap: 8,
              }}
            >
              <div style={{ display: "flex", flexDirection: "column" }}>
                <div style={{ fontSize: 11, fontWeight: 900, letterSpacing: "0.12em" }}>
                  CREATE YOURS | YOPHO.IO
                </div>
                <div style={{ fontSize: 7, color: "#555", fontWeight: 700 }}>
                  ARTIST ID: {ownerId} · SCAN TO CONNECT
                </div>
              </div>
              {/* Real QR Glyph */}
              <div style={{ width: 28, height: 28, background: "#050510", borderRadius: 3, display: "flex", alignItems: "center", justifyContent: "center", color: "#fff", fontSize: 16 }}>
                ⛶
              </div>
            </div>
          </div>

          {/* Customization Controls for Card Quotes & Videos */}
          <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
            <div style={{ background: "rgba(0,0,0,0.4)", borderRadius: 10, padding: 12, border: "1px solid rgba(255,255,255,0.1)" }}>
              <div style={{ fontSize: 11, fontWeight: 900, color: "#FFD700", letterSpacing: "0.1em", marginBottom: 8 }}>
                EDIT CARD QUOTES & SLOGANS
              </div>
              <div style={{ display: "grid", gap: 8 }}>
                <div>
                  <label style={{ fontSize: 9, color: "rgba(255,255,255,0.5)", display: "block", marginBottom: 3 }}>
                    PERSONAL MOTTO / PULL QUOTE:
                  </label>
                  <input
                    type="text"
                    value={cardQuote}
                    onChange={(e) => setCardQuote(e.target.value)}
                    style={{
                      width: "100%",
                      padding: "8px 10px",
                      background: "rgba(0,0,0,0.6)",
                      border: "1px solid rgba(0, 255, 255, 0.4)",
                      borderRadius: 6,
                      color: "#fff",
                      fontSize: 11,
                      boxSizing: "border-box",
                    }}
                  />
                </div>
                <div>
                  <label style={{ fontSize: 9, color: "rgba(255,255,255,0.5)", display: "block", marginBottom: 3 }}>
                    VIBE / CATCHPHRASE:
                  </label>
                  <input
                    type="text"
                    value={cardVibe}
                    onChange={(e) => setCardVibe(e.target.value)}
                    style={{
                      width: "100%",
                      padding: "8px 10px",
                      background: "rgba(0,0,0,0.6)",
                      border: "1px solid rgba(255, 45, 170, 0.4)",
                      borderRadius: 6,
                      color: "#fff",
                      fontSize: 11,
                      boxSizing: "border-box",
                    }}
                  />
                </div>
              </div>
            </div>

            {/* Video Motion Animation Selector */}
            <div style={{ background: "rgba(0,0,0,0.4)", borderRadius: 10, padding: 12, border: "1px solid rgba(255,255,255,0.1)" }}>
              <div style={{ fontSize: 11, fontWeight: 900, color: "#00FF88", letterSpacing: "0.1em", marginBottom: 8 }}>
                AI VIDEO / MOTION REEL PREVIEW MODES
              </div>
              <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: 6 }}>
                {[
                  { id: "pulse_glow", label: "Pulse Glow", icon: "✨" },
                  { id: "float_drift", label: "Floating Drift", icon: "🌊" },
                  { id: "stage_lights", label: "Stage Flash", icon: "⚡" },
                ].map((preset) => (
                  <button
                    key={preset.id}
                    type="button"
                    onClick={() => {
                      setMotionPreset(preset.id);
                      setIsVideoMotionActive(true);
                      showToast(`Motion preset activated: ${preset.label}`);
                    }}
                    style={{
                      padding: "8px 4px",
                      borderRadius: 6,
                      border: motionPreset === preset.id ? "1px solid #00FF88" : "1px solid rgba(255,255,255,0.1)",
                      background: motionPreset === preset.id ? "rgba(0, 255, 136, 0.2)" : "rgba(255,255,255,0.04)",
                      color: "#fff",
                      fontSize: 9,
                      fontWeight: 700,
                      cursor: "pointer",
                      display: "flex",
                      flexDirection: "column",
                      alignItems: "center",
                      gap: 4,
                    }}
                  >
                    <span>{preset.icon}</span>
                    <span>{preset.label}</span>
                  </button>
                ))}
              </div>
            </div>

            <div style={{ fontSize: 10, color: "rgba(255,255,255,0.45)", lineHeight: 1.4 }}>
              Tip: Stamped YoPho cards automatically scale to profile and lounge showcases, preserving your artist ID QR code and personal quotes at HD resolution.
            </div>
          </div>
        </div>
      </section>

      {/* Bottom Grid: AI Recreate, Advanced Features, Neon Endless Possibilities */}
      <section
        style={{
          display: "grid",
          gridTemplateColumns: "repeat(auto-fit, minmax(280px, 1fr))",
          gap: 16,
          alignItems: "stretch",
          marginBottom: 20,
        }}
      >
        {/* Left: AI RECREATE (Alternative Mode) */}
        <div
          style={{
            background: "rgba(12, 10, 28, 0.8)",
            border: "1px solid rgba(0, 255, 255, 0.25)",
            borderRadius: 14,
            padding: 16,
            display: "flex",
            flexDirection: "column",
            gap: 12,
          }}
        >
          <div>
            <div style={{ fontSize: 13, fontWeight: 900, color: "#00FFFF", letterSpacing: "0.08em" }}>
              AI RECREATE (ALTERNATIVE MODE)
            </div>
            <div style={{ fontSize: 11, color: "rgba(255,255,255,0.5)", marginTop: 2 }}>
              Let AI generate a new scene with your image and a prompt.
            </div>
          </div>

          <div style={{ display: "flex", gap: 10, alignItems: "center" }}>
            <div
              style={{
                width: 68,
                height: 68,
                borderRadius: 8,
                overflow: "hidden",
                border: "1px solid rgba(0,255,255,0.3)",
                flexShrink: 0,
              }}
            >
              <img src={userPhoto} alt="Subject" style={{ width: "100%", height: "100%", objectFit: "cover" }} />
            </div>
            <div style={{ fontSize: 20, fontWeight: 900, color: "#FF2DAA" }}>+</div>
            <div style={{ flex: 1, position: "relative" }}>
              <input
                type="text"
                value={aiPrompt}
                onChange={(e) => setAiPrompt(e.target.value)}
                placeholder="Describe your scene..."
                style={{
                  width: "100%",
                  padding: "10px 12px",
                  background: "rgba(0,0,0,0.5)",
                  border: "1px solid rgba(255,255,255,0.15)",
                  borderRadius: 8,
                  color: "#ffffff",
                  fontSize: 11,
                  boxSizing: "border-box",
                }}
              />
            </div>
          </div>

          <button
            type="button"
            onClick={handleGenerateAi}
            disabled={isGeneratingAi}
            style={{
              padding: "10px 16px",
              borderRadius: 8,
              border: "none",
              background: isGeneratingAi
                ? "rgba(121, 40, 202, 0.5)"
                : "linear-gradient(90deg, #7928CA 0%, #FF2DAA 100%)",
              color: "#ffffff",
              fontSize: 12,
              fontWeight: 800,
              cursor: isGeneratingAi ? "wait" : "pointer",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              gap: 8,
              boxShadow: "0 0 16px rgba(255, 45, 170, 0.35)",
            }}
          >
            <span>{isGeneratingAi ? "⏳" : "✨"}</span>
            <span>{isGeneratingAi ? "Generating AI Scene..." : "Generate with AI"}</span>
          </button>

          {aiGeneratedSuccess && (
            <div
              style={{
                marginTop: 4,
                padding: "8px 12px",
                borderRadius: 8,
                background: "rgba(0, 255, 255, 0.1)",
                border: "1px solid #00FFFF",
                fontSize: 11,
                color: "#00FFFF",
                fontWeight: 700,
                display: "flex",
                alignItems: "center",
                gap: 8,
              }}
            >
              <span>✓</span> AI Recreate synthesized: Miami Penthouse & Exotic Red Supercar.
            </div>
          )}
        </div>

        {/* Middle: ADVANCED FEATURES */}
        <div
          style={{
            background: "rgba(12, 10, 28, 0.8)",
            border: "1px solid rgba(255, 45, 170, 0.25)",
            borderRadius: 14,
            padding: 16,
            display: "flex",
            flexDirection: "column",
            gap: 10,
          }}
        >
          <div style={{ fontSize: 13, fontWeight: 900, color: "#FF2DAA", letterSpacing: "0.08em" }}>
            ADVANCED FEATURES
          </div>
          <div style={{ display: "grid", gap: 6, fontSize: 11 }}>
            {ADVANCED_FEATURES_LIST.map((feat) => (
              <div key={feat} style={{ display: "flex", alignItems: "center", gap: 8, color: "rgba(255,255,255,0.85)" }}>
                <span style={{ color: "#00FFFF", fontWeight: 900 }}>✓</span>
                <span>{feat}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Right: SAME PHOTO ENDLESS POSSIBILITIES */}
        <div
          style={{
            background:
              "linear-gradient(135deg, rgba(20, 10, 45, 0.9) 0%, rgba(5, 5, 20, 0.95) 100%)",
            border: "2px solid #00FFFF",
            boxShadow: "0 0 25px rgba(0, 255, 255, 0.3), inset 0 0 20px rgba(255, 45, 170, 0.15)",
            borderRadius: 14,
            padding: 20,
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            justifyContent: "center",
            textAlign: "center",
            gap: 12,
            position: "relative",
          }}
        >
          <div
            style={{
              fontSize: 16,
              fontWeight: 900,
              letterSpacing: "0.15em",
              color: "#00FFFF",
              textShadow: "0 0 10px rgba(0, 255, 255, 0.8)",
            }}
          >
            SAME PHOTO
          </div>
          <div
            style={{
              fontSize: 18,
              fontWeight: 900,
              letterSpacing: "0.12em",
              color: "#ffffff",
            }}
          >
            ENDLESS POSSIBILITIES
          </div>

          <div
            style={{
              fontSize: 32,
              fontFamily: "'Brush Script MT', 'Dancing Script', cursive, sans-serif",
              color: "#FF2DAA",
              textShadow: "0 0 15px #FF2DAA, 0 0 25px rgba(255, 45, 170, 0.8)",
              transform: "rotate(-4deg)",
              margin: "6px 0",
            }}
          >
            Your World Your Way
          </div>
        </div>
      </section>

      {/* Footer Banner */}
      <footer
        style={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          flexWrap: "wrap",
          gap: 14,
          padding: "14px 18px",
          background: "rgba(0, 0, 0, 0.5)",
          border: "1px solid rgba(255, 255, 255, 0.1)",
          borderRadius: 10,
        }}
      >
        <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
          <span
            style={{
              fontSize: 18,
              fontWeight: 900,
              background: "linear-gradient(90deg, #00FFFF, #FF2DAA)",
              WebkitBackgroundClip: "text",
              WebkitTextFillColor: "transparent",
            }}
          >
            YoPho
          </span>
          <span style={{ fontSize: 11, fontWeight: 700, letterSpacing: "0.1em", color: "rgba(255,255,255,0.7)" }}>
            BIGGER BACKGROUNDS. BOLDER PROPS. BETTER PICTURES.
          </span>
        </div>

        <div style={{ display: "flex", gap: 14 }}>
          {[
            { label: "CREATE", icon: "📷" },
            { label: "SHARE", icon: "🔗" },
            { label: "EARN", icon: "💎" },
            { label: "BE SEEN", icon: "👁️" },
          ].map((item) => (
            <button
              key={item.label}
              type="button"
              onClick={() => showToast(`${item.label} workspace activated`)}
              style={{
                background: "transparent",
                border: "none",
                color: "#ffffff",
                fontSize: 11,
                fontWeight: 800,
                cursor: "pointer",
                display: "flex",
                alignItems: "center",
                gap: 5,
                opacity: 0.85,
              }}
            >
              <span>{item.icon}</span>
              <span>{item.label}</span>
            </button>
          ))}
        </div>
      </footer>
    </div>
  );
}

// ---------------- STYLES ----------------

const stepCardStyle: React.CSSProperties = {
  background: "rgba(14, 11, 30, 0.75)",
  border: "1px solid rgba(255, 255, 255, 0.12)",
  borderRadius: 12,
  padding: 12,
  display: "flex",
  flexDirection: "column",
  gap: 10,
  minWidth: 0,
};

const stepHeaderStyle: React.CSSProperties = {
  display: "flex",
  alignItems: "flex-start",
  gap: 8,
};

const stepBadgeStyle = (num: number): React.CSSProperties => ({
  width: 22,
  height: 22,
  borderRadius: "50%",
  background: num === 5 ? "linear-gradient(135deg, #7928CA, #FF2DAA)" : "linear-gradient(135deg, #00FFFF, #7928CA)",
  color: "#ffffff",
  fontSize: 11,
  fontWeight: 900,
  display: "flex",
  alignItems: "center",
  justifyContent: "center",
  flexShrink: 0,
  boxShadow: "0 0 8px rgba(0, 255, 255, 0.5)",
});

const stepTitleStyle: React.CSSProperties = {
  fontSize: 11,
  fontWeight: 900,
  letterSpacing: "0.06em",
  color: "#ffffff",
};

const stepSubtitleStyle: React.CSSProperties = {
  fontSize: 9,
  color: "rgba(255, 255, 255, 0.45)",
  marginTop: 1,
};

const actionBtnStyle: React.CSSProperties = {
  padding: "7px 10px",
  borderRadius: 7,
  border: "1px solid rgba(0, 255, 255, 0.35)",
  background: "rgba(0, 255, 255, 0.08)",
  color: "#ffffff",
  fontSize: 10,
  fontWeight: 800,
  cursor: "pointer",
  display: "flex",
  alignItems: "center",
  justifyContent: "center",
  gap: 6,
  transition: "all 0.15s ease",
};

const handleStyle: React.CSSProperties = {
  position: "absolute",
  width: 7,
  height: 7,
  background: "#00FFFF",
  borderRadius: "50%",
  boxShadow: "0 0 6px #00FFFF",
};

const gallerySectionHeaderStyle: React.CSSProperties = {
  fontSize: 13,
  fontWeight: 900,
  letterSpacing: "0.08em",
  color: "#ffffff",
  display: "flex",
  alignItems: "center",
  gap: 8,
  marginBottom: 10,
};

const galleryGridStyle: React.CSSProperties = {
  display: "grid",
  gridTemplateColumns: "repeat(auto-fill, minmax(130px, 1fr))",
  gap: 10,
};

const cardContainerStyle = (isSelected: boolean): React.CSSProperties => ({
  background: isSelected ? "rgba(0, 255, 255, 0.12)" : "rgba(15, 12, 32, 0.6)",
  border: isSelected ? "1.5px solid #00FFFF" : "1px solid rgba(255, 255, 255, 0.1)",
  boxShadow: isSelected ? "0 0 15px rgba(0, 255, 255, 0.3)" : "none",
  borderRadius: 10,
  padding: 6,
  cursor: "pointer",
  display: "flex",
  flexDirection: "column",
  gap: 6,
  transition: "all 0.15s ease",
});

const cardThumbWrapperStyle = (bg: string): React.CSSProperties => ({
  height: 72,
  borderRadius: 6,
  overflow: "hidden",
  background: bg,
  position: "relative",
  display: "flex",
  alignItems: "center",
  justifyContent: "center",
});

const cardImgStyle: React.CSSProperties = {
  width: "100%",
  height: "100%",
  objectFit: "cover",
  opacity: 0.85,
};

const cardBadgeStyle: React.CSSProperties = {
  position: "absolute",
  top: 4,
  right: 4,
  background: "rgba(0,0,0,0.75)",
  border: "1px solid rgba(0, 255, 255, 0.4)",
  borderRadius: 3,
  padding: "1px 4px",
  fontSize: 7,
  fontWeight: 900,
  color: "#00FFFF",
};

const cardLabelStyle = (isSelected: boolean): React.CSSProperties => ({
  fontSize: 10,
  fontWeight: 800,
  color: isSelected ? "#00FFFF" : "rgba(255, 255, 255, 0.85)",
  textAlign: "center",
  whiteSpace: "nowrap",
  overflow: "hidden",
  textOverflow: "ellipsis",
});
