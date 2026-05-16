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
}: AvatarPreviewStageProps) {
  return (
    <section
      style={{
        background: "radial-gradient(circle at top, #2e1a4c, #0f0817 72%)",
        border: "1px solid #63428f",
        borderRadius: 18,
        padding: 18,
        minHeight: 360,
      }}
    >
      <h3 style={{ color: "#f5edff", marginTop: 0, fontSize: 16 }}>Avatar Preview Stage</h3>
      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 14 }}>
        <div style={{ borderRadius: 16, border: "1px solid #7e61a5", background: "#170f24", padding: 16 }}>
          <div style={{
            width: 120,
            height: 120,
            borderRadius: "50%",
            margin: "0 auto 10px",
            background: skin,
            border: "3px solid #8f74b9",
          }} />
          <div style={{ color: "#e7d8ff", fontSize: 13, textAlign: "center", fontWeight: 700 }}>
            {profileName || "Unnamed Avatar"}
          </div>
          <div style={{ color: "#cab4eb", fontSize: 11, textAlign: "center", marginTop: 4 }}>
            {pose} pose | {lighting}
          </div>
        </div>
        <div style={{ color: "#ddc8fa", fontSize: 12, lineHeight: 1.5 }}>
          <div>Hair: {hair}</div>
          <div>Eyes: {eyes}</div>
          <div>Outfit: {outfit}</div>
          <div>Prop: {propName}</div>
          <div>Background: {background}</div>
          <div>Accessories: {accessories.length ? accessories.join(", ") : "None"}</div>
        </div>
      </div>
    </section>
  );
}
