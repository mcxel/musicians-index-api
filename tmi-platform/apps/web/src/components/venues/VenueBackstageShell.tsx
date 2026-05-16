"use client";

type VenueBackstageShellProps = {
  lineup: string[];
  onMoveToStage: (artist: string) => void;
};

export default function VenueBackstageShell({ lineup, onMoveToStage }: VenueBackstageShellProps) {
  return (
    <section style={{ borderRadius: 12, border: "1px solid #5f5a72", background: "#1c1928", padding: 12 }}>
      <h3 style={{ margin: "0 0 8px", color: "#d8d0ef" }}>Venue Backstage Shell</h3>
      <div style={{ display: "grid", gap: 6 }}>
        {lineup.map((artist) => (
          <button
            key={artist}
            onClick={() => onMoveToStage(artist)}
            style={{ borderRadius: 8, border: "1px solid #8b82a8", background: "#312b45", color: "#e8defd", padding: "6px 10px", cursor: "pointer", textAlign: "left" }}
          >
            Move {artist} to stage
          </button>
        ))}
      </div>
    </section>
  );
}
