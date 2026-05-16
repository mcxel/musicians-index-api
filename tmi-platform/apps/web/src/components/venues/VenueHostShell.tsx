"use client";

type VenueHostShellProps = {
  hostMode: string;
  onHostMode: (mode: string) => void;
};

export default function VenueHostShell({ hostMode, onHostMode }: VenueHostShellProps) {
  return (
    <section style={{ borderRadius: 12, border: "1px solid #5d4f7a", background: "#20192f", padding: 12 }}>
      <h3 style={{ margin: "0 0 8px", color: "#d9ccff" }}>Venue Host Shell</h3>
      <p style={{ color: "#e5dafc", fontSize: 12 }}>Host mode: {hostMode}</p>
      <div style={{ display: "flex", gap: 8, flexWrap: "wrap", marginTop: 8 }}>
        <button onClick={() => onHostMode("intro")} style={{ borderRadius: 8, border: "1px solid #a595d0", background: "#3e3061", color: "#e9ddff", padding: "6px 10px", cursor: "pointer" }}>Intro</button>
        <button onClick={() => onHostMode("battle")} style={{ borderRadius: 8, border: "1px solid #a595d0", background: "#3e3061", color: "#e9ddff", padding: "6px 10px", cursor: "pointer" }}>Battle</button>
        <button onClick={() => onHostMode("winner-announcement")} style={{ borderRadius: 8, border: "1px solid #a595d0", background: "#3e3061", color: "#e9ddff", padding: "6px 10px", cursor: "pointer" }}>Winner</button>
      </div>
    </section>
  );
}
