import BattlePresentationPreview from "@/components/presentation/BattlePresentationPreview";
import PresentationTelemetryPanel from "@/components/admin/PresentationTelemetryPanel";

export const metadata = {
  title: "Presentation Preview | TMI Admin",
  description: "Battle Presentation Pack v1 preview — package grammar timeline, no fake scores.",
};

/**
 * Dev/admin preview for Presentation Framework foundation.
 * Honest PREVIEW PACKAGE mode — real pack phases/surfaces/cues only.
 */
export default function PresentationPreviewPage() {
  return (
    <main
      style={{
        minHeight: "100vh",
        padding: 24,
        background: "radial-gradient(ellipse at top, #140a22 0%, #050510 55%)",
        color: "#fff",
      }}
    >
      <header style={{ marginBottom: 16 }}>
        <div
          style={{
            fontSize: 11,
            letterSpacing: "0.22em",
            color: "#00FFFF",
            fontWeight: 900,
            textTransform: "uppercase",
          }}
        >
          Presentation Framework
        </div>
        <h1 style={{ margin: "6px 0 4px", fontSize: 22, fontWeight: 800 }}>
          Presentation Pack Preview
        </h1>
        <p style={{ margin: 0, color: "rgba(255,255,255,0.65)", fontSize: 13, maxWidth: 640 }}>
          Battle / Cypher / Challenge show-package grammars + Phase 5.1 director scaffolds.
          No fabricated scores or audience counts. Platform Core registries:{" "}
          <a href="/admin/platform-core" style={{ color: "#FFD700" }}>
            /admin/platform-core
          </a>
          .
        </p>
      </header>

      <div
        style={{
          display: "grid",
          gridTemplateColumns: "minmax(0, 1.2fr) minmax(280px, 0.8fr)",
          gap: 16,
          alignItems: "start",
        }}
      >
        <BattlePresentationPreview />
        <PresentationTelemetryPanel />
      </div>
    </main>
  );
}
