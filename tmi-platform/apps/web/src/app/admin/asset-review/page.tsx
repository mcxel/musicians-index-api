"use client";
import { useState, useEffect } from "react";
import Link from "next/link";

type AssetStatus = 'PENDING' | 'FLAGGED' | 'REVIEW' | 'APPROVED' | 'REJECTED';
type Asset = { id: string; creator: string; asset: string; type: string; source: string; flags: number; status: AssetStatus; size: string };

const STATUS_C: Record<string, string> = { PENDING: "#FFD700", FLAGGED: "#FF2DAA", REVIEW: "#AA2DFF", APPROVED: "#00FF88", REJECTED: "#FF2DAA" };
const SOURCE_C: Record<string, string> = { BOT_GENERATED: "#AA2DFF", CREATOR_UPLOAD: "#00FFFF" };

export default function AdminAssetReviewPage() {
  const [queue, setQueue] = useState<Asset[]>([]);
  const [busy, setBusy] = useState<string | null>(null);
  const [msg, setMsg] = useState("");

  useEffect(() => {
    fetch("/api/admin/asset-review")
      .then(r => r.json())
      .then((data: Asset[]) => { if (Array.isArray(data)) setQueue(data); })
      .catch(() => {});
  }, []);

  const pending = queue.filter(a => a.status === "PENDING").length;
  const flagged = queue.filter(a => a.status === "FLAGGED" || a.flags > 0).length;

  async function act(id: string, action: "approve" | "reject") {
    setBusy(id);
    setMsg("");
    try {
      const res = await fetch("/api/admin/asset-review", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id, action }),
      });
      const data = await res.json() as { ok?: boolean; item?: Asset };
      if (data.ok && data.item) {
        setQueue(q => q.map(a => a.id === id ? { ...a, status: data.item!.status } : a));
        setMsg(`${action === "approve" ? "Approved" : "Rejected"}: ${queue.find(a => a.id === id)?.asset}`);
      }
    } catch {
      setMsg("Action failed.");
    } finally {
      setBusy(null);
    }
  }

  return (
    <main style={{ minHeight: "100vh", background: "#050510", color: "#fff", padding: "32px 24px 80px" }}>
      <div style={{ maxWidth: 1200, margin: "0 auto" }}>
        <div style={{ marginBottom: 16 }}>
          <Link href="/admin" style={{ fontSize: 11, color: "rgba(255,255,255,0.4)", textDecoration: "none" }}>← Admin</Link>
        </div>
        <div style={{ marginBottom: 32 }}>
          <div style={{ fontSize: 9, color: "#AA2DFF", fontWeight: 800, letterSpacing: "0.2em", marginBottom: 6 }}>ADMIN</div>
          <h1 style={{ fontSize: 24, fontWeight: 900 }}>Asset Review Queue</h1>
          <p style={{ fontSize: 12, color: "rgba(255,255,255,0.4)", marginTop: 6 }}>Bot-generated and creator-uploaded assets awaiting approval before going live.</p>
        </div>
        {msg && <div style={{ marginBottom: 16, padding: "10px 14px", background: "rgba(0,255,136,0.08)", border: "1px solid rgba(0,255,136,0.2)", borderRadius: 8, fontSize: 12, color: "#00FF88" }}>{msg}</div>}
        <div style={{ display: "grid", gridTemplateColumns: "repeat(4,1fr)", gap: 12, marginBottom: 32 }}>
          {[{ l: "IN QUEUE", v: queue.length, c: "#00FFFF" }, { l: "PENDING", v: pending, c: "#FFD700" }, { l: "FLAGGED", v: flagged, c: "#FF2DAA" }, { l: "APPROVED TODAY", v: queue.filter(a => a.status === "APPROVED").length, c: "#00FF88" }].map(s => (
            <div key={s.l} style={{ background: "rgba(255,255,255,0.02)", border: `1px solid ${s.c}18`, borderRadius: 10, padding: "14px 16px" }}>
              <div style={{ fontSize: 9, color: s.c, fontWeight: 800, marginBottom: 4 }}>{s.l}</div>
              <div style={{ fontSize: 22, fontWeight: 900 }}>{s.v}</div>
            </div>
          ))}
        </div>
        <table style={{ width: "100%", borderCollapse: "collapse", fontSize: 12 }}>
          <thead>
            <tr style={{ borderBottom: "1px solid rgba(255,255,255,0.08)" }}>
              {["ASSET", "CREATOR", "TYPE", "SOURCE", "FLAGS", "SIZE", "STATUS", "ACTIONS"].map(h => (
                <th key={h} style={{ textAlign: "left", padding: "10px 12px", fontSize: 8, color: "rgba(255,255,255,0.3)", fontWeight: 800 }}>{h}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {queue.map(a => (
              <tr key={a.id} style={{ borderBottom: "1px solid rgba(255,255,255,0.04)" }}>
                <td style={{ padding: "14px 12px", fontWeight: 700 }}>{a.asset}</td>
                <td style={{ padding: "14px 12px", color: "rgba(255,255,255,0.5)" }}>{a.creator}</td>
                <td style={{ padding: "14px 12px", color: "rgba(255,255,255,0.4)", fontSize: 10 }}>{a.type}</td>
                <td style={{ padding: "14px 12px" }}>
                  <span style={{ fontSize: 8, fontWeight: 800, color: SOURCE_C[a.source] ?? "#fff", border: `1px solid ${SOURCE_C[a.source] ?? "#fff"}40`, borderRadius: 4, padding: "3px 7px" }}>{a.source.replace("_", " ")}</span>
                </td>
                <td style={{ padding: "14px 12px", color: a.flags > 0 ? "#FF2DAA" : "rgba(255,255,255,0.3)", fontWeight: a.flags > 0 ? 800 : 400 }}>{a.flags}</td>
                <td style={{ padding: "14px 12px", color: "rgba(255,255,255,0.4)", fontSize: 10 }}>{a.size}</td>
                <td style={{ padding: "14px 12px" }}>
                  <span style={{ fontSize: 8, fontWeight: 800, color: STATUS_C[a.status] ?? "#fff", border: `1px solid ${STATUS_C[a.status] ?? "#fff"}40`, borderRadius: 4, padding: "3px 7px" }}>{a.status}</span>
                </td>
                <td style={{ padding: "14px 12px" }}>
                  <div style={{ display: "flex", gap: 6 }}>
                    {a.status !== "APPROVED" && (
                      <button onClick={() => act(a.id, "approve")} disabled={busy === a.id} style={{ padding: "4px 8px", fontSize: 8, fontWeight: 800, color: "#00FF88", border: "1px solid rgba(0,255,136,0.3)", borderRadius: 4, background: "transparent", cursor: "pointer", opacity: busy === a.id ? 0.5 : 1 }}>APPROVE</button>
                    )}
                    {a.status !== "REJECTED" && (
                      <button onClick={() => act(a.id, "reject")} disabled={busy === a.id} style={{ padding: "4px 8px", fontSize: 8, fontWeight: 800, color: "#FF2DAA", border: "1px solid rgba(255,45,170,0.3)", borderRadius: 4, background: "transparent", cursor: "pointer", opacity: busy === a.id ? 0.5 : 1 }}>REJECT</button>
                    )}
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </main>
  );
}
