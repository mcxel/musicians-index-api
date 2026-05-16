import Link from "next/link";
import { getVideoDiagnosticsSnapshot } from "@/lib/video/VideoDiagnosticsEngine";

const OBSERVATORY_LINKS = [
  { label: "Video Wall", href: "/admin/video-wall", color: "#00FFFF" },
  { label: "Bot Observe", href: "/admin/bots/observe", color: "#FF2DAA" },
  { label: "Venue Observe", href: "/admin/venues/observe", color: "#00FF88" },
  { label: "Event Observe", href: "/admin/events/observe", color: "#FFD700" },
  { label: "Profile Multi-View", href: "/admin/profile-multi-view", color: "#AA2DFF" },
];

export default function AdminVideoObservatorySummaryCard() {
  const diagnostics = getVideoDiagnosticsSnapshot();
  const metrics = [
    { label: "Feeds", value: diagnostics.summary.totalFeeds, color: "#FFFFFF" },
    { label: "Live", value: diagnostics.summary.liveFeeds, color: "#00FF88" },
    { label: "Buffering", value: diagnostics.summary.bufferingFeeds, color: "#FFD700" },
    { label: "PiP Failures", value: diagnostics.summary.pipFailures, color: "#FF2DAA" },
    { label: "Camera Failures", value: diagnostics.summary.cameraFailures, color: "#FF9500" },
  ];

  return (
    <div
      style={{
        display: "grid",
        gap: 12,
        border: "1px solid rgba(255,255,255,0.14)",
        borderRadius: 14,
        background: "linear-gradient(135deg, rgba(0,255,255,0.06), rgba(170,45,255,0.08))",
        padding: 16,
      }}
    >
      <div style={{ display: "flex", justifyContent: "space-between", gap: 12, alignItems: "center", flexWrap: "wrap" }}>
        <div>
          <div style={{ fontSize: 10, letterSpacing: "0.28em", textTransform: "uppercase", color: "#00FFFF", fontWeight: 800 }}>Video Observatory Wall</div>
          <div style={{ fontSize: 13, color: "rgba(255,255,255,0.68)", marginTop: 4 }}>Multi-view monitor, PiP control, venue cams, event feeds, and bot observation.</div>
        </div>
        <Link href="/admin/video-wall" style={{ color: "#00FFFF", textDecoration: "none", fontSize: 11, fontWeight: 700 }}>Open wall →</Link>
      </div>

      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit,minmax(100px,1fr))", gap: 8 }}>
        {metrics.map((metric) => (
          <div key={metric.label} style={{ background: "rgba(0,0,0,0.24)", border: "1px solid rgba(255,255,255,0.08)", borderRadius: 10, padding: 10 }}>
            <div style={{ fontSize: 9, color: "rgba(255,255,255,0.45)" }}>{metric.label}</div>
            <div style={{ marginTop: 4, fontSize: 18, fontWeight: 800, color: metric.color }}>{metric.value}</div>
          </div>
        ))}
      </div>

      <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
        {OBSERVATORY_LINKS.map((link) => (
          <Link
            key={link.href}
            href={link.href}
            style={{
              textDecoration: "none",
              color: link.color,
              border: `1px solid ${link.color}35`,
              background: `${link.color}10`,
              borderRadius: 8,
              padding: "6px 10px",
              fontSize: 10,
              fontWeight: 800,
              letterSpacing: "0.08em",
              textTransform: "uppercase",
            }}
          >
            {link.label}
          </Link>
        ))}
      </div>
    </div>
  );
}