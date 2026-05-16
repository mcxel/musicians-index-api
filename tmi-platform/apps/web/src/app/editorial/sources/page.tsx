import { sourceValidationEngine } from "@/lib/editorial-economy";

export const metadata = {
  title: "Editorial Sources | TMI",
  description: "Source validation view for editorial trust chain.",
};

export default function EditorialSourcesPage() {
  const valid = sourceValidationEngine.validate(["https://example.com/a", "https://example.com/b"]);
  const invalid = sourceValidationEngine.validate(["ftp://bad-source"]);

  return (
    <main style={{ minHeight: "100vh", background: "#050510", color: "#fff", padding: "72px 20px 28px", display: "grid", gap: 14 }}>
      <h1 style={{ margin: 0 }}>Editorial Sources</h1>
      <div style={{ border: "1px solid rgba(0,255,136,0.4)", borderRadius: 10, padding: 10, background: "rgba(0,255,136,0.08)", fontSize: 12 }}>
        Valid chain result: {String(valid.valid)}
      </div>
      <div style={{ border: "1px solid rgba(255,45,170,0.4)", borderRadius: 10, padding: 10, background: "rgba(255,45,170,0.08)", fontSize: 12 }}>
        Invalid chain result: {String(invalid.valid)} {invalid.reason ? `(${invalid.reason})` : ""}
      </div>
    </main>
  );
}
