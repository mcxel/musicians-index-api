"use client";

import {
  listFrameworkManifests,
  type FrameworkManifest,
} from "@/lib/platform/FrameworkRegistry";
import {
  listCapabilityMatrix,
  type PlatformCapabilityRow,
} from "@/lib/platform/PlatformCapabilityMatrix";
import { listAlgorithms } from "@/lib/platform/AlgorithmRegistry";
import { listEventSchemas } from "@/lib/platform/EventSchemaRegistry";

function statusColor(status?: string): string {
  switch (status) {
    case "CERTIFIED":
      return "#00FF88";
    case "TESTING":
      return "#00FFFF";
    case "DRAFT":
      return "#FFD700";
    case "DEPRECATED":
      return "#FF6B6B";
    default:
      return "rgba(255,255,255,0.5)";
  }
}

function FrameworkRow({ m }: { m: FrameworkManifest }) {
  return (
    <tr style={{ borderBottom: "1px solid rgba(255,255,255,0.06)" }}>
      <td style={{ padding: "8px 6px", fontWeight: 700 }}>{m.id}</td>
      <td style={{ padding: "8px 6px", color: "rgba(255,255,255,0.7)" }}>{m.version}</td>
      <td style={{ padding: "8px 6px", color: statusColor(m.certificationStatus), fontWeight: 800 }}>
        {m.certificationStatus ?? "—"}
      </td>
      <td style={{ padding: "8px 6px", color: "rgba(255,255,255,0.55)", fontSize: 11 }}>
        {m.capabilities.slice(0, 4).join(", ")}
        {m.capabilities.length > 4 ? "…" : ""}
      </td>
    </tr>
  );
}

function CapabilityRow({ r }: { r: PlatformCapabilityRow }) {
  return (
    <tr style={{ borderBottom: "1px solid rgba(255,255,255,0.06)" }}>
      <td style={{ padding: "8px 6px", fontWeight: 700 }}>{r.capability}</td>
      <td style={{ padding: "8px 4px", textAlign: "center" }}>{r.framework}</td>
      <td style={{ padding: "8px 4px", textAlign: "center" }}>{r.runtime}</td>
      <td style={{ padding: "8px 4px", textAlign: "center" }}>{r.ui}</td>
      <td style={{ padding: "8px 4px", textAlign: "center" }}>{r.api}</td>
      <td style={{ padding: "8px 4px", textAlign: "center" }}>{r.registry}</td>
      <td style={{ padding: "8px 4px", textAlign: "center" }}>{r.telemetry}</td>
      <td style={{ padding: "8px 4px", textAlign: "center" }}>{r.certified}</td>
    </tr>
  );
}

/**
 * Read-only Observatory panel — Framework Registry + Capability Matrix.
 * Real registry data only (Rule 20).
 */
export default function PlatformCorePanel() {
  const frameworks = listFrameworkManifests();
  const matrix = listCapabilityMatrix();
  const algorithms = listAlgorithms();
  const events = listEventSchemas();

  return (
    <div style={{ display: "grid", gap: 16 }}>
      <section
        style={{
          background: "rgba(0,0,0,0.4)",
          border: "1px solid rgba(0,255,255,0.25)",
          borderRadius: 12,
          padding: 16,
        }}
      >
        <div
          style={{
            fontSize: 10,
            letterSpacing: "0.22em",
            color: "#00FFFF",
            fontWeight: 900,
            marginBottom: 8,
          }}
        >
          FRAMEWORK REGISTRY
        </div>
        <p style={{ margin: "0 0 12px", fontSize: 12, color: "rgba(255,255,255,0.55)" }}>
          {frameworks.length} manifests · honest CERTIFIED / TESTING / DRAFT only
        </p>
        <div style={{ overflowX: "auto" }}>
          <table style={{ width: "100%", borderCollapse: "collapse", fontSize: 12 }}>
            <thead>
              <tr style={{ color: "rgba(255,255,255,0.4)", textAlign: "left" }}>
                <th style={{ padding: "6px" }}>ID</th>
                <th style={{ padding: "6px" }}>Ver</th>
                <th style={{ padding: "6px" }}>Status</th>
                <th style={{ padding: "6px" }}>Capabilities</th>
              </tr>
            </thead>
            <tbody>
              {frameworks.map((m) => (
                <FrameworkRow key={m.id} m={m} />
              ))}
            </tbody>
          </table>
        </div>
      </section>

      <section
        style={{
          background: "rgba(0,0,0,0.4)",
          border: "1px solid rgba(255,215,0,0.25)",
          borderRadius: 12,
          padding: 16,
        }}
      >
        <div
          style={{
            fontSize: 10,
            letterSpacing: "0.22em",
            color: "#FFD700",
            fontWeight: 900,
            marginBottom: 8,
          }}
        >
          PLATFORM CAPABILITY MATRIX
        </div>
        <p style={{ margin: "0 0 12px", fontSize: 12, color: "rgba(255,255,255,0.55)" }}>
          ✅ present · ⚠️ partial · ❌ missing — repo reality, not aspiration
        </p>
        <div style={{ overflowX: "auto" }}>
          <table style={{ width: "100%", borderCollapse: "collapse", fontSize: 12 }}>
            <thead>
              <tr style={{ color: "rgba(255,255,255,0.4)", textAlign: "left" }}>
                <th style={{ padding: "6px" }}>Capability</th>
                <th style={{ padding: "4px", textAlign: "center" }}>FW</th>
                <th style={{ padding: "4px", textAlign: "center" }}>RT</th>
                <th style={{ padding: "4px", textAlign: "center" }}>UI</th>
                <th style={{ padding: "4px", textAlign: "center" }}>API</th>
                <th style={{ padding: "4px", textAlign: "center" }}>Reg</th>
                <th style={{ padding: "4px", textAlign: "center" }}>Tel</th>
                <th style={{ padding: "4px", textAlign: "center" }}>Cert</th>
              </tr>
            </thead>
            <tbody>
              {matrix.map((r) => (
                <CapabilityRow key={r.id} r={r} />
              ))}
            </tbody>
          </table>
        </div>
      </section>

      <section
        style={{
          display: "grid",
          gridTemplateColumns: "1fr 1fr",
          gap: 12,
        }}
      >
        <div
          style={{
            background: "rgba(0,0,0,0.35)",
            border: "1px solid rgba(255,255,255,0.08)",
            borderRadius: 12,
            padding: 14,
            fontSize: 12,
          }}
        >
          <div style={{ fontSize: 10, letterSpacing: "0.18em", color: "#FF2DAA", fontWeight: 900 }}>
            ALGORITHM REGISTRY
          </div>
          <p style={{ color: "rgba(255,255,255,0.5)", margin: "6px 0 10px" }}>
            {algorithms.length} real entrypoints discovered
          </p>
          <ul style={{ margin: 0, paddingLeft: 18, color: "rgba(255,255,255,0.75)" }}>
            {algorithms.map((a) => (
              <li key={a.id} style={{ marginBottom: 4 }}>
                <span style={{ color: statusColor(a.certificationStatus) }}>
                  {a.certificationStatus}
                </span>{" "}
                {a.name}
              </li>
            ))}
          </ul>
        </div>
        <div
          style={{
            background: "rgba(0,0,0,0.35)",
            border: "1px solid rgba(255,255,255,0.08)",
            borderRadius: 12,
            padding: 14,
            fontSize: 12,
          }}
        >
          <div style={{ fontSize: 10, letterSpacing: "0.18em", color: "#AA2DFF", fontWeight: 900 }}>
            EVENT SCHEMA REGISTRY
          </div>
          <p style={{ color: "rgba(255,255,255,0.5)", margin: "6px 0 10px" }}>
            {events.length} cataloged names · no second bus
          </p>
          <ul style={{ margin: 0, paddingLeft: 18, color: "rgba(255,255,255,0.75)", maxHeight: 280, overflow: "auto" }}>
            {events.map((e) => (
              <li key={`${e.bus}-${e.name}`} style={{ marginBottom: 4 }}>
                <code style={{ color: "#00FFFF" }}>{e.name}</code>{" "}
                <span style={{ color: "rgba(255,255,255,0.35)" }}>({e.bus})</span>
              </li>
            ))}
          </ul>
        </div>
      </section>
    </div>
  );
}
