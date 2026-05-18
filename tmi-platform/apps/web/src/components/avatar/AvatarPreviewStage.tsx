"use client";

type AvatarPreviewStageProps = {
  profileName: string;
  skin: string;
  hair: string;
  eyes: string;
  outfit: string;
  propName: string;
  background: string;
  lighting: string;
  pose: string;
  accessories: string[];
  bodyHeight?: number; // 0-100
  bodyMass?: number;   // 0-100
};

export default function AvatarPreviewStage({
  profileName,
  skin,
  hair,
  eyes,
  outfit,
  propName,
  background,
  lighting,
  pose,
  accessories,
  bodyHeight = 50,
  bodyMass = 50,
}: AvatarPreviewStageProps) {
  // Map sliders to visual proportions
  const heightScale = 0.7 + (bodyHeight / 100) * 0.6;    // 0.7 → 1.3
  const massScale   = 0.75 + (bodyMass  / 100) * 0.55;   // 0.75 → 1.3
  const headSize    = Math.round(80 + (bodyHeight / 100) * 40); // 80px → 120px

  const heightLabel = bodyHeight < 33 ? "Short" : bodyHeight < 66 ? "Average" : "Tall";
  const massLabel   = bodyMass  < 25 ? "Slim"  : bodyMass  < 50 ? "Athletic" : bodyMass < 75 ? "Average" : "Solid";

  return (
    <section
      style={{
        background: "radial-gradient(circle at top, #2e1a4c, #0f0817 72%)",
        border: "1px solid #63428f",
        borderRadius: 18,
        padding: 18,
        minHeight: 380,
      }}
    >
      <h3 style={{ color: "#f5edff", marginTop: 0, fontSize: 16 }}>Preview</h3>
      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 14 }}>
        {/* Avatar figure */}
        <div style={{ borderRadius: 16, border: "1px solid #7e61a5", background: "#170f24", padding: 16, display: "flex", flexDirection: "column", alignItems: "center", gap: 8 }}>
          {/* Head */}
          <div style={{
            width: headSize,
            height: headSize,
            borderRadius: "50%",
            background: skin,
            border: "3px solid #8f74b9",
            flexShrink: 0,
          }} />
          {/* Body — width = mass, height = height */}
          <div style={{
            width: Math.round(50 * massScale),
            height: Math.round(80 * heightScale),
            borderRadius: 8,
            background: `${skin}99`,
            border: "2px solid #8f74b9",
          }} />
          <div style={{ color: "#e7d8ff", fontSize: 12, textAlign: "center", fontWeight: 700 }}>
            {profileName || "Unnamed"}
          </div>
          <div style={{ color: "#cab4eb", fontSize: 10, textAlign: "center" }}>
            {pose} · {heightLabel} · {massLabel}
          </div>
        </div>
        {/* Stats */}
        <div style={{ color: "#ddc8fa", fontSize: 12, lineHeight: 1.8 }}>
          <div>Hair: {hair}</div>
          <div>Eyes: {eyes}</div>
          <div>Outfit: {outfit}</div>
          <div>Prop: {propName}</div>
          <div>Lighting: {lighting}</div>
          <div>BG: {background}</div>
          <div>Accessories: {accessories.length ? accessories.join(", ") : "None"}</div>
        </div>
      </div>
    </section>
  );
}
