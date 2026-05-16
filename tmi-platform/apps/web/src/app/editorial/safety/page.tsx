import { contentSafetyEngine } from "@/lib/editorial-economy";

export const metadata = {
  title: "Editorial Safety | TMI",
  description: "Safety and moderation checks for editorial submissions.",
};

export default function EditorialSafetyPage() {
  const safe = contentSafetyEngine.validate({
    title: "Artist Recap",
    body: "A verified recap with source-backed metrics, event context, and artist conversion analysis for this ranking cycle.",
  });

  const blocked = contentSafetyEngine.validate({
    title: "Spam",
    body: "Click here for free money now.",
  });

  return (
    <main style={{ minHeight: "100vh", background: "#050510", color: "#fff", padding: "72px 20px 28px", display: "grid", gap: 14 }}>
      <h1 style={{ margin: 0 }}>Editorial Safety</h1>
      <div style={{ border: "1px solid rgba(0,255,255,0.4)", borderRadius: 10, padding: 10, background: "rgba(0,255,255,0.08)", fontSize: 12 }}>
        Safe test: {String(safe.safe)}
      </div>
      <div style={{ border: "1px solid rgba(255,45,170,0.4)", borderRadius: 10, padding: 10, background: "rgba(255,45,170,0.08)", fontSize: 12 }}>
        Block test: {String(blocked.safe)} {blocked.reason ? `(${blocked.reason})` : ""}
      </div>
    </main>
  );
}
