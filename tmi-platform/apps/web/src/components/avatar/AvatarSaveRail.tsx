"use client";

export type AvatarSaveRailStatus = "idle" | "saving" | "saved" | "error";

type AvatarSaveRailProps = {
  profileName: string;
  onNameChange: (name: string) => void;
  onSave: () => void;
  status: AvatarSaveRailStatus;
  savedAt: string | null;
  errorMessage: string | null;
};

export default function AvatarSaveRail({
  profileName,
  onNameChange,
  onSave,
  status,
  savedAt,
  errorMessage,
}: AvatarSaveRailProps) {
  const busy = status === "saving";
  return (
    <section
      style={{ background: "#1a1029", border: "1px solid #62408d", borderRadius: 14, padding: 16 }}
      data-testid="avatar-save-rail"
      data-save-status={status}
    >
      <h3 style={{ color: "#e6d4ff", fontSize: 13, letterSpacing: 1, marginTop: 0 }}>Save Rail</h3>
      <input
        value={profileName}
        onChange={(event) => onNameChange(event.target.value)}
        placeholder="Avatar handle"
        disabled={busy}
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
        type="button"
        onClick={onSave}
        disabled={busy}
        data-testid="avatar-save-loadout"
        style={{
          width: "100%",
          borderRadius: 10,
          border: "1px solid #71ffc1",
          background: busy ? "#0d2a1c" : "#124631",
          color: "#b7ffdd",
          padding: "9px 12px",
          fontSize: 12,
          fontWeight: 700,
          cursor: busy ? "wait" : "pointer",
          opacity: busy ? 0.7 : 1,
        }}
      >
        {busy ? "Saving…" : status === "error" ? "Retry Save" : "Save Loadout"}
      </button>
      {status === "saving" ? (
        <div data-testid="avatar-save-status-saving" style={{ color: "#c9b6ff", fontSize: 11, marginTop: 8 }}>
          SAVING — waiting for durable server confirmation
        </div>
      ) : null}
      {status === "saved" && savedAt ? (
        <div data-testid="avatar-save-status-saved" style={{ color: "#9ee7c2", fontSize: 11, marginTop: 8 }}>
          SAVED: {savedAt}
        </div>
      ) : null}
      {status === "error" ? (
        <div data-testid="avatar-save-status-error" style={{ color: "#ff8fab", fontSize: 11, marginTop: 8 }}>
          ERROR: {errorMessage || "Avatar was not durably saved"}
        </div>
      ) : null}
    </section>
  );
}
