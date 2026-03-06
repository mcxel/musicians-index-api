export const dynamic = "force-dynamic";

type PromoRow = {
  id: string;
  status: string;
  maxUses: number;
  uses: number;
  expiresAt: string;
  createdAt: string;
};

async function fetchPromos(): Promise<PromoRow[]> {
  try {
    const res = await fetch(`${process.env.NEXT_PUBLIC_BASE_URL ?? ""}/api/admin/promos`, {
      cache: "no-store",
    });
    if (!res.ok) return [];
    return (await res.json()) as PromoRow[];
  } catch {
    return [];
  }
}

export default async function AdminPromosPage() {
  const promos = await fetchPromos();

  return (
    <div style={{ padding: 16 }}>
      <h1 style={{ fontSize: 24, fontWeight: 800 }}>Admin · Promo Codes</h1>
      <p style={{ opacity: 0.8, marginTop: 6 }}>
        Generate, activate, revoke, and audit promo codes. (Pending → Active requires Admin.)
      </p>

      <div style={{ marginTop: 16, display: "flex", gap: 8, flexWrap: "wrap" }}>
        <form action="/api/admin/promos/generate" method="post">
          <button type="submit" style={btn()}>
            Generate Batch (Pending)
          </button>
        </form>

        <form action="/api/admin/promos/activate-all" method="post">
          <button type="submit" style={btnSecondary()}>
            Activate Pending
          </button>
        </form>

        <a href="/admin/audit" style={{ ...btnLink(), textDecoration: "none" }}>
          View Audit Log →
        </a>
      </div>

      <div style={{ marginTop: 16, border: "1px solid rgba(255,255,255,0.15)", borderRadius: 12, overflow: "hidden" }}>
        <div style={{ padding: 12, borderBottom: "1px solid rgba(255,255,255,0.12)", fontWeight: 700 }}>
          Codes ({promos.length})
        </div>

        {promos.length === 0 ? (
          <div style={{ padding: 12, opacity: 0.75 }}>
            No promos loaded yet. This page is scaffolded and ready — wire `/api/admin/promos` when auth + Prisma are live.
          </div>
        ) : (
          <table style={{ width: "100%", borderCollapse: "collapse" }}>
            <thead>
              <tr style={{ textAlign: "left", opacity: 0.85 }}>
                <th style={th()}>ID</th>
                <th style={th()}>Status</th>
                <th style={th()}>Uses</th>
                <th style={th()}>Max</th>
                <th style={th()}>Expires</th>
                <th style={th()}>Created</th>
              </tr>
            </thead>
            <tbody>
              {promos.map((p) => (
                <tr key={p.id} style={{ borderTop: "1px solid rgba(255,255,255,0.08)" }}>
                  <td style={tdMono()}>{p.id}</td>
                  <td style={td()}>{p.status}</td>
                  <td style={td()}>{p.uses}</td>
                  <td style={td()}>{p.maxUses}</td>
                  <td style={td()}>{p.expiresAt}</td>
                  <td style={td()}>{p.createdAt}</td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
}

function btn(): React.CSSProperties {
  return {
    padding: "10px 12px",
    borderRadius: 10,
    border: "1px solid rgba(255,255,255,0.18)",
    background: "rgba(0,0,0,0.25)",
    color: "white",
    fontWeight: 800,
    cursor: "pointer",
  };
}
function btnSecondary(): React.CSSProperties {
  return {
    ...btn(),
    opacity: 0.85,
  };
}
function btnLink(): React.CSSProperties {
  return {
    ...btn(),
    display: "inline-block",
  };
}
function th(): React.CSSProperties {
  return { padding: 10, fontSize: 12 };
}
function td(): React.CSSProperties {
  return { padding: 10, fontSize: 13 };
}
function tdMono(): React.CSSProperties {
  return { ...td(), fontFamily: "ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, monospace" };
}
