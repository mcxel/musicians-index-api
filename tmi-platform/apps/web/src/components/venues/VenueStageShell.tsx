"use client";

type VenueStageShellProps = {
  hostPosition: string;
  spotlightArtist: string;
  onHostMove: (nextPosition: string) => void;
  onSpotlightSwitch: (artist: string) => void;
};

export default function VenueStageShell({
  hostPosition,
  spotlightArtist,
  onHostMove,
  onSpotlightSwitch,
}: VenueStageShellProps) {
  return (
    <section style={{ borderRadius: 12, border: "1px solid #7d4f8b", background: "#24142a", padding: 12 }}>
      <h3 style={{ margin: "0 0 8px", color: "#f0c7ff" }}>Venue Stage Shell</h3>
      <p style={{ color: "#ebd4f6", fontSize: 12 }}>Host position: {hostPosition}</p>
      <p style={{ color: "#ebd4f6", fontSize: 12 }}>Spotlight artist: {spotlightArtist}</p>
      <div style={{ display: "flex", gap: 8, flexWrap: "wrap", marginTop: 8 }}>
        <button onClick={() => onHostMove("center") } style={{ borderRadius: 8, border: "1px solid #d394ff", background: "#5b2f72", color: "#f4d8ff", padding: "6px 10px", cursor: "pointer" }}>Host Center</button>
        <button onClick={() => onHostMove("left") } style={{ borderRadius: 8, border: "1px solid #d394ff", background: "#5b2f72", color: "#f4d8ff", padding: "6px 10px", cursor: "pointer" }}>Host Left</button>
        <button onClick={() => onHostMove("right") } style={{ borderRadius: 8, border: "1px solid #d394ff", background: "#5b2f72", color: "#f4d8ff", padding: "6px 10px", cursor: "pointer" }}>Host Right</button>
        <button onClick={() => onSpotlightSwitch("MC Charlie")} style={{ borderRadius: 8, border: "1px solid #ffbd85", background: "#6f4020", color: "#ffdfbf", padding: "6px 10px", cursor: "pointer" }}>Spotlight MC Charlie</button>
        <button onClick={() => onSpotlightSwitch("Nova K") } style={{ borderRadius: 8, border: "1px solid #ffbd85", background: "#6f4020", color: "#ffdfbf", padding: "6px 10px", cursor: "pointer" }}>Spotlight Nova K</button>
      </div>
    </section>
  );
}
