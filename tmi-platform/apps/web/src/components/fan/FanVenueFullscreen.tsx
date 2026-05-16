"use client";

import FanMiniHud from "./FanMiniHud";
import FanCrowdPresence from "./FanCrowdPresence";
import type { FanSeat } from "./FanSeatEngine";

type CameraMode = "standard" | "crowd-cam" | "friend-cam" | "performer-focus" | "billboard-mode";

type FanVenueFullscreenProps = {
  seat: FanSeat;
  invitedFriends: string[];
  cameraMode: CameraMode;
  onCameraModeChange: (next: CameraMode) => void;
  onAction: (action: string) => void;
};

const CAMERA_MODES: CameraMode[] = ["standard", "crowd-cam", "friend-cam", "performer-focus", "billboard-mode"];

export default function FanVenueFullscreen({ seat, invitedFriends, cameraMode, onCameraModeChange, onAction }: FanVenueFullscreenProps) {
  return (
    <section style={{ borderRadius: 18, border: "1px solid rgba(255,120,45,0.42)", overflow: "hidden", minHeight: 520, position: "relative", background: "linear-gradient(180deg, #03070f 0%, #050d1b 100%)" }}>
      <div style={{ position: "absolute", inset: 0, background: "radial-gradient(circle at 50% 10%, rgba(255,120,45,0.25), transparent 35%), radial-gradient(circle at 20% 30%, rgba(90,215,255,0.25), transparent 34%)" }} />
      <div style={{ position: "relative", zIndex: 2, padding: 16 }}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 12 }}>
          <strong style={{ color: "#ffca96", letterSpacing: "0.08em", textTransform: "uppercase", fontSize: 12 }}>Fullscreen Venue Feed</strong>
          <div style={{ display: "flex", gap: 6, flexWrap: "wrap" }}>
            {CAMERA_MODES.map((mode) => (
              <button
                key={mode}
                type="button"
                onClick={() => onCameraModeChange(mode)}
                style={{
                  borderRadius: 999,
                  border: `1px solid ${cameraMode === mode ? "rgba(255,120,45,0.72)" : "rgba(90,215,255,0.35)"}`,
                  background: cameraMode === mode ? "rgba(255,120,45,0.15)" : "rgba(8,16,34,0.75)",
                  color: "#d7efff",
                  padding: "5px 10px",
                  fontSize: 10,
                  textTransform: "uppercase",
                  cursor: "pointer",
                }}
              >
                {mode}
              </button>
            ))}
          </div>
        </div>

        <div style={{ borderRadius: 14, border: "1px solid rgba(90,215,255,0.26)", minHeight: 340, padding: 14, background: "rgba(3,9,21,0.65)" }}>
          <p style={{ margin: 0, color: "#d8f3ff", fontSize: 14 }}>Stage, crowd, lighting, and billboards are active in {cameraMode}.</p>
          <p style={{ marginTop: 8, color: "#a7d8ff", fontSize: 12 }}>Fan avatar is now a seat entity in the audience simulation.</p>
          <FanCrowdPresence seat={seat} invitedFriends={invitedFriends} />
        </div>
      </div>
      <FanMiniHud onAction={onAction} />
    </section>
  );
}
