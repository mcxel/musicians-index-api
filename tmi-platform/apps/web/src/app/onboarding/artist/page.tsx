"use client";

import { useState, useEffect, useRef } from "react";
import { useRouter } from "next/navigation";
import OnboardingShell from "@/components/onboarding/OnboardingShell";

export default function OnboardingArtistPage() {
  const router = useRouter();
  
  // Step state: '2' (details), '3' (photo select/take), '4' (photo edit)
  const [step, setStep] = useState<"2" | "3" | "4">("2");
  const [loading, setLoading] = useState(true);
  const [busy, setBusy] = useState(false);
  const [message, setMessage] = useState("");

  // Step 2 details
  const [artistName, setArtistName] = useState("");
  const [shortBio, setShortBio] = useState("");
  const [genres, setGenres] = useState("");
  const [city, setCity] = useState("");

  // Step 3 & 4 photo & live motion photo editing
  const [imageSrc, setImageSrc] = useState<string | null>(null);
  const [motionSrc, setMotionSrc] = useState<string | null>(null);
  const [motionDuration, setMotionDuration] = useState<2 | 4 | 6>(6); // Default 6s (Diamond NFL Draft style)
  const [isRecordingMotion, setIsRecordingMotion] = useState(false);
  const [recordingProgress, setRecordingProgress] = useState(0);
  const [cameraActive, setCameraActive] = useState(false);
  const [zoom, setZoom] = useState(1);
  const [rotate, setRotate] = useState(0);
  const [brightness, setBrightness] = useState(100);

  const videoRef = useRef<HTMLVideoElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [stream, setStream] = useState<MediaStream | null>(null);

  useEffect(() => {
    let active = true;
    const fetchSession = async () => {
      try {
        const res = await fetch("/api/auth/session", { cache: "no-store", credentials: "include" });
        if (!res.ok) { router.replace("/auth?next=/onboarding/artist"); return; }
        const data = await res.json();
        if (!data.authenticated) { router.replace("/auth?next=/onboarding/artist"); return; }
        
        if (active) {
          const user = data.user || {};
          // Restore fields
          setArtistName(user.name || "");
          setShortBio(user.bio || "");
          
          // Map onboarding step from db if present
          if (data.user?.onboardingStep && ["2", "3", "4"].includes(data.user.onboardingStep)) {
            setStep(data.user.onboardingStep as "2" | "3" | "4");
          }
          setLoading(false);
        }
      } catch {
        if (active) setLoading(false);
      }
    };
    void fetchSession();
    return () => { active = false; };
  }, [router]);

  // Continuous auto-saving on blur
  const handleAutoSaveField = async (fieldName: string, value: any) => {
    try {
      const payload: Record<string, any> = {};
      if (fieldName === "artistName") payload.displayName = value;
      if (fieldName === "bio") payload.bio = value;
      if (fieldName === "genres") {
        payload.genres = value.split(",").map((g: string) => g.trim()).filter(Boolean);
      }
      if (fieldName === "city") payload.location = value;

      await fetch("/api/profile/update", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify(payload),
      });
    } catch (err) {
      console.error("Auto-save failed:", err);
    }
  };

  const handleNextStep = async (nextStepVal: "3" | "4") => {
    setBusy(true);
    try {
      // Persist the current step to the database
      await fetch("/api/profile/update", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({ onboardingStep: nextStepVal }),
      });
      setStep(nextStepVal);
    } catch {
      setMessage("Failed to advance step. Please try again.");
    } finally {
      setBusy(false);
    }
  };

  // Camera stream controls
  const startCamera = async () => {
    try {
      const mediaStream = await navigator.mediaDevices.getUserMedia({ video: { facingMode: "user" } });
      // Don't assign srcObject here — the <video> element is only mounted
      // once cameraActive becomes true (it's inside a cameraActive ? <video>
      // : ... conditional), so videoRef.current is still null at this point
      // on first activation. The attach effect below runs after that render
      // instead, once the element actually exists.
      setStream(mediaStream);
      setCameraActive(true);
      setMessage("");
    } catch (err) {
      console.error("Camera access error:", err);
      setMessage("Could not access camera. Please select 'Upload Photo' instead.");
    }
  };

  // Attach the stream once the <video> element actually exists in the DOM
  // (i.e. after cameraActive flips to true and React has re-rendered).
  useEffect(() => {
    if (cameraActive && stream && videoRef.current) {
      videoRef.current.srcObject = stream;
    }
  }, [cameraActive, stream]);

  const stopCamera = () => {
    if (stream) {
      stream.getTracks().forEach((track) => track.stop());
      setStream(null);
    }
    setCameraActive(false);
  };

  const snapPhoto = () => {
    if (videoRef.current) {
      const video = videoRef.current;
      const canvas = canvasRef.current || document.createElement("canvas");
      const ctx = canvas.getContext("2d");
      if (ctx) {
        const w = video.videoWidth || 640;
        const h = video.videoHeight || 480;
        canvas.width = w;
        canvas.height = h;
        // Flip horizontally for mirror effect
        ctx.translate(canvas.width, 0);
        ctx.scale(-1, 1);
        ctx.drawImage(video, 0, 0, canvas.width, canvas.height);
        
        const dataUrl = canvas.toDataURL("image/jpeg", 0.85);
        setImageSrc(dataUrl);
        stopCamera();
        void handleNextStep("4");
      }
    }
  };

  const snapMotionPhoto = () => {
    if (!stream) return;
    setIsRecordingMotion(true);
    setRecordingProgress(0);

    // Also snap a still photo immediately as fallback
    if (videoRef.current) {
      const video = videoRef.current;
      const canvas = canvasRef.current || document.createElement("canvas");
      const ctx = canvas.getContext("2d");
      if (ctx) {
        const w = video.videoWidth || 640;
        const h = video.videoHeight || 480;
        canvas.width = w;
        canvas.height = h;
        ctx.translate(canvas.width, 0);
        ctx.scale(-1, 1);
        ctx.drawImage(video, 0, 0, canvas.width, canvas.height);
        setImageSrc(canvas.toDataURL("image/jpeg", 0.85));
      }
    }

    try {
      const mediaRecorder = new MediaRecorder(stream);
      const chunks: Blob[] = [];

      mediaRecorder.ondataavailable = (e) => {
        if (e.data.size > 0) chunks.push(e.data);
      };

      mediaRecorder.onstop = () => {
        const motionBlob = new Blob(chunks, { type: "video/webm" });
        const motionUrl = URL.createObjectURL(motionBlob);
        setMotionSrc(motionUrl);
        setIsRecordingMotion(false);
        stopCamera();
        void handleNextStep("4");
      };

      mediaRecorder.start(100);

      const durationMs = motionDuration * 1000;
      const startTime = Date.now();
      const interval = setInterval(() => {
        const elapsed = Date.now() - startTime;
        const progress = Math.min(100, (elapsed / durationMs) * 100);
        setRecordingProgress(progress);
        if (elapsed >= durationMs) {
          clearInterval(interval);
          if (mediaRecorder.state !== "inactive") {
            mediaRecorder.stop();
          }
        }
      }, 100);
    } catch (err) {
      console.error("Motion photo recording failed:", err);
      setIsRecordingMotion(false);
    }
  };

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (event) => {
        if (event.target?.result) {
          setImageSrc(event.target.result as string);
          void handleNextStep("4");
        }
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSavePhotoAndFinish = async () => {
    if (!imageSrc) return;
    setBusy(true);
    setMessage("");

    try {
      const canvas = canvasRef.current || document.createElement("canvas");
      const ctx = canvas.getContext("2d");
      const img = new Image();
      img.src = imageSrc;

      await new Promise<void>((resolve, reject) => {
        img.onload = () => {
          if (!ctx) return reject();
          // Force square output crop (400x400)
          canvas.width = 400;
          canvas.height = 400;
          
          ctx.clearRect(0, 0, 400, 400);
          ctx.save();
          
          // Apply brightness adjustment filter
          ctx.filter = `brightness(${brightness}%)`;
          
          // Move center of canvas to center of crop
          ctx.translate(200, 200);
          
          // Apply rotation
          ctx.rotate((rotate * Math.PI) / 180);
          
          // Apply zoom / scaling
          ctx.scale(zoom, zoom);
          
          // Draw image centered
          const minDim = Math.min(img.width, img.height);
          ctx.drawImage(
            img,
            (img.width - minDim) / 2, (img.height - minDim) / 2, minDim, minDim, // crop source square
            -200, -200, 400, 400 // draw destination square
          );
          
          ctx.restore();
          resolve();
        };
        img.onerror = reject;
      });

      // Get file blob from canvas
      const blob = await new Promise<Blob | null>((resolve) => canvas.toBlob(resolve, "image/jpeg", 0.9));
      if (!blob) throw new Error("Could not construct image blob");

      // Upload to /api/upload — graceful fallback: if upload fails we still
      // mark onboarding complete so the user isn't permanently blocked.
      const formData = new FormData();
      formData.append("file", blob, "avatar.jpg");
      formData.append("context", "profile");

      let avatarUrl = "";
      try {
        const uploadRes = await fetch("/api/upload", { method: "POST", body: formData });
        if (uploadRes.ok) {
          const uploadData = await uploadRes.json();
          if (uploadData.success && uploadData.url) {
            avatarUrl = uploadData.url as string;
          }
        }
      } catch {
        // Upload failed — continuing onboarding without avatar; user can update later
        setMessage("Photo couldn't be saved — you can update it from your profile later.");
      }

      // Commit finalized profile data and mark onboarding complete.
      const profileUpdateRes = await fetch("/api/profile/update", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({
          ...(avatarUrl ? { avatarUrl } : {}),
          onboardingState: "COMPLETE",
          onboardingStep: "completed",
        }),
      });

      if (profileUpdateRes.ok) {
        // Hard redirect to canonical hub — forces browser to re-read the
        // tmi_onboarding_state=complete cookie set by the profile update.
        window.location.href = "/hub/performer";
      } else {
        throw new Error("Failed to save profile. Please try again.");
      }

    } catch (err: any) {
      console.error(err);
      setMessage(err.message || "Failed to finalize profile photo. Please try again.");
    } finally {
      setBusy(false);
    }
  };

  if (loading) {
    return (
      <div style={{ minHeight: "100vh", background: "#050510", display: "flex", alignItems: "center", justifyContent: "center" }}>
        <span style={{ color: "#FF2DAA", fontSize: 13, letterSpacing: 4, fontWeight: 700 }}>LOADING STAGE...</span>
      </div>
    );
  }

  // Styles
  const inputStyle: React.CSSProperties = {
    width: "100%",
    padding: "12px 16px",
    background: "rgba(255,255,255,0.03)",
    border: "1px solid rgba(255,45,170,0.15)",
    borderRadius: 8,
    color: "#fff",
    fontSize: 14,
    boxSizing: "border-box",
    outline: "none",
    transition: "border-color 0.2s",
  };

  const labelStyle: React.CSSProperties = {
    display: "block",
    fontSize: 10,
    fontWeight: 950,
    letterSpacing: "0.15em",
    marginBottom: 8,
    color: "#FF2DAA",
    textTransform: "uppercase",
  };

  const buttonStyle: React.CSSProperties = {
    padding: "14px 28px",
    background: "linear-gradient(135deg, #FF2DAA, #AA2DFF)",
    color: "#fff",
    border: "none",
    borderRadius: 8,
    fontSize: 13,
    fontWeight: 900,
    letterSpacing: "0.08em",
    textTransform: "uppercase",
    cursor: busy ? "not-allowed" : "pointer",
    opacity: busy ? 0.7 : 1,
    boxShadow: "0 0 15px rgba(255,45,170,0.3)",
  };

  // Form renders based on steps
  let formContent: React.ReactNode = null;

  if (step === "2") {
    formContent = (
      <>
        <div>
          <div style={{ fontSize: 9, letterSpacing: "0.25em", color: "#FF2DAA", fontWeight: 800, marginBottom: 4 }}>STEP 2 OF 4</div>
          <h2 style={{ fontSize: 22, fontWeight: 900, margin: "0 0 6px" }}>Artist Details</h2>
          <p style={{ fontSize: 12, color: "rgba(255,255,255,0.45)", margin: "0 0 24px" }}>
            Fill in your artistic profile. Your details auto-save instantly.
          </p>
        </div>

        <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
          <div>
            <label htmlFor="artist-name" style={labelStyle}>Artist Stage Name</label>
            <input
              id="artist-name"
              type="text"
              value={artistName}
              onChange={(e) => setArtistName(e.target.value)}
              onBlur={() => void handleAutoSaveField("artistName", artistName)}
              placeholder="e.g. Marcel Beats"
              style={inputStyle}
            />
          </div>

          <div>
            <label htmlFor="short-bio" style={labelStyle}>Artistic Bio</label>
            <textarea
              id="short-bio"
              value={shortBio}
              onChange={(e) => setShortBio(e.target.value)}
              onBlur={() => void handleAutoSaveField("bio", shortBio)}
              placeholder="Describe your sound and what inspires you..."
              rows={3}
              style={{ ...inputStyle, resize: "vertical", lineHeight: 1.5 }}
            />
          </div>

          <div>
            <label htmlFor="genres" style={labelStyle}>Primary Genres (comma-separated)</label>
            <input
              id="genres"
              type="text"
              value={genres}
              onChange={(e) => setGenres(e.target.value)}
              onBlur={() => void handleAutoSaveField("genres", genres)}
              placeholder="e.g. Synthwave, Lofi, EDM"
              style={inputStyle}
            />
          </div>

          <div>
            <label htmlFor="city" style={labelStyle}>Hometown / City</label>
            <input
              id="city"
              type="text"
              value={city}
              onChange={(e) => setCity(e.target.value)}
              onBlur={() => void handleAutoSaveField("city", city)}
              placeholder="e.g. Los Angeles, CA"
              style={inputStyle}
            />
          </div>
        </div>

        <div style={{ marginTop: 24, display: "flex", justifyContent: "flex-end" }}>
          <button
            type="button"
            onClick={() => void handleNextStep("3")}
            disabled={busy || !artistName}
            style={buttonStyle}
          >
            Choose Profile Photo →
          </button>
        </div>
      </>
    );
  } else if (step === "3") {
    formContent = (
      <>
        <div>
          <div style={{ fontSize: 9, letterSpacing: "0.25em", color: "#FF2DAA", fontWeight: 800, marginBottom: 4 }}>STEP 3 OF 4</div>
          <h2 style={{ fontSize: 22, fontWeight: 900, margin: "0 0 6px" }}>Choose Profile Photo</h2>
          <p style={{ fontSize: 12, color: "rgba(255,255,255,0.45)", margin: "0 0 24px" }}>
            Snap a fresh picture using your camera or upload a file.
          </p>
        </div>

        <div style={{ display: "flex", flexDirection: "column", gap: 20, alignItems: "center" }}>
          {cameraActive ? (
            <div style={{ width: "100%", maxWidth: 360, display: "flex", flexDirection: "column", gap: 12, alignItems: "center" }}>
              <div style={{ width: 280, height: 280, borderRadius: "50%", overflow: "hidden", border: "2px solid #FF2DAA", boxShadow: "0 0 30px rgba(255,45,170,0.4)", position: "relative" }}>
                <video
                  ref={videoRef}
                  autoPlay
                  playsInline
                  style={{ width: "100%", height: "100%", objectFit: "cover", transform: "scaleX(-1)" }}
                />
              </div>
              {/* Duration selector */}
              <div style={{ display: "flex", gap: 6, marginBottom: 8 }}>
                {([2, 4, 6] as const).map((dur) => (
                  <button
                    key={dur}
                    type="button"
                    onClick={() => setMotionDuration(dur)}
                    style={{
                      padding: "4px 8px",
                      borderRadius: 6,
                      fontSize: 10,
                      fontWeight: 800,
                      border: motionDuration === dur ? "1px solid #FF2DAA" : "1px solid rgba(255,255,255,0.2)",
                      background: motionDuration === dur ? "rgba(255,45,170,0.2)" : "rgba(0,0,0,0.4)",
                      color: motionDuration === dur ? "#FF2DAA" : "#fff",
                      cursor: "pointer",
                    }}
                  >
                    {dur === 6 ? "💎 6s DRAFT" : dur === 4 ? "⭐ 4s CALL-OFF" : "⚡ 2s SNAP"}
                  </button>
                ))}
              </div>

              {isRecordingMotion && (
                <div style={{ width: "100%", height: 6, borderRadius: 3, background: "rgba(255,255,255,0.1)", overflow: "hidden", marginBottom: 8 }}>
                  <div style={{ height: "100%", width: `${recordingProgress}%`, background: "linear-gradient(90deg,#FF2DAA,#00FFFF)", transition: "width 0.1s linear" }} />
                </div>
              )}

              <div style={{ display: "flex", gap: 8, flexWrap: "wrap", justifyContent: "center" }}>
                <button
                  type="button"
                  onClick={snapMotionPhoto}
                  disabled={isRecordingMotion}
                  style={{ ...buttonStyle, background: "linear-gradient(135deg,#FF2DAA,#AA2DFF)", fontSize: 11 }}
                >
                  {isRecordingMotion ? `🔴 RECORDING ${motionDuration}s...` : `🎥 LIVE MOTION (${motionDuration}s)`}
                </button>
                <button
                  type="button"
                  onClick={snapPhoto}
                  disabled={isRecordingMotion}
                  style={{ ...buttonStyle, background: "rgba(255,255,255,0.1)", boxShadow: "none", fontSize: 11 }}
                >
                  📸 SNAP STILL
                </button>
                <button
                  type="button"
                  onClick={stopCamera}
                  style={{ ...buttonStyle, background: "rgba(255,255,255,0.05)", boxShadow: "none", fontSize: 11 }}
                >
                  Cancel
                </button>
              </div>
            </div>
          ) : (
            <div style={{ display: "flex", flexDirection: "column", gap: 14, width: "100%", maxWidth: 280 }}>
              <button
                type="button"
                onClick={startCamera}
                style={{ ...buttonStyle, display: "flex", alignItems: "center", justifyContent: "center", gap: 8 }}
              >
                📷 TAKE PICTURE
              </button>
              
              <button
                type="button"
                onClick={() => fileInputRef.current?.click()}
                style={{ ...buttonStyle, background: "rgba(255,45,170,0.15)", border: "1px solid #FF2DAA", boxShadow: "none", display: "flex", alignItems: "center", justifyContent: "center", gap: 8 }}
              >
                🖼 UPLOAD PHOTO
              </button>
              <input
                type="file"
                ref={fileInputRef}
                onChange={handleFileSelect}
                accept="image/png, image/jpeg, image/webp"
                style={{ display: "none" }}
              />
            </div>
          )}

          {message && (
            <p style={{ fontSize: 13, color: "#fbbf24", textAlign: "center", marginTop: 10 }}>{message}</p>
          )}
        </div>

        <div style={{ marginTop: 24, display: "flex", justifyContent: "flex-start" }}>
          <button
            type="button"
            onClick={() => setStep("2")}
            style={{ ...buttonStyle, background: "rgba(255,255,255,0.05)", boxShadow: "none", border: "1px solid rgba(255,255,255,0.15)" }}
          >
            ← Back to Details
          </button>
        </div>
      </>
    );
  } else if (step === "4") {
    formContent = (
      <>
        <div>
          <div style={{ fontSize: 9, letterSpacing: "0.25em", color: "#FF2DAA", fontWeight: 800, marginBottom: 4 }}>STEP 4 OF 4</div>
          <h2 style={{ fontSize: 22, fontWeight: 900, margin: "0 0 6px" }}>Your Performer Profile Photo</h2>
          <p style={{ fontSize: 12, color: "rgba(255,255,255,0.45)", margin: "0 0 24px" }}>
            This is the photo fans see on your performer profile, in search, and on the rankings. Adjust cropping, rotation, and brightness.
          </p>
        </div>

        <div style={{ display: "flex", flexDirection: "column", gap: 20, alignItems: "center" }}>
          {/* Crop Container */}
          <div style={{ width: 260, height: 260, borderRadius: "50%", overflow: "hidden", border: "2px solid #FF2DAA", position: "relative", background: "#050510", boxShadow: "0 0 30px rgba(255,45,170,0.3)" }}>
            {imageSrc && (
              // eslint-disable-next-line @next/next/no-img-element
              <img
                src={imageSrc}
                alt="Upload preview"
                style={{
                  width: "100%",
                  height: "100%",
                  objectFit: "cover",
                  transform: `scale(${zoom}) rotate(${rotate}deg)`,
                  filter: `brightness(${brightness}%)`,
                  transition: "transform 0.1s ease-out",
                }}
              />
            )}
          </div>

          {/* Controls Sliders */}
          <div style={{ width: "100%", maxWidth: 360, display: "flex", flexDirection: "column", gap: 14 }}>
            <div>
              <div style={{ display: "flex", justifyContent: "space-between", fontSize: 11, marginBottom: 4, fontWeight: 700, color: "rgba(255,255,255,0.6)" }}>
                <span>ZOOM</span>
                <span>{zoom.toFixed(1)}x</span>
              </div>
              <input
                type="range"
                min="1"
                max="3"
                step="0.1"
                value={zoom}
                onChange={(e) => setZoom(parseFloat(e.target.value))}
                style={{ width: "100%", accentColor: "#FF2DAA" }}
              />
            </div>

            <div>
              <div style={{ display: "flex", justifyContent: "space-between", fontSize: 11, marginBottom: 4, fontWeight: 700, color: "rgba(255,255,255,0.6)" }}>
                <span>ROTATE</span>
                <span>{rotate}°</span>
              </div>
              <input
                type="range"
                min="0"
                max="360"
                step="1"
                value={rotate}
                onChange={(e) => setRotate(parseInt(e.target.value))}
                style={{ width: "100%", accentColor: "#FF2DAA" }}
              />
            </div>

            <div>
              <div style={{ display: "flex", justifyContent: "space-between", fontSize: 11, marginBottom: 4, fontWeight: 700, color: "rgba(255,255,255,0.6)" }}>
                <span>BRIGHTNESS</span>
                <span>{brightness}%</span>
              </div>
              <input
                type="range"
                min="50"
                max="150"
                step="1"
                value={brightness}
                onChange={(e) => setBrightness(parseInt(e.target.value))}
                style={{ width: "100%", accentColor: "#FF2DAA" }}
              />
            </div>
          </div>

          {message && (
            <p style={{ fontSize: 13, color: "#fbbf24", textAlign: "center" }}>{message}</p>
          )}
        </div>

        <div style={{ marginTop: 24, display: "flex", justifyContent: "space-between" }}>
          <button
            type="button"
            onClick={() => setStep("3")}
            style={{ ...buttonStyle, background: "rgba(255,255,255,0.05)", boxShadow: "none", border: "1px solid rgba(255,255,255,0.15)" }}
          >
            ← Back
          </button>
          
          <button
            type="button"
            onClick={handleSavePhotoAndFinish}
            disabled={busy}
            style={buttonStyle}
          >
            {busy ? "FINALIZING..." : "Save & Complete!"}
          </button>
        </div>
      </>
    );
  }

  return (
    <>
      <canvas ref={canvasRef} style={{ display: "none" }} />
      <OnboardingShell
        role="artist"
        form={<div style={{ display: "flex", flexDirection: "column", gap: 20 }}>{formContent}</div>}
      />
    </>
  );
}

// Hidden canvas helper for image cropping and rendering
export function CropCanvasHelper() {
  return <canvas style={{ display: "none" }} />;
}
