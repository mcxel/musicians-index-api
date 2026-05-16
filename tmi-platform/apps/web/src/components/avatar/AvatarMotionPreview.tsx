"use client";

interface AvatarMotionPreviewProps {
  motion: "idle" | "wave" | "pose";
  equipped: number;
}

export default function AvatarMotionPreview({ motion, equipped }: AvatarMotionPreviewProps) {
  const animations: Record<string, string> = {
    idle: "gentle bobbing",
    wave: "enthusiastic gesture",
    pose: "champion stance",
  };

  return (
    <div
      style={{
        borderRadius: 16,
        border: "2px solid #6a4b96",
        background: "#0f0818",
        padding: 16,
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "center",
      }}
    >
      <style>{`
        @keyframes motionFloat {
          0%, 100% { transform: translateY(0px); }
          50% { transform: translateY(-8px); }
        }
        @keyframes motionSpin {
          0% { transform: rotateZ(0deg); }
          100% { transform: rotateZ(360deg); }
        }
        .motion-preview {
          animation: motionFloat 2s ease-in-out infinite;
        }
        .motion-preview.wave {
          animation: motionSpin 0.8s ease-in-out 2;
        }
      `}</style>

      <div style={{ color: "#9f7dd6", fontSize: 11, letterSpacing: 1, textTransform: "uppercase", marginBottom: 12 }}>
        Motion Preview Window
      </div>

      <div
        className="motion-preview"
        style={{
          fontSize: 80,
          marginBottom: 16,
          filter: motion === "wave" ? "brightness(1.2)" : "brightness(0.9)",
        }}
      >
        🤖
      </div>

      <div style={{ color: "#f3eaff", fontSize: 14, fontWeight: 700, marginBottom: 4 }}>
        {motion.charAt(0).toUpperCase() + motion.slice(1)}
      </div>
      <div style={{ color: "#c8b5e5", fontSize: 12, marginBottom: 12, textAlign: "center" }}>
        {animations[motion]}
      </div>

      <div
        style={{
          borderRadius: 8,
          border: "1px solid #6a4b96",
          background: "#1a1029",
          padding: 8,
          fontSize: 11,
          color: "#d3c3ea",
          textAlign: "center",
          width: "100%",
        }}
      >
        Preview {equipped > 0 ? "with active" : "pending"} loadout
      </div>
    </div>
  );
}
