import { CO_HOST_REGISTRY } from "@/lib/hosts/coHostRegistry";

export default function AdminCoHostsPage() {
  return (
    <main data-testid="admin-co-hosts-page" style={{ minHeight: "100vh", background: "#020617", color: "#e2e8f0", padding: 20, display: "grid", gap: 10 }}>
      <h1 style={{ margin: 0, color: "#67e8f9" }}>Admin Co-Hosts</h1>
      {CO_HOST_REGISTRY.map((coHost) => (
        <article key={coHost.id} data-testid={`admin-co-host-${coHost.id}`} style={{ border: "1px solid rgba(148,163,184,0.35)", borderRadius: 10, background: "#0f172a", padding: 10 }}>
          <div style={{ color: "#e2e8f0", fontWeight: 700 }}>{coHost.name}</div>
          <div style={{ color: "#93c5fd", fontSize: 12 }}>{coHost.currentRoute}</div>
          <div style={{ color: "#94a3b8", fontSize: 11 }}>task={coHost.currentTask} proof={coHost.proofStatus}</div>
        </article>
      ))}
    </main>
  );
}
