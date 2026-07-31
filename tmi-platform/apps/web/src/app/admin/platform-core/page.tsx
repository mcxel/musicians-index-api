import PlatformCorePanel from "@/components/admin/PlatformCorePanel";
import Link from "next/link";

export const metadata = {
  title: "Platform Core | TMI Admin",
  description:
    "Framework Registry, Algorithm Registry, Event Schema Registry, and Capability Matrix — read-only.",
};

/**
 * Platform Core Observatory — contracts + registries only.
 * Flight Deck shell frozen; this is a dedicated admin route.
 */
export default function PlatformCorePage() {
  return (
    <main
      style={{
        minHeight: "100vh",
        padding: 24,
        background: "radial-gradient(ellipse at top, #140a22 0%, #050510 55%)",
        color: "#fff",
      }}
    >
      <header style={{ marginBottom: 18 }}>
        <div
          style={{
            fontSize: 11,
            letterSpacing: "0.22em",
            color: "#FFD700",
            fontWeight: 900,
            textTransform: "uppercase",
          }}
        >
          Platform Core
        </div>
        <h1 style={{ margin: "6px 0 4px", fontSize: 22, fontWeight: 800 }}>
          Frameworks · Algorithms · Events · Capability Matrix
        </h1>
        <p style={{ margin: 0, color: "rgba(255,255,255,0.65)", fontSize: 13, maxWidth: 720 }}>
          Architecture homes registered now. Thin MainframeCoordinator routes only — no god-class
          OS. Presentation preview remains at{" "}
          <Link href="/admin/presentation-preview" style={{ color: "#00FFFF" }}>
            /admin/presentation-preview
          </Link>
          .
        </p>
      </header>
      <PlatformCorePanel />
    </main>
  );
}
