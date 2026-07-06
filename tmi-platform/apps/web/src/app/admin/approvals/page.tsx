"use client";
import { useState, useEffect } from "react";
import Link from "next/link";

type ApprovalStatus = 'pending' | 'approved' | 'rejected' | 'live' | 'expired';
type Approval = {
  id: string;
  type: string;
  name: string;
  artist: string;
  genre: string;
  url: string;
  submitted: string;
  status: ApprovalStatus;
};

const ST_COLOR: Record<string, string> = {
  pending: "#FFD700",
  approved: "#22c55e",
  rejected: "#ef4444",
  live: "#00FFFF",
  expired: "rgba(255,255,255,0.35)",
};

export default function AdminApprovalsPage() {
  const [queue, setQueue] = useState<Approval[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [busy, setBusy] = useState<string | null>(null);
  const [msg, setMsg] = useState("");

  useEffect(() => {
    fetch("/api/admin/approvals")
      .then(r => {
        if (!r.ok) throw new Error(`status_${r.status}`);
        return r.json();
      })
      .then((data: { ok?: boolean; queue?: Approval[] }) => {
        if (data.ok && Array.isArray(data.queue)) setQueue(data.queue);
        else throw new Error("bad_payload");
      })
      .catch(() => setError("Unable to load the approval queue. Retry in a moment."))
      .finally(() => setLoading(false));
  }, []);

  async function act(id: string, action: "approve" | "reject" | "rotate") {
    setBusy(id);
    setMsg("");
    try {
      const res = await fetch("/api/admin/approvals", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id, action }),
      });
      const data = await res.json() as { ok?: boolean; item?: { id: string; status: ApprovalStatus } };
      if (data.ok && data.item) {
        setQueue(q => q.map(a => a.id === id ? { ...a, status: data.item!.status } : a));
        const verb = action === "approve" ? "Approved" : action === "reject" ? "Rejected" : "Sent to rotation";
        setMsg(`${verb}: ${queue.find(a => a.id === id)?.name ?? id}`);
      } else {
        setMsg("Action failed.");
      }
    } catch {
      setMsg("Action failed.");
    } finally {
      setBusy(null);
    }
  }

  const btn = (color: string): React.CSSProperties => ({
    padding: "8px 16px",
    borderRadius: 8,
    background: `${color}22`,
    border: `1px solid ${color}44`,
    color,
    fontSize: 11,
    fontWeight: 800,
    cursor: "pointer",
  });

  return (
    <main style={{ minHeight: "100vh", background: "#05060c", color: "#fff", padding: "32px 24px 80px", fontFamily: "'Inter', sans-serif" }}>
      <div style={{ maxWidth: 1000, margin: "0 auto" }}>
        <div style={{ marginBottom: 28 }}>
          <Link href="/admin" style={{ fontSize: 11, color: "rgba(255,255,255,0.4)", textDecoration: "none" }}>← Admin</Link>
        </div>
        <div style={{ fontSize: 10, letterSpacing: 5, color: "#FFD700", fontWeight: 800, marginBottom: 4 }}>ADMIN · SUBMISSIONS</div>
        <h1 style={{ fontSize: "clamp(22px,4vw,36px)", fontWeight: 900, margin: "0 0 6px" }}>Submission Approval Queue</h1>
        <div style={{ fontSize: 12, color: "rgba(255,255,255,0.45)", marginBottom: 20 }}>
          Pending → Approved → Rotation. Every entry here is a real member submission.
        </div>
        {msg && <div style={{ marginBottom: 16, padding: "10px 14px", background: "rgba(0,255,136,0.08)", border: "1px solid rgba(0,255,136,0.2)", borderRadius: 8, fontSize: 12, color: "#00FF88" }}>{msg}</div>}

        {loading ? (
          <div style={{ padding: "24px 22px", border: "1px dashed rgba(255,255,255,0.18)", borderRadius: 12, fontSize: 12, color: "rgba(255,255,255,0.55)" }}>
            Loading submission queue…
          </div>
        ) : error ? (
          <div style={{ padding: "24px 22px", border: "1px solid rgba(239,68,68,0.35)", borderRadius: 12, fontSize: 12, color: "#ff9b9b" }}>
            {error}
          </div>
        ) : queue.length === 0 ? (
          <div style={{ padding: "24px 22px", border: "1px dashed rgba(255,255,255,0.18)", borderRadius: 12, fontSize: 12, color: "rgba(255,255,255,0.55)" }}>
            No submissions in the queue yet. When members submit tracks via /submit, they appear here for review.
          </div>
        ) : (
          <div style={{ display: "grid", gap: 12 }}>
            {queue.map((a) => (
              <div key={a.id} style={{ background: "rgba(255,255,255,0.03)", border: `1px solid ${ST_COLOR[a.status] ?? "rgba(255,255,255,0.2)"}22`, borderRadius: 12, padding: "18px 22px", display: "flex", alignItems: "center", justifyContent: "space-between", gap: 16, flexWrap: "wrap" }}>
                <div style={{ minWidth: 0 }}>
                  <div style={{ fontSize: 9, fontWeight: 800, color: ST_COLOR[a.status] ?? "#fff", letterSpacing: "0.15em", textTransform: "uppercase", marginBottom: 4 }}>
                    {a.type} · {a.genre}
                  </div>
                  <div style={{ fontWeight: 700, fontSize: 14 }}>{a.name}</div>
                  <div style={{ fontSize: 11, color: "rgba(255,255,255,0.35)", marginTop: 2 }}>
                    By {a.artist} · Submitted {a.submitted} ·{" "}
                    <a href={a.url} target="_blank" rel="noopener noreferrer" style={{ color: "#00FFFF" }}>Listen ↗</a>
                  </div>
                </div>
                <div style={{ display: "flex", gap: 8, alignItems: "center" }}>
                  {a.status === "pending" ? (
                    <>
                      <button onClick={() => act(a.id, "approve")} disabled={busy === a.id} style={{ ...btn("#22c55e"), opacity: busy === a.id ? 0.5 : 1 }}>
                        {busy === a.id ? "…" : "Approve"}
                      </button>
                      <button onClick={() => act(a.id, "reject")} disabled={busy === a.id} style={{ ...btn("#ef4444"), opacity: busy === a.id ? 0.5 : 1 }}>
                        {busy === a.id ? "…" : "Reject"}
                      </button>
                    </>
                  ) : a.status === "approved" ? (
                    <button onClick={() => act(a.id, "rotate")} disabled={busy === a.id} style={{ ...btn("#00FFFF"), opacity: busy === a.id ? 0.5 : 1 }}>
                      {busy === a.id ? "…" : "Send to Rotation"}
                    </button>
                  ) : (
                    <span style={{ fontSize: 9, fontWeight: 800, color: ST_COLOR[a.status] ?? "#fff", letterSpacing: "0.12em", textTransform: "uppercase" }}>
                      {a.status === "live" ? "In Rotation" : a.status}
                    </span>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </main>
  );
}
