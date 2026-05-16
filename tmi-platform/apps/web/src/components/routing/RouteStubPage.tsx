type RouteStubPageProps = {
  title: string;
  subtitle: string;
  route: string;
};

export default function RouteStubPage({ title, subtitle, route }: RouteStubPageProps) {
  return (
    <main
      style={{
        minHeight: "100vh",
        padding: "120px 24px 48px",
        color: "#f8fbff",
        background:
          "radial-gradient(circle at 20% 0%, #16102f 0%, #0a0b16 52%, #06070f 100%)",
      }}
    >
      <section
        style={{
          maxWidth: 1080,
          margin: "0 auto",
          border: "1px solid rgba(103, 232, 249, 0.3)",
          borderRadius: 16,
          background: "rgba(255,255,255,0.04)",
          boxShadow: "0 0 40px rgba(0,245,255,0.12)",
          padding: 28,
        }}
      >
        <p style={{ margin: 0, fontSize: 11, letterSpacing: "0.22em", textTransform: "uppercase", color: "#67e8f9" }}>
          Route Stub
        </p>
        <h1 style={{ margin: "10px 0 0", fontSize: "2rem", lineHeight: 1.1, textTransform: "uppercase" }}>{title}</h1>
        <p style={{ margin: "10px 0 0", color: "rgba(220,230,255,0.82)", maxWidth: 760 }}>{subtitle}</p>

        <div
          style={{
            marginTop: 18,
            border: "1px solid rgba(255,255,255,0.14)",
            borderRadius: 12,
            background: "rgba(0,0,0,0.2)",
            padding: 14,
          }}
        >
          <p style={{ margin: 0, fontSize: 11, letterSpacing: "0.16em", textTransform: "uppercase", color: "rgba(255,255,255,0.58)" }}>
            Route
          </p>
          <p style={{ margin: "8px 0 0", fontFamily: "ui-monospace, SFMono-Regular, Menlo, Consolas, monospace", fontSize: 14 }}>
            {route}
          </p>
        </div>
      </section>
    </main>
  );
}
