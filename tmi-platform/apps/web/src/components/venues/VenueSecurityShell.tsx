"use client";

type VenueSecurityShellProps = {
  moderationState: string;
  emergencyShutdown: boolean;
  onModeration: (mode: string) => void;
  onEmergencyToggle: () => void;
};

export default function VenueSecurityShell({
  moderationState,
  emergencyShutdown,
  onModeration,
  onEmergencyToggle,
}: VenueSecurityShellProps) {
  return (
    <section style={{ borderRadius: 12, border: "1px solid #7b4f52", background: "#2b1519", padding: 12 }}>
      <h3 style={{ margin: "0 0 8px", color: "#ffc8ce" }}>Venue Security Shell</h3>
      <p style={{ color: "#f8d7db", fontSize: 12 }}>Moderation: {moderationState}</p>
      <p style={{ color: emergencyShutdown ? "#ff9ea9" : "#f8d7db", fontSize: 12 }}>
        Emergency shutdown: {emergencyShutdown ? "active" : "inactive"}
      </p>
      <div style={{ display: "flex", gap: 8, flexWrap: "wrap", marginTop: 8 }}>
        <button onClick={() => onModeration("clean")} style={{ borderRadius: 8, border: "1px solid #ffa1ab", background: "#63272e", color: "#ffd7dc", padding: "6px 10px", cursor: "pointer" }}>Set Clean</button>
        <button onClick={() => onModeration("warned")} style={{ borderRadius: 8, border: "1px solid #ffa1ab", background: "#63272e", color: "#ffd7dc", padding: "6px 10px", cursor: "pointer" }}>Set Warned</button>
        <button onClick={onEmergencyToggle} style={{ borderRadius: 8, border: "1px solid #ff8d98", background: emergencyShutdown ? "#7a1e2c" : "#5e2730", color: "#ffd2d8", padding: "6px 10px", cursor: "pointer" }}>
          {emergencyShutdown ? "Disable Shutdown" : "Enable Shutdown"}
        </button>
      </div>
    </section>
  );
}
