"use client";
import { useState, useEffect } from "react";
import Link from "next/link";

type ApprovalStatus = 'pending' | 'review' | 'approved' | 'rejected';
type Approval = { id: string; type: string; name: string; submitted: string; status: ApprovalStatus };

const ST_COLOR: Record<string, string> = { pending: "#FFD700", review: "#00FFFF", approved: "#22c55e", rejected: "#ef4444" };

export default function AdminApprovalsPage() {
  const [queue, setQueue] = useState<Approval[]>([]);
  const [busy, setBusy] = useState<string | null>(null);
  const [msg, setMsg] = useState("");

  useEffect(() => {
    fetch("/api/admin/approvals")
      .then(r => r.json())
      .then((data: Approval[]) => { if (Array.isArray(data)) setQueue(data); })
      .catch(() => {});
  }, []);

  async function act(id: string, action: "approve" | "reject") {
    setBusy(id);
    setMsg("");
    try {
      const res = await fetch("/api/admin/approvals", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id, action }),
      });
      const data = await res.json() as { ok?: boolean; item?: Approval };
      if (data.ok && data.item) {
        setQueue(q => q.map(a => a.id === id ? { ...a, status: data.item!.status } : a));
        setMsg(`${action === "approve" ? "Approved" : "Rejected"}: ${queue.find(a => a.id === id)?.name}`);
      }
    } catch {
      setMsg("Action failed.");
    } finally {
      setBusy(null);
    }
  }

  return (
    <main style={{ minHeight: "100vh", background: "#05060c", color: "#fff", padding: "32px 24px 80px", fontFamily: "'Inter', sans-serif" }}>
      <div style={{ maxWidth: 1000, margin: "0 auto" }}>
        <div style={{ marginBottom: 28 }}>
          <Link href="/admin" style={{ fontSize: 11, color: "rgba(255,255,255,0.4)", textDecoration: "none" }}>← Admin</Link>
        </div>
        <div style={{ fontSize: 10, letterSpacing: 5, color: "#FFD700", fontWeight: 800, marginBottom: 4 }}>ADMIN · APPROVALS</div>
        <h1 style={{ fontSize: "clamp(22px,4vw,36px)", fontWeight: 900, margin: "0 0 20px" }}>Approval Queue</h1>
        {msg && <div style={{ marginBottom: 16, padding: "10px 14px", background: "rgba(0,255,136,0.08)", border: "1px solid rgba(0,255,136,0.2)", borderRadius: 8, fontSize: 12, color: "#00FF88" }}>{msg}</div>}
        <div style={{ display: "grid", gap: 12 }}>
          {queue.map((a) => (
            <div key={a.id} style={{ background: "rgba(255,255,255,0.03)", border: `1px solid ${ST_COLOR[a.status]}22`, borderRadius: 12, padding: "18px 22px", display: "flex", alignItems: "center", justifyContent: "space-between", gap: 16 }}>
              <div>
                <div style={{ fontSize: 9, fontWeight: 800, color: ST_COLOR[a.status], letterSpacing: "0.15em", textTransform: "uppercase", marginBottom: 4 }}>{a.type}</div>
                <div style={{ fontWeight: 700, fontSize: 14 }}>{a.name}</div>
                <div style={{ fontSize: 11, color: "rgba(255,255,255,0.35)", marginTop: 2 }}>Submitted {a.submitted}</div>
              </div>
              <div style={{ display: "flex", gap: 8 }}>
                {a.status === "pending" || a.status === "review" ? (
                  <>
                    <button
                      onClick={() => act(a.id, "approve")}
                      disabled={busy === a.id}
                      style={{ padding: "8px 16px", borderRadius: 8, background: "#22c55e22", border: "1px solid #22c55e44", color: "#22c55e", fontSize: 11, fontWeight: 800, cursor: "pointer", opacity: busy === a.id ? 0.5 : 1 }}>
                      {busy === a.id ? "…" : "Approve"}
                    </button>
                    <button
                      onClick={() => act(a.id, "reject")}
                      disabled={busy === a.id}
                      style={{ padding: "8px 16px", borderRadius: 8, background: "#ef444422", border: "1px solid #ef444444", color: "#ef4444", fontSize: 11, fontWeight: 800, cursor: "pointer", opacity: busy === a.id ? 0.5 : 1 }}>
                      {busy === a.id ? "…" : "Reject"}
                    </button>
                  </>
                ) : (
                  <span style={{ fontSize: 9, fontWeight: 800, color: ST_COLOR[a.status], letterSpacing: "0.12em", textTransform: "uppercase" }}>{a.status}</span>
                )}
              </div>
            </div>
          ))}
        </div>
      </div>
    </main>
  );
}
