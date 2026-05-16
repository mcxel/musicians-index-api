import Link from "next/link";

type LawBubbleTileProps = {
  accent: string;
};

export default function LawBubbleTile({ accent }: LawBubbleTileProps) {
  return (
    <Link
      href="/terms"
      style={{
        textDecoration: "none",
        color: "#fff",
        display: "block",
        borderRadius: 14,
        border: `1px dashed ${accent}60`,
        background: `linear-gradient(150deg, ${accent}15, rgba(255,255,255,0.1), rgba(255,255,255,0.03))`,
        padding: "14px",
      }}
      className="hover-glow"
    >
      <div style={{ fontSize: 8, letterSpacing: "0.2em", fontWeight: 900, textTransform: "uppercase", color: accent, marginBottom: 8 }}>Law Bubble</div>
      <div style={{ fontSize: 13, lineHeight: 1.35, fontWeight: 800, marginBottom: 6 }}>Rights, Samples, and Sync Rules Updated</div>
      <div style={{ fontSize: 10, color: "rgba(255,255,255,0.72)", lineHeight: 1.4 }}>
        Fresh legal notes for independent releases and sponsor placements in this issue cycle.
      </div>
      <div style={{ marginTop: 10, fontSize: 9, color: accent, fontWeight: 800, letterSpacing: "0.12em" }}>READ POLICY →</div>
    </Link>
  );
}
