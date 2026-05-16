import Link from "next/link";
import type { ReactNode } from "react";
import { ensureRouteVisualCoverage, type RouteVisualCoverageInput } from "@/lib/ai-visuals/RouteVisualCoverageEngine";

type RouteVisualShellProps = RouteVisualCoverageInput & {
  children: ReactNode;
  quickLinks?: Array<{ label: string; href: string }>;
};

function Pill({ label, tone }: { label: string; tone: string }) {
  return (
    <span
      style={{
        display: "inline-flex",
        alignItems: "center",
        gap: 6,
        borderRadius: 999,
        border: `1px solid ${tone}33`,
        background: `${tone}12`,
        color: tone,
        padding: "4px 10px",
        fontSize: 9,
        fontWeight: 800,
        letterSpacing: "0.14em",
        textTransform: "uppercase",
      }}
    >
      {label}
    </span>
  );
}

export default function RouteVisualShell({ children, quickLinks = [], ...input }: RouteVisualShellProps) {
  const snapshot = ensureRouteVisualCoverage(input);

  return (
    <main
      style={{
        minHeight: "100vh",
        background: `radial-gradient(circle at 15% 0%, ${snapshot.accent}1f, transparent 35%), radial-gradient(circle at 95% 6%, ${snapshot.secondaryAccent}18, transparent 32%), #050510`,
        color: "#fff",
      }}
    >
      <header
        style={{
          borderBottom: `1px solid ${snapshot.accent}33`,
          background: "rgba(0,0,0,0.34)",
          backdropFilter: "blur(12px)",
        }}
      >
        <div style={{ maxWidth: 1280, margin: "0 auto", padding: "14px 20px", display: "flex", alignItems: "center", gap: 14, flexWrap: "wrap" }}>
          <div style={{ minWidth: 240 }}>
            <div style={{ fontSize: 9, letterSpacing: "0.34em", color: snapshot.accent, fontWeight: 800, textTransform: "uppercase" }}>
              Visual Route Rollout
            </div>
            <div style={{ marginTop: 4, fontSize: 16, fontWeight: 900 }}>{snapshot.title}</div>
            <div style={{ marginTop: 4, fontSize: 11, color: "rgba(255,255,255,0.52)" }}>{snapshot.subtitle}</div>
          </div>

          <div style={{ display: "flex", gap: 8, flexWrap: "wrap", marginLeft: "auto", alignItems: "center" }}>
            <Pill label={snapshot.generated ? "generated" : "ready"} tone={snapshot.generated ? "#00FF88" : snapshot.accent} />
            <Pill label={snapshot.queued ? "queued" : "idle"} tone={snapshot.queued ? "#FFD700" : snapshot.secondaryAccent} />
            <Pill label={snapshot.imageRef ? snapshot.imageRef.slice(0, 18) : "no asset"} tone={snapshot.imageRef ? "#00FFFF" : "#FF2DAA"} />
          </div>
        </div>

        {quickLinks.length > 0 && (
          <div style={{ borderTop: `1px solid ${snapshot.accent}22` }}>
            <div style={{ maxWidth: 1280, margin: "0 auto", padding: "10px 20px", display: "flex", gap: 8, flexWrap: "wrap" }}>
              {quickLinks.map((link) => (
                <Link key={link.href} href={link.href} style={{ fontSize: 9, color: snapshot.accent, textDecoration: "none", fontWeight: 800, letterSpacing: "0.1em", textTransform: "uppercase", border: `1px solid ${snapshot.accent}24`, borderRadius: 6, padding: "4px 8px", background: `${snapshot.accent}08` }}>
                  {link.label}
                </Link>
              ))}
            </div>
          </div>
        )}
      </header>

      <div style={{ maxWidth: 1280, margin: "0 auto", padding: "18px 20px 40px" }}>{children}</div>
    </main>
  );
}