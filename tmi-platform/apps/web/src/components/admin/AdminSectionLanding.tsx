import Link from "next/link";

type AdminSectionLandingProps = {
  title: string;
  subtitle: string;
  route: string;
};

export default function AdminSectionLanding({ title, subtitle, route }: AdminSectionLandingProps) {
  return (
    <main
      style={{
        minHeight: "100vh",
        padding: 24,
        color: "#e2e8f0",
        background:
          "radial-gradient(circle at 20% 0%, rgba(56,189,248,0.2), transparent 35%), radial-gradient(circle at 85% 10%, rgba(250,204,21,0.22), transparent 40%), #020617",
      }}
    >
      <div style={{ maxWidth: 920, margin: "0 auto" }}>
        <Link href="/admin" style={{ color: "#93c5fd", textDecoration: "none", fontSize: 13 }}>
          ← Back to Administration Hub
        </Link>
        <h1 style={{ marginTop: 14, marginBottom: 6, fontSize: 32, color: "#f8fafc" }}>{title}</h1>
        <p style={{ marginTop: 0, color: "#cbd5e1" }}>{subtitle}</p>

        <section
          style={{
            marginTop: 18,
            border: "1px solid rgba(148,163,184,0.35)",
            borderRadius: 14,
            padding: 16,
            background: "rgba(15,23,42,0.5)",
          }}
        >
          <div style={{ color: "#7dd3fc", fontSize: 12, letterSpacing: "0.14em", textTransform: "uppercase" }}>Section Route</div>
          <div style={{ marginTop: 5, color: "#e0f2fe", fontFamily: "monospace" }}>{route}</div>
          <div style={{ marginTop: 12, color: "#cbd5e1", fontSize: 14 }}>
            Canonical admin route is online and reachable from the hub monitor router.
          </div>
        </section>
      </div>
    </main>
  );
}
