"use client";

type AvatarCustomizerState = {
  bodyHeight: number;
  bodyMass: number;
  skinLabel: string;
  pose: string;
  background: string;
  lighting: string;
  outfit: string;
  propName: string;
  accessories: string[];
};

type HeadToToeCustomizerProps = {
  value: AvatarCustomizerState;
  onChange: (value: AvatarCustomizerState) => void;
};

const SKIN_TONES = ["Porcelain", "Sand", "Warm Olive", "Caramel", "Mahogany", "Ebony"];
const POSES = ["Idle", "Wave", "Point", "Dance", "Perform", "Crowd Hype"];
const BACKGROUNDS = ["Glass Stage", "Studio Alley", "World Dance Party", "Live Room", "Night Club"];
const LIGHTING = ["Neon Cyan", "Fuchsia Pulse", "Gold Spotlight", "Purple Wash"];
const OUTFITS = ["Streetwear", "Performer Fit", "Formal", "Futuristic", "Arena Jersey"];
const PROPS = ["None", "Mic", "Headphones", "Clipboard", "Glow Stick", "Chain"];

export default function HeadToToeCustomizer({ value, onChange }: HeadToToeCustomizerProps) {
  return (
    <section style={{ display: "grid", gap: 12 }}>
      <div style={{ fontSize: 9, fontWeight: 900, letterSpacing: "0.28em", color: "#FF2DAA", textTransform: "uppercase" }}>
        Head To Toe
      </div>

      {[
        { label: "Height", key: "bodyHeight", min: 0, max: 100, suffix: "/ 100" },
        { label: "Build", key: "bodyMass", min: 0, max: 100, suffix: "/ 100" },
      ].map((slider) => (
        <label key={slider.key} style={{ display: "grid", gap: 6, fontSize: 11, color: "rgba(255,255,255,0.75)" }}>
          <span style={{ display: "flex", justifyContent: "space-between" }}>
            <span>{slider.label}</span>
            <span style={{ color: "rgba(255,255,255,0.35)" }}>{(value as never as Record<string, number>)[slider.key]}{slider.suffix}</span>
          </span>
          <input
            type="range"
            min={slider.min}
            max={slider.max}
            value={(value as never as Record<string, number>)[slider.key]}
            onChange={(event) => onChange({ ...value, [slider.key]: Number(event.target.value) })}
          />
        </label>
      ))}

      {[
        { label: "Skin Tone", key: "skinLabel", options: SKIN_TONES },
        { label: "Pose", key: "pose", options: POSES },
        { label: "Background", key: "background", options: BACKGROUNDS },
        { label: "Lighting", key: "lighting", options: LIGHTING },
        { label: "Outfit", key: "outfit", options: OUTFITS },
        { label: "Prop", key: "propName", options: PROPS },
      ].map((field) => (
        <label key={field.key} style={{ display: "grid", gap: 6, fontSize: 11, color: "rgba(255,255,255,0.75)" }}>
          <span>{field.label}</span>
          <select
            value={(value as never as Record<string, string>)[field.key]}
            onChange={(event) => onChange({ ...value, [field.key]: event.target.value })}
            style={{ borderRadius: 10, border: "1px solid rgba(255,255,255,0.12)", background: "rgba(255,255,255,0.04)", color: "#fff", padding: "10px 12px" }}
          >
            {field.options.map((option) => (
              <option key={option} value={option}>
                {option}
              </option>
            ))}
          </select>
        </label>
      ))}

      <label style={{ display: "grid", gap: 6, fontSize: 11, color: "rgba(255,255,255,0.75)" }}>
        <span>Accessories</span>
        <input
          value={value.accessories.join(", ")}
          onChange={(event) => onChange({ ...value, accessories: event.target.value.split(",").map((item) => item.trim()).filter(Boolean) })}
          placeholder="Crown, chain, headphones"
          style={{ borderRadius: 10, border: "1px solid rgba(255,255,255,0.12)", background: "rgba(255,255,255,0.04)", color: "#fff", padding: "10px 12px" }}
        />
      </label>
    </section>
  );
}

export type { AvatarCustomizerState };