import type { Metadata } from "next";
import { issueTicket, getTicketsByEvent } from "@/lib/ticketing/TicketOwnershipEngine";
import { checkIn, getEventCheckIns, getEventCheckInCount } from "@/lib/ticketing/TicketCheckInEngine";

export const metadata: Metadata = { title: "Admin: Ticket Scanner | TMI" };

const STATUS_C: Record<string, string> = { "checked-in": "#00FF88", "already-used": "#FF2DAA", invalid: "#FFD700", denied: "#FF2DAA", "not-checked-in": "#555" };

const EVENT_ID = "neon-vibe-show";

function seedTicketData() {
  const seeds = [
    { id: "TMI-0291-A", owner: "krypt_rider", tier: "vip" as const },
    { id: "TMI-0288-B", owner: "fan_xyz_421", tier: "general" as const },
    { id: "TMI-0305-A", owner: "mega_fan_007", tier: "vip" as const },
  ];
  const existingTickets = getTicketsByEvent(EVENT_ID);
  if (existingTickets.length === 0) {
    for (const s of seeds) {
      const t = issueTicket(s.owner, EVENT_ID, s.tier);
      checkIn(t.ticketId, s.owner, "qr");
    }
  }
}

export default function AdminTicketScannerPage() {
  seedTicketData();
  const checkIns = getEventCheckIns(EVENT_ID);
  const validCount = getEventCheckInCount(EVENT_ID);
  const issues = checkIns.filter(c => c.status !== "checked-in").length;

  return (
    <main style={{ minHeight: "100vh", background: "#050510", color: "#fff", padding: "32px 24px 80px" }}>
      <div style={{ maxWidth: 1200, margin: "0 auto" }}>
        <div style={{ marginBottom: 32 }}>
          <div style={{ fontSize: 9, color: "#00FFFF", fontWeight: 800, letterSpacing: "0.2em", marginBottom: 6 }}>ADMIN</div>
          <h1 style={{ fontSize: 24, fontWeight: 900 }}>Ticket Scanner</h1>
          <p style={{ fontSize: 12, color: "rgba(255,255,255,0.4)", marginTop: 6 }}>QR scan log and door control for live events.</p>
        </div>

        <div style={{ display: "grid", gridTemplateColumns: "repeat(4,1fr)", gap: 12, marginBottom: 32 }}>
          {[
            { l: "SCANNED", v: checkIns.length, c: "#00FFFF" },
            { l: "VALID", v: validCount, c: "#00FF88" },
            { l: "ISSUES", v: issues, c: "#FF2DAA" },
            { l: "ACTIVE EVENTS", v: 1, c: "#FFD700" },
          ].map(s => (
            <div key={s.l} style={{ background: "rgba(255,255,255,0.02)", border: `1px solid ${s.c}18`, borderRadius: 10, padding: "14px 16px" }}>
              <div style={{ fontSize: 9, color: s.c, fontWeight: 800, marginBottom: 4 }}>{s.l}</div>
              <div style={{ fontSize: 22, fontWeight: 900 }}>{s.v}</div>
            </div>
          ))}
        </div>

        <div style={{ background: "rgba(0,255,255,0.03)", border: "1px solid rgba(0,255,255,0.12)", borderRadius: 12, padding: "20px 24px", marginBottom: 32 }}>
          <div style={{ fontSize: 9, color: "#00FFFF", fontWeight: 800, letterSpacing: "0.12em", marginBottom: 12 }}>SCAN TICKET</div>
          <div style={{ display: "flex", gap: 12, alignItems: "center" }}>
            <div style={{ flex: 1, padding: "10px 14px", background: "rgba(255,255,255,0.04)", border: "1px solid rgba(255,255,255,0.1)", borderRadius: 8, fontSize: 12, color: "rgba(255,255,255,0.4)" }}>
              Point camera or enter ticket ID manually...
            </div>
            <button style={{ padding: "10px 20px", fontSize: 10, fontWeight: 800, color: "#050510", background: "#00FFFF", border: "none", borderRadius: 8, cursor: "pointer" }}>SCAN</button>
          </div>
        </div>

        <div style={{ fontSize: 9, color: "rgba(255,255,255,0.3)", fontWeight: 800, letterSpacing: "0.15em", marginBottom: 14 }}>RECENT SCAN LOG</div>
        <table style={{ width: "100%", borderCollapse: "collapse", fontSize: 12 }}>
          <thead>
            <tr style={{ borderBottom: "1px solid rgba(255,255,255,0.08)" }}>
              {["TICKET ID", "HOLDER", "EVENT", "SECTION", "SCANNED AT", "STATUS"].map(h => (
                <th key={h} style={{ textAlign: "left", padding: "10px 12px", fontSize: 8, color: "rgba(255,255,255,0.3)", fontWeight: 800 }}>{h}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {checkIns.map(s => (
              <tr key={s.checkInId} style={{ borderBottom: "1px solid rgba(255,255,255,0.04)" }}>
                <td style={{ padding: "14px 12px", fontFamily: "monospace", fontSize: 10, color: "rgba(255,255,255,0.5)" }}>{s.ticketId}</td>
                <td style={{ padding: "14px 12px", fontWeight: 700 }}>{s.userId}</td>
                <td style={{ padding: "14px 12px", color: "rgba(255,255,255,0.5)" }}>{EVENT_ID}</td>
                <td style={{ padding: "14px 12px", color: "rgba(255,255,255,0.4)", fontSize: 10 }}>{s.method}</td>
                <td style={{ padding: "14px 12px", color: "rgba(255,255,255,0.4)", fontSize: 10 }}>{s.checkedInAt.slice(0, 16).replace("T", " ")}</td>
                <td style={{ padding: "14px 12px" }}>
                  <span style={{ fontSize: 8, fontWeight: 800, color: STATUS_C[s.status] ?? "#fff", border: `1px solid ${STATUS_C[s.status] ?? "#fff"}40`, borderRadius: 4, padding: "3px 7px" }}>{s.status}</span>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </main>
  );
}
