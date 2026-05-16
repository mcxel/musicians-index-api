"use client";

type AvatarEyeSelectorProps = {
  eyeOptions: string[];
  selectedEye: string;
  onSelect: (eye: string) => void;
};

export default function AvatarEyeSelector({
  eyeOptions,
  selectedEye,
  onSelect,
}: AvatarEyeSelectorProps) {
  return (
    <section style={{ background: "#120a1f", border: "1px solid #3f1f62", borderRadius: 14, padding: 16 }}>
      <h3 style={{ color: "#e6d4ff", fontSize: 13, letterSpacing: 1, marginTop: 0 }}>Eye Selector</h3>
      <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
        {eyeOptions.map((eye) => (
          <button
            key={eye}
            onClick={() => onSelect(eye)}
            style={{
              borderRadius: 14,
              border: selectedEye === eye ? "1px solid #4effff" : "1px solid #4c2d70",
              background: selectedEye === eye ? "#173c4f" : "#1a1029",
              color: "#dbf8ff",
              fontSize: 12,
              padding: "4px 10px",
              cursor: "pointer",
            }}
          >
            {eye}
          </button>
        ))}
      </div>
    </section>
  );
}
