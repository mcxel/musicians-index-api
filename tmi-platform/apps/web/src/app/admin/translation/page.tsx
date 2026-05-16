import type { Metadata } from "next";

export const metadata: Metadata = { title: "Admin: Translation | TMI" };

const LANGUAGES = [
  { code: "en", name: "English", flag: "🇺🇸", coverage: 100, translated: 2840, total: 2840, status: "COMPLETE" },
  { code: "es", name: "Spanish", flag: "🇪🇸", coverage: 78, translated: 2215, total: 2840, status: "IN_PROGRESS" },
  { code: "pt", name: "Portuguese", flag: "🇧🇷", coverage: 61, translated: 1732, total: 2840, status: "IN_PROGRESS" },
  { code: "fr", name: "French", flag: "🇫🇷", coverage: 45, translated: 1278, total: 2840, status: "IN_PROGRESS" },
  { code: "de", name: "German", flag: "🇩🇪", coverage: 22, translated: 625, total: 2840, status: "PARTIAL" },
  { code: "ja", name: "Japanese", flag: "🇯🇵", coverage: 18, translated: 511, total: 2840, status: "PARTIAL" },
  { code: "ko", name: "Korean", flag: "🇰🇷", coverage: 14, translated: 398, total: 2840, status: "PARTIAL" },
  { code: "ar", name: "Arabic", flag: "🇸🇦", coverage: 8, translated: 227, total: 2840, status: "STARTED" },
];

const NAMESPACES = [
  { ns: "common", keys: 320, status: "COMPLETE" },
  { ns: "navigation", keys: 84, status: "COMPLETE" },
  { ns: "battles", keys: 210, status: "IN_PROGRESS" },
  { ns: "cypher", keys: 195, status: "IN_PROGRESS" },
  { ns: "beats", keys: 178, status: "PARTIAL" },
  { ns: "vault", keys: 142, status: "PARTIAL" },
  { ns: "nft", keys: 98, status: "STARTED" },
  { ns: "admin", keys: 412, status: "IN_PROGRESS" },
];

const STATUS_C: Record<string, string> = { COMPLETE: "#00FF88", IN_PROGRESS: "#00FFFF", PARTIAL: "#FFD700", STARTED: "#AA2DFF" };

export default function AdminTranslationPage() {
  return (
    <main style={{ minHeight: "100vh", background: "#050510", color: "#fff", padding: "32px 24px 80px" }}>
      <div style={{ maxWidth: 1200, margin: "0 auto" }}>
        <div style={{ marginBottom: 32 }}>
          <div style={{ fontSize: 9, color: "#AA2DFF", fontWeight: 800, letterSpacing: "0.2em", marginBottom: 6 }}>ADMIN</div>
          <h1 style={{ fontSize: 24, fontWeight: 900 }}>Translation Management</h1>
          <p style={{ fontSize: 12, color: "rgba(255,255,255,0.4)", marginTop: 6 }}>i18n coverage across all supported languages and namespaces.</p>
        </div>

        <div style={{ display: "grid", gridTemplateColumns: "repeat(3,1fr)", gap: 12, marginBottom: 40 }}>
          {[
            { l: "LANGUAGES", v: LANGUAGES.length, c: "#AA2DFF" },
            { l: "TOTAL KEYS", v: "2,840", c: "#00FFFF" },
            { l: "NAMESPACES", v: NAMESPACES.length, c: "#00FF88" },
          ].map(s => (
            <div key={s.l} style={{ background: "rgba(255,255,255,0.02)", border: `1px solid ${s.c}18`, borderRadius: 10, padding: "14px 16px" }}>
              <div style={{ fontSize: 9, color: s.c, fontWeight: 800, marginBottom: 4 }}>{s.l}</div>
              <div style={{ fontSize: 22, fontWeight: 900 }}>{s.v}</div>
            </div>
          ))}
        </div>

        <div style={{ marginBottom: 40 }}>
          <div style={{ fontSize: 9, color: "rgba(255,255,255,0.3)", fontWeight: 800, letterSpacing: "0.15em", marginBottom: 14 }}>LANGUAGE COVERAGE</div>
          <div style={{ display: "grid", gap: 10 }}>
            {LANGUAGES.map(l => (
              <div key={l.code} style={{ background: "rgba(255,255,255,0.02)", border: "1px solid rgba(255,255,255,0.06)", borderRadius: 10, padding: "14px 16px" }}>
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 8 }}>
                  <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                    <span style={{ fontSize: 18 }}>{l.flag}</span>
                    <span style={{ fontWeight: 700, fontSize: 13 }}>{l.name}</span>
                    <span style={{ fontSize: 9, color: "rgba(255,255,255,0.3)" }}>{l.code.toUpperCase()}</span>
                  </div>
                  <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
                    <span style={{ fontSize: 11, color: "rgba(255,255,255,0.4)" }}>{l.translated.toLocaleString()} / {l.total.toLocaleString()}</span>
                    <span style={{ fontSize: 8, fontWeight: 800, color: STATUS_C[l.status] ?? "#fff", border: `1px solid ${STATUS_C[l.status] ?? "#fff"}40`, borderRadius: 4, padding: "3px 7px" }}>{l.status.replace("_", " ")}</span>
                    <span style={{ fontSize: 12, fontWeight: 800, color: l.coverage === 100 ? "#00FF88" : "#fff" }}>{l.coverage}%</span>
                  </div>
                </div>
                <div style={{ height: 4, background: "rgba(255,255,255,0.06)", borderRadius: 2 }}>
                  <div style={{ height: "100%", width: `${l.coverage}%`, background: STATUS_C[l.status] ?? "#fff", borderRadius: 2 }} />
                </div>
              </div>
            ))}
          </div>
        </div>

        <div>
          <div style={{ fontSize: 9, color: "rgba(255,255,255,0.3)", fontWeight: 800, letterSpacing: "0.15em", marginBottom: 14 }}>NAMESPACE STATUS</div>
          <table style={{ width: "100%", borderCollapse: "collapse", fontSize: 12 }}>
            <thead>
              <tr style={{ borderBottom: "1px solid rgba(255,255,255,0.08)" }}>
                {["NAMESPACE", "KEYS", "STATUS"].map(h => (
                  <th key={h} style={{ textAlign: "left", padding: "10px 12px", fontSize: 8, color: "rgba(255,255,255,0.3)", fontWeight: 800 }}>{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {NAMESPACES.map(n => (
                <tr key={n.ns} style={{ borderBottom: "1px solid rgba(255,255,255,0.04)" }}>
                  <td style={{ padding: "12px 12px", fontFamily: "monospace", fontWeight: 700 }}>{n.ns}</td>
                  <td style={{ padding: "12px 12px", color: "rgba(255,255,255,0.5)" }}>{n.keys}</td>
                  <td style={{ padding: "12px 12px" }}>
                    <span style={{ fontSize: 8, fontWeight: 800, color: STATUS_C[n.status] ?? "#fff", border: `1px solid ${STATUS_C[n.status] ?? "#fff"}40`, borderRadius: 4, padding: "3px 7px" }}>{n.status.replace("_", " ")}</span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </main>
  );
}
