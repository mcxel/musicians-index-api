"use client";

type AvatarSaveRailProps = {
  profileName: string;
  onNameChange: (name: string) => void;
  onSave: () => void;
  savedAt: string | null;
};

export default function AvatarSaveRail({
  profileName,
  onNameChange,
  onSave,
  savedAt,
}: AvatarSaveRailProps) {
  return (
    <section style={{ background: "#1a1029", border: "1px solid #62408d", borderRadius: 14, padding: 16 }}>
      <h3 style={{ color: "#e6d4ff", fontSize: 13, letterSpacing: 1, marginTop: 0 }}>Save Rail</h3>
      <input
        value={profileName}
        onChange={(event) => onNameChange(event.target.value)}
        placeholder="Avatar handle"
        style={{
          width: "100%",
          borderRadius: 10,
          border: "1px solid #5b417a",
          background: "#0f0919",
          color: "#f2e8ff",
          padding: "8px 10px",
          marginBottom: 10,
        }}
      />
      <button
        onClick={onSave}
        style={{
          width: "100%",
          borderRadius: 10,
          border: "1px solid #71ffc1",
          background: "#124631",
          color: "#b7ffdd",
          padding: "9px 12px",
          fontSize: 12,
          fontWeight: 700,
          cursor: "pointer",
        }}
      >
        Save Loadout
      </button>
      {savedAt ? <div style={{ color: "#9ee7c2", fontSize: 11, marginTop: 8 }}>Synced: {savedAt}</div> : null}
    </section>
  );
}
