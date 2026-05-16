import { ensureSampleBotIdentityFaces } from "@/lib/bots/BotFaceGenerationEngine";
import {
  listBotFaceDuplicates,
  listBotFaceRegistryRecords,
  setBotFaceIdentityStatus,
} from "@/lib/bots/BotFaceRegistry";

export default function AdminBotFacesPage() {
  ensureSampleBotIdentityFaces();
  const faces = listBotFaceRegistryRecords();
  const duplicates = listBotFaceDuplicates();

  for (const record of faces.slice(0, 2)) {
    setBotFaceIdentityStatus(record.botId, "approved");
  }

  return (
    <main style={{ minHeight: "100vh", background: "#050510", color: "#fff", padding: "24px" }}>
      <div style={{ maxWidth: 1100, margin: "0 auto" }}>
        <h1 style={{ margin: 0, fontSize: 28 }}>Bot Faces</h1>
        <p style={{ color: "rgba(255,255,255,0.55)" }}>
          Unique synthetic bot faces with duplicate detection and role metadata.
        </p>

        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit,minmax(180px,1fr))", gap: 10, marginTop: 12 }}>
          {[
            ["Faces", faces.length, "#00FFFF"],
            ["Duplicates", duplicates.length, "#FF2DAA"],
            ["Approved", faces.filter((entry) => entry.status === "approved").length, "#00FF88"],
          ].map(([label, value, color]) => (
            <div key={label as string} style={{ border: "1px solid rgba(255,255,255,0.12)", borderRadius: 10, background: "rgba(255,255,255,0.03)", padding: 12 }}>
              <div style={{ fontSize: 11, color: "rgba(255,255,255,0.45)" }}>{label as string}</div>
              <div style={{ marginTop: 4, fontSize: 24, fontWeight: 800, color: color as string }}>{value as number}</div>
            </div>
          ))}
        </div>

        <div style={{ marginTop: 14, border: "1px solid rgba(255,255,255,0.12)", borderRadius: 10, overflow: "hidden" }}>
          <div style={{ padding: 10, fontSize: 12, background: "rgba(255,255,255,0.05)" }}>Face Registry</div>
          {faces.map((record) => (
            <div key={record.botId} style={{ padding: 10, borderTop: "1px solid rgba(255,255,255,0.08)", display: "grid", gridTemplateColumns: "1.2fr 1fr 1fr 0.8fr", gap: 8 }}>
              <div>{record.metadata.name}</div>
              <div style={{ color: "#9ca3af" }}>{record.role}</div>
              <div style={{ color: "#9ca3af" }}>{record.faceHash}</div>
              <div style={{ color: record.status === "approved" ? "#00FF88" : "#FFD700" }}>{record.status}</div>
            </div>
          ))}
        </div>
      </div>
    </main>
  );
}
