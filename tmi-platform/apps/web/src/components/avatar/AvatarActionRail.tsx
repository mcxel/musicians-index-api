"use client";

type AvatarActionRailProps = {
  pose: string;
  onPoseChange: (pose: string) => void;
  onRandomize: () => void;
  onReset: () => void;
};

const poses = ["Idle", "Wave", "Mic Up", "Dance", "Champion"];

export default function AvatarActionRail({
  pose,
  onPoseChange,
  onRandomize,
  onReset,
}: AvatarActionRailProps) {
  return (
    <section style={{ background: "#120a1f", border: "1px solid #3f1f62", borderRadius: 14, padding: 16 }}>
      <h3 style={{ color: "#e6d4ff", fontSize: 13, letterSpacing: 1, marginTop: 0 }}>Action Rail</h3>
      <div style={{ display: "flex", gap: 8, flexWrap: "wrap", marginBottom: 10 }}>
        {poses.map((nextPose) => (
          <button
            key={nextPose}
            onClick={() => onPoseChange(nextPose)}
            style={{
              borderRadius: 18,
              border: pose === nextPose ? "1px solid #7dffde" : "1px solid #4c2d70",
              background: pose === nextPose ? "#194635" : "#1a1029",
              color: pose === nextPose ? "#7dffde" : "#d8f7ef",
              fontSize: 12,
              padding: "6px 10px",
              cursor: "pointer",
            }}
          >
            {nextPose}
          </button>
        ))}
      </div>
      <div style={{ display: "flex", gap: 8 }}>
        <button
          onClick={onRandomize}
          style={{
            borderRadius: 10,
            border: "1px solid #4f6d91",
            background: "#1d314b",
            color: "#b4d8ff",
            fontSize: 12,
            padding: "8px 10px",
            cursor: "pointer",
          }}
        >
          Randomize
        </button>
        <button
          onClick={onReset}
          style={{
            borderRadius: 10,
            border: "1px solid #773750",
            background: "#3b1529",
            color: "#ffbad2",
            fontSize: 12,
            padding: "8px 10px",
            cursor: "pointer",
          }}
        >
          Reset
        </button>
      </div>
    </section>
  );
}
